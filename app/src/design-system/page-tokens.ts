/**
 * @deprecated since v36 — Token architecture migrated to tokens.css
 * ============================================================
 * DailyStack — Page Tokens (LEGACY)
 * ============================================================
 * SSOT is now: design-system/tokens.css (CSS custom properties)
 * Existing pageTokens usage in components should migrate to CSS vars.
 * ============================================================
 *
 * Single source of truth for color, typography, and layout tokens
 * used across DashboardPage, InsightsPage, ProfilePage, and all app pages.
 *
 * Design Reference: ProfilePage v8.0
 *
 * Usage:
 *   import { pageTokens } from '../design-system/page-tokens';
 *   const { colors, typography, layout } = pageTokens;
 */

// ─── Page Color Tokens ──────────────────────────────────────

export const pageColors = {
  // Background layers
  background: '#FFFFFF',
  surface: '#F5F5F5',         // CI Brief: Soft Gray secondary surfaces
  surfaceElevated: '#FFFFFF', // Elevated cards

  // Dark card — primary card background for stats/hero sections (20%)
  darkCard: '#0A0A0A',        // CI Brief: Premium Black

  // Accent
  accent: '#0FB0CE',         // CI Brief: Lime Green Primary
  accentHover: '#3FC4DB',     // CI Brief: Primary 600
  accentMuted: 'rgba(15, 176, 206, 0.15)',

  // Text
  text: '#111827',            // Primary text
  textMuted: '#666666',       // High contrast secondary text
  textSecondary: '#666666',    // De-emphasized text

  // Dividers & borders
  border: '#E5E5E5',          // CI Brief: Border Gray
  borderSubtle: '#F5F5F5',    // Soft Gray subtle borders
  divider: 'h-px bg-[#E5E5E5] mx-6',

  // Status colors - CI Brief specs
  success: '#22C55E',         // Income Green
  positive: '#22C55E',
  negative: '#EF4444',        // Expense Red
  warning: '#F97316',
  warningSoft: '#F59E0B',

  // Dark surface tones (for dark card internals)
  zinc800: '#27272A',
  zinc700: '#3F3F46',

  // Danger
  danger: '#FF3B30',
  dangerMuted: 'rgba(255, 59, 48, 0.15)',

  // Category colors (shared across all pages)
  category: {
    food: '#F97316',
    transport: '#1786C2',
    shopping: '#EC4899',
    bills: '#EF4444',
    entertainment: '#8B5CF6',
    health: '#22C55E',
    education: '#F59E0B',
    investment: '#1786C2',
    subscription: '#0FB0CE',
    other: '#6B7280',
  },

  // Brand colors for recurring items (extended for calendar + reference image parity)
  brandColors: {
    // Streaming / Entertainment
    netflix: '#E50914',
    spotify: '#1DB954',
    youtube: '#FF0000',
    amazon: '#FF9900',
    apple: '#007AFF',
    appleTv: '#000000',
    disney: '#113CCF',
    hbo: '#8B5CF6',
    hulu: '#1CE783',
    paramount: '#0064FF',
    peacock: '#FF5C2B',
    prime: '#00A8E1',
    max: '#0046FF',
    xbox: '#107C10',
    playstation: '#003791',
    nintendo: '#E60012',
    twitch: '#9146FF',
    tiktok: '#010101',
    arcadia: '#3F8C5C',

    // Tech / Productivity
    microsoft: '#00A4EF',
    google: '#4285F4',
    dropbox: '#0061FF',
    icloud: '#3478F6',
    github: '#181717',
    notion: '#000000',
    slack: '#4A154B',
    zoom: '#2D8CFF',
    adobe: '#FA0F00',
    figma: '#F24E1E',
    canva: '#00C4CC',
    chatgpt: '#10A37F',

    // Bills & Utilities
    atnt: '#00A8E0',
    verizon: '#CD040B',
    comcast: '#000000',
    geico: '#5BC0EB',
    progressive: '#005EAB',
    statefarm: '#E32636',
    allstate: '#0033A0',
    bofa: '#E31837',
    chase: '#117ACA',
    wells: '#D71E28',
    citibank: '#003B70',
    capital: '#004977',
    rocket: '#FF6B35',
    electricity: '#F4B400',
    water: '#2196F3',
    internet: '#673AB7',

    // Generic
    transfer: '#1786C2',
    income: '#22C55E',
  } as Record<string, string>,
} as const;

// ─── Page Typography Tokens ──────────────────────────────────

export const pageTypography = {
  // Font families
  fontEN: '"Inter", sans-serif',
  fontTH: '"Noto Sans Thai", sans-serif',
  fontMono: '"JetBrains Mono", monospace',

  // Heading sizes
  pageTitle: {
    size: 'text-2xl',    // 24px
    weight: 'font-bold',
    color: '#111827',
  },
  sectionHeader: {
    size: 'text-[17px]', // 17px — matches ProfilePage exactly
    weight: 'font-semibold',
    color: '#111827',
  },

  // Body text
  body: {
    size: 'text-[15px]',  // 15px
    weight: 'font-semibold',
    color: '#111827',
  },
  bodySecondary: {
    size: 'text-[15px]',
    weight: 'font-normal',
    color: '#111827',
  },

  // Sublabels / metadata
  sublabel: {
    size: 'text-xs',      // 12px — matches ProfilePage
    color: '#8E8E93',
  },
  sublabelSmall: {
    size: 'text-[10px]',
    color: '#8E8E93',
  },

  // Amounts
  amountLarge: {
    size: 'text-3xl',     // 30px
    weight: 'font-bold',
  },
  amountMedium: {
    size: 'text-[15px]',
    weight: 'font-bold',
  },

  // Date / muted copy
  dateLabel: {
    size: 'text-xs',
    color: '#8E8E93',
  },
} as const;

// ─── Page Layout Tokens ──────────────────────────────────────

export const pageLayout = {
  // Page padding
  pagePadding: {
    horizontal: 'px-6',
    top: 'pt-12',
    bottom: 'pb-8',
    contentTop: 'pt-4',
  },

  // Header
  header: {
    padding: 'px-6 pt-12 pb-4',
    titleClass: 'text-2xl font-bold',
  },

  // Card styles
  cardDark: {
    radius: 'rounded-[32px]',
    padding: 'px-8 py-6',
  },
  cardPill: {
    radius: 'rounded-full',
    padding: 'px-6 py-4',
  },
  cardContainer: {
    radius: 'rounded-[32px]',
    padding: 'p-5',
    background: '#F4F5F7', // surface color
  },

  // Action buttons
  iconButton: {
    size: 'w-10 h-10',
    radius: 'rounded-full',
    background: '#F4F5F7',
    transition: 'transition-transform active:scale-95',
  },

  // List items
  listItem: {
    pillClass: 'flex items-center gap-4 bg-[#F4F5F7] rounded-full px-6 py-4 active:scale-[0.98] transition-all',
    avatarSize: 'w-11 h-11',
    avatarRadius: 'rounded-full',
  },

  // Dividers
  divider: {
    class: 'h-px bg-gray-200 mx-6',
  },

  // Spacing between sections
  sectionGap: 'space-y-4',
  sectionGapLarge: 'space-y-6',
  sectionGapSmall: 'space-y-3',

  // Safe area
  safeAreaBottom: 'pb-8',
} as const;

// ─── Component Tokens ────────────────────────────────────────

export const componentTokens = {
  // Badge styles
  badge: {
    radius: 'rounded-full',
    padding: 'px-3 py-1.5',
    fontSize: 'text-xs font-medium',
  },

  // Dropdown menu
  dropdown: {
    width: 'w-40',
    radius: 'rounded-xl',
    shadow: 'shadow-lg',
    background: '#FFFFFF',
    padding: 'px-4 py-3',
  },

  // Progress bar
  progressBar: {
    height: 'h-2',
    radius: 'rounded-full',
    trackColor: '#27272A',
    fillColor: '#0FB0CE',
  },

  // Tab pills
  tabPill: {
    radius: 'rounded-full',
    activeBg: '#0FB0CE',
    inactiveBg: '#F4F5F7',
    activeText: '#111827',
    inactiveText: '#111827',
  },
} as const;

// ─── Full Page Tokens Export ────────────────────────────────

export const pageTokens = {
  colors: pageColors,
  typography: pageTypography,
  layout: pageLayout,
  components: componentTokens,
} as const;

export type PageColors = typeof pageColors;
export type PageTypography = typeof pageTypography;
export type PageLayout = typeof pageLayout;
export type ComponentTokens = typeof componentTokens;
export type PageTokens = typeof pageTokens;
