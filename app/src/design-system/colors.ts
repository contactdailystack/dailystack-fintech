/**
 * @deprecated since v36 — Token architecture migrated to tokens.css
 * ============================================================
 * DailyStack — Color Tokens v1.0 (LEGACY)
 * ============================================================
 * SSOT is now: design-system/tokens.css (CSS custom properties)
 * Do NOT add new color definitions here.
 * ============================================================
 * ============================================================
 * Design Constitution v4.1 — Color System
 * Pilo/Emerald Mint theme (#0FB0CE / #0FB0CE)
 * Calm Finance: Amber warnings, never red
 */

// ─── Brand Colors ───────────────────────────────────────────────

export const BRAND = {
  /** Primary — Pilo/Emerald Mint */
  PRIMARY: '#0FB0CE',
  /** Primary lighter */
  LIGHT: '#3FC4DB',
  /** Primary muted */
  MUTED: '#AFE021',
  /** Primary dark */
  DARK: '#8BC926',
  /** 10% opacity */
  ALPHA_10: 'rgba(15, 176, 206, 0.10)',
  /** 20% opacity */
  ALPHA_20: 'rgba(15, 176, 206, 0.20)',
  /** 30% opacity */
  ALPHA_30: 'rgba(15, 176, 206, 0.30)',
  /** 50% opacity */
  ALPHA_50: 'rgba(15, 176, 206, 0.50)',
} as const;

// ─── Semantic Color Scale ───────────────────────────────────────

export const SEMANTIC = {
  // ── Backgrounds
  BG_DARK: '#050D1F',         // SSOT: Dark Base
  BG_CARD: '#0C2140',          // SSOT: Surface
  BG_BORDER: '#2D313E',        // Sleek slate border

  // ── Text hierarchy
  TEXT_PRIMARY: '#FFFFFF',     // 100% — Balance, headlines
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.60)',  // 60% — Labels, categories
  TEXT_TERTIARY: 'rgba(255, 255, 255, 0.35)',   // 35% — Past transactions

  // ── Status: Calm Finance (NO RED)
  SUCCESS: '#10B981',          // Emerald — growth, positive
  SUCCESS_LIGHT: '#34D399',   // Emerald light
  WARNING: '#D97706',          // Amber/Muted Orange — budget drift
  WARNING_LIGHT: '#F59E0B',   // Amber light
  WARNING_SOFT: '#B45309',    // Deeper amber for danger states
  INFO: '#1786C2',            // Blue — neutral info

  // ── Emotion colors
  IMPULSE: '#F59E0B',         // Amber — impulse spend
  JOY: '#10B981',             // Emerald — joy/healthy
  STRESS: '#F59E0B',          // Amber — stress
  SOCIAL: '#8B5CF6',           // Purple — social
  VALUE: '#0FB0CE',            // Brand — value
  INVESTMENT: '#1786C2',      // Blue — investment

  // ── Gradients
  GRADIENT_BRAND: 'linear-gradient(135deg, #0FB0CE 0%, #10B981 100%)',
  GRADIENT_CARD: 'linear-gradient(180deg, #0C2140 0%, #050D1F 100%)',
  GRADIENT_GLOW: 'radial-gradient(circle, rgba(15, 176, 206, 0.15) 0%, transparent 70%)',
} as const;

// ─── Accent Colors ──────────────────────────────────────────────

export const ACCENT = {
  GOLD: '#FFD700',             // Elite/premium
  GOLD_MUTED: '#B8860B',      // Gold dark
  PURPLE: '#8B5CF6',          // AI/pro features
  PURPLE_LIGHT: '#A78BFA',
  BLUE: '#1786C2',            // Info/links
  BLUE_LIGHT: '#3FA3D6',
  PINK: '#EC4899',            // Social
  INDIGO: '#6366F1',          // Secondary action
} as const;

// ─── Neutral / Surface Colors ───────────────────────────────────

export const NEUTRAL = {
  // ZINC scale (dark theme optimized)
  ZINC_50: '#FAFAFA',
  ZINC_100: '#F4F4F5',
  ZINC_200: '#E4E4E7',
  ZINC_300: '#D4D4D8',
  ZINC_400: '#A1A1AA',
  ZINC_500: '#71717A',
  ZINC_600: '#52525B',
  ZINC_700: '#3F3F46',
  ZINC_800: '#27272A',
  ZINC_900: '#18181B',
  ZINC_950: '#09090B',

  // DailyStack custom surfaces
  OVERLAY: 'rgba(0, 0, 0, 0.75)',
  GLASS: 'rgba(12, 33, 64, 0.85)',
  GLASS_LIGHT: 'rgba(12, 33, 64, 0.60)',
  GLASS_HEAVY: 'rgba(12, 33, 64, 0.40)',
} as const;

// ─── Type Definitions ──────────────────────────────────────────

export type BrandColor = keyof typeof BRAND;
export type SemanticColor = keyof typeof SEMANTIC;
export type AccentColor = keyof typeof ACCENT;

// ─── Tailwind Custom Color Map ──────────────────────────────────
// These map to Tailwind's theme.extend.colors

export const TAILWIND_COLORS = {
  brand: BRAND.PRIMARY,
  'brand-muted': BRAND.MUTED,
  'dark-bg': SEMANTIC.BG_DARK,
  'dark-card': SEMANTIC.BG_CARD,
  'dark-border': SEMANTIC.BG_BORDER,
  'amber-warm': SEMANTIC.WARNING,
  'amber-soft': SEMANTIC.WARNING_SOFT,
} as const;

// ─── CSS Custom Properties Export ───────────────────────────────

export const COLOR_CSS_PROPERTIES = `
  --color-brand: ${BRAND.PRIMARY};
  --color-brand-muted: ${BRAND.MUTED};
  --color-brand-light: ${BRAND.LIGHT};
  --color-brand-dark: ${BRAND.DARK};

  --color-bg-dark: ${SEMANTIC.BG_DARK};
  --color-bg-card: ${SEMANTIC.BG_CARD};
  --color-bg-border: ${SEMANTIC.BG_BORDER};

  --color-text-primary: ${SEMANTIC.TEXT_PRIMARY};
  --color-text-secondary: ${SEMANTIC.TEXT_SECONDARY};
  --color-text-tertiary: ${SEMANTIC.TEXT_TERTIARY};

  --color-success: ${SEMANTIC.SUCCESS};
  --color-warning: ${SEMANTIC.WARNING};
  --color-warning-light: ${SEMANTIC.WARNING_LIGHT};
  --color-info: ${SEMANTIC.INFO};

  --color-impulse: ${SEMANTIC.IMPULSE};
  --color-joy: ${SEMANTIC.JOY};
  --color-stress: ${SEMANTIC.STRESS};
  --color-social: ${SEMANTIC.SOCIAL};
  --color-value: ${SEMANTIC.VALUE};
  --color-investment: ${SEMANTIC.INVESTMENT};

  --color-gold: ${ACCENT.GOLD};
  --color-purple: ${ACCENT.PURPLE};
` as const;

// ─── Z-Axis Glassmorphism Helpers ───────────────────────────────

export const ZAXIS = {
  PRIMARY: {
    zIndex: 10,
    backdropFilter: 'blur(12px) saturate(1.4)',
    background: NEUTRAL.GLASS,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(15, 176, 206, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  SECONDARY: {
    zIndex: 5,
    backdropFilter: 'blur(20px) saturate(0.9)',
    background: NEUTRAL.GLASS_LIGHT,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  TERTIARY: {
    zIndex: 2,
    backdropFilter: 'blur(28px) saturate(0.7)',
    background: NEUTRAL.GLASS_HEAVY,
    opacity: 0.85,
    border: '1px solid rgba(255, 255, 255, 0.02)',
  },
} as const;
