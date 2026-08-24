/**
 * ============================================================
 * DailyStack Design System — TeslaCard Component v2.0 (Consolidated)
 * ============================================================
 * Premium glass-morphism card with ambient glow and Zen Mode
 * 
 * Design Philosophy:
 * - Glass-morphism surface with subtle blur (Brushed Obsidian)
 * - Optional breathing aura for premium moments
 * - Zen Mode blur overlay with rotating spatial context rings
 * - Border radius 16-24px for modern feel
 * - Tap feedback scale and Crisp Click haptic
 */

import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { borderRadius as brTokens } from '../spacing-tokens';
import { border as borderTokens } from '../color-tokens';
import { haptics } from '../../services/hapticService';

// ─── Component Props ───────────────────────────────────────────────
export interface TeslaCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** Card variant */
  variant?: 'default' | 'elevated' | 'glass' | 'glow';
  /** Breathing aura animation */
  breathe?: boolean;
  /** Zen mode — content hidden with animated blur overlay */
  zen?: boolean;
  /** Glow color override */
  glowColor?: string;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Click handler (enables press state and fires haptics) */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Layout ID for Framer Motion morphing transitions */
  layoutId?: string;
  /** Children */
  children: React.ReactNode;
}

// ─── Ambient Pulse Hook ─────────────────────────────────────────────
function useAmbientPulse(active: boolean, peakOpacity: number) {
  const [opacity, setOpacity] = React.useState(0);
  const rafRef = React.useRef<number | null>(null);
  const lastTimeRef = React.useRef(performance.now());

  React.useEffect(() => {
    if (!active) {
      setOpacity(0);
      return;
    }

    const PERIOD_MS = 1000; // 60 BPM

    const loop = (now: number) => {
      const elapsed = now - lastTimeRef.current;
      const phase = (elapsed % PERIOD_MS) / PERIOD_MS;
      const value = (Math.sin(phase * 2 * Math.PI - Math.PI / 2) + 1) / 2;
      setOpacity(value * peakOpacity);
      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, peakOpacity]);

  return opacity;
}

// ─── Zen Blur Overlay ──────────────────────────────────────────────
const ZenBlurOverlay = React.memo(function ZenBlurOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 rounded-inherit pointer-events-none z-10"
      style={{
        background: 'rgba(11, 15, 20, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[80, 56, 32].map((r, i) => (
        <motion.div
          key={r}
          className="absolute rounded-full border"
          style={{
            width: r * 2,
            height: r * 2,
            borderColor: 'rgba(205, 255, 36, 0.10)',
            borderWidth: 1,
          }}
          animate={{
            rotate: i % 2 === 0 ? [0, 360] : [360, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </motion.div>
  );
});

// ─── Component Styles ───────────────────────────────────────────────
const cardStyles = {
  base: `
    relative
    transition-all
    duration-300
    ease-out
    overflow-hidden
  `,
  
  variants: {
    default: 'bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl',
    elevated: 'bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-lg',
    glass: 'bg-[rgba(26,26,26,0.95)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl rounded-2xl',
    glow: 'bg-[#1A1A1A] border border-[rgba(205,255,36,0.3)] shadow-[0_0_30px_rgba(205,255,36,0.2)] rounded-2xl',
  },
  
  padding: {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  },
};

// ─── Component ─────────────────────────────────────────────────────
export const TeslaCard = forwardRef<HTMLDivElement, TeslaCardProps>(
  (
    {
      variant = 'default',
      breathe = false,
      zen = false,
      glowColor,
      glowIntensity = 0.3,
      padding = 'md',
      className = '',
      onClick,
      layoutId,
      children,
      ...props
    },
    ref
  ) => {
    const isInteractive = Boolean(onClick);
    const activePulse = breathe || variant === 'glow';
    const pulseOpacity = useAmbientPulse(activePulse, glowIntensity);

    // Determine glow style dynamically at 60Hz
    const glowStyle = activePulse
      ? {
          boxShadow: `0 0 ${30 * pulseOpacity}px ${glowColor || `rgba(205, 255, 36, ${pulseOpacity})`}`,
        }
      : {};

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        haptics.fire('CRISP_CLICK');
        onClick(e);
      }
    };

    return (
      <motion.div
        ref={ref}
        layoutId={layoutId}
        whileTap={isInteractive ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.15 }}
        onClick={isInteractive ? handleClick : undefined}
        className={`
          ${cardStyles.base}
          ${cardStyles.variants[variant]}
          ${cardStyles.padding[padding]}
          ${isInteractive ? 'cursor-pointer' : ''}
          ${className}
        `}
        style={glowStyle}
        {...(props as any)}
      >
        {/* Glow overlay for premium variants */}
        {activePulse && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(ellipse at center, ${glowColor || 'rgba(205, 255, 36, 0.15)'} 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Zen overlay */}
        <AnimatePresence>
          {zen && <ZenBlurOverlay />}
        </AnimatePresence>
        
        {/* Content wrapper */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);

// ─── Card Sub-components ────────────────────────────────────────────
export interface TeslaCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const TeslaCardHeader: React.FC<TeslaCardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => (
  <div className={`flex items-start justify-between mb-3 ${className}`}>
    <div>
      <h3 className="text-base font-semibold text-white leading-tight font-display">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-0.5 font-sans">
          {subtitle}
        </p>
      )}
    </div>
    {action && <div className="ml-4">{action}</div>}
  </div>
);

// ─── Card Content Variants ──────────────────────────────────────────
export interface TeslaCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const TeslaCardContent: React.FC<TeslaCardContentProps> = ({
  children,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    {children}
  </div>
);

// ─── Card Footer ────────────────────────────────────────────────────
export interface TeslaCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const TeslaCardFooter: React.FC<TeslaCardFooterProps> = ({
  children,
  className = '',
}) => (
  <div className={`mt-4 pt-3 border-t border-[${borderTokens.DEFAULT}] ${className}`}>
    {children}
  </div>
);

// ─── Display Name ───────────────────────────────────────────────────
TeslaCard.displayName = 'TeslaCard';
TeslaCardHeader.displayName = 'TeslaCardHeader';
TeslaCardContent.displayName = 'TeslaCardContent';
TeslaCardFooter.displayName = 'TeslaCardFooter';
