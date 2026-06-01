/**
 * DailyStack — Dating Page (v3)
 * Redesigned to match GiGi Energy Reference:
 * - White background with gradient
 * - Bold hero-style typography
 * - Animated floating circles
 * - 3D cards with shadows
 * - Purple (#9B7ED9) accent theme
 * 
 * Features:
 * - Suggested tab with curated matches
 * - Likes You tab
 * - Discover tab
 * - Chats tab
 * - Profile/Me tab
 * - Multi-language (EN/TH)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Compass, MessageCircle, Sparkles, Crown,
  Settings, LogOut, Clock, Zap, Users, Star,
  Shield, Globe, ChevronRight, CheckCircle2,
  GraduationCap, Briefcase, MapPin, Coffee,
  Verified, Trophy, MessageSquare
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { Shell } from '../components/DesignSystem';
import { DatingService, DatingProfileService } from '../../services/datingService';

// ─── Design System ───────────────────────────────────────────────────────────
const colors = {
  primary: 'var(--lime)',      // Electric Lime/Green!
  primaryLight: 'var(--lime-light)',
  primaryDark: 'var(--lime-dim)',
  background: 'var(--surface-bg)',
  surface: 'var(--surface-card)',
  card: 'var(--surface-card)',
  text: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  border: 'var(--border-subtle)',
  success: 'var(--success)',
  gold: 'var(--warning)',
  coral: 'var(--error)',
  lime: 'var(--lime)',
};

// ─── Font Helper ─────────────────────────────────────────────────────────────
const fontFor = (lang: 'en' | 'th') => lang === 'th' ? 'font-kanit' : 'font-sans';

// ─── Animated Floating Circle ───────────────────────────────────────────────
const FloatingCircle: React.FC<{
  size?: number;
  color?: string;
  blur?: number;
  duration?: number;
  delay?: number;
  className?: string;
}> = ({ size = 96, color = colors.primary, blur = 48, duration = 8, delay = 0, className = '' }) => (
  <div
    className={`absolute rounded-full pointer-events-none ${className}`}
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color}30, transparent 70%)`,
      filter: `blur(${blur}px)`,
    }}
    data-animate="float"
    data-delay={delay}
    data-duration={duration}
  />
);

// ─── Brand Logo ───────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string; dark?: boolean }> = ({ 
  className = '', dark = false 
}) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative">
      <div className="absolute inset-0 bg-[#9B7ED9] blur-xl opacity-20 rounded-full" />
      <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
        <defs>
          <linearGradient id="d8-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B7ED9" />
            <stop offset="100%" stopColor="#7B5EC9" />
          </linearGradient>
        </defs>
        <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#d8-grad)" opacity="0.55" />
        <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#d8-grad)" opacity="0.78" />
        <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#d8-grad)" />
        <path d="M50 29 L72 39 L50 47 L28 39 Z" fill={dark ? "#FFFFFF" : "#0D1117"} opacity="0.25" />
      </svg>
    </div>
    <span className="text-sm font-black tracking-[0.15em] uppercase">
      <span className={dark ? 'text-white' : 'text-[#121212]'}>DAILY</span>
      <span className="text-[#9B7ED9]">STACK</span>
    </span>
  </div>
);

// ─── Badge Label ───────────────────────────────────────────────────────────────
const BadgeLabel: React.FC<{ children: React.ReactNode; pulse?: boolean; icon?: React.ReactNode }> = ({ 
  children, pulse = false, icon 
}) => (
  <div className="inline-flex items-center gap-2 bg-[#121212] text-white px-4 py-2 rounded-full text-xs font-mono tracking-wider">
    {pulse && <span className="w-2 h-2 bg-[#9B7ED9] rounded-full animate-pulse" />}
    {icon && <span className="text-[#9B7ED9]">{icon}</span>}
    {children}
  </div>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}> = ({ children, onClick, disabled = false, loading = false, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-[#9B7ED9] text-white shadow-[0_4px_16px_rgba(155,126,217,0.3)] hover:shadow-[0_8px_32px_rgba(155,126,217,0.4)]',
    secondary: 'bg-white text-[#121212] border-2 border-[#E5E7EB] hover:border-[#9B7ED9]',
    ghost: 'bg-transparent text-[#57606A] hover:text-[#9B7ED9]',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative px-6 py-3.5 rounded-full font-bold text-sm tracking-wide overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:-translate-y-[1px] active:translate-y-0
        transition-all duration-300
        ${variants[variant]} ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
      ) : (
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      )}
    </button>
  );
};

// ─── Profile Card ─────────────────────────────────────────────────────────────
interface ProfileCardProps {
  name: string;
  age: number;
  location: string;
  photos: string[];
  compatibility: number;
  occupation?: string;
  education?: string;
  mbti?: string;
  bio: string;
  isUltraMatch?: boolean;
  onClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name, age, location, photos, compatibility,
  occupation, education, mbti, bio, isUltraMatch, onClick
}) => (
  <div
    onClick={onClick}
    className="relative rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
  >
    {/* Photo */}
    <div className="relative aspect-[4/5]">
      {photos[0] ? (
        <img
          src={photos[0]}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[var(--surface-3)] flex items-center justify-center">
          <span className="text-4xl">👤</span>
        </div>
      )}
      
      {/* Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(18,18,18,0.8) 0%, transparent 40%, transparent 100%)',
        }}
      />
      
      {/* Ultra Match Badge */}
      {isUltraMatch && (
        <div 
          className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: colors.gold }}
        >
          <Zap size={12} color="#FFF" />
          <span className="text-[10px] font-black tracking-wider text-white">ULTRA</span>
        </div>
      )}
      
      {/* Compatibility Badge */}
      <div className="absolute top-3 right-3">
        <div 
          className="px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
        >
          <Star size={12} fill={colors.gold} color={colors.gold} />
          <span className="text-sm font-black text-[#121212]">{compatibility}%</span>
        </div>
      </div>
      
      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* Name + Age */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-black text-white">
            {name}, {age}
          </h3>
          {mbti && (
            <span 
              className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ backgroundColor: 'rgba(155,126,217,0.3)', color: '#B8A5E8' }}
            >
              {mbti}
            </span>
          )}
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={12} color="#FFFFFF" opacity={0.7} />
          <span className="text-xs text-white opacity-70">{location}</span>
        </div>
        
        {/* Bio */}
        {bio && (
          <p className="text-sm text-white opacity-80 line-clamp-1">{bio}</p>
        )}
      </div>
    </div>
    
    {/* Hover glow effect */}
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}20, transparent, ${colors.primary}20)`,
        filter: 'blur(20px)',
      }}
    />
  </div>
);

// ─── Match Card (Compact) ─────────────────────────────────────────────────────
interface MatchCardProps {
  name: string;
  photo: string;
  compatibility: number;
  lastMessage?: string;
  unreadCount: number;
  isUltraMatch?: boolean;
  onClick?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  name, photo, compatibility, lastMessage, unreadCount, isUltraMatch, onClick
}) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all hover:bg-[#F5F5F5] active:scale-[0.98] group"
  >
    {/* Avatar */}
    <div className="relative">
      <div 
        className="w-14 h-14 rounded-full overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        style={{ border: `2px solid ${colors.primary}` }}
      >
        <img src={photo} alt={name} className="w-full h-full object-cover" />
      </div>
      {isUltraMatch && (
        <div 
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
          style={{ backgroundColor: colors.gold }}
        >
          <Zap size={10} color="#FFF" />
        </div>
      )}
    </div>
    
    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-sm font-bold text-[#121212]">{name}</span>
        <span className="text-xs font-black" style={{ color: colors.primary }}>{compatibility}%</span>
      </div>
      <p className={`text-xs truncate ${unreadCount > 0 ? 'font-medium text-[#121212]' : 'text-[#8B949E]'}`}>
        {lastMessage || 'Start a conversation →'}
      </p>
    </div>
    
    {/* Unread badge */}
    {unreadCount > 0 && (
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        <span className="text-[10px] font-bold text-white">{unreadCount}</span>
      </div>
    )}
    
    {/* Arrow */}
    <ChevronRight size={18} className="text-[#8B949E] group-hover:text-[#9B7ED9] transition-colors" />
  </div>
);

// ─── Stats Card ───────────────────────────────────────────────────────────────
interface StatsCardProps {
  value: string;
  label: string;
  icon: React.ElementType;
  accent?: string;
}
const StatsCard: React.FC<StatsCardProps> = ({ value, label, icon: Icon, accent = colors.primary }) => (
  <div 
    className="relative bg-white rounded-2xl p-5 border border-[#E5E7EB] overflow-hidden group hover:border-[#9B7ED9]/30 transition-all"
    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
  >
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: `linear-gradient(135deg, ${accent}10, transparent, ${accent}10)`,
        filter: 'blur(8px)',
      }}
    />
    
    <div className="relative z-10">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${accent}15` }}
      >
        <Icon size={20} color={accent} />
      </div>
      <div className="text-3xl font-black text-[var(--text-primary)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
    </div>
  </div>
);

// ─── Bottom Tab ────────────────────────────────────────────────────────────────
const BottomTab: React.FC<{
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors relative ${active ? 'text-[var(--lime)]' : 'text-[var(--text-muted)]'}`}
  >
    {active && (
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full" style={{ backgroundColor: colors.primary }} />
    )}
    <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
    <span className="text-[10px] font-semibold tracking-wide">{label}</span>
  </button>
);

// ─── Translations ──────────────────────────────────────────────────────────────
const translations = {
  en: {
    findYourMatch: 'Find Your Match',
    aiPowered: 'AI-powered compatibility matching',
    todaysCurated: "Today's Curated",
    curatedDesc: '3-5 AI-selected matches daily',
    yourMatches: 'Your Matches',
    whoLikedYou: 'Who Liked You',
    verifyPhotos: 'Verify your photos',
    verifyDesc: 'Increase trust and matches',
    readyToDiscover: 'Ready to discover?',
    findYourMatchDesc: 'Find someone special today',
    startDiscovery: 'Start Discovery',
    suggested: 'For You',
    likes: 'Likes',
    discover: 'Discover',
    chats: 'Chats',
    profile: 'Profile',
    totalMatches: 'Total Matches',
    avgCompatibility: 'Avg. Match',
    activeChats: 'Chats',
    profileViews: 'Views',
    signOut: 'Sign Out',
    premium: 'Premium',
    goPremium: 'Upgrade',
  },
  th: {
    findYourMatch: 'ค้นหาคู่ของคุณ',
    aiPowered: 'ระบบจับคู่ด้วย AI อัจฉริยะ',
    todaysCurated: 'การแมตช์วันนี้',
    curatedDesc: '3-5 คนที่ AI คัดเลือก',
    yourMatches: 'การแมตช์ของคุณ',
    whoLikedYou: 'ใครถูกใจคุณ',
    verifyPhotos: 'ยืนยันรูปถ่าย',
    verifyDesc: 'เพิ่มความน่าเชื่อถือและการแมตช์',
    readyToDiscover: 'พร้อมค้นหาหรือยัง?',
    findYourMatchDesc: 'ค้นหาคนพิเศษวันนี้',
    startDiscovery: 'เริ่มค้นหา',
    suggested: 'แนะนำ',
    likes: 'ถูกใจ',
    discover: 'ค้นหา',
    chats: 'แชท',
    profile: 'โปรไฟล์',
    totalMatches: 'แมตช์ทั้งหมด',
    avgCompatibility: 'ความเข้ากัน',
    activeChats: 'แชท',
    profileViews: 'ผู้เข้าชม',
    signOut: 'ออกจากระบบ',
    premium: 'พรีเมียม',
    goPremium: 'อัพเกรด',
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Dating: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'suggested' | 'likes' | 'discover' | 'chats' | 'profile'>('suggested');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);

  // Real data from API
  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [myProfile, setMyProfile] = useState<any>(null);

  const t = translations[language];
  const toggleLanguage = () => setLanguage(language === 'en' ? 'th' : 'en');

  // ── Load user session ──────────────────────────────────────────────────────
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
      } else {
        setUserEmail(session.user.email ?? '');
        setIsPremium(session.user.email?.toLowerCase().includes('premium') ?? false);
      }
    };
    checkUser();
  }, [navigate]);

  // ── Load real matches from API ─────────────────────────────────────────────
  useEffect(() => {
    const loadMatches = async () => {
      setLoadingMatches(true);
      try {
        const realMatches = await DatingService.match.getMatches();
        setMatches(realMatches);
      } catch (error) {
        console.error('Failed to load matches:', error);
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };
    loadMatches();
  }, []);

  // ── Load user profile ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await DatingProfileService.getMyProfile();
        setMyProfile(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // ── Real Data from API ────────────────────────────────────────────────────
  // Map API matches to UI format
  const curatedMatches = matches.slice(0, 5).map(m => ({
    id: m.partnerId,
    name: m.partnerName,
    age: 0, // Not available in match data
    location: '',
    photos: m.partnerAvatar ? [m.partnerAvatar] : [],
    compatibility: Math.round(m.compatibilityScore),
    occupation: '',
    education: '',
    mbti: '',
    bio: '',
    isUltraMatch: m.isUltraMatch,
  }));

  const recentMatches = matches.slice(0, 5).map(m => ({
    id: m.id,
    name: m.partnerName,
    photo: m.partnerAvatar,
    compatibility: Math.round(m.compatibilityScore),
    lastMessage: m.lastMessage || '',
    unreadCount: m.unreadCount,
    isUltraMatch: m.isUltraMatch,
  }));

  // Stats from real data
  const avgCompatibility = matches.length > 0 
    ? Math.round(matches.reduce((sum, m) => sum + m.compatibilityScore, 0) / matches.length)
    : 0;
  const stats = [
    { value: String(matches.length), label: t.totalMatches, icon: Heart },
    { value: `${avgCompatibility}%`, label: t.avgCompatibility, icon: Star },
    { value: String(matches.filter(m => m.unreadCount > 0).length), label: t.activeChats, icon: MessageCircle },
    { value: '--', label: t.profileViews, icon: Users }, // Not available in current API
  ];

  const bottomTabs = [
    { key: 'suggested' as const, icon: Heart, label: t.suggested },
    { key: 'likes' as const, icon: Star, label: t.likes },
    { key: 'discover' as const, icon: Compass, label: t.discover },
    { key: 'chats' as const, icon: MessageCircle, label: t.chats },
    { key: 'profile' as const, icon: Users, label: t.profile },
  ];

  return (
    <Shell lang={language} showNav={true} showLangToggle={false} showOrbs={true} title={t.findYourMatch}>
      <div className="px-4 py-6 max-w-4xl mx-auto select-none">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[var(--surface-3)] text-[var(--text-muted)] px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider">
              ✨ {language === 'th' ? 'โหมดเดท' : 'DATING MODE'}
            </span>
          </div>
          {isPremium && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--warning)]/10 text-[10px] font-bold" style={{ color: colors.gold }}>
              <Crown size={12} color={colors.gold} />
              <span>{t.premium}</span>
            </div>
          )}
        </div>

        {/* 5 sub-tabs Horizontal Pill Navigation */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-2xl font-space text-[10px] font-bold tracking-tight shadow-md mb-6">
          {bottomTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2.5 text-center rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                activeTab === tab.key 
                  ? 'bg-[var(--neon-surface)] text-[var(--neon)] border border-[var(--neon-glow-xs)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]'
              }`}
            >
              <tab.icon size={16} strokeWidth={activeTab === tab.key ? 2.5 : 1.8} />
              <span className="text-[9px] font-bold tracking-tight leading-none mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6 pb-[calc(80px+env(safe-area-inset-bottom))]">
        
        {/* ── Suggested Tab ── */}
        {activeTab === 'suggested' && (
          <div className="space-y-8">
            {/* Verify Banner */}
            <div 
              className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}5)`,
                border: `1px solid ${colors.primary}30`
              }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.primary }}
              >
                <Verified size={24} color="#FFF" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{t.verifyPhotos}</h3>
                <p className="text-xs text-[var(--text-secondary)]">{t.verifyDesc}</p>
              </div>
              <ChevronRight size={20} color={colors.textMuted} />
            </div>

            {/* Today's Curated Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="inline-block font-mono text-[var(--lime)] text-[10px] tracking-[0.3em] uppercase mb-1">
                    Curated
                  </span>
                  <h2 className={`text-2xl font-black tracking-tight text-[var(--text-primary)] ${fontFor(language)}`}>
                    {t.todaysCurated}
                  </h2>
                  <div className="h-[3px] w-12 bg-[var(--lime)] rounded-full mt-2" />
                </div>
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: colors.primary + '15', color: colors.primary }}
                >
                  {curatedMatches.length}/5
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loadingMatches ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-[var(--surface-3)] rounded-2xl h-64 animate-pulse" />
                  ))
                ) : curatedMatches.length > 0 ? (
                  curatedMatches.map(match => (
                    <ProfileCard
                      key={match.id}
                      {...match}
                      onClick={() => navigate('/dating/discover')}
                    />
                  ))
                ) : (
                  // Empty state
                  <div className="col-span-full text-center py-12">
                    <p className="text-[var(--text-secondary)]">
                      {language === 'th' ? 'ยังไม่มีการแมตช์ที่คัดสรร' : 'No curated matches yet'}
                    </p>
                    <button
                      onClick={() => navigate('/dating/discover')}
                      className="mt-4 px-6 py-2 rounded-full bg-[var(--neon)] text-black text-sm font-bold"
                    >
                      {t.startDiscovery}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Stats */}
            <section>
              <h2 className={`text-xl font-black tracking-tight text-[var(--text-primary)] mb-4 ${fontFor(language)}`}>
                {language === 'th' ? 'สถิติของคุณ' : 'Your Stats'}
              </h2>
              {loadingMatches ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[var(--surface-3)] rounded-2xl h-20 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map(stat => (
                    <StatsCard key={stat.label} {...stat} />
                  ))}
                </div>
              )}
            </section>

            {/* Recent Matches */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">{t.yourMatches}</h2>
                <button 
                  className="text-xs font-medium text-[var(--lime)] flex items-center gap-1 hover:underline"
                  onClick={() => navigate('/dating/matches')}
                >
                  {language === 'th' ? 'ดูทั้งหมด' : 'See all'}
                  <ChevronRight size={14} />
                </button>
              </div>
              
              <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {loadingMatches ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border-b border-[var(--border-subtle)]">
                      <div className="w-12 h-12 rounded-full bg-[var(--surface-3)] animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-[var(--surface-3)] rounded w-24 animate-pulse mb-2" />
                        <div className="h-3 bg-[var(--surface-3)] rounded w-32 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : recentMatches.length > 0 ? (
                  recentMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      {...match}
                      onClick={() => navigate(`/dating/chat/${match.id}`)}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-[var(--text-secondary)]">
                      {language === 'th' ? 'ยังไม่มีการแมตช์' : 'No matches yet'}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ── Likes Tab ── */}
        {activeTab === 'likes' && (
          <div className="space-y-6">
            <div>
              <span className="inline-block font-mono text-[var(--lime)] text-[10px] tracking-[0.3em] uppercase mb-1">
                {language === 'th' ? 'ความสนใจ' : 'Attention'}
              </span>
              <h2 className={`text-3xl font-black tracking-tight text-[var(--text-primary)] ${fontFor(language)}`}>
                {t.whoLikedYou}
              </h2>
              <div className="h-[3px] w-12 bg-[var(--lime)] rounded-full mt-2" />
            </div>
            
            {loadingMatches ? (
              <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border-b border-[var(--border-subtle)]">
                    <div className="w-12 h-12 rounded-full bg-[var(--surface-3)] animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-[var(--surface-3)] rounded w-24 animate-pulse mb-2" />
                      <div className="h-3 bg-[var(--surface-3)] rounded w-32 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMatches.length > 0 ? (
              <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {recentMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    {...match}
                    onClick={() => navigate(`/dating/chat/${match.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)]">
                <div className="w-20 h-20 rounded-full bg-[var(--surface-input)] flex items-center justify-center mx-auto mb-4">
                  <Heart size={32} className="text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {language === 'th' ? 'ยังไม่มีใครถูกใจคุณ' : 'No likes yet'}
                </p>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  {language === 'th' ? 'ค้นหาเพิ่มเพื่อรับไลค์!' : 'Keep exploring to get likes!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Discover Tab ── */}
        {activeTab === 'discover' && (
          <div className="space-y-8 py-8">
            {/* Hero CTA */}
            <div 
              className="rounded-3xl p-8 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primaryLight}05)`,
                border: `1px solid ${colors.primary}20`
              }}
            >
              {/* Background glow */}
              <div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full"
                style={{ background: `radial-gradient(circle, ${colors.primary}20, transparent 70%)`, filter: 'blur(40px)' }}
              />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-[var(--lime-glow-sm)] flex items-center justify-center mx-auto mb-4 border border-[var(--lime)]/10">
                  <Compass size={32} className="text-[var(--lime)]" />
                </div>
                <h2 className={`text-3xl font-black tracking-tight text-[var(--text-primary)] ${fontFor(language)}`}>
                  {t.readyToDiscover}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{t.findYourMatchDesc}</p>
                <PrimaryButton 
                  onClick={() => navigate('/dating/discover')}
                  className="mt-6"
                >
                  <Zap size={16} />
                  {t.startDiscovery}
                </PrimaryButton>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '3', label: language === 'th' ? 'แมตช์ใหม่' : 'New Matches', icon: Heart, color: colors.coral },
                { value: '12', label: language === 'th' ? 'ดูโปรไฟล์' : 'Views', icon: Users, color: colors.primary },
                { value: '5', label: language === 'th' ? 'ไลค์ใหม่' : 'New Likes', icon: Star, color: colors.gold },
              ].map(stat => (
                <div key={stat.label} className="bg-[var(--surface-card)] rounded-2xl p-4 text-center border border-[var(--border-subtle)]">
                  <stat.icon size={20} color={stat.color} className="mx-auto mb-2" />
                  <div className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Chats Tab ── */}
        {activeTab === 'chats' && (
          <div className="space-y-6">
            <div>
              <span className="inline-block font-mono text-[var(--lime)] text-[10px] tracking-[0.3em] uppercase mb-1">
                {language === 'th' ? 'ข้อความ' : 'Messages'}
              </span>
              <h2 className={`text-3xl font-black tracking-tight text-[var(--text-primary)] ${fontFor(language)}`}>
                {t.chats}
              </h2>
              <div className="h-[3px] w-12 bg-[var(--lime)] rounded-full mt-2" />
            </div>
            
            {recentMatches.length > 0 ? (
              <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {recentMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    {...match}
                    onClick={() => navigate(`/dating/chat/${match.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)]">
                <div className="w-20 h-20 rounded-full bg-[var(--surface-input)] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {language === 'th' ? 'ยังไม่มีการสนทนา' : 'No conversations yet'}
                </p>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  {language === 'th' ? 'เริ่มแมตช์เพื่อสนทนา!' : 'Start matching to chat!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-[var(--surface-card)] rounded-3xl p-6 border border-[var(--border-subtle)] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div 
                    className="w-20 h-20 rounded-full overflow-hidden"
                    style={{ border: `3px solid ${colors.primary}` }}
                  >
                    {myProfile?.photos?.[0] ? (
                      <img 
                        src={myProfile.photos[0]}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--surface-3)] flex items-center justify-center">
                        <User size={32} className="text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>
                  <div 
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.success }}
                  >
                    <CheckCircle2 size={14} color="#FFF" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">
                    {myProfile?.name || userEmail?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">{userEmail}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--lime-glow-sm)] text-[var(--lime)]">
                      {t.premium}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--surface-input)] text-[var(--text-secondary)]">
                      INTJ
                    </span>
                  </div>
                </div>
                <button onClick={() => navigate('/settings')}>
                  <Settings size={22} color={colors.textMuted} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(stat => (
                <StatsCard key={stat.label} {...stat} />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              {[
                { icon: Sparkles, label: language === 'th' ? 'ซุปเปอร์ไลค์' : 'Super Like', color: colors.gold },
                { icon: Heart, label: t.whoLikedYou, color: colors.coral },
                { icon: Shield, label: language === 'th' ? 'ความปลอดภัย' : 'Safety', color: colors.success },
              ].map((action, i) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[var(--surface-input)] transition-colors"
                  style={{ borderBottom: i < 2 ? `1px solid ${colors.border}` : 'none' }}
                  onClick={() => setActiveTab('likes')}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: action.color + '15' }}
                  >
                    <action.icon size={18} color={action.color} />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-[var(--text-primary)]">
                    {action.label}
                  </span>
                  <ChevronRight size={18} color={colors.textMuted} />
                </button>
              ))}
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-2xl text-sm font-medium bg-[var(--surface-input)] text-red-400 hover:bg-red-500/10 transition-colors"
            >
              {t.signOut}
            </button>
          </div>
        )}
      </main>

      </div>
    </Shell>
  );
};

export default Dating;