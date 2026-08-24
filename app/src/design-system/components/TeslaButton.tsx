/**
 * ============================================================
 * DailyStack Design System — TeslaButton Component v1.0
 * ============================================================
 * Premium button with haptic feedback on press
 * 
 * Design Philosophy:
 * - Primary/Secondary/Outline variants
 * - Haptic feedback on press (Crisp Click)
 * - Minimum 44x44pt touch target
 * - Zero emoji — use [Icon: Name] format
 */

import React from 'react';
import { borderRadius, componentSpacing, spacing } from '../spacing-tokens';
import { mint, cyan, text, border } from '../color-tokens';
import { hapticPresets } from '../haptic-tokens';
import { motion } from 'framer-motion';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Component Props ───────────────────────────────────────────────
export interface TeslaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'pill';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'fab' | 'pill';
  /** Icon component (Lucide) */
  icon?: React.ElementType;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Loading state */
  loading?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Haptic feedback enabled */
  haptic?: boolean;
}

// ─── Variant Styles ─────────────────────────────────────────────────
const variantStyles = {
  primary: {
    bg: 'bg-[#56be89]',
    bgHover: 'hover:bg-[#6fcca3]',
    text: 'text-[#101010]',
    border: 'border-transparent',
    shadow: 'shadow-[0_0_20px_rgba(205,255,36,0.3)]',
    shadowHover: 'hover:shadow-[0_0_30px_rgba(205,255,36,0.5)]',
  },
  secondary: {
    bg: 'bg-[rgba(205,255,36,0.15)]',
    bgHover: 'hover:bg-[rgba(205,255,36,0.25)]',
    text: 'text-[#56be89]',
    border: 'border-[rgba(205,255,36,0.3)]',
    shadow: '',
    shadowHover: 'hover:shadow-[0_0_15px_rgba(205,255,36,0.2)]',
  },
  outline: {
    bg: 'bg-transparent',
    bgHover: 'hover:bg-[rgba(205,255,36,0.1)]',
    text: 'text-[#56be89]',
    border: 'border-[#2A2A2A]',
    shadow: '',
    shadowHover: '',
  },
  ghost: {
    bg: 'bg-transparent',
    bgHover: 'hover:bg-[rgba(255,255,255,0.05)]',
    text: 'text-white',
    border: 'border-transparent',
    shadow: '',
    shadowHover: '',
  },
  // E-Pay Pill variant - fully rounded ends
  pill: {
    bg: 'bg-[#56be89]',
    bgHover: 'hover:bg-[#6fcca3]',
    text: 'text-[#101010]',
    border: 'border-transparent',
    shadow: 'shadow-[0_0_20px_rgba(205,255,36,0.3)]',
    shadowHover: 'hover:shadow-[0_0_30px_rgba(205,255,36,0.5)]',
  },
} as const;

// ─── Size Styles ────────────────────────────────────────────────────
const sizeStyles = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-xs',
    icon: 'w-3.5 h-3.5',
    height: 'h-8',
    borderRadius: 'rounded-lg',
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-sm',
    icon: 'w-4 h-4',
    height: 'h-10',
    borderRadius: 'rounded-xl',
  },
  lg: {
    padding: 'px-6 py-3',
    text: 'text-base',
    icon: 'w-5 h-5',
    height: 'h-12',
    borderRadius: 'rounded-xl',
  },
  fab: {
    padding: 'p-0',
    text: 'text-sm',
    icon: 'w-6 h-6',
    height: 'w-14 h-14',
    borderRadius: 'rounded-full',
  },
  // E-Pay Pill sizes
  pill: {
    padding: 'px-6 py-3',
    text: 'text-sm',
    icon: 'w-4 h-4',
    height: 'h-12',
    borderRadius: 'rounded-full',
  },
} as const;

// ─── Component ─────────────────────────────────────────────────────
export const TeslaButton: React.FC<TeslaButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  haptic = true,
  className = '',
  disabled,
  children,
  onClick,
  ...props
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  // Haptic feedback on press
  const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && !disabled && !loading) {
      // Trigger haptic via navigator.vibrate if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const preset = hapticPresets.CRISP_CLICK;
        const pattern = [
          Math.round(preset.time * preset.sharpness * 0.3),
          Math.round(preset.intensity * 255),
        ];
        navigator.vibrate(pattern);
      }
    }
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      transition={{ duration: toSeconds(motionTokens.duration.fast), ease: easing.tight }}
      type="button"
      disabled={disabled || loading}
      onClick={handlePress}
      className={`
        inline-flex items-center justify-center gap-2
        ${variantStyle.bg} ${variantStyle.bgHover}
        ${variantStyle.text}
        ${variantStyle.border} ${variantStyle.shadow} ${variantStyle.shadowHover}
        ${sizeStyle.padding} ${sizeStyle.height}
        ${sizeStyle.borderRadius}
        font-semibold
        tracking-wide
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        min-w-[44px] min-h-[44px]
        ${className}
      `}
      {...(props as any)}
    >
      {/* Loading spinner */}
      {loading ? (
        <svg
          className={`animate-spin ${sizeStyle.icon}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={sizeStyle.icon} />
          )}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && (
            <Icon className={sizeStyle.icon} />
          )}
        </>
      )}
    </motion.button>
  );
};

// ─── Icon Button (square) ───────────────────────────────────────────
export interface TeslaIconButtonProps extends Omit<TeslaButtonProps, 'icon' | 'iconPosition' | 'children'> {
  icon: React.ElementType;
  label: string; // Accessibility label
}

export const TeslaIconButton: React.FC<TeslaIconButtonProps> = ({
  icon: Icon,
  label,
  size = 'md',
  ...props
}) => {
  const sizeStyle = sizeStyles[size];

  return (
    <TeslaButton
      size={size}
      icon={Icon}
      aria-label={label}
      {...props}
    >
      {/* Hidden label for screen readers */}
      <span className="sr-only">{label}</span>
    </TeslaButton>
  );
};

// ─── Exports are handled via inline export declarations above ---
