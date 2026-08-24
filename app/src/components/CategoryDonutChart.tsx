/**
 * CategoryDonutChart.tsx
 * Multi-segment donut chart for spending by category
 * ProfilePage Design System — Dark card style
 */

import { memo } from 'react';
import { motion } from 'framer-motion';

interface CategorySegment {
  label: string;
  value: number;
  color: string;
}

interface CategoryDonutChartProps {
  segments: CategorySegment[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerText?: string;
  centerSubtext?: string;
  onSegmentClick?: (segment: CategorySegment) => void;
}

export const CategoryDonutChart = memo(function CategoryDonutChart({
  segments,
  size = 160,
  innerRadius = 50,
  outerRadius = 70,
  centerText,
  centerSubtext,
  onSegmentClick,
}: CategoryDonutChartProps) {
  const center = size / 2;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0 || segments.length === 0) {
    return (
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="#27272A"
            strokeWidth={outerRadius - innerRadius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white" style={{ fontFamily: '"Inter", sans-serif' }}>฿0</span>
          <span className="text-xs text-gray-500" style={{ fontFamily: '"Inter", sans-serif' }}>No data</span>
        </div>
      </div>
    );
  }

  // Build SVG arc segments
  const buildArc = (startAngle: number, endAngle: number): string => {
    const start = polarToCartesian(center, center, outerRadius, endAngle);
    const end = polarToCartesian(center, center, outerRadius, startAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      'M', start.x, start.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z',
    ].join(' ');
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  let currentAngle = 0;
  const arcData = segments.map((segment) => {
    const segmentAngle = total > 0 ? (segment.value / total) * 360 : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + segmentAngle;
    currentAngle = endAngle;
    return {
      ...segment,
      startAngle,
      endAngle,
      path: buildArc(startAngle, endAngle - 0.5), // small gap between segments
    };
  });

  return (
    <div className="flex items-center gap-6">
      {/* Donut SVG */}
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <defs>
            <filter id="catDonutGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {arcData.map((arc, i) => (
            <motion.path
              key={arc.label}
              d={arc.path}
              fill={arc.color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => onSegmentClick?.(arc)}
              className="cursor-pointer transition-opacity hover:opacity-80"
              style={{ filter: 'url(#catDonutGlow)' }}
            />
          ))}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerText && (
            <span
              className="text-xl font-bold"
              style={{ fontFamily: '"Inter", sans-serif', color: '#56be89', textShadow: '0 0 12px rgba(199,255,46,0.4)' }}
            >
              {centerText}
            </span>
          )}
          {centerSubtext && (
            <span className="text-xs mt-0.5" style={{ fontFamily: '"Inter", sans-serif', color: '#6B7280' }}>
              {centerSubtext}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {arcData.slice(0, 4).map((arc) => (
          <button
            key={arc.label}
            onClick={() => onSegmentClick?.(arc)}
            className="flex items-center gap-2 w-full text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="text-xs flex-1 truncate" style={{ fontFamily: '"Inter", sans-serif', color: '#9CA3AF' }}>
              {arc.label}
            </span>
            <span className="text-xs font-semibold" style={{ fontFamily: '"Inter", sans-serif', color: '#FFFFFF' }}>
              ฿{arc.value.toLocaleString()}
            </span>
          </button>
        ))}
        {arcData.length > 4 && (
          <span className="text-xs" style={{ fontFamily: '"Inter", sans-serif', color: '#4B5563' }}>
            +{arcData.length - 4} more
          </span>
        )}
      </div>
    </div>
  );
});
