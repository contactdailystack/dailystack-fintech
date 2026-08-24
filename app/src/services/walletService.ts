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

// ─── Transfer Interface ────────────────────────────────────────────────────────
export interface TransferRecipient {
  id: string;
  name: string;
  avatar?: string;
  bank?: string;
}

export interface TransferResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Execute a wallet-to-wallet transfer using atomic RPC function.
 * Uses transfer_funds() SQL function with row-level locking to prevent
 * race conditions. Concurrent transfers cannot cause negative balance.
 */
export const executeWalletTransfer = async (
  amount: number,
  recipient: TransferRecipient,
  description?: string
): Promise<TransferResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    // Call atomic transfer_funds() RPC — row-level locking prevents race conditions
    const { data, error: rpcError } = await supabase.rpc('transfer_funds', {
      p_from_user_id: user.id,
      p_to_user_id: recipient.id,
      p_amount: amount,
      p_description: description || `Transfer to ${recipient.name}`,
    });

    if (rpcError) {
      // Supabase JS wraps the PostgreSQL exception in the error message
      const msg = rpcError.message || '';
      if (msg.includes('Insufficient balance')) {
        return { success: false, error: 'Insufficient balance' };
      }
      if (msg.includes('Wallet not found')) {
        return { success: false, error: 'No wallet found' };
      }
      console.error('[walletService] RPC error:', rpcError);
      return { success: false, error: 'Transfer failed' };
    }

    // Parse result from transfer_funds() JSON return
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    if (!result.success) {
      return { success: false, error: result.error || 'Transfer failed' };
    }

    return {
      success: true,
      transactionId: result.transaction_id,
    };
  } catch (e) {
    console.error('[walletService] Transfer error:', e);
    return { success: false, error: 'Transfer failed' };
  }
};

/**
 * Get recent transfer recipients for quick selection.
 * Returns mock data for MVP - in production, this would be user's frequent recipients.
 */
export const getRecentRecipients = async (): Promise<TransferRecipient[]> => {
  // MVP: Return common Thai recipients
  // In production, fetch from user_recipients table or transaction history
  return [
    { id: 'rec_1', name: 'สมชาย', avatar: '👨' },
    { id: 'rec_2', name: 'สมหญิง', avatar: '👩' },
    { id: 'rec_3', name: 'แม่', avatar: '👩‍🦳' },
    { id: 'rec_4', name: 'พี่วิน', avatar: '🧑' },
    { id: 'rec_5', name: 'บริษัท', avatar: '🏢' },
  ];
};

/**
 * Get available payment sources (cards, wallets, banks).
 * Returns mock data for MVP - in production, fetch from user_cards, user_wallets tables.
 */
export const getPaymentSources = async (): Promise<Array<{
  id: string;
  type: 'card' | 'wallet' | 'bank';
  name: string;
  last4?: string;
  color: string;
}>> => {
  // MVP: Return mock payment sources
  // In production, fetch from user_payment_methods table
  return [
    { id: 'card1', type: 'card', name: 'Visa •••• 4242', last4: '4242', color: '#1a1a2e' },
    { id: 'card2', type: 'card', name: 'Mastercard •••• 5555', last4: '5555', color: '#2d1b4e' },
    { id: 'wallet', type: 'wallet', name: 'PicksWise Wallet', color: '#050D1F' },
    { id: 'bank', type: 'bank', name: 'KBANK •••• 1234', last4: '1234', color: '#0d7377' },
  ];
};
