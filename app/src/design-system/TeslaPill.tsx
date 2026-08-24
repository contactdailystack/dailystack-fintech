/**
 * ============================================================
 * DailyStack — TeslaPill v1.0
 * ============================================================
 * Badge/tag component — pill-shaped labels for categories,
 * status indicators, and plan badges
 *
 * Visual Language:
 *   Background: color at 15% opacity
 *   Text: color at full
 *   border-radius: 9999px (fully rounded)
 *   Font: Inter, uppercase, tracking-widest
 *
 * NO emoji. NO border-red-*, bg-red-*, text-red-*
 */

import { memo } from 'react';
import { haptics } from '../services/hapticService';

// ─── Props Interface ───────────────────────────────────────────────
export interface TeslaPillProps {
  /** Pill label */
  children: React.ReactNode;
  /** Pill accent color (default: #56be89) */
  color?: string;
  /** Pill size variant */
  size?: 'sm' | 'md';
  /** Optional onClick — fires haptics */
  onClick?: () => void;
  /** Accessibility label */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
}

// ─── Size Configurations ───────────────────────────────────────────
const SIZE_CONFIG = {
  sm: {
    fontSize: '7px',
    paddingX: 6,
    paddingY: 2,
    minHeight: 18,
  },
  md: {
    fontSize: '8px',
    paddingX: 8,
    paddingY: 3,
    minHeight: 22,
  },
} as const;

// ─── TeslaPill Component ───────────────────────────────────────────
export const TeslaPill = memo(function TeslaPill({
  children,
  color = '#56be89',
  size = 'sm',
  onClick,
  ariaLabel,
  className = '',
}: TeslaPillProps) {
  const config = SIZE_CONFIG[size];
  const isInteractive = Boolean(onClick);

  // Derive muted background from color (15% opacity)
  const bgColor = `${color}26`; // 0x26 ≈ 15%

  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bgColor,
    color: color,
    borderRadius: '9999px',
    fontFamily: '"Inter", sans-serif',
    fontSize: config.fontSize,
    fontWeight: 700, // Black weight
    letterSpacing: '0.1em', // tracking-widest approximation
    textTransform: 'uppercase',
    paddingLeft: config.paddingX,
    paddingRight: config.paddingX,
    paddingTop: config.paddingY,
    paddingBottom: config.paddingY,
    minHeight: config.minHeight,
    minWidth: config.minHeight, // maintain pill shape on very short labels
    cursor: isInteractive ? 'pointer' : 'default',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    border: `1px solid ${color}30`,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  };

  const handleClick = () => {
    if (onClick) {
      haptics.fire('SELECT');
      onClick();
    }
  };

  return (
    <span
      className={className}
      style={pillStyle}
      onClick={handleClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      {children}
    </span>
  );
});

export default TeslaPill;
