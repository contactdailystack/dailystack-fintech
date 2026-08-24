import { supabase } from '../supabaseClient';
import { SaveTransactionInputSchema, safeParse } from '../lib/validation';
import type { Transaction } from '../types';

export interface DBTransaction {
  id: string;
  user_id: string;
  wallet_id: string | null;
  type: 'credit' | 'debit' | 'cashback' | 'refund' | 'fee';
  amount: number;
  description: string;
  reference_id: string | null;
  created_at: string;
  // Migration 029 (Rocket Money parity)
  note?: string | null;
  is_ignored?: boolean;
  split_category?: string | null;
  split_amount?: number | null;
}

export interface SaveTransactionInput {
  amount: number;
  description: string;
  category: string;
  workspace?: string;
  location?: string;
  timeOfDay?: string;
  dayOfWeek?: string;
  note?: string;
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
      .insert({ user_id: user.id, type, amount, description: valid.description, reference_id: valid.category, note: valid.note ?? null })
      .select('id').single();
    if (txErr || !tx) { console.error('[txService] Save error:', txErr); return null; }

    return { id: tx.id };
  } catch(e) { console.error('[txService]', e); return null; }
}

export async function loadTransactions(opts?: { includeIgnored?: boolean }): Promise<DBTransaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    let query = supabase
      .from('user_transactions').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(200);
    if (!opts?.includeIgnored) query = query.eq('is_ignored', false);
    const { data, error } = await query;
    if (error) throw error;
    return (data as DBTransaction[]) || [];
  } catch { return []; }
}

/**
 * Load ignored transactions only (#6b — "Hidden" view).
 */
export async function loadIgnoredTransactions(): Promise<Transaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('user_transactions').select('*').eq('user_id', user.id)
      .eq('is_ignored', true)
      .order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return dbTransactionsToActivityTx((data as DBTransaction[]) || []);
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

/**
 * Map DB rows → UI Transaction[] with Rocket Money parity features (#6a/#6b/#6d):
 * - attaches `note`
 * - splits one DB row into two UI rows when split_category/split_amount set
 *   (all existing client-side per-category sums keep working unchanged)
 */
export function dbTransactionsToActivityTx(rows: DBTransaction[]): import('../types').Transaction[] {
  const out: import('../types').Transaction[] = [];
  for (const db of rows) {
    const base = dbTransactionToActivityTx(db);
    if (db.is_ignored) continue;
    out.push({
      ...base,
      note: db.note || undefined,
      isIgnored: false,
    });
    // Synthetic row for the split-off part (#6d):
    // e.g. total ฿1,000 in Shopping with ฿300 split to Bills ⇒
    //   primary row  → Shopping −฿700
    //   synthetic row → Bills    −฿300
    if (db.split_category && db.split_amount && Number(db.split_amount) > 0) {
      const total = Math.abs(base.amount);
      const moved = Math.min(Number(db.split_amount), total);
      const sign = base.amount < 0 ? -1 : 1;
      out.push({
        ...base,
        id: `${base.id}-split`,
        category: db.split_category,
        amount: sign * moved,
        note: db.note || undefined,
        splitOf: true,
      });
      out[out.length - 2].amount = sign * (total - moved);
    }
  }
  return out;
}

// ─── Note / Ignore / Split mutations (#6a, #6b, #6d) ─────────────────────────

export async function updateTransactionNote(transactionId: string, note: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('user_transactions')
      .update({ note: note.trim() || null })
      .eq('id', transactionId)
      .eq('user_id', user.id);
    if (error) { console.error('[txService] Note update error:', error); return false; }
    return true;
  } catch (e) { console.error('[txService] Note update:', e); return false; }
}

export async function setTransactionIgnored(transactionId: string, ignored: boolean): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('user_transactions')
      .update({ is_ignored: ignored })
      .eq('id', transactionId)
      .eq('user_id', user.id);
    if (error) { console.error('[txService] Ignore update error:', error); return false; }
    return true;
  } catch (e) { console.error('[txService] Ignore update:', e); return false; }
}

/** Split part of a transaction's amount into another category. Pass null to undo. */
export async function setTransactionSplit(
  transactionId: string,
  splitCategory: string | null,
  splitAmount: number | null
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('user_transactions')
      .update({ split_category: splitCategory, split_amount: splitAmount })
      .eq('id', transactionId)
      .eq('user_id', user.id);
    if (error) { console.error('[txService] Split update error:', error); return false; }
    return true;
  } catch (e) { console.error('[txService] Split update:', e); return false; }
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

// --- Update core fields (merchant / amount / category) -----------------------
export interface TransactionCoreUpdates {
  amount?: number;       // signed activity-style amount (negative = expense)
  description?: string;  // merchant
  category?: string;     // persisted in reference_id
}

export async function updateTransactionCore(
  transactionId: string,
  updates: TransactionCoreUpdates
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const patch: Record<string, unknown> = {};
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.category !== undefined) patch.reference_id = updates.category;
    if (updates.amount !== undefined) {
      const { type, amount } = amountToDB(updates.amount);
      patch.type = type;
      patch.amount = amount;
    }
    if (Object.keys(patch).length === 0) return true;

    const { error } = await supabase
      .from('user_transactions')
      .update(patch)
      .eq('id', transactionId)
      .eq('user_id', user.id);

    if (error) { console.error('[txService] Core update error:', error); return false; }
    return true;
  } catch (e) {
    console.error('[txService] Core update:', e);
    return false;
  }
}
