/**
 * ============================================================
 * DailyStack — Virtual Card Component v1.0
 * ============================================================
 * E-Pay style virtual credit card display
 * 
 * Design Specs:
 * - Gradient lime green background (#0FB0CE)
 * - VISA logo in top right
 * - Cardholder name and masked number
 * - Balance display
 */

import React from 'react';
import { motion } from 'motion/react';

export interface VirtualCardProps {
  /** Cardholder name */
  cardholderName?: string;
  /** Masked card number (last 4 digits) */
  lastFour?: string;
  /** Current balance on card */
  balance?: number;
  /** Card type (Visa, Mastercard, etc.) */
  cardType?: 'visa' | 'mastercard' | 'amex';
  /** Card color variant */
  variant?: 'lime' | 'emerald' | 'gold';
  /** Show card flip animation */
  interactive?: boolean;
  /** Card expiry */
  expiry?: string;
  /** Additional CSS class */
  className?: string;
}

// Color variants
const variantStyles = {
  lime: {
    gradient: 'linear-gradient(135deg, #0FB0CE 0%, #B8E620 50%, #A3D91A 100%)',
    textColor: '#1A1A1A',
    accentColor: '#0A0A0A',
  },
  emerald: {
    gradient: 'linear-gradient(135deg, #00E676 0%, #00C853 50%, #00A843 100%)',
    textColor: '#FFFFFF',
    accentColor: '#0A0A0A',
  },
  gold: {
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FFB300 100%)',
    textColor: '#1A1A1A',
    accentColor: '#0A0A0A',
  },
};

// VISA Logo SVG Component
const VisaLogo: React.FC<{ color?: string }> = ({ color = '#1A1A1A' }) => (
  <svg
    width="60"
    height="20"
    viewBox="0 0 60 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* VISA Classic Logo */}
    <path
      d="M22.5 6.5L19.5 13.5H17L16.5 11.5C16.5 11.5 15.8 13.5 14.5 13.5H12L12.2 7C12.2 7 12.4 6.5 13 6.5H15.5C16.3 6.5 16.6 6.8 16.8 7.2L18 10.5L19.5 6.5H22.5ZM28 6.5H25.5C25 6.5 24.7 6.6 24.5 7.1L21 13.5H23.5L24 12H26.5L27 13.5H29.5L28 6.5ZM25 10.5L26.3 7.5L26.8 10.5H25ZM33 6.5L30.3 11.3C30.1 11.8 30 12.2 30 12.5C30 13.2 30.5 13.5 31.2 13.5H33.5L36.2 6.5H33.8C33.3 6.5 32.9 6.6 32.7 7.1L31.8 9.5L30.6 6.5H28.3L33 13.5H35.5L33 6.5ZM38 6.5H35.5C35 6.5 34.7 6.6 34.5 7.1L32.5 11.5L32.3 12.5C32.2 13.2 32.5 13.5 33.2 13.5H34L36.7 6.5H38Z"
      fill={color}
    />
    <path
      d="M18 6.5L14.5 13.5H12.5L16 6.5H18Z"
      fill={color}
      opacity="0.7"
    />
  </svg>
);

// Contactless Payment Icon
const ContactlessIcon: React.FC<{ color?: string }> = ({ color = '#1A1A1A' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.3"
    />
    <path
      d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M12 10C10.34 10 9 11.34 9 12C9 13.66 10.34 15 12 15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const VirtualCard: React.FC<VirtualCardProps> = ({
  cardholderName = 'Kristin Watson',
  lastFour = '4293',
  balance = 1234.56,
  cardType = 'visa',
  variant = 'lime',
  interactive = true,
  expiry = '12/28',
  className = '',
}) => {
  const styles = variantStyles[variant];

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatCardNumber = (last: string) => {
    return `•••• •••• •••• ${last}`;
  };

  const CardContent = (
    <div
      className={`
        relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: styles.gradient,
        boxShadow: '0 8px 32px rgba(15, 176, 206, 0.25), 0 4px 16px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Background Pattern - Subtle dots */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Card Content */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        {/* Top Row - Logo and Contactless */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full opacity-80"
              style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
            />
            <div
              className="w-8 h-8 rounded-full -ml-4 opacity-60"
              style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
            />
          </div>
          <div className="flex items-center gap-3">
            <ContactlessIcon color={styles.textColor} />
            <VisaLogo color={styles.textColor} />
          </div>
        </div>

        {/* Middle - Card Number */}
        <div className="mt-auto">
          <p
            className="text-xl tracking-[0.2em] font-medium"
            style={{ color: styles.textColor, fontFamily: '"Inter", monospace' }}
          >
            {formatCardNumber(lastFour)}
          </p>
        </div>

        {/* Bottom Row - Name, Expiry, Balance */}
        <div className="flex justify-between items-end mt-2">
          <div>
            <p
              className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5"
              style={{ color: styles.textColor }}
            >
              Card Holder
            </p>
            <p
              className="text-sm font-semibold tracking-wide"
              style={{ color: styles.textColor, fontFamily: '"Inter", sans-serif' }}
            >
              {cardholderName}
            </p>
          </div>

          <div className="text-right">
            <p
              className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5"
              style={{ color: styles.textColor }}
            >
              Balance
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: styles.textColor, fontFamily: '"Inter", sans-serif' }}
            >
              {formatBalance(balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Subtle shine effect */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, transparent 100%)',
        }}
      />
    </div>
  );

  if (interactive) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {CardContent}
      </motion.div>
    );
  }

  return CardContent;
};

// Card Brand Logo Variants
export const CardBrandLogo: React.FC<{ brand: string; size?: 'sm' | 'md' | 'lg' }> = ({
  brand,
  size = 'md',
}) => {
  const sizeMap = { sm: 16, md: 24, lg: 32 };

  return (
    <div
      className="flex items-center justify-center rounded"
      style={{
        width: sizeMap[size] * 2,
        height: sizeMap[size],
        backgroundColor: '#1A1A1A',
      }}
    >
      <span
        className="text-white font-bold"
        style={{ fontSize: sizeMap[size] * 0.6 }}
      >
        {brand.toUpperCase()}
      </span>
    </div>
  );
};

export default VirtualCard;
