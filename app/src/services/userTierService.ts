/**
 * userTierService.ts
 * Manages subscription tier, profile reads/writes against the correct tables.
 * IMPORTANT: subscription_tier lives in `users` table (constitution_schema).
 * The `profiles` table does not exist — never use `.from('profiles')`.
 */
import { supabase } from '../supabaseClient';

export type SubscriptionTier = 'basic' | 'pro' | 'elite';

export interface UserTierInfo {
  tier: SubscriptionTier;
  features: string[];
}

export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  basic: ['awareness', 'tracking', 'basic_budget'],
  pro: ['awareness', 'tracking', 'budget', 'emotional_tracker', 'weekly_story', 'ai_coach_basic', 'fbis'],
  elite: ['awareness', 'tracking', 'budget', 'emotional_tracker', 'weekly_story', 'ai_coach_full', 'fbis', 'alternative_assets', 'advanced_analytics', 'priority_support'],
};

/**
 * Shape returned when reading from the `users` table.
 */
// Backward compat alias
/** @deprecated use UserRecord */
export type UserProfileRecord = UserRecord;

export interface UserRecord {
  id: string;
  email: string;
  display_name: string | null;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch current user row from `users` table (constitution_schema).
 */
export const getUserProfile = async (): Promise<UserRecord | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as UserRecord;
  } catch {
    return null;
  }
};

/**
 * Get the user's subscription tier from `users.subscription_tier`.
 */
export const getUserTier = async (): Promise<SubscriptionTier> => {
  const profile = await getUserProfile();
  return (profile?.subscription_tier as SubscriptionTier) || 'basic';
};

/**
 * Check whether the current user can access a specific feature.
 */
export const canAccessFeature = async (feature: string): Promise<boolean> => {
  const tier = await getUserTier();
  return TIER_FEATURES[tier].includes(feature);
};

/**
 * Update the user's subscription tier in `users` table.
 */
export const updateUserTier = async (tier: SubscriptionTier): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('users')
      .update({ subscription_tier: tier })
      .eq('id', user.id);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
};

// ��� Static helpers ��������������������������������������������������������

export const getTierInfo = (tier: SubscriptionTier): UserTierInfo => ({
  tier,
  features: TIER_FEATURES[tier],
});

export const getTierDisplayName = (tier: SubscriptionTier): string => ({
  basic: 'BASIC', pro: 'PRO', elite: 'ELITE',
}[tier]);

export const getTierPrice = (tier: SubscriptionTier): string => ({
  basic: 'Free', pro: '99 THB/month', elite: '199 THB/month',
}[tier]);

export const getTierAnnualPrice = (tier: SubscriptionTier): number => ({
  basic: 0, pro: 990, elite: 1990,
}[tier]);


/**
 * Update the user's display_name in `users` table.
 */
export const updateUserDisplayName = async (displayName: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('users')
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
};
