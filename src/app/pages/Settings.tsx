/**
 * DailyStack — Settings Page (v3)
 * Redesigned to match GiGi Energy Reference:
 * - White background with gradient
 * - Bold hero-style typography
 * - Animated floating circles
 * - 3D cards with shadows
 * - Lime Green (#AAFF00) accent
 * 
 * Features:
 * - Profile settings with nickname editing
 * - App preferences
 * - Language toggle
 * - Sign out option
 * - Multi-language (EN/TH)
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { trackEvent } from '../../utils/analytics';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  User, Save, ChevronLeft, Settings as SettingsIcon, Globe, Bell,
  Shield, LogOut, ChevronRight, Check, Loader2,
  Sparkles, Camera, Moon, Sun, Mail, Calendar
} from 'lucide-react';

// ─── Design System ───────────────────────────────────────────────────────────
const colors = {
  lime: '#AAFF00',
  limeDark: '#8FCC00',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#121212',
  textSecondary: '#57606A',
  textMuted: '#8B949E',
  border: '#E5E7EB',
  success: '#22C55E',
  danger: '#EF4444',
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

// ─── Brand Logo ───────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative">
      <div className="absolute inset-0 bg-[#AAFF00] blur-xl opacity-20 rounded-full" />
      <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
        <defs>
          <linearGradient id="st-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#AAFF00" />
            <stop offset="100%" stopColor="#8FCC00" />
          </linearGradient>
        </defs>
        <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#st-grad)" opacity="0.55" />
        <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#st-grad)" opacity="0.78" />
        <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#st-grad)" />
        <path d="M50 29 L72 39 L50 47 L28 39 Z" fill="#121212" opacity="0.25" />
      </svg>
    </div>
    <span className="text-sm font-black tracking-[0.15em] uppercase">
      <span className="text-[#121212]">DAILY</span>
      <span className="text-[#AAFF00]">STACK</span>
    </span>
  </div>
);

// ─── Badge Label ───────────────────────────────────────────────────────────────
const BadgeLabel: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ 
  children, icon 
}) => (
  <div className="inline-flex items-center gap-2 bg-[#121212] text-white px-4 py-2 rounded-full text-xs font-mono tracking-wider">
    {icon && <span className="text-[#AAFF00]">{icon}</span>}
    {children}
  </div>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}> = ({ children, onClick, disabled = false, loading = false, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-[#AAFF00] text-[#121212] shadow-[0_4px_16px_rgba(170,255,0,0.3)] hover:shadow-[0_8px_32px_rgba(170,255,0,0.4)]',
    secondary: 'bg-white text-[#121212] border-2 border-[#E5E7EB] hover:border-[#AAFF00]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
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
        <Loader2 size={18} className="animate-spin mx-auto" />
      ) : (
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      )}
    </button>
  );
};

// ─── Settings Row ─────────────────────────────────────────────────────────────
interface SettingsRowProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
  danger?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ 
  icon: Icon, label, value, onClick, badge, badgeColor = colors.lime, danger 
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 p-4 rounded-2xl 
      hover:bg-[#F5F5F5] active:scale-[0.98] transition-all
      ${danger ? 'text-red-500' : 'text-[#121212]'}
    `}
  >
    <div 
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-50' : 'bg-[#F5F5F5]'}`}
    >
      <Icon size={18} className={danger ? 'text-red-500' : 'text-[#57606A]'} />
    </div>
    <span className="flex-1 text-left text-sm font-medium">{label}</span>
    {value && <span className="text-xs text-[#8B949E] mr-2">{value}</span>}
    {badge && (
      <span 
        className="px-2 py-1 rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: badgeColor }}
      >
        {badge}
      </span>
    )}
    {!danger && <ChevronRight size={18} className="text-[#8B949E]" />}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        const { data, error } = await supabase
          .from('users')
          .select('nickname')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setNickname(data.nickname || '');
        }
      }
    };
    fetchCurrentProfile();
  }, []);

  const toggleLanguage = () => setLanguage(language === 'en' ? 'th' : 'en');

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').update({ nickname, display_name: nickname }).eq('id', user.id);
        await trackEvent('profile_updated', { nickname });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white text-[#121212] font-sans relative overflow-hidden">

      {/* ── Background Decoration ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#AAFF00]/3 to-white" />
        <FloatingCircle size={200} blur={80} duration={10} delay={0} className="top-0 right-0" />
        <FloatingCircle size={150} blur={60} duration={8} delay={2} className="bottom-20 left-10" />
        <FloatingCircle size={100} blur={40} duration={12} delay={1} className="top-1/3 right-1/4" />
      </div>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#121212] hover:bg-[#E5E7EB] transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-[#AAFF00]/10 rounded-xl flex items-center justify-center">
                <SettingsIcon size={20} className="text-[#AAFF00]" />
              </div>
              <h1 className={`text-xl font-bold ${fontFor(language)}`}>
                {language === 'th' ? 'ตั้งค่า' : 'Settings'}
              </h1>
            </div>
          </div>
          
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-full bg-[#F5F5F5] text-xs font-bold hover:text-[#AAFF00] transition-colors"
          >
            <span className={language === 'en' ? 'text-[#AAFF00]' : 'opacity-50'}>EN</span>
            <span className="opacity-30 mx-1">/</span>
            <span className={language === 'th' ? 'text-[#AAFF00]' : 'opacity-50'}>TH</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-6">

        {/* Hero Section */}
        <div className="mb-8">
          <BadgeLabel icon={<Sparkles size={12} />}>
            {language === 'th' ? 'การตั้งค่า' : 'CONFIGURATION'}
          </BadgeLabel>
          <h1 className={`text-3xl md:text-4xl font-black tracking-tight text-[#121212] mt-3 ${fontFor(language)}`}>
            {language === 'th' ? 'ตั้งค่าบัญชี' : 'Account Settings'}
          </h1>
          <p className="text-sm text-[#57606A] mt-2">
            {language === 'th' 
              ? 'จัดการโปรไฟล์และการตั้งค่าแอปของคุณ'
              : 'Manage your profile and app preferences'
            }
          </p>
          <div className="h-[3px] w-12 bg-[#AAFF00] rounded-full mt-3" />
        </div>

        {/* Profile Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest mb-4">
            {language === 'th' ? 'โปรไฟล์' : 'Profile'}
          </h2>
          
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            
            {/* Avatar */}
            <div className="p-5 border-b border-[#E5E7EB] flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F5F5F5]">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#AAFF00] flex items-center justify-center shadow-[0_2px_8px_rgba(170,255,0,0.3)]"
                >
                  <Camera size={14} className="text-[#121212]" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#121212]">{userEmail?.split('@')[0] || 'User'}</h3>
                <p className="text-xs text-[#8B949E]">{userEmail}</p>
              </div>
            </div>
            
            {/* Nickname */}
            <div className="p-5">
              <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest mb-2 block">
                {language === 'th' ? 'ชื่อที่แสดง' : 'Display Name'}
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoComplete="nickname"
                className="w-full bg-[#F5F5F5] px-4 py-3.5 rounded-xl
                  border border-transparent focus:border-[#AAFF00] focus:outline-none 
                  text-[#121212] text-base transition-all"
                placeholder={language === 'th' ? 'กรอกชื่อของคุณ' : 'Enter your name'}
              />
              
              {/* Save button */}
              <div className="mt-4 flex justify-end">
                <PrimaryButton 
                  onClick={handleSave} 
                  disabled={loading}
                  loading={loading}
                >
                  {saved ? (
                    <>
                      <Check size={16} />
                      {language === 'th' ? 'บันทึกแล้ว!' : 'Saved!'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {language === 'th' ? 'บันทึก' : 'Save'}
                    </>
                  )}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest mb-4">
            {language === 'th' ? 'การตั้งค่า' : 'Preferences'}
          </h2>
          
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <SettingsRow
              icon={Globe}
              label={language === 'th' ? 'ภาษา' : 'Language'}
              value={language === 'th' ? 'ไทย' : 'English'}
              onClick={toggleLanguage}
              badge={language.toUpperCase()}
              badgeColor={colors.lime}
            />
            <div className="border-t border-[#E5E7EB]" />
            <SettingsRow
              icon={Bell}
              label={language === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
              value={language === 'th' ? 'เปิด' : 'On'}
              onClick={() => {}}
              badge="On"
              badgeColor={colors.success}
            />
            <div className="border-t border-[#E5E7EB]" />
            <SettingsRow
              icon={Moon}
              label={language === 'th' ? 'โหมดมืด' : 'Dark Mode'}
              value={language === 'th' ? 'ปิด' : 'Off'}
              onClick={() => {}}
            />
          </div>
        </section>

        {/* Security Section */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest mb-4">
            {language === 'th' ? 'ความปลอดภัย' : 'Security'}
          </h2>
          
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <SettingsRow
              icon={Shield}
              label={language === 'th' ? 'ความเป็นส่วนตัว' : 'Privacy'}
              onClick={() => {}}
            />
            <div className="border-t border-[#E5E7EB]" />
            <SettingsRow
              icon={Mail}
              label={language === 'th' ? 'อีเมล' : 'Email'}
              value={userEmail || ''}
              onClick={() => {}}
            />
            <div className="border-t border-[#E5E7EB]" />
            <SettingsRow
              icon={Calendar}
              label={language === 'th' ? 'วันที่เข้าร่วม' : 'Joined'}
              value={new Date().toLocaleDateString()}
              onClick={() => {}}
            />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-4">
            {language === 'th' ? 'โซนอันตราย' : 'Danger Zone'}
          </h2>
          
          <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
            <SettingsRow
              icon={LogOut}
              label={language === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
              onClick={handleLogout}
              danger
            />
          </div>
        </section>

        {/* App Info */}
        <div className="text-center py-8">
          <p className="text-xs text-[#8B949E]">
            DailyStack v1.0.0
          </p>
          <p className="text-[10px] text-[#E5E7EB] mt-1">
            {language === 'th' ? 'สร้างด้วย ❤️ สำหรับคุณ' : 'Made with ❤️ for you'}
          </p>
        </div>
      </main>

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

export { Settings };
export default Settings;