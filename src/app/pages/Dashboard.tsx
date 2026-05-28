/**
 * DailyStack — Dashboard Page (v3.1)
 * Redesigned to match GiGi Energy Reference:
 * - White background with gradient
 * - Bold hero-style typography
 * - Animated floating circles
 * - Bento grid layout
 * - Lime Green (#AAFF00) accent
 * 
 * Features:
 * - Statistics overview (Bento grid)
 * - Curated lifestyle feed
 * - Bottom navigation (mobile)
 * - Multi-language (EN/TH)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { AuthService } from '../services/authService';
import { 
  LogOut, Compass, WalletCards, Gift, Heart,
  Settings, Sparkles, MapPin, Zap, Flame, Brain, Star,
  ChevronRight, Coffee, PawPrint, Palette, User, Menu
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';
import { useLanguage } from '../context/LanguageContext';

// ─── Design System ───────────────────────────────────────────────────────────
const colors = {
  lime: 'var(--brand-500)',
  limeDark: 'var(--brand-600)',
  background: 'var(--semantic-surface-2)',
  white: 'var(--semantic-surface-1)',
  dark: 'var(--brand-ink)',
  textPrimary: 'var(--brand-ink)',
  textSecondary: 'var(--semantic-text)',
  textMuted: 'var(--semantic-muted)',
};

// ─── Font Helper ─────────────────────────────────────────────────────────────
const fontFor = (lang: 'en' | 'th') =>
  lang === 'th' ? 'font-kanit' : 'font-sans';

// ─── Animated Floating Circle ───────────────────────────────────────────────
const FloatingCircle: React.FC<{
  size?: number;
  color?: string;
  blur?: number;
  duration?: number;
  delay?: number;
  className?: string;
}> = ({ size = 96, color = colors.lime, blur = 48, duration = 8, delay = 0, className = '' }) => (
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

// ─── Brand Logo ────────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string; dark?: boolean }> = ({ 
  className = '', dark = false 
}) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative">
      <div className="absolute inset-0 bg-[#AAFF00] blur-xl opacity-20 rounded-full" />
      <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
        <defs>
          <linearGradient id="ds-grad-dash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#AAFF00" />
            <stop offset="100%" stopColor="#8FCC00" />
          </linearGradient>
        </defs>
        <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#ds-grad-dash)" opacity="0.55" />
        <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#ds-grad-dash)" opacity="0.78" />
        <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#ds-grad-dash)" />
        <path d="M50 29 L72 39 L50 47 L28 39 Z" fill={dark ? "#FFFFFF" : "#0D1117"} opacity="0.25" />
      </svg>
    </div>
    <span className="text-base font-black tracking-[0.12em] uppercase">
      <span className={dark ? 'text-white' : 'text-[#121212]'}>DAILY</span>
      <span className="text-[#AAFF00]">STACK</span>
    </span>
  </div>
);

// ─── Badge Label ───────────────────────────────────────────────────────────────
const BadgeLabel: React.FC<{ children: React.ReactNode; pulse?: boolean }> = ({ children, pulse = false }) => (
  <div className="inline-flex items-center gap-2 bg-[#121212] text-white px-4 py-2 rounded-full text-xs font-mono tracking-wider">
    {pulse && <span className="w-2 h-2 bg-[#AAFF00] rounded-full animate-pulse" />}
    {children}
  </div>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      relative px-6 py-3.5 rounded-full font-bold text-sm tracking-wide
      bg-[#AAFF00] text-[#121212]
      shadow-[0_4px_16px_rgba(170,255,0,0.3)]
      hover:shadow-[0_8px_32px_rgba(170,255,0,0.4)]
      hover:-translate-y-[2px] active:translate-y-0
      transition-all duration-300 overflow-hidden
      ${className}
    `}
  >
    <span className="relative z-10 flex items-center gap-2">
      {children}
    </span>
  </button>
);

// ─── Bento Grid Feature Card ─────────────────────────────────────────────────
const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accent?: string;
  delay?: number;
}> = ({ icon: Icon, title, subtitle, accent = colors.lime, delay = 0 }) => (
  <div 
    className="relative bg-[#1a1a1a] rounded-2xl p-5 border border-white/10 overflow-hidden cursor-pointer group"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Glow on hover */}
    <div 
      className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: `linear-gradient(135deg, ${accent}40, transparent, ${accent}40)`,
        filter: 'blur(8px)',
      }}
    />
    
    {/* Content */}
    <div className="relative z-10 flex flex-col min-h-[140px]">
      {/* Icon with pulse */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative"
        style={{ backgroundColor: `${accent}20` }}
      >
        <div 
          className="absolute inset-0 rounded-xl animate-pulse"
          style={{ backgroundColor: accent, opacity: 0.3 }}
        />
        <Icon className="w-6 h-6 relative z-10" style={{ color: accent }} />
      </div>
      
      {/* Text */}
      <div className="flex-1">
        <div className="text-4xl font-black tracking-tighter text-white">
          <span style={{ color: accent }}>{title}</span>
        </div>
        <h3 className="text-sm font-semibold text-white mt-1">{subtitle}</h3>
      </div>
      
      {/* Bottom accent line */}
      <div className="h-[3px] rounded-full mt-4" style={{ backgroundColor: accent }} />
    </div>
  </div>
);

// ─── Merchant Card ─────────────────────────────────────────────────────────────
const MerchantCard: React.FC<{
  name: string;
  category: string;
  location: string;
  distance: string;
  rating: number;
  matchPct: number;
  icon: React.ElementType;
}> = ({ name, category, location, distance, rating, matchPct, icon: Icon }) => (
  <div 
    onClick={() => trackEvent('view_merchant', { merchant_name: name })}
    className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_16px_rgba(13,17,23,0.06)] hover:shadow-[0_8px_32px_rgba(13,17,23,0.1)] active:scale-[0.98] transition-all cursor-pointer group"
  >
    {/* Image area */}
    <div className="h-40 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] relative flex items-center justify-center overflow-hidden">
      <Icon size={48} className="text-white/20" />
      
      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        <span className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-[10px] font-semibold rounded-full text-white border border-white/20">
          {category}
        </span>
        <span className="px-3 py-1.5 bg-[#AAFF00] text-[#121212] text-[10px] font-bold rounded-full">
          {matchPct}% Match
        </span>
      </div>
    </div>
    
    {/* Info */}
    <div className="px-4 py-4 flex justify-between items-start gap-3">
      <div className="min-w-0">
        <h4 className="font-bold text-[#121212] text-base leading-tight mb-1 group-hover:text-[#AAFF00] transition-colors truncate">
          {name}
        </h4>
        <p className="text-[#8B949E] text-sm flex items-center gap-1.5">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{location} ({distance})</span>
        </p>
      </div>
      
      {/* Rating */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] rounded-full shrink-0">
        <Star size={14} className="text-[#AAFF00] fill-[#AAFF00]" />
        <span className="text-sm font-bold text-[#121212]">{rating}</span>
      </div>
    </div>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ label: string; title: string; subtitle?: string }> = ({ 
  label, title, subtitle 
}) => (
  <div className="mb-6">
    <span className="inline-block font-mono text-[#AAFF00] text-[10px] tracking-[0.3em] uppercase">
      {label}
    </span>
    <h2 className="text-2xl md:text-3xl font-black text-[#121212] tracking-tight mt-1">
      {title}
    </h2>
    <div className="h-[3px] w-12 bg-[#AAFF00] rounded-full mt-3" />
    {subtitle && (
      <p className="text-sm text-[#8B949E] mt-3">{subtitle}</p>
    )}
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
    className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors relative ${active ? 'text-[#AAFF00]' : 'text-[#8B949E]'}`}
  >
    {active && (
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-[#AAFF00]" />
    )}
    <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
    <span className="text-[10px] font-semibold tracking-wide">{label}</span>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [userEmail, setUserEmail] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ── Welcome Back Data ──────────────────────────────────────────────────────
  const [welcomeData, setWelcomeData] = useState<{
    name: string;
    hasNewMatches: boolean;
    hasCompatibilityUpdates: boolean;
    hasNewMessages: boolean;
  } | null>(null);

  useEffect(() => {
    const loadWelcomeData = async () => {
      const data = await AuthService.getWelcomeBackData();
      if (data) {
        setWelcomeData(data);
      }
    };
    loadWelcomeData();
  }, []);

  // ── Scroll Detection ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Auth Check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
      } else {
        setUserEmail(session.user.email ?? '');
      }
    };
    checkUser();
  }, [navigate]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'th' ? 'สวัสดีตอนเช้า' : 'Good morning';
    if (hour < 18) return language === 'th' ? 'สวัสดีตอนบ่าย' : 'Good afternoon';
    return language === 'th' ? 'สวัสดีตอนเย็น' : 'Good evening';
  };

  // ── Navigation Items ───────────────────────────────────────────────────────
  const navItems = [
    { icon: Compass, label: 'Discover', active: true },
    { icon: WalletCards, label: 'Cards', onClick: () => navigate('/memberships') },
    { icon: Gift, label: 'Rewards', locked: true },
  ];

  const bottomTabs = [
    { icon: Compass, label: 'Discover', active: true },
    { icon: WalletCards, label: 'Cards', onClick: () => navigate('/memberships') },
    { icon: Heart, label: 'Dating', onClick: () => navigate('/dating') },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
  ];

  // ── Mock Data ───────────────────────────────────────────────────────────────
  const features = [
    { icon: Zap, title: '1,250', subtitle: 'Points Earned', accent: '#AAFF00', delay: 0 },
    { icon: Flame, title: '4', subtitle: 'Memberships', accent: '#FF6B35', delay: 100 },
    { icon: Brain, title: '98%', subtitle: 'Compatibility', accent: '#00D4FF', delay: 200 },
    { icon: Star, title: '12', subtitle: 'Rewards Saved', accent: '#AAFF00', delay: 300 },
  ];

  const merchants = [
    { name: 'The Roasters Co.', category: 'Specialty Coffee', location: 'Sukhumvit 49', distance: '1.2 km', rating: 4.8, matchPct: 98, icon: Coffee },
    { name: 'Daily Pet Club', category: 'Pet Friendly', location: 'Thong Lo', distance: '2.5 km', rating: 4.9, matchPct: 95, icon: PawPrint },
    { name: 'Creative Space', category: 'Art & Design', location: 'Silom', distance: '3.1 km', rating: 4.7, matchPct: 92, icon: Palette },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white text-[#121212] font-sans relative overflow-hidden">

      {/* ── Background Decoration ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[var(--brand-500)]/3 to-white" />
        
        {/* Animated floating circles */}
        <FloatingCircle size={200} blur={80} duration={10} delay={0} className="top-0 right-0" />
        <FloatingCircle size={150} blur={60} duration={8} delay={2} className="bottom-20 left-10" />
        <FloatingCircle size={100} blur={40} duration={12} delay={1} className="top-1/3 right-1/4" />
      </div>

      {/* ── Sticky Header ───────────────────────────────────────────────── */}
      <header className={`
        sticky top-0 z-20 transition-all duration-500
        ${scrolled 
          ? 'bg-[#121212]/95 backdrop-blur-md border-b border-white/10' 
          : 'bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]'
        }
        px-6 py-4
      `}>
        <div className="flex justify-between items-center gap-4 max-w-7xl mx-auto">
          
          {/* Logo */}
          <DailyStackLogo dark={scrolled} />
          
          {/* Nav - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.locked ? undefined : item.onClick}
                disabled={item.locked}
                className={`
                  text-sm font-medium tracking-wide transition-colors relative
                  ${item.active 
                    ? 'text-[#AAFF00]' 
                    : item.locked 
                      ? 'opacity-50 cursor-not-allowed text-white/40' 
                      : scrolled ? 'text-white/70 hover:text-white' : 'text-[#57606A] hover:text-[#121212]'
                  }
                `}
              >
                {item.label}
                {item.active && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#AAFF00] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`
                px-3 py-2 rounded-full text-xs font-bold border transition-all
                ${scrolled 
                  ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' 
                  : 'bg-[#F5F5F5] text-[#57606A] border-transparent hover:border-[#AAFF00]'
                }
              `}
            >
              <span className={language === 'en' ? 'text-[#AAFF00]' : 'opacity-50'}>EN</span>
              <span className="opacity-30 mx-1">/</span>
              <span className={language === 'th' ? 'text-[#AAFF00]' : 'opacity-50'}>TH</span>
            </button>
            
            {/* User Pill */}
            <div className={`
              hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium
              ${scrolled 
                ? 'bg-[#AAFF00]/10 text-[#AAFF00] border border-[#AAFF00]/20' 
                : 'bg-[#121212] text-white'
              }
            `}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span className="max-w-[120px] truncate">{userEmail || 'Loading…'}</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 ${scrolled ? 'text-white' : 'text-[#121212]'}`}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="relative z-10 pb-[calc(72px+env(safe-area-inset-bottom))]">
        
        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <section className="relative px-6 py-12 md:py-20 max-w-7xl mx-auto">
          
          {/* Greeting */}
          <div className="mb-8">
            <BadgeLabel pulse>
              {language === 'th' ? 'ยินดีต้อนรับสู่ DailyStack' : 'WELCOME TO DAILYSTACK'}
            </BadgeLabel>
            
            <h1 className={`text-5xl md:text-7xl font-black tracking-tighter text-[#121212] leading-[0.9] mt-4 ${fontFor(language)}`}>
              {getGreeting()},
            </h1>
            <h1 className={`text-5xl md:text-7xl font-black tracking-tighter text-[#AAFF00] leading-[0.9] ${fontFor(language)}`}>
              {welcomeData?.name?.split(' ')[0] || 'User'}
            </h1>
            
            <p className="text-lg font-mono text-[#121212]/50 mt-4 max-w-lg">
              {language === 'th' 
                ? 'สำรวจประสบการณ์ไลฟ์สไตล์ที่คัดสรรมาเพื่อคุณโดยเฉพาะ'
                : 'Explore curated lifestyle experiences just for you'
              }
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={() => navigate('/dating')}>
              <Heart size={16} />
              {language === 'th' ? 'เริ่มหาคู่' : 'Find Matches'}
            </PrimaryButton>
            <PrimaryButton onClick={() => navigate('/memberships')}>
              <WalletCards size={16} />
              {language === 'th' ? 'ดูบัตรของฉัน' : 'My Cards'}
            </PrimaryButton>
          </div>
        </section>

        {/* ── Stats Section (Bento Grid) ───────────────────────────────────── */}
        <section className="px-6 py-8 max-w-7xl mx-auto">
          <SectionHeader 
            label="Overview" 
            title={language === 'th' ? 'ภาพรวมของคุณ' : 'Your Stats'} 
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((item, index) => (
              <FeatureCard key={item.title} {...item} delay={index * 100} />
            ))}
          </div>
        </section>

        {/* ── Curated Feed ─────────────────────────────────────────────── */}
        <section className="px-6 py-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-[#121212] text-lg flex items-center gap-2">
                <Sparkles size={18} className="text-[#AAFF00]" />
                {language === 'th' ? 'คัดสรรเพื่อคุณ' : 'Curated for You'}
              </h3>
            </div>
            <button className="text-sm font-medium text-[#8B949E] flex items-center gap-1 hover:text-[#AAFF00] transition-colors">
              {language === 'th' ? 'ดูทั้งหมด' : 'See All'}
              <ChevronRight size={16} />
            </button>
          </div>
          
          {/* Merchant Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.name} {...merchant} />
            ))}
          </div>
        </section>

        {/* ── Quick Links ────────────────────────────────────────────── */}
        <section className="px-6 py-8 max-w-7xl mx-auto">
          <h3 className="font-bold text-[#121212] text-lg mb-4 flex items-center gap-2">
            <Zap size={18} className="text-[#AAFF00]" />
            {language === 'th' ? 'ลัดเลาะเร็ว' : 'Quick Actions'}
          </h3>
          
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-4 snap-x snap-mandatory scrollbar-none [scrollbar-width:none]">
            {[
              { label: language === 'th' ? 'เพิ่มรูปโปรไฟล์' : 'Add Profile Photo', icon: '📸', color: '#AAFF00' },
              { label: language === 'th' ? 'ปรับปรุงความเข้ากันได้' : 'Improve Match', icon: '💕', color: '#FF6B35' },
              { label: language === 'th' ? 'อัพเกรดพรีเมียม' : 'Go Premium', icon: '✨', color: '#00D4FF' },
            ].map((action, i) => (
              <button
                key={action.label}
                className="snap-start shrink-0 bg-white rounded-2xl px-6 py-5 shadow-[0_4px_16px_rgba(13,17,23,0.06)] hover:shadow-[0_8px_32px_rgba(13,17,23,0.1)] active:scale-[0.97] transition-all text-left w-[140px]"
              >
                <span className="text-3xl mb-3 block">{action.icon}</span>
                <span className="text-sm font-semibold text-[#121212] block">{action.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* ── Desktop Sidebar (hidden) ───────────────────────────────────────── */}
      {/* Using header nav instead */}

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E5E7EB] flex items-stretch pb-[env(safe-area-inset-bottom)] md:hidden">
        {bottomTabs.map((tab) => (
          <BottomTab key={tab.label} {...tab} />
        ))}
      </nav>

      {/* ── CSS Animations ───────────────────────────────────────────────── */}
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

export default Dashboard;