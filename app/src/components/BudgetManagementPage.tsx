import React, { useState } from 'react';
import {
  Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  Plus, Edit2, Trash2, Wallet, PieChart, Calendar,
  ChevronRight, Bell, Sparkles, X, Save,
  UtensilsCrossed, Car, ShoppingBag, Film, Zap, Heart, Book
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, UserProfile } from '../types';
import { translations, Language } from '../data/translations';

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
}

export default function BudgetManagementPage({
  transactions,
  profile,
  onUpdateProfile,
  lang,
  theme
}: BudgetPageProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'goals'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  // Default budget categories with realistic Thai spending data
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { id: '1', name: lang === 'th' ? 'อาหารและเครื่องดื่ม' : 'Food & Dining', icon: <UtensilsCrossed className="w-4 h-4" />, budgetLimit: 8000, spent: 5240, color: '#F97316' },
    { id: '2', name: lang === 'th' ? 'การเดินทาง' : 'Transportation', icon: <Car className="w-4 h-4" />, budgetLimit: 4000, spent: 2100, color: '#3B82F6' },
    { id: '3', name: lang === 'th' ? 'ช้อปปิ้ง' : 'Shopping', icon: <ShoppingBag className="w-4 h-4" />, budgetLimit: 6000, spent: 7820, color: '#EC4899' },
    { id: '4', name: lang === 'th' ? 'บันเทิง' : 'Entertainment', icon: <Film className="w-4 h-4" />, budgetLimit: 3000, spent: 1850, color: '#8B5CF6' },
    { id: '5', name: lang === 'th' ? 'บิลและสาธารณูปโภค' : 'Bills & Utilities', icon: <Zap className="w-4 h-4" />, budgetLimit: 5000, spent: 4200, color: '#10B981' },
    { id: '6', name: lang === 'th' ? 'สุขภาพ' : 'Health', icon: <Heart className="w-4 h-4" />, budgetLimit: 2000, spent: 850, color: '#EF4444' },
    { id: '7', name: lang === 'th' ? 'การศึกษา' : 'Education', icon: <Book className="w-4 h-4" />, budgetLimit: 3000, spent: 1500, color: '#06B6D4' },
    { id: '8', name: lang === 'th' ? 'การลงทุน' : 'Investment', icon: <TrendingUp className="w-4 h-4" />, budgetLimit: 10000, spent: 10000, color: '#C7FF2E' },
  ]);

  // Calculate totals
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetLimit, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;
  const overallPercent = Math.min(100, (totalSpent / totalBudget) * 100);

  // Monthly data for trend chart
  const monthlyData = [
    { month: lang === 'th' ? 'ม.ค.' : 'Jan', budget: 37000, spent: 32000 },
    { month: lang === 'th' ? 'ก.พ.' : 'Feb', budget: 37000, spent: 35500 },
    { month: lang === 'th' ? 'มี.ค.' : 'Mar', budget: 37000, spent: 28900 },
    { month: lang === 'th' ? 'เม.ย.' : 'Apr', budget: 37000, spent: 34200 },
    { month: lang === 'th' ? 'พ.ค.' : 'May', budget: 37000, spent: 31560 },
    { month: lang === 'th' ? 'มิ.ย.' : 'Jun', budget: 37000, spent: 0 },
  ];

  // Find categories over budget
  const overBudgetCategories = categories.filter(cat => cat.spent > cat.budgetLimit);
  const nearLimitCategories = categories.filter(cat => {
    const percent = (cat.spent / cat.budgetLimit) * 100;
    return percent >= 80 && percent < 100;
  });

  // Savings goals
  const [savingsGoals] = useState([
    { id: '1', name: lang === 'th' ? 'กองทุนฉุกเฉิน' : 'Emergency Fund', target: 50000, current: 32500, deadline: '2026-09' },
    { id: '2', name: lang === 'th' ? 'ทองคำ 1 บาท' : 'Gold Bar 1 Baht', target: 35000, current: 35000, deadline: '2026-06' },
    { id: '3', name: lang === 'th' ? 'วันหยุดปลายปี' : 'Year-End Vacation', target: 25000, current: 12500, deadline: '2026-12' },
    { id: '4', name: lang === 'th' ? 'แล็ปท็อปใหม่' : 'New Laptop', target: 45000, current: 8000, deadline: '2027-03' },
  ]);

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
            {lang === 'th' ? 'จัดการงบประมาณ' : 'Budget Management'}
          </h2>
          <p className="text-xs text-zinc-500 font-mono tracking-wider">
            {lang === 'th' ? 'วางแผนและติดตามการใช้จ่ายอย่างชาญฉลาด' : 'PLAN & TRACK YOUR SPENDING INTELLIGENTLY'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-dark-card border border-zinc-800/80">
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
              {lang === 'th' ? 'คงเหลือ' : 'Remaining'}
            </p>
            <p className={`text-sm font-display font-bold ${remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
          {overBudgetCategories.length > 0 && (
            <button
              onClick={() => setShowAlert(true)}
              className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
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
              ? (theme === 'dark' ? 'bg-[#C7FF2E] text-black font-semibold' : 'bg-white text-[#1D1D1F] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5')
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
              ? (theme === 'dark' ? 'bg-[#C7FF2E] text-black font-semibold' : 'bg-white text-[#1D1D1F] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5')
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
              ? (theme === 'dark' ? 'bg-[#C7FF2E] text-black font-semibold' : 'bg-white text-[#1D1D1F] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5')
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
                  <p className="text-lg font-display font-bold text-white">21</p>
                </div>
                <div className="p-4 text-center bg-dark-card/50 border-l border-zinc-800/30">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    {lang === 'th' ? 'เฉลี่ย/วัน' : 'Avg/Day'}
                  </p>
                  <p className="text-lg font-display font-bold text-white">{formatCurrency(Math.round(totalSpent / 10))}</p>
                </div>
                <div className="p-4 text-center bg-dark-card/50 border-l border-zinc-800/30">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    {lang === 'th' ? 'การคาดการณ์' : 'Projected'}
                  </p>
                  <p className={`text-lg font-display font-bold ${overallPercent > 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {formatCurrency(Math.round((totalSpent / 10) * 30))}
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
                            className={`w-full rounded-sm ${isOver ? 'bg-red-500/80' : 'bg-brand/60'}`}
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
            <div className={`rounded-2xl border ${theme === 'dark' ? 'bg-gradient-to-br from-[#1A1D26] to-[#131416] border-zinc-800/50' : 'bg-white border-zinc-200'}`} id="budget-ai-card">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-brand uppercase tracking-widest mb-1">
                      AI {lang === 'th' ? 'คำแนะนำ' : 'Recommendation'}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {lang === 'th'
                        ? 'คุณใช้จ่ายในหมวดช้อปปิ้งเกินงบ 30% แนะนำให้ตั้งกฎ "หยุดชะลอ" 7 วันก่อนซื้อของที่ไม่จำเป็น'
                        : 'You\'ve overspent on Shopping by 30%. Consider setting a 7-day "cooling off" rule before non-essential purchases.'}
                    </p>
                    <button className="mt-3 px-4 py-2 rounded-lg bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/20 transition-colors">
                      {lang === 'th' ? 'ตั้งกฎคูลดาวน์' : 'Set Cooling Rule'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                        style={{ backgroundColor: `${cat.color}20` }}
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
                        <button 
                          onClick={() => setEditingCategory(cat)}
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
              onClick={() => setShowAddModal(true)}
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
                  <input
                    type="text"
                    defaultValue={editingCategory?.name || ''}
                    placeholder={lang === 'th' ? 'เช่น อาหาร, การเดินทาง' : 'e.g. Food, Transport'}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">
                    {lang === 'th' ? 'งบประมาณรายเดือน' : 'Monthly Budget'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">฿</span>
                    <input
                      type="number"
                      defaultValue={editingCategory?.budgetLimit || ''}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-brand text-black font-semibold hover:bg-brand-muted transition-colors flex items-center justify-center gap-2">
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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-dark-card border border-red-500/30 rounded-2xl p-6 z-50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-400" />
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
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                    <span className="text-sm text-zinc-300">{cat.icon} {cat.name}</span>
                    <span className="text-sm font-mono font-bold text-red-400">
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
