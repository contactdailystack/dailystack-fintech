import { supabase } from '../supabaseClient';
import { SaveTransactionInputSchema, safeParse } from '../lib/validation';

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
  workspace?: string;
  location?: string;
  timeOfDay?: string;
  dayOfWeek?: string;
}

function amountToDB(amount: number): { type: 'credit' | 'debit'; amount: number } {
  if (amount >= 0) return { type: 'debit', amount: Math.abs(amount) };
  return { type: 'credit', amount: Math.abs(amount) };
}

export async function saveTransaction(input: SaveTransactionInput): Promise<{ id: string } | null> {
  try {
    const validation = safeParse(SaveTransactionInputSchema, input);
    if (!validation.success) {
      console.error('[txService] Input validation failed:', validation.errors);
      return null;
    }
    const valid = validation.data;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { type, amount } = amountToDB(valid.amount);
    const { data: tx, error: txErr } = await supabase
      .from('user_transactions')
      .insert({ user_id: user.id, type, amount, description: valid.description, reference_id: valid.category })
      .select('id').single();
    if (txErr || !tx) { console.error('[txService] Save error:', txErr); return null; }

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
    status: 'completed' as const,
    workspace: 'Personal' as const,
  };
}

// --- Delete Transaction ------------------------------------------------------
export async function deleteTransaction(transactionId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Delete the transaction
    const { error } = await supabase
      .from('user_transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id); // Ensure user owns this transaction

    if (error) {
      console.error('[txService] Delete error:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('[txService] Delete error:', e);
    return false;
  }
}
