/**
 * ============================================================
 * DailyStack Design System — Spacing Tokens v1.0
 * ============================================================
 * 4px Grid System for consistent vertical rhythm
 * 
 * Spacing Philosophy:
 * - 4px base unit for micro-spacing
 * - Semantic tokens for common use cases
 * - Mobile-first: thumb zone optimized
 */

// ─── Base Spacing Scale (4px Grid) ─────────────────────────────────
export const spacing = {
  /** 0 — no space */
  0: '0',
  /** 2px — micro gaps */
  0.5: '0.125rem',  // 2px
  /** 4px — smallest gap */
  1: '0.25rem',     // 4px
  /** 8px — tight spacing */
  2: '0.5rem',      // 8px
  /** 12px — component internal padding */
  3: '0.75rem',     // 12px
  /** 16px — standard padding */
  4: '1rem',        // 16px
  /** 20px — comfortable padding */
  5: '1.25rem',     // 20px
  /** 24px — section padding */
  6: '1.5rem',      // 24px
  /** 32px — large padding */
  8: '2rem',        // 32px
  /** 40px — section gaps */
  10: '2.5rem',     // 40px
  /** 48px — major section dividers */
  12: '3rem',       // 48px
  /** 64px — page sections */
  16: '4rem',       // 64px
  /** 96px — major page divisions */
  24: '6rem',       // 96px
  /** 128px — hero spacing */
  32: '8rem',       // 128px
} as const;

// ─── Semantic Spacing Tokens ───────────────────────────────────────
export const semanticSpacing = {
  /** Micro spacing — icon gaps, tight elements */
  micro: '0.25rem',    // 4px
  /** XS spacing — small gaps */
  xs: '0.5rem',        // 8px
  /** SM spacing — component internal */
  sm: '0.75rem',       // 12px
  /** MD spacing — standard padding */
  md: '1rem',          // 16px
  /** LG spacing — card padding */
  lg: '1.25rem',       // 20px
  /** XL spacing — section padding */
  xl: '1.5rem',        // 24px
  /** 2XL spacing — large gaps */
  '2xl': '2rem',       // 32px
  /** 3XL spacing — major sections */
  '3xl': '3rem',       // 48px
} as const;

// ─── Component-specific Spacing ────────────────────────────────────
export const componentSpacing = {
  /** Card internal padding */
  cardPadding: '1rem',           // 16px
  /** Card internal padding large */
  cardPaddingLg: '1.25rem',      // 20px
  /** Card gap between cards */
  cardGap: '0.75rem',            // 12px
  /** Section gap */
  sectionGap: '1.5rem',          // 24px
  /** Page horizontal padding */
  pagePadding: '1rem',           // 16px
  /** Page horizontal padding large */
  pagePaddingLg: '1.5rem',      // 24px
  /** Button internal padding horizontal */
  buttonPaddingX: '1.25rem',    // 20px
  /** Button internal padding vertical */
  buttonPaddingY: '0.625rem',   // 10px
  /** Input internal padding */
  inputPadding: '0.75rem',       // 12px
  /** List item padding */
  listItemPadding: '0.75rem',    // 12px
  /** Safe area top (iOS notch) */
  safeAreaTop: 'env(safe-area-inset-top)',
  /** Safe area bottom (iOS home indicator) */
  safeAreaBottom: 'env(safe-area-inset-bottom)',
  /** Status bar height */
  statusBar: '44px',
  /** Bottom nav height */
  bottomNav: '56px',
  /** FAB size */
  fabSize: '56px',
  /** Touch target minimum (44x44pt per Apple HIG) */
  touchTarget: '44px',
  /** Touch target large (48x48dp per Material) */
  touchTargetLarge: '48px',
} as const;

// ─── Border Radius Scale ───────────────────────────────────────────
export const borderRadius = {
  /** No radius */
  none: '0',
  /** 4px — small badges */
  sm: '0.25rem',     // 4px
  /** 8px — buttons, inputs */
  md: '0.5rem',      // 8px
  /** 12px — cards, modals */
  lg: '0.75rem',     // 12px
  /** 16px — large cards */
  xl: '1rem',        // 16px
  /** 20px — premium cards */
  '2xl': '1.25rem',  // 20px
  /** 24px — hero cards */
  '3xl': '1.5rem',   // 24px
  /** Full circle */
  full: '9999px',
} as const;

// ─── Z-Index Scale ─────────────────────────────────────────────────
export const zIndex = {
  /** Base layer */
  base: 0,
  /** Dropdown menus */
  dropdown: 100,
  /** Sticky headers */
  sticky: 200,
  /** Fixed navigation */
  fixed: 300,
  /** Modal backdrop */
  backdrop: 400,
  /** Modal content */
  modal: 500,
  /** Popover/tooltip */
  popover: 600,
  /** Toast notifications */
  toast: 700,
  /** Loading overlay */
  loading: 800,
  /** Highest priority */
  max: 999,
} as const;

// ─── Layout Constants ───────────────────────────────────────────────
export const layout = {
  /** Mobile breakpoint */
  mobile: '375px',
  /** Tablet breakpoint */
  tablet: '768px',
  /** Desktop breakpoint */
  desktop: '1024px',
  /** Max content width */
  maxWidth: '480px',
  /** Card max width */
  cardMaxWidth: '420px',
} as const;

// ─── Type Definitions ──────────────────────────────────────────────
export type Spacing = typeof spacing;
export type SemanticSpacing = typeof semanticSpacing;
export type ComponentSpacing = typeof componentSpacing;
export type BorderRadius = typeof borderRadius;
export type ZIndex = typeof zIndex;
export type Layout = typeof layout;

// ─── CSS Variable Export ────────────────────────────────────────────
export const cssVariables = {
  // Spacing
  '--space-micro': semanticSpacing.micro,
  '--space-xs': semanticSpacing.xs,
  '--space-sm': semanticSpacing.sm,
  '--space-md': semanticSpacing.md,
  '--space-lg': semanticSpacing.lg,
  '--space-xl': semanticSpacing.xl,
  '--space-2xl': semanticSpacing['2xl'],
  '--space-3xl': semanticSpacing['3xl'],
  // Border Radius
  '--radius-sm': borderRadius.sm,
  '--radius-md': borderRadius.md,
  '--radius-lg': borderRadius.lg,
  '--radius-xl': borderRadius.xl,
  '--radius-2xl': borderRadius['2xl'],
  '--radius-3xl': borderRadius['3xl'],
  '--radius-full': borderRadius.full,
} as const;

// ─── Spacing System Export ───────────────────────────────────────────
export const spacingTokens = {
  spacing,
  semanticSpacing,
  componentSpacing,
  borderRadius,
  zIndex,
  layout,
  cssVariables,
} as const;

export type SpacingTokens = typeof spacingTokens;
