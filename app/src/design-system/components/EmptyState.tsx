/**
 * ============================================================
 * DailyStack Design System — EmptyState Component v2.0
 * ============================================================
 * Centered layout for empty states with icon, title, description, action
 * 
 * Design Philosophy:
 * - Custom illustrated SVGs with micro-animations
 * - Variants: no-data, no-results, error
 * - Optional action button
 * - Tesla/Apple-style minimal design
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ActionButton } from './ActionButton';
import { semantic, text, border } from '../color-tokens';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Design Tokens ──────────────────────────────────────────────────
const ACCENT = '#0FB0CE';
const MUTED = '#888888';
const BACKGROUND = '#1A1A1A';
const BORDER = '#2A2A2A';

// ─── Empty State Variants ─────────────────────────────────────────
export type EmptyStateVariant = 'no-data' | 'no-results' | 'error' | 'custom' | 'transactions' | 'subscriptions' | 'cards' | 'goals' | 'insights';

// ─── Custom Illustration Components (Animated SVGs) ─────────────────

/**
 * Wallet Illustration — Empty wallet state
 */
const WalletIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    viewBox="0 0 120 120"
    className={className}
    initial="hidden"
    animate="visible"
  >
    {/* Wallet body */}
    <motion.rect
      x="20" y="35" width="80" height="55" rx="8"
      fill={BACKGROUND}
      stroke={MUTED}
      strokeWidth="2"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
    />
    {/* Wallet flap */}
    <motion.path
      d="M20 45 L20 35 Q20 30 25 30 L95 30 Q100 30 100 35 L100 45"
      fill={BACKGROUND}
      stroke={MUTED}
      strokeWidth="2"
    />
    {/* Card slots */}
    <motion.rect
      x="30" y="50" width="25" height="18" rx="3"
      fill="transparent"
      stroke={MUTED}
      strokeWidth="1.5"
      strokeDasharray="3 3"
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.rect
      x="30" y="72" width="25" height="18" rx="3"
      fill="transparent"
      stroke={MUTED}
      strokeWidth="1.5"
      strokeDasharray="3 3"
      animate={{ opacity: [0.6, 0.3, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
    {/* Empty indicator */}
    <motion.circle
      cx="85" cy="62" r="15"
      fill="transparent"
      stroke={ACCENT}
      strokeWidth="2"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    />
    <motion.text
      x="85" y="67"
      textAnchor="middle"
      fill={ACCENT}
      fontSize="18"
      fontWeight="bold"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      +
    </motion.text>
  </motion.svg>
);

/**
 * Transaction Illustration — No transactions
 */
const TransactionIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    viewBox="0 0 120 120"
    className={className}
    initial="hidden"
    animate="visible"
  >
    {/* Background circle */}
    <motion.circle
      cx="60" cy="60" r="45"
      fill={BACKGROUND}
      stroke={BORDER}
      strokeWidth="2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
    {/* Receipt/document */}
    <motion.rect
      x="40" y="35" width="40" height="50" rx="4"
      fill={BACKGROUND}
      stroke={MUTED}
      strokeWidth="1.5"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
    />
    {/* Lines on receipt */}
    <motion.line x1="48" y1="45" x2="72" y2="45" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"
      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 }}
    />
    <motion.line x1="48" y1="52" x2="65" y2="52" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"
      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.25 }}
    />
    <motion.line x1="48" y1="59" x2="68" y2="59" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round"
      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 }}
    />
    {/* Accent amount */}
    <motion.rect
      x="48" y="70" width="20" height="8" rx="2"
      fill={ACCENT}
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ delay: 0.4, type: 'spring' }}
    />
    {/* Floating plus */}
    <motion.circle
      cx="90" cy="40" r="12"
      fill={ACCENT}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
    />
    <motion.line x1="90" y1="35" x2="90" y2="45" stroke="#050D1F" strokeWidth="2" strokeLinecap="round"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
    />
    <motion.line x1="85" y1="40" x2="95" y2="40" stroke="#050D1F" strokeWidth="2" strokeLinecap="round"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
    />
  </motion.svg>
);

/**
 * Subscription Illustration — No subscriptions
 */
const SubscriptionIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    viewBox="0 0 120 120"
    className={className}
    initial="hidden"
    animate="visible"
  >
    {/* Calendar base */}
    <motion.rect
      x="25" y="30" width="70" height="65" rx="6"
      fill={BACKGROUND}
      stroke={MUTED}
      strokeWidth="1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
    {/* Calendar header */}
    <motion.rect
      x="25" y="30" width="70" height="20" rx="6"
      fill={MUTED}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
    />
    {/* Calendar dots */}
    {[0, 1, 2].map(i => (
      <motion.circle
        key={i}
        cx={45 + i * 15} cy="40" r="3"
        fill="#050D1F"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 + i * 0.1 }}
      />
    ))}
    {/* Subscriptions (stacked cards) */}
    {[0, 1, 2].map(i => (
      <motion.rect
        key={i}
        x="35" y={55 + i * 12} width="50" height="10" rx="3"
        fill={BACKGROUND}
        stroke={i === 0 ? ACCENT : MUTED}
        strokeWidth="1.5"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
      />
    ))}
    {/* Pending indicator */}
    <motion.circle
      cx="95" cy="85" r="10"
      fill={ACCENT}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
    />
    <motion.text x="95" y="89" textAnchor="middle" fill="#050D1F" fontSize="12" fontWeight="bold"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
    >
      ?
    </motion.text>
  </motion.svg>
);

/**
 * Card Illustration — No cards
 */
const CardIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    viewBox="0 0 120 120"
    className={className}
    initial="hidden"
    animate="visible"
  >
    {/* Card stack */}
    {[2, 1, 0].map(i => (
      <motion.rect
        key={i}
        x={30 + i * 5} y={35 + i * 5} width="60" height="40" rx="6"
        fill={BACKGROUND}
        stroke={i === 0 ? ACCENT : MUTED}
        strokeWidth="2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1 - i * 0.2, y: 0 }}
        transition={{ delay: i * 0.1 }}
      />
    ))}
    {/* Chip on card */}
    <motion.rect
      x="40" y="45" width="12" height="10" rx="2"
      fill={ACCENT}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    />
    {/* Plus icon */}
    <motion.circle
      cx="85" cy="70" r="15"
      fill={ACCENT}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring' }}
    />
    <motion.line x1="85" y1="63" x2="85" y2="77" stroke="#050D1F" strokeWidth="2.5" strokeLinecap="round"
      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5 }}
    />
    <motion.line x1="78" y1="70" x2="92" y2="70" stroke="#050D1F" strokeWidth="2.5" strokeLinecap="round"
      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }}
    />
  </motion.svg>
);

/**
 * Goal Illustration — No goals
 */
const GoalIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    viewBox="0 0 120 120"
    className={className}
    initial="hidden"
    animate="visible"
  >
    {/* Target circles */}
    {[0, 1, 2, 3].map(i => (
      <motion.circle
        key={i}
        cx="60" cy="55" r={45 - i * 10}
        fill="transparent"
        stroke={i === 0 ? ACCENT : MUTED}
        strokeWidth="2"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 - i * 0.2 }}
        transition={{ delay: i * 0.1 }}
      />
    ))}
    {/* Arrow */}
    <motion.line
      x1="60" y1="55" x2="85" y2="30"
      stroke={ACCENT}
      strokeWidth="3"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    />
    <motion.polygon
      points="90,25 95,35 85,35"
      fill={ACCENT}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    />
    {/* Star at center */}
    <motion.circle
      cx="60" cy="55" r="8"
      fill={ACCENT}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
    />
  </motion.svg>
);

/**
 * Insights Illustration — No insights
 */
const InsightsIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    viewBox="0 0 120 120"
    className={className}
    initial="hidden"
    animate="visible"
  >
    {/* Chart background */}
    <motion.rect
      x="25" y="30" width="70" height="60" rx="6"
      fill={BACKGROUND}
      stroke={MUTED}
      strokeWidth="1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
    {/* Chart bars */}
    {[30, 45, 35, 55, 40, 50].map((h, i) => (
      <motion.rect
        key={i}
        x={32 + i * 10} y={90 - h} width="7" height={h}
        fill={i === 4 ? ACCENT : MUTED}
        rx="2"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.1 + i * 0.05, originY: 1 }}
      />
    ))}
    {/* Light bulb */}
    <motion.circle
      cx="95" cy="30" r="15"
      fill={ACCENT}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
    />
    <motion.path
      d="M95 22 L95 26 M91 28 L91 32 M99 28 L99 32 M93 35 L93 38 M97 35 L97 38"
      stroke="#050D1F"
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    />
  </motion.svg>
);

/**
 * Search Illustration — No results
 */
const SearchIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    viewBox="0 0 120 120"
    className={className}
    initial="hidden"
    animate="visible"
  >
    {/* Search circle */}
    <motion.circle
      cx="55" cy="50" r="30"
      fill={BACKGROUND}
      stroke={MUTED}
      strokeWidth="3"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    />
    {/* Search handle */}
    <motion.line
      x1="75" y1="70" x2="95" y2="90"
      stroke={MUTED}
      strokeWidth="4"
      strokeLinecap="round"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay: 0.2 }}
      style={{ originY: 0 }}
    />
    {/* Question mark */}
    <motion.text
      x="55" y="58"
      textAnchor="middle"
      fill={MUTED}
      fontSize="32"
      fontWeight="bold"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      ?
    </motion.text>
    {/* Dashed lines (no results) */}
    {[0, 1, 2].map(i => (
      <motion.line
        key={i}
        x1="40" y1={100 + i * 5} x2="70" y2={100 + i * 5}
        stroke={MUTED}
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0.5, x: 0 }}
        transition={{ delay: 0.4 + i * 0.1 }}
      />
    ))}
  </motion.svg>
);

/**
 * Error Illustration — Error state
 */
const ErrorIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    viewBox="0 0 120 120"
    className={className}
    initial="hidden"
    animate="visible"
  >
    {/* Warning triangle */}
    <motion.path
      d="M60 25 L95 90 L25 90 Z"
      fill={BACKGROUND}
      stroke="#F97316"
      strokeWidth="3"
      strokeLinejoin="round"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' }}
    />
    {/* Exclamation */}
    <motion.line x1="60" y1="45" x2="60" y2="70" stroke="#F97316" strokeWidth="4" strokeLinecap="round"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay: 0.2 }}
      style={{ originY: 0 }}
    />
    <motion.circle cx="60" cy="80" r="4" fill="#F97316"
      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
    />
    {/* Refresh button */}
    <motion.circle
      cx="95" cy="35" r="12"
      fill={ACCENT}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, type: 'spring' }}
    />
    <motion.path
      d="M95 28 L98 32 L92 32 M95 28 L92 32 L98 32"
      stroke="#050D1F"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={ACCENT}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    />
  </motion.svg>
);

// ─── Illustration Map ────────────────────────────────────────────────
const illustrationMap: Record<EmptyStateVariant, React.FC<{ className?: string }>> = {
  'transactions': TransactionIllustration,
  'subscriptions': SubscriptionIllustration,
  'cards': CardIllustration,
  'goals': GoalIllustration,
  'insights': InsightsIllustration,
  'no-data': WalletIllustration,
  'no-results': SearchIllustration,
  'error': ErrorIllustration,
  'custom': WalletIllustration,
};

// ─── Icon Components ───────────────────────────────────────────────
const Icons: Record<string, React.FC<{ className?: string; color?: string }>> = {
  Inbox: ({ className, color = '#888888' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  Search: ({ className, color = '#888888' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  AlertCircle: ({ className, color = '#FF5C73' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  FileText: ({ className, color = '#888888' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  TrendingUp: ({ className, color = '#888888' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  CreditCard: ({ className, color = '#888888' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Wallet: ({ className, color = '#888888' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  ),
  RefreshCw: ({ className, color = '#888888' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
};

// ─── Component Props ───────────────────────────────────────────────
export interface EmptyStateProps {
  /** Icon component or name */
  icon?: React.ElementType | string;
  /** Icon color */
  iconColor?: string;
  /** Icon size */
  iconSize?: number;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button text */
  actionLabel?: string;
  /** Action button onClick */
  onAction?: () => void;
  /** Action button variant */
  actionVariant?: 'primary' | 'secondary' | 'ghost';
  /** Secondary action */
  secondaryActionLabel?: string;
  secondaryActionOnClick?: () => void;
  /** Variant */
  variant?: EmptyStateVariant;
  /** Custom className */
  className?: string;
}

// ─── Variant Presets ───────────────────────────────────────────────
const variantPresets: Record<EmptyStateVariant, {
  icon: string;
  iconColor: string;
}> = {
  'no-data': {
    icon: 'Inbox',
    iconColor: '#888888',
  },
  'no-results': {
    icon: 'Search',
    iconColor: '#888888',
  },
  'error': {
    icon: 'AlertCircle',
    iconColor: '#FF5C73',
  },
  'custom': {
    icon: 'FileText',
    iconColor: '#888888',
  },
  'transactions': {
    icon: 'CreditCard',
    iconColor: '#0FB0CE',
  },
  'subscriptions': {
    icon: 'RefreshCw',
    iconColor: '#0FB0CE',
  },
  'cards': {
    icon: 'CreditCard',
    iconColor: '#0FB0CE',
  },
  'goals': {
    icon: 'TrendingUp',
    iconColor: '#0FB0CE',
  },
  'insights': {
    icon: 'TrendingUp',
    iconColor: '#0FB0CE',
  },
};

// ─── Component ─────────────────────────────────────────────────────
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconColor,
  iconSize = 120,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  secondaryActionLabel,
  secondaryActionOnClick,
  variant = 'no-data',
  className = '',
}) => {
  // Get illustration or icon
  const getIllustration = () => {
    // If custom icon provided, use it
    if (icon) {
      if (typeof icon === 'string') {
        const IconComponent = Icons[icon] || Icons.Inbox;
        return <IconComponent className="w-full h-full" color={iconColor || MUTED} />;
      }
      const CustomIcon = icon;
      return <CustomIcon className="w-full h-full" style={{ color: iconColor || MUTED }} />;
    }

    // Use illustration for supported variants
    const Illustration = illustrationMap[variant];
    return <Illustration className="w-full h-full" />;
  };

  const resolvedIconColor = iconColor || variantPresets[variant]?.iconColor || '#888888';
  const isCustomIllustration = !icon && illustrationMap[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: toSeconds(motionTokens.duration.normal), ease: easing.tight }}
      className={`
        flex flex-col items-center justify-center
        text-center
        px-6 py-8
        ${className}
      `}
    >
      {/* Illustration Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: toSeconds(motionTokens.duration.quick), 
          ease: easing.tight,
          delay: 0.1,
        }}
        className={`${isCustomIllustration ? 'w-[120px] h-[120px]' : 'w-16 h-16'} mb-6`}
        style={{ color: resolvedIconColor }}
      >
        {getIllustration()}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: toSeconds(motionTokens.duration.quick), 
          ease: easing.tight,
          delay: 0.2,
        }}
        className="text-lg font-semibold text-white mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: toSeconds(motionTokens.duration.quick), 
            ease: easing.tight,
            delay: 0.25,
          }}
          className="text-sm text-[#888888] max-w-xs mb-6"
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: toSeconds(motionTokens.duration.quick), 
            ease: easing.tight,
            delay: 0.3,
          }}
          className="flex flex-col gap-2 w-full max-w-[240px]"
        >
          {actionLabel && onAction && (
            <ActionButton
              variant={actionVariant}
              onClick={onAction}
              fullWidth
            >
              {actionLabel}
            </ActionButton>
          )}
          {secondaryActionLabel && secondaryActionOnClick && (
            <ActionButton
              variant="ghost"
              onClick={secondaryActionOnClick}
              fullWidth
            >
              {secondaryActionLabel}
            </ActionButton>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// ─── Preset Empty States ───────────────────────────────────────────
export interface PresetEmptyStateProps {
  onAction?: () => void;
  className?: string;
}

// No transactions
export const NoTransactionsEmpty: React.FC<PresetEmptyStateProps> = ({ onAction, className = '' }) => (
  <EmptyState
    variant="transactions"
    title="No transactions yet"
    description="Start tracking your spending by adding your first transaction"
    actionLabel="Add Transaction"
    onAction={onAction}
    className={className}
  />
);

// No subscriptions
export const NoSubscriptionsEmpty: React.FC<PresetEmptyStateProps> = ({ onAction, className = '' }) => (
  <EmptyState
    variant="subscriptions"
    title="No subscriptions"
    description="Add your recurring subscriptions to track your monthly spending"
    actionLabel="Add Subscription"
    onAction={onAction}
    className={className}
  />
);

// No goals
export const NoGoalsEmpty: React.FC<PresetEmptyStateProps> = ({ onAction, className = '' }) => (
  <EmptyState
    variant="goals"
    title="No goals yet"
    description="Set financial goals to track your progress and stay motivated"
    actionLabel="Create Goal"
    onAction={onAction}
    className={className}
  />
);

// No results (search)
export const NoResultsEmpty: React.FC<PresetEmptyStateProps> = ({ onAction, className = '' }) => (
  <EmptyState
    variant="no-results"
    title="No results found"
    description="Try adjusting your search or filters to find what you're looking for"
    actionLabel="Clear Filters"
    onAction={onAction}
    className={className}
  />
);

// Error state
export interface ErrorEmptyProps extends PresetEmptyStateProps {
  error?: string;
  onRetry?: () => void;
}

export const ErrorEmpty: React.FC<ErrorEmptyProps> = ({ 
  error = 'Something went wrong', 
  onRetry, 
  className = '' 
}) => (
  <EmptyState
    variant="error"
    title="Oops! Something went wrong"
    description={error}
    actionLabel="Try Again"
    onAction={onRetry}
    className={className}
  />
);

// Empty wallet
export const EmptyWallet: React.FC<PresetEmptyStateProps> = ({ onAction, className = '' }) => (
  <EmptyState
    variant="no-data"
    title="No wallets connected"
    description="Connect your bank account or e-wallet to automatically track transactions"
    actionLabel="Connect Wallet"
    onAction={onAction}
    className={className}
  />
);

// Empty documents
export const EmptyDocuments: React.FC<PresetEmptyStateProps> = ({ onAction, className = '' }) => (
  <EmptyState
    variant="no-data"
    icon="FileText"
    title="No documents"
    description="Upload receipts and invoices to keep your records organized"
    actionLabel="Upload Document"
    onAction={onAction}
    className={className}
  />
);

// Empty cards
export const NoCardsEmpty: React.FC<PresetEmptyStateProps> = ({ onAction, className = '' }) => (
  <EmptyState
    variant="cards"
    title="No cards yet"
    description="Create your first virtual card to start tracking spending"
    actionLabel="Create Card"
    onAction={onAction}
    className={className}
  />
);

// Empty insights
export const NoInsightsEmpty: React.FC<PresetEmptyStateProps> = ({ onAction, className = '' }) => (
  <EmptyState
    variant="insights"
    title="No insights available"
    description="Add more transactions to unlock personalized insights"
    actionLabel="Add Transaction"
    onAction={onAction}
    className={className}
  />
);

// ─── Exports ──────────────────────────────────────────────────────
export default EmptyState;
