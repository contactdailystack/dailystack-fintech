/**
 * ============================================================
 * DailyStack — TeslaDivider v1.0
 * ============================================================
 * Section label divider — uppercase label with thin horizontal
 * lines on both sides
 *
 * Visual Language:
 *   Uppercase label: 8px font, tracking-[0.2em], color #2D313E
 *   Thin horizontal lines on both sides of label
 *   Font: Inter, uppercase
 */

import { memo } from 'react';

// ─── Props Interface ───────────────────────────────────────────────
export interface TeslaDividerProps {
  /** Divider label text */
  label: string;
  /** Line color (default: #2D313E) */
  lineColor?: string;
  /** Label color (default: #2D313E) */
  labelColor?: string;
  /** Label font size (default: 8) */
  fontSize?: number;
  /** Label letter spacing (default: 0.2) */
  letterSpacing?: number;
  /** Gap between lines and label (default: 8px) */
  gap?: number;
  /** Line height/thickness (default: 1px) */
  lineHeight?: number;
  /** Additional CSS class names */
  className?: string;
}

// ─── TeslaDivider Component ────────────────────────────────────────
export const TeslaDivider = memo(function TeslaDivider({
  label,
  lineColor = '#2D313E',
  labelColor = '#2D313E',
  fontSize = 8,
  letterSpacing = 0.2,
  gap = 8,
  lineHeight = 1,
  className = '',
}: TeslaDividerProps) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="separator"
      aria-label={label}
    >
      {/* Left line */}
      <div
        style={{
          flex: 1,
          height: `${lineHeight}px`,
          backgroundColor: lineColor,
          borderRadius: `${lineHeight}px`,
        }}
      />

      {/* Label */}
      <span
        style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: `${fontSize}px`,
          fontWeight: 700, // Black weight
          textTransform: 'uppercase',
          letterSpacing: `${letterSpacing}em`,
          color: labelColor,
          whiteSpace: 'nowrap',
          paddingLeft: gap,
          paddingRight: gap,
        }}
      >
        {label}
      </span>

      {/* Right line */}
      <div
        style={{
          flex: 1,
          height: `${lineHeight}px`,
          backgroundColor: lineColor,
          borderRadius: `${lineHeight}px`,
        }}
      />
    </div>
  );
});

export default TeslaDivider;
