import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Compass, WalletCards, Gift,
  User, Settings, Sparkles, MapPin, Lock, // เพิ่ม Lock เข้ามาเพื่อใช้งาน
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

// ─── Brand Logo ──────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className ?? ''}`}>
    <svg width="26" height="26" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ds-grad-db" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d2ff00" />
          <stop offset="100%" stopColor="#3a9e68" />
        </linearGradient>
      </defs>
      <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#ds-grad-db)" opacity="0.55" />
      <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#ds-grad-db)" opacity="0.78" />
      <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#ds-grad-db)" />
      <path d="M50 29 L72 39 L50 47 L28 39 Z" fill="#000000" opacity="0.35" />
    </svg>
    <span className="text-sm font-black tracking-[0.18em] uppercase leading-none font-sans select-none">
      <span className="text-white">DAILY</span>
      <span className="text-primary">STACK</span>
    </span>
  </div>
);

// ─── Sub-components ──────────────────────────────────────────────────────────
const NavButton: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
  locked?: boolean; // รองรับสถานะล็อคฟีเจอร์
}> = ({ icon: Icon, label, active, onClick, locked }) => (
  <button 
    onClick={locked ? undefined : onClick}
    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
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

const StatCard: React.FC<{ label: string; value: string | number; suffix?: string; accent?: boolean }> = ({ label, value, suffix, accent }) => (
  <div className="bg-dark-card border border-white/5 rounded-2xl p-5 hover:border-primary/20 transition-colors cursor-pointer">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 font-kanit">{label}</p>
    <p className={`text-4xl font-bold leading-none ${accent ? 'text-primary' : 'text-white'}`}>
      {value}
      {suffix && <span className="text-sm font-normal text-gray-500 ml-2">{suffix}</span>}
    </p>
  </div>
);

const MerchantCard: React.FC<{ name: string; category: string; location: string; distance: string; rating: number; matchPct: number }> = ({ name, category, location, distance, rating, matchPct }) => (
  <div 
    onClick={() => trackEvent('view_merchant', { merchant_name: name })}
    className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
  >
    <div className="h-36 bg-gradient-to-br from-white/5 to-transparent relative">
      <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/40 to-transparent" />
      <div className="absolute bottom-3 left-4 flex gap-2">
        <span className="px-2.5 py-1 bg-dark-bg/80 backdrop-blur-sm text-[11px] font-semibold rounded-full text-white/80 border border-white/5">{category}</span>
        <span className="px-2.5 py-1 bg-primary/15 backdrop-blur-sm text-[11px] font-bold rounded-full text-primary border border-primary/20">{matchPct}% Match</span>
      </div>
    </div>
    <div className="px-5 py-4 flex justify-between items-start">
      <div>
        <h4 className="font-bold text-white text-base leading-tight mb-1.5 group-hover:text-primary transition-colors">{name}</h4>
        <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin size={12} /> {location} ({distance})</p>
      </div>
      <div className="w-9 h-9 rounded-full bg-dark-bg border border-white/8 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-white">{rating}</span>
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/');
      else setUserEmail(session.user.email ?? '');
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex font-sans">
      <aside className="w-60 shrink-0 border-r border-white/5 bg-dark-card flex flex-col p-5">
        <DailyStackLogo className="mb-10 px-1" />
        
        <nav className="flex-1 space-y-1">
          <NavButton icon={Compass} label="Discover" active onClick={() => trackEvent('feature_usage', { feature: 'discover_tab' })} />
          <NavButton icon={WalletCards} label="Memberships" onClick={() => trackEvent('feature_usage', { feature: 'memberships_tab' })} />
          
          {/* ฟีเจอร์ Rewards ที่ล็อคไว้พร้อมวัดผลความสนใจ */}
          <NavButton 
            icon={Gift} 
            label="Rewards" 
            locked 
            onClick={() => trackEvent('feature_locked_click', { feature: 'rewards_tab' })} 
          />

          <div className="!mt-6 pt-5 border-t border-white/5 space-y-1">
            <NavButton icon={User} label="Profile" onClick={() => navigate('/settings')} />
            <NavButton icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
          </div>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/8 rounded-xl transition-all">
          <LogOut size={18} strokeWidth={1.8} /> Sign Out
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-dark-bg/80 backdrop-blur-xl border-b border-white/5 px-10 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Welcome Back <Sparkles size={20} className="text-primary" />
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-kanit">สำรวจประสบการณ์ไลฟ์สไตล์ที่คัดสรรมาเพื่อคุณ</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-card rounded-full text-xs text-primary font-medium border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {userEmail}
          </div>
        </header>

        <div className="px-10 py-8 space-y-10">
          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 font-kanit">ภาพรวมสถานะ</p>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Total Points" value="1,250" accent />
              <StatCard label="Active Memberships" value={4} suffix="Brands" />
              <StatCard label="Saved Rewards" value={12} suffix="Coupons" />
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> Curated for You
              </h3>
              <button className="text-xs text-primary hover:underline underline-offset-2 font-medium font-kanit">ดูทั้งหมด</button>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { name: 'The Roasters Co.', category: 'Specialty Coffee', location: 'Sukhumvit 49', distance: '1.2 km', rating: 4.8, matchPct: 98 },
                { name: 'Daily Pet Club', category: 'Pet Friendly', location: 'Thong Lo', distance: '2.5 km', rating: 4.9, matchPct: 95 }
              ].map((m) => <MerchantCard key={m.name} {...m} />)}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;