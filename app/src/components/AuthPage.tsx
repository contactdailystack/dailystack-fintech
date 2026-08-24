/**
 * ============================================================
 * PicksWise — Auth Page v5.1
 * ============================================================
 * New Design (2026-06-15)
 * Based on dailystack_auth_screens.html
 *
 * Design Specs:
 * - Lime accent: #C9F135
 * - Dark: #111
 * - Font: Onest
 * - Bilingual-first UI (EN/TH via translations)
 */

import { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  User,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { signIn, signUp } from '../services/authService';
import { supabase } from '../supabaseClient';
import { translations, Language } from '../data/translations';
import { haptics } from '../services/hapticService';

interface AuthPageProps {
  onLoginSuccess: (email: string) => void;
  lang?: Language;
  /** Override the initial auth view: 'login' | 'register' | 'forgot' */
  defaultView?: 'login' | 'register' | 'forgot';
}

// ============================================================
// DESIGN TOKENS (Auth Page - Lime Theme)
// ============================================================
const tokens = {
  // Lime palette (Auth-specific)
  lime: '#C9F135',
  limeDark: '#B8E028',
  limeMuted: 'rgba(201, 241, 53, 0.3)',

  // Core colors
  dark: '#111111',
  darkSecondary: '#1A1A1A',
  white: '#FFFFFF',

  // Grays (aligned with design system)
  grayBg: '#F4F5F7',
  grayInput: '#E5E7EB',
  grayText: '#8E8E93',
  grayTextDark: '#6B7280',

  // Status colors (aligned with design system)
  success: '#10B981',
  error: '#EF4444',

  // Typography
  fontSize: { xs: '11px', sm: '13px', base: '14px', lg: '16px', xl: '24px' },
  fontEN: '"Inter", sans-serif',
  fontTH: '"Noto Sans Thai", sans-serif',
};

// ============================================================
// COMPONENT: Progress Dots
// ============================================================
function ProgressDots({ active }: { active: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3" style={{ backgroundColor: tokens.grayBg }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            width: i === active ? '20px' : '6px',
            height: '6px',
            borderRadius: i === active ? '3px' : '50%',
            backgroundColor: i === active ? tokens.dark : tokens.grayInput,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// COMPONENT: Input Field (New Design)
// ============================================================
interface InputFieldProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete?: string;
  icon?: React.ReactNode;
  error?: string | null;
  disabled?: boolean;
  id?: string;
}

function InputField({ type, value, onChange, placeholder, autoComplete, icon, error, disabled, id }: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const isFilled = value.length > 0;
  const hasIcon = !!icon;

  return (
    <div className="relative">
      <div className="relative">
        {hasIcon && (
          <div
            className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: isFocused ? tokens.dark : tokens.grayText }}
          >
            {icon}
          </div>
        )}

        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: tokens.white,
            border: `1.5px solid ${error ? tokens.error : isFocused ? tokens.dark : isFilled ? tokens.dark : tokens.grayInput}`,
            borderRadius: '100px',
            padding: '16px 24px',
            paddingLeft: hasIcon ? '48px' : '24px',
            paddingRight: isPassword ? '56px' : '24px',
            fontSize: tokens.fontSize.base,
            fontFamily: '"Inter", sans-serif',
            color: tokens.dark,
            outline: 'none',
            boxShadow: isFocused ? `0 0 0 3px ${error ? 'rgba(220, 38, 38, 0.15)' : 'rgba(201, 241, 53, 0.3)'}` : 'none',
          }}
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>

      {isPassword && (
        <button
          type="button"
          onClick={() => { haptics.fire('SELECT'); setShowPassword(!showPassword); }}
          className="absolute right-5 top-1/2 -translate-y-1/2 p-1"
          style={{ minWidth: '32px', minHeight: '32px' }}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff size={16} style={{ color: tokens.grayText }} />
          ) : (
            <Eye size={16} style={{ color: tokens.grayText }} />
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs" style={{ color: tokens.error, fontFamily: '"Inter", sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// COMPONENT: Primary Button (Pill Shape)
// ============================================================
interface PrimaryButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'dark' | 'lime';
  reduceMotion?: boolean;
}

function PrimaryButton({ type = 'submit', onClick, loading, disabled, children, variant = 'dark', reduceMotion }: PrimaryButtonProps) {
  const isLime = variant === 'lime';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      whileTap={reduceMotion || loading || disabled ? undefined : { scale: 0.98 }}
      className="w-full flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        backgroundColor: isLime ? tokens.lime : tokens.dark,
        color: isLime ? tokens.dark : tokens.white,
        border: 'none',
        borderRadius: '100px',
        padding: '16px',
        fontSize: tokens.fontSize.base,
        fontWeight: 700,
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {loading ? (
        <RefreshCw size={18} className="animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}

// ============================================================
// COMPONENT: Secondary Button (New Design)
// ============================================================
interface SecondaryButtonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function SecondaryButton({ onClick, loading, disabled, children, icon }: SecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: 'transparent',
        color: tokens.dark,
        border: `1.5px solid ${tokens.grayInput}`,
        borderRadius: '100px',
        padding: '15px',
        fontSize: tokens.fontSize.base,
        fontWeight: 700,
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {loading ? (
        <RefreshCw size={16} className="animate-spin" />
      ) : (
        <>
          {icon && <span style={{ display: 'flex' }}>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

// ============================================================
// COMPONENT: Nav Back Button
// ============================================================
function NavBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
      style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}
      aria-label="Go back"
    >
      <ArrowLeft size={16} style={{ color: tokens.dark }} strokeWidth={2.5} />
    </button>
  );
}

// ============================================================
// COMPONENT: Success Animation
// ============================================================
interface SuccessAnimationProps {
  onComplete: () => void;
  successTitle: string;
  successSubtitle: string;
  reduceMotion?: boolean;
}

function SuccessAnimation({ onComplete, successTitle, successSubtitle, reduceMotion }: SuccessAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: tokens.dark }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 375),
              y: -20,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 0.5,
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: tokens.lime }}
          />
        ))}
      </div>

      <motion.div
        initial={reduceMotion ? undefined : { scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div
          className="w-20 h-20 rounded-[16px] flex items-center justify-center"
          style={{ backgroundColor: tokens.lime }}
        >
          <Check size={28} style={{ color: tokens.dark }} strokeWidth={3} />
        </div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { delay: 0.5 }}
        className="mt-6 text-center"
      >
        <h2
          className="font-bold text-2xl mb-2"
          style={{ color: tokens.white, fontFamily: '"Inter", sans-serif' }}
        >
          {successTitle}
        </h2>
        <p
          className="text-sm"
          style={{ color: 'rgba(255,255,255,0.6)', fontFamily: '"Inter", sans-serif' }}
        >
          {successSubtitle}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT: AuthPage
// ============================================================
export default function AuthPage({ onLoginSuccess, lang = 'en', defaultView = 'login' }: AuthPageProps) {
  const t = translations[lang];
  const reduceMotion = useReducedMotion() ?? false;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authView, setAuthView] = useState<'login' | 'register' | 'success' | 'forgot'>(defaultView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, email, password, fullName]);

  // Validation
  const getFieldError = (field: 'email' | 'password' | 'name', value?: string) => {
    if (field === 'email') {
      if (!value) return lang === 'th' ? 'กรุณากรอกอีเมล' : 'Please enter your email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return lang === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format';
    }
    if (field === 'password') {
      if (!value) return lang === 'th' ? 'กรุณากรอกรหัสผ่าน' : 'Please enter your password';
      if (authView === 'register' && value.length < 8) return lang === 'th' ? 'รหัสผ่านต้องมีความยาว 8 ตัวอักษรขึ้นไป' : 'Password must be at least 8 characters';
    }
    if (field === 'name') {
      if (!value) return lang === 'th' ? 'กรุณากรอกชื่อ-นามสกุล' : 'Please enter your full name';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.fire('SELECT');

    setError(null);

    const emailError = getFieldError('email', email);
    const passwordError = getFieldError('password', password);
    const nameError = authView === 'register' ? getFieldError('name', fullName) : null;

    if (emailError || passwordError || nameError) {
      if (emailError) setError(emailError);
      else if (passwordError) setError(passwordError);
      else if (nameError) setError(nameError);
      haptics.fire('ERROR_REJECT');
      return;
    }

    setLoading(true);

    try {
      if (authView === 'register') {
        const result = await signUp({ email, password, fullName });
        if (result.success) {
          navigateToDashboard();
        } else {
          setError(result.error || (lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Something went wrong. Please try again.'));
          haptics.fire('ERROR_REJECT');
        }
      } else {
        const result = await signIn(email, password);
        if (result.success) {
          navigateToDashboard();
        } else {
          if (result.error?.toLowerCase().includes('password')) {
            setError(lang === 'th' ? 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' : 'Incorrect password. Please try again.');
          } else if (result.error?.toLowerCase().includes('email')) {
            setError(lang === 'th' ? 'ไม่พบอีเมลนี้ในระบบ กรุณาสมัครสมาชิก' : 'Email not found. Please sign up.');
          } else {
            setError(result.error || (lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Something went wrong. Please try again.'));
          }
          haptics.fire('ERROR_REJECT');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    haptics.fire('SELECT');
    setAuthView('register');
    setError(null);
    setEmail('');
    setPassword('');
  };

  const handleSwitchToLogin = () => {
    haptics.fire('SELECT');
    setAuthView('login');
    setError(null);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const handleSocialLogin = async () => {
    haptics.fire('SELECT');
    setSocialLoading('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        haptics.fire('ERROR_REJECT');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSuccessComplete = () => { onLoginSuccess(email); };
  const navigateToDashboard = () => { onLoginSuccess(email); };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.fire('SELECT');
    if (!email) {
      setError(lang === 'th' ? 'กรุณากรอกอีเมลของคุณ' : 'Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (resetError) {
        setError(resetError.message);
        haptics.fire('ERROR_REJECT');
      } else {
        setForgotSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    haptics.fire('SELECT');
    setAuthView('login');
    setEmail('');
    setPassword('');
    setError(null);
    setForgotSent(false);
  };

  // Google icon SVG
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  // ---- Helper for bilingual labels ----
  // Supports both plain strings and JSX nodes
  const label = (en: React.ReactNode, th?: React.ReactNode): React.ReactNode =>
    th ? (lang === 'th' ? th : en) : en;

  return (
    <>
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {authView === 'success' && (
          <SuccessAnimation
            onComplete={handleSuccessComplete}
            successTitle={t.authSuccess.title}
            successSubtitle={t.authSuccess.subtitle}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>

      {/* ==================== LOGIN SCREEN ==================== */}
      {authView === 'login' && (
        <div
          className="min-h-screen min-h-[100dvh] flex flex-col"
          style={{
            backgroundColor: tokens.lime,
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Hero Section */}
          <div className="px-6 py-7" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 28px)' }}>
            <h1
              className="font-black leading-[1.1]"
              style={{
                fontSize: '38px',
                letterSpacing: '-0.02em',
                color: tokens.dark,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {label(
                <>Decide your wealth with <span style={{ color: 'rgba(11, 11, 11, 0.5)' }}>absolute</span><br />intelligence.</>,
                <>ตัดสินใจเรื่องเงินของคุณ<br />ด้วย<span style={{ color: 'rgba(11, 11, 11, 0.5)' }}>สติปัญญา</span>ที่แม่นยำ</>
              )}
            </h1>
          </div>

          {/* Form Section */}
          <div
            className="flex-1 rounded-t-[40px] overflow-hidden"
            style={{ backgroundColor: tokens.white }}
          >
            <div className="max-w-[360px] mx-auto">
              <form
                onSubmit={handleSubmit}
                className="p-5 space-y-3"
                style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
              >
                {/* Email Field */}
                <div>
                  <label
                    className="block mb-1.5"
                    style={{
                      fontSize: tokens.fontSize.xs,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: tokens.dark,
                      opacity: 0.45,
                      fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN,
                    }}
                  >
                    {label('Email')}
                  </label>
                  <InputField
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={String(label('you@example.com', 'อีเมล@บริษัท.com'))}
                    autoComplete="email"
                    id="login-email"
                    icon={<Mail size={18} />}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    className="block mb-1.5"
                    style={{
                      fontSize: tokens.fontSize.xs,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: tokens.dark,
                      opacity: 0.45,
                      fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN,
                    }}
                  >
                    {label('Password')}
                  </label>
                  <InputField
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={String(label('Password'))}
                    autoComplete="current-password"
                    id="login-password"
                    icon={<Lock size={18} />}
                  />
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                      role="alert"
                    >
                      <AlertCircle size={16} style={{ color: tokens.error }} />
                      <span className="text-xs" style={{ color: tokens.error, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forgot Password */}
                <div className="text-right -mt-1">
                  <button
                    type="button"
                    className="text-xs font-bold underline underline-offset-2"
                    style={{ color: tokens.dark, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}
                    onClick={() => { haptics.fire('SELECT'); setAuthView('forgot'); setError(null); }}
                  >
                    {label('Forgot Password?', 'ลืมรหัสผ่าน?')}
                  </button>
                </div>

                {/* Submit Button */}
                <PrimaryButton type="submit" loading={loading} reduceMotion={reduceMotion}>
                  {label('Sign In ', 'เข้าสู่ระบบ ')}<ArrowRight size={16} style={{ display: 'inline' }} />
                </PrimaryButton>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px" style={{ backgroundColor: '#E8E8E4' }} />
                  <span style={{ fontSize: '12px', color: tokens.grayText, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}>{label('Or')}</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: '#E8E8E4' }} />
                </div>

                {/* Google Login */}
                <SecondaryButton onClick={handleSocialLogin} loading={socialLoading === 'google'} icon={<GoogleIcon />}>
                  {label('Continue with Google', 'ดำเนินการต่อด้วย Google')}
                </SecondaryButton>

                {/* Switch to Register */}
                <p
                  className="text-center mt-4"
                  style={{ fontSize: tokens.fontSize.sm, color: tokens.grayText, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}
                >
                  {label("Don't have an account? ", 'ยังไม่มีบัญชี? ')}
                  <button type="button" onClick={handleSwitchToRegister} className="font-bold underline underline-offset-2" style={{ color: tokens.dark }}>
                    {label('Sign Up', 'สมัครสมาชิก')}
                  </button>
                </p>
              </form>
            </div>

            {/* Progress Dots */}
            <ProgressDots active={0} />
          </div>
        </div>
      )}

      {/* ==================== FORGOT PASSWORD SCREEN ==================== */}
      {authView === 'forgot' && (
        <div
          className="min-h-screen min-h-[100dvh] flex flex-col"
          style={{
            backgroundColor: tokens.dark,
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Nav Bar */}
          <div
            className="px-5 py-2.5 flex items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <NavBackButton onClick={handleBackToLogin} />
          </div>

          {/* Hero Section */}
          <div className="px-6 py-4" style={{ paddingTop: '16px' }}>
            <h1
              className="font-black leading-[1.1]"
              style={{
                fontSize: '32px',
                letterSpacing: '-0.02em',
                color: tokens.white,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {label('Reset your\npassword', 'รีเซ็ต\nรหัสผ่านของคุณ')}
            </h1>
            <p
              className="mt-3"
              style={{
                fontSize: tokens.fontSize.sm,
                color: tokens.white,
                opacity: 0.55,
                fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN,
              }}
            >
              {forgotSent
                ? label('Check your email for a reset link.', 'ตรวจสอบอีเมลของคุณเพื่อกดลิงก์รีเซ็ตรหัสผ่าน')
                : label("Enter your email and we'll send you a reset link.", 'กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้')}
            </p>
          </div>

          {/* Form Section */}
          <div
            className="flex-1 rounded-t-[40px] overflow-hidden"
            style={{ backgroundColor: tokens.grayBg }}
          >
            <div className="max-w-[360px] mx-auto">
              {forgotSent ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#10B981' }}
                  >
                    <Check size={24} style={{ color: tokens.white }} />
                  </div>
                  <h2
                    className="font-bold text-lg mb-2"
                    style={{ color: tokens.dark, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}
                  >
                    {label('Email Sent!', 'ส่งอีเมลแล้ว!')}
                  </h2>
                  <p
                    className="text-sm mb-6"
                    style={{ color: tokens.grayText, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}
                  >
                    {label(
                      <>If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.</>,
                      <>หากมีบัญชีของ <strong>{email}</strong> อยู่ในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านทางอีเมลโดยเร็วที่สุด</>
                    )}
                  </p>
                  <PrimaryButton onClick={handleBackToLogin} reduceMotion={reduceMotion}>
                    {label('Back to Login', 'กลับไปหน้าเข้าสู่ระบบ')}
                  </PrimaryButton>
                </div>
              ) : (
                <form
                  onSubmit={handleForgotPassword}
                  className="p-5 space-y-3"
                  style={{ paddingTop: '20px' }}
                >
                  {/* Email Field */}
                  <div>
                    <label
                      className="block mb-1.5"
                      style={{
                        fontSize: tokens.fontSize.xs,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: tokens.dark,
                        opacity: 0.45,
                        fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN,
                      }}
                    >
                      {label('Email')}
                    </label>
                    <InputField
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    placeholder={String(label('you@example.com', 'อีเมล@บริษัท.com'))}
                      autoComplete="email"
                      id="forgot-email"
                      icon={<Mail size={18} />}
                    />
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                        role="alert"
                      >
                        <AlertCircle size={16} style={{ color: tokens.error }} />
                        <span className="text-xs" style={{ color: tokens.error, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <PrimaryButton type="submit" loading={loading} reduceMotion={reduceMotion}>
                    {label('Send Reset Link', 'ส่งลิงก์รีเซ็ตรหัสผ่าน')}
                  </PrimaryButton>

                  <p className="text-center -mt-1">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="font-bold underline underline-offset-2"
                      style={{ color: tokens.dark, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}
                    >
                      {label('Back to Login', 'กลับไปหน้าเข้าสู่ระบบ')}
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== REGISTER SCREEN ==================== */}
      {authView === 'register' && (
        <div
          className="min-h-screen min-h-[100dvh] flex flex-col"
          style={{
            backgroundColor: tokens.dark,
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Nav Bar */}
          <div
            className="px-5 py-2.5 flex items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <NavBackButton onClick={handleSwitchToLogin} />
          </div>

          {/* Hero Section */}
          <div className="px-6 py-4" style={{ paddingTop: '16px' }}>
            <h1
              className="font-black leading-[1.1]"
              style={{
                fontSize: '32px',
                letterSpacing: '-0.02em',
                color: tokens.white,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {label(
                <>Decide your wealth with <span style={{ color: 'rgba(255,255,255,0.5)' }}>absolute</span><br />intelligence.</>,
                <>ตัดสินใจเรื่องเงินของคุณ<br />ด้วย<span style={{ color: 'rgba(255,255,255,0.5)' }}>สติปัญญา</span>ที่แม่นยำ</>
              )}
            </h1>

            <p
              className="mt-3"
              style={{
                fontSize: tokens.fontSize.sm,
                color: tokens.white,
                opacity: 0.55,
                fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN,
              }}
            >
              {label('One purchase. Lifetime access.', 'จ่ายครั้งเดียว เข้าถึงตลอดชีพ')}
            </p>
          </div>

          {/* Form Section */}
          <div
            className="flex-1 rounded-t-[40px] overflow-hidden"
            style={{ backgroundColor: tokens.grayBg }}
          >
            <div className="max-w-[360px] mx-auto">
              <form
                onSubmit={handleSubmit}
                className="p-5 space-y-3"
                style={{ paddingTop: '20px' }}
              >
                {/* Name Field */}
                <div>
                  <label
                    className="block mb-1.5"
                    style={{
                      fontSize: tokens.fontSize.xs,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: tokens.dark,
                      opacity: 0.45,
                      fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN,
                    }}
                  >
                    {label('Full Name', 'ชื่อ-นามสกุล')}
                  </label>
                  <InputField
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={String(label('John Doe', 'ชื่อ-นามสกุล'))}
                    autoComplete="name"
                    id="register-name"
                    icon={<User size={18} />}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    className="block mb-1.5"
                    style={{
                      fontSize: tokens.fontSize.xs,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: tokens.dark,
                      opacity: 0.45,
                      fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN,
                    }}
                  >
                    {label('Email')}
                  </label>
                  <InputField
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={String(label('you@example.com', 'อีเมล@บริษัท.com'))}
                    autoComplete="email"
                    id="register-email"
                    icon={<Mail size={18} />}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    className="block mb-1.5"
                    style={{
                      fontSize: tokens.fontSize.xs,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: tokens.dark,
                      opacity: 0.45,
                      fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN,
                    }}
                  >
                    {label('Password', 'รหัสผ่าน')}
                  </label>
                  <InputField
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={String(label('Minimum 8 characters', 'รหัสผ่านอย่างน้อย 8 ตัวอักษร'))}
                    autoComplete="new-password"
                    id="register-password"
                    icon={<Lock size={18} />}
                  />
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                      role="alert"
                    >
                      <AlertCircle size={16} style={{ color: tokens.error }} />
                      <span className="text-xs" style={{ color: tokens.error, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <PrimaryButton type="submit" loading={loading} variant="lime" reduceMotion={reduceMotion}>
                  {label('Create Account ', 'สร้างบัญชี ')}<ArrowRight size={16} style={{ display: 'inline' }} />
                </PrimaryButton>

                {/* Terms */}
                <p
                  className="text-center text-[11px] leading-relaxed"
                  style={{ color: tokens.grayText, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}
                >
                  {label(
                    <>By signing up, you agree to our<br /><span className="font-bold" style={{ color: tokens.dark }}>Privacy Policy</span> and <span className="font-bold" style={{ color: tokens.dark }}>Terms of Service</span></>,
                    <>การสมัครสมาชิกถือว่าคุณยอมรับ<br /><span className="font-bold" style={{ color: tokens.dark }}>นโยบายความเป็นส่วนตัว</span> และ <span className="font-bold" style={{ color: tokens.dark }}>ข้อกำหนดการใช้งาน</span></>
                  )}
                </p>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px" style={{ backgroundColor: '#E8E8E4' }} />
                  <span style={{ fontSize: '12px', color: tokens.grayText, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}>{label('Already have an account?', 'มีบัญชีอยู่แล้ว?')}</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: '#E8E8E4' }} />
                </div>

                {/* Switch to Login */}
                <p className="text-center -mt-2">
                  <button
                    type="button"
                    onClick={handleSwitchToLogin}
                    className="font-bold underline underline-offset-2"
                    style={{ color: tokens.dark, fontFamily: lang === 'th' ? tokens.fontTH : tokens.fontEN }}
                  >
                    {label('Sign In', 'เข้าสู่ระบบ')}
                  </button>
                </p>
              </form>
            </div>

            {/* Progress Dots */}
            <ProgressDots active={1} />
          </div>
        </div>
      )}
    </>
  );
}
