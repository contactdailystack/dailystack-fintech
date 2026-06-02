/**
 * DailyStack — New Features Design Tokens
 * Augmented token set for: Subscription Dashboard, Bill Calendar,
 * Smart Savings, Investment Portfolio, Cancellation Flow, Bank Connect.
 *
 * Built on top of pilo/theme.ts (Emerald Mint / Pilo Dark)
 * Primary: #CCFF00 · Background: #0F0F0F · Surface: #2C2C2C
 */

export const newFeatureTokens = {
  // ── 1. Financial Health Score Color Ramp ────────────────────────────
  scoreColors: {
    excellent: '#CCFF00', // ≥85 pts
    good:      '#34D399', // 70–84 pts
    fair:      '#FBBF24', // 55–69 pts
    poor:      '#F97316', // 40–54 pts
  },

  // ── 2. Semantic Status ─────────────────────────────────────────────
  status: {
    success:  '#34D399',
    warning:  '#FBBF24',
    error:    '#FF4D4D',
    info:     '#60A5FA',
    neutral:  '#999999',
  },

  // ── 3. Savings Feature ────────────────────────────────────────────
  savings: {
    bgGradientStart: '#0F0F0F',
    bgGradientEnd:   '#1A2E1A',
    accent:          '#34D399',
    highlight:       '#A7F3D0',
    glowColor:       'rgba(52, 211, 153, 0.25)',
    depositGreen:    '#10B981',
  },

  // ── 4. Calendar View ──────────────────────────────────────────────
  calendar: {
    dueToday:    '#FF4D4D',
    paid:        '#CCFF00',
    upcoming:    '#999999',
    todayBorder: '#CCFF00',
    weekendBg:   'rgba(255, 255, 255, 0.03)',
    headerBg:   '#1A1A1A',
  },

  // ── 5. Investment Portfolio ────────────────────────────────────────
  investment: {
    gain:      '#34D399',
    gainBg:    'rgba(52, 211, 153, 0.12)',
    loss:      '#FF4D4D',
    lossBg:    'rgba(255, 77, 77, 0.12)',
    neutral:   '#999999',
    chartLine: '#CCFF00',
    chartFill: 'rgba(204, 255, 0, 0.10)',
    accent:    '#CCFF00',
  },

  // ── 6. Bank Connection ─────────────────────────────────────────────
  bankConnect: {
    successBadge: '#34D399',
    pendingBadge: '#FBBF24',
    secureGreen:  '#CCFF00',
    bankCardBg:   '#1A1A1A',
    selectedBorder:'#CCFF00',
  },

  // ── 7. Bottom Sheets ───────────────────────────────────────────────
  sheet: {
    overlayColor:    'rgba(0, 0, 0, 0.65)',
    handleBarColor:  '#2C2C2C',
    surfaceColor:    '#1A1A1A',
    maxHeight:       '92dvh',
    borderRadius:    24,
    springAnimation: '420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // ── 8. Shadows ────────────────────────────────────────────────────
  shadows: {
    card:       '0 4px 24px rgba(0, 0, 0, 0.35)',
    sheet:      '0 -4px 40px rgba(0, 0, 0, 0.60)',
    primaryGlow:'0 4px 20px rgba(199, 255, 0, 0.30)',
    savingsGlow:'0 4px 30px rgba(52, 211, 153, 0.25)',
    lossGlow:   '0 4px 20px rgba(255, 77, 77, 0.25)',
    errorGlow:  '0 4px 20px rgba(255, 77, 77, 0.25)',
  },

  // ── 9. Typography Scale (New / Feature-Specific) ──────────────────
  typography: {
    // Hero stat — portfolio total, savings total
    heroStat: {
      fontSize:    40,
      fontWeight:  '800',
      letterSpacing: -0.8,
      lineHeight:  48,
    },
    // Page section title
    sectionTitle: {
      fontSize:    18,
      fontWeight:  '700',
      letterSpacing: -0.2,
      lineHeight:  24,
    },
    // Card heading (name + amount in list items)
    cardHeading: {
      fontSize:    15,
      fontWeight:  '700',
      letterSpacing: -0.1,
      lineHeight:  20,
    },
    // Badge label — uppercase, tracking
    badgeLabel: {
      fontSize:      9,
      fontWeight:    '800',
      letterSpacing:  1.2, // 0.09em
      textTransform: 'uppercase',
    },
    // Chip label
    chipLabel: {
      fontSize:    11,
      fontWeight:  '700',
      letterSpacing: 0.4,
    },
    // Amount in list (mono)
    amountMono: {
      fontSize:    14,
      fontWeight:  '800',
      letterSpacing: 0,
      fontFamily: 'Space Grotesk, monospace',
    },
    // Supporting text (dates, meta)
    supporting: {
      fontSize:    11,
      fontWeight:  '400',
      letterSpacing: 0.3,
      lineHeight:  16,
    },
    // Body text Thai
    bodyThai: {
      fontSize:    14,
      fontWeight:  '500',
      lineHeight:  22,
      fontFamily: 'DB Heavent, Kanit, sans-serif',
    },
  },

  // ── 10. Motion & Animation ─────────────────────────────────────────
  motion: {
    sheetSpring:   '420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    tabFade:       '200ms ease-out',
    numberRoll:    '600ms ease-out',
    chartDraw:     '800ms ease-in-out',
    skeletonPulse: '1.5s ease-in-out infinite',
    successPop:    '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // ── 11. Layout ────────────────────────────────────────────────────
  layout: {
    pagePadding:    16,  // horizontal page padding (px)
    cardPadding:    20,  // inner card padding
    sectionGap:     24,  // between sections
    itemGap:        12,  // between list items
    borderRadius:   {
      card:   20,
      chip:   16,
      badge:  6,
      pill:   9999,
      sheet:  24,
    },
    touchMin: 44, // minimum touch target in px
  },

  // ── 12. Icons (via Lucide React) ───────────────────────────────────
  icons: {
    savings:   'PiggyBank',
    calendar:  'CalendarDays',
    chart:     'TrendingUp',
    cancel:    'XCircle',
    bank:      'Landmark',
    shield:    'ShieldCheck',
    alert:     'AlertTriangle',
    sparkles:  'Sparkles',
    check:     'Check',
    chevron:   'ChevronRight',
    upload:    'Upload',
    dollar:    'Banknote',
    refresh:   'RefreshCw',
  },
} as const;

export type NewFeatureTokens = typeof newFeatureTokens;
