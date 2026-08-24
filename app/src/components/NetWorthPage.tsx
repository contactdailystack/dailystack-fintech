/**
 * ============================================================
 * DailyStack — NetWorthPage v5.0
 * ============================================================
 * Redesigned to match DashboardPage (Home) patterns
 * 
 * Key Changes from v4.0:
 * - Dark Hero Card (bg-black rounded-[32px])
 * - Flat Header (no gradient)
 * - Lime Chart (#56be89) matching DashboardPage
 * - Pill Style Account Items (rounded-full)
 * - Surface-based UI components
 * - pageTokens as single source of truth
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  PiggyBank,
  CreditCard,
  Banknote,
  LineChart,
  Plus,
  Settings,
  RefreshCw,
  Trash2,
  Pencil,
  Link2,
  X,
  Check,
  Loader2,
  ArrowLeft,
  BarChart3,
  Info,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { haptics } from '../services/hapticService';
import { Language } from '../data/translations';
import {
  NetWorthAccount,
  NetWorthSnapshot,
  fetchNetWorthAccounts,
  fetchNetWorthSnapshots,
  addNetWorthAccount,
  updateNetWorthAccount,
  deleteNetWorthAccount,
  seedDefaultAccounts,
  AccountCategory,
} from '../services/netWorthService';
import { pageTokens } from '../design-system/page-tokens';
import { CardSkeleton } from '../design-system/components/LoadingSkeleton';

// ─── Design Tokens (DailyStack Design System) ─────────────────────────────
const dsColors = pageTokens.colors;
const dsTypography = pageTokens.typography;
const dsLayout = pageTokens.layout;

// ─── Account Icon Mapping ──────────────────────────────────────────
const getAccountIcon = (category: string) => {
  switch (category) {
    case 'cash': return <Banknote className="w-5 h-5" />;
    case 'checking': return <Building2 className="w-5 h-5" />;
    case 'savings': return <PiggyBank className="w-5 h-5" />;
    case 'investment': return <LineChart className="w-5 h-5" />;
    case 'crypto': return <TrendingUp className="w-5 h-5" />;
    case 'credit_card':
    case 'other': return <CreditCard className="w-5 h-5" />;
    default: return <Wallet className="w-5 h-5" />;
  }
};

const getAccountColor = (category: string, type: 'asset' | 'liability') => {
  if (type === 'liability') return dsColors.negative;
  switch (category) {
    case 'investment': return dsColors.category.investment;
    case 'savings': return dsColors.success;
    case 'property': return dsColors.warning;
    default: return dsColors.accent;
  }
};

// ─── Types ────────────────────────────────────────────────────────
type TabType = 'summary' | 'assets' | 'debts';

interface NetWorthPageProps {
  lang: Language;
}

// ─── Trend Badge Component ────────────────────────────────────────
const TrendBadge = ({ value, percent }: { value: number; percent: string }) => {
  const isPositive = value >= 0;
  
  return (
    <span 
      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ 
        backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        color: isPositive ? dsColors.success : dsColors.negative,
        fontFamily: dsTypography.fontMono,
      }}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? '+' : ''}{percent}%
    </span>
  );
};

// ─── ROCKET MONEY: Grace Period Logic for Disconnected Accounts ─────────────
// Keep last known value for 30 days instead of showing zero
const GRACE_PERIOD_DAYS = 30;

interface DisconnectionStatus {
  isDisconnected: boolean;
  daysSinceSync: number;
  isInGracePeriod: boolean;
}

const getDisconnectionStatus = (lastSyncedAt?: string): DisconnectionStatus => {
  if (!lastSyncedAt) {
    return { isDisconnected: false, daysSinceSync: 0, isInGracePeriod: false };
  }
  
  const lastSync = new Date(lastSyncedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastSync.getTime());
  const daysSinceSync = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    isDisconnected: daysSinceSync > 0, // If we have a sync time, it's disconnected if days > 0
    daysSinceSync,
    isInGracePeriod: daysSinceSync > 0 && daysSinceSync <= GRACE_PERIOD_DAYS,
  };
};

// ─── Disconnected Badge Component ─────────────────────────────────────
const DisconnectedBadge = ({ 
  daysSinceSync, 
  lang,
}: { 
  daysSinceSync: number; 
  lang: Language;
}) => {
  if (daysSinceSync === 0) return null;
  
  const daysText = lang === 'th' 
    ? `${daysSinceSync} วัน` 
    : `${daysSinceSync} days`;
  
  return (
    <div 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ml-2"
      style={{ 
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        color: '#F59E0B',
      }}
    >
      <AlertCircle className="w-3 h-3" />
      {daysText}
    </div>
  );
};

// ─── Chart Scrubbing Hook (Rocket Money Ticker Effect) ─────────────────────
interface UseChartScrubbingProps {
  snapshots: NetWorthSnapshot[];
  onScrubChange?: (index: number | null, value: number | null) => void;
}

const useChartScrubbing = ({ snapshots, onScrubChange }: UseChartScrubbingProps) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const [scrubPosition, setScrubPosition] = useState({ x: 0, y: 0 });
  const lastHapticIndex = React.useRef<number | null>(null);

  const getIndexFromPosition = (clientX: number, containerRect: DOMRect) => {
    if (snapshots.length === 0) return null;
    const relativeX = clientX - containerRect.left;
    const percentage = Math.max(0, Math.min(1, relativeX / containerRect.width));
    return Math.round(percentage * (snapshots.length - 1));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const index = getIndexFromPosition(touch.clientX, container);
    
    if (index !== null) {
      setIsScrubbing(true);
      setScrubIndex(index);
      setScrubPosition({ x: touch.clientX - container.left, y: 0 });
      
      // Haptic feedback on start
      haptics.fire('SELECT');
      lastHapticIndex.current = index;
      
      if (onScrubChange) {
        onScrubChange(index, snapshots[index]?.net_worth || null);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const index = getIndexFromPosition(touch.clientX, container);
    
    if (index !== null && index !== scrubIndex) {
      setScrubIndex(index);
      setScrubPosition({ x: touch.clientX - container.left, y: 0 });
      
      // Haptic feedback when crossing data points (Rocket Money pattern)
      if (lastHapticIndex.current !== index) {
        haptics.fire('CRISP_CLICK');
        lastHapticIndex.current = index;
      }
      
      if (onScrubChange) {
        onScrubChange(index, snapshots[index]?.net_worth || null);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsScrubbing(false);
    setScrubIndex(null);
    lastHapticIndex.current = null;
    
    if (onScrubChange) {
      onScrubChange(null, null);
    }
  };

  // Mouse support for desktop testing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget.getBoundingClientRect();
    const index = getIndexFromPosition(e.clientX, container);
    
    if (index !== null) {
      setIsScrubbing(true);
      setScrubIndex(index);
      setScrubPosition({ x: e.clientX - container.left, y: 0 });
      lastHapticIndex.current = index;
      
      if (onScrubChange) {
        onScrubChange(index, snapshots[index]?.net_worth || null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const index = getIndexFromPosition(e.clientX, container);
    
    if (index !== null && index !== scrubIndex) {
      setScrubIndex(index);
      setScrubPosition({ x: e.clientX - container.left, y: 0 });
      lastHapticIndex.current = index;
      
      if (onScrubChange) {
        onScrubChange(index, snapshots[index]?.net_worth || null);
      }
    }
  };

  const handleMouseUp = () => {
    setIsScrubbing(false);
    setScrubIndex(null);
    lastHapticIndex.current = null;
    
    if (onScrubChange) {
      onScrubChange(null, null);
    }
  };

  return {
    isScrubbing,
    scrubIndex,
    scrubPosition,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  };
};

// ─── Scrub Tooltip Component ─────────────────────────────────────
const ScrubTooltip = ({ 
  index, 
  snapshots, 
  position,
  showAmount,
  lang,
  dsColors,
  dsTypography,
  chartRef,
}: { 
  index: number; 
  snapshots: NetWorthSnapshot[];
  position: { x: number };
  showAmount: boolean;
  lang: Language;
  dsColors: any;
  dsTypography: any;
  chartRef: React.RefObject<HTMLDivElement>;
}) => {
  const snapshot = snapshots[index];
  if (!snapshot) return null;

  // Format date based on language
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (lang === 'th') {
      return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const containerWidth = chartRef.current?.getBoundingClientRect().width || 320;
  // Tooltip width is about 90px, so offset by 45px to keep it contained
  const leftPos = Math.max(45, Math.min(position.x, containerWidth - 45));

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute pointer-events-none z-10"
      style={{ 
        left: leftPos,
        transform: 'translateX(-50%)',
        top: -8,
      }}
    >
      <div 
        className="px-3 py-2 rounded-xl shadow-lg"
        style={{ 
          backgroundColor: dsColors.surfaceElevated,
          border: `1px solid ${dsColors.border}`,
        }}
      >
        <p 
          className="text-[11px] mb-0.5"
          style={{ color: dsColors.textMuted, fontFamily: dsTypography.fontMono }}
        >
          {formatDate(snapshot.snapshot_date)}
        </p>
        <p 
          className="text-[15px] font-bold"
          style={{ color: dsColors.accent, fontFamily: dsTypography.fontMono }}
        >
          {showAmount ? `฿${snapshot.net_worth.toLocaleString()}` : '●●●●'}
        </p>
      </div>
      {/* Arrow */}
      <div 
        className="w-2 h-2 rotate-45 mx-auto"
        style={{ 
          backgroundColor: dsColors.surfaceElevated,
          borderRight: `1px solid ${dsColors.border}`,
          borderBottom: `1px solid ${dsColors.border}`,
          marginTop: -1,
        }}
      />
    </motion.div>
  );
};

// ─── Pull-to-Refresh Hook ─────────────────────────────────────────
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

// ─── Account Modal (Add/Edit) ────────────────────────────────────────
const AccountModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  account,
  lang,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: Partial<NetWorthAccount>) => void;
  account?: NetWorthAccount;
  lang: Language;
}) => {
  const [name, setName] = useState(account?.account_name_th || '');
  const [balance, setBalance] = useState(account?.current_balance.toString() || '');
  const [type, setType] = useState<'asset' | 'liability'>(account?.account_type || 'asset');
  const [category, setCategory] = useState<AccountCategory>(account?.account_category || 'cash');
  const [institution, setInstitution] = useState(account?.institution || '');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (account) {
      setName(account.account_name_th);
      setBalance(account.current_balance.toString());
      setType(account.account_type);
      setCategory(account.account_category);
      setInstitution(account.institution || '');
    } else {
      setName('');
      setBalance('');
      setType('asset');
      setCategory('cash');
      setInstitution('');
    }
  }, [account, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || !balance) return;
    setIsSaving(true);
    await onSave({
      account_name: name,
      account_name_th: name,
      account_type: type,
      account_category: category,
      institution: institution || undefined,
      current_balance: parseFloat(balance),
    });
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  const categories: { value: AccountCategory; label: string }[] = [
    { value: 'cash', label: 'เงินสด' },
    { value: 'checking', label: 'บัญชีกระแสรายวัน' },
    { value: 'savings', label: 'บัญชีออมทรัพย์' },
    { value: 'investment', label: 'การลงทุน' },
    { value: 'crypto', label: 'คริปโต' },
    { value: 'property', label: 'อสังหาริมทรัพย์' },
    { value: 'vehicle', label: 'ยานพาหนะ' },
    { value: 'other', label: 'อื่นๆ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md rounded-t-3xl px-6 pb-8 pt-4"
        style={{ backgroundColor: dsColors.background }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: dsColors.text }}>
            {account ? 'แก้ไขบัญชี' : 'เพิ่มบัญชี'}
          </h2>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" style={{ color: dsColors.textMuted }} />
          </button>
        </div>

      <div className="space-y-2">
          <div>
            <label className="text-[12px] mb-1 block" style={{ color: dsColors.textMuted }}>ชื่อบัญชี</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น บัญชีธนาคาร"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{ 
                backgroundColor: dsColors.surface, 
                color: dsColors.text,
                fontFamily: lang === 'th' ? dsTypography.fontTH : dsTypography.fontEN,
              }}
            />
          </div>

          <div>
            <label className="text-[12px] mb-1 block" style={{ color: dsColors.textMuted }}>ยอดคงเหลือ</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{ 
                backgroundColor: dsColors.surface, 
                color: dsColors.text,
                fontFamily: dsTypography.fontMono,
              }}
            />
          </div>

          <div>
            <label className="text-[12px] mb-2 block" style={{ color: dsColors.textMuted }}>ประเภท</label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('asset')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all`}
                style={{ 
                  backgroundColor: type === 'asset' ? dsColors.success : dsColors.surface,
                  color: type === 'asset' ? '#FFFFFF' : dsColors.text,
                }}
              >
                สินทรัพย์
              </button>
              <button
                onClick={() => setType('liability')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all`}
                style={{ 
                  backgroundColor: type === 'liability' ? dsColors.negative : dsColors.surface,
                  color: type === 'liability' ? '#FFFFFF' : dsColors.text,
                }}
              >
                หนี้สิน
              </button>
            </div>
          </div>

          <div>
            <label className="text-[12px] mb-2 block" style={{ color: dsColors.textMuted }}>หมวดหมู่</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`py-2 px-2 rounded-lg text-[11px] font-medium transition-all`}
                  style={{ 
                    backgroundColor: category === cat.value ? dsColors.accent : dsColors.surface,
                    color: category === cat.value ? dsColors.text : dsColors.textMuted,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] mb-1 block" style={{ color: dsColors.textMuted }}>สถาบัน (ไม่บังคับ)</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="เช่น ธนาคารกรุงเทพ"
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{ 
                backgroundColor: dsColors.surface, 
                color: dsColors.text,
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || !balance || isSaving}
          className="w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: dsColors.accent, color: dsColors.text }}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              {account ? 'บันทึก' : 'เพิ่มบัญชี'}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

// ─── Account Actions Menu ──────────────────────────────────────────
const AccountActionsMenu = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  account,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  account?: NetWorthAccount;
}) => {
  if (!isOpen || !account) return null;

  const accentColor = getAccountColor(account.account_category, account.account_type);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md rounded-t-3xl px-6 pb-8 pt-4"
        style={{ backgroundColor: dsColors.background }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <span style={{ color: accentColor }}>
              {getAccountIcon(account.account_category)}
            </span>
          </div>
          <div>
            <p className="font-semibold" style={{ color: dsColors.text }}>{account.account_name_th}</p>
            <p className="text-[13px]" style={{ color: dsColors.textMuted, fontFamily: dsTypography.fontMono }}>
              ฿{account.current_balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98]"
            style={{ backgroundColor: dsColors.surface, color: dsColors.text }}
          >
            <Pencil className="w-5 h-5" />
            <span className="font-medium">แก้ไขบัญชี</span>
          </button>
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: dsColors.negative }}
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">ลบบัญชี</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-4 rounded-xl font-medium transition-all active:scale-[0.98]"
          style={{ backgroundColor: dsColors.surface, color: dsColors.text }}
        >
          ยกเลิก
        </button>
      </motion.div>
    </div>
  );
};

// ─── Link Account Modal ────────────────────────────────────────────
const LinkAccountModal = ({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: Language }) => {
  if (!isOpen) return null;

  const banks = [
    { name: 'ธนาคารกรุงเทพ (BBL)', logo: '🏦' },
    { name: 'ธนาคารกสิกรไทย (KBANK)', logo: '💚' },
    { name: 'ธนาคารไทยพาณิชย์ (SCB)', logo: '🔵' },
    { name: 'ธนาคารกรุงศรีอยุธยา (BAY)', logo: '🟠' },
    { name: 'ธนาคารทหารไทย (TMB)', logo: '🟣' },
    { name: 'Other', logo: '🏛️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md rounded-t-3xl px-6 pb-8 pt-4"
        style={{ backgroundColor: dsColors.background }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: dsColors.text }}>เชื่อมต่อบัญชี</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" style={{ color: dsColors.textMuted }} />
          </button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {banks.map((bank) => (
            <button
              key={bank.name}
              className="w-full flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98]"
              style={{ backgroundColor: dsColors.surface, color: dsColors.text }}
            >
              <span className="text-2xl">{bank.logo}</span>
              <span className="font-medium flex-1 text-left">{bank.name}</span>
              <ChevronRight className="w-5 h-5" style={{ color: dsColors.textMuted }} />
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl font-medium transition-all"
          style={{ 
            backgroundColor: 'transparent', 
            border: `1px solid ${dsColors.border}`,
            color: dsColors.textMuted 
          }}
        >
          + เพิ่มบัญชีแบบ Manual
        </button>
      </motion.div>
    </div>
  );
};

// ─── AI Insights Card Component (Rocket Money Pattern) ──────────────────────
const AIInsightsCard = ({ 
  netWorthTrend, 
  totalAssets, 
  totalDebts,
  lang 
}: { 
  netWorthTrend: string; 
  totalAssets: number; 
  totalDebts: number;
  lang: Language;
}) => {
  const trend = parseFloat(netWorthTrend);
  const isPositive = trend >= 0;
  
  // Generate insight based on data
  const getInsight = () => {
    if (trend > 10) {
      return lang === 'th' 
        ? `มูลค่าสุทธิเพิ่มขึ้น ${trend.toFixed(1)}% เดือนนี้! 🎉`
        : `Net worth up ${trend.toFixed(1)}% this month! 🎉`;
    }
    if (trend > 0) {
      return lang === 'th'
        ? `มูลค่าสุทธิเพิ่มขึ้น ${trend.toFixed(1)}% เดือนนี้`
        : `Net worth grew ${trend.toFixed(1)}% this month`;
    }
    if (trend < -10) {
      return lang === 'th'
        ? `มูลค่าสุทธิลดลง ${Math.abs(trend).toFixed(1)}% ลองตรวจสอบรายจ่าย?`
        : `Net worth down ${Math.abs(trend).toFixed(1)}%. Check expenses?`;
    }
    if (totalDebts > totalAssets * 0.3) {
      return lang === 'th'
        ? `หนี้สินสูงเกิน 30% ของสินทรัพย์ ควรวางแผนลดหนี้`
        : `Debt is over 30% of assets. Consider debt payoff plan`;
    }
    return lang === 'th'
      ? `สินทรัพย์รวม ${totalAssets.toLocaleString()} บาท อยู่ในเกณฑ์ดี`
      : `Total assets ${totalAssets.toLocaleString()} THB - looking good`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-[16px] px-6 py-4 -mx-2 md:mx-0"
      style={{ 
        backgroundColor: 'rgba(86, 190, 137, 0.08)',
        borderColor: 'rgba(86, 190, 137, 0.2)',
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(86, 190, 137, 0.15)' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: dsColors.accent }} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium mb-1" style={{ color: dsColors.accent }}>
            {lang === 'th' ? 'สมาร์ทอินไซต์' : 'Smart Insights'}
          </p>
          <p className="text-sm" style={{ color: dsColors.text }}>
            {getInsight()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Asset Allocation Donut Chart Component ────────────────────────────────
const AssetAllocationChart = ({ 
  accounts, 
  showAmount,
  lang 
}: { 
  accounts: NetWorthAccount[]; 
  showAmount: boolean;
  lang: Language;
}) => {
  // Calculate asset allocation by category
  const assets = accounts.filter(a => a.account_type === 'asset');
  const totalAssets = assets.reduce((sum, a) => sum + a.current_balance, 0);
  
  const categoryTotals = assets.reduce((acc, account) => {
    const cat = account.account_category;
    acc[cat] = (acc[cat] || 0) + account.current_balance;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAssets > 0 ? (amount / totalAssets) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Colors for each category
  const categoryColors: Record<string, string> = {
    cash: '#56be89',
    checking: '#A3A3A3',
    savings: '#4ADE80',
    investment: '#60A5FA',
    crypto: '#F59E0B',
    property: '#A78BFA',
    vehicle: '#F472B6',
    other: '#71717A',
  };

  // Calculate SVG arc paths for donut chart
  const size = 120;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentAngle = -90; // Start from top
  const arcs = categories.map((cat) => {
    const arcLength = (cat.percentage / 100) * circumference;
    const startAngle = currentAngle;
    currentAngle += (cat.percentage / 100) * 360;
    
    return {
      ...cat,
      strokeDasharray: `${arcLength} ${circumference - arcLength}`,
      strokeDashoffset: -((startAngle + 90) / 360) * circumference,
      color: categoryColors[cat.category] || '#71717A',
    };
  });

  const categoryLabels: Record<string, string> = {
    cash: lang === 'th' ? 'เงินสด' : 'Cash',
    checking: lang === 'th' ? 'กระแสรายวัน' : 'Checking',
    savings: lang === 'th' ? 'ออมทรัพย์' : 'Savings',
    investment: lang === 'th' ? 'ลงทุน' : 'Investment',
    crypto: lang === 'th' ? 'คริปโต' : 'Crypto',
    property: lang === 'th' ? 'อสังหา' : 'Property',
    vehicle: lang === 'th' ? 'ยานพาหนะ' : 'Vehicle',
    other: lang === 'th' ? 'อื่นๆ' : 'Other',
  };

  return (
    <div className="border rounded-[16px] px-6 py-4 -mx-2 md:mx-0" style={{ backgroundColor: dsColors.surface, borderColor: dsColors.border }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: dsColors.text }}>
          {lang === 'th' ? 'สัดส่วนสินทรัพย์' : 'Asset Allocation'}
        </h3>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Donut Chart */}
        <div className="relative shrink-0">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={dsColors.border}
              strokeWidth={strokeWidth}
            />
            {/* Category arcs */}
            {arcs.map((arc, index) => (
              <circle
                key={arc.category}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                strokeLinecap="round"
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px]" style={{ color: dsColors.textMuted }}>
              {lang === 'th' ? 'รวม' : 'Total'}
            </span>
            <span className="text-sm font-bold" style={{ color: dsColors.text }}>
              {showAmount ? `฿${(totalAssets / 1000).toFixed(0)}K` : '●●●●'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {categories.slice(0, 4).map((cat) => (
            <div key={cat.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: categoryColors[cat.category] || '#71717A' }}
                />
                <span className="text-xs" style={{ color: dsColors.textMuted }}>
                  {categoryLabels[cat.category] || cat.category}
                </span>
              </div>
              <span className="text-xs font-medium" style={{ color: dsColors.text }}>
                {cat.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────
export default function NetWorthPage({ lang }: NetWorthPageProps) {
  // State
  const [accounts, setAccounts] = useState<NetWorthAccount[]>([]);
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6M');

  // Chart reference for dynamic width calculations
  const chartRef = React.useRef<HTMLDivElement>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<NetWorthAccount | undefined>();

  // Privacy toggle (hide amounts when app is in background)
  const [showAmount, setShowAmount] = useState(true);
  
  // Last sync timestamp
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  // ─── ROCKET MONEY: Chart Scrubbing State ────────────────────────
  const [scrubValue, setScrubValue] = useState<number | null>(null);
  const [showScrubHint, setShowScrubHint] = useState(true);

  // Hide scrub hint after first interaction
  useEffect(() => {
    const timer = setTimeout(() => setShowScrubHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Chart scrubbing hook
  const { 
    isScrubbing, 
    scrubIndex, 
    scrubPosition,
    handlers: chartHandlers,
  } = useChartScrubbing({
    snapshots,
    onScrubChange: (index, value) => {
      setScrubValue(value);
      if (index !== null) {
        setShowScrubHint(false);
      }
    },
  });

  // Auto-hide amounts when app is in background (security)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setShowAmount(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    try {
      await seedDefaultAccounts();
      const [accountsData, snapshotsData] = await Promise.all([
        fetchNetWorthAccounts(),
        fetchNetWorthSnapshots(12),
      ]);
      setAccounts(accountsData);
      setSnapshots(snapshotsData);
      setLastSyncAt(new Date());
    } catch (error) {
      console.error('Error loading net worth data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pull to refresh
  const { isRefreshing, pullDistance, handleTouchStart, handleTouchMove, handleTouchEnd } = usePullToRefresh(loadData);

  // Calculations
  const totalAssets = accounts
    .filter(a => a.account_type === 'asset')
    .reduce((sum, a) => sum + a.current_balance, 0);

  const totalDebts = accounts
    .filter(a => a.account_type === 'liability')
    .reduce((sum, a) => sum + a.current_balance, 0);

  const netWorth = totalAssets - totalDebts;

  // ─── ROCKET MONEY: Ticker Effect ────────────────────────────────
  // Display scrub value when interacting, otherwise show current net worth
  const displayedNetWorth = scrubValue !== null ? scrubValue : netWorth;

  // Calculate trends from snapshots
  const lastSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
  const assetsTrend = lastSnapshot 
    ? ((totalAssets - lastSnapshot.total_assets) / lastSnapshot.total_assets * 100).toFixed(1)
    : '0';
  const debtsTrend = lastSnapshot 
    ? ((totalDebts - lastSnapshot.total_liabilities) / lastSnapshot.total_liabilities * 100).toFixed(1)
    : '0';
  const netWorthTrend = lastSnapshot && lastSnapshot.net_worth !== 0
    ? ((netWorth - lastSnapshot.net_worth) / lastSnapshot.net_worth * 100).toFixed(1)
    : '0';

  // ============================================
  // ROCKET MONEY: NET WORTH HEALTH STATE
  // Dynamic state based on net worth trend and account health
  // ============================================
  const netWorthHealth = useMemo(() => {
    // Positive trend + good asset/debt ratio = HEALTHY
    if (parseFloat(netWorthTrend) > 5 && totalDebts === 0) {
      return 'HEALTHY';
    }
    // Negative trend or high debt ratio = WARNING
    if (parseFloat(netWorthTrend) < 0 || totalDebts > totalAssets * 0.3) {
      return 'WARNING';
    }
    // Critical: negative net worth
    if (netWorth < 0) {
      return 'CRITICAL';
    }
    return 'NORMAL';
  }, [netWorthTrend, totalAssets, totalDebts, netWorth]);

  // Group accounts
  const filteredAccounts = accounts.filter(account => {
    if (activeTab === 'assets') return account.account_type === 'asset';
    if (activeTab === 'debts') return account.account_type === 'liability';
    return true;
  });

  const groupedAccounts = filteredAccounts.reduce((groups, account) => {
    const groupKey = account.account_category;
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(account);
    return groups;
  }, {} as Record<string, NetWorthAccount[]>);

  const getGroupTotal = (accountList: NetWorthAccount[]) => {
    return accountList.reduce((sum, a) => sum + a.current_balance, 0);
  };

  // Handlers
  const toggleGroup = (group: string) => {
    haptics.fire('SELECT');
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

  const handleTabChange = (tab: TabType) => {
    haptics.fire('SELECT');
    setActiveTab(tab);
  };

  const handleLongPress = (account: NetWorthAccount) => {
    haptics.fire('HEAVY_THUD');
    setSelectedAccount(account);
    setShowActionsMenu(true);
  };

  const handleEdit = () => {
    if (selectedAccount) {
      setShowAddModal(true);
    }
  };

  const handleDelete = async () => {
    if (selectedAccount) {
      const success = await deleteNetWorthAccount(selectedAccount.id);
      if (success) {
        haptics.fire('DEEP_RESONANCE');
        await loadData();
      }
    }
  };

  const handleSaveAccount = async (data: Partial<NetWorthAccount>) => {
    if (selectedAccount) {
      await updateNetWorthAccount(selectedAccount.id, data);
    } else {
      await addNetWorthAccount({
        account_name: data.account_name || '',
        account_name_th: data.account_name_th || '',
        account_type: data.account_type || 'asset',
        account_category: data.account_category || 'cash',
        institution: data.institution,
        current_balance: data.current_balance || 0,
        currency: 'THB',
        is_manual: true,
        is_active: true,
      });
    }
    setSelectedAccount(undefined);
    await loadData();
  };

  // Translations
  const t = {
    en: {
      title: 'Net Worth',
      summary: 'Summary',
      assets: 'Assets',
      debts: 'Debts',
      totalAssets: 'Total Assets',
      totalDebts: 'Total Debts',
      netWorth: 'Net Worth',
      accounts: 'accounts',
      addAccount: 'Add Account',
      linkAccount: 'Link Account',
      thisMonth: 'this month',
      breakdown: 'Breakdown',
      history: 'History',
    },
    th: {
      title: 'มูลค่าสุทธิ',
      summary: 'สรุป',
      assets: 'สินทรัพย์',
      debts: 'หนี้สิน',
      totalAssets: 'สินทรัพย์รวม',
      totalDebts: 'หนี้สินรวม',
      netWorth: 'มูลค่าสุทธิ',
      accounts: 'บัญชี',
      addAccount: 'เพิ่มบัญชี',
      linkAccount: 'เชื่อมต่อบัญชี',
      thisMonth: 'เดือนนี้',
      breakdown: 'รายละเอียด',
      history: 'ประวัติ',
    },
  };

  const text = t[lang];

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: dsColors.background,
        fontFamily: lang === 'th' ? dsTypography.fontTH : dsTypography.fontEN
      }}
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
            className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center py-4"
            style={{ 
              backgroundColor: pullDistance > 60 ? dsColors.success : dsColors.accent,
              transform: `translateY(${pullDistance}px)`,
            }}
          >
            <div className="flex items-center gap-2" style={{ color: dsColors.text }}>
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">
                {isRefreshing ? 'กำลังอัปเดต...' : `${Math.round(pullDistance)}%`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* HEADER — Recurring Page Style                            */}
      {/* ============================================================ */}
      <div className="px-0 pt-4 pb-0 -mx-2">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 
            className="font-display font-black text-2xl"
            style={{ color: dsColors.text }}
          >
            {text.title}
          </h1>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLinkModal(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              style={{ backgroundColor: dsColors.surface }}
              aria-label={text.linkAccount}
            >
              <Link2 className="w-5 h-5" style={{ color: dsColors.text }} />
            </button>
            <button
              onClick={() => haptics.fire('SELECT')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              style={{ backgroundColor: dsColors.surface }}
              aria-label={lang === 'th' ? 'การตั้งค่า' : 'Settings'}
            >
              <Settings className="w-5 h-5" style={{ color: dsColors.text }} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6">
          {(['summary', 'assets', 'debts'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="pb-3 text-sm font-semibold transition-all relative"
              style={{ color: activeTab === tab ? '#000000' : '#71717A' }}
            >
              {tab === 'summary' && text.summary}
              {tab === 'assets' && text.assets}
              {tab === 'debts' && text.debts}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: '#56be89' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONTENT AREA — DashboardPage Layout Pattern                  */}
      {/* ============================================================ */}
      <div className="space-y-4 mt-4">
        
        {isLoading ? (
          <div className="bg-black rounded-[24px] p-5 transition-all duration-300">
            <CardSkeleton lines={3} />
          </div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* ACCOUNT GROUPS — Pill Style (DashboardPage Pattern)        */}
            {/* ============================================================ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="border rounded-[28px] px-6 py-5 bg-black border-[#1C1C1C] -mx-2 md:mx-0 shadow-xl"
            >
              {/* Row 1: Month Label + State Badge + Privacy Toggle */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[13px] font-semibold"
                  style={{ fontFamily: lang === 'th' ? dsTypography.fontTH : dsTypography.fontEN, color: dsColors.textMuted }}
                >
                  {lang === 'th' ? 'มูลค่าสุทธิ' : 'Net Worth'}
                </span>
                
                <div className="flex items-center gap-2">
                  {/* Last Sync Timestamp */}
                  {lastSyncAt && (
                    <span 
                      className="text-[10px] font-mono"
                      style={{ color: '#525252' }}
                    >
                      {lang === 'th' ? 'อัปเดต' : 'Updated'} {lastSyncAt.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  
                  {/* Privacy Toggle Button */}
                  <button
                    onClick={() => { haptics.fire('SELECT'); setShowAmount(!showAmount); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    aria-label={showAmount ? (lang === 'th' ? 'ซ่อนตัวเลข' : 'Hide amounts') : (lang === 'th' ? 'แสดงตัวเลข' : 'Show amounts')}
                  >
                    {showAmount ? (
                      <Eye className="w-4 h-4" style={{ color: '#71717A' }} />
                    ) : (
                      <EyeOff className="w-4 h-4" style={{ color: '#56be89' }} />
                    )}
                  </button>
                  
                  {/* Dynamic State Badge — changes based on netWorthHealth */}
                  <div 
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                    style={{ 
                      backgroundColor: netWorthHealth === 'HEALTHY' 
                        ? 'rgba(16, 185, 129, 0.15)' 
                        : netWorthHealth === 'WARNING'
                        ? 'rgba(251, 191, 36, 0.15)'
                        : netWorthHealth === 'CRITICAL'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(148, 163, 184, 0.15)'
                    }}
                  >
                    {netWorthHealth === 'HEALTHY' && (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" style={{ color: dsColors.success }} />
                        <span className="text-[11px] font-semibold" style={{ color: dsColors.success, fontFamily: dsTypography.fontMono }}>
                          {lang === 'th' ? 'สุขภาพดี' : 'Healthy'}
                        </span>
                      </>
                    )}
                    {netWorthHealth === 'WARNING' && (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                        <span className="text-[11px] font-semibold" style={{ color: '#F59E0B', fontFamily: dsTypography.fontMono }}>
                          {lang === 'th' ? 'เตือน' : 'Warning'}
                        </span>
                      </>
                    )}
                    {netWorthHealth === 'CRITICAL' && (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" style={{ color: dsColors.negative }} />
                        <span className="text-[11px] font-semibold" style={{ color: dsColors.negative, fontFamily: dsTypography.fontMono }}>
                          {lang === 'th' ? 'วิกฤต' : 'Critical'}
                        </span>
                      </>
                    )}
                    {netWorthHealth === 'NORMAL' && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: dsColors.textMuted }} />
                        <span className="text-[11px] font-semibold" style={{ color: dsColors.textMuted, fontFamily: dsTypography.fontMono }}>
                          {lang === 'th' ? 'ปกติ' : 'Normal'}
                        </span>
                      </>
                    )}
                </div>
              </div>
              </div>

              {/* Row 2: Net Worth Value — Ticker Effect (Rocket Money) */}
              <div className="mb-4">
                <span 
                  className="text-[36px] font-bold leading-none"
                  style={{
                    color: dsColors.surfaceElevated,
                    letterSpacing: '-0.03em',
                    fontFamily: dsTypography.fontMono,
                    // Ticker Effect: Smooth transition when scrubbing
                    transition: 'transform 0.15s ease-out',
                  }}
                >
                  {showAmount ? `฿${displayedNetWorth.toLocaleString()}` : '●●●●'}
                </span>
                <p className="text-[10px] mt-1" style={{ color: dsColors.textMuted, fontFamily: dsTypography.fontEN }}>
                  {isScrubbing 
                    ? (lang === 'th' ? 'กำลังสำรวจ...' : 'Exploring...')
                    : text.thisMonth
                  }
                </p>
              </div>

              {/* Row 3: Lime Chart with Scrubbing */}
              <div className="w-full mb-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  {['1M', '3M', '6M', '1Y', 'All'].map((range) => (
                    <button
                      key={range}
                      onClick={() => { haptics.fire('SELECT'); setSelectedTimeRange(range); }}
                      className="px-2 py-1 text-[11px] font-medium rounded transition-all"
                      style={{ 
                        backgroundColor: selectedTimeRange === range ? dsColors.accent : 'transparent',
                        color: selectedTimeRange === range ? dsColors.text : dsColors.textMuted,
                        fontFamily: dsTypography.fontMono,
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                {/* ─── ROCKET MONEY: Interactive Chart Area ─────────────────── */}
                <div 
                  ref={chartRef}
                  className="w-full h-24 relative cursor-pointer select-none"
                  {...chartHandlers}
                >
                  {/* Scrub Tooltip */}
                  <AnimatePresence>
                    {isScrubbing && scrubIndex !== null && (
                      <ScrubTooltip
                        index={scrubIndex}
                        snapshots={snapshots}
                        position={scrubPosition}
                        showAmount={showAmount}
                        lang={lang}
                        dsColors={dsColors}
                        dsTypography={dsTypography}
                        chartRef={chartRef}
                      />
                    )}
                  </AnimatePresence>

                  {/* Scrub Hint — Discoverability (Fades after 4 seconds) */}
                  <AnimatePresence>
                    {showScrubHint && !isScrubbing && snapshots.length > 2 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div 
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: `${dsColors.accent}20` }}
                        >
                          <span className="text-[11px]" style={{ color: dsColors.accent }}>
                            ↔️ {lang === 'th' ? 'ลากเพื่อดูยอดในอดีต' : 'Drag to explore'}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SVG Chart with Crosshair when scrubbing */}
                  <svg viewBox="0 0 320 80" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      {/* Gradient fill below line — neon green fade to transparent */}
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#56be89" stopOpacity="0.4" />
                        <stop offset="40%" stopColor="#56be89" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#56be89" stopOpacity="0" />
                      </linearGradient>
                      {/* Gradient stroke — bright neon green from left to right */}
                      <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7DD300" />
                        <stop offset="35%" stopColor="#56be89" />
                        <stop offset="65%" stopColor="#E8FF5A" />
                        <stop offset="100%" stopColor="#7DD300" />
                      </linearGradient>
                      {/* Glow filter for outer tube layer */}
                      <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      {/* Glow filter for the dot */}
                      <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      {/* Crosshair filter */}
                      <filter id="crosshairGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Grid lines — hide when scrubbing */}
                    {!isScrubbing && (
                      <>
                        <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
                        <line x1="0" y1="40" x2="320" y2="40" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
                        <line x1="0" y1="60" x2="320" y2="60" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
                      </>
                    )}
                    
                    {/* Chart data */}
                    {snapshots.length >= 2 ? (
                      <>
                        {/* Area fill */}
                        <path
                          d={`${snapshots.map((s, i) => {
                            const x = (i / (snapshots.length - 1)) * 320;
                            const minVal = Math.min(...snapshots.map(s => s.net_worth));
                            const maxVal = Math.max(...snapshots.map(s => s.net_worth));
                            const range = maxVal - minVal || 1;
                            const y = 70 - ((s.net_worth - minVal) / range) * 50;
                            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                          }).join(' ')} L 320,80 L 0,80 Z`}
                          fill="url(#areaGrad)"
                        />
                        {/* Tube glow layer 1 — outer wide glow */}
                        <path
                          d={snapshots.map((s, i) => {
                            const x = (i / (snapshots.length - 1)) * 320;
                            const minVal = Math.min(...snapshots.map(s => s.net_worth));
                            const maxVal = Math.max(...snapshots.map(s => s.net_worth));
                            const range = maxVal - minVal || 1;
                            const y = 70 - ((s.net_worth - minVal) / range) * 50;
                            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#56be89"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="0.12"
                        />
                        {/* Tube glow layer 2 — medium glow */}
                        <path
                          d={snapshots.map((s, i) => {
                            const x = (i / (snapshots.length - 1)) * 320;
                            const minVal = Math.min(...snapshots.map(s => s.net_worth));
                            const maxVal = Math.max(...snapshots.map(s => s.net_worth));
                            const range = maxVal - minVal || 1;
                            const y = 70 - ((s.net_worth - minVal) / range) * 50;
                            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#56be89"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="0.2"
                        />
                        {/* Tube glow layer 3 — thin bright core with gradient */}
                        <path
                          d={snapshots.map((s, i) => {
                            const x = (i / (snapshots.length - 1)) * 320;
                            const minVal = Math.min(...snapshots.map(s => s.net_worth));
                            const maxVal = Math.max(...snapshots.map(s => s.net_worth));
                            const range = maxVal - minVal || 1;
                            const y = 70 - ((s.net_worth - minVal) / range) * 50;
                            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="url(#strokeGrad)"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#lineGlow)"
                        />
                        
                        {/* ─── ROCKET MONEY: Crosshair when scrubbing ─────────── */}
                        {isScrubbing && scrubIndex !== null && (
                          <>
                            {/* Vertical crosshair line */}
                            <line
                              x1={(scrubIndex / (snapshots.length - 1)) * 320}
                              y1="0"
                              x2={(scrubIndex / (snapshots.length - 1)) * 320}
                              y2="80"
                              stroke={dsColors.accent}
                              strokeWidth="1"
                              strokeDasharray="3"
                              strokeOpacity="0.6"
                              filter="url(#crosshairGlow)"
                            />
                            
                            {/* Outer glow ring on scrub point */}
                            <circle 
                              cx={(scrubIndex / (snapshots.length - 1)) * 320}
                              cy={(() => {
                                const minVal = Math.min(...snapshots.map(s => s.net_worth));
                                const maxVal = Math.max(...snapshots.map(s => s.net_worth));
                                const range = maxVal - minVal || 1;
                                return 70 - ((snapshots[scrubIndex].net_worth - minVal) / range) * 50;
                              })()}
                              r="8" 
                              fill={dsColors.accent}
                              fillOpacity="0.25"
                              filter="url(#dotGlow)"
                            />
                            {/* Inner bright dot on scrub point */}
                            <circle 
                              cx={(scrubIndex / (snapshots.length - 1)) * 320}
                              cy={(() => {
                                const minVal = Math.min(...snapshots.map(s => s.net_worth));
                                const maxVal = Math.max(...snapshots.map(s => s.net_worth));
                                const range = maxVal - minVal || 1;
                                return 70 - ((snapshots[scrubIndex].net_worth - minVal) / range) * 50;
                              })()}
                              r="3.5" 
                              fill={dsColors.accent}
                            />
                            {/* White center dot */}
                            <circle 
                              cx={(scrubIndex / (snapshots.length - 1)) * 320}
                              cy={(() => {
                                const minVal = Math.min(...snapshots.map(s => s.net_worth));
                                const maxVal = Math.max(...snapshots.map(s => s.net_worth));
                                const range = maxVal - minVal || 1;
                                return 70 - ((snapshots[scrubIndex].net_worth - minVal) / range) * 50;
                              })()}
                              r="1.5" 
                              fill="#FFFFFF"
                            />
                          </>
                        )}

                        {/* Outer glow ring on current point (when NOT scrubbing) */}
                        {!isScrubbing && (
                          <>
                            <circle 
                              cx="320" 
                              cy={(() => {
                                const minVal = Math.min(...snapshots.map(s => s.net_worth));
                                const maxVal = Math.max(...snapshots.map(s => s.net_worth));
                                const range = maxVal - minVal || 1;
                                return 70 - ((snapshots[snapshots.length - 1].net_worth - minVal) / range) * 50;
                              })()} 
                              r="7" 
                              fill="#56be89"
                              fillOpacity="0.2"
                              filter="url(#dotGlow)"
                            />
                            {/* Inner bright dot */}
                            <circle 
                              cx="320" 
                              cy={(() => {
                                const minVal = Math.min(...snapshots.map(s => s.net_worth));
                                const maxVal = Math.max(...snapshots.map(s => s.net_worth));
                                const range = maxVal - minVal || 1;
                                return 70 - ((snapshots[snapshots.length - 1].net_worth - minVal) / range) * 50;
                              })()} 
                              r="2.5" 
                              fill="#FFFFFF"
                            />
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Area fill */}
                        <path
                          d="M0,60 L64,50 L128,45 L192,55 L256,35 L320,20 L320,80 L0,80 Z"
                          fill="url(#areaGrad)"
                        />
                        {/* Tube glow layer 1 — outer wide glow */}
                        <path
                          d="M0,60 L64,50 L128,45 L192,55 L256,35 L320,20"
                          fill="none"
                          stroke="#56be89"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="0.12"
                        />
                        {/* Tube glow layer 2 — medium glow */}
                        <path
                          d="M0,60 L64,50 L128,45 L192,55 L256,35 L320,20"
                          fill="none"
                          stroke="#56be89"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="0.2"
                        />
                        {/* Tube glow layer 3 — thin bright core */}
                        <path
                          d="M0,60 L64,50 L128,45 L192,55 L256,35 L320,20"
                          fill="none"
                          stroke="url(#strokeGrad)"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#lineGlow)"
                        />
                        {/* Outer glow ring on dot */}
                        <circle cx="320" cy="20" r="7" fill="#56be89" fillOpacity="0.2" filter="url(#dotGlow)" />
                        {/* Inner bright dot */}
                        <circle cx="320" cy="20" r="2.5" fill="#FFFFFF" />
                      </>
                    )}
                  </svg>
                </div>
              </div>

              {/* Row 4: Gradient Divider (DashboardPage Pattern) */}
              <div className="h-px relative">
                <svg width="100%" height="1" className="absolute inset-0">
                  <defs>
                    <linearGradient id="dividerGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="white" stopOpacity="0" />
                      <stop offset="30%" stopColor="white" stopOpacity="0.15" />
                      <stop offset="50%" stopColor="white" stopOpacity="0.2" />
                      <stop offset="70%" stopColor="white" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="url(#dividerGrad)" strokeWidth="1" />
                </svg>
              </div>

            </motion.div>

            {/* ============================================================ */}
            {/* AI INSIGHTS CARD — Rocket Money Pattern                      */}
            {/* ============================================================ */}
            {activeTab === 'summary' && (
              <AIInsightsCard 
                netWorthTrend={netWorthTrend}
                totalAssets={totalAssets}
                totalDebts={totalDebts}
                lang={lang}
              />
            )}

            {/* ============================================================ */}
            {/* ASSET ALLOCATION CHART — Donut Chart                       */}
            {/* ============================================================ */}
            {activeTab === 'summary' && (
              <AssetAllocationChart 
                accounts={accounts}
                showAmount={showAmount}
                lang={lang}
              />
            )}

            {/* ============================================================ */}
            {/* ACCOUNT GROUPS — Pill Style (DashboardPage Pattern)        */}
            {/* ============================================================ */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-3 px-6 -mx-2">
                  <h2 className="text-[17px] font-semibold" style={{ color: dsColors.text }}>
                    {activeTab === 'summary' ? text.breakdown : activeTab === 'assets' ? text.totalAssets : text.totalDebts}
                  </h2>
                  <button
                    onClick={() => { haptics.fire('SELECT'); setShowAddModal(true); }}
                    className="flex items-center gap-1 text-[13px] font-medium transition-colors"
                    style={{ color: dsColors.accent }}
                  >
                    <Plus className="w-4 h-4" />
                    {text.addAccount}
                  </button>
                </div>

                {/* Groups */}
                <div className="space-y-3">
                  {Object.entries(groupedAccounts).map(([group, accountList]) => {
                    const isExpanded = expandedGroups.has(group);
                    const groupTotal = getGroupTotal(accountList);
                    const isLiabilityGroup = accountList[0].account_type === 'liability';
                    const accentColor = isLiabilityGroup ? dsColors.negative : getAccountColor(group, 'asset');

                    return (
                      <motion.div
                        key={group}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="-mx-2 md:mx-0"
                      >
                        {/* Group Header — Pill Style with Expanded Indicator */}
                        <button
                          onClick={() => toggleGroup(group)}
                          className="w-full flex items-center justify-between rounded-full px-6 py-3 active:scale-[0.98] transition-all cursor-pointer"
                          style={{ 
                            backgroundColor: isExpanded ? `${accentColor}08` : dsColors.surface,
                            border: isExpanded ? `1px solid ${accentColor}30` : '1px solid transparent',
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-11 h-11 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${accentColor}15` }}
                            >
                              <span style={{ color: accentColor }}>
                                {getAccountIcon(group)}
                              </span>
                            </div>
                            <div className="text-left">
                              <p className="text-[15px] font-semibold" style={{ color: dsColors.text }}>
                                {accountList[0].account_name_th || accountList[0].account_name}
                              </p>
                              <p className="text-xs" style={{ color: dsColors.textMuted, fontFamily: dsTypography.fontMono }}>
                                {accountList.length} {text.accounts}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p 
                              className="text-[15px] font-bold"
                              style={{ 
                                color: accentColor,
                                fontFamily: dsTypography.fontMono
                              }}
                            >
                              {showAmount ? (isLiabilityGroup ? '-' : '') + `฿${groupTotal.toLocaleString()}` : '●●●●'}
                            </p>
                            <motion.div
                              animate={{ 
                                rotate: isExpanded ? 180 : 0,
                                scale: isExpanded ? 1.1 : 1,
                              }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                              <ChevronDown 
                                className="w-5 h-5" 
                                style={{ color: isExpanded ? dsColors.accent : dsColors.textMuted }} 
                              />
                            </motion.div>
                          </div>
                        </button>

                        {/* Expandable Accounts */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pr-4 pt-2 pb-2 space-y-2">
                                {accountList.map((account) => (
                                  <div
                                    key={account.id}
                                    onContextMenu={(e) => { e.preventDefault(); handleLongPress(account); }}
                                    onTouchStart={(e) => {
                                      const timer = setTimeout(() => handleLongPress(account), 500);
                                      (e.currentTarget as HTMLElement).dataset.timer = String(timer);
                                    }}
                                    onTouchEnd={(e) => {
                                      const timer = (e.currentTarget as HTMLElement).dataset.timer;
                                      if (timer) clearTimeout(parseInt(timer));
                                    }}
                                    onMouseDown={(e) => {
                                      if (e.button === 2) return;
                                      const timer = setTimeout(() => handleLongPress(account), 500);
                                      (e.currentTarget as HTMLElement).dataset.timer = String(timer);
                                    }}
                                    onMouseUp={(e) => {
                                      const timer = (e.currentTarget as HTMLElement).dataset.timer;
                                      if (timer) clearTimeout(parseInt(timer));
                                    }}
                                    onMouseLeave={(e) => {
                                      const timer = (e.currentTarget as HTMLElement).dataset.timer;
                                      if (timer) clearTimeout(parseInt(timer));
                                    }}
                                    className="flex items-center justify-between rounded-full px-6 py-3 cursor-pointer active:scale-[0.98] transition-all"
                                    style={{ backgroundColor: dsColors.surface }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div 
                                        className="w-9 h-9 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${accentColor}10` }}
                                      >
                                        <span style={{ color: accentColor }}>
                                          {getAccountIcon(account.account_category)}
                                        </span>
                                      </div>
                                      <div>
                                        <div className="flex items-center">
                                          <p className="text-[14px] font-medium" style={{ color: dsColors.text }}>
                                            {account.account_name_th || account.account_name}
                                          </p>
                                          {/* ROCKET MONEY: Grace Period Badge */}
                                          {!account.is_manual && (
                                            <DisconnectedBadge 
                                              daysSinceSync={getDisconnectionStatus(account.last_synced_at).daysSinceSync}
                                              lang={lang}
                                            />
                                          )}
                                        </div>
                                        {account.institution && (
                                          <p className="text-[11px]" style={{ color: dsColors.textMuted }}>
                                            {account.institution}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <p 
                                      className="text-[14px] font-semibold"
                                      style={{ 
                                        color: isLiabilityGroup ? dsColors.negative : dsColors.text,
                                        fontFamily: dsTypography.fontMono
                                      }}
                                    >
                                      {showAmount ? (isLiabilityGroup ? '-' : '') + `฿${account.current_balance.toLocaleString()}` : '●●●●'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  {Object.keys(groupedAccounts).length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: dsColors.surface }}>
                        <Wallet className="w-8 h-8" style={{ color: dsColors.textMuted }} />
                      </div>
                      <p className="text-[14px] mb-4" style={{ color: dsColors.textSecondary }}>
                        {lang === 'th' ? 'ยังไม่มีบัญชี' : 'No accounts yet'}
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
                        style={{ backgroundColor: dsColors.accent, color: dsColors.text }}
                      >
                        {text.addAccount}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setSelectedAccount(undefined); }}
        onSave={handleSaveAccount}
        account={selectedAccount}
        lang={lang}
      />

      <AccountActionsMenu
        isOpen={showActionsMenu}
        onClose={() => { setShowActionsMenu(false); setSelectedAccount(undefined); }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        account={selectedAccount}
      />

      <LinkAccountModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        lang={lang}
      />
    </div>
  );
}
