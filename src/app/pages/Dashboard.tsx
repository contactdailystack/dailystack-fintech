import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Compass, WalletCards, Gift,
  User, Settings, Sparkles, MapPin, Lock,
  Plus, CreditCard, Coffee, Utensils, Dumbbell,
  AlertTriangle, Check, ShieldAlert, MessageSquare, Zap, FileText, HelpCircle, Info, X,
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';
import { triggerHaptic } from '../../utils/haptics';
import {
  fetchUserSubscriptions,
  addUserSubscription,
  updateUserSubscription,
  deleteUserSubscription,
} from '../services/subscriptionService';
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

// ─── Brand Logo ──────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string }> = ({ className }) => (
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  icon?: React.ElementType;
  label: string;
  active?: boolean;
  locked?: boolean;
  onClick?: () => void;
  /** Custom image icon — supports adjustable size via className */
  iconSrc?: string;
  iconAlt?: string;
}

interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card';
  balance: number;
  color: string;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextBillingDate: string;
  logoColor: string;
  category: string;
  utilizationWarning?: string;
}

const SUBSCRIPTION_PROVIDER_SUGGESTIONS = [
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

const getSubscriptionBrandMeta = (name: string) => {
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

const getCancellationPlaybook = (name: string) => {
  const normalized = name.trim().toLowerCase();
  return Object.values(CANCELLATION_PLAYBOOKS).find((playbook) =>
    normalized.includes(playbook.provider_name.toLowerCase())
  ) || Object.values(CANCELLATION_PLAYBOOKS).find((playbook) =>
    playbook.provider_name.toLowerCase().split(' ').some((token) => normalized.includes(token))
  );
};

const SubscriptionBrandIcon: React.FC<{ name: string; logoColor: string }> = ({ name, logoColor }) => {
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
        <span className="text-lg font-black text-white"></span>
      </div>
    );
  }

  return (
    <div className={`w-10 h-10 rounded-full ${logoColor} flex items-center justify-center text-xs font-black uppercase text-white shadow-inner`}>
      {name.charAt(0)}
    </div>
  );
};

// Small Heroicon-style SVGs (kept minimal to avoid extra deps)
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

interface Budget {
  categoryName: string;
  limit: number;
  spent: number;
  color: string;
}

interface Transaction {
  id: string;
  walletName: string;
  categoryName: string;
  amount: number;
  notes?: string;
  date: string;
}

// ─── Desktop Sidebar NavButton ────────────────────────────────────────────────
const SideNavButton: React.FC<NavItem> = ({ icon: Icon, label, active, locked, onClick }) => (
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

// ─── Mobile Bottom Tab Button ─────────────────────────────────────────────────
const BottomTabButton: React.FC<NavItem> = ({ icon: Icon, label, active, locked, onClick, iconSrc, iconAlt }) => (
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

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');

  // ─── Financial Subsystem State ───
  // FIX: Initialize with empty arrays - load from database on mount
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState<boolean>(true);
  const [loadingWallets, setLoadingWallets] = useState<boolean>(true);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [subscriptionFormOpen, setSubscriptionFormOpen] = useState<boolean>(false);
  const [subscriptionDraft, setSubscriptionDraft] = useState<Subscription | null>(null);
  const [subscriptionSaving, setSubscriptionSaving] = useState<boolean>(false);
  const [subscriptionError, setSubscriptionError] = useState<string>('');

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  useEffect(() => {
    const loadSubscriptions = async () => {
      setLoadingSubscriptions(true);
      try {
        const subscriptionsData = await fetchUserSubscriptions();
        setSubscriptions(
          subscriptionsData.map((item) => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            nextBillingDate: item.next_billing_date,
            logoColor: getSubscriptionBrandMeta(item.name).logoColor,
            category: item.category,
            utilizationWarning: item.utilization_warning || undefined,
          }))
        );
        setSubscriptionError('');
      } catch (err) {
        console.error('[Dashboard] Unable to load subscriptions:', err);
        setSubscriptionError('Unable to load subscriptions. Please check your connection or database setup.');
      } finally {
        setLoadingSubscriptions(false);
      }
    };

    const loadWallets = async () => {
      setLoadingWallets(true);
      try {
        const walletData = await fetchUserWallets();
        setWallets(walletData.map((w: UserWallet) => ({
          id: w.id,
          name: w.name,
          type: w.wallet_type,
          balance: Number(w.balance),
          color: w.color_gradient,
        })));
      } catch (err) {
        console.error('[Dashboard] Unable to load wallets:', err);
      } finally {
        setLoadingWallets(false);
      }
    };

    const loadTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const txData = await fetchUserTransactions(20);
        setTransactions(txData.map((t: UserTransaction) => ({
          id: t.id,
          walletName: t.wallet_name,
          categoryName: t.category_name,
          amount: Number(t.amount),
          notes: t.notes || '',
          date: new Date(t.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })));
      } catch (err) {
        console.error('[Dashboard] Unable to load transactions:', err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    loadSubscriptions();
    loadWallets();
    loadTransactions();
  }, []);

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

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDeleteSubscription = async (subscriptionId: string) => {
    setPendingDeleteId(subscriptionId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteSubscription = async () => {
    if (!pendingDeleteId) return;
    setDeleteConfirmOpen(false);
    try {
      await deleteUserSubscription(pendingDeleteId);
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== pendingDeleteId));
    } catch (err) {
      console.error('[Dashboard] delete subscription failed:', err);
      // Show error via toast instead of window.alert
      setSmsToast?.('ลบ subscription ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
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
    const monthlyAmount = item.billing_cycle === 'yearly' ? item.amount / 12
      : item.billing_cycle === 'weekly' ? item.amount * 4.33
      : item.amount;
    return sum + monthlyAmount;
  }, 0), [subscriptions]);

  const underusedSubscriptions = useMemo(() => {
    const count = subscriptions.filter((item) => item.utilizationWarning).length;
    return count > 0 ? `${count} service${count > 1 ? 's' : ''} appear${count === 1 ? 's' : ''} underused` : null;
  }, [subscriptions]);

  // ─── SMS Auto-Ingestion Sandbox State ───
  const [smsText, setSmsText] = useState<string>('');
  const [smsToast, setSmsToast] = useState<string | null>(null);

  // ─── Cancellation Assistant States ───
  const [isPlaybookOpen, setIsPlaybookOpen] = useState<boolean>(false);
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
  const [activePlaybookTab, setActivePlaybookTab] = useState<'info' | 'checklist' | 'proof' | 'history' | 'saved'>('info');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDashboardReady, setIsDashboardReady] = useState<boolean>(false);

  interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
  }

  const [cancellationChecklists, setCancellationChecklists] = useState<Record<string, ChecklistItem[]>>({});
  const [cancellationProgresses, setCancellationProgresses] = useState<Record<string, CancellationProgressType>>({});
  const [cancellationDocuments, setCancellationDocuments] = useState<CancellationDocumentType[]>([]);
  const [completedCancellationHistory, setCompletedCancellationHistory] = useState<CompletedCancellation[]>([]);
  const [timelineItems, setTimelineItems] = useState<Record<string, any[]>>({});
  const [showCountMap, setShowCountMap] = useState<Record<string, number>>({});
  const [timelineFilterType, setTimelineFilterType] = useState<'all'|'document'|'progress'|'event'>('all');
  const [timelineSearchQuery, setTimelineSearchQuery] = useState<string>('');

  // ─── Onboarding Status State ───
  const [userProfile, setUserProfile] = useState<any>(null);

  React.useEffect(() => {
    const confirmOnboarding = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsDashboardReady(true);
          return;
        }

        setCurrentUserId(user.id);
        const profile = await getProfile(user.id);
        setUserProfile(profile);
        if (!profile?.onboarding_completed_at) {
          navigate('/onboarding');
          return;
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      } finally {
        setIsDashboardReady(true);
      }
    };

    confirmOnboarding();
  }, [navigate]);

  useEffect(() => {
    const loadCompletedHistory = async () => {
      if (!currentUserId) return;
      try {
        const history = await fetchCompletedCancellationHistory(currentUserId);
        setCompletedCancellationHistory(history);
      } catch (err) {
        console.error('[Dashboard] load completed cancellation history failed:', err);
      }
    };

    loadCompletedHistory();
  }, [currentUserId]);

  const handleOpenPlaybook = async (sub: Subscription) => {
    const playbook = getCancellationPlaybook(sub.name);
    if (!playbook) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = currentUserId || user?.id;
      if (!userId) {
        setActivePlaybook(playbook);
        setActivePlaybookTab('info');
        setIsPlaybookOpen(true);
        return;
      }

      const progressData = await fetchCancellationProgress(userId, sub.id);
      if (progressData) {
        setCancellationProgresses(prev => ({
          ...prev,
          [sub.id]: progressData
        }));

        const isStep2 = progressData.currentStep >= 2;
        const isStep3 = progressData.currentStep >= 3;
        const isStep4 = progressData.completed || progressData.currentStep === 4;

        setCancellationChecklists(prev => ({
          ...prev,
          [sub.id]: [
            { id: 'chk_1', title: 'ตรวจสอบเงื่อนไขสมาชิกและภาระสัญญากับทางผู้ให้บริการ', completed: true },
            { id: 'chk_2', title: 'ติดต่อผู้ให้บริการอย่างเป็นทางการ (โทร / เว็บไซต์ / เคาน์เตอร์)', completed: isStep2 },
            { id: 'chk_3', title: 'ส่งคำขอยกเลิกหรือกดยืนยันการยุติรับบริการในระบบ', completed: isStep3 },
            { id: 'chk_4', title: 'ได้รับเอกสารยืนยันหรือ Screenshot ประวัติการแจ้งเรื่องยกเลิก', completed: isStep3 },
            { id: 'chk_5', title: 'ตรวจสอบยอดและรอบตัดเงินถัดไปในแอปพลิเคชันธนาคาร/บัตรเครดิต', completed: isStep4 }
          ]
        }));
      } else {
        const defaultItems: ChecklistItem[] = [
          { id: 'chk_1', title: 'ตรวจสอบเงื่อนไขสมาชิกและภาระสัญญากับทางผู้ให้บริการ', completed: false },
          { id: 'chk_2', title: 'ติดต่อผู้ให้บริการอย่างเป็นทางการ (โทร / เว็บไซต์ / เคาน์เตอร์)', completed: false },
          { id: 'chk_3', title: 'ส่งคำขอยกเลิกหรือกดยืนยันการยุติรับบริการในระบบ', completed: false },
          { id: 'chk_4', title: 'ได้รับเอกสารยืนยันหรือ Screenshot ประวัติการแจ้งเรื่องยกเลิก', completed: false },
          { id: 'chk_5', title: 'ตรวจสอบยอดและรอบตัดเงินถัดไปในแอปพลิเคชันธนาคาร/บัตรเครดิต', completed: false }
        ];

        setCancellationChecklists(prev => ({
          ...prev,
          [sub.id]: defaultItems
        }));

        setCancellationProgresses(prev => ({
          ...prev,
          [sub.id]: {
            subscriptionId: sub.id,
            currentStep: 1,
            completed: false
          }
        }));

        await upsertCancellationProgress(userId, sub.id, 1, false);
      }

      const docs = await fetchCancellationDocuments(userId, sub.id);
      if (docs.length > 0) {
        setCancellationDocuments(prev => {
          const filtered = prev.filter(p => p.subscriptionId !== sub.id);
          return [...filtered, ...docs];
        });
      }

      // Load combined timeline for the history tab
      try {
        const timeline = await fetchCancellationTimeline(userId, sub.id);
        setTimelineItems(prev => ({ ...prev, [sub.id]: timeline }));
      } catch (err) {
        console.error('Error loading cancellation timeline:', err);
      }
    } catch (err) {
      console.error('Error fetching cancel history:', err);
    }

    setActivePlaybook(playbook);
    setActivePlaybookTab('info');
    setIsPlaybookOpen(true);
    triggerHaptic('light');
  };

  const handleToggleChecklistItem = (subId: string, itemId: string) => {
    triggerHaptic('light');
    setCancellationChecklists(prev => {
      const items = prev[subId] || [];
      const updated = items.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      const checkedCount = updated.filter(i => i.completed).length;
      const newStep = checkedCount === 5 ? 4
        : updated.find(i => i.id === 'chk_4')?.completed ? 3
        : updated.find(i => i.id === 'chk_2')?.completed ? 2
        : 1;
      const isCompleted = checkedCount === 5;

      setCancellationProgresses(progressPrev => {
        const p = progressPrev[subId] || { subscriptionId: subId, currentStep: 1, completed: false };
        const nextProgress = {
          ...p,
          currentStep: newStep,
          completed: isCompleted
        };

        const userId = currentUserId || null;
        if (userId) {
          upsertCancellationProgress(userId, subId, newStep, isCompleted);
        }

        if (isCompleted && !p.completed) {
          triggerHaptic('success');
          setActivePlaybookTab('saved');
        }

        return {
          ...progressPrev,
          [subId]: nextProgress
        };
      });

      return {
        ...prev,
        [subId]: updated
      };
    });
  };

  /* eslint-disable react-hooks/purity */
  const handleUploadProof = async (subId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    triggerHaptic('success');
    setSmsToast(`กำลังอัปโหลดหลักฐาน: ${file.name}...`);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSmsToast('กรุณาเข้าสู่ระบบก่อนทำการอัปโหลด');
        return;
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${subId}_${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage bucket 'cancellation-proofs'
      const { error: uploadError } = await supabase.storage
        .from('cancellation-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        setSmsToast(`อัปโหลดล้มเหลว: ${uploadError.message}`);
        return;
      }

      // Retrieve public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('cancellation-proofs')
        .getPublicUrl(fileName);

      // Now insert record into 'cancellation_documents' table
      const { error: dbError } = await supabase
        .from('cancellation_documents')
        .insert({
          user_id: user.id,
          subscription_id: subId,
          file_url: publicUrl,
          uploaded_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Error saving document to database:', dbError);
      }

      const newDoc: CancellationDocumentType = {
        id: 'doc_' + Date.now(),
        subscriptionId: subId,
        fileName: file.name,
        fileUrl: publicUrl,
        uploadedAt: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCancellationDocuments(prev => [newDoc, ...prev]);
      setSmsToast(`อัปโหลดหลักฐานไปยังคลังสำเร็จ: ${file.name}`);

      // Automatically check chk_4 ("ได้รับเอกสารยืนยันแล้ว")
      setCancellationChecklists(prev => {
        const items = prev[subId] || [];
        const updated = items.map(item =>
          item.id === 'chk_4' ? { ...item, completed: true } : item
        );

        setCancellationProgresses(progressPrev => {
          const p = progressPrev[subId] || { subscriptionId: subId, currentStep: 1, completed: false };
          const checkedCount = updated.filter(i => i.completed).length;
          const newStep = checkedCount === 5 ? 4 : 3;

          const userId = currentUserId || user.id;
          if (userId) {
            upsertCancellationProgress(userId, subId, newStep, checkedCount === 5);
          }

          return {
            ...progressPrev,
            [subId]: {
              ...p,
              currentStep: newStep,
              completed: checkedCount === 5
            }
          };
        });

        return {
          ...prev,
          [subId]: updated
        };
      });

    } catch (err) {
      console.error('Error during file upload handling:', err);
      setSmsToast('เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleRemoveProof = (docId: string) => {
    triggerHaptic('light');
    setCancellationDocuments(prev => prev.filter(d => d.id !== docId));
  };
  /* eslint-enable react-hooks/purity */

  // Parse SMS text in real-time as it changes (Computed during render)
  const parsedResult = useMemo(() => {
    return smsText.trim() ? parseBankSms(smsText) : null;
  }, [smsText]);

  // Recalculate Financial Health Score dynamically (Computed during render)
  const healthScore = useMemo(() => {
    let score = 100;
    
    // 1. Budget Overspent Deductions (-15 points per overspent, -6 points near limit)
    budgets.forEach((b) => {
      const ratio = b.spent / b.limit;
      if (ratio > 1.0) {
        score -= 15;
      } else if (ratio > 0.85) {
        score -= 6;
      }
    });

    // 2. Low Balance Warning (-10 points if SCB Savings is below 5,000 THB)
    const scbWallet = wallets.find(
      (w) => w.name.toLowerCase().includes('scb') || w.name.includes('ไทยพาณิชย์')
    );
    if (scbWallet && scbWallet.balance < 5000) {
      score -= 10;
    }

    // 3. Subscription Under-utilization Warning (-8 points per warning)
    subscriptions.forEach((s) => {
      if (s.utilizationWarning) {
        score -= 8;
      }
    });

    // 4. Cancellation Savings Bonus: Add +1 point for every 200 THB saved monthly from cancelled subscriptions
    let totalMonthlySavings = 0;
    subscriptions.forEach((s) => {
      const progress = cancellationProgresses[s.id];
      if (progress && progress.completed) {
        totalMonthlySavings += s.amount;
      }
    });

    // Add bonus: +1 point per 200 THB saved (capped at +20 points max to maintain standard scoring index)
    const savingsBonus = Math.min(20, Math.floor(totalMonthlySavings / 200));
    score += savingsBonus;

    // Clamp score between 40 and 100
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

  // Notification settings (persisted in localStorage)
  const [notificationThreshold, setNotificationThreshold] = useState<number>(() => {
    const v = localStorage.getItem('notif_threshold_v1');
    return v ? parseInt(v, 10) : 3;
  });
  const [urgentBadgeDays, setUrgentBadgeDays] = useState<number>(() => {
    const v = localStorage.getItem('urgent_badge_days_v1');
    return v ? parseInt(v, 10) : 7;
  });

  // load server-side settings if available
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_settings')
          .select('notif_threshold, urgent_badge_days')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          if (data.notif_threshold !== undefined && data.notif_threshold !== null) setNotificationThreshold(Number(data.notif_threshold));
          if (data.urgent_badge_days !== undefined && data.urgent_badge_days !== null) setUrgentBadgeDays(Number(data.urgent_badge_days));
        } else {
          // fallback to localStorage already handled by initializers
        }
      } catch (err) {
        console.error('Failed to load notification settings from server:', err);
      }
    };
    loadSettings();
  }, []);

  // Supabase Realtime: subscribe to user_events inserts for current user
  useEffect(() => {
    let channel: any = null;
    const start = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        channel = supabase.channel(`user-events-${user.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_events', filter: `user_id=eq.${user.id}` }, (payload: any) => {
            const rec = (payload?.record || payload?.new || payload) as any;
            try {
              if (Notification && Notification.permission === 'granted') {
                const title = rec?.event_type || 'New notification';
                const body = rec?.event_data?.message || rec?.event_data?.summary || 'You have a new event';
                new Notification(title, { body });
              }
            } catch (e) {
              console.error('Realtime notification error:', e);
            }
          })
          .subscribe();
      } catch (err) {
        console.error('Failed to subscribe to realtime events:', err);
      }
    };
    start();

    return () => {
      try {
        if (channel) channel.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [settingsThreshold, setSettingsThreshold] = useState(notificationThreshold);
  const [settingsUrgent, setSettingsUrgent] = useState(urgentBadgeDays);

  const openDeadlineSettings = () => {
    setSettingsThreshold(notificationThreshold);
    setSettingsUrgent(urgentBadgeDays);
    setSettingsSheetOpen(true);
  };

  const saveDeadlineSettings = () => {
    const nv = Math.max(0, settingsThreshold);
    const uv = Math.max(0, settingsUrgent);
    setNotificationThreshold(nv);
    setUrgentBadgeDays(uv);
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

  // Trigger browser notifications (once per subscription) when close to deadline
  useEffect(() => {
    if (!('Notification' in window)) return;

    const notifiedRaw = localStorage.getItem('notifiedDeadlines_v1');
    const notified = notifiedRaw ? JSON.parse(notifiedRaw) as string[] : [];
    let changed = false;

    cancellationDeadlineAlerts.forEach((a) => {
      if (a.daysLeft <= notificationThreshold && !notified.includes(a.subscriptionId)) {
        // Try to notify
        if (Notification.permission === 'granted') {
          new Notification(`Action required: ${a.name}`, {
            body: `Remaining ${a.daysLeft} day(s) to notify cancellation (deadline: ${a.deadline.toLocaleDateString()})`,
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification(`Action required: ${a.name}`, {
                body: `Remaining ${a.daysLeft} day(s) to notify cancellation`,
              });
            }
          });
        }

        notified.push(a.subscriptionId);
        changed = true;
      }
    });

    if (changed) localStorage.setItem('notifiedDeadlines_v1', JSON.stringify(notified));
  }, [cancellationDeadlineAlerts]);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (smsToast) {
      const t = setTimeout(() => setSmsToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [smsToast]);

  const handleConfirmSmsTransaction = () => {
    if (!parsedResult) return;

    const { amount, categoryName, notes, bankName } = parsedResult;

    // Resolve actual wallet UUID from bank name
    const resolvedWalletId = resolveWalletIdByBankName(bankName, wallets);
    const activeWallet = wallets.find((w) => w.id === resolvedWalletId);

    // 1. Deduct from wallet balance (optimistic update)
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

    // 2. Add to transaction history list (optimistic update)
    const newTx: Transaction = {
      id: Date.now().toString(),
      walletName: activeWallet ? activeWallet.name : bankName,
      categoryName,
      amount,
      notes: notes,
      date: 'Today',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // 3. Persist to database (async, non-blocking)
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

    // Reset SMS Sandbox
    setSmsText('');
    setSmsToast(`นำเข้าข้อมูลสำเร็จ! หักยอด ${amount.toLocaleString()} THB จากบัญชี ${activeWallet ? activeWallet.name : bankName}`);
  };

  // ─── Transaction Logger Sheet UI State ───
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [inputAmount, setInputAmount] = useState<string>('0');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');

  // Set default wallet once wallets are loaded from DB
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      const defaultWallet = wallets.find((w) => w.type === 'bank') || wallets[0];
      setSelectedWalletId(defaultWallet.id);
    }
  }, [wallets, selectedWalletId]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('Food & Dining');
  const [inputNotes, setInputNotes] = useState<string>('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUserEmail(session.user.email ?? '');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // ─── Transaction Logger Keypad Action ───
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
        if (prev.length > 8) return prev; // cap length
        return prev + val;
      });
    }
  };

  const handleSaveTransaction = () => {
    const parsedAmount = parseFloat(inputAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    // Deduct from wallet balance (optimistic update)
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

    // Add to transaction list (optimistic update)
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

    // Persist to database (async, non-blocking)
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

    // Reset Form & Close
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
      onClick: () => {}, // Already on Dashboard
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
    { icon: HelpCircle, label: 'Help', onClick: () => window.open('mailto:support@dailystack.app', '_blank') },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
  ];

  const categories = [
    { name: 'Food & Dining', icon: Utensils, bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
    { name: 'Transportation', icon: MapPin, bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    { name: 'Specialty Coffee', icon: Coffee, bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
    { name: 'Active & Fitness', icon: Dumbbell, bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' }
  ];

  if (!isDashboardReady) {
    return (
      <div className="min-h-[100dvh] bg-dark-bg text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="mt-4 text-sm text-white/70">Preparing your DailyStack experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-dark-bg text-white font-sans flex flex-col md:flex-row overflow-x-hidden relative">

      {/* ── Desktop Sidebar ────────────────────────────────────────────── */}
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
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 text-sm font-medium min-h-[44px]
            text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/8 rounded-xl transition-all mt-2"
        >
          <LogOut size={18} strokeWidth={1.8} /> Sign Out
        </button>
      </aside>

      {/* ── Main Scrollable Area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-[#0B0F0A]/90 backdrop-blur-xl border-b border-white/5
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
            {/* Quick entry plus button — 44px touch target */}
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-10 px-4 md:px-10 py-5 md:py-8 space-y-8 md:space-y-10">
          
          {/* Header Mobile greeting */}
          <div className="md:hidden">
            <h2 className="text-lg font-black text-[#000000] flex items-center gap-2">
              Welcome Back <Sparkles size={18} className="text-[#5B7A00]" />
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-kanit font-semibold">
              ภาพรวมสถานะสุขภาพทางการเงินส่วนบุคคล
            </p>
          </div>

          {/* ── Onboarding Status Card ─────────────────────────────────── */}
          {userProfile && (
            <OnboardingStatusCard
              completionPercentage={userProfile.onboarding_completed_at ? 100 : 75}
              interestCount={userProfile.interest_tags?.length || 0}
              budgetCount={userProfile.budgets?.length || 0}
              isComplete={!!userProfile.onboarding_completed_at}
              onEditClick={() => navigate('/onboarding')}
            />
          )}

          {/* ── Top Level Rollups Grid ─────────────────────────────────── */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Total Liquid Capital (Solid Pilo Neon Lime Card) */}
            <div className="bg-primary border-0 shadow-lg rounded-3xl p-5 relative overflow-hidden group text-[#000000]">
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

            {/* 2. Budget Allocation progress (Solid Pilo Charcoal Card) */}
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

            {/* 3. Financial Health Score Widget (Solid Pilo White Card) */}
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
              {/* Score ring */}
              <div className="relative w-16 h-16 rounded-full bg-[#000000] flex items-center justify-center shrink-0 shadow-md">
                <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin-slow pointer-events-none" style={{ transform: 'rotate(78deg)' }} />
                <span className="text-lg font-black text-primary font-mono">{healthScore}</span>
              </div>
            </div>
          </section>

          {/* ── Active Wallets Carousel ─────────────────────────────────── */}
          <section>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 font-kanit">
              กระเป๋าเงินและบัญชีสะสม (Swipe to explore)
            </p>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4
              md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-4 md:gap-4
              snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
              {wallets.map((w) => (
                <div key={w.id} className="snap-start shrink-0 w-[180px] md:w-auto bg-white border-0 shadow-lg
                  rounded-2xl p-4 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] transition-spring cursor-pointer relative overflow-hidden group text-[#000000]">
                  {/* Subtle indicator bar */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${w.color}`} />
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{w.type}</p>
                  <h4 className="font-black text-[#000000] text-sm truncate">{w.name}</h4>
                  <p className="text-xl font-extrabold text-[#000000] mt-3 font-mono">
                    {w.balance.toLocaleString()}
                    <span className="text-[10px] text-gray-500 font-normal ml-1">THB</span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 04. SMS Transaction Auto-Logger Sandbox ─────────────────── */}
          <section className="bg-white border-0 shadow-lg rounded-2xl p-5 relative overflow-hidden group text-[#000000] space-y-4">
            <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest font-mono text-black/15">04</span>
            
            <div className="flex justify-between items-center">
              <h3 className="font-black text-[#000000] text-sm flex items-center gap-2">
                <MessageSquare size={16} className="text-[#000000]" /> 
                SMS Transaction Auto-Logger <span className="text-[10px] text-gray-400 font-bold">(Sandbox Beta)</span>
              </h3>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase tracking-widest">
                Real-time Parser
              </span>
            </div>

            {smsToast && (
              <div className="p-3 bg-primary text-[#000000] rounded-xl text-xs font-black flex items-center gap-2 shadow-md font-kanit">
                <Check size={16} />
                {smsToast}
              </div>
            )}

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-kanit">
                จำลองข้อความ SMS จากธนาคาร:
              </p>
              <div className="flex flex-wrap gap-2">
                  <button
                  onClick={() => setSmsText('SCB: จ่ายบัตร x-8829 จำนวน 250.00 บาท ที่ Starbucks')}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-black/5 rounded-full text-xs font-bold font-mono transition-all"
                >
                  <span className="inline-flex items-center gap-1"><Zap size={12} className="text-amber-500" /> SCB (Starbucks)</span>
                </button>
                  <button
                  onClick={() => setSmsText('KBank: โอนเงิน 120.00 บาท ไปยัง นายสมชาย (ร้านอาหาร)')}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-black/5 rounded-full text-xs font-bold font-mono transition-all"
                >
                  <span className="inline-flex items-center gap-1"><Zap size={12} className="text-amber-500" /> KBank (Food)</span>
                </button>
                  <button
                  onClick={() => setSmsText('UOB: รูดบัตร x-1234 จำนวน 1,200.00 บาท ที่ Tops Supermarket')}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-black/5 rounded-full text-xs font-bold font-mono transition-all"
                >
                  <span className="inline-flex items-center gap-1"><Zap size={12} className="text-amber-500" /> UOB (Tops)</span>
                </button>
                {smsText && (
                  <button
                    onClick={() => { setSmsText(''); }}
                    className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200/20 rounded-full text-xs font-bold font-mono transition-all ml-auto"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="relative">
              <textarea
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="วางข้อความเเจ้งยอดเงิน SMS ของคุณตรงนี้ เช่น 'SCB: จ่ายบัตร x-8829 จำนวน 250.00 บาท ที่ Starbucks'..."
                className="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs focus:border-[#C7FF2E] focus:bg-white outline-none font-semibold font-kanit min-h-[64px]"
              />
            </div>

            {/* Parsed Output Preview */}
            {parsedResult ? (
              <div className="p-4 bg-[#000000] text-white rounded-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary text-black text-[9px] font-black tracking-wider font-mono">
                  <Sparkles size={10} />
                  PARSED SUCCESS
                </div>
                
                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">สรุปผลการวิเคราะห์ข้อมูล</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">ธนาคารหลัก</span>
                    <span className="text-xs font-black font-mono text-white">{parsedResult.bankName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">หักยอดชำระ</span>
                    <span className="text-xs font-black font-mono text-primary">-{parsedResult.amount.toLocaleString()} THB</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">หมวดหมู่</span>
                    <span className="text-xs font-black font-kanit text-white">{parsedResult.categoryName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase">ร้านค้า/ผู้รับ</span>
                    <span className="text-xs font-black font-kanit text-white truncate block">{parsedResult.notes}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 text-[10px] text-gray-400 font-kanit flex justify-between items-center">
                  <span>บัญชีปลายทาง: <strong className="text-white font-bold">{(() => { const wid = resolveWalletIdByBankName(parsedResult.bankName, wallets); return wallets.find(w => w.id === wid)?.name || parsedResult.bankName; })()}</strong></span>
                  <span>งวดงบประมาณ: <strong className="text-white font-bold">{parsedResult.categoryName}</strong></span>
                </div>

                <button
                  onClick={handleConfirmSmsTransaction}
                  className="w-full bg-primary hover:bg-primary/95 text-[#000000] font-black text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] mt-2 shadow-lg"
                >
                  <Check size={14} strokeWidth={3} />
                  ยืนยันบันทึกธุรกรรมด่วน (Confirm & Log)
                </button>
              </div>
            ) : (
              smsText && (
                <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200/20 rounded-xl text-center text-xs font-semibold font-kanit flex items-center justify-center gap-2">
                  <AlertTriangle size={12} className="shrink-0" /> ยังไม่สามารถวิเคราะห์ข้อมูลได้ กรุณาลองปรับเเต่งข้อความหรือใช้ Preset ตัวอย่าง
                </div>
              )
            )}
          </section>

          {/* ── Upcoming Subscription Stack & Utilization Warnings ─────── */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Stack */}
            <div className="bg-white border-0 shadow-lg rounded-2xl p-5 space-y-4 text-[#000000]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-[#000000]" />
                  <h3 className="font-black text-[#000000] text-sm">Active Subscription Stack</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#000000] text-primary text-[10px] font-black rounded-full font-mono">
                    {subscriptions.length} items
                  </span>
                  <button
                    onClick={() => openSubscriptionForm()}
                    className="px-3 py-2 bg-primary text-[#000000] rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-primary/95 transition"
                  >
                    + Add Subscription
                  </button>
                </div>
              </div>

                {/* Pre-renewal Alert Push */}
              {nextRenewalSubscription ? (
                <div className="p-3 bg-[#000000] rounded-xl flex items-start gap-3 text-white shadow-md">
                  <AlertTriangle size={18} className="text-primary shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-xs">
                    <p className="font-black text-white leading-snug">แจ้งเตือนตัดรอบบิลถัดไป ({nextRenewalSubscription.name})</p>
                    <p className="text-gray-300 mt-1 font-kanit">
                      จะทำการหักเงิน {nextRenewalSubscription.amount} บาท ในวันที่ {formatSubscriptionDate(nextRenewalSubscription.nextBillingDate)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl flex items-start gap-3 text-[#000000] shadow-sm">
                  <ShieldAlert size={18} className="text-gray-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-600">
                    ยังไม่มี subscription ที่จะตัดบิลในเร็ว ๆ นี้
                  </div>
                </div>
              )}

              {cancellationDeadlineAlerts.length > 0 && (
                <div className="space-y-2 mt-3">
                  {cancellationDeadlineAlerts.map((alert) => (
                    <div key={alert.subscriptionId} className="p-3 bg-amber-50 border border-amber-200 rounded-3xl text-amber-900 text-xs">
                      <p className="font-black flex items-center gap-1"><AlertTriangle size={12} className="shrink-0" /> ต้องแจ้งยกเลิก {alert.name} ภายใน {alert.deadline.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="mt-1 text-[11px] text-amber-900/90">
                        เหลือเวลาอีก {alert.daysLeft} วันก่อนวันกำหนดแจ้งยกเลิก
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick settings for deadline thresholds */}
              <div className="flex justify-end mt-2">
                <button onClick={editDeadlineSettings} className="text-[11px] text-gray-500 hover:underline">แก้ไขการแจ้งเตือนวันกำหนด</button>
              </div>

              {/* Visualized subscription deck / list */}
              {loadingSubscriptions ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-24 rounded-3xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-3xl bg-[#F7F7F7] border border-black/5 text-[#000000] shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500">Total Recurring Spend</p>
                      <p className="mt-2 text-2xl font-black text-[#000000]">{totalSubscriptionSpend.toLocaleString()} THB</p>
                      <p className="mt-2 text-[10px] text-gray-500">ค่าใช้จ่าย subscription ต่อเดือนทั้งหมด</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-[#F7F7F7] border border-black/5 text-[#000000] shadow-sm">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500">Underused Services</p>
                      {underusedSubscriptions ? (
                        <>
                          <p className="mt-2 text-2xl font-black text-[#000000]">{underusedSubscriptions}</p>
                          <p className="mt-2 text-[10px] text-gray-500">Start tracking to see real savings</p>
                        </>
                      ) : (
                        <>
                          <p className="mt-2 text-2xl font-black text-[#000000]">0</p>
                          <p className="mt-2 text-[10px] text-gray-500">All services are actively used</p>
                        </>
                      )}
                    </div>
                  </div>

                  {subscriptions.length === 0 ? (
                    <div className="p-6 border border-dashed border-gray-200 rounded-3xl text-center text-sm text-gray-500">
                      ยังไม่มี subscription รายเดือนในระบบ
                      <div className="mt-3 text-xs text-gray-400">กดปุ่ม Add Subscription เพื่อเริ่มบันทึกบริการแรก</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {subscriptions.map((s) => (
                        <div key={s.id} className="p-3.5 bg-gray-50 border border-black/5 rounded-xl transition-all hover:border-black/20">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <SubscriptionBrandIcon name={s.name} logoColor={s.logoColor} />
                              <div>
                                <h4 className="text-sm font-black text-[#000000]">{s.name}</h4>
                                <p className="text-[10px] text-gray-500 mt-1">ตัดรอบบิลถัดไป: {formatSubscriptionDate(s.nextBillingDate)}</p>
                                <p className="text-[10px] text-gray-500 mt-1">หมวดหมู่: {s.category}</p>
                              </div>
                            </div>

                            <div className="flex flex-col items-start sm:items-end gap-2">
                              <span className="text-xs font-black text-[#000000] font-mono">{s.amount} THB</span>
                              {cancellationDeadlineMap.has(s.id) && (() => {
                                const d = cancellationDeadlineMap.get(s.id)?.daysLeft ?? 0;
                                if (d <= urgentBadgeDays) {
                                  return (
                                    <span className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white text-[12px] font-black">
                                      {d}
                                    </span>
                                  );
                                }
                                return (
                                  <span className="ml-2 inline-flex items-center gap-2 px-2 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-black">
                                    <AlertTriangle size={12} /> {d} วัน
                                  </span>
                                );
                              })()}
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openSubscriptionForm(s)}
                                  className="px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-gray-100 rounded-full text-[#000000] hover:bg-gray-200 transition"
                                >Edit</button>
                                <button
                                  onClick={() => handleDeleteSubscription(s.id)}
                                  className="px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition"
                                >Delete</button>
                              </div>
                            </div>
                          </div>

                          {s.utilizationWarning && (
                            <div className="mt-3 pt-3 border-t border-black/5 text-[10px] text-amber-500 font-kanit font-black flex items-start gap-1.5">
                              <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                              <span>{s.utilizationWarning}</span>
                            </div>
                          )}

                          {getCancellationPlaybook(s.name) && (
                            <button
                              onClick={() => handleOpenPlaybook(s)}
                              className="mt-3 w-full py-2.5 bg-[#000000] hover:bg-[#000000]/95 text-primary border border-primary/20 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 font-sans"
                            >
                              <Sparkles size={11} strokeWidth={2.5} />
                              ยกเลิกสมาชิก (Cancel)
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Budget Planners & Dynamic Gauges */}
            <div className="bg-white border-0 shadow-lg rounded-2xl p-5 space-y-4 text-[#000000]">
              <h3 className="font-black text-[#000000] text-sm flex items-center gap-2">
                <Compass size={16} className="text-[#000000]" /> Category Budgets ({new Date().toLocaleDateString('en-US', { month: 'long' })})
              </h3>
              
              <div className="space-y-4">
                {overBudgetCategories.length > 0 || nearBudgetCategories.length > 0 ? (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-2">
                    {overBudgetCategories.length > 0 && (
                      <p className="font-black flex items-center gap-1"><AlertTriangle size={12} className="shrink-0" /> คุณกำลังใช้งบเกินใน {overBudgetCategories.length} หมวดหมู่: {overBudgetCategories.map((b) => b.categoryName).join(', ')}</p>
                    )}
                    {nearBudgetCategories.length > 0 && (
                      <p className="font-semibold flex items-center gap-1"><Info size={12} className="shrink-0" /> งบประมาณใกล้เต็มใน {nearBudgetCategories.length} หมวดหมู่: {nearBudgetCategories.map((b) => b.categoryName).join(', ')}</p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-green-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                    <Sparkles size={14} className="inline mr-1" />งบของคุณยังอยู่ในระดับปลอดภัย ขอบคุณที่ติดตามการใช้จ่ายอย่างใกล้ชิด
                  </div>
                )}

                {budgets.map((b) => {
                  const percent = Math.min(100, Math.round((b.spent / b.limit) * 100));
                  const isHigh = percent > 85;
                  
                  // Interpolate Hue smoothly: Lime (70deg) down to Red (0deg)
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

          {/* ── Recent Transaction History ─────────────────────────────── */}
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

      {/* ── Quick Expense Logger Bottom Sheet ─────────────────────────── */}
      {isLogOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0" onClick={() => setIsLogOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white border-t border-black/5 rounded-t-3xl shadow-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#000000] animate-sheet-spring">
            
            {/* Pull Bar */}
            <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-5" />

            {/* Header info */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-[#000000] text-base">บันทึกธุรกรรมการเงิน</h3>
              <button
                onClick={() => setIsLogOpen(false)}
                className="text-xs text-white bg-[#000000] hover:bg-[#000000]/90 px-3 py-1.5 rounded-full transition-all"
              >
                Close
              </button>
            </div>

            {/* Numpad Input Field */}
            <div className="bg-[#000000] rounded-2xl p-4 text-center mb-5 relative shadow-inner">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-kanit font-bold">
                จำนวนเงินที่ต้องการบันทึก
              </p>
              <p className="text-4xl font-extrabold text-primary font-mono tracking-tight">
                {(isNaN(parseFloat(inputAmount)) ? 0 : parseFloat(inputAmount)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                <span className="text-xs text-primary/70 font-normal ml-2">THB</span>
              </p>
            </div>

            {/* Wallet Selection Grid */}
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

            {/* Category Selection Grid */}
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

            {/* Notes Input */}
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

            {/* Custom Numeric Keypad */}
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

            {/* Save Action */}
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
              <div className="mb-4 p-3 rounded-2xl bg-amber-50/10 border border-amber-500/30 text-amber-500 text-sm">
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

      {/* ── Cancellation Assistant Bottom Sheet Modal ─────────────────── */}
      {isPlaybookOpen && activePlaybook && (() => {
        const matchedSub = subscriptions.find(s => s.name === activePlaybook.provider_name);
        const subId = matchedSub?.id || 'default';
        const subAmount = matchedSub?.amount || 0;

        const checklist = cancellationChecklists[subId] || [];
        const progress = cancellationProgresses[subId] || { subscriptionId: subId, currentStep: 1, completed: false };
        const docs = cancellationDocuments.filter(d => d.subscriptionId === subId);

        const deadline = matchedSub && activePlaybook
          ? getCancellationDeadlineFromBilling(matchedSub.nextBillingDate, activePlaybook.notice_period_days)
          : null;
        const remainingDays = deadline ? getDaysUntil(deadline) : null;
        const deadlineDate = deadline
          ? deadline.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'ไม่ระบุวัน';

        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="absolute inset-0" onClick={() => setIsPlaybookOpen(false)} />

            <div className="relative w-full max-w-lg bg-white border-t border-black/5 rounded-t-3xl shadow-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#000000] animate-sheet-spring flex flex-col gap-4">

              {/* Pull Bar */}
              <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-1 shrink-0" />

              {/* Header Info */}
              <div className="flex justify-between items-start shrink-0">
                <div>
                  <span className="px-2 py-0.5 bg-[#000000] text-primary text-[9px] font-black rounded uppercase tracking-widest font-mono">
                    Cancellation Assistant
                  </span>
                  <h3 className="font-black text-[#000000] text-lg mt-1 font-sans">
                    {activePlaybook.provider_name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsPlaybookOpen(false)}
                  className="text-xs text-white bg-[#000000] hover:bg-[#000000]/90 px-3 py-1.5 rounded-full transition-all font-bold"
                >
                  Close
                </button>
              </div>

              {/* Cancellation Deadline Reminder Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3 shrink-0">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs font-kanit">
                  <p className="font-black text-amber-800 leading-snug">
                    กำหนดส่งคำร้องยกเลิกเพื่อไม่ให้ตัดรอบถัดไป
                  </p>
                  <p className="text-amber-700 mt-0.5 font-semibold">
                    {activePlaybook?.notice_period_days === 0 ? (
                      <>ยกเลิกได้ทันทีก่อนรอบบิลถัดไป <strong className="font-extrabold text-amber-900">{deadlineDate}</strong></>
                    ) : deadline ? (
                      <>ต้องแจ้งยกเลิกก่อน <strong className="font-extrabold text-amber-900">{deadlineDate}</strong> (เหลือเวลาอีก <strong className="font-extrabold text-amber-900 text-sm font-mono">{remainingDays}</strong> วัน)</>
                    ) : (
                      <>ยังไม่พบวันกำหนดยกเลิกที่ชัดเจน</>
                    )}
                  </p>
                </div>
              </div>

              {/* Tab Selector buttons */}
              <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 gap-1">
                {(['info', 'checklist', 'proof', 'history', 'saved'] as const).map((tab) => {
                  let label = '';
                  if (tab === 'info') label = 'สิ่งที่ต้องทำ';
                  if (tab === 'checklist') label = 'Checklist';
                  if (tab === 'proof') label = 'Proof Vault';
                  if (tab === 'history') label = 'ประวัติ';
                  if (tab === 'saved') label = 'ประหยัดได้';

                  const isSelected = activePlaybookTab === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        triggerHaptic('light');
                        setActivePlaybookTab(tab);
                      }}
                      className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all font-kanit ${
                        isSelected
                          ? 'bg-[#000000] text-primary shadow-sm'
                          : 'text-gray-500 hover:text-black'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[50vh] pr-1">

                {/* Tab 1: สิ่งที่ต้องทำ (Info) */}
                {activePlaybookTab === 'info' && (
                  <div className="space-y-4 font-kanit">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">ช่องทางการยกเลิกสมาชิก</span>
                        <p className="text-xs font-black text-black mt-0.5">{activePlaybook.cancellation_method}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">ต้องแจ้งล่วงหน้า</span>
                          <p className="text-xs font-black text-black mt-0.5">{activePlaybook.notice_period_days === 0 ? 'ยกเลิกได้ทันที' : `${activePlaybook.notice_period_days} วัน`}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">ระยะเวลาดำเนินการ</span>
                          <p className="text-xs font-black text-black mt-0.5">{activePlaybook.estimated_duration}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">เอกสารที่ต้องใช้แสดง</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {activePlaybook.required_documents.map((doc, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-700 border border-black/5">
                              <FileText size={12} className="text-gray-500" /> {doc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">เงื่อนไขค่าธรรมเนียมและค่าปรับ</span>
                        <p className="text-xs font-semibold text-amber-500 bg-amber-50/10 border border-amber-500/30 rounded-xl p-3 mt-1 leading-relaxed flex items-start gap-1.5">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {activePlaybook.penalty_information}
                        </p>
                      </div>

                      <div className="border-t border-black/5 pt-3">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-1.5">ข้อมูลการติดต่อผู้ให้บริการ</span>
                        <div className="bg-gray-50 border border-black/5 rounded-xl p-3 space-y-1.5 text-[11px] font-semibold text-gray-700">
                          <p><strong className="text-black">ช่องทาง:</strong> {activePlaybook.contact_information.channel}</p>
                          <p><strong className="text-black">รายละเอียด:</strong> {activePlaybook.contact_information.details}</p>
                          {activePlaybook.contact_information.phone && (
                            <p><strong className="text-black">เบอร์ติดต่อ:</strong> {activePlaybook.contact_information.phone}</p>
                          )}
                          {activePlaybook.contact_information.hours && (
                            <p><strong className="text-black">เวลาทำการ:</strong> {activePlaybook.contact_information.hours}</p>
                          )}
                          {activePlaybook.contact_information.url && (
                            <a
                              href={activePlaybook.contact_information.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-black text-black bg-[#C7FF2E] px-2.5 py-1.5 rounded-lg border border-black/10 mt-1 shadow-sm uppercase tracking-wider"
                            >
                              ไปยังเว็บไซต์ผู้ให้บริการ ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Checklist & Progress Tracker */}
                {activePlaybookTab === 'checklist' && (
                  <div className="space-y-5 font-kanit">

                    {/* Cancellation Progress Tracker with Enhanced Visual Clarity */}
                    <CancellationStepTracker
                      currentStep={progress.currentStep - 1}
                      totalSteps={4}
                      stepLabels={['Review Account', 'Contact Provider', 'Confirm Cancellation', 'Complete']}
                      stepDescriptions={[
                        'Review your account terms and conditions',
                        'Get in touch with the provider officially',
                        'Confirm cancellation in their system',
                        'Cancellation successfully processed',
                      ]}
                      completedSteps={Array.from({ length: Math.max(0, progress.currentStep - 1) }, (_, i) => i)}
                    />

                    {/* Cancellation Checklist */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                        ขั้นตอนดำเนินการของท่าน (Interactive Checklist)
                      </p>

                      <div className="space-y-1.5">
                        {checklist.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleToggleChecklistItem(subId, item.id)}
                            className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                              item.completed
                                ? 'bg-gray-50 border-black/10 text-gray-500 line-through'
                                : 'bg-white border-black/5 hover:border-black/20 text-black font-semibold'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                              item.completed
                                ? 'bg-[#000000] border-[#000000] text-primary'
                                : 'bg-white border-black/20 text-transparent'
                            }`}>
                              {item.completed && <Check size={12} strokeWidth={4} />}
                            </div>
                            <span className="text-xs leading-snug">{item.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* Tab 3: Proof Vault */}
                {activePlaybookTab === 'proof' && (
                  <div className="space-y-4 font-kanit">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                      คลังหลักฐานเพื่อความปลอดภัย (Proof Vault)
                    </p>

                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                      เพื่อลดความเสี่ยงจากการแอบอ้างตัดเงินซ้ำซ้อนหลังบอกเลิกบริการ ท่านสามารถอัปโหลดใบเสร็จ หนังสือยกเลิก หรือ Screenshot ข้อความโต้ตอบไว้เป็นหลักฐานที่นี่ได้
                    </p>

                    {/* File Upload Zone */}
                    <div className="border-2 border-dashed border-black/10 hover:border-black/30 bg-gray-50 rounded-2xl p-5 text-center relative transition-all group">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleUploadProof(subId, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="space-y-1.5 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-spring">
                          <Plus size={20} strokeWidth={2.5} className="text-black" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-black">กดเลือกไฟล์เพื่ออัปโหลดหลักฐาน</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">รองรับรูปภาพ ใบรับรองแพทย์ และไฟล์เอกสารยืนยัน</p>
                        </div>
                      </div>
                    </div>

                    {/* Grid Preview List */}
                    {docs.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {docs.map((doc) => (
                          <div key={doc.id} className="bg-gray-50 border border-black/5 rounded-xl p-2.5 relative flex flex-col justify-between gap-2 overflow-hidden shadow-sm">
                            <button
                              onClick={() => handleRemoveProof(doc.id)}
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black text-white hover:bg-black/90 flex items-center justify-center text-[10px] font-bold z-10 active:scale-90 transition-all cursor-pointer"
                              title="ลบหลักฐาน"
                            >
                              ✕
                            </button>

                            <div className="w-full h-24 bg-black/5 rounded-lg flex items-center justify-center overflow-hidden border border-black/5 relative">
                              {doc.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img src={doc.fileUrl} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <FileText size={20} className="text-gray-400" />
                              )}
                            </div>

                            <div className="min-w-0 pr-4">
                              <p className="text-[10px] font-black text-black truncate" title={doc.fileName}>
                                {doc.fileName}
                              </p>
                              <p className="text-[8px] text-gray-400 font-semibold font-mono mt-0.5">
                                อัปเมื่อ: {doc.uploadedAt}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-400 bg-gray-50/50 border border-black/5 border-dashed rounded-2xl font-semibold">
                        📭 ยังไม่มีการอัปโหลดเอกสารหลักฐานใดๆ ในตู้เซฟนี้
                      </div>
                    )}

                  </div>
                )}

                {/* Tab: History Timeline */}
                {activePlaybookTab === 'history' && (
                  <div className="space-y-4 font-kanit">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">ประวัติการยกเลิก</p>

                    <div>
                      <h4 className="text-sm font-black text-black mb-2">Timeline</h4>
                          <div className="flex items-center gap-3 mb-3">
                            <input
                              placeholder="ค้นหาประวัติ (ค้นหาไทเทิล/คำอธิบาย)"
                              className="timeline-search px-3 py-2 rounded-xl border border-black/5 text-sm flex-1"
                              value={timelineSearchQuery}
                              onChange={(e) => setTimelineSearchQuery(e.target.value)}
                            />
                            <select value={timelineFilterType} onChange={(e) => setTimelineFilterType(e.target.value as any)} className="px-3 py-2 rounded-xl border border-black/5 text-sm">
                              <option value="all">All</option>
                              <option value="document">Document</option>
                              <option value="progress">Progress</option>
                              <option value="event">Event</option>
                            </select>
                          </div>
                      {(() => {
                        const items = (timelineItems[subId] || []) as any[];
                        if (!items || items.length === 0) {
                          return <div className="text-center py-6 text-xs text-gray-400">ยังไม่มีกิจกรรมย้อนหลังสำหรับบริการนี้</div>;
                        }
                        // Pagination / show-more
                        const PAGE_SIZE = 8;
                        const total = items.length;
                        const shown = (showCountMap[subId] || PAGE_SIZE);

                        // Flatten and sort by timestamp desc
                        const flat = items.slice().sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

                        // Apply type filter and search query
                        const filtered = flat.filter((t) => {
                          if (timelineFilterType !== 'all' && t.type !== timelineFilterType) return false;
                          if (!timelineSearchQuery) return true;
                          const q = timelineSearchQuery.trim().toLowerCase();
                          const title = String(prettifyTitle(t)).toLowerCase();
                          const details = String(renderDetails(t) || '').toLowerCase();
                          return title.includes(q) || details.includes(q);
                        });

                        const visible = filtered.slice(0, shown);

                        // Helper for friendly labels
                        const formatLabel = (iso: string) => {
                          const d = new Date(iso);
                          const today = new Date();
                          const y = new Date(); y.setDate(today.getDate() - 1);
                          const isToday = d.toDateString() === today.toDateString();
                          const isYesterday = d.toDateString() === y.toDateString();
                          if (isToday) return 'วันนี้';
                          if (isYesterday) return 'เมื่อวานนี้';
                          return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
                        };

                        // group visible items by date key (YYYY-MM-DD)
                        const groups: Record<string, any[]> = {};
                        visible.forEach(it => {
                          const key = new Date(it.timestamp).toISOString().slice(0,10);
                          if (!groups[key]) groups[key] = [];
                          groups[key].push(it);
                        });

                        const dates = Object.keys(groups).sort((a,b) => +new Date(b) - +new Date(a));

                        const prettifyTitle = (t: any) => {
                          if (t.type === 'document') return 'อัปโหลดหลักฐาน';
                          if (t.type === 'progress') return t.title || 'Progress update';
                          // event
                          const raw = String(t.title || 'Event');
                          return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        };

                        const renderDetails = (t: any) => {
                          if (!t.details) return null;
                          try {
                            const parsed = JSON.parse(t.details);
                            if (t.type === 'event') {
                              if (parsed.subscriptionId || parsed.subscription_id) {
                                return `Subscription: ${parsed.subscriptionId || parsed.subscription_id}`;
                              }
                              if (parsed.amount) return `Amount: ${parsed.amount}`;
                              return JSON.stringify(parsed);
                            }
                            return String(t.details).slice(0, 200);
                          } catch (e) {
                            return String(t.details).slice(0, 200);
                          }
                        };

                        return (
                          <div className="space-y-3">
                            {dates.map(date => (
                              <div key={date} className="space-y-2">
                                <div className="text-[12px] font-black text-gray-600">{formatLabel(groups[date][0].timestamp)}</div>
                                <div className="space-y-2">
                                  {groups[date].map((t: any, idx: number) => (
                                    <div key={t.id}
                                      className="p-3 rounded-xl bg-gray-50 border border-black/5 flex items-start gap-3 animate-timeline-item"
                                      style={{ animationDelay: `${idx * 70}ms` }}
                                    >
                                      <div className="shrink-0 mt-1 text-gray-700">
                                        {t.type === 'document' ? (
                                          <DocumentIcon className="w-6 h-6 text-gray-700" />
                                        ) : t.type === 'progress' ? (
                                          <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                                        ) : (
                                          <ChatIcon className="w-6 h-6 text-gray-600" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-black truncate">{prettifyTitle(t)}</p>
                                        {t.type === 'document' && t.details && (
                                          <p className="text-[11px] mt-1">
                                            <a href={t.details} target="_blank" rel="noreferrer" className="text-primary underline">เปิดเอกสาร</a>
                                          </p>
                                        )}
                                        {t.type !== 'document' && t.details && (
                                          <p className="text-[11px] text-gray-500 mt-1 truncate">{renderDetails(t)}</p>
                                        )}
                                        <p className="text-[10px] text-gray-400 font-mono mt-1">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {visible.length < total && (
                              <div className="text-center">
                                <button onClick={() => setShowCountMap(prev => ({ ...prev, [subId]: (prev[subId] || PAGE_SIZE) + PAGE_SIZE }))} className="text-sm text-primary font-black">Load more</button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-black mb-2">Uploaded Proofs</h4>
                      {docs.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {docs.map((doc) => (
                            <div key={doc.id} className="bg-gray-50 border border-black/5 rounded-xl p-3 overflow-hidden">
                              <div className="w-full h-20 bg-black/5 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                                {doc.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                  <img src={doc.fileUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                  <FileText size={24} className="text-gray-400" />
                                )}
                              </div>
                              <p className="text-[10px] font-black truncate" title={doc.fileName}>{doc.fileName}</p>
                              <p className="text-[8px] text-gray-400 font-mono mt-1">อัปเมื่อ: {doc.uploadedAt}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-400">ยังไม่มีเอกสารหลักฐานสำหรับบริการนี้</div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-black mt-4 mb-2">Completed Cancellations</h4>
                      {completedCancellationHistory.filter(h => h.subscriptionId === subId).length > 0 ? (
                        <div className="space-y-2">
                          {completedCancellationHistory.filter(h => h.subscriptionId === subId).map((h) => (
                            <div key={`${h.subscriptionId}-${h.updatedAt}`} className="p-3 rounded-xl bg-gray-50 border border-black/5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-black">{matchedSub?.name || h.subscriptionId}</p>
                                  <p className="text-[10px] text-gray-500 mt-1">ยกเลิกสำเร็จเมื่อ {h.updatedAt}</p>
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-600 bg-white border border-black/5 rounded-full px-3 py-1">Completed</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-400">ยังไม่มีประวัติการยกเลิกสำเร็จสำหรับบริการนี้</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 4: Money Saved Tracker (Saved) */}
                {activePlaybookTab === 'saved' && (
                  <div className="space-y-4 font-kanit text-center py-6">

                    {/* Celebration badge */}
                    <div className="inline-flex w-16 h-16 rounded-full bg-primary border-4 border-black/5 items-center justify-center text-3xl shrink-0 shadow-lg animate-bounce">
                      <Sparkles size={32} className="text-[#0B0F0A]" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-black">ยินดีด้วยกับการบอกเลิกสิทธิ์สำเร็จ!</h4>
                      <p className="text-xs text-gray-500 font-semibold">
                        DailyStack ช่วยให้คุณประหยัดค่าใช้จ่ายฟุ่มเฟือยได้แล้ว
                      </p>
                    </div>

                    {/* Saved Box */}
                    <div className="bg-[#000000] rounded-2xl p-5 text-center shadow-lg border border-white/5 relative overflow-hidden group max-w-sm mx-auto">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#C7FF2E]/10 rounded-full blur-2xl pointer-events-none" />

                      <p className="text-[10px] text-primary uppercase tracking-widest font-black mb-1.5">
                        ยอดการประหยัดเงินสุทธิของท่าน (Net Money Saved)
                      </p>

                      <div className="grid grid-cols-2 gap-4 divide-x divide-white/10 mt-3 pt-3 border-t border-white/10 text-white">
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase font-black">ประหยัดได้ / เดือน</p>
                          <p className="text-xl font-extrabold text-primary font-mono tracking-tight mt-1">
                            {subAmount.toLocaleString()}
                            <span className="text-[10px] text-white font-normal ml-1">THB</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase font-black">ประหยัดได้ / ปี</p>
                          <p className="text-xl font-extrabold text-white font-mono tracking-tight mt-1">
                            {(subAmount * 12).toLocaleString()}
                            <span className="text-[10px] text-white font-normal ml-1">THB</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400 font-semibold leading-relaxed max-w-xs mx-auto">
                      ระบบคำนวณจากค่าใช้จ่ายจริงของบริการ {activePlaybook.provider_name} ปลุกสุขภาพการเงินของท่านให้กลับมารวดเร็วแข็งแกร่งอีกครั้ง!
                    </p>

                  </div>
                )}

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default Dashboard;
