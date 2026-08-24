/**
 * safeToSpend.ts — Rocket-Money-style "Safe to Spend" computation.
 *
 * balance − recurring obligations (active subscriptions/bills) due before the
 * next payday. When no payday is configured, uses a rolling 30-day window.
 * One occurrence per subscription (the next due date inside the window).
 */

export interface SafeToSpendSub {
  id: string;
  name: string;
  amount: number;
  /** Day of month the charge lands on */
  dueDate: number;
}

export interface SafeToSpendInput {
  balance: number;
  /** Day of month the user gets paid; null/undefined → 30-day window */
  paydayDay?: number | null;
  subs: SafeToSpendSub[];
}

export interface SafeToSpendObligation {
  name: string;
  amount: number;
  dueInDays: number;
}

export interface SafeToSpendResult {
  /** balance − totalObligations (can be negative = over-committed) */
  amount: number;
  windowDays: number;
  usesPayday: boolean;
  obligations: SafeToSpendObligation[];
  totalObligations: number;
}

const DEFAULT_WINDOW_DAYS = 30;

function daysUntilNextPayday(paydayDay: number): number {
  const today = new Date();
  const cur = today.getDate();
  const dim = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  if (paydayDay > cur) return paydayDay - cur;
  if (paydayDay === cur) return dim; // paid today → covers a full cycle
  return dim - cur + paydayDay;
}

export function computeSafeToSpend({ balance, paydayDay, subs }: SafeToSpendInput): SafeToSpendResult {
  const today = new Date();
  const cur = today.getDate();
  const dim = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const validPayday =
    typeof paydayDay === 'number' && Number.isFinite(paydayDay) && paydayDay >= 1 && paydayDay <= 31
      ? Math.floor(paydayDay)
      : null;
  const usesPayday = validPayday !== null;
  const windowDays = usesPayday ? daysUntilNextPayday(validPayday!) : DEFAULT_WINDOW_DAYS;

  const obligations: SafeToSpendObligation[] = [];
  let total = 0;
  for (const s of subs) {
    let dueIn = s.dueDate - cur;
    if (dueIn < 0) dueIn += dim;
    if (dueIn > windowDays) continue;
    obligations.push({ name: s.name, amount: s.amount, dueInDays: dueIn });
    total += s.amount;
  }
  obligations.sort((a, b) => a.dueInDays - b.dueInDays);

  return {
    amount: Math.round((balance - total) * 100) / 100,
    windowDays,
    usesPayday,
    obligations,
    totalObligations: Math.round(total * 100) / 100,
  };
}
