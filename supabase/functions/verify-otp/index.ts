/**
 * verify-otp/index.ts - OTP verification endpoint.
 * - Validates OTP code against stored hash
 * - Confirms email via Supabase Auth admin API
 * - Uses service_role key intentionally (Edge Functions bypass RLS via service role).
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function hashOtp(plain: string): Promise<string> {
  const data = new TextEncoder().encode(plain)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function getCallerUserId(req: Request, supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length);
  const { data: userData } = await supabase.auth.getUser(token);
  return userData?.user?.id ?? null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const callerId = await getCallerUserId(req, supabase);
    const { user_id: targetUserId, otp_code } = await req.json();

    if (!targetUserId || !otp_code) {
      return new Response(JSON.stringify({ error: 'Missing user_id or otp_code', success: false }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Caller must be the same as target user_id - prevents OTP forwarding attacks
    if (callerId !== targetUserId) {
      return new Response(JSON.stringify({ error: 'Forbidden', success: false, code: 'FORBIDDEN' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Fetch valid OTP record ---
    const { data: otp, error: otpErr } = await supabase
      .from('otp_requests')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('verified', false)
      .eq('otp_type', 'email_verification')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpErr || !otp) {
      return new Response(JSON.stringify({
        error: 'No valid OTP found. Please request a new one.',
        success: false,
        code: 'OTP_NOT_FOUND'
      }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (otp.attempts > 4) {
      return new Response(JSON.stringify({
        error: 'Too many attempts. Please request a new code.',
        success: false,
        code: 'MAX_ATTEMPTS'
      }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Verify OTP hash ---
    const hashedInput = await hashOtp(otp_code);
    if (otp.otp_code !== hashedInput) {
      await supabase.from('otp_requests').update({ attempts: otp.attempts + 1 }).eq('id', otp.id);
      const remaining = 5 - (otp.attempts + 1);
      return new Response(JSON.stringify({
        error: `Incorrect code. ${remaining} attempt(s) remaining.`,
        success: false,
        code: 'WRONG_OTP',
        attempts_left: remaining
      }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- OTP is valid: mark as verified ---
    await supabase.from('otp_requests').update({ verified: true }).eq('id', otp.id);

    // --- Update Supabase Auth user (email_confirm marks email as verified) ---
    const { error: adminErr } = await supabase.auth.admin.updateUserById(targetUserId, {
      email_confirm: true,
      user_metadata: { email_verified: true }
    });
    if (adminErr) {
      console.error('[verify-otp] admin.updateUserById failed:', adminErr);
    }

    // --- Update users table: set display_name if first time ---
    // Only update email if provided (otp.email contains the verified address)
    const { error: userErr } = await supabase
      .from('users')
      .upsert({
        id: targetUserId,
        email: otp.email,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (userErr) {
      // Non-fatal: auth update succeeded. Log but don't block user.
      console.error('[verify-otp] users upsert failed:', userErr);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Email verified successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg, success: false }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
