import React from 'react';
import { subscriptionTemplates } from '../data/subscriptionTemplates';
import { supabase } from '../services/supabaseClient';

export const TemplateQuickAdd: React.FC<{ onAdded?: () => void }> = ({ onAdded }) => {
  const handleAdd = async (t: any) => {
    try {
      const { error } = await supabase.from('subscriptions').insert([{ name: t.name, amount: t.amount, category: t.category }]);
      if (error) throw error;
      onAdded?.();
    } catch (err) {
      console.error('Template add error', err);
      alert('Failed to add subscription');
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
