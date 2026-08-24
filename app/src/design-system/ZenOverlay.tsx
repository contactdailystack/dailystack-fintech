/**
 * ============================================================
 * DailyStack — ZenOverlay v1.0
 * ============================================================
 * Full-screen Zen Mode overlay
 * Concentric ring SVG (3 rings) keeps spatial context — not blank
 * Rings animate in with staggered delays
 *
 * Visual Language:
 *   Full-screen overlay with backdrop-blur
 *   3 concentric rings: radii 120, 90, 60 (matching ZeroButtonDashboard)
 *   Rings animate with alternating rotation directions
 *   Text: "Finding stillness..." / "กำลังหาความสงบ..."
 *   Uses motion/react for all animations
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { motionTokens, toSeconds, easing } from './motion-tokens';
import { Shield } from 'lucide-react';
import { Language } from '../data/translations';

// ─── Props Interface ───────────────────────────────────────────────
export interface ZenOverlayProps {
  /** Whether Zen mode is active */
  isActive: boolean;
  /** Language for text display */
  lang?: Language;
  /** Custom instruction text override */
  instructionText?: string;
  /** Additional CSS class names */
  className?: string;
}

// ─── Concentric Ring ───────────────────────────────────────────────
const ConcentricRing = memo(function ConcentricRing({
  radius,
  delay,
  direction,
}: {
  radius: number;
  delay: number;
  direction: 1 | -1;
}) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: radius * 2,
        height: radius * 2,
        borderColor: 'rgba(86, 190, 137, 0.12)',
        borderWidth: 1,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        duration: toSeconds(motionTokens.duration.slowest),
        delay,
        ease: easing.tight,
      }}
    >
      {/* Rotating animation after entrance */}
      <motion.div
        animate={{ rotate: direction * 360 }}
        transition={{
          duration: 15 + (3 - radius / 40) * 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: easing.standard,
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </motion.div>
    </motion.div>
  );
});

// ─── Ring Sizes (matching ZeroButtonDashboard ZenModeOverlay) ───────
const RING_SIZES = [120, 90, 60] as const;
const RING_DELAYS = [0, 0.1, 0.2] as const;
const RING_DIRECTIONS: (1 | -1)[] = [1, -1, 1];

// ─── ZenOverlay Component ──────────────────────────────────────────
export const ZenOverlay = memo(function ZenOverlay({
  isActive,
  lang = 'en',
  instructionText,
  className = '',
}: ZenOverlayProps) {
  const defaultText =
    lang === 'en' ? 'Double tap to reveal' : 'แตะสองครั้งเพื่อเปิดเผย';

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: toSeconds(motionTokens.duration.normal), ease: easing.tight }}
          className={`absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none ${className}`}
          style={{
            background: 'rgba(11, 15, 20, 0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {/* Concentric rings with staggered entrance */}
          {RING_SIZES.map((r, i) => (
            <ConcentricRing
              key={r}
              radius={r}
              delay={RING_DELAYS[i]}
              direction={RING_DIRECTIONS[i]}
            />
          ))}

          {/* Center shield icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.5, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: toSeconds(motionTokens.duration.slow), delay: toSeconds(motionTokens.duration.fast), ease: easing.tight }}
            className="absolute"
          >
            <Shield className="w-10 h-10 text-[#56be89]" />
          </motion.div>

          {/* Instruction text */}
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.4, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: toSeconds(motionTokens.duration.slow), delay: toSeconds(motionTokens.duration.fast) + 0.1, ease: easing.tight }}
            className="absolute"
            style={{
              bottom: '15%',
              fontFamily: '"Inter", sans-serif',
              fontSize: '8px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'rgba(86, 190, 137, 0.4)',
            }}
          >
            {instructionText ?? defaultText}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default ZenOverlay;
