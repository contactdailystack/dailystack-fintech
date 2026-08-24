/**
 * analyze-spending — DailyStack MVP Edge Function
 * Purpose: AI-powered spending pattern analysis
 */

import { supabaseAdmin, verifyAuth, corsHeaders, jsonResponse, errorResponse } from '../_shared/index.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const InputSchema = z.object({
  user_id: z.string().uuid().optional(),
  period_days: z.number().min(7).max(365).default(30),
});

interface SpendingPattern {
  category: string;
  total: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  avg_per_transaction: number;
  transaction_count: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await verifyAuth(req);
  if (!auth) return errorResponse('Unauthorized', 401);
  const userId = auth.userId;

  // Parse input
  let body: unknown = {};
  try { body = await req.json(); } catch { /* use defaults */ }
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) return errorResponse('Invalid input: ' + parsed.error.message, 400);

  const { period_days } = parsed.data;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period_days);

    // Get transactions for the period
    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('amount, category, type, description, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (!transactions || transactions.length === 0) {
      return jsonResponse({
        insights: ['เพิ่มรายการธุรกรรมเพื่อรับการวิเคราะห์จาก AI'],
        patterns: { total_spent: 0, transaction_count: 0, categories: [] },
        recommendations: ['เริ่มบันทึกรายจ่ายทุกวันเพื่อผลลัพธ์ที่แม่นยำขึ้น'],
        period_days,
        is_mock: true,
      });
    }

    // ─── ANALYZE SPENDING ─────────────────────────────────────────
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    for (const tx of expenses) {
      const cat = tx.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(tx.amount);
    }

    const patterns: SpendingPattern[] = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total,
        percentage: Math.round((total / totalSpent) * 100),
        trend: 'stable' as const,
        avg_per_transaction: Math.round(total / (expenses.filter(e => e.category === category).length || 1)),
        transaction_count: expenses.filter(e => e.category === category).length,
      }))
      .sort((a, b) => b.total - a.total);

    // Find top category
    const topCategory = patterns[0];

    // Weekend analysis
    const weekendSpend = expenses
      .filter(t => {
        const d = new Date(t.created_at);
        return d.getDay() === 0 || d.getDay() === 6;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const weekdaySpend = totalSpent - weekendSpend;
    const weekendRatio = weekendSpend / (totalSpent || 1);

    // Impulse detection (large single transactions)
    const avgTransaction = totalSpent / expenses.length;
    const impulseSpikes = expenses.filter(t => Math.abs(t.amount) > avgTransaction * 2.5).length;

    // ─── GENERATE INSIGHTS ─────────────────────────────────────────
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (topCategory && topCategory.percentage > 35) {
      insights.push(`ค่า${topCategory.category} chiếm ${topCategory.percentage}% ของรายจ่ายทั้งหมด — สูงกว่าค่าเฉลี่ย`);
      recommendations.push(`ลองลด${topCategory.category}ลง 20% → ประหยัดได้ ${Math.round(topCategory.total * 0.2).toLocaleString('th-TH')} บาท/เดือน`);
    }

    if (weekendRatio > 0.4) {
      const weekendPct = Math.round(weekendRatio * 100);
      insights.push(`คุณใช้จ่าย ${weekendPct}% ของทั้งหมดในวันหยุด — สูงกว่าปกติ`);
      recommendations.push('วางแผน budget สำหรับวันหยุดล่วงหน้าเพื่อไม่ให้ใช้จ่ายเกิน');
    }

    if (impulseSpikes > 2) {
      insights.push(`พบ ${impulseSpikes} รายการที่ใช้จ่ายสูงผิดปกติในเดือนนี้`);
      recommendations.push('ใช้ Cooling Lock ก่อนซื้อของเกิน 2,000 บาท');
    }

    // Subscriptions analysis
    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('name, cost, billing_cycle')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (subscriptions && subscriptions.length > 0) {
      const monthlySubs = subscriptions.reduce((sum, s) =>
        sum + (s.billing_cycle === 'yearly' ? s.cost / 12 : s.cost), 0);
      insights.push(`คุณมี ${subscriptions.length} subscriptions รวม ${Math.round(monthlySubs).toLocaleString('th-TH')} บาท/เดือน`);
    }

    // Savings potential
    const potentialSavings = Math.round(totalSpent * 0.15);
    if (potentialSavings > 1000) {
      recommendations.push(`หากลดรายจ่ายลง 15% คุณจะประหยัดได้ ${potentialSavings.toLocaleString('th-TH')} บาท/เดือน`);
    }

    if (insights.length === 0) {
      insights.push('คุณมีพฤติกรรมการใช้จ่ายที่ดี เพียงแต่ยังมีพื้นที่ให้ปรับปรุงได้อีกเล็กน้อย');
    }

    return jsonResponse({
      insights,
      patterns: {
        total_spent: Math.round(totalSpent),
        transaction_count: expenses.length,
        avg_per_transaction: Math.round(totalSpent / expenses.length),
        top_category: topCategory?.category || 'None',
        weekend_ratio: Math.round(weekendRatio * 100),
        impulse_spikes: impulseSpikes,
        categories: patterns,
      },
      recommendations,
      period_days,
      is_mock: false,
    });

  } catch (err) {
    console.error('Analyze spending error:', err);
    return errorResponse('Internal server error', 500);
  }
});
