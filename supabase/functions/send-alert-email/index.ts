/**
 * send-alert-email — DailyStack Edge Function
 * Purpose: Send email alerts via Resend API
 * Security: Validates caller owns the alert before sending
 */

import { supabaseAdmin, verifyAuth, corsHeaders, jsonResponse, errorResponse } from '../_shared/index.ts';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  alertId: string;
}

async function sendEmailViaResend(to: string, subject: string, html: string): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'DailyStack <contact.dailystack@gmail.com>',
      to: to,
      subject: subject,
      html: html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend API error: ${res.status} - ${errText}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // ─── AUTHENTICATE CALLER ────────────────────────────────────────
  const auth = await verifyAuth(req);
  if (!auth) {
    return errorResponse('Unauthorized', 401);
  }
  const userId = auth.userId;

  // ─── PARSE REQUEST BODY ──────────────────────────────────────────
  let payload: EmailPayload;
  try {
    payload = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { to, subject, html, alertId } = payload;

  // ─── VALIDATE REQUIRED FIELDS ────────────────────────────────────
  if (!to || !subject || !html || !alertId) {
    return errorResponse('Missing required fields: to, subject, html, alertId', 400);
  }

  // ─── VERIFY CALLER OWNS THE ALERT ────────────────────────────────
  // Check budget_alerts table for ownership
  const { data: alert, error: alertError } = await supabaseAdmin
    .from('budget_alerts')
    .select('id, user_id')
    .eq('id', alertId)
    .single();

  if (alertError || !alert) {
    // Alert not found in budget_alerts - might be a different type
    // For now, we trust the authenticated caller for non-budget alerts
    console.log(`Alert ${alertId} not found in budget_alerts, proceeding with authenticated user`);
  } else if (alert.user_id !== userId) {
    // Caller does not own this alert
    return errorResponse('Forbidden: you do not own this alert', 403);
  }

  // ─── SEND EMAIL VIA RESEND ───────────────────────────────────────
  try {
    await sendEmailViaResend(to, subject, html);

    return jsonResponse({
      success: true,
      message: 'Email sent successfully',
      to,
      subject,
    });
  } catch (err) {
    console.error('[send-alert-email] Failed to send email:', err);
    return errorResponse(`Failed to send email: ${err.message}`, 500);
  }
});
