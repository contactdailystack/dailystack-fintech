/**
 * MoneyTwinPage.tsx — Layer 8: Money Twin Blueprint Matrix
 * Shows the user's Financial Twin persona with radar chart, predictions,
 * behavioral timeline, and personalized alignment recommendations.
 * Tier gates: BASIC=preview 3 axes, PRO=full 5 axes, ELITE=full+predictions+timeline
 */
import { useMemo } from 'react';
import {
  TrendingUp, Target, Zap, Clock,
  ChevronRight, Sparkles, Lock, Flame, BrainCircuit, Radar
} from 'lucide-react';
import { UserProfile, Transaction, AIInterpretation } from '../types';
import { FBISMetaRecord } from '../services/fbisService';
import {
  calculateStreakMultiplier,
  getLevelFromScore,
} from '../core/fbis';
import { translations, Language } from '../data/translations';

interface MoneyTwinPageProps {
  profile: UserProfile;
  transactions: Transaction[];
  fbis: FBISMetaRecord | null;
  interpretation: AIInterpretation;
  onNavigateToUpgrade: () => void;
  lang: Language;
  theme: 'dark' | 'light';
}

// ─── Radar axis data derivation ─────────────────────────────────────────────

interface RadarAxis {
  key: 'impulse' | 'planning' | 'savingRate' | 'riskTolerance' | 'socialSpending';
  labelEn: string;
  labelTh: string;
  current: number; // 0-100
  ideal: number;    // 0-100
  color: string;
}

function deriveRadarAxes(transactions: Transaction[], tier: string): RadarAxis[] {
  // Calculate axis values from transaction patterns
  const spending = transactions.filter(t => t.amount < 0);
  const income   = transactions.filter(t => t.amount > 0);

  const totalSpending = spending.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIncome  = income.reduce((s, t) => s + t.amount, 0);
  const savingRate   = totalIncome > 0 ? Math.max(0, Math.min(100, ((totalIncome - totalSpending) / totalIncome) * 100)) : 40;

  const impulseTxes  = spending.filter(t => t.emotion === 'Impulse' || t.behavioralCategory === 'Impulse');
  const impulseScore = spending.length > 0
    ? Math.max(10, 100 - (impulseTxes.length / spending.length) * 100)
    : 70;

  const plannedTxes  = spending.filter(t => t.intent === 'Need' || t.intent === 'Business');
  const planningScore = spending.length > 0
    ? Math.round((plannedTxes.length / spending.length) * 100)
    : 50;

  const socialTxes      = spending.filter(t => t.category === 'Socializing' || t.behavioralCategory === 'Social');
  const socialSpendingScore = spending.length > 0
    ? Math.round((socialTxes.length / spending.length) * 100)
    : 30;

  const riskTxes  = spending.filter(t => (t.riskScore ?? 0) > 60);
  const riskScore = spending.length > 0
    ? Math.max(10, 100 - (riskTxes.length / spending.length) * 100)
    : 60;

  const allAxes: RadarAxis[] = [
    {
      key: 'impulse',
      labelEn: 'Impulse Control',
      labelTh: 'การควบคุมสิ่งยั่วยุ',
      current: Math.round(impulseScore),
      ideal: 85,
      color: '#F59E0B',
    },
    {
      key: 'planning',
      labelEn: 'Planning',
      labelTh: 'การวางแผน',
      current: Math.round(planningScore),
      ideal: 80,
      color: '#3B82F6',
    },
    {
      key: 'savingRate',
      labelEn: 'Saving Rate',
      labelTh: 'อัตราการออม',
      current: Math.round(savingRate),
      ideal: 60,
      color: '#10B981',
    },
    {
      key: 'riskTolerance',
      labelEn: 'Risk Tolerance',
      labelTh: 'ความอดทนต่อความเสี่ยง',
      current: Math.round(riskScore),
      ideal: 50,
      color: '#8B5CF6',
    },
    {
      key: 'socialSpending',
      labelEn: 'Social Spending',
      labelTh: 'การใช้จ่ายเพื่อสังคม',
      current: Math.round(socialSpendingScore),
      ideal: 40,
      color: '#EC4899',
    },
  ];

  // BASIC: only first 3 axes
  if (tier === 'basic') return allAxes.slice(0, 3);
  // PRO/ELITE: all 5 axes
  return allAxes;
}

// ─── SVG Radar Chart ────────────────────────────────────────────────────────

function RadarSVG({ axes, size = 280 }: { axes: RadarAxis[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 32;
  const n = axes.length;
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getPoint = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Polygon points for current values
  const currentPoints = axes.map((a, i) => {
    const p = getPoint(i, (a.current / 100) * maxR);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Polygon points for ideal values (dashed)
  const idealPoints = axes.map((a, i) => {
    const p = getPoint(i, (a.ideal / 100) * maxR);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Background circles */}
      {levels.map(level => (
        <circle
          key={level}
          cx={cx}
          cy={cy}
          r={maxR * level}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axes.map((_, i) => {
        const p = getPoint(i, maxR);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        );
      })}

      {/* Ideal polygon */}
      <polygon
        points={idealPoints}
        fill="rgba(199,255,2,0.06)"
        stroke="#C7FF2E"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeOpacity="0.6"
      />

      {/* Current polygon */}
      <polygon
        points={currentPoints}
        fill="rgba(199,255,2,0.15)"
        stroke="#C7FF2E"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {axes.map((a, i) => {
        const p = getPoint(i, (a.current / 100) * maxR);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#C7FF2E"
            stroke="#0A0F0A"
            strokeWidth="2"
          />
        );
      })}

      {/* Axis labels */}
      {axes.map((a, i) => {
        const p = getPoint(i, maxR + 20);
        const isRight = p.x > cx;
        const isLeft  = p.x < cx;
        return (
          <text
            key={a.key}
            x={p.x}
            y={p.y}
            textAnchor={isRight ? 'start' : isLeft ? 'end' : 'middle'}
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.55)"
            fontSize="9"
            fontFamily="Space Grotesk, sans-serif"
            fontWeight="500"
          >
            {a.labelEn}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Weekly Timeline ─────────────────────────────────────────────────────────

interface WeeklyData { week: string; score: number; label: string; }
function buildWeeklyTimeline(transactions: Transaction[]): WeeklyData[] {
  const now = new Date();
  const weeks: WeeklyData[] = [];
  for (let w = 3; w >= 0; w--) {
    const d = new Date(now);
    d.setDate(d.getDate() - w * 7);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekTxs = transactions.filter(t => {
      const dt = new Date(t.date);
      return dt >= weekStart && dt <= weekEnd;
    });
    const score = weekTxs.length > 0
      ? Math.round(
          (weekTxs.filter(tx => tx.behavioralCategory !== 'Impulse').length / weekTxs.length) * 100
        )
      : 50;
    weeks.push({
      week: `W${4 - w}`,
      score,
      label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
    });
  }
  return weeks;
}

// ─── Twin prediction engine ─────────────────────────────────────────────────

function generatePrediction(transactions: Transaction[], archetype: string, lang: Language) {
  const recentImpulse = transactions.filter(t =>
    (t.emotion === 'Impulse' || t.behavioralCategory === 'Impulse') &&
    new Date(t.date) > new Date(Date.now() - 7 * 86400000)
  );
  const hasHighRisk = recentImpulse.some(t => (t.riskScore ?? 0) > 70);
  const lastTx = transactions[0];

  if (hasHighRisk) {
    return lang === 'en'
      ? `High risk: Your next 7 days carry elevated impulse exposure. A midnight FOMO trigger is 78% likely. Consider a 24-hour cooling lock.`
      : `ความเสี่ยงสูง: 7 วันข้างหน้ามีโอกาสเผชิญแรงยั่วยุสูง แนวโน้ม FOMO ตอนดึกอยู่ที่ 78% ควรตั้งกฎแช่เย็น 24 ชม.`;
  }
  if (lastTx?.emotion === 'Stress') {
    return lang === 'en'
      ? `Post-stress pattern detected. Weekend socializing spend may surge 34%. Pre-allocate a fixed social budget to contain drift.`
      : `พบรูปแบบหลังความเครียด การใช้จ่ายทางสังคมช่วงสุดสัปดาห์อาจพุ่ง 34% ควรตั้งงบสังคมคงที่เพื่อป้องกันการรั่วไหล`;
  }
  return lang === 'en'
    ? `Stable trajectory. No major behavioral disruptions predicted in the next 14 days. Keep the current streak to compound your score.`
    : `วิถีทางการเงินมั่นคง ไม่คาดการณ์ความผิดปกติพฤติกรรมใน 14 วันข้างหน้า รักษาสตรีคปัจจุบันเพื่อทบยอดคะแนน`;
}

// ─── Alignment recommendations ───────────────────────────────────────────────

function getRecommendations(axes: RadarAxis[], lang: Language) {
  const gaps = axes
    .filter(a => a.current < a.ideal - 10)
    .sort((a, b) => (a.ideal - a.current) - (b.ideal - b.current));

  const en: Record<string, string> = {
    impulse: 'Your impulse control is below target. Establish a 24-hour cooling rule for purchases over ฿500.',
    planning: 'Increase planned (Need/Business) transactions to outpace unplanned (Want/Emotional) ones.',
    savingRate: 'Your saving rate trails your ideal. Set up automatic 10% transfer on income days.',
    riskTolerance: 'High-risk transactions are dragging your score. Review emotional buying triggers before large purchases.',
    socialSpending: 'Social spending exceeds ideal levels. Pre-allocate a monthly social budget and hold to it.',
  };
  const th: Record<string, string> = {
    impulse: 'การควบคุมสิ่งยั่วยุต่ำกว่าเป้าหมาย ตั้งกฎแช่เย็น 24 ชม. สำหรับการซื้อเกิน ฿500',
    planning: 'เพิ่มรายการที่วางแผน (Need/Business) ให้เหนือกว่ารายการฉุกเฉิน (Want/Emotional)',
    savingRate: 'อัตราการออมต่ำกว่าเป้า ตั้งโอนอัตโนมัติ 10% ทุกวันรับเงิน',
    riskTolerance: 'รายการความเสี่ยงสูงกำลังลากคะแนน ทบทวนสาเหตุอารมณ์ก่อนซื้อใหญ่',
    socialSpending: 'การใช้จ่ายทางสังคมเกินเป้า ตั้งงบสังคมรายเดือนคงที่และยึดมั่น',
  };

  return gaps.slice(0, 3).map(g => ({
    axis: g.key,
    text: lang === 'en' ? en[g.key] : th[g.key],
    gap: g.ideal - g.current,
  }));
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function MoneyTwinPage({
  profile,
  transactions,
  fbis,
  interpretation,
  onNavigateToUpgrade,
  lang,
  theme,
}: MoneyTwinPageProps) {
  const t = translations[lang];
  const tier = profile.plan;

  const radarAxes = useMemo(() => deriveRadarAxes(transactions, tier), [transactions, tier]);
  const weeklyTimeline = useMemo(() => buildWeeklyTimeline(transactions), [transactions]);
  const recommendations = useMemo(() => getRecommendations(radarAxes, lang), [radarAxes, lang]);
  const prediction = useMemo(
    () => generatePrediction(transactions, interpretation.archetype, lang),
    [transactions, interpretation.archetype, lang]
  );

  const fbisScore   = fbis?.current_score ?? 1000;
  const fbisStreak  = fbis?.streak_days ?? 0;
  const fbisMult     = fbis?.xp_multiplier ?? calculateStreakMultiplier(fbisStreak);
  const fbisLevel    = getLevelFromScore(fbisScore);
  const showTimeline = tier === 'elite';
  const showPredictions = tier === 'elite';
  const showFullRadar = tier !== 'basic';

  const displayArchetype = lang === 'en'
    ? interpretation.archetype
    : interpretation.archetype === 'Sovereign Minimizer' ? 'มหาเศรษฐีผู้รอบคอบ'
    : interpretation.archetype === 'Sovereign Accumulator' ? 'ผู้สะสมผลตอบแทนสูงสุด'
    : interpretation.archetype === 'The Mindful Growth Tactician' ? 'นักวางแผนการเติบโตอย่างมีสติ'
    : interpretation.archetype;

  const cardClass = theme === 'dark'
    ? 'bg-dark-card border-dark-border'
    : 'bg-white border-[#E5E5EA]/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)]';
  const textClass = theme === 'dark' ? 'text-white' : 'text-zinc-900';
  const subtextClass = theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500';
  const borderClass = theme === 'dark' ? 'border-dark-border' : 'border-[#E5E5EA]/60';

  return (
    <div id="money-twin-viewport" className="space-y-6 animate-slide-up text-left">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-display text-2xl font-extrabold ${textClass}`}>
            {lang === 'en' ? 'Money Twin Blueprint' : 'พิมพ์เขียว Money Twin'}
          </h2>
          <p className={`text-sm ${subtextClass}`}>
            {lang === 'en'
              ? 'Your financial twin persona — current vs. ideal state'
              : 'ตัวตนทางการเงินของคุณ — สถานะปัจจุบันเทียบเป้าหมาย'}
          </p>
        </div>
        {tier !== 'elite' && (
          <button
            onClick={onNavigateToUpgrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/10 text-brand border border-brand/30 text-xs font-mono font-bold hover:bg-brand/20 transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            {lang === 'en' ? 'ELITE' : 'ELITE'}
          </button>
        )}
      </div>

      {/* ── Tier gate warning for BASIC/PRO ── */}
      {tier === 'basic' && (
        <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-amber-300 font-mono font-bold">
              {lang === 'en' ? 'PREMIUM PREVIEW — 3 of 5 axes shown' : 'ตัวอย่างพรีเมียม — แสดง 3 จาก 5 แกน'}
            </p>
            <p className="text-xs text-amber-400/70 mt-1">
              {lang === 'en'
                ? 'Upgrade to PRO to unlock full 5-axis radar and behavioral predictions.'
                : 'อัปเกรดเป็น PRO เพื่อปลดล็อกเรดาร์ 5 แกนและการคาดการณ์พฤติกรรมเต็มรูปแบบ'}
            </p>
          </div>
        </div>
      )}
      {tier === 'pro' && (
        <div className="rounded-2xl p-4 bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-purple-300 font-mono font-bold">
              {lang === 'en' ? 'PRO ACTIVE — Full 5-axis radar unlocked' : 'PRO เปิดใช้งาน — เรดาร์ 5 แกนเต็มรูปแบบปลดล็อกแล้ว'}
            </p>
            <p className="text-xs text-purple-400/70 mt-1">
              {lang === 'en'
                ? 'Upgrade to ELITE to unlock behavioral predictions and weekly timeline.'
                : 'อัปเกรดเป็น ELITE เพื่อปลดล็อกการคาดการณ์พฤติกรรมและไทม์ไลน์รายสัปดาห์'}
            </p>
          </div>
        </div>
      )}

      {/* ── Upper Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Twin Persona Card */}
        <div className={`col-span-1 lg:col-span-4 border rounded-[32px] p-6 flex flex-col gap-5 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <span className={`font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border font-bold ${theme === 'dark' ? 'bg-brand/10 text-brand border-brand/20' : 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'}`}>
              {lang === 'en' ? 'Your Twin Identity' : 'ตัวตน Money Twin ของคุณ'}
            </span>
            <BrainCircuit className={`w-4 h-4 ${theme === 'dark' ? 'text-brand' : 'text-[#007AFF]'}`} />
          </div>

          {/* Twin avatar */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-display font-black ${theme === 'dark' ? 'bg-brand/10 border-brand/30 text-brand' : 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]'}`}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={`font-display font-black text-lg ${textClass}`}>{profile.name}</p>
              <p className={`font-mono text-[10px] ${subtextClass}`}>
                {lang === 'en' ? 'Financial Twin Level' : 'Money Twin ระดับ'} {fbisLevel}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Flame className={`w-3 h-3 ${fbisStreak > 0 ? 'text-amber-400' : 'text-zinc-600'}`} />
                <span className="font-mono text-[9px] text-amber-400 font-bold">
                  {fbisStreak}d {lang === 'en' ? 'streak' : 'สตรีค'}
                  {fbisMult > 1.0 && ` · ${fbisMult}x`}
                </span>
              </div>
            </div>
          </div>

          {/* Archetype */}
          <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-[#F2F2F7] border-transparent'}`}>
            <p className={`font-mono text-[8px] uppercase tracking-widest ${subtextClass}`}>
              {lang === 'en' ? 'Archetype' : 'แบบแผนพฤติกรรม'}
            </p>
            <p className={`font-display font-bold text-sm mt-1 ${textClass}`}>
              {displayArchetype}
            </p>
            <p className={`text-[11px] leading-relaxed mt-2 ${subtextClass}`}>
              {lang === 'en' ? interpretation.summary : 'พฤติกรรมนี้แสดงความสนใจในการสะสมทุนชั้นคลาสอย่างมีวินัย ปิดกั้นสิ่งรบกวน และวางแผนระยะยาวอย่างชาญฉลาด'}
            </p>
          </div>

          {/* Confidence */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`font-mono text-[8px] uppercase tracking-widest ${subtextClass}`}>
                {lang === 'en' ? 'Confidence' : 'ความมั่นใจ'}
              </span>
              <span className={`font-mono text-xs font-bold ${theme === 'dark' ? 'text-brand' : 'text-[#007AFF]'}`}>
                {interpretation.confidenceScore}%
              </span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'}`}>
              <div
                className={`h-full rounded-full ${theme === 'dark' ? 'bg-brand' : 'bg-[#007AFF]'}`}
                style={{ width: `${interpretation.confidenceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className={`col-span-1 lg:col-span-8 border rounded-[32px] p-6 flex flex-col gap-4 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-display font-medium text-sm uppercase tracking-widest ${textClass}`}>
                {lang === 'en' ? 'Twin Radar' : 'เรดาร์ Twin'}
              </h3>
              <p className={`font-mono text-[9px] ${subtextClass}`}>
                {lang === 'en'
                  ? 'Current (solid) vs. Ideal (dashed) — fill the gap'
                  : 'สถานะปัจจุบัน (เส้นทึบ) เทียบเป้าหมาย (เส้นประ) — เติมเต็มช่องว่าง'}
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 rounded-full bg-brand" />
                <span className={`font-mono text-[8px] ${subtextClass}`}>
                  {lang === 'en' ? 'Current' : 'ปัจจุบัน'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 border-t border-dashed border-brand/60" />
                <span className={`font-mono text-[8px] ${subtextClass}`}>
                  {lang === 'en' ? 'Ideal' : 'เป้าหมาย'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center py-2">
            <RadarSVG axes={radarAxes} size={Math.min(300, 280)} />
          </div>

          {/* Axis breakdown bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {radarAxes.map(axis => (
              <div key={axis.key} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className={`font-mono text-[9px] ${subtextClass}`}>
                    {lang === 'en' ? axis.labelEn : axis.labelTh}
                  </span>
                  <span className="font-mono text-[10px] font-bold" style={{ color: axis.color }}>
                    {axis.current}
                    <span className={`text-[8px] ${subtextClass}`}>/{axis.ideal}</span>
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                    <div
                      className="h-full rounded-full opacity-40"
                      style={{ width: `${axis.ideal}%`, backgroundColor: axis.color }}
                    />
                  </div>
                  <div
                    className="h-1.5 rounded-full flex-shrink-0"
                    style={{ width: `${Math.max(4, (axis.current / 100) * 60)}px`, backgroundColor: axis.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Twin Prediction Card (ELITE only) ── */}
      {showPredictions ? (
        <div className={`border rounded-[32px] p-6 ${cardClass}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-display font-bold text-sm ${textClass}`}>
                {lang === 'en' ? 'Twin Prediction Engine' : 'เครื่องคาดการณ์ Twin'}
              </h3>
              <p className={`font-mono text-[9px] ${subtextClass}`}>
                {lang === 'en' ? 'AI-driven next financial decision forecast' : 'การคาดการณ์การตัดสินใจทางการเงินถัดไปด้วย AI'}
              </p>
            </div>
          </div>
          <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-[#F9F5FF] border-purple-100'}`}>
            <div className="flex items-start gap-3">
              <Target className={`w-4 h-4 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {prediction}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Lower Grid: Recommendations + Timeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Personalized Recommendations */}
        <div className={`col-span-1 lg:col-span-8 border rounded-[32px] p-6 ${cardClass}`}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className={`w-4 h-4 ${theme === 'dark' ? 'text-brand' : 'text-[#007AFF]'}`} />
            <h3 className={`font-display font-bold text-sm ${textClass}`}>
              {lang === 'en' ? 'Alignment Recommendations' : 'คำแนะนำปรับแนว Twin'}
            </h3>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className={`text-sm ${subtextClass}`}>
                  {lang === 'en'
                    ? 'Your twin is well-aligned! Keep doing what you\'re doing.'
                    : 'Twin ของคุณสอดคล้องดีแล้ว! รักษาสิ่งที่ทำอยู่'}
                </p>
              </div>
            ) : (
              recommendations.map((rec, i) => (
                <div
                  key={rec.axis}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                    theme === 'dark' ? 'bg-zinc-900/40 hover:bg-zinc-900/70' : 'bg-[#F2F2F7] hover:bg-[#ECEAE8]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${
                    theme === 'dark' ? 'bg-brand/10 text-brand' : 'bg-[#007AFF]/10 text-[#007AFF]'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-700'}`}>
                      {rec.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`flex-1 h-1 rounded-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${Math.min(100, Math.max(0, (rec.gap / 50) * 100))}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-amber-400 font-bold">
                        -{rec.gap}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 ${subtextClass}`} />
                </div>
              ))
            )}
          </div>

          {recommendations.length > 0 && tier === 'basic' && (
            <button
              onClick={onNavigateToUpgrade}
              className={`w-full mt-4 py-3 rounded-2xl font-mono text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-brand text-black hover:bg-brand-muted'
                  : 'bg-[#007AFF] text-white hover:bg-[#0066CC]'
              }`}
            >
              {lang === 'en' ? 'Unlock All Recommendations — PRO' : 'ปลดล็อกคำแนะนำทั้งหมด — PRO'}
            </button>
          )}
        </div>

        {/* Weekly Twin State Evolution */}
        <div className={`col-span-1 lg:col-span-4 border rounded-[32px] p-6 flex flex-col gap-4 ${cardClass}`}>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-brand' : 'text-[#007AFF]'}`} />
            <h3 className={`font-display font-bold text-sm ${textClass}`}>
              {lang === 'en' ? 'Twin Evolution' : 'วิวัฒนาการ Twin'}
            </h3>
          </div>

          {showTimeline ? (
            <>
              <div className="space-y-3">
                {weeklyTimeline.map((w, i) => {
                  const isHighest = w.score === Math.max(...weeklyTimeline.map(x => x.score));
                  return (
                    <div key={w.week} className="flex items-center gap-3">
                      <span className={`font-mono text-[9px] font-bold w-7 ${subtextClass}`}>
                        {w.week}
                      </span>
                      <div className="flex-1">
                        <div className={`h-6 rounded-lg flex items-center justify-end pr-2 transition-all ${
                          isHighest
                            ? 'bg-brand/20 text-brand'
                            : theme === 'dark' ? 'bg-zinc-800' : 'bg-slate-100'
                        }`}
                        style={{ width: `${Math.max(20, w.score)}%` }}
                        >
                          <span className={`font-mono text-[10px] font-bold ${
                            isHighest ? 'text-brand' : theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                          }`}>
                            {w.score}
                          </span>
                        </div>
                      </div>
                      <span className={`font-mono text-[8px] w-8 text-right ${subtextClass}`}>
                        {w.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <p className={`text-[10px] leading-relaxed ${subtextClass}`}>
                  {lang === 'en'
                    ? 'Twin state scores based on behavioral quality (non-impulse ratio) per week.'
                    : 'คะแนน Twin คำนวณจากคุณภาพพฤติกรรม (อัตราส่วนไม่ใช่ impulse) รายสัปดาห์'}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-zinc-900 text-zinc-600' : 'bg-slate-100 text-zinc-400'
              }`}>
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className={`text-xs font-bold ${textClass}`}>
                  {lang === 'en' ? 'ELITE Feature' : 'ฟีเจอร์ ELITE'}
                </p>
                <p className={`text-[10px] mt-1 ${subtextClass}`}>
                  {lang === 'en'
                    ? 'Weekly twin evolution requires ELITE plan.'
                    : 'วิวัฒนาการ Twin รายสัปดาห์ต้องใช้แพลน ELITE'}
                </p>
              </div>
              <button
                onClick={onNavigateToUpgrade}
                className={`px-4 py-2 rounded-xl font-mono text-[9px] uppercase tracking-widest font-bold cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-brand/10 text-brand border border-brand/30 hover:bg-brand/20'
                    : 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/30 hover:bg-[#007AFF]/20'
                }`}
              >
                {lang === 'en' ? 'Unlock ELITE' : 'ปลดล็อก ELITE'}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
