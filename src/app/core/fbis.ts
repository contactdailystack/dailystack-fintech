/**
 * Financial Behavior Improvement Score (FBIS)
 * Based on Master Constitution SSOT v3.4 Section 8
 *
 * Base Score = 1000
 *
 * Positive Actions (+XP):
 * - ลด Impulse Spending ตามเป้าต่อสัปดาห์: +50 XP
 * - ทำการบันทึกต่อเนื่อง (Streak > 7 days): +20 XP/week
 * - บรรลุ Milestone การออมเงิน: +100 XP
 *
 * Negative Actions:
 * - ใช้งบประมาณรายวันเกิน (Budget Drift): -10 XP
 * - Emotional Spending สูงกว่าค่าเฉลี่ย: AI Warning (no XP deduction)
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
  const xpMap = {
    budget_drift: -10,
  };
  return deductXP(state, Math.abs(xpMap[action]));
};

export const getLevelFromScore = (score: number): number => {
  return Math.floor(score / 1000) + 1;
};

export const getScoreToNextLevel = (score: number): number => {
  const nextLevelScore = getLevelFromScore(score) * 1000;
  return nextLevelScore - score;
};

export const getAICOachRecommendation = (
  persona: 'strict' | 'supportive' | 'analytical',
  fbisState: FBISState
): string => {
  const score = fbisState.currentScore;
  const level = getLevelFromScore(score);

  if (persona === 'strict') {
    if (fbisState.streakDays < 3) return 'วันนี้เริ่มบันทึกได้เลย — แค่ 3 วันติดต่อกันก็เริ่มเห็นผล';
    if (score < 1000) return `วันนี้คะแนนอยู่ที่ ${score} — เริ่มต้นวันนี้เพื่อกลับสู่เส้นทาง`;
    return `Level ${level} — อีก ${getScoreToNextLevel(score)} XP จะถึง Level ${level + 1}`;
  }

  if (persona === 'supportive') {
    if (fbisState.streakDays < 3) return 'เริ่มต้นวันนี้ง่ายๆ แค่บันทึกรายจ่ายหนึ่งรายการ — ทำได้แน่นอน!';
    if (score < 1000) return `วันนี้คะแนน ${score} — มาว่ามาปรับพฤติกรรมด้วยกันนะ`;
    return `ยอดเยี่ยม! Level ${level}แล้ว — อีก ${getScoreToNextLevel(score)} XP จะถึง Level ${level + 1}`;
  }

  if (score < 1000) {
    const deficit = 1000 - score;
    return `ในสัปดาห์นี้ ${score} XP — ต้องได้อีก ${deficit} XP เพื่อกลับสู่ระดับพื้นฐาน`;
  }
  return `Level ${level}, ${score - ((level - 1) * 1000)}/1000 XP. ${fbisState.streakDays} วันติดต่อกัน (${fbisState.xpMultiplier}x multiplier)`;
};
