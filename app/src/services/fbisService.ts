/**
 * fbisService.ts — Financial Behavior Improvement Score
 * Reads from / writes to the public.fbis_meta table.
 */
import { supabase } from '../supabaseClient';
import { FBIS_BASE } from '../core/fbis';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FBISMetaRecord {
  id: string;
  user_id: string;
  current_score: number;
  streak_days: number;
  last_recorded_at: string | null;
  xp_multiplier: number;
  updated_at: string;
}

// ─── Read ──────────────────────────────────────────────────────────────────

/** Fetch FBIS record for the current user. Returns null if none exists yet. */
export const getFBISMeta = async (): Promise<FBISMetaRecord | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('fbis_meta')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data as FBISMetaRecord | null;
  } catch {
    return null;
  }
};

/** Get or initialize FBIS record. Creates a baseline record if none exists. */
export const getOrInitFBIS = async (): Promise<FBISMetaRecord> => {
  const existing = await getFBISMeta();

  if (existing) return existing;

  // No record yet — create one with base values
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('fbis_meta')
      .insert({
        user_id: user.id,
        current_score: FBIS_BASE,
        streak_days: 0,
        xp_multiplier: 1.0,
        last_recorded_at: null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as FBISMetaRecord;
  } catch {
    // Fallback: return base values even if DB insert fails
    return {
      id: 'local',
      user_id: 'local',
      current_score: FBIS_BASE,
      streak_days: 0,
      last_recorded_at: null,
      xp_multiplier: 1.0,
      updated_at: new Date().toISOString(),
    };
  }
};

// ─── Write ──────────────────────────────────────────────────────────────────

/**
 * Upsert a complete FBIS state to the database.
 * Call this after any score-changing action (positive/negative XP).
 */
export const upsertFBIS = async (record: Partial<FBISMetaRecord>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('fbis_meta')
      .upsert({
        user_id: user.id,
        ...record,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
};

/**
 * Add positive XP for a specific action.
 * Returns the new score after applying the current multiplier.
 */
export const addPositiveXP = async (
  action: 'streak_bonus' | 'budget_goal_met' | 'savings_milestone'
): Promise<number> => {
  const meta = await getOrInitFBIS();
  const xpMap = { streak_bonus: 20, budget_goal_met: 50, savings_milestone: 100 };
  const xp = xpMap[action];
  const multiplied = Math.round(xp * meta.xp_multiplier);
  const newScore = Math.min(9999, meta.current_score + multiplied);
  await upsertFBIS({ current_score: newScore });
  return newScore;
};

/**
 * Deduct XP for a negative action.
 */
export const deductNegativeXP = async (
  action: 'budget_drift'
): Promise<number> => {
  const meta = await getOrInitFBIS();
  const xp = 10; // hardcoded per Constitution
  const newScore = Math.max(0, meta.current_score - xp);
  await upsertFBIS({ current_score: newScore });
  return newScore;
};

/**
 * Increment streak days. Also updates xp_multiplier based on streak.
 * Should be called once per day when user logs a transaction.
 */
export const recordStreakDay = async (): Promise<FBISMetaRecord> => {
  const meta = await getOrInitFBIS();

  const today = new Date().toISOString().split('T')[0];
  const lastDate = meta.last_recorded_at
    ? meta.last_recorded_at.split('T')[0]
    : null;

  let newStreak = meta.streak_days;

  if (lastDate === today) {
    // Already recorded today — no change
    return meta;
  } else if (lastDate === getYesterday()) {
    // Consecutive day — increment streak
    newStreak = meta.streak_days + 1;
  } else {
    // Streak broken or first entry — reset to 1
    newStreak = 1;
  }

  const newMultiplier = calcMultiplier(newStreak);
  const record: Partial<FBISMetaRecord> = {
    streak_days: newStreak,
    xp_multiplier: newMultiplier,
    last_recorded_at: new Date().toISOString(),
  };

  await upsertFBIS(record);

  return { ...meta, ...record, updated_at: new Date().toISOString() };
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const getYesterday = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const calcMultiplier = (streakDays: number): number => {
  if (streakDays < 3) return 1.0;
  if (streakDays < 7) return 1.1;
  if (streakDays < 14) return 1.2;
  if (streakDays < 30) return 1.5;
  if (streakDays < 60) return 1.8;
  return 2.0;
};
