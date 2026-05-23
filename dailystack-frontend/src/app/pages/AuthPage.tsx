import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureUserProfile, getPostAuthRedirect, getProfile, supabase, sendOtp } from '../services/authService';
import type { AuthIntent } from '../services/authService';
import { CheckCircle2 } from 'lucide-react';
// using runtime i18n via LanguageContext
import { EditorialShell } from '../components/ui/EditorialShell';
import { useLanguage } from '../context/useLanguage';
import { useAuth } from '../context/AuthContextStore';

// --- Brand Logo --------------------------------------------------------------
const DailyStackLogo: React.FC<{ className?: string; altText?: string }> = ({ className, altText = 'DailyStack' }) => (
  <div className={`flex items-center justify-center ${className ?? ''}`}>
    <img
      src="/assets/logos/DailyStack%20Brand%20Logo-01.png"
      alt={altText}
      className="h-20 w-20 rounded-3xl object-contain"
    />
  </div>
);

// --- Sub-components ----------------------------------------------------------

interface StepIndicatorProps {
  current: number;
  total: number;
}
const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total }) => (
  <div className="flex gap-3 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-2 rounded-xl transition-all duration-300 border-1.5 border-[#1A1C1E] ${
          i < current ? 'bg-[#56be89] flex-[2]' : 'bg-white flex-1'
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
      <table className="m-0 p-0">
        <tbody>
          <tr>
            <td>
              <label className="text-xs font-bold text-[#1A1C1E] tracking-widest uppercase block">
                {label}
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    )}
    <input
      {...props}
      className={`w-full px-4 py-3.5 min-h-[54px] bg-[#F9FAFB] border-1.5 border-[#1A1C1E] rounded-xl text-[#1A1C1E]
        placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#56be89]
        transition-all duration-150 text-base font-medium leading-tight ${props.className ?? ''}`}
    />
  </div>
);

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
}
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ loading, loadingLabel = 'Loading...', children, ...props }) => (
  <button
    {...props}
    className={`w-full py-4 min-h-[54px] rounded-xl font-bold text-base text-[#1A1C1E] bg-[#56be89]
      border-1.5 border-[#1A1C1E] shadow-[4px_4px_0px_0px_#1A1C1E]
      hover:bg-[#4bb776] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
      disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_0px_#1A1C1E]
      transition-all duration-100 flex items-center justify-center gap-2 ${props.className ?? ''}`}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2 text-[#1A1C1E]">
        <span className="w-5 h-5 border-2 border-[#1A1C1E] border-t-transparent rounded-full animate-spin" />
        {loadingLabel}
      </span>
    ) : (
      children
    )}
  </button>
);

// --- Step 1: Credentials ----------------------------------------------------

interface StepCredentialsProps {
  t: ReturnType<typeof Object.values>[0];
  mode: AuthIntent;
  setMode: (mode: AuthIntent) => void;
  onSend: () => void;
  loading: boolean;
  errorMsg: string;
  nickname: string;
  email: string;
  setNickname: (v: string) => void;
  setEmail: (v: string) => void;
}
const StepCredentials: React.FC<StepCredentialsProps> = ({
  t, mode, setMode, onSend, loading, errorMsg, nickname, email, setNickname, setEmail,
}) => {
  const [agreed, setAgreed] = useState(false);
  const isSignup = mode === 'signup';

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <p className="text-xs font-bold text-[#3a9e68] tracking-widest uppercase mb-1">
          {isSignup ? t.getStarted : t.welcomeBack}
        </p>
        <h2 className="text-2xl font-bold text-[#1A1C1E] tracking-tight leading-tight font-sans">
          {isSignup ? t.signUp : t.logIn}
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[#6B7280]">
          {isSignup ? t.signUpHint : t.logInHint}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border-1.5 border-[#1A1C1E] bg-white p-1 shadow-[3px_3px_0px_0px_#1A1C1E]">
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`min-h-[42px] rounded-lg px-3 text-sm font-bold transition ${
            isSignup ? 'bg-[#56be89] text-[#1A1C1E]' : 'bg-white text-[#6B7280]'
          }`}
        >
          {t.signUp}
        </button>
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`min-h-[42px] rounded-lg px-3 text-sm font-bold transition ${
            !isSignup ? 'bg-[#56be89] text-[#1A1C1E]' : 'bg-white text-[#6B7280]'
          }`}
        >
          {t.logIn}
        </button>
      </div>

      {isSignup && (
        <InputField
          label={t.nickname}
          type="text"
          placeholder={t.nicknamePlaceholder}
          autoComplete="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      )}
      <InputField
        label={t.emailLabel}
        type="email"
        placeholder={t.email}
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {isSignup && (
        <label className="flex gap-3 cursor-pointer items-center select-none group">
          <input
            type="checkbox"
            className="w-4 h-4 min-w-[18px] min-h-[18px] accent-[#56be89] cursor-pointer rounded-sm border-1.5 border-[#1A1C1E] bg-white"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-sm font-medium text-[#6B7280] group-hover:text-[#1A1C1E] transition-colors leading-relaxed font-sans">
            {t.agree}
          </span>
        </label>
      )}

      {errorMsg && (
        <p className="text-[#1A1C1E] text-sm bg-red-50 border-1.5 border-[#1A1C1E] rounded-xl px-4 py-3 font-medium shadow-[3px_3px_0px_0px_#1A1C1E]">
          {errorMsg}
        </p>
      )}

      <div className="pt-2">
        <PrimaryButton onClick={onSend} loading={loading} loadingLabel={t.saving} disabled={(isSignup && !agreed) || loading || !email.trim()}>
          {t.sendCode}
        </PrimaryButton>
      </div>
    </div>
  );
};

// --- Step 2: OTP Verify -----------------------------------------------------

interface StepVerifyProps {
  t: ReturnType<typeof Object.values>[0];
  code: string;
  setCode: (v: string) => void;
  onVerify: () => void;
  loading: boolean;
  errorMsg: string;
  timeLeft: number;
  onResend: () => void;
}
const StepVerify: React.FC<StepVerifyProps> = ({
  t, code, setCode, onVerify, loading, errorMsg, timeLeft, onResend,
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <p className="text-xs font-bold text-[#6B7280] tracking-widest uppercase mb-1">{t.verification}</p>
        <h2 className="text-2xl font-bold text-[#1A1C1E] tracking-tight leading-tight">{t.verifyCode}</h2>
        <p className="text-sm font-medium text-[#6B7280] mt-1.5 font-sans">{t.enterCode}</p>
      </div>

      <InputField
        label={t.oneTimeCode}
        type="text"
        inputMode="numeric"
        placeholder={t('auth.otpPlaceholder')}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {errorMsg && (
        <p className="text-[#1A1C1E] text-sm bg-red-50 border-1.5 border-[#1A1C1E] rounded-xl px-4 py-3 font-medium">
          {errorMsg}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onResend}
          className="text-sm font-bold text-[#6B7280] hover:text-[#1A1C1E] underline underline-offset-4 transition-colors"
          disabled={timeLeft > 0}
        >
          {timeLeft > 0 ? `${t.resend} (${timeLeft}s)` : t.resend}
        </button>

        <div className="w-1/2">
          <PrimaryButton onClick={onVerify} loading={loading} loadingLabel={t.saving} disabled={loading || code.trim().length === 0}>
            {t.verify || 'Verify'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

interface StepSuccessProps {
  onContinue: () => void;
  t: ReturnType<typeof Object.values>[0];
}
const StepSuccess: React.FC<StepSuccessProps> = ({ onContinue, t }) => (
  <div className="space-y-6 text-center py-4">
    <div className="mx-auto w-20 h-20 rounded-full bg-[#eaf5ef] flex items-center justify-center border-1.5 border-[#1A1C1E] shadow-[4px_4px_0px_0px_#1A1C1E]">
      <CheckCircle2 className="text-[#56be89]" size={36} strokeWidth={2.5} />
    </div>
    <div className="space-y-1.5">
      <h3 className="text-2xl font-bold text-[#1A1C1E] tracking-tight">{t.welcome}</h3>
      <p className="text-sm font-medium text-[#6B7280]">{t.verified}</p>
    </div>
    <div className="pt-2 w-full">
      <PrimaryButton onClick={onContinue}>{t.continue}</PrimaryButton>
    </div>
  </div>
);

// --- Main Component ----------------------------------------------------------

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage, t: i18nT } = useLanguage();
  const { session } = useAuth();

  // Build a lightweight translation object used by this page (legacy shape preserved)
  const t = {
    getStarted: i18nT('auth.getStarted'),
    welcomeBack: i18nT('auth.welcomeBack'),
    signUp: i18nT('auth.signUp'),
    logIn: i18nT('auth.logIn'),
    signUpHint: i18nT('auth.signUpHint'),
    logInHint: i18nT('auth.logInHint'),
    nickname: i18nT('auth.nickname'),
    nicknamePlaceholder: i18nT('auth.nicknamePlaceholder'),
    emailLabel: i18nT('auth.emailLabel'),
    agree: i18nT('auth.agree'),
    sendCode: i18nT('auth.sendCode'),
    saving: i18nT('common.saving') || i18nT('common.loading') || 'Saving...',
    verification: i18nT('auth.verification'),
    verifyCode: i18nT('auth.verifyCode'),
    enterCode: i18nT('auth.enterCode'),
    oneTimeCode: i18nT('auth.oneTimeCode'),
    resend: i18nT('auth.resend'),
    verify: i18nT('auth.verify'),
    welcome: i18nT('auth.welcome'),
    verified: i18nT('auth.verified'),
    continue: i18nT('common.continue'),
    invalidCode: i18nT('auth.invalidCode'),
  } as const;

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<AuthIntent>('signup');
  const [nextRoute, setNextRoute] = useState<'/onboarding' | '/dashboard'>('/onboarding');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!session || step !== 1) return;

    const redirectAuthenticatedUser = async () => {
      const profile = await getProfile(session.user.id);
      navigate(getPostAuthRedirect(profile), { replace: true });
    };

    void redirectAuthenticatedUser();
  }, [session, step, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const handleSendCode = async () => {
    setLoading(true);
    setErrorMsg('');
    const formattedEmail = email.trim().toLowerCase();
    const signupMetadata = mode === 'signup' ? { nickname: nickname.trim() || 'DailyStack Member' } : undefined;

    try {
      const result = await sendOtp(formattedEmail, { shouldCreateUser: mode === 'signup', data: signupMetadata });
      const { error } = result;
      if (!error) {
        setStep(2);
        setTimeLeft(60);
      } else {
        setErrorMsg(error.message);
      }
    } catch (err) {
      console.error('[AuthPage] sendOtp failed', err);
      setErrorMsg('Network error: failed to send sign-in code.');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: 'email',
      });

      if (error) {
        setErrorMsg(t.invalidCode);
        return;
      }

      const verifiedUser = data.user ?? (await supabase.auth.getUser()).data.user;
      if (!verifiedUser) {
        setErrorMsg(t.invalidCode);
        return;
      }

      const profile = await ensureUserProfile(
        verifiedUser.id,
        email,
        mode === 'signup' ? nickname : undefined,
      );
      setNextRoute(getPostAuthRedirect(profile));
      setStep(3);
    } catch (error) {
      console.error('[AuthPage] signup profile save failed', error);
      setErrorMsg(t.invalidCode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EditorialShell language={language} onToggleLanguage={toggleLanguage}>
      <div className="mb-8 flex justify-center items-center min-h-[48px]">
        <DailyStackLogo altText={i18nT('common.appName')} />
      </div>

      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <StepCredentials
          t={t}
          mode={mode}
          setMode={setMode}
          onSend={handleSendCode}
          loading={loading}
          errorMsg={errorMsg}
          nickname={nickname}
          email={email}
          setNickname={setNickname}
          setEmail={setEmail}
        />
      )}

      {step === 2 && (
        <StepVerify
          t={t}
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
          onContinue={() => navigate(nextRoute, { state: { nickname } })}
        />
      )}
    </EditorialShell>
  );
};

export default AuthPage;
