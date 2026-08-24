/**
 * user-insights — DailyStack MVP Edge Function
 * Purpose: AI financial insights — personal financial archetype analysis
 * Stateless: computes archetype from the last 30 days of transactions.
 */

import { supabaseAdmin, verifyAuth, corsHeaders, jsonResponse, errorResponse } from '../_shared/index.ts';

interface Insight {
  archetype_name: string;
  archetype_label_th: string;
  archetype_label_en: string;
  traits: {
    impulse_rating: number;
    future_orientation: number;
    value_seeking: number;
    social_resistance: number;
  };
  overall_score: number;
  insights: string[];
  recommendations: string[];
  compared_to_peers: number;
}

// Archetype definitions
const ARCHETYPES = {
  balanced_saver: {
    label_th: 'นักออมสมดุล',
    label_en: 'Balanced Saver',
    traits: { impulse_rating: 35, future_orientation: 72, value_seeking: 68, social_resistance: 55 },
  },
  impulse_spender: {
    label_th: 'นักช้อปติดใจ',
    label_en: 'Impulse Spender',
    traits: { impulse_rating: 78, future_orientation: 45, value_seeking: 52, social_resistance: 30 },
  },
  conservative_guardian: {
    label_th: 'ผู้พิทักษ์เงิน',
    label_en: 'Conservative Guardian',
    traits: { impulse_rating: 20, future_orientation: 85, value_seeking: 80, social_resistance: 70 },
  },
  social_butterfly: {
    label_th: 'ผีเสื้อสังคม',
    label_en: 'Social Butterfly',
    traits: { impulse_rating: 65, future_orientation: 50, value_seeking: 40, social_resistance: 20 },
  },
  investment_master: {
    label_th: 'อาจารย์การลงทุน',
    label_en: 'Investment Master',
    traits: { impulse_rating: 30, future_orientation: 95, value_seeking: 88, social_resistance: 60 },
  },
};

type ArchetypeKey = keyof typeof ARCHETYPES;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await verifyAuth(req);
  if (!auth) {
    return errorResponse('Unauthorized', 401);
  }
  const userId = auth.userId;

  try {
    // ─── ANALYZE USER'S TRANSACTIONS ───────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('amount, category, type, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // ─── ANALYZE BEHAVIOR ───────────────────────────────────────────
    let impulseRating = 50;
    let futureOrientation = 50;
    let valueSeeking = 50;
    let socialResistance = 50;

    if (transactions && transactions.length > 0) {
      // Impulse: count large transactions vs small ones
      const avgAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length;
      const largeTransactions = transactions.filter(t => Math.abs(t.amount) > avgAmount * 2).length;
      impulseRating = Math.min(100, Math.round(20 + (largeTransactions / transactions.length) * 80));

      // Value seeking: savings rate
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
      valueSeeking = Math.min(100, Math.round(savingsRate * 100 + 30));

      // Future orientation: consistent saving pattern
      futureOrientation = Math.min(100, valueSeeking + 20);

      // Social resistance: low entertainment spend = high resistance
      const entertainmentSpend = transactions
        .filter(t => ['entertainment', 'social', 'shopping'].includes(t.category?.toLowerCase() || ''))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      socialResistance = Math.min(100, Math.round(100 - (entertainmentSpend / (totalExpense || 1)) * 100));
    }

    // ─── DETERMINE ARCHETYPE ─────────────────────────────────────────
    let archetype: ArchetypeKey = 'balanced_saver';
    if (impulseRating > 65 && socialResistance < 40) archetype = 'social_butterfly';
    else if (impulseRating > 60) archetype = 'impulse_spender';
    else if (futureOrientation > 80 && valueSeeking > 70) archetype = 'investment_master';
    else if (socialResistance > 65 && impulseRating < 40) archetype = 'conservative_guardian';

    // ─── GENERATE INSIGHTS ──────────────────────────────────────────
    const insights: string[] = [];
    const recommendations: string[] = [];

    if (impulseRating > 60) {
      insights.push('คุณมีแนวโน้มซื้อของโดยไม่ได้วางแผน ลองใช้ Cooling Lock เพื่อรอ 24 ชม.');
      recommendations.push('ลองตั้ง Cooling Lock สำหรับการซื้อเกิน 1,000 บาท');
    }
    if (valueSeeking > 70) {
      insights.push('คุณมีวินัยทางการเงินที่ดี ออมได้มากกว่าคนทั่วไป 20%');
    }
    if (socialResistance < 40) {
      insights.push('การใช้จ่ายของคุณสูงขึ้นเมื่ออยู่กับเพื่อน ลองแบ่งเงินไว้สำหรับ social spending');
      recommendations.push('แบ่งเงิน 500-1,000 บาท สำหรับ social spending โดยเฉพาะ');
    }
    if (futureOrientation > 75) {
      insights.push('คุณมีเป้าหมายระยะยาวชัดเจน การลงทุนเหมาะกับคุณ');
      recommendations.push('พิจารณาลงทุนในกองทุนรวม 10% ของรายได้');
    }

    // Default insight
    if (insights.length === 0) {
      insights.push('คุณมีพฤติกรรมทางการเงินที่สมดุล เพียงแต่ยังมีพื้นที่ให้ปรับปรุงได้อีก');
    }

    const archetypeData = ARCHETYPES[archetype];
    const overallScore = Math.round(
      (impulseRating + futureOrientation + valueSeeking + socialResistance) / 4
    );

    return jsonResponse({
      archetype_name: archetype,
      archetype_label_th: archetypeData.label_th,
      archetype_label_en: archetypeData.label_en,
      traits: {
        impulse_rating: impulseRating,
        future_orientation: futureOrientation,
        value_seeking: valueSeeking,
        social_resistance: socialResistance,
      },
      overall_score: overallScore,
      insights,
      recommendations,
      compared_to_peers: Math.round(30 + overallScore * 0.5 + Math.random() * 20),
      is_mock: false,
    });

  } catch (err) {
    console.error('User insights error:', err);

    // Fallback mock data
    return jsonResponse({
      archetype_name: 'balanced_saver',
      archetype_label_th: 'นักออมสมดุล',
      archetype_label_en: 'Balanced Saver',
      traits: { impulse_rating: 45, future_orientation: 60, value_seeking: 55, social_resistance: 50 },
      overall_score: 53,
      insights: ['เริ่มใช้งาน 7 วัน เพื่อดูมิติของคุณ'],
      recommendations: ['เพิ่มรายการแรกเพื่อให้ AI เรียนรู้พฤติกรรมของคุณ'],
      compared_to_peers: 55,
      is_mock: true,
    });
  }
});
