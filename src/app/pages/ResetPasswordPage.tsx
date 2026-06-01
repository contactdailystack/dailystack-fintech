/**
 * DailyStack — Reset Password Page
 * Used when user clicks reset link from email
 * Features:
 * - New password + confirm password
 * - Password strength meter
 * - Show/hide password toggle
 * - Token validation
 * - Bilingual support
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import { useLanguage } from '../context/LanguageContext';
import { Shell, Button, FadeUp, PageTransition } from '../components/DesignSystem';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang, setLang } = useLanguage() as any;

  const token = searchParams.get('token') || searchParams.get('code');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const passwordStrength = usePasswordStrength(password);
  const passwordsMatch = password === passwordConfirm && password.length > 0;

  useEffect(() => {
    if (!token) {
      setError(lang === 'th' ? 'ลิงก์ไม่ถูกต้อง' : 'Invalid reset link');
    }
  }, [token, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordStrength.isValid) {
      setError(lang === 'th' ? 'รหัสผ่านต้องมี 8 ตัวอักษรขึ้นไป' : 'Password must be at least 8 characters');
      return;
    }

    if (!passwordsMatch) {
      setError(lang === 'th' ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.resetPassword(password);

      if (result.success) {
        setSubmitted(true);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } else {
        setError(result.error || (lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Failed to reset password'));
      }
    } catch (err: any) {
      setError(err.message || (lang === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: 'Create New Password',
      tagline: 'Secure your account',
      enterPassword: 'New password',
      confirmPassword: 'Confirm password',
      resetPassword: 'Reset Password',
      passwordStrength: 'Password strength',
      show: 'Show',
      hide: 'Hide',
      success: 'Password reset successful!',
      redirecting: 'Redirecting to dashboard...',
      invalidLink: 'This reset link is invalid or has expired.',
      requestNew: 'Request a new reset link',
    },
    th: {
      title: 'ตั้งรหัสผ่านใหม่',
      tagline: 'รักษาความปลอดภัยบัญชีของคุณ',
      enterPassword: 'รหัสผ่านใหม่',
      confirmPassword: 'ยืนยันรหัสผ่าน',
      resetPassword: 'รีเซ็ตรหัสผ่าน',
      passwordStrength: 'ความแข็งแกร่ง',
      show: 'แสดง',
      hide: 'ซ่อน',
      success: 'รีเซ็ตรหัสผ่านสำเร็จ!',
      redirecting: 'กำลังไปยังหน้าแดชบอร์ด...',
      invalidLink: 'ลิงก์นี้ไม่ถูกต้องหรือหมดอายุแล้ว',
      requestNew: 'ขอลิงก์ใหม่',
    },
  };

  // Invalid token state
  if (!token) {
    return (
      <Shell className="min-h-screen flex flex-col items-center justify-center p-4">
        <PageTransition>
          <div className="w-full max-w-md space-y-8 text-center">
            <FadeUp delay={0.1}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-[28px] font-black leading-tight">{t[lang as 'en' | 'th'].title}</h1>
                </div>
                <button
                  onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--surface-card)]"
                >
                  {lang === 'en' ? 'ไทย' : 'EN'}
                </button>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-red-500">{t[lang as 'en' | 'th'].invalidLink}</h2>
              </div>

              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full px-4 py-3 rounded-xl bg-[var(--lime)] text-white font-semibold hover:shadow-lg transition-all"
              >
                {t[lang as 'en' | 'th'].requestNew}
              </button>
            </FadeUp>
          </div>
        </PageTransition>
      </Shell>
    );
  }

  // Success state
  if (submitted) {
    return (
      <Shell className="min-h-screen flex flex-col items-center justify-center p-4">
        <PageTransition>
          <div className="w-full max-w-md space-y-8 text-center">
            <FadeUp delay={0.1}>
              <div className="w-16 h-16 rounded-full bg-[var(--lime)] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">check</span>
              </div>

              <div>
                <h2 className="text-xl font-bold">{t[lang as 'en' | 'th'].success}</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  {t[lang as 'en' | 'th'].redirecting}
                </p>
              </div>
            </FadeUp>
          </div>
        </PageTransition>
      </Shell>
    );
  }

  // Form state
  return (
    <Shell className="min-h-screen flex flex-col items-center justify-center p-4">
      <PageTransition>
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <FadeUp delay={0.1}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-black leading-tight">{t[lang as 'en' | 'th'].title}</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-2">
                  {t[lang as 'en' | 'th'].tagline}
                </p>
              </div>
              <button
                onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
                className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--surface-card)]"
              >
                {lang === 'en' ? 'ไทย' : 'EN'}
              </button>
            </div>
          </FadeUp>

          {/* Form */}
          <FadeUp delay={0.2}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t[lang as 'en' | 'th'].enterPassword}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--lime)]/40 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                  >
                    {showPassword ? t[lang as 'en' | 'th'].hide : t[lang as 'en' | 'th'].show}
                  </button>
                </div>

                {/* Strength Meter */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">
                        {t[lang as 'en' | 'th'].passwordStrength}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength.level === 'strong'
                            ? 'text-green-500'
                            : passwordStrength.level === 'good'
                            ? 'text-[var(--lime)]'
                            : passwordStrength.level === 'fair'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}
                      >
                        {passwordStrength.level.toUpperCase()}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--surface-card)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          passwordStrength.level === 'strong'
                            ? 'bg-green-500'
                            : passwordStrength.level === 'good'
                            ? 'bg-[var(--lime)]'
                            : passwordStrength.level === 'fair'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="text-xs text-[var(--text-secondary)] space-y-1 mt-2">
                        {passwordStrength.feedback.map((msg, i) => (
                          <li key={i}>• {msg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t[lang as 'en' | 'th'].confirmPassword}
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-[var(--surface-card)] border transition-all focus:outline-none focus:ring-2 ${
                      passwordConfirm && !passwordsMatch
                        ? 'border-red-500 focus:ring-red-500/40'
                        : 'border-[var(--border-subtle)] focus:ring-[var(--lime)]/40'
                    } disabled:opacity-50`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                  >
                    {showPasswordConfirm ? t[lang as 'en' | 'th'].hide : t[lang as 'en' | 'th'].show}
                  </button>
                </div>
                {passwordConfirm && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-2">
                    {lang === 'th' ? 'รหัสผ่านไม่ตรงกัน' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button disabled={!passwordStrength.isValid || !passwordsMatch || loading} loading={loading}>
                {t[lang as 'en' | 'th'].resetPassword}
              </Button>
            </form>
          </FadeUp>
        </div>
      </PageTransition>
    </Shell>
  );
};

export default ResetPasswordPage;
