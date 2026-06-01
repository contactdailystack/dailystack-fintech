/**
 * Design System Constants for DailyStack Landing Page
 * Clean editorial design with Medium-inspired aesthetics
 */

// Brand Colors - Minimal, Editorial
export const BRAND = {
  primary: '#56be89',      // Mint green - SOLE accent
  darkBase: '#1C232A',      // Dark background
  cardBg: '#232D38',        // Card background
  elevated: '#1E2830',      // Elevated surfaces
  border: 'rgba(255,255,255,0.06)',
  ink: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
} as const;

// Motion System - Slower, Smoother
export const MOTION = {
  spring: {
    stiffness: 60,
    damping: 40,
  },
  easing: {
    smooth: [0.25, 0.4, 0.25, 1] as const,
    easeOut: [0.0, 0.0, 0.2, 1] as const,
  },
  duration: {
    fast: 0.25,
    normal: 0.35,
    slow: 0.4,
    slower: 0.6,
  },
  stagger: {
    delay: 0.08,
  },
} as const;

// Glassmorphism System - More Subtle
export const GLASS = {
  blur: {
    sm: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
    xl: 'blur(32px)',
  },
  bg: {
    weak: 'rgba(255, 255, 255, 0.02)',
    soft: 'rgba(255, 255, 255, 0.04)',
    strong: 'rgba(255, 255, 255, 0.08)',
  },
  border: {
    weak: 'rgba(255, 255, 255, 0.06)',
    strong: 'rgba(255, 255, 255, 0.10)',
  },
} as const;

// Typography Scale - Generous Line-height
export const TYPOGRAPHY = {
  hero: {
    fontSize: 'clamp(3rem, 8vw, 5rem)',
    lineHeight: '1.05',
    fontWeight: 800,
  },
  h1: {
    fontSize: 'clamp(2rem, 5vw, 4rem)',
    lineHeight: '1.1',
    fontWeight: 700,
  },
  h2: {
    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
    lineHeight: '1.15',
    fontWeight: 600,
  },
  h3: {
    fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
    lineHeight: '1.3',
    fontWeight: 600,
  },
  body: {
    fontSize: '1.125rem',
    lineHeight: '1.7',
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.875rem',
    lineHeight: '1.6',
    fontWeight: 400,
  },
} as const;

// Layout Constants
export const LAYOUT = {
  maxWidth: '1400px',
  sectionPadding: 'clamp(4rem, 10vh, 8rem)',
  containerPadding: 'clamp(1rem, 5vw, 3rem)',
} as const;

// Shadow System - Softer
export const SHADOW = {
  soft: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.12)',
    md: '0 4px 16px rgba(0, 0, 0, 0.16)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.20)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.24)',
  },
  glow: {
    brand: '0 0 20px rgba(86, 190, 137, 0.25)',
    soft: '0 4px 20px rgba(13, 17, 23, 0.12)',
  },
} as const;

// Animation Variants - Smooth Editorial Feel
export const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: MOTION.duration.slow, ease: MOTION.easing.easeOut }
    },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: MOTION.duration.slower, ease: MOTION.easing.easeOut }
    },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: MOTION.stagger.delay,
      },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: MOTION.duration.slow, ease: MOTION.easing.easeOut }
    },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -32 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: MOTION.duration.slower, ease: MOTION.easing.easeOut }
    },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 32 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: MOTION.duration.slower, ease: MOTION.easing.easeOut }
    },
  },
} as const;