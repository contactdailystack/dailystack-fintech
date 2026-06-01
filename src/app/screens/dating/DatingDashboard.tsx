/**
 * DailyStack — Dating Discovery Dashboard (CMB-Inspired Redesign)
 * Hybrid Discovery: Swipe + Smart List Mode
 * 
 * Features:
 * - Tinder-style drag-to-swipe gestures
 * - Smart List view option
 * - CMB-style minimal design
 * - Real-time swipe animations
 * 
 * Design: Soft Lavender (#9B7ED9) + White/Light Gray
 * Multi-language: EN / TH
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, X, Star, Compass, Sparkles, Clock, ChevronLeft,
  MessageCircle, MoreHorizontal, Lock, Zap, Crown, Home, Globe,
  LayoutGrid, List, Filter, MapPin, Briefcase, GraduationCap
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import CompatibilityBadge from '../../../components/dating/CompatibilityBadge';
import AIMatchInsight from '../../../components/dating/AIMatchInsight';
import InterestTag from '../../../components/dating/InterestTag';
import SwipeGesture from '../../../components/dating/SwipeGesture';
import { useLanguage } from '../../context/LanguageContext';
import { DatingService } from '../../../services/datingService';

// ─── Dark Theme Colors ──────────────────────────────────────────────────────────
const colors = {
  primary: 'var(--neon)',
  primaryLight: 'var(--neon-glow-sm)',
  primaryDark: 'var(--neon-dark)',
  background: 'var(--bg-base)',
  surface: 'var(--surface-3)',
  card: 'var(--bg-card)',
  text: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  border: 'var(--border-subtle)',
  success: '#22C55E',
  gold: '#D9FD82',
  coral: '#FF6B81',
  danger: '#EF4444',
};

// ─── Translation Strings ───────────────────────────────────────────────────────
const translations = {
  en: {
    thatsAll: "That's all for today!",
    noMoreMatches: "You've seen all available matches. Come back tomorrow for new curated matches.",
    backToDashboard: 'Back to Dashboard',
    curated: 'Curated',
    ultra: 'Ultra',
    explore: 'Explore',
    showAiInsights: 'Show AI Insights',
    hideAiInsights: 'Hide AI Insights',
    pass: 'Pass',
    superLike: 'Super Like',
    like: 'Like',
    resetsIn: 'Resets in',
    ultraMatch: 'Ultra Match',
    noMoreLikes: 'No more likes today',
    noMoreCurated: 'No more curated matches',
    loadingProfiles: 'Finding your matches...',
    compatibility: 'Compatibility',
    viewMode: 'View Mode',
    swipeMode: 'Swipe',
    listMode: 'List',
    filter: 'Filter',
    sortBy: 'Sort by',
    newest: 'Newest',
    compatibilityHighest: 'Highest Match',
    distance: 'Distance',
    online: 'Online',
    today: 'Today',
  },
  th: {
    thatsAll: 'หมดแล้วสำหรับวันนี้!',
    noMoreMatches: 'คุณได้ดูโปรไฟล์ทั้งหมดแล้ว กลับมาใหม่พรุ่งนี้สำหรับการแมตช์ใหม่',
    backToDashboard: 'กลับสู่หน้าหลัก',
    curated: 'คัดสรร',
    ultra: 'อัลตร้า',
    explore: 'สำรวจ',
    showAiInsights: 'ดูข้อมูล AI',
    hideAiInsights: 'ซ่อนข้อมูล AI',
    pass: 'ปัดผ่าน',
    superLike: 'ซุปเปอร์ไลค์',
    like: 'ไลค์',
    resetsIn: 'รีเซ็ตใน',
    ultraMatch: 'อัลตร้า แมตช์',
    noMoreLikes: 'ไม่มีไลค์เหลือวันนี้',
    noMoreCurated: 'ไม่มีการแมตช์ที่คัดสรรแล้ว',
    loadingProfiles: 'กำลังหาคู่ที่เหมาะกับคุณ...',
    compatibility: 'ความเข้ากันได้',
    viewMode: 'โหมดมุมมอง',
    swipeMode: 'ปัด',
    listMode: 'รายการ',
    filter: 'กรอง',
    sortBy: 'เรียงตาม',
    newest: 'ใหม่ล่าสุด',
    compatibilityHighest: 'เข้ากันได้สูงสุด',
    distance: 'ระยะทาง',
    online: 'ออนไลน์',
    today: 'วันนี้',
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  photos: string[];
  compatibility: number;
  lifestyleScore: number;
  personalityScore: number;
  emotionalScore: number;
  insights: string[];
  interests: string[];
  bio: string;
  relationshipGoal: string;
  occupation?: string;
  education?: string;
  mbti?: string;
  isUltraMatch?: boolean;
  online?: boolean;
  distance?: number;
}

type SwipeDirection = 'left' | 'right' | 'super' | null;

const fontFor = (lang: 'en' | 'th') => lang === 'th' ? 'font-sans' : 'font-sans';

// ─── Profile Mapper ──────────────────────────────────────────────────────────
// Maps API response to UI Profile type
const mapApiProfileToUiProfile = (apiProfile: any): Profile => ({
  id: apiProfile.id,
  name: apiProfile.name,
  age: apiProfile.age || 25,
  location: apiProfile.location || 'Bangkok',
  photos: apiProfile.photos?.length > 0 ? apiProfile.photos : [apiProfile.avatar_url || ''].filter(Boolean),
  compatibility: Math.round(apiProfile.compatibility || 0),
  lifestyleScore: Math.round(apiProfile.lifestyleScore || 0),
  personalityScore: Math.round(apiProfile.personalityScore || 0),
  emotionalScore: Math.round(apiProfile.emotionalScore || 0),
  insights: apiProfile.insights || [],
  interests: apiProfile.interests || [],
  bio: apiProfile.bio || '',
  relationshipGoal: apiProfile.relationshipGoal || '',
  occupation: apiProfile.occupation,
  education: apiProfile.education,
  mbti: apiProfile.mbti,
  isUltraMatch: apiProfile.isUltraMatch || false,
  online: apiProfile.online || false,
  distance: apiProfile.distance,
});

// ─── CMB-Style Match Limit Bar ────────────────────────────────────────────────
interface MatchLimitBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
}

const MatchLimitBar: React.FC<MatchLimitBarProps> = ({ label, current, max, color }) => (
  <div 
    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
    style={{ backgroundColor: colors.surface }}
  >
    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>{label}</span>
    <span className="text-[11px] font-bold" style={{ color: colors.text }}>{current}/{max}</span>
  </div>
);

// ─── CMB-Style Swipe Action Button ───────────────────────────────────────────
interface SwipeActionButtonProps {
  icon: 'pass' | 'super' | 'like';
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SwipeActionButton: React.FC<SwipeActionButtonProps> = ({
  icon, onClick, disabled, size = 'md'
}) => {
  const configs = {
    pass: {
      icon: X,
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#EF4444',
      size: size === 'lg' ? 60 : size === 'md' ? 50 : 40,
      shadow: '0 4px 16px rgba(239, 68, 68, 0.15)',
    },
    super: {
      icon: Star,
      bg: 'rgba(217, 253, 130, 0.15)',
      border: 'rgba(217, 253, 130, 0.3)',
      iconColor: '#D9FD82',
      size: size === 'lg' ? 50 : size === 'md' ? 44 : 36,
      shadow: '0 4px 16px rgba(217, 253, 130, 0.2)',
    },
    like: {
      icon: Heart,
      bg: 'rgba(192, 245, 0, 0.15)',
      border: 'rgba(192, 245, 0, 0.3)',
      iconColor: 'var(--neon)',
      size: size === 'lg' ? 64 : size === 'md' ? 56 : 48,
      shadow: '0 8px 24px var(--neon-glow)',
    },
  };
  
  const config = configs[icon];
  const Icon = config.icon;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        width: config.size,
        height: config.size,
        backgroundColor: config.bg,
        border: `1.5px solid ${config.border}`,
        boxShadow: config.shadow,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <Icon size={config.size * 0.45} color={config.iconColor} fill={icon === 'like' || icon === 'super' ? 'currentColor' : 'none'} />
    </button>
  );
};

// ─── CMB-Style Profile Card (Full) ──────────────────────────────────────────
interface ProfileCardFullProps {
  profile: Profile;
  showInsight: boolean;
  onToggleInsight: () => void;
  lang: 'en' | 'th';
}

const ProfileCardFull: React.FC<ProfileCardFullProps> = ({
  profile, showInsight, onToggleInsight, lang
}) => {
  const t = translations[lang];
  
  return (
    <div className="w-full h-full rounded-3xl overflow-hidden relative">
      {/* Photo */}
      <img
        src={profile.photos[0]}
        alt={profile.name}
        className="w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 30%, transparent 60%)',
        }}
      />

      {/* Online indicator */}
      {profile.online && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(22,22,22,0.90)' }}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-medium" style={{ color: colors.text }}>Online</span>
        </div>
      )}

      {/* Ultra Match Badge */}
      {profile.isUltraMatch && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.gold }}>
          <Zap size={12} color="#FFF" />
          <span className="text-[10px] font-bold text-white">ULTRA MATCH</span>
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* Compatibility badge */}
        <div className="mb-3">
          <CompatibilityBadge
            score={profile.compatibility}
            lifestyleScore={profile.lifestyleScore}
            personalityScore={profile.personalityScore}
            emotionalScore={profile.emotionalScore}
          />
        </div>

        {/* Name + Age */}
        <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          {profile.name}, {profile.age}
          {profile.mbti && (
            <span 
              className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF' }}
            >
              {profile.mbti}
            </span>
          )}
        </h2>

        {/* Location + Work */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} color="rgba(255,255,255,0.7)" />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{profile.location}</span>
          </div>
          {profile.occupation && (
            <div className="flex items-center gap-1.5">
              <Briefcase size={12} color="rgba(255,255,255,0.7)" />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{profile.occupation}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-white/80 mb-3 line-clamp-2">{profile.bio}</p>
        )}

        {/* Interest tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.interests.slice(0, 4).map((interest) => (
            <InterestTag key={interest} label={interest} />
          ))}
        </div>

        {/* AI Insights */}
        {showInsight && (
          <AIMatchInsight insights={profile.insights} />
        )}

        {/* Toggle insight */}
        <button
          onClick={onToggleInsight}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF' }}
        >
          <Sparkles size={12} />
          {showInsight ? t.hideAiInsights : t.showAiInsights}
        </button>
      </div>
    </div>
  );
};

// ─── CMB-Style List View Profile Card ────────────────────────────────────────
interface ProfileCardListProps {
  profile: Profile;
  onLike: () => void;
  onPass: () => void;
  onClick: () => void;
}

const ProfileCardList: React.FC<ProfileCardListProps> = ({
  profile, onLike, onPass, onClick
}) => (
  <div 
    className="flex items-stretch gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
    style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
    onClick={onClick}
  >
    {/* Photo */}
    <div className="relative w-24 h-32 rounded-xl overflow-hidden shrink-0">
      <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover" />
      {profile.online && (
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
      )}
      {profile.isUltraMatch && (
        <div className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.gold }}>
          <Zap size={8} color="#FFF" />
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0 py-1">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-bold" style={{ color: colors.text }}>
          {profile.name}, {profile.age}
        </h3>
        <span className="text-xs font-bold" style={{ color: colors.primary }}>{profile.compatibility}%</span>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={10} color={colors.textMuted} />
        <span className="text-xs" style={{ color: colors.textSecondary }}>{profile.location}</span>
      </div>

      {profile.occupation && (
        <div className="flex items-center gap-2 mb-2">
          <Briefcase size={10} color={colors.textMuted} />
          <span className="text-xs" style={{ color: colors.textSecondary }}>{profile.occupation}</span>
        </div>
      )}

      <p className="text-xs line-clamp-2" style={{ color: colors.textSecondary }}>
        {profile.bio}
      </p>

      <div className="flex flex-wrap gap-1 mt-2">
        {profile.interests.slice(0, 3).map(interest => (
          <span 
            key={interest}
            className="px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ backgroundColor: colors.primaryLight + '30', color: colors.primaryDark }}
          >
            {interest}
          </span>
        ))}
      </div>
    </div>

    {/* Actions */}
    <div className="flex flex-col items-center justify-center gap-2">
      <button
        onClick={(e) => { e.stopPropagation(); onPass(); }}
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.surface }}
      >
        <X size={18} color={colors.danger} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onLike(); }}
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        <Heart size={18} color="#FFF" fill="#FFF" />
      </button>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  lang: 'en' | 'th';
  onBack: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ lang, onBack }) => {
  const t = translations[lang];
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: colors.primary + '15' }}
      >
        <Sparkles size={40} color={colors.primary} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>{t.thatsAll}</h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: colors.textSecondary }}>{t.noMoreMatches}</p>
      <button
        onClick={onBack}
        className="px-6 py-3 rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: colors.primary }}
      >
        {t.backToDashboard}
      </button>
    </div>
  );
};

// ─── Loading State ─────────────────────────────────────────────────────────────
interface LoadingStateProps {
  lang: 'en' | 'th';
}

const LoadingState: React.FC<LoadingStateProps> = ({ lang }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <div 
      className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse"
      style={{ backgroundColor: colors.primary + '20' }}
    >
      <Heart size={32} color={colors.primary} />
    </div>
    <p className="text-sm" style={{ color: colors.textSecondary }}>
      {translations[lang].loadingProfiles}
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DatingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInsight, setShowInsight] = useState(false);
  const [swipeIndicator, setSwipeIndicator] = useState<'pass' | 'super' | 'like' | null>(null);

  // Real match limits from API
  const [matchLimits, setMatchLimits] = useState({
    curated: { remaining: 5, max: 5 },
    ultra: { remaining: 1, max: 1 },
    explore: { remaining: 10, max: 10 },
  });

  const currentProfile = profiles[currentIndex];

  // ── Load match limits from real API ────────────────────────────────────────
  useEffect(() => {
    const loadMatchLimits = async () => {
      try {
        const limits = await DatingService.limits.getLimits();
        if (limits) {
          setMatchLimits({
            curated: { remaining: limits.curated.remaining, max: limits.curated.max },
            ultra: { remaining: 1, max: 1 }, // Ultra is always 1/day
            explore: { remaining: limits.explore.remaining, max: limits.explore.max },
          });
        }
      } catch (error) {
        console.error('Failed to load match limits:', error);
      }
    };
    loadMatchLimits();
  }, []);

  // ── Load profiles from real API ────────────────────────────────────────────
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      
      try {
        // Fetch from real Supabase database via DatingService
        const [curated, explore] = await Promise.all([
          DatingService.discovery.getCuratedMatches(),
          DatingService.discovery.getExploreMatches(),
        ]);
        
        // Combine and map to UI Profile type
        const allProfiles = [...curated, ...explore].map(mapApiProfileToUiProfile);
        
        // Filter out profiles without photos
        const validProfiles = allProfiles.filter(p => p.photos.length > 0);
        
        setProfiles(validProfiles);
      } catch (error) {
        console.error('Failed to load profiles:', error);
        // Don't fall back to mock data - show empty state instead
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  // ── Handle swipe with real API ────────────────────────────────────────────
  const handleSwipe = useCallback(async (direction: SwipeDirection) => {
    if (!currentProfile || !direction) return;

    // Map direction to API action
    const actionMap = {
      'left': 'pass' as const,
      'right': 'like' as const,
      'super': 'superlike' as const,
    };
    const action = actionMap[direction];

    try {
      // Call real API to record swipe
      const result = await DatingService.swipe.swipe(currentProfile.id, action);
      
      // If it's a match, navigate to match screen
      if (result.isMatch && result.matchId) {
        // Show match celebration briefly before navigating
        setSwipeIndicator(direction === 'super' ? 'super' : direction === 'right' ? 'like' : null);
        setTimeout(() => {
          navigate(`/dating/match/${result.matchId}`);
        }, 1000);
        return;
      }
    } catch (error) {
      console.error('Swipe API error:', error);
      // Continue with local state update even if API fails
    }

    // Move to next profile
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(profiles.length);
    }

    setSwipeIndicator(direction === 'super' ? 'super' : direction === 'right' ? 'like' : 'pass');
    setShowInsight(false);
  }, [currentProfile, currentIndex, profiles.length, navigate]);

  // ── Quick actions ──────────────────────────────────────────────────────────
  const handlePass = () => handleSwipe('left');
  const handleLike = () => handleSwipe('right');
  const handleSuper = () => {
    if (matchLimits.ultra.remaining > 0) {
      // Decrement ultra limit locally (API will also update)
      setMatchLimits(prev => ({
        ...prev,
        ultra: { ...prev.ultra, remaining: prev.ultra.remaining - 1 },
      }));
      handleSwipe('super');
    }
  };

  // ── Check if actions disabled ─────────────────────────────────────────────
  const hasMatchesRemaining = matchLimits.curated.remaining > 0 || matchLimits.explore.remaining > 0;

  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col font-sans"
      style={{ backgroundColor: colors.background }}
    >
      {/* Language Toggle */}
      <button
        onClick={() => setLang(l => l === 'en' ? 'th' : 'en')}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full"
        style={{ 
          backgroundColor: colors.card, 
          border: `1px solid ${colors.border}`,
          color: colors.textSecondary,
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <Globe size={14} />
        <span>{lang === 'en' ? 'TH' : 'EN'}</span>
      </button>

      {/* ── Top Navigation Bar ─────────────────────────────────────── */}
      <header 
        className="shrink-0 flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        
        <button
          onClick={() => navigate('/dating')}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.surface }}
        >
          <ChevronLeft size={20} color={colors.text} />
        </button>

        {/* View Mode Toggle */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <button
            onClick={() => setViewMode('swipe')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: viewMode === 'swipe' ? colors.primary : 'transparent',
              color: viewMode === 'swipe' ? '#FFF' : colors.textSecondary,
            }}
          >
            <Compass size={14} />
            {t.swipeMode}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: viewMode === 'list' ? colors.primary : 'transparent',
              color: viewMode === 'list' ? '#FFF' : colors.textSecondary,
            }}
          >
            <List size={14} />
            {t.listMode}
          </button>
        </div>

        {/* Match Limits */}
        <div className="flex items-center gap-2">
          <MatchLimitBar
            label={t.curated}
            current={matchLimits.curated.remaining}
            max={matchLimits.curated.max}
            color={colors.primary}
          />
          <MatchLimitBar
            label={t.ultra}
            current={matchLimits.ultra.remaining}
            max={matchLimits.ultra.max}
            color={colors.gold}
          />
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        
        {/* ── Swipe Mode ── */}
        {viewMode === 'swipe' && (
          <div className="flex flex-col items-center justify-center p-4 min-h-full">
            
            {loading ? (
              <LoadingState lang={lang} />
            ) : !currentProfile ? (
              <EmptyState lang={lang} onBack={() => navigate('/dating')} />
            ) : (
              <>
                {/* Card Stack */}
                <div className="relative w-full max-w-sm aspect-[3/4] mb-4">
                  
                  {/* Background card (next profile) */}
                  {currentIndex < profiles.length - 1 && (
                    <div 
                      className="absolute inset-0 rounded-3xl overflow-hidden scale-[0.96] translate-y-4"
                      style={{ zIndex: 0 }}
                    >
                      <img
                        src={profiles[currentIndex + 1].photos[0]}
                        alt=""
                        className="w-full h-full object-cover opacity-40"
                      />
                    </div>
                  )}

                  {/* Current card with gesture */}
                  <div 
                    className="absolute inset-0 rounded-3xl overflow-hidden"
                    style={{ zIndex: 1 }}
                  >
                    <SwipeGesture
                      onSwipe={handleSwipe}
                      threshold={100}
                      superThreshold={-80}
                      enabled={hasMatchesRemaining}
                    >
                      <ProfileCardFull
                        profile={currentProfile}
                        showInsight={showInsight}
                        onToggleInsight={() => setShowInsight(!showInsight)}
                        lang={lang}
                      />
                    </SwipeGesture>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-6">
                  <SwipeActionButton
                    icon="pass"
                    onClick={handlePass}
                    size="lg"
                  />
                  <SwipeActionButton
                    icon="super"
                    onClick={handleSuper}
                    disabled={matchLimits.ultra.remaining <= 0}
                    size="md"
                  />
                  <SwipeActionButton
                    icon="like"
                    onClick={handleLike}
                    disabled={!hasMatchesRemaining}
                    size="lg"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── List Mode ── */}
        {viewMode === 'list' && (
          <div className="px-4 py-4 space-y-3">
            {loading ? (
              <LoadingState lang={lang} />
            ) : profiles.length === 0 ? (
              <EmptyState lang={lang} onBack={() => navigate('/dating')} />
            ) : (
              profiles.map((profile, index) => (
                <ProfileCardList
                  key={profile.id}
                  profile={profile}
                  onLike={() => {
                    if (index === currentIndex) {
                      handleLike();
                    } else {
                      console.log('Like:', profile.name);
                    }
                  }}
                  onPass={() => {
                    if (index === currentIndex) {
                      handlePass();
                    } else {
                      console.log('Pass:', profile.name);
                    }
                  }}
                  onClick={() => navigate(`/dating/compatibility/${profile.id}`)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Reset Timer ─────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 text-center" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: colors.textMuted }}>
          <Clock size={12} />
          <span>{t.resetsIn} 12h 30m</span>
        </div>
      </div>
    </div>
  );
};

export default DatingDashboard;