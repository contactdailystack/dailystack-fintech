/**
 * DailyStack — Forgot Password Page
 * Features:
 * - Request password reset email
 * - Generic message to prevent email enumeration (enumeration-proof)
 * - Cooldown resend timer of 60s
 * - Link back to login
 * - Bilingual support
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { Shell, Button, FadeUp, PageTransition } from '../components/DesignSystem';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage() as any;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Real-time email validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!value) {
      setEmailError(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError(lang === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  const handleSendReset = async () => {
    if (!email || emailError) {
      setEmailError(lang === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Secure forgot password (generic success shown always to prevent email enumeration)
      await AuthService.forgotPassword(email);
      setSubmitted(true);
      setCooldown(60); // 60 seconds resend cooldown
    } catch (err: any) {
      // Fail silently but show success to protect user accounts
      setSubmitted(true);
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendReset();
  };

  const t = {
    en: {
      title: 'Reset Your Password',
      tagline: 'We\'ll send you a recovery link',
      enterEmail: 'Email address',
      sendReset: 'Send Reset Link',
      backToLogin: 'Back to Login',
      submitted: 'Check Your Email',
      submittedMessage: 'If an account exists with this email, you\'ll receive a password reset link shortly. The link expires in 1 hour.',
      resendEmail: 'Didn\'t receive it?',
      resendLink: 'Resend email',
      resendCooldown: 'Resend in',
      checkSpam: 'Don\'t forget to check your spam folder.',
    },
    th: {
      title: 'รีเซ็ตรหัสผ่าน',
      tagline: 'เราจะส่งลิงก์สำหรับการกู้คืน',
      enterEmail: 'อีเมล',
      sendReset: 'ส่งลิงก์',
      backToLogin: 'กลับไปเข้าสู่ระบบ',
      submitted: 'ตรวจสอบอีเมลของคุณ',
      submittedMessage: 'หากมีบัญชีที่ใช้อีเมลนี้ คุณจะได้รับลิงก์สำหรับรีเซ็ตรหัสผ่านในเร็วๆ นี้ ลิงก์หมดอายุใน 1 ชั่วโมง',
      resendEmail: 'ไม่ได้รับ?',
      resendLink: 'ส่งอีเมลใหม่',
      resendCooldown: 'ส่งใหม่ใน',
      checkSpam: 'อย่าลืมตรวจสอบโฟลเดอร์ spam',
    },
  };

  return (
    <Shell className="min-h-screen flex flex-col items-center justify-center p-4">
      <PageTransition>
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <FadeUp delay={0.1}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-black leading-tight" style={{ fontFamily: 'var(--font)' }}>{t[lang as 'en' | 'th'].title}</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-2">
                  {t[lang as 'en' | 'th'].tagline}
                </p>
              </div>
              <button
                onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
                className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--surface-card)] hover:bg-[var(--lime)]/10"
              >
                {lang === 'en' ? 'ไทย' : 'EN'}
              </button>
            </div>
          </FadeUp>

          {!submitted ? (
            <FadeUp delay={0.2}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t[lang as 'en' | 'th'].enterEmail}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-xl bg-[var(--surface-card)] border transition-all focus:outline-none focus:ring-2 ${
                      emailError
                        ? 'border-red-500 focus:ring-red-500/40'
                        : 'border-[var(--border-subtle)] focus:ring-[var(--lime)]/40'
                    } disabled:opacity-50`}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 mt-2">{emailError}</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <Button disabled={!email || !!emailError || loading} loading={loading}>
                  {t[lang as 'en' | 'th'].sendReset}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {t[lang as 'en' | 'th'].backToLogin}
                </button>
              </form>
            </FadeUp>
          ) : (
            <FadeUp delay={0.2}>
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--lime)]/10 border border-[var(--lime)]/30 mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-[var(--lime)] text-2xl">mail</span>
                </div>

                <div>
                  <h2 className="text-xl font-bold">{t[lang as 'en' | 'th'].submitted}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
                    {t[lang as 'en' | 'th'].submittedMessage}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t[lang as 'en' | 'th'].checkSpam}
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleSendReset}
                    disabled={loading || cooldown > 0}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--lime)] text-[#161f00] font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {cooldown > 0 
                      ? `${t[lang as 'en' | 'th'].resendCooldown} ${cooldown}s` 
                      : t[lang as 'en' | 'th'].resendLink}
                  </button>

                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold hover:bg-[var(--surface-card)] transition-all"
                  >
                    {t[lang as 'en' | 'th'].backToLogin}
                  </button>
                </div>
              </div>
            </FadeUp>
          )}
        </div>
      </PageTransition>
    </Shell>
  );
};

export default ForgotPasswordPage;
