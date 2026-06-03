import { supabase } from './supabaseClient';

export interface CardCashbackRule {
  categoryName: string;
  cashbackPercent: number;
  pointsMultiplier?: number;
}

export interface CreditCardData {
  id: string;
  user_id?: string;
  card_name: string;
  bank_name: string;
  card_type: 'visa' | 'mastercard' | 'jcb' | 'cash';
  color_gradient: string; // Tailwind class names or inline gradients
  rules: CardCashbackRule[];
  last_four?: string;
}

export interface RewardsRecommendation {
  bestCard: CreditCardData;
  cashbackPercent: number;
  savingsAmount: number;
  pointsEarned: number;
  explanation: string;
  alternatives: {
    card: CreditCardData;
    cashbackPercent: number;
    savingsAmount: number;
    explanation: string;
  }[];
}

// ─── Preset Templates for Credit Cards (SaaS User Friendly) ───
export const PREMIUM_CARD_PRESETS = [
  {
    bank_name: 'SCB',
    card_name: 'SCB M Live',
    card_type: 'visa' as const,
    color_gradient: 'from-[#6366f1] to-[#4f46e5]', // Purple Indigo
    rules: [
      { categoryName: 'Food & Dining', cashbackPercent: 5.0, pointsMultiplier: 3 },
      { categoryName: 'Specialty Coffee', cashbackPercent: 5.0, pointsMultiplier: 3 },
      { categoryName: 'Transportation', cashbackPercent: 2.0, pointsMultiplier: 1 },
      { categoryName: 'Active & Fitness', cashbackPercent: 1.0, pointsMultiplier: 1 }
    ]
  },
  {
    bank_name: 'KBank',
    card_name: 'KBank Shopee Card',
    card_type: 'mastercard' as const,
    color_gradient: 'from-[#f97316] to-[#ea580c]', // Orange
    rules: [
      { categoryName: 'Specialty Coffee', cashbackPercent: 3.0, pointsMultiplier: 2 },
      { categoryName: 'Food & Dining', cashbackPercent: 1.0, pointsMultiplier: 1 },
      { categoryName: 'Transportation', cashbackPercent: 1.0, pointsMultiplier: 1 },
      { categoryName: 'Active & Fitness', cashbackPercent: 1.0, pointsMultiplier: 1 }
    ]
  },
  {
    bank_name: 'Citi',
    card_name: 'Citi Cashback',
    card_type: 'visa' as const,
    color_gradient: 'from-[#0ea5e9] to-[#0284c7]', // Sky Blue
    rules: [
      { categoryName: 'Transportation', cashbackPercent: 11.0, pointsMultiplier: 1 },
      { categoryName: 'Food & Dining', cashbackPercent: 1.0, pointsMultiplier: 1 },
      { categoryName: 'Specialty Coffee', cashbackPercent: 5.0, pointsMultiplier: 1 },
      { categoryName: 'Active & Fitness', cashbackPercent: 1.0, pointsMultiplier: 1 }
    ]
  },
  {
    bank_name: 'UOB',
    card_name: 'UOB YOLO Platinum',
    card_type: 'visa' as const,
    color_gradient: 'from-[#ec4899] to-[#db2777]', // Pink
    rules: [
      { categoryName: 'Food & Dining', cashbackPercent: 10.0, pointsMultiplier: 1 },
      { categoryName: 'Transportation', cashbackPercent: 10.0, pointsMultiplier: 1 },
      { categoryName: 'Specialty Coffee', cashbackPercent: 1.0, pointsMultiplier: 1 },
      { categoryName: 'Active & Fitness', cashbackPercent: 1.0, pointsMultiplier: 1 }
    ]
  }
];

// ─── Database Operations (Supabase Layer) ───

export const fetchUserCreditCards = async (): Promise<CreditCardData[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_credit_cards')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      card_name: item.card_name,
      bank_name: item.bank_name,
      card_type: item.card_type,
      color_gradient: item.color_gradient || 'from-gray-700 to-gray-900',
      last_four: item.last_four || 'XXXX',
      rules: Array.isArray(item.rules) ? item.rules : []
    }));
  } catch (err) {
    console.error('[rewardsService] Failed to load cards from Supabase:', err);
    throw err;
  }
};

export const addUserCreditCard = async (card: Omit<CreditCardData, 'id'>): Promise<CreditCardData> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Local Mock fallback save for unauthenticated preview mode
      return { ...card, id: Math.random().toString() };
    }

    const { data, error } = await supabase
      .from('user_credit_cards')
      .insert({
        user_id: user.id,
        card_name: card.card_name,
        bank_name: card.bank_name,
        card_type: card.card_type,
        color_gradient: card.color_gradient,
        last_four: card.last_four || 'XXXX',
        rules: card.rules
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      card_name: data.card_name,
      bank_name: data.bank_name,
      card_type: data.card_type,
      color_gradient: data.color_gradient,
      last_four: data.last_four,
      rules: data.rules
    };
  } catch (err) {
    console.error('[rewardsService] Failed to insert card in Supabase:', err);
    throw err;
  }
};

// ─── Core Cashback Recommendation Engine (Phase 4: Architecture Logic) ───

export const calculateBestCard = (
  cards: CreditCardData[],
  categoryName: string,
  amount: number
): RewardsRecommendation => {
  if (cards.length === 0) {
    throw new Error('No cards available for evaluation.');
  }

  // Calculate cashback for each card
  const evaluation = cards.map((card) => {
    const rule = card.rules.find((r) => r.categoryName === categoryName);
    const rate = rule ? rule.cashbackPercent : 0;
    const pointsMult = rule?.pointsMultiplier || 1;

    const savings = (amount * rate) / 100;
    const points = Math.floor(amount * (pointsMult / 25)); // standard 25 THB per point base

    let explanation = `ได้รับเครดิตเงินคืน ${rate}%`;
    if (rate === 0) {
      explanation = 'ไม่มีเครดิตเงินคืนในหมวดหมู่นี้';
    } else if (pointsMult > 1) {
      explanation += ` พร้อมคะแนนสะสมคูณ ${pointsMult} เท่า`;
    }

    return {
      card,
      cashbackPercent: rate,
      savingsAmount: savings,
      pointsEarned: points,
      explanation
    };
  });

  // Sort descending by savingsAmount, then by pointsMultiplier
  evaluation.sort((a, b) => {
    if (b.savingsAmount !== a.savingsAmount) {
      return b.savingsAmount - a.savingsAmount;
    }
    const aMult = a.card.rules.find(r => r.categoryName === categoryName)?.pointsMultiplier || 1;
    const bMult = b.card.rules.find(r => r.categoryName === categoryName)?.pointsMultiplier || 1;
    return bMult - aMult;
  });

  const best = evaluation[0];
  const alternatives = evaluation.slice(1).map((alt) => ({
    card: alt.card,
    cashbackPercent: alt.cashbackPercent,
    savingsAmount: alt.savingsAmount,
    explanation: alt.explanation
  }));

  const mainExplanation = best.cashbackPercent > 0
    ? `ชำระผ่าน ${best.card.bank_name} ${best.card.card_name} เพื่อรับเครดิตเงินคืนสูงสุด ${best.cashbackPercent}% (ประหยัดได้ ${best.savingsAmount.toLocaleString()} THB)`
    : `ทุกบัตรมีอัตราเท่ากัน แนะนำใช้เงินสดหรือบัตรหลักของคุณ`;

  return {
    bestCard: best.card,
    cashbackPercent: best.cashbackPercent,
    savingsAmount: best.savingsAmount,
    pointsEarned: best.pointsEarned,
    explanation: mainExplanation,
    alternatives
  };
};
