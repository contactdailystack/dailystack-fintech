/**
 * ============================================================
 * DailyStack — Bottom Navigation v25.0 (Rocket Money Clone)
 * ============================================================
 * Bottom Navigation following Rocket Money IA:
 * [Home] [Recurring] [Budget] [Profile]
 *
 * v25.0 Changes (RM Clone):
 * - 4-tab model matching Rocket Money navigation
 * - Net Worth + Transactions moved into Home dashboard
 * - Navy brand (--brand-primary #001C5A) active state
 */

import React from 'react';
import {
  Home,
  Repeat,
  PieChart,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { haptics } from '../services/hapticService';
import { Language } from '../data/translations';

// ─── Design Tokens (PicksWise Design Law — CSS Variables) ───────────────────
const NAV_TOKENS = {
  // Dimensions (iOS Standard)
  height: 50,
  iconSize: 24,
  labelSize: 12,
  
  // Animation
  spring: {
    stiffness: 400,
    damping: 30,
  },
  
  // Colors via CSS Variables (Light Mode Production Default)
  colors: {
    background: 'var(--tab-bar-bg, var(--bg-page))',
    border: 'var(--border-default)',
    activeIcon: 'var(--brand-primary)',
    activeLabel: 'var(--brand-primary)',
    activeIndicator: 'var(--brand-primary)',
    activeBg: 'var(--brand-primary-muted)',
    inactiveIcon: 'var(--tab-bar-inactive)',
    inactiveLabel: 'var(--tab-bar-inactive)',
    shadow: 'var(--shadow-sm)',
  },
} as const;

// ─── Tab Config ─────────────────────────────────────────────────────────────
export interface TabConfig {
  id: string;
  icon: React.ElementType;
  labelEn: string;
  labelTh: string;
}

export const NAV_TABS: readonly TabConfig[] = [
  { id: 'dashboard', icon: Home, labelEn: 'Home', labelTh: 'หน้าแรก' },
  { id: 'subscriptions', icon: Repeat, labelEn: 'Recurring', labelTh: 'รายจ่ายประจำ' },
  { id: 'budget', icon: PieChart, labelEn: 'Budget', labelTh: 'งบประมาณ' },
  { id: 'settings', icon: User, labelEn: 'Profile', labelTh: 'โปรไฟล์' },
] as const;

// ─── Props ──────────────────────────────────────────────────────────────────
export interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  lang: Language;
  className?: string;
  userAvatar?: string | null;
  userInitials?: string;
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function FloatingBottomNav({
  currentTab,
  onNavigate,
  lang,
  className = '',
  userAvatar = null,
  userInitials = 'U',
}: BottomNavProps) {
  const tokens = NAV_TOKENS.colors;
  
  return (
    <div
      id="bottom-navigation-container"
      className={`fixed bottom-0 left-0 right-0 z-40 flex justify-center items-end ${className}`}
    >
      {/* Bottom Navigation Bar - White Background per Design Law */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        role="navigation"
        aria-label="Main navigation"
        className="relative w-full"
        style={{
          backgroundColor: tokens.background,
          borderTop: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadow,
        }}
      >
        {/* Tab Bar Content */}
        <div
          className="flex items-stretch justify-between"
          style={{ height: NAV_TOKENS.height }}
        >
          {NAV_TABS.map((tab) => (
            <NavTab
              key={tab.id}
              tab={tab}
              isActive={currentTab === tab.id}
              onClick={() => {
                haptics.fire('SELECT');
                onNavigate(tab.id);
              }}
              tokens={tokens}
              lang={lang}
              userAvatar={tab.id === 'settings' ? userAvatar : null}
              userInitials={userInitials}
              isProfile={tab.id === 'settings'}
            />
          ))}
        </div>
        
        {/* Safe Area Bottom */}
        <div 
          style={{ 
            height: 'env(safe-area-inset-bottom, 0px)',
            backgroundColor: tokens.background,
          }} 
        />
      </motion.div>
    </div>
  );
}

// ─── Nav Tab Component ───────────────────────────────────────────────────────
interface NavTabProps {
  tab: TabConfig;
  isActive: boolean;
  onClick: () => void;
  tokens: typeof NAV_TOKENS.colors;
  lang: Language;
  userAvatar?: string | null;
  userInitials?: string;
  isProfile?: boolean;
}

function NavTab({
  tab,
  isActive,
  onClick,
  tokens,
  lang,
  userAvatar,
  userInitials,
  isProfile = false,
}: NavTabProps) {
  const Icon = tab.icon;
  const label = lang === 'th' ? tab.labelTh : tab.labelEn;
  
  return (
    <motion.button
      role="tab"
      aria-selected={isActive}
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.95, opacity: 0.7 }}
      transition={{
        duration: 0.1,
      }}
      className="relative flex flex-col items-center justify-center cursor-pointer"
      style={{
        flex: 1,
        height: '100%',
        minHeight: 44, // Apple HIG: 44x44pt minimum touch target
        background: isActive ? tokens.activeBg : 'transparent',
        border: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        paddingTop: 6,
      }}
    >
      {/* Active Indicator - CI Green Dot above icon */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute"
          style={{
            top: 6,
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: tokens.activeIndicator,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
      
      {/* Icon or Avatar */}
      {isProfile ? (
        <motion.div
          className="relative flex items-center justify-center rounded-full overflow-hidden"
          animate={{
            scale: isActive ? 1.05 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          style={{
            width: NAV_TOKENS.iconSize,
            height: NAV_TOKENS.iconSize,
            marginBottom: 2,
          }}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={label}
              className="w-full h-full object-cover"
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center rounded-full"
              style={{
                backgroundColor: isActive
                  ? `${tokens.activeIcon}20`
                  : 'rgba(142, 142, 147, 0.12)',
                fontSize: 10,
                fontWeight: 600,
                color: isActive ? tokens.activeIcon : tokens.inactiveIcon,
              }}
            >
              {userInitials || 'U'}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          animate={{
            scale: isActive ? 1.05 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          style={{
            marginBottom: 2,
          }}
        >
          <Icon
            strokeWidth={isActive ? 2.5 : 2}
            style={{
              width: NAV_TOKENS.iconSize,
              height: NAV_TOKENS.iconSize,
              color: isActive ? tokens.activeIcon : tokens.inactiveIcon,
              transition: 'color 0.15s ease',
            }}
          />
        </motion.div>
      )}
      
      {/* Label - per Design Law */}
      <span
        style={{
          fontSize: NAV_TOKENS.labelSize,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? tokens.activeLabel : tokens.inactiveLabel,
          lineHeight: 1,
          letterSpacing: 0,
          transition: 'color 0.15s ease, font-weight 0.15s ease',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
        }}
      >
        {label}
      </span>
    </motion.button>
  );
}
