import { useState } from 'react';
import {
  Plus, Trash2, RefreshCw, Calendar, TrendingUp, AlertCircle,
  CheckCircle2, X, ChevronRight, CreditCard, Zap, Shield,
  Sparkles, Eye, EyeOff, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../data/translations';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'Monthly' | 'Yearly' | 'Weekly';
  nextBillingDate: string;
  category: string;
  status: 'Active' | 'Paused' | 'Cancelled';
  icon?: string;
  color?: string;
  lastUsed?: string;
  usageFrequency?: string;
}

interface SubscriptionTrackerPageProps {
  lang: Language;
  theme: 'dark' | 'light';
  onNavigateToUpgrade?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment': '#E879F9',
  'Productivity': '#38BDF8',
  'Health': '#4ADE80',
  'Finance': '#FBBF24',
  'Technology': '#A78BFA',
  'Social': '#F472B6',
  'News': '#FB923C',
  'Cloud': '#22D3EE',
  'Other': '#94A3B8'
};

export default function SubscriptionTrackerPage({
  lang,
  theme,
  onNavigateToUpgrade
}: SubscriptionTrackerPageProps) {
  const t = translations[lang];
  
  // Core subscription state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 'sub_01',
      name: 'Netflix Premium',
      amount: 18.99,
      billingCycle: 'Monthly',
      nextBillingDate: '2026-06-25',
      category: 'Entertainment',
      status: 'Active',
      icon: 'NF',
      color: '#E50914',
      lastUsed: '2026-06-08',
      usageFrequency: 'Daily'
    },
    {
      id: 'sub_02',
      name: 'Spotify Family',
      amount: 16.99,
      billingCycle: 'Monthly',
      nextBillingDate: '2026-06-20',
      category: 'Entertainment',
      status: 'Active',
      icon: 'SP',
      color: '#1DB954',
      lastUsed: '2026-06-09',
      usageFrequency: 'Daily'
    },
    {
      id: 'sub_03',
      name: 'Adobe Creative Cloud',
      amount: 54.99,
      billingCycle: 'Monthly',
      nextBillingDate: '2026-06-15',
      category: 'Productivity',
      status: 'Active',
      icon: 'AC',
      color: '#FF0000',
      lastUsed: '2026-06-07',
      usageFrequency: 'Weekly'
    },
    {
      id: 'sub_04',
      name: 'iCloud 200GB',
      amount: 2.99,
      billingCycle: 'Monthly',
      nextBillingDate: '2026-06-18',
      category: 'Cloud',
      status: 'Active',
      icon: 'IC',
      color: '#38BDF8',
      lastUsed: '2026-06-09',
      usageFrequency: 'Constant'
    },
    {
      id: 'sub_05',
      name: 'ChatGPT Plus',
      amount: 20.00,
      billingCycle: 'Monthly',
      nextBillingDate: '2026-07-01',
      category: 'Technology',
      status: 'Active',
      icon: 'CP',
      color: '#10A37F',
      lastUsed: '2026-06-09',
      usageFrequency: 'Daily'
    },
    {
      id: 'sub_06',
      name: 'Gym Membership',
      amount: 49.99,
      billingCycle: 'Monthly',
      nextBillingDate: '2026-06-28',
      category: 'Health',
      status: 'Active',
      icon: 'GY',
      color: '#4ADE80',
      lastUsed: '2026-06-05',
      usageFrequency: 'Weekly'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Paused' | 'Cancelled'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  // Add form state
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');
  const [newSubCycle, setNewSubCycle] = useState<'Monthly' | 'Yearly' | 'Weekly'>('Monthly');
  const [newSubCategory, setNewSubCategory] = useState('Other');
  const [newSubNextDate, setNewSubNextDate] = useState('');

  // Calculations
  const monthlyTotal = subscriptions
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => {
      if (s.billingCycle === 'Weekly') return sum + (s.amount * 4.33);
      if (s.billingCycle === 'Yearly') return sum + (s.amount / 12);
      return sum + s.amount;
    }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const upcomingThisWeek = subscriptions.filter(s => {
    if (s.status !== 'Active') return false;
    const next = new Date(s.nextBillingDate);
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return next >= now && next <= weekLater;
  });

  const thisWeekTotal = upcomingThisWeek.reduce((sum, s) => sum + s.amount, 0);

  // Days until next billing
  const getDaysUntil = (dateStr: string) => {
    const next = new Date(dateStr);
    const now = new Date();
    const diff = next.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Filter and sort subscriptions
  const filteredSubs = subscriptions
    .filter(s => filterStatus === 'All' || s.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
      if (sortBy === 'amount') return b.amount - a.amount;
      return a.name.localeCompare(b.name);
    });

  // Category breakdown
  const categoryBreakdown = subscriptions
    .filter(s => s.status === 'Active')
    .reduce((acc, s) => {
      const monthlyAmount = s.billingCycle === 'Weekly' ? s.amount * 4.33 : s.billingCycle === 'Yearly' ? s.amount / 12 : s.amount;
      acc[s.category] = (acc[s.category] || 0) + monthlyAmount;
      return acc;
    }, {} as Record<string, number>);

  // Handle add subscription
  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      name: newSubName,
      amount: parseFloat(newSubAmount),
      billingCycle: newSubCycle,
      nextBillingDate: newSubNextDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: newSubCategory,
      status: 'Active',
      icon: newSubName.substring(0, 2).toUpperCase(),
      color: CATEGORY_COLORS[newSubCategory] || CATEGORY_COLORS['Other']
    };
    setSubscriptions([...subscriptions, newSub]);
    setShowAddModal(false);
    resetForm();
    setShowNotification(lang === 'en' 
      ? `Subscription "${newSubName}" tracked successfully` 
      : `ติดตาม "${newSubName}" สำเร็จแล้ว`);
    setTimeout(() => setShowNotification(null), 4000);
  };

  // Handle cancel subscription
  const handleCancelSubscription = (sub: Subscription) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === sub.id ? { ...s, status: 'Cancelled' as const } : s
    ));
    setShowNotification(lang === 'en'
      ? `Subscription "${sub.name}" cancelled`
      : `ยกเลิก "${sub.name}" สำเร็จแล้ว`);
    setTimeout(() => setShowNotification(null), 4000);
  };

  // Handle delete subscription
  const handleDeleteSubscription = (subId: string) => {
    const sub = subscriptions.find(s => s.id === subId);
    setSubscriptions(subscriptions.filter(s => s.id !== subId));
    setShowNotification(lang === 'en'
      ? `Subscription removed`
      : `ลบการสมัครแล้ว`);
    setTimeout(() => setShowNotification(null), 4000);
  };

  // Reset form
  const resetForm = () => {
    setNewSubName('');
    setNewSubAmount('');
    setNewSubCycle('Monthly');
    setNewSubCategory('Other');
    setNewSubNextDate('');
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Paused': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up text-left">
      
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

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C7FF2E] animate-ping" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#C7FF2E] font-bold">
              {lang === 'en' ? 'LAYER 5' : 'ชั้น 5'}
            </span>
          </div>
          <h1 className="font-display font-black text-2xl text-white tracking-tight">
            {lang === 'en' ? 'Subscription Tracker' : 'ติดตามการสมัคร'}
          </h1>
          <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
            {lang === 'en' ? 'Financial Intelligence Layer' : 'ชั้นข้อมูลทางการเงิน'}
          </p>
        </div>

        <button
          id="btn-add-subscription"
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-[#C7FF2E] to-[#51FF85] text-black font-display font-black text-xs px-5 py-3 rounded-2xl uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#C7FF2E]/10 hover:from-white hover:to-white hover:scale-[1.02] active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {lang === 'en' ? 'Add' : 'เพิ่ม'}
        </button>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Monthly Total */}
        <div className="border rounded-[24px] p-5 bg-[#1A1D26]/90 border-[#2D313E] hover:border-[#C7FF2E]/40 transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="w-9 h-9 rounded-xl bg-[#C7FF2E]/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#C7FF2E]" />
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              {lang === 'en' ? 'Monthly' : 'รายเดือน'}
            </span>
          </div>
          <div className="text-2xl font-black font-display text-white">
            ${monthlyTotal.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">
            {lang === 'en' ? 'Total recurring' : 'รวมค่าสมัคร'}
          </div>
        </div>

        {/* Yearly Total */}
        <div className="border rounded-[24px] p-5 bg-[#1A1D26]/90 border-[#2D313E] hover:border-[#C7FF2E]/40 transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="w-9 h-9 rounded-xl bg-[#38BDF8]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              {lang === 'en' ? 'Yearly' : 'รายปี'}
            </span>
          </div>
          <div className="text-2xl font-black font-display text-white">
            ${yearlyTotal.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">
            {lang === 'en' ? 'Projected annual' : 'คาดการณ์รายปี'}
          </div>
        </div>

        {/* This Week */}
        <div className="border rounded-[24px] p-5 bg-[#1A1D26]/90 border-[#2D313E] hover:border-[#C7FF2E]/40 transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="w-9 h-9 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#FBBF24]" />
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              {lang === 'en' ? 'This Week' : 'สัปดาห์นี้'}
            </span>
          </div>
          <div className="text-2xl font-black font-display text-white">
            ${thisWeekTotal.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">
            {upcomingThisWeek.length} {lang === 'en' ? 'charges' : 'รายการ'}
          </div>
        </div>

        {/* Active Count */}
        <div className="border rounded-[24px] p-5 bg-[#1A1D26]/90 border-[#2D313E] hover:border-[#C7FF2E]/40 transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-3">
            <span className="w-9 h-9 rounded-xl bg-[#4ADE80]/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            </span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              {lang === 'en' ? 'Active' : 'ใช้งาน'}
            </span>
          </div>
          <div className="text-2xl font-black font-display text-white">
            {subscriptions.filter(s => s.status === 'Active').length}
          </div>
          <div className="text-[10px] font-mono text-zinc-500 mt-1">
            {lang === 'en' ? 'subscriptions' : 'การสมัคร'}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Subscription List */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(['All', 'Active', 'Paused', 'Cancelled'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    filterStatus === status
                      ? 'bg-[#C7FF2E] text-black font-bold'
                      : 'bg-[#1A1D26] text-zinc-400 border border-[#2D313E] hover:border-[#C7FF2E]/40'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                {lang === 'en' ? 'Sort:' : 'เรียง:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'name')}
                className="bg-[#1A1D26] border border-[#2D313E] text-zinc-300 text-[10px] font-mono px-3 py-1.5 rounded-xl focus:outline-none focus:border-[#C7FF2E]/40 cursor-pointer"
              >
                <option value="date">{lang === 'en' ? 'Next Billing' : 'วันตัดถัดไป'}</option>
                <option value="amount">{lang === 'en' ? 'Amount' : 'จำนวน'}</option>
                <option value="name">{lang === 'en' ? 'Name' : 'ชื่อ'}</option>
              </select>
            </div>
          </div>

          {/* Subscription List */}
          <div className="space-y-3">
            {filteredSubs.length === 0 ? (
              <div className="border rounded-[24px] p-12 bg-[#1A1D26]/90 border-[#2D313E] text-center">
                <div className="w-16 h-16 rounded-full bg-[#C7FF2E]/10 mx-auto mb-4 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-[#C7FF2E]/40" />
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">
                  {lang === 'en' ? 'No subscriptions yet' : 'ยังไม่มีการสมัคร'}
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  {lang === 'en' 
                    ? 'Start tracking your recurring payments to get financial clarity' 
                    : 'เริ่มติดตามการชำระเงินประจำเพื่อความชัดเจนทางการเงิน'}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#C7FF2E] text-black font-display font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider cursor-pointer hover:bg-white transition-all"
                >
                  {lang === 'en' ? 'Add First Subscription' : 'เพิ่มการสมัครแรก'}
                </button>
              </div>
            ) : (
              filteredSubs.map((sub) => {
                const daysUntil = getDaysUntil(sub.nextBillingDate);
                const isExpanded = expandedSub === sub.id;
                const catColor = CATEGORY_COLORS[sub.category] || CATEGORY_COLORS['Other'];
                
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-[20px] bg-[#1A1D26]/90 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${
                      sub.status === 'Active' 
                        ? 'border-[#2D313E] hover:border-[#C7FF2E]/40' 
                        : 'border-[#2D313E]/50 opacity-60'
                    }`}
                  >
                    {/* Main Row */}
                    <div 
                      className="p-5 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-sm text-white"
                          style={{ backgroundColor: `${sub.color}20`, borderColor: `${sub.color}40`, borderWidth: 1 }}
                        >
                          {sub.icon || sub.name.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Details */}
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-white">{sub.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider border ${getStatusColor(sub.status)}`}>
                              {sub.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-mono text-zinc-500" style={{ color: catColor }}>
                              {sub.category}
                            </span>
                            <span className="text-[10px] text-zinc-600">•</span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {sub.billingCycle}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Amount */}
                        <div className="text-right">
                          <div className="font-display font-black text-white text-lg">
                            ${sub.amount.toFixed(2)}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500">
                            {daysUntil <= 0 
                              ? (lang === 'en' ? 'Due today' : 'วันนี้')
                              : daysUntil === 1 
                                ? (lang === 'en' ? 'Tomorrow' : 'พรุ่งนี้')
                                : `${daysUntil} ${lang === 'en' ? 'days' : 'วัน'}`}
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <ChevronRight className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-[#2D313E]/50 overflow-hidden"
                        >
                          <div className="p-5 bg-[#12141C]/50 space-y-4">
                            {/* Next Billing */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-zinc-400">
                                <Calendar className="w-4 h-4" />
                                <span className="text-[10px] font-mono uppercase tracking-wider">
                                  {lang === 'en' ? 'Next Billing Date' : 'วันตัดถัดไป'}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-white">
                                {new Date(sub.nextBillingDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>

                            {/* Usage */}
                            {sub.lastUsed && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-[10px] font-mono uppercase tracking-wider">
                                    {lang === 'en' ? 'Last Used' : 'ใช้ล่าสุด'}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-white">
                                  {new Date(sub.lastUsed).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            )}

                            {/* Frequency */}
                            {sub.usageFrequency && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-400">
                                  <Zap className="w-4 h-4" />
                                  <span className="text-[10px] font-mono uppercase tracking-wider">
                                    {lang === 'en' ? 'Frequency' : 'ความถี่'}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-white">
                                  {sub.usageFrequency}
                                </span>
                              </div>
                            )}

                            {/* Annual Cost */}
                            <div className="flex items-center justify-between pt-3 border-t border-[#2D313E]/50">
                              <div className="flex items-center gap-2 text-zinc-400">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-[10px] font-mono uppercase tracking-wider">
                                  {lang === 'en' ? 'Annual Cost' : 'ค่าใช้จ่ายรายปี'}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[#C7FF2E]">
                                ${(sub.amount * (sub.billingCycle === 'Weekly' ? 52 : sub.billingCycle === 'Yearly' ? 1 : 12)).toFixed(2)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                              {sub.status === 'Active' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelSubscription(sub);
                                  }}
                                  className="flex-1 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-[10px] font-mono uppercase tracking-wider hover:bg-red-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  {lang === 'en' ? 'Cancel' : 'ยกเลิก'}
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSubscriptions(subscriptions.map(s => 
                                      s.id === sub.id ? { ...s, status: 'Active' as const } : s
                                    ));
                                    setShowNotification(lang === 'en' 
                                      ? `Subscription "${sub.name}" reactivated` 
                                      : `เปิดใช้งาน "${sub.name}" อีกครั้ง`);
                                    setTimeout(() => setShowNotification(null), 4000);
                                  }}
                                  className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[10px] font-mono uppercase tracking-wider hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  {lang === 'en' ? 'Reactivate' : 'เปิดใช้งาน'}
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSubscription(sub.id);
                                }}
                                className="px-4 py-2.5 rounded-xl border border-zinc-700/50 bg-zinc-800/30 text-zinc-500 text-[10px] font-mono uppercase tracking-wider hover:bg-zinc-800 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {lang === 'en' ? 'Delete' : 'ลบ'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Category Breakdown & Insights */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Category Breakdown */}
          <div className="border rounded-[24px] p-5 bg-[#1A1D26]/90 border-[#2D313E] hover:border-[#C7FF2E]/30 transition-all duration-300">
            <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C7FF2E]" />
              {lang === 'en' ? 'Category Breakdown' : 'แยกตามหมวดหมู่'}
            </h3>

            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
                  const percentage = (amount / monthlyTotal) * 100;
                  
                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />
                          <span className="text-[11px] font-mono text-zinc-300">{category}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-white">
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#12141C] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: catColor }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Upcoming Charges */}
          <div className="border rounded-[24px] p-5 bg-[#1A1D26]/90 border-[#2D313E] hover:border-[#C7FF2E]/30 transition-all duration-300">
            <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FBBF24]" />
              {lang === 'en' ? 'Upcoming Charges' : 'รายการจะถูกตัดเร็วๆ นี้'}
            </h3>

            {upcomingThisWeek.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#C7FF2E]/10 mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-[#C7FF2E]/40" />
                </div>
                <p className="text-zinc-500 text-xs font-mono">
                  {lang === 'en' ? 'No charges this week' : 'ไม่มีรายการสัปดาห์นี้'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingThisWeek.map(sub => {
                  const daysUntil = getDaysUntil(sub.nextBillingDate);
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-[#12141C]/50 border border-[#2D313E]/30">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-[10px] text-white"
                          style={{ backgroundColor: `${sub.color}20` }}
                        >
                          {sub.icon}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-white">{sub.name}</p>
                          <p className="text-[10px] font-mono text-zinc-500">
                            {daysUntil === 0 
                              ? (lang === 'en' ? 'Today' : 'วันนี้')
                              : daysUntil === 1 
                                ? (lang === 'en' ? 'Tomorrow' : 'พรุ่งนี้')
                                : `${daysUntil} ${lang === 'en' ? 'days' : 'วัน'}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        ${sub.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Insight */}
          <div className="border rounded-[24px] p-5 bg-gradient-to-br from-[#1E2235] via-[#191C28] to-[#13151D] border-[#373B4D] hover:border-[#C7FF2E]/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#C7FF2E] animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#C7FF2E] font-bold">
                {lang === 'en' ? 'AI INSIGHT' : 'ข้อมูลเชิงลึก'}
              </span>
            </div>
            
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              {lang === 'en'
                ? `You have ${subscriptions.filter(s => s.status === 'Active').length} active subscriptions totaling $${monthlyTotal.toFixed(2)}/month. `
                : `คุณมี ${subscriptions.filter(s => s.status === 'Active').length} การสมัครใช้งาน รวม $${monthlyTotal.toFixed(2)}/เดือน. `}
              {monthlyTotal > 100
                ? (lang === 'en'
                  ? `Consider reviewing subscriptions you use less than once a week to optimize spending.`
                  : `พิจารณาทบทวนการสมัครที่ใช้น้อยกว่าสัปดาห์ละครั้งเพื่อปรับปรุงการใช้จ่าย`)
                : (lang === 'en'
                  ? `Your subscription spending is well-managed. Keep tracking!`
                  : `การใช้จ่ายสมัครของคุณอยู่ในเกณฑ์ดี จอบบริหารต่อไป!`)}
            </p>

            <div className="flex items-center gap-2 text-[#C7FF2E]">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                {lang === 'en' ? 'Monthly Savings Potential' : 'ศักยภาพประหยัดรายเดือน'}
              </span>
            </div>
            <div className="text-2xl font-black font-display text-white mt-1">
              ${(monthlyTotal * 0.15).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Add Subscription Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-[#1A1D26] border border-[#2D313E] rounded-[32px] p-6 max-w-md w-full pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-white">
                      {lang === 'en' ? 'Add Subscription' : 'เพิ่มการสมัคร'}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">
                      {lang === 'en' ? 'Track a recurring payment' : 'ติดตามการชำระเงินประจำ'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="w-10 h-10 rounded-xl bg-[#232733] border border-[#2D313E] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddSubscription} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                      {lang === 'en' ? 'Service Name' : 'ชื่อบริการ'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="e.g. Netflix, Spotify"
                      className="w-full border border-[#2D313E] bg-[#232733] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7FF2E]/40 transition-colors"
                    />
                  </div>

                  {/* Amount & Cycle */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                        {lang === 'en' ? 'Amount' : 'จำนวน'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">$</span>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={newSubAmount}
                          onChange={(e) => setNewSubAmount(e.target.value)}
                          placeholder="9.99"
                          className="w-full border border-[#2D313E] bg-[#232733] rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C7FF2E]/40 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                        {lang === 'en' ? 'Billing Cycle' : 'รอบการตัด'}
                      </label>
                      <select
                        value={newSubCycle}
                        onChange={(e) => setNewSubCycle(e.target.value as 'Monthly' | 'Yearly' | 'Weekly')}
                        className="w-full border border-[#2D313E] bg-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C7FF2E]/40 transition-colors cursor-pointer"
                      >
                        <option value="Monthly">{lang === 'en' ? 'Monthly' : 'รายเดือน'}</option>
                        <option value="Yearly">{lang === 'en' ? 'Yearly' : 'รายปี'}</option>
                        <option value="Weekly">{lang === 'en' ? 'Weekly' : 'รายสัปดาห์'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                      {lang === 'en' ? 'Category' : 'หมวดหมู่'}
                    </label>
                    <select
                      value={newSubCategory}
                      onChange={(e) => setNewSubCategory(e.target.value)}
                      className="w-full border border-[#2D313E] bg-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C7FF2E]/40 transition-colors cursor-pointer"
                    >
                      {Object.keys(CATEGORY_COLORS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Next Billing Date */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                      {lang === 'en' ? 'Next Billing Date (Optional)' : 'วันตัดถัดไป (ไม่บังคับ)'}
                    </label>
                    <input
                      type="date"
                      value={newSubNextDate}
                      onChange={(e) => setNewSubNextDate(e.target.value)}
                      className="w-full border border-[#2D313E] bg-[#232733] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C7FF2E]/40 transition-colors"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#C7FF2E] to-[#51FF85] text-black font-display font-black text-sm py-4 rounded-2xl uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#C7FF2E]/10 hover:from-white hover:to-white mt-4"
                  >
                    {lang === 'en' ? 'Add Subscription' : 'เพิ่มการสมัคร'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
