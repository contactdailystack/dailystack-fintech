import React, { useEffect, useState, useMemo, Suspense, lazy } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Compass, WalletCards, Gift,
  User, Settings, Sparkles, MapPin,
  Plus, CreditCard, Coffee, Utensils, Dumbbell,
  AlertTriangle, Check, ShieldAlert, MessageSquare, X,
} from 'lucide-react';
import { trackEvent } from '../../../utils/analytics';
import { triggerHaptic } from '../../../utils/haptics';
import { fetchUserWallets, updateWalletBalance, type UserWallet } from '../services/walletService';
import { fetchUserTransactions, addUserTransaction, type UserTransaction } from '../services/transactionService';
import { parseBankSms, resolveWalletIdByBankName, type ParsedSmsResult } from '../utils/bankSmsParser';
import { CANCELLATION_PLAYBOOKS, type Playbook } from '../data/cancellationPlaybooks';
import { getProfile } from '../services/authService';
import {
  fetchCancellationProgress,
  fetchCancellationDocuments,
  upsertCancellationProgress,
  fetchCompletedCancellationHistory,
  fetchCancellationTimeline,
} from '../services/cancellationService';
import type {
  CancellationProgress as CancellationProgressType,
  CancellationDocument as CancellationDocumentType,
  CompletedCancellation,
} from '../services/cancellationService';
import { OnboardingStatusCard } from '../components/OnboardingStatusCard';
import { CancellationStepTracker } from '../components/CancellationStepTracker';
import { StatusRing } from '../components/StatusRing';

const WalletSection = lazy(() => import('./components/WalletSection').then(m => ({ default: m.WalletSection })));
const SmsIngestion = lazy(() => import('./components/SmsIngestion').then(m => ({ default: m.SmsIngestion })));
const SubscriptionList = lazy(() => import('./components/SubscriptionList').then(m => ({ default: m.SubscriptionList })));
const CancellationAssistant = lazy(() => import('./components/CancellationAssistant').then(m => ({ default: m.CancellationAssistant })));

export const DailyStackLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className ?? ''}`}>
    <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ds-grad-db" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C7FF2E" />
          <stop offset="100%" stopColor="#C7FF2E" />
        </linearGradient>
      </defs>
      <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#ds-grad-db)" opacity="0.55" />
      <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#ds-grad-db)" opacity="0.78" />
      <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#ds-grad-db)" />
      <path d="M50 29 L72 39 L50 47 L28 39 Z" fill="#000000" opacity="0.35" />
    </svg>
    <span className="text-sm font-black tracking-[0.18em] uppercase leading-none font-sans select-none">
      <span className="text-white">DAILY</span>
      <span className="text-primary">STACK</span>
    </span>
  </div>
);

export const SUBSCRIPTION_PROVIDER_SUGGESTIONS = [
  'Netflix Premium',
  'ChatGPT Plus',
  'Spotify Duo',
  'Spotify Premium',
  'Apple One',
  'Apple Music',
  'Disney+',
  'YouTube Premium',
  'Amazon Prime',
  'Adobe Creative Cloud'
];

export const getSubscriptionBrandMeta = (name: string) => {
  const normalized = name.trim().toLowerCase();
  if (normalized.includes('netflix')) {
    return { logoColor: 'bg-black', brand: 'netflix' };
  }
  if (normalized.includes('chatgpt')) {
    return { logoColor: 'bg-[#10A37F]', brand: 'chatgpt' };
  }
  if (normalized.includes('spotify')) {
    return { logoColor: 'bg-[#1DB954]', brand: 'spotify' };
  }
  if (normalized.includes('apple') || normalized.includes('itunes') || normalized.includes('apple music') || normalized.includes('apple one')) {
    return { logoColor: 'bg-black', brand: 'apple' };
  }
  if (normalized.includes('disney')) {
    return { logoColor: 'bg-[#113ccf]', brand: 'disney' };
  }
  if (normalized.includes('youtube')) {
    return { logoColor: 'bg-[#FF0000]', brand: 'youtube' };
  }
  if (normalized.includes('amazon prime') || normalized.includes('prime video')) {
    return { logoColor: 'bg-[#00A8E1]', brand: 'amazon_prime' };
  }
  if (normalized.includes('adobe')) {
    return { logoColor: 'bg-[#FF0000]', brand: 'adobe' };
  }
  return { logoColor: 'bg-teal-500', brand: 'generic' };
};

export const getCancellationPlaybook = (name: string) => {
  const normalized = name.trim().toLowerCase();
  return Object.values(CANCELLATION_PLAYBOOKS).find((playbook) =>
    normalized.includes(playbook.provider_name.toLowerCase())
  ) || Object.values(CANCELLATION_PLAYBOOKS).find((playbook) =>
    playbook.provider_name.toLowerCase().split(' ').some((token) => normalized.includes(token))
  );
};

export const SubscriptionBrandIcon: React.FC<{ name: string; logoColor: string }> = ({ name, logoColor }) => {
  const normalized = name.trim().toLowerCase();

  if (normalized.includes('netflix')) {
    return (
      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-inner">
        <span className="text-lg font-black text-[#E50914]">N</span>
      </div>
    );
  }

  if (normalized.includes('chatgpt')) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#10A37F] flex items-center justify-center shadow-inner">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3.5c3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5-6.5-2.91-6.5-6.5S8.41 3.5 12 3.5Z" />
          <path d="M7.5 8.5c1.5-1.5 3.5-1.5 5 0m-5 7c1.5 1.5 3.5 1.5 5 0m-3-3.5c1.25-1.25 2.75-1.25 4 0m-4 4c1.25 1.25 2.75 1.25 4 0" />
        </svg>
      </div>
    );
  }

  if (normalized.includes('spotify')) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center shadow-inner">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 9.5c4.5-2.3 10.5-1.7 12.5 3.5" />
          <path d="M6.5 12.5c3.8-1.8 8.9-1.4 11 2.9" />
          <path d="M6.5 15.5c3-1.5 7.2-1.2 9.5 2" />
        </svg>
      </div>
    );
  }

  if (normalized.includes('apple')) {
    return (
      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-inner">
        <span className="text-lg font-black text-white">&#xF8FF;</span>
      </div>
    );
  }

  return (
    <div className={`w-10 h-10 rounded-full ${logoColor} flex items-center justify-center text-xs font-black uppercase text-white shadow-inner`}>
      {name.charAt(0)}
    </div>
  );
};

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M7 3h6l4 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckBadgeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 12.5l1.75 1.75L15 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface NavItem {
  icon?: React.ElementType;
  label: string;
  active?: boolean;
  locked?: boolean;
  onClick?: () => void;
  /** Custom image icon — supports adjustable size via className */
  iconSrc?: string;
  iconAlt?: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card';
  balance: number;
  color: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextBillingDate: string;
  logoColor: string;
  category: string;
  utilizationWarning?: string;
}

export interface Budget {
  categoryName: string;
  limit: number;
  spent: number;
  color: string;
}

export interface Transaction {
  id: string;
  walletName: string;
  categoryName: string;
  amount: number;
  notes?: string;
  date: string;
}

export const SideNavButton: React.FC<NavItem> = ({ icon: Icon, label, active, locked, onClick }) => (
  <button
    onClick={locked ? undefined : onClick}
    className={`flex items-center justify-between w-full px-3 py-3 rounded-xl text-sm font-bold
      transition-all min-h-[44px] ${
      active
        ? 'bg-[#000000] text-primary shadow-sm'
        : locked
        ? 'text-gray-300 cursor-not-allowed opacity-50'
        : 'text-gray-500 hover:bg-gray-100 hover:text-[#000000]'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      {label}
    </div>
    {locked && <Lock size={14} />}
  </button>
);

const Lock: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const BottomTabButton: React.FC<NavItem> = ({ icon: Icon, label, active, locked, onClick, iconSrc, iconAlt }) => (
  <button
    onClick={locked ? undefined : onClick}
    className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[56px]
      transition-all relative ${
      active
        ? 'text-[#000000]'
        : locked
        ? 'text-gray-300 cursor-not-allowed'
        : 'text-gray-500 active:text-[#000000]'
    }`}
  >
    <div className="relative flex items-center justify-center">
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={iconAlt ?? label}
          className="object-contain w-6 h-6 rounded-sm"
        />
      ) : (
        <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
      )}
      {locked && (
        <Lock size={10} className="absolute -top-1 -right-1 text-gray-400" />
      )}
    </div>
    <span className="text-[10px] font-bold tracking-wide font-sans leading-none">{label}</span>
    {active && (
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#000000]" />
    )}
  </button>
);

interface DashboardHomeProps {
  wallets: Wallet[];
  setWallets: React.Dispatch<React.SetStateAction<Wallet[]>>;
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
  loadingSubscriptions: boolean;
  budgets: Budget[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  cancellationProgresses: Record<string, CancellationProgressType>;
  setCancellationProgresses: React.Dispatch<React.SetStateAction<Record<string, CancellationProgressType>>>;
  cancellationChecklists: Record<string, Array<{ id: string; title: string; completed: boolean }>>;
  setCancellationChecklists: React.Dispatch<React.Dispatch<Record<string, Array<{ id: string; title: string; completed: boolean }>>>>;
  cancellationDocuments: CancellationDocumentType[];
  setCancellationDocuments: React.Dispatch<React.SetStateAction<CancellationDocumentType[]>>;
  completedCancellationHistory: CompletedCancellation[];
  setCompletedCancellationHistory: React.Dispatch<React.SetStateAction<CompletedCancellation[]>>;
  currentUserId: string | null;
  onOpenPlaybook: (sub: Subscription) => void;
  onToggleChecklistItem: (subId: string, itemId: string) => void;
  onUploadProof: (subId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveProof: (docId: string) => void;
  smsToast: string | null;
  setSmsToast: React.Dispatch<React.SetStateAction<string | null>>;
  notificationThreshold: number;
  urgentBadgeDays: number;
  userProfile: any;
  navigate: ReturnType<typeof useNavigate>;
  onLogout: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  wallets,
  setWallets,
  subscriptions,
  setSubscriptions,
  loadingSubscriptions,
  budgets,
  transactions,
  setTransactions,
  cancellationProgresses,
  setCancellationProgresses,
  cancellationChecklists,
  setCancellationChecklists,
  cancellationDocuments,
  setCancellationDocuments,
  completedCancellationHistory,
  setCompletedCancellationHistory,
  currentUserId,
  onOpenPlaybook,
  onToggleChecklistItem,
  onUploadProof,
  onRemoveProof,
  smsToast,
  setSmsToast,
  notificationThreshold,
  urgentBadgeDays,
  userProfile,
  navigate,
  onLogout,
}) => {
  const [smsText, setSmsText] = useState<string>('');
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Food & Dining');
  const [inputNotes, setInputNotes] = useState<string>('');
  const [subscriptionFormOpen, setSubscriptionFormOpen] = useState<boolean>(false);
  const [subscriptionDraft, setSubscriptionDraft] = useState<Subscription | null>(null);
  const [subscriptionSaving, setSubscriptionSaving] = useState<boolean>(false);
  const [subscriptionError, setSubscriptionError] = useState<string>('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [settingsThreshold, setSettingsThreshold] = useState(notificationThreshold);
  const [settingsUrgent, setSettingsUrgent] = useState(urgentBadgeDays);
  const [isPlaybookOpen, setIsPlaybookOpen] = useState<boolean>(false);
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
  const [activePlaybookTab, setActivePlaybookTab] = useState<'info' | 'checklist' | 'proof' | 'history' | 'saved'>('info');
  const [timelineItems, setTimelineItems] = useState<Record<string, any[]>>({});
  const [showCountMap, setShowCountMap] = useState<Record<string, number>>({});
  const [timelineFilterType, setTimelineFilterType] = useState<'all'|'document'|'progress'|'event'>('all');
  const [timelineSearchQuery, setTimelineSearchQuery] = useState<string>('');

  const categories = [
    { name: 'Food & Dining', icon: Utensils, bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
    { name: 'Transportation', icon: MapPin, bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    { name: 'Specialty Coffee', icon: Coffee, bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
    { name: 'Active & Fitness', icon: Dumbbell, bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' }
  ];

  const formatSubscriptionDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCancellationDeadlineFromBilling = (billingDate: string, noticeDays: number) => {
    const parsed = new Date(billingDate);
    if (Number.isNaN(parsed.getTime())) return null;
    const deadline = new Date(parsed);
    deadline.setDate(deadline.getDate() - noticeDays);
    return deadline;
  };

  const getDaysUntil = (target: Date) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.ceil((target.getTime() - Date.now()) / msPerDay));
  };

  const openSubscriptionForm = (subscription?: Subscription) => {
    setSubscriptionDraft(
      subscription
        ? { ...subscription }
        : {
            id: `new-${Date.now()}`,
            name: '',
            amount: 0,
            nextBillingDate: new Date().toISOString().slice(0, 10),
            logoColor: 'bg-teal-500',
            category: 'Entertainment',
          }
    );
    setSubscriptionError('');
    setSubscriptionFormOpen(true);
  };

  const closeSubscriptionForm = () => {
    setSubscriptionFormOpen(false);
    setSubscriptionDraft(null);
    setSubscriptionError('');
  };

  const handleSubscriptionSave = async () => {
    if (!subscriptionDraft) return;
    const trimmedName = subscriptionDraft.name.trim();
    if (!trimmedName || subscriptionDraft.amount <= 0 || !subscriptionDraft.nextBillingDate) {
      setSubscriptionError('กรุณากรอกชื่อบริการ จำนวนเงิน และวันที่เรียกเก็บถัดไป');
      return;
    }

    setSubscriptionSaving(true);
    setSubscriptionError('');

    try {
      const payload = {
        name: trimmedName,
        amount: subscriptionDraft.amount,
        next_billing_date: subscriptionDraft.nextBillingDate,
        category: subscriptionDraft.category,
        utilization_warning: subscriptionDraft.utilizationWarning,
      };

      if (subscriptionDraft.id.startsWith('new-')) {
        const { addUserSubscription } = await import('../services/subscriptionService');
        const created = await addUserSubscription(payload);
        setSubscriptions((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.name,
            amount: created.amount,
            nextBillingDate: created.next_billing_date,
            logoColor: getSubscriptionBrandMeta(created.name).logoColor,
            category: created.category,
            utilizationWarning: created.utilization_warning || undefined,
          },
        ]);
      } else {
        const { updateUserSubscription } = await import('../services/subscriptionService');
        const updated = await updateUserSubscription(subscriptionDraft.id, payload);
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === updated.id
              ? {
                  ...sub,
                  name: updated.name,
                  amount: updated.amount,
                  nextBillingDate: updated.next_billing_date,
                  logoColor: getSubscriptionBrandMeta(updated.name).logoColor,
                  category: updated.category,
                  utilizationWarning: updated.utilization_warning || undefined,
                }
              : sub
          )
        );
      }

      closeSubscriptionForm();
    } catch (err) {
      console.error('[Dashboard] save subscription failed:', err);
      setSubscriptionError('บันทึก subscription ล้มเหลว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubscriptionSaving(false);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    setPendingDeleteId(subscriptionId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteSubscription = async () => {
    if (!pendingDeleteId) return;
    setDeleteConfirmOpen(false);
    try {
      const { deleteUserSubscription } = await import('../services/subscriptionService');
      await deleteUserSubscription(pendingDeleteId);
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== pendingDeleteId));
    } catch (err) {
      console.error('[Dashboard] delete subscription failed:', err);
      setSmsToast('ลบ subscription ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    }
    setPendingDeleteId(null);
  };

  const nextRenewalSubscription = useMemo(() => {
    if (!subscriptions.length) return null;
    return [...subscriptions].sort(
      (a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
    )[0];
  }, [subscriptions]);

  const totalSubscriptionSpend = useMemo(() => subscriptions.reduce((sum, item) => {
    const monthlyAmount = (item as any).billing_cycle === 'yearly' ? item.amount / 12
      : (item as any).billing_cycle === 'weekly' ? item.amount * 4.33
      : item.amount;
    return sum + monthlyAmount;
  }, 0), [subscriptions]);

  const underusedSubscriptions = useMemo(() => {
    const count = subscriptions.filter((item) => item.utilizationWarning).length;
    return count > 0 ? `${count} service${count > 1 ? 's' : ''} appear${count === 1 ? 's' : ''} underused` : null;
  }, [subscriptions]);

  const estimatedSavings = useMemo(() => subscriptions
    .filter((s) => s.utilizationWarning)
    .reduce((sum, s) => sum + s.amount, 0), [subscriptions]);

  const parsedResult = useMemo(() => {
    return smsText.trim() ? parseBankSms(smsText) : null;
  }, [smsText]);

  const healthScore = useMemo(() => {
    let score = 100;
    
    budgets.forEach((b) => {
      const ratio = b.spent / b.limit;
      if (ratio > 1.0) {
        score -= 15;
      } else if (ratio > 0.85) {
        score -= 6;
      }
    });

    const scbWallet = wallets.find(
      (w) => w.name.toLowerCase().includes('scb') || w.name.includes('ไทยพาณิชย์')
    );
    if (scbWallet && scbWallet.balance < 5000) {
      score -= 10;
    }

    subscriptions.forEach((s) => {
      if (s.utilizationWarning) {
        score -= 8;
      }
    });

    let totalMonthlySavings = 0;
    subscriptions.forEach((s) => {
      const progress = cancellationProgresses[s.id];
      if (progress && progress.completed) {
        totalMonthlySavings += s.amount;
      }
    });

    const savingsBonus = Math.min(20, Math.floor(totalMonthlySavings / 200));
    score += savingsBonus;

    return Math.min(100, Math.max(40, score));
  }, [budgets, wallets, subscriptions, cancellationProgresses]);

  const overBudgetCategories = useMemo(
    () => budgets.filter((b) => b.spent > b.limit),
    [budgets]
  );

  const nearBudgetCategories = useMemo(
    () => budgets.filter((b) => b.spent > b.limit * 0.85 && b.spent <= b.limit),
    [budgets]
  );

  const cancellationDeadlineAlerts = useMemo(() => {
    return subscriptions
      .map((sub) => {
        const playbook = getCancellationPlaybook(sub.name);
        if (!playbook || !sub.nextBillingDate) return null;

        const deadline = getCancellationDeadlineFromBilling(sub.nextBillingDate, playbook.notice_period_days);
        if (!deadline) return null;

        const daysLeft = getDaysUntil(deadline);
        if (daysLeft > 14) return null;

        return {
          subscriptionId: sub.id,
          name: sub.name,
          daysLeft,
          deadline,
          noticeDays: playbook.notice_period_days,
        };
      })
      .filter(Boolean) as Array<{
        subscriptionId: string;
        name: string;
        daysLeft: number;
        deadline: Date;
        noticeDays: number;
      }>;
  }, [subscriptions]);

  const cancellationDeadlineMap = useMemo(() => new Map(cancellationDeadlineAlerts.map(a => [a.subscriptionId, a])), [cancellationDeadlineAlerts]);

  const openDeadlineSettings = () => {
    setSettingsThreshold(notificationThreshold);
    setSettingsUrgent(urgentBadgeDays);
    setSettingsSheetOpen(true);
  };

  const saveDeadlineSettings = () => {
    const nv = Math.max(0, settingsThreshold);
    const uv = Math.max(0, settingsUrgent);
    setSettingsThreshold(nv);
    setSettingsUrgent(uv);
    localStorage.setItem('notif_threshold_v1', String(nv));
    localStorage.setItem('urgent_badge_days_v1', String(uv));
    setSettingsSheetOpen(false);
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_settings').upsert({ user_id: user.id, notif_threshold: nv }, { onConflict: 'user_id' });
        }
      } catch (e) {
        console.error('Failed to persist notif threshold to server:', e);
      }
    })();
  };

  const handleConfirmSmsTransaction = () => {
    if (!parsedResult) return;

    const { amount, categoryName, notes, bankName } = parsedResult;

    const resolvedWalletId = resolveWalletIdByBankName(bankName, wallets);
    const activeWallet = wallets.find((w) => w.id === resolvedWalletId);

    let newWalletBalance = 0;
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === resolvedWalletId) {
          newWalletBalance = Math.max(0, w.balance - amount);
          return { ...w, balance: newWalletBalance };
        }
        return w;
      })
    );

    const newTx: Transaction = {
      id: Date.now().toString(),
      walletName: activeWallet ? activeWallet.name : bankName,
      categoryName,
      amount,
      notes: notes,
      date: 'Today',
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (resolvedWalletId) {
      updateWalletBalance(resolvedWalletId, newWalletBalance).catch(console.error);
      addUserTransaction({
        wallet_id: resolvedWalletId,
        wallet_name: activeWallet ? activeWallet.name : bankName,
        category_name: categoryName,
        amount,
        notes: notes || '',
        transaction_date: new Date().toISOString().split('T')[0],
      }).catch(console.error);
    }

    trackEvent('sms_transaction_logged', { amount, bankName, categoryName });
    triggerHaptic('success');

    setSmsText('');
    setSmsToast(`นำเข้าข้อมูลสำเร็จ! หักยอด ${amount.toLocaleString()} THB จากบัญชี ${activeWallet ? activeWallet.name : bankName}`);
  };

  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      const defaultWallet = wallets.find((w) => w.type === 'bank') || wallets[0];
      setSelectedWalletId(defaultWallet.id);
    }
  }, [wallets, selectedWalletId]);

  const handleKeypadPress = (val: string) => {
    triggerHaptic('light');
    if (val === 'C') {
      setInputAmount('0');
    } else if (val === 'back') {
      setInputAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else {
      setInputAmount((prev) => {
        if (prev === '0' && val !== '.') return val;
        if (val === '.' && prev.includes('.')) return prev;
        if (prev.length > 8) return prev;
        return prev + val;
      });
    }
  };

  const handleSaveTransaction = () => {
    const parsedAmount = parseFloat(inputAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    let newWalletBalance = 0;
    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === selectedWalletId) {
          newWalletBalance = Math.max(0, w.balance - parsedAmount);
          return { ...w, balance: newWalletBalance };
        }
        return w;
      })
    );

    const activeWallet = wallets.find((w) => w.id === selectedWalletId);
    const newTx: Transaction = {
      id: Date.now().toString(),
      walletName: activeWallet ? activeWallet.name : 'Wallet',
      categoryName: selectedCategoryName,
      amount: parsedAmount,
      notes: inputNotes.trim() ? inputNotes : undefined,
      date: 'Today',
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (selectedWalletId) {
      updateWalletBalance(selectedWalletId, newWalletBalance).catch(console.error);
      addUserTransaction({
        wallet_id: selectedWalletId,
        wallet_name: activeWallet ? activeWallet.name : 'Wallet',
        category_name: selectedCategoryName,
        amount: parsedAmount,
        notes: inputNotes.trim() || '',
        transaction_date: new Date().toISOString().split('T')[0],
      }).catch(console.error);
    }

    trackEvent('financial_transaction_logged', { amount: parsedAmount, category: selectedCategoryName });
    triggerHaptic('success');

    setInputAmount('0');
    setInputNotes('');
    setIsLogOpen(false);
  };

  const totalLiquidCapital = wallets
    .filter((w) => w.type !== 'credit_card')
    .reduce((sum, w) => sum + w.balance, 0);

  const navItems: NavItem[] = [
    {
      iconSrc: '/tab-logo.jpg',
      iconAlt: 'DailyStack',
      label: 'Dashboard',
      active: true,
      onClick: () => {},
    },
    {
      icon: WalletCards,
      label: 'Cards',
      onClick: () => {
        trackEvent('feature_usage', { feature: 'memberships_tab' });
        navigate('/memberships');
      },
    },
    {
      icon: Gift,
      label: 'Rewards',
      onClick: () => {
        trackEvent('feature_usage', { feature: 'rewards_tab' });
        navigate('/rewards');
      },
    },
  ];

  const secondaryNav: NavItem[] = [
    { icon: User, label: 'Profile', onClick: () => navigate('/settings') },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
  ];

  const userEmail = '';

  return (
    <div className="min-h-[100dvh] bg-dark-bg text-white font-sans flex flex-col md:flex-row overflow-x-hidden relative">

      <aside className="hidden md:flex w-60 shrink-0 border-r border-white/5 bg-dark-card flex-col p-5">
        <DailyStackLogo className="mb-10 px-1" />

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <SideNavButton key={item.label} {...item} />
          ))}
          <div className="!mt-6 pt-5 border-t border-white/5 space-y-1">
            {secondaryNav.map((item) => (
              <SideNavButton key={item.label} {...item} />
            ))}
          </div>
        </nav>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-3 text-sm font-medium min-h-[44px]
            text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/8 rounded-xl transition-all mt-2"
        >
          <LogOut size={18} strokeWidth={1.8} /> Sign Out
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-black/5
          px-4 md:px-10 py-3.5 md:py-5 flex justify-between items-center gap-3">
          <div className="md:hidden">
            <DailyStackLogo />
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl font-black text-[#000000] flex items-center gap-2">
              Welcome Back <Sparkles size={20} className="text-[#5B7A00]" />
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-kanit font-semibold">
              ภาพรวมสถานะสุขภาพทางการเงินส่วนบุคคล
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLogOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-[#000000]
                hover:bg-primary/95 active:scale-95 transition-all shadow-[0_4px_16px_rgba(199,255,46,0.25)]"
              aria-label="Add transaction"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50
              rounded-full text-xs text-[#000000] font-bold border border-black/5
              max-w-[140px] sm:max-w-[200px] md:max-w-none overflow-hidden">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7FF2E] animate-pulse shrink-0 shadow-[0_0_6px_#C7FF2E]" />
              <span className="truncate">{userEmail || 'Loading…'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-10 px-4 md:px-10 py-5 md:py-8 space-y-8 md:space-y-10">
          
          <div className="md:hidden">
            <h2 className="text-lg font-black text-[#000000] flex items-center gap-2">
              Welcome Back <Sparkles size={18} className="text-[#5B7A00]" />
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-kanit font-semibold">
              ภาพรวมสถานะสุขภาพทางการเงินส่วนบุคคล
            </p>
          </div>

          {userProfile && (
            <OnboardingStatusCard
              completionPercentage={userProfile.onboarding_completed_at ? 100 : 75}
              interestCount={userProfile.interest_tags?.length || 0}
              budgetCount={userProfile.budgets?.length || 0}
              isComplete={!!userProfile.onboarding_completed_at}
              onEditClick={() => navigate('/onboarding')}
            />
          )}

          {/* ── AI Money Twin Status Ring ─────────────────────────────────── */}
          <section className="flex justify-center">
            <StatusRing
              health={healthScore}
              savingsRate={0}
              warningLevel={
                overBudgetCategories.length > 1 ? 'high' :
                overBudgetCategories.length === 1 ? 'medium' :
                nearBudgetCategories.length > 0 ? 'low' : 'none'
              }
              totalBalance={totalLiquidCapital}
            />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary border-0 shadow-lg rounded-3xl p-5 relative overflow-hidden group text-[#000000] animate-breathing">
              <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest font-mono text-[#000000]/20">01</span>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl pointer-events-none" />
              <p className="text-[10px] font-black text-[#000000]/70 uppercase tracking-widest mb-1.5 font-kanit">
                ยอดเงินสดและเงินฝากพร้อมใช้
              </p>
              <h3 className="text-3xl font-black text-[#000000] tracking-tight leading-none">
                {totalLiquidCapital.toLocaleString()}
                <span className="text-xs text-[#000000]/65 font-bold ml-2">THB</span>
              </h3>
              <div className="mt-3.5 flex">
                <span className="inline-flex items-center gap-1.5 bg-black/10 text-[#000000] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Check size={12} strokeWidth={3} /> บัญชีสถานะพร้อมทำรายการ
                </span>
              </div>
            </div>

            <div className="bg-[#000000] border-0 shadow-lg rounded-3xl p-5 relative overflow-hidden text-white">
              <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest font-mono text-white/20">02</span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 font-kanit">
                การควบคุมงบประมาณรวม
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 h-3.5 rounded-full p-0.5 overflow-hidden shadow-inner">
                  <div className="bg-primary h-full rounded-full" style={{ width: '58.5%' }} />
                </div>
                <span className="text-sm font-black text-white">58.5%</span>
              </div>
              <p className="text-xs text-gray-400 mt-3.5 font-kanit">
                ใช้ไปแล้ว <span className="text-white font-black font-mono">5,850</span> THB จากงบรวม 10,000 THB
              </p>
            </div>

            <div className="bg-white border border-black/5 shadow-lg rounded-3xl p-5 flex items-center justify-between gap-4 relative overflow-hidden text-[#000000]">
              <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest font-mono text-black/15">03</span>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-kanit">
                  คะแนนสุขภาพการเงิน
                </p>
                <h4 className="text-xl font-black text-[#000000] font-kanit">ยอดเยี่ยม (Excellent)</h4>
                <p className="text-xs text-gray-500 font-kanit font-semibold">
                  เพิ่มขึ้น 5 คะแนนจากการยกเลิก Sub รั่วไหล
                </p>
              </div>
              <div className="relative w-16 h-16 rounded-full bg-[#000000] flex items-center justify-center shrink-0 shadow-md">
                <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin-slow pointer-events-none" style={{ transform: 'rotate(78deg)' }} />
                <span className="text-lg font-black text-primary font-mono">{healthScore}</span>
              </div>
            </div>
          </section>

          <Suspense fallback={<div className="h-48 bg-white/5 rounded-2xl animate-pulse" />}>
            <WalletSection wallets={wallets} />
          </Suspense>

          <Suspense fallback={<div className="h-64 bg-white/5 rounded-2xl animate-pulse" />}>
            <SmsIngestion
              smsText={smsText}
              setSmsText={setSmsText}
              smsToast={smsToast}
              parsedResult={parsedResult}
              wallets={wallets}
              onConfirmSmsTransaction={handleConfirmSmsTransaction}
            />
          </Suspense>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Suspense fallback={<div className="h-96 bg-white/5 rounded-2xl animate-pulse" />}>
              <SubscriptionList
                subscriptions={subscriptions}
                loadingSubscriptions={loadingSubscriptions}
                nextRenewalSubscription={nextRenewalSubscription}
                cancellationDeadlineAlerts={cancellationDeadlineAlerts}
                cancellationDeadlineMap={cancellationDeadlineMap}
                urgentBadgeDays={urgentBadgeDays}
                totalSubscriptionSpend={totalSubscriptionSpend}
                estimatedSavings={estimatedSavings}
                onOpenSubscriptionForm={openSubscriptionForm}
                onEditSubscription={openSubscriptionForm}
                onDeleteSubscription={handleDeleteSubscription}
                onOpenPlaybook={onOpenPlaybook}
                formatSubscriptionDate={formatSubscriptionDate}
              />
            </Suspense>

            <div className="bg-white border-0 shadow-lg rounded-2xl p-5 space-y-4 text-[#000000]">
              <h3 className="font-black text-[#000000] text-sm flex items-center gap-2">
                <Compass size={16} className="text-[#000000]" /> Category Budgets ({new Date().toLocaleDateString('en-US', { month: 'long' })})
              </h3>
              
              <div className="space-y-4">
                {overBudgetCategories.length > 0 || nearBudgetCategories.length > 0 ? (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-2">
                    {overBudgetCategories.length > 0 && (
                      <p className="font-black flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /> คุณกำลังใช้งบเกินใน {overBudgetCategories.length} หมวดหมู่: {overBudgetCategories.map((b) => b.categoryName).join(', ')}</p>
                    )}
                    {nearBudgetCategories.length > 0 && (
                      <p className="font-semibold flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-amber-200 text-amber-700 text-[10px] font-black flex items-center justify-center">i</span> งบประมาณใกล้เต็มใน {nearBudgetCategories.length} หมวดหมู่: {nearBudgetCategories.map((b) => b.categoryName).join(', ')}</p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-green-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500" /> งบของคุณยังอยู่ในระดับปลอดภัย ขอบคุณที่ติดตามการใช้จ่ายอย่างใกล้ชิด
                  </div>
                )}

                {budgets.map((b) => {
                  const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
                  const isHigh = percent > 85;
                  
                  let hue = 70;
                  if (percent > 45) {
                    const factor = (percent - 45) / 55;
                    hue = Math.max(0, 70 - factor * 70);
                  }
                  const barColor = `hsl(${hue}, 100%, 50%)`;

                  return (
                    <div key={b.categoryName} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-[#000000]">{b.categoryName}</span>
                        <span className="font-black font-mono">
                          {b.spent.toLocaleString()} / {b.limit.toLocaleString()} <span className="text-gray-500 font-normal">THB</span>
                        </span>
                      </div>
                      <div className="relative w-full bg-[#000000] h-3.5 rounded-full p-0.5 overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'animate-pulse' : ''}`} 
                          style={{ width: `${percent}%`, backgroundColor: barColor }} 
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                        <span className="font-bold">ใช้ไปแล้ว {percent}%</span>
                        {isHigh && <span className="text-amber-500 font-black flex items-center gap-1 font-kanit"><AlertTriangle size={10} /> เกินงบที่กำหนด!</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-white border-0 shadow-lg rounded-2xl p-5 space-y-4 text-[#000000]">
            <h3 className="font-black text-[#000000] text-sm flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#000000]" /> Cancellation History
            </h3>
            {completedCancellationHistory.length > 0 ? (
              <div className="space-y-3">
                {completedCancellationHistory.map((item) => {
                  const sub = subscriptions.find((s) => s.id === item.subscriptionId);
                  return (
                    <div key={`${item.subscriptionId}-${item.updatedAt}`} className="p-3 rounded-3xl bg-gray-50 border border-black/5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-[#000000]">{sub?.name || item.subscriptionId}</p>
                          <p className="text-[10px] text-gray-500 mt-1">ยกเลิกสำเร็จเมื่อ {item.updatedAt}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-600 bg-white border border-black/5 rounded-full px-3 py-1">
                          Completed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">ยังไม่มีรายการยกเลิกที่เสร็จสมบูรณ์ในตอนนี้</div>
            )}
          </section>

          <section className="bg-white border-0 shadow-lg rounded-2xl p-5 space-y-4 text-[#000000]">
            <h3 className="font-black text-[#000000] text-sm flex items-center gap-2">
              <Gift size={16} className="text-[#000000]" /> Recent Transaction History
            </h3>
            
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 border border-black/5 rounded-xl hover:border-black/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#000000] flex items-center justify-center text-primary shadow-md">
                      {tx.categoryName === 'Specialty Coffee' ? <Coffee size={18} /> : <Utensils size={18} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#000000]">{tx.categoryName}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">ผ่าน: {tx.walletName} • {tx.notes || 'ไม่มีหมายเหตุ'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-500 font-mono">-{tx.amount} THB</span>
                    <p className="text-[9px] text-gray-500 mt-0.5">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* ── Zero-Button: Gesture Hint (bottom, mobile only) ─────────────── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-20 flex flex-col items-center pb-[calc(12px+env(safe-area-inset-bottom))] pointer-events-none">
        <p className="text-[10px] text-white/25 font-kanit tracking-widest uppercase animate-breathe-ring">
          ปัดลงเพื่อบันทึก
        </p>
        <div className="mt-1 w-6 h-6 flex flex-col items-center gap-0.5">
          <div className="w-px h-1.5 bg-white/20 rounded-full" />
          <div className="w-px h-1 bg-white/30 rounded-full" />
          <div className="w-px h-0.5 bg-white/40 rounded-full" />
        </div>
      </div>

      {isLogOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0" onClick={() => setIsLogOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white border-t border-black/5 rounded-t-3xl shadow-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#000000] animate-sheet-spring">
            
            <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-5" />

            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-[#000000] text-base">บันทึกธุรกรรมการเงิน</h3>
              <button
                onClick={() => setIsLogOpen(false)}
                className="text-xs text-white bg-[#000000] hover:bg-[#000000]/90 px-3 py-1.5 rounded-full transition-all"
              >
                Close
              </button>
            </div>

            <div className="bg-[#000000] rounded-2xl p-4 text-center mb-5 relative shadow-inner">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-kanit font-bold">
                จำนวนเงินที่ต้องการบันทึก
              </p>
              <p className="text-4xl font-extrabold text-primary font-mono tracking-tight">
                {(isNaN(parseFloat(inputAmount)) ? 0 : parseFloat(inputAmount)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                <span className="text-xs text-primary/70 font-normal ml-2">THB</span>
              </p>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 font-kanit">
                เลือกกระเป๋าเงิน / บัญชีหักจ่าย
              </p>
              <div className="grid grid-cols-2 gap-2">
                {wallets.map((w) => {
                  const isSelected = w.id === selectedWalletId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWalletId(w.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isSelected
                          ? 'bg-[#000000] border-[#000000] text-white shadow-md'
                          : 'bg-gray-50 border-black/5 text-gray-500 hover:border-black/20'
                      }`}
                    >
                      <div className="text-left min-w-0">
                        <p className={`text-[10px] font-black truncate ${isSelected ? 'text-primary' : 'text-[#000000]'}`}>{w.name}</p>
                        <p className={`text-xs font-bold font-mono mt-0.5 ${isSelected ? 'text-white' : 'text-gray-600'}`}>{w.balance.toLocaleString()} B</p>
                      </div>
                      {isSelected && <Check size={14} className="text-primary shrink-0 font-bold" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 font-kanit">
                เลือกหมวดหมู่ค่าใช้จ่าย
              </p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => {
                  const isSelected = c.name === selectedCategoryName;
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedCategoryName(c.name)}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'bg-[#000000] border-[#000000] text-white shadow-md'
                          : 'bg-gray-50 border-black/5 text-gray-500 hover:border-black/20'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : c.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <span className={`text-xs font-bold truncate text-left ${isSelected ? 'text-white' : 'text-[#000000]'}`}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2.5 font-kanit">
                หมายเหตุเพิ่มเติม (Optional)
              </p>
              <input
                type="text"
                value={inputNotes}
                onChange={(e) => setInputNotes(e.target.value)}
                placeholder="ระบุข้อความสั้นๆ..."
                className="w-full bg-gray-50 px-4 py-3 min-h-[48px] rounded-xl border border-black/5 text-[#000000] placeholder-gray-400 focus:outline-none focus:border-black/30 transition-all text-sm font-kanit font-semibold"
              />
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-3 gap-2 text-center text-xl font-bold font-mono">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeypadPress(key)}
                    className="p-3 bg-[#000000] active:bg-[#000000]/80 text-white rounded-xl transition-all flex items-center justify-center min-h-[48px] shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {key === 'back' ? <X size={18} /> : key}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveTransaction}
              disabled={parseFloat(inputAmount) <= 0}
              className="w-full py-4 min-h-[52px] rounded-xl font-black text-base text-dark-bg bg-primary
                hover:bg-primary/95 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed
                shadow-[0_8px_32px_rgba(199,255,46,0.35)] flex items-center justify-center gap-2"
            >
              <Check size={18} strokeWidth={3} /> ยืนยันบันทึกธุรกรรม
            </button>

          </div>
        </div>
      )}

      {subscriptionFormOpen && subscriptionDraft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0" onClick={closeSubscriptionForm} />
          <div className="relative w-full max-w-lg bg-white border-t border-black/5 rounded-t-3xl shadow-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#000000] animate-sheet-spring">
            <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-5" />
            <div className="flex justify-between items-center mb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Subscription</p>
                <h3 className="text-xl font-black text-[#000000]">{subscriptionDraft.id.startsWith('new-') ? 'เพิ่ม Subscription ใหม่' : 'แก้ไข Subscription'}</h3>
              </div>
              <button
                onClick={closeSubscriptionForm}
                className="text-xs text-white bg-[#000000] hover:bg-[#000000]/90 px-3 py-1.5 rounded-full transition-all font-bold"
              >
                Close
              </button>
            </div>

            {subscriptionError && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 text-sm">
                {subscriptionError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">ชื่อบริการ</label>
                <input
                  list="subscription-brand-suggestions"
                  value={subscriptionDraft.name}
                  onChange={(e) => setSubscriptionDraft((prev) => prev ? { ...prev, name: e.target.value, logoColor: getSubscriptionBrandMeta(e.target.value).logoColor } : prev)}
                  placeholder="เช่น Netflix Premium"
                  className="w-full rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-sm text-[#000000] focus:outline-none focus:border-black/30"
                />
                <datalist id="subscription-brand-suggestions">
                  {SUBSCRIPTION_PROVIDER_SUGGESTIONS.map((provider) => (
                    <option key={provider} value={provider} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">จำนวนเงิน (THB)</label>
                <input
                  type="number"
                  min="0"
                  value={subscriptionDraft.amount}
                  onChange={(e) => setSubscriptionDraft((prev) => prev ? { ...prev, amount: Number(e.target.value) } : prev)}
                  className="w-full rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-sm text-[#000000] focus:outline-none focus:border-black/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">วันที่เรียกเก็บถัดไป</label>
                  <input
                    type="date"
                    value={subscriptionDraft.nextBillingDate}
                    onChange={(e) => setSubscriptionDraft((prev) => prev ? { ...prev, nextBillingDate: e.target.value } : prev)}
                    className="w-full rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-sm text-[#000000] focus:outline-none focus:border-black/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">หมวดหมู่</label>
                  <select
                    value={subscriptionDraft.category}
                    onChange={(e) => setSubscriptionDraft((prev) => prev ? { ...prev, category: e.target.value } : prev)}
                    className="w-full rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-sm text-[#000000] focus:outline-none focus:border-black/30"
                  >
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">คำเตือนการใช้งาน (Optional)</label>
                <input
                  value={subscriptionDraft.utilizationWarning ?? ''}
                  onChange={(e) => setSubscriptionDraft((prev) => prev ? { ...prev, utilizationWarning: e.target.value } : prev)}
                  placeholder="เช่น ใช้บริการน้อยกว่าที่จ่ายจริง"
                  className="w-full rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-sm text-[#000000] focus:outline-none focus:border-black/30"
                />
              </div>

              <button
                onClick={handleSubscriptionSave}
                disabled={subscriptionSaving}
                className="w-full py-4 rounded-xl bg-primary text-[#000000] font-black uppercase tracking-widest shadow-[0_8px_32px_rgba(199,255,46,0.35)] hover:bg-primary/95 transition"
              >
                {subscriptionSaving ? 'Saving...' : 'Save Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        {isPlaybookOpen && activePlaybook && (
          <CancellationAssistant
            activePlaybook={activePlaybook}
            activePlaybookTab={activePlaybookTab}
            setActivePlaybookTab={setActivePlaybookTab}
            subscriptions={subscriptions}
            cancellationChecklists={cancellationChecklists}
            cancellationProgresses={cancellationProgresses}
            cancellationDocuments={cancellationDocuments}
            completedCancellationHistory={completedCancellationHistory}
            timelineItems={timelineItems}
            showCountMap={showCountMap}
            timelineFilterType={timelineFilterType}
            timelineSearchQuery={timelineSearchQuery}
            onClose={() => setIsPlaybookOpen(false)}
            onToggleChecklistItem={onToggleChecklistItem}
            onUploadProof={onUploadProof}
            onRemoveProof={onRemoveProof}
            setTimelineItems={setTimelineItems}
            setShowCountMap={setShowCountMap}
            setTimelineFilterType={setTimelineFilterType}
            setTimelineSearchQuery={setTimelineSearchQuery}
            getCancellationDeadlineFromBilling={getCancellationDeadlineFromBilling}
            getDaysUntil={getDaysUntil}
            formatSubscriptionDate={formatSubscriptionDate}
          />
        )}
      </Suspense>

    </div>
  );
};
