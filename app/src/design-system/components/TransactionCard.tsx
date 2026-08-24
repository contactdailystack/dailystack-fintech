/**
 * ============================================================
 * DailyStack Design System — TransactionCard Component v1.0
 * ============================================================
 * Premium transaction card with TeslaCard wrapper and breathe animation
 * 
 * Design Philosophy:
 * - Color-coded (income=green, expense=default)
 * - Tap to expand with emotion indicator
 * - TeslaCard wrapper with breathe animation
 * - Tabular figures for amounts
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeslaCard } from './TeslaCard';
import { hapticPresets } from '../haptic-tokens';
import { semantic, text, border } from '../color-tokens';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Emotion Types ────────────────────────────────────────────────
export type EmotionType = 'joy' | 'value' | 'stress' | 'impulse' | 'social' | 'investment' | 'neutral';

export interface Transaction {
  id: string;
  /** Merchant/Recipient name */
  merchant: string;
  /** Category name */
  category?: string;
  /** Transaction amount (positive for income, negative for expense) */
  amount: number;
  /** Currency symbol */
  currency?: string;
  /** Date string */
  date: string;
  /** Time string */
  time?: string;
  /** Status */
  status?: 'completed' | 'pending' | 'failed';
  /** Category icon */
  icon?: React.ElementType;
  /** Icon background color */
  iconColor?: string;
  /** Emotion type for transactions */
  emotion?: EmotionType;
  /** Notes or description */
  note?: string;
}

// ─── Component Props ───────────────────────────────────────────────
export interface TransactionCardProps {
  /** Transaction data */
  transaction: Transaction;
  /** Expand on tap */
  onTap?: (transaction: Transaction) => void;
  /** Show emotion indicator */
  showEmotion?: boolean;
  /** Breathe animation */
  breathe?: boolean;
  /** Custom className */
  className?: string;
}

// ─── Emotion Colors (SSOT: No Emoji) ───────────────────────────────────────────────
const emotionColors: Record<EmotionType, { bg: string; text: string; icon: string }> = {
  // SSOT v4.3: Absolute Emoji Ban — use [Icon: Name] format or SVG
  joy: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', icon: 'Sparkles' },
  value: { bg: 'rgba(86, 190, 137, 0.15)', text: '#56be89', icon: 'Star' },
  stress: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', icon: 'AlertTriangle' },
  impulse: { bg: 'rgba(249, 115, 22, 0.15)', text: '#F97316', icon: 'Zap' },
  social: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', icon: 'Users' },
  investment: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', icon: 'TrendingUp' },
  neutral: { bg: 'rgba(255, 255, 255, 0.05)', text: '#888888', icon: 'Minus' },
};

// ─── Emotion Icons (no emoji) ─────────────────────────────────────
const EmotionIcon: React.FC<{ emotion: EmotionType; size?: number }> = ({ emotion, size = 16 }) => {
  const icons: Record<EmotionType, React.ReactNode> = {
    joy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    value: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    stress: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    impulse: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    social: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    investment: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    neutral: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  };
  return <>{icons[emotion]}</>;
};

// ─── Component ─────────────────────────────────────────────────────
export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onTap,
  showEmotion = false,
  breathe = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    merchant,
    category,
    amount,
    currency = '฿',
    date,
    time,
    status = 'completed',
    icon: Icon,
    iconColor = '#56be89',
    emotion = 'neutral',
    note,
  } = transaction;

  const isExpense = amount < 0;
  const isPending = status === 'pending';
  const isFailed = status === 'failed';
  const emotionStyle = emotionColors[emotion];

  // Format amount with tabular figures
  const formatAmount = (val: number) => {
    const absVal = Math.abs(val);
    return `${currency}${absVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleTap = () => {
    if (onTap) {
      // Fire haptic for card expansion
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const preset = hapticPresets.THUD;
        const pattern = [
          Math.round(preset.time * preset.sharpness * 0.3),
          Math.round(preset.intensity * 255),
        ];
        navigator.vibrate(pattern);
      }
      onTap(transaction);
    }
    
    // Expand/collapse if showEmotion is enabled
    if (showEmotion) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <TeslaCard
      variant={breathe ? 'glow' : 'default'}
      breathe={breathe}
      onClick={handleTap}
      className={`
        ${isPending ? 'opacity-70' : ''}
        ${isFailed ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {/* Main Content */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          {Icon ? (
            <Icon className="w-6 h-6" style={{ color: iconColor }} />
          ) : (
            <span className="text-lg font-bold" style={{ color: iconColor }}>
              {merchant.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate font-sans">
                {merchant}
              </h3>
              {category && (
                <p className="text-xs text-[#888888] mt-0.5">
                  {category}
                </p>
              )}
            </div>
            
            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <span
                className={`
                  font-bold tabular-nums
                  ${isExpense ? 'text-white' : 'text-[#4CAF50]'}
                `}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {isExpense ? '-' : '+'}{formatAmount(amount)}
              </span>
              <p className="text-xs text-[#666666] mt-0.5">
                {time || date}
              </p>
            </div>
          </div>

          {/* Status badges */}
          {(isPending || isFailed) && (
            <div className="flex items-center gap-2 mt-2">
              {isPending && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(255,87,51,0.15)] text-[#FF5733]">
                  Pending
                </span>
              )}
              {isFailed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(255,92,115,0.15)] text-[#FF5C73]">
                  Failed
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Emotion Indicator & Expanded Content */}
      <AnimatePresence>
        {showEmotion && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: toSeconds(motionTokens.duration.quick), ease: easing.tight }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-[#2A2A2A]">
              {/* Emotion Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: emotionStyle.bg,
                    color: emotionStyle.text,
                  }}
                >
                  <EmotionIcon emotion={emotion} size={12} />
                  <span className="capitalize">{emotion}</span>
                </span>
              </div>

              {/* Note */}
              {note && (
                <p className="text-sm text-[#888888]">{note}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TeslaCard>
  );
};

// ─── Transaction Card Grid ─────────────────────────────────────────
export interface TransactionCardGridProps {
  transactions: Transaction[];
  onTransactionTap?: (transaction: Transaction) => void;
  showEmotion?: boolean;
  className?: string;
}

export const TransactionCardGrid: React.FC<TransactionCardGridProps> = ({
  transactions,
  onTransactionTap,
  showEmotion = false,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    {transactions.map((transaction, index) => (
      <motion.div
        key={transaction.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: toSeconds(motionTokens.duration.quick), 
          ease: easing.tight,
          delay: index * 0.05,
        }}
      >
        <TransactionCard
          transaction={transaction}
          onTap={onTransactionTap}
          showEmotion={showEmotion}
        />
      </motion.div>
    ))}
  </div>
);

// ─── Exports ──────────────────────────────────────────────────────
export default TransactionCard;
