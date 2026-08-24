/**
 * cardService.ts — Virtual Card operations
 * Reads from / writes to the user_cards table.
 */
import { supabase } from '../supabaseClient';

export interface VirtualCard {
  id: string;
  user_id: string;
  card_number_last4: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  balance: number;
  variant: 'lime' | 'emerald' | 'gold';
  is_primary: boolean;
  created_at: string;
}

/** Fetch all cards for the current user. */
export const getUserCards = async (): Promise<VirtualCard[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data as VirtualCard[] || [];
  } catch {
    return [];
  }
};

/** Create a new virtual card (MVP - in production would integrate with card issuer API). */
export const createVirtualCard = async (
  cardholderName: string,
  variant: 'lime' | 'emerald' | 'gold' = 'lime'
): Promise<VirtualCard | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Generate mock card data (in production, this would call card issuer API)
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date();
    const expiryMonth = now.getMonth() + 1;
    const expiryYear = now.getFullYear() + 3;

    const { data, error } = await supabase
      .from('user_cards')
      .insert({
        user_id: user.id,
        card_number_last4: last4,
        cardholder_name: cardholderName,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        balance: 0,
        variant,
        is_primary: false, // First card will be primary
      })
      .select()
      .single();

    if (error) throw error;
    return data as VirtualCard;
  } catch (e) {
    console.error('[cardService] Create error:', e);
    return null;
  }
};

/** Update card settings (e.g., set as primary). */
export const updateCardSettings = async (
  cardId: string,
  updates: Partial<{ is_primary: boolean; cardholder_name: string }>
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_cards')
      .update(updates)
      .eq('id', cardId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
};

/** Delete a virtual card. */
export const deleteCard = async (cardId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
};

/** Convert database card to UI format. */
export const dbCardToUI = (dbCard: VirtualCard) => ({
  id: dbCard.id,
  cardholderName: dbCard.cardholder_name,
  lastFour: dbCard.card_number_last4,
  balance: dbCard.balance,
  expiry: `${dbCard.expiry_month.toString().padStart(2, '0')}/${dbCard.expiry_year.toString().slice(-2)}`,
  variant: dbCard.variant,
  isPrimary: dbCard.is_primary,
});
