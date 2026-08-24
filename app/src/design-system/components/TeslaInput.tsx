/**
 * ============================================================
 * DailyStack Design System — TeslaInput Component v1.0
 * ============================================================
 * Premium input with floating label
 * 
 * Design Philosophy:
 * - Floating label animation
 * - Validation states with micro-feedback
 * - Haptic feedback on valid submission
 * - Minimum 44pt touch target for interactive elements
 */

import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { borderRadius, spacing, componentSpacing } from '../spacing-tokens';
import { text, border, mint, warning, semantic } from '../color-tokens';

// ─── Component Props ───────────────────────────────────────────────
export interface TeslaInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text */
  label: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Helper text */
  helper?: string;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Left icon */
  leftIcon?: React.ElementType;
  /** Right icon */
  rightIcon?: React.ElementType;
  /** Show check animation on valid */
  animatedCheck?: boolean;
}

// ─── Size Styles ────────────────────────────────────────────────────
const sizeStyles = {
  sm: {
    inputPadding: 'px-3 pt-5 pb-1.5',
    labelBase: 'text-xs',
    labelActive: 'text-[0.625rem]',
    icon: 'w-4 h-4',
    gap: 'gap-2',
  },
  md: {
    inputPadding: 'px-4 pt-6 pb-2',
    labelBase: 'text-sm',
    labelActive: 'text-xs',
    icon: 'w-5 h-5',
    gap: 'gap-3',
  },
  lg: {
    inputPadding: 'px-5 pt-7 pb-3',
    labelBase: 'text-base',
    labelActive: 'text-sm',
    icon: 'w-6 h-6',
    gap: 'gap-4',
  },
} as const;

// ─── Component ─────────────────────────────────────────────────────
export const TeslaInput = forwardRef<HTMLInputElement, TeslaInputProps>(
  (
    {
      label,
      error,
      success,
      helper,
      size = 'md',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      animatedCheck = true,
      className = '',
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(value));
    const sizeStyle = sizeStyles[size];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      props.onChange?.(e);
    };

    // Determine state
    const isValid = Boolean(success) && !error && hasValue;
    const isError = Boolean(error);

    // State colors
    const stateColors = isError
      ? {
          border: 'border-[#FF5C73]',
          label: 'text-[#FF5C73]',
          icon: 'text-[#FF5C73]',
        }
      : isValid
      ? {
          border: 'border-[#4CAF50]',
          label: 'text-[#4CAF50]',
          icon: 'text-[#4CAF50]',
        }
      : isFocused
      ? {
          border: 'border-[#56be89]',
          label: 'text-[#56be89]',
          icon: 'text-gray-400',
        }
      : {
          border: 'border-[#2D313E]',
          label: 'text-gray-500',
          icon: 'text-gray-500',
        };

    return (
      <div className={`relative ${className}`}>
        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {LeftIcon && (
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${stateColors.icon}`}>
              <LeftIcon className={sizeStyle.icon} />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              w-full
              ${sizeStyle.inputPadding}
              ${LeftIcon ? 'pl-10' : ''}
              ${RightIcon || isValid ? 'pr-10' : ''}
              bg-[#171C15]
              ${stateColors.border}
              border
              ${borderRadius.lg}
              text-white
              placeholder-transparent
              transition-all duration-200
              focus:outline-none
              focus:shadow-[0_0_0_3px_rgba(199,255,46,0.15)]
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            placeholder=" " // Required for floating label
            {...props}
          />

          {/* Floating label */}
          <motion.label
            initial={false}
            animate={{
              y: hasValue || isFocused ? -24 : 0,
              scale: hasValue || isFocused ? 0.85 : 1,
              originX: 0,
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`
              absolute left-3
              ${sizeStyle.labelBase}
              ${stateColors.label}
              pointer-events-none
              origin-left
              transition-colors duration-200
              ${hasValue || isFocused ? 'font-medium' : 'font-normal'}
            `}
            style={{ top: size === 'sm' ? '12px' : size === 'lg' ? '18px' : '14px' }}
          >
            {label}
          </motion.label>

          {/* Right icon / Check animation */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid && animatedCheck ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#4CAF50]"
              >
                <svg className={sizeStyle.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <motion.path
                    d="M5 12l5 5L20 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </svg>
              </motion.div>
            ) : RightIcon ? (
              <div className={stateColors.icon}>
                <RightIcon className={sizeStyle.icon} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Helper / Error / Success text */}
        {(helper || error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`
              mt-1.5 px-1
              text-xs
              ${isError ? 'text-[#FF5C73]' : isValid ? 'text-[#4CAF50]' : 'text-gray-500'}
            `}
          >
            {error || success || helper}
          </motion.div>
        )}
      </div>
    );
  }
);

// ─── Money Input Variant ───────────────────────────────────────────
export interface TeslaMoneyInputProps extends Omit<TeslaInputProps, 'type' | 'leftIcon'> {
  currency?: string;
}

export const TeslaMoneyInput: React.FC<TeslaMoneyInputProps> = ({
  currency = 'THB',
  ...props
}) => (
  <div className="relative">
    {/* Currency prefix */}
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
      {currency}
    </div>
    <TeslaInput
      {...props}
      type="number"
      leftIcon={undefined}
      className={`pl-16 ${props.className || ''}`}
    />
  </div>
);

// ─── Display Name ───────────────────────────────────────────────────
TeslaInput.displayName = 'TeslaInput';
TeslaMoneyInput.displayName = 'TeslaMoneyInput';

// ─── Exports are handled via inline export declarations above ---
