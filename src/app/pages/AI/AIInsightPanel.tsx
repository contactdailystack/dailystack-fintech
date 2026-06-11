import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  User,
  Heart,
  Brain,
  Sparkles,
  ChevronLeft,
  TrendingUp,
  Flame,
  Zap,
} from 'lucide-react';
import {
  FBISState,
  getAICOachRecommendation,
  getLevelFromScore,
  getScoreToNextLevel,
  calculateStreakMultiplier,
} from '../../core/fbis';
import { getUserTier } from '../../services/userTierService';

type Persona = 'strict' | 'supportive' | 'analytical';

interface CoachConfig {
  id: Persona;
  name: string;
  icon: React.ReactNode;
  tagline: string;
  color: string;
}

const COACHES: CoachConfig[] = [
  {
    id: 'strict',
    name: 'Coach Max',
    icon: <User size={20} />,
    tagline: 'ตรงไปตรงมา คุณต้องรับผิดชอบ',
    color: '#FF6B6B',
  },
  {
    id: 'supportive',
    name: 'Coach Mai',
    icon: <Heart size={20} />,
    tagline: 'เข้าใจคุณ มาลองด้วยกันนะ',
    color: '#C7FF2E',
  },
  {
    id: 'analytical',
    name: 'Coach Jin',
    icon: <Brain size={20} />,
    tagline: 'ข้อมูลบอกว่า...',
    color: '#4ECDC4',
  },
];

const AIInsightPanel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPersona, setSelectedPersona] = useState<Persona>('supportive');
  const [fbisState, setFbisState] = useState<FBISState>({
    currentScore: 1000,
    streakDays: 0,
    lastRecordedAt: null,
    xpMultiplier: 1.0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const tierInfo = await getUserTier();
      const multiplier = calculateStreakMultiplier(fbisState.streakDays);
      setFbisState((prev) => ({ ...prev, xpMultiplier: multiplier }));
      setLoading(false);
    };
    loadData();
  }, []);

  const currentCoach = COACHES.find((c) => c.id === selectedPersona) || COACHES[1];
  const recommendation = getAICOachRecommendation(selectedPersona, fbisState);
  const level = getLevelFromScore(fbisState.currentScore);
  const scoreToNext = getScoreToNextLevel(fbisState.currentScore);
  const currentProgress = fbisState.currentScore % 1000;
  const progressPercent = (currentProgress / 1000) * 100;

  const insights = [
    {
      icon: <Flame size={16} />,
      text: `ในสัปดาห์นี้ ${fbisState.streakDays} วันติดต่อ — อีก ${Math.max(0, 7 - fbisState.streakDays)} วันจะได้ +20 XP bonus!`,
      show: fbisState.streakDays > 0 && fbisState.streakDays < 7,
    },
    {
      icon: <TrendingUp size={16} />,
      text: 'วันนี้ค่าใช้จ่าย impulse สูงกว่าปกติ — ลองรอ 24 ชม.ก่อนตัดสินใจ?',
      show: fbisState.streakDays < 3,
    },
    {
      icon: <Zap size={16} />,
      text: 'เป้าหมายออมเงินใกล้ถึงแล้ว — เหลืออีก 500 บาท!',
      show: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white font-sans">
      <header className="sticky top-0 z-20 bg-[#0B0F0A]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-[#C7FF2E]" />
          <h1 className="text-lg font-bold">AI Coach</h1>
        </div>
        <button
          onClick={() => navigate('/coach-settings')}
          className="ml-auto px-3 py-1.5 bg-white/10 text-sm font-semibold rounded-full hover:bg-white/20 transition-colors"
        >
          เปลี่ยน Coach
        </button>
      </header>

      <main className="px-4 pb-12 max-w-lg mx-auto">
        <div
          className="mt-6 rounded-2xl p-6 border-2 relative overflow-hidden"
          style={{ borderColor: currentCoach.color }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `linear-gradient(135deg, ${currentCoach.color} 0%, transparent 60%)`,
            }}
          />
          <div className="relative flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${currentCoach.color}20` }}
            >
              <div style={{ color: currentCoach.color }}>{currentCoach.icon}</div>
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ color: currentCoach.color }}>
                {currentCoach.name}
              </h2>
              <p className="text-white/60 text-sm font-kanit">{currentCoach.tagline}</p>
            </div>
          </div>

          <div
            className="rounded-xl p-4 mt-4"
            style={{ backgroundColor: `${currentCoach.color}10` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: currentCoach.color }} />
              <span className="text-xs font-semibold" style={{ color: currentCoach.color }}>
                AI Recommendation
              </span>
            </div>
            <p className="text-white/90 font-kanit leading-relaxed">{recommendation}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#171C15] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp size={16} className="text-[#C7FF2E]" />
              FBIS Score
            </h3>
            <span className="text-xs text-white/40">Level {level}</span>
          </div>

          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-black font-mono text-[#C7FF2E]">
              {fbisState.currentScore}
            </span>
            <span className="text-white/40 text-sm mb-1">XP</span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs text-white/40 mb-1">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: '#C7FF2E',
                }}
              />
            </div>
            <p className="text-xs text-white/40 mt-1 text-right">
              {scoreToNext} XP to next level
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              <span className="font-bold">{fbisState.streakDays}</span>
              <span className="text-white/40 text-sm">day streak</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-[#C7FF2E]" />
              <span className="font-bold">{fbisState.xpMultiplier}x</span>
              <span className="text-white/40 text-sm">multiplier</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="font-bold text-white/60 text-sm uppercase tracking-wider">
            Proactive Insights
          </h3>
          {insights
            .filter((i) => i.show)
            .map((insight, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#171C15] border border-white/10 p-4 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#C7FF2E]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#C7FF2E]">{insight.icon}</span>
                </div>
                <p className="text-white/80 text-sm font-kanit leading-relaxed">
                  {insight.text}
                </p>
              </div>
            ))}
        </div>

        <div className="mt-6 rounded-2xl bg-[#171C15] border border-white/10 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Bot size={16} className="text-[#C7FF2E]" />
            เปลี่ยน Coach
          </h3>
          <div className="space-y-3">
            {COACHES.map((coach) => (
              <button
                key={coach.id}
                onClick={() => setSelectedPersona(coach.id)}
                className={`w-full rounded-xl p-4 flex items-center gap-3 transition-all ${
                  selectedPersona === coach.id
                    ? 'border-2'
                    : 'border border-white/10 hover:border-white/20'
                }`}
                style={{
                  borderColor: selectedPersona === coach.id ? coach.color : undefined,
                  backgroundColor:
                    selectedPersona === coach.id ? `${coach.color}10` : 'transparent',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${coach.color}20` }}
                >
                  <span style={{ color: coach.color }}>{coach.icon}</span>
                </div>
                <div className="text-left">
                  <p className="font-bold" style={{ color: selectedPersona === coach.id ? coach.color : 'white' }}>
                    {coach.name}
                  </p>
                  <p className="text-white/40 text-sm font-kanit">{coach.tagline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIInsightPanel;