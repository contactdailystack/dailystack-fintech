/**
 * Financial Behavior Improvement Score (FBIS)
 * Based on Master Constitution SSOT v3.4 Section 8
 */

export interface FBISState {
  currentScore: number;
  streakDays: number;
  lastRecordedAt: Date | null;
  xpMultiplier: number;
}

export const FBIS_BASE = 1000;

export const calculateStreakMultiplier = (streakDays: number): number => {
  if (streakDays < 3) return 1.0;
  if (streakDays < 7) return 1.1;
  if (streakDays < 14) return 1.2;
  if (streakDays < 30) return 1.5;
  if (streakDays < 60) return 1.8;
  return 2.0;
};

export const addXP = (state: FBISState, amount: number): number => {
  const multiplied = Math.round(amount * state.xpMultiplier);
  return Math.min(9999, state.currentScore + multiplied);
};

export const deductXP = (state: FBISState, amount: number): number => {
  return Math.max(0, state.currentScore - amount);
};

export const recordPositiveAction = (
  state: FBISState,
  action: 'streak_bonus' | 'budget_goal_met' | 'savings_milestone'
): number => {
  const xpMap = {
    streak_bonus: 20,
    budget_goal_met: 50,
    savings_milestone: 100,
  };
  return addXP(state, xpMap[action]);
};

export const recordNegativeAction = (
  state: FBISState,
  action: 'budget_drift'
): number => {
  const xpMap = { budget_drift: -10 };
  return deductXP(state, Math.abs(xpMap[action]));
};

export const getLevelFromScore = (score: number): number => {
  return Math.floor(score / 1000) + 1;
};

export const getScoreToNextLevel = (score: number): number => {
  return (getLevelFromScore(score)) * 1000 - score;
};

export const getAICOachRecommendation = (
  persona: 'strict' | 'supportive' | 'analytical',
  fbisState: FBISState
): string => {
  const score = fbisState.currentScore;
  const level = getLevelFromScore(score);
  const toNext = getScoreToNextLevel(score);

  if (persona === 'strict') {
    if (fbisState.streakDays < 3) return 'You need to record at least 3 days consistently. Start today.';
    if (score < 1000) return `Your score is ${score}. Below baseline. You need to take action now.`;
    return `Level ${level}. ${toNext} XP to next level. Keep the momentum.`;
  }

  if (persona === 'supportive') {
    if (fbisState.streakDays < 3) return 'Starting is the hardest part. Just one entry today — you can do it.';
    if (score < 1000) return `You're at ${score} right now. Let us work together to get you back on track.`;
    return `Amazing — you're at Level ${level}! Just ${toNext} XP more to level up.`;
  }

  if (score < 1000) {
    const deficit = 1000 - score;
    return `Current score: ${score}. ${deficit} XP below baseline. Average daily gain needed: ${Math.round(deficit / 30)} XP/day to reach baseline in 30 days.`;
  }
  return `Level ${level}, ${score - ((level-1)*1000)}/1000 XP. Streak: ${fbisState.streakDays} days (${fbisState.xpMultiplier}x multiplier active).`;
};