/**
 * DailyStack — Sign Up Page (Email + Password)
 * Features:
 * - Real-time email validation + duplicate check
 * - Login redirection link ("Already registered. Log in instead?")
 * - Prefills email from URL search params
 * - Password strength meter
 * - Show/hide password toggles
 * - Password confirmation check
 * - Bilingual support (EN/TH)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import { useLanguage } from '../context/LanguageContext';
import { Shell, Button, FadeUp, PageTransition } from '../components/DesignSystem';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang, setLang } = useLanguage() as any;

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'password' | 'success'>('email');

  // Password strength
  const passwordStrength = usePasswordStrength(password);
  const passwordsMatch = password === passwordConfirm && password.length > 0;

  // Prefill email from query parameter on mount
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Debounced email validation and check
  useEffect(() => {
    const validateEmail = async () => {
      if (!email) {
        setEmailError(null);
        return;
      }

      // Basic format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError(lang === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email address');
        return;
      }

      // Check if email exists
      setEmailChecking(true);
      try {
        const { exists } = await AuthService.checkEmailExists(email);
        if (exists) {
          setEmailError(
            lang === 'th'
              ? 'อีเมลนี้ลงทะเบียนแล้ว '
              : 'Already registered. '
          );
        } else {
          setEmailError(null);
        }
      } catch (err) {
        console.error('Email check error:', err);
        setEmailError(null); // Don't block signup on error
      } finally {
        setEmailChecking(false);
      }
    };

    const timer = setTimeout(validateEmail, 500);
    return () => clearTimeout(timer);
  }, [email, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 'email') {
      if (!email) {
        setEmailError(lang === 'th' ? 'กรุณากรอกอีเมล' : 'Please enter your email');
        return;
      }
      if (emailError) {
        return;
      }
      setStep('password');
      return;
    }

    if (step === 'password') {
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
        const result = await AuthService.signUpWithPassword(email, password);
        if (!result.success) {
          setError(result.error || (lang === 'th' ? 'ลงทะเบียนล้มเหลว' : 'Sign up failed'));
          return;
        }

        setStep('success');
        setTimeout(() => {
          navigate('/onboarding', { replace: true });
        }, 1500);
      } catch (err: any) {
        setError(lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Something went wrong. Please try again');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate(`/login?email=${encodeURIComponent(email)}`);
  };

  const t = {
    en: {
      title: 'Create Your Account',
      tagline: 'Join DailyStack',
      enterEmail: 'Enter your email',
      enterPassword: 'Create a password',
      confirmPassword: 'Confirm password',
      createAccount: 'Create Account',
      haveAccount: 'Already have an account?',
      logIn: 'Log In',
      next: 'Next',
      passwordStrength: 'Password strength',
      show: 'Show',
      hide: 'Hide',
      back: 'Back',
      success: "You're all set!",
      redirecting: 'Setting up your profile...',
      logInLink: 'Log in instead?',
    },
    th: {
      title: 'สร้างบัญชี',
      tagline: 'เข้าร่วม DailyStack',
      enterEmail: 'กรอกอีเมลของคุณ',
      enterPassword: 'ตั้งรหัสผ่าน',
      confirmPassword: 'ยืนยันรหัสผ่าน',
      createAccount: 'สร้างบัญชี',
      haveAccount: 'มีบัญชีแล้ว?',
      logIn: 'เข้าสู่ระบบ',
      next: 'ถัดไป',
      passwordStrength: 'ความแข็งแกร่ง',
      show: 'แสดง',
      hide: 'ซ่อน',
      back: 'กลับ',
      success: 'สำเร็จแล้ว!',
      redirecting: 'กำลังตั้งค่าโปรไฟล์...',
      logInLink: 'เข้าสู่ระบบแทน?',
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

          {/* Email Step */}
          {step === 'email' && (
            <FadeUp delay={0.2}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t[lang as 'en' | 'th'].enterEmail}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`ds-input ${emailError ? 'ds-input-error' : ''}`}
                  />
                  {emailChecking && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                      {lang === 'th' ? 'กำลังตรวจสอบ...' : 'Checking...'}
                    </p>
                  )}
                  {emailError && (
                    <p className="text-xs text-red-500 mt-2">
                      {emailError}
                      {emailError.includes('Already registered') || emailError.includes('ลงทะเบียนแล้ว') ? (
                        <button
                          type="button"
                          onClick={handleLoginRedirect}
                          className="text-[var(--lime)] font-semibold hover:underline ml-1"
                        >
                          {t[lang as 'en' | 'th'].logInLink}
                        </button>
                      ) : null}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  fullWidth
                  disabled={!email || !!emailError || emailChecking}
                  loading={emailChecking}
                >
                  {t[lang as 'en' | 'th'].next}
                </Button>

                <p className="text-center text-sm text-[var(--text-secondary)]">
                  {t[lang as 'en' | 'th'].haveAccount}{' '}
                  <button
                    type="button"
                    onClick={handleLoginRedirect}
                    className="text-[var(--lime)] font-semibold hover:underline"
                  >
                    {t[lang as 'en' | 'th'].logIn}
                  </button>
                </p>
              </form>
            </FadeUp>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <FadeUp delay={0.2}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Input */}
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
                      className="ds-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                      className={`ds-input pr-12 ${
                        passwordConfirm && !passwordsMatch ? 'ds-input-error' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  disabled={!passwordStrength.isValid || !passwordsMatch || loading}
                  loading={loading}
                >
                  {t[lang as 'en' | 'th'].createAccount}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError(null);
                  }}
                  className="w-full text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {t[lang as 'en' | 'th'].back}
                </button>
              </form>
            </FadeUp>
          )}

          {/* Success State */}
          {step === 'success' && (
            <FadeUp delay={0.2}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--lime)] mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">check</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{t[lang as 'en' | 'th'].success}</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    {t[lang as 'en' | 'th'].redirecting}
                  </p>
                </div>
              </div>
            </FadeUp>
          )}
        </div>
      </PageTransition>
    </Shell>
  );
};

export default SignUpPage;
