// Lightweight mock billing service for local/dev use
export type PlanId = 'pro' | 'elite';

export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'cancelled' | 'past_due';

export interface PlanPrice {
  monthly: number;      // USD cents (e.g., 799 = $7.99)
  annual: number;      // USD cents (e.g., 7999 = $79.99)
  currency: string;
}

export interface SubscriptionInfo {
  plan: PlanId | null;
  status: SubscriptionStatus;
  trialEndsAt: string | null; // ISO date string
  currentPeriodEndsAt: string | null; // ISO date string
  autoRenew: boolean;
  monthlyPriceCents?: number; // chosen pay-what-you-want price
}

// ─── Plan prices (single source of truth) ─────────────────────────────────────
export const PLAN_PRICES: Record<PlanId, PlanPrice> = {
  pro:   { monthly: 799,  annual: 7999,  currency: 'USD' },
  elite: { monthly: 2199, annual: 21999, currency: 'USD' },
};

// ─── Rocket Money style "pay what you think is fair" ────────────────────────
// Single Premium tier; user picks their own price within the band.
export const PREMIUM_MIN_CENTS = 700;   // $7/mo floor (RM model)
export const PREMIUM_MAX_CENTS = 1400;  // $14/mo ceiling (all features equal)
export const PREMIUM_DEFAULT_CENTS = 999;

export const clampPremiumCents = (cents: number): number =>
  Math.min(PREMIUM_MAX_CENTS, Math.max(PREMIUM_MIN_CENTS, Math.round(cents)));

export const DEFAULT_TRIAL_DAYS = 7;

/** Format cents → display string, e.g. 799 → "$7.99" */
export const formatPrice = (cents: number, currency = 'USD'): string => {
  if (currency === 'USD') {
    return `$${(cents / 100).toFixed(2)}`;
  }
  return `${cents} ${currency}`;
};

export const getPlanPrice = (plan: PlanId, period: 'monthly' | 'annual' = 'monthly'): string => {
  const p = PLAN_PRICES[plan];
  return formatPrice(p[period], p.currency);
};

export const getTrialDaysRemaining = (trialEndsAt: string | null): number => {
  if (!trialEndsAt) return 0;
  const msLeft = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
};

// ─── Mock subscription state (replace with real API in production) ─────────────
let _mockSubscription: SubscriptionInfo = {
  plan: null,
  status: 'none',
  trialEndsAt: null,
  currentPeriodEndsAt: null,
  autoRenew: true,
};

export const billingService = {
  async createSubscription(plan: PlanId, opts?: { trialDays?: number; monthlyPriceCents?: number }) {
    const trialDays = opts?.trialDays ?? DEFAULT_TRIAL_DAYS;
    const monthlyPriceCents = clampPremiumCents(opts?.monthlyPriceCents ?? PREMIUM_DEFAULT_CENTS);
    // Simulate async network call
    await new Promise((r) => setTimeout(r, 700));
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
    _mockSubscription = {
      plan,
      status: 'trial',
      trialEndsAt,
      currentPeriodEndsAt: trialEndsAt,
      autoRenew: true,
      monthlyPriceCents,
    };
    return {
      success: true,
      subscriptionId: `sub_${Date.now()}_${plan}`,
      message: `Activated ${plan} at ${formatPrice(monthlyPriceCents)}/mo with ${trialDays}-day trial (mock)`,
    } as CreateSubscriptionResult;
  },

  getSubscriptionInfo(): SubscriptionInfo {
    return { ..._mockSubscription };
  },

  async cancelSubscription(): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 300));
    _mockSubscription = {
      ..._mockSubscription,
      autoRenew: false,
      status: _mockSubscription.status === 'trial' ? 'cancelled' : _mockSubscription.status,
    };
    return { success: true };
  },
};

export interface CreateSubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  message?: string;
}

export default billingService;
