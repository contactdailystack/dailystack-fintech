import { supabase } from './supabaseClient';

export interface UserWallet {
  id: string;
  user_id?: string;
  name: string;
  wallet_type: 'cash' | 'bank' | 'credit_card';
  balance: number;
  color_gradient: string;
  created_at?: string;
}

export const fetchUserWallets = async (): Promise<UserWallet[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[walletService] fetchUserWallets failed:', err);
    return [];
  }
};

export const createUserWallet = async (
  wallet: Omit<UserWallet, 'id' | 'user_id' | 'created_at'>
): Promise<UserWallet | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_wallets')
      .insert({ ...wallet, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[walletService] createUserWallet failed:', err);
    return null;
  }
};

export const updateWalletBalance = async (
  walletId: string,
  newBalance: number
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', walletId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[walletService] updateWalletBalance failed:', err);
    return false;
  }
};
