import { useState, useEffect, ReactNode } from 'react';
import {
  Search, PlusCircle, AlertCircle, Sparkles, Trophy, Calendar, CheckCircle2, Flame, X, Tag, Settings, Sliders, MapPin, Flag, Briefcase,
  Shield, Lightbulb, Brain, UtensilsCrossed, Laptop, RefreshCw, Car, Wine, Dumbbell, TrendingUp,
  AlertTriangle, Flower2, Users, Zap, MessageCircle
} from 'lucide-react';
import { Transaction, UserProfile, Emotion } from '../types';
import { Language } from '../data/translations';
import { useAuthContext } from '../services/AuthContext';
import { recordStreakDay, addPositiveXP } from '../services/fbisService';

interface ActivityPageProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  profile: UserProfile;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  lang: Language;
}

export default function ActivityPage({
  transactions,
  onAddTransaction,
  profile,
  onUpdateProfile,
  lang
}: ActivityPageProps) {
  const { refreshFBIS } = useAuthContext();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('All');
  
  // Custom Transaction Drawer / Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Dining');
  const [amount, setAmount] = useState('');
  const [emotion, setEmotion] = useState<Emotion>('Value');
  const [why, setWhy] = useState('');
  const [formError, setFormError] = useState('');

  // Version 5.0 Adaptive Form Builder states
  const [activeFormFields, setActiveFormFields] = useState<Record<string, boolean>>({
    emotion: true,
    intent: true,
    location: false,
    priority: false,
    project: false
  });
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Expanded fields values
  const [intent, setIntent] = useState<'Need' | 'Want' | 'Convenience' | 'Reward' | 'Emergency' | 'Investment' | 'Learning' | 'Relationship' | 'Business'>('Want');
  const [workspace, setWorkspace] = useState<string>('Personal');
  const [locationValue, setLocationValue] = useState('');
  const [priorityValue, setPriorityValue] = useState('Medium');
  const [projectValue, setProjectValue] = useState('');

  // AI Predictive Pattern suggestion state
  const [aiPresetPattern, setAiPresetPattern] = useState<{
    category: string;
    emotion: 'Impulse' | 'Joy' | 'Stress' | 'Social' | 'Value' | 'Investment' | 'Happy' | 'Stressed' | 'Bored' | 'Rewarding' | 'Motivated' | 'Anxious' | 'Neutral';
    intent: 'Need' | 'Want' | 'Convenience' | 'Reward' | 'Emergency' | 'Investment' | 'Learning' | 'Relationship' | 'Business';
    workspace: string;
    why: string;
    matchingTerm: string;
  } | null>(null);

  // Monitor merchant input to calculate smart prefill suggestions in real-time
  useEffect(() => {
    const lowercaseMerchant = merchant.toLowerCase();
    if (!lowercaseMerchant.trim()) {
      setAiPresetPattern(null);
      return;
    }

    if (lowercaseMerchant.includes('starbucks') || lowercaseMerchant.includes('coffee') || lowercaseMerchant.includes('boba') || lowercaseMerchant.includes('milktea') || lowercaseMerchant.includes('cafe')) {
      setAiPresetPattern({
        category: 'Dining',
        emotion: 'Impulse',
        intent: 'Want',
        workspace: 'Personal',
        why: 'Midday dopamine seeking coffee drop-in.',
        matchingTerm: 'Coffee Impulse Wave'
      });
    } else if (lowercaseMerchant.includes('uber') || lowercaseMerchant.includes('lyft') || lowercaseMerchant.includes('grab') || lowercaseMerchant.includes('taxi') || lowercaseMerchant.includes('bolt')) {
      setAiPresetPattern({
        category: 'Transportation',
        emotion: 'Stress',
        intent: 'Convenience',
        workspace: 'Personal',
        why: 'Avoiding post-meeting fatigue via stress escape transit.',
        matchingTerm: 'Late Night Transit Outlay'
      });
    } else if (lowercaseMerchant.includes('gym') || lowercaseMerchant.includes('fitness') || lowercaseMerchant.includes('yoga') || lowercaseMerchant.includes('weights') || lowercaseMerchant.includes('workout')) {
      setAiPresetPattern({
        category: 'Health',
        emotion: 'Joy',
        intent: 'Need',
        workspace: 'Personal',
        why: 'Reinvesting baseline capital in physical fitness to boost long term lifespan.',
        matchingTerm: 'Cellular Lifespan Capitalizing'
      });
    } else if (lowercaseMerchant.includes('contract') || lowercaseMerchant.includes('freelance') || lowercaseMerchant.includes('client') || lowercaseMerchant.includes('invoice') || lowercaseMerchant.includes('payment')) {
      setAiPresetPattern({
        category: 'Investment',
        emotion: 'Investment',
        intent: 'Business',
        workspace: 'Business',
        why: 'Client contract milestone inbound cleared securely.',
        matchingTerm: 'Contractual Revenue Milestone'
      });
    } else if (lowercaseMerchant.includes('keyboard') || lowercaseMerchant.includes('gadget') || lowercaseMerchant.includes('ipad') || lowercaseMerchant.includes('headphone') || lowercaseMerchant.includes('amazon')) {
      setAiPresetPattern({
        category: 'Technology',
        emotion: 'Impulse',
        intent: 'Want',
        workspace: 'Side Hustle',
        why: 'Midnight tech-video FOMO triggered buy.',
        matchingTerm: 'Tech Collector Impulse Spike'
      });
    } else {
      setAiPresetPattern(null);
    }
  }, [merchant]);

  // Apply autofill trigger helper
  const handleApplyAiPreset = () => {
    if (!aiPresetPattern) return;
    setCategory(aiPresetPattern.category);
    setEmotion(aiPresetPattern.emotion);
    setIntent(aiPresetPattern.intent);
    setWorkspace(aiPresetPattern.workspace);
    setWhy(aiPresetPattern.why);
    
    // Auto-enable fields inside builder if suggestion includes them
    setActiveFormFields(prev => ({
      ...prev,
      emotion: true,
      intent: true
    }));
  };

  // Local Gamification States (saved in local memory or derived beautifully)
  // Let's derive a Behavioral XP and Level based on Mindful Actions
  const mindfulTxs = transactions.filter(tx => tx.emotion === 'Investment' || tx.emotion === 'Value' || tx.emotion === 'Joy');
  const reviewedTxsCount = transactions.filter(tx => tx.why && tx.why.length > 5).length;
  
  const xpGained = mindfulTxs.length * 20 + reviewedTxsCount * 15 + 420; // base starting XP
  const computedLevel = Math.floor(xpGained / 250) + 1;
  const xpInCurrentLevel = xpGained % 250;
  
  // Handlers
  const handleAddNewTx = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsedAmount = parseFloat(amount);
    if (!merchant.trim()) {
      setFormError(lang === 'en' ? 'Merchant name is required.' : 'กรุณาระบุกรณีหรือเป้าหมายผู้รับบริการ');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError(lang === 'en' ? 'Please enter a valid positive amount.' : 'กรุณาระบุจำนวนเงินที่ถูกต้องและมากกว่าศูนย์');
      return;
    }

    const isOutbound = emotion !== 'Investment'; // investment increases portfolio, others represent spendings
    const finalAmount = isOutbound ? -parsedAmount : parsedAmount;

    // Check if we have enough balance to spend
    if (parsedAmount > profile.balance) {
      setFormError(lang === 'en' ? 'Insufficient balance in your Core Vault.' : 'ยอดคงเหลือในห้องนิรภัยไม่เพียงพอต่อการทำรายการ');
      return;
    }

    // Auto-calculate Behavioral Category based on the combination of Category/Intent/Emotion
    let derivedBehavioralCategory: 'Essential' | 'Lifestyle' | 'Impulse' | 'Emotional' | 'Social' | 'Growth' | 'Investment' | 'Risk' | 'Reward' = 'Lifestyle';
    if (emotion === 'Investment') derivedBehavioralCategory = 'Investment';
    else if (emotion === 'Impulse') derivedBehavioralCategory = 'Impulse';
    else if (emotion === 'Stress' || emotion === 'Stressed' || emotion === 'Anxious') derivedBehavioralCategory = 'Emotional';
    else if (emotion === 'Social') derivedBehavioralCategory = 'Social';
    else if (intent === 'Need' && category === 'Health') derivedBehavioralCategory = 'Growth';
    else if (intent === 'Need') derivedBehavioralCategory = 'Essential';
    else if (intent === 'Reward') derivedBehavioralCategory = 'Reward';

    // Scores
    let riskScore = 12;
    let habitScore = 85;
    if (emotion === 'Impulse') {
      riskScore = 82;
      habitScore = 24;
    } else if (emotion === 'Stress' || emotion === 'Stressed') {
      riskScore = 60;
      habitScore = 45;
    } else if (emotion === 'Investment' || emotion === 'Value') {
      riskScore = 3;
      habitScore = 98;
    }

    // Add transaction logic using all 5 layers
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      merchant: merchant.trim(),
      category: category,
      amount: finalAmount,
      date: new Date().toISOString().split('T')[0],
      emotion: emotion,
      why: why.trim() || (lang === 'en' ? 'Logged mindfully.' : 'บันทึกด้วยความมีระเบียบวินัย'),
      status: 'completed',

      // Layer 2: Context Layer
      workspace: workspace,
      location: activeFormFields.location ? locationValue : undefined,
      timeOfDay: new Date().getHours() >= 21 ? 'Midnight' : (new Date().getHours() >= 17 ? 'Evening' : 'Afternoon'),
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()],

      // Layer 3: Behavior Layer
      intent: activeFormFields.intent ? intent : undefined,
      spendingType: finalAmount < 0 ? 'Outflow' : 'Inbound',
      motivation: emotion === 'Stress' || emotion === 'Stressed' ? 'Stress reduction' : (emotion === 'Impulse' ? 'Dopamine micro-spike seeking' : 'Practical utility'),
      trigger: emotion === 'Impulse' ? 'Visual prompt / FOMO' : 'Physical need',

      // Layer 4: AI Layer
      behavioralCategory: derivedBehavioralCategory,
      riskScore: riskScore,
      habitScore: habitScore,
      patternMatch: aiPresetPattern ? aiPresetPattern.matchingTerm : 'Unplanned Outflow',

      // Layer 5: Transformation Layer
      goalImpact: derivedBehavioralCategory === 'Investment' ? 'Optimizes Vanguard index speed by 11.2%' : (derivedBehavioralCategory === 'Impulse' ? 'Minor budget drift warning' : 'Normal routine balance'),
      behaviorImpact: derivedBehavioralCategory === 'Impulse' ? 'Dopamine levels inflation trigger' : 'Core stability index reinforced',
      financialHealthImpact: finalAmount > 0 ? 'Expands reserve capital multipliers' : 'Marginal utility subtraction',

      // Custom Fields map
      customFields: (activeFormFields.priority || activeFormFields.project) ? {
        ...(activeFormFields.priority ? { priority: priorityValue } : {}),
        ...(activeFormFields.project ? { project: projectValue } : {}),
      } : undefined
    };

    onAddTransaction(newTx);

    // Update profile balance or portfolio
    if (emotion === 'Investment') {
      onUpdateProfile({
        balance: profile.balance - parsedAmount, // move from cash to portfolio
        portfolioValue: profile.portfolioValue + parsedAmount
      });
    } else {
      onUpdateProfile({
        balance: profile.balance - parsedAmount
      });
    }

    // Record FBIS streak + positive XP — fire-and-forget
    (async () => {
      await recordStreakDay();
      if (derivedBehavioralCategory === 'Investment' || derivedBehavioralCategory === 'Growth') {
        await addPositiveXP('savings_milestone');
      } else if (parsedAmount <= profile.balance * 0.1) {
        await addPositiveXP('budget_goal_met');
      }
      await refreshFBIS();
    })();

    // Reset Form
    setMerchant('');
    setCategory('Dining');
    setAmount('');
    setEmotion('Value');
    setIntent('Want');
    setWorkspace('Personal');
    setLocationValue('');
    setPriorityValue('Medium');
    setProjectValue('');
    setWhy('');
    setShowAddForm(false);
  };

  // Pre-calculated stats for Gamification Journey
  const currentStreak = 7; // Daily Check in Streak
  const totalConsciousXP = xpGained;

  // Filter Logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.why.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion = selectedEmotion === 'All' || tx.emotion === selectedEmotion;
    return matchesSearch && matchesEmotion;
  });

  const emotionList = ['All', 'Impulse', 'Joy', 'Stress', 'Social', 'Value', 'Investment'];

  const emotionMetadata: Record<string, { label: string; labelTh: string; color: string; desc: string; descTh: string }> = {
    Impulse: { 
      label: 'Impulse', 
      labelTh: 'ความวู่วาม', 
      color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      desc: 'Spontaneous dopamine spikes, often regretted.',
      descTh: 'แรงสะกดอารมณ์ฉับพลัน มักส่งผลให้เสียใจภายหลัง'
    },
    Joy: { 
      label: 'Joy', 
      labelTh: 'ความรื่นเริงใจ', 
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      desc: 'Authentic joy and long-term health investments.',
      descTh: 'ความพึงพอใจที่แท้จริง ค้าขายสุขภาพหรืออัพเกรดกายภาพ'
    },
    Stress: { 
      label: 'Stress', 
      labelTh: 'ระบายอารมณ์', 
      color: 'bg-red-500/15 text-red-400 border-red-500/20',
      desc: 'Retail therapy to cope with fatigue or work anxiety.',
      descTh: 'บำบัดจิตคลาดคลายความตึงเครียดหรือความกังวล'
    },
    Social: { 
      label: 'Social', 
      labelTh: 'สังคมจำยอม', 
      color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
      desc: 'Spending driven by peer expectations or social setups.',
      descTh: 'แรงขับเคลื่อนระดับกลุ่มเพื่อนหรือการปะทะสังคม'
    },
    Value: { 
      label: 'Value', 
      labelTh: 'มูลค่าคุ้มครอง', 
      color: 'bg-lime-500/15 text-lime-400 border-lime-500/20',
      desc: 'Highly calculated utilities, essentials and assets.',
      descTh: 'ปัจจัยยังชีพขั้นพื้นฐาน การจ่ายที่คำนวณอย่างลุ่มลึก'
    },
    Investment: { 
      label: 'Investment', 
      labelTh: 'สัญชาตญาณลงพอร์ต', 
      color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      desc: 'Capital growth focused flow that locks in future returns.',
      descTh: 'กระแสเงินเพื่อทวีความมั่นคง ล็อคกำไรสำหรับอนาคต'
    }
  };

  return (
    <div id="activity-viewport" className="space-y-6 md:space-y-8 animate-slide-up text-left">
      
      {/* 1. Header Information Architecture area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="activity-header-bar">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">
            {lang === 'en' ? 'Behavioral Activity Ledger' : 'บัญชีจำแนกอารมณ์และพฤติกรรม'}
          </h2>
          <p className="text-xs text-zinc-500 font-mono tracking-wider">
            {lang === 'en' ? 'TRANSACTION INTELLIGENCE & COPING ECONOMY' : 'บันทึกกระแสเงินเชิงลึกพร้อมข้อมูลประเมินสภาพจิตใจ'}
          </p>
        </div>

        {/* Dynamic add transaction button */}
        <button
          id="btn-show-add-tx"
          onClick={() => setShowAddForm(true)}
          className="bg-brand text-black font-display font-bold text-xs px-5 py-3 rounded-2xl tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md pilo-glow-sm self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-black" />
          {lang === 'en' ? 'Record Mindful Spend' : 'บันทึกรายการใช้จ่ายใหม่'}
        </button>
      </div>

      {/* 2. Gamification Dashboard Widget Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="gamification-widget-layout">
        
        {/* Left Side: Growth level & XP */}
        <div className="lg:col-span-8 border rounded-[30px] p-6 bg-dark-card/90 border-dark-border shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[160px] transition-all hover:scale-[1.005] hover:border-brand/30 duration-350" id="gamified-stats-box">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-[100px] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-inner pilo-glow-emerald animate-bounce">
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-display font-black text-sm text-zinc-100 flex items-center gap-1.5 leading-tight">
                  {lang === 'en' ? `Level ${computedLevel}: Financial Shogun` : `เลเวล ${computedLevel}: ผู้พิทักษ์แห่งความมีวินัย`}
                  <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
                </h4>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5 max-w-sm">
                  {lang === 'en' ? 'Measuring psychological habits, not transaction volumes' : 'ผลงานวัดจากการหลีกเลี่ยง impulse และการสะสมยอดเก็บออม'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border hover:border-amber-500/40 duration-200 transition-colors">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse fill-amber-500" />
              <span className="font-mono text-xs font-black text-zinc-200">
                {currentStreak} {lang === 'en' ? 'Day Conscious Streak' : 'วัน รักษาใจคงที่'}
              </span>
            </div>
          </div>

          <div className="mt-6 z-10 text-left" id="xp-progress-wrapper">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-2">
              <span>{lang === 'en' ? 'Growth Progress (XP)' : 'ระดับกระแสสมองเสถียร (XP)'}</span>
              <span className="font-bold text-brand">{xpInCurrentLevel} / 250 XP ({totalConsciousXP} Totals)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-dark-bg border border-dark-border overflow-hidden p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-brand to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(199,255,46,0.3)]" 
                style={{ width: `${(xpInCurrentLevel / 250) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Active Growth Challenges */}
        <div className="lg:col-span-4 border rounded-[30px] p-5 bg-dark-card/90 border-dark-border shadow-xl flex flex-col justify-between hover:scale-[1.005] duration-350 transition-all hover:border-brand/20" id="active-challenges-box">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-brand animate-bounce" />
            <h4 className="font-mono text-[10px] font-bold uppercase text-brand tracking-wider">
              {lang === 'en' ? 'Active Growth Journey' : 'เป้าหมายและสัปดาห์ฝึกฝน'}
            </h4>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {/* Challenge 1 */}
            <div className="p-3 rounded-xl bg-dark-card/55 border border-dark-border/60 flex items-start gap-2.5 hover:bg-dark-card duration-250 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-100">{lang === 'en' ? 'Wednesday Cortisol Shield' : 'เกราะกำบังสารกดดันคืนวันพุธ'}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{lang === 'en' ? 'Pre-empt impulse electronics.' : 'ระงับการซื้อไอทีระเบิดอารมณ์สำเร็จ'}</p>
              </div>
            </div>

            {/* Challenge 2 */}
            <div className="p-3 rounded-xl bg-dark-card/35 border border-dark-border/40 flex items-start gap-2.5 opacity-80 hover:bg-dark-card hover:opacity-100 duration-250 transition-all">
              <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center text-[8px] font-bold text-zinc-500 flex-shrink-0 mt-0.5">
                2/3
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-200">{lang === 'en' ? 'Mindful Tagging' : 'ซื่อสัตย์รอยสลักอารมณ์'}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{lang === 'en' ? 'Explain psychological driver for 3 spends.' : 'อ้างอิงจิตใจเบื้องลึกต่อรายการใช้จ่าย 3 ครั้ง'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Filtering and Transaction List Box */}
      <div className="border rounded-[32px] p-6 bg-[#1A1D26]/90 border-[#2D313E] shadow-xl space-y-6" id="activity-main-container">
        
        {/* Filtering Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4" id="ledger-controls">
          
          {/* Text input search */}
          <div className="relative flex-1 max-w-sm" id="ledger-search">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="input-ledger-page-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'en' ? 'Search by merchant, why spent...' : 'ค้นหาเป้าหมาย, ประเด็นจิตใจ...'}
              className="w-full bg-dark-bg border border-dark-border text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/10 transition-all font-sans"
            />
          </div>

          {/* Emotional pill selectors */}
          <div className="flex flex-wrap items-center gap-1.5" id="emotion-pills-horizontal">
            {emotionList.map(emo => {
              const isActive = selectedEmotion === emo;
              const labelText = expressLabel(emo, lang);

              return (
                <button
                  id={`btn-filter-emo-${emo}`}
                  key={emo}
                  onClick={() => setSelectedEmotion(emo)}
                  className={`px-3 py-1.5 rounded-full font-mono text-[9px] font-bold uppercase transition-all tracking-wider border cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-brand to-emerald-400 text-black border-brand font-black shadow-md pilo-glow-sm' 
                      : 'bg-dark-card text-zinc-400 border-dark-border hover:text-white hover:bg-dark-border hover:scale-[1.02] active:scale-95 duration-150'
                  }`}
                >
                  {labelText}
                </button>
              );
            })}
          </div>

        </div>

        {/* Selected Emotion Description bar */}
        {selectedEmotion !== 'All' && emotionMetadata[selectedEmotion] && (
          <div className="p-3.5 rounded-2xl bg-dark-card/55 border border-dark-border flex items-center gap-2 text-xs" id="filtered-emotion-detail">
            <Lightbulb className="w-4 h-4 text-brand animate-pulse flex-shrink-0" />
            <p className="text-zinc-300">
              <strong className="text-brand uppercase tracking-widest text-[9px] font-mono mr-1.5">
                {lang === 'en' ? emotionMetadata[selectedEmotion].label : emotionMetadata[selectedEmotion].labelTh}:
              </strong>
              {lang === 'en' ? emotionMetadata[selectedEmotion].desc : emotionMetadata[selectedEmotion].descTh}
            </p>
          </div>
        )}

        {/* Micro-Ledger List */}
        <div className="space-y-3.5" id="ledger-history-rows">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl border-dashed border-dark-border bg-dark-bg/40" id="ledger-empty-state">
              <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2 animate-bounce" />
              <p className="text-xs text-zinc-400 font-mono">
                {lang === 'en' ? 'NO BEHAVIORAL ENTRIES MATCHING SELECTIONS' : 'ไม่พบประวัติพฤติกรรมการจ่ายเงินตามตัวเลือกข้างต้น'}
              </p>
              <button
                id="btn-add-initial-tx"
                onClick={() => setShowAddForm(true)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-brand to-emerald-400 hover:from-white hover:to-white text-black font-mono text-[9px] rounded-xl uppercase tracking-wider font-extrabold transition-all cursor-pointer shadow-md pilo-glow-sm"
              >
                {lang === 'en' ? 'Record first entry' : 'กรอกบันทึกแรกทันที'}
              </button>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isOutbound = tx.amount < 0;
              const meta = emotionMetadata[tx.emotion] || emotionMetadata['Value'] || { label: 'Conscious', labelTh: 'ตระหนักรู้', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };

              return (
                <div
                  id={`activity-tx-${tx.id}`}
                  key={tx.id}
                  className="p-5 border rounded-2xl bg-dark-card/65 border-dark-border/70 hover:bg-dark-card/95 hover:border-brand/30 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start gap-4 flex-1 select-none">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${isOutbound ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-brand border border-emerald-500/20'}`}>
                      {isOutbound ? '↓' : '↑'}
                    </div>

                    <div className="space-y-1 text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="font-display font-extrabold text-sm text-zinc-150 leading-none truncate">{tx.merchant}</h4>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {lang === 'en' ? tx.category : (tx.category === 'Deposit' ? 'ฝากเข้า' : (tx.category === 'Transfer' ? 'โอนออก' : (tx.category === 'Withdrawal' ? 'ถอนออก' : tx.category)))}
                        </span>
                        
                        {/* Workspace tag */}
                        {tx.workspace && (
                          <span className="px-2 py-0.5 rounded bg-dark-bg border border-dark-border font-mono text-[8px] text-brand font-bold">
                            {tx.workspace}
                          </span>
                        )}
                        
                        <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {tx.date}
                        </span>
                      </div>

                      {/* Mindful Explanation Why */}
                      <p className="text-xs text-zinc-300 font-sans italic pl-1 leading-relaxed">
                        &ldquo;{tx.why}&rdquo;
                      </p>

                      {/* Behavioral 5.0 layers tag indicators */}
                      {(tx.intent || tx.behavioralCategory) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                          {tx.intent && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-dark-bg text-purple-300 border border-dark-border">
                              Intent: {tx.intent}
                            </span>
                          )}
                          {tx.behavioralCategory && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-dark-bg text-emerald-400 border border-dark-border">
                              System Label: {tx.behavioralCategory}
                            </span>
                          )}
                          {tx.habitScore && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-dark-bg text-zinc-400 border border-dark-border">
                              Habit Quality: {tx.habitScore}/100
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-[#2D313E]/50 pt-3 md:pt-0 shrink-0">
                    {/* Emotional Badge indicator */}
                    <span className={`text-[9px] font-mono border px-2.5 py-1 rounded-full uppercase tracking-widest font-black ${meta.color || 'bg-zinc-850 border-zinc-750 text-zinc-400'}`}>
                      {lang === 'en' ? meta.label : meta.labelTh}
                    </span>

                    <span className={`font-mono text-sm font-extrabold tracking-tight ${isOutbound ? 'text-zinc-100' : 'text-brand'}`}>
                      {isOutbound ? '' : '+'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Add Transaction modal drawer with physical tagging */}
      {showAddForm && (
        <div id="add-tx-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border rounded-[32px] p-6 max-w-md w-full bg-dark-card border-dark-border text-white relative shadow-2xl space-y-5" id="add-tx-modal">
            
            {/* Close trigger */}
            <button
              id="btn-close-add-tx-modal"
              onClick={() => { setShowAddForm(false); setFormError(''); }}
              className="absolute right-6 top-6 w-8 h-8 rounded-full bg-[#232733] hover:bg-[#2D313E] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer hover:scale-105 active:scale-95 duration-150"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-left space-y-1">
              <span className="font-mono text-[9px] text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold inline-flex items-center gap-1 animate-pulse">
                <MessageCircle className="w-3.5 h-3.5 text-brand" />
                {lang === 'en' ? 'Behavioral Transaction Logger' : 'บันทึกพฤติกรรมทางการเงิน'}
              </span>
              <div className="flex justify-between items-center pt-2">
                <h3 className="font-display font-black text-xl tracking-tight leading-none text-white">
                  {lang === 'en' ? 'What happened today?' : 'วันนี้เกิดอะไรขึ้น?'}
                </h3>

                {/* Form configuration toggler button */}
                <button
                  id="btn-toggle-form-config"
                  type="button"
                  onClick={() => setShowConfigPanel(!showConfigPanel)}
                  className="px-2 py-1 rounded-lg bg-dark-card hover:bg-dark-border border border-dark-border text-[10px] font-mono text-zinc-450 hover:text-white flex items-center gap-1 cursor-pointer transition-colors duration-150 active:scale-95"
                >
                  <Settings className="w-3 h-3" />
                  <span>{lang === 'en' ? 'Configure' : 'กำหนดฟิลด์'}</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 pt-0.5">
                {lang === 'en' ? 'Tell the story behind your transaction. AI will detect patterns and suggest behavioral insights.' : 'เล่าพฤติกรรมหลังธุรกรรม ระบบ AI จะวิเคราะห์รูปแบบและเสนอข้อมูลเชิงลึก'}
              </p>
            </div>

            {/* Dynamic configuration panel of optional fields */}
            {showConfigPanel && (
              <div id="form-fields-config-grid" className="p-3.5 rounded-2xl bg-dark-bg border border-dark-border space-y-3 text-left">
                <h4 className="font-mono text-[9.5px] font-bold text-zinc-400 uppercase tracking-widest pb-1.5 border-b border-[#2D313E]">
                  {lang === 'en' ? 'Adaptive Field Switches' : 'เปิด/ปิด และปรับเปลี่ยนฟิลด์ตามความถนัด'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={activeFormFields.emotion}
                      onChange={(e) => setActiveFormFields(prev => ({ ...prev, emotion: e.target.checked }))}
                      className="accent-[#C7FF2E] w-3.5 h-3.5"
                    />
                    <span className="flex items-center gap-1.5"><Brain className="w-4 h-4" /> {lang === 'en' ? 'Emotion Layer' : 'อารมณ์กำกับ'}</span>
                  </label>
                </div>
              </div>
              )}
              <form onSubmit={handleAddNewTx} className="space-y-4 text-left overflow-y-auto max-h-[50vh] pr-1" id="add-tx-form">
              
              {/* Merchant / Case target with AI real-time prediction indicator */}
              <div className="space-y-1.5" id="form-field-merchant">
                <label className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                  {lang === 'en' ? 'Transaction Destination' : 'กรณี / รายการใช้จ่าย / ผู้รับ'}
                </label>
                <div className="relative">
                  <input
                    id="input-add-tx-merchant"
                    type="text"
                    required
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="e.g. Starbucks, Uber Lyft, Gym, client invoice..."
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand transition-all text-white placeholder-zinc-600"
                  />
                </div>

                {/* AI suggestion banner bubble */}
                {aiPresetPattern && (
                  <div id="ai-predictive-bubble" className="p-3 rounded-xl border bg-[#1E291C]/60 border-emerald-500/20 text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs animate-pulse">
                    <div className="flex items-start gap-2 text-left">
                      <Sparkles className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-brand">Pattern Detected: &ldquo;{aiPresetPattern.matchingTerm}&rdquo;</p>
                        <p className="text-[10px] leading-tight text-white/70">AI suggests Category, Intended Impact, Emotion, and Motivation presets.</p>
                      </div>
                    </div>
                    <button
                      id="btn-autofill-ai-preset"
                      type="button"
                      onClick={handleApplyAiPreset}
                      className="px-2.5 py-1 rounded bg-brand text-black hover:bg-white text-[10px] font-mono font-bold tracking-wider uppercase transition-all shadow cursor-pointer self-start sm:self-center hover:scale-102 active:scale-95 duration-100"
                    >
                      Autofill
                    </button>
                  </div>
                )}
              </div>

              {/* Grid: Amount & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5" id="form-field-amount">
                  <label className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                    {lang === 'en' ? 'Amount ($ USD)' : 'จำนวนเงิน ($ สหรัฐ)'}
                  </label>
                  <input
                    id="input-add-tx-amount"
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand transition-all text-white placeholder-zinc-600 font-mono"
                  />
                </div>

                <div className="space-y-1.5" id="form-field-category">
                  <label className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                    {lang === 'en' ? 'Category Setup' : 'วิถีประเภทสินค้า'}
                  </label>
                  <select
                    id="select-add-tx-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand transition-all text-white cursor-pointer"
                  >
                    <option value="Dining">{lang === 'en' ? 'Dining' : 'อาหารและสันทนาการ'}</option>
                    <option value="Technology">{lang === 'en' ? 'Technology' : 'อุปกรณ์ไอทีเลเวลสูง'}</option>
                    <option value="Subscriptions">{lang === 'en' ? 'Monthly Subs' : 'ค่าบริการรายเดือน'}</option>
                    <option value="Transportation">{lang === 'en' ? 'Transport' : 'การเดินทาง'}</option>
                    <option value="Socializing">{lang === 'en' ? 'Socialize' : 'เข้าสังคมพบปะเพื่อน'}</option>
                    <option value="Health">{lang === 'en' ? 'Health & Gym' : 'สุขภาพและกายภาพ'}</option>
                    <option value="Investment">{lang === 'en' ? 'High Yield Assets' : 'การออมและการลงทุน'}</option>
                  </select>
                </div>
              </div>

              {/* Core Workspace environment selector */}
              <div className="space-y-1.5" id="form-field-workspace">
                <label className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1 font-bold">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                  {lang === 'en' ? 'Sovereign Account Workspace' : 'เลือกพื้นที่ Workspace'}
                </label>
                <select
                  id="select-add-tx-workspace"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand transition-all text-white cursor-pointer"
                >
                  <option value="Personal">{lang === 'en' ? 'Personal' : 'ส่วนตัว'}</option>
                  <option value="Business">{lang === 'en' ? 'Business' : 'ธุรกิจ / งานหลัก'}</option>
                  <option value="Side Hustle">{lang === 'en' ? 'Side Hustle' : 'รายได้เสริม'}</option>
                </select>
              </div>

              {/* ADAPTIVE FIELD 1: Emotion Layer */}
              {activeFormFields.emotion && (
                <div className="space-y-1.5" id="form-field-emotion">
                  <label className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                    {lang === 'en' ? 'Dynamic Emotional Coping (Emotion)' : 'อารมณ์ที่ผลักดันการซื้อ (Emotion)'}
                  </label>
                  <select
                    id="select-add-tx-emotion"
                    value={emotion}
                    onChange={(e) => setEmotion(e.target.value as any)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand transition-all text-white cursor-pointer"
                  >
                    <option value="Value">Value (Deliberate utility / high cost-benefit ratio)</option>
                    <option value="Joy">Joy (Authentic soul boost / wellness investment)</option>
                    <option value="Impulse">Impulse (Instant gratification triggered by external cues)</option>
                    <option value="Stress">Stress (Coping with exhaustion / tension reduction)</option>
                    <option value="Social">Social (Belonging reinforcement / external grouping requirement)</option>
                    <option value="Investment">Investment (Wealth conversion or high-yield future locking)</option>
                  </select>
                </div>
              )}

              {/* ADAPTIVE FIELD 2: Intended Impact (Intent layer) */}
              {activeFormFields.intent && (
                <div className="space-y-1.5" id="form-field-intent">
                  <label className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1 font-bold">
                    <Flag className="w-3.5 h-3.5 text-zinc-500" />
                    {lang === 'en' ? 'Intended Strategic Value (Intent)' : 'ความตั้งใจเบื้องแรก (Intent)'}
                  </label>
                  <select
                    id="select-add-tx-intent"
                    value={intent}
                    onChange={(e) => setIntent(e.target.value as any)}
                    className="w-full bg-[#12141C] border border-[#2D313E] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#C7FF2E] transition-all text-white cursor-pointer"
                  >
                    <option value="Need">Need (Essential base survival / core drive)</option>
                    <option value="Want">Want (Lifestyle expansion / entertainment)</option>
                    <option value="Convenience">Convenience (Saving cognitive cycles / friction-less)</option>
                    <option value="Reward">Reward (Medal of coping / positive milestone reinforcement)</option>
                    <option value="Investment">Investment (Durable asset acquiring / value expansion)</option>
                    <option value="Emergency">Emergency (Immediate stress buffering safety requirement)</option>
                  </select>
                </div>
              )}

              {/* ADAPTIVE FIELD 3: Location Field */}
              {activeFormFields.location && (
                <div className="space-y-1.5" id="form-field-location">
                  <label className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {lang === 'en' ? 'Physical Coordinate / Location' : 'สถานที่บันทึก'}
                  </label>
                  <input
                    type="text"
                    value={locationValue}
                    onChange={(e) => setLocationValue(e.target.value)}
                    placeholder="e.g. San Francisco Financial District, Online Sub, Tokyo..."
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand transition-all text-white placeholder-zinc-650"
                  />
                </div>
              )}

              {/* ADAPTIVE FIELD 4: Priority selector */}
              {activeFormFields.priority && (
                <div className="space-y-1.5" id="form-field-priority">
                  <label className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                    {lang === 'en' ? 'Adaptive Priority Setting' : 'ระดับความสำคัญ'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Low', 'Medium', 'High'].map(prio => (
                      <button
                        type="button"
                        key={prio}
                        onClick={() => setPriorityValue(prio)}
                        className={`py-2 px-3 rounded-xl border text-[10px] font-mono font-bold tracking-wider cursor-pointer text-center uppercase transition-all duration-150 ${
                          priorityValue === prio
                            ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-sm scale-[1.01]'
                            : 'bg-dark-bg text-zinc-400 border-dark-border hover:text-white hover:bg-dark-card'
                        }`}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ADAPTIVE FIELD 5: Project Value */}
              {activeFormFields.project && (
                <div className="space-y-1.5" id="form-field-project">
                  <label className="block font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                    {lang === 'en' ? 'Project / Goal Association' : 'ผูกเป้าหมายการเงินกับโปรเจกต์'}
                  </label>
                  <input
                    type="text"
                    value={projectValue}
                    onChange={(e) => setProjectValue(e.target.value)}
                    placeholder="e.g. SideHustle Alpha, Family Trip 2026..."
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand transition-all text-white placeholder-zinc-650"
                  />
                </div>
              )}

              {/* Psychological driver explanation WHY */}
              <div className="space-y-1.5" id="form-field-why">
                <label className="block font-mono text-[9px] text-[#C7FF2E] uppercase tracking-widest font-bold leading-none">
                  {lang === 'en' ? 'Behavioral Driver & Honest Truth (Why?)' : 'คำอธิบายสิ่งกำกับการใช้จ่ายข้อนี้อย่างจริงใจ (ตอบตามความจริง)'}
                </label>
                <textarea
                  id="textarea-add-tx-why"
                  required
                  rows={2}
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Wednesday stress triggered immediate shopping escape...' : 'เช่น ทำงานตึงเครียดมาก คืนวันพุธเลยเผลอซื้อสิ่งนี้เพื่อระบาย...'}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-brand transition-all text-white placeholder-zinc-600"
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-mono flex items-center gap-2 animate-bounce" id="action-error-box">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit buttons */}
              <div className="flex gap-3 pt-2" id="form-submit-row">
                <button
                  id="btn-cancel-add-tx"
                  type="button"
                  onClick={() => { setShowAddForm(false); setFormError(''); }}
                  className="flex-1 bg-[#232733] border border-[#2D313E] text-zinc-400 hover:text-white text-xs font-mono py-3.5 rounded-2xl uppercase tracking-wider transition-all cursor-pointer active:scale-95 duration-150 text-center"
                >
                  {lang === 'en' ? 'Cancel' : 'ยกเลิกรายการ'}
                </button>
                <button
                  id="btn-submit-add-tx"
                  type="submit"
                  form="add-tx-form"
                  className="flex-1 bg-gradient-to-r from-[#C7FF2E] to-[#51FF85] text-[#131416] font-display font-black text-xs py-3.5 rounded-2xl uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#C7FF2E]/10 hover:from-white hover:to-white hover:scale-[1.01] active:scale-95 duration-150 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 inline text-[#131416]" />
                  {lang === 'en' ? 'Settle Mindfully' : 'บันทึกพร้อมสัจจะ'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Spark helper translating values
export function expressLabel(emo: string, lang: Language): string {
  if (emo === 'All') return lang === 'en' ? 'All Emotions' : 'อารมณ์ทั้งหมด';
  if (emo === 'Impulse') return lang === 'en' ? 'Impulse' : 'วู่วาม';
  if (emo === 'Joy') return lang === 'en' ? 'Joy' : 'รื่นเริง';
  if (emo === 'Stress') return lang === 'en' ? 'Stress' : 'ระบายเครียด';
  if (emo === 'Social') return lang === 'en' ? 'Social' : 'สังคม';
  if (emo === 'Value') return lang === 'en' ? 'Value' : 'คุ้มค่า';
  if (emo === 'Investment') return lang === 'en' ? 'Invest' : 'ลงพอร์ต';
  return emo;
}

// Icon helpers for emotion display
export function expressIcon(emo: string): ReactNode {
  if (emo === 'Impulse') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
  if (emo === 'Joy') return <Flower2 className="w-3.5 h-3.5 text-pink-400" />;
  if (emo === 'Stress') return <Zap className="w-3.5 h-3.5 text-amber-500" />;
  if (emo === 'Social') return <Users className="w-3.5 h-3.5 text-blue-400" />;
  if (emo === 'Value') return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
  if (emo === 'Investment') return <TrendingUp className="w-3.5 h-3.5 text-[#C7FF2E]" />;
  return <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />;
}
