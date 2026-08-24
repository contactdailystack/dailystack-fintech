/**
 * ============================================================
 * DailyStack Design System — GlassSurface Component v1.0
 * ============================================================
 * Frosted glass background component
 * 
 * Design Philosophy:
 * - Glass-morphism with subtle blur
 * - Consistent with Tesla automotive aesthetic
 * - Dark mode optimized
 */

import React from 'react';
import { borderRadius } from '../spacing-tokens';
import { components, border } from '../color-tokens';

// ─── Component Props ───────────────────────────────────────────────
export interface GlassSurfaceProps {
  /** Surface intensity (opacity) */
  intensity?: 'light' | 'medium' | 'heavy';
  /** Border style */
  borderStyle?: 'subtle' | 'default' | 'glow';
  /** Border radius */
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  /** Children */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional classes */
  className?: string;
}

// ─── Intensity Styles ───────────────────────────────────────────────
const intensityStyles = {
  light: {
    bg: 'rgba(26, 26, 26, 0.5)',
    backdrop: 'blur(12px)',
  },
  medium: {
    bg: 'rgba(26, 26, 26, 0.7)',
    backdrop: 'blur(20px)',
  },
  heavy: {
    bg: 'rgba(26, 26, 26, 0.85)',
    backdrop: 'blur(28px)',
  },
} as const;

// ─── Border Styles ─────────────────────────────────────────────────
const borderStyles = {
  subtle: `border border-[rgba(255,255,255,0.05)]`,
  default: `border border-[${border.DEFAULT}]`,
  glow: `border border-[rgba(205,255,36,0.2)]`,
} as const;

// ─── Radius Styles ─────────────────────────────────────────────────
const radiusStyles = {
  sm: borderRadius.md,
  md: borderRadius.lg,
  lg: borderRadius.xl,
  xl: borderRadius['2xl'],
} as const;

// ─── Component ─────────────────────────────────────────────────────
export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  intensity = 'medium',
  borderStyle = 'default',
  radius = 'lg',
  children,
  onClick,
  className = '',
}) => {
  const intensityStyle = intensityStyles[intensity];
  const radiusStyle = radiusStyles[radius];

  return (
    <div
      onClick={onClick}
      className={`
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: intensityStyle.bg,
        backdropFilter: intensityStyle.backdrop,
        WebkitBackdropFilter: intensityStyle.backdrop,
        borderRadius: radiusStyle,
        border: borderStyle === 'default' ? `1px solid ${border.DEFAULT}` : undefined,
      }}
    >
      {borderStyle === 'subtle' && (
        <div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{ borderRadius: radiusStyle }}
        >
          <div className="absolute inset-0 border border-[rgba(255,255,255,0.05)] rounded-inherit" />
        </div>
      )}
      {borderStyle === 'glow' && (
        <div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{ borderRadius: radiusStyle }}
        >
          <div className="absolute inset-0 border border-[rgba(205,255,36,0.2)] rounded-inherit" />
          <div
            className="absolute inset-0 rounded-inherit"
            style={{
              boxShadow: '0 0 20px rgba(205, 255, 36, 0.1) inset',
            }}
          />
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// ─── Glass Card (with padding) ──────────────────────────────────────
export interface GlassCardProps extends GlassSurfaceProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  padding = 'md',
  children,
  className = '',
  ...props
}) => (
  <GlassSurface
    {...props}
    className={`
      ${paddingStyles[padding]}
      ${className}
    `}
  >
    {children}
  </GlassSurface>
);

// ─── Glass Modal/Sheet ─────────────────────────────────────────────
export interface GlassModalProps extends GlassSurfaceProps {
  /** Modal width */
  width?: 'sm' | 'md' | 'lg' | 'full';
}

const widthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full',
};

export const GlassModal: React.FC<GlassModalProps> = ({
  width = 'md',
  children,
  className = '',
  ...props
}) => (
  <GlassSurface
    intensity="heavy"
    borderStyle="glow"
    radius="xl"
    className={`
      ${widthStyles[width]}
      mx-auto
      shadow-2xl
      ${className}
    `}
    {...props}
  >
    {children}
  </GlassSurface>
);

// ─── Exports are handled via inline export declarations above ---
