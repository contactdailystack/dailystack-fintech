import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Delete, Fingerprint, LogOut, ShieldCheck } from 'lucide-react';
import {
  unlockWithBiometric,
  verifyPin,
  hasBiometric,
} from '../services/appLockService';
import { Language } from '../data/translations';

interface AppLockScreenProps {
  lang: Language;
  onUnlock: () => void;
  onSignOut: () => void;
}

const PIN_LENGTH = 4;

const fire = (intensity: number) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(Math.round(intensity * 255));
  }
};

export default function AppLockScreen({ lang, onUnlock, onSignOut }: AppLockScreenProps) {
  const th = lang === 'th';
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const busy = useRef(false);

  const submit = useCallback(async (candidate: string) => {
    if (busy.current) return;
    busy.current = true;
    const ok = await verifyPin(candidate);
    busy.current = false;
    if (ok) {
      fire(0.5);
      onUnlock();
    } else {
      setError(true);
      fire(1);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 550);
    }
  }, [onUnlock]);

  const pressDigit = (d: string) => {
    if (error || pin.length >= PIN_LENGTH) return;
    fire(0.15);
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) submit(next);
  };

  const tryBiometric = async () => {
    fire(0.3);
    const ok = await unlockWithBiometric();
    if (ok) {
      fire(0.5);
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 550);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8"
      style={{ backgroundColor: '#071838' }}
      role="dialog"
      aria-modal="true"
      aria-label={th ? 'ปลดล็อกแอป' : 'Unlock app'}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: '#0FB0CE', boxShadow: '0 0 40px rgba(15,176,206,0.35)' }}>
        <ShieldCheck className="w-8 h-8" style={{ color: '#071838' }} />
      </div>

      <h1 className="text-[16px] font-bold" style={{ color: '#E0F2FC' }}>
        {th ? 'PicksWise ถูกล็อกอยู่' : 'PicksWise is locked'}
      </h1>
      <p className="text-[12px] mt-1 mb-7" style={{ color: 'rgba(224,242,252,0.55)' }}>
        {th ? `กรอก PIN ${PIN_LENGTH} หลักเพื่อเข้าใช้งาน` : `Enter your ${PIN_LENGTH}-digit PIN`}
      </p>

      {/* PIN dots */}
      <motion.div
        animate={error ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex gap-3 mb-8"
        aria-label="PIN progress"
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className="w-3.5 h-3.5 rounded-full transition-all"
            style={{
              backgroundColor: error ? '#EF4444' : i < pin.length ? '#0FB0CE' : 'rgba(224,242,252,0.18)',
              transform: i < pin.length ? 'scale(1.15)' : 'scale(1)',
            }}
          />
        ))}
      </motion.div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-x-7 gap-y-3.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button key={d}
            onClick={() => pressDigit(d)}
            className="w-16 h-16 rounded-full text-[22px] font-semibold transition-all active:scale-90 active:bg-white/10"
            style={{ color: '#E0F2FC', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {d}
          </button>
        ))}
        {hasBiometric() ? (
          <button onClick={tryBiometric} aria-label={th ? 'ปลดล็อกด้วยไบโอเมตริก' : 'Use biometrics'}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90">
            <Fingerprint className="w-7 h-7" style={{ color: '#0FB0CE' }} />
          </button>
        ) : (
          <span />
        )}
        <button onClick={() => pressDigit('0')}
          className="w-16 h-16 rounded-full text-[22px] font-semibold transition-all active:scale-90"
          style={{ color: '#E0F2FC', fontFamily: 'JetBrains Mono, monospace' }}>
          0
        </button>
        <button onClick={() => !error && setPin(pin.slice(0, -1))} aria-label={th ? 'ลบ' : 'Delete'}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90">
          <Delete className="w-6 h-6" style={{ color: 'rgba(224,242,252,0.55)' }} />
        </button>
      </div>

      <p className="h-5 mt-6 text-[12px]" style={{ color: error ? '#EF4444' : 'transparent' }}>
        {th ? 'PIN ไม่ถูกต้อง ลองอีกครั้ง' : 'Incorrect PIN — try again'}
      </p>

      <button
        onClick={() => { fire(0.4); onSignOut(); }}
        className="mt-4 flex items-center gap-2 text-[13px] font-semibold underline underline-offset-4 min-h-[44px]"
        style={{ color: 'rgba(224,242,252,0.65)' }}
      >
        <LogOut className="w-4 h-4" />
        {th ? 'ออกจากระบบแทน' : 'Sign out instead'}
      </button>
    </motion.div>
  );
}
