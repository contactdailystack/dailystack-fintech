/**
 * DailyStack — Learning Streak Service
 * Daily 5-minute learning micro-habit tracker
 */
import { supabase } from '../app/services/supabaseClient';

export interface LearningStreak {
  id?: string;
  user_id: string;
  date: string;
  minutes_learned: number;
  activity?: string;
  completed?: boolean;
  created_at?: string;
}

export const LearningService = {
  /** Mark today as completed with minutes learned */
  async logDay(minutesLearned: number, activity?: string): Promise<LearningStreak | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    const totalMinutes = Math.max(0, Math.min(480, minutesLearned));

    const { data, error } = await supabase
      .from('learning_streaks')
      .upsert(
        {
          user_id: user.id,
          date: today,
          minutes_learned: totalMinutes,
          activity: activity || null,
          completed: totalMinutes >= 5,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) { console.error('LearningService.logDay error:', error); return null; }
    return data;
  },

  /** Get streak records (default last 90 days) */
  async getStreaks(days = 90): Promise<LearningStreak[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('learning_streaks')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .order('date', { ascending: false });

    if (error) { console.error('LearningService.getStreaks error:', error); return []; }
    return data || [];
  },

  /** Get today's record */
  async getToday(): Promise<LearningStreak | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('learning_streaks')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('LearningService.getToday error:', error);
    }
    return data || null;
  },

  /** Calculate active streak (consecutive days with completed = true) */
  async getActiveStreak(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('learning_streaks')
      .select('date, completed')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('date', { ascending: false });

    if (error) { console.error('LearningService.getActiveStreak error:', error); return 0; }

    const byDate: Set<string> = new Set((data || []).map(r => r.date));
    let streak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Check if today has a completed entry
    if (!byDate.has(todayStr)) {
      // If today is not logged, check if yesterday is
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (!byDate.has(yesterdayStr)) return 0;
    }

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (!byDate.has(dateStr)) break;
      streak++;
    }
    return streak;
  },

  /** Get total minutes learned ever */
  async getTotalMinutes(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('learning_streaks')
      .select('minutes_learned')
      .eq('user_id', user.id);

    if (error) { console.error('LearningService.getTotalMinutes error:', error); return 0; }
    return (data || []).reduce((sum, r) => sum + (r.minutes_learned || 0), 0);
  },

  /** Get weekly summary */
  async getWeeklySummary(): Promise<{ day: string; minutes: number; completed: boolean }[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('learning_streaks')
      .select('date, minutes_learned, completed')
      .eq('user_id', user.id)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('date', { ascending: true });

    if (error) { console.error('LearningService.getWeeklySummary error:', error); return []; }

    const result: { day: string; minutes: number; completed: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayStr = d.toISOString().split('T')[0];
      const found = (data || []).find(r => r.date === dayStr);
      result.push({
        day: dayStr,
        minutes: found?.minutes_learned || 0,
        completed: found?.completed || false,
      });
    }
    return result;
  },

  /** Delete a streak entry */
  async deleteEntry(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('learning_streaks')
      .delete()
      .eq('id', id);
    return !error;
  },
};
