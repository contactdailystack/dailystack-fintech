import { useState } from 'react';
import {
  Briefcase, CreditCard, Tag, Award, Sliders, Layers,
  Settings, Database, LogOut, Check, AlertTriangle, Shield
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import { translations, Language } from '../data/translations';

interface MorePageProps {
  profile: UserProfile;
  transactions: Transaction[];
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  onLogout: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onNavigateToSection: (section: any) => void;
}

export default function MorePage({
  profile,
  transactions,
  onUpdateProfile,
  onLogout,
  lang,
  setLang,
  onNavigateToSection
}: MorePageProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'menu' | 'workspace' | 'accounts' | 'categories' | 'goals' | 'budget' | 'subscriptions' | 'settings'>('menu');

  // Interactive settings state
  const [profileName, setProfileName] = useState(profile.name);
  const [profileEmail, setProfileEmail] = useState(profile.email);
  const [avatarUrlInput, setAvatarUrlInput] = useState(profile.avatarUrl);

  // Custom workspaces state
  const [workspaces, setWorkspaces] = useState<string[]>([
    'Personal', 'Business', 'Side Hustle', 'Family', 'Travel', 'Investment'
  ]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [activeWorkspace, setActiveWorkspace] = useState('Personal');

  // Custom Accounts state
  const [accounts, setAccounts] = useState([
    { id: 'acc_1', name: 'Cash Account', type: 'Checking', balance: 5420.50, color: 'from-blue-500 to-indigo-600' },
    { id: 'acc_2', name: 'Sovereign Reserve Vault', type: 'Savings', balance: 204470.71, color: 'from-cyan-500 to-blue-600' },
    { id: 'acc_3', name: 'Primary Investment Portfolio', type: 'Brokerage', balance: 4389.80, color: 'from-purple-500 to-pink-500' },
  ]);
  const [newAccName, setNewAccName] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');

  // Custom Categories state
  const [categories, setCategories] = useState<string[]>([
    'Technology', 'Transportation', 'Socializing', 'Groceries', 'Utilities', 'Wellness', 'Leisure', 'Subscriptions'
  ]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Custom Goals list
  const [goals, setGoals] = useState([
    { id: 'g1', title: 'Emergency Core Fund', target: 50000, current: 40000, desc: '6 months of secure survival runway' },
    { id: 'g2', title: 'AI Venture Capital', target: 150000, current: 85000, desc: 'Bootstrap funding for autonomous SaaS' },
    { id: 'g3', title: 'Asset Freedom Matrix', target: 1000000, current: 209891, desc: 'Self-sustaining decentralized capital' }
  ]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');

  // Custom Subscriptions state
  const [subscriptions, setSubscriptions] = useState([
    { id: 'sub_1', name: 'AI Decision Engine (GPT-4o/Gemini Pro)', amount: 49.00, cycle: 'Monthly', billingCycle: 'Monthly' as const },
    { id: 'sub_2', name: 'Core Cloud Sync Storage', amount: 12.00, cycle: 'Monthly', billingCycle: 'Monthly' as const },
    { id: 'sub_3', name: 'Premium News & Research Term', amount: 25.00, cycle: 'Monthly', billingCycle: 'Monthly' as const },
    { id: 'sub_4', name: 'PicksWise OS V5.2 License', amount: 120.00, cycle: 'Yearly', billingCycle: 'Yearly' as const }
  ]);

  // P0-B Fix: Calculate monthly equivalent accounting for billing cycle
  const getMonthlyEquivalent = (sub: { amount: number; billingCycle: string }) => {
    if (sub.billingCycle === 'Yearly') return sub.amount / 12;
    if (sub.billingCycle === 'Weekly') return sub.amount * 4.33;
    return sub.amount;
  };

  const monthlySubscriptionTotal = subscriptions.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');

  // Budget system metrics
  const [budgets, setBudgets] = useState([
    { category: 'Technology', limit: 2000, spent: 1299 },
    { category: 'Socializing', limit: 800, spent: 540 },
    { category: 'Transportation', limit: 400, spent: 185 },
    { category: 'Groceries', limit: 600, spent: 390 }
  ]);
  const [newBudgetCat, setNewBudgetCat] = useState('Groceries');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ 
      name: profileName, 
      email: profileEmail,
      avatarUrl: avatarUrlInput
    });
    triggerToast(lang === 'en' ? 'Profile configuration saved successfully' : 'บันทึกข้อมูลภาพลักษณ์เรียบร้อยแล้ว');
  };

  const handleAddWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    if (workspaces.includes(newWorkspaceName.trim())) {
      triggerToast(lang === 'en' ? 'Workspace already exists' : 'สเปซการทำงานนี้มีอยู่แล้วในระบบ');
      return;
    }
    setWorkspaces([...workspaces, newWorkspaceName.trim()]);
    triggerToast(`Workspace "${newWorkspaceName}" created`);
    setNewWorkspaceName('');
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balNum = parseFloat(newAccBalance);
    if (!newAccName.trim() || isNaN(balNum)) return;
    const newAcc = {
      id: `acc_${Date.now()}`,
      name: newAccName,
      type: 'Custom',
      balance: balNum,
      color: 'from-[#050A14] to-blue-900 border-2 border-slate-700'
    };
    setAccounts([...accounts, newAcc]);
    onUpdateProfile({ balance: profile.balance + balNum });
    triggerToast(`Account "${newAccName}" with $${balNum.toLocaleString()} registered`);
    setNewAccName('');
    setNewAccBalance('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      triggerToast(lang === 'en' ? 'Category already exists' : 'หมวดหมู่นี้มีอยู่ในระบบอยู่แล้ว');
      return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    triggerToast(`Category "${newCategoryName}" added`);
    setNewCategoryName('');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(newGoalTarget);
    if (!newGoalTitle.trim() || isNaN(targetVal)) return;
    const nGoal = {
      id: `goal_${Date.now()}`,
      title: newGoalTitle,
      target: targetVal,
      current: 0,
      desc: newGoalDesc || 'Custom financial decision landmark'
    };
    setGoals([...goals, nGoal]);
    triggerToast(`Decision Goal "${newGoalTitle}" formulated`);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalDesc('');
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newSubAmount);
    if (!newSubName.trim() || isNaN(amt)) return;
    const nSub = {
      id: `sub_${Date.now()}`,
      name: newSubName,
      amount: amt,
      cycle: 'Monthly',
      billingCycle: 'Monthly' as const
    };
    setSubscriptions([...subscriptions, nSub]);
    triggerToast(`Subscription "${newSubName}" tracked successfully`);
    setNewSubName('');
    setNewSubAmount('');
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newBudgetLimit);
    if (!newBudgetCat || isNaN(limitNum)) return;
    
    // Check if category already has budget
    const exists = budgets.find(b => b.category === newBudgetCat);
    if (exists) {
      setBudgets(budgets.map(b => b.category === newBudgetCat ? { ...b, limit: limitNum } : b));
      triggerToast(`Budget for ${newBudgetCat} updated to $${limitNum}`);
    } else {
      setBudgets([...budgets, { category: newBudgetCat, limit: limitNum, spent: 0 }]);
      triggerToast(`Budget for ${newBudgetCat} set at $${limitNum}`);
    }
    setNewBudgetLimit('');
  };

  return (
    <div id="more-architect-viewport" className="space-y-6 md:space-y-8 animate-slide-up text-left">
      
      {/* Toast message panel */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 border px-4 py-3 rounded-2xl flex items-center gap-2 shadow-2xl bg-[#0E162B] border-blue-500/40 text-blue-250 text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header section with back navigation if in sub-section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1">
          {activeTab !== 'menu' ? (
            <button 
              onClick={() => setActiveTab('menu')}
              className="text-[10px] uppercase font-mono tracking-widest text-[#3B82F6] hover:underline flex items-center gap-1 cursor-pointer mb-1.5"
            >
              ← {lang === 'en' ? 'Back to More Options' : 'กลับสู่รายการ'}
            </button>
          ) : null}
          <h2 className="font-display font-extrabold text-2xl text-white">
            {activeTab === 'menu' && (lang === 'en' ? 'More Capabilities' : 'ความสามารถเพิ่มเติม')}
            {activeTab === 'workspace' && (lang === 'en' ? 'Sovereign Workspaces' : 'ขอบเขตงานสะสมสินทรัพย์')}
            {activeTab === 'accounts' && (lang === 'en' ? 'Decision Liquidity Accounts' : 'บัญชีสภาพคล่องการเงิน')}
            {activeTab === 'categories' && (lang === 'en' ? 'Decision Class Categories' : 'หมวดหมู่ประเภทการใช้จ่าย')}
            {activeTab === 'goals' && (lang === 'en' ? 'Future Decision Goals' : 'เป้าหมายอิสรภาพการเงิน')}
            {activeTab === 'budget' && (lang === 'en' ? 'Cognitive Budgets' : 'กรอบการจองแผนงบใช้จ่าย')}
            {activeTab === 'subscriptions' && (lang === 'en' ? 'Subscription Intelligence' : 'สารสบบวิวัฒนาการชำระเงิน')}
            {activeTab === 'settings' && (lang === 'en' ? 'Credentials & Preferences' : 'ข้อมูลพอร์ตและสิทธิเข้าถึง')}
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
            {activeTab === 'menu' && (lang === 'en' ? 'Decentralized configuration parameters for secure access' : 'แผงควบคุมระบบคลังและขีดความสามารถการตัดสินใจ')}
            {activeTab !== 'menu' && `PICKSWISE 5.2 • CONFIGURATION MATRIX`}
          </p>
        </div>

        {/* Global stats overview in More menu */}
        <div className="flex items-center gap-4 bg-[#0E162B] border border-slate-900 px-4 py-2 rounded-2xl">
          <div className="text-left">
            <span className="block text-[8px] font-mono text-zinc-500 uppercase">Decision Streak</span>
            <span className="block font-display font-black text-xs text-[#3B82F6]">12 Days Run</span>
          </div>
          <div className="w-px h-8 bg-slate-900" />
          <div className="text-left">
            <span className="block text-[8px] font-mono text-zinc-500 uppercase">Allocated Net</span>
            <span className="block font-display font-black text-xs text-white">${profile.balance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="more-option-grid">
          
          {/* Option: Sovereign Database Visualizer */}
          <div 
            onClick={() => onNavigateToSection('database')}
            className="border border-slate-900 rounded-[24px] p-5 bg-[#0E162B]/80 hover:bg-[#0E162B] hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-[60px]" />
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#3B82F6] font-bold">SQL Relational</span>
            </div>
            <div className="mt-4 text-left">
              <h3 className="text-white font-display font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors">Sovereign Database</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Direct read-only inspection of the active Client SQL memory and normalized schema nodes.</p>
            </div>
          </div>

          {/* Option: Workspace Selector */}
          <div 
            onClick={() => setActiveTab('workspace')}
            className="border border-slate-900 rounded-[24px] p-5 bg-[#0E162B]/80 hover:bg-[#0E162B] hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-450">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#3B82F6] font-bold">{workspaces.length} Spaces</span>
            </div>
            <div className="mt-4 text-left">
              <h3 className="text-white font-display font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors">Sovereign Workspaces</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Manage, divide and filter expenditures securely inside Personal, Business or Hobby containers.</p>
            </div>
          </div>

          {/* Option: Accounts */}
          <div 
            onClick={() => setActiveTab('accounts')}
            className="border border-slate-900 rounded-[24px] p-5 bg-[#0E162B]/80 hover:bg-[#0E162B] hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#3B82F6] font-bold">Safe Ledger</span>
            </div>
            <div className="mt-4 text-left">
              <h3 className="text-white font-display font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors">Decision Liquidity Accounts</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Oversee liquid cash repositories, credit assets and active brokerage multipliers.</p>
            </div>
          </div>

          {/* Option: Categories */}
          <div 
            onClick={() => setActiveTab('categories')}
            className="border border-slate-900 rounded-[24px] p-5 bg-[#0E162B]/80 hover:bg-[#0E162B] hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                <Tag className="w-5 h-5" />
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#3B82F6] font-bold">{categories.length} Classes</span>
            </div>
            <div className="mt-4 text-left">
              <h3 className="text-white font-display font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors">Design Class Categories</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Refine and custom-engineer categories to fit actual lifestyle choices and logical habit groups.</p>
            </div>
          </div>

          {/* Option: Goals */}
          <div 
            onClick={() => setActiveTab('goals')}
            className="border border-slate-900 rounded-[24px] p-5 bg-[#0E162B]/80 hover:bg-[#0E162B] hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#3B82F6] font-bold">Action Landmarks</span>
            </div>
            <div className="mt-4 text-left">
              <h3 className="text-white font-display font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors">Future Decision Goals</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Set, track and support compound targets through direct emotional budgeting redirection.</p>
            </div>
          </div>

          {/* Option: Budget */}
          <div 
            onClick={() => setActiveTab('budget')}
            className="border border-slate-900 rounded-[24px] p-5 bg-[#0E162B]/80 hover:bg-[#0E162B] hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6]">
                <Sliders className="w-5 h-5" />
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#3B82F6] font-bold">Dynamic Caps</span>
            </div>
            <div className="mt-4 text-left">
              <h3 className="text-white font-display font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors">Cognitive Budgets</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Pre-reserve limits on high dopamine channels to secure continuous monthly savings.</p>
            </div>
          </div>

          {/* Option: Subscriptions */}
          <div 
            onClick={() => setActiveTab('subscriptions')}
            className="border border-slate-900 rounded-[24px] p-5 bg-[#0E162B]/80 hover:bg-[#0E162B] hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-widest font-bold text-cyan-400">${monthlySubscriptionTotal.toLocaleString()}/mo</span>
            </div>
            <div className="mt-4 text-left">
              <h3 className="text-white font-display font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors">Subscription Intelligence</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Audit recurring commitments, cancel low utility platforms, and maintain lean digital overhead.</p>
            </div>
          </div>

          {/* Option: Settings & Credentials */}
          <div 
            onClick={() => setActiveTab('settings')}
            className="border border-slate-900 rounded-[24px] p-5 bg-[#0E162B]/80 hover:bg-[#0E162B] hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-xl bg-zinc-500/10 text-zinc-400">
                <Settings className="w-5 h-5" />
              </div>
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-[#3B82F6] font-bold">Credentials</span>
            </div>
            <div className="mt-4 text-left">
              <h3 className="text-white font-display font-bold text-sm leading-snug group-hover:text-blue-400 transition-colors">Credentials & Preferences</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Change master metadata, switch languages, trigger sandbox reset or de-authenticate session.</p>
            </div>
          </div>

        </div>
      )}

      {/* SUB-SECTION VIEW: Workspace Selector */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-1 lg:col-span-7 border border-slate-900 rounded-[32px] p-6 bg-[#0E162B]">
            <h3 className="font-display font-bold text-white text-base mb-4">Active Workspace Configuration</h3>
            <div className="grid grid-cols-2 gap-3" id="ws-switcher-box">
              {workspaces.map((ws, i) => (
                <div 
                  key={i}
                  id={`ws-sel-${ws.toLowerCase()}`}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    triggerToast(`Switched active environment to "${ws}"`);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex justify-between items-center ${activeWorkspace === ws ? 'border-blue-500 bg-blue-500/5 text-white' : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:border-slate-800'}`}
                >
                  <div className="space-y-1">
                    <span className="block text-xs font-semibold">{ws}</span>
                    <span className="block text-[9px] font-mono text-zinc-500 uppercase">
                      {transactions.filter(t => t.workspace === ws).length} Decisions Loaded
                    </span>
                  </div>
                  {activeWorkspace === ws && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-5 border border-slate-900 rounded-[32px] p-6 bg-[#0E162B]">
            <h3 className="font-display font-bold text-white text-sm mb-4">Initialize New Workspace</h3>
            <form onSubmit={handleAddWorkspace} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Name</label>
                <input 
                  type="text"
                  required
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g. Creator Fund"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#3B82F6] hover:opacity-95 text-black font-semibold font-display text-xs py-3 rounded-xl transition-all uppercase tracking-wider"
              >
                Create Workspace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-SECTION VIEW: Accounts */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-1 lg:col-span-7 space-y-4">
            <h3 className="font-display font-bold text-white text-base mb-1">Ledger Assets</h3>
            {accounts.map((acc, i) => (
              <div key={i} className="border border-slate-900 rounded-3xl p-5 bg-[#0E162B] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#3B82F6]">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block font-display font-extrabold text-sm text-white">{acc.name}</span>
                    <span className="block text-[10px] font-mono text-zinc-500 uppercase">{acc.type} Ledger Node</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-display font-black text-base text-white">${acc.balance.toLocaleString()}</span>
                  <span className="block text-[8px] font-mono text-emerald-400">ACTIVE MULTIPLIER</span>
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-1 lg:col-span-5 border border-slate-900 rounded-[32px] p-6 bg-[#0E162B] space-y-4">
            <h3 className="font-display font-bold text-white text-sm mb-2">Configure Liquidity Repository</h3>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Repository Title</label>
                <input 
                  type="text"
                  required
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="e.g. Coinbase Crypto Vault"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Starting Liquidity (USD)</label>
                <input 
                  type="number"
                  required
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#3B82F6] hover:opacity-95 text-black font-semibold font-display text-xs py-3 rounded-xl transition-all uppercase tracking-wider"
              >
                Register Account Source
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-SECTION VIEW: Categories */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-1 lg:col-span-7 border border-slate-900 rounded-[32px] p-6 bg-[#0E162B]">
            <h3 className="font-display font-bold text-white text-base mb-4">Supported Category Nodes</h3>
            <div className="flex flex-wrap gap-2" id="cat-chips-wrap">
              {categories.map((cat, i) => (
                <div key={i} className="px-4 py-2.5 rounded-2xl border border-slate-900 bg-slate-950/40 text-xs font-mono text-zinc-300 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{cat}</span>
                  <button 
                    onClick={() => {
                      setCategories(categories.filter(c => c !== cat));
                      triggerToast(`Category "${cat}" decommissioned`);
                    }}
                    className="text-zinc-650 hover:text-white transition-colors cursor-pointer text-xs ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-5 border border-slate-900 rounded-[32px] p-6 bg-[#0E162B]">
            <h3 className="font-display font-bold text-white text-sm mb-4">Formulate Custom Class</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Class Name</label>
                <input 
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Late Night Indulgence"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#3B82F6] hover:opacity-95 text-black font-semibold font-display text-xs py-3 rounded-xl transition-all uppercase tracking-wider"
              >
                Add Category Class
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-SECTION VIEW: Goals */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-1 lg:col-span-7 space-y-5">
            <h3 className="font-display font-bold text-white text-base mb-1">Interactive Financial Landmarks</h3>
            {goals.map((g, i) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <div key={i} className="border border-slate-900 rounded-3xl p-5 bg-[#0E162B] space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="text-left space-y-0.5">
                      <h4 className="font-display font-extrabold text-sm text-white">{g.title}</h4>
                      <p className="text-[11px] text-zinc-400">{g.desc}</p>
                    </div>
                    <span className="font-mono text-[10px] text-[#3B82F6] font-bold">{pct}% Achieved</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                      <span>${g.current.toLocaleString()} saved</span>
                      <span>Target: ${g.target.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Redirection tool */}
                  <div className="pt-2 border-t border-slate-950 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-zinc-500 uppercase">Redirect dopamine flows</span>
                    <button 
                      onClick={() => {
                        setGoals(goals.map((item, idx) => {
                          if (idx === i && profile.balance > 100) {
                            return { ...item, current: item.current + 100 };
                          }
                          return item;
                        }));
                        onUpdateProfile({ balance: profile.balance - 100 });
                        triggerToast(`Redirected $100 emotional budget into: ${g.title}`);
                      }}
                      className="text-[#3B82F6] hover:underline flex items-center gap-1 text-[10px] font-bold"
                    >
                      Allocate +$100 Now →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="col-span-1 lg:col-span-5 border border-slate-900 rounded-[32px] p-6 bg-[#0E162B] space-y-4">
            <h3 className="font-display font-bold text-white text-sm">Formulate Growth Objective</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Goal Landmark Title</label>
                <input 
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Tokyo Design Retreat"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Target Value (USD)</label>
                <input 
                  type="number"
                  required
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Short Intention Pitch</label>
                <input 
                  type="text"
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  placeholder="Why does this decision matter?"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#3B82F6] hover:opacity-95 text-black font-semibold font-display text-xs py-3 rounded-xl transition-all uppercase tracking-wider"
              >
                Formulate Goal Landmark
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-SECTION VIEW: Subscriptions */}
      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-1 lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-display font-bold text-white text-base">Active Commitments</h3>
              <span className="font-mono text-xs text-blue-400 font-bold bg-[#3B82F6]/5 px-3 py-1 rounded-full border border-blue-500/10">
                Sum: ${monthlySubscriptionTotal.toLocaleString()}/month (billing cycle adjusted)
              </span>
            </div>
            
            {subscriptions.map((sub, i) => (
              <div key={i} className="border border-slate-900 rounded-3xl p-5 bg-[#0E162B] flex items-center justify-between">
                <div className="text-left space-y-1">
                  <span className="block font-display font-extrabold text-sm text-white">{sub.name}</span>
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase">Automatic Recurring: {sub.cycle}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display font-black text-sm text-white">${getMonthlyEquivalent(sub).toFixed(2)}/mo</span>
                  <button 
                    onClick={() => {
                      setSubscriptions(subscriptions.filter(s => s.id !== sub.id));
                      triggerToast(`Subscription "${sub.name}" audited and cancelled`);
                    }}
                    className="p-2 border border-slate-900 hover:border-red-500/30 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all cursor-pointer font-bold text-xs"
                    title="Audited / Cancel subscription"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-1 lg:col-span-5 border border-slate-900 rounded-[32px] p-6 bg-[#0E162B] space-y-4">
            <h3 className="font-display font-bold text-white text-sm">Add Recurring Commitment</h3>
            <form onSubmit={handleAddSub} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Service Name</label>
                <input 
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Adobe Creative Cloud"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Monthly Amount (USD)</label>
                <input 
                  type="number"
                  required
                  value={newSubAmount}
                  onChange={(e) => setNewSubAmount(e.target.value)}
                  placeholder="e.g. 54"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#3B82F6] hover:opacity-95 text-black font-semibold font-display text-xs py-3 rounded-xl transition-all uppercase tracking-wider"
              >
                Register Subscription
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-SECTION VIEW: Budget */}
      {activeTab === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="col-span-1 lg:col-span-7 space-y-4">
            <h3 className="font-display font-bold text-white text-base mb-1">Interactive Expense Safeguards</h3>
            
            {budgets.map((b, i) => {
              const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
              const exceeds = b.spent > b.limit;
              return (
                <div key={i} className="border border-slate-900 rounded-3xl p-5 bg-[#0E162B] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-display font-extrabold text-sm text-white">{b.category} Cap</span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      ${b.spent} spent of ${b.limit} Limit
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${exceeds ? 'bg-amber-400' : 'bg-blue-500'}`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className={`flex items-center gap-1 ${exceeds ? 'text-amber-400' : 'text-zinc-500'}`}>
                        {exceeds
                          ? <><AlertTriangle className="w-3 h-3" /> DANGER: Cap breached</>
                          : <><Shield className="w-3 h-3" /> Safe space remaining</>
                        }
                      </span>
                      <span className="text-zinc-500">{pct}% utilized</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="col-span-1 lg:col-span-5 border border-slate-900 rounded-[32px] p-6 bg-[#0E162B] space-y-4">
            <h3 className="font-display font-bold text-white text-sm">Create Safety Cap</h3>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Target Category</label>
                <select
                  value={newBudgetCat}
                  onChange={(e) => setNewBudgetCat(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white font-mono"
                >
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Limit (Monthly USD)</label>
                <input 
                  type="number"
                  required
                  value={newBudgetLimit}
                  onChange={(e) => setNewBudgetLimit(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#3B82F6] hover:opacity-95 text-black font-semibold font-display text-xs py-3 rounded-xl transition-all uppercase tracking-wider"
              >
                Impose Budget Cap
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-SECTION VIEW: Settings / Credentials */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Identity edit parameters */}
          <div className="col-span-1 lg:col-span-7 border border-slate-900 rounded-[32px] p-6 bg-[#0E162B] space-y-6">
            <h3 className="font-display font-bold text-white text-base">Identity Matrix Configuration</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{t.legalName}</label>
                <input 
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{t.commsRoute}</label>
                <input 
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Avatar Picture Anchor URL</label>
                <input 
                  type="url"
                  required
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-xs bg-slate-950 border-slate-900 focus:outline-none focus:border-blue-500 text-white font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-950 flex justify-between items-center">
                <button 
                  type="button"
                  onClick={onLogout}
                  className="text-red-400 font-mono text-[10px] font-extrabold uppercase hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Deauthenticate Session
                </button>
                <button 
                  type="submit"
                  className="bg-[#3B82F6] hover:opacity-95 text-black font-semibold font-display text-[10px] px-5 py-3 rounded-xl uppercase tracking-wider"
                >
                  Commit Modifications
                </button>
              </div>
            </form>
          </div>

          <div className="col-span-1 lg:col-span-5 space-y-6">
            
            {/* Preferences / Languages */}
            <div className="border border-slate-900 rounded-[32px] p-6 bg-[#0E162B] space-y-4">
              <h3 className="font-display font-bold text-white text-xs uppercase tracking-widest text-[#3B82F6]">Localization Parameters</h3>
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-xs font-bold text-zinc-300">System Language</span>
                  <span className="block text-[8px] font-mono text-zinc-500 uppercase">Interactive multiplier</span>
                </div>
                <div className="flex border border-slate-900 rounded-xl overflow-hidden bg-slate-950">
                  <button 
                    onClick={() => setLang('en')}
                    className={`px-3 py-1.5 text-[10px] font-bold font-mono transition-all ${lang === 'en' ? 'bg-[#3B82F6] text-black' : 'text-zinc-500 bg-transparent'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLang('th')}
                    className={`px-3 py-1.5 text-[10px] font-bold font-mono transition-all ${lang === 'th' ? 'bg-[#3B82F6] text-black' : 'text-zinc-500 bg-transparent'}`}
                  >
                    TH
                  </button>
                </div>
              </div>
            </div>

            {/* Secure compliance information */}
            <div className="p-5 rounded-[24px] border border-slate-900 border-dashed text-xs font-mono space-y-2 text-left bg-[#0E162B]/40 text-zinc-500">
              <span className="uppercase text-[9px] tracking-widest font-bold block text-[#3B82F6]">{t.secureEncryptionTitle}</span>
              <p className="text-[10px] leading-relaxed">
                {t.secureEncryptionPitch}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
