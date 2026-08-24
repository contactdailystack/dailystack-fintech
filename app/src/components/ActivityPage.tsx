/**
 * ============================================================
 * DailyStack — ActivityPage v6.0 (Production-Ready)
 * ============================================================
 * Aligned with DailyStack Design System + Rocket Money Best Practices.
 *
 * Phase 1 Implementation (2026-06-18):
 * - Light theme (pageTokens) — matches Home/Net Worth/Recurring
 * - Pill Card spec (rounded-full px-6 py-3) — matches "Complete Setup"
 * - Date Grouping (Today / Yesterday / This Week / Earlier)
 * - Recurring Detection (auto-detect subscriptions, 3+ monthly)
 * - Recurring icon overlay on detected transactions
 *
 * Phase 2:
 * - Category filter chips (Food/Transport/Bills/Shopping/Health/Invest)
 * - Sort options (date desc/asc, amount desc/asc, merchant)
 * - Transaction Detail Drawer
 *
 * Phase 3:
 * - Tags system (multi-tag)
 * - Bulk operations (multi-select)
 * - Smart Insights Card
 *
 * Business Logic (preserved 100%):
 * - AI Predictive Pattern (Thai merchants)
 * - Gamification (XP, Level, Streak)
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, PlusCircle, AlertCircle, Sparkles, Trophy, Calendar, CheckCircle2, Flame, X, Tag, Settings, Sliders,
  MapPin, Flag, Briefcase, Shield, Lightbulb, Brain, UtensilsCrossed, Laptop, Car, Wine, Dumbbell,
  ShoppingBag, Heart, TrendingUp, Home, Receipt, Zap, RefreshCw, Filter, ArrowUpDown,
  TrendingDown, Eye, EyeOff, MoreVertical, ChevronRight, ArrowLeft, Trash2, Pencil, Check,
  Download, Camera, Image as ImageIcon, Split, Hash, StickyNote,
} from 'lucide-react';
import { Transaction, UserProfile } from '../types';
import { Language } from '../data/translations';
import { pageTokens } from '../design-system/page-tokens';
import { EmptyState } from '../design-system/components/EmptyState';
import { haptics } from '../services/hapticService';
import {
  saveTransaction, updateTransactionNote, setTransactionIgnored,
  setTransactionSplit, loadIgnoredTransactions, updateTransactionCore,
} from '../services/transactionService';
import { loadRules, matchRules } from '../services/ruleEngine';
import type { TxRule } from '../services/ruleEngine';

// ─── Design Tokens (Single Source of Truth) ───────────────────────────────
const dsColors = pageTokens.colors;
const dsTypography = pageTokens.typography;
const dsLayout = pageTokens.layout;

const getFontStyle = (lang: Language) => ({
  fontFamily: lang === 'th' ? dsTypography.fontTH : dsTypography.fontEN,
});

// ─── Types ──────────────────────────────────────────────────────────────────
interface ActivityPageProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction?: (id: string) => void;
  profile: UserProfile;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  lang: Language;
}

interface AIPresetPattern {
  category: string;
  workspace: string;
  matchingTerm: string;
}

interface CategoryFilter {
  id: string;
  labelEn: string;
  labelTh: string;
  icon: React.ElementType;
  color: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const CATEGORY_FILTERS: CategoryFilter[] = [
  { id: 'all',          labelEn: 'All',          labelTh: 'ทั้งหมด',         icon: Sparkles,      color: '#666666' },
  { id: 'Food',         labelEn: 'Food',         labelTh: 'อาหาร',          icon: UtensilsCrossed, color: '#F97316' },
  { id: 'Transportation', labelEn: 'Transport',  labelTh: 'เดินทาง',         icon: Car,            color: '#1786C2' },
  { id: 'Bills',        labelEn: 'Bills',        labelTh: 'บิล',            icon: Receipt,        color: '#EF4444' },
  { id: 'Shopping',     labelEn: 'Shopping',     labelTh: 'ช้อปปิ้ง',       icon: ShoppingBag,    color: '#EC4899' },
  { id: 'Health',       labelEn: 'Health',       labelTh: 'สุขภาพ',         icon: Heart,          color: '#22C55E' },
  { id: 'Investment',   labelEn: 'Invest',       labelTh: 'ลงทุน',          icon: TrendingUp,     color: '#8B5CF6' },
  { id: 'Entertainment',labelEn: 'Fun',          labelTh: 'บันเทิง',         icon: Wine,           color: '#F59E0B' },
];

const SORT_OPTIONS = [
  { id: 'date-desc',  labelEn: 'Newest first',  labelTh: 'ใหม่สุด' },
  { id: 'date-asc',   labelEn: 'Oldest first',  labelTh: 'เก่าสุด' },
  { id: 'amount-desc',labelEn: 'Highest first', labelTh: 'จำนวนมาก' },
  { id: 'amount-asc', labelEn: 'Lowest first',  labelTh: 'จำนวนน้อย' },
  { id: 'merchant',   labelEn: 'By merchant',   labelTh: 'ตามร้าน' },
] as const;

type SortType = typeof SORT_OPTIONS[number]['id'];

// ─── Utility: Recurring Detection ───────────────────────────────────────────
const detectRecurringIds = (transactions: Transaction[]): Set<string> => {
  const merchantMap = new Map<string, Transaction[]>();
  transactions.forEach(tx => {
    if (!merchantMap.has(tx.merchant)) merchantMap.set(tx.merchant, []);
    merchantMap.get(tx.merchant)!.push(tx);
  });

  const recurring = new Set<string>();
  merchantMap.forEach((txList) => {
    if (txList.length < 3) return;
    // Sort by date
    const sorted = [...txList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Calculate intervals between consecutive transactions
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(diff);
    }
    if (intervals.length === 0) return;
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    // Recurring if monthly interval (25-35 days) and amounts similar (within 20%)
    const isMonthly = avgInterval >= 25 && avgInterval <= 35;
    const amounts = sorted.map(tx => Math.abs(tx.amount));
    const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const similarAmounts = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.2);
    if (isMonthly && similarAmounts) {
      sorted.forEach(tx => recurring.add(tx.id));
    }
  });
  return recurring;
};

// ─── Utility: Date Grouping ─────────────────────────────────────────────────
const groupTransactionsByDate = (txs: Transaction[]): Record<string, Transaction[]> => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, Transaction[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  };

  txs.forEach(tx => {
    const txDate = new Date(tx.date);
    const txDay = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
    if (txDay.getTime() === today.getTime()) {
      groups.today.push(tx);
    } else if (txDay.getTime() === yesterday.getTime()) {
      groups.yesterday.push(tx);
    } else if (txDay.getTime() > weekAgo.getTime()) {
      groups.thisWeek.push(tx);
    } else {
      groups.earlier.push(tx);
    }
  });
  return groups;
};

// ─── Utility: Format Date ───────────────────────────────────────────────────
const formatRelativeDate = (dateStr: string, lang: Language): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const txDate = new Date(dateStr);
  const txDay = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

  if (txDay.getTime() === today.getTime()) return lang === 'th' ? 'วันนี้' : 'Today';
  if (txDay.getTime() === yesterday.getTime()) return lang === 'th' ? 'เมื่อวาน' : 'Yesterday';

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (txDay.getTime() > weekAgo.getTime()) {
    const days = Math.floor((today.getTime() - txDay.getTime()) / (1000 * 60 * 60 * 24));
    return lang === 'th' ? `${days} วันที่แล้ว` : `${days}d ago`;
  }

  if (lang === 'th') {
    return txDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  }
  return txDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const formatCurrency = (amount: number, lang: Language): string => {
  return `฿${Math.abs(amount).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US')}`;
};

// ─── AI Pattern Detection (Thai merchants) ─────────────────────────────────
const detectAIPreset = (merchant: string): AIPresetPattern | null => {
  const m = merchant.toLowerCase();
  if (!m.trim()) return null;
  if (m.includes('starbucks') || m.includes('coffee') || m.includes('boba') || m.includes('cafe')) {
    return { category: 'Food', workspace: 'Personal', matchingTerm: 'Coffee Drop-in' };
  }
  if (m.includes('uber') || m.includes('lyft') || m.includes('grab') || m.includes('taxi') || m.includes('bolt')) {
    return { category: 'Transportation', workspace: 'Personal', matchingTerm: 'Transit Outlay' };
  }
  if (m.includes('gym') || m.includes('fitness') || m.includes('yoga') || m.includes('workout')) {
    return { category: 'Health', workspace: 'Personal', matchingTerm: 'Fitness Membership' };
  }
  if (m.includes('contract') || m.includes('freelance') || m.includes('client') || m.includes('invoice')) {
    return { category: 'Investment', workspace: 'Business', matchingTerm: 'Contractual Revenue' };
  }
  if (m.includes('netflix') || m.includes('spotify') || m.includes('youtube') || m.includes('disney')) {
    return { category: 'Entertainment', workspace: 'Personal', matchingTerm: 'Subscription Recurring' };
  }
  if (m.includes('7-eleven') || m.includes('big c') || m.includes('lotus') || m.includes('makro') || m.includes('tops')) {
    return { category: 'Food', workspace: 'Personal', matchingTerm: 'Essential Provisions' };
  }
  return null;
};

// ─── Pull-to-Refresh Hook ───────────────────────────────────────────────────
const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = React.useRef(0);
  const isAtTop = React.useRef(true);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      isAtTop.current = true;
      startY.current = e.touches[0].clientY;
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isAtTop.current && e.touches[0].clientY > startY.current) {
      e.preventDefault();
      const distance = Math.min(e.touches[0].clientY - startY.current, 100);
      setPullDistance(distance);
    }
  };
  const handleTouchEnd = async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      haptics.fire('SELECT');
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    isAtTop.current = false;
  };

  return { isRefreshing, pullDistance, handleTouchStart, handleTouchMove, handleTouchEnd };
};

// ─── Smart Insights Card ────────────────────────────────────────────────────
interface SmartInsightsCardProps {
  transactions: Transaction[];
  recurringCount: number;
  lang: Language;
}

const SmartInsightsCard: React.FC<SmartInsightsCardProps> = ({ transactions, recurringCount, lang }) => {
  // Calculate insights
  const totalSpent = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const lateNightSpent = transactions.filter(t => t.timeOfDay === 'Midnight' && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const lateNightPct = totalSpent > 0 ? Math.round((lateNightSpent / totalSpent) * 100) : 0;

  const getInsight = () => {
    if (lateNightPct > 30) {
      return lang === 'th'
        ? `⚠️ ${lateNightPct}% ของการใช้จ่ายเกิดช่วงดึก — ลองตั้ง Cooling Rule 24 ชม.`
        : `⚠️ ${lateNightPct}% of spending happens late at night — try 24h cooling rule`;
    }
    if (recurringCount > 0) {
      return lang === 'th'
        ? `🔄 พบ ${recurringCount} รายการที่เป็น Recurring — ตรวจสอบ Subscription Shadow`
        : `🔄 ${recurringCount} recurring detected — review Subscription Shadow`;
    }
    if (transactions.length > 0) {
      return lang === 'th'
        ? `✨ ค่าใช้จ่ายของคุณอยู่ในเกณฑ์ดี`
        : `✨ Your spending looks healthy`;
    }
    return lang === 'th'
      ? 'เริ่มบันทึกรายการแรกเพื่อดู Insight'
      : 'Record your first transaction to see insights';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[16px] px-4 py-3"
      style={{
        backgroundColor: 'rgba(15, 176, 206, 0.08)',
        border: '1px solid rgba(15, 176, 206, 0.2)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(15, 176, 206, 0.15)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: dsColors.accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium mb-0.5" style={{ color: dsColors.accent }}>
            {lang === 'th' ? 'สมาร์ทอินไซต์' : 'Smart Insight'}
          </p>
          <p className="text-[13px]" style={{ color: dsColors.text }}>
            {getInsight()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Transaction Row (Pill Card pattern) ────────────────────────────────────
interface TransactionRowProps {
  tx: Transaction;
  isRecurring: boolean;
  showAmount: boolean;
  isSelected: boolean;
  isBulkMode: boolean;
  lang: Language;
  onClick: () => void;
  onLongPress: () => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  tx, isRecurring, showAmount, isSelected, isBulkMode, lang, onClick, onLongPress,
}) => {
  const isOutbound = tx.amount < 0;
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      haptics.fire('HEAVY_THUD');
      onLongPress();
    }, 500);
    setPressTimer(timer);
  };
  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      // Pill Card spec — matches "Complete Setup"
      className="w-full flex items-center gap-3 rounded-full px-5 py-3 active:scale-[0.98] transition-all text-left relative"
      style={{
        backgroundColor: isSelected ? 'rgba(15, 176, 206, 0.15)' : dsColors.surface,
        border: isSelected ? '1px solid rgba(15, 176, 206, 0.4)' : '1px solid transparent',
      }}
    >
      {/* Bulk checkbox / Icon */}
      {isBulkMode ? (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
          style={{
            backgroundColor: isSelected ? dsColors.accent : 'transparent',
            border: isSelected ? 'none' : '1.5px solid #D1D5DB',
          }}
        >
          {isSelected && <Check className="w-3.5 h-3.5" style={{ color: '#0A0A0A' }} />}
        </div>
      ) : (
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: isOutbound ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}
        >
          {isOutbound ? (
            <ArrowUpDown className="w-4 h-4" style={{ color: '#EF4444', transform: 'rotate(45deg)' }} />
          ) : (
            <ArrowUpDown className="w-4 h-4" style={{ color: '#16A34A', transform: 'rotate(-45deg)' }} />
          )}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[15px] font-semibold truncate" style={{ color: dsColors.text, ...getFontStyle(lang) }}>
            {tx.merchant}
          </h3>
          {isRecurring && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#7C3AED' }}
              title={lang === 'th' ? 'รายการต่อเนื่อง' : 'Recurring'}
            >
              <RefreshCw className="w-2.5 h-2.5" />
              {lang === 'th' ? 'ต่อเนื่อง' : 'REC'}
            </span>
          )}
          {tx.tags && tx.tags.length > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold shrink-0" style={{ backgroundColor: dsColors.surface, color: dsColors.textMuted }}>
              {tx.tags.length}
            </span>
          )}
        </div>
        <p className="text-[12px] mt-0.5 truncate" style={{ color: dsColors.textMuted }}>
          {tx.category} · {formatRelativeDate(tx.date, lang)}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className="text-[15px] font-bold"
          style={{
            color: isOutbound ? dsColors.text : '#16A34A',
            fontFamily: dsTypography.fontMono,
          }}
        >
          {showAmount ? (isOutbound ? '−' : '+') + formatCurrency(tx.amount, lang) : '••••'}
        </p>
      </div>
    </motion.button>
  );
};

// ─── Category Filter Chips (horizontal scroll) ─────────────────────────────
interface CategoryChipsProps {
  activeCategory: string;
  onChange: (id: string) => void;
  lang: Language;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ activeCategory, onChange, lang }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
    {CATEGORY_FILTERS.map(cat => {
      const isActive = activeCategory === cat.id;
      const Icon = cat.icon;
      return (
        <button
          key={cat.id}
          onClick={() => { haptics.fire('SELECT'); onChange(cat.id); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0 transition-all active:scale-95"
          style={{
            backgroundColor: isActive ? cat.color : dsColors.surface,
            color: isActive ? '#FFFFFF' : dsColors.text,
            border: isActive ? 'none' : '1px solid transparent',
          }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#FFFFFF' : cat.color }} />
          {lang === 'th' ? cat.labelTh : cat.labelEn}
        </button>
      );
    })}
  </div>
);

// ─── Sort Dropdown ──────────────────────────────────────────────────────────
interface SortDropdownProps {
  sortBy: SortType;
  onChange: (s: SortType) => void;
  lang: Language;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onChange, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = SORT_OPTIONS.find(o => o.id === sortBy) || SORT_OPTIONS[0];
  return (
    <div className="relative">
      <button
        onClick={() => { haptics.fire('SELECT'); setIsOpen(!isOpen); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-white"
        style={{ border: `1px solid ${dsColors.border}`, color: dsColors.text }}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span>{lang === 'th' ? current.labelTh : current.labelEn}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-2xl shadow-lg min-w-[160px] py-1"
            style={{ border: `1px solid ${dsColors.border}` }}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => { haptics.fire('SELECT'); onChange(opt.id); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left text-[13px] font-medium transition-colors"
                style={{
                  backgroundColor: sortBy === opt.id ? 'rgba(15, 176, 206, 0.15)' : 'transparent',
                  color: sortBy === opt.id ? dsColors.accent : dsColors.text,
                }}
              >
                {lang === 'th' ? opt.labelTh : opt.labelEn}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Transaction Detail Drawer ─────────────────────────────────────────────
interface TransactionDetailDrawerProps {
  tx: Transaction | null;
  isRecurring: boolean;
  isOpen: boolean;
  /** true when this tx is the SOURCE of an active split (a `${tx.id}-split` row exists) */
  isSplitSource?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSaveNote: (id: string, note: string) => void;
  onToggleIgnore: (tx: Transaction) => void;
  onSplit: (id: string, splitCategory: string, splitAmount: number) => void;
  onUndoSplit: (id: string) => void;
  showAmount: boolean;
  lang: Language;
}

const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  tx, isRecurring, isOpen, isSplitSource, onClose, onEdit, onDelete,
  onSaveNote, onToggleIgnore, onSplit, onUndoSplit, showAmount, lang,
}) => {
  // Note / split drafts (#6) — hooks before early return
  const [noteDraft, setNoteDraft] = useState('');
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitCat, setSplitCat] = useState(CATEGORIES[0]?.id || 'Food');
  const [splitAmt, setSplitAmt] = useState('');

  useEffect(() => {
    if (isOpen && tx) {
      setNoteDraft(tx.note || '');
      setSplitOpen(false);
      setSplitAmt('');
      setSplitCat(CATEGORIES[0]?.id || 'Food');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tx?.id]);

  if (!isOpen || !tx) return null;
  const isOutbound = tx.amount < 0;
  const absAmount = Math.abs(tx.amount);
  const splitAmountNum = parseFloat(splitAmt);
  // Synthetic rows (`${id}-split`) exist only client-side — DB mutations
  // must target the primary row, so mutating controls are hidden here.
  const isSynthetic = !!tx.splitOf;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold" style={{ color: dsColors.text }}>
              {lang === 'th' ? 'รายละเอียด' : 'Transaction Detail'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
              <X className="w-5 h-5" style={{ color: dsColors.textMuted }} />
            </button>
          </div>

          {/* Merchant + Amount */}
          <div className="text-center mb-5">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ backgroundColor: isOutbound ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}
            >
              {isOutbound ? <TrendingDown className="w-7 h-7" style={{ color: '#EF4444' }} /> : <TrendingUp className="w-7 h-7" style={{ color: '#16A34A' }} />}
            </div>
            <h3 className="text-[20px] font-bold" style={{ color: dsColors.text }}>{tx.merchant}</h3>
            <p className="text-[36px] font-bold mt-2" style={{ color: dsColors.text, fontFamily: dsTypography.fontMono, letterSpacing: '-1px' }}>
              {showAmount ? (isOutbound ? '−' : '+') + formatCurrency(tx.amount, lang) : '••••'}
            </p>
            {isRecurring && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold mt-2"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#7C3AED' }}>
                <RefreshCw className="w-3 h-3" />
                {lang === 'th' ? 'รายการต่อเนื่อง' : 'Recurring Transaction'}
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="space-y-3 mb-5">
            <DetailRow label={lang === 'th' ? 'หมวดหมู่' : 'Category'} value={tx.category} lang={lang} />
            <DetailRow label={lang === 'th' ? 'วันที่' : 'Date'} value={formatRelativeDate(tx.date, lang)} lang={lang} />
            {tx.workspace && <DetailRow label={lang === 'th' ? 'พื้นที่' : 'Workspace'} value={tx.workspace} lang={lang} />}
          </div>

          {/* ── Synthetic split row notice ── */}
          {isSynthetic && (
            <div className="mb-4 p-3 rounded-xl flex items-center gap-2"
              style={{ backgroundColor: 'rgba(23, 134, 194, 0.1)' }}>
              <Split className="w-4 h-4 shrink-0" style={{ color: '#1786C2' }} />
              <p className="text-[12px]" style={{ color: dsColors.text }}>
                {lang === 'th'
                  ? 'ส่วนที่แยกออกจากรายการหลัก — แก้ไข/ซ่อน/โน้ต ที่รายการหลักเท่านั้น'
                  : 'Split-off portion — edit, hide or add notes on the main transaction only.'}
              </p>
            </div>
          )}

          {/* ── Note (#6a) ── */}
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: dsColors.textMuted }}>
              {lang === 'th' ? 'โน้ต' : 'Note'}
            </p>
            {isSynthetic ? (
              noteDraft ? (
                <p className="px-3 py-2.5 rounded-xl text-[13px]" style={{ backgroundColor: dsColors.surface, color: dsColors.text }}>
                  {noteDraft}
                </p>
              ) : null
            ) : (
              <>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder={lang === 'th' ? 'เพิ่มโน้ต...' : 'Add a note...'}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none"
                  style={{ backgroundColor: dsColors.surface, color: dsColors.text }}
                />
                <button
                  onClick={() => { haptics.fire('SELECT'); onSaveNote(tx.id, noteDraft.trim()); }}
                  className="mt-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: dsColors.accent, color: '#0A0A0A' }}
                >
                  {lang === 'th' ? 'บันทึกโน้ต' : 'Save note'}
                </button>
              </>
            )}
          </div>

          {/* ── Ignore (#6b) — hidden on synthetic rows ── */}
          {!isSynthetic && (
          <div className="mb-4 flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: dsColors.surface }}>
            <span className="text-[12px] font-medium" style={{ color: dsColors.textMuted }}>
              {lang === 'th' ? 'ซ่อนจากสถิติ' : 'Exclude from stats'}
            </span>
            <button
              onClick={() => { haptics.fire('SELECT'); onToggleIgnore(tx); }}
              className="w-11 h-7 rounded-full relative transition-all"
              style={{ backgroundColor: tx.isIgnored ? dsColors.accent : 'rgba(128,128,128,0.25)' }}
              aria-pressed={!!tx.isIgnored}
            >
              <span
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ left: tx.isIgnored ? 22 : 4 }}
              />
            </button>
          </div>
          )}

          {/* ── Split (#6b) — hidden on synthetic rows ── */}
          {!isSynthetic && (
          <div className="mb-4">
            <button
              onClick={() => setSplitOpen(!splitOpen)}
              className="flex items-center gap-2 text-[12px] font-semibold mb-2 min-h-[32px]"
              style={{ color: dsColors.textMuted }}
            >
              <Split className="w-3.5 h-3.5" />
              {lang === 'th' ? 'แยกยอดข้ามหมวด' : 'Split across categories'}
              {isSplitSource && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: 'rgba(15, 176, 206,0.15)', color: '#16A34A' }}>
                  ✓
                </span>
              )}
            </button>
            {splitOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl space-y-2 overflow-hidden" style={{ backgroundColor: dsColors.surface }}>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={splitCat}
                    onChange={(e) => setSplitCat(e.target.value)}
                    className="px-2 py-2 rounded-lg text-[12px] outline-none"
                    style={{ backgroundColor: dsColors.background, color: dsColors.text }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{lang === 'th' ? c.labelTh : c.labelEn}</option>
                    ))}
                  </select>
                  <input
                    type="number" step="0.01" min="0" max={absAmount}
                    value={splitAmt}
                    onChange={(e) => setSplitAmt(e.target.value)}
                    placeholder={lang === 'th' ? 'จำนวนเงิน' : 'Amount'}
                    className="px-2 py-2 rounded-lg text-[12px] outline-none"
                    style={{ backgroundColor: dsColors.background, color: dsColors.text, fontFamily: dsTypography.fontMono }}
                  />
                </div>
                <p className="text-[10px]" style={{ color: dsColors.textMuted }}>
                  {lang === 'th'
                    ? `ยอดรวม ${formatCurrency(absAmount, lang)} · ส่วนที่เหลืออยู่ใน ${tx.category}`
                    : `Total ${formatCurrency(absAmount, lang)} · remainder stays in ${tx.category}`}
                </p>
                <button
                  disabled={isNaN(splitAmountNum) || splitAmountNum <= 0 || splitAmountNum >= absAmount}
                  onClick={() => {
                    haptics.fire('SELECT');
                    onSplit(tx.id, splitCat, splitAmountNum);
                    setSplitOpen(false);
                    setSplitAmt('');
                  }}
                  className="w-full py-2 rounded-lg text-[12px] font-bold transition-all active:scale-95 disabled:opacity-40"
                  style={{ backgroundColor: dsColors.accent, color: '#0A0A0A' }}
                >
                  {lang === 'th' ? 'แยกยอด' : 'Apply split'}
                </button>
              </motion.div>
            )}
            {/* Undo an existing split */}
            {isSplitSource && !splitOpen && (
              <button
                onClick={() => { haptics.fire('THUD'); onUndoSplit(tx.id); }}
                className="text-[11px] font-semibold underline min-h-[28px]"
                style={{ color: '#1786C2' }}
              >
                {lang === 'th' ? 'ยกเลิกการแยกยอด' : 'Undo split'}
              </button>
            )}
          </div>
          )}

          {/* Tags */}
          {tx.tags && tx.tags.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: dsColors.textMuted }}>
                {lang === 'th' ? 'แท็ก' : 'Tags'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tx.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-[12px] font-semibold"
                    style={{ backgroundColor: dsColors.accent, color: '#0A0A0A' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { haptics.fire('SELECT'); onEdit(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-semibold transition-all active:scale-95"
              style={{ backgroundColor: dsColors.accent, color: '#0A0A0A' }}
            >
              <Pencil className="w-4 h-4" />
              {lang === 'th' ? 'แก้ไข' : 'Edit'}
            </button>
            <button
              onClick={() => { if (!isSynthetic) { haptics.fire('THUD'); onDelete(); } }}
              disabled={isSynthetic}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
              title={isSynthetic ? (lang === 'th' ? 'แก้ไขที่รายการหลักเท่านั้น' : 'Edit the main transaction instead') : undefined}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const DetailRow: React.FC<{ label: string; value: string; valueColor?: string; lang: Language }> = ({ label, value, valueColor, lang }) => (
  <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${dsColors.border}` }}>
    <span className="text-[12px] font-medium" style={{ color: dsColors.textMuted }}>{label}</span>
    <span className="text-[13px] font-semibold" style={{ color: valueColor || dsColors.text, ...getFontStyle(lang) }}>{value}</span>
  </div>
);

// ─── Add Transaction Form (Simplified 2-Layer) ─────────────────────────────
const CATEGORIES = [
  { id: 'Food', labelEn: 'Food', labelTh: 'อาหาร' },
  { id: 'Transportation', labelEn: 'Transport', labelTh: 'เดินทาง' },
  { id: 'Bills', labelEn: 'Bills', labelTh: 'บิล' },
  { id: 'Shopping', labelEn: 'Shopping', labelTh: 'ช้อปปิ้ง' },
  { id: 'Health', labelEn: 'Health', labelTh: 'สุขภาพ' },
  { id: 'Investment', labelEn: 'Invest', labelTh: 'ลงทุน' },
  { id: 'Entertainment', labelEn: 'Fun', labelTh: 'บันเทิง' },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ActivityPage({
  transactions, onAddTransaction, onUpdateTransaction, onDeleteTransaction,
  profile, onUpdateProfile, lang,
}: ActivityPageProps) {
  // ─── State ──────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortType>('date-desc');
  const [showAmount, setShowAmount] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  /** When set, the add form acts as an EDIT form for this transaction (P0-4). */
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [lastSyncAt] = useState<Date | null>(new Date());

  // Form state
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [workspace, setWorkspace] = useState('Personal');
  const [formError, setFormError] = useState('');
  const [noteInput, setNoteInput] = useState('');

  // ── #6: ignored-transaction view + user rules ──
  const [showHidden, setShowHidden] = useState(false);
  const [hiddenTxs, setHiddenTxs] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<TxRule[]>([]);
  const [ruleSuggestion, setRuleSuggestion] = useState<{ pattern: string; category: string } | null>(null);

  useEffect(() => { loadRules().then(setRules); }, []);

  const handleToggleHiddenView = () => {
    haptics.fire('SELECT');
    if (!showHidden) {
      loadIgnoredTransactions().then(setHiddenTxs).catch(() => setHiddenTxs([]));
    }
    setShowHidden(!showHidden);
  };

  // ─── AI Pattern Detection ───────────────────────────────────────────────
  const aiPreset = useMemo(() => detectAIPreset(merchant), [merchant]);

  useEffect(() => {
    if (aiPreset) {
      setCategory(aiPreset.category);
      setWorkspace(aiPreset.workspace);
    }
  }, [aiPreset]);

  // ─── Computed Data ──────────────────────────────────────────────────────
  const recurringIds = useMemo(() => detectRecurringIds(transactions), [transactions]);
  const recurringCount = recurringIds.size;

  // Ignored transactions are excluded from the main list (#6b)
  const visibleTransactions = useMemo(
    () => transactions.filter(tx => !tx.isIgnored),
    [transactions]
  );

  // Filtered + sorted transactions
  const filteredTransactions = useMemo(() => {
    let result = showHidden ? hiddenTxs : visibleTransactions;
    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(tx =>
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q)) ||
        (tx.tags && tx.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    // Category
    if (activeCategory !== 'all') {
      result = result.filter(tx => tx.category === activeCategory);
    }
    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc': return Math.abs(b.amount) - Math.abs(a.amount);
        case 'amount-asc': return Math.abs(a.amount) - Math.abs(b.amount);
        case 'merchant': return a.merchant.localeCompare(b.merchant);
        default: return 0;
      }
    });
    return result;
  }, [showHidden, hiddenTxs, visibleTransactions, searchTerm, activeCategory, sortBy]);

  // Date-grouped
  const dateGroups = useMemo(() => groupTransactionsByDate(filteredTransactions), [filteredTransactions]);

  // Gamification
  const xpGained = transactions.length * 20 + 420;
  const computedLevel = Math.floor(xpGained / 250) + 1;
  const xpInCurrentLevel = xpGained % 250;

  // Pull-to-refresh
  const refreshData = useCallback(async () => {
    await new Promise(r => setTimeout(r, 600));
  }, []);
  const { isRefreshing, pullDistance, handleTouchStart, handleTouchMove, handleTouchEnd } = usePullToRefresh(refreshData);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleTxClick = (tx: Transaction) => {
    if (isBulkMode) {
      if (tx.splitOf) return; // synthetic rows can't be bulk-mutated
      const newSet = new Set(selectedIds);
      if (newSet.has(tx.id)) newSet.delete(tx.id); else newSet.add(tx.id);
      setSelectedIds(newSet);
    } else {
      haptics.fire('SELECT');
      setSelectedTx(tx);
      setIsDetailOpen(true);
    }
  };

  const handleTxLongPress = (tx: Transaction) => {
    if (!isBulkMode && !tx.splitOf) {
      setIsBulkMode(true);
      setSelectedIds(new Set([tx.id]));
    }
  };

  const handleExitBulk = () => {
    setIsBulkMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0 || !onDeleteTransaction) return;
    haptics.fire('THUD');
    selectedIds.forEach(id => onDeleteTransaction(id));
    handleExitBulk();
  };

  const handleBulkCategorize = (newCategory: string) => {
    if (selectedIds.size === 0 || !onUpdateTransaction) return;
    haptics.fire('SELECT');
    selectedIds.forEach(id => onUpdateTransaction(id, { category: newCategory }));
    handleExitBulk();
  };

  const handleAddNewTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const parsedAmount = parseFloat(amount);
    if (!merchant.trim()) {
      setFormError(lang === 'en' ? 'Merchant is required.' : 'กรุณาระบุรายการ');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError(lang === 'en' ? 'Enter a valid amount.' : 'กรุณาระบุจำนวนเงิน');
      return;
    }
    if (!editingTx && parsedAmount > profile.balance) {
      setFormError(lang === 'en' ? 'Insufficient balance.' : 'ยอดเงินไม่เพียงพอ');
      return;
    }

    // ── Edit mode: persist core-field changes, never create a duplicate ──
    if (editingTx) {
      const ok = await updateTransactionCore(editingTx.id, {
        amount: -parsedAmount,
        description: merchant.trim(),
        category,
      });
      if (ok && (noteInput.trim() || editingTx.note) && noteInput.trim() !== (editingTx.note || '')) {
        await updateTransactionNote(editingTx.id, noteInput.trim());
      }
      onUpdateTransaction?.(editingTx.id, {
        merchant: merchant.trim(),
        amount: -parsedAmount,
        category,
        ...(noteInput.trim() !== (editingTx.note || '') ? { note: noteInput.trim() || undefined } : {}),
      } as Transaction);
      haptics.fire(ok ? 'LOCK_CONFIRM' : 'ERROR_REJECT');
      resetAddForm();
      return;
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      merchant: merchant.trim(),
      category,
      amount: -parsedAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      workspace,
      note: noteInput.trim() || undefined,
      timeOfDay: new Date().getHours() >= 21 ? 'Midnight' : (new Date().getHours() >= 17 ? 'Evening' : 'Afternoon'),
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()],
    };
    onAddTransaction(newTx);

    saveTransaction({
      amount: -parsedAmount, description: merchant.trim(), category, workspace,
      note: noteInput.trim() || undefined,
    });

    onUpdateProfile({ balance: profile.balance - parsedAmount });

    // Reset
    resetAddForm();
  };

  /** Clear the add/edit form state. */
  const resetAddForm = () => {
    setMerchant(''); setAmount(''); setNoteInput(''); setShowAddForm(false); setEditingTx(null);
  };

  // ─── Export CSV ──────────────────────────────────────────────────────────
  // ─── #6 Handlers: note / ignore / split ──────────────────────────────────
  const handleSaveNote = async (id: string, note: string) => {
    await updateTransactionNote(id, note);
    onUpdateTransaction?.(id, { note });
  };

  const handleToggleIgnore = async (tx: Transaction) => {
    const next = !tx.isIgnored;
    await setTransactionIgnored(tx.id, next);
    onUpdateTransaction?.(tx.id, { isIgnored: next });
    if (showHidden && next === false) {
      setHiddenTxs(prev => prev.filter(t => t.id !== tx.id));
    }
    setIsDetailOpen(false);
  };

  const handleSplitTx = async (id: string, splitCategory: string, splitAmount: number) => {
    await setTransactionSplit(id, splitCategory, splitAmount);
    const source = transactions.find(t => t.id === id);
    if (source) {
      const moved = Math.abs(splitAmount);
      const sign = source.amount < 0 ? -1 : 1;
      onUpdateTransaction?.(id, { amount: sign * (Math.abs(source.amount) - moved) } as Transaction);
      onAddTransaction?.({
        ...source,
        id: `${id}-split`,
        category: splitCategory,
        amount: sign * moved,
        splitOf: true,
      } as Transaction);
    }
  };

  const handleUndoSplit = async (id: string) => {
    const synth = transactions.find(t => t.id === `${id}-split`);
    const source = transactions.find(t => t.id === id);
    if (!synth || !source) return;
    haptics.fire('SELECT');
    const ok = await setTransactionSplit(id, null, null);
    if (!ok) return;
    const sign = source.amount < 0 ? -1 : 1;
    onUpdateTransaction?.(id, { amount: sign * (Math.abs(source.amount) + Math.abs(synth.amount)) } as Transaction);
    onDeleteTransaction?.(synth.id);
    setIsDetailOpen(false);
  };

  const handleExportCSV = () => {
    haptics.fire('SELECT');
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Workspace', 'Recurring', 'Note'];
    const rows = visibleTransactions.map(tx => [
      tx.date,
      `"${tx.merchant.replace(/"/g, '""')}"`,
      tx.category,
      tx.amount.toString(),
      tx.workspace || '',
      recurringIds.has(tx.id) ? 'Yes' : 'No',
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pickswise-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: dsColors.background, ...getFontStyle(lang) }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-Refresh Indicator */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center py-3"
            style={{
              backgroundColor: pullDistance > 60 ? dsColors.accent : dsColors.surface,
              transform: `translateY(${pullDistance}px)`,
            }}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: dsColors.text }} />
            <span className="text-xs font-medium" style={{ color: dsColors.text }}>
              {isRefreshing ? (lang === 'th' ? 'กำลังซิงค์...' : 'Syncing...') : `${Math.round(pullDistance)}%`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+48px)] pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold" style={{ color: dsColors.text }}>
              {lang === 'th' ? 'กิจกรรม' : 'Activity'}
            </h1>
            <p className="text-[11px] font-mono tracking-wider mt-0.5" style={{ color: dsColors.textMuted }}>
              {lang === 'th' ? 'บันทึกอารมณ์ + พฤติกรรม' : 'BEHAVIORAL LEDGER'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAmount(!showAmount)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{ backgroundColor: dsColors.surface }}
              aria-label={showAmount ? 'Hide amounts' : 'Show amounts'}
            >
              {showAmount ? <Eye className="w-5 h-5" style={{ color: dsColors.text }} /> : <EyeOff className="w-5 h-5" style={{ color: dsColors.accent }} />}
            </button>
            <button
              onClick={handleToggleHiddenView}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-95 relative"
              style={{ backgroundColor: showHidden ? dsColors.accent : dsColors.surface }}
              aria-label={showHidden ? (lang === 'th' ? 'ดูรายการปกติ' : 'Show active') : (lang === 'th' ? 'รายการที่ซ่อน' : 'Hidden transactions')}
            >
              <EyeOff className="w-5 h-5" style={{ color: showHidden ? '#0A0A0A' : dsColors.text }} />
            </button>
            <button
              onClick={handleExportCSV}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{ backgroundColor: dsColors.surface }}
              aria-label="Export CSV"
            >
              <Download className="w-5 h-5" style={{ color: dsColors.text }} />
            </button>
            <button
              onClick={() => { haptics.fire('SELECT'); setShowAddForm(true); }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{ backgroundColor: dsColors.accent }}
              aria-label="Add transaction"
            >
              <PlusCircle className="w-5 h-5" style={{ color: '#0A0A0A' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Gamification Hero (Dark card — Home/Net Worth pattern) */}
      <div className="px-3 mb-4">
        <div
          className="rounded-[28px] p-5"
          style={{
            backgroundColor: '#0A0A0A',
            border: '1px solid #1C1C1C',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(15, 176, 206, 0.15)' }}>
                <Shield className="w-5 h-5" style={{ color: dsColors.accent }} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold flex items-center gap-1.5" style={{ color: '#FFFFFF' }}>
                  {lang === 'th' ? `เลเวล ${computedLevel}: ผู้พิทักษ์วินัย` : `Level ${computedLevel}: Financial Shogun`}
                  <Sparkles className="w-3.5 h-3.5" style={{ color: dsColors.accent }} />
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {transactions.length} {lang === 'th' ? 'รายการ' : 'logged'} · {recurringCount} {lang === 'th' ? 'ต่อเนื่อง' : 'recurring'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Flame className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
              <span className="text-[11px] font-bold" style={{ color: '#FFFFFF' }}>7d</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span>{lang === 'th' ? 'XP ความก้าวหน้า' : 'XP Progress'}</span>
              <span className="font-bold" style={{ color: dsColors.accent }}>{xpInCurrentLevel} / 250</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(xpInCurrentLevel / 250) * 100}%`, backgroundColor: dsColors.accent }} />
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filters + Sort Bar */}
      <div className="px-5 mb-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: dsColors.textMuted }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'th' ? 'ค้นหาร้าน หรือ หมวดหมู่' : 'Search merchant or category...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-[14px] outline-none transition-all"
              style={{
                backgroundColor: dsColors.surface,
                color: dsColors.text,
                border: '1px solid transparent',
                fontFamily: getFontStyle(lang).fontFamily,
              }}
            />
          </div>
          <SortDropdown sortBy={sortBy} onChange={setSortBy} lang={lang} />
        </div>
        <CategoryChips activeCategory={activeCategory} onChange={setActiveCategory} lang={lang} />
      </div>

      {/* Smart Insights Card */}
      {transactions.length > 0 && (
        <div className="px-5 mb-4">
          <SmartInsightsCard transactions={transactions} recurringCount={recurringCount} lang={lang} />
        </div>
      )}

      {/* Bulk Mode Action Bar */}
      <AnimatePresence>
        {isBulkMode && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="sticky top-0 z-30 px-5 py-3 mx-3 mb-3 rounded-2xl flex items-center justify-between"
            style={{ backgroundColor: dsColors.text, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            <span className="text-[13px] font-semibold text-white">
              {selectedIds.size} {lang === 'th' ? 'เลือก' : 'selected'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newCat = prompt(lang === 'th' ? 'เปลี่ยนเป็นหมวดหมู่:' : 'Change to category:', 'Food');
                  if (newCat) handleBulkCategorize(newCat);
                }}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-lime-400 text-black"
              >
                {lang === 'th' ? 'เปลี่ยนหมวด' : 'Recategorize'}
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-red-500 text-white"
              >
                {lang === 'th' ? 'ลบ' : 'Delete'}
              </button>
              <button
                onClick={handleExitBulk}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction List — Date Grouped */}
      <div className="px-5 space-y-5">
        {filteredTransactions.length === 0 ? (
          <ActivityEmptyState lang={lang} onAddClick={() => setShowAddForm(true)} />
        ) : (
          <>
            {(['today', 'yesterday', 'thisWeek', 'earlier'] as const).map(group => {
              const txs = dateGroups[group];
              if (txs.length === 0) return null;
              const groupLabel = {
                today: lang === 'th' ? 'วันนี้' : 'Today',
                yesterday: lang === 'th' ? 'เมื่อวาน' : 'Yesterday',
                thisWeek: lang === 'th' ? 'สัปดาห์นี้' : 'This Week',
                earlier: lang === 'th' ? 'ก่อนหน้านี้' : 'Earlier',
              }[group];
              return (
                <div key={group}>
                  <h3 className="text-[12px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: dsColors.textMuted }}>
                    {groupLabel} · {txs.length}
                  </h3>
                  <div className="space-y-2">
                    {txs.map(tx => (
                      <TransactionRow
                        key={tx.id}
                        tx={tx}
                        isRecurring={recurringIds.has(tx.id)}
                        showAmount={showAmount}
                        isSelected={selectedIds.has(tx.id)}
                        isBulkMode={isBulkMode}
                        lang={lang}
                        onClick={() => handleTxClick(tx)}
                        onLongPress={() => handleTxLongPress(tx)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Detail Drawer */}
      <TransactionDetailDrawer
        tx={selectedTx}
        isRecurring={selectedTx ? recurringIds.has(selectedTx.id) : false}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={() => {
          if (selectedTx && !selectedTx.splitOf) {
            setEditingTx(selectedTx);
            setMerchant(selectedTx.merchant);
            setAmount(String(Math.abs(selectedTx.amount)));
            setCategory(selectedTx.category);
            setNoteInput(selectedTx.note || '');
            setShowAddForm(true);
          }
          setIsDetailOpen(false);
        }}
        onDelete={() => {
          if (selectedTx && onDeleteTransaction) {
            onDeleteTransaction(selectedTx.id);
            setIsDetailOpen(false);
          }
        }}
        onSaveNote={handleSaveNote}
        onToggleIgnore={handleToggleIgnore}
        onSplit={handleSplitTx}
        onUndoSplit={handleUndoSplit}
        isSplitSource={!!selectedTx && transactions.some(t => t.id === `${selectedTx.id}-split`)}
        showAmount={showAmount}
        lang={lang}
      />

      {/* Add/Edit Transaction Modal (Simplified 2-Layer) */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            <div className="absolute inset-0 bg-black/50" onClick={resetAddForm} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold" style={{ color: dsColors.text }}>
                  {editingTx
                    ? (lang === 'th' ? 'แก้ไขรายการ' : 'Edit Transaction')
                    : (lang === 'th' ? 'บันทึกรายการ' : 'Add Transaction')}
                </h2>
                <button onClick={resetAddForm} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <X className="w-5 h-5" style={{ color: dsColors.textMuted }} />
                </button>
              </div>

              <form onSubmit={handleAddNewTx} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: dsColors.textMuted }}>
                    {lang === 'th' ? 'รายการ' : 'Merchant'}
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => { setMerchant(e.target.value); setRuleSuggestion(null); }}
                    onBlur={() => {
                      if (!merchant.trim()) return;
                      const match = matchRules(rules, merchant);
                      if (match && match.category !== category) setRuleSuggestion(match);
                    }}
                    placeholder="Starbucks, Netflix, Grab..."
                    className="w-full px-4 py-3 rounded-2xl text-[14px] outline-none"
                    style={{ backgroundColor: dsColors.surface, color: dsColors.text, border: '1px solid transparent', fontFamily: getFontStyle(lang).fontFamily }}
                  />
                  {/* ── Rule suggestion (#6c) ── */}
                  {ruleSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2.5 rounded-xl flex items-center gap-2"
                      style={{ backgroundColor: 'rgba(23, 134, 194, 0.12)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#1786C2' }} />
                      <p className="text-[11px] flex-1" style={{ color: dsColors.text }}>
                        {lang === 'th' ? 'กฎของคุณ' : 'Your rule'} “{ruleSuggestion.pattern}” → {ruleSuggestion.category}
                      </p>
                      <button
                        onClick={() => { haptics.fire('SELECT'); setCategory(ruleSuggestion.category); setRuleSuggestion(null); }}
                        className="px-2 py-1 rounded-md text-[10px] font-bold"
                        style={{ backgroundColor: '#1786C2', color: '#FFFFFF' }}
                      >
                        {lang === 'th' ? 'ใช้' : 'Apply'}
                      </button>
                      <button onClick={() => setRuleSuggestion(null)} aria-label="Dismiss">
                        <X className="w-3.5 h-3.5" style={{ color: dsColors.textMuted }} />
                      </button>
                    </motion.div>
                  )}
                  {aiPreset && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2.5 rounded-xl flex items-center gap-2"
                      style={{ backgroundColor: 'rgba(15, 176, 206, 0.1)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: dsColors.accent }} />
                      <p className="text-[11px] flex-1" style={{ color: dsColors.text }}>
                        <span className="font-bold" style={{ color: dsColors.accent }}>{aiPreset.matchingTerm}</span> detected
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: dsColors.textMuted }}>
                      {lang === 'th' ? 'จำนวนเงิน' : 'Amount'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-2xl text-[14px] outline-none"
                      style={{ backgroundColor: dsColors.surface, color: dsColors.text, fontFamily: dsTypography.fontMono }}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium mb-1.5" style={{ color: dsColors.textMuted }}>
                      {lang === 'th' ? 'หมวดหมู่' : 'Category'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-3 rounded-2xl text-[14px] outline-none"
                      style={{ backgroundColor: dsColors.surface, color: dsColors.text }}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{lang === 'th' ? c.labelTh : c.labelEn}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── Note (#6a) ── */}
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: dsColors.textMuted }}>
                    {lang === 'th' ? 'โน้ต (ไม่บังคับ)' : 'Note (optional)'}
                  </label>
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    maxLength={500}
                    placeholder={lang === 'th' ? 'เช่น กาแฟกับทีม' : 'e.g. team coffee'}
                    className="w-full px-4 py-3 rounded-2xl text-[14px] outline-none"
                    style={{ backgroundColor: dsColors.surface, color: dsColors.text, fontFamily: getFontStyle(lang).fontFamily }}
                  />
                </div>

                {formError && (
                  <div className="p-3 rounded-2xl text-[12px] font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-95"
                  style={{ backgroundColor: dsColors.accent, color: '#0A0A0A' }}
                >
                  {editingTx
                    ? (lang === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes')
                    : (lang === 'th' ? 'บันทึกรายการ' : 'Save Transaction')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Empty State (Design System) ────────────────────────────────────────────
const ActivityEmptyState: React.FC<{ lang: Language; onAddClick: () => void }> = ({ lang, onAddClick }) => (
  <EmptyState
    icon={Receipt}
    title={lang === 'th' ? 'ยังไม่มีรายการ' : 'No transactions yet'}
    description={
      lang === 'th'
        ? 'เริ่มบันทึกรายการแรกเพื่อให้ AI วิเคราะห์พฤติกรรมการใช้จ่ายของคุณ'
        : 'Record your first transaction to let AI analyze your spending behavior.'
    }
    actionLabel={lang === 'th' ? '+ เพิ่มรายการแรก' : '+ Record first transaction'}
    onAction={onAddClick}
  />
);
