/**
 * ============================================================
 * DailyStack — Reset Password Page (P3-01)
 * ============================================================
 * Handles the password reset flow after user clicks the
 * reset link from their email.
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { haptics } from '../services/hapticService';

interface InputFieldProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete?: string;
  icon?: React.ReactNode;
  error?: string | null;
  disabled?: boolean;
  id?: string;
}

function InputField({ type, value, onChange, placeholder, autoComplete, icon, error, disabled, id }: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const isFilled = value.length > 0;
  const hasIcon = !!icon;

  return (
    <div className="relative">
      <div className="relative">
        {hasIcon && (
          <div
            className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: isFocused ? '#111111' : '#8E8E93' }}
          >
            {icon}
          </div>
        )}
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#FFFFFF',
            border: `1.5px solid ${error ? '#EF4444' : isFocused ? '#111111' : isFilled ? '#111111' : '#E5E7EB'}`,
            borderRadius: '100px',
            padding: '16px 24px',
            paddingLeft: hasIcon ? '48px' : '24px',
            paddingRight: isPassword ? '56px' : '24px',
            fontSize: '14px',
            fontFamily: '"Inter", sans-serif',
            color: '#111111',
            outline: 'none',
            boxShadow: isFocused ? `0 0 0 3px ${error ? 'rgba(220, 38, 38, 0.15)' : 'rgba(201, 241, 53, 0.3)'}` : 'none',
          }}
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>
      {isPassword && (
        <button
          type="button"
          onClick={() => { haptics.fire('SELECT'); setShowPassword(!showPassword); }}
          className="absolute right-5 top-1/2 -translate-y-1/2 p-1"
          style={{ minWidth: '32px', minHeight: '32px' }}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff size={16} style={{ color: '#8E8E93' }} />
          ) : (
            <Eye size={16} style={{ color: '#8E8E93' }} />
          )}
        </button>
      )}
      {error && (
        <p className="mt-2 text-xs" style={{ color: '#EF4444', fontFamily: '"Inter", sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface PrimaryButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'dark' | 'lime';
}

function PrimaryButton({ type = 'submit', onClick, loading, disabled, children, variant = 'dark' }: PrimaryButtonProps) {
  const isLime = variant === 'lime';
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      whileTap={{ scale: loading || disabled ? 1 : 0.98 }}
      className="w-full flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        backgroundColor: isLime ? '#C9F135' : '#111111',
        color: isLime ? '#111111' : '#FFFFFF',
        border: 'none',
        borderRadius: '100px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: 700,
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {loading ? (
        <RefreshCw size={18} className="animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}

export default function AuthResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Extract the token + email from the query params
  const token = searchParams.get('token');
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.fire('SELECT');
    setError(null);

    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (!token) {
        setError('Invalid reset link. Please request a new one.');
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        haptics.fire('ERROR_REJECT');
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center"
        style={{
          backgroundColor: '#111111',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 rounded-[16px] flex items-center justify-center mb-6"
          style={{ backgroundColor: '#10B981' }}
        >
          <Check size={28} style={{ color: '#FFFFFF' }} strokeWidth={3} />
        </motion.div>
        <h2
          className="font-bold text-2xl mb-2"
          style={{ color: '#FFFFFF', fontFamily: '"Inter", sans-serif' }}
        >
          Password Reset!
        </h2>
        <p
          className="text-sm mb-8 text-center px-8"
          style={{ color: 'rgba(255,255,255,0.6)', fontFamily: '"Inter", sans-serif' }}
        >
          Your password has been updated. You can now sign in with your new password.
        </p>
        <div className="px-8 w-full max-w-[360px]">
          <PrimaryButton onClick={() => navigate('/auth')}>
            Sign In
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col"
      style={{
        backgroundColor: '#111111',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Hero Section */}
      <div className="px-6 py-8" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 32px)' }}>
        <h1
          className="font-black leading-[1.1]"
          style={{
            fontSize: '32px',
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Set a new<br />password
        </h1>
        <p
          className="mt-3"
          style={{
            fontSize: '14px',
            color: '#FFFFFF',
            opacity: 0.55,
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Choose a strong password to protect your account.
        </p>
      </div>

      {/* Form */}
      <div
        className="flex-1 rounded-t-[40px] overflow-hidden"
        style={{ backgroundColor: '#F4F5F7' }}
      >
        <div className="max-w-[360px] mx-auto">
          <form
            onSubmit={handleSubmit}
            className="p-5 space-y-3"
            style={{ paddingTop: '20px' }}
          >
            {/* New Password */}
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#111111',
                  opacity: 0.45,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                New Password
              </label>
              <InputField
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                id="reset-password"
                icon={<Lock size={18} />}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#111111',
                  opacity: 0.45,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Confirm Password
              </label>
              <InputField
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                id="reset-confirm-password"
                icon={<Lock size={18} />}
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
                  role="alert"
                >
                  <AlertCircle size={16} style={{ color: '#EF4444' }} />
                  <span className="text-xs" style={{ color: '#EF4444', fontFamily: '"Inter", sans-serif' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <PrimaryButton type="submit" loading={loading}>
              Update Password
            </PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
}
