import { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, ShieldCheck, ArrowRight, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../data/translations';

interface OTPInputProps {
  email: string;
  mode: 'verify' | 'reset';
  lang: Language;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

const OTP_LENGTH = 6;

export function OTPInput({ email, mode, lang, onVerify, onResend, onBack }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = translations[lang];

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first empty input on mount
  useEffect(() => {
    const firstEmptyIndex = otp.findIndex(digit => digit === '');
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1) {
      const fullOtp = [...newOtp].join('');
      if (fullOtp.length === OTP_LENGTH) {
        handleSubmit(fullOtp);
      }
    }
  }, [otp]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    
    if (pastedData.length > 0) {
      const newOtp = Array(OTP_LENGTH).fill('');
      pastedData.split('').forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      
      // Focus appropriate input
      const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();

      // Auto-submit if complete
      if (pastedData.length === OTP_LENGTH) {
        handleSubmit(pastedData);
      }
    }
  }, []);

  const handleSubmit = async (fullOtp?: string) => {
    const code = fullOtp || otp.join('');
    if (code.length !== OTP_LENGTH) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onVerify(code);
      if (result) {
        setSuccess(true);
      } else {
        setError(t.otpInvalidError);
        setOtp(Array(OTP_LENGTH).fill(''));
        setShake(true);
        setTimeout(() => setShake(false), 500);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(t.otpFailedError);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      await onResend();
      setResendCooldown(60);
      setError(null);
    } catch {
      setError(t.otpResendError);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-[#0C0D0E]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md border rounded-[28px] p-8 md:p-10 backdrop-blur-md relative z-10 bg-[#131416]/90 border-[#222428] shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </motion.div>
          
          <h2 className="font-display text-2xl font-extrabold text-white mb-2">
            {mode === 'verify' ? t.otpSuccessVerify : t.otpSuccessReset}
          </h2>
          
          <p className="text-sm text-zinc-400 mb-8 font-sans">
            {mode === 'verify' ? t.otpSuccessVerifySub : t.otpSuccessResetSub}
          </p>

          <button
            onClick={onBack}
            className="w-full font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-250 cursor-pointer bg-[#C7FF2E] text-[#0C0D0E] hover:bg-white"
          >
            <span className="font-display font-semibold text-sm">
              {mode === 'verify' ? t.otpContinueBtn : t.otpResetPasswordBtn}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-[#0C0D0E]">
      {/* Background glow meshes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-[#C7FF2E]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[240px] h-[240px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-md border rounded-[28px] p-8 md:p-10 backdrop-blur-md relative z-10 bg-[#131416]/90 border-[#222428] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${shake ? 'animate-shake' : ''}`}
      >
        {/* Security badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-[11px] tracking-widest uppercase mb-4 bg-[#C7FF2E]/10 text-[#C7FF2E] border-[#C7FF2E]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.otpSecureVerification}
          </div>
          
          <h1 className="font-display text-2xl font-extrabold tracking-tight leading-none text-white mb-2">
            {mode === 'verify' ? t.otpTitle : t.otpSuccessReset}
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-sans">
            <Mail className="w-3.5 h-3.5 text-zinc-500" />
            <span>{email}</span>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-3 text-center">
            {t.otpEnterCode}
          </label>
          
          <div 
            className="flex justify-center gap-2 md:gap-3"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading || success}
                  className={`w-12 h-14 md:w-14 md:h-16 text-center text-xl font-mono font-bold transition-all duration-200 rounded-2xl bg-[#1A1B1E] border ${
                    digit 
                      ? 'border-[#C7FF2E]/50 text-[#C7FF2E] shadow-[0_0_20px_rgba(199,255,46,0.15)]' 
                      : 'border-[#2B2D31] text-white'
                  } focus:border-[#C7FF2E] focus:ring-2 focus:ring-[#C7FF2E]/35 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    loading ? 'animate-pulse' : ''
                  }`}
                  style={{
                    boxShadow: digit ? '0 0 20px rgba(199,255,46,0.15)' : 'none'
                  }}
                />
                
                {/* Active indicator dot */}
                {inputRefs.current[index] === document.activeElement && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C7FF2E]"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Verify button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading || otp.join('').length !== OTP_LENGTH}
          className="w-full font-medium py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed transition-all duration-250 mt-4 cursor-pointer bg-[#C7FF2E] text-[#0C0D0E] hover:bg-white"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 rounded-full animate-spin border-[#0C0D0E] border-t-transparent" />
          ) : (
            <>
              <span className="font-display font-semibold text-sm">
                {mode === 'verify' ? t.otpVerifyBtn : t.otpSuccessReset}
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Resend section */}
        <div className="mt-6 text-center">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
            {t.otpResendQuestion}
          </p>
          
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || resendCooldown > 0}
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#C7FF2E] hover:text-white disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? '' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {resendCooldown > 0 ? (
              <span>
                {t.otpResendIn} {resendCooldown}s
              </span>
            ) : (
              <span>{t.otpResend}</span>
            )}
          </button>
        </div>

        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="mt-6 w-full text-center font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          {t.otpBack}
        </button>
      </motion.div>

      {/* Compliance footer */}
      <div className="absolute bottom-6 flex items-center gap-2 text-[10px] font-mono text-zinc-650">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>{t.bankSecured}</span>
      </div>

      {/* Shake animation keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
