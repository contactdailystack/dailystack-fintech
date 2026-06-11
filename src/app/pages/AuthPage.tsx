import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { getProfile, getPostAuthRedirect, sendOtp } from '../services/authService';
import { CheckCircle2, Globe, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { translations } from '../i18n';
import { useLanguage } from '../context/LanguageContext';

// ─── Pilo Color Strategy ─────────────────────────────────────────────────────
//
//  #0D0D0D  Pilo Black     → Primary Background (dark screens, cards, nav)
//  #C7FF2E  Electric Green → ONE CTA per screen + active states + live data
//  #FFFFFF  Pure White     → Content surface (light card, input bg)
//  #1A1A1A  Charcoal       → Secondary surface (cards on dark bg)
//  #555555  Mid Gray       → Inactive icons, secondary text
//
//  Rules:
//   1. One green button per screen – no competing accent colors
//   2. Theme switch is done by background, not accent
//   3. Green = alive/active signal (timer, active icon, status)
// ─────────────────────────────────────────────────────────────────────────────

const fontFor = (lang: 'en' | 'th') =>
  lang === 'th' ? 'font-kanit' : 'font-sans';

const localTranslations = {
  en: {
    ...translations.en,
    login: "Sign In",
    dontHaveAccount: "Don't have an account? Sign Up",
    alreadyHaveAccount: "Already have an account? Sign In",
    socialLogin: "or continue with",
    googleSignIn: "Continue with Google",
    welcomeBackTitle: "Welcome back.",
    welcomeBackSub: "Track recurring costs and stop paying for what you do not use",
    welcomeRegisterTitle: "Find recurring waste.",
    welcomeRegisterSub: "Create your DailyStack account and map your first subscription",
    passwordLabel: "Password (Optional)",
    passwordPlaceholder: "Enter password or use Magic Link",
    forgotPassword: "Forgot password?",
    agreeText: "I agree to receive updates and offers from DailyStack",
    heroHeadline: "Track\nSubscriptions.\nCut Waste.",
    heroSubheadline: "See every recurring charge, spot the next renewal, and get a clear path to cancel what no longer earns its place.",
    securityNotice: "Secure passwordless sign in",
    step1Label: "Credentials",
    step2Label: "Verification",
  },
  th: {
    ...translations.th,
    login: "เข้าสู่ระบบ",
    dontHaveAccount: "ยังไม่มีบัญชี? สมัครสมาชิก",
    alreadyHaveAccount: "มีบัญชีแล้ว? เข้าสู่ระบบ",
    socialLogin: "หรือเข้าสู่ระบบด้วย",
    googleSignIn: "ดำเนินการต่อด้วย Google",
    welcomeBackTitle: "ยินดีต้อนรับ.",
    welcomeBackSub: "ติดตามรายจ่ายซ้ำ และหยุดจ่ายให้บริการที่ไม่ได้ใช้จริง",
    welcomeRegisterTitle: "หาเงินรั่วจาก subscription.",
    welcomeRegisterSub: "สร้างบัญชี DailyStack และเริ่มบันทึก subscription แรก",
    passwordLabel: "รหัสผ่าน (ไม่บังคับ)",
    passwordPlaceholder: "กรอกรหัสผ่าน หรือใช้ OTP",
    forgotPassword: "ลืมรหัสผ่าน?",
    agreeText: "ยอมรับการรับข่าวสารและสิทธิพิเศษจาก DailyStack",
    heroHeadline: "รู้ทัน\nSubscription.\nลดเงินรั่ว.",
    heroSubheadline: "เห็นรายจ่ายซ้ำทั้งหมด รู้รอบตัดเงินถัดไป และมีขั้นตอนชัดเจนสำหรับยกเลิกบริการที่ไม่คุ้ม",
    securityNotice: "เข้าสู่ระบบแบบไม่ใช้รหัสผ่านอย่างปลอดภัย",
    step1Label: "กรอกข้อมูล",
    step2Label: "ยืนยันรหัส",
  }
};

// ─── Brand Logo ───────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string; dark?: boolean }> = ({ className, dark = false }) => (
  <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
    <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
      <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="#C7FF2E" opacity="0.5" />
      <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="#C7FF2E" opacity="0.75" />
      <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="#C7FF2E" />
      <path d="M50 29 L72 39 L50 47 L28 39 Z" fill="#000000" opacity="0.3" />
    </svg>
    <span className="text-[11px] font-black tracking-[0.2em] uppercase leading-none select-none">
      <span className={dark ? 'text-white' : 'text-[#0D0D0D]'}>DAILY</span>
      <span className="text-[#C7FF2E]">STACK</span>
    </span>
  </div>
);

// ─── Step Progress Bar (Pilo style — thin, green fill) ───────────────────────
const StepBar: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex gap-1.5 mb-7">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className="h-[3px] rounded-full transition-all duration-500"
        style={{
          flex: i < current ? 2 : 1,
          background: i < current ? '#C7FF2E' : 'rgba(255,255,255,0.12)',
        }}
      />
    ))}
  </div>
);

// ─── Input Field (Light card surface inside dark form) ───────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}
const InputField: React.FC<InputFieldProps> = ({ label, icon, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-[9px] font-bold tracking-[0.18em] uppercase text-[#555555] select-none">
        {label}
      </label>
    )}
    <div className="relative flex items-center">
      {icon && (
        <div className="absolute left-3.5 text-[#555555] pointer-events-none">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`
          w-full min-h-[48px] px-4 py-3 rounded-xl text-sm text-[#0D0D0D] font-medium
          bg-white border border-black/8 placeholder-[#AAAAAA]
          outline-none transition-all duration-200
          focus:border-[#C7FF2E] focus:ring-4 focus:ring-[#C7FF2E]/12
          ${icon ? 'pl-10' : 'pl-4'}
          ${props.className ?? ''}
        `}
      />
    </div>
  </div>
);

// ─── Primary CTA Button — ONE per screen, always Electric Green ───────────────
interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ loading, children, ...props }) => (
  <button
    {...props}
    className={`
      w-full min-h-[50px] rounded-xl font-bold text-sm text-[#0D0D0D] bg-[#C7FF2E]
      hover:bg-[#c8ff3d] active:scale-[0.98] transition-all duration-150
      disabled:opacity-35 disabled:cursor-not-allowed
      flex items-center justify-center gap-2
      ${props.className ?? ''}
    `}
  >
    {loading ? (
      <span className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-[#0D0D0D]/25 border-t-[#0D0D0D] rounded-full animate-spin" />
        <span>Loading...</span>
      </span>
    ) : children}
  </button>
);

// ─── Ghost Button (secondary action, no green competition) ────────────────────
const GhostButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ children, ...props }) => (
  <button
    {...props}
    className={`
      w-full min-h-[48px] rounded-xl font-semibold text-sm text-white
      border border-white/10 bg-transparent hover:bg-white/5
      active:scale-[0.98] transition-all duration-150
      flex items-center justify-center gap-2.5
      ${props.className ?? ''}
    `}
  >
    {children}
  </button>
);

// ─── Hero Illustration — minimal, monochrome, Pilo inspired ──────────────────
const HeroIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 360 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Green glow core */}
    <circle cx="180" cy="180" r="88" fill="#C7FF2E" opacity="0.08" />
    <circle cx="180" cy="180" r="62" fill="#C7FF2E" opacity="0.1" />

    {/* Phone frame */}
    <rect x="142" y="96" width="76" height="138" rx="12" fill="#1A1A1A" stroke="#333333" strokeWidth="1.5" />
    {/* Screen */}
    <rect x="148" y="106" width="64" height="112" rx="6" fill="#0D0D0D" />
    {/* Status dot — green = alive */}
    <circle cx="180" cy="112" r="2.5" fill="#C7FF2E" />
    {/* Map mini */}
    <rect x="152" y="120" width="56" height="38" rx="4" fill="#1A1A1A" />
    <path d="M160 138 L170 130 L180 135 L192 126 L200 132" stroke="#C7FF2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="192" cy="126" r="3" fill="#C7FF2E" />
    {/* Book ride button */}
    <rect x="152" y="166" width="56" height="14" rx="7" fill="#C7FF2E" />
    <rect x="152" y="186" width="56" height="10" rx="5" fill="#1A1A1A" />
    <rect x="152" y="202" width="28" height="8" rx="4" fill="#1A1A1A" />

    {/* Card floating left */}
    <rect x="60" y="155" width="72" height="45" rx="8" fill="#1A1A1A" stroke="#2A2A2A" strokeWidth="1" />
    <rect x="68" y="163" width="20" height="14" rx="3" fill="#C7FF2E" opacity="0.9" />
    <rect x="68" y="182" width="36" height="4" rx="2" fill="#333333" />
    <rect x="68" y="190" width="24" height="4" rx="2" fill="#2A2A2A" />
    {/* Connector line */}
    <line x1="132" y1="177" x2="142" y2="177" stroke="#C7FF2E" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />

    {/* Stats card floating right */}
    <rect x="228" y="140" width="72" height="56" rx="8" fill="#1A1A1A" stroke="#2A2A2A" strokeWidth="1" />
    <text x="236" y="157" fill="#555555" fontSize="7" fontFamily="sans-serif" fontWeight="600">SAVINGS</text>
    <text x="236" y="172" fill="#C7FF2E" fontSize="13" fontFamily="sans-serif" fontWeight="800">$2,840</text>
    <rect x="236" y="177" width="48" height="3" rx="1.5" fill="#1F1F1F" />
    <rect x="236" y="177" width="34" height="3" rx="1.5" fill="#C7FF2E" opacity="0.8" />
    <text x="236" y="190" fill="#555555" fontSize="7" fontFamily="sans-serif">72% of goal</text>
    {/* Connector line */}
    <line x1="218" y1="168" x2="228" y2="168" stroke="#C7FF2E" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />

    {/* Bottom reward pill */}
    <rect x="148" y="250" width="64" height="20" rx="10" fill="#1A1A1A" stroke="#C7FF2E" strokeWidth="0.8" />
    <circle cx="161" cy="260" r="4" fill="#C7FF2E" />
    <text x="170" y="263" fill="#FFFFFF" fontSize="7.5" fontFamily="sans-serif" fontWeight="700">320 pts</text>

    {/* Orbit dots */}
    <circle cx="116" cy="120" r="3" fill="#C7FF2E" opacity="0.4" />
    <circle cx="244" cy="248" r="3" fill="#C7FF2E" opacity="0.4" />
    <circle cx="130" cy="236" r="2" fill="#C7FF2E" opacity="0.25" />
    <circle cx="252" cy="120" r="2" fill="#C7FF2E" opacity="0.25" />
  </svg>
);

// ─── Step 1: Credentials ──────────────────────────────────────────────────────
interface StepCredentialsProps {
  t: typeof localTranslations['en'];
  lang: 'en' | 'th';
  onSend: () => void;
  loading: boolean;
  errorMsg: string;
  setNickname: (v: string) => void;
  setEmail: (v: string) => void;
  isRegisterMode: boolean;
  setIsRegisterMode: (v: boolean) => void;
  onGoogleSignIn: () => void;
}
const StepCredentials: React.FC<StepCredentialsProps> = ({
  t, lang, onSend, loading, errorMsg, setNickname, setEmail,
  isRegisterMode, setIsRegisterMode, onGoogleSignIn,
}) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="space-y-4">

      {/* Header */}
      <div className="space-y-1 mb-5">
        <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-[0.16em] uppercase bg-[#C7FF2E]/10 text-[#C7FF2E] select-none">
          {t.step1Label}
        </span>
        <h2 className={`text-2xl font-black text-white leading-tight tracking-tight ${fontFor(lang)}`}>
          {isRegisterMode ? t.welcomeRegisterTitle : t.welcomeBackTitle}
        </h2>
        <p className="text-[11px] text-[#555555] font-medium leading-snug">
          {isRegisterMode ? t.welcomeRegisterSub : t.welcomeBackSub}
        </p>
      </div>

      {/* Fields */}
      {isRegisterMode && (
        <InputField
          label={t.nickName}
          type="text"
          placeholder="e.g. stacker99"
          autoComplete="nickname"
          icon={<User size={15} />}
          onChange={(e) => setNickname(e.target.value)}
        />
      )}
      <InputField
        label={t.email}
        type="email"
        placeholder="yourname@domain.com"
        autoComplete="email"
        inputMode="email"
        icon={<Mail size={15} />}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Agreement */}
      {isRegisterMode && (
        <label className="flex gap-2.5 items-start cursor-pointer pt-0.5 select-none">
          <span className="mt-0.5 shrink-0 w-4 h-4 flex items-center justify-center">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 accent-[#C7FF2E] cursor-pointer"
            />
          </span>
          <span className={`text-[10px] text-[#555555] font-medium leading-normal ${fontFor(lang)}`}>
            {t.agreeText} {' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#C7FF2E]">ข้อกำหนดการใช้งาน</a>
            {' '}&{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#C7FF2E]">นโยบายความเป็นส่วนตัว</a>
          </span>
        </label>
      )}

      {/* Error */}
      {errorMsg && (
        <p className="text-amber-400 text-[11px] bg-amber-400/8 border border-amber-400/18 rounded-xl px-4 py-3 font-semibold">
          {errorMsg}
        </p>
      )}

      {/* ONE CTA — Electric Green */}
      <PrimaryButton
        type="submit"
        loading={loading}
        disabled={(isRegisterMode && !agreed) || loading}
      >
        <span>{t.sendCode}</span>
        <ArrowRight size={15} />
      </PrimaryButton>

      {/* Mode switch */}
      <div className="text-center pt-0.5">
        <button
          type="button"
          onClick={() => setIsRegisterMode(!isRegisterMode)}
          className="text-[10px] text-[#555555] hover:text-white transition-colors font-semibold underline underline-offset-4"
        >
          {isRegisterMode ? t.alreadyHaveAccount : t.dontHaveAccount}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-2">
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-[9px] font-bold tracking-widest uppercase text-[#555555] select-none">
          {t.socialLogin}
        </span>
        <div className="flex-1 h-px bg-white/8" />
      </div>

      {/* Google — Ghost button, NO green, no visual competition */}
      <GhostButton type="button" onClick={onGoogleSignIn}>
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span>{t.googleSignIn}</span>
      </GhostButton>
    </form>
  );
};

// ─── Step 2: OTP Verify ───────────────────────────────────────────────────────
interface StepVerifyProps {
  t: typeof localTranslations['en'];
  lang: 'en' | 'th';
  code: string;
  setCode: (v: string) => void;
  onVerify: () => void;
  loading: boolean;
  errorMsg: string;
  timeLeft: number;
  onResend: () => void;
}
const StepVerify: React.FC<StepVerifyProps> = ({
  t, lang, code, setCode, onVerify, loading, errorMsg, timeLeft, onResend,
}) => (
  <form onSubmit={(e) => { e.preventDefault(); onVerify(); }} className="space-y-4">

    {/* Header */}
    <div className="space-y-1 mb-5">
      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black tracking-[0.16em] uppercase bg-[#C7FF2E]/10 text-[#C7FF2E] select-none">
        {t.step2Label}
      </span>
      <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{t.verifyCode}</h2>
      <p className={`text-[11px] text-[#555555] font-medium ${fontFor(lang)}`}>{t.enterCode}</p>
    </div>

    {/* OTP input — dark surface, monospaced, green focus border */}
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={code}
      placeholder="000000"
      maxLength={6}
      autoComplete="one-time-code"
      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
      className="
        w-full min-h-[56px] px-4 py-4 rounded-xl
        text-center text-2xl tracking-[0.55em] font-mono font-bold
        bg-[#1A1A1A] border border-white/10 text-white
        focus:border-[#C7FF2E] focus:ring-4 focus:ring-[#C7FF2E]/12
        outline-none transition-all duration-200
      "
    />
    {/* OTP helper text */}
    <p className="text-[10px] text-[#555555] text-center mt-1">กรอกรหัส OTP 6 หลักที่ส่งไปยังอีเมลของคุณ</p>

    {/* Resend timer — green = alive signal */}
    <div className="text-center select-none">
      {timeLeft > 0 ? (
        <p className="text-[11px] text-[#555555] font-medium">
          Resend in{' '}
          <span className="text-[#C7FF2E] font-black tabular-nums">{timeLeft}s</span>
        </p>
      ) : (
        <button
          type="button"
          onClick={onResend}
          className="text-[11px] text-[#C7FF2E] hover:text-[#C7FF2E]/75 font-bold underline underline-offset-4 py-1"
        >
          {t.resend}
        </button>
      )}
    </div>

    {errorMsg && (
      <p className="text-amber-400 text-[11px] bg-amber-400/8 border border-amber-400/18 rounded-xl px-4 py-3 font-semibold text-center">
        {errorMsg}
      </p>
    )}

    {/* ONE CTA */}
    <PrimaryButton type="submit" loading={loading} disabled={code.length < 8 || loading}>
      <span>{t.verify}</span>
      <ArrowRight size={15} />
    </PrimaryButton>
  </form>
);

// ─── Step 3: Success ──────────────────────────────────────────────────────────
interface StepSuccessProps {
  t: typeof localTranslations['en'];
  lang: 'en' | 'th';
  onContinue: () => void;
}
const StepSuccess: React.FC<StepSuccessProps> = ({ t, lang, onContinue }) => (
  <div className="text-center space-y-6 py-2 select-none">
    {/* Green check — alive signal */}
    <div className="relative mx-auto w-16 h-16">
      <div className="absolute inset-0 rounded-full bg-[#C7FF2E]/15 scale-125" />
      <div className="relative w-16 h-16 bg-[#C7FF2E]/10 border border-[#C7FF2E]/25 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 text-[#C7FF2E]" strokeWidth={1.75} />
      </div>
    </div>
    <div>
      <h2 className="text-2xl font-black text-white tracking-tight">{t.welcome}</h2>
      <p className={`text-[#555555] text-[11px] mt-1.5 leading-relaxed font-medium ${fontFor(lang)}`}>
        {t.verified}
      </p>
    </div>
    {/* ONE CTA */}
    <PrimaryButton onClick={onContinue}>
      <span>{t.continue}</span>
      <ArrowRight size={15} />
    </PrimaryButton>
  </div>
);

// ─── Main AuthPage ─────────────────────────────────────────────────────────────
const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { language: lang, setLanguage: setLang } = useLanguage();
  const t = localTranslations[lang];

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [postAuthPath, setPostAuthPath] = useState<'/onboarding' | '/dashboard'>('/onboarding');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const handleSendCode = async () => {
    setLoading(true);
    setErrorMsg('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg(lang === 'th' ? 'กรุณากรอกอีเมล' : 'Please enter your email.');
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg(lang === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format.');
      setLoading(false);
      return;
    }
    if (isRegisterMode && !nickname.trim()) {
      setErrorMsg(lang === 'th' ? 'กรุณากรอกชื่อเล่นของคุณ' : 'Please enter your nickname.');
      setLoading(false);
      return;
    }
    try {
      const finalNickname = isRegisterMode ? nickname.trim() : (cleanEmail.split('@')[0] || 'Member');
      const { error } = await sendOtp(cleanEmail, {
        shouldCreateUser: true,
        data: { nickname: finalNickname },
      });
      if (!error) {
        setStep(2);
        setTimeLeft(60);
      } else {
        setErrorMsg(error.message || (lang === 'th' ? 'การส่งรหัสล้มเหลว' : 'Unable to send code.'));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message.includes('Failed to fetch')
        ? lang === 'th'
          ? 'ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต'
          : 'Connection failed. Check your internet and try again.'
        : message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error, data: authData } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: 'email',
      });
      if (!error) {
        if (authData?.user) {
          const profile = await getProfile(authData.user.id);
          const redirect = getPostAuthRedirect(profile);
          setPostAuthPath(redirect);
        }
        setStep(3);
      } else {
        setErrorMsg(lang === 'th' ? 'รหัสไม่ถูกต้อง' : 'Invalid code. Please try again.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message.includes('Failed to fetch')
        ? lang === 'th'
          ? 'ไม่สามารถเชื่อมต่อได้'
          : 'Connection failed. Please try again.'
        : message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    // ── Root: Dark background (Pilo Black) — full screen split layout ──
    <div className="min-h-screen min-h-[100dvh] w-screen bg-[#0D0D0D] text-white font-sans flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden select-text relative">

      {/* ── DESKTOP LEFT PANEL — Dark hero, illustration, copy ── */}
      <div className="hidden lg:flex lg:w-[52%] h-full flex-col justify-between p-14 xl:p-16 relative overflow-hidden shrink-0">

        {/* Subtle dot grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Green accent glow */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(185,247,43,0.07) 0%, transparent 65%)' }}
        />

        <DailyStackLogo dark />

        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center py-8 relative z-10">
          <HeroIllustration className="w-full max-w-[300px] xl:max-w-[340px] mx-auto" />
        </div>

        {/* Hero copy */}
        <div className="space-y-3 relative z-10 max-w-md select-text">
          <h1 className={`text-4xl xl:text-5xl font-black leading-[1.0] tracking-tight text-white whitespace-pre-line ${fontFor(lang)}`}>
            {t.heroHeadline}
          </h1>
          <p className="text-[11px] text-[#555555] font-semibold leading-relaxed max-w-[320px]">
            {t.heroSubheadline}
          </p>
        </div>
      </div>

      {/* ── MOBILE TOP BANNER — Compact, brand + illustration ── */}
      <div className="lg:hidden h-[22dvh] min-h-[130px] max-h-[160px] w-full flex items-center justify-between px-5 relative overflow-hidden shrink-0">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="z-10 flex flex-col gap-1.5 max-w-[55%]">
          <DailyStackLogo dark />
          <p className={`text-[13px] font-black text-white leading-tight ${fontFor(lang)}`}>
            Your Daily OS.
          </p>
        </div>
        <div className="w-[110px] h-[110px] shrink-0 z-10">
          <HeroIllustration className="w-full h-full" />
        </div>
      </div>

      {/* ── RIGHT PANEL — Dark form container (same Pilo Black) ── */}
      {/* Note: Right panel uses same dark bg, not light — to match Pilo's
          "in-ride / action" dark context where CTA green pops out */}
      <div className="flex-1 lg:h-full lg:w-[48%] bg-[#111111] rounded-t-3xl lg:rounded-none border-t border-white/5 lg:border-t-0 lg:border-l lg:border-white/5
        flex flex-col justify-between p-5 lg:p-12 xl:p-14 relative overflow-y-auto shrink-0">

        {/* Language toggle — no accent color, pure ghost */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
            className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-[#555555]
              bg-[#1A1A1A] hover:bg-[#222222] border border-white/8 px-3 py-1.5 min-h-[32px] rounded-full
              transition-all duration-200 hover:text-white select-none"
            aria-label="Toggle language"
          >
            <Globe size={10} />
            <span>{lang === 'en' ? 'TH' : 'EN'}</span>
          </button>
        </div>

        {/* Auth card — transparent container, Charcoal bg on desktop */}
        <div className="w-full max-w-[360px] mx-auto my-auto py-2">
          <div className="bg-transparent lg:bg-[#1A1A1A] lg:border lg:border-white/6 lg:rounded-2xl lg:p-8">
            {step < 3 && <StepBar current={step} total={2} />}

            {step === 1 && (
              <StepCredentials
                t={t} lang={lang}
                onSend={handleSendCode}
                loading={loading}
                errorMsg={errorMsg}
                setNickname={setNickname}
                setEmail={setEmail}
                isRegisterMode={isRegisterMode}
                setIsRegisterMode={(v) => { setErrorMsg(''); setIsRegisterMode(v); }}
                onGoogleSignIn={handleGoogleSignIn}
              />
            )}

            {step === 2 && (
              <StepVerify
                t={t} lang={lang}
                code={code} setCode={setCode}
                onVerify={handleVerify}
                loading={loading}
                errorMsg={errorMsg}
                timeLeft={timeLeft}
                onResend={handleSendCode}
              />
            )}

            {step === 3 && (
              <StepSuccess
                t={t} lang={lang}
                onContinue={() => {
                  navigate(postAuthPath === '/dashboard' ? '/dashboard' : '/onboarding', {
                    state: { nickname: nickname || email.trim().split('@')[0] },
                  });
                }}
              />
            )}
          </div>
        </div>

        {/* Security badge — minimal, no green (not an action/alive state) */}
        <div className="flex items-center justify-center gap-1.5 text-[9px] font-semibold text-[#3A3A3A] pt-4 lg:pt-0 select-none">
          <ShieldCheck size={11} className="text-[#3A3A3A]" />
          <span>{t.securityNotice}</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
