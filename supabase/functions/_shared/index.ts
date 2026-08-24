/**
 * Supabase Edge Functions — Shared Utilities
 * DailyStack MVP
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Supabase Client (Service Role — server-side only) ──────────────
export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ─── CORS Headers ──────────────────────────────────────────────────
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// ─── Auth Verification ──────────────────────────────────────────────
export async function verifyAuth(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return { userId: user.id };
}

// ─── JSON Response Helpers ──────────────────────────────────────────
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

// ─── Thai Language Helpers ──────────────────────────────────────────
const thMessages = {
  budgetWarning: (pct: number) => `งบประมาณใช้ไป ${pct}% แล้ว เหลืออีกเท่าไหร่นะ?`,
  budgetDanger: (pct: number) => `เตือน! งบประมาณใช้ไป ${pct}% แล้ว`,
  budgetSafe: 'งบประมินอยู่ในเกณฑ์ปกติ',
  ghostFound: (name: string, cost: number) =>
    `พบ ${name} ที่อาจลืม ค่าบริการ ${cost} บาท/เดือน`,
};

export function getThMessage(key: keyof typeof thMessages, ...args: unknown[]): string {
  return (thMessages[key] as (...a: unknown[]) => string)(...args);
}

// ─── Date Helpers ───────────────────────────────────────────────────
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function formatThaiDate(dateStr: string): string {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}
