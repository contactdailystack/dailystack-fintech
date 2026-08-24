/**
 * DailyStack — ruleEngine.ts
 * User-defined auto-categorization rules (#6c).
 *
 * A rule maps a description substring → category. Rules are applied:
 *  - on CSV import (csvImportService normalize step)
 *  - as a live suggestion while typing a merchant in the manual entry form
 */

import { supabase } from '../supabaseClient';

export interface TxRule {
  id: string;
  pattern: string;
  category: string;
}

export async function loadRules(): Promise<TxRule[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('transaction_rules')
      .select('id, pattern, category')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data as TxRule[];
  } catch {
    return [];
  }
}

export async function addRule(pattern: string, category: string): Promise<TxRule | null> {
  try {
    const p = pattern.trim();
    const c = category.trim();
    if (p.length < 2 || !c) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('transaction_rules')
      .insert({ user_id: user.id, pattern: p, category: c })
      .select('id, pattern, category')
      .single();
    if (error || !data) return null;
    return data as TxRule;
  } catch {
    return null;
  }
}

export async function deleteRule(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('transaction_rules')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    return !error;
  } catch {
    return false;
  }
}

/** First matching rule wins (longest pattern first for precision). */
export function matchRules(
  rules: Array<Pick<TxRule, 'pattern' | 'category'>>,
  description: string
): Pick<TxRule, 'pattern' | 'category'> | null {
  const d = (description || '').toLowerCase();
  if (!d) return null;
  const sorted = [...rules].sort((a, b) => b.pattern.length - a.pattern.length);
  return sorted.find((r) => d.includes(r.pattern.toLowerCase())) || null;
}
