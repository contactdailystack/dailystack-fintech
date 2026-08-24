/**
 * ============================================================
 * DailyStack Design System — TeslaPill Component v1.0
 * ============================================================
 * Badge/Tag component with color variants
 * 
 * Design Philosophy:
 * - Compact, non-intrusive status indicators
 * - Color variants: mint, cyan, amber (NO red!)
 * - Icon support with consistent sizing
 */

import React from 'react';
import { borderRadius, semanticSpacing } from '../spacing-tokens';
import { mint, cyan, warning, semantic, text } from '../color-tokens';

// ─── Component Props ───────────────────────────────────────────────
export interface TeslaPillProps {
  /** Pill variant/color (E-Pay: lime is primary) */
  variant?: 'lime' | 'mint' | 'cyan' | 'amber' | 'success' | 'insights' | 'neutral' | 'orange';
  /** Pill size */
  size?: 'sm' | 'md' | 'lg';
  /** Content */
  children: React.ReactNode;
  /** Optional icon (Lucide icon component) */
  icon?: React.ElementType;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Optional onClick handler */
  onClick?: () => void;
  /** Additional classes */
  className?: string;
}

// ─── Variant Styles ─────────────────────────────────────────────────
const variantStyles = {
  // E-Pay: lime is the primary variant
  lime: {
    bg: 'bg-[rgba(15, 176, 206,0.15)]',
    border: 'border-[rgba(15, 176, 206,0.3)]',
    text: 'text-[#0FB0CE]',
    dot: '#0FB0CE',
  },
  mint: {
    bg: 'bg-[rgba(15, 176, 206,0.15)]',
    border: 'border-[rgba(15, 176, 206,0.3)]',
    text: 'text-[#0FB0CE]',
    dot: '#0FB0CE',
  },
  cyan: {
    bg: 'bg-[rgba(2,132,199,0.15)]',
    border: 'border-[rgba(2,132,199,0.3)]',
    text: 'text-[#38BDF8]',
    dot: '#38BDF8',
  },
  amber: {
    bg: 'bg-[rgba(249,115,22,0.15)]',
    border: 'border-[rgba(249,115,22,0.3)]',
    text: 'text-[#F97316]',
    dot: '#F97316',
  },
  success: {
    bg: 'bg-[rgba(76,175,80,0.15)]',
    border: 'border-[rgba(76,175,80,0.3)]',
    text: 'text-[#4CAF50]',
    dot: '#4CAF50',
  },
  insights: {
    bg: 'bg-[rgba(139,92,246,0.15)]',
    border: 'border-[rgba(139,92,246,0.3)]',
    text: 'text-[#8B5CF6]',
    dot: '#8B5CF6',
  },
  neutral: {
    bg: 'bg-[rgba(23, 134, 194,0.15)]',
    border: 'border-[rgba(23, 134, 194,0.3)]',
    text: 'text-[#1786C2]',
    dot: '#1786C2',
  },
  // E-Pay: orange accent variant
  orange: {
    bg: 'bg-[rgba(255,87,51,0.15)]',
    border: 'border-[rgba(255,87,51,0.3)]',
    text: 'text-[#FF5733]',
    dot: '#FF5733',
  },
} as const;

// ─── Size Styles ───────────────────────────────────────────────────
const sizeStyles = {
  sm: {
    padding: 'px-1.5 py-0.5',
    text: 'text-[0.625rem]',
    icon: 'w-3 h-3',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2 py-1',
    text: 'text-[0.6875rem]',
    icon: 'w-3.5 h-3.5',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-xs',
    icon: 'w-4 h-4',
    gap: 'gap-2',
  },
} as const;

// ─── Component ─────────────────────────────────────────────────────
export const TeslaPill: React.FC<TeslaPillProps> = ({
  variant = 'mint',
  size = 'md',
  children,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
}) => {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const content = (
    <>
      {Icon && iconPosition === 'left' && (
        <Icon className={sizeStyle.icon} />
      )}
      <span className={sizeStyle.text}>{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className={sizeStyle.icon} />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`
          inline-flex items-center ${sizeStyle.gap}
          ${sizeStyle.padding}
          ${variantStyle.bg}
          border ${variantStyle.border}
          ${variantStyle.text}
          ${borderRadius.full}
          font-medium
          tracking-wide
          uppercase
          transition-all
          duration-200
          cursor-pointer
          hover:opacity-80
          active:scale-95
          ${className}
        `}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      className={`
        inline-flex items-center ${sizeStyle.gap}
        ${sizeStyle.padding}
        ${variantStyle.bg}
        border ${variantStyle.border}
        ${variantStyle.text}
        ${borderRadius.full}
        font-medium
        tracking-wide
        uppercase
        ${className}
      `}
    >
      {content}
    </span>
  );
};

// ─── Status Dot Pill (compact) ─────────────────────────────────────
export interface TeslaStatusDotProps {
  status: 'online' | 'syncing' | 'offline' | 'warning';
  label?: string;
  pulse?: boolean;
}

const statusDotColors = {
  online: '#4CAF50',
  syncing: '#1786C2',
  offline: '#6B7280',
  warning: '#F97316',
};

export const TeslaStatusDot: React.FC<TeslaStatusDotProps> = ({
  status,
  label,
  pulse = false,
}) => (
  <span className="inline-flex items-center gap-2">
    <span
      className={`relative inline-flex h-2 w-2 rounded-full ${pulse ? 'animate-pulse' : ''}`}
    >
      <span
        className="absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: statusDotColors[status] }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ backgroundColor: statusDotColors[status] }}
      />
    </span>
    {label && (
      <span className="text-xs text-gray-400">{label}</span>
    )}
  </span>
);

// ─── Exports are handled via inline export declarations above ---
