/**
 * DailyStack — 12-Week Goals Service
 * Quarterly goal framework with milestone tracking
 */
import { supabase } from '../app/services/supabaseClient';

export type GoalDimension = 'work' | 'learning' | 'relationships' | 'passions' | 'wellbeing';
export type GoalPhase = 'planning' | 'building' | 'reviewing' | 'completed';

export interface Milestone {
  id: string;
  title: string;
  target_week: number;
  completed: boolean;
  completed_at?: string;
  note?: string;
}

export interface Goal12wk {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  dimension: GoalDimension;
  current_week: number;
  phase: GoalPhase;
  milestones: Milestone[];
  target_date?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const Goals12wkService = {
  /** Create a new 12-week goal */
  async create(data: Omit<Goal12wk, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal12wk | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: row, error } = await supabase
      .from('goals_12wk')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();

    if (error) { console.error('Goals12wkService.create error:', error); return null; }
    return row;
  },

  /** Get all goals (optionally active only) */
  async getAll(activeOnly = true): Promise<Goal12wk[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('goals_12wk')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (activeOnly) query = query.eq('is_active', true);

    const { data, error } = await query;
    if (error) { console.error('Goals12wkService.getAll error:', error); return []; }
    return data || [];
  },

  /** Get goal by ID */
  async getById(id: string): Promise<Goal12wk | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('goals_12wk')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Goals12wkService.getById error:', error);
    }
    return data || null;
  },

  /** Get goals by dimension */
  async getByDimension(dimension: GoalDimension): Promise<Goal12wk[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('goals_12wk')
      .select('*')
      .eq('user_id', user.id)
      .eq('dimension', dimension)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) { console.error('Goals12wkService.getByDimension error:', error); return []; }
    return data || [];
  },

  /** Update a goal */
  async update(id: string, updates: Partial<Goal12wk>): Promise<boolean> {
    const { error } = await supabase
      .from('goals_12wk')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) { console.error('Goals12wkService.update error:', error); return false; }
    return true;
  },

  /** Advance to next week (current_week++) */
  async advanceWeek(id: string): Promise<boolean> {
    const goal = await this.getById(id);
    if (!goal) return false;
    const nextweek = Math.min(12, goal.current_week + 1);
    return this.update(id, { current_week: nextweek });
  },

  /** Mark goal as completed */
  async markComplete(id: string): Promise<boolean> {
    return this.update(id, { phase: 'completed', is_active: false });
  },

  /** Archive a goal */
  async archive(id: string): Promise<boolean> {
    return this.update(id, { is_active: false });
  },

  /* ---------- Milestones ---------- */

  /** Add a milestone to a goal */
  async addMilestone(goalId: string, title: string, targetWeek: number): Promise<boolean> {
    const goal = await this.getById(goalId);
    if (!goal) return false;

    const milestones = goal.milestones || [];
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title,
      target_week: targetWeek,
      completed: false,
    };

    return this.update(goalId, {
      milestones: [...milestones, newMilestone],
    });
  },

  /** Toggle milestone completed */
  async toggleMilestone(goalId: string, milestoneId: string): Promise<boolean> {
    const goal = await this.getById(goalId);
    if (!goal) return false;

    const milestones = (goal.milestones || []).map(m => {
      if (m.id !== milestoneId) return m;
      return {
        ...m,
        completed: !m.completed,
        completed_at: !m.completed ? new Date().toISOString() : undefined,
      };
    });

    return this.update(goalId, { milestones });
  },

  /** Delete a milestone */
  async deleteMilestone(goalId: string, milestoneId: string): Promise<boolean> {
    const goal = await this.getById(goalId);
    if (!goal) return false;

    const milestones = (goal.milestones || []).filter(m => m.id !== milestoneId);
    return this.update(goalId, { milestones });
  },

  /** Get progress stats */
  async getProgressStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    avgProgress: number;
    byDimension: Record<GoalDimension, number>;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { total: 0, active: 0, completed: 0, avgProgress: 0, byDimension: { work: 0, learning: 0, relationships: 0, passions: 0, wellbeing: 0 } };

    const { data, error } = await supabase
      .from('goals_12wk')
      .select('*')
      .eq('user_id', user.id);

    if (error) { console.error('Goals12wkService.getProgressStats error:', error); return { total: 0, active: 0, completed: 0, avgProgress: 0, byDimension: { work: 0, learning: 0, relationships: 0, passions: 0, wellbeing: 0 } }; }

    const goals = data || [];
    const active = goals.filter(g => g.is_active);
    const completed = goals.filter(g => g.phase === 'completed');

    const byDimension: Record<GoalDimension, number> = { work: 0, learning: 0, relationships: 0, passions: 0, wellbeing: 0 };
    for (const g of active) {
      const milestones = g.milestones || [];
      const weekProgress = g.current_week / 12;
      const milestoneProgress = milestones.length > 0
        ? milestones.filter((m: Milestone) => m.completed).length / milestones.length
        : 0;
      byDimension[g.dimension as GoalDimension] = Math.round((weekProgress * 0.5 + milestoneProgress * 0.5) * 100);
    }

    return {
      total: goals.length,
      active: active.length,
      completed: completed.length,
      avgProgress: active.length > 0
        ? Math.round(Object.values(byDimension).reduce((a, b) => a + b, 0) / active.length)
        : 0,
      byDimension,
    };
  },

  /** Delete a goal */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('goals_12wk')
      .delete()
      .eq('id', id);
    return !error;
  },
};
