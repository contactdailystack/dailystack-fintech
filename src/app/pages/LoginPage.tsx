/**
 * DailyStack — Log In Page (Email + Password)
 * Features:
 * - Email + Password login
 * - Real-time debounced email check ("No account found. Sign up instead?")
 * - Prefills email from URL search params
 * - Rate limiting (5 attempts = 15 min lockout) with active countdown
 * - Show/hide password toggle
 * - Forgot password link
 * - Bilingual support (EN/TH)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { useRateLimit } from '../../hooks/useRateLimit';
import { useLanguage } from '../context/LanguageContext';
import { Shell, Button, FadeUp, PageTransition } from '../components/DesignSystem';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang, setLang } = useLanguage() as any;
  const { getState, recordFailure, reset } = useRateLimit();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState(getState());

  // Prefill email from query parameter on mount
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Countdown timer for rate limiting lockout
  useEffect(() => {
    if (!rateLimit.isLocked) return;

    const timer = setInterval(() => {
      const state = getState();
      setRateLimit(state);
      if (!state.isLocked) {
        setError(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimit.isLocked]);

  // Real-time debounced email validation and check
  useEffect(() => {
    const checkEmail = async () => {
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

      setEmailChecking(true);
      try {
        const { exists } = await AuthService.checkEmailExists(email);
        if (!exists) {
          setEmailError(
            lang === 'th'
              ? 'ไม่พบอีเมลในระบบ '
              : 'No account found. '
          );
        } else {
          setEmailError(null);
        }
      } catch (err) {
        setEmailError(null);
      } finally {
        setEmailChecking(false);
      }
    };

    const timer = setTimeout(checkEmail, 500);
    return () => clearTimeout(timer);
  }, [email, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rate Limit Check
    if (rateLimit.isLocked) {
      const minutesLeft = Math.ceil(rateLimit.secondsUntilReset / 60);
      setError(
        lang === 'th'
          ? `ความพยายามมากเกินไป กรุณาลองใหม่ในอีก ${minutesLeft} นาที`
          : `Too many attempts. Try again in ${rateLimit.secondsUntilReset} seconds`
      );
      return;
    }

    if (!email || emailError) {
      setEmailError(lang === 'th' ? 'กรุณากรอกอีเมลที่ถูกต้อง' : 'Please enter a valid email address');
      return;
    }

    if (!password) {
      setError(lang === 'th' ? 'กรุณากรอกรหัสผ่าน' : 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.signInWithEmail(email, password);

      if (!result.success) {
        // Record failure for rate limiting
        const newState = recordFailure();
        setRateLimit(newState);

        if (newState.isLocked) {
          setError(
            lang === 'th'
              ? 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ในอีก 15 นาที'
              : 'Too many attempts. Try again in 15 minutes'
          );
        } else {
          setError(
            lang === 'th'
              ? 'รหัสผ่านไม่ถูกต้อง'
              : 'Incorrect password'
          );
        }
        return;
      }

      // Success - reset rate limit & auto login state
      reset();
      navigate(result.isNewUser ? '/onboarding' : '/dashboard', { replace: true });
    } catch (err: any) {
      setError(lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' : 'Something went wrong. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate(`/signup?email=${encodeURIComponent(email)}`);
  };

  const t = {
    en: {
      title: 'Welcome Back',
      tagline: 'Log in to DailyStack',
      enterEmail: 'Email address',
      enterPassword: 'Password',
      logIn: 'Log In',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      forgotPassword: 'Forgot password?',
      show: 'Show',
      hide: 'Hide',
      signUpLink: 'Sign up instead?',
    },
    th: {
      title: 'ยินดีต้อนรับกลับ',
      tagline: 'เข้าสู่ระบบ DailyStack',
      enterEmail: 'อีเมล',
      enterPassword: 'รหัสผ่าน',
      logIn: 'เข้าสู่ระบบ',
      noAccount: 'ยังไม่มีบัญชี?',
      signUp: 'สร้างบัญชี',
      forgotPassword: 'ลืมรหัสผ่าน?',
      show: 'แสดง',
      hide: 'ซ่อน',
      signUpLink: 'สร้างบัญชีแทน?',
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

          {/* Form */}
          <FadeUp delay={0.2}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t[lang as 'en' | 'th'].enterEmail}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={rateLimit.isLocked}
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
                    {emailError.includes('No account found') || emailError.includes('ไม่พบอีเมล') ? (
                      <button
                        type="button"
                        onClick={handleSignUpRedirect}
                        className="text-[var(--lime)] font-semibold hover:underline ml-1"
                      >
                        {t[lang as 'en' | 'th'].signUpLink}
                      </button>
                    ) : null}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold">
                    {t[lang as 'en' | 'th'].enterPassword}
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-[var(--lime)] hover:underline font-semibold"
                  >
                    {t[lang as 'en' | 'th'].forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={rateLimit.isLocked}
                    className="ds-input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={rateLimit.isLocked}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                  >
                    {showPassword ? t[lang as 'en' | 'th'].hide : t[lang as 'en' | 'th'].show}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                disabled={!email || !password || loading || rateLimit.isLocked || !!emailError}
                loading={loading}
              >
                {rateLimit.isLocked
                  ? `${t[lang as 'en' | 'th'].logIn} (${rateLimit.secondsUntilReset}s)`
                  : t[lang as 'en' | 'th'].logIn}
              </Button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-[var(--text-secondary)]">
                {t[lang as 'en' | 'th'].noAccount}{' '}
                <button
                  type="button"
                  onClick={handleSignUpRedirect}
                  className="text-[var(--lime)] font-semibold hover:underline"
                >
                  {t[lang as 'en' | 'th'].signUp}
                </button>
              </p>
            </form>
          </FadeUp>
        </div>
      </PageTransition>
    </Shell>
  );
};

export default LoginPage;
