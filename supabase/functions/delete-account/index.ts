/**
 * delete-account — Supabase Edge Function (PDPA right of erasure)
 *
 * Deletes ALL rows owned by the calling user across every
 * PicksWise table, then deletes the auth account itself.
 * Requires a valid user JWT (Authorization: Bearer <jwt>).
 */

import { supabaseAdmin, verifyAuth, corsHeaders, jsonResponse, errorResponse } from '../_shared/index.ts';

/** Tables with a user_id (or id=uid for profiles) column. Missing tables are skipped. */
const USER_TABLES = [
  'user_transactions',
  'transaction_rules',
  'subscription_price_history',
  'subscriptions',
  'push_subscriptions',
  'user_notification_settings',
  'onboarding_progress',
  'cancellation_documents',
  'cancellation_progress',
  'monthly_records',
  'user_wallets',
  'user_financial_profiles',
  'net_worth_assets',
  'net_worth_liabilities',
  'net_worth_snapshots',
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const auth = await verifyAuth(req);
  if (!auth) return errorResponse('Unauthorized', 401);
  const userId = auth.userId;

  const errors: string[] = [];

  // 1. Purge owned rows (tolerate missing/dropped tables)
  for (const table of USER_TABLES) {
    const { error } = await supabaseAdmin.from(table).delete().eq('user_id', userId);
    if (error && !`${error.message}`.includes('does not exist')) {
      errors.push(`${table}: ${error.message}`);
    }
  }
  // profiles uses id = uid
  {
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    if (error && !`${error.message}`.includes('does not exist')) errors.push(`profiles: ${error.message}`);
  }

  // 2. Delete the auth user (service role)
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (delErr) errors.push(`auth.user: ${delErr.message}`);

  if (errors.length > 0) {
    return jsonResponse({ ok: false, errors }, 500);
  }
  return jsonResponse({ ok: true, deletedUserId: userId });
});
