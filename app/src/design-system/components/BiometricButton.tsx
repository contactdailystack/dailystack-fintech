/**
 * ============================================================
 * DailyStack Design System — BiometricButton Component v1.0
 * ============================================================
 * Button for Face ID / Fingerprint authentication
 * 
 * Design Philosophy:
 * - Secondary button style with biometric icon
 * - Haptic feedback on click (SELECT)
 * - Minimum 44x44pt touch target
 * - Loading state with spinner
 * - Zero emoji — use [Icon: Name] format
 */

import React from 'react';
import { motion } from 'framer-motion';
import { hapticPresets } from '../haptic-tokens';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Component Props ───────────────────────────────────────────────
export interface BiometricButtonProps {
  /** Callback when authentication is triggered */
  onAuthenticate: () => void;
  /** Loading state while authenticating */
  isAuthenticating?: boolean;
  /** Biometric type */
  type?: 'faceid' | 'fingerprint';
  /** Button label */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Additional classes */
  className?: string;
}

// ─── Icon Components (inline SVG) ──────────────────────────────────
const FaceIdIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
    <path d="M7 9c0-1.4.6-2.7 1.5-3.6C9.4 4.5 10.6 4 12 4s2.6.5 3.5 1.4c.9.9 1.5 2.2 1.5 3.6" />
    <path d="M5 8v2" />
    <path d="M19 8v2" />
    <path d="M12 14v3" />
    <path d="M9 20h6" />
    <rect x="4" y="9" width="16" height="10" rx="2" />
  </svg>
);

const FingerprintIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
    <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2" />
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
    <path d="M2 16h.01" />
    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
    <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2" />
  </svg>
);

// ─── Spinner Component ─────────────────────────────────────────────
const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ─── Component ─────────────────────────────────────────────────────
export const BiometricButton: React.FC<BiometricButtonProps> = ({
  onAuthenticate,
  isAuthenticating = false,
  type = 'fingerprint',
  label,
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  const Icon = type === 'faceid' ? FaceIdIcon : FingerprintIcon;
  const defaultLabel = type === 'faceid' ? 'Use Face ID' : 'Use Fingerprint';

  const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isAuthenticating) return;
    
    // Fire haptic SELECT feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const preset = hapticPresets.SELECT;
      const pattern = [
        Math.round(preset.time * preset.sharpness * 0.3),
        Math.round(preset.intensity * 255),
      ];
      navigator.vibrate(pattern);
    }
    
    onAuthenticate();
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isAuthenticating ? 1 : 0.96 }}
      transition={{ duration: toSeconds(motionTokens.duration.fast), ease: easing.tight }}
      type="button"
      disabled={disabled || isAuthenticating}
      onClick={handlePress}
      className={`
        inline-flex items-center justify-center gap-2
        bg-[rgba(15, 176, 206,0.15)]
        hover:bg-[rgba(15, 176, 206,0.25)]
        text-[#0FB0CE]
        border border-[rgba(15, 176, 206,0.3)]
        hover:shadow-[0_0_15px_rgba(15, 176, 206,0.2)]
        px-4 py-3
        text-sm
        h-11
        rounded-xl
        font-semibold
        tracking-wide
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        min-w-[44px] min-h-[44px]
        ${className}
      `}
      aria-label={label || defaultLabel}
      role="button"
    >
      {/* Loading spinner or Icon */}
      {isAuthenticating ? (
        <SpinnerIcon className="w-5 h-5" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
      
      {/* Label */}
      <span>
        {label || defaultLabel}
      </span>
    </motion.button>
  );
};

// ─── Exports ──────────────────────────────────────────────────────
export default BiometricButton;
