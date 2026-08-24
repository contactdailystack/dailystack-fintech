/**
 * ============================================================
 * DailyStack — Gyroscope Card Effect v1.0
 * ============================================================
 * Sprint 5: Sentient Physics - Brushed Obsidian Glass
 * 
 * When the user tilts their phone, the card surface
 * reflections and ambient glow shift based on the tilt angle.
 * 
 * Design Reference: Tesla vehicle controls + Apple ProMotion
 * This creates the illusion of physical depth and material quality.
 */

import { useEffect, useState, useRef, memo } from 'react';
import { motion } from 'motion/react';

interface GyroscopeCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Intensity of the effect (0-1) */
  intensity?: number;
  /** Whether to enable gyroscope (default: true on supported devices) */
  enabled?: boolean;
  /** Custom glow color */
  glowColor?: string;
}

interface TiltData {
  x: number; // Left-right tilt (-1 to 1)
  y: number; // Forward-back tilt (-1 to 1)
}

export const GyroscopeCard = memo(function GyroscopeCard({
  children,
  className = '',
  style = {},
  intensity = 0.5,
  enabled = true,
  glowColor = '#0FB0CE',
}: GyroscopeCardProps) {
  const [tilt, setTilt] = useState<TiltData>({ x: 0, y: 0 });
  const [isSupported, setIsSupported] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for DeviceOrientation support
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'DeviceOrientationEvent' in window;
      setIsSupported(supported);
    };
    checkSupport();
  }, []);

  // Listen for device orientation
  useEffect(() => {
    if (!enabled || !isSupported) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // gamma: left-right tilt (-90 to 90)
      // beta: front-back tilt (-180 to 180)
      const gamma = event.gamma || 0;
      const beta = event.beta || 0;

      // Normalize to -1 to 1 range
      const x = Math.max(-1, Math.min(1, gamma / 45));
      const y = Math.max(-1, Math.min(1, (beta - 45) / 45)); // Offset for typical holding angle

      setTilt({ x, y });
    };

    // Request permission on iOS 13+
    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (e) {
          console.warn('DeviceOrientation permission denied');
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [enabled, isSupported]);

  // Fallback: use mouse position for desktop
  useEffect(() => {
    if (!enabled || isSupported) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      
      setTilt({ 
        x: Math.max(-1, Math.min(1, x)), 
        y: Math.max(-1, Math.min(1, y)) 
      });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, isSupported]);

  // Calculate transform based on tilt
  const rotateY = tilt.x * 15 * intensity;
  const rotateX = -tilt.y * 15 * intensity;
  const glowOffsetX = tilt.x * 20 * intensity;
  const glowOffsetY = tilt.y * 20 * intensity;

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{
        ...style,
        perspective: '1000px',
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 20,
      }}
    >
      {/* Ambient glow that follows tilt */}
      <div
        className="absolute inset-0 rounded-inherit pointer-events-none overflow-hidden"
        style={{
          borderRadius: 'inherit',
        }}
      >
        {/* Primary glow */}
        <div
          className="absolute w-64 h-64 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)`,
            left: `calc(50% + ${glowOffsetX}px)`,
            top: `calc(50% + ${glowOffsetY}px)`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.1s ease-out, top 0.1s ease-out',
          }}
        />
        
        {/* Secondary glow (weaker) */}
        <div
          className="absolute w-48 h-48 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${glowColor}10 0%, transparent 70%)`,
            left: `calc(50% - ${glowOffsetX * 0.5}px)`,
            top: `calc(50% - ${glowOffsetY * 0.5}px)`,
            transform: 'translate(-50%, -50%)',
            transition: 'left 0.15s ease-out, top 0.15s ease-out',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Shine effect that moves with tilt */}
      <div
        className="absolute inset-0 rounded-inherit pointer-events-none opacity-20"
        style={{
          borderRadius: 'inherit',
          background: `linear-gradient(
            ${135 + tilt.x * 30}deg,
            transparent 0%,
            ${glowColor}30 50%,
            transparent 100%
          )`,
          opacity: 0.1 + Math.abs(tilt.x) * 0.1 + Math.abs(tilt.y) * 0.1,
          transition: 'background 0.1s ease-out',
        }}
      />
    </motion.div>
  );
});

// Hook for gyroscope data
export function useGyroscope(enabled: boolean = true) {
  const [tilt, setTilt] = useState<TiltData>({ x: 0, y: 0 });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'DeviceOrientationEvent' in window;
      setIsSupported(supported);
    };
    checkSupport();

    if (!enabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma || 0;
      const beta = event.beta || 0;
      const x = Math.max(-1, Math.min(1, gamma / 45));
      const y = Math.max(-1, Math.min(1, (beta - 45) / 45));
      setTilt({ x, y });
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [enabled]);

  return { tilt, isSupported };
}
