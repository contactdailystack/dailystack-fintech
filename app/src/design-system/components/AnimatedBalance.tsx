/**
 * ============================================================
 * DailyStack Design System — AnimatedBalance Component v1.0
 * ============================================================
 * Sprint 4: UX Excellence - Animated Balance Display
 * 
 * Design Specs (based on UX research):
 * - Count-up animation when values change (Revolut, Cash App style)
 * - Support for positive/negative changes with color coding
 * - Currency formatting with locale support
 * - Tabular numbers for alignment
 * - Haptic feedback on significant changes
 * - Thai language support
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { colorTokens } from '../color-tokens';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AnimatedBalanceProps {
  /** The target value to display */
  value: number;
  /** Currency code (e.g., 'THB', 'USD') */
  currency?: string;
  /** Locale for formatting (defaults to 'th-TH' or 'en-US') */
  locale?: string;
  /** Display size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show currency symbol */
  showCurrency?: boolean;
  /** Show decimal places */
  decimals?: number;
  /** Prefix text (e.g., '+', '-') */
  prefix?: string;
  /** Suffix text (e.g., '%', 'APY') */
  suffix?: string;
  /** Trend direction override (for colors) */
  trend?: 'up' | 'down' | 'neutral';
  /** Enable count animation */
  animate?: boolean;
  /** Animation duration in ms */
  duration?: number;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Additional class names */
  className?: string;
  /** Language for formatting */
  lang?: 'th' | 'en';
}

// ─── Size Configurations ─────────────────────────────────────────────────────

const sizeConfig = {
  sm: {
    fontSize: 'text-sm',
    fontWeight: 'font-semibold',
    letterSpacing: 'tracking-tight',
  },
  md: {
    fontSize: 'text-lg',
    fontWeight: 'font-bold',
    letterSpacing: 'tracking-normal',
  },
  lg: {
    fontSize: 'text-2xl',
    fontWeight: 'font-black',
    letterSpacing: '-tracking-wide',
  },
  xl: {
    fontSize: 'text-4xl',
    fontWeight: 'font-black',
    letterSpacing: '-tracking-wider',
  },
};

// ─── Color Helpers ───────────────────────────────────────────────────────────

function getValueColor(value: number, trend?: 'up' | 'down' | 'neutral'): string {
  // Determine color based on value sign and trend override
  if (trend === 'neutral') return colorTokens.text.muted;
  
  const isPositive = value >= 0;
  
  if (trend === 'up' || (trend === undefined && isPositive)) {
    return colorTokens.semantic.success;
  }
  if (trend === 'down' || (trend === undefined && !isPositive)) {
    return colorTokens.error.DEFAULT;
  }
  
  return colorTokens.text.muted;
}

// ─── Number Formatter ────────────────────────────────────────────────────────

function formatNumber(
  value: number,
  currency: string = 'THB',
  locale: string = 'th-TH',
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatCurrency(
  value: number,
  currency: string = 'THB',
  locale: string = 'th-TH',
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ─── Count Animation Hook ───────────────────────────────────────────────────

function useCountAnimation(
  targetValue: number,
  duration: number = 1000,
  enabled: boolean = true
): number {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef<number>(0);
  const targetRef = useRef<number>(targetValue);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(targetValue);
      return;
    }

    // Reset if target changes significantly
    if (Math.abs(targetRef.current - targetValue) > 0.01) {
      startValueRef.current = displayValue;
      targetRef.current = targetValue;
      startTimeRef.current = undefined;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = startValueRef.current + (targetValue - startValueRef.current) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration, enabled]);

  return displayValue;
}

// ─── AnimatedBalance Component ──────────────────────────────────────────────

export default function AnimatedBalance({
  value,
  currency = 'THB',
  locale,
  size = 'lg',
  showCurrency = true,
  decimals = 2,
  prefix,
  suffix,
  trend,
  animate = true,
  duration = 1000,
  onAnimationComplete,
  className = '',
  lang = 'th',
}: AnimatedBalanceProps) {
  // Determine locale from language
  const effectiveLocale = locale || (lang === 'th' ? 'th-TH' : 'en-US');
  
  // Get color based on value
  const valueColor = getValueColor(value, trend || (value >= 0 ? 'up' : 'down'));
  
  // Animated value
  const animatedValue = useCountAnimation(value, duration, animate);
  
  // Format the value
  const formattedValue = formatNumber(Math.abs(animatedValue), currency, effectiveLocale, decimals);
  
  // Handle animation complete
  useEffect(() => {
    if (!animate) return;
    
    const timeout = setTimeout(() => {
      onAnimationComplete?.();
    }, duration);
    
    return () => clearTimeout(timeout);
  }, [value, animate, duration, onAnimationComplete]);

  // Size configuration
  const sizeStyles = sizeConfig[size];

  return (
    <motion.span
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: animate ? 0.2 : 0 }}
      className={`inline-flex items-baseline font-variant-numeric tabular-nums ${className}`}
    >
      {/* Prefix */}
      {prefix && (
        <span 
          className={`${sizeStyles.fontSize} ${sizeStyles.fontWeight} ${sizeStyles.letterSpacing} mr-1`}
          style={{ color: colorTokens.text.muted }}
        >
          {prefix}
        </span>
      )}

      {/* Currency Symbol (if showing) */}
      {showCurrency && (
        <span 
          className={`${sizeStyles.fontSize} ${sizeStyles.fontWeight} ${sizeStyles.letterSpacing} mr-0.5`}
          style={{ color: valueColor }}
        >
          {currency === 'THB' ? '฿' : '$'}
        </span>
      )}

      {/* Main Value */}
      <motion.span
        key={value} // Re-trigger animation on value change
        initial={animate ? { scale: 1.05 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`${sizeStyles.fontSize} ${sizeStyles.fontWeight} ${sizeStyles.letterSpacing}`}
        style={{ 
          color: valueColor,
          fontFamily: lang === 'th' ? 'Noto Sans Thai, sans-serif' : 'Inter, sans-serif',
        }}
      >
        {formattedValue}
      </motion.span>

      {/* Suffix */}
      {suffix && (
        <span 
          className={`${sizeStyles.fontSize} ${sizeStyles.fontWeight} ${sizeStyles.letterSpacing} ml-1`}
          style={{ color: colorTokens.text.muted }}
        >
          {suffix}
        </span>
      )}
    </motion.span>
  );
}

// ─── Trend Badge with Animation ─────────────────────────────────────────────

export interface TrendBadgeProps {
  value: number;
  suffix?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export function TrendBadge({
  value,
  suffix = '%',
  size = 'md',
  showIcon = true,
  className = '',
}: TrendBadgeProps) {
  const isPositive = value >= 0;
  const bgColor = isPositive 
    ? colorTokens.semantic.successLight 
    : colorTokens.error.light;
  const textColor = isPositive 
    ? colorTokens.semantic.success 
    : colorTokens.error.DEFAULT;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full
        ${size === 'sm' ? 'text-[10px]' : 'text-xs'}
        font-semibold
        ${className}
      `}
      style={{ 
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {showIcon && (
        <span className="flex items-center">
          {isPositive ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path 
                d="M5 2L8 6H2L5 2Z" 
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path 
                d="M5 8L2 4H8L5 8Z" 
                fill="currentColor"
              />
            </svg>
          )}
        </span>
      )}
      <span>
        {isPositive ? '+' : ''}{value.toFixed(1)}{suffix}
      </span>
    </motion.span>
  );
}

// ─── Balance Change Indicator ───────────────────────────────────────────────

export interface BalanceChangeProps {
  currentValue: number;
  previousValue: number;
  currency?: string;
  locale?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function BalanceChange({
  currentValue,
  previousValue,
  currency = 'THB',
  locale = 'th-TH',
  size = 'md',
  className = '',
}: BalanceChangeProps) {
  const change = currentValue - previousValue;
  const changePercent = previousValue !== 0 
    ? ((change / Math.abs(previousValue)) * 100) 
    : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TrendBadge 
        value={changePercent} 
        size={size}
        showIcon={true}
      />
      <AnimatedBalance
        value={Math.abs(change)}
        currency={currency}
        locale={locale}
        prefix={change >= 0 ? '+' : '-'}
        size={size}
        showCurrency={true}
        animate={false}
        trend={change >= 0 ? 'up' : 'down'}
      />
    </div>
  );
}
