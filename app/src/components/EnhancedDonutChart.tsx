/**
 * ============================================================
 * DailyStack — Enhanced DonutChart v2.0
 * ============================================================
 * Sprint 4: UX Excellence - Multi-Segment Spending Visualization
 * 
 * Research-based enhancements (Cash App, Revolut, Binance style):
 * - Multi-segment donut for category breakdown
 * - Tap-to-reveal exact amounts
 * - Animated transitions between segments
 * - Trend indicators
 * - Haptic feedback on interactions
 * - Thai language support
 */

import { memo, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { haptics } from '../services/hapticService';
import { colorTokens } from '../design-system/color-tokens';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DonutSegment {
  /** Segment label */
  label: string;
  /** Segment value (percentage, 0-100) */
  value: number;
  /** Segment color */
  color: string;
  /** Optional: absolute amount */
  amount?: number;
  /** Optional: trend percentage */
  trend?: number;
}

export interface EnhancedDonutChartProps {
  /** Chart segments data */
  segments: DonutSegment[];
  /** Total amount for center display */
  total?: number;
  /** Currency code */
  currency?: 'THB' | 'USD' | 'EUR';
  /** Chart size */
  size?: number;
  /** Track (background) color */
  trackColor?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Show center text */
  showCenter?: boolean;
  /** Center label */
  centerLabel?: string;
  /** Selected segment index */
  selectedIndex?: number;
  /** On segment click */
  onSegmentClick?: (index: number, segment: DonutSegment) => void;
  /** Enable tap-to-reveal */
  enableTapReveal?: boolean;
  /** Language */
  lang?: 'th' | 'en';
  /** Animation duration in ms */
  duration?: number;
  /** Class name */
  className?: string;
}

// ─── Category Colors (based on design tokens) ────────────────────────────────

const categoryColors = [
  '#56be89', // Lime - Primary
  '#FF6B6B', // Coral - Food
  '#4ECDC4', // Teal - Transport
  '#FFE66D', // Yellow - Shopping
  '#95E1D3', // Mint - Bills
  '#F38181', // Salmon - Entertainment
  '#AA96DA', // Purple - Health
  '#6C5CE7', // Indigo - Education
  '#00B894', // Green - Savings
  '#FDCB6E', // Gold - Other
];

// ─── Currency Formatter ────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: 'THB' | 'USD' | 'EUR' = 'THB', locale: string = 'th-TH'): string {
  const symbol = currency === 'THB' ? '฿' : currency === 'USD' ? '$' : '€';
  return `${symbol}${amount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Single Segment Component ──────────────────────────────────────────────

interface SegmentArcProps {
  segment: DonutSegment;
  startAngle: number;
  endAngle: number;
  radius: number;
  center: number;
  strokeWidth: number;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const SegmentArc = memo(function SegmentArc({
  segment,
  startAngle,
  endAngle,
  radius,
  center,
  strokeWidth,
  isSelected,
  onClick,
  index,
}: SegmentArcProps) {
  const circumference = 2 * Math.PI * radius;
  
  // Calculate arc length and offset
  const arcLength = ((endAngle - startAngle) / 360) * circumference;
  const arcOffset = (startAngle / 360) * circumference;

  // For gaps between segments (leave 2% gap)
  const gap = 0.02 * circumference;
  const adjustedLength = Math.max(arcLength - gap, 0);

  return (
    <motion.circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={segment.color}
      strokeWidth={isSelected ? strokeWidth + 4 : strokeWidth}
      strokeLinecap="round"
      strokeDasharray={`${adjustedLength} ${circumference}`}
      strokeDashoffset={-arcOffset}
      style={{
        transformOrigin: 'center',
        filter: isSelected ? `drop-shadow(0 0 8px ${segment.color})` : undefined,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        strokeWidth: isSelected ? strokeWidth + 4 : strokeWidth,
      }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
      aria-label={`${segment.label}: ${segment.value}%`}
    />
  );
});

// ─── Tooltip Component ─────────────────────────────────────────────────────

interface TooltipProps {
  segment: DonutSegment;
  position: { x: number; y: number };
  currency: 'THB' | 'USD' | 'EUR';
  lang: 'th' | 'en';
}

const Tooltip = memo(function Tooltip({ segment, position, currency, lang }: TooltipProps) {
  const locale = lang === 'th' ? 'th-TH' : 'en-US';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute pointer-events-none z-10 px-3 py-2 rounded-xl shadow-lg"
      style={{
        backgroundColor: colorTokens.background.card,
        border: `1px solid ${segment.color}40`,
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: segment.color }}
        />
        <span 
          className="text-xs font-semibold"
          style={{ color: colorTokens.text.primary }}
        >
          {segment.label}
        </span>
      </div>
      <div className="text-sm font-bold" style={{ color: colorTokens.text.primary }}>
        {segment.amount !== undefined 
          ? formatCurrency(segment.amount, currency, locale)
          : `${segment.value.toFixed(1)}%`}
      </div>
      {segment.trend !== undefined && (
        <div 
          className="text-[10px] mt-0.5"
          style={{ 
            color: segment.trend >= 0 
              ? colorTokens.semantic.success 
              : colorTokens.error.DEFAULT 
          }}
        >
          {segment.trend >= 0 ? '↑' : '↓'} {Math.abs(segment.trend).toFixed(1)}%
        </div>
      )}
    </motion.div>
  );
});

// ─── Enhanced Donut Chart ─────────────────────────────────────────────────

export default function EnhancedDonutChart({
  segments,
  total = 100,
  currency = 'THB',
  size = 180,
  trackColor = colorTokens.border.subtle,
  strokeWidth = 16,
  showCenter = true,
  centerLabel,
  selectedIndex,
  onSegmentClick,
  enableTapReveal = true,
  lang = 'th',
  duration = 800,
  className = '',
}: EnhancedDonutChartProps) {
  const [activeTooltip, setActiveTooltip] = useState<{ index: number; position: { x: number; y: number } } | null>(null);
  const [internalSelected, setInternalSelected] = useState<number | null>(null);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const locale = lang === 'th' ? 'th-TH' : 'en-US';

  // Calculate segment angles
  const segmentAngles = useMemo(() => {
    let currentAngle = -90; // Start from top
    return segments.map((segment) => {
      const startAngle = currentAngle;
      const angle = (segment.value / 100) * 360;
      currentAngle += angle;
      return {
        ...segment,
        startAngle,
        endAngle: currentAngle,
      };
    });
  }, [segments]);

  // Handle segment click
  const handleSegmentClick = useCallback((index: number, segment: DonutSegment) => {
    haptics.fire('THUD');
    
    if (enableTapReveal) {
      setInternalSelected((prev) => (prev === index ? null : index));
    }
    
    onSegmentClick?.(index, segment);
  }, [enableTapReveal, onSegmentClick]);

  // Get active segment for center display
  const activeSegment = internalSelected !== null ? segments[internalSelected] : null;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
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

        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Segment Arcs */}
        {segmentAngles.map((segment, index) => (
          <SegmentArc
            key={segment.label}
            segment={segment}
            startAngle={segment.startAngle}
            endAngle={segment.endAngle}
            radius={radius}
            center={center}
            strokeWidth={strokeWidth}
            isSelected={internalSelected === index}
            onClick={() => handleSegmentClick(index, segment)}
            index={index}
          />
        ))}
      </svg>

      {/* Center Content */}
      {showCenter && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {activeSegment ? (
              <motion.div
                key={activeSegment.label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <span 
                  className="text-[10px] uppercase tracking-wider block mb-0.5"
                  style={{ color: colorTokens.text.muted }}
                >
                  {activeSegment.label}
                </span>
                <span 
                  className="text-lg font-black"
                  style={{ 
                    color: activeSegment.color,
                    fontFamily: lang === 'th' ? 'Kanit, sans-serif' : 'Inter, sans-serif',
                  }}
                >
                  {activeSegment.amount !== undefined 
                    ? formatCurrency(activeSegment.amount, currency, locale)
                    : `${activeSegment.value.toFixed(0)}%`}
                </span>
                {activeSegment.trend !== undefined && (
                  <span 
                    className="text-[10px] block mt-0.5"
                    style={{ 
                      color: activeSegment.trend >= 0 
                        ? colorTokens.semantic.success 
                        : colorTokens.error.DEFAULT 
                    }}
                  >
                    {activeSegment.trend >= 0 ? '↑' : '↓'} {Math.abs(activeSegment.trend).toFixed(1)}%
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="total"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                {centerLabel && (
                  <span 
                    className="text-[10px] uppercase tracking-wider block mb-0.5"
                    style={{ color: colorTokens.text.muted }}
                  >
                    {centerLabel}
                  </span>
                )}
                <span 
                  className="text-lg font-black"
                  style={{ 
                    color: colorTokens.text.primary,
                    fontFamily: lang === 'th' ? 'Kanit, sans-serif' : 'Inter, sans-serif',
                  }}
                >
                  {total !== undefined && total !== 100
                    ? formatCurrency(total, currency, locale)
                    : `${segments.length} categories`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {activeTooltip && (
          <Tooltip
            segment={segments[activeTooltip.index]}
            position={activeTooltip.position}
            currency={currency}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Category Legend ───────────────────────────────────────────────────────

export interface DonutLegendProps {
  segments: DonutSegment[];
  currency?: 'THB' | 'USD' | 'EUR';
  onSegmentHover?: (index: number | null) => void;
  onSegmentClick?: (index: number) => void;
  lang?: 'th' | 'en';
  className?: string;
}

export function DonutLegend({
  segments,
  currency = 'THB',
  onSegmentHover,
  onSegmentClick,
  lang = 'th',
  className = '',
}: DonutLegendProps) {
  const locale = lang === 'th' ? 'th-TH' : 'en-US';

  return (
    <div className={`space-y-2 ${className}`}>
      {segments.map((segment, index) => (
        <motion.button
          key={segment.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => {
            haptics.fire('CRISP_CLICK');
            onSegmentClick?.(index);
          }}
          onMouseEnter={() => onSegmentHover?.(index)}
          onMouseLeave={() => onSegmentHover?.(null)}
          className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span 
              className="text-xs font-medium"
              style={{ color: colorTokens.text.primary }}
            >
              {segment.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-semibold tabular-nums"
              style={{ color: colorTokens.text.primary }}
            >
              {segment.amount !== undefined 
                ? formatCurrency(segment.amount, currency, locale)
                : `${segment.value.toFixed(1)}%`}
            </span>
            {segment.trend !== undefined && (
              <span 
                className="text-[10px]"
                style={{ 
                  color: segment.trend >= 0 
                    ? colorTokens.semantic.success 
                    : colorTokens.error.DEFAULT 
                }}
              >
                {segment.trend >= 0 ? '↑' : '↓'}
              </span>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Quick Category Segments Factory ──────────────────────────────────────

export function createCategorySegments(
  categories: Array<{ name: string; amount: number; color?: string }>,
  total: number
): DonutSegment[] {
  return categories.map((cat, index) => ({
    label: cat.name,
    value: total > 0 ? (cat.amount / total) * 100 : 0,
    color: cat.color || categoryColors[index % categoryColors.length],
    amount: cat.amount,
  }));
}
