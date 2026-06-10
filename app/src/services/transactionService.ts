import { supabase } from '../supabaseClient';
import type { Emotion } from '../types';

export interface DBTransaction {
  id: string;
  user_id: string;
  wallet_id: string | null;
  type: 'credit' | 'debit' | 'cashback' | 'refund' | 'fee';
  amount: number;
  description: string;
  reference_id: string | null;
  created_at: string;
}

export interface SaveTransactionInput {
  amount: number;
  description: string;
  category: string;
  emotion: Emotion;
  why: string;
  workspace?: string;
  location?: string;
  timeOfDay?: string;
  dayOfWeek?: string;
  intent?: string;
  riskScore?: number;
  habitScore?: number;
  behavioralCategory?: string;
  patternMatch?: string;
  goalImpact?: string;
  behaviorImpact?: string;
  financialHealthImpact?: string;
}

function emotionToMood(emotion: Emotion): string {
  const m: Record<string, string> = {
    Impulse: 'neutral', Joy: 'happy', Stress: 'stressed',
    Social: 'neutral', Value: 'neutral', Investment: 'excited',
    Happy: 'happy', Stressed: 'stressed', Bored: 'bored',
    Rewarding: 'excited', Motivated: 'excited', Anxious: 'anxious', Neutral: 'neutral',
  };
  return m[emotion] || 'neutral';
}

function intentToSpendingIntent(intent?: string): string | null {
  const m: Record<string, string> = {
    Need: 'necessity', Want: 'planned', Convenience: 'necessity',
    Reward: 'reward', Emergency: 'necessity', Investment: 'planned',
    Learning: 'planned', Relationship: 'emotional', Business: 'planned',
  };
  return intent ? (m[intent] || 'planned') : null;
}

function amountToDB(amount: number): { type: 'credit' | 'debit'; amount: number } {
  if (amount >= 0) return { type: 'debit', amount: Math.abs(amount) };
  return { type: 'credit', amount: Math.abs(amount) };
}

export async function saveTransaction(input: SaveTransactionInput): Promise<{ id: string } | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { type, amount } = amountToDB(input.amount);
    const { data: tx, error: txErr } = await supabase
      .from('user_transactions')
      .insert({ user_id: user.id, type, amount, description: input.description, reference_id: input.category })
      .select('id').single();
    if (txErr || !tx) { console.error('[txService] Save error:', txErr); return null; }
    supabase.from('emotional_context').insert({
      user_id: user.id, transaction_id: tx.id,
      spending_intent: intentToSpendingIntent(input.intent),
      mood: emotionToMood(input.emotion),
      trigger_category: input.emotion,
      notes: input.why || null,
    });
    return { id: tx.id };
  } catch(e) { console.error('[txService]', e); return null; }
}

export async function loadTransactions(): Promise<DBTransaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('user_transactions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return (data as DBTransaction[]) || [];
  } catch { return []; }
}

export function dbTransactionToActivityTx(dbTx: DBTransaction) {
  return {
    id: dbTx.id,
    merchant: dbTx.description || dbTx.reference_id || 'Transaction',
    category: dbTx.reference_id || 'Other',
    amount: dbTx.type === 'credit' ? -dbTx.amount : dbTx.amount,
    date: dbTx.created_at.split('T')[0],
    emotion: 'Neutral' as Emotion,
    why: '',
    status: 'completed' as const,
    workspace: 'Personal' as const,
  };
}
