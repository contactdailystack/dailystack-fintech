import { supabase } from '../supabaseClient';

export type AssetType = 'gold' | 'mutual_fund' | 'bond' | 'crypto' | 'other';

export interface AlternativeAsset {
  id: string;
  user_id?: string;
  asset_name: string;
  asset_type: AssetType;
  current_value: number;
  currency: string;
  purchase_price?: number;
  purchase_date?: string;
  notes?: string;
  created_at?: string;
}

export const fetchAlternativeAssets = async (): Promise<AlternativeAsset[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('alternative_assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching alternative assets:', error);
    return [];
  }
};

export const addAlternativeAsset = async (
  asset: Omit<AlternativeAsset, 'id' | 'user_id' | 'created_at'>
): Promise<AlternativeAsset | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('alternative_assets')
      .insert([{ ...asset, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding alternative asset:', error);
    return null;
  }
};

export const updateAlternativeAsset = async (
  id: string,
  updates: Partial<AlternativeAsset>
): Promise<AlternativeAsset | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('alternative_assets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating alternative asset:', error);
    return null;
  }
};

export const deleteAlternativeAsset = async (id: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('alternative_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting alternative asset:', error);
    return false;
  }
};