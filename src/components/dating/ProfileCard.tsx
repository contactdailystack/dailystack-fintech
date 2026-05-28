/**
 * DailyStack — Profile Card Component
 * Swipeable profile card for dating discovery
 */

import React from 'react';
import { MapPin, Star } from 'lucide-react';

interface ProfileCardProps {
  name: string;
  age: number;
  location: string;
  photos: string[];
  compatibility: number;
  interests: string[];
  onSwipe?: (direction: 'left' | 'right' | 'super') => void;
}

// ─── Interest Tag ─────────────────────────────────────────────────────────────
const InterestTag: React.FC<{ label: string; emoji?: string }> = ({ label, emoji }) => (
  <span className="px-3 py-1.5 bg-[rgba(255,107,129,0.15)] backdrop-blur-sm rounded-full
    text-xs font-medium text-[#FF6B81] border border-[rgba(255,107,129,0.25)] flex items-center gap-1.5">
    {emoji && <span>{emoji}</span>}
    {label}
  </span>
);

// ─── Compatibility Badge ──────────────────────────────────────────────────────
const CompatibilityBadge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score >= 90) return 'text-[#22C55E]';
    if (score >= 80) return 'text-[#FFD700]';
    return 'text-[#FF6B81]';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(13,17,23,0.80)] backdrop-blur-sm rounded-full ${getColor()}`}>
      <Star size={14} fill="currentColor" />
      <span className="text-sm font-bold">{score}%</span>
      <span className="text-xs opacity-70">Match</span>
    </div>
  );
};

// ─── Main Profile Card ────────────────────────────────────────────────────────
const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  age,
  location,
  photos,
  compatibility,
  interests,
}) => {
  return (
    <div className="ds-card rounded-3xl overflow-hidden h-full flex flex-col">
      {/* Photo Container */}
      <div className="relative flex-1 min-h-0">
        <img
          src={photos[0]}
          alt={name}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/30 to-transparent" />
        
        {/* Compatibility badge */}
        <div className="absolute top-4 left-4">
          <CompatibilityBadge score={compatibility} />
        </div>

        {/* Location badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 
          bg-[rgba(13,17,23,0.80)] backdrop-blur-sm rounded-full">
          <MapPin size={12} className="text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-secondary)]">{location}</span>
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Name & Age */}
          <h2 className="text-2xl font-bold text-white mb-1">
            {name}, {age}
          </h2>
          
          {/* Interest tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {interests.slice(0, 4).map((interest) => (
              <InterestTag key={interest} label={interest} />
            ))}
            {interests.length > 4 && (
              <span className="px-3 py-1.5 bg-[rgba(255,255,255,0.10)] backdrop-blur-sm rounded-full
                text-xs font-medium text-white/70">
                +{interests.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;