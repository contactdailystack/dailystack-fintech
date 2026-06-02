/**
 * Pilo App Design System Tokens
 * Fully aligned with Pilo Premium Dark Aesthetic guidelines.
 * Works with iOS SF Pro Display and Android Inter fallback.
 */

export const theme = {
  colors: {
    // Backgrounds
    background: '#0F0F0F',      // Pilo Black (Exact Spec)
    surface: '#2C2C2C',         // Charcoal Card Surface (Exact Spec)
    control: '#2C2C2C',         // Charcoal (Exact Spec)
    
    // Accents
    primary: '#CCFF00',         // Electric Green (Exact Spec)
    primaryActive: '#CCFF00',   // Electric Green (Flat active state)
    
    // Typography
    textPrimary: '#FFFFFF',     // Pure White (Exact Spec)
    textSecondary: '#999999',   // Mid Gray (Exact Spec)
    textTertiary: '#999999',    // Mid Gray (Exact Spec)
    
    // Semantic States
    success: '#CCFF00',         // Electric Green success
    warning: '#FFB020',         // Attention states
    error: '#FF4D4D',           // Destructive / error states
    
    // Borders
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderMedium: 'rgba(255, 255, 255, 0.12)',
  },
  
  typography: {
    hero: {
      fontSize: 48,
      fontWeight: '700' as const,
      letterSpacing: -0.96, // -0.02em
      lineHeight: 56,
      fontFamily: 'SF Pro Display',
    },
    section: {
      fontSize: 28,
      fontWeight: '600' as const,
      letterSpacing: -0.28, // -0.01em
      lineHeight: 34,
      fontFamily: 'SF Pro Display',
    },
    subheadline: {
      fontSize: 20,
      fontWeight: '500' as const,
      letterSpacing: 0,
      lineHeight: 26,
      fontFamily: 'SF Pro Display',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 25, // 1.6 ratio
      fontFamily: 'SF Pro Display',
    },
    supporting: {
      fontSize: 13,
      fontWeight: '400' as const,
      letterSpacing: 0.1,
      lineHeight: 18,
      fontFamily: 'SF Pro Display',
    },
    label: {
      fontSize: 11,
      fontWeight: '600' as const,
      letterSpacing: 0.88, // 0.08em
      textTransform: 'uppercase' as const,
      lineHeight: 14,
      fontFamily: 'SF Pro Display',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24, // Screen horizontal padding standard
    xxl: 32, // Section gaps
    xxxl: 48,
    giant: 64,
    massive: 96,
  },
  
  radius: {
    large: 20,       // Card containers, bottom sheets
    interactive: 16, // Main buttons
    input: 12,       // Search panels and inputs
    badge: 6,        // Status pill indicators
  },
  
  motion: {
    durationStandard: 200, // 200ms ease-out transitions
    durationSpring: 350,   // 350ms spring animation curves
  }
};

export type Theme = typeof theme;
