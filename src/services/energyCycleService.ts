/**
 * DailyStack — Energy Cycle Service
 * Morning / Afternoon / Evening energy tracking per day
 */
import { supabase } from '../app/services/supabaseClient';

export interface EnergyCycle {
  id?: string;
  user_id: string;
  date: string;
  morning_level?: number | null;
  afternoon_level?: number | null;
  evening_level?: number | null;
  morning_note?: string | null;
  afternoon_note?: string | null;
  evening_note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CyclePattern {
  morning: number;
  afternoon: number;
  evening: number;
  count: number;
}

export const EnergyCycleService = {
  /** Upsert today's cycle entry */
  async upsertDay(values: {
    morning_level?: number;
    afternoon_level?: number;
    evening_level?: number;
    morning_note?: string;
    afternoon_note?: string;
    evening_note?: string;
  }): Promise<EnergyCycle | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];

    const upsert: Record<string, unknown> = {
      user_id: user.id,
      date: today,
      updated_at: new Date().toISOString(),
    };
    if (values.morning_level !== undefined) upsert.morning_level = Math.max(1, Math.min(100, values.morning_level));
    if (values.afternoon_level !== undefined) upsert.afternoon_level = Math.max(1, Math.min(100, values.afternoon_level));
    if (values.evening_level !== undefined) upsert.evening_level = Math.max(1, Math.min(100, values.evening_level));
    if (values.morning_note !== undefined) upsert.morning_note = values.morning_note;
    if (values.afternoon_note !== undefined) upsert.afternoon_note = values.afternoon_note;
    if (values.evening_note !== undefined) upsert.evening_note = values.evening_note;

    const { data, error } = await supabase
      .from('energy_cycles')
      .upsert(upsert, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) { console.error('EnergyCycleService.upsertDay error:', error); return null; }
    return data;
  },

  /** Get cycles for a date range (default last 30 days) */
  async getCycles(startDate?: string, endDate?: string): Promise<EnergyCycle[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('energy_cycles')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });

    if (error) { console.error('EnergyCycleService.getCycles error:', error); return []; }
    return data || [];
  },

  /** Get today's cycle */
  async getToday(): Promise<EnergyCycle | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('energy_cycles')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('EnergyCycleService.getToday error:', error);
    }
    return data || null;
  },

  /** Get weekly cycle */
  async getWeekly(): Promise<EnergyCycle[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('energy_cycles')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('date', { ascending: true });

    if (error) { console.error('EnergyCycleService.getWeekly error:', error); return []; }
    return data || [];
  },

  /** Get average cycle pattern across last 30 days */
  async getPattern(): Promise<CyclePattern> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { morning: 0, afternoon: 0, evening: 0, count: 0 };

    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('energy_cycles')
      .select('morning_level, afternoon_level, evening_level')
      .eq('user_id', user.id)
      .gte('date', start);

    if (error) { console.error('EnergyCycleService.getPattern error:', error); return { morning: 0, afternoon: 0, evening: 0, count: 0 }; }

    const rows = data || [];
    if (rows.length === 0) return { morning: 0, afternoon: 0, evening: 0, count: 0 };

    const avg = (arr: (number | null)[]) => {
      const valid = arr.filter(v => v !== null && v !== undefined) as number[];
      return valid.length > 0 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
    };

    return {
      morning: avg(rows.map(r => r.morning_level)),
      afternoon: avg(rows.map(r => r.afternoon_level)),
      evening: avg(rows.map(r => r.evening_level)),
      count: rows.length,
    };
  },

  /** Get current time-of-day segment */
  getCurrentSegment(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  },

  /** Delete a cycle entry */
  async deleteCycle(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('energy_cycles')
      .delete()
      .eq('id', id);
    return !error;
  },
};
