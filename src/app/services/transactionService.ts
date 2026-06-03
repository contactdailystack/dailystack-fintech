import { supabase } from './supabaseClient';

export interface UserTransaction {
  id: string;
  user_id?: string;
  wallet_id?: string;
  wallet_name: string;
  category_name: string;
  amount: number;
  notes?: string;
  transaction_date: string;
  created_at?: string;
}

export const fetchUserTransactions = async (
  limitCount = 20
): Promise<UserTransaction[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(limitCount);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[transactionService] fetchUserTransactions failed:', err);
    return [];
  }
};

export const addUserTransaction = async (
  transaction: Omit<UserTransaction, 'id' | 'user_id' | 'created_at'>
): Promise<UserTransaction | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_transactions')
      .insert({ ...transaction, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[transactionService] addUserTransaction failed:', err);
    return null;
  }
};
