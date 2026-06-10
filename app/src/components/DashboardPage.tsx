import { useState } from 'react';
import {
  Plus, Minus, ArrowRightLeft, TrendingUp, TrendingDown,
  ArrowRight, ShieldCheck, AlertCircle, X, Wallet,
  Award, Sparkles, Crown, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, StockAsset, Transaction } from '../types';
import { translations, Language } from '../data/translations';
import { updateWalletBalance } from '../services/walletService';

interface DashboardPageProps {
  profile: UserProfile;
  stocks: StockAsset[];
  transactions: Transaction[];
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  onAddTransaction: (t: Transaction) => void;
  onNavigateToUpgrade: () => void;
  lang: Language;
  theme: 'dark' | 'light';
}

export default function DashboardPage({ 
  profile, 
  stocks, 
  transactions, 
  onUpdateProfile, 
  onAddTransaction,
  onNavigateToUpgrade,
  lang
}: DashboardPageProps) {
  const [selectedStock, setSelectedStock] = useState<StockAsset | null>(null);
  
  // Quick Action Modal states
  const [actionModal, setActionModal] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [actionError, setActionError] = useState('');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Proactive interactive toggles representing behavioral controls of V3
  const [coolingLock, setCoolingLock] = useState(false);
  const [autopilotRules, setAutopilotRules] = useState(true);
  const [showRegretSummary, setShowRegretSummary] = useState(false);

  const t = translations[lang];

  // Dynamic Behavior Score Calculation
  // We deduct 10 points for every impulse or stress spending item logged
  const impulseCount = transactions.filter(tx => tx.emotion === 'Impulse').length;
  const stressCount = transactions.filter(tx => tx.emotion === 'Stress').length;
  const baseScore = 96 - (impulseCount * 8) - (stressCount * 5);
  const behaviorScore = Math.max(30, Math.min(100, baseScore));

  const getScoreClassificationEn = (score: number) => {
    if (score >= 90) return { label: 'Autonomous Sovereign', desc: 'Flawless control, absolute asset expansion.' };
    if (score >= 80) return { label: 'Tactical Wealth Builder', desc: 'Excellent safety ratio, minor Wednesday impulses.' };
    if (score >= 70) return { label: 'Conscious Growth Starter', desc: 'Developing strong emotional boundaries.' };
    return { label: 'Vulnerable Dopamine Reactor', desc: 'Frequent stress-induced retail escape triggers.' };
  };

  const getScoreClassificationTh = (score: number) => {
    if (score >= 90) return { label: 'ผู้อภิสิทธิ์ระดับสูงสุด (Sovereign)', desc: 'ควบคุมสติสมบูรณ์แบบ ขยายตัวแปรสินทรัพย์เต็มอัตรา' };
    if (score >= 80) return { label: 'นักสร้างทุนเชิงกลยุทธ์ (Tactical Builder)', desc: 'เกราะความปลอดภัยยอดเยี่ยม มีแรงกระตุ้นวันพุธเล็กน้อย' };
    if (score >= 70) return { label: 'ผู้ฝึกหัดเติบโตรอบคอบ (Conscious)', desc: 'กำลังสร้างกรอบกั้นอารมณ์ในรายการบัญชีหลัก' };
    return { label: 'โหนดเปราะบางต่อสารกระตุ้น (Reactor)', desc: 'มีสภาวะวู่วามชดเชยความเครียดสะสมบ่อยครั้ง' };
  };

  const scoreClass = lang === 'en' ? getScoreClassificationEn(behaviorScore) : getScoreClassificationTh(behaviorScore);

  // Sparkline generator helper
  const drawSparkline = (history: number[], isPositive: boolean, uniqueId: string) => {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = isPositive ? '#10B981' : '#EF4444';
    const gradientId = `sp-grad-${uniqueId}`;

    return (
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <polygon
          fill={`url(#${gradientId})`}
          points={`0,${height} ${points} ${width},${height}`}
        />
      </svg>
    );
  };

  // Detailed modal chart rendering
  const drawDetailedChart = (history: number[], isPositive: boolean) => {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const width = 450;
    const height = 150;
    
    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = isPositive ? '#10B981' : '#EF4444';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className={`${isPositive ? 'drop-shadow-[0_4px_12px_rgba(16,185,129,0.15)]' : 'drop-shadow-[0_4px_12px_rgba(239,68,68,0.15)]'}`}
        />
      </svg>
    );
  };

  // Transaction quick handlers — persist to Supabase + update local state
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    const amt = parseFloat(actionAmount);
    
    if (isNaN(amt) || amt <= 0) {
      setActionError(t.actionAmountError);
      return;
    }

    if (actionModal === 'withdraw' && amt > profile.balance) {
      setActionError(t.withdrawError);
      return;
    }

    if (actionModal === 'transfer' && amt > profile.balance) {
      setActionError(t.transferError);
      return;
    }

    if (actionModal === 'transfer' && !transferRecipient.trim()) {
      setActionError(t.transferRecipientError);
      return;
    }

    let newBalance = profile.balance;
    let label = '';
    
    if (actionModal === 'deposit') {
      newBalance += amt;
      label = t.depositSuccess.replace('${amount}', amt.toLocaleString());
    } else if (actionModal === 'withdraw') {
      newBalance -= amt;
      label = t.withdrawSuccess.replace('${amount}', amt.toLocaleString());
    } else {
      newBalance -= amt;
      label = t.transferSuccess.replace('${amount}', amt.toLocaleString()).replace('{recipient}', transferRecipient);
    }

    // Persist to Supabase wallet (fire-and-forget)
    await updateWalletBalance(newBalance);

    // Update local UI state
    onUpdateProfile({ balance: newBalance });
    
    onAddTransaction({
      id: `tx_${Date.now()}`,
      merchant: actionModal === 'deposit' ? (lang === 'en' ? 'Core Inbound Funding' : 'กระแสฝากสมทบห้องนิรภัย') : (actionModal === 'transfer' ? `${lang === 'en' ? 'Transfer to' : 'โอนไปยัง'} ${transferRecipient}` : (lang === 'en' ? 'Cash Withdrawal' : 'ถอนกระแสเสรีออกจากโฮสต์')),
      category: actionModal === 'deposit' ? 'Deposit' : (actionModal === 'transfer' ? 'Transfer' : 'Withdrawal'),
      amount: actionModal === 'deposit' ? amt : -amt,
      date: new Date().toISOString().split('T')[0],
      emotion: 'Value',
      why: t.quickActionPrompt,
      status: 'completed'
    });

    setActionModal(null);
    setActionAmount('');
    setTransferRecipient('');
    setShowNotification(label);
    setTimeout(() => setShowNotification(null), 4000);
  };

  return (
    <div id="dashboard-viewport" className="space-y-6 md:space-y-8 animate-slide-up text-left">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 border px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] cursor-pointer backdrop-blur-lg bg-[#18191B] border-[#C7FF2E]/40 text-white"
            onClick={() => setShowNotification(null)}
          >
            <div className="w-2.5 h-2.5 rounded-full animate-ping bg-[#C7FF2E]" />
            <span className="font-mono text-xs uppercase tracking-wider">{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. FINANCIAL SNAPSHOT ROW (Apple Wallet layout style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="command-snapshot-grid">
        
        {/* Left Card: Core Balance Capsule */}
        <div className="col-span-1 lg:col-span-7 border rounded-[30px] p-6 md:p-8 relative overflow-hidden flex flex-col justify-between min-h-[290px] bg-[#1A1D26]/90 border-[#2D313E] shadow-xl hover:shadow-[#C7FF2E]/5 hover:-translate-y-0.5 hover:border-[#C7FF2E]/40 duration-300 transition-all breathing-aura-card z-axis-primary" id="cmd-balance-card">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[340px] h-[340px] pointer-events-none opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-600 animate-spin-slow">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
 
          <div className="flex items-center justify-between z-10" id="balance-head-area">
            <div className="space-y-1 text-left">
              <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#C7FF2E]/30 font-bold bg-[#C7FF2E]/10 text-[#C7FF2E] animate-pulse">
                {t.reserveVault}
              </span>
              <p className="text-xs mt-2 text-zinc-400">{t.coreBalance}</p>
            </div>
 
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[#232733] border-[#2D313E]" id="vault-plan-pill">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest font-extrabold text-[#C7FF2E]">
                {profile.plan !== 'basic' && <Crown className="w-3 h-3 text-amber-400" />}
                {profile.plan === 'basic'
                  ? (lang === 'en' ? 'BASIC SYSTEM NODE' : 'โคลนนิ่งระบบเบสิค')
                  : (lang === 'en' ? 'PREMIUM SOVEREIGN ACTIVE' : 'ระบบพรีเมียมทำงานปกติ')}
              </span>
            </div>
          </div>
 
          <div className="py-5 z-10 text-left" id="balance-readout">
            <div className="text-4xl md:text-6xl font-extrabold font-display tracking-tight leading-none text-white hover:scale-[1.01] transition-transform duration-200 text-primary-highlight">
              ${profile.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C7FF2E] animate-bounce" /> 
              {lang === 'en' ? 'Sovereign Protocol Active (AES-256)' : 'โปรโตคอลรักษาความปลอดภัยเสร็จสิ้น (AES-256)'}
            </p>
          </div>
 
          {/* Quick Vault Action pills */}
          <div className="grid grid-cols-3 gap-3 pt-3 z-10 border-t border-slate-800/80" id="snapshot-action-triggers">
            <button
              id="btn-vault-deposit"
              onClick={() => setActionModal('deposit')}
              className="border border-[#2D313E] bg-[#232733] hover:bg-[#25282D] hover:scale-[1.03] active:scale-95 duration-150 transition-all text-zinc-200 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 rounded-2xl cursor-pointer group"
            >
              <Plus className="w-4 h-4 text-emerald-400 group-hover:rotate-90 duration-300" />
              <span className="font-display font-medium text-xs text-zinc-300">{t.deposit}</span>
            </button>
  
            <button
              id="btn-vault-withdraw"
              onClick={() => setActionModal('withdraw')}
              className="border border-[#2D313E] bg-[#232733] hover:bg-[#25282D] hover:scale-[1.03] active:scale-95 duration-150 transition-all text-zinc-200 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 rounded-2xl cursor-pointer"
            >
              <Minus className="w-4 h-4 text-red-400" />
              <span className="font-display font-medium text-xs text-zinc-300">{t.withdraw}</span>
            </button>
  
            <button
              id="btn-vault-transfer"
              onClick={() => setActionModal('transfer')}
              className="bg-gradient-to-r from-[#C7FF2E] to-[#51FF85] text-black font-black hover:from-white hover:to-white hover:scale-[1.03] active:scale-95 duration-150 transition-all py-3 flex flex-col sm:flex-row items-center justify-center gap-2 rounded-2xl cursor-pointer shadow-md shadow-[#C7FF2E]/10"
            >
              <ArrowRightLeft className="w-4 h-4 text-black font-extrabold" />
              <span className="font-display font-black text-xs">{t.transfer}</span>
            </button>
          </div>
        </div>

        {/* Right Card: Dynamic Portfolio Total */}
        <div className="col-span-1 lg:col-span-5 border rounded-[30px] p-6 relative overflow-hidden flex flex-col justify-between bg-[#1A1D26]/90 border-[#2D313E] shadow-xl hover:shadow-[#C7FF2E]/5 hover:-translate-y-0.5 hover:border-[#C7FF2E]/40 duration-300 transition-all z-axis-primary" id="cmd-portfolio-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C7FF2E]/10 rounded-bl-[100px] pointer-events-none" />
          
          <div className="space-y-3 text-left">
            <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-[#C7FF2E] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#C7FF2E] animate-bounce" />
              {t.portfolioTitle}
            </span>
            <p className="text-xs text-zinc-400">{t.totalPortfolio}</p>
            <div className="text-3xl font-extrabold font-display text-white">
              ${profile.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#C7FF2E]/10 text-[#C7FF2E]">
              <TrendingUp className="w-3.5 h-3.5" /> {t.growthLabel}
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-[#2D313E] bg-[#232733]/60 mt-4 flex items-center justify-between text-left hover:border-[#C7FF2E]/30 duration-200 transition-all" id="tease-portfolio-upgrade">
            <div className="space-y-1 flex-1">
              <span className="font-mono text-[8px] uppercase tracking-widest font-extrabold text-[#C7FF2E]">
                {lang === 'en' ? 'MIND OVER METRICS' : 'พิมพ์เขียวอัจฉริยะ'}
              </span>
              <h4 className="text-xs font-bold text-white leading-tight mt-1">
                {lang === 'en' ? 'Unlock Cognitive Portfolio Insights' : 'วิเคราะห์ขีดพารามิเตอร์อัจฉริยะ'}
              </h4>
              <p className="text-[10px] text-zinc-400 leading-snug">
                {lang === 'en' ? 'Align portfolio actions with stress-tested indicators.' : 'จำลองแรงต้านของพอร์ตเมื่อเผชิญสภาพอารมณ์บีบคั้น'}
              </p>
            </div>
            <button
              id="btn-upgrade-tease"
              onClick={onNavigateToUpgrade}
              className="text-[10px] font-mono font-bold text-black bg-[#C7FF2E] hover:bg-white px-3.5 py-2 rounded-xl transition cursor-pointer hover:scale-105 active:scale-95 duration-200"
            >
              {lang === 'en' ? 'UPGRADE' : 'อัปเกรด'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CORE METRICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="behavioral-score-and-insight-row">
        {/* Left Side: Gorgeous Gamified Behavior Score Ring */}
        <div className="col-span-1 md:col-span-5 border rounded-[30px] p-6 bg-[#1A1D26]/90 border-[#2D313E] shadow-xl hover:shadow-[#C7FF2E]/5 hover:-translate-y-0.5 duration-300 transition-all relative overflow-hidden flex flex-col justify-between" id="score-ring-box">
          <div className="text-left flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-extrabold text-sm text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#C7FF2E] animate-bounce" />
                {lang === 'en' ? 'Behavior Command Score' : 'คะแนนกำหนดพฤติกรรมการเงิน'}
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono tracking-tight">
                {lang === 'en' ? 'BASED ON EMOTIONAL STENCILS' : 'คำนวณจากอัตราดัชนีทางอ้อมแห่งสติสัมปชัญญะ'}
              </p>
            </div>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-[#C7FF2E]/30 text-[#C7FF2E] bg-[#C7FF2E]/5 animate-pulse">
              XP BOOST x1.2
            </span>
          </div>

          {/* Large circular/doughnut graphic for score */}
          <div className="py-6 flex items-center justify-center gap-6" id="score-ring-graphic">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#232733"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="#C7FF2E"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - behaviorScore / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 filter drop-shadow-[0_0_8px_rgba(199,255,46,0.3)] animate-pulse"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white font-mono leading-none">{behaviorScore}</span>
                <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">/ 100</span>
              </div>
            </div>

            <div className="text-left space-y-1.5 flex-1">
              <span className="font-mono text-[8px] text-[#C7FF2E] uppercase tracking-widest font-black block">
                {lang === 'en' ? 'BEHAVIOR GRADE' : 'เกรดพฤติกรรม'}
              </span>
              <h4 className="font-display font-extrabold text-sm text-zinc-200 leading-tight">
                {scoreClass.label}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {scoreClass.desc}
              </p>
            </div>
          </div>

          {/* Gamification streak feedback footer */}
          <div className="border-t border-[#2D313E]/60 pt-4 flex justify-between items-center text-xs font-mono" id="score-streak-bar">
            <span className="text-zinc-400">{lang === 'en' ? 'Impulse Outflows Logged' : 'ธุรกรรมวู่วามชดเชยตึงเครียด'}</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${impulseCount > 1 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <X className="w-3 h-3" /> {impulseCount} {lang === 'en' ? 'Trigger Checks' : 'สะกิดใจพลาด'}
            </span>
          </div>
        </div>

        {/* Right Side: Today's Insight (Answers 'What is most important today?') */}
        <div className="col-span-1 md:col-span-7 border rounded-[30px] p-6 bg-[#1A1D26]/90 border-[#2D313E] shadow-xl hover:shadow-[#C7FF2E]/5 hover:-translate-y-0.5 duration-300 transition-all relative overflow-hidden flex flex-col justify-between" id="today-insight-box">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[120px] pointer-events-none" />
          
          <div className="space-y-3.5 text-left z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#C7FF2E] font-bold">
                {lang === 'en' ? "Today's Behavioral Command" : 'สัญชาตญาณบทวิเคราะห์วันนี้'}
              </span>
            </div>

            <h3 className="font-display font-black text-lg text-white leading-tight uppercase tracking-tight">
              {lang === 'en' ? 'Cortisol Wave Block Loaded' : 'คาลิเบรตปิดรอยรั่วความเสี่ยงเย็นวันอาทิตย์'}
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {lang === 'en' 
                ? 'Sunday evening decompressions trigger minor online impulse subscriptions. Recommendation: Activate the Cooling Lock to prevent dopamine spending spikes.'
                : 'ความอ่อนล้าเย็นวันอาทิตย์มักจูงใจให้เผลอสมัครบริการออนไลน์โดยไม่จำเป็น แนะนำให้เปิด "Cooling Lock" สยบวงจรกระตุ้นชั่วคราว'}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-10" id="insight-toggles">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400">
                {lang === 'en' ? 'Cooling Lock-out' : 'เปิดระบบแช่เกราะ 24 ชม.'}
              </span>
              <button
                id="btn-toggle-cooling-lock"
                onClick={() => {
                  setCoolingLock(!coolingLock);
                  setShowNotification(
                    lang === 'en' 
                      ? `Cooling lock ${!coolingLock ? 'ENABLED' : 'DISABLED'} for prospective consumer purchases.` 
                      : `เปิดเกราะสกัดชะลอใจ ${!coolingLock ? 'ทำงานแล้ว' : 'ปิดการทำงาน'}`
                  );
                  setTimeout(() => setShowNotification(null), 4000);
                }}
                className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7FF2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D0E] cursor-pointer ${coolingLock ? 'bg-[#C7FF2E]' : 'bg-[#232733]'}`}
              >
                <span className={`absolute left-0.5 top-0.5 w-4.5 h-4.5 rounded-full bg-black transition-transform duration-300 ${coolingLock ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </div>

            <span className="flex items-center gap-1 text-[10px] font-mono font-black tracking-widest uppercase">
              {coolingLock
                ? <><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {lang === 'en' ? '24H LOCK ACTIVE' : 'เปิดความคุ้มภัยสูงสุด'}</>
                : <><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> {lang === 'en' ? 'RISK LEVEL: MODERATE' : 'ระดับความปลอดภัยต่ำ'}</>
              }
            </span>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE GOALS (Behavioral targets & Autopilot rules) */}
      <div className="border rounded-[32px] p-6 bg-[#1A1D26]/90 border-[#2D313E] shadow-xl space-y-5" id="active-goals-layout">
        <div className="text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-extrabold text-lg text-white">
              {lang === 'en' ? 'Tactical Behavioral Goals' : 'เป้าหมายความประพฤติและวินัย'}
            </h3>
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
              {lang === 'en' ? 'PROVING GROWTH OVER NETWORTH' : 'พิสูดการอัปเกรดระดับวินัยมากกว่าการล่อหน้าหาผลกำไร'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-300">
              {lang === 'en' ? 'Auto-Invest coefficient (10%)' : 'ตัวคูณลงพอร์ตอัตโนมัติ (10%)'}
            </span>
            <button
              id="btn-toggle-autopilot"
              onClick={() => {
                setAutopilotRules(!autopilotRules);
                setShowNotification(
                  lang === 'en' 
                    ? `Autopilot rules ${!autopilotRules ? 'ARMED' : 'DISARMED'}.` 
                    : `ระบบหักทวีคูณลงทุนอัตโนมัติ ${!autopilotRules ? 'เปิดการทำงาน' : 'ปิดการทำงาน'}`
                );
                setTimeout(() => setShowNotification(null), 4000);
              }}
              className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 cursor-pointer ${autopilotRules ? 'bg-[#C7FF2E]' : 'bg-[#232733]'}`}
            >
              <span className={`absolute left-0.5 top-0.5 w-4.5 h-4.5 rounded-full bg-black transition-transform duration-300 ${autopilotRules ? 'translate-x-[18px]' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="goals-bento-grid">
          {/* Goal 1: Sunday Impulse Bounded */}
          <div className="p-5 rounded-2xl bg-[#232733]/65 border border-[#2D313E] hover:border-[#C7FF2E]/30 transition-all duration-300 hover:shadow-lg flex flex-col justify-between text-left relative overflow-hidden space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-wider block">Target 01</span>
              <h4 className="font-display font-extrabold text-sm text-zinc-200">{lang === 'en' ? 'Weekend Impulse Bounded' : 'จำกัดธุรกรรมสะกิดใจสุดสัปดาห์'}</h4>
              <p className="text-[11px] text-zinc-400 leading-snug">
                {lang === 'en' ? 'Keep digital impulse shopping under 1 triggers per weekend.' : 'ควบคุมการสมัครหรือระบายความเค้นไม่เกิน 1 หนในวันหยุด'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#2D313E]/80 flex items-center justify-between text-[10px] font-mono text-zinc-300">
              <span>{lang === 'en' ? 'Current State:' : 'สถานะสัปดาห์นี้:'}</span>
              <span className={impulseCount <= 1 ? "text-emerald-400 font-bold" : "calm-warning"}>
                {impulseCount} / 1 {lang === 'en' ? 'impulses' : 'รายการ'}
              </span>
            </div>
          </div>

          {/* Goal 2: Stress escapes buffer */}
          <div className="p-5 rounded-2xl bg-[#232733]/65 border border-[#2D313E] hover:border-[#C7FF2E]/30 transition-all duration-300 hover:shadow-lg flex flex-col justify-between text-left relative overflow-hidden space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider block">Target 02</span>
              <h4 className="font-display font-extrabold text-sm text-zinc-200">{lang === 'en' ? 'Stress Retail Buffer' : 'สัญชาตญาณกันความเค้นไหลรั่ว'}</h4>
              <p className="text-[11px] text-zinc-400 leading-snug">
                {lang === 'en' ? 'Cooling delay 24h triggers to filter high anxiety purchases.' : 'ชะลอใจเปิดระบบ Cooling lock เพื่อเว้นระยะสติ 24 ชั่วโมง'}
              </p>
            </div>
            <div className="pt-2 border-t border-[#2D313E]/80 flex items-center justify-between text-[10px] font-mono text-zinc-300">
              <span>{lang === 'en' ? 'Cooling Screen:' : 'การปิดดีเลย์แช่แข็ง:'}</span>
              <span className={coolingLock ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                {coolingLock ? (lang === 'en' ? 'ACTIVE PROTECTION' : 'เปิดเกราะป้องกัน') : (lang === 'en' ? 'STBY / DEACTIVATED' : 'ยังไม่เปิดเกราะ')}
              </span>
            </div>
          </div>

          {/* Goal 3: Autopilot accumulation */}
          <div className="p-5 rounded-2xl bg-[#232733]/65 border border-[#2D313E] hover:border-[#C7FF2E]/30 transition-all duration-300 hover:shadow-lg flex flex-col justify-between text-left relative overflow-hidden space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-[#C7FF2E] font-bold uppercase tracking-wider block">Target 03</span>
              <h4 className="font-display font-extrabold text-sm text-zinc-200">{lang === 'en' ? 'Compound Auto Increment' : 'อัตราหักทวีคูณดันพอร์ตบิวเดอร์'}</h4>
              <p className="text-[11px] text-zinc-400 leading-snug">
                {lang === 'en' ? 'Direct 10% of overall inbounds straight into premium indexes.' : 'ส่งกระแสเงิน 10% จากทุกโหนดจ้างงานออโต้เข้าสะสม AAPL อัตโนมัติ'}
              </p>
            </div>

            <div className="pt-2 border-t border-[#2D313E]/80">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-300 mb-1">
                <span>{lang === 'en' ? 'Autopilot Setup:' : 'สถานะโปรเจ็กต์:'}</span>
                <span className={autopilotRules ? "text-[#C7FF2E] font-bold" : "text-zinc-500"}>
                  {autopilotRules ? (lang === 'en' ? 'ARMED & ACTIVE' : 'พร้อมใช้งาน') : (lang === 'en' ? 'STANDBY' : 'สแตนด์บาย')}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#12141C] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${autopilotRules ? 'bg-[#C7FF2E]' : 'bg-zinc-800'}`} style={{ width: autopilotRules ? '100%' : '20%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI SUGGESTION & CHAT PROMPTS MODULE */}
      <div className="border rounded-[32px] p-6 bg-gradient-to-br from-[#1E2235] via-[#191C28] to-[#13151D] border-[#373B4D] shadow-2xl shadow-[#131416]/90 hover:border-[#C7FF2E]/30 duration-300 transition-all space-y-5 animate-fade-in" id="ai-strategic-advisor-area">
        <div className="text-left flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#C7FF2E]/10 border border-[#C7FF2E]/25 flex items-center justify-center text-[#C7FF2E]">
            <Sparkles className="w-5 h-5 animate-spin-slow text-[#C7FF2E]" />
          </div>
          <div>
            <span className="font-mono text-[8.5px] text-[#C7FF2E] uppercase tracking-widest font-black block">
              {lang === 'en' ? 'AI FINANCIAL OPERATING SYSTEM' : 'ระบบวิเคราะห์ปัญญาประดิษฐ์เสมือน'}
            </span>
            <h3 className="font-display font-black text-lg text-white pt-1">
              {lang === 'en' ? 'Tactical Action Recommendations' : 'คำแนะนำเชิงกลยุทธ์จำลองพฤติกรรม'}
            </h3>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              {lang === 'en' 
                ? 'Your cognitive profile reports Wed night tech triggers are high. Review potential scenarios below to calibrate core buffer protection.'
                : 'ข้อมูลระบุว่าคุณคุมสาร Dopamine ยามช้อปปิ้งออนไลน์ช่วงดึกได้ปานกลาง คลิกเรียกฟีเจอร์จำลองตัวแทนดิจิทัลเพื่อคำนวณการเติบโตสปีดสูงสุด'}
            </p>
          </div>
        </div>

        {/* Suggestion action prompt buttons list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="proactive-prompts-matrix">
          <button
            id="btn-action-twin"
            onClick={() => {
              setShowNotification(
                lang === 'en' 
                  ? 'Generating Money Twin projections... Model predicted $148,000 extra compounding over 15 years by filtering stress gadget spending!'
                  : 'จำลองตัวตนอัจฉริยะเสร็จสิ้น... จะเพิ่มมูลค่าทบทุนรวมอีกกว่า $148,000 ในเวลา 15 ปีจากการควบคุมแรงกระตุ้น!'
              );
              setTimeout(() => setShowNotification(null), 6000);
            }}
            className="p-4 rounded-xl border border-[#2D313E] bg-[#232733] hover:bg-[#2A2E3D] hover:border-[#C7FF2E]/40 hover:scale-[1.02] active:scale-95 duration-150 transition-all text-left cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[8px] text-[#C7FF2E] uppercase font-bold">{lang === 'en' ? 'MONEY TWIN' : 'ตัวแทนคู่แฝดดิจิทัล'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#C7FF2E] transition-colors" />
            </div>
            <p className="text-xs font-bold text-zinc-200 mt-1">{lang === 'en' ? 'Project Money Twin Potential' : 'จำลองเปรียบเทียบพฤติกรรมคู่แฝด'}</p>
          </button>

          <button
            id="btn-action-simulation"
            onClick={() => {
              setShowNotification(
                lang === 'en' 
                  ? 'Running Scenario Simulator: Adjusting work stress from high to moderate reduces impulse technology purchases by 91%. Expected average yearly cushion saved is $3,200!'
                  : 'รันข้อมูลคัดแรงเร้า: การเปลี่ยนเวลาย้ายการซื้อของฟุ่มเฟือยจะเซฟเงินออมได้สูงถึง $3,200 ต่อปี'
              );
              setTimeout(() => setShowNotification(null), 6000);
            }}
            className="p-4 rounded-xl border border-[#2D313E] bg-[#232733] hover:bg-[#2A2E3D] hover:border-[#C7FF2E]/40 hover:scale-[1.02] active:scale-95 duration-150 transition-all text-left cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[8px] text-emerald-400 uppercase font-bold">{lang === 'en' ? 'SCENARIO MATRIX' : 'จำลองสภาวะแวดล้อมแปรผัน'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-xs font-bold text-zinc-200 mt-1">{lang === 'en' ? 'Simulate Cortisol Trigger Matrix' : 'จำลองตัวแปรสมองยามเกิดความเค้น'}</p>
          </button>

          <button
            id="btn-action-regret"
            onClick={() => {
              setShowRegretSummary(!showRegretSummary);
            }}
            className="p-4 rounded-xl border border-[#2D313E] bg-[#232733] hover:bg-[#2A2E3D] hover:border-[#C7FF2E]/40 hover:scale-[1.02] active:scale-95 duration-150 transition-all text-left cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[8px] text-amber-500 uppercase font-bold">{lang === 'en' ? 'REGRET ANALYSIS' : 'วิเคราะห์สัดส่วนความเสียใจ'}</span>
              <span className="text-[9px] font-mono text-zinc-400">{lang === 'en' ? 'Toggle Views' : 'เปิดดูผลสรุป'}</span>
            </div>
            <p className="text-xs font-bold text-zinc-200 mt-1">{lang === 'en' ? 'Scan My Unplanned Spend Regrets' : 'ตรวจสอบรายงานความเสียใจภายหลัง'}</p>
          </button>
        </div>

        {showRegretSummary && (
          <div className="p-4 rounded-xl bg-[#121415] border border-amber-500/20 text-left text-xs text-zinc-300 leading-snug space-y-2 mt-3 animate-fade-in" id="regrets-summary-panel">
            <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {lang === 'en' ? 'LIVE DOPAMINE LEAK AUDIT REPORT' : 'สรุปพอร์ตรั่วไหลจากการระบายอารมณ์ชั่วคราว'}
            </p>
            <p>
              {lang === 'en' 
                ? `You mapped ${impulseCount} unplanned impulses ($${(impulseCount * 120).toLocaleString()}) and ${stressCount} stress retail escapes. If we arrest this vector, you compound $${(impulseCount * 1500).toLocaleString()} more inside MSFT over five cycles.`
                : `ระบบสลักอารมณ์ตรวจพบ รายการวู่วามชั่วคราว ${impulseCount} หน รวมคิดเป็นอัตราไหลออก $${(impulseCount * 120).toLocaleString()} การตัดรอยแยกตรงนี้ทิ้งจะมีพอร์ต MSFT ทะลวงกำไรเพิ่ม $${(impulseCount * 1500).toLocaleString()} ใน 5 ปีข้างหน้า`}
            </p>
          </div>
        )}
      </div>

      {/* 5. PORTFOLIO & STOCK PERFORMANCE ASSETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="home-stock-ledger-grid">
        
        {/* Interactive Stock List */}
        <div className="col-span-1 lg:col-span-5 border rounded-[32px] p-6 bg-[#1A1D26]/90 border-[#2D313E] shadow-xl z-axis-secondary" id="stock-list-home">
          <div className="flex items-center justify-between mb-6" id="performance-header">
            <div className="text-left">
              <h3 className="font-display font-extrabold text-lg text-white">{t.assetPerformance}</h3>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider">{t.liveFeed}</p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold text-[#C7FF2E] bg-[#C7FF2E]/10 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7FF2E] animate-ping" />
              {t.sparksLabel}
            </span>
          </div>

          <div className="space-y-3" id="stock-items-container">
            {stocks.map((stock) => {
              const isPositive = stock.percentChange >= 0;
              return (
                <div
                  id={`home-stock-${stock.symbol}`}
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className="p-4 border rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer bg-[#232733] border-[#2D313E] hover:bg-[#2F3446] hover:border-[#C7FF2E]/40 hover:scale-[1.02] active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border flex items-center justify-center font-display font-bold text-xs bg-[#1A1D26] border-[#2D313E] text-zinc-300">
                      {stock.symbol}
                    </div>
                    <div className="text-left">
                      <h4 className="font-display font-bold text-sm text-white">{stock.symbol}</h4>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[120px]">{stock.name}</p>
                    </div>
                  </div>

                  <div className="px-2" id={`sparkline-${stock.symbol}`}>
                    {drawSparkline(stock.history, isPositive, stock.symbol)}
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold block text-white">
                      ${stock.price.toFixed(2)}
                    </span>
                    <span className={`text-[11px] font-mono font-bold flex items-center justify-end gap-0.5 ${isPositive ? 'text-[#C7FF2E]' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{stock.percentChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Home Overview Guide: Answers 'What are the transformational benefits of Pro/Elite plan?' */}
        <div className="col-span-1 lg:col-span-7 border rounded-[32px] p-6 bg-[#1A1D26]/90 border-[#2D313E] shadow-xl text-left flex flex-col justify-between h-full hover:border-[#C7FF2E]/30 duration-300 transition-all z-axis-secondary" id="conversion-blueprint-home">
          <div className="space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#2D313E] font-bold bg-[#232733] text-zinc-300">
              {lang === 'en' ? 'EVOLUTION ROADMAP' : 'แผนพัฒนาศักยภาพด้านอภิสิทธิ์'}
            </span>
            <h3 className="font-display font-black text-xl text-white leading-tight">
              {lang === 'en' ? 'Shift from Tracking to Transformation' : 'ยกระดับการบันทึก บายพาสสู่วิถีควบคุมสติอัจฉริยะ'}
            </h3>
            
            <div className="space-y-3.5 pr-1 mt-4" id="transformation-flows">
              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-[#232733]/40 border border-[#2D313E]/40 hover:bg-[#232733]/80 hover:border-[#2D313E] duration-200 transition-all">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-xs text-white">{lang === 'en' ? 'Awareness: Know where money goes' : 'ด่านที่ 1: ตระหนักรู้ (รู้จุดรั่วไหล)'}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{lang === 'en' ? 'Already achieved in your default Basic node. You know what you spend.' : 'ผ่านพ้นแล้วบนโหนดพื้นฐานนี้ คุณรู้แน่ชัดว่าเศษเงินหมดลิ่วไปกับสิ่งใด'}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-[#232733]/40 border border-[#2D313E]/40 hover:bg-[#232733]/80 hover:border-[#2D313E] duration-200 transition-all">
                <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-xs text-white">{lang === 'en' ? 'Pro Plan: Understand why you spend' : 'ด่านที่ 2: ความเข้าใจเชิงลึก (คัดแรงอารมณ์)'}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{lang === 'en' ? 'Unshackle Money Radar calibration, Emotional Spend diagnostics and narrative stories.' : 'ประเมินดีเลย์อารมณ์ชั่ววูบ (Impulse), สกัดกั้นอาการเสพโดปามีนทดแทนความเปราะบาง'}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3.5 rounded-xl bg-[#232733]/40 border border-[#2D313E]/40 hover:bg-[#232733]/80 hover:border-[#2D313E] duration-200 transition-all">
                <span className="w-5 h-5 rounded-full bg-[#C7FF2E]/10 text-[#C7FF2E] border border-[#C7FF2E]/20 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-xs text-white">{lang === 'en' ? 'Elite Plan: Transform financial trajectory' : 'ด่านที่ 3: ยกวิวัฒนาการสติ (เปลี่ยนชีวิตระยะยาว)'}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{lang === 'en' ? 'AI Financial Coach integration, scenario simulated twin analysis, and infinite recall.' : 'รันเกราะจำลองพาร์ทเนอร์สร้างวินัยพฤติกรรม ตอกย้ำความแข็งแกร่งพอร์ตอัจฉริยะ'}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            id="btn-upgrade-convert-home"
            onClick={onNavigateToUpgrade}
            className="w-full mt-6 bg-gradient-to-r from-[#C7FF2E] to-[#51FF85] text-black font-display font-black text-xs py-3.5 text-center rounded-2xl uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#C7FF2E]/10 hover:from-white hover:to-white hover:scale-[1.01] active:scale-98"
          >
            {lang === 'en' ? 'Activate Sovereign Operating System' : 'เปิดอธิปไตยทางการเงินขั้นวิวัฒนาการอัจฉริยะ'}
          </button>
        </div>

      </div>

      {/* Detail Pop-up View for Selected Stocks */}
      <AnimatePresence>
        {selectedStock && (
          <div id="stock-detail-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border rounded-[32px] p-6 max-w-lg w-full relative shadow-2xl bg-[#1E2230] border-[#373C52] text-white"
              id="stock-detail-modal"
            >
              <button
                id="btn-close-stock-modal"
                onClick={() => setSelectedStock(null)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#232733] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer hover:scale-105 active:scale-95 duration-150"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4" id="modal-content">
                <div className="text-left">
                  <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#C7FF2E]/35 font-bold bg-[#C7FF2E]/10 text-[#C7FF2E] animate-pulse">
                    {t.assetAnalysis}
                  </span>
                  <div className="flex items-center justify-between mt-3">
                    <h2 className="font-display font-extrabold text-2xl tracking-tight">{selectedStock.symbol}</h2>
                    <span className="text-zinc-400 text-xs font-mono">{selectedStock.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl border bg-[#232733] border-[#2D313E] text-left" id="modal-vital-stats">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">{t.unitSharePrice}</p>
                    <p className="text-base font-mono font-bold text-white">${selectedStock.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">{t.percentageMetric}</p>
                    <p className={`text-base font-mono font-bold flex items-center gap-1 ${selectedStock.percentChange >= 0 ? 'text-[#C7FF2E]' : 'text-red-400'}`}>
                      {selectedStock.percentChange >= 0 ? <TrendingUp className="w-4 h-4 animate-bounce" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedStock.percentChange >= 0 ? '+' : ''}{selectedStock.percentChange.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border bg-[#12141C] border-[#2D313E]" id="modal-chart-wrap">
                  <p className="font-mono text-[8px] text-zinc-450 uppercase tracking-widest mb-3 text-center">{t.chartFluctuations}</p>
                  <div className="h-32 flex items-center justify-center">
                    {drawDetailedChart(selectedStock.history, selectedStock.percentChange >= 0)}
                  </div>
                </div>

                <div className="flex gap-3.5 pt-4" id="modal-stock-actions">
                  <button
                    id="btn-stock-sell"
                    onClick={() => {
                      setShowNotification(t.simulatedSell.replace('{symbol}', selectedStock.symbol));
                      setSelectedStock(null);
                      setTimeout(() => setShowNotification(null), 5000);
                    }}
                    className="flex-1 border border-[#2D313E] bg-[#232733] hover:bg-[#2F3446] text-zinc-200 hover:text-white py-3.5 rounded-2xl text-xs font-mono font-semibold uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] active:scale-95 duration-150"
                  >
                    {t.sellPosition}
                  </button>
                  <button
                    id="btn-stock-buy"
                    onClick={() => {
                      setShowNotification(t.simulatedBuy.replace('{symbol}', selectedStock.symbol));
                      setSelectedStock(null);
                      setTimeout(() => setShowNotification(null), 5000);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#C7FF2E] to-[#51FF85] text-black font-display font-black text-xs py-3.5 rounded-2xl uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#C7FF2E]/10 hover:from-white hover:to-white hover:scale-[1.02] active:scale-95 duration-150"
                  >
                    {t.acquireShares}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Transaction Vault Modals */}
      <AnimatePresence>
        {actionModal && (
          <div id="quick-action-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border rounded-[32px] p-6 max-w-md w-full relative shadow-2xl bg-[#1E2230] border-[#373C52] text-white"
              id="action-modal-container"
            >
              <button
                id="btn-close-action-modal"
                onClick={() => { setActionModal(null); setActionAmount(''); setTransferRecipient(''); setActionError(''); }}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#232733] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 duration-150"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display font-bold text-lg text-left mb-6 uppercase tracking-tight flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#C7FF2E] animate-bounce" />
                {actionModal === 'deposit' ? t.inboundVault : (actionModal === 'withdraw' ? t.outboundVault : t.externalWallet)}
              </h3>

              <form onSubmit={handleActionSubmit} className="space-y-4 text-left" id="action-vault-form">
                
                {actionModal === 'transfer' && (
                  <div className="space-y-1.5" id="field-transfer-recip">
                    <label className="block font-mono text-[9px] text-[#8E8E93] uppercase tracking-widest">{t.recipientRouting}</label>
                    <input
                      id="input-transfer-recipient"
                      type="text"
                      required
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      placeholder="e.g. pickky.kotchakorn@gmail.com"
                      className="w-full bg-[#12141C] border border-[#2D313E] text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C7FF2E]/50 focus:ring-1 focus:ring-[#C7FF2E]/30 transition-all font-sans"
                    />
                  </div>
                )}

                <div className="space-y-1.5" id="field-action-amt">
                  <label className="block font-mono text-[9px] text-[#8E8E93] uppercase tracking-widest">{t.transactionCost}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#8E8E93] text-sm">$</span>
                    <input
                      id="input-action-amount"
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={actionAmount}
                      onChange={(e) => setActionAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#12141C] border border-[#2D313E] text-white focus:border-[#C7FF2E]/50 focus:ring-1 focus:ring-[#C7FF2E]/30 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {actionError && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-mono flex items-center gap-2" id="action-error-box">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 animate-pulse" />
                    <span>{actionError}</span>
                  </div>
                )}

                <button
                  id="btn-action-submit"
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#C7FF2E] to-[#51FF85] text-black font-display font-black text-xs py-3.5 rounded-2xl uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#C7FF2E]/10 hover:from-white hover:to-white hover:scale-[1.01] active:scale-95 duration-150 mt-2"
                >
                  {t.executeProtocol}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
