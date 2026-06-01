/**
 * DailyStack — Settings Page (v6.0 Cyber-Technical Fintech)
 * Redesigned to match the Cyber-Technical Fintech reference design:
 * - Background: #131313 deep void
 * - Lime accent: #C0F500
 * - Dark surface cards: #161616, #242424
 * - Uses DesignSystem Shell with orbs, lang toggle, floating nav
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Shell } from '../components/DesignSystem';

// ─── Material Symbols Icon helper ─────────────────────────────────────────────
const Icon: React.FC<{ name: string; size?: number; className?: string }> = ({
  name, size = 20, className = ''
}) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>{name}</span>
);

// ─── Material Icons Map ────────────────────────────────────────────────────────
const icons: Record<string, string> = {
  ChevronLeft:    'arrow_back',
  ChevronRight:   'chevron_right',
  Save:           'save',
  Check:          'check',
  Loader2:        'progress_activity',
  Settings:       'settings',
  Globe:          'language',
  Bell:           'notifications',
  Shield:         'security',
  LogOut:         'logout',
  Mail:           'mail',
  Calendar:       'calendar_today',
  Sparkles:       'auto_awesome',
  Camera:         'photo_camera',
  Sun:            'light_mode',
  Moon:           'dark_mode',
  User:           'person',
};

// ─── Icon wrapper ────────────────────────────────────────────────────────────
const IconBtn: React.FC<{ name: keyof typeof icons; size?: number; className?: string }> = ({
  name, size = 20, className = ''
}) => <Icon name={icons[name]} size={size} className={className} />;

// ─── Settings Row ─────────────────────────────────────────────────────────────
interface SettingsRowProps {
  name: keyof typeof icons;
  label: string;
  value?: string;
  onClick?: () => void;
  badge?: string;
  badgeColor?: string;
  danger?: boolean;
  toggleState?: boolean; // New Slide Toggle Switch!
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  name, label, value, onClick, badge, badgeColor = 'var(--lime)', danger, toggleState
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 p-4 rounded-2xl cursor-pointer
      hover:bg-[var(--surface-input)] active:scale-[0.98] transition-all
      ${danger ? 'text-red-400' : 'text-[var(--text-primary)]'}
    `}
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
        ${danger ? 'bg-red-500/10' : 'bg-[var(--surface-input)]'}`}
    >
      <IconBtn name={name} size={18} className={danger ? 'text-red-400' : 'text-[var(--text-muted)]'} />
    </div>
    <span className="flex-1 text-left text-sm font-semibold">{label}</span>
    {value && toggleState === undefined && <span className="text-xs text-[var(--text-muted)] mr-2 font-mono">{value}</span>}
    
    {toggleState !== undefined ? (
      /* Premium Slide Toggle Switch */
      <div 
        className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 relative border ${
          toggleState 
            ? 'bg-[var(--lime)] border-[var(--lime)]' 
            : 'bg-[var(--surface-elevated)] border-[var(--border-strong)]'
        }`}
      >
        <div 
          className={`w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
            toggleState ? 'translate-x-5 bg-white' : 'translate-x-0 bg-[var(--text-secondary)]'
          }`}
          style={{ marginTop: '1px' }}
        />
      </div>
    ) : badge ? (
      <span
        className="px-2 py-1 rounded-full text-[10px] font-bold text-[#0e0e0e] text-[var(--text-inverse)]"
        style={{ backgroundColor: badgeColor }}
      >
        {badge}
      </span>
    ) : (
      !danger && <Icon name="chevron_right" size={18} className="text-[var(--text-muted)]" />
    )}
  </button>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const isThai = lang === 'th';

  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const { theme, toggleTheme, isDark } = useTheme();
  const [userEmail, setUserEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  // Google Calendar connection state
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Simulate loading user — replace with actual supabase call when ready
    setUserEmail('user@dailystack.app');
    setNickname('DailyStarter');

    // Check Google Calendar connection on mount
    checkGoogleConnection();

    // Show success toast if returning from Google OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar') === 'connected') {
      setGoogleConnected(true);
      // Clean the URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkGoogleConnection = async () => {
    try {
      const { GoogleCalendarService } = await import('../../services/googleCalendarService');
      const connected = await GoogleCalendarService.isConnected();
      setGoogleConnected(connected);
    } catch {
      // Service not available yet — ignore
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600)); // replace with supabase update
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleGoogleConnect = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const { GoogleCalendarService } = await import('../../services/googleCalendarService');
      await GoogleCalendarService.connect();
      // Page will redirect — no need to set state here
    } catch (err: any) {
      setGoogleError(err?.message ?? 'Failed to connect');
      setGoogleLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    setGoogleLoading(true);
    try {
      const { GoogleCalendarService } = await import('../../services/googleCalendarService');
      await GoogleCalendarService.disconnect();
      setGoogleConnected(false);
    } catch (err: any) {
      setGoogleError(err?.message ?? 'Failed to disconnect');
    } finally {
      setGoogleLoading(false);
    }
  };

  const toggleNotifications = () => setNotificationsOn(!notificationsOn);
  const toggleDarkMode = () => toggleTheme();

  return (
    <Shell
      lang={lang}
      onLangChange={setLang}
      showNav
      showLangToggle
      showOrbs
    >
      <div className="px-5 pt-[calc(var(--safe-top)+16px)] pb-32">

        {/* ── Page Header ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8 animate-fade-up">
          {/* Back button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-[var(--surface-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Go back"
          >
            <IconBtn name="ChevronLeft" size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[var(--lime-glow-sm)] rounded-xl flex items-center justify-center border border-[var(--lime)]/10">
              <Icon name="settings" size={20} className="text-[var(--lime)]" />
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font)' }}>
              {isThai ? 'ตั้งค่า' : 'Settings'}
            </h1>
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-card)] border border-[var(--border-subtle)] mb-3">
            <Icon name="auto_awesome" size={12} className="text-[var(--lime)]" />
            <span className="text-[10px] font-mono font-semibold text-[var(--text-muted)] tracking-widest uppercase">
              {isThai ? 'การตั้งค่า' : 'CONFIGURATION'}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] mb-2"
            style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em' }}>
            {isThai ? 'ตั้งค่าบัญชี' : 'Account Settings'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {isThai
              ? 'จัดการโปรไฟล์และการตั้งค่าแอปของคุณ'
              : 'Manage your profile and app preferences'}
          </p>
          <div className="h-[2px] w-10 bg-[var(--lime)] rounded-full mt-3" />
        </div>

        {/* ── Profile Section ─────────────────────────────────────────── */}
        <section className="mb-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h2 className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">
            {isThai ? 'โปรไฟล์' : 'Profile'}
          </h2>

          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border-subtle)] overflow-hidden">
            {/* Avatar row */}
            <div className="p-5 flex items-center gap-4 border-b border-[var(--border-subtle)]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--surface-elevated)]">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--lime)] text-[var(--text-inverse)] flex items-center justify-center cursor-pointer hover:shadow-lg transition-all"
                >
                  <Icon name="photo_camera" size={14} className="text-[#0e0e0e]" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--text-primary)]">
                  {userEmail?.split('@')[0] || 'User'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">{userEmail}</p>
              </div>
            </div>

            {/* Nickname input */}
            <div className="p-5">
              <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 block">
                {isThai ? 'ชื่อที่แสดง' : 'Display Name'}
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoComplete="nickname"
                className="ds-input"
                placeholder={isThai ? 'กรอกชื่อของคุณ' : 'Enter your name'}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="ds-btn-primary ds-btn-sm"
                >
                  {loading ? (
                    <Icon name="progress_activity" size={16} className="animate-spin" />
                  ) : saved ? (
                    <>
                      <Icon name="check" size={16} />
                      {isThai ? 'บันทึกแล้ว!' : 'Saved!'}
                    </>
                  ) : (
                    <>
                      <Icon name="save" size={16} />
                      {isThai ? 'บันทึก' : 'Save'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Preferences Section ──────────────────────────────────────── */}
        <section className="mb-6 animate-fade-up" style={{ animationDelay: '180ms' }}>
          <h2 className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">
            {isThai ? 'การตั้งค่า' : 'Preferences'}
          </h2>

          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border-subtle)] overflow-hidden">
            <SettingsRow
              name="Globe"
              label={isThai ? 'ภาษา' : 'Language'}
              value={isThai ? 'ไทย' : 'English'}
              onClick={() => setLang(isThai ? 'en' : 'th')}
              badge={lang.toUpperCase()}
              badgeColor="var(--lime)"
            />
            <div className="border-t border-[var(--border-subtle)]" />
            <SettingsRow
              name="Bell"
              label={isThai ? 'การแจ้งเตือน' : 'Notifications'}
              onClick={toggleNotifications}
              toggleState={notificationsOn}
            />
            <div className="border-t border-[var(--border-subtle)]" />
            {mounted && (
              <SettingsRow
                name={isDark ? 'Moon' : 'Sun'}
                label={isThai ? 'โหมดมืด' : 'Dark Mode'}
                onClick={toggleDarkMode}
                toggleState={isDark}
              />
            )}
          </div>
        </section>

        {/* ── Security Section ─────────────────────────────────────────── */}
        <section className="mb-6 animate-fade-up" style={{ animationDelay: '240ms' }}>
          <h2 className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">
            {isThai ? 'ความปลอดภัย' : 'Security'}
          </h2>

          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border-subtle)] overflow-hidden">
            <SettingsRow
              name="Shield"
              label={isThai ? 'ความเป็นส่วนตัว' : 'Privacy'}
              onClick={() => {}}
            />
            <div className="border-t border-[var(--border-subtle)]" />
            <SettingsRow
              name="Mail"
              label={isThai ? 'อีเมล' : 'Email'}
              value={userEmail || ''}
              onClick={() => {}}
            />
            <div className="border-t border-[var(--border-subtle)]" />
            <SettingsRow
              name="Calendar"
              label={isThai ? 'วันที่เข้าร่วม' : 'Joined'}
              value={new Date().toLocaleDateString()}
              onClick={() => {}}
            />
          </div>
        </section>

        {/* ── Integrations Section ─────────────────────────────────────── */}
        <section className="mb-6 animate-fade-up" style={{ animationDelay: '250ms' }}>
          <h2 className="text-[10px] font-mono font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 pl-1">
            {isThai ? 'การเชื่อมต่อ' : 'Integrations'}
          </h2>

          <div className="bg-[var(--surface-card)] rounded-3xl border border-[var(--border-subtle)] overflow-hidden">
            {/* Google Calendar Row */}
            <button
              onClick={googleConnected ? handleGoogleDisconnect : handleGoogleConnect}
              disabled={googleLoading}
              className="w-full flex items-center gap-4 p-5 border-b border-[var(--border-subtle)] cursor-pointer hover:bg-[rgba(255,255,255,0.04)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Google Calendar
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {googleConnected
                    ? (isThai ? 'เชื่อมต่อแล้ว' : 'Connected')
                    : (isThai ? 'เชื่อมต่อเพื่อดึง events' : 'Connect to sync events')}
                </p>
              </div>
              {googleLoading ? (
                <Icon name="progress_activity" size={18} className="text-[var(--text-muted)] animate-spin" />
              ) : googleConnected ? (
                <div className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E]">
                  {isThai ? 'เชื่อมต่อแล้ว' : 'Connected'}
                </div>
              ) : (
                <div className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--lime)]/20 text-[var(--lime)]">
                  {isThai ? 'เชื่อมต่อ' : 'Connect'}
                </div>
              )}
            </button>

            {/* Sync status */}
            {googleConnected && (
              <div className="px-5 py-3 flex items-center gap-2 bg-[#22C55E]/5">
                <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <p className="text-xs text-[#22C55E] font-mono">
                  {isThai ? 'ซิงค์ events จาก Google Calendar' : 'Syncing events from Google Calendar'}
                </p>
              </div>
            )}

            {/* Error */}
            {googleError && (
              <div className="px-5 py-3 flex items-center gap-2 bg-red-500/5">
                <p className="text-xs text-red-400">{googleError}</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Danger Zone ─────────────────────────────────────────────── */}
        <section className="mb-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-[10px] font-mono font-semibold text-red-400 uppercase tracking-widest mb-3 pl-1">
            {isThai ? 'โซนอันตราย' : 'Danger Zone'}
          </h2>

          <div className="bg-[var(--surface-card)] rounded-3xl border border-red-500/20 overflow-hidden">
            <SettingsRow
              name="LogOut"
              label={isThai ? 'ออกจากระบบ' : 'Sign Out'}
              onClick={handleLogout}
              danger
            />
          </div>
        </section>

        {/* ── App Info ────────────────────────────────────────────────── */}
        <div className="text-center py-8 animate-fade-up" style={{ animationDelay: '360ms' }}>
          <p className="text-xs text-[var(--text-muted)] font-mono">
            DAILY<span className="text-[var(--lime)]">STACK</span> v1.0.0
          </p>
          <p className="text-[10px] text-[var(--text-muted)]/40 mt-1.5 font-mono">
            {isThai ? 'สร้างด้วย ❤️ สำหรับคุณ' : 'Made with ❤️ for you'}
          </p>
        </div>
      </div>
    </Shell>
  );
};

export { Settings };
export default Settings;
