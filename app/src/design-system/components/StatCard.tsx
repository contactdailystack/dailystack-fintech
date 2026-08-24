/**
 * ============================================================
 * DailyStack Design System — StatCard Component v1.0 (E-Pay Style)
 * ============================================================
 * Compact stat display card for E-Pay mobile interface
 * 
 * Design Philosophy:
 * - Minimal design with large numbers
 * - E-Pay lime for positive values
 * - Orange for negative/warning values
 * - Subtle card backgrounds
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface StatCardProps {
  /** Main stat value */
  value: string | number;
  /** Stat label */
  label: string;
  /** Change value (optional) */
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  /** Icon component (optional) */
  icon?: React.ElementType;
  /** Icon color */
  iconColor?: string;
  /** Variant */
  variant?: 'default' | 'compact' | 'highlight';
  /** Click handler */
  onClick?: () => void;
  /** Animation delay */
  delay?: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  change,
  icon: Icon,
  iconColor = '#56be89',
  variant = 'default',
  onClick,
  delay = 0,
  className = '',
}) => {
  const isCompact = variant === 'compact';
  const isHighlight = variant === 'highlight';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden
        rounded-2xl p-4
        ${isHighlight
          ? 'bg-[rgba(205,255,36,0.1)] border border-[rgba(205,255,36,0.3)]'
          : 'bg-[#1A1A1A] border border-[#2A2A2A]'
        }
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-200
        hover:border-[rgba(205,255,36,0.2)]
        ${className}
      `}
    >
      {/* Background Glow for Highlight */}
      {isHighlight && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(205,255,36,0.3) 0%, transparent 60%)',
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-2">
          {/* Icon */}
          {Icon && (
            <div
              className="
                w-10 h-10 rounded-xl
                flex items-center justify-center
                bg-[rgba(205,255,36,0.1)]
              "
            >
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
          )}

          {/* Change Badge */}
          {change && (
            <div
              className={`
                flex items-center gap-1 px-2 py-1
                rounded-full text-xs font-medium
                ${
                  change.type === 'increase'
                    ? 'bg-[rgba(76,175,80,0.15)] text-[#4CAF50]'
                    : change.type === 'decrease'
                    ? 'bg-[rgba(255,87,51,0.15)] text-[#FF5733]'
                    : 'bg-[rgba(136,136,136,0.15)] text-[#888888]'
                }
              `
              }
            >
              <span>
                {change.type === 'increase' ? '↑' : change.type === 'decrease' ? '↓' : '→'}
              </span>
              <span>{change.value}</span>
              {change.period && (
                <span className="text-[10px] opacity-70">{change.period}</span>
              )}
            </div>
          )}
        </div>

        {/* Value */}
        <div
          className={`
            font-bold text-white mb-1
            ${isCompact ? 'text-2xl' : 'text-3xl'}
          `}
          style={{ fontFamily: 'var(--font-display, "Inter", sans-serif)' }}
        >
          {value}
        </div>

        {/* Label */}
        <div className="text-sm text-[#888888]">
          {label}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Stat Card Grid ────────────────────────────────────────────────
export interface StatCardGridProps {
  stats: StatCardProps[];
  columns?: 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  stats,
  columns = 2,
  gap = 'md',
  className = '',
}) => {
  const gapStyles = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };

  const colStyles = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
  };

  return (
    <div
      className={`
        grid ${colStyles[columns]} ${gapStyles[gap]}
        ${className}
      `}
    >
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
};

// ─── Mini Stat (inline) ─────────────────────────────────────────────
export interface MiniStatProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const MiniStat: React.FC<MiniStatProps> = ({
  value,
  label,
  trend,
  className = '',
}) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <span className="text-lg font-bold text-white">{value}</span>
    {trend && (
      <span
        className={`
          text-sm
          ${trend === 'up' ? 'text-[#4CAF50]' : trend === 'down' ? 'text-[#FF5733]' : 'text-[#888888]'}
        `}
      >
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
      </span>
    )}
    <span className="text-xs text-[#666666]">{label}</span>
  </div>
);

export default StatCard;
