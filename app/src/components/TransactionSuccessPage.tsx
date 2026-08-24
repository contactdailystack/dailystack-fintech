/**
 * ============================================================
 * TransactionSuccessPage.tsx — E-Pay Style Redesign
 * ============================================================
 * Transaction success screen with celebration animation
 * 
 * Design Specs:
 * - Split background (black top, white card bottom)
 * - Lime circle with black checkmark and yellow stars
 * - Receipt card with transaction details
 * - Pill-shaped action button
 * - Inter font
 */

import { motion } from 'framer-motion';
import { Language, translations } from '../data/translations';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface TransactionSuccessData {
  transactionId: string;
  date: string;
  recipient: string;
  amount: number;
  fees: number;
  currency?: string;
}

interface TransactionSuccessPageProps {
  data?: Partial<TransactionSuccessData>;
  onClose?: () => void;
  onDone?: () => void;
  lang: Language;
}

// ─── Star Particle Component ────────────────────────────────────────────────
const StarParticle: React.FC<{ 
  angle: number; 
  delay: number; 
  size?: number;
  color?: string;
}> = ({ angle, delay, size = 16, color = '#FFD700' }) => {
  const radians = (angle * Math.PI) / 180;
  const distance = 70 + Math.random() * 20;
  const x = Math.cos(radians) * distance;
  const y = Math.sin(radians) * distance;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 0.8, 0], x, y }}
      transition={{ 
        duration: 1, 
        delay, 
        ease: 'easeOut',
        times: [0, 0.2, 0.7, 1],
      }}
      className="absolute"
      style={{ left: '50%', top: '50%' }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.8l-6.3 4.2 2.3-7-6-4.6h7.6L12 2z" />
      </svg>
    </motion.div>
  );
};

// ─── Success Circle Component ────────────────────────────────────────────────
const SuccessCircle: React.FC<{ size?: number }> = ({ size = 128 }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="relative rounded-full flex items-center justify-center"
    style={{
      width: size,
      height: size,
      backgroundColor: '#56be89',
      boxShadow: '0 0 60px rgba(205, 255, 36, 0.4)',
    }}
  >
    {/* Glow effect */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(205,255,36,0.3) 0%, transparent 70%)',
      }}
    />
    
    {/* Checkmark */}
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <motion.path
        d="M5 12l5 5L19 7"
        stroke="#0B0F0A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </svg>

    {/* Stars orbiting the circle */}
    {[...Array(8)].map((_, i) => (
      <StarParticle
        key={i}
        angle={i * 45 + Math.random() * 10}
        delay={0.3 + i * 0.08}
        size={14}
        color={i % 2 === 0 ? '#FFD700' : '#56be89'}
      />
    ))}
  </motion.div>
);

// ─── Receipt Card Component ─────────────────────────────────────────────────
interface ReceiptCardProps {
  data: TransactionSuccessData;
  lang: Language;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ data, lang }) => {
  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-sm rounded-3xl overflow-hidden"
      style={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Card Header */}
      <div 
        className="px-6 py-4"
        style={{ borderBottom: '1px solid #E5E5E5' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {lang === 'en' ? 'Transaction ID' : 'รหัสธุรกรรม'}
          </span>
          <span className="text-sm font-medium text-gray-800">
            {data.transactionId}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-6 py-5 space-y-4">
        {/* Date */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {lang === 'en' ? 'Date' : 'วันที่'}
          </span>
          <span className="text-sm font-medium text-gray-800">
            {data.date}
          </span>
        </div>

        {/* Recipient */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {lang === 'en' ? 'Recipient' : 'ผู้รับ'}
          </span>
          <span className="text-sm font-medium text-gray-800">
            {data.recipient}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {lang === 'en' ? 'Amount' : 'จำนวน'}
          </span>
          <span className="text-sm font-medium text-gray-800">
            {formatAmount(data.amount)}
          </span>
        </div>

        {/* Fees */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {lang === 'en' ? 'Fees' : 'ค่าธรรมเนียม'}
          </span>
          <span className="text-sm font-medium text-gray-800">
            {formatAmount(data.fees)}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-800">
            {lang === 'en' ? 'Total' : 'รวม'}
          </span>
          <span 
            className="text-xl font-bold"
            style={{ color: '#0B0F0A' }}
          >
            {formatAmount(data.amount + data.fees)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Action Button Component ─────────────────────────────────────────────────
interface ActionButtonProps {
  onClick: () => void;
  lang: Language;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, lang }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    onClick={onClick}
    className="px-10 py-4 rounded-full text-sm font-bold text-white transition-all active:scale-95"
    style={{ 
      backgroundColor: '#0B0F0A',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    }}
    whileTap={{ scale: 0.95 }}
  >
    {lang === 'en' ? 'Send Money' : 'โอนเงิน'}
  </motion.button>
);

// ─── Main Component ─────────────────────────────────────────────────────────
const TransactionSuccessPage: React.FC<TransactionSuccessPageProps> = ({
  data,
  onClose,
  onDone,
  lang,
}) => {
  const t = translations[lang];

  // Default data if not provided
  const successData: TransactionSuccessData = {
    transactionId: data?.transactionId || 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    date: data?.date || new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) + ' | ' + new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    recipient: data?.recipient || 'Dianne Russell',
    amount: data?.amount || 1304.00,
    fees: data?.fees || 5.00,
    currency: data?.currency || '$',
  };

  const handleDone = () => {
    onDone?.();
    onClose?.();
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0B0F0A 0%, #0B0F0A 40%, #FFFFFF 40%, #FFFFFF 100%)',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Top Section - Dark */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        {/* Success Circle */}
        <div className="mb-8">
          <SuccessCircle size={140} />
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2 text-center"
        >
          {lang === 'en' ? 'Transaction Successful' : 'ธุรกรรมสำเร็จ'}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-400 mb-0"
        >
          {lang === 'en' ? 'Your money has been sent successfully' : 'โอนเงินสำเร็จแล้ว'}
        </motion.p>
      </div>

      {/* Bottom Section - White Card */}
      <div className="px-6 pb-12">
        {/* Receipt Card */}
        <ReceiptCard data={successData} lang={lang} />

        {/* Action Button */}
        <div className="flex justify-center mt-8">
          <ActionButton onClick={handleDone} lang={lang} />
        </div>
      </div>
    </div>
  );
};

export default TransactionSuccessPage;
