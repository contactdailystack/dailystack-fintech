/**
 * ============================================================
 * DailyStack Design System — BottomNav Component v3.0
 * ============================================================
 * Premium Floating Bottom Navigation (PicksWise Style)
 * 
 * Design Philosophy:
 * - Apple HIG compliant (44x44pt touch targets)
 * - Premium Glassmorphism with soft blur
 * - Floating design with layered shadow
 * - Lime accent (#56be89) for active state
 * - Safe area aware for all iPhone models
 * - Light & Dark mode support
 * 
 * v3.0 Changes:
 * - Glassmorphism background with blur
 * - Premium floating shadow
 * - Active pill indicator with lime glow
 * - Smoother spring animations
 * - Better visual hierarchy
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../../data/translations';

// --- Design Tokens -----------------------------------------------------------
const NAV_TOKENS = {
  // Height
  height: 56,
  iconSize: 24,
  labelSize: 10,
  
  // Colors - Dark Mode
  dark: {
    background: 'rgba(11, 15, 10, 0.85)',
    backdropBlur: 20,
    border: 'rgba(255, 255, 255, 0.08)',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
    activePill: 'rgba(86, 190, 137, 0.15)',
    activePillBorder: '#56be89',
    activeGlow: '0 0 16px rgba(86, 190, 137, 0.3)',
    iconActive: '#56be89',
    iconInactive: '#6B7280',
    labelActive: '#56be89',
    labelInactive: '#6B7280',
  },
  
  // Colors - Light Mode
  light: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropBlur: 20,
    border: 'rgba(0, 0, 0, 0.08)',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.05)',
    activePill: 'rgba(86, 190, 137, 0.2)',
    activePillBorder: '#94B800',
    activeGlow: '0 0 16px rgba(86, 190, 137, 0.25)',
    iconActive: '#94B800',
    iconInactive: '#9CA3AF',
    labelActive: '#94B800',
    labelInactive: '#9CA3AF',
  },
  
  // Spacing
  spacing: {
    horizontal: 8,
    tabGap: 4,
    iconLabelGap: 4,
  },
  
  // Animation
  spring: {
    stiffness: 400,
    damping: 30,
  },
} as const;

// --- Nav Item Types ----------------------------------------------------------
export interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

export interface BottomNavProps {
  items: NavItem[];
  activeId?: string;
  onItemClick?: (item: NavItem) => void;
  className?: string;
  lang?: Language;
}

// --- Theme Hook -------------------------------------------------------------
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return isDark;
}

// --- Main Component ----------------------------------------------------------
const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeId,
  onItemClick,
  className = '',
  lang = 'en',
}) => {
  const isDark = useDarkMode();
  const tokens = isDark ? NAV_TOKENS.dark : NAV_TOKENS.light;
  
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Floating Glass Container */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 30,
          delay: 0.1 
        }}
        className="relative mx-4 mb-2 rounded-2xl overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 430,
          backgroundColor: tokens.background,
          backdropFilter: `blur(${tokens.backdropBlur}px)`,
          WebkitBackdropFilter: `blur(${tokens.backdropBlur}px)`,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadow,
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        }}
      >
        {/* Tab Bar */}
        <div
          className="flex items-stretch justify-around h-[56px]"
          role="tablist"
        >
          {items.map((item, index) => (
            <NavTab
              key={item.id}
              item={item}
              isActive={item.id === activeId}
              onClick={() => onItemClick?.(item)}
              tokens={tokens}
              index={index}
              totalItems={items.length}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// --- Nav Tab Component --------------------------------------------------------
interface NavTabProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  tokens: typeof NAV_TOKENS.dark | typeof NAV_TOKENS.light;
  index: number;
  totalItems: number;
}

const NavTab: React.FC<NavTabProps> = ({
  item,
  isActive,
  onClick,
  tokens,
  index,
  totalItems,
}) => {
  const Icon = item.icon;
  const [isPressed, setIsPressed] = useState(false);
  
  // Determine if this is the center item (for visual balance)
  const isCenter = index === Math.floor(totalItems / 2);
  
  return (
    <motion.button
      role="tab"
      aria-selected={isActive}
      aria-label={item.label}
      onClick={onClick}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      whileTap={{ scale: 0.92 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30 
      }}
      className="relative flex flex-col items-center justify-center cursor-pointer"
      style={{
        flex: 1,
        minHeight: 44,
        minWidth: 44,
        background: 'none',
        border: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      {/* Active Indicator Pill */}
      {isActive && (
        <motion.div
          layoutId="activeTabPill"
          className="absolute inset-x-2 inset-y-2 rounded-xl"
          style={{
            backgroundColor: tokens.activePill,
            border: `1.5px solid ${tokens.activePillBorder}`,
            boxShadow: tokens.activeGlow,
          }}
          transition={{
            type: 'spring',
            stiffness: NAV_TOKENS.spring.stiffness,
            damping: NAV_TOKENS.spring.damping,
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Icon */}
        <motion.div
          animate={{
            scale: isActive ? 1.1 : 1,
            y: isActive ? -2 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        >
          <Icon
            strokeWidth={2}
            style={{
              width: NAV_TOKENS.iconSize,
              height: NAV_TOKENS.iconSize,
              color: isActive ? tokens.iconActive : tokens.iconInactive,
              marginBottom: NAV_TOKENS.spacing.iconLabelGap,
              transition: 'color 0.2s ease',
              filter: isActive 
                ? `drop-shadow(0 0 6px ${tokens.iconActive}40)` 
                : 'none',
            }}
          />
        </motion.div>
        
        {/* Label */}
        <span
          style={{
            fontSize: NAV_TOKENS.labelSize,
            fontWeight: isActive ? 600 : 500,
            color: isActive ? tokens.labelActive : tokens.labelInactive,
            lineHeight: 1,
            transition: 'color 0.2s ease, font-weight 0.2s ease',
            letterSpacing: 0.2,
          }}
        >
          {item.label}
        </span>
      </div>
      
      {/* Badge */}
      {item.badge !== undefined && item.badge > 0 && (
        <span
          className="absolute top-1 right-2 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full"
          style={{
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
          }}
        >
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </motion.button>
  );
};

// --- Compact Version (without FAB space) -------------------------------------
export interface CompactBottomNavProps extends BottomNavProps {}

export const CompactBottomNav: React.FC<CompactBottomNavProps> = (props) => {
  return <BottomNav {...props} />;
};

// --- Exports ----------------------------------------------------------------
export default BottomNav;
