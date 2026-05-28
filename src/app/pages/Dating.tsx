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

// ─── Design System ───────────────────────────────────────────────────────────
const colors = {
  primary: '#9B7ED9',      // Soft Lavender/Purple
  primaryLight: '#B8A5E8',
  primaryDark: '#7B5EC9',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#121212',
  textSecondary: '#57606A',
  textMuted: '#8B949E',
  border: '#E5E7EB',
  success: '#22C55E',
  gold: '#F59E0B',
  coral: '#F472B6',
  lime: '#AAFF00',
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
      <img
        src={photos[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'}
        alt={name}
        className="w-full h-full object-cover"
      />
      
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
      <div className="text-3xl font-black text-[#121212]">{value}</div>
      <div className="text-xs text-[#8B949E] mt-1">{label}</div>
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
    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors relative ${active ? 'text-[#9B7ED9]' : 'text-[#8B949E]'}`}
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // ── Mock Data ──────────────────────────────────────────────────────────────
  const curatedMatches = [
    {
      id: '1',
      name: 'Mika',
      age: 28,
      location: 'Bangkok',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
      compatibility: 94,
      occupation: 'Product Designer',
      education: 'Chulalongkorn University',
      mbti: 'INTJ',
      bio: 'Loves deep conversations and quiet mornings ☕',
      isUltraMatch: true,
    },
    {
      id: '2',
      name: 'Pim',
      age: 26,
      location: 'Thong Lo',
      photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
      compatibility: 89,
      occupation: 'Software Engineer',
      education: 'Kasetsart University',
      bio: 'Coffee enthusiast and book lover 📚',
    },
    {
      id: '3',
      name: 'Natasha',
      age: 29,
      location: 'Sukhumvit',
      photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
      compatibility: 87,
      occupation: 'Marketing Manager',
      education: 'Mahidol University',
      bio: 'Adventure seeker who loves trying new things 🌍',
    },
  ];

  const recentMatches = [
    {
      id: 'm1',
      name: 'Mika',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      compatibility: 94,
      lastMessage: 'That sounds amazing!',
      unreadCount: 2,
      isUltraMatch: true,
    },
    {
      id: 'm2',
      name: 'Pim',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
      compatibility: 89,
      lastMessage: 'Nice to meet you!',
      unreadCount: 0,
    },
  ];

  const stats = [
    { value: '3', label: t.totalMatches, icon: Heart },
    { value: '91%', label: t.avgCompatibility, icon: Star },
    { value: '2', label: t.activeChats, icon: MessageCircle },
    { value: '48', label: t.profileViews, icon: Users },
  ];

  const bottomTabs = [
    { key: 'suggested' as const, icon: Heart, label: t.suggested },
    { key: 'likes' as const, icon: Star, label: t.likes },
    { key: 'discover' as const, icon: Compass, label: t.discover },
    { key: 'chats' as const, icon: MessageCircle, label: t.chats },
    { key: 'profile' as const, icon: Users, label: t.profile },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white text-[#121212] font-sans relative overflow-hidden">

      {/* ── Background Decoration ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#9B7ED9]/5 to-white" />
        <FloatingCircle size={200} blur={80} duration={10} delay={0} className="top-0 right-0" color={colors.primary} />
        <FloatingCircle size={150} blur={60} duration={8} delay={2} className="bottom-20 left-10" color={colors.primary} />
        <FloatingCircle size={100} blur={40} duration={12} delay={1} className="top-1/3 right-1/4" color={colors.primaryLight} />
      </div>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <BadgeLabel icon={<Sparkles size={12} />}>
              {language === 'th' ? 'โหมดเดท' : 'DATING MODE'}
            </BadgeLabel>
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight text-[#121212] mt-2 ${fontFor(language)}`}>
              {t.findYourMatch}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-full bg-[#F5F5F5] text-xs font-bold hover:text-[#9B7ED9] transition-colors"
            >
              <span className={language === 'en' ? 'text-[#9B7ED9]' : 'opacity-50'}>EN</span>
              <span className="opacity-30 mx-1">/</span>
              <span className={language === 'th' ? 'text-[#9B7ED9]' : 'opacity-50'}>TH</span>
            </button>
            
            {/* Premium Badge */}
            {isPremium ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#F59E0B]/10">
                <Crown size={14} color={colors.gold} />
                <span className="text-xs font-bold" style={{ color: colors.gold }}>{t.premium}</span>
              </div>
            ) : (
              <button 
                className="px-4 py-2 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: colors.primary }}
              >
                {t.goPremium}
              </button>
            )}
          </div>
        </div>
      </header>

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
                <h3 className="text-sm font-bold text-[#121212]">{t.verifyPhotos}</h3>
                <p className="text-xs text-[#57606A]">{t.verifyDesc}</p>
              </div>
              <ChevronRight size={20} color={colors.textMuted} />
            </div>

            {/* Today's Curated Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="inline-block font-mono text-[#9B7ED9] text-[10px] tracking-[0.3em] uppercase mb-1">
                    Curated
                  </span>
                  <h2 className={`text-2xl font-black tracking-tight text-[#121212] ${fontFor(language)}`}>
                    {t.todaysCurated}
                  </h2>
                  <div className="h-[3px] w-12 bg-[#9B7ED9] rounded-full mt-2" />
                </div>
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: colors.primary + '15', color: colors.primary }}
                >
                  {curatedMatches.length}/5
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {curatedMatches.map(match => (
                  <ProfileCard
                    key={match.id}
                    {...match}
                    onClick={() => navigate('/dating/discover')}
                  />
                ))}
              </div>
            </section>

            {/* Stats */}
            <section>
              <h2 className={`text-xl font-black tracking-tight text-[#121212] mb-4 ${fontFor(language)}`}>
                {language === 'th' ? 'สถิติของคุณ' : 'Your Stats'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(stat => (
                  <StatsCard key={stat.label} {...stat} />
                ))}
              </div>
            </section>

            {/* Recent Matches */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#121212]">{t.yourMatches}</h2>
                <button 
                  className="text-xs font-medium text-[#9B7ED9] flex items-center gap-1 hover:underline"
                  onClick={() => navigate('/dating/matches')}
                >
                  {language === 'th' ? 'ดูทั้งหมด' : 'See all'}
                  <ChevronRight size={14} />
                </button>
              </div>
              
              <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {recentMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    {...match}
                    onClick={() => navigate(`/dating/chat/${match.id}`)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── Likes Tab ── */}
        {activeTab === 'likes' && (
          <div className="space-y-6">
            <div>
              <span className="inline-block font-mono text-[#9B7ED9] text-[10px] tracking-[0.3em] uppercase mb-1">
                {language === 'th' ? 'ความสนใจ' : 'Attention'}
              </span>
              <h2 className={`text-3xl font-black tracking-tight text-[#121212] ${fontFor(language)}`}>
                {t.whoLikedYou}
              </h2>
              <div className="h-[3px] w-12 bg-[#9B7ED9] rounded-full mt-2" />
            </div>
            
            {recentMatches.length > 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {recentMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    {...match}
                    onClick={() => navigate(`/dating/chat/${match.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB]">
                <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
                  <Heart size={32} className="text-[#8B949E]" />
                </div>
                <p className="text-sm text-[#57606A]">
                  {language === 'th' ? 'ยังไม่มีใครถูกใจคุณ' : 'No likes yet'}
                </p>
                <p className="text-xs text-[#8B949E] mt-1">
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
                background: `linear-gradient(135deg, ${colors.primary}20, ${colors.primaryLight}20)`,
                border: `1px solid ${colors.primary}30`
              }}
            >
              {/* Background glow */}
              <div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full"
                style={{ background: `radial-gradient(circle, ${colors.primary}30, transparent 70%)`, filter: 'blur(40px)' }}
              />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#9B7ED9] flex items-center justify-center mx-auto mb-4">
                  <Compass size={32} color="#FFF" />
                </div>
                <h2 className={`text-3xl font-black tracking-tight text-[#121212] ${fontFor(language)}`}>
                  {t.readyToDiscover}
                </h2>
                <p className="text-sm text-[#57606A] mt-2">{t.findYourMatchDesc}</p>
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
                <div key={stat.label} className="bg-white rounded-2xl p-4 text-center border border-[#E5E7EB]">
                  <stat.icon size={20} color={stat.color} className="mx-auto mb-2" />
                  <div className="text-2xl font-black text-[#121212]">{stat.value}</div>
                  <div className="text-[10px] text-[#8B949E]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Chats Tab ── */}
        {activeTab === 'chats' && (
          <div className="space-y-6">
            <div>
              <span className="inline-block font-mono text-[#9B7ED9] text-[10px] tracking-[0.3em] uppercase mb-1">
                {language === 'th' ? 'ข้อความ' : 'Messages'}
              </span>
              <h2 className={`text-3xl font-black tracking-tight text-[#121212] ${fontFor(language)}`}>
                {t.chats}
              </h2>
              <div className="h-[3px] w-12 bg-[#9B7ED9] rounded-full mt-2" />
            </div>
            
            {recentMatches.length > 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                {recentMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    {...match}
                    onClick={() => navigate(`/dating/chat/${match.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB]">
                <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-[#8B949E]" />
                </div>
                <p className="text-sm text-[#57606A]">
                  {language === 'th' ? 'ยังไม่มีการสนทนา' : 'No conversations yet'}
                </p>
                <p className="text-xs text-[#8B949E] mt-1">
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
            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div 
                    className="w-20 h-20 rounded-full overflow-hidden"
                    style={{ border: `3px solid ${colors.primary}` }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div 
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.success }}
                  >
                    <CheckCircle2 size={14} color="#FFF" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#121212]">
                    {userEmail?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-sm text-[#8B949E]">{userEmail}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#9B7ED9]/10 text-[#9B7ED9]">
                      {t.premium}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F5F5F5] text-[#57606A]">
                      INTJ
                    </span>
                  </div>
                </div>
                <button>
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
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              {[
                { icon: Sparkles, label: language === 'th' ? 'ซุปเปอร์ไลค์' : 'Super Like', color: colors.gold },
                { icon: Heart, label: t.whoLikedYou, color: colors.coral },
                { icon: Shield, label: language === 'th' ? 'ความปลอดภัย' : 'Safety', color: colors.success },
              ].map((action, i) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[#F5F5F5] transition-colors"
                  style={{ borderBottom: i < 2 ? `1px solid ${colors.border}` : 'none' }}
                  onClick={() => setActiveTab('likes')}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: action.color + '15' }}
                  >
                    <action.icon size={18} color={action.color} />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-[#121212]">
                    {action.label}
                  </span>
                  <ChevronRight size={18} color={colors.textMuted} />
                </button>
              ))}
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="w-full py-4 rounded-2xl text-sm font-medium bg-[#F5F5F5] text-red-500 hover:bg-red-50 transition-colors"
            >
              {t.signOut}
            </button>
          </div>
        )}
      </main>

      {/* ── Bottom Tab Bar ─────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E5E7EB] flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {bottomTabs.map(tab => (
          <BottomTab 
            key={tab.key} 
            icon={tab.icon} 
            label={tab.label} 
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </nav>

      {/* ── CSS Animations ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        
        [data-animate="float"] {
          animation: float var(--duration, 8s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
      `}</style>
    </div>
  );
};

export default Dating;