/**
 * DailyStack — StatsCard Component
 * Phase 3: Scalable Architecture
 * 
 * Premium statistics card with:
 * - Animated number counter
 * - Icon + label
 * - Subtle gradient background
 * - Hover effects
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  suffix = '',
  trend,
  color = '#D9FD82',
  delay = 0,
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(typeof value === 'number' ? 0 : value);
  
  // Animate number count-up
  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }
    
    const duration = 1000;
    const steps = 30;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(stepValue * currentStep));
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [value]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative p-4 bg-[#18181B] rounded-2xl border border-[#27272a] overflow-hidden group"
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}10, transparent)`,
        }}
      />
      
      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          {/* Label */}
          <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
          
          {/* Value */}
          <div className="flex items-baseline gap-1">
            <span 
              className="text-2xl font-bold text-white"
              style={{ color: typeof value === 'number' ? color : undefined }}
            >
              {displayValue}
            </span>
            {suffix && (
              <span className="text-white/40 text-sm">{suffix}</span>
            )}
          </div>
          
          {/* Trend */}
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${
              trend.isPositive ? 'text-[#D9FD82]' : 'text-red-500'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
};

// Variant with sparkline chart
export interface StatsCardWithChartProps extends StatsCardProps {
  chartData?: number[];
}

export const StatsCardWithChart: React.FC<StatsCardWithChartProps> = ({
  icon: Icon,
  label,
  value,
  suffix = '',
  trend,
  color = '#D9FD82',
  delay = 0,
  chartData = [],
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative p-4 bg-[#18181B] rounded-2xl border border-[#27272a] overflow-hidden group"
    >
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}10, transparent)`,
        }}
      />
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
              <span 
                className="text-2xl font-bold text-white"
                style={{ color: typeof value === 'number' ? color : undefined }}
              >
                {value}
              </span>
              {suffix && (
                <span className="text-white/40 text-sm">{suffix}</span>
              )}
            </div>
            {trend && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${
                trend.isPositive ? 'text-[#D9FD82]' : 'text-red-500'
              }`}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
        
        {/* Sparkline Chart */}
        {chartData.length > 0 && (
          <div className="h-12 flex items-end gap-1">
            {chartData.map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                transition={{ delay: delay * 0.1 + i * 0.05, duration: 0.3 }}
                className="flex-1 rounded-t"
                style={{ backgroundColor: color, opacity: 0.6 + (i / chartData.length) * 0.4 }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;