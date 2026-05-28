import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabaseClient';

interface VerificationScreenProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({ email, onBack, onSuccess }) => {
  const { language, t } = useLanguage();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fontClass = language === 'th' ? 'font-kanit' : 'font-sans';

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string): void => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (): Promise<void> => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;

    setIsVerifying(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: fullCode,
        type: 'signup',
      });

      if (verifyError) {
        const { error: signinFallbackError } = await supabase.auth.verifyOtp({
          email,
          token: fullCode,
          type: 'signin',
        });
        if (signinFallbackError) throw signinFallbackError;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Supabase OTP Verification Failure:', err.message || err);
      alert('OTP verification failed. Please check the code and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const canSubmit = code.join('').length === 6;

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center w-full px-5 py-8 bg-[var(--semantic-bg)] ${fontClass}`}>
      <div className="ds-card w-full max-w-md p-6 space-y-8 animate-feature-in">
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {t('verifyEmail')}
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {t('codeSent')} <strong className="text-[var(--brand-500)] font-semibold">{email}</strong>
          </p>
        </div>

        <div className="grid grid-cols-6 gap-3 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="input h-14 text-2xl font-bold text-center tracking-wide rounded-2xl"
            />
          ))}
        </div>

        <button
          onClick={verifyCode}
          disabled={isVerifying || !canSubmit}
          className="btn w-full justify-center rounded-full"
        >
          {isVerifying ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0D1117]/30 border-t-[#0D1117] animate-spin" />
          ) : (
            <span>{t('btnVerify')}</span>
          )}
        </button>

        <div className="text-center text-sm">
          {timeLeft > 0 ? (
            <p className="text-[var(--text-muted)]">
              {t('didNotReceive')} <span className="text-[var(--brand-500)] font-semibold tabular-nums">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setTimeLeft(600)}
              className="text-[var(--brand-500)] font-semibold hover:underline"
            >
              {t('resendBtn')}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>{t('backToEmail')}</span>
        </button>
      </div>
    </div>
  );
};