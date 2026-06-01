import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

type AuthMode = 'login' | 'signup' | 'forgot';
type SignupStep = 'email' | 'password' | 'confirm' | 'success';
type LoginStep = 'email' | 'password' | 'loading' | 'success';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const PasswordStrengthBar = ({ password }: { password: string }) => {
  const getStrength = (pwd: string): PasswordStrength => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    score = Math.min(4, score);
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#22C55E', '#22C55E'];
    return { score, label: labels[score], color: colors[score] };
  };
  const strength = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < strength.score ? strength.color : 'rgba(0,0,0,0.08)' }}
          />
        ))}
      </div>
      <p className="text-xs font-medium transition-all duration-300" style={{ color: strength.color }}>
        {strength.label}
      </p>
    </div>
  );
};

const StepIndicator = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-2 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
            style={{
              background: i < current ? 'var(--accent)' : i === current ? 'var(--accent)' : 'rgba(0,0,0,0.06)',
              color: i <= current ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {i < current ? <CheckIcon /> : i + 1}
          </div>
        </div>
        {i < total - 1 && (
          <div className="flex-1 h-px rounded-full transition-all duration-300"
            style={{ background: i < current ? 'var(--accent)' : 'rgba(0,0,0,0.06)' }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  onKeyDown,
  placeholder,
  error,
  hint,
  autoFocus,
  autoComplete,
  suffix,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  suffix?: React.ReactNode;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-[0.06em] mb-2"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full h-[52px] px-4 pr-12 rounded-2xl text-[15px] font-medium transition-all duration-200 outline-none"
          style={{
            fontFamily: 'var(--font)',
            background: 'var(--surface-input)',
            border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
            color: 'var(--text-primary)',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(192,245,0,0.15)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = error ? 'var(--error)' : 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}>
            <EyeIcon open={showPassword} />
          </button>
        )}
        {suffix && !isPassword && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs font-medium" style={{ color: 'var(--error)', fontFamily: 'var(--font)' }}>
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>{hint}</p>
      )}
    </div>
  );
};

const PrimaryButton = ({ children, onClick, disabled, loading }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled || loading}
    className="w-full h-[52px] rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40"
    style={{
      fontFamily: 'var(--font)',
      background: disabled || loading ? 'rgba(192,245,0,0.3)' : 'var(--accent)',
      color: '#121212',
      boxShadow: disabled ? 'none' : '0 8px 24px rgba(192,245,0,0.25)',
    }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
  >
    {loading ? (
      <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
    ) : children}
  </motion.button>
);

const LinkButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="font-semibold text-[13px] transition-colors duration-200"
    style={{ fontFamily: 'var(--font)', color: 'var(--accent)' }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
    {children}
  </button>
);

const SignupEmailStep = ({ email, setEmail, onNext, error }: {
  email: string; setEmail: (v: string) => void; onNext: () => void; error?: string;
}) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && isValid) onNext(); };
  return (
    <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h1 className="text-[24px] font-bold mb-1 leading-tight" style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        Create account
      </h1>
      <p className="text-[14px] mb-6" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
        Enter your email to get started
      </p>
      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={setEmail}
        onKeyDown={handleKeyDown}
        placeholder="you@example.com"
        autoFocus
        autoComplete="email"
        error={error}
        suffix={isValid && <span style={{ color: 'var(--success)' }}><CheckIcon /></span>}
      />
      <PrimaryButton onClick={onNext} disabled={!isValid}>
        Continue
      </PrimaryButton>
      {error && error.includes('registered') && (
        <p className="text-center mt-4 text-[13px]" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
          Already have an account? <LinkButton onClick={() => {}}>Log in</LinkButton>
        </p>
      )}
    </motion.div>
  );
};

const SignupPasswordStep = ({ password, setPassword, onNext, onBack }: {
  password: string; setPassword: (v: string) => void; onNext: () => void; onBack: () => void;
}) => {
  const isValid = password.length >= 8;
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && isValid) onNext(); };
  return (
    <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 transition-opacity duration-200"
        style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
        <ArrowLeftIcon /><span className="text-[13px] font-medium">Back</span>
      </button>
      <h1 className="text-[24px] font-bold mb-1 leading-tight" style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        Set password
      </h1>
      <p className="text-[14px] mb-6" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
        Minimum 8 characters
      </p>
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        onKeyDown={handleKeyDown}
        placeholder="••••••••"
        autoFocus
        autoComplete="new-password"
      />
      <PasswordStrengthBar password={password} />
      <div className="mt-4">
        <PrimaryButton onClick={onNext} disabled={!isValid}>
          Continue
        </PrimaryButton>
      </div>
    </motion.div>
  );
};

const SignupConfirmStep = ({ password, confirm, setConfirm, onSubmit, onBack, loading, error }: {
  password: string; confirm: string; setConfirm: (v: string) => void;
  onSubmit: () => void; onBack: () => void; loading: boolean; error?: string;
}) => {
  const isMatch = confirm.length > 0 && confirm !== password;
  const isValid = confirm.length >= 8 && confirm === password;
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && isValid && !loading) onSubmit(); };
  return (
    <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 transition-opacity duration-200"
        style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
        <ArrowLeftIcon /><span className="text-[13px] font-medium">Back</span>
      </button>
      <h1 className="text-[24px] font-bold mb-1 leading-tight" style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        Confirm password
      </h1>
      <p className="text-[14px] mb-6" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
        Type your password again
      </p>
      <Input
        label="Confirm password"
        type="password"
        value={confirm}
        onChange={setConfirm}
        onKeyDown={handleKeyDown}
        placeholder="••••••••"
        autoFocus
        autoComplete="new-password"
        error={isMatch ? "Passwords don't match" : undefined}
        hint={confirm.length > 0 && !isMatch ? "Type the same password as above" : undefined}
      />
      {error && (
        <p className="text-center mt-2 text-[13px] font-medium" style={{ fontFamily: 'var(--font)', color: 'var(--error)' }}>
          {error}
        </p>
      )}
      <div className="mt-4">
        <PrimaryButton onClick={onSubmit} disabled={!isValid || loading} loading={loading}>
          Create account
        </PrimaryButton>
      </div>
    </motion.div>
  );
};

const SignupSuccessStep = ({ email }: { email: string }) => (
  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    className="text-center py-6">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
      className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
      style={{ background: 'var(--accent)', boxShadow: '0 8px 24px rgba(192,245,0,0.25)' }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#121212" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="text-[24px] font-bold mb-2"
      style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
    >
      You're in!
    </motion.h2>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="text-[14px]"
      style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}
    >
      Account created. Welcome to DailyStack.
    </motion.p>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="mt-1 text-[12px]"
      style={{ fontFamily: 'var(--font)', color: 'var(--text-muted)' }}
    >
      Check <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{email}</span> to verify your account.
    </motion.div>
  </motion.div>
);

const LoginEmailStep = ({ email, setEmail, onNext, error }: {
  email: string; setEmail: (v: string) => void; onNext: () => void; error?: string;
}) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && isValid) onNext(); };
  return (
    <motion.div key="login-email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h1 className="text-[24px] font-bold mb-1 leading-tight" style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        Welcome back
      </h1>
      <p className="text-[14px] mb-6" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
        Sign in to continue
      </p>
      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={setEmail}
        onKeyDown={handleKeyDown}
        placeholder="you@example.com"
        autoFocus
        autoComplete="email"
        error={error}
        suffix={isValid && <span style={{ color: 'var(--success)' }}><CheckIcon /></span>}
      />
      <PrimaryButton onClick={onNext} disabled={!isValid}>
        Continue
      </PrimaryButton>
      {error && error.includes('No account') && (
        <p className="text-center mt-4 text-[13px]" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
          Don't have an account? <LinkButton onClick={() => {}}>Sign up</LinkButton>
        </p>
      )}
    </motion.div>
  );
};

const LoginPasswordStep = ({ email, password, setPassword, onSubmit, onBack, onForgot, loading, error }: {
  email: string; password: string; setPassword: (v: string) => void;
  onSubmit: () => void; onBack: () => void; onForgot: () => void; loading: boolean; error?: string;
}) => {
  const isValid = password.length >= 1;
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && isValid && !loading) onSubmit(); };
  return (
    <motion.div key="login-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 transition-opacity duration-200"
        style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
        <ArrowLeftIcon /><span className="text-[13px] font-medium">Back</span>
      </button>
      <h1 className="text-[24px] font-bold mb-1 leading-tight" style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        Enter password
      </h1>
      <p className="text-[14px] mb-6" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
        for <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{email}</span>
      </p>
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        onKeyDown={handleKeyDown}
        placeholder="••••••••"
        autoFocus
        autoComplete="current-password"
        error={error}
      />
      <div className="flex justify-end mb-4">
        <button onClick={onForgot} className="text-[13px] font-medium transition-colors duration-200"
          style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
          Forgot password?
        </button>
      </div>
      <PrimaryButton onClick={onSubmit} disabled={!isValid || loading} loading={loading}>
        Sign in
      </PrimaryButton>
    </motion.div>
  );
};

const ForgotPasswordStep = ({ email, setEmail, onSubmit, onBack, loading, done }: {
  email: string; setEmail: (v: string) => void; onSubmit: () => void; onBack: () => void; loading: boolean; done: boolean;
}) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  return (
    <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 transition-opacity duration-200"
        style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
        <ArrowLeftIcon /><span className="text-[13px] font-medium">Back</span>
      </button>
      {!done ? (
        <>
          <h1 className="text-[24px] font-bold mb-1 leading-tight" style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Reset password
          </h1>
          <p className="text-[14px] mb-6" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
            Enter your email and we'll send you a reset link.
          </p>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoFocus
            autoComplete="email"
          />
          <PrimaryButton onClick={onSubmit} disabled={!isValid || loading} loading={loading}>
            Send reset link
          </PrimaryButton>
        </>) : (
        <>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.1)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h2 className="text-[24px] font-bold mb-2" style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Check your email
            </h2>
            <p className="text-[14px]" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
              If <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{email}</span> exists in our system, you'll receive a reset link shortly.
            </p>
            <p className="text-[12px] mt-3" style={{ fontFamily: 'var(--font)', color: 'var(--text-muted)' }}>
              Link expires in 1 hour.
            </p>
          </div>
          <div className="text-center">
            <LinkButton onClick={onBack}>Back to sign in</LinkButton>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'th'>('en');

  const [mode, setMode] = useState<AuthMode>('signup');

  const [signupStep, setSignupStep] = useState<SignupStep>('email');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState<string | undefined>();
  const [signupLoading, setSignupLoading] = useState(false);

  const [loginStep, setLoginStep] = useState<LoginStep>('email');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | undefined>();
  const [loginLoading, setLoginLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  const handleSignupEmailNext = async () => {
    setSignupError(undefined);
    const { exists } = await AuthService.checkEmailExists(signupEmail);
    if (exists) {
      setSignupError('Already registered. Log in instead?');
      return;
    }
    setSignupStep('password');
  };

  const handleSignupPasswordNext = () => {
    if (signupPassword.length < 8) return;
    setSignupStep('confirm');
  };

  const handleSignupSubmit = async () => {
    if (signupConfirm !== signupPassword) return;
    setSignupLoading(true);
    setSignupError(undefined);
    const result = await AuthService.signUpWithPassword(signupEmail, signupPassword);
    setSignupLoading(false);
    if (result.success) {
      setSignupStep('success');
      setTimeout(() => navigate('/onboarding'), 2500);
    } else {
      setSignupError(result.error || 'Something went wrong. Please try again.');
    }
  };

  const handleLoginEmailNext = () => {
    setLoginError(undefined);
    setLoginStep('password');
  };

  const handleLoginSubmit = async () => {
    setLoginLoading(true);
    setLoginError(undefined);
    const result = await AuthService.signInWithEmail(loginEmail, loginPassword);
    setLoginLoading(false);
    if (result.success) {
      setLoginStep('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setLoginError(result.error || 'Incorrect password');
    }
  };

  const handleForgotSubmit = async () => {
    setForgotLoading(true);
    await AuthService.forgotPassword(forgotEmail);
    setForgotLoading(false);
    setForgotDone(true);
  };

  const goToLogin = () => { setMode('login'); setLoginStep('email'); setLoginEmail(''); setLoginPassword(''); setLoginError(undefined); };
  const goToSignup = () => { setMode('signup'); setSignupStep('email'); setSignupEmail(''); setSignupPassword(''); setSignupConfirm(''); setSignupError(undefined); };
  const goToForgot = () => { setMode('forgot'); setForgotEmail(loginEmail || signupEmail); setForgotDone(false); };

  const steps = signupStep === 'email' ? 0 : signupStep === 'password' ? 1 : 2;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'var(--bg-base)', fontFamily: 'var(--font)' }}
    >
      <div className="absolute top-[-10%] right-[-15%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'var(--lime-glow)', filter: 'blur(120px)', opacity: 0.15 }} />
      <div className="absolute bottom-[-10%] left-[-15%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'var(--lime-glow)', filter: 'blur(100px)', opacity: 0.1 }} />

      <div className="absolute top-6 right-6 flex gap-1 p-1 rounded-full"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
        {(['en', 'th'] as const).map(l => (
          <button key={l} onClick={() => setLang(l)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-200"
            style={{
              fontFamily: 'var(--font)',
              background: lang === l ? 'var(--lime)' : 'transparent',
              color: lang === l ? 'var(--text-inverse)' : 'var(--text-muted)',
            }}>
            {l}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[380px] relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'var(--lime)', boxShadow: '0 8px 24px var(--lime-glow)' }}
          >
            <span className="font-black text-[18px]" style={{ fontFamily: 'var(--font)', color: 'var(--text-inverse)' }}>D</span>
          </motion.div>
          <h1 className="text-[18px] font-extrabold tracking-tight" style={{ fontFamily: 'var(--font)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            DAILY<span style={{ color: 'var(--lime)' }}>STACK</span>
          </h1>
          <p className="text-[12px] mt-0.5" style={{ fontFamily: 'var(--font)', color: 'var(--text-muted)' }}>
            Your daily lifestyle stack
          </p>
        </div>

        <div
          className="rounded-[28px] p-7"
          style={{
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <AnimatePresence mode="wait">
            {mode === 'signup' && signupStep !== 'success' && (
              <div key="signup">
                {signupStep !== 'email' && (
                  <StepIndicator current={steps} total={3} />
                )}
                {signupStep === 'email' && (
                  <SignupEmailStep email={signupEmail} setEmail={setSignupEmail} onNext={handleSignupEmailNext} error={signupError} />
                )}
                {signupStep === 'password' && (
                  <SignupPasswordStep password={signupPassword} setPassword={setSignupPassword} onNext={handleSignupPasswordNext} onBack={() => setSignupStep('email')} />
                )}
                {signupStep === 'confirm' && (
                  <SignupConfirmStep password={signupPassword} confirm={signupConfirm} setConfirm={setSignupConfirm}
                    onSubmit={handleSignupSubmit} onBack={() => setSignupStep('password')} loading={signupLoading} error={signupError} />
                )}
              </div>
            )}
            {mode === 'signup' && signupStep === 'success' && (
              <SignupSuccessStep email={signupEmail} />
            )}

            {mode === 'login' && loginStep !== 'success' && (
              <div key="login">
                {loginStep === 'email' && (
                  <LoginEmailStep email={loginEmail} setEmail={setLoginEmail} onNext={handleLoginEmailNext} error={loginError} />
                )}
                {loginStep === 'password' && (
                  <LoginPasswordStep email={loginEmail} password={loginPassword} setPassword={setLoginPassword}
                    onSubmit={handleLoginSubmit} onBack={() => setLoginStep('email')} onForgot={goToForgot}
                    loading={loginLoading} error={loginError} />
                )}
              </div>
            )}
            {mode === 'login' && loginStep === 'success' && (
              <motion.div key="login-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                <p className="text-[16px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>Signing you in...</p>
              </motion.div>
            )}

            {mode === 'forgot' && (
              <ForgotPasswordStep email={forgotEmail} setEmail={setForgotEmail}
                onSubmit={handleForgotSubmit} onBack={goToLogin}
                loading={forgotLoading} done={forgotDone} />
            )}
          </AnimatePresence>
        </div>

        <div className="mt-5 text-center">
          {mode === 'signup' && signupStep !== 'success' && (
            <p className="text-[13px]" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
              Already have an account? <LinkButton onClick={goToLogin}>Log in</LinkButton>
            </p>
          )}
          {mode === 'login' && (
            <p className="text-[13px]" style={{ fontFamily: 'var(--font)', color: 'var(--text-secondary)' }}>
              Don't have an account? <LinkButton onClick={goToSignup}>Sign up</LinkButton>
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-[11px]" style={{ fontFamily: 'var(--font)', color: 'var(--text-muted)' }}>
          Your data stays private and secure
        </p>
      </motion.div>
    </div>
  );
}