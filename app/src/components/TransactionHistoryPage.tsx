/**
 * ============================================================
 * TransactionHistoryPage.tsx — E-Pay Style Redesign
 * ============================================================
 * Clean transaction history with E-Pay design patterns
 * 
 * Design Specs:
 * - Header with back arrow and More menu
 * - Filter dropdown
 * - Transaction list with merchant icon, name, date, amount
 * - Inter font, lime accents
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Send,
  ShoppingBag,
  CreditCard,
  Zap,
  Home,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { Transaction } from '../types';
import { Language, translations } from '../data/translations';
import SuccessGraphic from '../design-system/components/SuccessGraphic';
import { EmptyState } from '../design-system/components/EmptyState';

// ─── Types ─────────────────────────────────────────────────────────────────
interface TransactionHistoryPageProps {
  transactions: Transaction[];
  onBack?: () => void;
  onTransactionClick?: (transaction: Transaction) => void;
  onSuccessClose?: () => void;
  lang: Language;
}

// ─── Filter Options ──────────────────────────────────────────────────────────
type FilterOption = 'All' | 'Income' | 'Expense' | 'Transfer';

// ─── Category Icons Map ─────────────────────────────────────────────────────
const getCategoryIcon = (category: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('food') || cat.includes('dining') || cat.includes('restaurant')) return ShoppingBag;
  if (cat.includes('transport') || cat.includes('uber') || cat.includes('taxi')) return Zap;
  if (cat.includes('home') || cat.includes('rent') || cat.includes('utilities')) return Home;
  if (cat.includes('transfer') || cat.includes('send')) return Send;
  return CreditCard;
};

// ─── Filter Dropdown ─────────────────────────────────────────────────────────
const FilterDropdown: React.FC<{
  value: FilterOption;
  onChange: (v: FilterOption) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options: FilterOption[] = ['All', 'Income', 'Expense', 'Transfer'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
        style={{
          backgroundColor: '#1F2328',
          color: '#FFFFFF',
        }}
      >
        {value}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 py-2 rounded-xl shadow-xl z-50 min-w-[140px]"
            style={{
              backgroundColor: '#1F2328',
              border: '1px solid #2A2A2A',
            }}
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm transition-colors"
                style={{
                  backgroundColor: value === option ? 'rgba(15, 176, 206, 0.1)' : 'transparent',
                  color: value === option ? '#0FB0CE' : '#FFFFFF',
                }}
                onMouseEnter={(e) => {
                  if (value !== option) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== option) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Transaction Item ────────────────────────────────────────────────────────
interface TransactionItemComponentProps {
  transaction: Transaction;
  onClick?: () => void;
}

const TransactionItemComponent: React.FC<TransactionItemComponentProps> = ({
  transaction,
  onClick,
}) => {
  const isExpense = transaction.amount < 0;
  const isIncome = transaction.amount > 0;
  const Icon = getCategoryIcon(transaction.category || '');
  
  // Generate initials from merchant name
  const initials = transaction.merchant
    ?.split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'TX';

  // Format amount
  const formatAmount = (amount: number) => {
    // All amounts in THB (baht) — no division by 100
    const absAmount = Math.abs(amount);
    return `฿${absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Icon colors based on type
  const iconBgColor = isIncome 
    ? 'rgba(76, 175, 80, 0.15)' 
    : isExpense 
      ? 'rgba(15, 176, 206, 0.15)' 
      : 'rgba(23, 134, 194, 0.15)';
  const iconColor = isIncome ? '#4CAF50' : '#0FB0CE';

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-3 px-4 py-4 transition-colors hover:bg-[rgba(15, 176, 206,0.03)]"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Merchant Icon */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBgColor }}
      >
        {Icon ? (
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        ) : (
          <span className="text-sm font-bold" style={{ color: iconColor }}>
            {initials}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <h4 className="text-sm font-medium text-white truncate">
          {transaction.merchant}
        </h4>
        <p className="text-xs text-[#666666] mt-0.5">
          {transaction.date}
        </p>
      </div>

      {/* Amount */}
      <div className="flex-shrink-0">
        <span
          className="text-sm font-bold"
          style={{ color: isExpense ? '#FFFFFF' : '#4CAF50' }}
        >
          {isExpense ? '-' : '+'}{formatAmount(transaction.amount)}
        </span>
      </div>
    </motion.button>
  );
};

// ─── More Menu Popup ────────────────────────────────────────────────────────
const MoreMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onExport?: () => void;
  onFilter?: () => void;
}> = ({ isOpen, onClose, onExport }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 py-2 rounded-xl shadow-xl z-50 min-w-[160px]"
            style={{
              backgroundColor: '#1F2328',
              border: '1px solid #2A2A2A',
            }}
          >
            <button
              onClick={onExport}
              className="w-full px-4 py-3 text-left text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.05)]"
            >
              Export Statement
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-left text-sm text-white transition-colors hover:bg-[rgba(255,255,255,0.05)]"
            >
              Help & Support
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Empty State (Design System) ────────────────────────────────────────────
const TransactionEmptyState: React.FC<{ lang: Language }> = ({ lang }) => (
  <EmptyState
    icon={CreditCard}
    title={lang === 'en' ? 'No transactions yet' : 'ยังไม่มีรายการ'}
    description={lang === 'en' ? 'Your transaction history will appear here' : 'ประวัติการทำธุรกรรมจะแสดงที่นี่'}
  />
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function TransactionHistoryPage({
  transactions,
  onBack,
  onTransactionClick,
  onSuccessClose,
  lang,
}: TransactionHistoryPageProps) {
  const t = translations[lang];
  const [filter, setFilter] = useState<FilterOption>('All');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'Income') return tx.amount > 0;
    if (filter === 'Expense') return tx.amount < 0;
    if (filter === 'Transfer') {
      const cat = tx.category?.toLowerCase() || '';
      return cat.includes('transfer') || cat.includes('send');
    }
    return true; // All
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = tx.date || 'Unknown';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Show success screen for demo
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    onSuccessClose?.();
  }, [onSuccessClose]);

  if (showSuccess) {
    return (
      <TransactionSuccessScreen
        lang={lang}
        onClose={handleSuccessClose}
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#050D1F', fontFamily: '"Inter", sans-serif' }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-30 px-4 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#050D1F', borderBottom: '1px solid #1F2328' }}
      >
        {/* Left - Back button */}
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1F2328' }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Center - Title */}
        <h1 className="text-lg font-bold text-white uppercase tracking-wider">
          {lang === 'en' ? 'History' : 'ประวัติ'}
        </h1>

        {/* Right - More menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1F2328' }}
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
          <MoreMenu
            isOpen={showMoreMenu}
            onClose={() => setShowMoreMenu(false)}
            onExport={() => {
              setShowMoreMenu(false);
              // Demo: show success screen
              setShowSuccess(true);
            }}
          />
        </div>
      </header>

      {/* Filter Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <FilterDropdown value={filter} onChange={setFilter} />
        <span className="text-xs text-[#666666]">
          {filteredTransactions.length} {lang === 'en' ? 'transactions' : 'รายการ'}
        </span>
      </div>

      {/* Transaction List */}
      <div className="px-4 pb-8">
        {filteredTransactions.length === 0 ? (
          <TransactionEmptyState lang={lang} />
        ) : (
          <div 
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' }}
          >
            {filteredTransactions.map((transaction, index) => (
              <div key={transaction.id}>
                <TransactionItemComponent
                  transaction={transaction}
                  onClick={() => onTransactionClick?.(transaction)}
                />
                {/* Divider */}
                {index < filteredTransactions.length - 1 && (
                  <div className="h-px bg-[#2A2A2A] ml-16" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Transaction Success Screen ─────────────────────────────────────────────
interface TransactionSuccessScreenProps {
  lang: Language;
  onClose: () => void;
}

export const TransactionSuccessScreen: React.FC<TransactionSuccessScreenProps> = ({
  lang,
  onClose,
}) => {
  const t = translations[lang];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: '#050D1F', 
        fontFamily: '"Inter", sans-serif' 
      }}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #050D1F 0%, #141414 50%, #1A1A1A 100%)',
        }}
      />

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-12">
        {/* Success Graphic */}
        <div className="mb-8">
          <div className="relative">
            {/* Lime circle */}
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#0FB0CE' }}
            >
              {/* Checkmark */}
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M5 12l5 5L19 7"
                  stroke="#050D1F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </svg>
            </div>

            {/* Stars */}
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45) * (Math.PI / 180);
              const distance = 80 + Math.random() * 20;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700">
                    <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8l-6.3 4.2 2.3-7-6-4.6h7.6L12 2z" />
                  </svg>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-2 text-center"
        >
          {lang === 'en' ? 'Transaction Successful' : 'ธุรกรรมสำเร็จ'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-[#888888] mb-8"
        >
          {lang === 'en' ? 'Your money has been sent successfully' : 'โอนเงินสำเร็จแล้ว'}
        </motion.p>

        {/* Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm rounded-3xl p-6"
          style={{
            backgroundColor: '#1A1A1A',
            border: '1px solid #2A2A2A',
          }}
        >
          {/* Receipt Header */}
          <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid #2A2A2A' }}>
            <span className="text-xs text-[#666666] uppercase tracking-wider">
              Transaction ID
            </span>
            <span className="text-sm text-white font-medium">
              TXN-58648438
            </span>
          </div>

          {/* Receipt Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#666666]">Date</span>
              <span className="text-sm text-white">May 09, 2024 | 08:32 PM</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#666666]">Recipient</span>
              <span className="text-sm text-white">Dianne Russell</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#666666]">Amount</span>
              <span className="text-sm text-white">$1,304.00</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#666666]">Fees</span>
              <span className="text-sm text-white">$5.00</span>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#2A2A2A] my-2" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-lg font-bold" style={{ color: '#0FB0CE' }}>
                $1,309.00
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onClose}
          className="mt-8 px-8 py-4 rounded-full text-sm font-bold text-black transition-all active:scale-95"
          style={{ backgroundColor: '#FFFFFF' }}
          whileTap={{ scale: 0.95 }}
        >
          {lang === 'en' ? 'Send Money' : 'โอนเงิน'}
        </motion.button>
      </div>
    </div>
  );
};
