import { supabase } from '../supabaseClient';
import {
  GoalCreateInputSchema,
  GoalUpdateInputSchema,
  safeParse,
} from '../lib/validation';

export interface Goal {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon_name: string;
  color_code: string;
  status: 'in_progress' | 'achieved' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface GoalWithProgress extends Goal {
  progress: number;
  remaining: number;
  daysLeft: number | null;
}

export async function fetchGoals(userId: string): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('fetchGoals failed:', err);
    return [];
  }
}

export async function createGoal(
  userId: string,
  goal_name: string,
  target_amount: number,
  current_amount: number = 0,
  target_date?: string,
  icon_name: string = 'Target',
  color_code: string = '#56be89'
): Promise<Goal | null> {
  try {
    const payload = {
      goal_name,
      target_amount,
      current_amount,
      target_date: target_date || undefined,
      icon_name,
      color_code,
    };
    const validation = safeParse(GoalCreateInputSchema, payload);
    if (!validation.success) {
      console.error('createGoal validation failed:', validation.errors);
      return null;
    }
    const valid = validation.data;
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        goal_name: valid.goal_name,
        target_amount: valid.target_amount,
        current_amount: valid.current_amount,
        target_date: target_date || null,
        icon_name: valid.icon_name,
        color_code: valid.color_code,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('createGoal failed:', err);
    return null;
  }
}

export async function updateGoal(
  goalId: string,
  updates: Partial<{
    goal_name: string;
    target_amount: number;
    current_amount: number;
    target_date: string | null;
    icon_name: string;
    color_code: string;
    status: 'in_progress' | 'achieved' | 'paused';
  }>
): Promise<boolean> {
  try {
    const validation = safeParse(GoalUpdateInputSchema, updates);
    if (!validation.success) {
      console.error('updateGoal validation failed:', validation.errors);
      return false;
    }
    const { error } = await supabase
      .from('goals')
      .update(validation.data)
      .eq('id', goalId);

    if (error) {
      console.error('Error updating goal:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('updateGoal failed:', err);
    return false;
  }
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error('Error deleting goal:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('deleteGoal failed:', err);
    return false;
  }
}

export async function addToGoal(goalId: string, amount: number): Promise<boolean> {
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(goalId)) {
      console.error('addToGoal validation failed: invalid goal id');
      return false;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      console.error('addToGoal validation failed: amount must be a positive number');
      return false;
    }
    // Fetch current goal
    const { data: goal, error: fetchError } = await supabase
      .from('goals')
      .select('current_amount, target_amount')
      .eq('id', goalId)
      .single();

    if (fetchError || !goal) {
      console.error('Error fetching goal:', fetchError);
      return false;
    }

    const newAmount = goal.current_amount + amount;
    const newStatus = newAmount >= goal.target_amount ? 'achieved' : 'in_progress';

    const { error } = await supabase
      .from('goals')
      .update({
        current_amount: newAmount,
        status: newStatus,
      })
      .eq('id', goalId);

    if (error) {
      console.error('Error adding to goal:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('addToGoal failed:', err);
    return false;
  }
}

// Calculate goal progress
export function calculateGoalProgress(goal: Goal): GoalWithProgress {
  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

  let daysLeft: number | null = null;
  if (goal.target_date) {
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    ...goal,
    progress,
    remaining,
    daysLeft: daysLeft !== null && daysLeft >= 0 ? daysLeft : null,
  };
}
