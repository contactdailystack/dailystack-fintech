/**
 * DailyStack — Interest Tag Component
 * Displays user interests/lifestyle tags
 */

import React from 'react';

// ─── Interest Tag ─────────────────────────────────────────────────────────────
interface InterestTagProps {
  label: string;
  emoji?: string;
  variant?: 'default' | 'compact' | 'pill';
  color?: 'coral' | 'gold' | 'blue' | 'purple' | 'green';
  onClick?: () => void;
}

// Emoji mapping for common interests
const interestEmojis: Record<string, string> = {
  'Coffee': '☕',
  'Reading': '📚',
  'Travel': '✈️',
  'Fitness': '💪',
  'Music': '🎵',
  'Art': '🎨',
  'Photography': '📷',
  'Cooking': '🍳',
  'Gaming': '🎮',
  'Movies': '🎬',
  'Yoga': '🧘',
  'Hiking': '🏔️',
  'Pets': '🐕',
  'Wine': '🍷',
  'Wellness': '🌿',
  'Productivity': '⚡',
  'Design': '🎯',
};

const InterestTag: React.FC<InterestTagProps> = ({
  label,
  emoji,
  variant = 'default',
  color = 'coral',
  onClick,
}) => {
  const colorClasses = {
    coral: 'bg-[#FF6B81]/10 text-[#FF6B81] border-[rgba(255,107,129,0.25)]',
    gold: 'bg-[#FFD700]/10 text-[#FFD700] border-[rgba(255,215,0,0.25)]',
    blue: 'bg-[#5CC3FF]/10 text-[#5CC3FF] border-[rgba(92,195,255,0.25)]',
    purple: 'bg-[#8A4CFF]/10 text-[#8A4CFF] border-[rgba(138,76,255,0.25)]',
    green: 'bg-[#22C55E]/10 text-[#22C55E] border-[rgba(34,197,94,0.25)]',
  };

  const emojiToUse = emoji ?? interestEmojis[label] ?? null;

  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg ${colorClasses[color]} 
        text-[10px] font-medium border`}>
        {emojiToUse && <span className="mr-1">{emojiToUse}</span>}
        {label}
      </span>
    );
  }

  if (variant === 'pill') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${colorClasses[color]}
        text-xs font-medium border ${onClick ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.10)]' : ''}`}>
        {emojiToUse && <span>{emojiToUse}</span>}
        {label}
      </span>
    );
  }

  // Default
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${colorClasses[color]}
        text-xs font-medium border ${onClick ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.10)] transition-colors' : ''}`}
    >
      {emojiToUse && <span>{emojiToUse}</span>}
      {label}
    </span>
  );
};

// ─── Interest Tag Group ───────────────────────────────────────────────────────
interface InterestTagGroupProps {
  interests: string[];
  maxVisible?: number;
  variant?: 'default' | 'compact' | 'pill';
  color?: 'coral' | 'gold' | 'blue' | 'purple' | 'green';
}

export const InterestTagGroup: React.FC<InterestTagGroupProps> = ({
  interests,
  maxVisible = 4,
  variant = 'default',
  color = 'coral',
}) => {
  const visibleInterests = interests.slice(0, maxVisible);
  const hiddenCount = interests.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleInterests.map((interest) => (
        <InterestTag
          key={interest}
          label={interest}
          variant={variant}
          color={color}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full
          bg-[rgba(255,255,255,0.10)] text-xs font-medium text-white/60">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
};

export default InterestTag;