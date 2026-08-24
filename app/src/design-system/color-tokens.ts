/**
 * @deprecated since v36 — Token architecture migrated to tokens.css
 * ============================================================
 * DailyStack Design System — Color Tokens v3.0 (LEGACY)
 * ============================================================
 * SSOT is now: design-system/tokens.css (CSS custom properties)
 * Do NOT use hardcoded color values from this file.
 * Replace with: background: var(--bg-page); color: var(--text-primary); etc.
 * ============================================================
 * PicksWise Brand — Soft Mint Green (#56be89)
 * 
 * Color Philosophy:
 * - Primary: Soft Mint Green (#56be89) — active states, primary buttons
 * - Secondary: Orange (#FF5733) — accents, notifications
 * - Background: Deep Dark (#101010 / #1A1A1A) — premium, modern
 * - Border Radius: 16-24px — rounded, friendly, no sharp edges
 * - WARNING: Never use red (#FF0000 or similar) — use Amber (#F97316) instead
 * - ZERO emoji in UI — use [Icon: Name] format for all visual elements
 * 
 * v3.0 Changes:
 * - CI Color changed from Lime (#56be89) to Soft Mint (#56be89)
 */

// ─── Brand Colors: Soft Mint Green (#56be89) ─────────────────────────────────
export const mint = {
  /** Primary action, CTA buttons, active states */
  DEFAULT: '#56be89',
  /** Light mint for hover states */
  light: '#6fcca3',
  /** Muted mint for subtle backgrounds */
  muted: 'rgba(86, 190, 137, 0.15)',
  /** Ghost mint for borders and dividers */
  ghost: 'rgba(86, 190, 137, 0.3)',
} as const;

// ─── Legacy: Lime Green (backward compatibility) ────────────────────────────
export const lime = {
  /** Primary action, CTA buttons, active states */
  DEFAULT: '#56be89',
  /** Light lime for hover states */
  light: '#6fcca3',
  /** Muted lime for subtle backgrounds */
  muted: 'rgba(86, 190, 137, 0.15)',
  /** Ghost lime for borders and dividers */
  ghost: 'rgba(86, 190, 137, 0.3)',
} as const;

// ─── E-Pay Brand Colors: Orange Accent ────────────────────────────
export const orange = {
  /** Secondary accent for highlights */
  DEFAULT: '#FF5733',
  /** Light orange for hover states */
  light: '#FF7A52',
  /** Muted orange for subtle backgrounds */
  muted: 'rgba(255, 87, 51, 0.15)',
  /** Ghost orange for borders */
  ghost: 'rgba(255, 87, 51, 0.3)',
} as const;

// ─── Brand Colors: Electric Cyan ────────────────────────────────────
export const cyan = {
  /** Primary cyan for accents and growth indicators */
  DEFAULT: '#0284C7',
  /** Light cyan for subtle highlights */
  light: '#38BDF8',
  /** Dark cyan for text on light backgrounds (if needed) */
  dark: '#0369A1',
  /** Muted cyan for backgrounds */
  muted: 'rgba(2, 132, 199, 0.15)',
  /** Ghost cyan for borders */
  ghost: 'rgba(2, 132, 199, 0.3)',
} as const;

// ─── Background Colors ─────────────────────────────────────────────
export const background = {
  /** Primary background — deep dark */
  deepSpace: '#101010',
  /** Secondary background */
  slate: '#0F172A',
  /** Card surface — elevated backgrounds */
  card: '#1A1A1A',
  /** Surface for glass-morphism */
  surface: 'rgba(26, 26, 26, 0.95)',
  /** Modal backdrop */
  backdrop: 'rgba(16, 16, 16, 0.85)',
  /** Surface color (new) */
  surfaceNew: '#141414',
} as const;

// ─── Border & Divider Colors ──────────────────────────────────────
export const border = {
  /** Default divider color */
  DEFAULT: '#2A2A2A',
  /** Subtle divider for section breaks */
  subtle: 'rgba(42, 42, 42, 0.6)',
  /** Mint accent border for active/focus */
  accent: 'rgba(86, 190, 137, 0.4)',
  /** Glow border for premium elements */
  glow: 'rgba(86, 190, 137, 0.2)',
} as const;

// ─── Text Colors ──────────────────────────────────────────────────
export const text = {
  /** Primary text — white for maximum contrast */
  primary: '#FFFFFF',
  /** Secondary text — gray */
  secondary: '#888888',
  /** Tertiary text — muted gray */
  tertiary: '#666666',
  /** Muted text for labels */
  muted: '#555555',
  /** Inverse text — dark on light (for mint backgrounds) */
  inverse: '#101010',
} as const;

// ─── Semantic Colors: Status ────────────────────────────────────────
export const semantic = {
  /** Success — positive changes, completed actions, money saved */
  success: '#4CAF50',
  /** Success light — subtle success backgrounds */
  successLight: 'rgba(76, 175, 80, 0.15)',
  /** Neutral — informational, waiting states */
  neutral: '#3B82F6',
  /** Neutral light — subtle neutral backgrounds */
  neutralLight: 'rgba(59, 130, 246, 0.15)',
  /** Insights — AI insights, recommendations */
  insights: '#8B5CF6',
  /** Insights light — subtle insights backgrounds */
  insightsLight: 'rgba(139, 92, 246, 0.15)',
} as const;

// ─── Warning & Error Colors ────────────────────────────────────────
export const warning = {
  /** Amber — for warnings, approaching limits (NOT red!) */
  DEFAULT: '#F97316',
  /** Orange warm — softer warning */
  warm: '#D97706',
  /** Orange soft — subtle warnings */
  soft: '#FB923C',
  /** Amber muted — warning backgrounds */
  muted: 'rgba(249, 115, 22, 0.15)',
  /** Amber ghost — warning borders */
  ghost: 'rgba(249, 115, 22, 0.3)',
  /** Pulse amber — for animated warnings */
  pulse: 'rgba(249, 115, 22, 0.6)',
} as const;

export const error = {
  /** Error — use sparingly, prefer Amber for warnings */
  DEFAULT: '#FF5C73',
  /** Error light — subtle error backgrounds */
  light: 'rgba(255, 92, 115, 0.15)',
  /** Error ghost — error borders */
  ghost: 'rgba(255, 92, 115, 0.3)',
} as const;

// ─── Component-specific Colors ──────────────────────────────────────
export const components = {
  /** Glass morphism overlay */
  glass: {
    surface: 'rgba(26, 26, 26, 0.7)',
    border: 'rgba(255, 255, 255, 0.08)',
    blur: 'blur(20px)',
  },
  /** Card elevation levels */
  card: {
    level1: '#1A1A1A',
    level2: '#202020',
    level3: '#262626',
  },
  /** Skeleton loading */
  skeleton: {
    base: '#1E1E1E',
    shimmer: '#2A2A2A',
  },
} as const;

// ─── Type Definitions ──────────────────────────────────────────────
export type MintColors = typeof mint;
export type CyanColors = typeof cyan;
export type BackgroundColors = typeof background;
export type BorderColors = typeof border;
export type TextColors = typeof text;
export type SemanticColors = typeof semantic;
export type WarningColors = typeof warning;
export type ErrorColors = typeof error;
export type ComponentColors = typeof components;

// ─── CSS Variable Export (for runtime theming) ──────────────────────
export const cssVariables = {
  // Brand Colors
  '--color-mint': mint.DEFAULT,
  '--color-mint-light': mint.light,
  '--color-mint-muted': mint.muted,
  '--color-lime': lime.DEFAULT,
  '--color-lime-light': lime.light,
  '--color-lime-muted': lime.muted,
  '--color-orange': orange.DEFAULT,
  '--color-orange-light': orange.light,
  '--color-orange-muted': orange.muted,
  '--color-cyan': cyan.DEFAULT,
  '--color-cyan-light': cyan.light,
  '--color-cyan-muted': cyan.muted,
  // Background
  '--color-deep-space': background.deepSpace,
  '--color-slate': background.slate,
  '--color-card': background.card,
  '--color-surface': background.surface,
  // Border
  '--color-border': border.DEFAULT,
  '--color-border-subtle': border.subtle,
  '--color-border-accent': border.accent,
  // Text
  '--color-text-primary': text.primary,
  '--color-text-secondary': text.secondary,
  '--color-text-muted': text.muted,
  // Semantic
  '--color-success': semantic.success,
  '--color-success-light': semantic.successLight,
  '--color-neutral': semantic.neutral,
  '--color-insights': semantic.insights,
  '--color-insights-light': semantic.insightsLight,
  // Warning (Amber, NOT red)
  '--color-warning': warning.DEFAULT,
  '--color-warning-muted': warning.muted,
  // Error (use sparingly)
  '--color-error': error.DEFAULT,
} as const;

// ─── Color System Export ───────────────────────────────────────────
export const colorTokens = {
  mint,
  lime,
  orange,
  cyan,
  background,
  border,
  text,
  semantic,
  warning,
  error,
  components,
} as const;

export type ColorTokens = typeof colorTokens;
