import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const DashboardTopFold: React.FC = () => {
  const [summary, setSummary] = useState({ monthly: 0, yearly: 0, count: 0, nextCharge: null as null | string });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data, error } = await supabase.from('subscriptions').select('amount,billing_interval,active');
        if (error) throw error;
        const subs = data || [];
        let monthly = 0;
        subs.forEach((s: any) => {
          if (!s.active) return;
          if (s.billing_interval === 'yearly') monthly += Number(s.amount) / 12;
          else monthly += Number(s.amount);
        });
        const yearly = monthly * 12;
        if (mounted) setSummary({ monthly: Math.round(monthly), yearly: Math.round(yearly), count: subs.length, nextCharge: null });
      } catch (err) {
        console.error('DashboardTopFold load error', err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="text-sm text-gray-500">Active subscriptions</div>
      <div className="text-2xl font-bold">{summary.monthly} ฿ / month</div>
      <div className="text-sm">{summary.yearly} ฿ per year • {summary.count} subscriptions</div>
    </div>
  );
};

export default DashboardTopFold;
