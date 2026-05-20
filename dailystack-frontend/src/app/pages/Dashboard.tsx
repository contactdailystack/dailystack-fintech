import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Compass, WalletCards, Gift,
  User, Settings, Sparkles, MapPin, Lock,
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

// ─── Brand Logo ──────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className ?? ''}`}>
    <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ds-grad-db" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#56be89" />
          <stop offset="100%" stopColor="#3a9e68" />
        </linearGradient>
      </defs>
      <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#ds-grad-db)" opacity="0.55" />
      <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#ds-grad-db)" opacity="0.78" />
      <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#ds-grad-db)" />
      <path d="M50 29 L72 39 L50 47 L28 39 Z" fill="#1c232a" opacity="0.35" />
    </svg>
    <span className="text-sm font-black tracking-[0.18em] uppercase leading-none font-sans select-none">
      <span className="text-white">DAILY</span>
      <span className="text-primary">STACK</span>
    </span>
  </div>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  locked?: boolean;
  onClick?: () => void;
}

// ─── Desktop Sidebar NavButton ────────────────────────────────────────────────
const SideNavButton: React.FC<NavItem> = ({ icon: Icon, label, active, locked, onClick }) => (
  <button
    onClick={locked ? undefined : onClick}
    className={`flex items-center justify-between w-full px-3 py-3 rounded-xl text-sm font-medium
      transition-all min-h-[44px] ${
      active
        ? 'bg-primary/10 text-primary'
        : locked
        ? 'text-gray-600 cursor-not-allowed opacity-60'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      {label}
    </div>
    {locked && <Lock size={14} />}
  </button>
);

// ─── Mobile Bottom Tab Button ─────────────────────────────────────────────────
// min-h 56px for thumb reach; active indicator dot at top
const BottomTabButton: React.FC<NavItem> = ({ icon: Icon, label, active, locked, onClick }) => (
  <button
    onClick={locked ? undefined : onClick}
    className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[56px]
      transition-all relative ${
      active
        ? 'text-primary'
        : locked
        ? 'text-gray-700 cursor-not-allowed'
        : 'text-gray-500 active:text-white'
    }`}
  >
    <div className="relative">
      <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
      {locked && (
        <Lock size={10} className="absolute -top-1 -right-1 text-gray-600" />
      )}
    </div>
    <span className="text-[10px] font-semibold tracking-wide font-sans leading-none">{label}</span>
    {active && (
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />
    )}
  </button>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: string | number;
  suffix?: string;
  accent?: boolean;
}> = ({ label, value, suffix, accent }) => (
  // Mobile: comfortable tap target; snap-align for horizontal scroll
  <div className="bg-dark-card border border-white/5 rounded-2xl p-4 md:p-5
    hover:border-primary/20 active:scale-[0.97] transition-all cursor-pointer">
    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2 font-kanit whitespace-nowrap">
      {label}
    </p>
    <p className={`text-3xl font-bold leading-none ${accent ? 'text-primary' : 'text-white'}`}>
      {value}
      {suffix && (
        <span className="text-xs font-normal text-gray-500 ml-1.5">{suffix}</span>
      )}
    </p>
  </div>
);

// ─── Merchant Card ────────────────────────────────────────────────────────────
const MerchantCard: React.FC<{
  name: string;
  category: string;
  location: string;
  distance: string;
  rating: number;
  matchPct: number;
}> = ({ name, category, location, distance, rating, matchPct }) => (
  <div
    onClick={() => trackEvent('view_merchant', { merchant_name: name })}
    className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden
      hover:border-primary/30 active:scale-[0.98] transition-all cursor-pointer group"
  >
    {/* Merchant image placeholder — taller on mobile for thumb scrolling */}
    <div className="h-36 bg-gradient-to-br from-white/5 to-transparent relative">
      <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/40 to-transparent" />
      <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
        <span className="px-2.5 py-1 bg-dark-bg/80 backdrop-blur-sm text-[10px] font-semibold
          rounded-full text-white/80 border border-white/5">
          {category}
        </span>
        <span className="px-2.5 py-1 bg-primary/15 backdrop-blur-sm text-[10px] font-bold
          rounded-full text-primary border border-primary/20">
          {matchPct}% Match
        </span>
      </div>
    </div>
    <div className="px-4 py-3.5 flex justify-between items-start gap-2">
      <div className="min-w-0">
        <h4 className="font-bold text-white text-sm leading-tight mb-1.5
          group-hover:text-primary transition-colors truncate">
          {name}
        </h4>
        <p className="text-gray-500 text-xs flex items-center gap-1">
          <MapPin size={11} className="shrink-0" />
          <span className="truncate">{location} ({distance})</span>
        </p>
      </div>
      {/* Rating badge — min 36px for readability */}
      <div className="w-9 h-9 rounded-full bg-dark-bg border border-white/8
        flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-white">{rating}</span>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems: NavItem[] = [
    {
      icon: Compass,
      label: 'Discover',
      active: true,
      onClick: () => trackEvent('feature_usage', { feature: 'discover_tab' }),
    },
    {
      icon: WalletCards,
      label: 'Cards',
      onClick: () => {
        trackEvent('feature_usage', { feature: 'memberships_tab' });
        navigate('/memberships');
      },
    },
    {
      icon: Gift,
      label: 'Rewards',
      locked: true,
      onClick: () => trackEvent('feature_locked_click', { feature: 'rewards_tab' }),
    },
  ];

  const secondaryNav: NavItem[] = [
    { icon: User, label: 'Profile', onClick: () => navigate('/settings') },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
  ];

  const merchants = [
    { name: 'The Roasters Co.', category: 'Specialty Coffee', location: 'Sukhumvit 49', distance: '1.2 km', rating: 4.8, matchPct: 98 },
    { name: 'Daily Pet Club', category: 'Pet Friendly', location: 'Thong Lo', distance: '2.5 km', rating: 4.9, matchPct: 95 },
  ];

  return (
    // Mobile: single column, flex-col. Desktop: flex-row with sidebar.
    <div className="min-h-screen min-h-[100dvh] bg-dark-bg text-white font-sans flex flex-col md:flex-row overflow-x-hidden">

      {/* ── Desktop Sidebar (hidden on mobile) ──────────────────────────── */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-white/5 bg-dark-card flex-col p-5">
        <DailyStackLogo className="mb-10 px-1" />

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <SideNavButton key={item.label} {...item} />
          ))}
          <div className="!mt-6 pt-5 border-t border-white/5 space-y-1">
            {secondaryNav.map((item) => (
              <SideNavButton key={item.label} {...item} />
            ))}
          </div>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 text-sm font-medium min-h-[44px]
            text-red-400/70 hover:text-red-400 hover:bg-red-400/8 rounded-xl transition-all mt-2"
        >
          <LogOut size={18} strokeWidth={1.8} /> Sign Out
        </button>
      </aside>

      {/* ── Main content area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Sticky top header */}
        <header className="sticky top-0 z-20 bg-dark-bg/90 backdrop-blur-xl border-b border-white/5
          px-4 md:px-10 py-3.5 md:py-5 flex justify-between items-center gap-3">

          {/* Mobile: logo | Desktop: greeting */}
          <div className="md:hidden">
            <DailyStackLogo />
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Welcome Back <Sparkles size={20} className="text-primary" />
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-kanit">
              สำรวจประสบการณ์ไลฟ์สไตล์ที่คัดสรรมาเพื่อคุณ
            </p>
          </div>

          {/* Session pill — truncated so it doesn't overflow on narrow phones */}
          <div className="flex items-center gap-2 px-3 py-2 bg-dark-card
            rounded-full text-xs text-primary font-medium border border-white/5
            max-w-[140px] sm:max-w-[200px] md:max-w-none overflow-hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="truncate">{userEmail || 'Loading…'}</span>
          </div>
        </header>

        {/* Scrollable page body */}
        {/* pb-[env(safe-area-inset-bottom)] handles iPhone home bar */}
        <main className="flex-1 overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">

          {/* Mobile welcome strip */}
          <div className="md:hidden px-4 pt-5 pb-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Welcome Back <Sparkles size={18} className="text-primary" />
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-kanit">
              สำรวจประสบการณ์ไลฟ์สไตล์ที่คัดสรรมาเพื่อคุณ
            </p>
          </div>

          <div className="px-4 md:px-10 py-5 md:py-8 space-y-8 md:space-y-10">

            {/* Stats section */}
            <section>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 font-kanit">
                ภาพรวมสถานะ
              </p>
              {/*
                Mobile: horizontal snap-scroll so cards never clip or cause overflow.
                Each card is a fixed 148px wide — comfortable thumb swipe.
                Desktop: 3-col grid.
              */}
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4
                md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 md:gap-4
                snap-x snap-mandatory md:snap-none
                scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
                {[
                  { label: 'Total Points', value: '1,250', accent: true },
                  { label: 'Memberships', value: 4, suffix: 'Brands' },
                  { label: 'Saved Rewards', value: 12, suffix: 'Coupons' },
                ].map((s) => (
                  <div key={s.label} className="snap-start shrink-0 w-[148px] md:w-auto">
                    <StatCard {...s} />
                  </div>
                ))}
              </div>
            </section>

            {/* Curated feed */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" /> Curated for You
                </h3>
                <button className="text-xs text-primary font-medium font-kanit
                  hover:underline underline-offset-2 py-1.5 px-2 -mr-2">
                  ดูทั้งหมด
                </button>
              </div>
              {/* Mobile: single column → sm: 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {merchants.map((m) => (
                  <MerchantCard key={m.name} {...m} />
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────────── */}
      {/*
        Uses safe-area-inset-bottom so content isn't hidden behind iPhone
        home indicator. pb-[env(safe-area-inset-bottom)] pads the bar itself.
      */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30
        bg-dark-card/95 backdrop-blur-xl border-t border-white/5
        flex items-stretch
        pb-[env(safe-area-inset-bottom)]">

        {navItems.map((item) => (
          <BottomTabButton key={item.label} {...item} />
        ))}

        <BottomTabButton
          icon={Settings}
          label="Settings"
          onClick={() => navigate('/settings')}
        />

        <BottomTabButton
          icon={LogOut}
          label="Sign Out"
          onClick={handleLogout}
        />
      </nav>

    </div>
  );
};

export default Dashboard;