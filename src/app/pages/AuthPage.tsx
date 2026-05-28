/**
 * DailyStack — Auth Page (v3.1)
 * Redesigned to match GiGi Energy Reference:
 * - White background with gradient
 * - Bold typography, large headers
 * - Animated floating circles
 * - Lime Green (#AFFF00) accent
 * - Primary CTA with shine effect
 * 
 * Features:
 * - Sign Up with OTP (primary)
 * - Sign In with Password (secondary)
 * - Multi-language (EN/TH)
 * - Animated entrance effects
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { 
  Globe, Mail, Lock, Eye, EyeOff, ArrowRight, 
  CheckCircle2, Fingerprint, Shield, Sparkles, ArrowLeft, Zap
} from 'lucide-react';

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
const DailyStackLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative">
      {/* Glow */}
      <div className="absolute inset-0 bg-[var(--brand-500)] blur-xl opacity-20 rounded-full" />
      {/* Logo mark */}
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
        <defs>
          <linearGradient id="ds-grad-auth" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand-500)" />
            <stop offset="100%" stopColor="var(--brand-600)" />
          </linearGradient>
        </defs>
        <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#ds-grad-auth)" opacity="0.55" />
        <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#ds-grad-auth)" opacity="0.78" />
        <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#ds-grad-auth)" />
        <path d="M50 29 L72 39 L50 47 L28 39 Z" fill="#0D1117" opacity="0.25" />
      </svg>
    </div>
    <div>
      <span className="text-xl font-black tracking-[0.12em] text-[var(--brand-ink)]">
        DAILY<span className="text-[var(--brand-500)]">STACK</span>
      </span>
      <span className="block text-[10px] text-[var(--semantic-muted)] tracking-wider -mt-1">Your Intentional Life</span>
    </div>
  </div>
);

// ─── Badge Label ───────────────────────────────────────────────────────────────
const BadgeLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="inline-flex items-center gap-2 bg-[var(--brand-ink)] text-[var(--semantic-inverse)] px-4 py-2 rounded-full text-xs font-mono tracking-wider">
    <span 
      className="w-2 h-2 bg-[var(--brand-500)] rounded-full animate-pulse"
    />
    {children}
  </div>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryButton: React.FC<{
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ children, loading, disabled, onClick, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      relative w-full py-4 px-6 rounded-full font-bold text-base tracking-wide
      bg-[var(--brand-500)] text-[var(--brand-ink)]
      shadow-[0_4px_16px_rgba(170,255,0,0.3)]
      hover:shadow-[0_8px_32px_rgba(170,255,0,0.4)]
      hover:-translate-y-[2px] active:translate-y-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
      transition-all duration-300
      overflow-hidden
      ${className}
    `}
  >
    {/* Shine sweep effect */}
    <span 
      className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        transform: 'skewX(-20deg) translateX(-150%)',
      }}
      data-shine
    />
    <span className="relative z-10 flex items-center justify-center gap-2">
      {loading ? (
        <>
          <span className="w-5 h-5 border-2 border-[var(--brand-ink)]/30 border-t-[var(--brand-ink)] rounded-full animate-spin" />
          Loading…
        </>
      ) : children}
    </span>
  </button>
);

// ─── Secondary Button ─────────────────────────────────────────────────────────
const SecondaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      relative w-full py-4 px-6 rounded-full font-bold text-base tracking-wide
      bg-transparent border-2 border-[#121212] text-[#121212]
      hover:bg-[#121212] hover:text-white
      active:scale-[0.98]
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </button>
);

// ─── Input Field ───────────────────────────────────────────────────────────────
const InputField: React.FC<{
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  autoComplete?: string;
}> = ({ label, type = 'text', placeholder, value, onChange, icon, error, autoComplete }) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-[#57606A] block pl-1 tracking-wide">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--semantic-muted)]">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`
          w-full px-5 py-4 min-h-[56px] rounded-[20px] 
          bg-[var(--semantic-surface-2)] border-2 transition-all duration-200
          ${error ? 'border-red-500' : 'border-transparent focus:border-[var(--brand-500)]'}
          text-[var(--brand-ink)] placeholder:text-[var(--semantic-muted)] 
          focus:bg-[var(--semantic-surface-1)] focus:shadow-[0_0_0_4px_rgba(170,255,0,0.15)]
          focus:outline-none
          ${icon ? 'pl-12' : ''}
        `}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 font-medium pl-2">{error}</p>
    )}
  </div>
);

// ─── Password Input ───────────────────────────────────────────────────────────
const PasswordInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}> = ({ label, placeholder, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[#57606A] block pl-1 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B949E]">
          <Lock size={20} />
        </div>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="current-password"
          className={`
            w-full px-5 py-4 min-h-[56px] rounded-[20px] 
            bg-[#F5F5F5] border-2 transition-all duration-200
            ${error ? 'border-red-500' : 'border-transparent focus:border-[#AAFF00]'}
            text-[#121212] placeholder:text-[#8B949E] 
            focus:bg-white focus:shadow-[0_0_0_4px_rgba(170,255,0,0.15)]
            focus:outline-none pl-12 pr-12
          `}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#121212] transition-colors p-1"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium pl-2">{error}</p>
      )}
    </div>
  );
};

// ─── OTP Input ─────────────────────────────────────────────────────────────────
const OtpInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  length?: number;
}> = ({ value, onChange, length = 6 }) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    
    const newValue = value.split('');
    newValue[index] = char;
    const updated = newValue.join('').slice(0, length);
    onChange(updated);
    
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`
              w-12 h-14 text-center text-xl font-bold rounded-2xl
              bg-[var(--semantic-surface-2)] border-2 transition-all duration-200
              ${value[i] ? 'border-[var(--brand-500)] bg-[var(--semantic-surface-1)] shadow-[0_0_0_4px_rgba(170,255,0,0.15)]' : 'border-transparent'}
              text-[var(--brand-ink)] focus:outline-none
            `}
        />
      ))}
    </div>
  );
};

// ─── Step Indicator ────────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="mb-6">
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? 'bg-[var(--brand-500)] w-8' : 'bg-[#E5E7EB] w-3'
          }`}
        />
      ))}
    </div>
  </div>
);

// ─── Section: Sign Up ────────────────────────────────────────────────────────────
const SignUpSection: React.FC<{
  lang: 'en' | 'th';
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onSwitchToLogin: () => void;
}> = ({ lang, email, setEmail, loading, error, onSubmit, onSwitchToLogin }) => {
  const [emailError, setEmailError] = useState('');
  
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const handleSubmit = () => {
    setEmailError('');
    if (!email || !validateEmail(email)) {
      setEmailError(lang === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email');
      return;
    }
    onSubmit();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <BadgeLabel>
          {lang === 'th' ? 'สมัครสมาชิก' : 'SIGN UP'}
        </BadgeLabel>
        <h1 className={`text-5xl md:text-6xl font-black tracking-tighter text-[#121212] leading-[0.9] ${fontFor(lang)}`}>
          {lang === 'th' ? 'สร้าง' : 'CREATE'}
        </h1>
        <h1 className={`text-5xl md:text-6xl font-black tracking-tighter text-[#AAFF00] leading-[0.9] ${fontFor(lang)}`}>
          {lang === 'th' ? 'บัญชีใหม่' : 'ACCOUNT'}
        </h1>
        <p className="text-lg font-mono text-[#121212]/50 max-w-sm pt-2">
          {lang === 'th' 
            ? 'ไม่ต้องจำรหัสผ่าน สมัครง่ายๆ ด้วยอีเมล'
            : 'No password needed. Sign up with just email'
          }
        </p>
      </div>
      
      {/* Form */}
      <div className="space-y-4">
        <InputField
          label={lang === 'th' ? 'อีเมล' : 'Email'}
          type="email"
          placeholder={lang === 'th' ? 'กรอกอีเมลของคุณ' : 'Enter your email'}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          icon={<Mail size={20} />}
          error={emailError}
          autoComplete="email"
        />
        
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        )}
        
        <PrimaryButton onClick={handleSubmit} loading={loading} disabled={!email}>
          {lang === 'th' ? 'สมัครสมาชิก' : 'Create Account'}
          <ArrowRight size={18} />
        </PrimaryButton>
      </div>
      
      {/* Switch */}
      <div className="text-sm text-[#8B949E]">
        {lang === 'th' ? 'มีบัญชีอยู่แล้ว?' : 'Already have an account?'}
        {' '}
        <button onClick={onSwitchToLogin} className="font-semibold text-[#AAFF00] hover:underline">
          {lang === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
        </button>
      </div>
      
      {/* Terms */}
      <p className="text-xs text-[#8B949E]">
        {lang === 'th' 
          ? 'โดยการดำเนินการต่อ คุณยอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว'
          : 'By continuing, you agree to our Terms of Service and Privacy Policy'
        }
      </p>
    </div>
  );
};

// ─── Section: Login ────────────────────────────────────────────────────────────
const LoginSection: React.FC<{
  lang: 'en' | 'th';
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}> = ({ 
  lang, email, setEmail, password, setPassword, loading, error, 
  onSubmit, onSwitchToSignup, onForgotPassword 
}) => {
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const handleSubmit = () => {
    setEmailError('');
    setPasswordError('');
    
    if (!email || !validateEmail(email)) {
      setEmailError(lang === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email');
      return;
    }
    if (!password || password.length < 8) {
      setPasswordError(lang === 'th' ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : 'Password must be at least 8 characters');
      return;
    }
    
    onSubmit();
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <BadgeLabel>
          {lang === 'th' ? 'เข้าสู่ระบบ' : 'SIGN IN'}
        </BadgeLabel>
        <h1 className={`text-5xl md:text-6xl font-black tracking-tighter text-[#121212] leading-[0.9] ${fontFor(lang)}`}>
          {lang === 'th' ? 'ยินดี' : 'WELCOME'}
        </h1>
        <h1 className={`text-5xl md:text-6xl font-black tracking-tighter text-[#AAFF00] leading-[0.9] ${fontFor(lang)}`}>
          {lang === 'th' ? 'ต้อนรับกลับ' : 'BACK'}
        </h1>
        <p className="text-lg font-mono text-[#121212]/50 max-w-sm pt-2">
          {lang === 'th' 
            ? 'เข้าสู่ระบบเพื่อเริ่มสำรวจ DailyStack'
            : 'Sign in to start exploring DailyStack'
          }
        </p>
      </div>
      
      {/* Form */}
      <div className="space-y-4">
        <InputField
          label={lang === 'th' ? 'อีเมล' : 'Email'}
          type="email"
          placeholder={lang === 'th' ? 'กรอกอีเมลของคุณ' : 'Enter your email'}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          icon={<Mail size={20} />}
          error={emailError}
          autoComplete="email"
        />
        
        <PasswordInput
          label={lang === 'th' ? 'รหัสผ่าน' : 'Password'}
          placeholder={lang === 'th' ? 'กรอกรหัสผ่าน' : 'Enter your password'}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
          error={passwordError}
        />
        
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        )}
        
        <PrimaryButton onClick={handleSubmit} loading={loading} disabled={!email || !password}>
          {lang === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
          <ArrowRight size={18} />
        </PrimaryButton>
      </div>
      
      {/* Forgot Password */}
      <button 
        onClick={onForgotPassword}
        className="text-xs text-[#8B949E] hover:text-[#AAFF00] transition-colors"
      >
        {lang === 'th' ? 'ลืมรหัสผ่าน?' : 'Forgot password?'}
      </button>
      
      {/* Switch */}
      <div className="text-sm text-[#8B949E]">
        {lang === 'th' ? 'ยังไม่มีบัญชี?' : "Don't have an account?"}
        {' '}
        <button onClick={onSwitchToSignup} className="font-semibold text-[#AAFF00] hover:underline">
          {lang === 'th' ? 'สมัครสมาชิก' : 'Sign Up'}
        </button>
      </div>
      
      {/* Terms */}
      <p className="text-xs text-[#8B949E]">
        {lang === 'th' 
          ? 'โดยการดำเนินการต่อ คุณยอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว'
          : 'By continuing, you agree to our Terms of Service and Privacy Policy'
        }
      </p>
    </div>
  );
};

// ─── Section: OTP Verify ───────────────────────────────────────────────────────
const OtpVerifySection: React.FC<{
  lang: 'en' | 'th';
  mode: 'signup' | 'login';
  email: string;
  code: string;
  setCode: (v: string) => void;
  timeLeft: number;
  loading: boolean;
  error: string;
  onVerify: () => void;
  onBack: () => void;
  onResend: () => void;
}> = ({ lang, mode, email, code, setCode, timeLeft, loading, error, onVerify, onBack, onResend }) => {
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  
  return (
    <div className="space-y-6">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#8B949E] hover:text-[#121212] transition-colors"
      >
        <ArrowLeft size={16} />
        {lang === 'th' ? 'กลับ' : 'Back'}
      </button>
      
      {/* Header */}
      <div className="space-y-2">
        <BadgeLabel>
          <Sparkles size={12} />
          {lang === 'th' ? 'ยืนยันตัวตน' : 'VERIFICATION'}
        </BadgeLabel>
        <h1 className={`text-4xl md:text-5xl font-black tracking-tighter text-[#121212] leading-[0.9] ${fontFor(lang)}`}>
          {lang === 'th' ? 'กรอกรหัส' : 'ENTER'}
        </h1>
        <h1 className={`text-4xl md:text-5xl font-black tracking-tighter text-[#AAFF00] leading-[0.9] ${fontFor(lang)}`}>
          {lang === 'th' ? 'ยืนยัน' : 'CODE'}
        </h1>
        <p className="text-base font-mono text-[#121212]/50">
          {lang === 'th' 
            ? `เราได้ส่งรหัส 6 หลักไปยัง ${email}`
            : `We sent a 6-digit code to ${email}`
          }
        </p>
      </div>
      
      {/* OTP Input */}
      <div className="py-4">
        <OtpInput value={code} onChange={setCode} />
      </div>
      
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <p className="text-sm text-red-500 font-medium">{error}</p>
        </div>
      )}
      
      {/* Timer & Resend */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#8B949E]">
          {timeLeft > 0 
            ? (lang === 'th' ? `ส่งใหม่ใน ${formatTime(timeLeft)}` : `Resend in ${formatTime(timeLeft)}`)
            : (lang === 'th' ? 'รหัสหมดอายุ' : 'Code expired')
          }
        </span>
        {timeLeft === 0 && (
          <button onClick={onResend} className="text-sm font-semibold text-[#AAFF00] hover:underline">
            {lang === 'th' ? 'ส่งรหัสใหม่' : 'Resend Code'}
          </button>
        )}
      </div>
      
      <PrimaryButton onClick={onVerify} loading={loading} disabled={code.length < 6}>
        {mode === 'signup' 
          ? (lang === 'th' ? 'สร้างบัญชี' : 'Create Account')
          : (lang === 'th' ? 'เข้าสู่ระบบ' : 'Sign In')
        }
        <ArrowRight size={18} />
      </PrimaryButton>
    </div>
  );
};

// ─── Section: Success ───────────────────────────────────────────────────────────
const SuccessSection: React.FC<{
  lang: 'en' | 'th';
  userName: string;
}> = ({ lang, userName }) => (
  <div className="text-center space-y-6 py-8">
    {/* Success Icon */}
    <div className="relative inline-flex">
      <div className="absolute inset-0 bg-[#AAFF00] blur-2xl opacity-30 rounded-full" />
      <div className="w-20 h-20 rounded-full bg-[#AAFF00] flex items-center justify-center shadow-lg">
        <CheckCircle2 size={40} className="text-[#121212]" />
      </div>
    </div>
    
    {/* Text */}
    <div className="space-y-2">
      <h2 className={`text-4xl font-black tracking-tight text-[#121212] ${fontFor(lang)}`}>
        {lang === 'th' ? 'ยินดีต้อนรับ!' : 'Welcome!'}
      </h2>
      {userName && (
        <p className="text-lg font-mono text-[#121212]/60">
          {lang === 'th' ? `สวัสดี ${userName}!` : `Hello ${userName}!`}
        </p>
      )}
      <p className="text-sm text-[#8B949E]">
        {lang === 'th' 
          ? 'การยืนยันเสร็จสมบูรณ์ กำลังพาไปยังหน้าหลัก...' 
          : 'Verification complete. Taking you to the main page...'
        }
      </p>
    </div>
    
    {/* Loading bar */}
    <div className="w-full h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
      <div 
        className="h-full bg-[#AAFF00] rounded-full"
        style={{
          animation: 'loading 2s ease-in-out infinite',
        }}
      />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'th'>('en');
  
  // Mode: 'signup' | 'login'
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  
  // Step: 1 = form, 2 = OTP verify, 3 = success
  const [step, setStep] = useState(1);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [userName, setUserName] = useState('');

  // Auto-login check
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const user = await AuthService.autoLogin();
        
        if (!isMounted) return;
        
        if (user) {
          const profile = await AuthService.getUserProfile();
          
          if (!isMounted) return;
          
          if (profile?.onboarding_completed) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        }
      } catch (error) {
        console.warn('Auth check failed:', error);
      }
    };
    
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg('');
    
    try {
      let result;
      
      if (mode === 'signup') {
        result = await AuthService.signUpWithEmail(email);
      } else {
        result = await AuthService.sendEmailOtp(email);
      }
      
      if (result.success) {
        setStep(2);
        setTimeLeft(120);
      } else {
        setErrorMsg(result.error || (lang === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred'));
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setErrorMsg('');
    
    try {
      let result;
      
      if (mode === 'signup') {
        result = await AuthService.verifySignUpOtp(email, code);
      } else {
        result = await AuthService.verifyEmailOtp(email, code);
      }
      
      if (result.success) {
        const profile = await AuthService.getUserProfile();
        setUserName(profile?.display_name || profile?.nickname || '');
        setStep(3);
      } else {
        setErrorMsg(result.error || (lang === 'th' ? 'รหัสไม่ถูกต้อง' : 'Invalid code'));
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const result = await AuthService.sendEmailOtp(email);
    setLoading(false);
    
    if (result.success) {
      setTimeLeft(120);
      setErrorMsg('');
    } else {
      setErrorMsg(result.error || (lang === 'th' ? 'ส่งใหม่ไม่สำเร็จ' : 'Failed to resend'));
    }
  };

  const handleContinue = () => {
    const checkAndNavigate = async () => {
      const profile = await AuthService.getUserProfile();
      
      if (profile?.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    };
    
    checkAndNavigate();
  };

  const handleBack = () => {
    setStep(1);
    setCode('');
    setErrorMsg('');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    setErrorMsg('');
  };

  const handleSwitchToSignup = () => {
    setMode('signup');
    setErrorMsg('');
  };

  // Redirect to dashboard after success
  useEffect(() => {
    if (step === 3) {
      const timeout = setTimeout(handleContinue, 2500);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white font-sans relative overflow-hidden">

      {/* ── Background Decoration ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#AAFF00]/3 to-white" />
        
        {/* Animated floating circles */}
        <FloatingCircle 
          size={120} blur={48} duration={8} delay={0}
          className="top-20 left-10"
        />
        <FloatingCircle 
          size={160} blur={64} duration={10} delay={2}
          className="top-40 right-20"
        />
        <FloatingCircle 
          size={96} blur={40} duration={7} delay={1}
          className="bottom-40 left-1/4"
        />
        <FloatingCircle 
          size={80} blur={32} duration={9} delay={3}
          className="bottom-20 right-1/3"
        />
        
        {/* Dot pattern - bottom right */}
        <div 
          className="absolute bottom-10 right-10 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #AAFF00 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            width: '150px',
            height: '150px',
          }}
        />
      </div>

      {/* ── Language Toggle ───────────────────────────────────────────────── */}
      <button
        onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
        className="fixed right-6 top-6 z-20 flex items-center gap-2 bg-[#F5F5F5] px-4 py-2.5 rounded-full text-xs font-bold text-[#57606A] shadow-[0_2px_12px_rgba(13,17,23,0.06)] hover:shadow-[0_4px_16px_rgba(13,17,23,0.1)] hover:text-[#121212] transition-all"
      >
        <Globe size={16} strokeWidth={2} />
        <span className={lang === 'en' ? 'text-[#AAFF00]' : 'opacity-50'}>EN</span>
        <span className="opacity-30">/</span>
        <span className={lang === 'th' ? 'text-[#AAFF00]' : 'opacity-50'}>TH</span>
      </button>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        
        {/* ── Left Side: Form ──────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-10 lg:px-20">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-12">
              <DailyStackLogo />
            </div>

            {/* Steps */}
            {step === 1 && mode === 'signup' && (
              <SignUpSection
                lang={lang}
                email={email}
                setEmail={setEmail}
                loading={loading}
                error={errorMsg}
                onSubmit={handleSendOtp}
                onSwitchToLogin={handleSwitchToLogin}
              />
            )}

            {step === 1 && mode === 'login' && (
              <LoginSection
                lang={lang}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                error={errorMsg}
                onSubmit={() => {}} // Placeholder for login
                onSwitchToSignup={handleSwitchToSignup}
                onForgotPassword={() => {}}
              />
            )}

            {step === 2 && (
              <OtpVerifySection
                lang={lang}
                mode={mode}
                email={email}
                code={code}
                setCode={setCode}
                timeLeft={timeLeft}
                loading={loading}
                error={errorMsg}
                onVerify={handleVerify}
                onBack={handleBack}
                onResend={handleResend}
              />
            )}

            {step === 3 && (
              <SuccessSection lang={lang} userName={userName} />
            )}
          </div>
        </div>

        {/* ── Right Side: Visual (Desktop only) ─────────────────────────── */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative">
          {/* Decorative card */}
          <div className="relative">
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-[#AAFF00]/20 blur-[80px] rounded-full scale-75" />
            
            {/* Main visual card */}
            <div className="relative bg-[#1a1a1a] rounded-[32px] p-8 shadow-[0_32px_80px_rgba(13,17,23,0.2)]">
              {/* App preview illustration */}
              <div className="w-72 h-96 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-[24px] overflow-hidden">
                {/* Mock UI */}
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#AAFF00]" />
                    <div className="flex-1 h-2 bg-white/10 rounded" />
                  </div>
                  
                  {/* Content blocks */}
                  <div className="h-24 bg-white/5 rounded-2xl" />
                  <div className="h-16 bg-white/5 rounded-2xl" />
                  <div className="h-20 bg-white/5 rounded-2xl" />
                  
                  {/* Bottom nav */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-around p-2 bg-white/10 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-[#AAFF00]/50" />
                    <div className="w-6 h-6 rounded-full bg-white/20" />
                    <div className="w-6 h-6 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
              
              {/* Floating accent */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-[#AAFF00] flex items-center justify-center shadow-lg">
                <Zap size={24} className="text-[#121212]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CSS Animations ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        [data-animate="float"] {
          animation: float var(--duration, 8s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
        
        /* Shine effect on hover */
        button:hover [data-shine] {
          animation: shine 0.6s ease-out;
        }
        
        @keyframes shine {
          from { transform: skewX(-20deg) translateX(-150%); }
          to { transform: skewX(-20deg) translateX(150%); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;