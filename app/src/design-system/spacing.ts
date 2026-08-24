/**
 * ============================================================
 * DailyStack — Spacing Scale v1.0
 * ============================================================
 * Design Constitution v4.1 — Spatial System
 * Based on 4px grid system
 */

// ─── Core Spacing Scale ────────────────────────────────────────
// All values in rem (root-relative) for accessibility
// 4px base unit: 0.25 = 4px

export const SPACING = {
  /** 4px — micro gap */
  1: '0.25rem',   // 4px
  /** 8px — tight */
  2: '0.5rem',    // 8px
  /** 12px — compact */
  3: '0.75rem',   // 12px
  /** 16px — standard */
  4: '1rem',       // 16px
  /** 24px — comfortable */
  6: '1.5rem',    // 24px
  /** 32px — spacious */
  8: '2rem',       // 32px
  /** 48px — large */
  12: '3rem',      // 48px
  /** 64px — section gap */
  16: '4rem',      // 64px
  /** 96px — page section */
  24: '6rem',      // 96px
} as const;

// ─── Semantic Spacing Tokens ──────────────────────────────────

export const GAP = {
  /** Between related items */
  TIGHT: SPACING[2],      // 8px
  /** Default gap */
  NORMAL: SPACING[4],    // 16px
  /** Between card groups */
  LOOSE: SPACING[6],     // 24px
  /** Section separation */
  SECTION: SPACING[8],    // 32px
} as const;

export const PADDING = {
  /** Inline content padding */
  INLINE: SPACING[3],     // 12px
  /** Card padding */
  CARD: SPACING[4],      // 16px
  /** Section padding */
  SECTION: SPACING[6],    // 24px
  /** Page margins */
  PAGE: SPACING[6],      // 24px
  /** Modal padding */
  MODAL: SPACING[8],     // 32px
} as const;

export const MARGIN = {
  /** Between list items */
  LIST_ITEM: SPACING[2],  // 8px
  /** Section bottom margin */
  SECTION_BOTTOM: SPACING[6], // 24px
  /** Page section gap */
  PAGE_SECTION: SPACING[8], // 32px
} as const;

// ─── Border Radius Tokens ──────────────────────────────────────

export const RADIUS = {
  /** Small elements — chips, badges */
  SM: '0.5rem',      // 8px
  /** Default elements — buttons, inputs */
  MD: '0.75rem',     // 12px
  /** Cards — standard radius */
  LG: '1rem',        // 16px
  /** Large cards — feature cards */
  XL: '1.5rem',      // 24px
  /** Modals, sheets — iOS-style */
  '2XL': '2rem',     // 32px
  /** Pill / capsule */
  FULL: '9999px',
} as const;

// ─── Layout Breakpoints ─────────────────────────────────────────

export const BREAKPOINT = {
  /** Mobile-first base */
  SM: '640px',
  /** Tablet portrait */
  MD: '768px',
  /** Tablet landscape / small desktop */
  LG: '1024px',
  /** Desktop */
  XL: '1280px',
} as const;

// ─── Type Definitions ──────────────────────────────────────────

export type SpacingToken = keyof typeof SPACING;
export type RadiusToken = keyof typeof RADIUS;

// ─── CSS Custom Properties Export ───────────────────────────────
// For Tailwind/config integration

export const SPACING_CSS_PROPERTIES = `
  --spacing-1: ${SPACING[1]};
  --spacing-2: ${SPACING[2]};
  --spacing-3: ${SPACING[3]};
  --spacing-4: ${SPACING[4]};
  --spacing-6: ${SPACING[6]};
  --spacing-8: ${SPACING[8]};
  --spacing-12: ${SPACING[12]};
  --spacing-16: ${SPACING[16]};
  --spacing-24: ${SPACING[24]};

  --radius-sm: ${RADIUS.SM};
  --radius-md: ${RADIUS.MD};
  --radius-lg: ${RADIUS.LG};
  --radius-xl: ${RADIUS.XL};
  --radius-2xl: ${RADIUS['2XL']};
  --radius-full: ${RADIUS.FULL};
` as const;
