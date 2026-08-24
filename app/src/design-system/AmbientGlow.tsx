/**
 * ============================================================
 * DailyStack — AmbientGlow v1.0
 * ============================================================
 * 60 BPM ambient radial gradient pulse
 * Positioned at the bottom of container — matches ZeroButtonDashboard
 * ambient background glow style
 *
 * Visual Language:
 *   Radial gradient: #0FB0CE at 8% opacity at peak
 *   Position: absolute, full-width, bottom of container
 *   Animation: sinusoidal pulse at 60 BPM (1000ms period)
 */

import { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

// ─── Props Interface ───────────────────────────────────────────────
export interface AmbientGlowProps {
  /** Primary glow color (default: #0FB0CE) */
  color?: string;
  /** Peak opacity at pulse crest (default: 0.08) */
  peakOpacity?: number;
  /** Container height (default: 200px) */
  height?: number;
  /** Glow spread radius (default: '80%') */
  spread?: string;
  /** Enable/disable pulse (default: true) */
  active?: boolean;
  /** Additional CSS class names */
  className?: string;
}

// ─── Ambient Pulse Hook ─────────────────────────────────────────────
function useAmbientPulse(active: boolean, peakOpacity: number) {
  const [opacity, setOpacity] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    if (!active) {
      setOpacity(0);
      return;
    }

    const PERIOD_MS = 1000; // 60 BPM

    const loop = (now: number) => {
      const elapsed = now - lastTimeRef.current;
      const phase = (elapsed % PERIOD_MS) / PERIOD_MS;
      // Sinusoidal 0→peak→0 at 60 BPM
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

// ─── AmbientGlow Component ─────────────────────────────────────────
export const AmbientGlow = memo(function AmbientGlow({
  color = '#0FB0CE',
  peakOpacity = 0.08,
  height = 200,
  spread = '80%',
  active = true,
  className = '',
}: AmbientGlowProps) {
  const opacity = useAmbientPulse(active, peakOpacity);

  return (
    <motion.div
      className={`absolute inset-x-0 pointer-events-none ${className}`}
      style={{
        bottom: 0,
        height: `${height}px`,
      }}
      animate={{ opacity: opacity / (peakOpacity || 0.08) }}
      // Use motion/react for smooth opacity interpolation at 60Hz
      transition={{ duration: 0.016 }} // ~60fps update rate
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${color} ${opacity * 100}% 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
});

export default AmbientGlow;
