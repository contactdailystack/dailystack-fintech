/**
 * ============================================================
 * DailyStack Design System — PageTransition Component v2.0
 * ============================================================
 * Smooth page transitions with Framer Motion
 * 
 * Design Philosophy:
 * - Consistent enter/exit animations
 * - Direction-aware transitions (forward/back)
 * - Stagger animations for child elements
 * - prefers-reduced-motion support
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { motionTokens, toSeconds } from '../motion-tokens';

// Simple easing functions
const easeOut = [0.16, 1, 0.3, 1] as const;
const easeIn = [0.4, 0, 1, 1] as const;

// ─── Animation Variants ─────────────────────────────────────────────

/** Fade + slide from bottom (default for forward navigation) */
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: toSeconds(motionTokens.duration.normal),
      ease: easeOut,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: toSeconds(motionTokens.duration.quick),
      ease: easeIn,
    }
  },
};

/** Slide from right (forward) / left (back) */
export const slideTransition = {
  initial: { opacity: 0, x: 50 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: toSeconds(motionTokens.duration.normal),
      ease: easeOut,
    }
  },
  exit: { 
    opacity: 0, 
    x: -50,
    transition: {
      duration: toSeconds(motionTokens.duration.quick),
      ease: easeIn,
    }
  },
};

/** Scale + fade (modal-style) */
export const scaleTransition = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: toSeconds(motionTokens.duration.normal),
      ease: easeOut,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: {
      duration: toSeconds(motionTokens.duration.quick),
      ease: easeIn,
    }
  },
};

/** Stagger children animation */
export const staggerTransition = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: toSeconds(motionTokens.duration.quick),
      ease: easeOut,
    }
  },
};

// ─── Component Props ───────────────────────────────────────────────
export interface PageTransitionProps {
  /** Child elements */
  children: React.ReactNode;
  /** Animation variant */
  variant?: 'default' | 'slide' | 'scale' | 'fade';
  /** Direction (for directional animations) */
  direction?: 'forward' | 'back' | 'up' | 'down';
  /** Custom className */
  className?: string;
  /** Show/hide with AnimatePresence */
  mode?: 'wait' | 'sync' | 'popLayout';
  /** Delay before animating */
  delay?: number;
}

// ─── Component ─────────────────────────────────────────────────────
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'default',
  direction = 'forward',
  className = '',
  mode = 'wait',
  delay = 0,
}) => {
  const getVariants = () => {
    const baseVariants = {
      default: pageTransition,
      slide: slideTransition,
      scale: scaleTransition,
      fade: {
        initial: { opacity: 0 },
        animate: { 
          opacity: 1,
          transition: {
            duration: toSeconds(motionTokens.duration.normal),
            ease: easeOut,
            delay,
          }
        },
        exit: { 
          opacity: 0,
          transition: {
            duration: toSeconds(motionTokens.duration.quick),
            ease: easeIn,
          }
        },
      },
    };

    let variantSet = baseVariants[variant];

    // Modify for direction if slide variant
    if (variant === 'slide') {
      const xOffset = direction === 'forward' ? 50 : direction === 'back' ? -50 : 0;
      const exitXOffset = direction === 'forward' ? -50 : direction === 'back' ? 50 : 0;
      variantSet = {
        initial: { opacity: 0, x: xOffset },
        animate: { 
          opacity: 1, 
          x: 0,
          transition: {
            duration: toSeconds(motionTokens.duration.normal),
            ease: easeOut,
          }
        },
        exit: { 
          opacity: 0, 
          x: exitXOffset,
          transition: {
            duration: toSeconds(motionTokens.duration.quick),
            ease: easeIn,
          }
        },
      };
    }

    return variantSet;
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={getVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Stagger Container ─────────────────────────────────────────────
export interface StaggerContainerProps {
  children: React.ReactNode;
  /** Stagger delay between children */
  staggerDelay?: number;
  /** Initial delay */
  initialDelay?: number;
  /** Custom className */
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.05,
  initialDelay = 0.1,
  className = '',
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Stagger Item ──────────────────────────────────────────────────
export interface StaggerItemProps {
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
}) => {
  return (
    <motion.div
      variants={staggerItemTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── List Animation ────────────────────────────────────────────────
export interface ListAnimationProps {
  children: React.ReactNode;
  /** Animation type */
  type?: 'fade' | 'slide' | 'scale';
  /** Direction for slide */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** Stagger delay */
  staggerDelay?: number;
  /** Custom className */
  className?: string;
}

export const ListAnimation: React.FC<ListAnimationProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  staggerDelay = 0.03,
  className = '',
}) => {
  const getInitial = () => {
    if (type === 'slide') {
      const offset = 20;
      if (direction === 'left') return { opacity: 0, x: -offset };
      if (direction === 'right') return { opacity: 0, x: offset };
      if (direction === 'up') return { opacity: 0, y: offset };
      return { opacity: 0, y: -offset };
    }
    if (type === 'scale') return { opacity: 0, scale: 0.9 };
    return { opacity: 0 };
  };

  const getAnimate = () => ({});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = {
    hidden: getInitial(),
    visible: {
      opacity: 1,
      x: type === 'slide' ? 0 : undefined,
      y: type === 'slide' || type === 'fade' ? 0 : undefined,
      scale: type === 'scale' ? 1 : undefined,
      transition: {
        duration: toSeconds(motionTokens.duration.quick),
        ease: easeOut,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// ─── Number Animation ──────────────────────────────────────────────
export interface AnimatedNumberProps {
  value: number;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%") */
  suffix?: string;
  /** Decimal places */
  decimals?: number;
  /** Duration in seconds */
  duration?: number;
  /** Custom className */
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

// ─── Exports ──────────────────────────────────────────────────────
export default PageTransition;
