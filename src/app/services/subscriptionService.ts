import { supabase } from './supabaseClient';

export interface UserSubscription {
  id: string;
  user_id?: string;
  name: string;
  amount: number;
  next_billing_date: string;
  category: string;
  utilization_warning?: string;
  created_at?: string;
}

interface UserSubscriptionRow {
  id: string;
  user_id?: string;
  name: string;
  amount: number;
  next_billing_date: string;
  category: string;
  utilization_warning?: string | null;
  created_at?: string;
}

const mapSubscriptionRow = (item: UserSubscriptionRow): UserSubscription => ({
  id: item.id,
  user_id: item.user_id,
  name: item.name,
  amount: Number(item.amount),
  next_billing_date: item.next_billing_date,
  category: item.category,
  utilization_warning: item.utilization_warning || undefined,
  created_at: item.created_at,
});

export const fetchUserSubscriptions = async (): Promise<UserSubscription[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('next_billing_date', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return (data as UserSubscriptionRow[]).map(mapSubscriptionRow);
  } catch (err) {
    console.error('[subscriptionService] fetchUserSubscriptions failed:', err);
    throw err;
  }
};

export const addUserSubscription = async (
  subscription: Omit<UserSubscription, 'id' | 'user_id' | 'created_at'>,
): Promise<UserSubscription> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      user_id: user?.id,
      name: subscription.name,
      amount: subscription.amount,
      next_billing_date: subscription.next_billing_date,
      category: subscription.category,
      utilization_warning: subscription.utilization_warning,
    };

    if (!user) {
      return {
        ...subscription,
        id: `local-${Date.now()}`,
      } as UserSubscription;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return mapSubscriptionRow(data as UserSubscriptionRow);
  } catch (err) {
    console.error('[subscriptionService] addUserSubscription failed:', err);
    throw err;
  }
};

export const updateUserSubscription = async (
  subscriptionId: string,
  updates: Partial<Omit<UserSubscription, 'id' | 'user_id' | 'created_at'>>,
): Promise<UserSubscription> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return mapSubscriptionRow(data as UserSubscriptionRow);
  } catch (err) {
    console.error('[subscriptionService] updateUserSubscription failed:', err);
    throw err;
  }
};

export const deleteUserSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (err) {
    console.error('[subscriptionService] deleteUserSubscription failed:', err);
    throw err;
  }
};
