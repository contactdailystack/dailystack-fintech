import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, CloudOff, Lock, Moon,
  Sparkles, RefreshCw
} from 'lucide-react';

import { walletService } from './walletSandboxService';
import type { Account, Transaction, Budget, BudgetVelocity, CorrelationResult } from './types';
import { datingAnalytics } from '../../services/datingAnalytics';

// Components
import { PINLockScreen } from './components/PINLockScreen';
import { WalletDashboard } from './components/WalletDashboard';
import { LedgerAndOCR } from './components/LedgerAndOCR';
import { BudgetPlanner } from './components/BudgetPlanner';
import { FinancialCalendarAndCharts } from './components/FinancialCalendarAndCharts';

export interface WalletSandboxPlaygroundProps {
  onLockPro?: () => void;
}

export const WalletSandboxPlayground: React.FC<WalletSandboxPlaygroundProps> = ({ onLockPro }) => {
  // Lock State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // App States
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetVelocities, setBudgetVelocities] = useState<BudgetVelocity[]>([]);
  const [syncQueue, setSyncQueue] = useState<Transaction[]>([]);
  const [aiCorrelation, setAiCorrelation] = useState<CorrelationResult | null>(null);
  
  // Custom Controls State
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [simulatedSleep, setSimulatedSleep] = useState<number>(5.5); // Default to low sleep to trigger AI warning
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [maskingMode, setMaskingMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'budgets' | 'calendar'>('dashboard');

  // Load and refresh core data
  const refreshData = async () => {
    try {
      const accs = await walletService.getAccounts();
      const txs = await walletService.getTransactions();
      const buds = await walletService.getBudgets();
      const velocities = await walletService.getBudgetVelocity(txs);
      const queue = walletService.getSyncQueue();
      const correlation = await walletService.getSleepCaffeineCorrelation(txs);

      setAccounts(accs);
      setTransactions(txs);
      setBudgets(buds);
      setBudgetVelocities(velocities);
      setSyncQueue(queue);
      setAiCorrelation(correlation);
    } catch (e) {
      console.error('Refresh data error:', e);
    }
  };

  // Initializing Sandbox data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await walletService.initData();
      await refreshData();
      setIsLoading(false);
    };
    init();
  }, []);

  // Update simulated sleep log automatically in localStorage when slider moves
  useEffect(() => {
    const log = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      walletService.logSleep(todayStr, simulatedSleep);
      await refreshData();
    };
    log();
  }, [simulatedSleep]);

  // Synchronizing Queue Trigger when switching Offline to Online
  const handleToggleOnline = async () => {
    const nextOnlineState = !isOnline;
    setIsOnline(nextOnlineState);

    if (nextOnlineState && syncQueue.length > 0) {
      setIsSyncing(true);
      setSyncProgress(10);
      
      // Animate progress simulation
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 25;
        });
      }, 500);

      try {
        await walletService.syncOfflineQueue();
        setSyncProgress(100);
        setTimeout(() => {
          setIsSyncing(false);
          setSyncProgress(0);
          refreshData();
        }, 600);
      } catch (err) {
        clearInterval(interval);
        setIsSyncing(false);
      }
    }
  };

  // Ledger callbacks
  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    setIsLoading(true);
    await walletService.addTransaction(tx, isOnline);
    
    // Telemetry log
    datingAnalytics.trackFeatureUsage('wallet', 'create_transaction', tx.amount, {
      type: tx.type,
      category: tx.category,
      is_online: isOnline
    });

    await refreshData();
    setIsLoading(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    setIsLoading(true);
    await walletService.deleteTransaction(id);
    
    // Telemetry log
    datingAnalytics.trackFeatureUsage('wallet', 'delete_transaction', 1, {
      transaction_id: id
    });

    await refreshData();
    setIsLoading(false);
  };

  // Budget callbacks
  const handleAddBudget = async (category: string, limit: number) => {
    setIsLoading(true);
    await walletService.addBudget(category, limit);
    
    // Telemetry log
    datingAnalytics.trackFeatureUsage('wallet', 'create_budget', limit, {
      category
    });

    await refreshData();
    setIsLoading(false);
  };

  const getAlertLevelColors = (level?: 'normal' | 'warning' | 'danger') => {
    switch (level) {
      case 'danger':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/5',
          text: 'text-red-400',
          accent: 'text-red-500',
          pulse: 'shadow-[0_0_12px_rgba(239,68,68,0.2)] border-red-500'
        };
      case 'warning':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/5',
          text: 'text-amber-400',
          accent: 'text-amber-500',
          pulse: 'border-amber-500'
        };
      case 'normal':
      default:
        return {
          border: 'border-[#56BE89]/30',
          bg: 'bg-[#56BE89]/5',
          text: 'text-gray-400',
          accent: 'text-[#56BE89]',
          pulse: 'border-[#56BE89]'
        };
    }
  };

  const alertColors = getAlertLevelColors(aiCorrelation?.alertLevel);

  // Return PIN Lock screen if verified locked
  if (isLocked) {
    return (
      <PINLockScreen 
        correctPIN="888888" 
        onUnlock={() => {
          setIsLocked(false);
          datingAnalytics.trackFeatureUsage('wallet', 'unlock_pin', 1);
        }} 
      />
    );
  }

  return (
    <div className="w-full text-gray-200 font-sans relative">
      
      {/* Dynamic font loader injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-space { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .select-custom {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
        }
      `}} />

      {/* Main Container */}
      <div className="w-full space-y-5 relative z-10">
        
        {/* TOP HEADER */}
        <header className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[20px] p-4 shadow-md select-none">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--neon-surface)] rounded-lg flex items-center justify-center border border-[var(--neon-glow-sm)]">
              <Sparkles className="w-4 h-4 text-[var(--neon)]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-bold tracking-tight text-white font-space">Smart Wallet</h1>
                <span className="text-[7px] font-mono font-bold px-1 py-0.5 bg-[var(--neon-surface)] text-[var(--neon)] rounded">PRODUCTION</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {/* Controls toggle action */}
            <button
              onClick={() => setShowControls(!showControls)}
              className={`px-2 py-1 border rounded-lg text-[9px] font-bold transition-all active:scale-95 flex items-center gap-1 shadow-md ${
                showControls 
                  ? 'bg-[var(--neon-surface)] border-[var(--neon)] text-[var(--neon)]' 
                  : 'bg-[var(--surface-3)] border-[var(--border-subtle)] text-gray-400 hover:text-white'
              }`}
            >
              🔧 CONTROLS
            </button>
            {/* Quick lock sandboxes action */}
            <button
              onClick={() => setIsLocked(true)}
              className="px-2 py-1 bg-[var(--surface-3)] border border-[var(--border-subtle)] hover:border-gray-600 text-gray-400 hover:text-white rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 shadow-md active:scale-95"
            >
              <Lock className="w-3 h-3" /> LOCK
            </button>
            {/* Lock Pro Paywall reset action */}
            {onLockPro && (
              <button
                onClick={onLockPro}
                className="px-2 py-1 bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 shadow-md active:scale-95"
              >
                🔒 LOCK PRO
              </button>
            )}
          </div>
        </header>

        {/* Sandbox Navigation Tabs (Money Mgr. x Notion Style) */}
        <div className="overflow-x-auto scrollbar-hide py-1">
          <div className="ds-notion-pill-container ds-notion-pill-scroll max-w-max mx-auto">
            {[
              { id: 'ledger', label: 'สมุดบัญชี (Ledger)', icon: 'list_alt' },
              { id: 'calendar', label: 'ปฏิทิน & สถิติ (Stats)', icon: 'pie_chart' },
              { id: 'dashboard', label: 'ทรัพย์สิน (Assets)', icon: 'account_balance_wallet' },
              { id: 'budgets', label: 'งบประมาณ (Budgets)', icon: 'bar_chart' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`ds-notion-pill ${isActive ? 'active' : ''}`}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STATE & PLAYGROUND CONTROL SYSTEM */}
        {showControls && (
          <section className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[20px] p-4 shadow-md space-y-4 animate-fade-up">
          
          {/* 1. Toggle Online/Offline */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--neon)] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Network Simulation
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              สลับจำลองการเชื่อมต่อเครือข่าย เพื่อทดสอบระบบบันทึกออฟไลน์ (Local Cache) และการคลาวด์ซิงก์อัติโนมัติ
            </p>
            
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={handleToggleOnline}
                className={`flex-1 py-2 px-3 rounded-xl border font-mono text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isOnline 
                    ? 'bg-[#56BE89]/10 border-[#56BE89]/30 text-[#56BE89]' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                }`}
              >
                {isOnline ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
                {isOnline ? 'SIMULATE OFFLINE' : 'SIMULATE ONLINE'}
              </button>
              
              <div className="text-right text-[10px] font-mono text-[var(--text-muted)]">
                Queue: <span className={syncQueue.length > 0 ? 'text-amber-500 font-bold' : 'text-[var(--text-muted)]'}>{syncQueue.length} txs</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] w-full my-2" />

          {/* 2. Sleep hours slider (for AI Insights) */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--neon)] flex items-center gap-2">
              <Moon className="w-3.5 h-3.5" /> Sleep Logs Simulator (AI Insight)
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              สไลด์เพื่อปรับปรุงชั่วโมงการนอนและดูแบนเนอร์แจ้งเตือน AI วิเคราะห์ความสัมพันธ์ระหว่างชั่วโมงการนอนและความถี่การซื้อคาเฟอีน
            </p>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="4"
                max="9"
                step="0.5"
                value={simulatedSleep}
                onChange={(e) => setSimulatedSleep(parseFloat(e.target.value))}
                className="w-full accent-[var(--neon)] h-1 bg-[var(--surface-4)] rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-white min-w-[50px] text-right">{simulatedSleep} hrs</span>
            </div>
          </div>
          </section>
        )}

        {/* DYNAMIC SHIMMER LOADER FOR DATABASE FETCHES */}
        {isLoading ? (
          <div className="w-full space-y-4 p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[24px] animate-pulse">
            <div className="h-6 w-1/3 bg-gray-700/30 rounded-md mb-4" />
            <div className="h-36 bg-gray-700/20 rounded-[20px] mb-4 flex flex-col justify-end p-4 space-y-2">
              <div className="h-3 w-1/4 bg-gray-700/30 rounded" />
              <div className="h-6 w-1/2 bg-gray-700/30 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-gray-700/20 rounded-2xl" />
              <div className="h-20 bg-gray-700/20 rounded-2xl" />
            </div>
          </div>
        ) : (
          <main className="w-full relative min-h-[500px]">
            {/* Syncing Queue Alert */}
            {isSyncing && (
              <div className="mb-4 bg-gray-900 border border-[var(--border-subtle)] rounded-xl p-3 flex items-center justify-between font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  <span className="text-gray-300">Synchronizing offline queue with Supabase...</span>
                </div>
                <span className="text-[var(--neon)] font-bold">{syncProgress}%</span>
              </div>
            )}

            {/* Sub-component Router tabs */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full pb-20"
              >
                {activeTab === 'dashboard' && (
                  <WalletDashboard
                    accounts={accounts}
                    transactions={transactions}
                    aiCorrelation={aiCorrelation}
                    alertColors={alertColors}
                    onChangeTab={setActiveTab}
                    maskingMode={maskingMode}
                    onToggleMasking={() => setMaskingMode(!maskingMode)}
                  />
                )}
                {activeTab === 'ledger' && (
                  <LedgerAndOCR
                    accounts={accounts}
                    transactions={transactions}
                    onAddTransaction={handleAddTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                    maskingMode={maskingMode}
                  />
                )}
                {activeTab === 'budgets' && (
                  <BudgetPlanner
                    budgets={budgets}
                    budgetVelocities={budgetVelocities}
                    onAddBudget={handleAddBudget}
                    maskingMode={maskingMode}
                  />
                )}
                {activeTab === 'calendar' && (
                  <FinancialCalendarAndCharts
                    transactions={transactions}
                    maskingMode={maskingMode}
                    accounts={accounts}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        )}

      </div>
    </div>
  );
};
export default WalletSandboxPlayground;
