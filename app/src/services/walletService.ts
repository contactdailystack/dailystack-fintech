/**
 * walletService.ts — User Wallet operations
 * Reads from / writes to the public.user_wallets table.
 */
import { supabase } from '../supabaseClient';

export interface WalletRecord {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

/** Fetch the current user's wallet. Returns null if none exists. */
export const getUserWallet = async (): Promise<WalletRecord | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data as WalletRecord | null;
  } catch {
    return null;
  }
};

/** Get or create wallet for the current user with zero balance. */
export const getOrCreateWallet = async (): Promise<WalletRecord> => {
  const existing = await getUserWallet();
  if (existing) return existing;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_wallets')
      .insert({
        user_id: user.id,
        balance: 0,
        currency: 'THB',
      })
      .select()
      .single();

    if (error) throw error;
    return data as WalletRecord;
  } catch {
    // Fallback: return a local wallet object
    return {
      id: 'local',
      user_id: 'local',
      balance: 0,
      currency: 'THB',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
};

/** Update wallet balance (top-up or withdraw). */
export const updateWalletBalance = async (newBalance: number): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
};
