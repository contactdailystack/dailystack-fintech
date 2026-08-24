/**
 * ============================================================
 * DailyStack Design System — ActionButton Component v1.0
 * ============================================================
 * Premium action button with haptic feedback and animations
 * 
 * Design Philosophy:
 * - Primary (lime bg), Secondary (outline), Ghost (text only)
 * - Haptic feedback on press
 * - Scale animation on interaction
 * - Loading state with spinner
 * - Minimum 44x44pt touch target
 */

import React from 'react';
import { motion } from 'framer-motion';
import { hapticPresets } from '../haptic-tokens';
import { borderRadius } from '../spacing-tokens';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Button Variants ───────────────────────────────────────────────
export type ActionButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ActionButtonSize = 'sm' | 'md' | 'lg' | 'fab';

// ─── Component Props ───────────────────────────────────────────────
export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: ActionButtonVariant;
  /** Button size */
  size?: ActionButtonSize;
  /** Icon component */
  icon?: React.ElementType;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Loading state */
  loading?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Custom label for accessibility */
  ariaLabel?: string;
  /** Children (text) */
  children?: React.ReactNode;
}

// ─── Icon Components ───────────────────────────────────────────────
const Icons: Record<string, React.FC<{ className?: string }>> = {
  Check: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronRight: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Plus: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  X: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

// ─── Variant Styles ────────────────────────────────────────────────
const variantStyles: Record<ActionButtonVariant, {
  bg: string;
  bgHover: string;
  bgActive: string;
  text: string;
  border: string;
  shadow: string;
  shadowHover: string;
  disabled: string;
}> = {
  primary: {
    bg: 'bg-[#56be89]',
    bgHover: 'hover:bg-[#6fcca3]',
    bgActive: 'active:bg-[#B8E62B]',
    text: 'text-[#0B0F0A]',
    border: 'border-transparent',
    shadow: 'shadow-[0_0_20px_rgba(199,255,46,0.25)]',
    shadowHover: 'hover:shadow-[0_0_30px_rgba(199,255,46,0.4)]',
    disabled: 'bg-[#2A2A2A] text-[#666666]',
  },
  secondary: {
    bg: 'bg-[rgba(199,255,46,0.1)]',
    bgHover: 'hover:bg-[rgba(199,255,46,0.15)]',
    bgActive: 'active:bg-[rgba(199,255,46,0.2)]',
    text: 'text-[#56be89]',
    border: 'border-[rgba(199,255,46,0.3)]',
    shadow: '',
    shadowHover: 'hover:shadow-[0_0_15px_rgba(199,255,46,0.15)]',
    disabled: 'bg-[rgba(255,255,255,0.05)] text-[#666666] border-[#2A2A2A]',
  },
  ghost: {
    bg: 'bg-transparent',
    bgHover: 'hover:bg-white/5',
    bgActive: 'active:bg-white/10',
    text: 'text-white',
    border: 'border-transparent',
    shadow: '',
    shadowHover: '',
    disabled: 'text-[#666666]',
  },
};

// ─── Size Styles ───────────────────────────────────────────────────
const sizeStyles: Record<ActionButtonSize, {
  padding: string;
  text: string;
  iconSize: string;
  height: string;
  minWidth: string;
  iconGap: string;
}> = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-xs',
    iconSize: 'w-3.5 h-3.5',
    height: 'h-8',
    minWidth: 'min-w-[32px]',
    iconGap: 'gap-1.5',
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-sm',
    iconSize: 'w-4 h-4',
    height: 'h-10',
    minWidth: 'min-w-[44px]',
    iconGap: 'gap-2',
  },
  lg: {
    padding: 'px-6 py-3',
    text: 'text-base',
    iconSize: 'w-5 h-5',
    height: 'h-12',
    minWidth: 'min-w-[44px]',
    iconGap: 'gap-2',
  },
  fab: {
    padding: 'p-0',
    text: 'text-sm',
    iconSize: 'w-6 h-6',
    height: 'w-14 h-14',
    minWidth: 'min-w-[56px]',
    iconGap: 'gap-0',
  },
};

// ─── Loading Spinner ───────────────────────────────────────────────
const LoadingSpinner: React.FC<{ size: string }> = ({ size }) => (
  <svg
    className={`animate-spin ${size}`}
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
);

// ─── Component ─────────────────────────────────────────────────────
export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  haptic = true,
  ariaLabel,
  disabled,
  className = '',
  children,
  onClick,
  ...props
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const isDisabled = disabled || loading;
  const isInteractive = !isDisabled;

  // Haptic feedback handler
  const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && isInteractive) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const preset = variant === 'primary' ? hapticPresets.CRISP_CLICK : hapticPresets.THUD;
        const pattern = [
          Math.round(preset.time * preset.sharpness * 0.3),
          Math.round(preset.intensity * 255),
        ];
        navigator.vibrate(pattern);
      }
    }
    onClick?.(e);
  };

  // Determine button classes based on state
  const getButtonClasses = () => {
    const baseClasses = `
      inline-flex items-center justify-center
      ${sizeStyle.iconGap}
      ${sizeStyle.padding} ${sizeStyle.height} ${sizeStyle.minWidth}
      ${borderRadius.lg}
      font-semibold
      tracking-wide
      transition-all duration-200
      ${fullWidth ? 'w-full' : ''}
      ${isDisabled ? variantStyle.disabled : ''}
      ${!isDisabled ? `${variantStyle.bg} ${variantStyle.bgHover} ${variantStyle.bgActive}` : ''}
      ${!isDisabled && variantStyle.shadow ? variantStyle.shadow : ''}
      ${!isDisabled && variantStyle.shadowHover ? variantStyle.shadowHover : ''}
    `;

    return baseClasses;
  };

  return (
    <motion.button
      whileTap={isInteractive ? { scale: size === 'fab' ? 0.95 : 0.97 } : undefined}
      transition={{ duration: toSeconds(motionTokens.duration.fast), ease: easing.tight }}
      type="button"
      disabled={isDisabled}
      onClick={handlePress}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        ${getButtonClasses()}
        ${isInteractive ? 'cursor-pointer' : 'cursor-not-allowed'}
        ${variantStyle.border}
        ${variantStyle.text}
        ${className}
      `}
      {...(props as any)}
    >
      {/* Loading State */}
      {loading ? (
        <LoadingSpinner size={sizeStyle.iconSize} />
      ) : (
        <>
          {/* Left Icon */}
          {Icon && iconPosition === 'left' && (
            <Icon className={sizeStyle.iconSize} />
          )}

          {/* Text Content */}
          {children && (
            <span className={sizeStyle.text}>{children}</span>
          )}

          {/* Right Icon */}
          {Icon && iconPosition === 'right' && (
            <Icon className={sizeStyle.iconSize} />
          )}
        </>
      )}
    </motion.button>
  );
};

// ─── Icon Button Variant ───────────────────────────────────────────
export interface IconButtonProps extends Omit<ActionButtonProps, 'children' | 'iconPosition'> {
  icon: React.ElementType;
  label: string; // Accessibility label
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  size = 'md',
  ...props
}) => {
  const sizeStyle = sizeStyles[size];

  return (
    <ActionButton
      size={size}
      icon={Icon}
      ariaLabel={label}
      className={`
        ${size === 'fab' ? '' : 'rounded-full'}
      `}
      {...props}
    >
      {/* Hidden label for screen readers */}
      <span className="sr-only">{label}</span>
    </ActionButton>
  );
};

// ─── Button Group ──────────────────────────────────────────────────
export interface ButtonGroupProps {
  children: React.ReactElement<ActionButtonProps>[];
  /** Gap between buttons */
  gap?: 'sm' | 'md' | 'lg';
  /** Stretch to fill container */
  stretch?: boolean;
  className?: string;
}

const gapStyles = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-3',
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  gap = 'md',
  stretch = false,
  className = '',
}) => (
  <div
    className={`
      flex items-center
      ${gapStyles[gap]}
      ${stretch ? 'w-full' : ''}
      ${className}
    `}
  >
    {React.Children.map(children, (child, index) => (
      <div key={index} className={stretch ? 'flex-1' : ''}>
        {child}
      </div>
    ))}
  </div>
);

// ─── Action Button Presets ─────────────────────────────────────────
export const ActionPresets = {
  Save: (props?: Partial<ActionButtonProps>) => (
    <ActionButton
      variant="primary"
      icon={Icons.Check}
      {...props}
    >
      Save
    </ActionButton>
  ),
  Cancel: (props?: Partial<ActionButtonProps>) => (
    <ActionButton
      variant="ghost"
      icon={Icons.X}
      {...props}
    >
      Cancel
    </ActionButton>
  ),
  Continue: (props?: Partial<ActionButtonProps>) => (
    <ActionButton
      variant="primary"
      icon={Icons.ChevronRight}
      iconPosition="right"
      {...props}
    >
      Continue
    </ActionButton>
  ),
  Add: (props?: Partial<ActionButtonProps>) => (
    <ActionButton
      variant="primary"
      icon={Icons.Plus}
      {...props}
    >
      Add
    </ActionButton>
  ),
  Next: (props?: Partial<ActionButtonProps>) => (
    <ActionButton
      variant="primary"
      icon={Icons.ChevronRight}
      iconPosition="right"
      {...props}
    >
      Next
    </ActionButton>
  ),
};

// ─── Exports ──────────────────────────────────────────────────────
export default ActionButton;
