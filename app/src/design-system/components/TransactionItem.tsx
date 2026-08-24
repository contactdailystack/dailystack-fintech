/**
 * ============================================================
 * DailyStack Design System — TransactionItem Component v1.0 (E-Pay Style)
 * ============================================================
 * Transaction list item for E-Pay mobile interface
 * 
 * Design Philosophy:
 * - Clean horizontal layout
 * - Category icon with colored background
 * - Amount with color coding (green/red)
 * - Subtle dividers between items
 */

import React from 'react';
import { motion } from 'framer-motion';

// Simplified Transaction interface for display purposes
// Use the full Transaction type from '../../types' for data operations
export interface TransactionDisplayItem {
  id: string;
  /** Merchant/Recipient name */
  title: string;
  /** Category or description */
  category?: string;
  /** Transaction amount (positive for income, negative for expense) */
  amount: number;
  /** Currency symbol */
  currency?: string;
  /** Date or time */
  date?: string;
  /** Status */
  status?: 'completed' | 'pending' | 'failed';
  /** Category icon */
  icon?: React.ElementType;
  /** Icon background color */
  iconColor?: string;
}

export interface TransactionItemProps {
  transaction: TransactionDisplayItem;
  onClick?: (transaction: TransactionDisplayItem) => void;
  showDivider?: boolean;
  className?: string;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onClick,
  showDivider = true,
  className = '',
}) => {
  const {
    title,
    category,
    amount,
    currency = '฿',
    date,
    status = 'completed',
    icon: Icon,
    iconColor = '#0FB0CE',
  } = transaction;

  const isExpense = amount < 0;
  const isPending = status === 'pending';
  const isFailed = status === 'failed';

  const formatAmount = (val: number) => {
    const absVal = Math.abs(val);
    return `${currency}${absVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        onClick={() => onClick?.(transaction)}
        className={`
          flex items-center gap-3 p-3
          ${onClick ? 'cursor-pointer' : ''}
          ${isPending ? 'opacity-60' : ''}
          ${isFailed ? 'opacity-50' : ''}
          transition-colors duration-200
          hover:bg-[rgba(15, 176, 206,0.03)]
          ${className}
        `}
      >
        {/* Icon */}
        <div
          className="
            w-12 h-12 rounded-xl
            flex items-center justify-center
            flex-shrink-0
          "
          style={{
            backgroundColor: `${iconColor}15`,
          }}
        >
          {Icon ? (
            <Icon
              className="w-6 h-6"
              style={{ color: iconColor }}
            />
          ) : (
            <span
              className="text-lg font-bold"
              style={{ color: iconColor }}
            >
              {title.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white font-medium truncate">
              {title}
            </span>
            <span
              className={`
                font-bold flex-shrink-0
                ${isExpense ? 'text-white' : 'text-[#4CAF50]'}
                ${isPending ? 'opacity-50' : ''}
              `}
            >
              {isExpense ? '-' : '+'}{formatAmount(amount)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <div className="flex items-center gap-2">
              {category && (
                <span className="text-xs text-[#666666]">
                  {category}
                </span>
              )}
              {isPending && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(255,87,51,0.15)] text-[#FF5733]">
                  Pending
                </span>
              )}
              {isFailed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(255,87,51,0.15)] text-[#FF5733]">
                  Failed
                </span>
              )}
            </div>
            {date && (
              <span className="text-xs text-[#666666] flex-shrink-0">
                {date}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        {onClick && (
          <svg
            className="w-5 h-5 text-[#666666] flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </motion.div>

      {/* Divider */}
      {showDivider && (
        <div className="h-px bg-[#2A2A2A] ml-[72px]" />
      )}
    </>
  );
};

// ─── Transaction List ───────────────────────────────────────────────
export interface TransactionListProps {
  transactions: TransactionDisplayItem[];
  onTransactionClick?: (transaction: TransactionDisplayItem) => void;
  showHeader?: boolean;
  title?: string;
  className?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionClick,
  showHeader = false,
  title,
  className = '',
}) => (
  <div className={`${className}`}>
    {showHeader && title && (
      <div className="px-3 pb-2">
        <h3 className="text-sm font-semibold text-[#888888]">
          {title}
        </h3>
      </div>
    )}
    <div className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] overflow-hidden">
      {transactions.map((transaction, index) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onClick={onTransactionClick}
          showDivider={index < transactions.length - 1}
        />
      ))}
    </div>
  </div>
);

// ─── Compact Transaction Item (for inline display) ──────────────────
export interface CompactTransactionItemProps {
  transaction: TransactionDisplayItem;
  className?: string;
}

export const CompactTransactionItem: React.FC<CompactTransactionItemProps> = ({
  transaction,
  className = '',
}) => {
  const { title, amount, currency = '฿' } = transaction;
  const isExpense = amount < 0;

  const formatAmount = (val: number) => {
    const absVal = Math.abs(val);
    return `${currency}${absVal.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-sm text-white truncate">{title}</span>
      <span
        className={`text-sm font-medium ${isExpense ? 'text-white' : 'text-[#4CAF50]'}`}
      >
        {isExpense ? '-' : '+'}{formatAmount(amount)}
      </span>
    </div>
  );
};

export default TransactionItem;
