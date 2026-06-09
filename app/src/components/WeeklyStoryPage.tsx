import { useState } from 'react';
import {
  Sparkles, ArrowRight, HelpCircle, ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WeeklyStory, UserProfile } from '../types';
import { translations, Language } from '../data/translations';
import { PaywallGate } from './PaywallGate';

interface WeeklyStoryPageProps {
  stories: WeeklyStory[];
  profile: UserProfile;
  onNavigateToUpgrade: () => void;
  lang: Language;
  theme: 'dark' | 'light';
}

export default function WeeklyStoryPage({ stories, profile, onNavigateToUpgrade, lang, theme }: WeeklyStoryPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeStory = stories[currentIndex];

  const t = translations[lang];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const getThemeClasses = (vTheme: string) => {
    const isDark = theme === 'dark';
    switch (vTheme) {
      case 'emerald':
        return {
          cardBg: isDark ? 'bg-gradient-to-b from-[#131416]/95 to-emerald-950/25 border-emerald-500/20 text-slate-100' : 'bg-gradient-to-b from-white to-emerald-50/60 border-emerald-200 text-zinc-900 shadow-xl shadow-slate-100',
          accentText: isDark ? 'text-emerald-400 font-extrabold' : 'text-emerald-700 font-black',
          glowElement: 'bg-emerald-500/5'
        };
      case 'gold':
        return {
          cardBg: isDark ? 'bg-gradient-to-b from-[#131416]/95 to-yellow-950/25 border-amber-500/20 text-slate-100' : 'bg-gradient-to-b from-white to-amber-50/60 border-amber-200 text-zinc-900 shadow-xl shadow-slate-100',
          accentText: isDark ? 'text-amber-400 font-extrabold' : 'text-amber-700 font-black',
          glowElement: 'bg-amber-500/5'
        };
      case 'indigo':
        return {
          cardBg: isDark ? 'bg-gradient-to-b from-[#131416]/95 to-indigo-950/25 border-indigo-500/20 text-slate-100' : 'bg-gradient-to-b from-white to-indigo-50/60 border-indigo-200 text-zinc-900 shadow-xl shadow-slate-100',
          accentText: isDark ? 'text-indigo-400 font-extrabold' : 'text-indigo-700 font-black',
          glowElement: 'bg-indigo-500/5'
        };
      default:
        return {
          cardBg: isDark ? 'bg-gradient-to-b from-[#131416]/95 to-[#1A1B1E]/95 border-[#C7FF2E]/10 text-slate-100' : 'bg-gradient-to-b from-white to-slate-50/60 border-slate-200 text-zinc-900 shadow-xl shadow-slate-100',
          accentText: isDark ? 'text-[#C7FF2E] font-extrabold' : 'text-emerald-800 font-black',
          glowElement: 'bg-[#C7FF2E]/5'
        };
    }
  };

  const themeClasses = getThemeClasses(activeStory.visualTheme);

  const getLocalizedStory = (id: string) => {
    if (id === 'story_1') {
      return {
        title: lang === 'en' ? 'The Dopamine Leak' : 'รอยรั่วแห่งฮอร์โมนโดปามีน',
        category: lang === 'en' ? 'Impulse Cost' : 'รายจ่ายเฉียบพลัน',
        metricLabel: lang === 'en' ? 'Spent on emotional escape' : 'สัญชาตญาณระบายอารมณ์',
        storySegment: lang === 'en' ? activeStory.storySegment : "สัปดาห์นี้ แรงตึงเครียดสะสมเป็นตัวขับเคลื่อนธุรกรรมเฉียบพลัน 3 ครั้ง เกี่ยวกับสินค้าไอทีและกาแฟพรีเมียม ซึ่งเป็นสัญชาตญาณเพื่อให้รางวัลชั่วคราวมากกว่าแผนการคลังที่ตั้งใจไว้ โดยในคืนวันพุธคุณได้ตัดสินใจซื้อคีย์บอร์ดโดยไม่ได้วางเป้าเพื่อระงับความเครียดสะสมมูลค่า $220",
        futureImpactQuestion: lang === 'en' ? activeStory.futureImpactQuestion : "หากเปลี่ยนทิศทางเงินจำนวนนี้ไปจัดพอร์ตวินัยสะสมตราสารดัชนี ในระยะยาวจะขยายพอร์ตเป็นเงินออมถึง $8,400 ใน 10 ปี รางวัลย่อยเหล่านี้คุ้มค่าที่จะชะลอเป้าหมายอิสรภาพการคลังของคุณหรือไม่?"
      };
    } else if (id === 'story_2') {
      return {
        title: lang === 'en' ? 'The Relationship Catalyst' : 'ตัวเร่งคุณภาพความสัมพันธ์',
        category: lang === 'en' ? 'Social Capital' : 'ต้นทุนสังคมเชิงคุณภาพ',
        metricLabel: lang === 'en' ? 'Invested in high-quality fellowship' : 'ยอดลงทุนพัฒนาความสัมพันธ์',
        storySegment: lang === 'en' ? activeStory.storySegment : "การตรวจสอบระบบพบว่า ยอดการเข้าสังคมของคุณปราศจากความเสียใจ (regret-free) เงินที่คุณสะสมไว้เพื่อแบ่งปันรสชาติมื้ออาหารที่พรีเมียมร่วมกับเพื่อนพ้องผู้มีความคิดสอดคล้อง ดึงดูดเป้าหมายเชิงชีวิตอย่างสมบูรณ์แบบ",
        futureImpactQuestion: lang === 'en' ? activeStory.futureImpactQuestion : "เครือข่ายความสัมพันธ์ที่มีประโยชน์จะสร้างผลตอบแทนกลับคืนโหนดของคุณอย่างมหาศาล คุณคิดว่าควรตั้งเป้างบออมเพื่องานรื่นเริงพิเศษนี้อย่างไร โดยขจัดปาร์ตี้ขยะภายนอก?"
      };
    } else {
      return {
        title: lang === 'en' ? 'Capital Core Mastery' : 'ผู้เชี่ยวชาญการคุมพอร์ตแกนนอน',
        category: lang === 'en' ? 'Future Buffer' : 'กันชนสินทรัพย์อนาคต',
        metricLabel: lang === 'en' ? 'Allocated to wealth expansion' : 'สัดส่วนจัดสรรเพื่อการเติบโตสดใส',
        storySegment: lang === 'en' ? activeStory.storySegment : "ผลงานระดับทองคำขาว มากกว่า 91% ของยอดกระแสรายจับสุทธิไหลตรงเข้าเก็บสะสมในสินทรัพย์หลัก หุ้นดัชนี และกองทุนผลตอบแทนทวีคูณ หลีกเลี่ยงค่าฟุ่มเฟือยสิ้นเปลืองระดับจุลภาคได้อย่างเด็ดขาด",
        futureImpactQuestion: lang === 'en' ? activeStory.futureImpactQuestion : "คุณกำลังพัฒนาพอร์ตการคลังเร็วกว่าประชากรค่าเฉลี่ยถึง 2.4 เท่า คุณจะเฉลิมฉลองวินัยเหนือระดับเฉียบขาดนี้อย่างไร โดยไม่รบกวนอัตราดอกเบี้ยทบต้นพอร์ตหลัก?"
      };
    }
  };

  const localizedStory = getLocalizedStory(activeStory.id);

  return (
    <PaywallGate
      requiredTier="pro"
      currentTier={profile.plan}
      onNavigateToUpgrade={onNavigateToUpgrade}
      fallbackUI="blur"
    >
      <div id="storyboard-viewport" className={`min-h-[80vh] flex flex-col justify-center items-center py-6 md:py-12 px-4 relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0C0D0E] text-[#ECEEF2]' : 'bg-[#F4F6F8] text-zinc-900'}`}>

        {/* Backdrop Glowing mesh matched to current story theme */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[100px] pointer-events-none transition-all duration-500 ${themeClasses.glowElement}`} />

        {/* Main vertical interactive Storyboard Container */}
        <div className="w-full max-w-md z-10" id="storyboard-wrapper">

          {/* Upper Progress bars indicator (Insta-story style) */}
          <div className="flex gap-1.5 mb-4 px-1" id="story-progress-indicator">
            {stories.map((story, i) => (
              <div
                id={`story-tick-${i}`}
                key={story.id}
                className={`flex-1 h-1 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'}`}
              >
                <div
                  className={`h-full transition-all duration-300 ${i === currentIndex ? (theme === 'dark' ? 'bg-[#C7FF2E] w-full' : 'bg-[#007AFF] w-full') : (i < currentIndex ? (theme === 'dark' ? 'bg-zinc-400 w-full' : 'bg-zinc-600 w-full') : 'w-0')}`}
                />
              </div>
            ))}
          </div>

          {/* The Storyboarding Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStory.id}
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.4 }}
              className={`rounded-[36px] border p-8 relative overflow-hidden min-h-[500px] flex flex-col justify-between backdrop-blur-md transition-all duration-300 ${themeClasses.cardBg}`}
              id="active-storyboard-card"
            >
              {/* Upper content */}
              <div className="space-y-6" id="story-card-top">
                <div className="flex items-center justify-between font-mono" id="story-card-tag">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
                    {t.weeklyNarrative}
                  </span>

                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] tracking-widest uppercase font-bold ${themeClasses.accentText} ${theme === 'dark' ? 'bg-black/40 border border-zinc-800' : 'bg-[#F2F2F7] border-transparent'}`}>
                    <Sparkles className="w-3 h-3 animate-pulse" /> {localizedStory.category}
                  </span>
                </div>

                <div id="story-title-group" className="text-left">
                  <h1 className={`font-display font-black text-2xl md:text-3xl tracking-tight leading-none uppercase ${theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]'}`}>
                    {localizedStory.title}
                  </h1>

                  <div className="mt-4" id="story-metric-wrap">
                    <span className={`text-4.5xl md:text-5.5xl font-black font-display block tracking-tight leading-none ${themeClasses.accentText}`}>
                      {activeStory.value}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono mt-1 w-full block">
                      {localizedStory.metricLabel}
                    </span>
                  </div>
                </div>

                {/* Narratives focus paragraph */}
                <p className={`text-sm leading-relaxed font-sans text-left ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`} id="story-narrative-paragraph">
                  {localizedStory.storySegment}
                </p>
              </div>

              {/* Lower question prompt box */}
              <div className={`space-y-6 pt-6 border-t z-10 ${theme === 'dark' ? 'border-zinc-800' : 'border-[#E5E5EA]/80'}`} id="story-card-bottom">

                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-black/40 border-zinc-900' : 'bg-[#F2F2F7] border-transparent text-[#1D1D1F]'}`} id="future-question-bubble">
                  <div className="flex gap-2.5 items-start text-left">
                    <HelpCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${themeClasses.accentText}`} />
                    <p className={`text-xs font-sans leading-relaxed italic ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-650'}`}>
                      "{localizedStory.futureImpactQuestion}"
                    </p>
                  </div>
                </div>

                {/* Interaction controllers */}
                <div className="flex items-center justify-between gap-4" id="story-interaction-controls">
                  <div className="flex justify-between w-full text-zinc-650 dark:text-zinc-500 font-mono text-[9px] uppercase tracking-widest pt-2" id="sovereign-footpr">
                    <span>{t.premiumSovereignActive}</span>
                    <span>{t.verifiedLedger}</span>
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Traversal controls */}
          <div className="flex items-center justify-between mt-6 px-1" id="storyboard-external-controls">
            <div className="flex gap-2" id="traversal-trigger-buttons">
              <button
                id="btn-prev-story"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer ${theme === 'dark' ? 'bg-[#131416] border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-[#E5E5EA]/80 hover:bg-[#F2F2F7] text-zinc-600 hover:text-zinc-900 shadow-sm'}`}
                title={lang === 'en' ? 'Previous storyboard' : 'ย้อนกลับ'}
              >
                <ChevronLeft className="w-5 h-5 font-bold" />
              </button>
              <button
                id="btn-next-story"
                onClick={handleNext}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors cursor-pointer ${theme === 'dark' ? 'bg-[#131416] border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-[#E5E5EA]/80 hover:bg-[#F2F2F7] text-zinc-600 hover:text-zinc-900 shadow-sm'}`}
                title={lang === 'en' ? 'Next storyboard / Loop' : 'ถัดไป'}
              >
                <ChevronRight className="w-5 h-5 font-bold" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500" id="storyboard-metadata">
              <span>INDEX {currentIndex + 1} / {stories.length}</span>
            </div>
          </div>

        </div>

      </div>
    </PaywallGate>
  );
}
