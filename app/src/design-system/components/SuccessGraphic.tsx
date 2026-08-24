/**
 * ============================================================
 * DailyStack Design System — SuccessGraphic Component v1.0 (E-Pay Style)
 * ============================================================
 * Success checkmark circle with animated stars
 * 
 * Design Philosophy:
 * - Green circle with white checkmark
 * - Animated star particles
 * - Celebration effect for successful actions
 * - E-Pay lime accent colors
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SuccessGraphicProps {
  /** Animation trigger */
  isActive?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Star count */
  starCount?: number;
  /** Auto-play animation */
  autoPlay?: boolean;
  /** Animation duration in ms */
  duration?: number;
  onAnimationComplete?: () => void;
  className?: string;
}

const sizeConfig = {
  sm: { circle: 64, stroke: 3, icon: 24, star: 8 },
  md: { circle: 96, stroke: 4, icon: 36, star: 10 },
  lg: { circle: 128, stroke: 5, icon: 48, star: 12 },
  xl: { circle: 160, stroke: 6, icon: 60, star: 14 },
};

// ─── Star Particle ─────────────────────────────────────────────────
interface StarParticleProps {
  angle: number;
  delay: number;
  size: number;
  color: string;
}

const StarParticle: React.FC<StarParticleProps> = ({ angle, delay, size, color }) => {
  const radians = (angle * Math.PI) / 180;
  const distance = 60 + Math.random() * 40;

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0, 1, 0.5],
        x: Math.cos(radians) * distance,
        y: Math.sin(radians) * distance,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: 'easeOut',
      }}
      className="absolute"
      style={{ originX: '0px', originY: '0px' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
      >
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8l-6.3 4.2 2.3-7-6-4.6h7.6L12 2z" />
      </svg>
    </motion.div>
  );
};

// ─── Checkmark Path ────────────────────────────────────────────────
const CheckmarkPath: React.FC<{ size: number; strokeWidth: number }> = ({ size, strokeWidth }) => (
  <motion.path
    d="M6 12l4 4 8-8"
    stroke="white"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  />
);

// ─── Success Graphic ───────────────────────────────────────────────
const SuccessGraphic: React.FC<SuccessGraphicProps> = ({
  isActive = true,
  size = 'lg',
  starCount = 8,
  autoPlay = true,
  duration = 2000,
  onAnimationComplete,
  className = '',
}) => {
  const config = sizeConfig[size];
  const [showStars, setShowStars] = React.useState(false);

  React.useEffect(() => {
    if (isActive && autoPlay) {
      const timer = setTimeout(() => setShowStars(true), 300);
      const completeTimer = setTimeout(() => {
        setShowStars(false);
        onAnimationComplete?.();
      }, duration);
      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    } else if (isActive) {
      setShowStars(true);
    } else {
      setShowStars(false);
    }
  }, [isActive, autoPlay, duration, onAnimationComplete]);

  if (!isActive) return null;

  return (
    <div
      className={`
        relative flex items-center justify-center
        ${className}
      `}
      style={{
        width: config.circle,
        height: config.circle,
      }}
    >
      {/* Outer Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(15, 176, 206,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Main Circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute rounded-full bg-[#4CAF50] flex items-center justify-center"
        style={{
          width: config.circle,
          height: config.circle,
          boxShadow: '0 0 40px rgba(76, 175, 80, 0.4)',
        }}
      >
        {/* Checkmark */}
        <svg
          width={config.icon}
          height={config.icon}
          viewBox="0 0 24 24"
        >
          <CheckmarkPath size={config.icon} strokeWidth={config.stroke} />
        </svg>
      </motion.div>

      {/* Star Particles */}
      <AnimatePresence>
        {showStars && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: starCount }).map((_, i) => (
              <StarParticle
                key={i}
                angle={(i * 360) / starCount + (Math.random() * 20 - 10)}
                delay={0.3 + i * 0.05}
                size={config.star}
                color={i % 3 === 0 ? '#0FB0CE' : '#4CAF50'}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Success Card (with graphic + message) ─────────────────────────
export interface SuccessCardProps {
  /** Animation state */
  isActive?: boolean;
  /** Size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Title message */
  title?: string;
  /** Subtitle message */
  subtitle?: string;
  /** Action button */
  action?: React.ReactNode;
  /** Auto dismiss */
  autoDismiss?: boolean;
  /** Dismiss duration */
  dismissDuration?: number;
  onDismiss?: () => void;
  onAnimationComplete?: () => void;
  className?: string;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({
  isActive = true,
  size = 'lg',
  title = 'Success!',
  subtitle,
  action,
  autoDismiss,
  dismissDuration = 3000,
  onDismiss,
  onAnimationComplete,
  className = '',
}) => {
  const [visible, setVisible] = React.useState(isActive);

  React.useEffect(() => {
    setVisible(isActive);
    if (isActive && autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, dismissDuration);
      return () => clearTimeout(timer);
    }
  }, [isActive, autoDismiss, dismissDuration, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`
            flex flex-col items-center justify-center
            p-8 rounded-3xl
            bg-[#1A1A1A] border border-[rgba(15, 176, 206,0.3)]
            shadow-[0_0_40px_rgba(15, 176, 206,0.1)]
            ${className}
          `}
        >
          <SuccessGraphic
            isActive={visible}
            size={size}
            onAnimationComplete={onAnimationComplete}
            className="mb-6"
          />

          <h2
            className="text-2xl font-bold text-white mb-2 text-center"
            style={{ fontFamily: 'var(--font-display, "Inter", sans-serif)' }}
          >
            {title}
          </h2>

          {subtitle && (
            <p className="text-[#888888] text-center mb-6">
              {subtitle}
            </p>
          )}

          {action && (
            <div className="mt-4">
              {action}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Pulsing Success Indicator (inline) ────────────────────────────
export interface SuccessIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SuccessIndicator: React.FC<SuccessIndicatorProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: { circle: 16, check: 10 },
    md: { circle: 24, check: 14 },
    lg: { circle: 32, check: 18 },
  };

  const config = sizes[size];

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        relative rounded-full bg-[#4CAF50] flex items-center justify-center
        ${className}
      `}
      style={{ width: config.circle, height: config.circle }}
    >
      <svg
        width={config.check}
        height={config.check}
        viewBox="0 0 24 24"
      >
        <path
          d="M5 12l5 5L19 7"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
};

export default SuccessGraphic;
