/**
 * ============================================================
 * DailyStack — Net Worth Service
 * ============================================================
 * Handles Net Worth accounts, snapshots, and historical data
 */

import { supabase } from '../supabaseClient';

// ─── Types ──────────────────────────────────────────────────────────

export type AccountCategory = 
  | 'cash' 
  | 'checking' 
  | 'savings' 
  | 'investment' 
  | 'property' 
  | 'vehicle' 
  | 'crypto' 
  | 'other';

export interface NetWorthAccount {
  id: string;
  user_id?: string;
  account_name: string;
  account_name_th: string;
  account_type: 'asset' | 'liability';
  account_category: AccountCategory;
  institution?: string;
  current_balance: number;
  currency: string;
  icon?: string;
  color?: string;
  is_manual: boolean;
  is_active: boolean;
  last_synced_at?: string;
  created_at?: string;
}

export interface NetWorthSnapshot {
  id: string;
  user_id?: string;
  snapshot_date: string;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  currency: string;
  notes?: string;
  created_at?: string;
}

export interface AccountSnapshot {
  id: string;
  user_id?: string;
  account_id: string;
  snapshot_date: string;
  balance: number;
  currency: string;
  created_at?: string;
}

// ─── Account CRUD ────────────────────────────────────────────────────

export const fetchNetWorthAccounts = async (): Promise<NetWorthAccount[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('net_worth_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('account_type', { ascending: false })
      .order('current_balance', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching net worth accounts:', error);
    return [];
  }
};

export const addNetWorthAccount = async (
  account: Omit<NetWorthAccount, 'id' | 'user_id' | 'created_at'>
): Promise<NetWorthAccount | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('net_worth_accounts')
      .insert([{ ...account, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding net worth account:', error);
    return null;
  }
};

export const updateNetWorthAccount = async (
  id: string,
  updates: Partial<NetWorthAccount>
): Promise<NetWorthAccount | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('net_worth_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating net worth account:', error);
    return null;
  }
};

export const deleteNetWorthAccount = async (id: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Soft delete (set is_active = false)
    const { error } = await supabase
      .from('net_worth_accounts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting net worth account:', error);
    return false;
  }
};

// ─── Historical Snapshots ─────────────────────────────────────────────

export const fetchNetWorthSnapshots = async (
  months: number = 12
): Promise<NetWorthSnapshot[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from('net_worth_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching net worth snapshots:', error);
    return [];
  }
};

export const createMonthlySnapshot = async (): Promise<NetWorthSnapshot | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Call the database function to update snapshot
    const { error: funcError } = await supabase.rpc('update_net_worth_snapshot', {
      user_uuid: user.id
    });

    if (funcError) throw funcError;

    // Fetch the newly created snapshot
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('net_worth_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .eq('snapshot_date', today)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating monthly snapshot:', error);
    return null;
  }
};

// ─── Seed Default Accounts ───────────────────────────────────────────

export const seedDefaultAccounts = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user already has accounts
    const { data: existing } = await supabase
      .from('net_worth_accounts')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (existing && existing.length > 0) return true; // Already seeded

    // Default accounts based on user's Excel data
    const defaultAccounts: Omit<NetWorthAccount, 'id' | 'user_id' | 'created_at'>[] = [
      {
        account_name: 'Cash',
        account_name_th: 'เงินสด',
        account_type: 'asset',
        account_category: 'cash',
        institution: 'Wallet',
        current_balance: 3500,
        currency: 'THB',
        icon: 'banknote',
        color: '#10B981',
        is_manual: true,
        is_active: true,
      },
      {
        account_name: 'Bank Account',
        account_name_th: 'บัญชีธนาคาร',
        account_type: 'asset',
        account_category: 'checking',
        institution: 'Bank',
        current_balance: 50000,
        currency: 'THB',
        icon: 'building-2',
        color: '#3B82F6',
        is_manual: true,
        is_active: true,
      },
      {
        account_name: 'Investment Portfolio',
        account_name_th: 'พอร์ตหุ้น/กองทุน',
        account_type: 'asset',
        account_category: 'investment',
        institution: 'Brokerage',
        current_balance: 35000,
        currency: 'THB',
        icon: 'trending-up',
        color: '#8B5CF6',
        is_manual: true,
        is_active: true,
      },
      {
        account_name: 'Credit Card',
        account_name_th: 'บัตรเครดิต',
        account_type: 'liability',
        account_category: 'other',
        institution: 'Bank',
        current_balance: 10000,
        currency: 'THB',
        icon: 'credit-card',
        color: '#EF4444',
        is_manual: true,
        is_active: true,
      },
    ];

    const { error } = await supabase
      .from('net_worth_accounts')
      .insert(defaultAccounts.map(acc => ({ ...acc, user_id: user.id })));

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error seeding default accounts:', error);
    return false;
  }
};

// ─── Calculate Totals ────────────────────────────────────────────────

export interface NetWorthTotals {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export const calculateNetWorthTotals = async (): Promise<NetWorthTotals> => {
  try {
    const accounts = await fetchNetWorthAccounts();
    
    const totalAssets = accounts
      .filter(a => a.account_type === 'asset')
      .reduce((sum, a) => sum + a.current_balance, 0);

    const totalLiabilities = accounts
      .filter(a => a.account_type === 'liability')
      .reduce((sum, a) => sum + a.current_balance, 0);

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    };
  } catch (error) {
    console.error('Error calculating net worth totals:', error);
    return { totalAssets: 0, totalLiabilities: 0, netWorth: 0 };
  }
};
