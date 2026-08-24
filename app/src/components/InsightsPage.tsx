import { useState } from 'react';
import { 
  ArrowRight, Sparkles, Smile 
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

  // Merchant leaderboard (RM parity): top 5 merchants by cumulative spend + largest single purchase
  const merchantSpend: { [name: string]: number } = {};
  let largestPurchase: { merchant: string; amount: number } | null = null;
  transactions
    .filter((tx) => tx.amount < 0)
    .forEach((tx) => {
      const name = (tx.merchant || '').trim();
      if (!name) return;
      const abs = Math.abs(tx.amount);
      merchantSpend[name] = (merchantSpend[name] || 0) + abs;
      if (!largestPurchase || abs > largestPurchase.amount) {
        largestPurchase = { merchant: name, amount: abs };
      }
    });
  const topMerchants = Object.entries(merchantSpend).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div id="insights-viewport" className="space-y-6 md:space-y-8 animate-slide-up">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="insights-header">
        <div className="text-left">
          <h2 className={`font-display font-extrabold text-2xl ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.valueInsightsTitle}</h2>
          <p className="text-xs text-zinc-500 font-mono tracking-wider">{t.valueInsightsSub}</p>
        </div>

        {/* Custom Tab Switcher */}
      </div>

      {
        /* Analytics Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="analytics-grid">
          
          {/* Main Spending summary card with custom styled bar chart */}
          <div className={`col-span-1 lg:col-span-7 border rounded-[32px] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${theme === 'dark' ? 'bg-[#131416] border-[#222428] shadow-black/80' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="analytics-chart-card">
            <div className="text-left">
              <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-[#0FB0CE]' : 'text-[#007AFF]'}`}>{t.spendCalculation}</span>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.spendSub}</p>
              <div className={`text-3.5xl md:text-5xl font-extrabold font-display mt-1 mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                ฿{Math.abs(totalSpend).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                          <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-[#0FB0CE]' : 'bg-[#007AFF]'}`} />
                          {translatedCat}
                        </span>
                        <span>฿{amount.toLocaleString('en-US', { minimumFractionDigits: 0 })} ({percent}%)</span>
                      </div>
                      
                      {/* Stylized premium bar container with bright neon accent */}
                      <div className={`w-full h-2.5 rounded-full overflow-hidden border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-900' : 'bg-slate-100 border-slate-200'}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${theme === 'dark' ? 'bg-gradient-to-r from-[#0FB0CE] to-emerald-500' : 'bg-gradient-to-r from-[#007AFF] to-[#5856D6]'}`}
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
                <Smile className={`w-5 h-5 ${theme === 'dark' ? 'text-[#0FB0CE]' : 'text-[#007AFF]'}`} />
                <p className={`text-[11px] font-mono ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}`}>{t.topRegulatedClass}</p>
              </div>
            </div>

            {/* Premium Upgrade Teaser card (conversion vector) */}
            <div className={`border rounded-[32px] p-6 relative overflow-hidden text-left ${theme === 'dark' ? 'bg-gradient-to-br from-[#131416] to-[#0C0D0E] border-[#0FB0CE]/30' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="premium-conversion-teaser">
              <div className={`absolute -right-8 -bottom-8 w-36 h-36 rounded-full pointer-events-none ${theme === 'dark' ? 'bg-[#0FB0CE]/5' : 'bg-[#007AFF]/5'}`} />
              
              <div className="space-y-4">
                <span className={`font-mono text-[9px] uppercase tracking-widest font-bold flex items-center gap-1.5 ${theme === 'dark' ? 'text-[#0FB0CE]' : 'text-[#007AFF]'}`}>
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
      }

      {/* Merchant Leaderboard (RM parity) */}
      {topMerchants.length > 0 && (
        <div className={`border rounded-[32px] p-6 shadow-sm text-left ${theme === 'dark' ? 'bg-[#131416] border-[#222428] shadow-black/80' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="merchant-leaderboard-card">
          <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-[#0FB0CE]' : 'text-[#007AFF]'}`}>
            {lang === 'th' ? 'จัดอันดับร้านค้า' : 'Merchant Leaderboard'}
          </span>
          <h4 className={`font-display font-black text-lg mt-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            {lang === 'th' ? 'คุณใช้จ่ายกับที่ไหนมากที่สุด' : 'Where your money goes most'}
          </h4>

          <div className="mt-4 space-y-3">
            {topMerchants.map(([name, amount], i) => {
              const percent = Math.min(100, Math.round((amount / totalSpend) * 100));
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${i === 0
                    ? (theme === 'dark' ? 'bg-[#C7A784]/20 text-[#C7A784]' : 'bg-[#C7A784]/15 text-[#8a6d47]')
                    : (theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500')}`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>{name}</span>
                      <span className={`text-xs font-mono flex-shrink-0 ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>฿{amount.toLocaleString('en-US')}</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full mt-1 overflow-hidden ${theme === 'dark' ? 'bg-zinc-950' : 'bg-slate-100'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${i === 0 ? (theme === 'dark' ? 'bg-[#C7A784]' : 'bg-[#C7A784]') : (theme === 'dark' ? 'bg-[#0FB0CE]' : 'bg-[#007AFF]')}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {largestPurchase && (
            <p className={`text-[11px] font-mono mt-4 pt-4 border-t ${theme === 'dark' ? 'text-zinc-500 border-zinc-900' : 'text-zinc-500 border-zinc-100'}`}>
              {lang === 'th'
                ? `ซื้อครั้งเดียวใหญ่สุด: ${(largestPurchase as { merchant: string; amount: number }).merchant} ฿${(largestPurchase as { merchant: string; amount: number }).amount.toLocaleString('en-US')}`
                : `Largest single purchase: ${(largestPurchase as { merchant: string; amount: number }).merchant} · ฿${(largestPurchase as { merchant: string; amount: number }).amount.toLocaleString('en-US')}`}
            </p>
          )}
        </div>
      )}

    </div>
  );
}
