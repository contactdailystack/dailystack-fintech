/**
 * ============================================================
 * DailyStack Design System — TeslaDivider Component v1.0
 * ============================================================
 * Section divider with optional label
 * 
 * Design Philosophy:
 * - Clean, minimal horizontal rule
 * - Optional uppercase label with tracking
 * - Used for section separation
 */

import React from 'react';
import { spacing } from '../spacing-tokens';
import { border, text } from '../color-tokens';

// ─── Component Props ───────────────────────────────────────────────
export interface TeslaDividerProps {
  /** Optional label text */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'center' | 'right';
  /** Divider style */
  variant?: 'solid' | 'dashed' | 'gradient';
  /** Vertical spacing */
  space?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional classes */
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────
export const TeslaDivider: React.FC<TeslaDividerProps> = ({
  label,
  labelPosition = 'center',
  variant = 'solid',
  space = 'md',
  className = '',
}) => {
  // Spacing based on size
  const spacingMap = {
    none: '',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
  };

  // Border style
  const borderStyles = {
    solid: `border-[${border.DEFAULT}]`,
    dashed: `border-dashed border-[${border.DEFAULT}]`,
    gradient: 'border-transparent bg-gradient-to-r from-transparent via-[#2D313E] to-transparent',
  };

  // Label position classes
  const labelPositionClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`flex items-center ${spacingMap[space]} ${className}`}>
      {/* Left line */}
      {label && labelPosition !== 'left' && (
        <div
          className={`flex-1 ${variant === 'gradient' ? 'h-px bg-gradient-to-r from-transparent to-[#2D313E]' : `border-t ${borderStyles[variant]}`}`}
        />
      )}

      {/* Label */}
      {label && (
        <span
          className={`
            px-3
            text-[0.625rem]
            font-medium
            tracking-[0.1em]
            uppercase
            text-[${text.tertiary}]
            ${labelPositionClasses[labelPosition]}
          `}
        >
          {label}
        </span>
      )}

      {/* Right line */}
      {label && labelPosition !== 'right' && (
        <div
          className={`flex-1 ${variant === 'gradient' ? 'h-px bg-gradient-to-l from-transparent to-[#2D313E]' : `border-t ${borderStyles[variant]}`}`}
        />
      )}

      {/* No label */}
      {!label && (
        <div
          className={`w-full border-t ${borderStyles[variant]}`}
        />
      )}
    </div>
  );
};

// ─── Section Label (text only) ─────────────────────────────────────
export interface TeslaSectionLabelProps {
  label: string;
  action?: React.ReactNode;
  className?: string;
}

export const TeslaSectionLabel: React.FC<TeslaSectionLabelProps> = ({
  label,
  action,
  className = '',
}) => (
  <div className={`flex items-center justify-between mb-3 ${className}`}>
    <span
      className={`
        text-[0.6875rem]
        font-medium
        tracking-[0.1em]
        uppercase
        text-[${text.tertiary}]
      `}
    >
      {label}
    </span>
    {action && <div>{action}</div>}
  </div>
);

// ─── Exports are handled via inline export declarations above ---
