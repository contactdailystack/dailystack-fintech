/**
 * send-push-notification — Supabase Edge Function
 * Sends a Web Push (VAPID) notification to all of a user's
 * registered push subscriptions.
 *
 * Body: { title: string; body: string; url?: string; tag?: string }
 * Auth: sends to the calling user only.
 *
 * Required secrets (supabase secrets set):
 *   VAPID_PUBLIC_KEY   — base64url public key
 *   VAPID_PRIVATE_KEY  — base64url private key
 *   VAPID_SUBJECT      — e.g. mailto:admin@pickswise.app
 */

import { supabaseAdmin, verifyAuth, corsHeaders, jsonResponse, errorResponse } from '../_shared/index.ts';
import webpush from 'npm:web-push@3.6.7';

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await verifyAuth(req);
  if (!auth) {
    return errorResponse('Unauthorized', 401);
  }
  const userId = auth.userId;

  let body: { title?: string; body?: string; url?: string; tag?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const { title, body: text, url, tag } = body;
  if (!title || typeof text !== 'string') {
    return errorResponse('Missing title or body', 400);
  }

  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const subject = Deno.env.get('VAPID_SUBJECT') || 'mailto:support@pickswise.app';

  if (!publicKey || !privateKey) {
    return errorResponse('Push not configured (missing VAPID keys)', 503);
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (error) {
    return errorResponse(`Failed to load subscriptions: ${error.message}`, 500);
  }
  if (!subs || subs.length === 0) {
    return jsonResponse({ sent: 0, failed: 0 });
  }

  const payload: PushPayload = { title, body: text, url, tag };
  let sent = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];

  await Promise.all(
    subs.map(async (sub: { endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err) {
        failed++;
        // 404/410 = subscription expired → remove it
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          staleEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  if (staleEndpoints.length > 0) {
    await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .in('endpoint', staleEndpoints);
  }

  return jsonResponse({ sent, failed });
});
