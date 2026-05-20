import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabaseClient';

interface RegisterScreenProps {
  onNextStep: (email: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNextStep }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

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
      // ────────────────────────────────────────────────────────
      // 🔥 SUPABASE AUTH INTEGRATION: SIGN IN WITH OTP
      // ────────────────────────────────────────────────────────
      const { error: supabaseError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true, // บันทึกสร้าง User อัตโนมัติหากเป็นอีเมลใหม่ในเครือข่ายร่วม
        },
      });

      if (supabaseError) throw supabaseError;
      
      // ส่งต่อพิกัด Email ไปยังหน้า Verification
      onNextStep(email.trim());
    } catch (err: any) {
      console.error('Supabase OTP Trigger Failure:', err.message || err);
      alert('เกิดข้อผิดพลาดในการจัดส่งรหัสยืนยันตัวตนครับ กรุณาตรวจสอบและลองใหม่อีกครั้งครับ');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-2 tracking-tight">
          {t('joinEcosystem')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('enterEmail')}
        </p>
      </div>

      <div className="w-full relative mb-6">
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
          {t('emailLabel')}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(false); }}
          className={`w-full bg-[var(--color-dark-input)] border ${
            error 
              ? 'border-red-400 focus:ring-red-400/20' 
              : 'border-[var(--color-dark-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary-glow)]'
          } rounded-xl text-[var(--color-text-main)] font-space text-base px-4 py-3.5 transition-all outline-none focus:ring-4`}
          placeholder="hello@dailystack.io"
        />
        {error && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1.5">
            <span className="font-medium">กรุณาระบุรูปแบบอีเมลให้ถูกต้องครับ</span>
          </p>
        )}
      </div>

      <button
        onClick={handleSendCode}
        disabled={isSending}
        className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-dark-bg)] font-space font-semibold text-base py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(86,190,137,0.15)] disabled:opacity-70 disabled:transform-none flex justify-center items-center gap-2"
      >
        {isSending ? (
          <div className="w-5 h-5 border-2 border-[var(--color-dark-bg)]/30 border-t-[var(--color-dark-bg)] rounded-full animate-spin" />
        ) : (
          <span>{t('btnContinue')}</span>
        )}
      </button>
    </div>
  );
};