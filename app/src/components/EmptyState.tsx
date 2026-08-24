/**
 * ============================================================
 * DailyStack — EmptyState Component (App-level, i18n)
 * ============================================================
 * Consistent empty state with CTAs.
 * Follows Apple's empty state guidelines.
 * Call-to-action button to resolve the empty state.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, TrendingUp, CreditCard, RefreshCw, Inbox } from 'lucide-react';

// ─── Design Tokens ───────────────────────────────────────────────
const LIME = '#0FB0CE';
const MUTED = '#888888';
const BG = '#1A1A1A';
const BORDER = '#2A2A2A';

// ─── Empty State Variant ─────────────────────────────────────────
export type EmptyStateVariant =
  | 'no-data' | 'no-results' | 'error'
  | 'transactions' | 'subscriptions' | 'cards'
  | 'goals' | 'insights' | 'custom';

// ─── Props ───────────────────────────────────────────────────────
export interface EmptyStateProps {
  /** Icon component or preset name */
  icon?: React.ElementType | string;
  /** Icon color */
  iconColor?: string;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** CTA action label */
  actionLabel?: string;
  /** CTA handler */
  onAction?: () => void;
  /** Secondary action label */
  secondaryActionLabel?: string;
  secondaryActionOnClick?: () => void;
  /** Variant */
  variant?: EmptyStateVariant;
  className?: string;
}

// ─── Illustrations ───────────────────────────────────────────────
const WalletIllustration: React.FC = () => (
  <motion.svg viewBox="0 0 120 120" className="w-full h-full">
    <motion.rect x="20" y="35" width="80" height="55" rx="8" fill={BG} stroke={MUTED} strokeWidth="2" initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} />
    <motion.path d="M20 45 L20 35 Q20 30 25 30 L95 30 Q100 30 100 35 L100 45" fill={BG} stroke={MUTED} strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
    <motion.rect x="30" y="50" width="25" height="18" rx="3" fill="transparent" stroke={MUTED} strokeWidth="1.5" strokeDasharray="3 3" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
    <motion.rect x="30" y="72" width="25" height="18" rx="3" fill="transparent" stroke={MUTED} strokeWidth="1.5" strokeDasharray="3 3" animate={{ opacity: [0.6, 0.3, 0.6] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
    <motion.circle cx="85" cy="62" r="15" fill="transparent" stroke={LIME} strokeWidth="2" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} />
    <motion.text x="85" y="67" textAnchor="middle" fill={LIME} fontSize="18" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>+</motion.text>
  </motion.svg>
);

const TransactionIllustration: React.FC = () => (
  <motion.svg viewBox="0 0 120 120" className="w-full h-full">
    <motion.circle cx="60" cy="60" r="45" fill={BG} stroke={BORDER} strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
    <motion.rect x="40" y="35" width="40" height="50" rx="4" fill={BG} stroke={MUTED} strokeWidth="1.5" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} />
    <motion.line x1="48" y1="45" x2="72" y2="45" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 }} />
    <motion.line x1="48" y1="52" x2="65" y2="52" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.25 }} />
    <motion.line x1="48" y1="59" x2="68" y2="59" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 }} />
    <motion.rect x="48" y="70" width="20" height="8" rx="2" fill={LIME} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }} />
    <motion.circle cx="90" cy="40" r="12" fill={LIME} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }} />
    <motion.line x1="90" y1="35" x2="90" y2="45" stroke="#050D1F" strokeWidth="2" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
    <motion.line x1="85" y1="40" x2="95" y2="40" stroke="#050D1F" strokeWidth="2" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
  </motion.svg>
);

const SubscriptionIllustration: React.FC = () => (
  <motion.svg viewBox="0 0 120 120" className="w-full h-full">
    <motion.rect x="25" y="30" width="70" height="65" rx="6" fill={BG} stroke={MUTED} strokeWidth="1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
    <motion.rect x="25" y="30" width="70" height="20" rx="6" fill={MUTED} initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} />
    {[0, 1, 2].map(i => (
      <motion.circle key={i} cx={45 + i * 15} cy="40" r="3" fill="#050D1F" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.1 }} />
    ))}
    {[0, 1, 2].map(i => (
      <motion.rect key={i} x="35" y={55 + i * 12} width="50" height="10" rx="3" fill={BG} stroke={i === 0 ? LIME : MUTED} strokeWidth="1.5" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.1, type: 'spring' }} />
    ))}
    <motion.circle cx="95" cy="85" r="10" fill={LIME} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} />
    <motion.text x="95" y="89" textAnchor="middle" fill="#050D1F" fontSize="12" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>?</motion.text>
  </motion.svg>
);

const CardIllustration: React.FC = () => (
  <motion.svg viewBox="0 0 120 120" className="w-full h-full">
    {[2, 1, 0].map(i => (
      <motion.rect key={i} x={30 + i * 5} y={35 + i * 5} width="60" height="40" rx="6" fill={BG} stroke={i === 0 ? LIME : MUTED} strokeWidth="2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 - i * 0.2, y: 0 }} transition={{ delay: i * 0.1 }} />
    ))}
    <motion.rect x="40" y="45" width="12" height="10" rx="2" fill={LIME} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
    <motion.circle cx="85" cy="70" r="15" fill={LIME} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: 'spring' }} />
    <motion.line x1="85" y1="63" x2="85" y2="77" stroke="#050D1F" strokeWidth="2.5" strokeLinecap="round" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5 }} />
    <motion.line x1="78" y1="70" x2="92" y2="70" stroke="#050D1F" strokeWidth="2.5" strokeLinecap="round" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />
  </motion.svg>
);

const GoalIllustration: React.FC = () => (
  <motion.svg viewBox="0 0 120 120" className="w-full h-full">
    {[0, 1, 2, 3].map(i => (
      <motion.circle key={i} cx="60" cy="55" r={45 - i * 10} fill="transparent" stroke={i === 0 ? LIME : MUTED} strokeWidth="2" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 - i * 0.2 }} transition={{ delay: i * 0.1 }} />
    ))}
    <motion.line x1="60" y1="55" x2="85" y2="30" stroke={LIME} strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
    <motion.polygon points="90,25 95,35 85,35" fill={LIME} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
    <motion.circle cx="60" cy="55" r="8" fill={LIME} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} />
  </motion.svg>
);

const InsightsIllustration: React.FC = () => (
  <motion.svg viewBox="0 0 120 120" className="w-full h-full">
    <motion.rect x="25" y="30" width="70" height="60" rx="6" fill={BG} stroke={MUTED} strokeWidth="1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
    {[30, 45, 35, 55, 40, 50].map((h, i) => (
      <motion.rect key={i} x={32 + i * 10} y={90 - h} width="7" height={h} fill={i === 4 ? LIME : MUTED} rx="2" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.1 + i * 0.05, originY: 1 }} />
    ))}
    <motion.circle cx="95" cy="30" r="15" fill={LIME} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }} />
    <motion.path d="M95 22 L95 26 M91 28 L91 32 M99 28 L99 32 M93 35 L93 38 M97 35 L97 38" stroke="#050D1F" strokeWidth="2" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
  </motion.svg>
);

const SearchIllustration: React.FC = () => (
  <motion.svg viewBox="0 0 120 120" className="w-full h-full">
    <motion.circle cx="55" cy="50" r="30" fill={BG} stroke={MUTED} strokeWidth="3" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />
    <motion.line x1="75" y1="70" x2="95" y2="90" stroke={MUTED} strokeWidth="4" strokeLinecap="round" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.2 }} style={{ originY: 0 }} />
    <motion.text x="55" y="58" textAnchor="middle" fill={MUTED} fontSize="32" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>?</motion.text>
    {[0, 1, 2].map(i => (
      <motion.line key={i} x1="40" y1={100 + i * 5} x2="70" y2={100 + i * 5} stroke={MUTED} strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 0.5, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }} />
    ))}
  </motion.svg>
);

const ErrorIllustration: React.FC = () => (
  <motion.svg viewBox="0 0 120 120" className="w-full h-full">
    <motion.path d="M60 25 L95 90 L25 90 Z" fill={BG} stroke="#F97316" strokeWidth="3" strokeLinejoin="round" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} />
    <motion.line x1="60" y1="45" x2="60" y2="70" stroke="#F97316" strokeWidth="4" strokeLinecap="round" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.2 }} style={{ originY: 0 }} />
    <motion.circle cx="60" cy="80" r="4" fill="#F97316" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} />
    <motion.circle cx="95" cy="35" r="12" fill={LIME} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, type: 'spring' }} />
    <motion.path d="M95 28 L98 32 L92 32" stroke="#050D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
  </motion.svg>
);

const illustrationMap: Record<EmptyStateVariant, React.FC> = {
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

// ─── Icon Presets ────────────────────────────────────────────────
const IconPresets: Record<string, React.FC<{ size?: number; color?: string }>> = {
  Inbox: ({ size = 64, color = MUTED }) => <Inbox size={size} color={color} />,
  Search: ({ size = 64, color = MUTED }) => <Search size={size} color={color} />,
  FileText: ({ size = 64, color = MUTED }) => <FileText size={size} color={color} />,
  TrendingUp: ({ size = 64, color = MUTED }) => <TrendingUp size={size} color={color} />,
  CreditCard: ({ size = 64, color = MUTED }) => <CreditCard size={size} color={color} />,
  RefreshCw: ({ size = 64, color = MUTED }) => <RefreshCw size={size} color={color} />,
  Plus: ({ size = 64, color = MUTED }) => <Plus size={size} color={color} />,
};

const variantIconColors: Record<EmptyStateVariant, string> = {
  'transactions': LIME,
  'subscriptions': LIME,
  'cards': LIME,
  'goals': LIME,
  'insights': LIME,
  'no-data': MUTED,
  'no-results': MUTED,
  'error': '#FF5C73',
  'custom': MUTED,
};

// ─── Component ───────────────────────────────────────────────────
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconColor,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  secondaryActionOnClick,
  variant = 'no-data',
  className = '',
}) => {
  const isCustomIllustration = !icon && illustrationMap[variant];

  const renderContent = () => {
    if (icon) {
      if (typeof icon === 'string') {
        const PresetIcon = IconPresets[icon] || IconPresets.Inbox;
        return <PresetIcon size={64} color={iconColor || variantIconColors[variant]} />;
      }
      const CustomIcon = icon;
      return <CustomIcon className="w-16 h-16" style={{ color: iconColor || variantIconColors[variant] }} />;
    }
    const Illustration = illustrationMap[variant];
    return <Illustration />;
  };

  const resolvedColor = iconColor || variantIconColors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center text-center px-6 py-8 ${className}`}
    >
      {/* Illustration / Icon */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`${isCustomIllustration ? 'w-[120px] h-[120px]' : 'w-16 h-16'} mb-6`}
        style={{ color: resolvedColor }}
      >
        {renderContent()}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-white mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-2 w-full max-w-[240px]"
        >
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-[#101010] bg-[#0FB0CE] hover:bg-[#3FC4DB] active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Plus size={16} />
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && secondaryActionOnClick && (
            <button
              onClick={secondaryActionOnClick}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-transparent hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              {secondaryActionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// ─── Preset Empty States ─────────────────────────────────────────
interface PresetEmptyProps {
  onAction?: () => void;
  className?: string;
}

export const NoTransactionsEmpty: React.FC<PresetEmptyProps> = ({ onAction, className }) => (
  <EmptyState
    variant="transactions"
    title="No transactions yet"
    description="Start tracking your spending by adding your first transaction"
    actionLabel="Add Transaction"
    onAction={onAction}
    className={className}
  />
);

export const NoSubscriptionsEmpty: React.FC<PresetEmptyProps> = ({ onAction, className }) => (
  <EmptyState
    variant="subscriptions"
    title="No subscriptions"
    description="Add your recurring subscriptions to track your monthly spending"
    actionLabel="Add Subscription"
    onAction={onAction}
    className={className}
  />
);

export const NoGoalsEmpty: React.FC<PresetEmptyProps> = ({ onAction, className }) => (
  <EmptyState
    variant="goals"
    title="No goals yet"
    description="Set financial goals to track your progress and stay motivated"
    actionLabel="Create Goal"
    onAction={onAction}
    className={className}
  />
);

export const NoResultsEmpty: React.FC<PresetEmptyProps> = ({ onAction, className }) => (
  <EmptyState
    variant="no-results"
    title="No results found"
    description="Try adjusting your search or filters"
    actionLabel="Clear Filters"
    onAction={onAction}
    className={className}
  />
);

export const ErrorEmpty: React.FC<PresetEmptyProps & { error?: string; onRetry?: () => void }> = ({ onRetry, error, className }) => (
  <EmptyState
    variant="error"
    title="Oops! Something went wrong"
    description={error ?? 'Something went wrong. Please try again.'}
    actionLabel="Try Again"
    onAction={onRetry}
    className={className}
  />
);

export const EmptyWallet: React.FC<PresetEmptyProps> = ({ onAction, className }) => (
  <EmptyState
    variant="no-data"
    title="No wallets connected"
    description="Connect your bank account or e-wallet to automatically track transactions"
    actionLabel="Connect Wallet"
    onAction={onAction}
    className={className}
  />
);

export const NoCardsEmpty: React.FC<PresetEmptyProps> = ({ onAction, className }) => (
  <EmptyState
    variant="cards"
    title="No cards yet"
    description="Create your first virtual card to start tracking spending"
    actionLabel="Create Card"
    onAction={onAction}
    className={className}
  />
);

export const NoInsightsEmpty: React.FC<PresetEmptyProps> = ({ onAction, className }) => (
  <EmptyState
    variant="insights"
    title="No insights available"
    description="Add more transactions to unlock personalized insights"
    actionLabel="Add Transaction"
    onAction={onAction}
    className={className}
  />
);

export default EmptyState;
