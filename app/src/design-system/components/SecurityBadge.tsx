/**
 * ============================================================
 * DailyStack Design System — SecurityBadge Component v1.0
 * ============================================================
 * Security indicator badge for trust & safety UI
 * 
 * Design Philosophy:
 * - Pill-shaped badge with green tint background
 * - Lock icon for security indication
 * - Subtle and prominent variants
 * - Zero emoji — use [Icon: Name] format
 */

import React from 'react';
import { motion } from 'framer-motion';
import { borderRadius } from '../spacing-tokens';
import { semantic, text } from '../color-tokens';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Component Props ───────────────────────────────────────────────
export interface SecurityBadgeProps {
  /** Badge variant */
  variant?: 'subtle' | 'prominent';
  /** Badge label text */
  label: string;
  /** Icon to display */
  icon?: React.ElementType;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Additional classes */
  className?: string;
}

// ─── Icon Components (inline SVG) ──────────────────────────────────
const LockIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// ─── Variant Styles ─────────────────────────────────────────────────
const variantStyles = {
  subtle: {
    bg: 'rgba(52, 199, 89, 0.12)',
    border: 'rgba(52, 199, 89, 0.25)',
    text: '#34C759',
    iconColor: '#34C759',
    padding: 'px-2.5 py-1',
    textSize: 'text-[0.625rem]',
    iconSize: 'w-3 h-3',
    gap: 'gap-1.5',
  },
  prominent: {
    bg: 'rgba(52, 199, 89, 0.18)',
    border: 'rgba(52, 199, 89, 0.4)',
    text: '#30D158',
    iconColor: '#30D158',
    padding: 'px-3 py-1.5',
    textSize: 'text-xs',
    iconSize: 'w-3.5 h-3.5',
    gap: 'gap-2',
  },
} as const;

// ─── Component ─────────────────────────────────────────────────────
export const SecurityBadge: React.FC<SecurityBadgeProps> = ({
  variant = 'subtle',
  label,
  icon: Icon = LockIcon,
  iconPosition = 'left',
  className = '',
}) => {
  const variantStyle = variantStyles[variant];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: toSeconds(motionTokens.duration.fast), 
        ease: easing.tight 
      }}
      className={`
        inline-flex items-center
        ${variantStyle.gap}
        ${variantStyle.padding}
        ${variantStyle.textSize}
        ${borderRadius.full}
        font-medium
        tracking-wide
        uppercase
        ${className}
      `}
      style={{
        backgroundColor: variantStyle.bg,
        border: `1px solid ${variantStyle.border}`,
        color: variantStyle.text,
      }}
      role="status"
      aria-label={`Security: ${label}`}
    >
      {/* Icon */}
      {Icon && iconPosition === 'left' && (
        <Icon className={variantStyle.iconSize} style={{ color: variantStyle.iconColor }} />
      )}

      {/* Label */}
      <span>{label}</span>

      {/* Icon */}
      {Icon && iconPosition === 'right' && (
        <Icon className={variantStyle.iconSize} style={{ color: variantStyle.iconColor }} />
      )}
    </motion.span>
  );
};

// ─── Preset Security Badges ─────────────────────────────────────────
export interface PresetSecurityBadgeProps {
  variant?: 'subtle' | 'prominent';
  className?: string;
}

export const EncryptedBadge: React.FC<PresetSecurityBadgeProps> = ({ 
  variant = 'subtle', 
  className = '' 
}) => (
  <SecurityBadge 
    variant={variant} 
    label="256-bit Encrypted" 
    icon={LockIcon}
    className={className}
  />
);

export const SecureConnectionBadge: React.FC<PresetSecurityBadgeProps> = ({ 
  variant = 'subtle', 
  className = '' 
}) => (
  <SecurityBadge 
    variant={variant} 
    label="Secure Connection" 
    icon={ShieldIcon}
    className={className}
  />
);

export const DataSecureBadge: React.FC<PresetSecurityBadgeProps> = ({ 
  variant = 'subtle', 
  className = '' 
}) => (
  <SecurityBadge 
    variant={variant} 
    label="Your data is secure" 
    icon={ShieldIcon}
    className={className}
  />
);

// ─── Exports ──────────────────────────────────────────────────────
export default SecurityBadge;
