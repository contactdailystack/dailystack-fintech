/**
 * ============================================================
 * PicksWise — Dashboard / Money Pulse v36.0
 * ============================================================
 *
 * Token Migration v1.0 — CSS Variable Foundation
 * - All appearance colors via CSS variables (--bg-page, --text-primary, etc.)
 * - Brand color #0FB0CE used sparingly: CTA, active state, key insight
 * - Business logic (Health Score, Money Twin) unchanged
 *
 * Design Tokens:
 * - Background: --bg-page, --bg-surface, --bg-elevated
 * - Text: --text-primary, --text-secondary, --text-muted
 * - Border: --border-default
 * - Brand: --brand-primary, --brand-primary-muted
 * - Semantic: --success, --warning, --error, --info
 *
 * Appearance:
 * - White 80%, Soft Gray 15%, CI Green 5%
 * - Font: Inter + Noto Sans Thai (Thai) + JetBrains Mono (numbers)
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Bell, ChevronRight, CreditCard, PiggyBank,
  TrendingDown, TrendingUp, Target, Plus, Utensils, Car,
  ShoppingBag, Film, Package, Sparkles, Shield, Eye, EyeOff,
  CalendarDays, Minus, AlertCircle, CheckCircle2,
  ArrowUpRight, ArrowDownRight,
  SlidersHorizontal, ChevronUp, ChevronDown, Wallet, X, Check,
} from 'lucide-react';
import { Language } from '../data/translations';
import { Transaction } from '../types';
import { haptics } from '../services/hapticService';
import { loadSubscriptions } from '../services/subscriptionService';
import type { Subscription } from '../services/subscriptionService';
import { computeSafeToSpend } from '../services/safeToSpend';
import {
  loadBudgets, monthSpendByBudgetKey, subscribeBudgets,
} from '../services/budgetStore';
import type { UserBudget } from '../services/budgetStore';

// ============================================================
// TYPE DEFINITIONS
// ============================================================
interface UserProfile {
  name: string;
  balance: number;
  portfolioValue?: number;
  savings?: number;
  paydayDay?: number;
  creditCardBalance?: number;
  creditCardLimit?: number;
}

interface DashboardPageProps {
  profile: UserProfile;
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
  lang: Language;
  notificationCount?: number;
  monthlyBudget?: number;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onAddTransaction?: (t: Transaction) => void;
  onNavigateToUpgrade?: () => void;
  theme?: 'dark' | 'light';
  stocks?: unknown[];
  goals?: unknown[];
  /** Whether the user is authenticated (has a real Supabase account). Used to gate balance factor. */
  isAuthenticated?: boolean;
}

// ============================================================
// FINANCIAL HEALTH ENGINE v3.0
// ============================================================
//
// HEALTH SCORE INTEGRITY GATE — FIXED
// Weights now total exactly 100.
//
// Option A + C applied:
//   - 3 substantive factors (Budget Adherence, Savings Rate, Balance Health)
//   - 1 Data Completeness bonus factor
//   - No silent substitution; missing data is transparent.
//
// FACTOR 1 — Budget Adherence (40% max)
//   Available when: monthlyBudget > 0
//   Formula: ratio = spend / monthlyBudget
//     ratio ≤ 70%  → 0 → 40 linear (each 1% = 0.4pts)
//     ratio 70-85% → 40pts (optimal zone)
//     ratio > 85%  → 40 - ((ratio-0.85)/0.15) * 60, min 0
//   Missing data: factor contributes 0, does NOT invalidate score
//
// FACTOR 2 — Savings Rate (25% max)
//   Available when: profile.savings >= 0 (field is set)
//   Formula: savings / (monthlyBudget * 0.2) capped at 1.0 → × 25pts
//   NOTE: The 20% savings target is a PROVISIONAL PRODUCT ASSUMPTION.
//   Until a user-configured savings goal exists, this 20% rule is used.
//   When a user sets a savings goal in Goals, that target should replace
//   the 20% formula. Until then, treat this factor as indicative only.
//   Missing data (savings field absent): factor contributes 0
//
// FACTOR 3 — Balance Health (20% max)
//   Available when: user is authenticated AND balance >= 0
//   Source: Supabase user_wallets.balance (real production data)
//   NOT mock data (INITIAL_PROFILE.balance = ฿209,891 is test data only)
//   Formula:
//     balance > 0  → 20pts
//     balance === 0 → 10pts (new wallet, no activity yet)
//     balance < 0  → 0pts
//   Missing data: balance unavailable for unauthenticated users → 0
//
// FACTOR 4 — Data Completeness Bonus (15% max)
//   Reward for having more signal. Prevents false confidence
//   when only one factor is available.
//   Formula: (# of available factors / 3) * 15, rounded
//     All 3 factors: 15pts
//     2 factors:    10pts
//     1 factor:      5pts
//     0 factors:     0pts
//
// TOTAL = Factor1 + Factor2 + Factor3 + Factor4 = 100 (when all available)
//
// CONFIDENCE MODEL:
//   confidence: 'low' | 'medium' | 'high'
//   Low (< 40% data): score may not reflect real health accurately
//   Medium (40-79%): some factors missing
//   High (≥ 80%): all available data used
//   Labels are adjusted when confidence is low.
//
// SCORE ≠ CONFIDENCE:
//   score is WHAT the user's financial health looks like.
//   confidence is HOW MUCH we can trust that measurement.
//   A high score with low confidence = "preliminary" label.
//
// ============================================================

type HealthConfidence = 'low' | 'medium' | 'high';

interface HealthFactorBreakdown {
  name: string;
  weight: number;
  contribution: number;
  status: 'good' | 'warn' | 'bad' | 'unavailable';
  detail: string;
  suggestion: string;
  available: boolean;
}

interface HealthInsight {
  type: 'opportunity' | 'alert' | 'achievement' | 'trend' | 'info';
  headline: string;
  detail: string;
  basis: string;          // data source / calculation basis
  action?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

// ============================================================
// FORMATTERS
// ============================================================
const fmt = (amount: number, lang: Language): string => {
  if (lang === 'th') return `฿${amount.toLocaleString('th-TH')}`;
  return `฿${amount.toLocaleString('en-US')}`;
};

const fmtCompact = (amount: number, lang: Language): string => {
  if (amount >= 1_000_000) return `฿${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1000) return `฿${(amount / 1000).toFixed(1)}K`;
  return `฿${amount}`;
};

const getFont = (lang: Language) =>
  lang === 'th' ? '"Noto Sans Thai", sans-serif' : '"Inter", sans-serif';

// ============================================================
// FINANCIAL HEALTH SCORE CALCULATION v3.0
// ============================================================
function computeHealthScore(
  transactions: Transaction[],
  monthlyBudget: number,
  savings: number,
  balance: number,
  isAuthenticated: boolean,
): { score: number; confidence: HealthConfidence; dataCompleteness: number; availableFactors: number } {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const spend = monthTx
    .filter(t => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const ratio = monthlyBudget > 0 ? spend / monthlyBudget : 0;

  // Factor 1 — Budget Adherence (40% max)
  // Available when: monthlyBudget > 0
  const budgetAvailable = monthlyBudget > 0;
  let budgetPts = 0;
  if (budgetAvailable) {
    if (ratio <= 0.7) {
      budgetPts = ratio / 0.7 * 40;
    } else if (ratio <= 0.85) {
      budgetPts = 40;
    } else {
      budgetPts = Math.max(0, 40 - ((ratio - 0.85) / 0.15) * 60);
    }
  }

  // Factor 2 — Savings Rate (25% max)
  // Available when: savings field is set (>= 0)
  // NOTE: 20% target is provisional — see header docs.
  const savingsAvailable = savings >= 0;
  const savingsTarget = monthlyBudget > 0 ? monthlyBudget * 0.2 : 0;
  let savingsPts = 0;
  if (savingsAvailable && savingsTarget > 0) {
    savingsPts = Math.min(25, (savings / savingsTarget) * 25);
  }

  // Factor 3 — Balance Health (20% max)
  // Available when: user is authenticated (real Supabase wallet data)
  // balance > 0: real wallet balance
  // balance === 0: new wallet, no activity yet (partially valid)
  // balance < 0: negative — count as available but 0 contribution
  const balanceAvailable = isAuthenticated; // Only use balance for authenticated users
  let balancePts = 0;
  if (balanceAvailable) {
    balancePts = balance > 0 ? 20 : balance === 0 ? 10 : 0;
  }

  // Count available factors (each worth 5pt toward data completeness bonus)
  const availableFactors =
    (budgetAvailable ? 1 : 0) +
    (savingsAvailable ? 1 : 0) +
    (balanceAvailable ? 1 : 0);

  // Factor 4 — Data Completeness Bonus (15% max)
  // Each available factor = 5pts. 3 factors = 15pts (full bonus).
  const dataBonusPts = availableFactors * 5;

  // Raw points from substantive factors
  const rawPts = budgetPts + savingsPts + balancePts;

  // Total max points from available factors
  const maxPossible = availableFactors > 0 ? availableFactors * 40 : 0;

  // Normalize: what percentage of available-factor maximum did we achieve?
  const rawScore = maxPossible > 0 ? (rawPts / maxPossible) * 100 : 0;

  // Add data completeness bonus (premium for having more data)
  const score = Math.max(0, Math.min(100, Math.round(rawScore + dataBonusPts)));

  // Data completeness: what % of maximum possible score is achievable with this data
  const dataCompleteness = maxPossible > 0
    ? Math.round(((maxPossible + dataBonusPts) / 100) * 100)
    : 0;

  // Confidence: based on what fraction of the score is based on real data
  const confidence: HealthConfidence =
    availableFactors === 3 ? 'high' :
    availableFactors === 2 ? 'medium' :
    'low';

  return { score, confidence, dataCompleteness, availableFactors };
}

function getHealthScoreBreakdown(
  transactions: Transaction[],
  monthlyBudget: number,
  savings: number,
  balance: number,
  isAuthenticated: boolean,
  lang: Language,
): HealthFactorBreakdown[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const spend = monthTx.filter(t => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const ratio = monthlyBudget > 0 ? spend / monthlyBudget : 0;
  const savingsTarget = monthlyBudget > 0 ? monthlyBudget * 0.2 : 0;

  const budgetAvailable = monthlyBudget > 0;
  const savingsAvailable = savings >= 0;
  const balanceAvailable = isAuthenticated; // Only from real Supabase wallet

  // Budget Adherence (40% max)
  const budgetPts = budgetAvailable
    ? (ratio <= 0.7 ? ratio / 0.7 * 40 : ratio <= 0.85 ? 40 : Math.max(0, 40 - ((ratio - 0.85) / 0.15) * 60))
    : 0;

  // Savings Rate (25% max)
  const savingsPts = savingsAvailable && savingsTarget > 0
    ? Math.min(25, (savings / savingsTarget) * 25) : 0;

  // Balance Health (20% max)
  const balancePts = balanceAvailable ? (balance > 0 ? 20 : balance === 0 ? 10 : 0) : 0;

  const availableFactors =
    (budgetAvailable ? 1 : 0) + (savingsAvailable ? 1 : 0) + (balanceAvailable ? 1 : 0);
  const dataBonusPts = availableFactors * 5;

  const maxPossible = availableFactors > 0 ? availableFactors * 40 : 0;
  const rawPts = budgetPts + savingsPts + balancePts;
  const rawScore = maxPossible > 0 ? (rawPts / maxPossible) * 100 : 0;
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore + dataBonusPts)));

  const budgetStatus: HealthFactorBreakdown['status'] = !budgetAvailable ? 'unavailable'
    : ratio <= 0.7 ? 'good' : ratio <= 0.85 ? 'good' : 'bad';
  const savingsStatus: HealthFactorBreakdown['status'] = !savingsAvailable ? 'unavailable'
    : savings >= savingsTarget ? 'good' : savings > 0 ? 'warn' : 'bad';
  const balanceStatus: HealthFactorBreakdown['status'] = !balanceAvailable ? 'unavailable'
    : balance > 0 ? 'good' : balance === 0 ? 'warn' : 'bad';

  return [
    {
      name: lang === 'th' ? 'การใช้จ่ายตามงบ' : 'Budget Adherence',
      weight: 40,
      contribution: budgetPts,
      status: budgetStatus,
      available: budgetAvailable,
      detail: budgetAvailable
        ? `${Math.round(ratio * 100)}% ${lang === 'th' ? 'ของงบ' : 'of budget used'}`
        : (lang === 'th' ? 'ไม่ได้ตั้งงบประมาณ' : 'No budget set'),
      suggestion: budgetAvailable
        ? ratio < 0.7
          ? (lang === 'th' ? 'รักษาการใช้จ่ายในช่วง 70-85% ของงบ' : 'Keep spending in the 70-85% budget range')
          : ratio > 0.85
          ? (lang === 'th' ? 'พยายามลดรายจ่ายเพื่อไม่ให้เกิน 85% ของงบ' : 'Try to reduce spending below 85% of budget')
          : (lang === 'th' ? 'วิ่งได้ดีมาก! รักษาจังหวะนี้ไว้' : 'Great discipline — keep this pace')
        : (lang === 'th' ? 'ตั้งงบประมาณเพื่อติดตามสุขภาพทางการเงิน' : 'Set a monthly budget to track financial health'),
    },
    {
      name: lang === 'th' ? 'อัตราการออม' : 'Savings Rate',
      weight: 25,
      contribution: savingsPts,
      status: savingsStatus,
      available: savingsAvailable,
      detail: savingsAvailable
        ? (savingsTarget > 0
          ? `${lang === 'th' ? 'ออม' : 'Saved'} ฿${savings.toLocaleString()} / ฿${Math.round(savingsTarget).toLocaleString()} ${lang === 'th' ? '(เป้า 20%)' : '(20% target)'}`
          : (lang === 'th' ? 'ไม่ได้ตั้งงบประมาณ' : 'No budget set'))
        : (lang === 'th' ? 'ไม่มีข้อมูลการออม' : 'No savings data'),
      suggestion: savingsAvailable && savingsTarget > 0 && savings < savingsTarget
        ? (lang === 'th' ? `ออมเพิ่มอีก ฿${Math.max(0, Math.round(savingsTarget - savings)).toLocaleString()} เพื่อถึงเป้า 20%`
          : `Save ฿${Math.max(0, Math.round(savingsTarget - savings)).toLocaleString()} more to reach 20% target`)
        : (lang === 'th' ? 'ตั้งเป้าออมเงินเพื่อติดตามได้แม่นยำขึ้น' : 'Set a savings goal for more accurate tracking'),
    },
    {
      name: lang === 'th' ? 'ยอดเงินคงเหลือ' : 'Balance Health',
      weight: 20,
      contribution: balancePts,
      status: balanceStatus,
      available: balanceAvailable,
      detail: balanceAvailable
        ? (balance >= 0
          ? (lang === 'th' ? `ยอด ฿${balance.toLocaleString()}` : `Balance ฿${balance.toLocaleString()}`)
          : (lang === 'th' ? `ติดลบ ฿${Math.abs(balance).toLocaleString()}` : `Negative ฿${Math.abs(balance).toLocaleString()}`))
        : (lang === 'th' ? 'ไม่มีข้อมูลยอดบัญชี' : 'No wallet balance data'),
      suggestion: !balanceAvailable
        ? (lang === 'th' ? 'ข้อมูลจาก Supabase wallet จะแสดงเมื่อล็อกอินแล้ว' : 'Balance data will appear after login')
        : balance < 0
        ? (lang === 'th' ? 'เร่งเติมเงินเข้าบัญชีเพื่อไม่ให้ติดลบ' : 'Top up your account to avoid negative balance')
        : (lang === 'th' ? 'รักษายอดบัญชีให้เป็นบวก' : 'Keep your balance healthy and positive'),
    },
    {
      name: lang === 'th' ? 'ความครบถ้วนของข้อมูล' : 'Data Completeness',
      weight: 15,
      contribution: dataBonusPts,
      status: availableFactors === 3 ? 'good' : availableFactors === 2 ? 'warn' : 'bad',
      available: true,
      detail: `${availableFactors}/3 ${lang === 'th' ? 'ปัจจัยใช้ได้' : 'factors available'} (Budget/Savings/Balance)`,
      suggestion: availableFactors < 3
        ? (lang === 'th' ? `${3 - availableFactors} ปัจจัยยังไม่พร้อม — เพิ่มข้อมูลเพื่อประเมินได้แม่นยำขึ้น`
          : `${3 - availableFactors} more factor(s) needed for full assessment`)
        : (lang === 'th' ? 'มีข้อมูลครบทุกปัจจัยแล้ว' : 'All factors available — full assessment'),
    },
  ];
}

function getHealthLabel(score: number, confidence: HealthConfidence, lang: Language): { label: string; sub: string } {
  // Score labels adjusted for confidence
  // A high score with low confidence is still "preliminary"
  const prelimLabel = (label: string, sub: string): { label: string; sub: string } => ({
    label: lang === 'th' ? `${label} (เบื้องต้น)` : `${label} (preliminary)`,
    sub: lang === 'th' ? `ข้อมูลยังไม่ครบ — ${sub}` : `Incomplete data — ${sub}`,
  });

  if (confidence === 'low') {
    if (score >= 70) return prelimLabel(lang === 'th' ? 'สุขภาพดี' : 'Healthy', lang === 'th' ? 'เป็นไปตามแผน' : 'On track');
    if (score >= 50) return prelimLabel(lang === 'th' ? 'พอไปได้' : 'Fair', lang === 'th' ? 'มีสิ่งที่ต้องปรับ' : 'Room to improve');
    if (score >= 30) return prelimLabel(lang === 'th' ? 'ต้องระวัง' : 'At Risk', lang === 'th' ? 'ใกล้เกินงบ' : 'Approaching limit');
    return prelimLabel(lang === 'th' ? 'ต้องลงมือ' : 'Critical', lang === 'th' ? 'ต้องลดรายจ่าย' : 'Take action now');
  }

  if (score >= 85) return lang === 'th'
    ? { label: 'สุขภาพทอง', sub: 'วิ่งได้สวยๆ' }
    : { label: 'Excellent', sub: 'Peak financial health' };
  if (score >= 70) return lang === 'th'
    ? { label: 'สุขภาพดี', sub: 'เป็นไปตามแผน' }
    : { label: 'Healthy', sub: 'On track' };
  if (score >= 50) return lang === 'th'
    ? { label: 'พอไปได้', sub: 'มีสิ่งที่ต้องปรับ' }
    : { label: 'Fair', sub: 'Room to improve' };
  if (score >= 30) return lang === 'th'
    ? { label: 'ต้องระวัง', sub: 'ใกล้เกินงบ' }
    : { label: 'At Risk', sub: 'Approaching limit' };
  return lang === 'th'
    ? { label: 'ต้องลงมือ', sub: 'ต้องลดรายจ่าย' }
    : { label: 'Critical', sub: 'Take action now' };
}

// ============================================================
// SMART INSIGHT ENGINE (Rule-Based)
// ============================================================
// Naming: "Smart Insight" / "PicksWise Insight" — NOT "Money Twin"
// Money Twin is reserved for future Elite AI capability.
// This is a rule-based implementation using existing transaction data.
// ============================================================
function computeTopInsight(
  transactions: Transaction[],
  monthlyBudget: number,
  savings: number,
  healthScore: number,
  lang: Language
): HealthInsight {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const spend = monthTx.filter(t => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const savingsLeft = Math.max(0, monthlyBudget - spend);

  // Case 1: Over budget
  if (spend > monthlyBudget && monthlyBudget > 0) {
    const over = spend - monthlyBudget;
    const topCategory = getTopCategory(monthTx.filter(t => t.amount < 0), lang);
    return {
      type: 'alert',
      headline: lang === 'th'
        ? `ใช้เกินงบ ฿${over.toLocaleString()}`
        : `Over budget by ฿${over.toLocaleString()}`,
      detail: lang === 'th'
        ? `${topCategory} ใช้ไปมากกว่าปกติ — พิจารณาลดในเดือนหน้า`
        : `${topCategory} spending is above your usual — consider reducing next month`,
      basis: lang === 'th'
        ? `คำนวณจากรายการใช้จ่าย ${Math.round((spend / monthlyBudget) * 100)}% ของงบ ฿${monthlyBudget.toLocaleString()}`
        : `Based on ${Math.round((spend / monthlyBudget) * 100)}% of ฿${monthlyBudget.toLocaleString()} budget this month`,
      action: lang === 'th' ? 'ดูรายละเอียด' : 'Review spending',
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'var(--warning)',
      bg: 'var(--warning-muted)',
    };
  }

  // Case 2: Near budget (80–100% of budget)
  const ratio = monthlyBudget > 0 ? spend / monthlyBudget : 0;
  if (ratio >= 0.8 && monthlyBudget > 0) {
    return {
      type: 'info',
      headline: lang === 'th'
        ? `เหลือ ฿${Math.round(Math.max(0, savingsLeft)).toLocaleString()} จากวงเงิน`
        : `฿${Math.round(Math.max(0, savingsLeft)).toLocaleString()} left this month`,
      detail: lang === 'th'
        ? `ใช้ไปแล้ว ${Math.round(ratio * 100)}% ของงบ — ใช้อย่างระวังนะ`
        : `${Math.round(ratio * 100)}% of budget used — spend wisely`,
      basis: lang === 'th'
        ? `ติดตามจากรายการ ${monthTx.length} รายการเดือนนี้`
        : `Based on ${monthTx.length} transactions tracked this month`,
      action: lang === 'th' ? 'ดูงบประมาณ' : 'View budget',
      icon: <Minus className="w-5 h-5" />,
      color: 'var(--warning)',
      bg: 'var(--warning-muted)',
    };
  }

  // Case 3: Excellent health + savings
  if (healthScore >= 85 && savings > 0) {
    return {
      type: 'achievement',
      headline: lang === 'th'
        ? `ออมได้ ฿${savings.toLocaleString()} เดือนนี้`
        : `Saved ฿${savings.toLocaleString()} this month`,
      detail: lang === 'th'
        ? 'วิ่งตามแผนได้ดีมาก! สิ่งที่ดีที่สุดคือทำต่อเนื่อง'
        : 'Great discipline this month — consistency is your superpower',
      basis: lang === 'th'
        ? 'คำนวณจากยอดออมที่บันทึกไว้ในโปรไฟล์'
        : 'Based on your recorded savings balance',
      action: lang === 'th' ? 'ดูสรุป' : 'View summary',
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'var(--success)',
      bg: 'var(--success-muted)',
    };
  }

  // Case 4: Low spend warning
  if (ratio < 0.5 && transactions.length > 0 && monthlyBudget > 0) {
    return {
      type: 'trend',
      headline: lang === 'th'
        ? 'ใช้จ่ายต่ำกว่าครึ่งของงบ'
        : 'Spending well below budget',
      detail: lang === 'th'
        ? 'ระวังการใช้จ่ายสิ้นเดือนด้วยนะ — มักจะพุ่งขึ้น'
        : 'Watch out — end-of-month spending tends to spike',
      basis: lang === 'th'
        ? 'สังเกตจากรายการเดือนนี้ว่าใช้จ่ายต่ำกว่าครึ่งของงบ'
        : 'Based on below-50% budget usage this month',
      action: lang === 'th' ? 'ตั้งเป้า' : 'Set a goal',
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'var(--info)',
      bg: 'var(--info-muted)',
    };
  }

  // Case 5: First time / no data
  if (transactions.length === 0) {
    return {
      type: 'info',
      headline: lang === 'th' ? 'เริ่มติดตามวันนี้' : 'Start tracking today',
      detail: lang === 'th'
        ? 'เพิ่มรายการแรกเพื่อรับ insights ส่วนตัว'
        : 'Add your first transaction to unlock personalized insights',
      basis: lang === 'th'
        ? 'ยังไม่มีรายการในเดือนนี้ — เพิ่มรายการเพื่อเริ่มวิเคราะห์'
        : 'No transactions recorded this month — add entries to begin analysis',
      action: lang === 'th' ? 'เพิ่มรายการ' : 'Add transaction',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'var(--brand-primary)',
      bg: 'var(--brand-primary-muted)',
    };
  }

  // Case 6: Default — on track
  return {
    type: 'opportunity',
    headline: lang === 'th'
      ? `เหลือ ฿${Math.round(Math.max(0, savingsLeft)).toLocaleString()} จากวงเงิน`
      : `฿${Math.round(Math.max(0, savingsLeft)).toLocaleString()} remaining`,
    detail: lang === 'th'
      ? 'ทุกอย่างเป็นไปตามแผน รักษาจังหวะนี้ไว้'
      : 'All systems nominal — keep this pace going',
    basis: lang === 'th'
      ? `ติดตามจากรายการ ${monthTx.length} รายการเดือนนี้`
      : `Based on ${monthTx.length} transactions tracked this month`,
    action: lang === 'th' ? 'สรุปรายเดือน' : 'Monthly summary',
    icon: <Shield className="w-5 h-5" />,
    color: 'var(--brand-primary)',
    bg: 'var(--brand-primary-muted)',
  };
}

function getTopCategory(txns: Transaction[], lang: Language): string {
  const cats: Record<string, number> = {};
  for (const t of txns) {
    cats[t.category] = (cats[t.category] || 0) + Math.abs(t.amount);
  }
  const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  if (!top) return lang === 'th' ? 'ทั่วไป' : 'General';
  const labels: Record<string, string> = {
    food: lang === 'th' ? 'อาหาร' : 'Food',
    transport: lang === 'th' ? 'เดินทาง' : 'Transport',
    shopping: lang === 'th' ? 'ช้อปปิ้ง' : 'Shopping',
    entertainment: lang === 'th' ? 'บันเทิง' : 'Entertainment',
    bills: lang === 'th' ? 'บิล' : 'Bills',
    subscription: lang === 'th' ? 'สมัคร' : 'Subscription',
    other: lang === 'th' ? 'อื่นๆ' : 'Other',
  };
  return labels[top[0]] || top[0];
}

// ============================================================
// HEALTH SCORE RING (interactive)
// ============================================================
function HealthRing({ score, confidence, lang, onShowBreakdown }: {
  score: number;
  confidence: HealthConfidence;
  lang: Language;
  onShowBreakdown: () => void;
}) {
  const { label, sub } = getHealthLabel(score, confidence, lang);
  const circumference = 2 * Math.PI * 44;
  const filled = (score / 100) * circumference;

  const scoreColor =
    score >= 70 ? 'var(--brand-primary)' :
    score >= 50 ? 'var(--warning)' :
    'var(--error)';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none"
            stroke="var(--border-default)" strokeWidth="8" />
          <circle cx="50" cy="50" r="44" fill="none"
            stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${filled.toFixed(1)} ${circumference.toFixed(1)}`}
            strokeDashoffset="0"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
          <circle
            cx={50 + 44 * Math.cos((filled / circumference) * 2 * Math.PI - Math.PI / 2)}
            cy={50 + 44 * Math.sin((filled / circumference) * 2 * Math.PI - Math.PI / 2)}
            r="4" fill={scoreColor}
            style={{ filter: `drop-shadow(0 0 4px ${scoreColor})` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700,
            fontSize: '1.75rem', color: scoreColor, lineHeight: 1,
          }}>
            {score}
          </span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p style={{ fontFamily: getFont(lang), fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
          {label}
        </p>
        <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {sub}
        </p>
        <button
          onClick={onShowBreakdown}
          style={{
            fontFamily: '"Inter", sans-serif', fontSize: '0.5625rem',
            color: 'var(--brand-primary)', marginTop: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            textDecoration: 'underline', padding: 0,
          }}
          aria-label={lang === 'th' ? 'ดูรายละเอียดคะแนน' : 'View score breakdown'}
        >
          {lang === 'th' ? 'ดูรายละเอียด →' : 'See breakdown →'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// HEALTH SCORE BREAKDOWN SHEET
// ============================================================
function HealthScoreBreakdownSheet({ breakdown, confidence, score, lang, onClose }: {
  breakdown: HealthFactorBreakdown[];
  confidence: HealthConfidence;
  score: number;
  lang: Language;
  onClose: () => void;
}) {
  const statusColor = (s: HealthFactorBreakdown['status']) =>
    s === 'good' ? 'var(--brand-primary)' :
    s === 'warn' ? 'var(--warning)' :
    s === 'bad' ? 'var(--error)' : 'var(--border-default)';

  const statusIcon = (s: HealthFactorBreakdown['status']) =>
    s === 'good' ? '✓' : s === 'warn' ? '!' : s === 'bad' ? '✗' : '○';

  const confidenceLabel = confidence === 'high' ? (lang === 'th' ? 'สูง' : 'High')
    : confidence === 'medium' ? (lang === 'th' ? 'ปานกลาง' : 'Medium')
    : (lang === 'th' ? 'ต่ำ' : 'Low');

  const confidenceColor = confidence === 'high' ? 'var(--brand-primary)'
    : confidence === 'medium' ? 'var(--warning)' : 'var(--error)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl p-6"
        style={{ backgroundColor: 'var(--bg-elevated)', maxHeight: '80dvh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ fontFamily: getFont(lang), fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
              {lang === 'th' ? 'รายละเอียดคะแนน' : 'Score Breakdown'}
            </h2>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {lang === 'th' ? 'คะแนนสุขภาพทางการเงินของคุณวันนี้' : 'Your financial health score today'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
            aria-label={lang === 'th' ? 'ปิด' : 'Close'}
          >
            ✕
          </button>
        </div>

        {/* Confidence + Score badge */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 rounded-xl p-3"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {lang === 'th' ? 'คะแนน' : 'Score'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              {score}
            </p>
          </div>
          <div className="flex-1 rounded-xl p-3"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {lang === 'th' ? 'ความมั่นใจ' : 'Confidence'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.5rem', color: confidenceColor }}>
              {confidenceLabel}
            </p>
          </div>
        </div>

        {/* Low confidence warning */}
        {confidence === 'low' && (
          <div className="mb-4 p-3 rounded-xl flex items-start gap-3"
            style={{ backgroundColor: 'var(--warning-muted)', border: '1px solid var(--warning)' }}>
            <span style={{ color: 'var(--warning)', fontSize: '1rem' }}>⚠</span>
            <p style={{ fontFamily: getFont(lang), fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {lang === 'th'
                ? 'ข้อมูลยังไม่เพียงพอ คะแนนอาจไม่สะท้อนสุขภาพทางการเงินจริง — เพิ่มข้อมูลเพื่อประเมินได้แม่นยำขึ้น'
                : 'Not enough data for an accurate assessment. The score may not reflect your true financial health — add more data for a reliable evaluation.'}
            </p>
          </div>
        )}

        {/* Factors */}
        <div className="space-y-3">
          {breakdown.map((factor) => (
            <div key={factor.name}
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: `1px solid ${factor.available ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                opacity: factor.available ? 1 : 0.6,
              }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ color: statusColor(factor.status), fontSize: '0.875rem', fontWeight: 700 }}>
                    {statusIcon(factor.status)}
                  </span>
                  <span style={{ fontFamily: getFont(lang), fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    {factor.name}
                    {!factor.available && (
                      <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                        ({lang === 'th' ? 'ไม่พร้อม' : 'N/A'})
                      </span>
                    )}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.875rem', color: statusColor(factor.status) }}>
                  {factor.available
                    ? `${Math.round(factor.contribution)}/${factor.weight}`
                    : '—/—'}
                </span>
              </div>
              {factor.available && (
                <>
                  <div className="w-full h-1.5 rounded-full overflow-hidden mb-2"
                    style={{ backgroundColor: 'var(--border-default)' }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${(factor.contribution / factor.weight) * 100}%`,
                        backgroundColor: statusColor(factor.status),
                        transition: 'width 0.8s ease',
                      }} />
                  </div>
                  <p style={{ fontFamily: getFont(lang), fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {factor.detail}
                  </p>
                  <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 4 }}>
                    → {factor.suggestion}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 text-center"
          style={{ borderTop: '1px solid var(--border-default)' }}>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.5625rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {lang === 'th'
              ? 'คะแนนนี้คำนวณจากพฤติกรรมการใช้จ่ายจริง ไม่ใช่คำแนะนำทางการเงิน'
              : 'This score is based on your recorded spending behavior — not financial advice.'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// SMART INSIGHT CARD (formerly "Money Twin")
// Naming: "Smart Insight" / "Financial Insight" — NOT "Money Twin"
// Money Twin is reserved for future Elite AI capability.
// This is a rule-based implementation — honest, explainable.
// ============================================================
function SmartInsightCard({ insight, lang, onAction }: {
  insight: HealthInsight;
  lang: Language;
  onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onAction}
      className="rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-transform"
      style={{
        background: 'var(--card-bg)',
        border: `1px solid var(--border-default)`,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: insight.bg }}>
            <span style={{ color: insight.color }}>{insight.icon}</span>
          </div>
          <div>
            <p style={{
              fontFamily: '"Inter", sans-serif', fontSize: '0.625rem',
              fontWeight: 500, color: insight.color, letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              {lang === 'th' ? 'Smart Insight' : 'Smart Insight'}
            </p>
          </div>
        </div>
        <Sparkles className="w-3.5 h-3.5" style={{ color: insight.color, opacity: 0.6 }} />
      </div>
      <h3 style={{
        fontFamily: getFont(lang), fontWeight: 700,
        fontSize: 'clamp(1rem, 4vw, 1.125rem)',
        color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 6,
      }}>
        {insight.headline}
      </h3>
      <p style={{
        fontFamily: getFont(lang), fontSize: '0.75rem',
        color: 'var(--text-secondary)', lineHeight: 1.5,
      }}>
        {insight.detail}
      </p>
      {insight.basis && (
        <p style={{
          fontFamily: '"Inter", sans-serif', fontSize: '0.5625rem',
          color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 6,
          fontStyle: 'italic',
        }}>
          {insight.basis}
        </p>
      )}
      {insight.action && (
        <div className="mt-3 flex items-center gap-1">
          <span style={{ fontFamily: getFont(lang), fontSize: '0.6875rem', fontWeight: 600, color: insight.color }}>
            {insight.action}
          </span>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: insight.color }} />
        </div>
      )}
    </motion.div>
  );
}

// ============================================================
// SPENDING CARD
// ============================================================
function SpendingCard({ spend, budget, lang, showAmounts }: {
  spend: number; budget: number; lang: Language; showAmounts: boolean;
}) {
  const ratio = budget > 0 ? spend / budget : 0;
  const remaining = Math.max(0, budget - spend);
  const isOver = spend > budget;
  const isNear = ratio >= 0.8 && ratio <= 1;

  const accent = isOver ? 'var(--error)' : isNear ? 'var(--warning)' : 'var(--success)';
  const bg = isOver ? 'var(--error-muted)' : isNear ? 'var(--warning-muted)' : 'var(--success-muted)';

  return (
    <div className="rounded-2xl p-4" style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem', fontWeight: 500,
          color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {lang === 'th' ? 'ใช้ไปเดือนนี้' : 'This Month'}
        </p>
        <div className="flex items-center gap-1" style={{ color: accent }}>
          {isOver ? <TrendingDown className="w-3.5 h-3.5" />
            : isNear ? <Minus className="w-3.5 h-3.5" />
            : <TrendingUp className="w-3.5 h-3.5" />}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 600 }}>
            {Math.round(ratio * 100)}%
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span style={{
          fontFamily: 'var(--font-mono)', fontWeight: 700,
          fontSize: 'clamp(1.5rem, 6vw, 1.75rem)',
          color: 'var(--text-primary)', letterSpacing: '-0.03em',
        }}>
          {showAmounts ? fmt(spend, lang) : '••••'}
        </span>
        <span style={{ fontFamily: getFont(lang), fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          / {showAmounts ? fmt(budget, lang) : '••••'}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden mb-2"
        style={{ backgroundColor: 'var(--border-default)' }}>
        <motion.div className="h-full rounded-full"
          style={{ backgroundColor: accent }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(ratio * 100, 100)}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} />
      </div>
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: getFont(lang), fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          {isOver ? (lang === 'th' ? 'เกินงบ' : 'Over budget')
            : (lang === 'th' ? 'เหลือใช้' : 'Remaining')}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
          color: isOver ? 'var(--error)' : accent,
        }}>
          {showAmounts ? fmt(isOver ? spend - budget : remaining, lang) : '••••'}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// QUICK STATS GRID
// ============================================================
function QuickStatsGrid({ savings, goalProgress, creditBalance, payday, portfolioValue, lang, showAmounts }: {
  savings: number; goalProgress: number; creditBalance: number;
  payday: number; portfolioValue: number; lang: Language; showAmounts: boolean;
}) {
  const daysUntilPayday = (() => {
    const today = new Date();
    const cur = today.getDate();
    if (payday > cur) return payday - cur;
    return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - cur + payday;
  })();

  const stats = [
    {
      label: lang === 'th' ? 'เงินออม' : 'Savings',
      value: showAmounts ? fmtCompact(savings, lang) : '••••',
      sub: lang === 'th' ? `+${Math.round(goalProgress)}% เดือนนี้` : `+${Math.round(goalProgress)}% this month`,
      icon: <PiggyBank className="w-4 h-4" />,
      color: 'var(--success)',
      bg: 'var(--success-muted)',
      trend: 'up' as const,
    },
    {
      label: lang === 'th' ? 'วันเงินเดือน' : 'Payday',
      value: `${daysUntilPayday}`,
      sub: lang === 'th' ? 'วันจากนี้' : 'days away',
      icon: <CalendarDays className="w-4 h-4" />,
      color: 'var(--brand-primary)',
      bg: 'var(--brand-primary-muted)',
      trend: null,
    },
    {
      label: lang === 'th' ? 'ยอดบัตร' : 'Card',
      value: showAmounts ? fmtCompact(creditBalance, lang) : '••••',
      sub: creditBalance === 0
        ? (lang === 'th' ? 'ไม่มียอดค้าง' : 'No balance')
        : (lang === 'th' ? 'ค้างชำระ' : 'Balance due'),
      icon: <CreditCard className="w-4 h-4" />,
      color: creditBalance > 0 ? 'var(--warning)' : 'var(--success)',
      bg: creditBalance > 0 ? 'var(--warning-muted)' : 'var(--success-muted)',
      trend: creditBalance > 0 ? 'up' : null,
    },
    {
      label: lang === 'th' ? 'สินทรัพย์' : 'Net Worth',
      value: showAmounts ? fmtCompact(portfolioValue + savings, lang) : '••••',
      sub: lang === 'th' ? 'รวมสินทรัพย์' : 'Total assets',
      icon: <Shield className="w-4 h-4" />,
      color: 'var(--info)',
      bg: 'var(--info-muted)',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => (
        <motion.div key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-4"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: stat.bg }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            {stat.trend && (
              <span style={{ color: stat.color }}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" />
                  : <ArrowDownRight className="w-4 h-4" />}
              </span>
            )}
          </div>
          <p style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700,
            fontSize: 'clamp(1.125rem, 4vw, 1.375rem)',
            color: stat.color, letterSpacing: '-0.02em',
            lineHeight: 1, marginBottom: 4,
          }}>
            {stat.value}
          </p>
          <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: 2 }}>
            {stat.label}
          </p>
          <p style={{ fontFamily: getFont(lang), fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
            {stat.sub}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// RECENT TRANSACTIONS
// ============================================================
function RecentMoves({ transactions, lang, showAmounts, onToggle, onViewAll }: {
  transactions: Transaction[]; lang: Language; showAmounts: boolean;
  onToggle: () => void;
  onViewAll?: () => void;
}) {
  if (transactions.length === 0) return null;

  const catConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    food: { icon: <Utensils className="w-4 h-4" />, color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
    transport: { icon: <Car className="w-4 h-4" />, color: '#1786C2', bg: 'rgba(23, 134, 194,0.12)' },
    shopping: { icon: <ShoppingBag className="w-4 h-4" />, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
    entertainment: { icon: <Film className="w-4 h-4" />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    subscription: { icon: <CreditCard className="w-4 h-4" />, color: 'var(--brand-primary)', bg: 'var(--brand-primary-muted)' },
    bills: { icon: <Package className="w-4 h-4" />, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  };

  const getCat = (cat: string) => catConfig[(cat || '').toLowerCase()] || {
    icon: <Package className="w-4 h-4" />, color: 'var(--text-muted)', bg: 'var(--bg-surface)',
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const today = new Date();
    const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return lang === 'th' ? 'วันนี้' : 'Today';
    if (diff === 1) return lang === 'th' ? 'เมื่อวาน' : 'Yesterday';
    return d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 20,
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
    }}>
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem', fontWeight: 500,
          color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {lang === 'th' ? 'รายการล่าสุด' : 'Latest Moves'}
        </p>
        {/* Privacy toggle — Apple HIG: 44x44px touch target */}
        <button
          onClick={onToggle}
          className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors -mr-2"
          style={{ backgroundColor: 'var(--bg-surface)' }}
          aria-label={showAmounts ? (lang === 'th' ? 'ซ่อนจำนวน' : 'Hide amounts')
            : (lang === 'th' ? 'แสดงจำนวน' : 'Show amounts')}
        >
          {showAmounts
            ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            : <Eye className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />}
        </button>
      </div>

      <div>
        {transactions.slice(0, 5).map((tx, i) => {
          const cat = getCat(tx.category);
          const isIncome = tx.amount > 0;
          return (
            <motion.div key={tx.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: i > 0 ? '1px solid var(--border-default)' : 'none' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: cat.bg }}>
                <span style={{ color: cat.color }}>{cat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{
                  fontFamily: getFont(lang), fontWeight: 500, fontSize: '0.8125rem',
                  color: 'var(--text-primary)', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {tx.merchant || tx.category}
                </p>
                <p style={{ fontFamily: getFont(lang), fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                  {formatDate(tx.date)} · {tx.category}
                </p>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem',
                color: isIncome ? 'var(--success)' : 'var(--text-primary)',
                whiteSpace: 'nowrap',
              }}>
                {isIncome ? '+' : ''}
                {showAmounts ? fmt(Math.abs(tx.amount), lang) : '••••'}
              </span>
            </motion.div>
          );
        })}
      </div>

      {transactions.length > 5 && (
        <button
          className="w-full py-3 text-center min-h-[44px] flex items-center justify-center"
          style={{
            borderTop: '1px solid var(--border-default)',
            fontFamily: getFont(lang), fontSize: '0.6875rem', fontWeight: 500,
            color: 'var(--brand-primary)',
          }}
          onClick={() => { haptics.fire('SELECT'); onViewAll?.(); }}
          aria-label={lang === 'th' ? `ดูรายการทั้งหมด ${transactions.length} รายการ` : `See all ${transactions.length} transactions`}
        >
          {lang === 'th' ? `ดูทั้งหมด ${transactions.length} รายการ →` : `See all ${transactions.length} transactions →`}
        </button>
      )}
    </div>
  );
}

// ============================================================
// NET WORTH HERO (Rocket Money pattern — top of dashboard)
// ============================================================
function NetWorthHero({ portfolioValue, balance, lang, showAmounts }: {
  portfolioValue: number;
  balance: number;
  lang: Language;
  showAmounts: boolean;
}) {
  const netWorth = portfolioValue || balance || 0;
  return (
    <div className="rounded-2xl p-5 mb-3"
      style={{
        background: 'var(--brand-primary)',
        color: 'var(--brand-on-primary)',
        boxShadow: 'var(--shadow-brand)',
      }}
    >
      <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
        {lang === 'th' ? 'มูลค่าสุทธิ' : 'Net Worth'}
      </p>
      <p style={{
        fontFamily: 'var(--font-mono)', fontWeight: 700,
        fontSize: 'clamp(1.75rem, 7vw, 2.25rem)',
        letterSpacing: '-0.03em', lineHeight: 1,
        marginBottom: 8,
      }}>
        {showAmounts ? fmt(netWorth, lang) : '••••••'}
      </p>
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: getFont(lang), fontSize: '0.6875rem', color: 'rgba(255,255,255,0.85)' }}>
          {lang === 'th' ? `เงินสด ${fmtCompact(balance, lang)}` : `Cash ${fmtCompact(balance, lang)}`}
        </span>
        <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.35)' }} />
        <span style={{ fontFamily: getFont(lang), fontSize: '0.6875rem', color: 'var(--accent-cyan-light)' }}>
          {lang === 'th' ? 'รวมสินทรัพย์ทั้งหมด' : 'All accounts'}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// UPCOMING BILLS (Rocket Money pattern — next 7 days)
// ============================================================
function UpcomingBills({ subs, lang, showAmounts, onSeeAll }: {
  subs: Subscription[];
  lang: Language;
  showAmounts: boolean;
  onSeeAll: () => void;
}) {
  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    const items: Array<{ sub: Subscription; date: Date }> = [];
    for (const sub of subs) {
      if (!sub.isActive) continue;
      // Compute the next occurrence from dueDate (day of month)
      let date = new Date(today.getFullYear(), today.getMonth(), sub.dueDate);
      if (date < today) {
        if (sub.billingCycle === 'yearly') {
          date = new Date(today.getFullYear() + 1, today.getMonth(), sub.dueDate);
        } else if (sub.billingCycle === 'weekly') {
          date = new Date(date);
          while (date < today) date.setDate(date.getDate() + 7);
        } else {
          date = new Date(today.getFullYear(), today.getMonth() + 1, sub.dueDate);
        }
      }
      if (date <= in7Days) items.push({ sub, date });
    }
    return items.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  }, [subs]);

  if (upcoming.length === 0) return null;

  const dayLabel = (d: Date) =>
    d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'short' });
  const dayNum = (d: Date) => d.getDate();

  return (
    <div className="rounded-2xl p-5 mb-3"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem', color: 'var(--text-muted)',
          letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {lang === 'th' ? 'บิลที่กำลังจะมาถึง (7 วัน)' : 'Upcoming (next 7 days)'}
        </p>
        <button
          onClick={() => { haptics.fire('SELECT'); onSeeAll(); }}
          className="flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 rounded-md"
          style={{ fontFamily: getFont(lang), fontSize: '0.6875rem', fontWeight: 600,
            color: 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 2px' }}
          aria-label={lang === 'th' ? 'ดูรายจ่ายประจำทั้งหมด' : 'See all recurring'}
        >
          {lang === 'th' ? 'ดูทั้งหมด' : 'See all'}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div role="list">
        {upcoming.map(({ sub, date }) => (
          <div key={sub.id} role="listitem" className="flex items-center gap-3 py-2.5"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="w-10 flex-shrink-0 text-center rounded-lg py-1"
              style={{ backgroundColor: 'var(--bg-surface)' }}>
              <p style={{ fontFamily: getFont(lang), fontSize: '0.5rem', fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase', lineHeight: 1.4 }}>
                {dayLabel(date)}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700,
                color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {dayNum(date)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold text-white"
              style={{ backgroundColor: sub.color || 'var(--brand-primary)' }}
              aria-hidden="true">
              {(sub.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate" style={{ fontFamily: getFont(lang), fontSize: '0.8125rem',
                fontWeight: 600, color: 'var(--text-primary)' }}>
                {sub.name}
              </p>
              {typeof sub.priceChange === 'number' && sub.priceChange > 0 && (
                <p className="flex items-center gap-1" style={{ fontFamily: getFont(lang),
                  fontSize: '0.5625rem', color: 'var(--error)', marginTop: 1 }}>
                  <TrendingUp className="w-3 h-3" />
                  {lang === 'th' ? 'ราคาขึ้น' : 'Price increased'}
                </p>
              )}
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700,
              color: 'var(--text-secondary)' }}>
              {showAmounts ? fmt(sub.amount, lang) : '••••'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// FAB
// ============================================================
function FAB({ onClick, lang }: { onClick: () => void; lang: Language }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', damping: 15, stiffness: 300 }}
      onClick={() => { haptics.fire('SELECT'); onClick(); }}
      className="fixed bottom-[calc(84px+env(safe-area-inset-bottom,16px)+12px)] right-5 w-14 h-14 rounded-full flex items-center justify-center z-30"
      style={{
        backgroundColor: 'var(--brand-primary)',
        color: 'var(--brand-on-primary)',
        boxShadow: 'var(--shadow-brand)',
      }}
      aria-label={lang === 'th' ? 'เพิ่มรายการ' : 'Add transaction'}
    >
      <Plus className="w-6 h-6" strokeWidth={2.5} />
    </motion.button>
  );
}

// ============================================================
// SKELETON LOADER
// ============================================================
function SkeletonCard({ h = 120 }: { h?: number }) {
  return (
    <div className="rounded-2xl animate-pulse"
      style={{
        height: h,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
      }} />
  );
}

// ============================================================
// DASHBOARD CUSTOMIZATION (#7) — section order/visibility prefs
// ============================================================
const DASH_SECTIONS: { id: string; labelEn: string; labelTh: string }[] = [
  { id: 'safe', labelEn: 'Safe to Spend', labelTh: 'เงินที่ใช้ได้ปลอดภัย' },
  { id: 'upcoming', labelEn: 'Upcoming Bills', labelTh: 'รายการที่จะถึง' },
  { id: 'rings', labelEn: 'Budget Rings', labelTh: 'วงแหวนงบประมาณ' },
  { id: 'insight', labelEn: 'Smart Insight', labelTh: 'คำแนะนำอัจฉริยะ' },
  { id: 'stats', labelEn: 'Quick Stats', labelTh: 'สถิติด่วน' },
  { id: 'recent', labelEn: 'Recent Activity', labelTh: 'กิจกรรมล่าสุด' },
  { id: 'actions', labelEn: 'Quick Actions', labelTh: 'ทางลัด' },
];
const DEFAULT_DASH_ORDER = DASH_SECTIONS.map((s) => s.id);
const DASH_PREFS_KEY = 'pickswise.dash.v1';

function loadDashPrefs(): { order: string[]; hidden: string[] } {
  try {
    const raw = localStorage.getItem(DASH_PREFS_KEY);
    if (!raw) return { order: DEFAULT_DASH_ORDER, hidden: [] };
    const p = JSON.parse(raw);
    const order = Array.isArray(p.order)
      ? [...p.order.filter((id: string) => DEFAULT_DASH_ORDER.includes(id)),
         ...DEFAULT_DASH_ORDER.filter((id) => !p.order.includes(id))]
      : DEFAULT_DASH_ORDER;
    const hidden = Array.isArray(p.hidden) ? p.hidden : [];
    return { order, hidden };
  } catch {
    return { order: DEFAULT_DASH_ORDER, hidden: [] };
  }
}

function saveDashPrefs(prefs: { order: string[]; hidden: string[] }): void {
  try { localStorage.setItem(DASH_PREFS_KEY, JSON.stringify(prefs)); } catch { /* noop */ }
}

// ============================================================
// ACTIVATION CHECKLIST — RM-style "win moment": 3 steps to set up,
// auto-hides once everything is done
// ============================================================
const CHECKLIST_KEY = 'pickswise.checklist.dismissed.v1';
function ActivationChecklist({
  hasSubs, hasTxs, hasBudgets, lang, onNavigate,
}: {
  hasSubs: boolean;
  hasTxs: boolean;
  hasBudgets: boolean;
  lang: Language;
  onNavigate: (tab: string) => void;
}) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(CHECKLIST_KEY) === '1'; } catch { return false; }
  });

  if (dismissed) return null;
  const steps = [
    { done: hasSubs, labelTh: 'เพิ่มการสมัครรายแรก', labelEn: 'Add your first subscription', tab: 'subscriptions' },
    { done: hasTxs, labelTh: 'บันทึกหรือนำเข้ารายจ่าย', labelEn: 'Record or import expenses', tab: 'activity' },
    { done: hasBudgets, labelTh: 'ตั้งงบประมาณ', labelEn: 'Set a budget', tab: 'budget' },
  ];
  const doneCount = steps.filter(s => s.done).length;

  // All done → mark dismissed permanently and disappear
  useEffect(() => {
    if (doneCount === steps.length) {
      try { localStorage.setItem(CHECKLIST_KEY, '1'); } catch { /* noop */ }
      setDismissed(true);
    }
  }, [doneCount]);

  if (doneCount === steps.length) return null;

  const dismiss = () => {
    try { localStorage.setItem(CHECKLIST_KEY, '1'); } catch { /* noop */ }
    haptics.fire('SELECT');
    setDismissed(true);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 mb-3 relative">
      <button
        type="button"
        onClick={dismiss}
        aria-label={lang === 'th' ? 'ปิด' : 'Dismiss'}
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
        {lang === 'th' ? 'ตั้งค่าเริ่มต้น' : 'Get started'}
      </p>
      <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--brand-primary)' }}>
        {lang === 'th'
          ? `พร้อมใช้งาน ${doneCount}/3 ขั้นตอน`
          : `${doneCount} of 3 steps complete`}
      </p>
      <div className="mt-3 space-y-1.5">
        {steps.map((step) => (
          <button
            key={step.tab}
            type="button"
            disabled={step.done}
            onClick={() => { haptics.fire('SELECT'); onNavigate(step.tab); }}
            className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors ${
              step.done ? '' : 'hover:bg-zinc-50 active:bg-zinc-100'
            }`}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: step.done ? 'var(--success)' : '#F4F4F5',
                color: step.done ? '#fff' : '#A1A1AA',
              }}
            >
              <Check className="w-3 h-3" strokeWidth={3} />
            </span>
            <span
              className="text-xs"
              style={{
                color: step.done ? '#A1A1AA' : '#27272A',
                textDecoration: step.done ? 'line-through' : 'none',
                fontWeight: step.done ? 400 : 600,
              }}
            >
              {lang === 'th' ? step.labelTh : step.labelEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SAFE TO SPEND — RM hero metric
// balance − recurring obligations due before next payday (30d fallback)
// ============================================================
function SafeToSpendCard({
  balance, paydayDay, subs, lang, showAmounts, onSeeBills,
}: {
  balance: number;
  paydayDay?: number | null;
  subs: { id: string; name: string; amount: number; dueDate: number }[];
  lang: Language;
  showAmounts: boolean;
  onSeeBills: () => void;
}) {
  const result = useMemo(
    () => computeSafeToSpend({ balance, paydayDay, subs }),
    [balance, paydayDay, subs]
  );
  const negative = result.amount < 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
            {lang === 'th' ? 'เงินที่ใช้ได้ปลอดภัย' : 'Safe to Spend'}
          </p>
          <p
            className="mt-1 font-bold"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(1.5rem, 6vw, 1.875rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: negative ? 'var(--error)' : 'var(--brand-primary)',
            }}
          >
            {showAmounts ? `฿${result.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '••••'}
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-zinc-500">
            {negative
              ? (lang === 'th'
                ? `เงินไม่พบสำหรับบิลถึงวัน pay · หนี้ระยะสั้นเกินดุล`
                : `Not enough for upcoming bills · short by ฿${Math.abs(result.totalObligations - balance).toLocaleString()}`)
              : result.obligations.length === 0
                ? (lang === 'th'
                  ? `ไม่มีบิลที่จะมาถึงในอีก ${result.windowDays} วัน`
                  : `No bills due in the next ${result.windowDays} days`)
                : (lang === 'th'
                  ? `หลังหักบิล ฿${result.totalObligations.toLocaleString()} จาก ${result.obligations.length} รายการ · ${result.windowDays} วันข้างหน้า`
                  : `After ฿${result.totalObligations.toLocaleString()} in bills across ${result.obligations.length} items · ${result.windowDays} days ahead`)}
          </p>
        </div>
        <button
          type="button"
          onClick={onSeeBills}
          className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{ backgroundColor: 'var(--brand-tint, #E0F2FC)', color: 'var(--brand-primary)' }}
        >
          {lang === 'th' ? 'ดูบิล' : 'View bills'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// BUDGET RINGS (#5) — Rocket Money pattern, top categories
// ============================================================
function BudgetRing({ pct, color }: { pct: number; color: string }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(pct, 1);
  const strokeColor = pct > 1 ? 'var(--error)' : pct > 0.8 ? 'var(--warning)' : color;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border-default)" strokeWidth="5" />
      <motion.circle
        cx="28" cy="28" r={r} fill="none"
        stroke={strokeColor} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - clamped) }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="31" textAnchor="middle" fill="var(--text-primary)"
        style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function BudgetRings({ transactions, budgets, lang, showAmounts, onSeeAll }: {
  transactions: Transaction[];
  budgets: UserBudget[];
  lang: Language;
  showAmounts: boolean;
  onSeeAll: () => void;
}) {
  const spendMap = useMemo(() => monthSpendByBudgetKey(transactions), [transactions]);
  const fmtB = (n: number) => `฿${n.toLocaleString()}`;
  if (budgets.length === 0) return null;

  return (
    <div className="mb-3 rounded-2xl p-4"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
          <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem',
            color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {lang === 'th' ? 'ผู้พิทักษ์การใช้จ่าย' : 'Spending Guardian'}
          </p>
        </div>
        <button onClick={() => { haptics.fire('SELECT'); onSeeAll(); }}
          className="text-[11px] font-medium min-h-[32px] px-1 flex items-center"
          style={{ color: 'var(--brand-primary)', fontFamily: getFont(lang) }}>
          {lang === 'th' ? 'ทั้งหมด' : 'See all'}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {budgets.slice(0, 4).map((b) => {
          const spent = spendMap.get(b.key) || 0;
          const pct = b.limit > 0 ? spent / b.limit : 0;
          return (
            <div key={b.key} className="flex flex-col items-center gap-1.5 shrink-0 w-[76px]">
              <BudgetRing pct={pct} color={b.color} />
              <span className="text-[10px] font-medium text-center leading-tight truncate w-full"
                style={{ color: 'var(--text-secondary)', fontFamily: getFont(lang) }}>
                {lang === 'th' ? b.nameTh : b.nameEn}
              </span>
              <span className="text-[9px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {showAmounts ? `${fmtB(spent)} / ${fmtB(b.limit)}` : '•••'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// CUSTOMIZE SHEET (#7)
// ============================================================
function DashCustomizeSheet({ open, order, hidden, onApply, onClose, lang }: {
  open: boolean;
  order: string[];
  hidden: string[];
  onApply: (order: string[], hidden: string[]) => void;
  onClose: () => void;
  lang: Language;
}) {
  const [localOrder, setLocalOrder] = useState(order);
  const [localHidden, setLocalHidden] = useState<string[]>(hidden);

  useEffect(() => {
    if (open) { setLocalOrder(order); setLocalHidden(hidden); }
  }, [open, order, hidden]);

  if (!open) return null;

  const move = (id: string, dir: -1 | 1) => {
    const idx = localOrder.indexOf(id);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= localOrder.length) return;
    const copy = [...localOrder];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    setLocalOrder(copy);
    haptics.fire('SELECT');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl p-5 pb-8"
          style={{ background: 'var(--card-bg)' }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label={lang === 'th' ? 'ปรับแต่งหน้าหลัก' : 'Customize dashboard'}
        >
          <h3 className="text-[16px] font-bold mb-1"
            style={{ color: 'var(--text-primary)', fontFamily: getFont(lang) }}>
            {lang === 'th' ? 'ปรับแต่งหน้าหลัก' : 'Customize Dashboard'}
          </h3>
          <p className="text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>
            {lang === 'th' ? 'เลือกเซกชันที่แสดงและลำดับ' : 'Choose which sections to show and their order'}
          </p>

          <div className="space-y-2 mb-5">
            {localOrder.map((id, i) => {
              const meta = DASH_SECTIONS.find((s) => s.id === id)!;
              const isHidden = localHidden.includes(id);
              return (
                <div key={id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: 'var(--bg-surface, rgba(128,128,128,0.06))', opacity: isHidden ? 0.45 : 1 }}>
                  <button
                    onClick={() => {
                      setLocalHidden(isHidden ? localHidden.filter((x) => x !== id) : [...localHidden, id]);
                      haptics.fire('SELECT');
                    }}
                    className="flex items-center gap-2.5 flex-1 min-h-[36px]"
                  >
                    <span className="w-9 h-5 rounded-full relative transition-all shrink-0"
                      style={{ backgroundColor: isHidden ? 'rgba(128,128,128,0.35)' : 'var(--brand-primary)' }}>
                      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                        style={{ left: isHidden ? 2 : 18 }} />
                    </span>
                    <span className="text-[13px] font-medium text-left"
                      style={{ color: 'var(--text-primary)', fontFamily: getFont(lang) }}>
                      {lang === 'th' ? meta.labelTh : meta.labelEn}
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(id, -1)} disabled={i === 0}
                      className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center disabled:opacity-25"
                      aria-label="Move up">
                      <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                    <button onClick={() => move(id, 1)} disabled={i === localOrder.length - 1}
                      className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center disabled:opacity-25"
                      aria-label="Move down">
                      <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-[14px] font-semibold min-h-[48px]"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontFamily: getFont(lang) }}>
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button
              onClick={() => { haptics.fire('CRISP_CLICK'); onApply(localOrder, localHidden); }}
              className="flex-1 py-3 rounded-xl text-[14px] font-bold min-h-[48px]"
              style={{ background: 'var(--brand-primary)', color: 'var(--brand-on-primary)', fontFamily: getFont(lang) }}
            >
              {lang === 'th' ? 'บันทึก' : 'Save'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function DashboardPage({
  profile, transactions, onNavigate, lang,
  notificationCount = 0, monthlyBudget: monthlyBudgetProp, onAddTransaction,
  isAuthenticated = false,
}: DashboardPageProps) {
  const [showAmounts, setShowAmounts] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [activeSubs, setActiveSubs] = useState<Subscription[]>([]);
  // ── Dashboard customization (#7) ──
  const [{ order: dashOrder, hidden: dashHidden }, setDashPrefs] = useState(loadDashPrefs);
  const [showCustomize, setShowCustomize] = useState(false);
  // ── Budget rings (#5) ──
  const [budgets, setBudgets] = useState<UserBudget[]>(loadBudgets);

  useEffect(() => {
    let cancelled = false;
    loadSubscriptions()
      .then((subs) => {
        if (!cancelled) setActiveSubs(subs.filter((s) => s.isActive));
      })
      .catch(() => {
        /* manual-first: empty state is fine */
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => subscribeBudgets(() => setBudgets(loadBudgets())), []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthTx = useMemo(() =>
    transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }), [transactions, currentMonth, currentYear]);

  const currentSpend = useMemo(() =>
    monthTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
    [monthTx]);

  // Effective budget: explicit prop wins; otherwise derive from budget store
  // (never fall back to an arbitrary hardcoded amount — P1-11)
  const monthlyBudget = useMemo(() => {
    if (monthlyBudgetProp && monthlyBudgetProp > 0) return monthlyBudgetProp;
    try {
      return loadBudgets().reduce((s, b) => s + (b.limit || 0), 0);
    } catch {
      return 0;
    }
  }, [monthlyBudgetProp]);

  const { score: healthScore, confidence, dataCompleteness, availableFactors } = computeHealthScore(
    transactions, monthlyBudget, profile.savings || 0, profile.balance || 0, !!isAuthenticated
  );
  const healthBreakdown = getHealthScoreBreakdown(
    transactions, monthlyBudget, profile.savings || 0, profile.balance || 0, !!isAuthenticated, lang
  );
  const topInsight = computeTopInsight(transactions, monthlyBudget, profile.savings || 0, healthScore, lang);

  const greeting = (() => {
    const h = new Date().getHours();
    if (lang === 'th') return h < 12 ? 'สวัสดีตอนเช้า' : h < 17 ? 'สวัสดี' : 'สวัสดีตอนเย็น';
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  const firstName = profile.name?.split(' ')[0] || (lang === 'th' ? 'มิ้นท์' : 'there');

  // Score color for progress bar
  const progressColor = healthScore >= 70 ? 'var(--brand-primary)'
    : healthScore >= 50 ? 'var(--warning)' : 'var(--error)';

  return (
    <div
      role="main"
      aria-label={lang === 'th' ? 'หน้าหลัก พัลส์เงิน' : 'Money Pulse Dashboard'}
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--bg-page)',
        overscrollBehavior: 'y contain',
        paddingBottom: `calc(84px + env(safe-area-inset-bottom, 16px))`,
      }}
    >
      {/* Skip link */}
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
        style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-on-primary)' }}
      >
        {lang === 'th' ? 'ข้ามไปเนื้อหาหลัก' : 'Skip to main content'}
      </a>

      <div id="main-content" className="px-4 pt-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6"
          style={{ paddingTop: 'env(safe-area-inset-top, 8px)' }}>
          <div>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.6875rem',
              color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              {greeting}
            </p>
            <h1 style={{
              fontFamily: getFont(lang), fontWeight: 700,
              fontSize: 'clamp(1.375rem, 5vw, 1.625rem)',
              color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              {firstName}
              <span style={{ color: 'var(--brand-primary)' }}> ·</span>
            </h1>
          </div>

          {/* Accessibility: aria-live for score label changes */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {lang === 'th'
              ? `คะแนนสุขภาพทางการเงิน: ${healthScore}`
              : `Financial health score: ${healthScore}`}
          </div>

          {/* Action buttons — Apple HIG: all touch targets ≥ 44x44px */}
          <div className="flex items-center gap-2">
            {/* Privacy toggle */}
            <button
              onClick={() => { haptics.fire('SELECT'); setShowAmounts(a => !a); }}
              className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-default)' }}
              aria-label={showAmounts ? (lang === 'th' ? 'ซ่อนจำนวนเงิน' : 'Hide amounts')
                : (lang === 'th' ? 'แสดงจำนวนเงิน' : 'Show amounts')}
            >
              {showAmounts
                ? <Eye className="w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
                : <Eye className="w-4.5 h-4.5" style={{ color: 'var(--brand-primary)' }} />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => { haptics.fire('SELECT'); onNavigate('notifications'); }}
              className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1 relative"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-default)' }}
              aria-label={lang === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
            >
              <Bell className="w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-on-primary)' }}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => { haptics.fire('SELECT'); onNavigate('settings'); }}
              className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-default)' }}
              aria-label={lang === 'th' ? 'การตั้งค่า' : 'Settings'}
            >
              <Settings className="w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
            </button>

            {/* Customize dashboard (#7) */}
            <button
              onClick={() => { haptics.fire('SELECT'); setShowCustomize(true); }}
              className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-default)' }}
              aria-label={lang === 'th' ? 'ปรับแต่งหน้าหลัก' : 'Customize dashboard'}
            >
              <SlidersHorizontal className="w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* ── Section 0: Net Worth Hero (Rocket Money pattern) ── */}
        <NetWorthHero
          portfolioValue={profile.portfolioValue ?? 0}
          balance={profile.balance || 0}
          lang={lang}
          showAmounts={showAmounts}
        />

        {/* ── Section 1: Health Score Row ── */}
        <div className="rounded-2xl p-5 mb-3 flex items-center gap-5"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <HealthRing
            score={healthScore}
            confidence={confidence}
            lang={lang}
            onShowBreakdown={() => setShowScoreBreakdown(true)}
          />

          <div className="w-px self-stretch flex-shrink-0"
            style={{ backgroundColor: 'var(--border-default)' }} />

          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem',
              color: 'var(--text-muted)', letterSpacing: '0.06em',
              textTransform: 'uppercase', marginBottom: 4 }}>
              {lang === 'th' ? 'ใช้ไปเดือนนี้' : 'This Month'}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700,
              fontSize: 'clamp(1.5rem, 6vw, 1.875rem)',
              color: 'var(--text-primary)', letterSpacing: '-0.03em',
              lineHeight: 1, marginBottom: 6,
            }}>
              {showAmounts ? fmt(currentSpend, lang) : '••••'}
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--border-default)', maxWidth: 120 }}>
                <div className="h-full rounded-full"
                  style={{
                    width: `${Math.min((currentSpend / monthlyBudget) * 100, 100)}%`,
                    backgroundColor: progressColor,
                    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                  }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                {Math.round((currentSpend / monthlyBudget) * 100)}%
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: 2 }}>
              {lang === 'th' ? 'วันเงิน' : 'Payday'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.25rem',
              color: 'var(--brand-primary)' }}>
              {(() => {
                const today = new Date();
                const cur = today.getDate();
                const payday = profile.paydayDay || 1;
                return payday > cur ? payday - cur
                  : new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - cur + payday;
              })()}
            </p>
            <p style={{ fontFamily: getFont(lang), fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
              {lang === 'th' ? 'วัน' : 'days'}
            </p>
          </div>
        </div>

        {/* ── Activation checklist (RM-style win moment; auto-hides when done/dismissed) ── */}
        <ActivationChecklist
          hasSubs={activeSubs.length > 0}
          hasTxs={transactions.length > 0}
          hasBudgets={budgets.some((b) => b.limit > 0)}
          lang={lang}
          onNavigate={(tab) => onNavigate(tab)}
        />

        {/* ── Dynamic sections (#7): order/visibility from Customize sheet ── */}
        {dashOrder.filter((sectionId) => !dashHidden.includes(sectionId)).map((sectionId) => {
          switch (sectionId) {
            case 'safe':
              return (
                <div key={sectionId} className="mb-3">
                  <SafeToSpendCard
                    balance={profile.balance}
                    paydayDay={profile.paydayDay ?? null}
                    subs={activeSubs.map((s) => ({ id: s.id, name: s.name, amount: s.amount, dueDate: s.dueDate }))}
                    lang={lang}
                    showAmounts={showAmounts}
                    onSeeBills={() => { haptics.fire('SELECT'); onNavigate('subscriptions'); }}
                  />
                </div>
              );
            case 'upcoming':
              return (
                <div key={sectionId} className="mb-3">
                  {/* Upcoming Bills (Rocket Money pattern) */}
                  <UpcomingBills
                    subs={activeSubs}
                    lang={lang}
                    showAmounts={showAmounts}
                    onSeeAll={() => onNavigate('subscriptions')}
                  />
                </div>
              );
            case 'rings':
              return (
                <div key={sectionId} className="mb-3">
                  <BudgetRings
                    transactions={transactions}
                    budgets={budgets}
                    lang={lang}
                    showAmounts={showAmounts}
                    onSeeAll={() => onNavigate('budget')}
                  />
                </div>
              );
            case 'insight':
              return (
                <div key={sectionId} className="mb-3">
                  <SmartInsightCard insight={topInsight} lang={lang}
                    onAction={() => {
                      haptics.fire('SELECT');
                      // Wire insight card CTA to meaningful destination
                      const action = topInsight.action || '';
                      if (action.includes('Review') || action.includes('ดูรายละเอียด')) {
                        onNavigate('activity');
                      } else if (action.includes('View budget') || action.includes('งบ')) {
                        onNavigate('budget');
                      } else if (action.includes('summary') || action.includes('สรุป') || action.includes('View')) {
                        onNavigate('insights');
                      } else if (action.includes('goal') || action.includes('เป้า')) {
                        onNavigate('simulation');
                      } else if (action.includes('Add') || action.includes('เพิ่ม')) {
                        // FAB handles add transaction; navigate to activity
                        onNavigate('activity');
                      } else {
                        // Default: go to activity
                        onNavigate('activity');
                      }
                    }}
                  />
                </div>
              );
            case 'stats':
              return (
                <div key={sectionId} className="mb-3">
                  <QuickStatsGrid
                    savings={profile.savings || 0}
                    goalProgress={40}
                    creditBalance={profile.creditCardBalance || 0}
                    payday={profile.paydayDay || 1}
                    portfolioValue={profile.portfolioValue ?? 0}
                    lang={lang}
                    showAmounts={showAmounts}
                  />
                </div>
              );
            case 'recent':
              return (
                <div key={sectionId} className="mb-3">
                  <RecentMoves transactions={transactions} lang={lang}
                    showAmounts={showAmounts}
                    onToggle={() => { haptics.fire('SELECT'); setShowAmounts(a => !a); }}
                    onViewAll={() => onNavigate('activity')}
                  />
                </div>
              );
            case 'actions':
              return (
                <div key={sectionId} className="mb-3">
                  {/* Quick Actions — Apple HIG: ≥ 44x44px */}
                  <p style={{ fontFamily: getFont(lang), fontSize: '0.625rem', color: 'var(--text-muted)',
                    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                    {lang === 'th' ? 'ทางลัด' : 'Quick Actions'}
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: lang === 'th' ? 'รายจ่ายประจำ' : 'Recurring', icon: <CreditCard className="w-4 h-4" />,
                        color: 'var(--brand-primary)', onClick: () => onNavigate('subscriptions') },
                      { label: lang === 'th' ? 'ตั้งเป้า' : 'Set goal', icon: <Target className="w-4 h-4" />,
                        color: 'var(--info)', onClick: () => onNavigate('simulation') },
                      { label: lang === 'th' ? 'สรุปรายเดือน' : 'Summary', icon: <CalendarDays className="w-4 h-4" />,
                        color: 'var(--success)', onClick: () => onNavigate('insights') },
                    ].map((action) => (
                      <motion.button key={action.label}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { haptics.fire('SELECT'); action.onClick(); }}
                        className="flex-1 min-h-[48px] py-3 rounded-xl flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: 'var(--card-bg)',
                          border: '1px solid var(--border-default)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <span style={{ color: action.color }}>{action.icon}</span>
                        <span style={{ fontFamily: getFont(lang), fontSize: '0.6875rem', fontWeight: 500,
                          color: 'var(--text-secondary)' }}>
                          {action.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}

        <div style={{ height: 8 }} />
      </div>

      <FAB lang={lang} onClick={() => {
        haptics.fire('SELECT');
        onNavigate('activity');
      }} />

      <AnimatePresence>
        {showScoreBreakdown && (
          <HealthScoreBreakdownSheet
            breakdown={healthBreakdown}
            confidence={confidence}
            score={healthScore}
            lang={lang}
            onClose={() => setShowScoreBreakdown(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCustomize && (
          <DashCustomizeSheet
            open={showCustomize}
            order={dashOrder}
            hidden={dashHidden}
            onApply={(order, hidden) => {
              setDashPrefs({ order, hidden });
              saveDashPrefs({ order, hidden });
              setShowCustomize(false);
            }}
            onClose={() => setShowCustomize(false)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
