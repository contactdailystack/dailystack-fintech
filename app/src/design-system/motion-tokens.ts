/**
 * ============================================================
 * DailyStack Design System — Motion Tokens v1.0
 * ============================================================
 * The Tesla of Personal Finance — Kinetic Physics Design
 * 
 * Motion Philosophy:
 * - 60 BPM constant for ambient animations (breathing, pulsing)
 * - Spring physics for natural, organic movement
 * - Haptic-first: motion + haptics = premium feel
 * 
 * Spring Physics Reference:
 * - SPRING_TIGHT: Snappy, responsive (buttons, toggles)
 * - SPRING_GENTLE: Smooth, elegant (cards, modals)
 * - SPRING_BOUNCY: Playful, rewarding (success, achievements)
 */

// ─── Spring Easing Curves ───────────────────────────────────────────
// JS-friendly easing definitions (arrays) for motion/react
export const spring = {
  /** Snappy, responsive — primary buttons, toggles, micro-interactions */
  /** Usage: 150-200ms duration */
  TIGHT: [0.16, 1, 0.3, 1] as const,

  /** Smooth, elegant — cards, modals, page transitions */
  /** Usage: 200-400ms duration */
  GENTLE: [0.33, 1, 0.68, 1] as const,

  /** Playful, rewarding — success animations, achievements */
  /** Usage: 300-500ms duration */
  BOUNCY: [0.34, 1.56, 0.64, 1] as const,

  /** Linear — for color/opacity changes only */
  LINEAR: 'linear' as const,

  /** Ease out — for elements entering */
  EASE_OUT: [0, 0, 0.2, 1] as const,

  /** Ease in — for elements exiting */
  EASE_IN: [0.4, 0, 1, 1] as const,

  /** Ease in-out — for symmetric animations */
  EASE_IN_OUT: [0.4, 0, 0.2, 1] as const,
} as const;

// CSS string equivalents for Tailwind/CSS keyframes where a string is required
export const springCss = {
  TIGHT: 'cubic-bezier(0.16, 1, 0.3, 1)',
  GENTLE: 'cubic-bezier(0.33, 1, 0.68, 1)',
  BOUNCY: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  LINEAR: 'linear',
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ─── Animation Durations ───────────────────────────────────────────
export const duration = {
  /** Instant — 100ms for micro-interactions */
  instant: '100ms',
  /** Fast — 150ms for hover states */
  fast: '150ms',
  /** Quick — 200ms for button feedback */
  quick: '200ms',
  /** Normal — 300ms for most transitions */
  normal: '300ms',
  /** Slow — 400ms for page transitions */
  slow: '400ms',
  /** Slower — 500ms for complex animations */
  slower: '500ms',
  /** Slowest — 600ms for hero animations */
  slowest: '600ms',
  /** Continuous — for infinite animations */
  continuous: '1s',
} as const;

// Provide numeric ms variants for programmatic use
export const durationMs = Object.freeze({
  instant: 100,
  fast: 150,
  quick: 200,
  normal: 300,
  slow: 400,
  slower: 500,
  slowest: 600,
  continuous: 1000,
} as const);

/** Convert a duration token (e.g., "150ms" or token key) to seconds number for framer-motion. */
export function toSeconds(d: keyof typeof duration | `${number}ms` | `${number}s` | number) {
  if (typeof d === 'number') return d / 1000;
  if (typeof d === 'string') {
    // allow explicit '150ms' or '0.15s'
    if (d.endsWith('ms')) return parseFloat(d) / 1000;
    if (d.endsWith('s')) return parseFloat(d);
    // fallback: try to resolve as key in durationMs
    const key = d as keyof typeof durationMs;
    // @ts-ignore
    if (durationMs[key]) return (durationMs as any)[key] / 1000;
  }
  return durationMs.normal / 1000;
}

// Semantic easing mapping used across components
// Easing (JS) mapping for components using motion/react
export const easing = {
  standard: spring.EASE_IN_OUT,
  decel: spring.EASE_OUT,
  accel: spring.EASE_IN,
  gentle: spring.GENTLE,
  bouncy: spring.BOUNCY,
  tight: spring.TIGHT,
} as const;

// ─── 60 BPM Timing (for ambient animations) ────────────────────────
export const bpm60 = {
  /** One beat at 60 BPM = 1000ms */
  beat: '1000ms',
  /** Half beat = 500ms */
  halfBeat: '500ms',
  /** Quarter beat = 250ms */
  quarterBeat: '250ms',
  /** Eighth beat = 125ms */
  eighthBeat: '125ms',
  /** Two beats = 2000ms */
  twoBeats: '2000ms',
  /** Four beats = 4000ms (one measure) */
  measure: '4000ms',
} as const;

// ─── Animation Keyframes ────────────────────────────────────────────
export const keyframes = {
  /** Breathing aura — 60 BPM ambient glow */
  breathe: {
    name: 'breathe',
    frames: {
      '0%': { opacity: '0.3', transform: 'scale(0.97)' },
      '50%': { opacity: '0.7', transform: 'scale(1.02)' },
      '100%': { opacity: '0.3', transform: 'scale(0.97)' },
    },
    timing: bpm60.beat,
    easing: spring.EASE_IN_OUT,
    iteration: 'infinite',
  },
  
  /** Calm pulse — subtle opacity shift */
  calmPulse: {
    name: 'calmPulse',
    frames: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    timing: bpm60.beat,
    easing: spring.EASE_IN_OUT,
    iteration: 'infinite',
  },
  
  /** Success glow — slide to transform */
  slideSuccess: {
    name: 'slideSuccessGlow',
    frames: {
      '0%': { boxShadow: '0 0 0 rgba(15, 176, 206, 0)' },
      '50%': { boxShadow: '0 0 60px rgba(15, 176, 206, 0.6), 0 0 120px rgba(15, 176, 206, 0.3)' },
      '100%': { boxShadow: '0 0 30px rgba(15, 176, 206, 0.3)' },
    },
    timing: duration.slower,
    easing: spring.TIGHT,
    iteration: '1',
    fillMode: 'forwards',
  },
  
  /** Particle dissolve — number transition */
  particleDissolve: {
    name: 'particleDissolve',
    frames: {
      '0%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0px)' },
      '40%': { opacity: '0.3', transform: 'scale(1.05)', filter: 'blur(1px)' },
      '70%': { opacity: '0.1', transform: 'scale(1.1)', filter: 'blur(2px)' },
      '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0px)' },
    },
    timing: duration.slow,
    easing: spring.TIGHT,
    iteration: '1',
    fillMode: 'forwards',
  },
  
  /** Fade in — elements entering */
  fadeIn: {
    name: 'fadeIn',
    frames: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    timing: duration.normal,
    easing: spring.EASE_OUT,
    iteration: '1',
  },
  
  /** Fade out — elements exiting */
  fadeOut: {
    name: 'fadeOut',
    frames: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    timing: duration.normal,
    easing: spring.EASE_IN,
    iteration: '1',
  },
  
  /** Slide up — bottom sheets, modals */
  slideUp: {
    name: 'slideUp',
    frames: {
      '0%': { transform: 'translateY(100%)' },
      '100%': { transform: 'translateY(0)' },
    },
    timing: duration.slow,
    easing: spring.TIGHT,
    iteration: '1',
  },
  
  /** Slide down — closing bottom sheets */
  slideDown: {
    name: 'slideDown',
    frames: {
      '0%': { transform: 'translateY(0)' },
      '100%': { transform: 'translateY(100%)' },
    },
    timing: duration.normal,
    easing: spring.EASE_IN,
    iteration: '1',
  },
  
  /** Scale in — cards, tooltips */
  scaleIn: {
    name: 'scaleIn',
    frames: {
      '0%': { opacity: '0', transform: 'scale(0.95)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    timing: duration.quick,
    easing: spring.TIGHT,
    iteration: '1',
  },
  
  /** Pulse warning — approaching budget limit */
  pulseWarning: {
    name: 'pulseWarning',
    frames: {
      '0%, 100%': { opacity: '1', transform: 'scale(1)' },
      '50%': { opacity: '0.7', transform: 'scale(1.05)' },
    },
    timing: '0.8s',
    easing: spring.EASE_IN_OUT,
    iteration: 'infinite',
  },
} as const;

// ─── Motion Presets ─────────────────────────────────────────────────
export const motionPresets = {
  /** Micro-interaction — button press, toggle */
  micro: {
    duration: duration.fast,
    easing: spring.TIGHT,
  },
  
  /** Component transition — card hover, accordion */
  component: {
    duration: duration.quick,
    easing: spring.TIGHT,
  },
  
  /** Page transition — screen changes */
  page: {
    duration: duration.normal,
    easing: spring.GENTLE,
  },
  
  /** Modal/Bottom sheet */
  modal: {
    enter: { duration: duration.slow, easing: spring.TIGHT },
    exit: { duration: duration.normal, easing: spring.EASE_IN },
  },
  
  /** Success celebration — transaction recorded */
  success: {
    duration: duration.slower,
    easing: spring.BOUNCY,
  },
  
  /** Error shake — validation fail */
  error: {
    duration: '400ms',
    keyframes: {
      '0%, 100%': { transform: 'translateX(0)' },
      '20%': { transform: 'translateX(-8px)' },
      '40%': { transform: 'translateX(8px)' },
      '60%': { transform: 'translateX(-4px)' },
      '80%': { transform: 'translateX(4px)' },
    },
  },
  
  /** Ripple effect — touch feedback */
  ripple: {
    duration: duration.slowest,
    easing: spring.EASE_OUT,
  },
  
  /** Count animation — number transitions */
  count: {
    duration: duration.slowest,
    easing: spring.TIGHT,
  },
} as const;

// ─── Type Definitions ──────────────────────────────────────────────
export type SpringPreset = keyof typeof spring;
export type DurationPreset = keyof typeof duration;
export type BPM60Preset = keyof typeof bpm60;
export type KeyframePreset = keyof typeof keyframes;
export type MotionPreset = keyof typeof motionPresets;

// ─── Tailwind Animation Classes ─────────────────────────────────────
// Tailwind-friendly animation strings (use CSS easing strings)
export const tailwindAnimations = {
  'breathe-in': `${keyframes.breathe.timing} ${keyframes.breathe.easing} infinite`,
  'breathe-calm': `${keyframes.calmPulse.timing} ${keyframes.calmPulse.easing} infinite`,
  'calm-pulse': `${keyframes.calmPulse.timing} ${keyframes.calmPulse.easing} infinite`,
  'calm-pulse-fast': '0.8s ease-in-out infinite',
  'slide-success': `${keyframes.slideSuccess.timing} ${keyframes.slideSuccess.easing} forwards`,
  'particle-dissolve': `${keyframes.particleDissolve.timing} ${keyframes.particleDissolve.easing} forwards`,
} as const;

// ─── Motion System Export ───────────────────────────────────────────
export const motionTokens = {
  spring,
  duration,
  bpm60,
  keyframes,
  motionPresets,
  tailwindAnimations,
} as const;

export type MotionTokens = typeof motionTokens;
