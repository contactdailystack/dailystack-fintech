/**
 * ============================================================
 * DailyStack — SubscriptionTrackerPage (Subscription Shadow) v4.0
 * ============================================================
 * Redesigned to Light Mode (Flat White) matching Net Worth:
 * - Lime accent (#0FB0CE) — matches Home/Net Worth
 * - Flat white header (#FFFFFF) — matches Home/Net Worth
 * - Light hero card (#F5F5F5) — matches Home/Net Worth
 * - Full-bleed content padding — matches Home/Net Worth
 * - 36px hero typography — matches Home/Net Worth
 * - Privacy toggle + Last sync + Pull-to-refresh
 * - AI Insights card (Ghost Hunter pattern from Net Worth)
 * - pageTokens as single source of truth
 *
 * Tesla-Style Naming:
 * - Page: Subscription Shadow (เงาการสมัคร)
 * - Feature: Smart Insights (สมาร์ทอินไซต์)
 *
 * Business Logic (preserved 100%):
 * - All types, utility functions, state, handlers
 * - SubscriptionModal, ActionsMenu
 * - BottomNav integration via FloatingBottomNav
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Plus,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Check,
  SkipForward,
  Pencil,
  Trash2,
  EyeOff as HideIcon,
  RotateCcw,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Ghost,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { MERCHANT_DATABASE, CATEGORY_META } from '../services/merchantDatabase';
import type { MerchantTemplate } from '../services/merchantDatabase';
// Re-export for CSVImportModal (imports from this file)
export { MERCHANT_DATABASE, CATEGORY_META };
import CSVImportModal from './CSVImportModal';
import { haptics } from '../services/hapticService';
import { Language } from '../data/translations';
import { pageTokens } from '../design-system/page-tokens';
import {
  loadSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  toggleSubscriptionActive,
} from '../services/subscriptionService';
import { EmptyState } from '../design-system/components/EmptyState';

// ─── Design Tokens (DailyStack Single Source of Truth) ──────────────────────
const dsColors = pageTokens.colors;
const dsTypography = pageTokens.typography;
const dsLayout = pageTokens.layout;

// ─── Types ───────────────────────────────────────────────────────────────────
type BillingCycle = 'weekly' | 'monthly' | 'yearly';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  category: string;
  billingCycle: BillingCycle;
  color?: string;
  icon?: string;
  isActive: boolean;
  lastPaidDate?: string;
  /** ISO date the row was created (from DB) — ghost heuristic baseline */
  createdAt?: string;
  paidDates?: number[];
  skipDates?: number[];
  priceChange?: number; // % change from last billing
  isGhost?: boolean; // unused subscription
  trialEndDate?: string; // free-trial tracking (#3)
}

interface SubscriptionTrackerPageProps {
  lang: Language;
  theme?: 'dark' | 'light';
  /** Day of month salary arrives (1–31) from profile — enables the "before payday" window */
  paydayDay?: number;
  onNavigateToUpgrade?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToNotifications?: () => void;
}

// ─── Utility Functions ───────────────────────────────────────────────────────

const getFontStyle = (lang: Language) => ({
  fontFamily: lang === 'th' ? dsTypography.fontTH : dsTypography.fontEN,
});

const formatCurrency = (amount: number, lang: Language): string => {
  // All amounts stored in THB (baht). Display in THB regardless of language.
  if (lang === 'th') {
    return `฿${amount.toLocaleString('th-TH')}`;
  }
  // English display: THB amount shown as-is, with ฿ symbol
  return `฿${amount.toLocaleString('en-US')}`;
};

/**
 * Format amount for calendar cell badges (compact: 1.4k, 15k, etc.)
 */
const formatAmountCompact = (amount: number, _lang: Language): string => {
  // All amounts in THB (baht). Compact display for calendar badges.
  const symbol = '฿';
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${symbol}${m < 10 ? m.toFixed(1) : Math.round(m)}M`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${symbol}${k < 10 ? k.toFixed(1) : Math.round(k)}k`;
  }
  return `${symbol}${amount.toLocaleString()}`;
};

/**
 * Brand color lookup
 */
const getBrandColor = (sub: Subscription): string => {
  if (sub.color) return sub.color;
  const nameKey = sub.name.toLowerCase();
  for (const [key, value] of Object.entries(dsColors.brandColors)) {
    if (nameKey.includes(key) || key.includes(nameKey)) return value as string;
  }
  const firstWord = nameKey.split(/\s+/)[0];
  for (const [key, value] of Object.entries(dsColors.brandColors)) {
    if (firstWord === key || firstWord.startsWith(key) || key.startsWith(firstWord)) return value as string;
  }
  return (dsColors.category as Record<string, string>)[sub.category] || dsColors.category.other;
};

/**
 * 1-letter logo (matches reference: S, N, R, etc.)
 */
const getLogoLetter = (sub: Subscription): string => {
  if (sub.icon) return sub.icon;
  const name = sub.name.trim();
  if (!name) return '?';
  return name[0].toUpperCase();
};

const getDaysUntilDue = (dueDate: number, currentDay: number, daysInMonth: number, lang?: Language): {
  days: number;
  text: string;
  isToday: boolean;
  isSoon: boolean;
  urgencyLevel: 'today' | 'soon' | 'normal' | 'later';
} => {
  let daysUntil = dueDate - currentDay;
  if (daysUntil < 0) daysUntil += daysInMonth;
  const isToday = daysUntil === 0;
  const isSoon = daysUntil <= 3;
  let text: string;
  let urgencyLevel: 'today' | 'soon' | 'normal' | 'later';
  const th = lang === 'th';
  if (isToday) { text = th ? 'วันนี้' : 'today'; urgencyLevel = 'today'; }
  else if (daysUntil === 1) { text = th ? 'พรุ่งนี้' : 'tomorrow'; urgencyLevel = 'soon'; }
  else if (daysUntil <= 7) { text = th ? `อีก ${daysUntil} วัน` : `in ${daysUntil} days`; urgencyLevel = 'soon'; }
  else { text = th ? `อีก ${daysUntil} วัน` : `in ${daysUntil} days`; urgencyLevel = daysUntil <= 14 ? 'normal' : 'later'; }
  return { days: daysUntil, text, isToday, isSoon, urgencyLevel };
};

const getUpcomingInWindow = (
  subscriptions: Subscription[],
  currentDay: number,
  daysInMonth: number,
  paydayDay: number = 25,
  paydayMode: boolean = false
): Subscription[] => {
  return subscriptions
    .filter(sub => {
      if (!sub.isActive) return false;
      if (sub.paidDates?.includes(currentDay)) return false;
      if (sub.skipDates?.includes(currentDay)) return false;
      const { days } = getDaysUntilDue(sub.dueDate, currentDay, daysInMonth);
      if (paydayMode) {
        let daysUntilPayday = paydayDay - currentDay;
        if (daysUntilPayday < 0) daysUntilPayday += daysInMonth;
        return days <= daysUntilPayday;
      }
      return days <= 7;
    })
    .sort((a, b) => {
      const aDays = getDaysUntilDue(a.dueDate, currentDay, daysInMonth).days;
      const bDays = getDaysUntilDue(b.dueDate, currentDay, daysInMonth).days;
      return aDays - bDays;
    });
};

const getWindowTotal = (subscriptions: Subscription[]): number => {
  return subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
};

const getAnnualizedAmount = (subscription: Subscription): number => {
  switch (subscription.billingCycle) {
    case 'weekly': return subscription.amount * 52;
    case 'yearly': return subscription.amount;
    case 'monthly':
    default: return subscription.amount * 12;
  }
};

const getBillingCycleLabel = (cycle: BillingCycle, lang: Language): string => {
  switch (cycle) {
    case 'weekly': return lang === 'th' ? 'รายสัปดาห์' : 'Weekly';
    case 'yearly': return lang === 'th' ? 'รายปี' : 'Yearly';
    case 'monthly':
    default: return lang === 'th' ? 'รายเดือน' : 'Monthly';
  }
};

// ─── Pull-to-Refresh Hook (Net Worth pattern) ────────────────────────────────
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

// ─── AI Insights Card (Net Worth pattern) ───────────────────────────────────
interface AIInsightsCardProps {
  ghostCount: number;
  potentialSavings: number;
  priceHikeCount: number;
  lang: Language;
  dsColors: typeof pageTokens.colors;
}

const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ ghostCount, potentialSavings, priceHikeCount, lang, dsColors }) => {
  const getInsight = () => {
    if (ghostCount > 0) {
      return lang === 'th'
        ? `พบ ${ghostCount} รายการที่ไม่ได้ใช้ ประหยัดได้ ${formatCurrency(potentialSavings, lang)}/เดือน`
        : `${ghostCount} unused subs found. Save ${formatCurrency(potentialSavings, lang)}/month`;
    }
    if (priceHikeCount > 0) {
      return lang === 'th'
        ? `${priceHikeCount} รายการขึ้นราคา — ตรวจสอบและเจรจาได้`
        : `${priceHikeCount} price hikes detected — review and negotiate`;
    }
    return lang === 'th'
      ? 'ค่าใช้จ่ายของคุณอยู่ในเกณฑ์ดี ไม่มีรายการผิดปกติ'
      : 'Your spending looks healthy — no anomalies detected';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[16px] px-5 py-4"
      style={{
        backgroundColor: 'rgba(15, 176, 206, 0.1)',
        border: '1px solid rgba(15, 176, 206, 0.3)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(15, 176, 206, 0.2)' }}
        >
          <Ghost className="w-5 h-5" style={{ color: dsColors.accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold mb-1" style={{ color: '#111827' }}>
            {lang === 'th' ? 'สมาร์ทอินไซต์' : 'Smart Insights'}
          </p>
          <p className="text-[14px]" style={{ color: '#111827' }}>
            {getInsight()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Tab Switcher (Net Worth underline pattern) ─────────────────────────────
type TabType = 'upcoming' | 'all' | 'calendar';

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  lang: Language;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, onTabChange, lang }) => {
  const tabs: { id: TabType; labelEn: string; labelTh: string }[] = [
    { id: 'upcoming', labelEn: 'Upcoming', labelTh: 'กำลังจะมาถึง' },
    { id: 'all', labelEn: 'All', labelTh: 'ทั้งหมด' },
  ];

  return (
    <div className="flex gap-6 mt-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => { haptics.fire('SELECT'); onTabChange(tab.id); }}
            className="pb-3 text-[15px] font-semibold transition-all relative"
            style={{ color: isActive ? dsColors.text : dsColors.textMuted }}
          >
            {lang === 'th' ? tab.labelTh : tab.labelEn}
            {isActive && (
              <motion.div
                layoutId="recurringActiveTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: dsColors.accent }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── Privacy Toggle (Net Worth pattern) ─────────────────────────────────────
interface PrivacyToggleProps {
  showAmount: boolean;
  onToggle: () => void;
  lang: Language;
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({ showAmount, onToggle, lang }) => (
  <button
    onClick={() => { haptics.fire('SELECT'); onToggle(); }}
    className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95"
    style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    aria-label={showAmount ? (lang === 'th' ? 'ซ่อนตัวเลข' : 'Hide amounts') : (lang === 'th' ? 'แสดงตัวเลข' : 'Show amounts')}
  >
    {showAmount ? <Eye className="w-4 h-4" style={{ color: '#71717A' }} /> : <EyeOff className="w-4 h-4" style={{ color: dsColors.accent }} />}
  </button>
);

// ─── Hero Card (Flat White Light Mode — Net Worth pattern) ─────────────────
interface HeroCardProps {
  totalMonthly: number;
  totalYearly: number;
  totalSubs: number;
  totalBills: number;
  activeCount: number;
  showAmount: boolean;
  lang: Language;
  dsColors: typeof pageTokens.colors;
  dsTypography: typeof pageTokens.typography;
  onPrivacyToggle: () => void;
  onSeeAllClick: () => void;
}

const HeroCard: React.FC<HeroCardProps> = ({
  totalMonthly, totalYearly, totalSubs, totalBills, activeCount, showAmount, lang, dsColors, dsTypography, onPrivacyToggle, onSeeAllClick,
}) => (
  <div
    className="rounded-[24px] p-5 -mx-2"
    style={{
      backgroundColor: '#F5F5F5',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}
  >
    {/* Row 1: Label + Privacy Toggle */}
    <div className="flex items-center justify-between mb-1">
      <span
        className="text-[13px] font-medium"
        style={{ fontFamily: dsTypography.fontEN, color: dsColors.textMuted }}
      >
        {lang === 'th' ? 'ค่าใช้จ่ายต่อเดือน' : 'Monthly recurring spend'}
      </span>
      <PrivacyToggle showAmount={showAmount} onToggle={onPrivacyToggle} lang={lang} />
    </div>

    {/* Row 2: Main Amount — 36px bold (Net Worth pattern) */}
    <div className="flex items-baseline gap-2 mb-3">
      <h2
        className="text-[36px] font-bold leading-none"
        style={{
          color: dsColors.text,
          fontFamily: dsTypography.fontMono,
          letterSpacing: '-1px',
        }}
      >
        {showAmount ? formatCurrency(totalMonthly, lang) : '••••'}
      </h2>
      <span
        className="text-[13px] font-medium"
        style={{ color: dsColors.textMuted }}
      >
        /{lang === 'th' ? 'เดือน' : 'mo'}
      </span>
    </div>

    {/* Row 3: Lime insight pill (Home pattern) */}
    <div className="flex items-center gap-2 mb-3">
      <div
        className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full"
        style={{ backgroundColor: 'rgba(15, 176, 206, 0.15)' }}
      >
        <TrendingDown className="w-3.5 h-3.5" style={{ color: dsColors.accent }} />
        <span className="text-[12px] font-semibold" style={{ color: dsColors.accent }}>
          {showAmount ? formatCurrency(totalYearly, lang) : '••••'} {lang === 'th' ? 'ต่อปี' : '/year'}
        </span>
      </div>
      <span
        className="text-[11px] font-medium"
        style={{ color: dsColors.textMuted }}
      >
        {activeCount} {lang === 'th' ? 'รายการ' : 'active'}
      </span>
    </div>

    {/* Row 4: Divider (Net Worth pattern) */}
    <div className="h-px mb-3" style={{ backgroundColor: dsColors.border }} />

    {/* Row 5: Breakdown — Sub vs Bills (Net Worth style) */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-[11px] font-medium mb-1" style={{ color: dsColors.textMuted }}>
          {lang === 'th' ? 'รายการสมัคร' : 'Subscriptions'}
        </p>
        <p className="text-[17px] font-bold" style={{ color: dsColors.text, fontFamily: dsTypography.fontMono }}>
          {showAmount ? formatCurrency(totalSubs, lang) : '••••'}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-medium mb-1" style={{ color: dsColors.textMuted }}>
          {lang === 'th' ? 'บิลและค่าบริการ' : 'Bills'}
        </p>
        <p className="text-[17px] font-bold" style={{ color: dsColors.text, fontFamily: dsTypography.fontMono }}>
          {showAmount ? formatCurrency(totalBills, lang) : '••••'}
        </p>
      </div>
    </div>

    {/* See full calendar button */}
    <button
      onClick={onSeeAllClick}
      className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95"
      style={{ backgroundColor: dsColors.accent, color: '#111827' }}
    >
      <Calendar className="w-4 h-4" />
      {lang === 'th' ? 'ดูปฏิทินเต็ม' : 'See full calendar'}
    </button>
  </div>
);

// ─── Subscription Item Card (48px logo, white card with shadow) ──────────────
interface SubscriptionItemProps {
  subscription: Subscription;
  currentDay: number;
  daysInMonth: number;
  lang: Language;
  onMenuOpen: (sub: Subscription) => void;
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  subscription, currentDay, daysInMonth, lang, onMenuOpen,
}) => {
  const daysInfo = getDaysUntilDue(subscription.dueDate, currentDay, daysInMonth, lang);
  const brandColor = getBrandColor(subscription);
  const logoLetter = getLogoLetter(subscription);
  const isGhost = subscription.isGhost;
  const priceHiked = subscription.priceChange && subscription.priceChange > 0;
  // ── Free-trial badge (#3): days remaining, urgent when ≤ 3 days ──
  const trialDaysLeft = (() => {
    if (!subscription.trialEndDate) return null;
    const end = new Date(subscription.trialEndDate);
    if (isNaN(end.getTime())) return null;
    const diff = Math.ceil((end.getTime() - Date.now()) / 86400000);
    return diff >= 0 ? diff : null; // expired trials stop showing
  })();
  const trialUrgent = trialDaysLeft !== null && trialDaysLeft <= 3;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      // Pill Card spec — matches Home "Complete Setup" pattern
      className="w-full flex items-center gap-3 rounded-full px-6 py-3 active:scale-[0.98] transition-all text-left"
      style={{
        backgroundColor: dsColors.surface,
        opacity: subscription.isActive ? 1 : 0.5,
      }}
    >
      {/* Brand Logo — 48px (Net Worth pattern) */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold text-white shrink-0 relative"
        style={{ backgroundColor: brandColor }}
      >
        <span style={{ fontFamily: dsTypography.fontEN }}>{logoLetter}</span>
        {isGhost && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FFFFFF', border: '2px solid #E5E5E5' }}
          >
            <Ghost className="w-2.5 h-2.5" style={{ color: dsColors.accent }} />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="text-[15px] font-semibold truncate"
            style={{ color: dsColors.text, ...getFontStyle(lang) }}
          >
            {subscription.name}
          </h3>
          {priceHiked && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: dsColors.negative }}
            >
              <TrendingUp className="w-2.5 h-2.5" />
              {subscription.priceChange}%
            </span>
          )}
          {trialDaysLeft !== null && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
              style={{
                backgroundColor: trialUrgent ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: trialUrgent ? dsColors.negative : '#D97706',
              }}
            >
              {trialUrgent
                ? (lang === 'th' ? `หมดทดลอง ${trialDaysLeft} วัน` : `Trial ends in ${trialDaysLeft}d`)
                : (lang === 'th' ? `ทดลองใช้อีก ${trialDaysLeft} วัน` : `Trial · ${trialDaysLeft}d left`)}
            </span>
          )}
        </div>
        <p className="text-[12px] mt-0.5 truncate" style={{ color: dsColors.textMuted }}>
          {daysInfo.text} · {getBillingCycleLabel(subscription.billingCycle, lang)}
        </p>
      </div>

      {/* Amount — font-mono (Net Worth pattern) */}
      <span
        className="text-[15px] font-bold shrink-0"
        style={{
          color: subscription.isActive ? dsColors.text : dsColors.textMuted,
          fontFamily: dsTypography.fontMono,
        }}
      >
        {formatCurrency(subscription.amount, lang)}
      </span>

      {/* More Options — 44x44 touch target */}
      <button
        onClick={(e) => { e.stopPropagation(); haptics.fire('SELECT'); onMenuOpen(subscription); }}
        className="w-11 h-11 -mr-2 rounded-full flex items-center justify-center transition-colors active:bg-gray-200"
        style={{ color: dsColors.textMuted }}
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    </motion.button>
  );
};

// ─── Sort Dropdown (Lime active state) ──────────────────────────────────────
type SortType = 'type' | 'amount' | 'name';

interface SortDropdownProps {
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  lang: Language;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onSortChange, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options: { id: SortType; labelEn: string; labelTh: string }[] = [
    { id: 'type', labelEn: 'Type', labelTh: 'ประเภท' },
    { id: 'amount', labelEn: 'Amount', labelTh: 'จำนวน' },
    { id: 'name', labelEn: 'Name', labelTh: 'ชื่อ' },
  ];
  const currentLabel = options.find(o => o.id === sortBy);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => { haptics.fire('SELECT'); setIsOpen(!isOpen); }}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all bg-white"
        style={{ border: `1px solid ${dsColors.border}`, color: dsColors.text }}
      >
        <span>{lang === 'th' ? 'เรียงตาม' : 'Sort by'}:</span>
        <span style={{ color: dsColors.accent }}>
          {currentLabel ? (lang === 'th' ? currentLabel.labelTh : currentLabel.labelEn) : ''}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute top-full left-0 mt-2 z-50 py-2 rounded-2xl shadow-lg min-w-[160px] bg-white"
            style={{ border: `1px solid ${dsColors.border}` }}
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => { haptics.fire('SELECT'); onSortChange(option.id); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left text-[14px] font-medium transition-colors"
                style={{
                  backgroundColor: sortBy === option.id ? 'rgba(15, 176, 206, 0.15)' : 'transparent',
                  color: sortBy === option.id ? dsColors.accent : dsColors.text,
                }}
              >
                {lang === 'th' ? option.labelTh : option.labelEn}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── All Tab Item (List row pattern) ─────────────────────────────────────────
interface AllTabItemProps {
  subscription: Subscription;
  lang: Language;
  onMenuOpen: (sub: Subscription) => void;
  showAmount?: boolean;
}

// Annualized price (RM parity): weekly×52 · monthly×12 · yearly as-is
const getAnnualAmount = (sub: Subscription): number => {
  if (sub.billingCycle === 'weekly') return sub.amount * 52;
  if (sub.billingCycle === 'monthly') return sub.amount * 12;
  return sub.amount;
};

const AllTabItem: React.FC<AllTabItemProps> = ({ subscription, lang, onMenuOpen, showAmount = true }) => {
  const brandColor = getBrandColor(subscription);
  const logoLetter = getLogoLetter(subscription);
  // Same badges as the Upcoming tab (P1-8)
  const priceHiked = subscription.priceChange && subscription.priceChange > 0;
  const trialDaysLeft = (() => {
    if (!subscription.trialEndDate) return null;
    const end = new Date(subscription.trialEndDate);
    if (isNaN(end.getTime())) return null;
    const diff = Math.ceil((end.getTime() - Date.now()) / 86400000);
    return diff >= 0 ? diff : null; // expired trials stop showing
  })();
  const trialUrgent = trialDaysLeft !== null && trialDaysLeft <= 3;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      // Pill Card spec — matches Home "Complete Setup" pattern
      className="w-full flex items-center gap-3 rounded-full px-6 py-3 active:scale-[0.98] transition-all text-left"
      style={{
        backgroundColor: dsColors.surface,
        opacity: subscription.isActive ? 1 : 0.5,
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold text-white shrink-0"
        style={{ backgroundColor: brandColor }}
      >
        <span style={{ fontFamily: dsTypography.fontEN }}>{logoLetter}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="text-[15px] font-semibold truncate"
            style={{ color: dsColors.text, ...getFontStyle(lang) }}
          >
            {subscription.name}
          </h3>
          {priceHiked && subscription.isActive && (
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: dsColors.negative }}
            >
              <TrendingUp className="w-2.5 h-2.5" />
              {subscription.priceChange}%
            </span>
          )}
          {trialDaysLeft !== null && subscription.isActive && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
              style={{
                backgroundColor: trialUrgent ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: trialUrgent ? dsColors.negative : '#D97706',
                fontFamily: dsTypography.fontMono,
              }}
            >
              {lang === 'th'
                ? `ทดลองใช้อีก ${trialDaysLeft} วัน`
                : trialUrgent ? `${trialDaysLeft}d left` : `${trialDaysLeft} days left`}
            </span>
          )}
        </div>
        <p className="text-[12px] mt-0.5" style={{ color: dsColors.textMuted }}>
          {getBillingCycleLabel(subscription.billingCycle, lang)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span
          className="text-[15px] font-bold"
          style={{
            color: subscription.isActive ? dsColors.text : dsColors.textMuted,
            fontFamily: dsTypography.fontMono,
          }}
        >
          {formatCurrency(subscription.amount, lang)}
        </span>
        {subscription.billingCycle !== 'yearly' && (
          <p className="text-[10px] font-mono mt-0.5" style={{ color: dsColors.textMuted }}>
            ≈ {showAmount ? formatCurrency(getAnnualAmount(subscription), lang) : '••••'}/{lang === 'th' ? 'ปี' : 'yr'}
          </p>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); haptics.fire('SELECT'); onMenuOpen(subscription); }}
        className="w-11 h-11 -mr-2 rounded-full flex items-center justify-center transition-colors active:bg-gray-200"
        style={{ color: dsColors.textMuted }}
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    </motion.button>
  );
};

// ─── Full Month Calendar View (Net Worth dark footer pattern) ───────────────
interface FullCalendarViewProps {
  subscriptions: Subscription[];
  currentMonth: number;
  currentYear: number;
  daysInMonth: number;
  lang: Language;
  onDateClick: (day: number) => void;
  onMonthChange: (month: number, year: number) => void;
  onBack: () => void;
  showAmount: boolean;
  totalMonthly: number;
  totalYearly: number;
}

const FullCalendarView: React.FC<FullCalendarViewProps> = ({
  subscriptions, currentMonth, currentYear, daysInMonth, lang,
  onDateClick, onMonthChange, onBack, showAmount, totalMonthly, totalYearly,
}) => {
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesTh = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  // Mon-first day labels (matches reference)
  const dayNames = lang === 'th'
    ? ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const currentDay = isCurrentMonth ? today.getDate() : -1;

  const subsByDay = useMemo(() => {
    const map: Record<number, Subscription[]> = {};
    subscriptions.filter(s => s.isActive).forEach(s => {
      if (!map[s.dueDate]) map[s.dueDate] = [];
      map[s.dueDate].push(s);
    });
    return map;
  }, [subscriptions]);

  // Mon-first: (jsDay + 6) % 7
  const firstDayOfMonthJs = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayOfMonthMonFirst = (firstDayOfMonthJs + 6) % 7;
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonthMonFirst; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const prevMonth = () => {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    onMonthChange(newMonth, newYear);
  };
  const nextMonth = () => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    onMonthChange(newMonth, newYear);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: dsColors.background }}>
      {/* Header — Flat white (Home/Net Worth pattern) */}
      <div
        className="px-0 pt-1 pb-3"
        style={{ backgroundColor: dsColors.background, borderBottom: `1px solid ${dsColors.border}` }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors active:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6" style={{ color: dsColors.text }} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors active:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" style={{ color: dsColors.textMuted }} />
            </button>
            <h3
              className="text-[17px] font-semibold min-w-[120px] text-center"
              style={{ color: dsColors.text, ...getFontStyle(lang) }}
            >
              {lang === 'th' ? monthNamesTh[currentMonth] : monthNamesEn[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={nextMonth}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors active:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" style={{ color: dsColors.textMuted }} />
            </button>
          </div>

          <div className="w-11 h-11" />
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 px-3 pt-3 pb-48">
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day, i) => (
            <div
              key={i}
              className="text-center text-[11px] font-medium"
              style={{ color: dsColors.textMuted }}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px">
          {calendarDays.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;
            const subsOnDay = subsByDay[day] || [];
            const hasSubs = subsOnDay.length > 0;
            const isToday = day === currentDay;
            const isPast = currentDay > 0 && day < currentDay;

            return (
              <div
                key={day}
                onClick={() => hasSubs && onDateClick(day)}
                className={`
                  aspect-square flex flex-col items-center justify-start pt-1
                  transition-all relative
                  ${hasSubs ? 'cursor-pointer active:scale-95' : 'cursor-default'}
                `}
                style={{
                  backgroundColor: isToday ? 'rgba(15, 176, 206, 0.15)' : 'transparent',
                  opacity: isPast ? 0.45 : 1,
                }}
              >
                <span
                  className="text-[10px] self-start pl-1"
                  style={{
                    color: isToday ? '#65A30D' : isPast ? dsColors.textMuted : dsColors.text,
                    fontWeight: isToday ? 700 : 500,
                  }}
                >
                  {day}
                </span>
                {hasSubs && (
                  <div className="flex flex-col gap-0.5 mt-0.5 w-full items-center">
                    {subsOnDay.slice(0, 3).map((sub) => {
                      const brandColor = getBrandColor(sub);
                      return (
                        <div key={sub.id} className="flex flex-col items-center gap-0.5 w-full">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                            style={{ backgroundColor: brandColor }}
                          >
                            <span>{getLogoLetter(sub)}</span>
                          </div>
                          <div
                            className="px-1 py-px rounded text-[8px] font-bold leading-none"
                            style={{
                              backgroundColor: dsColors.accent,
                              color: '#111827',
                              minWidth: 18,
                              textAlign: 'center',
                            }}
                          >
                            {formatAmountCompact(sub.amount, lang)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Footer — Flat White Light Mode (rounded-[24px] for consistency) */}
      <div
        className="fixed bottom-[84px] left-0 right-0 z-30 px-2 pb-3"
      >
        <div
          className="rounded-[24px] p-5"
          style={{
            backgroundColor: '#F5F5F5',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <span className="text-[12px] font-medium" style={{ color: dsColors.textMuted }}>
              {subscriptions.filter(s => s.isActive && s.category !== 'bills').length} {lang === 'th' ? 'รายการสมัคร' : 'Subscriptions'}
            </span>
            <span className="text-[12px] font-medium" style={{ color: dsColors.textMuted }}>
              {subscriptions.filter(s => s.isActive && s.category === 'bills').length} {lang === 'th' ? 'บิลและค่าบริการ' : 'Bills'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span
              className="text-[36px] font-bold leading-none"
              style={{ color: dsColors.text, fontFamily: dsTypography.fontMono, letterSpacing: '-1px' }}
            >
              {showAmount ? formatCurrency(totalMonthly, lang) : '••••'}
            </span>
            <span
              className="text-[36px] font-bold leading-none"
              style={{ color: dsColors.text, fontFamily: dsTypography.fontMono, letterSpacing: '-1px' }}
            >
              ~{showAmount ? formatCurrency(totalYearly, lang) : '••••'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State (Design System) ────────────────────────────────────────────
const SubscriptionEmptyState: React.FC<{ lang: Language }> = ({ lang }) => (
  <EmptyState
    icon={Sparkles}
    title={lang === 'th' ? 'ยังไม่มีรายการ' : 'No subscriptions yet'}
    description={
      lang === 'th'
        ? 'เพิ่มรายการบิลหรือบริการที่คุณใช้เป็นประจำ'
        : 'Add your recurring subscriptions to track your monthly spending'
    }
  />
);

// ─── Add/Edit Modal — Full UX Redesign ───────────────────────────────────────
// Key improvements:
// - Merchant quick-add with Thai-specific merchants
// - THB currency (no more "สตางค์" confusion)
// - 8 expanded categories
// - Smart pre-fill when merchant selected
// - Inline validation
// - Mobile-optimized keyboard handling

interface SubscriptionModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  subscription?: Subscription | null;
  onClose: () => void;
  onSave: (sub: Omit<Subscription, 'id'> | Subscription) => void;
  lang: Language;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen, mode, subscription, onClose, onSave, lang,
}) => {
  const [name, setName] = useState(subscription?.name || '');
  const [amount, setAmount] = useState(subscription?.amount?.toString() || '');
  const [dueDate, setDueDate] = useState((subscription?.dueDate || 1).toString());
  const [category, setCategory] = useState(subscription?.category || 'other');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription?.billingCycle || 'monthly');
  const [isActive, setIsActive] = useState(subscription?.isActive ?? true);
  // ── Free-trial tracking (#3) ──
  const [hasTrial, setHasTrial] = useState(!!subscription?.trialEndDate);
  const [trialEndDate, setTrialEndDate] = useState(subscription?.trialEndDate || '');
  // ── Merchant search state ──
  const [showMerchantPicker, setShowMerchantPicker] = useState(false);
  const [merchantSearch, setMerchantSearch] = useState('');
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  // Reset when opened / mode changes
  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setAmount(subscription.amount.toString());
      setDueDate(subscription.dueDate.toString());
      setCategory(subscription.category);
      setBillingCycle(subscription.billingCycle);
      setIsActive(subscription.isActive);
      setHasTrial(!!subscription.trialEndDate);
      setTrialEndDate(subscription.trialEndDate || '');
      setShowMerchantPicker(false);
      setMerchantSearch('');
    } else {
      setName(''); setAmount(''); setDueDate('1'); setCategory('other'); setBillingCycle('monthly'); setIsActive(true);
      setHasTrial(false); setTrialEndDate('');
      setShowMerchantPicker(false); setMerchantSearch('');
    }
  }, [subscription, isOpen]);

  // Focus name input when modal opens
  useEffect(() => {
    if (isOpen && !subscription) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, subscription]);

  // Filter merchants by search
  const filteredMerchants = useMemo(() => {
    if (!merchantSearch.trim()) return MERCHANT_DATABASE;
    const q = merchantSearch.toLowerCase();
    return MERCHANT_DATABASE.filter(
      m => m.name.toLowerCase().includes(q) || m.nameTh.includes(merchantSearch)
    );
  }, [merchantSearch]);

  // Auto-fill fields when a merchant is selected
  const handleMerchantSelect = (merchant: MerchantTemplate) => {
    setName(lang === 'th' ? merchant.nameTh : merchant.name);
    setAmount(merchant.approximateAmount.toString());
    setCategory(merchant.category);
    setBillingCycle(merchant.billingCycle);
    setShowMerchantPicker(false);
    setMerchantSearch('');
  };

  if (!isOpen) return null;

  // ── Validation ──
  const nameError = name.trim().length > 0 && name.trim().length < 2;
  const amountNum = parseFloat(amount);
  const amountError = amount !== '' && (isNaN(amountNum) || amountNum <= 0);
  const canSubmit = name.trim().length >= 2 && amount !== '' && !amountError;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const subData = {
      name: name.trim(),
      amount: amountNum,
      dueDate: parseInt(dueDate),
      category,
      billingCycle,
      // Preserve the merchant's brand color on edit — only default it for new subs
      color: (mode === 'edit' && subscription?.color) || CATEGORY_META[category]?.color || dsColors.category.other,
      isActive,
      trialEndDate: hasTrial && trialEndDate ? trialEndDate : undefined,
    };
    if (mode === 'edit' && subscription) onSave({ ...subscription, ...subData });
    else onSave(subData);
    onClose();
  };

  // All category keys
  const allCategories = Object.keys(CATEGORY_META);

  // ── Render ──
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
          className="relative w-full max-w-md rounded-t-3xl p-5 pb-8 bg-white max-h-[92vh] overflow-y-auto"
        >
          {/* Drag handle */}
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold" style={{ color: dsColors.text, ...getFontStyle(lang) }}>
              {mode === 'add'
                ? (lang === 'th' ? 'เพิ่มรายการใหม่' : 'Add Subscription')
                : (lang === 'th' ? 'แก้ไขรายการ' : 'Edit Subscription')}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5" style={{ color: dsColors.textMuted }} />
            </button>
          </div>

          {/* ── Step 1: Merchant Picker (only in add mode) ── */}
          {mode === 'add' && !showMerchantPicker && (
            <button
              onClick={() => setShowMerchantPicker(true)}
              className="w-full mb-3 flex items-center gap-2 px-4 py-3 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(15, 176, 206, 0.08)',
                border: `1.5px dashed ${dsColors.accent}`,
                color: dsColors.accent,
              }}
            >
              <Plus className="w-4 h-4" />
              {lang === 'th' ? 'เลือกจากรายการยอดนิยม' : 'Quick add from popular list'}
            </button>
          )}

          {/* ── Merchant Picker Panel ── */}
          {mode === 'add' && showMerchantPicker && (
            <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: '#F5F5F5' }}>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => { setShowMerchantPicker(false); setMerchantSearch(''); }}
                  className="p-1.5 rounded-full hover:bg-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: dsColors.text }} />
                </button>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={merchantSearch}
                  onChange={(e) => setMerchantSearch(e.target.value)}
                  placeholder={lang === 'th' ? 'ค้นหาบริการ...' : 'Search services...'}
                  className="flex-1 px-3 py-2 rounded-lg text-[14px] outline-none bg-white"
                  style={{ border: `1px solid ${dsColors.border}`, color: dsColors.text, ...getFontStyle(lang) }}
                />
              </div>
              {/* Merchant grid */}
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {filteredMerchants.slice(0, 18).map((merchant) => (
                  <button
                    key={merchant.name}
                    onClick={() => handleMerchantSelect(merchant)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all active:scale-95"
                    style={{ backgroundColor: '#FFFFFF', border: `1px solid ${dsColors.border}` }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ backgroundColor: merchant.color }}
                    >
                      {merchant.logo}
                    </div>
                    <span className="text-[10px] font-medium leading-tight" style={{ color: dsColors.text, ...getFontStyle(lang) }}>
                      {lang === 'th' ? merchant.nameTh : merchant.name}
                    </span>
                  </button>
                ))}
                {filteredMerchants.length === 0 && (
                  <p className="col-span-3 text-center text-[13px] py-4" style={{ color: dsColors.textMuted }}>
                    {lang === 'th' ? 'ไม่พบรายการที่ค้นหา' : 'No results found'}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* ── Name ── */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: dsColors.text }}>
                {lang === 'th' ? 'ชื่อบริการ *' : 'Service Name *'}
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'th' ? 'เช่น Netflix, AIS, ค่าเช่า' : 'e.g. Netflix, AIS, Rent'}
                className="w-full px-4 py-3 rounded-xl text-[15px] outline-none"
                style={{
                  border: `1.5px solid ${nameError ? dsColors.negative : dsColors.border}`,
                  backgroundColor: '#FAFAFA',
                  color: dsColors.text,
                  ...getFontStyle(lang),
                }}
                autoFocus={mode === 'edit'}
              />
              {nameError && (
                <p className="text-[11px] mt-1" style={{ color: dsColors.negative }}>
                  {lang === 'th' ? 'กรุณาใส่ชื่ออย่างน้อย 2 ตัวอักษร' : 'Name must be at least 2 characters'}
                </p>
              )}
            </div>

            {/* ── Amount — THB default ── */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: dsColors.text }}>
                {lang === 'th' ? 'จำนวนเงิน (บาท) *' : 'Amount (THB) *'}
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[17px] font-bold"
                  style={{ color: dsColors.accent }}
                >
                  ฿
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-[17px] font-bold outline-none"
                  style={{
                    border: `1.5px solid ${amountError ? dsColors.negative : dsColors.border}`,
                    backgroundColor: '#FAFAFA',
                    color: dsColors.text,
                    fontFamily: dsTypography.fontMono,
                  }}
                />
                {amountError && (
                  <p className="absolute -bottom-5 right-0 text-[11px]" style={{ color: dsColors.negative }}>
                    {lang === 'th' ? 'กรุณาใส่ตัวเลขที่ถูกต้อง' : 'Enter a valid amount'}
                  </p>
                )}
              </div>
            </div>

            {/* ── Due Date ── */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium" style={{ color: dsColors.text }}>
                  {lang === 'th' ? 'วันที่ต้องชำระ' : 'Due Date'}
                </label>
                <span className="text-[14px] font-bold" style={{ color: dsColors.accent, fontFamily: dsTypography.fontMono }}>
                  {lang === 'th' ? `วันที่ ${dueDate}` : `Day ${dueDate}`}
                </span>
              </div>
              <input
                type="range"
                min="1" max="31"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200"
                style={{ accentColor: dsColors.accent }}
              />
              {/* Day chips */}
              <div className="flex justify-between mt-1">
                {[1, 10, 20, 31].map(d => (
                  <button
                    key={d}
                    onClick={() => setDueDate(d.toString())}
                    className="text-[10px] px-1.5 py-0.5 rounded transition-all"
                    style={{ color: dsColors.textMuted }}
                  >
                    {d === 31 ? '' : d}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Category — 8 categories ── */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: dsColors.text }}>
                {lang === 'th' ? 'หมวดหมู่' : 'Category'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {allCategories.map((catId) => {
                  const cat = CATEGORY_META[catId];
                  const isSelected = category === catId;
                  return (
                    <button
                      key={catId}
                      onClick={() => setCategory(catId)}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-center transition-all active:scale-95"
                      style={{
                        backgroundColor: isSelected ? `${cat.color}20` : '#F5F5F5',
                        border: `1.5px solid ${isSelected ? cat.color : 'transparent'}`,
                        color: isSelected ? cat.color : dsColors.textMuted,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[10px] font-medium leading-tight" style={{ ...getFontStyle(lang) }}>
                        {lang === 'th' ? cat.labelTh : cat.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Billing Cycle ── */}
            <div>
              <label className="block text-[12px] font-medium mb-2" style={{ color: dsColors.text }}>
                {lang === 'th' ? 'รอบการเก็บเงิน' : 'Billing Cycle'}
              </label>
              <div className="flex gap-2">
                {(['weekly', 'monthly', 'yearly'] as BillingCycle[]).map((cycle) => {
                  const isSelected = billingCycle === cycle;
                  return (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
                      style={{
                        backgroundColor: isSelected ? dsColors.accent : '#F5F5F5',
                        color: isSelected ? '#111827' : dsColors.text,
                      }}
                    >
                      {getBillingCycleLabel(cycle, lang)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Free Trial (#3) ── */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium" style={{ color: dsColors.text }}>
                  {lang === 'th' ? 'ช่วงทดลองใช้ฟรี' : 'Free Trial'}
                </span>
                <button
                  onClick={() => {
                    setHasTrial(!hasTrial);
                    if (hasTrial) setTrialEndDate('');
                  }}
                  className="w-12 h-7 rounded-full transition-all relative"
                  style={{ backgroundColor: hasTrial ? dsColors.accent : 'rgba(128,128,128,0.2)' }}
                  aria-pressed={hasTrial}
                >
                  <div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all"
                    style={{ left: hasTrial ? 'calc(100% - 24px)' : '4px' }}
                  />
                </button>
              </div>
              {hasTrial && (
                <input
                  type="date"
                  value={trialEndDate}
                  onChange={(e) => setTrialEndDate(e.target.value)}
                  className="w-full mt-2 px-3 py-2.5 rounded-xl text-[14px] outline-none"
                  style={{
                    backgroundColor: '#F5F5F5',
                    color: dsColors.text,
                    fontFamily: dsTypography.fontMono,
                  }}
                  aria-label={lang === 'th' ? 'วันสิ้นสุดทดลองใช้' : 'Trial end date'}
                />
              )}
            </div>

            {/* ── Active Toggle ── */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: dsColors.text }}>
                {lang === 'th' ? 'เปิดใช้งาน' : 'Active'}
              </span>
              <button
                onClick={() => setIsActive(!isActive)}
                className="w-12 h-7 rounded-full transition-all relative"
                style={{ backgroundColor: isActive ? dsColors.accent : 'rgba(128,128,128,0.2)' }}
                aria-pressed={isActive}
              >
                <div
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all"
                  style={{ left: isActive ? 'calc(100% - 24px)' : '4px' }}
                />
              </button>
            </div>
          </div>

          {/* ── Submit Button ── */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full mt-5 py-4 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              backgroundColor: canSubmit ? dsColors.accent : '#E5E5E5',
              color: canSubmit ? '#111827' : '#9CA3AF',
            }}
          >
            {mode === 'add'
              ? (lang === 'th' ? '✓ เพิ่มรายการ' : '✓ Add Subscription')
              : (lang === 'th' ? '✓ บันทึก' : '✓ Save Changes')}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Actions Menu ───────────────────────────────────────────────────────────
interface ActionsMenuProps {
  isOpen: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  lang: Language;
  onMarkPaid: (sub: Subscription) => void;
  onSkip: (sub: Subscription) => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleActive: (sub: Subscription) => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({
  isOpen, subscription, onClose, lang, onMarkPaid, onSkip, onEdit, onDelete, onToggleActive,
}) => {
  if (!isOpen || !subscription) return null;
  const brandColor = getBrandColor(subscription);
  const isInactive = !subscription.isActive;

  const actions = isInactive ? [
    { label: lang === 'th' ? 'เปิดใช้งานอีกครั้ง' : 'Reactivate', icon: RotateCcw, onClick: () => { haptics.fire('SELECT'); onToggleActive(subscription); onClose(); }, color: dsColors.success },
    { label: lang === 'th' ? 'แก้ไข' : 'Edit', icon: Pencil, onClick: () => { haptics.fire('SELECT'); onEdit(subscription); onClose(); }, color: dsColors.accent },
    { label: lang === 'th' ? 'ลบ' : 'Delete', icon: Trash2, onClick: () => { haptics.fire('THUD'); onDelete(subscription.id); onClose(); }, color: dsColors.negative, danger: true },
  ] : [
    { label: lang === 'th' ? 'ทำเครื่องหมายว่าจ่ายแล้ว' : 'Mark as Paid', icon: Check, onClick: () => { haptics.fire('SELECT'); onMarkPaid(subscription); onClose(); }, color: dsColors.success },
    { label: lang === 'th' ? 'ข้ามเดือนนี้' : 'Skip this month', icon: SkipForward, onClick: () => { haptics.fire('SELECT'); onSkip(subscription); onClose(); }, color: dsColors.warning },
    { label: lang === 'th' ? 'ยกเลิกรายการนี้' : 'Cancel subscription', icon: HideIcon, onClick: () => { haptics.fire('THUD'); onToggleActive(subscription); onClose(); }, color: dsColors.textMuted },
    { label: lang === 'th' ? 'แก้ไข' : 'Edit', icon: Pencil, onClick: () => { haptics.fire('SELECT'); onEdit(subscription); onClose(); }, color: dsColors.accent },
    { label: lang === 'th' ? 'ลบ' : 'Delete', icon: Trash2, onClick: () => { haptics.fire('THUD'); onDelete(subscription.id); onClose(); }, color: dsColors.negative, danger: true },
  ];

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
          className="relative w-full max-w-md rounded-t-3xl p-6 pb-8 bg-white"
        >
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold text-white"
              style={{ backgroundColor: brandColor }}
            >
              <span>{getLogoLetter(subscription)}</span>
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold" style={{ color: dsColors.text }}>{subscription.name}</p>
              <p className="text-[13px] font-bold" style={{ color: dsColors.textMuted, fontFamily: dsTypography.fontMono }}>
                {formatCurrency(subscription.amount, lang)}/{lang === 'th' ? 'เดือน' : 'month'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: action.danger ? 'rgba(239, 68, 68, 0.08)' : 'rgba(128, 128, 128, 0.06)',
                  color: action.color,
                }}
              >
                <action.icon className="w-5 h-5" />
                {action.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Page Component ────────────────────────────────────────────────────
export default function SubscriptionTrackerPage({
  lang = 'en',
  paydayDay: paydayDayProp,
  onNavigateToNotifications,
}: SubscriptionTrackerPageProps) {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  // Upcoming window: next 7 days, or everything due before payday (P2 — wired to profile.paydayDay)
  const [windowMode, setWindowMode] = useState<'7d' | 'payday'>('7d');
  const paydayEnabled = windowMode === 'payday';
  const paydayDay = paydayDayProp && paydayDayProp >= 1 && paydayDayProp <= 31 ? paydayDayProp : 25;
  const hasPaydayInfo = !!paydayDayProp;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);
  const [menuSubscription, setMenuSubscription] = useState<Subscription | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Privacy toggle (Net Worth pattern)
  const [showAmount, setShowAmount] = useState(true);
  const [notificationCount] = useState(3);

  // Last sync
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(new Date());

  // Date calculations
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Auto-hide amounts when app in background (Net Worth pattern)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setShowAmount(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Load real subscriptions from Supabase on mount
  useEffect(() => {
    async function fetchSubs() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await loadSubscriptions();
        // Honest empty state — never show demo charges to signed-in users
        setSubscriptions(data);
      } catch (err) {
        console.error('[SubscriptionTracker] Load failed:', err);
        setLoadError(lang === 'th'
          ? 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่'
          : 'Failed to load. Please try again.');
        setSubscriptions([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSubs();
  }, []);

  // Filter visible
  const visibleSubscriptions = useMemo(() => subscriptions.filter(s => !hiddenIds.has(s.id)), [subscriptions, hiddenIds]);
  const upcomingSubscriptions = useMemo(
    () => getUpcomingInWindow(visibleSubscriptions, currentDay, daysInMonth, paydayDay, paydayEnabled),
    [visibleSubscriptions, currentDay, daysInMonth, paydayDay, paydayEnabled]
  );
  const totalUpcomingAmount = useMemo(() => getWindowTotal(upcomingSubscriptions), [upcomingSubscriptions]);

  // Totals
  const totals = useMemo(() => {
    const active = visibleSubscriptions.filter(s => s.isActive);
    const subItems = active.filter(s => s.category !== 'bills');
    const billItems = active.filter(s => s.category === 'bills');
    const subTotal = subItems.reduce((sum, s) => sum + s.amount, 0);
    const billTotal = billItems.reduce((sum, s) => sum + s.amount, 0);
    return {
      subTotal, billTotal,
      totalMonthly: subTotal + billTotal,
      totalYearly: (subTotal + billTotal) * 12,
      subCount: subItems.length,
      billCount: billItems.length,
    };
  }, [visibleSubscriptions]);

  // AI Insights data — P2-4: Real Ghost Hunter detection
  // A subscription is a "ghost" if it's active but hasn't been confirmed paid in 60+ days.
  // Subs added <60 days ago are never ghosts (not enough history to judge).
  const GHOST_THRESHOLD_DAYS = 60;
  const DAY_MS = 1000 * 60 * 60 * 24;
  const isGhostSubscription = (s: typeof visibleSubscriptions[0]): boolean => {
    if (!s.isActive) return false;
    // Use explicit flag if set
    if (s.isGhost) return true;
    // Confirmed a payment before: ghost if that payment is stale
    if (s.lastPaidDate) {
      return (Date.now() - new Date(s.lastPaidDate).getTime()) / DAY_MS > GHOST_THRESHOLD_DAYS;
    }
    // Never confirmed a payment: only a ghost if tracked for 60+ days
    if (s.createdAt) {
      return (Date.now() - new Date(s.createdAt).getTime()) / DAY_MS > GHOST_THRESHOLD_DAYS;
    }
    return false;
  };
  const ghostSubs = visibleSubscriptions.filter(isGhostSubscription);
  const ghostCount = ghostSubs.length;
  const potentialSavings = ghostSubs.reduce((sum, s) => sum + s.amount, 0);
  const priceHikeCount = visibleSubscriptions.filter(s => s.priceChange && s.priceChange > 0).length;

  // Pull-to-refresh
  const refreshData = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await loadSubscriptions();
      if (data.length > 0) setSubscriptions(data);
      setLastSyncAt(new Date());
    } catch (err) {
      console.error('[SubscriptionTracker] Refresh failed:', err);
      setLoadError(lang === 'th'
        ? 'อัปเดตไม่สำเร็จ กรุณาลองใหม่'
        : 'Refresh failed. Please try again.');
    }
  }, [lang]);
  const { isRefreshing, pullDistance, handleTouchStart, handleTouchMove, handleTouchEnd } = usePullToRefresh(refreshData);

  // Sort state for All tab
  const [sortBy, setSortBy] = useState<'type' | 'amount' | 'name'>('type');
  const allSubscriptions = useMemo(() => {
    const sorted = [...visibleSubscriptions];
    switch (sortBy) {
      case 'amount': return sorted.sort((a, b) => b.amount - a.amount);
      case 'name': return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'type':
      default: return sorted.sort((a, b) => a.dueDate - b.dueDate);
    }
  }, [visibleSubscriptions, sortBy]);

  // Active rows drive the groups; cancelled ones get their own section (P1-5)
  const activeSubscriptions = useMemo(() => allSubscriptions.filter(s => s.isActive), [allSubscriptions]);
  const inactiveSubscriptions = useMemo(() => allSubscriptions.filter(s => !s.isActive), [allSubscriptions]);

  const groupedSubscriptions = useMemo(() => {
    const groups: Record<string, Subscription[]> = { subscriptions: [], bills: [] };
    activeSubscriptions.forEach(sub => {
      if (sub.category === 'bills') groups.bills.push(sub);
      else groups.subscriptions.push(sub);
    });
    return groups;
  }, [activeSubscriptions]);

  const getYearlyTotal = (subs: Subscription[]) => subs.reduce((sum, sub) => sum + getAnnualizedAmount(sub), 0);

  // Handlers
  // Mark-as-Paid: persists lastPaidDate (stored in DB `notes` column) and
  // rolls next billing forward via the service's dueDate→next_billing_date logic.
  const handleMarkPaid = useCallback(async (sub: Subscription) => {
    const today = new Date().toISOString().split('T')[0];
    const updated: Subscription = { ...sub, lastPaidDate: today };
    try {
      const saved = await updateSubscription(updated);
      if (!saved) {
        setLoadError(lang === 'th' ? 'บันทึกการชำระเงินไม่สำเร็จ' : 'Failed to record payment');
        return;
      }
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...updated, color: sub.color } : s));
    } catch {
      setLoadError(lang === 'th' ? 'บันทึกการชำระเงินไม่สำเร็จ' : 'Failed to record payment');
    }
  }, [lang]);
  const handleSkip = useCallback((sub: Subscription) => { console.log('Skip month for:', sub.name); }, []);
  const handleHide = useCallback((sub: Subscription) => { setHiddenIds(prev => new Set([...prev, sub.id])); }, []);
  const handleToggleActive = useCallback(async (sub: Subscription) => {
    const next = !sub.isActive;
    const ok = await toggleSubscriptionActive(sub.id, next);
    if (ok) setSubscriptions(prev => prev.map(s => (s.id === sub.id ? { ...s, isActive: next } : s)));
  }, []);
  const handleDelete = useCallback(async (id: string) => {
    await deleteSubscription(id);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  }, []);
  const handleAdd = useCallback(async (sub: Omit<Subscription, 'id'>) => {
    const created = await addSubscription(sub);
    if (created) {
      setSubscriptions(prev => [...prev, created]);
    }
  }, []);
  const handleEdit = useCallback((sub: Subscription) => { setEditSubscription(sub); setShowAddModal(true); }, []);
  const handleSaveEdit = useCallback(async (sub: Subscription) => {
    const updated = await updateSubscription(sub);
    if (updated) {
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? updated : s));
    }
    setEditSubscription(null);
  }, []);
  const handleSeeFullCalendar = useCallback(() => {
    setActiveTab('calendar');
    setCalendarMonth(currentMonth);
    setCalendarYear(currentYear);
  }, [currentMonth, currentYear]);
  const handleCSVImportComplete = useCallback(() => {
    refreshData();
  }, [refreshData]);
  const handleDateClick = useCallback((day: number) => {
    setSelectedDate(day);
    setActiveTab('upcoming');
  }, []);

  // Format last sync
  const formatLastSync = (date: Date) => {
    return date.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // ─── Render: Calendar (full-page, no header) ─────────────────────────────
  if (activeTab === 'calendar') {
    return (
      <>
        <FullCalendarView
          subscriptions={visibleSubscriptions}
          currentMonth={calendarMonth}
          currentYear={calendarYear}
          daysInMonth={new Date(calendarYear, calendarMonth + 1, 0).getDate()}
          lang={lang}
          onDateClick={handleDateClick}
          onMonthChange={(m, y) => { setCalendarMonth(m); setCalendarYear(y); }}
          onBack={() => setActiveTab('upcoming')}
          showAmount={showAmount}
          totalMonthly={totals.totalMonthly}
          totalYearly={totals.totalYearly}
        />
        <SubscriptionModal
          isOpen={showAddModal}
          mode={editSubscription ? 'edit' : 'add'}
          subscription={editSubscription}
          onClose={() => { setShowAddModal(false); setEditSubscription(null); }}
          onSave={editSubscription ? (handleSaveEdit as any) : (handleAdd as any)}
          lang={lang}
        />
        <ActionsMenu
          isOpen={showMenu}
          subscription={menuSubscription}
          onClose={() => setShowMenu(false)}
          lang={lang}
          onMarkPaid={handleMarkPaid}
          onSkip={handleSkip}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </>
    );
  }

  // ─── Render: Upcoming / All — DailyStack Design System ─────────────────
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: dsColors.background, ...getFontStyle(lang) }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-Refresh Indicator (Net Worth pattern) */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center py-4"
            style={{
              backgroundColor: pullDistance > 60 ? dsColors.accent : dsColors.surface,
              transform: `translateY(${pullDistance}px)`,
            }}
          >
            <div className="flex items-center gap-2" style={{ color: pullDistance > 60 ? '#111827' : dsColors.text }}>
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">
                {isRefreshing ? (lang === 'th' ? 'กำลังอัปเดต...' : 'Refreshing...') : `${Math.round(pullDistance)}%`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial load spinner */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: dsColors.accent }} />
        </div>
      )}

      {/* Load error banner */}
      {loadError && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-3 flex items-center gap-2 px-4 py-3 rounded-xl text-[13px]"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: dsColors.negative }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{loadError}</span>
          <button
            onClick={refreshData}
            className="font-semibold underline underline-offset-2"
          >
            {lang === 'th' ? 'ลองใหม่' : 'Retry'}
          </button>
        </motion.div>
      )}

      {/* Flat White Header (Home/Net Worth pattern) */}
      <div className="px-0 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: dsColors.text }}>
            {lang === 'th' ? 'เงาการสมัคร' : 'Subscription Shadow'}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { haptics.fire('SELECT'); onNavigateToNotifications?.(); }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-95 relative"
              style={{ backgroundColor: dsColors.surface }}
              aria-label={lang === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} style={{ color: dsColors.text }} />
              {notificationCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: dsColors.accent, color: '#111827' }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* CSV Import Button */}
            <button
              onClick={() => { haptics.fire('SELECT'); setShowCSVImport(true); }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{ backgroundColor: dsColors.surface }}
              aria-label={lang === 'th' ? 'นำเข้าจากไฟล์' : 'Import from file'}
              title={lang === 'th' ? 'นำเข้าจากไฟล์ CSV' : 'Import from CSV'}
            >
              <FileSpreadsheet className="w-5 h-5" strokeWidth={1.5} style={{ color: dsColors.text }} />
            </button>

            <button
              onClick={() => { haptics.fire('SELECT'); }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{ backgroundColor: dsColors.surface }}
              aria-label={lang === 'th' ? 'การตั้งค่า' : 'Settings'}
            >
              <Settings className="w-5 h-5" strokeWidth={1.5} style={{ color: dsColors.text }} />
            </button>

            <button
              onClick={() => { haptics.fire('SELECT'); setEditSubscription(null); setShowAddModal(true); }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-95"
              style={{ backgroundColor: dsColors.accent }}
              aria-label={lang === 'th' ? 'เพิ่มรายการ' : 'Add Subscription'}
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} style={{ color: '#111827' }} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />
      </div>

      {/* Content — DashboardPage space-y-4 pattern */}
      <div className="space-y-4 mt-3">
        {activeTab === 'upcoming' && (
          <>
            {/* Window toggle: next 7 days vs before payday (P2) */}
            {hasPaydayInfo && (
              <div className="flex justify-center">
                <div className="inline-flex rounded-full p-0.5" style={{ backgroundColor: dsColors.surface }} role="group"
                  aria-label={lang === 'th' ? 'ช่วงเวลาที่แสดง' : 'Billing window'}>
                  {([
                    { id: '7d' as const, label: lang === 'th' ? '7 วันข้างหน้า' : 'Next 7 days' },
                    { id: 'payday' as const, label: lang === 'th' ? `ก่อนวันที่ ${paydayDay}` : `Before day ${paydayDay}` },
                  ]).map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { haptics.fire('SELECT'); setWindowMode(opt.id); setSelectedDate(null); }}
                      className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                      style={{
                        backgroundColor: windowMode === opt.id ? '#FFFFFF' : 'transparent',
                        color: windowMode === opt.id ? dsColors.text : dsColors.textMuted,
                        boxShadow: windowMode === opt.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        ...getFontStyle(lang),
                      }}
                      aria-pressed={windowMode === opt.id}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hero Card (Flat White Light Mode) */}
            <HeroCard
              totalMonthly={totals.totalMonthly}
              totalYearly={totals.totalYearly}
              totalSubs={totals.subTotal}
              totalBills={totals.billTotal}
              activeCount={totals.subCount + totals.billCount}
              showAmount={showAmount}
              lang={lang}
              dsColors={dsColors}
              dsTypography={dsTypography}
              onPrivacyToggle={() => setShowAmount(!showAmount)}
              onSeeAllClick={handleSeeFullCalendar}
            />

            {/* AI Insights Card (Net Worth pattern) */}
            <AIInsightsCard
              ghostCount={ghostCount}
              potentialSavings={potentialSavings}
              priceHikeCount={priceHikeCount}
              lang={lang}
              dsColors={dsColors}
            />

            {/* Last sync indicator (Net Worth pattern) */}
            {lastSyncAt && (
              <div className="flex items-center justify-end gap-1.5 px-1 -mt-2">
                <RefreshCw className="w-3 h-3" style={{ color: dsColors.textMuted }} />
                <span className="text-[10px] font-mono" style={{ color: dsColors.textMuted }}>
                  {lang === 'th' ? 'อัปเดต' : 'Updated'} {formatLastSync(lastSyncAt)}
                </span>
              </div>
            )}

            {/* Selected Date Info */}
            {selectedDate && (
              <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(15, 176, 206, 0.1)' }}>
                <p className="text-[13px] font-medium" style={{ color: '#111827' }}>
                  {lang === 'th' ? 'รายการวันที่' : 'Items on day'} {selectedDate}
                </p>
              </div>
            )}

            {/* Upcoming Items */}
            <div className="space-y-3">
              {upcomingSubscriptions.length > 0 ? (
                upcomingSubscriptions.map((sub) => (
                  <SubscriptionItem
                    key={sub.id}
                    subscription={sub}
                    currentDay={currentDay}
                    daysInMonth={daysInMonth}
                    lang={lang}
                    onMenuOpen={(s) => { setMenuSubscription(s); setShowMenu(true); }}
                  />
                ))
              ) : (
                <div className="py-12">
                  <p className="text-center text-[14px]" style={{ color: dsColors.textMuted }}>
                    {paydayEnabled
                      ? (lang === 'th' ? `ไม่มีรายการที่ต้องชำระก่อนวันที่ ${paydayDay}` : `No charges due before day ${paydayDay}`)
                      : (lang === 'th' ? 'ไม่มีรายการที่ต้องชำระใน 7 วันนี้' : 'No upcoming charges in the next 7 days')}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'all' && (
          <div>
            <div className="flex justify-center mb-3">
              <SortDropdown sortBy={sortBy} onSortChange={setSortBy} lang={lang} />
            </div>

            {allSubscriptions.length > 0 ? (
              <div className="space-y-5">
                {groupedSubscriptions.subscriptions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: dsColors.textMuted }}>
                        {groupedSubscriptions.subscriptions.length} {lang === 'th' ? 'รายการสมัคร' : 'SUBSCRIPTIONS'}
                      </h3>
                      <span className="text-[12px] font-medium" style={{ color: dsColors.textMuted }}>
                        {formatCurrency(getYearlyTotal(groupedSubscriptions.subscriptions), lang)}/{lang === 'th' ? 'ปี' : 'year'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {groupedSubscriptions.subscriptions.map((sub) => (
                        <AllTabItem key={sub.id} subscription={sub} lang={lang} onMenuOpen={(s) => { setMenuSubscription(s); setShowMenu(true); }} />
                      ))}
                    </div>
                  </div>
                )}

                {groupedSubscriptions.bills.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: dsColors.textMuted }}>
                        {groupedSubscriptions.bills.length} {lang === 'th' ? 'บิลและค่าบริการ' : 'BILLS & UTILITIES'}
                      </h3>
                      <span className="text-[12px] font-medium" style={{ color: dsColors.textMuted }}>
                        {formatCurrency(getYearlyTotal(groupedSubscriptions.bills), lang)}/{lang === 'th' ? 'ปี' : 'year'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {groupedSubscriptions.bills.map((sub) => (
                        <AllTabItem key={sub.id} subscription={sub} lang={lang} onMenuOpen={(s) => { setMenuSubscription(s); setShowMenu(true); }} />
                      ))}
                    </div>
                  </div>
                )}

                {inactiveSubscriptions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: dsColors.textMuted }}>
                        {inactiveSubscriptions.length} {lang === 'th' ? 'ยกเลิกแล้ว' : 'CANCELLED'}
                      </h3>
                      <span className="text-[12px] font-medium" style={{ color: dsColors.textMuted }}>
                        {lang === 'th' ? 'ไม่นับในยอดรวม' : 'excluded from totals'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {inactiveSubscriptions.map((sub) => (
                        <AllTabItem key={sub.id} subscription={sub} lang={lang} onMenuOpen={(s) => { setMenuSubscription(s); setShowMenu(true); }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <SubscriptionEmptyState lang={lang} />
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <SubscriptionModal
        isOpen={showAddModal}
        mode={editSubscription ? 'edit' : 'add'}
        subscription={editSubscription}
        onClose={() => { setShowAddModal(false); setEditSubscription(null); }}
        onSave={editSubscription ? (handleSaveEdit as any) : (handleAdd as any)}
        lang={lang}
      />
      <ActionsMenu
        isOpen={showMenu}
        subscription={menuSubscription}
        onClose={() => setShowMenu(false)}
        lang={lang}
        onMarkPaid={handleMarkPaid}
        onSkip={handleSkip}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        onImportComplete={handleCSVImportComplete}
        lang={lang}
      />
    </div>
  );
}
