/**
 * ============================================================
 * DailyStack — Gyroscope Z-Axis Volumetric Hook v1.0
 * ============================================================
 * Integrates device gyroscope with Brushed Obsidian Glass
 * Z-axis depth layer — ambient aura follows device tilt
 * in real-time, creating the Tesla-inspired spatial feel
 *
 * Physics: damped spring interpolation on device orientation
 * Output: CSS transform + opacity values for glass layer
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export interface GyroState {
  /** Device tilt on X axis (pitch) — range: -45 to 45 degrees */
  tiltX: number;
  /** Device tilt on Y axis (roll) — range: -45 to 45 degrees */
  tiltY: number;
  /** Combined tilt magnitude — used for ambient glow intensity */
  magnitude: number;
  /** Whether gyroscope is currently active */
  isActive: boolean;
  /** Whether permission was denied */
  permissionDenied: boolean;
}

export interface ObsidianGlassTransform {
  /** CSS transform rotateX value */
  rotateX: number;
  /** CSS transform rotateY value */
  rotateY: number;
  /** CSS perspective depth value */
  perspective: number;
  /** Shadow blur intensity multiplier (0-1) */
  shadowIntensity: number;
  /** Ambient glow opacity (0-0.4) */
  glowOpacity: number;
  /** Gradient shift ratio for brushed metal effect */
  gradientShift: number;
}

// ─── Tuning Constants ────────────────────────────────────────────
const GYRO = {
  /** Max tilt angle in degrees */
  MAX_TILT: 45,
  /** Smoothing factor — higher = more responsive, lower = smoother */
  SMOOTHING: 0.12,
  /** Anti-drift dead zone in degrees */
  DEAD_ZONE: 0.5,
  /** Base perspective depth for 3D transform */
  PERSPECTIVE: 800,
  /** Max shadow blur in px */
  MAX_SHADOW: 40,
  /** Max ambient glow opacity */
  MAX_GLOW: 0.35,
} as const;

// ─── Gyroscope Hook ──────────────────────────────────────────────
export function useGyroscope(): GyroState {
  const [state, setState] = useState<GyroState>({
    tiltX: 0,
    tiltY: 0,
    magnitude: 0,
    isActive: false,
    permissionDenied: false,
  });

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const clamp = useCallback((val: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, val));
  }, []);

  const lerp = useCallback((a: number, b: number, t: number) => {
    return a + (b - a) * t;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // iOS 13+ requires explicit permission
      if (event.alpha === null || event.beta === null || event.gamma === null) {
        return;
      }

      // beta: front-back tilt (-180 to 180), gamma: left-right (-90 to 90)
      const rawX = clamp(event.beta, -GYRO.MAX_TILT, GYRO.MAX_TILT);
      const rawY = clamp(event.gamma, -GYRO.MAX_TILT, GYRO.MAX_TILT);

      // Apply dead zone to prevent drift when device is stationary
      const x = Math.abs(rawX) < GYRO.DEAD_ZONE ? 0 : rawX;
      const y = Math.abs(rawY) < GYRO.DEAD_ZONE ? 0 : rawY;

      targetRef.current = { x, y };
    };

    const startSmoothingLoop = () => {
      const loop = () => {
        const target = targetRef.current;
        const current = currentRef.current;

        // Damped spring interpolation — smooth but responsive
        currentRef.current = {
          x: lerp(current.x, target.x, GYRO.SMOOTHING),
          y: lerp(current.y, target.y, GYRO.SMOOTHING),
        };

        const mag = Math.sqrt(current.x ** 2 + current.y ** 2);

        setState({
          tiltX: currentRef.current.x,
          tiltY: currentRef.current.y,
          magnitude: Math.min(mag / GYRO.MAX_TILT, 1),
          isActive: true,
          permissionDenied: false,
        });

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    };

    // Check iOS permission requirement
    const setupListeners = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            startSmoothingLoop();
          } else {
            setState(prev => ({ ...prev, permissionDenied: true }));
          }
        } catch {
          setState(prev => ({ ...prev, permissionDenied: true }));
        }
      } else {
        // Non-iOS: no permission needed
        window.addEventListener('deviceorientation', handleOrientation);
        startSmoothingLoop();
      }
    };

    setupListeners();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [clamp, lerp]);

  return state;
}

// ─── Obsidian Glass Transform Hook ─────────────────────────────────
/**
 * Computes CSS transform values for Brushed Obsidian Glass effect
 * based on gyroscope state. Feed these into your glass card styles.
 *
 * Usage:
 *   const { transform, style } = useObsidianGlass(gyroState, { enabled: true, intensity: 1.0 });
 */
export function useObsidianGlass(
  gyro: GyroState,
  options: {
    enabled?: boolean;
    intensity?: number; // 0-1 global multiplier
    layer?: 'primary' | 'secondary' | 'ambient';
  } = {}
) {
  const { enabled = true, intensity = 1.0, layer = 'primary' } = options;

  // Layer-specific multipliers — primary cards get most movement
  const layerConfig = {
    primary: { tiltMult: 1.0, shadowMult: 1.0, glowMult: 1.0 },
    secondary: { tiltMult: 0.6, shadowMult: 0.7, glowMult: 0.7 },
    ambient: { tiltMult: 0.3, shadowMult: 0.4, glowMult: 0.5 },
  };

  const config = layerConfig[layer];

  const transform: ObsidianGlassTransform = enabled
    ? {
        rotateX: -(gyro.tiltY * config.tiltMult * 0.3), // inverse for natural feel
        rotateY: gyro.tiltX * config.tiltMult * 0.3,
        perspective: GYRO.PERSPECTIVE,
        shadowIntensity: gyro.magnitude * config.shadowMult * intensity,
        glowOpacity: Math.min(
          GYRO.MAX_GLOW * gyro.magnitude * config.glowMult * intensity,
          GYRO.MAX_GLOW
        ),
        gradientShift: (gyro.tiltX + gyro.tiltY) / (GYRO.MAX_TILT * 2), // -0.5 to 0.5
      }
    : {
        rotateX: 0,
        rotateY: 0,
        perspective: GYRO.PERSPECTIVE,
        shadowIntensity: 0,
        glowOpacity: 0,
        gradientShift: 0,
      };

  // CSS transform string
  const cssTransform = `perspective(${transform.perspective}px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`;

  // Dynamic shadow style for the brushed obsidian effect
  const shadowStyle = {
    boxShadow: enabled
      ? `
        0 ${4 + transform.shadowIntensity * GYRO.MAX_SHADOW * 0.5}px
        ${12 + transform.shadowIntensity * GYRO.MAX_SHADOW}px
        rgba(0, 0, 0, ${0.4 + transform.shadowIntensity * 0.4}),
        0 0 ${20 + transform.shadowIntensity * 30}px rgba(86, 190, 137, ${transform.glowOpacity}),
        inset 0 1px 0 rgba(255, 255, 255, ${0.05 + transform.glowOpacity * 0.3})
      `
      : '0 8px 32px rgba(0, 0, 0, 0.4)',
  };

  // Gradient overlay for brushed metal effect
  const gradientStyle = {
    background: enabled
      ? `linear-gradient(
          ${135 + transform.gradientShift * 30}deg,
          rgba(255, 255, 255, ${0.03 + transform.glowOpacity * 0.1}) 0%,
          transparent ${40 + Math.abs(transform.gradientShift) * 20}%,
          rgba(86, 190, 137, ${transform.glowOpacity * 0.15}) 100%
        )`
      : undefined,
  };

  return {
    transform,
    cssTransform,
    shadowStyle,
    gradientStyle,
  };
}

// ─── Ambient Glow Pulse Hook ──────────────────────────────────────
/**
 * Drives the ambient pulse rate of the Brushed Obsidian Glass aura.
 * Returns opacity values that oscillate at 60 BPM (1 Hz) when active.
 */
export function useAmbientGlowPulse(
  isActive: boolean,
  pulseRate: 'calm' | 'alert' | 'urgent' = 'calm'
) {
  const [glowPhase, setGlowPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());

  const rates = {
    calm: 1.0,    // 60 BPM
    alert: 1.5,   // 90 BPM
    urgent: 2.0,  // 120 BPM
  };

  useEffect(() => {
    if (!isActive) {
      setGlowPhase(0);
      return;
    }

    const period = 1000 / rates[pulseRate]; // ms per cycle

    const loop = (now: number) => {
      const elapsed = now - lastTimeRef.current;
      const phase = (elapsed % period) / period; // 0-1 cycle position
      // Sinusoidal oscillation for smooth in-out
      setGlowPhase((Math.sin(phase * 2 * Math.PI - Math.PI / 2) + 1) / 2);
      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive, pulseRate]);

  // Returns value between 0 and 1 (sinusoidal pulse)
  return {
    phase: glowPhase,
    // Combined with base ambient glow
    combinedOpacity: isActive ? 0.15 + glowPhase * 0.20 : 0,
  };
}
