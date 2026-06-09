import { useState } from 'react';
import { 
  TrendingUp, ArrowRight, Brain, Sparkles, 
  Smile, Frown, Zap, Users, Coins 
} from 'lucide-react';
import { Transaction, UserProfile } from '../types';
import { translations, Language } from '../data/translations';

interface InsightsPageProps {
  transactions: Transaction[];
  profile: UserProfile;
  onNavigateToUpgrade: () => void;
  lang: Language;
  theme: 'dark' | 'light';
}

export default function InsightsPage({ transactions, profile, onNavigateToUpgrade, lang, theme }: InsightsPageProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'behavior'>('analytics');
  
  const t = translations[lang];

  // Calculates financial insights
  const totalSpend = Math.abs(
    transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  // Group by category for bar representation (representing chart in image #6)
  const categorySummary: { [key: string]: number } = {};
  transactions
    .filter((tx) => tx.amount < 0)
    .forEach((tx) => {
      const cat = tx.category;
      categorySummary[cat] = (categorySummary[cat] || 0) + Math.abs(tx.amount);
    });

  const categories = Object.entries(categorySummary).sort((a, b) => b[1] - a[1]);

  // Group by emotional buying indicators (the "Behavior Intelligence System")
  const emotionalSummary: { [key: string]: { total: number; count: number } } = {};
  transactions
    .filter((tx) => tx.amount < 0)
    .forEach((tx) => {
      const emo = tx.emotion;
      if (!emotionalSummary[emo]) emotionalSummary[emo] = { total: 0, count: 0 };
      emotionalSummary[emo].total += Math.abs(tx.amount);
      emotionalSummary[emo].count += 1;
    });

  const emotions = Object.entries(emotionalSummary).sort((a, b) => b[1].total - a[1].total);

  // Emotional triggers analysis
  const impulseCount = transactions.filter((tx) => tx.emotion === 'Impulse').length;
  const stressCount = transactions.filter((tx) => tx.emotion === 'Stress').length;

  return (
    <div id="insights-viewport" className="space-y-6 md:space-y-8 animate-slide-up">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="insights-header">
        <div className="text-left">
          <h2 className={`font-display font-extrabold text-2xl ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.valueInsightsTitle}</h2>
          <p className="text-xs text-zinc-500 font-mono tracking-wider">{t.valueInsightsSub}</p>
        </div>

        {/* Custom Tab Switcher */}
        <div className={`p-1 rounded-xl border flex ${theme === 'dark' ? 'bg-[#131416] border-zinc-900' : 'bg-[#EFEEF4] border-transparent shadow-inner'}`} id="insights-tab-switcher">
          <button
            id="btn-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'analytics' ? (theme === 'dark' ? 'bg-[#C7FF2E] text-black font-semibold' : 'bg-white text-[#1D1D1F] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5') : 'text-zinc-500 hover:text-[#1D1D1F]'}`}
          >
            {t.analyticsTab}
          </button>
          <button
            id="btn-tab-behavior"
            onClick={() => setActiveTab('behavior')}
            className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'behavior' ? (theme === 'dark' ? 'bg-[#C7FF2E] text-black font-semibold' : 'bg-white text-[#1D1D1F] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/5') : 'text-zinc-500 hover:text-[#1D1D1F]'}`}
          >
            {t.behaviorTab}
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        /* Analytics Tab Dashboard (mirroring image #6) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="analytics-grid">
          
          {/* Main Spending summary card with custom styled bar chart */}
          <div className={`col-span-1 lg:col-span-7 border rounded-[32px] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${theme === 'dark' ? 'bg-[#131416] border-[#222428] shadow-black/80' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="analytics-chart-card">
            <div className="text-left">
              <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-[#C7FF2E]' : 'text-[#007AFF]'}`}>{t.spendCalculation}</span>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.spendSub}</p>
              <div className={`text-3.5xl md:text-5xl font-extrabold font-display mt-1 mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                ${Math.abs(totalSpend).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Custom chart visualization bars (mirroring Apple / Copilot layout in image #6) */}
            <div className="space-y-4" id="custom-spending-chart">
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest text-left">{t.categoryDensity}</p>
              
              <div className="space-y-4" id="chart-bars-group">
                {categories.map(([category, amount]) => {
                  const percent = Math.min(100, Math.round((amount / totalSpend) * 100));
                  
                  // Translate Category for TH
                  const categoryMap: Record<string, string> = {
                    'Food': 'อาหารและสันทนาการ',
                    'Technology': 'อุปกรณ์ไอทีเลเวลสูง',
                    'Subscriptions': 'ค่าบริการรายเดือน',
                    'Transportation': 'การเดินทาง',
                    'Socializing': 'เข้าสังคมพบปะเพื่อน',
                    'Health': 'สุขภาพและกายภาพ',
                    'Investment': 'การออมและการลงทุน',
                    'Dining': 'อาหารและสันทนาการ',
                    'Gadgets': 'อุปกรณ์ไอทีเลเวลสูง',
                    'Travel': 'การเดินทางและพอร์ทัล',
                  };
                  const translatedCat = lang === 'en' ? category : (categoryMap[category] ?? category);

                  return (
                    <div id={`bar-${category}`} key={category} className="space-y-1.5">
                      <div className={`flex justify-between text-xs font-mono ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-[#C7FF2E]' : 'bg-[#007AFF]'}`} />
                          {translatedCat}
                        </span>
                        <span>$ {amount.toLocaleString('en-US', { minimumFractionDigits: 0 })} ({percent}%)</span>
                      </div>
                      
                      {/* Stylized premium bar container with bright neon accent */}
                      <div className={`w-full h-2.5 rounded-full overflow-hidden border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-900' : 'bg-slate-100 border-slate-200'}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${theme === 'dark' ? 'bg-gradient-to-r from-[#C7FF2E] to-emerald-500' : 'bg-gradient-to-r from-[#007AFF] to-[#5856D6]'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick recommendations/insights block */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-6" id="insights-teaser-blocks">
            
            <div className={`border rounded-[32px] p-6 shadow-sm transition-all duration-300 text-left ${theme === 'dark' ? 'bg-[#131416] border-[#222428] shadow-black' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="radar-revelation-card">
              <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>{t.radarRevelation}</span>
              <h4 className={`font-display font-black text-lg mt-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.dopamineOutflows}</h4>
              <p className={`text-xs mt-2 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {t.impulseDecreasedText}
              </p>

              <div className={`p-4 border rounded-2xl flex items-center gap-3 mt-4 ${theme === 'dark' ? 'bg-[#1A1B1E] border-zinc-900' : 'bg-[#F2F2F7] border-transparent'}`} id="radar-factoid">
                <Smile className={`w-5 h-5 ${theme === 'dark' ? 'text-[#C7FF2E]' : 'text-[#007AFF]'}`} />
                <p className={`text-[11px] font-mono ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}`}>{t.topRegulatedClass}</p>
              </div>
            </div>

            {/* Premium Upgrade Teaser card (conversion vector) */}
            <div className={`border rounded-[32px] p-6 relative overflow-hidden text-left ${theme === 'dark' ? 'bg-gradient-to-br from-[#131416] to-[#0C0D0E] border-[#C7FF2E]/30' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="premium-conversion-teaser">
              <div className={`absolute -right-8 -bottom-8 w-36 h-36 rounded-full pointer-events-none ${theme === 'dark' ? 'bg-[#C7FF2E]/5' : 'bg-[#007AFF]/5'}`} />
              
              <div className="space-y-4">
                <span className={`font-mono text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 ${theme === 'dark' ? 'text-[#C7FF2E]' : 'text-[#007AFF]'}`}>
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> {t.deepCoreTitle}
                </span>
                <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-[#8E8E93]'}`}>{t.deepCoreSub}</p>
                
                <button
                  id="btn-insights-teaser-cta"
                  onClick={onNavigateToUpgrade}
                  className={`w-full text-white font-display font-extrabold text-[10px] py-3.5 text-center rounded-xl flex items-center justify-center gap-1.5 hover:scale-[1.01] transition-all cursor-pointer shadow-lg ${theme === 'dark' ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-[#1D1D1F] hover:bg-black shadow-zinc-300'}`}
                >
                  {t.upgradeFutureOS} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Behavior Intelligence Section (corresponds to Behavior Intelligence System requirements) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="behavior-grid">
          
          {/* Behavior index overview */}
          <div className={`col-span-1 lg:col-span-6 border rounded-[32px] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 text-left ${theme === 'dark' ? 'bg-[#131416] border-[#222428] shadow-zinc-950' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="emotional-radar-card">
            <div>
              <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-[#C7FF2E]' : 'text-[#007AFF]'}`}>{t.emotionalIndex}</span>
              <p className="text-xs text-zinc-500 mt-1">{t.whySovereignSpend}</p>
              <p className={`text-xs mt-2 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {t.whySovereignSpendDesc}
              </p>
            </div>

            {/* Micro graphs of emotions */}
            <div className="space-y-4 mt-6" id="emotional-breakdown-ledger">
              {emotions.map(([emotion, { total, count }]) => {
                const isWarningGroup = emotion === 'Impulse' || emotion === 'Stress';
                
                // Translatable Emotion values
                const translatedEmotion: {[key: string]: string} = {
                  Impulse: lang === 'en' ? 'Impulse' : 'ความวู่วาม',
                  Joy: lang === 'en' ? 'Joy' : 'ความรื่นเริงใจ',
                  Stress: lang === 'en' ? 'Stress' : 'ระบายทางอารมณ์',
                  Social: lang === 'en' ? 'Social' : 'สังคมจำยอม',
                  Value: lang === 'en' ? 'Value' : 'มูลค่าคุ้มครอง',
                  Investment: lang === 'en' ? 'Investment' : 'สัญชาตญาณลงพอร์ต'
                };

                return (
                  <div id={`emotion-card-${emotion}`} key={emotion} className={`p-4 border rounded-2xl flex items-center justify-between transition-colors ${theme === 'dark' ? 'bg-[#1A1B1E] border-zinc-900' : 'bg-[#F2F2F7] border-transparent text-[#1D1D1F]'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isWarningGroup ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {emotion === 'Impulse' && <Zap className="w-4 h-4 text-amber-500" />}
                        {emotion === 'Stress' && <Frown className="w-4 h-4 text-red-500" />}
                        {emotion === 'Joy' && <Smile className="w-4 h-4 text-[#007AFF]" />}
                        {emotion === 'Social' && <Users className="w-4 h-4 text-indigo-400" />}
                        {emotion === 'Value' && <Coins className={`w-4 h-4 ${theme === 'dark' ? 'text-[#C7FF2E]' : 'text-amber-600'}`} />}
                        {emotion === 'Investment' && <TrendingUp className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="text-left">
                        <h4 className={`font-display font-bold text-xs ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{translatedEmotion[emotion] || emotion}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono">{count} {lang === 'en' ? 'transaction' : 'ธุรกรรม'}{count > 1 && lang === 'en' ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono text-xs font-bold block ${theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]'}`}>${total.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                      <span className={`text-[9px] font-mono font-bold ${isWarningGroup ? 'text-amber-500' : 'text-emerald-600'}`}>
                        {isWarningGroup ? t.triggerLimitText : t.triggerHighText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI behavioral diagnostic */}
          <div className={`col-span-1 lg:col-span-6 border rounded-[32px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 text-left ${theme === 'dark' ? 'bg-[#131416]/90 border-[#222428]' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="ai-behavioral-diagnostics-card">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] pointer-events-none ${theme === 'dark' ? 'bg-emerald-500/5' : 'bg-[#007AFF]/5'}`} />
            
            <div className="space-y-4">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-[9px] tracking-widest uppercase font-bold ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#E5F9E0] text-[#1E7D32] border-transparent'}`}>
                <Brain className="w-3.5 h-3.5 animate-pulse" /> {t.diagnosticTitle}
              </div>
              <h3 className={`font-display font-extrabold text-xl ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.copingAssessment}</h3>

              <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-sans space-y-3 ${theme === 'dark' ? 'bg-[#1A1B1E] border-zinc-900 text-zinc-300' : 'bg-[#F2F2F7] border-transparent text-[#1D1D1F]'}`} id="ai-analysis-feedback">
                <p>
                  {t.copingAssessmentText1.replace('{impulseCount}', impulseCount.toString()).replace('{stressCount}', stressCount.toString())}
                </p>
                <p>
                  <strong className={theme === 'dark' ? 'text-emerald-400' : 'text-[#1E7D32]'}>{lang === 'en' ? 'Insight Agent report:' : 'รายงานบทสรุปจิตวิทยา:'}</strong> {t.copingAssessmentText2}
                </p>
              </div>
            </div>

            <div className={`pt-6 border-t mt-6 flex items-center justify-between ${theme === 'dark' ? 'border-zinc-800' : 'border-[#E5E5EA]/55'}`} id="behavioral-audit-teas">
              <div className="space-y-1">
                <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">{t.wantCompleteGraph}</span>
                <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'}`}>{t.wantCompleteGraphDesc}</p>
              </div>
              <button
                id="btn-behavioral-cta"
                onClick={onNavigateToUpgrade}
                className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer text-white"
              >
                <ArrowRight className="w-5 h-5 font-bold" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
