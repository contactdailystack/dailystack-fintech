/**
 * DailyStack — subscriptionService.ts
 * CRUD operations for public.subscriptions table
 * MVP: load/add/update/delete subscriptions per user
 */

import { supabase } from '../supabaseClient';
import { SubscriptionInputSchema, SubscriptionWithIdSchema, safeParse } from '../lib/validation';

// ─── Local Types (mirror of SubscriptionTrackerPage) ─────────────────────────
export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  category: string;
  billingCycle: BillingCycle;
  color?: string;
  icon?: string;
  isActive: boolean;
  /** ISO date of the last confirmed payment. Stored in DB `notes` column
   *  (no dedicated column yet — see migration backlog). Written by Mark-as-Paid. */
  lastPaidDate?: string;
  /** ISO date the subscription row was created — used for ghost heuristics */
  createdAt?: string;
  paidDates?: number[];
  skipDates?: number[];
  priceChange?: number;
  isGhost?: boolean;
  /** Free-trial tracking (#3): ISO date when the trial converts to paid */
  trialEndDate?: string;
}

// ─── DB ↔ Local Type Mappers ─────────────────────────────────────────────────

/** Map DB row → local Subscription type */
function dbRowToSubscription(row: DBSubscriptionRow): Subscription {
  const dueDate = row.next_billing_date
    ? new Date(row.next_billing_date).getDate()
    : 1;
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.cost),         // DB: cost → local: amount
    dueDate,
    category: row.category,
    billingCycle: row.billing_cycle,   // DB: billing_cycle → local: billingCycle
    isActive: row.is_active,           // DB: is_active → local: isActive
    lastPaidDate: row.notes || undefined,
    createdAt: row.created_at || undefined,
    trialEndDate: row.trial_end_date || undefined,
  };
}

/** Map local Subscription → DB insert shape */
function subscriptionToDbRow(sub: Omit<Subscription, 'id'>): Partial<DBSubscriptionRow> {
  const now = new Date();
  const nextBilling = new Date(now.getFullYear(), now.getMonth(), sub.dueDate);
  // If dueDate is in the past this month, push to next month
  if (nextBilling < now) {
    nextBilling.setMonth(nextBilling.getMonth() + 1);
  }
  return {
    name: sub.name,
    cost: sub.amount,
    billing_cycle: sub.billingCycle,
    category: sub.category,
    next_billing_date: nextBilling.toISOString().split('T')[0],
    is_active: sub.isActive,
    notes: sub.lastPaidDate || null,
    trial_end_date: sub.trialEndDate || null,
  };
}

// ─── DB Row Type ──────────────────────────────────────────────────────────────
interface DBSubscriptionRow {
  id: string;
  user_id: string;
  name: string;
  cost: number;
  billing_cycle: BillingCycle;
  category: string;
  next_billing_date: string | null;
  is_active: boolean;
  notes: string | null;
  trial_end_date: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Price History / Hike Detection ──────────────────────────────────────────

interface DBPriceHistoryRow {
  subscription_id: string;
  old_cost: number | null;
  new_cost: number;
  change_pct: number | null;
}

/**
 * Load the most recent price change per subscription.
 * Returns a map of subscription_id → hike percentage (increases only).
 */
async function loadPriceHikes(subscriptionIds: string[]): Promise<Map<string, number>> {
  const hikes = new Map<string, number>();
  if (subscriptionIds.length === 0) return hikes;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return hikes;

    const { data, error } = await supabase
      .from('subscription_price_history')
      .select('subscription_id, old_cost, new_cost, change_pct')
      .eq('user_id', user.id)
      .in('subscription_id', subscriptionIds)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('[subService] Price history error:', error);
      return hikes;
    }

    for (const row of data as DBPriceHistoryRow[]) {
      // First hit per subscription = most recent change (rows sorted desc)
      if (!hikes.has(row.subscription_id)
        && row.old_cost !== null
        && Number(row.new_cost) > Number(row.old_cost)
        && row.change_pct !== null) {
        hikes.set(row.subscription_id, Math.abs(Number(row.change_pct)));
      }
    }
  } catch (e) {
    console.error('[subService] Price history exception:', e);
  }
  return hikes;
}

// ─── CRUD Operations ──────────────────────────────────────────────────────────

/**
 * Load all subscriptions for the authenticated user.
 * Falls back to [] if no auth (demo mode).
 */
export async function loadSubscriptions(): Promise<Subscription[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('next_billing_date', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('[subService] Load error:', error);
      return [];
    }
    const subs = (data as DBSubscriptionRow[]).map(dbRowToSubscription);
    const hikes = await loadPriceHikes(subs.map(s => s.id));
    return subs.map(s => {
      const hike = hikes.get(s.id);
      return hike !== undefined ? { ...s, priceChange: hike } : s;
    });
  } catch (e) {
    console.error('[subService] Load exception:', e);
    return [];
  }
}

/**
 * Add a new subscription for the authenticated user.
 */
export async function addSubscription(sub: Omit<Subscription, 'id'>): Promise<Subscription | null> {
  try {
    const validation = safeParse(SubscriptionInputSchema, sub);
    if (!validation.success) {
      console.error('[subService] Add validation failed:', validation.errors);
      return null;
    }
    const valid = validation.data;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const row = subscriptionToDbRow(valid);
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ ...row, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('[subService] Add error:', error);
      return null;
    }
    return dbRowToSubscription(data as DBSubscriptionRow);
  } catch (e) {
    console.error('[subService] Add exception:', e);
    return null;
  }
}

/**
 * Update an existing subscription.
 */
export async function updateSubscription(sub: Subscription): Promise<Subscription | null> {
  try {
    const validation = safeParse(SubscriptionWithIdSchema, sub);
    if (!validation.success) {
      console.error('[subService] Update validation failed:', validation.errors);
      return null;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const row = subscriptionToDbRow(validation.data);
    const { data, error } = await supabase
      .from('subscriptions')
      .update(row)
      .eq('id', sub.id)
      .eq('user_id', user.id) // Security: ensure ownership
      .select()
      .single();

    if (error) {
      console.error('[subService] Update error:', error);
      return null;
    }
    return dbRowToSubscription(data as DBSubscriptionRow);
  } catch (e) {
    console.error('[subService] Update exception:', e);
    return null;
  }
}

/**
 * Delete a subscription by ID.
 */
export async function deleteSubscription(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Security: ensure ownership

    if (error) {
      console.error('[subService] Delete error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[subService] Delete exception:', e);
    return false;
  }
}

/**
 * Toggle active status (pause/unpause).
 */
export async function toggleSubscriptionActive(id: string, isActive: boolean): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[subService] Toggle active error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[subService] Toggle active exception:', e);
    return false;
  }
}

/**
 * Get subscription summary (for dashboard cards).
 */
export async function getSubscriptionSummary(): Promise<{
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  totalCount: number;
} | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('subscription_summary')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      // Fallback: compute from raw subscriptions
      const subs = await loadSubscriptions();
      const active = subs.filter(s => s.isActive);
      const totalMonthly = active.reduce((sum, s) => sum + s.amount, 0);
      return {
        totalMonthly,
        totalYearly: totalMonthly * 12,
        activeCount: active.length,
        totalCount: subs.length,
      };
    }

    return {
      totalMonthly: Number(data.total_monthly_cost) || 0,
      totalYearly: Number(data.total_annual_cost) || 0,
      activeCount: Number(data.active_count) || 0,
      totalCount: Number(data.total_count) || 0,
    };
  } catch (e) {
    console.error('[subService] Summary error:', e);
    return null;
  }
}
