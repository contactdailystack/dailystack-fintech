/**
 * LineChart.tsx — E-Pay Analytics Style
 * Dark mode line chart with lime green (#0FB0CE) line and gradient fill
 */

import { memo, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { motionTokens, toSeconds, easing } from '../design-system/motion-tokens';
import { haptics } from '../services/hapticService';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  lineColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showDataPoints?: boolean;
  showValue?: boolean;
}

export const LineChart = memo(function LineChart({
  data,
  height = 180,
  lineColor = '#0FB0CE',
  gradientFrom = 'rgba(15, 176, 206, 0.3)',
  gradientTo = 'rgba(15, 176, 206, 0)',
  showDataPoints = true,
  showValue = false,
}: LineChartProps) {
  const chartWidth = 320;
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 30, left: 20 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const { pathD, areaD, maxValue, points } = useMemo(() => {
    if (!data || data.length === 0) return { pathD: '', areaD: '', maxValue: 0, points: [] };

    const max = Math.max(...data.map((d) => d.value)) * 1.1;
    const min = Math.min(...data.map((d) => d.value));
    const range = max - min || 1;

    const pts = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1 || 1)) * innerWidth,
      y: padding.top + innerHeight - ((d.value - min) / range) * innerHeight,
      value: d.value,
      label: d.label,
    }));

    if (pts.length === 0) return { pathD: '', areaD: '', maxValue: max, points: [] };

    const pathParts = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`);
    const areaParts = [
      ...pathParts,
      `L ${pts[pts.length - 1].x} ${chartHeight - padding.bottom}`,
      `L ${pts[0].x} ${chartHeight - padding.bottom}`,
      'Z',
    ];

    return {
      pathD: pathParts.join(' '),
      areaD: areaParts.join(' '),
      maxValue: max,
      points: pts,
    };
  }, [data, innerWidth, innerHeight, padding.left, padding.top, chartHeight, padding.bottom]);

  // Haptic: pulse when chart scale jumps significantly
  const prevMaxRef = useRef<number>(0);
  useEffect(() => {
    if (!prevMaxRef.current) {
      prevMaxRef.current = maxValue;
      return;
    }
    if (maxValue > prevMaxRef.current * 1.2) {
      try { haptics.fire('SELECT'); } catch {}
    }
    prevMaxRef.current = maxValue;
  }, [maxValue]);

  const labels = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d) => d.label);
  }, [data]);

  return (
    <div className="relative" style={{ width: chartWidth }}>
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={chartWidth - padding.right}
          y2={padding.top}
          stroke="#2A2A2A"
          strokeWidth="1"
        />
        <line
          x1={padding.left}
          y1={padding.top + innerHeight / 2}
          x2={chartWidth - padding.right}
          y2={padding.top + innerHeight / 2}
          stroke="#2A2A2A"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1={padding.left}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#2A2A2A"
          strokeWidth="1"
        />

        {/* Area fill */}
        <motion.path
          d={areaD}
          fill="url(#lineGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: toSeconds(motionTokens.duration.normal) }}
        />

        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: toSeconds(motionTokens.duration.slower), ease: easing.standard }}
        />

        {/* Data points */}
        {showDataPoints &&
          points.map((point, i) => (
            <motion.g key={i}>
              {/* Outer glow */}
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill={lineColor}
                opacity="0.2"
              />
              {/* Inner dot */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={lineColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: toSeconds(motionTokens.duration.fast) + i * 0.05, duration: toSeconds(motionTokens.duration.quick) }}
              />
              {/* Value badge */}
              {showValue && (
                <motion.g
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: toSeconds(motionTokens.duration.normal) + i * 0.05 }}
                  >
                  <rect
                    x={point.x - 24}
                    y={point.y - 28}
                    width="48"
                    height="20"
                    rx="10"
                    fill={lineColor}
                  />
                  <text
                    x={point.x}
                    y={point.y - 14}
                    textAnchor="middle"
                    fill="#101010"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="'Inter', sans-serif"
                  >
                    +{point.value}
                  </text>
                </motion.g>
              )}
            </motion.g>
          ))}

        {/* X-axis labels */}
        {labels.map((label, i) => {
          const x = padding.left + (i / (labels.length - 1 || 1)) * innerWidth;
          return (
            <text
              key={i}
              x={x}
              y={chartHeight - 8}
              textAnchor="middle"
              fill="#666666"
              fontSize="10"
              fontFamily="'Inter', sans-serif"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
});
