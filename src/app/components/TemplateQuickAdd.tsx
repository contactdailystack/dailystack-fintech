import React from 'react';
import { subscriptionTemplates } from '../data/subscriptionTemplates';
import { supabase } from '../services/supabaseClient';

export const TemplateQuickAdd: React.FC<{ onAdded?: () => void }> = ({ onAdded }) => {
  const handleAdd = async (t: any) => {
    try {
      // FIX: Add auth check to prevent unauthorized inserts
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('user_subscriptions').insert([{
        user_id: user.id,  // FIX: Include user_id for RLS policy
        name: t.name,
        amount: t.amount,
        category: t.category,
        active: true,
      }]);
      if (error) throw error;
      onAdded?.();
    } catch (err) {
      console.error('Template add error', err);
      // FIX: Don't use alert() in production - use toast/notification instead
      alert('Failed to add subscription. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {subscriptionTemplates.map((t) => (
        <button key={t.key} onClick={() => handleAdd(t)} className="p-2 bg-white rounded shadow text-left">
          <div className="font-semibold">{t.name}</div>
          <div className="text-sm text-gray-500">{t.amount} ฿ / month</div>
        </button>
      ))}
    </div>
  );
};

export default TemplateQuickAdd;
