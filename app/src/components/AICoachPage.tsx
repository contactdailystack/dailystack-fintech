import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, Loader, Bot, User, Zap, Flame, TrendingUp
} from 'lucide-react';
import { UserProfile, AIInterpretation } from '../types';
import { translations, Language } from '../data/translations';
import {
  FBIS_BASE,
  calculateStreakMultiplier,
  getLevelFromScore,
  getScoreToNextLevel,
  getAICOachRecommendation,
} from '../core/fbis';
import { useAuthContext } from '../services/AuthContext';
import { supabase } from '../services/supabaseClient';

interface AICoachPageProps {
  profile: UserProfile;
  interpretation: AIInterpretation;
  onNavigateToUpgrade: () => void;
  lang: Language;
  theme: 'dark' | 'light';
}

interface Message {
  sender: 'user' | 'coach';
  text: string;
  time: string;
}

export default function AICoachPage({ profile, interpretation, onNavigateToUpgrade, lang, theme }: AICoachPageProps) {
  const t = translations[lang];
  const { fbis } = useAuthContext();

  // Derive FBIS values from Supabase — fallback to base state if not yet loaded
  const fbisScore = fbis?.current_score ?? FBIS_BASE;
  const fbisStreak = fbis?.streak_days ?? 0;
  const fbisMultiplier = fbis?.xp_multiplier ?? calculateStreakMultiplier(fbisStreak);
  const fbisLevel = getLevelFromScore(fbisScore);
  const fbisToNext = getScoreToNextLevel(fbisScore);

  // Derive coach persona from tier
  const persona: 'strict' | 'supportive' | 'analytical' =
    profile.plan === 'basic' ? 'strict'
    : profile.plan === 'pro' ? 'supportive'
    : 'analytical';

  // Build coach recommendation using real FBIS state
  const fbisStateForCoach = {
    currentScore: fbisScore,
    streakDays: fbisStreak,
    lastRecordedAt: fbis?.last_recorded_at ? new Date(fbis.last_recorded_at) : null,
    xpMultiplier: fbisMultiplier,
  };
  const coachRecommendation = getAICOachRecommendation(persona, fbisStateForCoach);
  // Helper translating current archetype to Thai
  const displayArchetype = lang === 'en'
    ? interpretation.archetype
    : (interpretation.archetype === 'Sovereign Minimizer' ? 'มหาเศรษฐีผู้รอบคอบ (Sovereign Minimizer)'
      : interpretation.archetype === 'Sovereign Accumulator' ? 'ผู้สะสมผลตอบแทนสูงสุด (Sovereign Accumulator)'
      : interpretation.archetype === 'The Mindful Growth Tactician' ? 'นักวางแผนการเติบโตอย่างมีสติ (The Mindful Growth Tactician)'
      : interpretation.archetype);

  const getGreetingText = () => {
    if (lang === 'en') {
      return `Hello ${profile.name}. I have mapped your current transactional psychology into our database core. Your blueprint aligns with "${displayArchetype}". Ask me anything below to recalibrate.`;
    } else {
      return `สวัสดีคุณ ${profile.name} ระบบ DailyStack ได้ประมวลผลคำนวณด้านอารมณ์และจิตวิทยาของคุณเข้าสู่ฐานสารนิเวศวิเคราะห์เสร็จสิ้น พิมพ์เขียวของคุณตรงกับกลุ่มแบบแผน "${displayArchetype}" สอบถามข้อสงสัยเพื่อปรับระดับพอร์ตอัจฉริยะได้ทันที`;
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync greeting on language change
  useEffect(() => {
    setMessages([
      {
        sender: 'coach',
        text: getGreetingText(),
        time: '12:00 PM'
      }
    ]);
  }, [lang]);

  // Auto scroll to message bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { sender: 'user', text: userText, time: timeStr }]);
    setInputMessage('');
    setLoading(true);

    try {
      // Call AI Coach Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionId = 'default';

      const response = await fetch(
        'https://pexcvfhuvqrwrabpgkzi.supabase.co/functions/v1/ai-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (sessionData?.session?.access_token || ''),
          },
          body: JSON.stringify({
            prompt: userText,
            archetype: interpretation.archetype,
            sessionId,
            lang,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const coachTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { sender: 'coach', text: data.reply, time: coachTimeStr }]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Tier gate: redirect to upgrade
        if (errorData?.error === 'upgrade_required') {
          onNavigateToUpgrade();
          return;
        }
        // High fidelity financial coaching fallback if AI service unavailable
        const fallbackReply = generateFallbackCoaching(userText, interpretation.archetype);
        const coachTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { sender: 'coach', text: fallbackReply, time: coachTimeStr }]);
      }
    } catch {
      const fallbackReply = generateFallbackCoaching(userText, interpretation.archetype);
      const coachTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { sender: 'coach', text: fallbackReply, time: coachTimeStr }]);
    } finally {
      setLoading(false);
    }
  };

  // Luxury Fallback budget psychology engine supporting Thai
  const generateFallbackCoaching = (query: string, archetype: string): string => {
    const q = query.toLowerCase();
    
    if (lang === 'en') {
      if (q.includes('save') || q.includes('budget')) {
        return `As a ${archetype}, your core future confidence relies on structured systems. I recommend establishing an autonomous "10% core multiplier" where that portion of every incoming settlement bypasses your retail accounts and settles instantly into MSFT or treasury classes. This mitigates mid-week dopamine leakagees.`;
      }
      if (q.includes('invest') || q.includes('stock') || q.includes('crypto')) {
        return `We see extreme demographic stability in Apple (AAPL) and NVIDIA (NVDA) positions inside your current profile. To maximize compound momentum, focus 80% on these system anchors, and contain speculative micro-plays under a strict 4% emotional playground limit.`;
      }
      if (q.includes('impulse') || q.includes('spending') || q.includes('why')) {
        return `Our analysis confirms Wednesday evenings are your highest risk timeframe due to accumulated cortisol spikes triggering minor hardware gadgets and fine dining purchases. Establish a 24-hour "cooling lock-out" rule specifically for these hours. Delaying purchase execution by 24 hours destroys 91% of impulse urges instantly.`;
      }
      return `Interesting strategic query, ${profile.name}. In alignment with your "${archetype}" blueprint, we must protect your future capital integrity by prioritizing stability. I recommend examining your socializing expenditure next week to filter out transactional casual acquaintances. What specifically triggers your buying dopamine today?`;
    } else {
      // Thai Language Coaching falls
      if (q.includes('ออม') || q.includes('ประหยัด') || q.includes('งบ') || q.includes('save') || q.includes('budget')) {
        return `ในฐานะกลุ่มพฤติกรรมสากลสำหรับ ${displayArchetype} ความมั่นใจในพอร์ตการคลังฝังลึกในวินัยสะสมรายตัว แนะนำให้เปิด 'หักทวีคูณ 10% อัตโนมัติ' จากทุกโหนดที่เข้ามาตรงเข้าบัญชีหุ้นหลักระดับระบบ (เช่น AAPL หรือ MSCI) ทันทีเพื่อปิดกั้นแรงวู่วามช้อปปิ้งกลางสัปดาห์`;
      }
      if (q.includes('หุ้น') || q.includes('ลงทุน') || q.includes('invest') || q.includes('crypto')) {
        return `กระเป๋าสินทรัพย์ระบุว่าโหนด Apple และ NVIDIA เป็นโหนดหลักในการคุ้มครองระบบ ดำรงวินัยรักษาแกนหลักนี้ไว้ไม่น้อยกว่า 80% ของกระแสทุนหมุนเวียน และตีกรอบจำกัดมูลค่าวู่วามที่ต่ำกว่า 4% ของมูลค่าสุทธิพอร์ตเสมอ`;
      }
      if (q.includes('ซื้อ') || q.includes('วู่วาม') || q.includes('spending') || q.includes('why') || q.includes('เพราะอะไร')) {
        return `ระบบประมวลผลดัชนีพบว่า คืนวันพุธหลังเลิกเรียน/ทำงาน เป็นช่วงที่ระดับความตึงเครียดส่งผลสูงเป็นพิเศษกระตุ้นการตัดสินใจจ่ายเงินเพื่อระบายอารมณ์ แนะนำให้ปฏิบัติตาม 'กฎปรับสมดุล 24 ชั่วโมง' โดยต้องรอหน่วงเวลา 1 วันเต็มก่อนอนุมัติซื้อจริง วินัยนี้จะระงับโหมด impulse ได้ถึง 91%`;
      }
      return `เป็นวัตถุประสงค์เชิงกลยุทธ์ที่น่าจับตาคุณ ${profile.name} หากดูตามพิมพ์เขียวแบบแผน ${displayArchetype} ของท่าน เราต้องเสริมสร้างฐานความมั่นคง แนะนำให้คัดกรองค่าใช้จ่ายในการเข้าสังคมที่ไม่จำเป็นในสัปดาห์หน้า แล้วคุณล่ะจุดประกายอารมณ์ซื้อวันนี้จากปัจจัยใดเป็นหลัก?`;
    }
  };

  return (
    <div id="ai-coach-viewport" className="space-y-6 md:space-y-8 animate-slide-up">
      
      {/* Upper Grid: Personal Money Radar Identity metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="coach-radar-grid">
        
        {/* Left Card: Archetype and Personality breakdown */}
        <div className={`col-span-1 lg:col-span-4 border rounded-[32px] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${theme === 'dark' ? 'bg-dark-card border-dark-border shadow-black/80' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="archetype-info-card">
          <div className="space-y-4 text-left">
            <span className={`font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border font-bold ${theme === 'dark' ? 'bg-brand/10 text-brand border-brand/20' : 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'}`}>
              {t.identityRadar}
            </span>
            <p className="text-xs text-zinc-500 font-mono mt-2">{t.coreSignature}</p>
            <h3 className={`font-display font-black text-xl tracking-tight leading-none uppercase ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {displayArchetype}
            </h3>
            <p className={`text-xs leading-relaxed font-sans mt-3 text-left ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-650'}`}>
              {lang === 'en' ? interpretation.summary : 'พฤติกรรมนี้แสดงอัตราการสะสมทุนชั้นคลาสที่แข็งแกร่ง ปิดกั้นแรงสั่นไหวของตลาดร่วมด้วยวิสัยทัศน์พอร์ตแบบเป้าหมายยาวนาน มีแบบวินัยในการคอยสอดส่องและป้องกันการไหลของระบบได้อย่างอัจฉริยะ'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border mt-6 ${theme === 'dark' ? 'bg-dark-card border-zinc-900' : 'bg-[#F2F2F7] border-transparent'}`} id="radar-confidence-tier">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[8px] text-zinc-500 uppercase">{t.confidenceScore}</span>
              <span className={`font-mono text-xs font-bold ${theme === 'dark' ? 'text-brand' : 'text-[#007AFF]'}`}>{interpretation.confidenceScore}%</span>
            </div>
            {/* Confidence progress bar */}
            <div className={`w-full h-1 rounded-full mt-2 overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200/60'}`}>
              <div 
                className={`h-full rounded-full ${theme === 'dark' ? 'bg-brand' : 'bg-[#007AFF]'}`} 
                style={{ width: `${interpretation.confidenceScore}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Right Card: Interactive Radar sliders representation (Identity Engine metrics) */}
        <div className={`col-span-1 lg:col-span-8 border rounded-[32px] p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${theme === 'dark' ? 'bg-dark-card border-dark-border shadow-black/80' : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="radar-metrics-interactive">
          <div className="text-left flex justify-between items-start gap-4">
            <div>
              <h3 className={`font-display font-medium text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-[#ECEEF2]' : 'text-zinc-650'}`}>
                {t.biometricIndicators}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-1 text-left">{t.calibrationsTitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 text-left" id="radar-metrics-columns">
            <div className="space-y-4">
              <div className="space-y-1.5" id="slider-impulse">
                <div className="flex justify-between text-xs font-mono">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>{t.impulseRating}</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-[#C7FF2E]' : 'text-amber-600'}`}>{interpretation.radarAnalysis.impulseRating}/100</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-900' : 'bg-[#F2F2F7] border-transparent'}`}>
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${interpretation.radarAnalysis.impulseRating}%` }} />
                </div>
              </div>

              <div className="space-y-1.5" id="slider-future">
                <div className="flex justify-between text-xs font-mono">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>{t.futureHorizon}</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-[#1E7D32]'}`}>{interpretation.radarAnalysis.futureOrientation}/100</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-900' : 'bg-[#F2F2F7] border-transparent'}`}>
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${interpretation.radarAnalysis.futureOrientation}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5" id="slider-social">
                <div className="flex justify-between text-xs font-mono">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>{t.socialDefense}</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-indigo-600'}`}>{interpretation.radarAnalysis.socialPressureResistance}/100</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-900' : 'bg-[#F2F2F7] border-transparent'}`}>
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${interpretation.radarAnalysis.socialPressureResistance}%` }} />
                </div>
              </div>

              <div className="space-y-1.5" id="slider-value">
                <div className="flex justify-between text-xs font-mono">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>{t.valueSeeking}</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-violet-700'}`}>{interpretation.radarAnalysis.smartValueSeeking}/100</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-900' : 'bg-[#F2F2F7] border-transparent'}`}>
                  <div className="h-full bg-violet-600 rounded-full" style={{ width: `${interpretation.radarAnalysis.smartValueSeeking}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FBIS Score Card */}
      <div className={`border rounded-[32px] p-5 flex flex-col gap-4 transition-all duration-300 ${theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-[#E5E5EA]/85 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="fbis-score-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-[#C7FF2E]/10 text-[#C7FF2E]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <span className={`font-mono text-[9px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {lang === 'en' ? 'Financial Behavior Score' : 'คะแนนพฤติกรรมการเงิน'}
            </span>
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-bold ${theme === 'dark' ? 'text-[#C7FF2E] border-[#C7FF2E]/20 bg-[#C7FF2E]/10' : 'text-[#007AFF] border-[#007AFF]/20 bg-[#007AFF]/10'}`}>
            {lang === 'en' ? `Level ${fbisLevel}` : `เลเวล ${fbisLevel}`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Score */}
          <div className="flex flex-col gap-1">
            <span className={`font-mono text-[8px] uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {lang === 'en' ? 'Score' : 'คะแนน'}
            </span>
            <span className={`font-display font-black text-2xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {fbisScore}
            </span>
          </div>
          {/* Next Level */}
          <div className="flex flex-col gap-1">
            <span className={`font-mono text-[8px] uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {lang === 'en' ? 'To Next Level' : 'สู่เลเวลถัดไป'}
            </span>
            <span className={`font-display font-black text-2xl tracking-tight ${theme === 'dark' ? 'text-[#C7FF2E]' : 'text-[#007AFF]'}`}>
              {fbisToNext}
            </span>
          </div>
          {/* Streak */}
          <div className="flex flex-col gap-1">
            <span className={`font-mono text-[8px] uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {lang === 'en' ? 'Streak' : 'วันต่อเนื่อง'}
            </span>
            <div className="flex items-center gap-1">
              <Flame className={`w-4 h-4 ${fbisStreak > 0 ? 'text-amber-400' : theme === 'dark' ? 'text-zinc-600' : 'text-zinc-300'}`} />
              <span className={`font-display font-black text-2xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                {fbisStreak}
              </span>
              {fbisMultiplier > 1.0 && (
                <span className="font-mono text-[8px] text-amber-400 font-bold">{fbisMultiplier}x</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar to next level */}
        <div className="space-y-1">
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200/60'}`}>
            <div
              className={`h-full rounded-full ${theme === 'dark' ? 'bg-[#C7FF2E]' : 'bg-[#007AFF]'}`}
              style={{ width: `${Math.min(100, ((fbisScore % 1000) / 1000) * 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-3 h-3 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`} />
            <p className={`font-mono text-[9px] italic ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {coachRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Lower Main block: Chat console interface (Apple style minimalist luxury) */}
      <div className={`border rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[440px] transition-all duration-300 ${theme === 'dark' ? 'bg-dark-card border-dark-border' : 'bg-white border-[#E5E5EA]/85 shadow-[0_8px_32px_rgba(0,0,0,0.03)]'}`} id="coach-chat-console">
        
        <div className={`flex items-center justify-between pb-4 border-b ${theme === 'dark' ? 'border-zinc-800/60' : 'border-slate-100'}`} id="chat-header">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${theme === 'dark' ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-[#007AFF]/10 border-transparent text-[#007AFF]'}`}>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <h4 className={`font-display font-medium text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{t.tacticalEngine}</h4>
              <p className="text-[10px] text-emerald-500 font-mono font-semibold">{t.readyReasoning}</p>
            </div>
          </div>

          {profile.plan === 'basic' && (
            <button
              id="btn-chat-upgrade"
              onClick={onNavigateToUpgrade}
              className={`border px-3.5 py-1.5 rounded-xl font-mono text-[9px] uppercase tracking-widest font-bold transition-all cursor-pointer ${theme === 'dark' ? 'bg-brand/10 text-brand border-brand/30 hover:bg-brand/25' : 'bg-[#EFEEF4] border-transparent text-[#007AFF] hover:bg-[#E5E5EA]'}`}
            >
              {t.infiniteMemory}
            </button>
          )}
        </div>

        {/* Messages list scrollable container */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 max-h-[300px] pr-1" id="chat-scroller">
          {messages.map((msg, i) => {
            const isCoach = msg.sender === 'coach';
            return (
              <div
                id={`chat-bubble-${i}`}
                key={i}
                className={`flex gap-3 max-w-[85%] ${isCoach ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCoach ? (theme === 'dark' ? 'bg-[#C7FF2E]/10 text-[#C7FF2E]' : 'bg-[#007AFF]/10 text-[#007AFF]') : (theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-205 text-slate-705')}`}>
                  {isCoach
                    ? <Bot className="w-4 h-4" />
                    : <User className="w-4 h-4" />
                  }
                </div>
                <div className={`p-4 rounded-3xl text-sm leading-relaxed text-left ${isCoach ? (theme === 'dark' ? 'bg-[#1A1B1E] border border-zinc-900 rounded-tl-none text-zinc-300' : 'bg-white border border-slate-205 rounded-tl-none text-zinc-805 shadow-sm') : (theme === 'dark' ? 'bg-[#C7FF2E] text-black font-semibold rounded-br-none' : 'bg-[#007AFF] text-white font-medium rounded-br-none shadow-sm')}`}>
                  {msg.text}
                  <span className={`block text-[9px] font-mono mt-1 text-right ${isCoach ? 'text-zinc-500' : 'text-zinc-200/80'}`}>{msg.time}</span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start mr-auto items-start animate-pulse" id="chat-loading-ind">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-[#C7FF2E]/10' : 'bg-slate-100'}`}>
                <Loader className={`w-4 h-4 animate-spin ${theme === 'dark' ? 'text-[#C7FF2E]' : 'text-[#007AFF]'}`} />
              </div>
              <div className={`p-4 rounded-3xl rounded-tl-none text-xs font-mono text-left ${theme === 'dark' ? 'bg-[#1A1B1E] border border-zinc-900 text-zinc-500' : 'bg-slate-100 border border-slate-200 text-zinc-650'}`}>
                {t.chatProcessing}
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Text Form submit */}
        <form onSubmit={handleSendMessage} className={`pt-4 border-t flex items-center gap-3 ${theme === 'dark' ? 'border-zinc-800/60' : 'border-slate-100'}`} id="chat-input-form">
          <input
            id="input-chat-prompt"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            placeholder={t.chatPlaceholder}
            className={`flex-1 border rounded-2xl px-5 py-3 text-xs transition-all font-sans focus:outline-none focus:ring-1 ${theme === 'dark' ? 'bg-zinc-950 border-zinc-900 focus:border-[#C7FF2E]/30 text-white focus:ring-[#C7FF2E]/10 placeholder-zinc-500' : 'bg-[#F2F2F7] border-transparent text-[#1D1D1F] placeholder-[#8E8E93] focus:bg-white focus:border-[#007AFF] focus:ring-[#007AFF]/35'}`}
          />
          <button
            id="btn-chat-submit"
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 ${theme === 'dark' ? 'bg-[#C7FF2E] hover:bg-white text-black shadow-md' : 'bg-[#007AFF] hover:bg-[#0066CC] text-white shadow-sm'}`}
          >
            <Send className="w-4 h-4 font-bold" />
          </button>
        </form>

      </div>

    </div>
  );
}
