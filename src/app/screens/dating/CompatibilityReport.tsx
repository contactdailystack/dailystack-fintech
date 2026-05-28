/**
 * DailyStack — Compatibility Report
 * AI-powered deep compatibility analysis between two users
 *
 * Design: Coral (#FF6B81) + Gold (#FFD700) theme
 * AI Compatibility Engine: Lifestyle 30%, Personality 25%, Emotional 20%, Communication 15%
 * Multi-language: EN / TH
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Crown, Zap, Heart, Star, Sparkles,
  TrendingUp, Smile, MessageCircle, Target, CheckCircle2,
  AlertTriangle, ArrowRight, Download, Share2, Home
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CompatibilityScore {
  dimension: string;
  score: number;
  weight: number;
  icon: React.ElementType;
  color: string;
  description: string;
  descriptionTh: string;
  strengths: string[];
  challenges: string[];
}

interface SharedInterest {
  name: string;
  emoji: string;
  matchLevel: 'high' | 'medium' | 'low';
}

interface AIRecommendation {
  title: string;
  titleTh: string;
  text: string;
  textTh: string;
  type: 'tip' | 'warning' | 'opportunity';
}

interface ReportUser {
  id: string;
  name: string;
  age: number;
  photo: string;
  gender?: string;
}

interface CompatibilityData {
  overall: number;
  isUltraMatch: boolean;
  dimensions: CompatibilityScore[];
  sharedInterests: SharedInterest[];
  topStrengths: string[];
  topChallenges: string[];
  aiRecommendations: AIRecommendation[];
  conversationTips: string[];
  relationshipPotential: 'excellent' | 'good' | 'moderate' | 'low';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockReportData: CompatibilityData = {
  overall: 94,
  isUltraMatch: true,
  dimensions: [
    {
      dimension: 'Lifestyle',
      score: 92,
      weight: 30,
      icon: TrendingUp,
      color: '#FF6B81',
      description: 'How well your daily habits and life goals align',
      descriptionTh: 'ความเข้ากันของการใช้ชีวิตประจำวันและเป้าหมายในชีวิต',
      strengths: [
        'Both prefer morning routines',
        'Similar work-life balance values',
        'Shared fitness and wellness priorities',
      ],
      challenges: [
        'Different coffee shop preferences',
        'Slight difference in social energy levels',
      ],
    },
    {
      dimension: 'Personality',
      score: 96,
      weight: 25,
      icon: Smile,
      color: '#FFD700',
      description: 'Core personality traits and character alignment',
      descriptionTh: 'บุคลิกภาพและลักษณะนิสัยหลักที่เข้ากัน',
      strengths: [
        'Both are growth-oriented and curious',
        'Complementary introversion/extroversion balance',
        'Shared sense of humor',
      ],
      challenges: [
        'Both can be perfectionists at times',
      ],
    },
    {
      dimension: 'Emotional',
      score: 88,
      weight: 20,
      icon: Heart,
      color: '#FF3B30',
      description: 'Emotional intelligence and relationship values',
      descriptionTh: 'ความฉลาดทางอารมณ์และค่านิยมความสัมพันธ์',
      strengths: [
        'Similar emotional expressiveness',
        'Both value honesty and vulnerability',
        'Aligned long-term relationship goals',
      ],
      challenges: [
        'Different comfort levels with deep conversations initially',
      ],
    },
    {
      dimension: 'Communication',
      score: 91,
      weight: 15,
      icon: MessageCircle,
      color: '#22C55E',
      description: 'How you communicate and resolve differences',
      descriptionTh: 'รูปแบบการสื่อสารและการแก้ไขความขัดแย้ง',
      strengths: [
        'Both prefer direct communication',
        'Comfortable with text-based communication',
        'Similar conflict resolution approaches',
      ],
      challenges: [
        'Tendency to overthink responses',
      ],
    },
  ],
  sharedInterests: [
    { name: 'Productivity', emoji: '📈', matchLevel: 'high' },
    { name: 'Coffee', emoji: '☕', matchLevel: 'high' },
    { name: 'Reading', emoji: '📚', matchLevel: 'medium' },
    { name: 'Travel', emoji: '✈️', matchLevel: 'high' },
    { name: 'Wellness', emoji: '🧘', matchLevel: 'medium' },
    { name: 'Design', emoji: '🎨', matchLevel: 'low' },
  ],
  topStrengths: [
    'Exceptional lifestyle alignment — you\'ll thrive together daily',
    'Deep intellectual connection from day one',
    'Mutual respect for personal growth and independence',
    'Strong foundation for long-term relationship potential',
  ],
  topChallenges: [
    'May need to consciously schedule social activities',
    'Both need to practice patience in early dating phase',
    'Different comfort zones around emotional vulnerability',
  ],
  aiRecommendations: [
    {
      title: 'Start with shared interests',
      titleTh: 'เริ่มต้นด้วยความสนใจที่เหมือนกัน',
      text: 'Your coffee shop adventures and travel stories are perfect conversation starters. Lean into these shared passions.',
      textTh: 'การไปร้านกาแฟและเรื่องเล่าการเดินทางของคุณเป็นจุดเริ่มต้นบทสนทนาที่สมบูรณ์แบบ',
      type: 'tip',
    },
    {
      title: 'Embrace personality differences',
      titleTh: 'ยอมรับความแตกต่างทางบุคลิกภาพ',
      text: 'Your complementary energy levels can be a superpower — let your strengths balance each other out.',
      textTh: 'ระดับพลังงานที่แตกต่างกันของคุณสามารถเป็นจุดแข็งได้ — ให้จุดแข็งของกันและกันชดเชยกัน',
      type: 'opportunity',
    },
    {
      title: 'Build emotional trust gradually',
      titleTh: 'สร้างความไว้วางใจทางอารมณ์อย่างค่อยเป็นค่อยไป',
      text: 'Take time to be vulnerable with each other. The best relationships are built on deep emotional trust.',
      textTh: 'ใช้เวลาเปิดใจกับกันและกัน ความสัมพันธ์ที่ดีที่สุดถูกสร้างขึ้นจากความไว้วางใจทางอารมณ์ที่ลึกซึ้ง',
      type: 'tip',
    },
  ],
  conversationTips: [
    'Ask about their ideal weekend — you\'ll likely find more overlap',
    'Share a personal growth story; they\'ll appreciate the vulnerability',
    'Discuss future goals early to confirm long-term alignment',
    'Don\'t rush — your compatibility is strong, patience will pay off',
  ],
  relationshipPotential: 'excellent',
};

const mockUser: ReportUser = {
  id: 'user-other',
  name: 'Mika',
  age: 28,
  photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fontFor = (lang: 'en' | 'th') => lang === 'th' ? 'font-kanit' : 'font-sans';

const getScoreColor = (score: number): string => {
  if (score >= 90) return '#22C55E';
  if (score >= 80) return '#FFD700';
  if (score >= 70) return '#FF6B81';
  return '#EF4444';
};

const getScoreLabel = (score: number, lang: 'en' | 'th'): string => {
  if (score >= 90) return lang === 'th' ? 'ยอดเยี่ยม' : 'Excellent';
  if (score >= 80) return lang === 'th' ? 'ดีมาก' : 'Very Good';
  if (score >= 70) return lang === 'th' ? 'ดี' : 'Good';
  if (score >= 60) return lang === 'th' ? 'พอใช้' : 'Fair';
  return lang === 'th' ? 'ต้องปรับปรุง' : 'Needs Work';
};

const getPotentialColor = (potential: string): string => {
  switch (potential) {
    case 'excellent': return '#22C55E';
    case 'good': return '#FFD700';
    case 'moderate': return '#FF6B81';
    default: return '#EF4444';
  }
};

const recommendationTypeStyles: Record<AIRecommendation['type'], { bg: string; border: string; icon: React.ElementType; iconColor: string }> = {
  tip: { bg: 'bg-[#FF6B81]/5', border: 'border-[#FF6B81]/15', icon: Sparkles, iconColor: '#FF6B81' },
  warning: { bg: 'bg-[#FFD700]/5', border: 'border-[#FFD700]/15', icon: AlertTriangle, iconColor: '#FFD700' },
  opportunity: { bg: 'bg-[#22C55E]/5', border: 'border-[#22C55E]/15', icon: Star, iconColor: '#22C55E' },
};

// ─── Dimension Score Bar ───────────────────────────────────────────────────────
interface DimensionBarProps {
  dimension: CompatibilityScore;
  lang: 'en' | 'th';
}
const DimensionBar: React.FC<DimensionBarProps> = ({ dimension, lang }) => {
  const Icon = dimension.icon;
  const scoreColor = getScoreColor(dimension.score);

  return (
    <div className="p-5 rounded-2xl bg-[#21262D]/50 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${dimension.color}15` }}
          >
            <Icon size={20} style={{ color: dimension.color }} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{dimension.dimension}</h4>
            <p className="text-[11px] text-[var(--text-muted)]">
              {lang === 'th' ? dimension.descriptionTh : dimension.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black" style={{ color: scoreColor }}>
            {dimension.score}%
          </span>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
            {getScoreLabel(dimension.score, lang)}
          </p>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-[#0D1117] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${dimension.score}%`,
            background: `linear-gradient(to right, ${dimension.color}, ${scoreColor})`,
            boxShadow: `0 0 8px ${dimension.color}50`,
          }}
        />
      </div>

      {/* Weight */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dimension.strengths.slice(0, 2).map((s, i) => (
            <span key={i} className="flex items-center gap-1 text-[11px] text-[#22C55E]">
              <CheckCircle2 size={10} /> {s}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-[var(--text-muted)]">
          Weight: {dimension.weight}%
        </span>
      </div>
    </div>
  );
};

// ─── Shared Interest Item ─────────────────────────────────────────────────────
interface InterestItemProps {
  interest: SharedInterest;
  lang: 'en' | 'th';
}
const InterestItem: React.FC<InterestItemProps> = ({ interest, lang }) => {
  const levelColors = {
    high: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
    medium: 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20',
    low: 'bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)] border-[rgba(255,255,255,0.08)]',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${levelColors[interest.matchLevel]}`}>
      <span className="text-xl">{interest.emoji}</span>
      <div className="flex-1">
        <span className="text-sm font-medium">{interest.name}</span>
      </div>
      {interest.matchLevel === 'high' && <CheckCircle2 size={14} className="text-[#22C55E]" />}
      {interest.matchLevel === 'medium' && <Star size={14} className="text-[#FFD700]" />}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CompatibilityReport: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { lang } = useLanguage();

  const [data, setData] = useState<CompatibilityData>(mockReportData);
  const [user] = useState<ReportUser>(mockUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'tips'>('overview');

  useEffect(() => {
    // TODO: Fetch real compatibility data from backend
    // const fetchReport = async () => {
    //   const { data } = await supabase.rpc('get_compatibility_report', { target_user_id: userId });
    //   setData(data);
    // };
    // fetchReport();
  }, [userId]);

  const potentialColor = getPotentialColor(data.relationshipPotential);
  const potentialLabels: Record<string, { en: string; th: string }> = {
    excellent: { en: 'Excellent', th: 'ยอดเยี่ยม' },
    good: { en: 'Good', th: 'ดีมาก' },
    moderate: { en: 'Moderate', th: 'พอใช้' },
    low: { en: 'Low', th: 'ต่ำ' },
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0D1117] font-sans flex flex-col feature-dating">

      {/* ── Top Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 shrink-0 flex items-center gap-3 px-4 py-3
        bg-[rgba(13,17,23,0.95)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]">
        
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-[#21262D] flex items-center justify-center hover:bg-[#30363D] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {lang === 'th' ? 'รายงานความเข้ากันได้' : 'Compatibility Report'}
          </h2>
        </div>

        <button className="w-9 h-9 rounded-full bg-[#21262D] flex items-center justify-center hover:bg-[#30363D] transition-colors">
          <Share2 size={16} />
        </button>
        <button className="w-9 h-9 rounded-full bg-[#21262D] flex items-center justify-center hover:bg-[#30363D] transition-colors">
          <Download size={16} />
        </button>
      </header>

      {/* ── Scrollable Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Hero Section */}
        <div className="relative px-5 py-8 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#FF6B81]/10 blur-[100px]" />
            {data.isUltraMatch && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#FFD700]/10 blur-[80px]" />
            )}
          </div>

          {/* User photos */}
          <div className="relative flex items-center justify-center gap-0 mb-8 z-10">
            {/* You */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#22C55E] shadow-lg shadow-[#22C55E]/30">
              <div className="w-full h-full bg-gradient-to-br from-[#22C55E]/30 to-[#0D1117] flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>

            {/* Heart connector */}
            <div className="relative -mx-2 z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B81] to-[#FF3B30]
                flex items-center justify-center shadow-lg shadow-[#FF6B81]/40 animate-pulse">
                <Heart size={20} className="text-white" fill="white" />
              </div>
            </div>

            {/* Match */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF6B81] shadow-lg shadow-[#FF6B81]/30">
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Ultra Match Badge */}
          {data.isUltraMatch && (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-4
              bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full shadow-lg shadow-[#FFD700]/30 z-10">
              <Zap size={14} className="text-[#0D1117]" />
              <span className="text-xs font-black uppercase tracking-widest text-[#0D1117]">
                {lang === 'th' ? 'อัลตร้า แมตช์' : 'Ultra Match'}
              </span>
              <Crown size={14} className="text-[#0D1117]" />
            </div>
          )}

          {/* Overall score */}
          <div className="mb-3 z-10">
            <div className="inline-flex items-baseline gap-1">
              <span
                className="text-7xl font-black leading-none"
                style={{ color: getScoreColor(data.overall) }}
              >
                {data.overall}
              </span>
              <span
                className="text-3xl font-bold"
                style={{ color: getScoreColor(data.overall), opacity: 0.6 }}
              >
                %
              </span>
            </div>
            <p className={`text-sm font-medium mt-2 ${fontFor(lang)}`} style={{ color: getScoreColor(data.overall) }}>
              {lang === 'th' ? 'คะแนนความเข้ากันโดยรวม' : 'Overall Compatibility Score'}
            </p>
          </div>

          {/* Overall label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 z-10"
            style={{ backgroundColor: `${potentialColor}15`, borderColor: `${potentialColor}30` }}
          >
            <span className="text-sm font-bold" style={{ color: potentialColor }}>
              {potentialLabels[data.relationshipPotential][lang]}
            </span>
            <span className="text-sm text-[var(--text-muted)]">
              {lang === 'th' ? 'ศักยภาพความสัมพันธ์' : 'Relationship Potential'}
            </span>
          </div>

          {/* Names */}
          <p className="text-base text-[var(--text-secondary)] z-10">
            {lang === 'th'
              ? `คุณและ ${user.name} มีความเข้ากันได้ ${data.overall}%`
              : `You and ${user.name} are ${data.overall}% compatible`}
          </p>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="sticky top-[57px] z-10 px-5 bg-[rgba(13,17,23,0.90)] backdrop-blur-xl py-3
          flex gap-2 border-b border-[rgba(255,255,255,0.05)]">
          {[
            { key: 'overview', label: lang === 'th' ? 'ภาพรวม' : 'Overview' },
            { key: 'dimensions', label: lang === 'th' ? 'มิติ' : 'Dimensions' },
            { key: 'tips', label: lang === 'th' ? 'เคล็ดลับ' : 'Tips' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-[#FF6B81]/15 text-[#FF6B81] border border-[#FF6B81]/20'
                  : 'bg-[#21262D] text-[var(--text-secondary)] border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────────────────────────── */}
        <div className="px-5 py-6 space-y-6">

          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <>
              {/* Shared Interests */}
              <section>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FFD700]" />
                  {lang === 'th' ? 'ความสนใจที่เหมือนกัน' : 'Shared Interests'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {data.sharedInterests.map(interest => (
                    <InterestItem key={interest.name} interest={interest} lang={lang} />
                  ))}
                </div>
              </section>

              {/* Top Strengths */}
              <section>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#22C55E]" />
                  {lang === 'th' ? 'จุดแข็งของคู่รัก' : 'Top Strengths'}
                </h3>
                <div className="space-y-2">
                  {data.topStrengths.map((strength, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-[#22C55E]/5 border border-[#22C55E]/15">
                      <CheckCircle2 size={16} className="text-[#22C55E] shrink-0 mt-0.5" />
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{strength}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Top Challenges */}
              <section>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-[#FFD700]" />
                  {lang === 'th' ? 'สิ่งที่ต้องระวัง' : 'Areas to Watch'}
                </h3>
                <div className="space-y-2">
                  {data.topChallenges.map((challenge, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/15">
                      <AlertTriangle size={16} className="text-[#FFD700] shrink-0 mt-0.5" />
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{challenge}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* AI Recommendations */}
              <section>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FF6B81]" />
                  {lang === 'th' ? 'คำแนะนำจาก AI' : 'AI Recommendations'}
                </h3>
                <div className="space-y-3">
                  {data.aiRecommendations.map((rec, i) => {
                    const style = recommendationTypeStyles[rec.type];
                    const Icon = style.icon;
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl border ${style.bg} ${style.border}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={14} style={{ color: style.iconColor }} />
                          <span className="text-xs font-bold" style={{ color: style.iconColor }}>
                            {lang === 'th' ? rec.titleTh : rec.title}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {lang === 'th' ? rec.textTh : rec.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* CTA: Send Message */}
              <button
                onClick={() => navigate(`/dating/chat/${userId}`)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B81] to-[#FF3B30]
                  font-bold text-base text-white shadow-lg shadow-[#FF6B81]/30
                  flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <MessageCircle size={20} />
                {lang === 'th' ? 'เริ่มสนทนากับเขา' : 'Start a Conversation'}
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {/* ── Dimensions Tab ── */}
          {activeTab === 'dimensions' && (
            <>
              {/* Compatibility formula */}
              <div className="p-4 rounded-2xl bg-[#21262D]/50 border border-[rgba(255,255,255,0.06)] text-center">
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  {lang === 'th' ? 'สูตรคำนวณคะแนน' : 'Score Formula'}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="text-[#FF6B81] font-bold">Lifestyle ×30%</span>
                  <span>+</span>
                  <span className="text-[#FFD700] font-bold">Personality ×25%</span>
                  <span>+</span>
                  <span className="text-[#FF3B30] font-bold">Emotional ×20%</span>
                  <span>+</span>
                  <span className="text-[#22C55E] font-bold">Communication ×15%</span>
                </div>
              </div>

              {/* Each dimension */}
              {data.dimensions.map((dim, i) => (
                <DimensionBar key={i} dimension={dim} lang={lang} />
              ))}

              {/* Strengths & Challenges breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths per dimension */}
                <div className="p-4 rounded-2xl bg-[#22C55E]/5 border border-[#22C55E]/15">
                  <h4 className="text-xs font-bold text-[#22C55E] uppercase tracking-widest mb-3">
                    {lang === 'th' ? 'จุดแข็งตามมิติ' : 'Dimension Strengths'}
                  </h4>
                  <div className="space-y-2">
                    {data.dimensions.flatMap(d => d.strengths.slice(0, 1)).map((s, i) => (
                      <p key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                        <CheckCircle2 size={10} className="text-[#22C55E] shrink-0 mt-0.5" />
                        {s}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Challenges per dimension */}
                <div className="p-4 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/15">
                  <h4 className="text-xs font-bold text-[#FFD700] uppercase tracking-widest mb-3">
                    {lang === 'th' ? 'สิ่งที่ต้องปรับตามมิติ' : 'Dimension Challenges'}
                  </h4>
                  <div className="space-y-2">
                    {data.dimensions.flatMap(d => d.challenges.slice(0, 1)).map((s, i) => (
                      <p key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                        <AlertTriangle size={10} className="text-[#FFD700] shrink-0 mt-0.5" />
                        {s}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Tips Tab ── */}
          {activeTab === 'tips' && (
            <>
              {/* Conversation Tips */}
              <section>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <MessageCircle size={14} className="text-[#FF6B81]" />
                  {lang === 'th' ? 'เคล็ดลับการสนทนา' : 'Conversation Tips'}
                </h3>
                <div className="space-y-3">
                  {data.conversationTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl
                      bg-[rgba(255,107,129,0.05)] border border-[rgba(255,107,129,0.12)]">
                      <div className="w-6 h-6 rounded-full bg-[#FF6B81]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[11px] font-bold text-[#FF6B81]">{i + 1}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Relationship Potential Meter */}
              <section className="p-5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Target size={14} style={{ color: potentialColor }} />
                  {lang === 'th' ? 'ระดับศักยภาพความสัมพันธ์' : 'Relationship Potential Meter'}
                </h3>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {[0, 1, 2, 3].map(level => {
                      const colors = ['#EF4444', '#FF6B81', '#FFD700', '#22C55E'];
                      const labels = ['Low', 'Moderate', 'Good', 'Excellent'];
                      const isActive = data.relationshipPotential === labels[level].toLowerCase() ||
                        (level === 3 && data.relationshipPotential === 'excellent') ||
                        (level === 2 && data.relationshipPotential === 'good') ||
                        (level === 1 && data.relationshipPotential === 'moderate') ||
                        (level === 0 && data.relationshipPotential === 'low');
                      return (
                        <div key={level} className="flex-1">
                          <div
                            className={`h-3 rounded-full transition-all ${isActive ? 'opacity-100' : 'opacity-25'}`}
                            style={{ backgroundColor: colors[level] }}
                          />
                          <p className="text-[9px] text-center text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                            {labels[level]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {lang === 'th'
                    ? `คุณและ ${user.name} มีศักยภาพในการสร้างความสัมพันธ์ที่ยั่งยืน คะแนน ${data.overall}% ถือว่าสูงมากและเป็นพื้นฐานที่ดีในการเติบโตไปด้วยกัน`
                    : `You and ${user.name} have excellent potential for a lasting relationship. A ${data.overall}% match is a strong foundation for growing together.`}
                </p>
              </section>

              {/* Next Steps */}
              <section>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <ArrowRight size={14} className="text-[#22C55E]" />
                  {lang === 'th' ? 'ขั้นตอนถัดไป' : 'Next Steps'}
                </h3>
                <div className="space-y-2">
                  {[
                    { label: lang === 'th' ? 'ส่งข้อความ' : 'Send a message', icon: MessageCircle, path: `/dating/chat/${userId}` },
                    { label: lang === 'th' ? 'กลับไปหน้าคู่รัก' : 'Back to matches', icon: Heart, path: '/dating' },
                    { label: lang === 'th' ? 'สำรวจต่อ' : 'Keep exploring', icon: Sparkles, path: '/dating/discover' },
                  ].map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => navigate(step.path)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#21262D]/50 border border-[rgba(255,255,255,0.06)]
                          hover:border-[rgba(255,255,255,0.12)] active:scale-[0.99] transition-all"
                      >
                        <Icon size={18} className="text-[#FF6B81]" />
                        <span className="text-sm font-medium text-[var(--text-primary)]">{step.label}</span>
                        <ArrowRight size={14} className="text-[var(--text-muted)] ml-auto" />
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* Bottom spacing */}
          <div className="h-10" />
        </div>
      </div>
    </div>
  );
};

export default CompatibilityReport;