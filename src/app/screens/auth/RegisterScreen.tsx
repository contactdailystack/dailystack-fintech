import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabaseClient';

interface RegisterScreenProps {
  onNextStep: (email: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNextStep }) => {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const fontClass = language === 'th' ? 'font-kanit' : 'font-sans';

  const isValidEmail = (emailStr: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSendCode = async (): Promise<void> => {
    if (!email || !isValidEmail(email)) {
      setError(true);
      return;
    }

    setError(false);
    setIsSending(true);

    try {
      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (supabaseError) throw supabaseError;

      onNextStep(email.trim());
    } catch (err: any) {
      console.error('Supabase OTP Trigger Failure:', err.message || err);
      alert('Failed to send verification code. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center w-full px-5 py-8 bg-[var(--semantic-bg)] ${fontClass}`}>
      <div className="ds-card w-full max-w-md p-6 space-y-8 animate-feature-in">
        <div className="space-y-3 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {t('joinEcosystem')}
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {t('enterEmail')}
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[var(--text-primary)]">
            {t('emailLabel')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(false); }}
            className={`input w-full ${error ? 'input-error' : ''}`}
            placeholder="hello@dailystack.io"
          />
          {error && (
            <p className="text-xs text-[var(--state-error)] font-kanit mt-2">
              Please enter a valid email address.
            </p>
          )}
        </div>

        <button
          onClick={handleSendCode}
          disabled={isSending}
          className="btn w-full justify-center rounded-full"
        >
          {isSending ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0D1117]/30 border-t-[#0D1117] animate-spin" />
          ) : (
            <span>{t('btnContinue')}</span>
          )}
        </button>
      </div>
    </div>
  );
};