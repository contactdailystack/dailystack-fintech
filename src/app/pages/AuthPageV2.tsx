/**
 * ================================================================
 * DailyStack — Auth Page v2.0 (UX Improved)
 * ================================================================
 * Key improvements:
 * - 8-digit OTP for stronger verification
 * - Better error handling with inline messages
 * - Cleaner desktop layout (minimal sidebar)
 * - Improved mobile-first UX
 * - Better empty states and loading states
 * - Using new design system components
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { AuthService } from '../services/authService';
import {
  Button,
  FadeUp,
  Input,
  Badge,
  PageTransition,
} from '../components/DesignSystem';

const AuthPageV2: React.FC = () => {
  const navigate = useNavigate();

  // State Management
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [lang, setLang] = useState<'en' | 'th'>('en');
  const [email, setEmail] = useState('');

  // OTP State — 8 digits
  const [otp, setOtp] = useState(Array(8).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingNewUser, setPendingNewUser] = useState(false);

  // Timer State for Step 2
  const [timeLeft, setTimeLeft] = useState(60);

  // Progress State for Step 3
  const [progress, setProgress] = useState(90);

  // Handlers
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email) {
      setErrorMessage(lang === 'th' ? 'กรุณากรอกอีเมล' : 'Please enter your email');
      return;
    }
    try {
      setSending(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setTimeLeft(60);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(
        err?.message || (lang === 'th' ? 'ไม่สามารถส่งรหัสได้' : 'Unable to send code')
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const otpString = otp.join('');
    if (otpString.length !== 8) {
      setErrorMessage(lang === 'th' ? 'กรุณากรอก 8 หลัก' : 'Please enter 8 digits');
      return;
    }
    try {
      setVerifying(true);
      const result = await AuthService.verifyEmailOtp(email, otpString);
      if (!result.success)
        throw new Error(result.error || 'Verification failed');

      setPendingNewUser(result.isNewUser);
      setStep(3);
      setTimeout(() => {
        navigate(result.isNewUser ? '/onboarding' : '/dashboard');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(
        err?.message || (lang === 'th' ? 'ตรวจสอบล้มเหลว' : 'Verification failed')
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      }
    }
  };

  // Effects
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeLeft]);

  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Translations
  const t = {
    en: {
      siteName: 'DailyStack',
      tagline: 'Build habits. Find connections.',
      getStarted: 'Get Started',
      enterEmail: 'Enter your email',
      continue: 'Continue',
      enterCode: 'Enter Verification Code',
      verify: 'Verify',
      resendIn: 'Resend in',
      resendCode: 'Resend code',
      youreIn: "You're In!",
      emailVerified: 'Email verified successfully.',
      startOnboarding: 'Start Onboarding →',
      goToDashboard: 'Go to Dashboard →',
      backToEmail: 'Back',
      errorEmailRequired: 'Email address is required',
      errorEnter6Digits: 'Please enter 8 digits',
      description: 'Combine task management with meaningful connections.',
    },
    th: {
      siteName: 'DailyStack',
      tagline: 'สร้างนิสัย หาความเชื่อมโยง',
      getStarted: 'เริ่มต้น',
      enterEmail: 'กรอกอีเมลของคุณ',
      continue: 'ดำเนินการต่อ',
      enterCode: 'กรอกรหัสยืนยัน',
      verify: 'ยืนยัน',
      resendIn: 'ส่งใหม่ใน',
      resendCode: 'ส่งรหัสใหม่',
      youreIn: 'ยินดีต้อนรับ!',
      emailVerified: 'ยืนยันอีเมลสำเร็จ',
      startOnboarding: 'เริ่มต้น →',
      goToDashboard: 'ไปที่แดชบอร์ด →',
      backToEmail: 'กลับ',
      errorEmailRequired: 'กรุณากรอกอีเมล',
      errorEnter6Digits: 'กรุณากรอก 8 หลัก',
      description: 'จัดการงานและสร้างความสัมพันธ์ที่มีความหมาย',
    },
  };

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] text-[var(--text-primary)] overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-[-18%] left-[-14%] w-[520px] h-[520px] rounded-full blur-[120px]"
          style={{
            background: 'var(--orb-primary)',
            opacity: 0.1,
          }}
        />
        <div
          className="absolute bottom-[-24%] right-[-14%] w-[640px] h-[640px] rounded-full blur-[130px]"
          style={{
            background: 'var(--orb-secondary)',
            opacity: 0.08,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <PageTransition>
          <div className="w-full max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_0.85fr] items-start">
              <div className="space-y-6">
                <div className="rounded-[32px] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]" style={{ backdropFilter: 'blur(18px)' }}>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[20px] flex items-center justify-center" style={{ background: 'rgba(86,190,137,0.16)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--lime)' }}>
                          shield
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                          {lang === 'th' ? 'ปลอดภัยและง่าย' : 'Secure & seamless'}
                        </p>
                        <h2 className="text-[22px] font-black leading-tight" style={{ letterSpacing: '-0.04em' }}>
                          {lang === 'th' ? 'ลงชื่อเข้าใช้ด้วยอีเมล' : 'Passwordless login'}
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-[var(--surface-input)] border border-[var(--border-subtle)] p-1">
                      {(['en', 'th'] as const).map(l => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLang(l)}
                          className={`rounded-full px-3 py-2 text-[13px] font-semibold transition-colors ${lang === l ? 'bg-[var(--lime)] text-[var(--text-inverse)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                          {l === 'en' ? 'EN' : 'TH'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                    {lang === 'th'
                      ? 'เข้าสู่ระบบแบบปลอดภัยและรวดเร็วด้วยรหัส OTP ส่งตรงถึงอีเมลของคุณ'
                      : 'Access DailyStack instantly with a secure email code — no password needed.'}
                  </p>
                </div>

                <div className="rounded-[40px] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-card)]" style={{ backdropFilter: 'blur(16px)' }}>
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <p className="inline-flex items-center gap-2 rounded-full bg-[rgba(86,190,137,0.14)] px-3 py-1 text-[var(--lime)] text-[11px] uppercase tracking-[0.20em] font-semibold">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bolt</span>
                          {lang === 'th' ? 'เริ่มต้นได้ในไม่กี่วินาที' : 'Fast entry'}
                        </p>
                        <h1 className="text-[32px] font-black leading-tight">
                          {lang === 'th' ? 'ยกเลิกความซับซ้อน' : 'A cleaner way to sign in'}
                        </h1>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                          {lang === 'th'
                            ? 'เพียงกรอกอีเมลของคุณ แล้วตรวจสอบรหัสครั้งเดียวเพื่อเข้าสู่ระบบอย่างมั่นใจ'
                            : 'Enter your email to receive a one-time secure access code.'}
                        </p>
                      </div>

                      <form onSubmit={handleContinue} className="space-y-5">
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-[var(--text-secondary)]">
                            {t[lang].enterEmail}
                          </label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            error={errorMessage || undefined}
                          />
                          {errorMessage && (
                            <p className="flex items-center gap-2 text-sm text-[var(--error)]">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                              {errorMessage}
                            </p>
                          )}
                        </div>
                        <Button disabled={sending} loading={sending}>
                          {sending ? '' : t[lang].continue}
                        </Button>
                      </form>

                      <div className="grid gap-3 text-sm text-[var(--text-secondary)]">
                        <div className="inline-flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--lime)' }}>lock</span>
                          {lang === 'th'
                            ? 'ไม่มีรหัสผ่าน ควบคุมด้วยอีเมลของคุณ'
                            : 'No password. Secure email-only sign-in.'}
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--lime)' }}>thumb_up</span>
                          {lang === 'th'
                            ? 'ออกแบบเพื่อการเข้าใช้งานที่ไหลลื่น'
                            : 'Designed for calm, friction-free entry.'}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <p className="inline-flex items-center gap-2 rounded-full bg-[rgba(86,190,137,0.14)] px-3 py-1 text-[var(--lime)] text-[11px] uppercase tracking-[0.20em] font-semibold">
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified_user</span>
                          {lang === 'th' ? 'ยืนยันตัวตน' : 'Verify identity'}
                        </p>
                        <h1 className="text-[32px] font-black leading-tight">
                          {t[lang].enterCode}
                        </h1>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                          {lang === 'th'
                            ? `รหัส 8 หลักได้ถูกส่งไปที่ ${email}`
                            : `We just sent an 8-digit code to ${email}`}
                        </p>
                      </div>

                      <form onSubmit={handleVerify} className="space-y-6">
                        <div className="grid grid-cols-8 gap-3">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={el => { inputRefs.current[index] = el; }}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={digit}
                              onChange={e => handleOtpChange(index, e.target.value)}
                              onKeyDown={e => handleOtpKeyDown(index, e)}
                              aria-label={`OTP digit ${index + 1}`}
                              className="ds-otp-cell"
                            />
                          ))}
                        </div>
                        {errorMessage && (
                          <p className="text-center text-sm text-[var(--error)]">
                            {errorMessage}
                          </p>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-[var(--text-secondary)]">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                            {timeLeft > 0 ? (
                              <span>
                                {t[lang].resendIn} {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => { setTimeLeft(60); setErrorMessage(null); }}
                                className="text-[var(--lime)] font-semibold"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                              >
                                {t[lang].resendCode}
                              </button>
                            )}
                          </div>
                          <span>
                            {lang === 'th' ? 'รหัสหมดอายุภายใน 1 นาที' : 'Code expires in 1 minutes'}
                          </span>
                        </div>

                        <Button disabled={verifying} loading={verifying}>
                          {verifying ? '' : t[lang].verify}
                        </Button>
                      </form>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative inline-flex items-center justify-center rounded-full bg-[var(--surface-card)] p-1 shadow-[var(--shadow-lift)]">
                          <div className="absolute inset-0 rounded-full bg-[rgba(86,190,137,0.18)] blur-[22px]" />
                          <div className="relative inline-flex h-[116px] w-[116px] items-center justify-center rounded-full bg-[var(--surface-input)] border border-[var(--border-subtle)]">
                            <div className="inline-flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[var(--lime)] shadow-[var(--shadow-glow)]">
                              <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'var(--text-inverse)' }}>
                                check_circle
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-center">
                          <h1 className="text-[34px] font-black leading-tight">{t[lang].youreIn}</h1>
                          <p className="text-[var(--text-secondary)]">{t[lang].emailVerified}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                          <span>{lang === 'th' ? 'กำลังเตรียมพื้นที่' : 'Setting up your space'}</span>
                          <span className="font-semibold text-[var(--lime)]">{progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--surface-elevated)] overflow-hidden border border-[var(--border-subtle)]">
                          <div className="h-full rounded-full bg-[var(--lime)] transition-all duration-200" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      <Button onClick={() => navigate(pendingNewUser ? '/onboarding' : '/dashboard')}>
                        {pendingNewUser ? t[lang].startOnboarding : t[lang].goToDashboard}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="space-y-5 rounded-[32px] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[20px] bg-[rgba(86,190,137,0.16)] flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--lime)' }}>
                      rocket_launch
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">Fast setup</p>
                    <h3 className="text-lg font-bold">{lang === 'th' ? 'เริ่มได้เลย' : 'Ready in seconds'}</h3>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <p>{lang === 'th' ? 'DailyStack ยินดีต้อนรับผู้ใช้ใหม่ด้วยระบบ onboarding ที่ชัดเจนและรวดเร็ว' : 'DailyStack welcomes you with a calm, premium onboarding path.'}</p>
                  <p>{lang === 'th' ? 'รักษาความปลอดภัยด้วยรหัสเดียว และไม่ต้องจำรหัสผ่าน' : 'One-time code security, no password to remember.'}</p>
                </div>
                <div className="grid gap-3">
                  {[
                    { title: lang === 'th' ? 'ตรวจสอบง่าย' : 'Clear steps' },
                    { title: lang === 'th' ? 'ความน่าเชื่อถือสูง' : 'Trusted access' },
                    { title: lang === 'th' ? 'เข้ากับมือถือ' : 'Mobile-native feel' },
                  ].map(item => (
                    <div key={item.title} className="flex items-center gap-3 rounded-[22px] border border-[var(--border-mid)] bg-[var(--surface-input)] p-4">
                      <span className="material-symbols-outlined text-[var(--lime)]" style={{ fontSize: 18 }}>done</span>
                      <span className="text-sm text-[var(--text-primary)]">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

export default AuthPageV2;
