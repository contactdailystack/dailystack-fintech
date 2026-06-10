import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Fingerprint, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, Language } from '../data/translations';
import { signIn, signUp, requestOtp, verifyOtp } from '../services/authService';
import { OTPInput } from './OTPInput';
import { supabase } from '../supabaseClient';

interface AuthPageProps {
  onLoginSuccess: (email: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

type AuthMode = 'login' | 'otp-verify';

export default function AuthPage({ onLoginSuccess, lang, setLang }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegistering && password.length < 8) {
      setError(lang === 'en' ? 'Password must be at least 8 characters.' : 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const result = await signUp({ email, password, fullName });
        if (result.success && result.user) {
          // OTP flow: signup successful, now send OTP
          setPendingUserId(result.user.id);
          const otpResult = await requestOtp(result.user.id, email);
          if (otpResult.success) {
            setOtpSent(true);
            setAuthMode('otp-verify');
          } else {
            setError(otpResult.error || (lang === 'en' ? 'Failed to send verification code.' : 'ไม่สามารถส่งรหัสยืนยันได้'));
          }
        } else {
          setError(result.error || (lang === 'en' ? 'Registration failed.' : 'การลงทะเบียนล้มเหลว'));
        }
      } else {
        const result = await signIn(email, password);
        if (result.success) {
          onLoginSuccess(email);
        } else {
          setError(result.error || (lang === 'en' ? 'Invalid credentials.' : 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง'));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // OTP verification handlers
  const handleOtpVerify = async (otp: string): Promise<boolean> => {
    if (!pendingUserId) return false;
    const result = await verifyOtp(pendingUserId, otp);
    return result.success;
  };

  const handleOtpResend = async (): Promise<void> => {
    if (!pendingUserId || !email) return;
    const result = await requestOtp(pendingUserId, email);
    if (!result.success) {
      throw new Error(result.error || 'Failed to resend OTP');
    }
  };

  const handleOtpBack = async () => {
    // Sign out the pending user and go back
    await supabase.auth.signOut();
    setAuthMode('login');
    setPendingUserId(null);
    setOtpSent(false);
    setEmail('');
    setPassword('');
    setFullName('');
    setIsRegistering(false);
  };

  const handleOtpSuccess = () => {
    onLoginSuccess(email);
  };

  const handleGoogleOAuth = async () => {
    const { supabase } = await import('../supabaseClient');
    setError(null);
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  // OTP verification screen
  if (authMode === 'otp-verify') {
    return (
      <OTPInput
        email={email}
        mode="verify"
        lang={lang}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        onBack={handleOtpBack}
      />
    );
  }

  return (
    <div id="auth-container" className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-[#0C0D0E]">

      {/* Corner language control */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
          id="btn-lang-corner"
          className="px-3 py-1.5 rounded-xl border font-mono font-bold text-[10px] tracking-wider transition-all cursor-pointer bg-[#131416]/90 border-zinc-800 text-[#C7FF2E] hover:bg-zinc-800"
        >
          {lang === 'en' ? 'EN' : 'TH'}
        </button>
      </div>

      {/* Background glow meshes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-[#C7FF2E]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[240px] h-[240px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        id="auth-box"
        className="w-full max-w-md border rounded-[28px] p-8 md:p-10 backdrop-blur-md relative z-10 transition-all duration-300 bg-[#131416]/90 border-[#222428] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Brand header */}
        <div className="text-center mb-8" id="auth-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-[11px] tracking-widest uppercase mb-4 transition-colors bg-[#C7FF2E]/10 text-[#C7FF2E] border-[#C7FF2E]/20">
            <Fingerprint className="w-3.5 h-3.5 animate-pulse" /> {t.secureFinOS}
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight leading-none text-white">
            {t.brand}
          </h1>
          <p className="text-xs mt-2 font-sans max-w-xs mx-auto text-zinc-400">
            {t.loginSub}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="auth-form">

          {isRegistering && (
            <div className="space-y-1.5" id="field-name">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                {lang === 'en' ? 'Full Name' : 'ชื่อ-นามสกุล'}
              </label>
              <div className="relative">
                <input
                  id="input-auth-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === 'en' ? 'Your name' : 'ชื่อของคุณ'}
                  className="w-full border rounded-2xl pl-4 pr-4 py-3.5 text-sm transition-all duration-200 font-sans bg-[#1A1B1E] border-[#2B2D31] text-white placeholder-zinc-500 focus:border-[#C7FF2E] focus:ring-1 focus:ring-[#C7FF2E]/35"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5" id="field-email">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              {t.emailId}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="input-auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full border rounded-2xl pl-11 pr-4 py-3.5 text-sm transition-all duration-200 font-sans bg-[#1A1B1E] border-[#2B2D31] text-white placeholder-zinc-500 focus:border-[#C7FF2E] focus:ring-1 focus:ring-[#C7FF2E]/35"
              />
            </div>
          </div>

          <div className="space-y-1.5" id="field-pass">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                {t.password}
              </label>
              {!isRegistering && (
                <button
                  type="button"
                  className="font-mono text-[9px] uppercase tracking-wider hover:underline text-[#C7FF2E]"
                >
                  {t.forgot}
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="input-auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegistering ? (lang === 'en' ? 'Min. 8 characters' : 'อย่างน้อย 8 ตัวอักษร') : '••••••••••••'}
                className="w-full border rounded-2xl pl-11 pr-11 py-3.5 text-sm transition-all duration-200 font-mono bg-[#1A1B1E] border-[#2B2D31] text-white placeholder-zinc-500 focus:border-[#C7FF2E] focus:ring-1 focus:ring-[#C7FF2E]/35"
              />
              <button
                id="btn-toggle-password"
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors text-zinc-500 hover:text-zinc-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-250 mt-6 cursor-pointer bg-[#C7FF2E] text-[#0C0D0E] hover:bg-white"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 rounded-full animate-spin border-[#0C0D0E] border-t-transparent" />
            ) : (
              <>
                <span className="font-display font-semibold text-sm">
                  {isRegistering ? t.initAccount : t.enterOS}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* OAuth divider */}
        <div className="mt-6 flex items-center justify-between gap-3 text-zinc-650" id="divider">
          <div className="flex-1 h-[1px] bg-[#222428]" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{t.orMaster}</span>
          <div className="flex-1 h-[1px] bg-[#222428]" />
        </div>

        <div className="mt-4">
          <button
            id="btn-oauth-google"
            onClick={handleGoogleOAuth}
            disabled={loading}
            className="w-full rounded-xl py-3 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#2B2D31] text-white hover:bg-[#25282E] disabled:opacity-50 disabled:pointer-events-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#C7FF2E" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#C7FF2E" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#C7FF2E" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#C7FF2E" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-sans">{t.googleCloud}</span>
          </button>
        </div>

        {/* Toggle register / login */}
        <p className="text-center font-mono text-[10px] uppercase tracking-wider mt-8 text-zinc-500" id="auth-toggle">
          {isRegistering ? t.alreadyEngineered : t.newToDailyStack}
          <button
            id="btn-auth-mode-toggle"
            type="button"
            className="hover:underline ml-1 uppercase font-bold text-[#C7FF2E]"
            onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
          >
            {isRegistering ? t.loginCore : t.registerSecurely}
          </button>
        </p>
      </motion.div>

      {/* Compliance footer */}
      <div className="absolute bottom-6 flex items-center gap-2 text-[10px] font-mono text-zinc-650" id="auth-compliance">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>{t.bankSecured}</span>
      </div>
    </div>
  );
}
