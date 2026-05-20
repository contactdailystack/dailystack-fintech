import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { CheckCircle2, Globe } from 'lucide-react';
import { translations } from '../i18n';

// ─── Brand Typography Helper ────────────────────────────────────────────────
// EN: Space Grotesk  |  TH: Kanit
const fontFor = (lang: 'en' | 'th') =>
  lang === 'th' ? 'font-kanit' : 'font-sans';

// ─── Brand Logo ──────────────────────────────────────────────────────────────
// Traced from DailyStack brand asset — stacked-layers icon + DAILY(white) STACK(green)
const DailyStackLogo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center gap-3 ${className ?? ''}`}>
    {/* Icon mark — stacked S-shield layers */}
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ds-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6dda9f" />
          <stop offset="100%" stopColor="#3a9e68" />
        </linearGradient>
      </defs>
      {/* Bottom layer */}
      <path
        d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z"
        fill="url(#ds-grad)" opacity="0.55"
      />
      {/* Middle layer */}
      <path
        d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z"
        fill="url(#ds-grad)" opacity="0.78"
      />
      {/* Top layer / S-shield */}
      <path
        d="M50 22 L82 38 L50 54 L18 38 Z"
        fill="url(#ds-grad)"
      />
      {/* Inner S cut-out highlight */}
      <path
        d="M50 29 L72 39 L50 47 L28 39 Z"
        fill="#1c232a" opacity="0.35"
      />
    </svg>

    {/* Wordmark: DAILY (white) STACK (green) */}
    <span className="text-sm font-black tracking-[0.18em] uppercase leading-none font-sans select-none">
      <span className="text-white">DAILY</span>
      <span className="text-primary">STACK</span>
    </span>
  </div>
);

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StepIndicatorProps {
  current: number;
  total: number;
}
const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total }) => (
  <div className="flex gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-[3px] rounded-full transition-all duration-500 ${
          i < current ? 'bg-primary flex-[2]' : 'bg-white/10 flex-1'
        }`}
      />
    ))}
  </div>
);

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
  <div className="space-y-2">
    {label && (
      <label className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
        {label}
      </label>
    )}
    <input
      {...props}
      className={`w-full px-4 py-3.5 bg-dark-bg border border-white/8 rounded-xl text-white
        placeholder-white/20 focus:border-primary/60 focus:ring-1 focus:ring-primary/20
        outline-none transition-all duration-200 text-sm ${props.className ?? ''}`}
    />
  </div>
);

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ loading, children, ...props }) => (
  <button
    {...props}
    className={`w-full py-3.5 rounded-xl font-bold text-sm text-dark-bg bg-primary
      hover:bg-primary/90 active:scale-[0.98] transition-all duration-150
      disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(86,190,137,0.25)]
      ${props.className ?? ''}`}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <span className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
        Loading…
      </span>
    ) : children}
  </button>
);

// ─── Step 1: Credentials ────────────────────────────────────────────────────

interface StepCredentialsProps {
  t: ReturnType<typeof Object.values>[0];
  lang: 'en' | 'th';
  onSend: () => void;
  loading: boolean;
  errorMsg: string;
  setNickname: (v: string) => void;
  setEmail: (v: string) => void;
}
const StepCredentials: React.FC<StepCredentialsProps> = ({
  t, lang, onSend, loading, errorMsg, setNickname, setEmail,
}) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-2">
          Get Started
        </p>
        <h2 className={`text-2xl font-bold text-white leading-tight ${fontFor(lang)}`}>{t.signUp}</h2>
      </div>

      <InputField
        label="Nickname"
        type="text"
        placeholder={t.nickName}
        onChange={(e) => setNickname(e.target.value)}
      />
      <InputField
        label="Email"
        type="email"
        placeholder={t.email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className={`flex gap-3 text-sm text-gray-400 cursor-pointer ${fontFor(lang)} pt-1`}>
        <input
          type="checkbox"
          className="accent-primary mt-0.5 shrink-0"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span className="leading-relaxed">{t.agree}</span>
      </label>

      {errorMsg && (
        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {errorMsg}
        </p>
      )}

      <PrimaryButton onClick={onSend} loading={loading} disabled={!agreed || loading}>
        {t.sendCode}
      </PrimaryButton>
    </div>
  );
};

// ─── Step 2: OTP Verify ─────────────────────────────────────────────────────

interface StepVerifyProps {
  t: ReturnType<typeof Object.values>[0];
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
  <div className="space-y-5">
    <div className="mb-6">
      <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-2">
        Verification
      </p>
      <h2 className="text-2xl font-bold text-white leading-tight">{t.verifyCode}</h2>
      <p className={`text-sm text-gray-400 mt-2 ${fontFor(lang)}`}>{t.enterCode}</p>
    </div>

    {/* OTP input — large mono display */}
    <div className="relative">
      <input
        type="text"
        value={code}
        placeholder="00000000"
        maxLength={8}
        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
        className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] bg-dark-bg
          border border-white/8 rounded-xl text-white font-mono focus:border-primary/60
          focus:ring-1 focus:ring-primary/20 outline-none transition-all duration-200"
      />
      <div className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none" />
    </div>

    {/* Resend timer */}
    <div className="text-center">
      {timeLeft > 0 ? (
        <p className="text-xs text-gray-500">
          Resend in{' '}
          <span className="text-primary font-semibold tabular-nums">{timeLeft}s</span>
        </p>
      ) : (
        <button
          onClick={onResend}
          className="text-xs text-gray-400 hover:text-primary transition-colors underline underline-offset-2"
        >
          Resend code
        </button>
      )}
    </div>

    {errorMsg && (
      <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-center">
        {errorMsg}
      </p>
    )}

    <PrimaryButton onClick={onVerify} loading={loading} disabled={code.length < 6 || loading}>
      {t.verify}
    </PrimaryButton>
  </div>
);

// ─── Step 3: Success ────────────────────────────────────────────────────────

interface StepSuccessProps {
  t: ReturnType<typeof Object.values>[0];
  lang: 'en' | 'th';
  onContinue: () => void;
}
const StepSuccess: React.FC<StepSuccessProps> = ({ t, lang, onContinue }) => (
  <div className="text-center space-y-6 py-4">
    {/* Glow ring around icon */}
    <div className="relative mx-auto w-20 h-20">
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg scale-125" />
      <div className="relative w-20 h-20 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9 text-primary" />
      </div>
    </div>

    <div>
      <h2 className="text-3xl font-bold text-white">{t.welcome}</h2>
      <p className={`text-gray-400 text-sm mt-3 leading-relaxed ${fontFor(lang)}`}>
        {t.verified}
      </p>
    </div>

    <PrimaryButton onClick={onContinue}>{t.continue}</PrimaryButton>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'th'>('en');
  const t = translations[lang];

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const handleSendCode = async () => {
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { 
        data: { nickname } // บันทึกลง Metadata
      },
    });
    setLoading(false);
    if (!error) {
      setStep(2);
      setTimeLeft(60);
    } else {
      setErrorMsg(error.message);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    setLoading(false);
    if (!error) {
      setStep(3);
    } else {
      setErrorMsg(lang === 'th' ? 'รหัสไม่ถูกต้อง' : 'Invalid code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg font-sans relative overflow-hidden">

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]
        bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
        className="absolute top-6 right-6 flex items-center gap-2 text-xs font-semibold
          text-gray-400 bg-white/5 hover:bg-white/10 border border-white/8
          px-3 py-2 rounded-full transition-all duration-200 hover:text-white"
        aria-label="Toggle language"
      >
        <Globe size={14} />
        <span>{lang === 'en' ? 'TH' : 'EN'}</span>
      </button>

      {/* Card */}
      <div className="relative w-full max-w-[400px]">
        {/* Subtle card glow border */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/8 to-transparent pointer-events-none" />

        <div className="relative bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl border border-white/5 shadow-2xl">
          {/* Brand logo */}
          <DailyStackLogo className="mb-8" />

          {step < 3 && <StepIndicator current={step} total={2} />}

          {step === 1 && (
            <StepCredentials
              t={t}
              lang={lang}
              onSend={handleSendCode}
              loading={loading}
              errorMsg={errorMsg}
              setNickname={setNickname}
              setEmail={setEmail}
            />
          )}

          {step === 2 && (
            <StepVerify
              t={t}
              lang={lang}
              code={code}
              setCode={setCode}
              onVerify={handleVerify}
              loading={loading}
              errorMsg={errorMsg}
              timeLeft={timeLeft}
              onResend={handleSendCode}
            />
          )}

          {step === 3 && (
            <StepSuccess
              t={t}
              lang={lang}
              onContinue={() => navigate('/onboarding', { state: { nickname: nickname } })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;