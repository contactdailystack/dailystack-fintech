/**
 * ================================================================
 * DailyStack — Design System Components v7.1
 * ================================================================
 * Premium Mobile-first Design System
 */

import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { AuthService } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { 
  Home, CheckSquare, TrendingUp, Settings,
  Home as HomeFilled, CheckSquare as CheckFilled, 
  TrendingUp as TrendFilled, Settings as SettingsFilled
} from 'lucide-react';

/* ── Font preload ─────────── */
const FontLoader: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `}</style>
);

/* ── Atmospheric Orbs ──────── */
export const Orbs: React.FC<{ hideOnSmall?: boolean; theme?: string }> = ({ hideOnSmall, theme }) => {
  return (
    <>
      <div
        className={`ds-orb ds-orb-primary ds-orb-md ${hideOnSmall ? 'hidden sm:block' : ''}`}
        style={{ top: '-20%', left: '-10%' }}
      />
      <div
        className={`ds-orb ds-orb-secondary ds-orb-lg ${hideOnSmall ? 'hidden sm:block' : ''}`}
        style={{ bottom: '-20%', right: '-10%', animationDelay: '-5s' }}
      />
    </>
  );
};

/* ── Language Toggle ──────── */
export const LangToggle: React.FC<{ lang: 'en' | 'th'; onChange: (l: 'en' | 'th') => void }> = ({ lang, onChange }) => (
  <div className="ds-lang-toggle">
    {(['en', 'th'] as const).map(l => (
      <button
        key={l}
        onClick={() => onChange(l)}
        className={`ds-lang-btn ${lang === l ? 'active' : ''}`}
      >
        {l === 'en' ? 'EN' : 'TH'}
      </button>
    ))}
  </div>
);

/* ── Breadcrumbs ──────────── */
export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  if (pathnames.length === 0) return null;
  
  return (
    <nav className="ds-breadcrumbs">
      <Link to="/">Home</Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return isLast ? (
          <span key={name}>/{name}</span>
        ) : (
          <React.Fragment key={name}>
            <span>/</span>
            <Link to={routeTo}>{name}</Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

/* ── Interfaces ──────────── */
interface AnimatedProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  iconFilled?: string;
}

interface ProgressBarProps {
  value: number;
  label?: string;
  style?: React.CSSProperties;
  color?: string;
}

interface BadgeProps {
  variant?: 'neon' | 'dark' | 'gradient' | 'lime' | 'success';
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface IconBtnProps {
  icon: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'neon';
}

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  elevated?: boolean;
  onClick?: () => void;
}

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface DividerProps {
  label?: string;
  className?: string;
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode;
}

interface ShellProps {
  children: React.ReactNode;
  showNav?: boolean;
  showLangToggle?: boolean;
  onLangChange?: (lang: 'en' | 'th') => void;
  lang?: 'en' | 'th';
  showOrbs?: boolean;
  showBack?: boolean;
  onBack?: () => void | Promise<any>;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

/* ── Page Transitions ──────── */
export const PageTransition: React.FC<AnimatedProps> = ({ children, className = '', style }) => (
  <div className={`page-transition ${className}`} style={style}>
    {children}
  </div>
);

/* ── Floating Bottom Nav ──── */
const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Home', icon: 'home', iconFilled: 'home' },
  { path: '/todo', label: 'Tasks', icon: 'checklist', iconFilled: 'task_alt' },
  { path: '/value', label: 'Value', icon: 'trending', iconFilled: 'trending' },
  { path: '/settings', label: 'Settings', icon: 'settings', iconFilled: 'settings' },
];

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard', todo: 'Tasks', dating: 'Dating', discover: 'Discover',
  matches: 'Matches', match: 'Match', chat: 'Chat',
  compatibility: 'Compatibility', value: 'Value',
  settings: 'Settings', profile: 'Profile',
  onboarding: 'Welcome', 'social-auth': 'Connect',
};

export const FloatingNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Icon mapping
  const iconMap: Record<string, { active: React.ReactNode; inactive: React.ReactNode }> = {
    home: { active: <HomeFilled size={20} />, inactive: <Home size={20} /> },
    checklist: { active: <CheckFilled size={20} />, inactive: <CheckSquare size={20} /> },
    trending: { active: <TrendFilled size={20} />, inactive: <TrendingUp size={20} /> },
    settings: { active: <SettingsFilled size={20} />, inactive: <Settings size={20} /> },
  };
  
  return (
    <nav 
      className="ds-bottom-nav"
      style={{
        background: '#C7FF2E',
        padding: '12px 24px 20px',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const icons = iconMap[item.icon] || { active: null, inactive: null };
        
        return (
          <button
            key={item.path}
            className="ds-nav-item"
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            title={item.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              borderRadius: '16px',
              transition: 'all 0.2s ease',
              background: 'transparent',
            }}
          >
            <div 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? '#111111' : 'transparent',
                color: isActive ? '#FFFFFF' : '#111111',
                transition: 'all 0.2s ease',
              }}
            >
              {isActive ? icons.active : icons.inactive}
            </div>
            <span 
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#111111',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

/* ── Progress Bar ─────────── */
export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, style, color }) => (
  <div className="ds-progress-bar-container" style={style}>
    {label && <span className="ds-progress-bar-label">{label}</span>}
    <div className="ds-progress-bar-track">
      <div
        className="ds-progress-bar-fill"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color || 'var(--neon)',
        }}
      />
    </div>
  </div>
);

/* ── Status Dot ──────────── */
export const StatusDot: React.FC<{ pulse?: boolean; color?: string }> = ({ pulse = true, color = 'var(--neon)' }) => (
  <span className={`ds-status-dot ${pulse ? 'pulse' : ''}`} style={{ background: color }} />
);

/* ── Animated wrappers ─────── */
export const FadeUp: React.FC<AnimatedProps> = ({ children, className = '', style, delay = 0 }) => (
  <div
    className={className}
    style={{ animation: `dsFadeUp 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`, ...style }}
  >
    {children}
  </div>
);

export const ScaleIn: React.FC<AnimatedProps> = ({ children, className = '', style, delay = 0 }) => (
  <div
    className={className}
    style={{ animation: `dsScaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both`, ...style }}
  >
    {children}
  </div>
);

export const SlideInRight: React.FC<AnimatedProps> = ({ children, className = '', style, delay = 0 }) => (
  <div
    className={className}
    style={{ animation: `dsSlideInRight 0.4s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`, ...style }}
  >
    {children}
  </div>
);

/* ── Badge ──────────────── */
export const Badge: React.FC<BadgeProps> = ({ variant = 'dark', children, className = '', style }) => (
  <span className={`ds-badge ds-badge-${variant} ${className}`} style={style}>
    {children}
  </span>
);

/* ── Icon Button ─────────── */
export const IconBtn: React.FC<IconBtnProps> = ({ icon, onClick, className = '', style, label, size = 'md', variant = 'default' }) => (
  <button
    className={`ds-icon-btn ds-icon-btn-${size} ds-icon-btn-${variant} ${className}`}
    onClick={onClick}
    style={style}
    aria-label={label}
  >
    <span className="material-symbols-outlined">{icon}</span>
  </button>
);

/* ── OTP Input ───────────── */
export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, onComplete, length = 6 }) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    
    const newValue = value.split('');
    newValue[index] = val;
    onChange(newValue.join(''));
    
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (newValue.join('').length === length && onComplete) {
      onComplete(newValue.join(''));
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  return (
    <div className="ds-otp-container">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          maxLength={1}
          inputMode="numeric"
          type="text"
          className="ds-otp-cell"
        />
      ))}
    </div>
  );
};

/* ── Shared translations ──── */
export const T = {
  en: { home: 'Home', discover: 'Discover', stack: 'Stack', profile: 'Profile' },
  th: { home: 'หน้าแรก', discover: 'ค้นพบ', stack: 'สเต็ก', profile: 'โปรไฟล์' },
};

/* ── Button ─────────────── */
export const Button: React.FC<ButtonProps> = ({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, loading = false, fullWidth = false,
  className = '', style, type = 'button',
}) => (
  <button
    type={type}
    className={`ds-btn ds-btn-${variant} ds-btn-${size} ${fullWidth ? 'ds-btn-full' : ''} ${className}`}
    onClick={onClick}
    disabled={disabled || loading}
    style={style}
  >
    {loading ? <span className="ds-spinner" /> : children}
  </button>
);

export const SecondaryButton: React.FC<ButtonProps> = (props) => <Button {...props} variant="secondary" />;
export const DangerButton: React.FC<ButtonProps> = (props) => <Button {...props} variant="danger" />;

/* ── Empty State ─────────── */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'inbox', title, description, action }) => (
  <div className="ds-empty-state">
    <span className="material-symbols-outlined ds-empty-icon">{icon}</span>
    <h3 className="ds-empty-title">{title}</h3>
    {description && <p className="ds-empty-desc">{description}</p>}
    {action && <Button variant="secondary" onClick={action.onClick}>{action.label}</Button>}
  </div>
);

/* ── Skeleton ───────────── */
export const SkeletonLoader: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 'var(--radius-sm)', className = '' }) => (
  <div className={`ds-skeleton ${className}`} style={{ width, height, borderRadius }} />
);

export const SkeletonCard: React.FC = () => (
  <div className="ds-skeleton-card">
    <SkeletonLoader height={160} />
    <div className="ds-skeleton-content">
      <SkeletonLoader width="70%" height={20} />
      <SkeletonLoader width="40%" height={16} />
    </div>
  </div>
);

/* ── Spinner ────────────── */
export const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'var(--neon)' }) => (
  <div className="ds-spinner" style={{ width: size, height: size, borderColor: `${color}30`, borderTopColor: color }} />
);

/* ── Card ──────────────── */
export const Card: React.FC<CardProps> = ({ children, className = '', style, elevated = false, onClick }) => (
  <div className={`ds-card ${elevated ? 'ds-card-elevated' : ''} ${className}`} style={style} onClick={onClick}>
    {children}
  </div>
);

/* ── Input ─────────────── */
export const Input: React.FC<InputProps> = ({ type = 'text', placeholder, value, onChange, error, label, disabled = false, className = '', style }) => (
  <div className={`ds-input-wrapper ${className}`}>
    {label && <label className="ds-input-label">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`ds-input ${error ? 'ds-input-error' : ''}`}
      style={style}
    />
    {error && <span className="ds-input-error-text">{error}</span>}
  </div>
);

/* ── Divider ────────────── */
export const Divider: React.FC<DividerProps> = ({ label, className = '' }) => (
  <div className={`ds-divider ${className}`}>
    {label ? (
      <>
        <span className="ds-divider-line" />
        <span className="ds-divider-label">{label}</span>
        <span className="ds-divider-line" />
      </>
    ) : (
      <span className="ds-divider-line" />
    )}
  </div>
);

/* ── Section Header ─────── */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon, children }) => (
  <div className="ds-section-header">
    {icon && (
      <div className="ds-section-icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    )}
    <h2 className="ds-heading-section" style={{ marginBottom: subtitle ? 'var(--space-2)' : 0 }}>
      {title}
    </h2>
    {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{subtitle}</p>}
    {children && <div style={{ marginTop: 'var(--space-4)' }}>{children}</div>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
 * SHELL — Main App Wrapper
 * ═══════════════════════════════════════════════════════════════════ */
const Shell: React.FC<ShellProps> = ({
  children, showNav = true, showLangToggle = true, onLangChange,
  title, className = '', style,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const [lang, setLang] = useState<'en' | 'th'>(language ?? 'en');
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    if (language) setLang(language);
  }, [language]);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLangChange = (l: 'en' | 'th') => {
    setLang(l);
    setLanguage?.(l);
    onLangChange?.(l);
  };
  
  return (
    <div className={`phone-frame ${className}`} data-theme={theme} style={{ background: 'var(--bg-base)', ...style }}>
      <FontLoader />
      <Orbs theme={theme} />
      
      <header className={`ds-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="ds-header-inner">
          {location.pathname !== '/dashboard' && (
            <button className="ds-btn-icon" onClick={() => navigate(-1)} aria-label="Go back">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          
          {title ? (
            <h1 className="ds-header-title">{title}</h1>
          ) : (
            <span className="ds-header-logo">
              DAILY
              <span className="ml-2 inline-flex items-center rounded-full bg-[var(--neon-surface)] px-2 py-1 text-[var(--text-primary)]">
                STACK
              </span>
            </span>
          )}
          
          <div style={{ pointerEvents: 'auto', display: 'flex', gap: 8 }}>
            {showLangToggle && onLangChange && (
              <LangToggle lang={lang} onChange={handleLangChange} />
            )}
          </div>
        </div>
      </header>
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
      
      {showNav && <FloatingNav />}
    </div>
  );
};

export default Shell;
export { Shell };
