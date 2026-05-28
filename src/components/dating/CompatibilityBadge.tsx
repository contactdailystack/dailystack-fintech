/**
 * DailyStack — Compatibility Badge Component
 * Displays AI-generated compatibility score with breakdown
 */

import React from 'react';
import { Star, Heart, Brain, MessageCircle } from 'lucide-react';

interface CompatibilityBadgeProps {
  score: number;
  lifestyleScore?: number;
  personalityScore?: number;
  emotionalScore?: number;
  showBreakdown?: boolean;
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 90) return '#22C55E';
    if (score >= 80) return '#FFD700';
    return '#FF6B81';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke={getColor()}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-white/50 uppercase tracking-wider">Match</span>
      </div>
    </div>
  );
};

// ─── Score Bar ───────────────────────────────────────────────────────────────
const ScoreBar: React.FC<{
  icon: React.ElementType;
  label: string;
  score: number;
  color: string;
}> = ({ icon: Icon, label, score, color }) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--text-secondary)]">{label}</span>
        <span className="text-xs font-bold text-white">{score}%</span>
      </div>
      <div className="h-1.5 bg-[rgba(255,255,255,0.10)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color.replace('/10/', '/60/')}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  </div>
);

// ─── Main Compatibility Badge ────────────────────────────────────────────────
const CompatibilityBadge: React.FC<CompatibilityBadgeProps> = ({
  score,
  lifestyleScore,
  personalityScore,
  emotionalScore,
  showBreakdown = false,
}) => {
  const getScoreColor = () => {
    if (score >= 90) return 'text-[#22C55E]';
    if (score >= 80) return 'text-[#FFD700]';
    return 'text-[#FF6B81]';
  };

  if (showBreakdown && lifestyleScore && personalityScore && emotionalScore) {
    return (
      <div className="bg-[rgba(13,17,23,0.90)] backdrop-blur-xl rounded-2xl p-4 border border-[rgba(255,255,255,0.10)]">
        {/* Header with ring */}
        <div className="flex items-center gap-4 mb-4">
          <ScoreRing score={score} />
          <div>
            <p className={`text-sm font-bold ${getScoreColor()}`}>AI Compatibility Score</p>
            <p className="text-xs text-[var(--text-muted)]">Based on 50+ compatibility factors</p>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="space-y-3">
          <ScoreBar
            icon={Heart}
            label="Lifestyle"
            score={lifestyleScore}
            color="bg-[#FF6B81]/10 text-[#FF6B81]"
          />
          <ScoreBar
            icon={Brain}
            label="Personality"
            score={personalityScore}
            color="bg-[#8A4CFF]/10 text-[#8A4CFF]"
          />
          <ScoreBar
            icon={MessageCircle}
            label="Emotional"
            score={emotionalScore}
            color="bg-[#5CC3FF]/10 text-[#5CC3FF]"
          />
        </div>
      </div>
    );
  }

  // Simple badge version
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(13,17,23,0.80)] backdrop-blur-sm rounded-full ${getScoreColor()}`}>
      <Star size={14} fill="currentColor" />
      <span className="text-sm font-bold">{score}%</span>
      <span className="text-xs opacity-70">Match</span>
    </div>
  );
};

export default CompatibilityBadge;