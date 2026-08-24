/**
 * ============================================================
 * DailyStack — Balance Page
 * ============================================================
 */

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Language } from '../data/translations';

interface BalancePageProps {
  balance: number;
  onBack: () => void;
  lang: Language;
}

export default function BalancePage({ balance, onBack, lang }: BalancePageProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: lang === 'th' ? 'THB' : 'USD',
    }).format(amount);
  };

  const transactions = [
    { id: 1, type: 'in', amount: 5000, desc: lang === 'th' ? 'รับเงิน' : 'Received', date: '2024-01-15' },
    { id: 2, type: 'out', amount: 1200, desc: lang === 'th' ? 'ชำระค่าบริการ' : 'Payment', date: '2024-01-14' },
    { id: 3, type: 'out', amount: 3500, desc: lang === 'th' ? 'ชื่อสินค้า' : 'Purchase', date: '2024-01-13' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0F0A' }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-12 pb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1A1D17' }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 
          className="flex-1 text-center text-lg font-bold text-white mr-10"
          style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
        >
          {lang === 'th' ? 'ยอดเงิน' : 'My Balance'}
        </h1>
      </div>

      {/* Balance Card */}
      <div className="px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6"
          style={{
            background: 'linear-gradient(135deg, #1A1D17 0%, #0B0F0A 100%)',
            border: '1px solid rgba(86, 190, 137, 0.2)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(86, 190, 137, 0.1)' }}
            >
              <Wallet className="w-5 h-5" style={{ color: '#56be89' }} />
            </div>
            <span className="text-gray-400 text-sm">
              {lang === 'th' ? 'ยอดรวม' : 'Total Balance'}
            </span>
          </div>
          
          <h2 
            className="text-4xl font-black text-white mb-2"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            {formatCurrency(balance)}
          </h2>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#56be89' }} />
            <span className="text-sm" style={{ color: '#56be89' }}>
              {lang === 'th' ? '+12.5%' : '+12.5%'} {lang === 'th' ? 'เดือนนี้' : 'this month'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-6">
        <div className="flex gap-3">
          <button 
            className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{ backgroundColor: '#56be89' }}
          >
            <TrendingUp className="w-5 h-5 text-black" />
            <span className="font-bold text-black">
              {lang === 'th' ? 'รับเงิน' : 'Receive'}
            </span>
          </button>
          <button 
            className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1A1D17', border: '1px solid rgba(86, 190, 137, 0.2)' }}
          >
            <TrendingDown className="w-5 h-5" style={{ color: '#56be89' }} />
            <span className="font-bold text-white">
              {lang === 'th' ? 'โอนเงิน' : 'Send'}
            </span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-base font-bold text-white"
            style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
          >
            {lang === 'th' ? 'รายการล่าสุด' : 'Recent Transactions'}
          </h3>
          <button className="text-sm" style={{ color: '#56be89' }}>
            {lang === 'th' ? 'ดูทั้งหมด' : 'See All'}
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div 
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ backgroundColor: '#1A1D17' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: tx.type === 'in' ? 'rgba(86, 190, 137, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                  }}
                >
                  {tx.type === 'in' ? (
                    <TrendingUp className="w-5 h-5" style={{ color: '#56be89' }} />
                  ) : (
                    <TrendingDown className="w-5 h-5" style={{ color: '#EF4444' }} />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{tx.desc}</p>
                  <p className="text-gray-500 text-xs">{tx.date}</p>
                </div>
              </div>
              <p 
                className="font-bold text-sm"
                style={{ color: tx.type === 'in' ? '#56be89' : '#EF4444' }}
              >
                {tx.type === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
