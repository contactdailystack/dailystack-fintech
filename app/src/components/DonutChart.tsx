/**
 * DonutChart.tsx — E-Pay Analytics Style
 * Donut chart with orange accent (#FF5733) fill
 */

import { memo, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { motionTokens, toSeconds, easing } from '../design-system/motion-tokens';
import { haptics } from '../services/hapticService';

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  fillColor?: string;
  centerText?: string;
  centerSubtext?: string;
}

export const DonutChart = memo(function DonutChart({
  percentage,
  size = 160,
  strokeWidth = 16,
  trackColor = '#2A2A2A',
  fillColor = 'var(--color-elite, #FF5733)',
  centerText,
  centerSubtext,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const strokeDashoffset = useMemo(() => {
    const clampedPercent = Math.max(0, Math.min(100, percentage));
    return circumference - (clampedPercent / 100) * circumference;
  }, [percentage, circumference]);

  // Haptic trigger when approaching full
  const prevPerc = useRef<number>(0);
  useEffect(() => {
    const p = Math.max(0, Math.min(100, percentage));
    if (p >= 90 && prevPerc.current < 90) {
      try { haptics.fire('AMBER_PULSE'); } catch {}
    }
    prevPerc.current = p;
  }, [percentage]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <filter id="donutGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Fill */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: toSeconds(motionTokens.duration.slower), ease: easing.standard }}
          filter="url(#donutGlow)"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerText && (
          <span
            className="text-xl font-bold"
            style={{ fontFamily: "'Inter', sans-serif", color: '#FFFFFF' }}
          >
            {centerText}
          </span>
        )}
        {centerSubtext && (
          <span
            className="text-xs mt-0.5"
            style={{ fontFamily: "'Inter', sans-serif", color: '#888888' }}
          >
            {centerSubtext}
          </span>
        )}
      </div>
    </div>
  );
});
