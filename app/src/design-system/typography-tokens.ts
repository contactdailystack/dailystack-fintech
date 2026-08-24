/**
 * ============================================================
 * DailyStack Design System — Typography Tokens v1.0
 * ============================================================
 * The Tesla of Personal Finance — Dual Language Typography
 * 
 * Font Philosophy:
 * - Space Grotesk: English + Numbers (tech, modern, precise)
 * - Kanit: Thai language (readable, warm, not rigid)
 * - Tabular Figures: All financial numbers use tabular figures for alignment
 */

// ─── Font Families ─────────────────────────────────────────────────
export const fontFamily = {
  /** Primary sans-serif — Inter for EN + Numbers */
  primary: '"Inter", sans-serif',
  /** Secondary sans-serif — Kanit for TH text */
  secondary: '"Kanit", sans-serif',
  /** Monospace — JetBrains Mono for technical strings only */
  mono: '"JetBrains Mono", "Inter", monospace',
  /** Fallback stack */
  fallback: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
} as const;

// ─── Font Weights ──────────────────────────────────────────────────
export const fontWeight = {
  thin: 100,
  extraLight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const;

// ─── Font Sizes ────────────────────────────────────────────────────
export const fontSize = {
  /** 8pt — micro labels, badges */
  micro: '0.5rem',     // 8px
  /** 9pt — small labels */
  mini: '0.5625rem',   // 9px
  /** 10pt — caption, timestamps */
  caption: '0.625rem', // 10px
  /** 11pt — secondary caption */
  caption2: '0.6875rem', // 11px
  /** 13pt — body small */
  bodySmall: '0.8125rem', // 13px
  /** 14pt — body default */
  body: '0.875rem',    // 14px
  /** 15pt — body large */
  bodyLarge: '0.9375rem', // 15px
  /** 16pt — heading small */
  headingSmall: '1rem',   // 16px
  /** 18pt — heading medium */
  heading: '1.125rem', // 18px
  /** 20pt — heading large */
  headingLarge: '1.25rem', // 20px
  /** 24pt — display small */
  displaySmall: '1.5rem', // 24px
  /** 28pt — display medium (Net Worth) */
  display: '1.75rem',  // 28px
  /** 32pt — display large */
  displayLarge: '2rem', // 32px
  /** 40pt — display hero (Net Worth on Dashboard) */
  hero: '2.5rem',      // 40px
  /** 48pt — display XL (for emphasis) */
  heroLarge: '3rem',   // 48px
  /** 56pt — Net Worth max size */
  netWorth: '3.5rem',  // 56px
} as const;

// ─── Line Heights ──────────────────────────────────────────────────
export const lineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.4,
  relaxed: 1.5,
  loose: 1.75,
} as const;

// ─── Letter Spacing ────────────────────────────────────────────────
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// ─── Text Transforms ───────────────────────────────────────────────
export const textTransform = {
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  normal: 'none',
} as const;

// ─── Typography Scale ──────────────────────────────────────────────
export const typography = {
  /** Net Worth Hero Number — 48-56pt bold */
  netWorth: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.netWorth,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
    fontVariantNumeric: 'tabular-nums',
  },
  /** Display — 24-32pt bold for section titles */
  display: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.displayLarge,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  /** Heading 1 — 20-24pt semi-bold */
  h1: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.displaySmall,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  /** Heading 2 — 18pt semi-bold */
  h2: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.heading,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.normal,
  },
  /** Heading 3 — 16pt semi-bold */
  h3: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.headingSmall,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  /** Body Large — 15pt regular */
  bodyLarge: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  /** Body — 13-14pt regular */
  body: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  /** Body Small — 13pt regular */
  bodySmall: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  /** Caption — 10-11pt regular */
  caption: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  /** Micro — 8-9pt medium */
  micro: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.mini,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wider,
    textTransform: textTransform.uppercase,
  },
  /** Button Text — 14-16pt medium */
  button: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
  /** Label — 11-12pt medium uppercase */
  label: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.caption2,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.widest,
    textTransform: textTransform.uppercase,
  },
  /** Money/Number — 14-16pt tabular figures */
  money: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.normal,
    fontVariantNumeric: 'tabular-nums',
  },
  /** Money Large — 24-28pt tabular figures */
  moneyLarge: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
    fontVariantNumeric: 'tabular-nums',
  },
} as const;

// ─── Type Definitions ──────────────────────────────────────────────
export type FontFamily = typeof fontFamily;
export type FontWeight = typeof fontWeight;
export type FontSize = typeof fontSize;
export type LineHeight = typeof lineHeight;
export type LetterSpacing = typeof letterSpacing;
export type TypographyScale = typeof typography;

// ─── Tailwind-compatible CSS Classes Generator ─────────────────────
export const typographyClasses = {
  /** Apply to HTML or body for global font setting */
  base: 'font-sans antialiased',
  /** Net Worth display class */
  netWorth: 'text-[3.5rem] font-bold leading-tight tracking-tight tabular-nums',
  /** Section heading */
  heading: 'text-xl font-semibold leading-snug',
  /** Card title */
  cardTitle: 'text-lg font-semibold leading-snug',
  /** Body text */
  body: 'text-sm font-normal leading-relaxed',
  /** Caption text */
  caption: 'text-[0.625rem] font-normal leading-normal tracking-wide',
  /** Label/badge text */
  label: 'text-[0.6875rem] font-medium leading-tight tracking-widest uppercase',
  /** Money amount */
  money: 'text-base font-medium leading-tight tabular-nums',
  /** Money large */
  moneyLarge: 'text-2xl font-bold leading-tight tabular-nums',
} as const;

// ─── Typography System Export ───────────────────────────────────────
export const typographyTokens = {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textTransform,
  typography,
  typographyClasses,
} as const;

export type TypographyTokens = typeof typographyTokens;
