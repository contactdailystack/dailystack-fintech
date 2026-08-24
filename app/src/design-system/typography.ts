/**
 * ============================================================
 * DailyStack — Typography Scale v1.0
 * ============================================================
 * Design Constitution v4.1 — Typography System
 * Fonts: Space Grotesk (display/UI), Kanit (Thai body), JetBrains Mono (code)
 */

// ─── Type Scale ─────────────────────────────────────────────────
// Based on 1.25 (Major Third) modular scale

export const FONT_SIZE = {
  /** 10px — legal, captions */
  '2xs': '0.625rem',   // 10px
  /** 11px — micro labels */
  xs: '0.6875rem',     // 11px
  /** 12px — captions, tags */
  sm: '0.75rem',       // 12px
  /** 14px — body small */
  base: '0.875rem',     // 14px
  /** 16px — body default */
  md: '1rem',          // 16px
  /** 18px — body large */
  lg: '1.125rem',      // 18px
  /** 20px — subheading */
  xl: '1.25rem',       // 20px
  /** 24px — heading 3 */
  '2xl': '1.5rem',     // 24px
  /** 30px — heading 2 */
  '3xl': '1.875rem',   // 30px
  /** 36px — heading 1 */
  '4xl': '2.25rem',    // 36px
  /** 48px — hero */
  '5xl': '3rem',       // 48px
  /** 60px — display */
  '6xl': '3.75rem',    // 60px
} as const;

export const LINE_HEIGHT = {
  TIGHT: 1.1,
  SNUG: 1.25,
  NORMAL: 1.5,
  RELAXED: 1.625,
  LOOSE: 1.75,
} as const;

export const LETTER_SPACING = {
  TIGHT: '-0.025em',
  NORMAL: '0em',
  WIDE: '0.025em',
  WIDER: '0.05em',
  WIDEST: '0.1em',
} as const;

// ─── Font Weight Scale ──────────────────────────────────────────

export const FONT_WEIGHT = {
  NORMAL: 400,
  MEDIUM: 500,
  SEMIBOLD: 600,
  BOLD: 700,
  EXTRABOLD: 800,
  BLACK: 900,
} as const;

// ─── Semantic Typography Tokens ──────────────────────────────────

export const TYPOGRAPHY = {
  // ── Display — Hero titles, big numbers
  DISPLAY: {
    fontSize: FONT_SIZE['5xl'],
    fontWeight: FONT_WEIGHT.BLACK,
    lineHeight: LINE_HEIGHT.TIGHT,
    letterSpacing: '-0.02em',
    fontFamily: '"Inter", "Kanit", sans-serif',
  },

  // ── H1 — Page titles
  H1: {
    fontSize: FONT_SIZE['4xl'],
    fontWeight: FONT_WEIGHT.EXTRABOLD,
    lineHeight: LINE_HEIGHT.TIGHT,
    letterSpacing: '-0.015em',
    fontFamily: '"Inter", "Kanit", sans-serif',
  },

  // ── H2 — Section headers
  H2: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.EXTRABOLD,
    lineHeight: LINE_HEIGHT.TIGHT,
    letterSpacing: '-0.01em',
    fontFamily: '"Inter", "Kanit", sans-serif',
  },

  // ── H3 — Card titles
  H3: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.BOLD,
    lineHeight: LINE_HEIGHT.SNUG,
    letterSpacing: '-0.005em',
    fontFamily: '"Inter", "Kanit", sans-serif',
  },

  // ── Body Large — Lead text
  BODY_LG: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.NORMAL,
    lineHeight: LINE_HEIGHT.RELAXED,
    letterSpacing: LETTER_SPACING.NORMAL,
    fontFamily: '"Inter", "Kanit", sans-serif',
  },

  // ── Body — Default body text
  BODY: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.NORMAL,
    lineHeight: LINE_HEIGHT.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
    fontFamily: '"Inter", "Kanit", sans-serif',
  },

  // ── Body Small — Secondary content
  BODY_SM: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.NORMAL,
    lineHeight: LINE_HEIGHT.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
    fontFamily: '"Inter", "Kanit", sans-serif',
  },

  // ── Caption — Labels, timestamps
  CAPTION: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.MEDIUM,
    lineHeight: LINE_HEIGHT.NORMAL,
    letterSpacing: LETTER_SPACING.WIDE,
    fontFamily: '"Inter", "Kanit", sans-serif',
  },

  // ── Micro — Legal, badges
  MICRO: {
    fontSize: FONT_SIZE['2xs'],
    fontWeight: FONT_WEIGHT.BOLD,
    lineHeight: LINE_HEIGHT.NORMAL,
    letterSpacing: LETTER_SPACING.WIDEST,
    fontFamily: '"Inter", "Kanit", sans-serif',
    textTransform: 'uppercase',
  },

  // ── Mono — Code, numbers, data
  MONO: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.MEDIUM,
    lineHeight: LINE_HEIGHT.NORMAL,
    letterSpacing: LETTER_SPACING.NORMAL,
    fontFamily: '"JetBrains Mono", "Kanit", monospace',
  },

  // ── Mono Small — Compact data
  MONO_SM: {
    fontSize: FONT_SIZE['2xs'],
    fontWeight: FONT_WEIGHT.MEDIUM,
    lineHeight: LINE_HEIGHT.NORMAL,
    letterSpacing: LETTER_SPACING.WIDE,
    fontFamily: '"JetBrains Mono", "Kanit", monospace',
  },

  // ── Button — CTA labels
  BUTTON: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.BOLD,
    lineHeight: LINE_HEIGHT.NORMAL,
    letterSpacing: LETTER_SPACING.WIDER,
    fontFamily: '"Inter", "Kanit", sans-serif',
    textTransform: 'uppercase',
  },

  // ── Nav — Navigation labels
  NAV: {
    fontSize: FONT_SIZE['2xs'],
    fontWeight: FONT_WEIGHT.BOLD,
    lineHeight: LINE_HEIGHT.NORMAL,
    letterSpacing: LETTER_SPACING.WIDEST,
    fontFamily: '"Inter", "Kanit", sans-serif',
    textTransform: 'uppercase',
  },
} as const;

// ─── Type Definitions ──────────────────────────────────────────

export type FontSizeToken = keyof typeof FONT_SIZE;
export type TypographyPreset = keyof typeof TYPOGRAPHY;
export type TypographyStyle = {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
  fontFamily: string;
  textTransform?: string;
};

// ─── CSS Custom Properties Export ───────────────────────────────

export const TYPOGRAPHY_CSS_PROPERTIES = `
  --font-display: "Inter", "Kanit", sans-serif;
  --font-sans: "Inter", "Kanit", sans-serif;
  --font-mono: "JetBrains Mono", "Kanit", monospace;

  --text-2xs: ${FONT_SIZE['2xs']};
  --text-xs: ${FONT_SIZE.xs};
  --text-sm: ${FONT_SIZE.sm};
  --text-base: ${FONT_SIZE.base};
  --text-md: ${FONT_SIZE.md};
  --text-lg: ${FONT_SIZE.lg};
  --text-xl: ${FONT_SIZE.xl};
  --text-2xl: ${FONT_SIZE['2xl']};
  --text-3xl: ${FONT_SIZE['3xl']};
  --text-4xl: ${FONT_SIZE['4xl']};
  --text-5xl: ${FONT_SIZE['5xl']};
  --text-6xl: ${FONT_SIZE['6xl']};
` as const;
