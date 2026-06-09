/**
 * resend-otp/index.ts — OTP generation and email delivery.
 * OTP expiry is controlled by the OTP_EXPIRY_SECONDS env var (default: 600 = 10 min).
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OTP_EXPIRY_SECONDS = parseInt(Deno.env.get('OTP_EXPIRY_SECONDS') ?? '600', 10);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateOTP(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

async function hashOtp(plain: string): Promise<string> {
  const data = new TextEncoder().encode(plain)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function sendEmailViaResend(email: string, otpCode: string): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  const htmlBody = buildEmailHtml(otpCode)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DailyStack <contact.dailystack@gmail.com>', // TODO: เปลี่ยนเป็น domain จริงของคุณ
      to: email,
      subject: 'Your DailyStack verification code',
      html: htmlBody,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Resend API error: ${res.status} - ${errText}`)
  }
}

function buildEmailHtml(otpCode: string): string {
  const expiryMinutes = Math.floor(OTP_EXPIRY_SECONDS / 60);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#1c232a;font-family:'Space Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1c232a;">
    <tr>
      <td align="center" style="padding:60px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 24px;border-top:4px solid #56be89;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:2px;">
                <span style="color:#ffffff;">DAILY</span><span style="color:#56be89;">STACK</span>
              </p>
              <p style="margin:0;font-size:13px;font-weight:500;color:#6e7681;">Email Verification</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#c9d1d9;line-height:1.6;">Hi there,</p>
              <p style="margin:0 0 16px;font-size:15px;color:#c9d1d9;line-height:1.6;">
                We received a request to verify your email address for DailyStack. Enter the verification code below to complete your sign up.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#161b22;border:1px solid #30363d;border-radius:8px;margin:24px 0;">
                <tr>
                  <td align="center" style="padding:24px 20px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#6e7681;text-transform:uppercase;letter-spacing:1px;">
                      Verification code
                    </p>
                    <p style="margin:0;font-size:34px;font-weight:700;color:#56be89;letter-spacing:10px;font-family:'Space Grotesk',Menlo,Monaco,'Courier New',monospace;">
                      ${otpCode}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;color:#8b949e;line-height:1.6;">
                This code expires in <span style="color:#c9d1d9;font-weight:600;">${expiryMinutes} minute${expiryMinutes !== 1 ? 's' : ''}</span>.
              </p>
              <p style="margin:0;font-size:13px;color:#6e7681;line-height:1.6;">
                If you did not request this verification, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:0;border-top:1px solid #30363d;margin:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;">
              <p style="margin:0;font-size:12px;color:#6e7681;line-height:1.6;">
                DailyStack &mdash; Your Thai Fintech Subscription Tracker<br>
                <span style="color:#484f58;">This is an automated message. Please do not reply to this email.</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { user_id, email } = await req.json()
    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: 'Missing user_id or email', success: false }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    // Invalidate any existing unverified OTP records for this user
    await supabase.from('otp_requests').update({ verified: true }).eq('user_id', user_id).eq('verified', false)

    // Generate new OTP
    const otpCode = generateOTP()
    const hashedOtp = await hashOtp(otpCode)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000).toISOString()

    // Store OTP record in database
    await supabase.from('otp_requests').insert({
      user_id,
      email,
      otp_code: hashedOtp,
      otp_type: 'email_verification',
      expires_at: expiresAt,
    })

    // Send OTP via email using Resend API
    try {
      await sendEmailViaResend(email, otpCode)
    } catch (emailErr) {
      console.error('[resend-otp] Failed to send email:', emailErr)
      // Still return success — OTP is stored, user can request a new one
      // Don't expose email errors to client for security reasons
      return new Response(JSON.stringify({
        success: true,
        message: 'OTP generated. Email delivery had an issue — please try resending.',
        expires_in: OTP_EXPIRY_SECONDS,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'OTP sent successfully',
      expires_in: OTP_EXPIRY_SECONDS
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, success: false }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
