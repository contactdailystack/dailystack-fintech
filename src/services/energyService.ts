/**
 * DailyStack — Energy Logs Service
 * Daily energy level tracking (1-100 scale)
 */
import { supabase } from '../app/services/supabaseClient';

export interface EnergyLog {
  id?: string;
  user_id: string;
  energy_level: number;
  note?: string;
  logged_at: string;
  created_at?: string;
}

export interface EnergyTrend {
  date: string;
  avg_level: number;
  min_level: number;
  max_level: number;
  count: number;
}

export const EnergyService = {
  /** Log today's energy level */
  async logEnergy(level: number, note?: string): Promise<EnergyLog | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('energy_logs')
      .upsert(
        {
          user_id: user.id,
          energy_level: Math.max(1, Math.min(100, level)),
          note: note || null,
          logged_at: now,
          created_at: now,
        },
        { onConflict: 'user_id,logged_at' }
      )
      .select()
      .single();

    if (error) { console.error('EnergyService.logEnergy error:', error); return null; }
    return data;
  },

  /** Get logs for a date range (default last 30 days) */
  async getLogs(startDate?: string, endDate?: string): Promise<EnergyLog[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('energy_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', start)
      .lte('logged_at', end)
      .order('logged_at', { ascending: false });

    if (error) { console.error('EnergyService.getLogs error:', error); return []; }
    return data || [];
  },

  /** Get today's log */
  async getTodayLog(): Promise<EnergyLog | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('energy_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', today)
      .lt('logged_at', today + 'T23:59:59')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('EnergyService.getTodayLog error:', error);
    }
    return data || null;
  },

  /** Get weekly trend (avg per day for last 7 days) */
  async getWeeklyTrend(): Promise<EnergyTrend[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('energy_logs')
      .select('logged_at, energy_level')
      .eq('user_id', user.id)
      .gte('logged_at', start)
      .order('logged_at', { ascending: true });

    if (error) { console.error('EnergyService.getWeeklyTrend error:', error); return []; }

    // Group by date
    const byDate: Record<string, number[]> = {};
    for (const row of data || []) {
      const date = (row.logged_at as string).split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(row.energy_level);
    }

    return Object.entries(byDate).map(([date, levels]) => ({
      date,
      avg_level: Math.round(levels.reduce((a, b) => a + b, 0) / levels.length),
      min_level: Math.min(...levels),
      max_level: Math.max(...levels),
      count: levels.length,
    }));
  },

  /** Get streak: consecutive days with logs above threshold */
  async getStreak(threshold = 70): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('energy_logs')
      .select('logged_at, energy_level')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(365);

    if (error) { console.error('EnergyService.getStreak error:', error); return 0; }

    const byDate: Record<string, number> = {};
    for (const row of data || []) {
      byDate[(row.logged_at as string).split('T')[0]] = row.energy_level;
    }

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (i === 0) {
        // Today: skip if no log or below threshold
        if (byDate[dateStr] === undefined || byDate[dateStr] < threshold) break;
      } else {
        if (!byDate[dateStr] || byDate[dateStr] < threshold) break;
      }
      streak++;
    }
    return streak;
  },

  /** Delete a log */
  async deleteLog(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('energy_logs')
      .delete()
      .eq('id', id);
    return !error;
  },
};
