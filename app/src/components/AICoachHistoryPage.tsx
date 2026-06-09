import { useState } from 'react';
import {
  BrainCircuit, Calendar, Clock, ChevronRight, MessageSquare,
  TrendingUp, TrendingDown, Sparkles, Filter, Search, Star,
  Zap, Target, Flame, BookOpen, Archive, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { translations, Language } from '../data/translations';

interface AICoachHistoryPageProps {
  profile: UserProfile;
  lang: Language;
  theme?: 'dark' | 'light';
}

// Mock coaching history data structure
interface CoachingSession {
  id: string;
  date: string;
  time: string;
  topic: string;
  category: 'budget' | 'investment' | 'impulse' | 'stress' | 'social' | 'general';
  summary: string;
  recommendation: string;
  outcome?: string;
  mood?: 'positive' | 'neutral' | 'negative';
  actionItems: string[];
  xpEarned: number;
}

const MOCK_HISTORY: CoachingSession[] = [
  {
    id: '1',
    date: '2026-06-09',
    time: '09:15 AM',
    topic: 'Wednesday Spending Pattern Analysis',
    category: 'impulse',
    summary: 'Identified high correlation between Wednesday evenings and impulse purchases. Established 24-hour cooling lock protocol.',
    recommendation: 'Implement automatic spending delay for discretionary purchases between 6-9 PM on Wednesdays.',
    outcome: 'Successful implementation',
    mood: 'positive',
    actionItems: [
      'Enable 24-hour purchase delay',
      'Set Wednesday evening budget limit',
      'Create alternative activity reminder'
    ],
    xpEarned: 25
  },
  {
    id: '2',
    date: '2026-06-08',
    time: '02:30 PM',
    topic: 'Investment Portfolio Rebalancing Strategy',
    category: 'investment',
    summary: 'Analyzed current allocation across AAPL, NVDA, and savings. Recommended maintaining 80% core positions.',
    recommendation: 'Focus on long-term compound growth by maintaining core positions and limiting speculative plays to 4%.',
    outcome: 'Portfolio adjusted',
    mood: 'positive',
    actionItems: [
      'Review and rebalance portfolio',
      'Set up automatic dividend reinvestment',
      'Research alternative growth sectors'
    ],
    xpEarned: 30
  },
  {
    id: '3',
    date: '2026-06-07',
    time: '07:45 PM',
    topic: 'Stress-Induced Spending Trigger Analysis',
    category: 'stress',
    summary: 'Discovered pattern linking overtime work days to retail therapy purchases. Stress cortisol levels peak at 8 PM.',
    recommendation: 'Replace evening shopping urge with 15-minute meditation or brief walk to break stress-spending cycle.',
    outcome: 'In progress',
    mood: 'neutral',
    actionItems: [
      'Download meditation app',
      'Set evening walk reminder',
      'Track cortisol levels'
    ],
    xpEarned: 20
  },
  {
    id: '4',
    date: '2026-06-06',
    time: '11:20 AM',
    topic: 'Monthly Budget Optimization',
    category: 'budget',
    summary: 'Reviewed May spending patterns. Identified 12% reduction in impulse purchases compared to April.',
    recommendation: 'Redirect saved funds (+$340) into emergency fund or investment vehicle for compound growth.',
    outcome: 'Funds redirected',
    mood: 'positive',
    actionItems: [
      'Transfer savings to emergency fund',
      'Set up automatic monthly transfers',
      'Review progress in 30 days'
    ],
    xpEarned: 35
  },
  {
    id: '5',
    date: '2026-06-05',
    time: '06:00 PM',
    topic: 'Social Pressure Spending Defense',
    category: 'social',
    summary: 'Analyzed weekend outings budget. Established boundary techniques for group dining expenses.',
    recommendation: 'Use "financial prior commitment" technique: announce budget limit before social events.',
    outcome: 'Technique adopted',
    mood: 'positive',
    actionItems: [
      'Practice commitment announcement',
      'Track social spending separately',
      'Find free social alternatives'
    ],
    xpEarned: 25
  },
  {
    id: '6',
    date: '2026-06-04',
    time: '03:15 PM',
    topic: 'Weekend Recovery Spending Pattern',
    category: 'impulse',
    summary: 'Weekend leisure spending 18% above target. Identified "reward yourself" mental accounting.',
    recommendation: 'Create separate "leisure budget" envelope with fixed weekly allocation to prevent overspending.',
    outcome: 'Envelope created',
    mood: 'neutral',
    actionItems: [
      'Set weekly leisure budget',
      'Track weekend expenses daily',
      'Plan free weekend activities'
    ],
    xpEarned: 20
  },
  {
    id: '7',
    date: '2026-06-03',
    time: '08:30 AM',
    topic: 'Dopamine Detox Strategy',
    category: 'stress',
    summary: 'Designed 7-day dopamine reset plan focusing on replacing instant-gratification purchases with sustainable rewards.',
    recommendation: 'Implement 48-hour waiting rule for any purchase over $50 to reduce impulsive decisions.',
    outcome: 'Plan initiated',
    mood: 'positive',
    actionItems: [
      'Start 7-day dopamine reset',
      'Create reward alternatives list',
      'Track impulse urges daily'
    ],
    xpEarned: 30
  },
  {
    id: '8',
    date: '2026-06-02',
    time: '01:00 PM',
    topic: 'Quarterly Financial Review',
    category: 'budget',
    summary: 'Q2 analysis complete. Overall spending discipline improved 24% from Q1 baseline.',
    recommendation: 'Celebrate wins while maintaining vigilance. Consider increasing savings rate by 5%.',
    outcome: 'Review complete',
    mood: 'positive',
    actionItems: [
      'Update financial goals for Q3',
      'Increase savings rate to 15%',
      'Schedule Q3 check-in'
    ],
    xpEarned: 40
  }
];

const CATEGORY_CONFIG = {
  budget: { labelEn: 'Budget', labelTh: 'งบประมาณ', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: BookOpen },
  investment: { labelEn: 'Investment', labelTh: 'การลงทุน', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: TrendingUp },
  impulse: { labelEn: 'Impulse', labelTh: 'ความวู่วาม', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Zap },
  stress: { labelEn: 'Stress', labelTh: 'ความเครียด', color: 'text-rose-400', bg: 'bg-rose-400/10', icon: Target },
  social: { labelEn: 'Social', labelTh: 'สังคม', color: 'text-violet-400', bg: 'bg-violet-400/10', icon: Sparkles },
  general: { labelEn: 'General', labelTh: 'ทั่วไป', color: 'text-zinc-400', bg: 'bg-zinc-400/10', icon: MessageSquare },
};

export function AICoachHistoryPage({ profile, lang, theme = 'dark' }: AICoachHistoryPageProps) {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<CoachingSession | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filter and sort sessions
  const filteredSessions = MOCK_HISTORY
    .filter(session => {
      const matchesSearch = session.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || session.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Calculate statistics
  const totalSessions = MOCK_HISTORY.length;
  const totalXP = MOCK_HISTORY.reduce((sum, s) => sum + s.xpEarned, 0);
  const categoryBreakdown = MOCK_HISTORY.reduce((acc, session) => {
    acc[session.category] = (acc[session.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageXPPerSession = Math.round(totalXP / totalSessions);

  return (
    <div className="space-y-6 animate-slide-up text-left">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`font-display text-2xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {lang === 'en' ? 'AI Memory Coaching' : 'ประวัติการโค้ชประคบ AI'}
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {lang === 'en' ? 'Your complete coaching conversation archive' : 'คลังบทสนทนาโค้ชประคบของคุณ'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className={`p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'bg-dark-card border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' : 'bg-white border-slate-200 text-zinc-500 hover:text-zinc-700'}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-dark-card border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' : 'bg-white border-slate-200 text-zinc-500 hover:text-zinc-700'}`}>
            <Archive className="w-4 h-4" />
            <span className="text-sm font-medium">{lang === 'en' ? 'Export' : 'ส่งออก'}</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
        >
          <div className={`flex items-center gap-2 mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">{lang === 'en' ? 'Sessions' : 'เซสชัน'}</span>
          </div>
          <div className={`font-display text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {totalSessions}
          </div>
          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {lang === 'en' ? 'Total conversations' : 'บทสนทนาทั้งหมด'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
        >
          <div className={`flex items-center gap-2 mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <Zap className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">{lang === 'en' ? 'XP Earned' : 'XP สะสม'}</span>
          </div>
          <div className={`font-display text-2xl font-black ${theme === 'dark' ? 'text-brand' : 'text-blue-600'}`}>
            {totalXP}
          </div>
          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {lang === 'en' ? '+25 this week' : '+25 สัปดาห์นี้'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
        >
          <div className={`flex items-center gap-2 mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <Star className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">{lang === 'en' ? 'Avg XP' : 'เฉลี่ย/XP'}</span>
          </div>
          <div className={`font-display text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {averageXPPerSession}
          </div>
          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {lang === 'en' ? 'Per session' : 'ต่อเซสชัน'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}
        >
          <div className={`flex items-center gap-2 mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <Flame className="w-4 h-4" />
            <span className="text-xs font-mono uppercase">{lang === 'en' ? 'Streak' : 'วันต่อเนื่อง'}</span>
          </div>
          <div className={`font-display text-2xl font-black ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
            12
          </div>
          <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {lang === 'en' ? 'Day streak' : 'วันต่อเนื่อง'}
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-display font-bold text-sm uppercase tracking-wide mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
          {lang === 'en' ? 'Topics Breakdown' : 'แยกประเภทหัวข้อ'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(CATEGORY_CONFIG).filter(([key]) => key !== 'general').map(([key, config]) => {
            const count = categoryBreakdown[key] || 0;
            const Icon = config.icon;
            return (
              <div
                key={key}
                className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-105 ${
                  selectedCategory === key 
                    ? `${config.bg} ${config.color} border-current` 
                    : theme === 'dark' 
                      ? 'bg-dark-card border-zinc-800 text-zinc-400 hover:border-zinc-700' 
                      : 'bg-slate-50 border-slate-200 text-zinc-600 hover:border-slate-300'
                }`}
                onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
              >
                <Icon className="w-4 h-4 mb-2" />
                <div className={`font-mono text-xs ${selectedCategory === key ? '' : theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {lang === 'en' ? config.labelEn : config.labelTh}
                </div>
                <div className={`font-display text-lg font-black ${selectedCategory === key ? config.color : theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search coaching history...' : 'ค้นหาประวัติโค้ช...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl border font-sans text-sm transition-all focus:outline-none focus:ring-2 ${
              theme === 'dark'
                ? 'bg-dark-card border-zinc-800 text-white placeholder-zinc-500 focus:border-brand/50 focus:ring-brand/20'
                : 'bg-white border-slate-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className={`px-4 py-3 rounded-xl border font-sans text-sm cursor-pointer transition-all focus:outline-none focus:ring-2 ${
              theme === 'dark'
                ? 'bg-dark-card border-zinc-800 text-zinc-300 focus:border-brand/50 focus:ring-brand/20'
                : 'bg-white border-slate-200 text-zinc-700 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          >
            <option value="newest">{lang === 'en' ? 'Newest first' : 'ใหม่สุดก่อน'}</option>
            <option value="oldest">{lang === 'en' ? 'Oldest first' : 'เก่าสุดก่อน'}</option>
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className={`font-mono text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {lang === 'en' ? 'Coaching Sessions' : 'บทสนทนาโค้ช'} ({filteredSessions.length})
          </h3>
        </div>

        {filteredSessions.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center ${theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
            <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-zinc-700' : 'text-slate-300'}`} />
            <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {lang === 'en' ? 'No sessions found matching your criteria' : 'ไม่พบเซสชันที่ตรงกับเกณฑ์'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredSessions.map((session, index) => {
              const config = CATEGORY_CONFIG[session.category];
              const Icon = config.icon;
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    selectedSession?.id === session.id
                      ? `${config.bg} border-current`
                      : theme === 'dark'
                        ? 'bg-dark-card border-dark-border hover:border-zinc-700'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${config.bg} ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={`font-display font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                            {session.topic}
                          </h4>
                          <div className={`flex items-center gap-3 mt-1 text-xs font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${config.bg} ${config.color}`}>
                            {lang === 'en' ? config.labelEn : config.labelTh}
                          </div>
                          <div className={`flex items-center gap-1 ${theme === 'dark' ? 'text-brand' : 'text-blue-600'}`}>
                            <Zap className="w-3 h-3" />
                            <span className="font-display font-bold text-sm">+{session.xpEarned}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${selectedSession?.id === session.id ? 'rotate-90' : ''} ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {selectedSession?.id === session.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-current/10 space-y-4">
                              <div>
                                <h5 className={`text-xs font-mono uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                  {lang === 'en' ? 'Summary' : 'สรุป'}
                                </h5>
                                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                  {session.summary}
                                </p>
                              </div>

                              <div>
                                <h5 className={`text-xs font-mono uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                  {lang === 'en' ? 'Recommendation' : 'คำแนะนำ'}
                                </h5>
                                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                  {session.recommendation}
                                </p>
                              </div>

                              {session.outcome && (
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                                  session.mood === 'positive' 
                                    ? 'bg-emerald-400/10 text-emerald-400' 
                                    : session.mood === 'negative'
                                      ? 'bg-rose-400/10 text-rose-400'
                                      : theme === 'dark' 
                                        ? 'bg-zinc-800 text-zinc-400' 
                                        : 'bg-slate-100 text-zinc-500'
                                }`}>
                                  {session.mood === 'positive' ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : session.mood === 'negative' ? (
                                    <TrendingDown className="w-3 h-3" />
                                  ) : (
                                    <Target className="w-3 h-3" />
                                  )}
                                  {session.outcome}
                                </div>
                              )}

                              <div>
                                <h5 className={`text-xs font-mono uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                  {lang === 'en' ? 'Action Items' : 'สิ่งที่ต้องทำ'}
                                </h5>
                                <ul className="space-y-2">
                                  {session.actionItems.map((item, i) => (
                                    <li key={i} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${config.color}`} />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer CTA */}
      <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-brand/10 text-brand' : 'bg-blue-100 text-blue-600'}`}>
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`font-display font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                {lang === 'en' ? 'Continue Your Coaching Journey' : 'สานต่อการเดินทางโค้ชของคุณ'}
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {lang === 'en' 
                  ? 'Start a new coaching session to keep building your financial discipline' 
                  : 'เริ่มเซสชันโค้ชใหม่เพื่อสานต่อการสร้างวินัยทางการเงินของคุณ'}
              </p>
            </div>
          </div>
          <button className={`px-5 py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center gap-2 ${
            theme === 'dark'
              ? 'bg-brand text-black hover:bg-brand-muted'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}>
            <Sparkles className="w-4 h-4" />
            {lang === 'en' ? 'Start Session' : 'เริ่มเซสชัน'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AICoachHistoryPage;
