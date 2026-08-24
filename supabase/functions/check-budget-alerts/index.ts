/**
 * check-budget-alerts — DailyStack MVP Edge Function
 * Purpose: Budget Guardian — proactive spending warnings
 */

import { supabaseAdmin, verifyAuth, corsHeaders, jsonResponse, errorResponse } from '../_shared/index.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const InputSchema = z.object({
  user_id: z.string().uuid().optional(),
  category: z.string().min(1).max(50),
  spent: z.number().min(0),
  limit: z.number().positive(),
});

type AlertLevel = 'safe' | 'warning' | 'danger';

function calculateAlertLevel(spent: number, limit: number): AlertLevel {
  const pct = (spent / limit) * 100;
  if (pct >= 90) return 'danger';
  if (pct >= 70) return 'warning';
  return 'safe';
}

function generateThaiMessage(level: AlertLevel, category: string, spent: number, limit: number): string {
  const pct = Math.round((spent / limit) * 100);
  const remaining = Math.max(0, limit - spent);

  switch (level) {
    case 'danger':
      return `เตือน! งบ${category}ใช้ไป ${pct}% แล้ว เหลืออีก ${remaining.toLocaleString('th-TH')} บาท`;
    case 'warning':
      return `งบ${category}ใช้ไป ${pct}% แล้ว เหลืองบอีก ${remaining.toLocaleString('th-TH')} บาท`;
    case 'safe':
    default:
      return `งบ${category}อยู่ในเกณฑ์ปกติ (${pct}% ใช้ไป)`;
  }
}

function generateEnglishMessage(level: AlertLevel, category: string, spent: number, limit: number): string {
  const pct = Math.round((spent / limit) * 100);
  const remaining = Math.max(0, limit - spent);

  switch (level) {
    case 'danger':
      return `Alert! ${category} budget at ${pct}%. Only ${remaining.toLocaleString()} THB remaining.`;
    case 'warning':
      return `${category} budget at ${pct}%. ${remaining.toLocaleString()} THB remaining.`;
    case 'safe':
    default:
      return `${category} budget on track (${pct}% used).`;
  }
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

  // Parse input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse('Invalid input: ' + parsed.error.message, 400);
  }

  const { category, spent, limit } = parsed.data;

  const alertLevel = calculateAlertLevel(spent, limit);
  const percentageUsed = Math.round((spent / limit) * 100);
  const remaining = Math.max(0, limit - spent);

  // Generate messages in both languages
  const message_th = generateThaiMessage(alertLevel, category, spent, limit);
  const message_en = generateEnglishMessage(alertLevel, category, spent, limit);

  // Store alert in database
  try {
    await supabaseAdmin.from('budget_alerts').insert({
      user_id: userId,
      category_name: category,
      alert_type: alertLevel === 'safe' ? 'milestone' : alertLevel,
      threshold_amount: limit,
      current_spent: spent,
      percentage_used: percentageUsed,
      message: message_th,
    });
  } catch (err) {
    // Non-fatal — log but continue
    console.warn('Failed to store alert:', err);
  }

  // Return response
  return jsonResponse({
    alert_level: alertLevel,
    percentage_used: percentageUsed,
    threshold_amount: limit,
    current_spent: spent,
    remaining: remaining,
    message: message_th,
    message_en,
    category,
  });
});
