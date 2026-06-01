
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, Wallet, Landmark, CreditCard, TrendingUp, 
  ShieldAlert, Sparkles, Calendar, Bell, ArrowRight, Coins,
  PlusCircle, RefreshCw
} from 'lucide-react';
import type { Account, AccountType, Transaction, CorrelationResult } from '../types';

interface WalletDashboardProps {
  accounts: Account[];
  maskingMode: boolean;
  onToggleMasking: () => void;
  transactions?: Transaction[];
  aiCorrelation?: CorrelationResult | null;
  alertColors?: { border: string; bg: string; text: string; accent: string; pulse: string };
  onChangeTab?: (tab: 'dashboard' | 'ledger' | 'budgets' | 'calendar') => void;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  period: 'monthly' | 'yearly';
  nextBillingDate: string;
  icon: string;
  color: string;
}

const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-spotify', name: 'Spotify Premium', amount: 139, period: 'monthly', nextBillingDate: 'June 05, 2026', icon: '🎵', color: 'text-green-400' },
  { id: 'sub-netflix', name: 'Netflix Premium 4K', amount: 419, period: 'monthly', nextBillingDate: 'June 12, 2026', icon: '🎬', color: 'text-red-500' },
  { id: 'sub-gym', name: 'Fitness Club Membership', amount: 1500, period: 'monthly', nextBillingDate: 'June 18, 2026', icon: '💪', color: 'text-blue-400' },
  { id: 'sub-icloud', name: 'iCloud+ 2TB Storage', amount: 349, period: 'monthly', nextBillingDate: 'June 25, 2026', icon: '☁️', color: 'text-sky-300' },
  { id: 'sub-pro', name: 'DailyStack Pro Member', amount: 175, period: 'monthly', nextBillingDate: 'June 29, 2026', icon: '⚡', color: 'text-[#C0F500]' }
];

export const WalletDashboard: React.FC<WalletDashboardProps> = ({
  accounts,
  maskingMode,
  onToggleMasking,
  transactions = [],
  aiCorrelation = null,
  alertColors,
  onChangeTab
}) => {
  
  // Math: Net Worth = Cash + Bank + Investment - |Credit Card| - |Debts|
  const calculateTotals = () => {
    let assetsSum = 0;
    let liabilitiesSum = 0;

    accounts.forEach(acc => {
      if (acc.balance >= 0) {
        assetsSum += acc.balance;
      } else {
        liabilitiesSum += Math.abs(acc.balance);
      }
    });

    return {
      assetsSum,
      liabilitiesSum,
      netWorth: assetsSum - liabilitiesSum
    };
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'cash':
        return <Wallet className="w-4 h-4 text-[#C0F500]" />;
      case 'bank':
        return <Landmark className="w-4 h-4 text-[#56BE89]" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4 text-[#ff5a52]" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'debt':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatCurrency = (val: number, displayColor = false) => {
    if (maskingMode) return '••••••';
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('th-TH', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(absVal);
    
    return `${val < 0 ? '-' : ''}฿${formatted}`;
  };

  const { assetsSum, liabilitiesSum, netWorth } = calculateTotals();
  const totalMonthlySubs = SAMPLE_SUBSCRIPTIONS.reduce((sum, sub) => sum + sub.amount, 0);

  // Group accounts based on Money Mgr. asset categories
  const cashAccounts = accounts.filter(a => a.type === 'cash');
  const bankAccounts = accounts.filter(a => a.type === 'bank');
  const creditAccounts = accounts.filter(a => a.type === 'credit_card');
  const investmentAccounts = accounts.filter(a => a.type === 'investment');
  const debtAccounts = accounts.filter(a => a.type === 'debt');

  const getGroupSum = (group: Account[]) => {
    return group.reduce((sum, acc) => sum + acc.balance, 0);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Money Mgr. inspired Premium Matte Asset & Net Worth Box */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="relative w-full rounded-[28px] bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-base)] border border-[rgba(192,245,0,0.18)] p-6 overflow-hidden shadow-2xl select-none ds-card-glow-neon"
      >
        {/* Soft elegant glowing overlays */}
        <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-[var(--neon-glow)] rounded-full blur-[50px] opacity-25 pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-30px] w-44 h-44 bg-[var(--neon-glow)] rounded-full blur-[50px] opacity-15 pointer-events-none" />
        
        <div className="relative flex justify-between items-center mb-5">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.15em] text-[var(--neon)] font-black uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[var(--neon)] animate-pulse" /> NET WORTH TRACKER • ทรัพย์สินสุทธิ
          </div>
          
          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={onToggleMasking}
            className="p-2 bg-[var(--surface-3)] border border-[var(--border-mid)] hover:border-[var(--neon)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-md flex items-center justify-center cursor-pointer"
            title={maskingMode ? "Show Balances" : "Mask Balances"}
          >
            {maskingMode ? <Eye className="w-4 h-4 text-[var(--neon)]" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
          </motion.button>
        </div>

        {/* 3-Column Asset / Liability Overview Replicating Money Mgr. (ทรัพย์สิน / หนี้สิน / รวม) */}
        <div className="grid grid-cols-3 gap-2 text-center py-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">ทรัพย์สิน (Assets)</div>
            <div className="text-base font-black font-mono text-[#56BE89] tracking-tight">
              {formatCurrency(assetsSum)}
            </div>
          </div>
          <div className="border-x border-[var(--border-subtle)]">
            <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">หนี้สิน (Liabs)</div>
            <div className="text-base font-black font-mono text-[#ff5a52] tracking-tight">
              {formatCurrency(-liabilitiesSum)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">รวมสุทธิ (Total)</div>
            <div className={`text-base font-black font-mono tracking-tight ${netWorth >= 0 ? 'text-[var(--text-primary)]' : 'text-[#ff5a52]'}`}>
              {formatCurrency(netWorth)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3.5 text-[9px] font-mono text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5 text-[var(--neon)] animate-spin-slow" /> Real-time Cloud Sync
          </span>
          <span className="font-bold">THB (฿) Base Currency</span>
        </div>

      </motion.div>

      {/* 2. AI Intelligence Insight Banner (Caffeine & Sleep correlation log) */}
      {aiCorrelation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180, delay: 0.1 }}
          className={`p-4 border ${alertColors?.border || 'border-[var(--border-subtle)]'} ${alertColors?.bg || 'bg-[var(--bg-elevated)]'} rounded-[20px] shadow-lg space-y-2`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--neon)] flex items-center gap-1.5 font-black">
              <Sparkles className="w-4 h-4 text-[var(--neon)] animate-pulse" /> AI Wealth Insights
            </h4>
            <span className={`text-[8px] font-mono font-black px-2 py-0.5 rounded uppercase ${
              aiCorrelation.alertLevel === 'danger' ? 'bg-[#ff5a52]/20 text-[#ff5a52] border border-[#ff5a52]/30' :
              aiCorrelation.alertLevel === 'warning' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-[#56BE89]/20 text-[#56BE89] border border-[#56BE89]/30'
            }`}>
              {aiCorrelation.alertLevel} Alert
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
            {aiCorrelation.message}
          </p>
        </motion.div>
      )}

      {/* 3. Grouped Account Sections (Money Mgr. Replicas) */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-[var(--text-muted)] font-black flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
          <Coins className="w-4 h-4 text-[var(--neon)]" /> บัญชีทรัพย์สิน (Asset Accounts)
        </h3>

        {/* Group 1: เงินสด (Cash) */}
        {cashAccounts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180, delay: 0.15 }}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[24px] overflow-hidden shadow-lg"
          >
            <div className="flex justify-between items-center bg-[var(--surface-3)] px-5 py-4 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-black text-[var(--text-primary)] tracking-wider flex items-center gap-2 font-space">
                <Wallet className="w-4 h-4 text-[var(--neon)]" /> เงินสด (Cash)
              </span>
              <span className="text-xs font-black font-mono text-[var(--neon)]">
                {formatCurrency(getGroupSum(cashAccounts))}
              </span>
            </div>
            <div className="p-3 space-y-1">
              {cashAccounts.map(acc => (
                <motion.div 
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  key={acc.id} 
                  className="flex justify-between items-center p-3 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-4)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] leading-none">{acc.name}</h4>
                      <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1.5">Cash Ledger</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {formatCurrency(acc.balance)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Group 2: บัญชีธนาคาร (Bank Accounts) */}
        {bankAccounts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180, delay: 0.2 }}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[24px] overflow-hidden shadow-lg"
          >
            <div className="flex justify-between items-center bg-[var(--surface-3)] px-5 py-4 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-black text-[var(--text-primary)] tracking-wider flex items-center gap-2 font-space">
                <Landmark className="w-4 h-4 text-[#56BE89]" /> บัญชีธนาคาร (Savings)
              </span>
              <span className="text-xs font-black font-mono text-[#56BE89]">
                {formatCurrency(getGroupSum(bankAccounts))}
              </span>
            </div>
            <div className="p-3 space-y-1">
              {bankAccounts.map(acc => (
                <motion.div 
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  key={acc.id} 
                  className="flex justify-between items-center p-3 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-4)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] leading-none">{acc.name}</h4>
                      <p className="text-[7px] font-mono text-[#56BE89] uppercase tracking-wider mt-1.5">Checking & Savings</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {formatCurrency(acc.balance)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Group 3: การลงทุน / ทองคำ (Investments) */}
        {investmentAccounts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180, delay: 0.25 }}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[24px] overflow-hidden shadow-lg"
          >
            <div className="flex justify-between items-center bg-[var(--surface-3)] px-5 py-4 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-black text-[var(--text-primary)] tracking-wider flex items-center gap-2 font-space">
                <TrendingUp className="w-4 h-4 text-purple-400" /> การลงทุน / สินทรัพย์ (Investments)
              </span>
              <span className="text-xs font-black font-mono text-purple-400">
                {formatCurrency(getGroupSum(investmentAccounts))}
              </span>
            </div>
            <div className="p-3 space-y-1">
              {investmentAccounts.map(acc => (
                <motion.div 
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  key={acc.id} 
                  className="flex justify-between items-center p-3 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-4)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] leading-none">{acc.name}</h4>
                      <p className="text-[7px] font-mono text-purple-400 uppercase tracking-wider mt-1.5">Yielding {acc.interestRate || 0}% APR</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {formatCurrency(acc.balance)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Group 4: บัตรเครดิต & หนี้สิน (Credit Cards & Debts) */}
        {(creditAccounts.length > 0 || debtAccounts.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180, delay: 0.3 }}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[24px] overflow-hidden shadow-lg"
          >
            <div className="flex justify-between items-center bg-[var(--surface-3)] px-5 py-4 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-black text-[var(--text-primary)] tracking-wider flex items-center gap-2 font-space">
                <CreditCard className="w-4 h-4 text-[#ff5a52]" /> บัตรเครดิต & หนี้สิน (Liabilities)
              </span>
              <span className="text-xs font-black font-mono text-[#ff5a52]">
                {formatCurrency(getGroupSum([...creditAccounts, ...debtAccounts]))}
              </span>
            </div>
            <div className="p-3 space-y-1">
              {[...creditAccounts, ...debtAccounts].map(acc => (
                <motion.div 
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  key={acc.id} 
                  className="flex justify-between items-center p-3 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-4)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] leading-none">{acc.name}</h4>
                      <p className="text-[7px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1.5">
                        {acc.type === 'credit_card' ? `Limit: ฿${acc.creditLimit || 0}` : `Interest: ${acc.interestRate || 0}%`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#ff5a52]">
                    {formatCurrency(acc.balance)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* 4. Rocket Subscriptions & Recurring Bills Tracker */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180, delay: 0.35 }}
        className="ds-glass-card border border-[var(--border-subtle)] p-5 shadow-2xl space-y-4 ds-card-glow-neon"
        style={{
          borderRadius: '28px',
        }}
      >
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3.5">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-[0.15em] text-[var(--neon)] font-black flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--neon)]" /> RECURRING BILLS • สมาชิกรายเดือน
            </h3>
            <p className="text-[8px] font-mono text-[var(--text-muted)] mt-1.5 uppercase font-bold tracking-wider">Rocket Money billing simulator</p>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase font-bold tracking-wider">Monthly Total</span>
            <div className="text-xs font-black font-mono text-[var(--text-primary)] mt-1">
              {formatCurrency(-totalMonthlySubs)}
            </div>
          </div>
        </div>

        {/* Subscription Alerts banner */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-[16px] p-4 flex items-start gap-3">
          <Bell className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="text-[10px] font-mono text-[var(--text-secondary)] leading-relaxed font-semibold">
            <span className="text-blue-400 font-bold uppercase tracking-wider block mb-0.5">Rocket Subscriptions Active</span>
            ระบบจำลองพบรายการชำระเงินที่กำลังก้าวเข้าสู่รอบบิลถัดไปใน 10 วันข้างหน้ารวม 5 รายการ
          </div>
        </div>

        {/* Subscriptions list */}
        <div className="space-y-2">
          {SAMPLE_SUBSCRIPTIONS.map(sub => (
            <motion.div
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              key={sub.id}
              className="flex justify-between items-center p-4 bg-[var(--surface-3)] hover:bg-[var(--surface-4)] border border-[var(--border-subtle)] rounded-2xl transition-all"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-lg shrink-0 select-none">{sub.icon}</span>
                <div>
                  <h4 className="text-xs font-black text-[var(--text-primary)] tracking-wide flex items-center gap-2">
                    {sub.name}
                    {sub.id === 'sub-pro' && (
                      <span className="text-[7px] font-mono font-black px-1.5 py-0.5 bg-[var(--neon-surface)] text-[var(--neon)] border border-[var(--neon)] rounded uppercase">PRO ACTIVE</span>
                    )}
                  </h4>
                  <div className="text-[8px] font-mono text-[var(--text-muted)] mt-1.5 uppercase font-bold tracking-wider">
                    Next due: <span className="text-[var(--text-secondary)]">{sub.nextBillingDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3.5 font-mono">
                <span className="text-xs font-black text-[var(--text-primary)]">
                  {formatCurrency(-sub.amount)}
                </span>
                <motion.button
                  whileTap={{ scale: 0.90 }}
                  onClick={() => alert(`Simulated Rocket cancel trigger for ${sub.name}: ข้อมูลถูกล็อกไว้ใน Sandbox ไม่รองรับการกดยกเลิกบิลจริง`)}
                  className="p-2 bg-[var(--surface-4)] border border-[var(--border-subtle)] hover:border-[var(--neon)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-all cursor-pointer"
                  title="Simulate Cancel Subscription"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

      </motion.div>

    </div>
  );
};
export default WalletDashboard;
