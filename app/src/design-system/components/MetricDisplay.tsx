/**
 * ============================================================
 * DailyStack Design System — MetricDisplay Component v1.0
 * ============================================================
 * Financial metric display with trend indicators
 * 
 * Design Philosophy:
 * - Tabular figures for number alignment
 * - Trend indicator (up/down with percentage)
 * - Optional sparkline chart
 * - Color-coded by trend direction
 */

import React from 'react';
import { motion } from 'framer-motion';
import { semantic, warning, text } from '../color-tokens';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Trend Types ───────────────────────────────────────────────────
export type TrendDirection = 'up' | 'down' | 'neutral';

export interface Trend {
  direction: TrendDirection;
  percentage: number;
  value?: string;
}

// ─── Sparkline Data Point ──────────────────────────────────────────
export interface SparklinePoint {
  value: number;
  label?: string;
}

// ─── Component Props ───────────────────────────────────────────────
export interface MetricDisplayProps {
  /** Label text */
  label: string;
  /** Metric value (formatted number as string) */
  value: string;
  /** Currency symbol */
  currency?: string;
  /** Trend data */
  trend?: Trend;
  /** Number format type */
  format?: 'number' | 'currency' | 'percentage';
  /** Decimal places */
  decimals?: number;
  /** Show sparkline */
  sparkline?: SparklinePoint[];
  /** Sparkline color */
  sparklineColor?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

// ─── Trend Icons ───────────────────────────────────────────────────
const TrendUpIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#FF5C73' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const TrendNeutralIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#888888' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ─── Sparkline Component ───────────────────────────────────────────
interface SparklineProps {
  data: SparklinePoint[];
  color?: string;
  width?: number;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#0FB0CE',
  width = 80,
  height = 32,
}) => {
  if (!data || data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  // Create area fill path
  const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaD} fill={`url(#sparkline-gradient-${color.replace('#', '')})`} />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width}
        cy={height - ((values[values.length - 1] - min) / range) * (height - 4) - 2}
        r="3"
        fill={color}
      />
    </svg>
  );
};

// ─── Size Styles ───────────────────────────────────────────────────
const sizeStyles = {
  sm: {
    label: 'text-xs',
    value: 'text-xl',
    trend: 'text-[10px]',
    icon: 12,
    gap: 'gap-1',
  },
  md: {
    label: 'text-sm',
    value: 'text-2xl',
    trend: 'text-xs',
    icon: 14,
    gap: 'gap-1.5',
  },
  lg: {
    label: 'text-base',
    value: 'text-3xl',
    trend: 'text-sm',
    icon: 16,
    gap: 'gap-2',
  },
};

// ─── Component ─────────────────────────────────────────────────────
export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  currency = '฿',
  trend,
  format = 'currency',
  decimals = 2,
  sparkline,
  sparklineColor,
  size = 'md',
  className = '',
}) => {
  const sizeStyle = sizeStyles[size];

  // Determine trend colors
  const getTrendColor = () => {
    if (!trend) return '#888888';
    switch (trend.direction) {
      case 'up':
        return '#4CAF50'; // Green for positive
      case 'down':
        return '#FF5C73'; // Red for negative (but we prefer amber in calm finance)
      default:
        return '#888888';
    }
  };

  const trendColor = getTrendColor();

  // Format the display value
  const formatValue = () => {
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(numValue)) return value;

    switch (format) {
      case 'currency':
        return `${currency}${numValue.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
      case 'percentage':
        return `${numValue.toFixed(decimals)}%`;
      default:
        return numValue.toLocaleString('th-TH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
  };

  // Determine sparkline color based on trend
  const resolvedSparklineColor = sparklineColor || trendColor;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Label */}
      <span className={`${sizeStyle.label} text-[#888888] uppercase tracking-wider mb-1`}>
        {label}
      </span>

      {/* Value and Trend Row */}
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-3">
          {/* Value */}
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: toSeconds(motionTokens.duration.quick), ease: easing.tight }}
            className={`
              ${sizeStyle.value}
              font-bold text-white
              tabular-nums
            `}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatValue()}
          </motion.span>

          {/* Trend Indicator */}
          {trend && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: toSeconds(motionTokens.duration.quick), ease: easing.tight }}
              className={`
                flex items-center ${sizeStyle.gap}
                ${sizeStyle.trend}
                font-medium
                mb-1
              `}
              style={{ color: trendColor }}
            >
              {trend.direction === 'up' && <TrendUpIcon size={sizeStyle.icon} color={trendColor} />}
              {trend.direction === 'down' && <TrendDownIcon size={sizeStyle.icon} color={trendColor} />}
              {trend.direction === 'neutral' && <TrendNeutralIcon size={sizeStyle.icon} color={trendColor} />}
              <span>
                {trend.percentage > 0 && '+'}
                {trend.percentage.toFixed(1)}%
              </span>
              {trend.value && (
                <span className="text-[#888888] ml-1">
                  ({trend.value})
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Sparkline */}
        {sparkline && sparkline.length > 1 && (
          <Sparkline
            data={sparkline}
            color={resolvedSparklineColor}
            width={size === 'sm' ? 48 : size === 'md' ? 64 : 80}
            height={size === 'sm' ? 20 : size === 'md' ? 28 : 36}
          />
        )}
      </div>
    </div>
  );
};

// ─── Metric Card Variant ───────────────────────────────────────────
export interface MetricCardProps extends MetricDisplayProps {
  /** Card padding */
  padding?: 'sm' | 'md' | 'lg';
  /** Show border */
  showBorder?: boolean;
  /** Border color (defaults to trend color) */
  borderColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  padding = 'md',
  showBorder = false,
  borderColor,
  className = '',
  trend,
  ...props
}) => {
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const resolvedBorderColor = borderColor || (trend ? (trend.direction === 'up' ? '#4CAF50' : trend.direction === 'down' ? '#FF5C73' : '#2A2A2A') : '#2A2A2A');

  return (
    <div
      className={`
        bg-[#1A1A1A] rounded-2xl
        ${paddingStyles[padding]}
        ${showBorder ? 'border' : ''}
        transition-all duration-200
        ${className}
      `}
      style={showBorder ? { borderColor: resolvedBorderColor, borderWidth: 1 } : undefined}
    >
      <MetricDisplay {...props} trend={trend} />
    </div>
  );
};

// ─── Metric Grid ───────────────────────────────────────────────────
export interface MetricGridProps {
  metrics: MetricDisplayProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  metrics,
  columns = 2,
  className = '',
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: toSeconds(motionTokens.duration.quick), 
            ease: easing.tight,
            delay: index * 0.05,
          }}
        >
          <MetricDisplay {...metric} />
        </motion.div>
      ))}
    </div>
  );
};

// ─── Exports ──────────────────────────────────────────────────────
export default MetricDisplay;
