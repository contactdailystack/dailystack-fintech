import React, { useState, useEffect, useMemo } from 'react';
import {
  Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  Plus, Edit2, Trash2, Wallet, PieChart, Calendar,
  ChevronRight, Bell, Sparkles, X, Save,
  UtensilsCrossed, Car, ShoppingBag, Film, Zap, Heart, Book
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, UserProfile } from '../types';
import { translations, Language } from '../data/translations';
import { haptics } from '../services/hapticService';
import {
  loadBudgets, saveBudgets, subscribeBudgets,
  monthSpendByBudgetKey, categoryToBudgetKey,
} from '../services/budgetStore';
import type { UserBudget } from '../services/budgetStore';
import type { Goal } from '../services/goalService';

// Icon per budget key (shared with Dashboard rings)
const ICON_BY_KEY: Record<string, React.ReactNode> = {
  food: <UtensilsCrossed className="w-4 h-4" />,
  transport: <Car className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  entertainment: <Film className="w-4 h-4" />,
};

interface BudgetCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  budgetLimit: number;
  spent: number;
  color: string;
}

interface BudgetPageProps {
  transactions: Transaction[];
  profile: UserProfile;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  lang: Language;
  theme: 'dark' | 'light';
  /** Real savings goals from Supabase (goals table) — replaces demo data */
  goals?: Goal[];
}

export default function BudgetManagementPage({
  transactions,
  profile,
  onUpdateProfile,
  lang,
  theme,
  goals = [],
}: BudgetPageProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'goals'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState<number>(0);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  
  // Form state for editing category
  const [editName, setEditName] = useState('');
  const [editBudgetLimit, setEditBudgetLimit] = useState<number>(0);
  
  // Open edit modal with category data
  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditBudgetLimit(category.budgetLimit);
  };
  
  // Open add modal
  const handleOpenAddModal = () => {
    setNewCategoryName('');
    setNewCategoryBudget(0);
    setShowAddModal(true);
  };
  
  // Save edited category → persisted via budgetStore (#4)
  const handleSaveCategory = () => {
    if (!editingCategory) return;

    saveBudgets(budgets.map(b =>
      b.key === editingCategory.id
        ? { ...b, limit: editBudgetLimit,
            nameEn: lang === 'th' ? b.nameEn : editName,
            nameTh: lang === 'th' ? editName : b.nameTh }
        : b
    ));

    // Close modal
    setEditingCategory(null);
    setEditName('');
    setEditBudgetLimit(0);
  };

  // Handle add new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim() || newCategoryBudget <= 0) return;

    const key = `custom-${Date.now()}`;
    const nb: UserBudget = {
      key,
      nameEn: newCategoryName.trim(),
      nameTh: newCategoryName.trim(),
      color: '#6B7280',
      limit: newCategoryBudget,
    };
    saveBudgets([...budgets, nb]);
    setShowAddModal(false);
    setNewCategoryName('');
    setNewCategoryBudget(0);
  };

  // Delete a custom budget category (default categories can't be deleted —
  // loadBudgets() re-seeds them; they can be edited to ฿0 instead)
  const handleDeleteCategory = (id: string) => {
    if (!id.startsWith('custom-')) return;
    saveBudgets(budgets.filter(b => b.key !== id));
  };

  // ── Budgets from shared store (Dashboard rings read the same data) ──
  const [budgets, setBudgets] = useState<UserBudget[]>(() => loadBudgets());
  useEffect(() => subscribeBudgets(() => setBudgets(loadBudgets())), []);

  // Real month-to-date spend per budget key (#4)
  const spendMap = useMemo(() => monthSpendByBudgetKey(transactions), [transactions]);

  // Default budget categories with realistic Thai spending data
  const categories = useMemo<BudgetCategory[]>(() =>
    budgets.map((b) => ({
      id: b.key,
      name: lang === 'th' ? b.nameTh : b.nameEn,
      icon: ICON_BY_KEY[b.key] || <Wallet className="w-4 h-4" />,
      budgetLimit: b.limit,
      spent: Math.round(spendMap.get(b.key) || 0),
      color: b.color,
    })), [budgets, spendMap, lang]);

  // ── Smart suggestions (#4): avg monthly spend per budget, last 3 months ──
  const suggestions = useMemo(() => {
    const now = new Date();
    const perKeyTotals = new Map<string, number>();
    for (const t of transactions) {
      if (t.amount >= 0) continue;
      const d = new Date(t.date);
      const monthsAgo =
        (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (monthsAgo < 0 || monthsAgo > 2) continue; // last 3 months incl. current
      const key = categoryToBudgetKey(t.category);
      if (!key) continue;
      perKeyTotals.set(key, (perKeyTotals.get(key) || 0) + Math.abs(t.amount));
    }
    return budgets
      .map((b) => {
        const avg = (perKeyTotals.get(b.key) || 0) / 3;
        const suggested = Math.max(500, Math.ceil(avg / 100) * 100);
        return { key: b.key, name: lang === 'th' ? b.nameTh : b.nameEn, suggested, current: b.limit, avg };
      })
      // Only suggest for categories with real spending history
      .filter((s) => s.avg > 0 && s.suggested !== s.current);
  }, [transactions, budgets, lang]);

  const applyAllSuggestions = () => {
    saveBudgets(budgets.map((b) => {
      const s = suggestions.find((x) => x.key === b.key);
      return s ? { ...b, limit: s.suggested } : b;
    }));
  };

  // Calculate totals
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetLimit, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;
  const overallPercent = Math.min(100, (totalSpent / totalBudget) * 100);

  // AI insight: highest budget-utilisation category with real spend this month
  const aiInsight = useMemo(() => {
    const withSpend = categories.filter(c => c.spent > 0 && c.budgetLimit > 0);
    if (withSpend.length === 0) return null;
    const top = [...withSpend].sort(
      (a, b) => b.spent / b.budgetLimit - a.spent / a.budgetLimit
    )[0];
    return {
      name: top.name,
      pct: Math.round((top.spent / top.budgetLimit) * 100),
      over: top.spent > top.budgetLimit,
      overBy: top.spent - top.budgetLimit,
    };
  }, [categories]);

  // Real 6-month trend from actual transactions (current total budget shown for reference)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const out: { month: string; budget: number; spent: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const spent = transactions
        .filter(t => {
          if (t.amount >= 0) return false;
          const td = new Date(t.date);
          return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
        })
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      out.push({
        month: d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short' }),
        budget: Math.round(totalBudget),
        spent: Math.round(spent),
      });
    }
    return out;
  }, [transactions, totalBudget, lang]);

  // Find categories over budget
  const overBudgetCategories = categories.filter(cat => cat.spent > cat.budgetLimit);
  const nearLimitCategories = categories.filter(cat => {
    const percent = (cat.spent / cat.budgetLimit) * 100;
    return percent >= 80 && percent < 100;
  });

  // Real savings goals come from the `goals` prop (Supabase) — no demo data
  const savingsGoals = useMemo(() => goals.map(g => ({
    id: g.id,
    name: g.goal_name,
    target: g.target_amount,
    current: g.current_amount,
    deadline: g.target_date ? String(g.target_date).slice(0, 7) : '—',
  })), [goals]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div id="budget-viewport" className="space-y-6 md:space-y-8 animate-slide-up">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="budget-header">
        <div className="text-left">
          <h2 className={`font-display font-extrabold text-2xl ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {lang === 'th' ? 'ผู้พิทักษ์การใช้จ่าย' : 'Spending Guardian'}
          </h2>
          <p className="text-xs text-zinc-500 font-mono tracking-wider">
            {lang === 'th' ? 'วางแผนและติดตามการใช้จ่ายอย่างชาญฉลาด' : 'GUARD YOUR SPENDING INTELLIGENTLY'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-dark-card border border-zinc-800/80">
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              {lang === 'th' ? 'คงเหลือ' : 'Remaining'}
            </p>
            <p className={`text-sm font-display font-bold ${remaining > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
          {overBudgetCategories.length > 0 && (
            <button
              onClick={() => setShowAlert(true)}
              className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`p-1 rounded-xl border flex ${theme === 'dark' ? 'bg-[#131416] border-zinc-900' : 'bg-[#EFEEF4] border-transparent shadow-inner'}`} id="budget-tab-switcher">
        <button
          id="btn-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'overview' 
              ? (theme === 'dark' ? 'bg-[var(--color-lime)] text-black font-semibold' : 'bg-white text-[#1D1D1F] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5')
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          {lang === 'th' ? 'ภาพรวม' : 'Overview'}
        </button>
        <button
          id="btn-tab-categories"
          onClick={() => setActiveTab('categories')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'categories'
              ? (theme === 'dark' ? 'bg-[var(--color-lime)] text-black font-semibold' : 'bg-white text-[#1D1D1F] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5')
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          {lang === 'th' ? 'หมวดหมู่' : 'Categories'}
        </button>
        <button
          id="btn-tab-goals"
          onClick={() => setActiveTab('goals')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'goals'
              ? (theme === 'dark' ? 'bg-[var(--color-lime)] text-black font-semibold' : 'bg-white text-[#1D1D1F] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5')
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          {lang === 'th' ? 'เป้าหมาย' : 'Goals'}
        </button>
      </div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Overall Budget Card */}
            <div className={`rounded-2xl border ${theme === 'dark' ? 'bg-gradient-to-br from-[#1A1D26] to-[#131416] border-zinc-800/50' : 'bg-white border-zinc-200'}`} id="budget-overall-card">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {lang === 'th' ? 'งบประมาณรวมเดือนนี้' : 'Monthly Total Budget'}
                    </p>
                    <p className={`text-3xl font-display font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                      {formatCurrency(totalBudget)}
                    </p>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${overallPercent > 100 ? 'bg-red-500/10' : overallPercent > 80 ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                    <span className={`text-2xl font-display font-black ${overallPercent > 100 ? 'text-red-400' : overallPercent > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {Math.round(overallPercent)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-zinc-800/50 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, overallPercent)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      overallPercent > 100
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : overallPercent > 80
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    }`}
                  />
                </div>

                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">
                    {lang === 'th' ? 'ใช้ไป' : 'Spent'}: <span className="text-zinc-300">{formatCurrency(totalSpent)}</span>
                  </span>
                  <span className="text-zinc-500">
                    {lang === 'th' ? 'คงเหลือ' : 'Left'}: <span className={remaining > 0 ? 'text-emerald-400' : 'text-red-400'}>{formatCurrency(Math.max(0, remaining))}</span>
                  </span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-px bg-zinc-800/30 border-t border-zinc-800/50">
                <div className="p-4 text-center bg-dark-card/50">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    {lang === 'th' ? 'วันที่เหลือ' : 'Days Left'}
                  </p>
                  <p className="text-lg font-display font-bold text-white">
                    {Math.max(0, new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate())}
                  </p>
                </div>
                <div className="p-4 text-center bg-dark-card/50 border-l border-zinc-800/30">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    {lang === 'th' ? 'เฉลี่ย/วัน' : 'Avg/Day'}
                  </p>
                  <p className="text-lg font-display font-bold text-white">{formatCurrency(Math.round(totalSpent / Math.max(1, new Date().getDate())))}</p>
                </div>
                <div className="p-4 text-center bg-dark-card/50 border-l border-zinc-800/30">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    {lang === 'th' ? 'การคาดการณ์' : 'Projected'}
                  </p>
                  <p className={`text-lg font-display font-bold ${overallPercent > 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {formatCurrency(Math.round((totalSpent / Math.max(1, new Date().getDate())) * new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()))}
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts & Recommendations */}
            {(overBudgetCategories.length > 0 || nearLimitCategories.length > 0) && (
              <div className="space-y-3" id="budget-alerts-section">
                {overBudgetCategories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-400">
                        {lang === 'th' ? 'เกินงบ' : 'Over Budget'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {cat.name} {lang === 'th' ? 'ใช้ไป' : 'spent'} {formatCurrency(cat.spent)} / {formatCurrency(cat.budgetLimit)}
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold text-red-400">
                      +{formatCurrency(cat.spent - cat.budgetLimit)}
                    </span>
                  </div>
                ))}
                {nearLimitCategories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-400">
                        {lang === 'th' ? 'ใกล้ถึงขีดจำกัด' : 'Near Limit'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {cat.name} {Math.round((cat.spent / cat.budgetLimit) * 100)}% {lang === 'th' ? 'ของงบ' : 'of budget'}
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-400">
                      {formatCurrency(cat.budgetLimit - cat.spent)} {lang === 'th' ? 'เหลือ' : 'left'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Monthly Trend */}
            <div className={`rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-zinc-800/50' : 'bg-white border-zinc-200'}`} id="budget-trend-card">
              <div className="p-5 border-b border-zinc-800/30">
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand" />
                  {lang === 'th' ? 'แนวโน้มรายเดือน' : 'Monthly Trend'}
                </h3>
              </div>
              <div className="p-5">
                <div className="flex items-end justify-between h-32 gap-2">
                  {monthlyData.map((month, idx) => {
                    const maxValue = Math.max(...monthlyData.map(m => Math.max(m.budget, m.spent)));
                    const budgetHeight = (month.budget / maxValue) * 100;
                    const spentHeight = (month.spent / maxValue) * 100;
                    const isOver = month.spent > month.budget;
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col-reverse gap-0.5 h-28">
                          <div 
                            className="w-full bg-zinc-800/50 rounded-sm transition-all"
                            style={{ height: `${budgetHeight}%` }}
                          />
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${spentHeight}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`w-full rounded-sm ${isOver ? 'bg-amber-500/80' : 'bg-brand/60'}`}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500">{month.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-zinc-800/50" />
                    <span className="text-[10px] font-mono text-zinc-500">{lang === 'th' ? 'งบ' : 'Budget'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-brand/60" />
                    <span className="text-[10px] font-mono text-zinc-500">{lang === 'th' ? 'ใช้จ่าย' : 'Spent'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation Card */}
            {/* ── Smart Budget Suggestions (#4) — based on real 3-month averages ── */}
            {suggestions.length > 0 && (
              <div className={`rounded-2xl border ${theme === 'dark' ? 'bg-gradient-to-br from-[#1A1D26] to-[#131416] border-zinc-800/50' : 'bg-white border-zinc-200'}`} id="budget-suggest-card">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand" />
                      <p className="text-[10px] font-mono text-brand uppercase tracking-widest">
                        {lang === 'th' ? 'งบที่แนะนำจากการใช้จ่ายจริง' : 'Suggested budgets'}
                      </p>
                    </div>
                    <button
                      onClick={() => { haptics.fire('SELECT'); applyAllSuggestions(); }}
                      className="px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/20 transition-colors"
                    >
                      {lang === 'th' ? 'ใช้ทั้งหมด' : 'Apply all'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <div key={s.key} className="flex items-center justify-between text-sm">
                        <span className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}>{s.name}</span>
                        <span className="font-mono text-xs">
                          <span className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}>
                            {formatCurrency(s.current)}
                          </span>
                          <span className="mx-1.5">→</span>
                          <span className="text-brand font-semibold">{formatCurrency(s.suggested)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className={`mt-3 text-[10px] ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {lang === 'th'
                      ? 'คำนวณจากค่าเฉลี่ยการใช้จ่าย 3 เดือนล่าสุด ปัดเป็นร้อย'
                      : 'Based on your average spend over the last 3 months, rounded to ฿100.'}
                  </p>
                </div>
              </div>
            )}

            {/* AI Recommendation Card — real data: highest-utilisation category this month */}
            {aiInsight && (
              <div className={`rounded-2xl border ${theme === 'dark' ? 'bg-gradient-to-br from-[#1A1D26] to-[#131416] border-zinc-800/50' : 'bg-white border-zinc-200'}`} id="budget-ai-card">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${aiInsight.over ? 'bg-red-500/10' : 'bg-brand/10'}`}>
                      <Sparkles className={`w-5 h-5 ${aiInsight.over ? 'text-red-400' : 'text-brand'}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-brand uppercase tracking-widest mb-1">
                        AI {lang === 'th' ? 'คำแนะนำ' : 'Recommendation'}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        {aiInsight.over
                          ? lang === 'th'
                            ? `คุณใช้จ่ายหมวด${aiInsight.name}เกินงบแล้ว ${formatCurrency(aiInsight.overBy)} (${aiInsight.pct}% ของงบ) ลองตั้งกฎ "หยุดชะลอ" 7 วันก่อนซื้อของที่ไม่จำเป็น`
                            : `You've exceeded your ${aiInsight.name} budget by ${formatCurrency(aiInsight.overBy)} (${aiInsight.pct}%). Consider a 7-day "cooling off" rule before non-essential purchases.`
                          : lang === 'th'
                            ? `หมวด${aiInsight.name}ใช้ไปแล้ว ${aiInsight.pct}% ของงบเดือนนี้ เฝ้าระวังการใช้จ่ายส่วนนี้ต่ออีก`
                            : `${aiInsight.name} is at ${aiInsight.pct}% of its monthly budget. Keep an eye on this category.`}
                      </p>
                      <a href="/profile" className="inline-block mt-3 px-4 py-2 rounded-lg bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/20 transition-colors">
                        {lang === 'th' ? 'ตั้งกฎการใช้จ่าย' : 'Set Spending Rule'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Category Cards */}
            {categories.map((cat, idx) => {
              const bgColor = cat.color && cat.color.startsWith && (cat.color as string).startsWith('var(') ? (cat.color as string) : `${cat.color}20`;
              const percent = (cat.spent / cat.budgetLimit) * 100;
              const isOver = percent > 100;
              const isNear = percent >= 80 && percent <= 100;
              
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-zinc-800/50' : 'bg-white border-zinc-200'}`}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: bgColor }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{cat.name}</p>
                        <p className="text-xs text-zinc-500">
                          {formatCurrency(cat.spent)} / {formatCurrency(cat.budgetLimit)}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold ${
                        isOver
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : isNear
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {Math.round(percent)}%
                      </div>
                    </div>

                    <div className="relative h-2.5 bg-zinc-800/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, percent)}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${
                          isOver
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : isNear
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        }`}
                      />
                    </div>

                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-zinc-500">
                        {isOver 
                          ? `${lang === 'th' ? 'เกินงบ' : 'Over by'} ${formatCurrency(cat.spent - cat.budgetLimit)}`
                          : `${lang === 'th' ? 'เหลือ' : 'Left'} ${formatCurrency(cat.budgetLimit - cat.spent)}`
                        }
                      </span>
                      <div className="flex gap-2">
                        {cat.id.startsWith('custom-') && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            aria-label={lang === 'th' ? 'ลบหมวดหมู่' : 'Delete category'}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className="p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors text-zinc-500 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Add Category Button */}
            <button
              onClick={handleOpenAddModal}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-500 hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">{lang === 'th' ? 'เพิ่มหมวดหมู่ใหม่' : 'Add New Category'}</span>
            </button>
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Goals Summary */}
            <div className={`rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-zinc-800/50' : 'bg-white border-zinc-200'}`}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {lang === 'th' ? 'เป้าหมายทั้งหมด' : 'All Goals'}
                    </p>
                    <p className="text-2xl font-display font-black text-white">
                      {savingsGoals.length} {lang === 'th' ? 'เป้าหมาย' : 'Goals'}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
                    <Target className="w-7 h-7 text-brand" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                      {lang === 'th' ? 'รวมออมแล้ว' : 'Total Saved'}
                    </p>
                    <p className="text-lg font-display font-bold text-emerald-400">
                      {formatCurrency(savingsGoals.reduce((sum, g) => sum + g.current, 0))}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand/5 border border-brand/20">
                    <p className="text-[10px] font-mono text-brand uppercase tracking-wider">
                      {lang === 'th' ? 'ยังต้องออม' : 'Still Needed'}
                    </p>
                    <p className="text-lg font-display font-bold text-brand">
                      {formatCurrency(savingsGoals.reduce((sum, g) => sum + (g.target - g.current), 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty state → Goals page */}
            {savingsGoals.length === 0 && (
              <a href="/simulation" className="block rounded-2xl border border-dashed border-zinc-700 p-6 text-center hover:border-emerald-400/40 transition-colors">
                <Target className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                <p className="text-sm font-semibold text-white">
                  {lang === 'th' ? 'ยังไม่มีเป้าหมายออมเงิน' : 'No savings goals yet'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {lang === 'th' ? 'แตะเพื่อสร้างเป้าหมายแรกของคุณ' : 'Tap to create your first goal'}
                </p>
              </a>
            )}

            {/* Individual Goals */}
            {savingsGoals.map((goal, idx) => {
              const percent = (goal.current / goal.target) * 100;
              const isComplete = percent >= 100;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-zinc-800/50' : 'bg-white border-zinc-200'}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-emerald-500/10' : 'bg-brand/10'}`}>
                          {isComplete 
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            : <Target className={`w-5 h-5 ${isComplete ? 'text-emerald-400' : 'text-brand'}`} />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{goal.name}</p>
                          <p className="text-xs text-zinc-500">
                            {lang === 'th' ? 'กำหนดเสร็จ' : 'Deadline'}: {goal.deadline}
                          </p>
                        </div>
                      </div>
                      {isComplete && (
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold">
                          {lang === 'th' ? 'สำเร็จ' : 'Complete'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className="text-zinc-400">{formatCurrency(goal.current)}</span>
                      <span className="text-zinc-500">{formatCurrency(goal.target)}</span>
                    </div>
                    
                    <div className="relative h-3 bg-zinc-800/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${
                          isComplete 
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            : 'bg-gradient-to-r from-brand to-brand-muted'
                        }`}
                      />
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-zinc-500">
                        {Math.round(percent)}% {lang === 'th' ? 'สำเร็จ' : 'complete'}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {lang === 'th' ? 'ต้องออมเพิ่ม' : 'Need to save'}: {formatCurrency(goal.target - goal.current)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {(showAddModal || editingCategory) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setEditingCategory(null); }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-dark-card border border-zinc-800 rounded-2xl p-6 z-50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-display font-bold text-white">
                  {editingCategory 
                    ? (lang === 'th' ? 'แก้ไขหมวดหมู่' : 'Edit Category')
                    : (lang === 'th' ? 'เพิ่มหมวดหมู่ใหม่' : 'Add New Category')
                  }
                </h3>
                <button
                  onClick={() => { setShowAddModal(false); setEditingCategory(null); }}
                  className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                    {lang === 'th' ? 'ชื่อหมวดหมู่' : 'Category Name'}
                  </label>
                  {editingCategory ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={lang === 'th' ? 'เช่น อาหาร, การเดินทาง' : 'e.g. Food, Transport'}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                    />
                  ) : (
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder={lang === 'th' ? 'เช่น อาหาร, การเดินทาง' : 'e.g. Food, Transport'}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                    {lang === 'th' ? 'งบประมาณรายเดือน' : 'Monthly Budget'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">฿</span>
                    {editingCategory ? (
                      <input
                        type="number"
                        value={editBudgetLimit || ''}
                        onChange={(e) => setEditBudgetLimit(Number(e.target.value))}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                      />
                    ) : (
                      <input
                        type="number"
                        value={newCategoryBudget || ''}
                        onChange={(e) => setNewCategoryBudget(Number(e.target.value))}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                      />
                    )}
                  </div>
                </div>

                <button 
                  onClick={editingCategory ? handleSaveCategory : handleAddCategory}
                  className="w-full py-3 rounded-xl bg-brand text-black font-semibold hover:bg-brand-muted transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {lang === 'th' ? 'บันทึก' : 'Save'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Budget Alert Modal */}
      <AnimatePresence>
        {showAlert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAlert(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-dark-card border border-amber-500/30 rounded-2xl p-6 z-50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white">
                    {lang === 'th' ? 'แจ้งเตือนงบประมาณ' : 'Budget Alert'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-zinc-300 mb-4">
                {lang === 'th'
                  ? `คุณมี ${overBudgetCategories.length} หมวดหมู่ที่เกินงบประมาณแล้ว รวมเป็น ${formatCurrency(overBudgetCategories.reduce((sum, c) => sum + (c.spent - c.budgetLimit), 0))}`
                  : `You have ${overBudgetCategories.length} categories over budget totaling ${formatCurrency(overBudgetCategories.reduce((sum, c) => sum + (c.spent - c.budgetLimit), 0))}`
                }
              </p>

              <div className="space-y-2 mb-6">
                {overBudgetCategories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <span className="text-sm text-zinc-300">{cat.icon} {cat.name}</span>
                    <span className="text-sm font-mono font-bold text-amber-400">
                      +{formatCurrency(cat.spent - cat.budgetLimit)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlert(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition-colors"
                >
                  {lang === 'th' ? 'ปิด' : 'Dismiss'}
                </button>
                <button
                  onClick={() => { setShowAlert(false); setActiveTab('categories'); }}
                  className="flex-1 py-3 rounded-xl bg-brand text-black font-semibold hover:bg-brand-muted transition-colors"
                >
                  {lang === 'th' ? 'ปรับงบ' : 'Adjust Budget'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
