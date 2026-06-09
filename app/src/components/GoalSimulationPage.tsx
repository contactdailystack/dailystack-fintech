import React, { useState } from 'react';
import {
  Target, TrendingUp, TrendingDown, Calendar, Clock, Sparkles, Lock,
  ChevronRight, DollarSign, Zap, RefreshCw, ArrowUpRight, ArrowDownRight,
  Play, Pause, BarChart3, PieChart as PieChartIcon, LineChart,
  Shield, Plane, Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations, Language } from '../data/translations';
import { UserProfile } from '../types';

interface GoalSimulationPageProps {
  profile: UserProfile;
  lang: Language;
  onNavigateToUpgrade?: () => void;
  theme?: 'dark' | 'light';
}

// Mock goal data
const MOCK_GOALS = [
  { id: 1, name: 'Emergency Fund', target: 50000, current: 32500, icon: <Shield className="w-5 h-5" />, color: '#00E676' },
  { id: 2, name: 'Thailand Trip', target: 80000, current: 45000, icon: <Plane className="w-5 h-5" />, color: '#FFB800' },
  { id: 3, name: 'New MacBook Pro', target: 75000, current: 12000, icon: <Laptop className="w-5 h-5" />, color: '#CCFF00' },
];

// Scenario simulation presets
const SCENARIO_PRESETS = [
  { id: 'moderate', labelEn: 'Moderate Growth', labelTh: 'การเติบโตแบบปานกลาง', multiplier: 1.08 },
  { id: 'aggressive', labelEn: 'Aggressive Save', labelTh: 'ออมเข้มข้น', multiplier: 1.20 },
  { id: 'relaxed', labelEn: 'Relaxed Pace', labelTh: 'ผ่อนคลาย', multiplier: 1.03 },
];

// Timeline projections
const generateTimeline = (months: number, monthlySavings: number, rate: number, lang: Language = 'en') => {
  const data = [];
  let balance = 0;
  for (let i = 0; i <= months; i++) {
    if (i > 0) {
      balance = balance * rate + monthlySavings;
    }
    data.push({
      month: i,
      balance: Math.round(balance),
      date: new Date(2026, 5 + i, 1).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: '2-digit' })
    });
  }
  return data;
};

export function GoalSimulationPage({ profile, lang, onNavigateToUpgrade, theme = 'dark' }: GoalSimulationPageProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'goals' | 'simulation'>('goals');
  const [selectedGoal, setSelectedGoal] = useState(MOCK_GOALS[0]);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIO_PRESETS[0]);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [timelineData, setTimelineData] = useState(() => generateTimeline(24, monthlyContribution, selectedScenario.multiplier, lang));

  const isElite = profile.plan === 'pro' || profile.plan === 'elite';
  const isBasic = profile.plan === 'basic';

  const handleScenarioChange = (preset: typeof SCENARIO_PRESETS[0]) => {
    setSelectedScenario(preset);
    setTimelineData(generateTimeline(24, monthlyContribution, preset.multiplier, lang));
  };

  const handleContributionChange = (amount: number) => {
    setMonthlyContribution(amount);
    setTimelineData(generateTimeline(24, amount, selectedScenario.multiplier, lang));
  };

  const simulateGoal = () => {
    if (!isElite) return;
    setSimulationRunning(true);
    setTimeout(() => setSimulationRunning(false), 2000);
  };

  const goalProgress = (selectedGoal.current / selectedGoal.target) * 100;
  const remainingAmount = selectedGoal.target - selectedGoal.current;
  const monthsToGoal = Math.ceil(remainingAmount / monthlyContribution);

  // Chart dimensions
  const chartWidth = 100;
  const chartHeight = 40;
  const maxValue = Math.max(...timelineData.map(d => d.balance));

  return (
    <div className="space-y-6 animate-slide-up text-left">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-brand" />
            {lang === 'en' ? 'Goal Simulation' : 'จำลองเป้าหมาย'}
          </h2>
          <p className="text-sm text-zinc-400">
            {lang === 'en' ? 'Plan your financial future with AI-powered scenarios' : 'วางแผนอนาคตทางการเงินด้วยการจำลอง AI'}
          </p>
        </div>
        
        {/* Premium Badge */}
        {!isElite && (
          <button
            onClick={onNavigateToUpgrade}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400 font-display font-bold text-xs flex items-center gap-2 hover:from-amber-500/30 hover:to-yellow-500/30 transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Unlock Elite' : 'ปลดล็อก Elite'}
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-dark-card rounded-xl border border-zinc-900">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 px-4 py-3 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'goals' 
              ? 'bg-brand text-black' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" />
          {lang === 'en' ? 'Goals' : 'เป้าหมาย'}
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex-1 px-4 py-3 rounded-lg font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'simulation' 
              ? 'bg-brand text-black' 
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {lang === 'en' ? 'Simulation' : 'จำลอง'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'goals' ? (
          <motion.div
            key="goals"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Goal Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {MOCK_GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    selectedGoal.id === goal.id
                      ? 'bg-dark-card border-brand shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                      : 'bg-dark-card border-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="text-xs font-mono text-zinc-500 uppercase">
                      {Math.round((goal.current / goal.target) * 100)}%
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-white mb-1">{goal.name}</h3>
                  <p className="text-xs text-zinc-400">
                    {lang === 'en' ? '฿' : '฿'}{goal.current.toLocaleString()} / {lang === 'en' ? '฿' : '฿'}{goal.target.toLocaleString()}
                  </p>
                  {/* Mini Progress Bar */}
                  <div className="mt-3 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(goal.current / goal.target) * 100}%`, backgroundColor: goal.color }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Goal Detail Card */}
            <div className="bg-gradient-to-br from-dark-card to-zinc-900/50 p-6 rounded-3xl border border-zinc-900">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-4xl mb-2 block">{selectedGoal.icon}</span>
                  <h3 className="font-display text-xl font-extrabold text-white">{selectedGoal.name}</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {lang === 'en' ? 'Target Date' : 'วันเป้าหมาย'}: <span className="text-brand font-mono">Dec 2027</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500 font-mono uppercase">{lang === 'en' ? 'Remaining' : 'คงเหลือ'}</div>
                  <div className="text-2xl font-display font-extrabold text-white">฿{remainingAmount.toLocaleString()}</div>
                </div>
              </div>

              {/* Big Progress Ring */}
              <div className="flex justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="var(--color-dark-border)" strokeWidth="12" fill="none" />
                    <motion.circle 
                      cx="80" cy="80" r="70" 
                      stroke={selectedGoal.color}
                      strokeWidth="12" 
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 440" }}
                      animate={{ strokeDasharray: `${(goalProgress / 100) * 440} 440` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-display font-black text-white">{Math.round(goalProgress)}%</div>
                    <div className="text-xs text-zinc-400 font-mono uppercase">{lang === 'en' ? 'Complete' : 'สำเร็จ'}</div>
                  </div>
                </div>
              </div>

              {/* Goal Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-zinc-900/50 rounded-xl">
                  <DollarSign className="w-4 h-4 text-brand mx-auto mb-1" />
                  <div className="text-sm font-display font-bold text-white">฿{selectedGoal.current.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">{lang === 'en' ? 'Saved' : 'ออมแล้ว'}</div>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl">
                  <Target className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-sm font-display font-bold text-white">฿{selectedGoal.target.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">{lang === 'en' ? 'Target' : 'เป้า'}</div>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-xl">
                  <Calendar className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-sm font-display font-bold text-white">{monthsToGoal}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">{lang === 'en' ? 'Months' : 'เดือน'}</div>
                </div>
              </div>

              {/* Recommended Monthly Contribution */}
              <div className="mt-6 p-4 bg-brand/10 rounded-xl border border-brand/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-brand" />
                  <span className="text-xs font-mono text-brand uppercase">{lang === 'en' ? 'AI Recommendation' : 'คำแนะนำ AI'}</span>
                </div>
                <p className="text-sm text-zinc-300">
                  {lang === 'en' 
                    ? `Save ฿${Math.ceil(remainingAmount / 18).toLocaleString()}/month to reach your goal by Dec 2027`
                    : `ออม ฿${Math.ceil(remainingAmount / 18).toLocaleString()}/เดือน เพื่อถึงเป้า ธ.ค. 2570`}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="simulation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Scenario Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                {lang === 'en' ? 'Simulation Scenario' : 'สถานการณ์จำลอง'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SCENARIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleScenarioChange(preset)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
                      selectedScenario.id === preset.id
                        ? 'bg-brand text-black border-brand'
                        : 'bg-dark-card border-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`text-xs font-display font-bold mb-1 ${selectedScenario.id === preset.id ? 'text-black' : 'text-white'}`}>
                      {lang === 'en' ? preset.labelEn : preset.labelTh}
                    </div>
                    <div className={`text-[10px] font-mono ${selectedScenario.id === preset.id ? 'text-black/60' : 'text-zinc-500'}`}>
                      {(preset.multiplier * 100 - 100).toFixed(0)}% {lang === 'en' ? 'return' : 'ผลตอบแทน'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Contribution Slider */}
            <div className="space-y-3 p-4 bg-dark-card rounded-2xl border border-zinc-900">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  {lang === 'en' ? 'Monthly Contribution' : 'เงินออมรายเดือน'}
                </label>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 rounded-lg">
                  <span className="text-sm font-display font-bold text-brand">฿</span>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => handleContributionChange(Number(e.target.value))}
                    className="w-20 bg-transparent text-right text-sm font-display font-bold text-white outline-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={monthlyContribution}
                onChange={(e) => handleContributionChange(Number(e.target.value))}
                className="w-full h-2 bg-zinc-900 rounded-full appearance-none cursor-pointer slider-brand"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                <span>฿1,000</span>
                <span>฿50,000</span>
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="bg-dark-card p-5 rounded-2xl border border-zinc-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-white">{lang === 'en' ? 'Projected Timeline' : 'ไทม์ไลน์ที่คาดการณ์'}</h3>
                  <p className="text-xs text-zinc-500">{lang === 'en' ? '24 months projection' : 'คาดการณ์ 24 เดือน'}</p>
                </div>
                <button
                  onClick={simulateGoal}
                  disabled={!isElite}
                  className={`px-3 py-2 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    isElite
                      ? 'bg-brand text-black hover:bg-brand-muted cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {simulationRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {lang === 'en' ? 'Simulating...' : 'กำลังจำลอง...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Run' : 'รัน'}
                    </>
                  )}
                </button>
              </div>

              {/* Chart Area */}
              <div className="relative h-48 bg-zinc-950/50 rounded-xl p-4 overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute inset-4 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-b border-dashed border-zinc-800/50 w-full" />
                  ))}
                </div>

                {/* Chart Line */}
                <svg 
                  width="100%" 
                  height="100%" 
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                  className="relative z-10"
                >
                  {/* Gradient Fill */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area */}
                  <path
                    d={`M0,${chartHeight} ${timelineData.map((d, i) => `L${(i / (timelineData.length - 1)) * chartWidth},${chartHeight - (d.balance / maxValue) * chartHeight}`).join(' ')} L${chartWidth},${chartHeight} Z`}
                    fill="url(#chartGradient)"
                  />
                  
                  {/* Line */}
                  <motion.path
                    d={`M${timelineData.map((d, i) => `${(i / (timelineData.length - 1)) * chartWidth},${chartHeight - (d.balance / maxValue) * chartHeight}`).join(' L')}`}
                    stroke="#CCFF00"
                    strokeWidth="0.5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />

                  {/* Data Points */}
                  {timelineData.filter((_, i) => i % 6 === 0).map((d, i) => (
                    <circle
                      key={i}
                      cx={(i * 6 / (timelineData.length - 1)) * chartWidth}
                      cy={chartHeight - (d.balance / maxValue) * chartHeight}
                      r="1"
                      fill="#CCFF00"
                    />
                  ))}
                </svg>

                {/* Y-Axis Labels */}
                <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-[8px] text-zinc-600 font-mono">
                  <span>฿{(maxValue / 1000).toFixed(0)}K</span>
                  <span>฿{(maxValue / 2000).toFixed(0)}K</span>
                  <span>฿0</span>
                </div>
              </div>

              {/* X-Axis Labels */}
              <div className="flex justify-between mt-2 px-8 text-[9px] text-zinc-600 font-mono">
                <span>{lang === 'en' ? 'Now' : 'ปัจจุบัน'}</span>
                <span>+6 mo</span>
                <span>+12 mo</span>
                <span>+18 mo</span>
                <span>+24 mo</span>
              </div>
            </div>

            {/* Simulation Results */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-dark-card rounded-2xl border border-zinc-900">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{lang === 'en' ? 'Projected Value' : 'มูลค่าคาดการณ์'}</span>
                </div>
                <div className="text-2xl font-display font-extrabold text-white">
                  ฿{timelineData[timelineData.length - 1].balance.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +{((timelineData[timelineData.length - 1].balance / (monthlyContribution * 24) - 1) * 100).toFixed(1)}%
                </div>
              </div>

              <div className="p-4 bg-dark-card rounded-2xl border border-zinc-900">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-brand" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{lang === 'en' ? 'Time to Goal' : 'เวลาถึงเป้า'}</span>
                </div>
                <div className="text-2xl font-display font-extrabold text-white">
                  {Math.ceil(selectedGoal.target / monthlyContribution)}
                </div>
                <div className="text-xs text-zinc-400 font-mono mt-1">
                  {lang === 'en' ? 'months at current rate' : 'เดือน อัตราปัจจุบัน'}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="p-4 bg-gradient-to-r from-brand/10 to-emerald-500/10 rounded-2xl border border-brand/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-brand" />
                <span className="text-xs font-mono text-brand uppercase">{lang === 'en' ? 'AI Insight' : 'ข้อมูลเชิงลึก AI'}</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {lang === 'en'
                  ? `Based on your ${selectedScenario.labelEn.toLowerCase()} scenario, you could reach your ${selectedGoal.name.toLowerCase()} goal ${
                      Math.ceil(selectedGoal.target / monthlyContribution) < 24 ? `${Math.ceil(selectedGoal.target / monthlyContribution)} months` : 'in over 24 months'
                    }. Consider increasing your monthly contribution by ${Math.max(0, Math.ceil(selectedGoal.target / 18) - monthlyContribution).toLocaleString()}฿ to accelerate your timeline.`
                  : `จากสถานการณ์${selectedScenario.labelTh}ของคุณ คุณสามารถถึงเป้าหมาย${selectedGoal.name}ได้ในอีก ${
                      Math.ceil(selectedGoal.target / monthlyContribution) < 24 ? `${Math.ceil(selectedGoal.target / monthlyContribution)} เดือน` : 'มากกว่า 24 เดือน'
                    }. ลองเพิ่มเงินออมรายเดือนอีก ${Math.max(0, Math.ceil(selectedGoal.target / 18) - monthlyContribution).toLocaleString()}฿ เพื่อเร่งการบรรลุเป้า`
                }
              </p>
            </div>

            {/* Premium Features Lock */}
            {!isElite && (
              <div className="p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-2xl border border-amber-500/20 text-center">
                <Lock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <h3 className="font-display font-bold text-white mb-2">
                  {lang === 'en' ? 'Unlock Advanced Simulations' : 'ปลดล็อกการจำลองขั้นสูง'}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  {lang === 'en' 
                    ? 'Get access to Money Twin projections, multiple goal tracking, and AI-powered scenario comparisons.'
                    : 'เข้าถึงการคาดการณ์ Money Twin, การติดตามหลายเป้าหมาย และการเปรียบเทียบสถานการณ์ AI'}
                </p>
                <button
                  onClick={onNavigateToUpgrade}
                  className="px-6 py-3 bg-brand text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-muted transition-all cursor-pointer"
                >
                  {lang === 'en' ? 'Upgrade to Elite' : 'อัปเกรดเป็น Elite'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Style for custom range slider */}
      <style>{`
        .slider-brand::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #CCFF00;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(204, 255, 0, 0.5);
        }
        .slider-brand::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #CCFF00;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(204, 255, 0, 0.5);
        }
      `}</style>
    </div>
  );
}

export default GoalSimulationPage;
