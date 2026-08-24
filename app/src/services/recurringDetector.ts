/**
 * recurringDetector.ts — RM parity #1
 * Scans recorded transactions for repeating-charge patterns and suggests
 * subscriptions the user may have forgotten to add.
 * (RM does this over bank-sync data; ours works over manual + CSV entries.)
 */
import type { BillingCycle, Subscription } from './subscriptionService';

export interface SubSuggestion {
  /** Display name (original merchant spelling) */
  merchant: string;
  /** Median amount per charge (positive) */
  amount: number;
  cycle: BillingCycle;
  /** How many matching charges were found */
  occurrences: number;
  /** ISO date of the most recent charge */
  lastDate: string;
  /** Suggested due day-of-month (from projected next charge) */
  nextDueDay: number;
}

const DAY_MS = 86400000;

/** Normalized key for grouping/deduping merchant names */
export function normalizeMerchant(name: string): string {
  return (name || '').trim().toLowerCase();
}

/** True when an existing subscription already covers this merchant name */
function matchesExisting(merchant: string, subs: Subscription[]): boolean {
  const m = normalizeMerchant(merchant);
  return subs.some((s) => {
    const n = normalizeMerchant(s.name);
    return n.length > 2 && (m.includes(n) || n.includes(m));
  });
}

/** Median of a numeric list (rounded to whole baht for display sanity) */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return Math.round(sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
}

interface CycleGuess {
  cycle: BillingCycle | null;
  intervalDays: number;
}

/** Classify the average interval into weekly / monthly / yearly windows */
function guessCycle(intervals: number[]): CycleGuess {
  const avg = intervals.reduce((s, i) => s + i, 0) / intervals.length;
  if (avg >= 6 && avg <= 9) return { cycle: 'weekly', intervalDays: 7 };
  if (avg >= 25 && avg <= 35) return { cycle: 'monthly', intervalDays: 30 };
  if (avg >= 350 && avg <= 380) return { cycle: 'yearly', intervalDays: 365 };
  return { cycle: null, intervalDays: avg };
}

/**
 * Detect candidate subscriptions from expense transactions.
 *
 * Rules:
 *  - ≥2 charges at the same normalized merchant
 *  - consistent amounts (max/min within 25%)
 *  - regular interval in one of the known billing windows
 *  - not already tracked as an active subscription
 *
 * Results are ranked by annual cost impact and capped.
 */
export function detectSubscriptionSuggestions(
  transactions: { id: string; merchant: string; amount: number; date: string }[],
  existingSubs: Subscription[],
  limit = 5,
): SubSuggestion[] {
  // Group expenses by normalized merchant
  const groups = new Map<string, { name: string; amount: number; ts: number }[]>();
  for (const tx of transactions) {
    if (tx.amount >= 0) continue; // income only
    const name = (tx.merchant || '').trim();
    if (!name) continue;
    const key = normalizeMerchant(name);
    const list = groups.get(key) || [];
    list.push({ name, amount: Math.abs(tx.amount), ts: new Date(tx.date).getTime() });
    groups.set(key, list);
  }

  const suggestions: (SubSuggestion & { annualImpact: number })[] = [];

  groups.forEach((charges, key) => {
    if (matchesExisting(key, existingSubs)) return;
    if (charges.length < 2) return;

    const sorted = [...charges].sort((a, b) => a.ts - b.ts);
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((sorted[i].ts - sorted[i - 1].ts) / DAY_MS);
    }

    const { cycle } = guessCycle(intervals);
    if (!cycle) return;

    // Amount consistency: max/min within 25%
    const amounts = sorted.map((c) => c.amount);
    if (Math.max(...amounts) / Math.min(...amounts) > 1.25) return;

    const amount = median(amounts);
    const last = sorted[sorted.length - 1];
    // Project the next charge to pick a sensible due day-of-month
    const nextTs = last.ts + (guessCycle(intervals).intervalDays || 30) * DAY_MS;
    const nextDueDay = Math.min(31, Math.max(1, new Date(nextTs).getDate()));

    const annualImpact =
      amount * (cycle === 'weekly' ? 52 : cycle === 'monthly' ? 12 : 1);

    suggestions.push({
      merchant: last.name,
      amount,
      cycle,
      occurrences: charges.length,
      lastDate: new Date(last.ts).toISOString(),
      nextDueDay,
      annualImpact,
    });
  });

  return suggestions
    .sort((a, b) => b.annualImpact - a.annualImpact)
    .slice(0, limit)
    .map(({ annualImpact, ...rest }) => rest);
}
