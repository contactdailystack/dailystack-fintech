import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabaseClient';

interface VerificationScreenProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({ email, onBack, onSuccess }) => {
  const { t } = useLanguage();
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string): void => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
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
      // ────────────────────────────────────────────────────────
      // 🔥 SUPABASE AUTH INTEGRATION: VERIFY OTP (SIGNUP MODE)
      // ────────────────────────────────────────────────────────
      let { error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: fullCode,
        type: 'signup',
      });

      // Fallback Strategy: ตรวจสอบในกรณีผู้ใช้งานเคยลงทะเบียนผ่านเซสชันเดิมแล้ว (Signin Mode)
      if (verifyError) {
        const { error: signinFallbackError } = await supabase.auth.verifyOtp({
          email: email,
          token: fullCode,
          type: 'signin',
        });
        if (signinFallbackError) throw signinFallbackError;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Supabase OTP Verification Failure:', err.message || err);
      alert('รหัส OTP ไม่ถูกต้องหรือรหัสผ่านเวลาการใช้งานแล้วครับ กรุณาตรวจสอบใหม่อีกครั้งครับ');
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-2 tracking-tight">{t('verifyEmail')}</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('codeSent')} <strong className="text-[var(--color-primary)] font-semibold">{email}</strong>
        </p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3 mb-8 w-full">
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
            className="w-12 h-14 sm:w-14 sm:h-16 bg-[var(--color-dark-input)] border border-[var(--color-dark-border)] rounded-xl text-2xl font-bold text-center text-[var(--color-text-main)] font-space transition-all focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-glow)] focus:-translate-y-0.5"
          />
        ))}
      </div>

      <button
        onClick={verifyCode}
        disabled={isVerifying || code.join('').length !== 6}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-dark-bg)] font-space font-semibold text-base py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2 mb-6"
      >
         {isVerifying ? <div className="w-5 h-5 border-2 border-[var(--color-dark-bg)]/30 border-t-[var(--color-dark-bg)] rounded-full animate-spin" /> : <span>{t('btnVerify')}</span>}
      </button>

      <div className="text-center text-sm mb-6">
        {timeLeft > 0 ? (
          <p className="text-[var(--color-text-secondary)]">
            {t('didNotReceive')} <span className="text-[var(--color-primary)] font-bold tabular-nums ml-1">{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <button onClick={() => setTimeLeft(600)} className="text-[var(--color-primary)] font-semibold hover:underline">
            {t('resendBtn')}
          </button>
        )}
      </div>

      <button onClick={onBack} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors flex items-center gap-1.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        <span>{t('backToEmail')}</span>
      </button>
    </div>
  );
};