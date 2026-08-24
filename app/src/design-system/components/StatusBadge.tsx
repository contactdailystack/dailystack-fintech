/**
 * ============================================================
 * DailyStack Design System — StatusBadge Component v1.0
 * ============================================================
 * Pill-shaped badge with color variants for status indicators
 * 
 * Design Philosophy:
 * - Compact, non-intrusive status indicators
 * - Color variants: success/warning/error/info/neutral
 * - Optional status dot indicator
 * - Multiple sizes
 */

import React from 'react';
import { motion } from 'framer-motion';
import { borderRadius } from '../spacing-tokens';
import { semantic, warning, error, text, border } from '../color-tokens';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Badge Variants ────────────────────────────────────────────────
export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

// ─── Component Props ───────────────────────────────────────────────
export interface StatusBadgeProps {
  /** Badge variant/color */
  variant?: StatusBadgeVariant;
  /** Show status dot */
  showDot?: boolean;
  /** Animate dot pulse */
  pulse?: boolean;
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Content */
  children: React.ReactNode;
  /** Optional icon */
  icon?: React.ElementType;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Optional onClick handler */
  onClick?: () => void;
  /** Additional classes */
  className?: string;
}

// ─── Variant Colors ───────────────────────────────────────────────
const variantColors: Record<StatusBadgeVariant, {
  bg: string;
  border: string;
  text: string;
  dot: string;
}> = {
  success: {
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#10B981',
    dot: '#10B981',
  },
  warning: {
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.3)',
    text: '#F97316',
    dot: '#F97316',
  },
  error: {
    bg: 'rgba(255, 92, 115, 0.15)',
    border: 'rgba(255, 92, 115, 0.3)',
    text: '#FF5C73',
    dot: '#FF5C73',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: '#3B82F6',
    dot: '#3B82F6',
  },
  neutral: {
    bg: 'rgba(136, 136, 136, 0.15)',
    border: 'rgba(136, 136, 136, 0.3)',
    text: '#888888',
    dot: '#888888',
  },
};

// ─── Size Styles ──────────────────────────────────────────────────
const sizeStyles: Record<'sm' | 'md' | 'lg', {
  padding: string;
  text: string;
  icon: string;
  dot: string;
  gap: string;
}> = {
  sm: {
    padding: 'px-1.5 py-0.5',
    text: 'text-[0.625rem]',
    icon: 'w-3 h-3',
    dot: 'w-1.5 h-1.5',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2 py-1',
    text: 'text-[0.6875rem]',
    icon: 'w-3.5 h-3.5',
    dot: 'w-2 h-2',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-xs',
    icon: 'w-4 h-4',
    dot: 'w-2.5 h-2.5',
    gap: 'gap-2',
  },
};

// ─── Status Dot ────────────────────────────────────────────────────
const StatusDot: React.FC<{ 
  color: string; 
  pulse?: boolean;
  size: string;
}> = ({ color, pulse = false, size }) => (
  <span className={`relative inline-flex ${size}`}>
    {/* Pulse ring */}
    {pulse && (
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    )}
    {/* Core dot */}
    <span
      className="relative inline-flex h-full w-full rounded-full"
      style={{ backgroundColor: color }}
    />
  </span>
);

// ─── Component ─────────────────────────────────────────────────────
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'neutral',
  showDot = false,
  pulse = false,
  size = 'md',
  children,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
}) => {
  const variantStyle = variantColors[variant];
  const sizeStyle = sizeStyles[size];

  const content = (
    <>
      {/* Status Dot */}
      {showDot && (
        <StatusDot 
          color={variantStyle.dot} 
          pulse={pulse}
          size={sizeStyle.dot}
        />
      )}

      {/* Icon */}
      {Icon && iconPosition === 'left' && (
        <Icon className={sizeStyle.icon} style={{ color: variantStyle.text }} />
      )}

      {/* Text */}
      <span>{children}</span>

      {/* Icon */}
      {Icon && iconPosition === 'right' && (
        <Icon className={sizeStyle.icon} style={{ color: variantStyle.text }} />
      )}
    </>
  );

  const badgeClasses = `
    inline-flex items-center ${sizeStyle.gap}
    ${sizeStyle.padding}
    ${sizeStyle.text}
    ${borderRadius.full}
    font-medium
    tracking-wide
    uppercase
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  // Interactive badge (button)
  if (onClick) {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={{ duration: toSeconds(motionTokens.duration.fast), ease: easing.tight }}
        type="button"
        onClick={onClick}
        className={badgeClasses}
        style={{
          backgroundColor: variantStyle.bg,
          border: `1px solid ${variantStyle.border}`,
          color: variantStyle.text,
        }}
      >
        {content}
      </motion.button>
    );
  }

  // Static badge (span)
  return (
    <span
      className={badgeClasses}
      style={{
        backgroundColor: variantStyle.bg,
        border: `1px solid ${variantStyle.border}`,
        color: variantStyle.text,
      }}
    >
      {content}
    </span>
  );
};

// ─── Preset Badges ─────────────────────────────────────────────────
export interface PresetBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompletedBadge: React.FC<PresetBadgeProps> = ({ size = 'sm', className = '' }) => (
  <StatusBadge variant="success" size={size} showDot className={className}>
    Completed
  </StatusBadge>
);

export const PendingBadge: React.FC<PresetBadgeProps> = ({ size = 'sm', className = '' }) => (
  <StatusBadge variant="warning" size={size} showDot pulse className={className}>
    Pending
  </StatusBadge>
);

export const FailedBadge: React.FC<PresetBadgeProps> = ({ size = 'sm', className = '' }) => (
  <StatusBadge variant="error" size={size} showDot className={className}>
    Failed
  </StatusBadge>
);

export const NewBadge: React.FC<PresetBadgeProps> = ({ size = 'sm', className = '' }) => (
  <StatusBadge variant="info" size={size} className={className}>
    New
  </StatusBadge>
);

export const ActiveBadge: React.FC<PresetBadgeProps> = ({ size = 'sm', className = '' }) => (
  <StatusBadge variant="success" size={size} showDot pulse className={className}>
    Active
  </StatusBadge>
);

export const InactiveBadge: React.FC<PresetBadgeProps> = ({ size = 'sm', className = '' }) => (
  <StatusBadge variant="neutral" size={size} className={className}>
    Inactive
  </StatusBadge>
);

// ─── Badge Group ───────────────────────────────────────────────────
export interface BadgeGroupProps {
  children: React.ReactNode;
  /** Gap between badges */
  gap?: 'sm' | 'md';
  /** Wrap badges */
  wrap?: boolean;
  className?: string;
}

const badgeGapStyles = {
  sm: 'gap-1',
  md: 'gap-2',
};

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  gap = 'sm',
  wrap = true,
  className = '',
}) => (
  <div
    className={`
      flex items-center
      ${badgeGapStyles[gap]}
      ${wrap ? 'flex-wrap' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

// ─── Exports ──────────────────────────────────────────────────────
export default StatusBadge;
