/**
 * ============================================================
 * DailyStack — Spacing Scale v1.0
 * ============================================================
 * Tesla-of-Personal-Finance 4px grid system
 * All spacing values are multiples of 4 for visual harmony
 */

// ─── Raw Spacing Values (4px base grid) ────────────────────────────
/** 4px  — hairline gaps, icon padding */
export const SPACE_1 = 4;

/** 8px  — tight padding, badge margins */
export const SPACE_2 = 8;

/** 12px — compact padding, inline gaps */
export const SPACE_3 = 12;

/** 16px — standard padding, card internal margins */
export const SPACE_4 = 16;

/** 20px — comfortable padding, section gaps */
export const SPACE_5 = 20;

/** 24px — generous padding, major section spacing */
export const SPACE_6 = 24;

/** 32px — wide padding, card-to-card distance */
export const SPACE_8 = 32;

/** 40px — section separators, hero padding */
export const SPACE_10 = 40;

/** 48px — large gaps, major layout breaks */
export const SPACE_12 = 48;

/** 64px — XL gaps, page-level section breaks */
export const SPACE_16 = 64;

/** 80px — hero margins, screen breathing room */
export const SPACE_20 = 80;

/** 96px — maximum gaps, footer spacing */
export const SPACE_24 = 96;

/** 128px — extreme gaps, section dividers */
export const SPACE_32 = 128;

// ─── Named Semantic Tokens ──────────────────────────────────────────
/** xs — 4px, icon gaps, micro spacing */
export const spaceXs = SPACE_1;   // 4

/** sm — 8px, tight element gaps */
export const spaceSm = SPACE_2;   // 8

/** md — 16px, standard component spacing */
export const spaceMd = SPACE_4;   // 16

/** lg — 24px, section breathing room */
export const spaceLg = SPACE_6;   // 24

/** xl — 32px, card margins, row gaps */
export const spaceXl = SPACE_8;   // 32

/** 2xl — 48px, major section breaks */
export const space2xl = SPACE_12; // 48

/** 3xl — 64px, page-level spacing */
export const space3xl = SPACE_16; // 64

// ─── Spacing Scale Array (for loops/utilities) ─────────────────────
export const SPACING_SCALE = [
  SPACE_1,
  SPACE_2,
  SPACE_3,
  SPACE_4,
  SPACE_5,
  SPACE_6,
  SPACE_8,
  SPACE_10,
  SPACE_12,
  SPACE_16,
  SPACE_20,
  SPACE_24,
  SPACE_32,
] as const;

// ─── Semantic Token Map ─────────────────────────────────────────────
export const SPACING_TOKENS = {
  xs: spaceXs,
  sm: spaceSm,
  md: spaceMd,
  lg: spaceLg,
  xl: spaceXl,
  '2xl': space2xl,
  '3xl': space3xl,
} as const;
