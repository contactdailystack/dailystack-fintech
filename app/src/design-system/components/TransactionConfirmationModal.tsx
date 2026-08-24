/**
 * ============================================================
 * DailyStack Design System — TransactionConfirmationModal Component v1.0
 * ============================================================
 * Modal for confirming financial transactions before execution
 * 
 * Design Philosophy:
 * - Bottom sheet modal style (similar to QuickEntryModal)
 * - GlassSurface backdrop with blur
 * - Displays transaction details: amount, merchant, date
 * - Warning text for high-value transactions
 * - Confirm/Cancel buttons
 * - Framer Motion spring animations
 * - Zero emoji — use [Icon: Name] format
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSurface } from './GlassSurface';
import { hapticPresets, type HapticPresetKey } from '../haptic-tokens';
import { motionTokens, toSeconds, easing } from '../motion-tokens';

// ─── Component Props ───────────────────────────────────────────────
export interface TransactionConfirmationModalProps {
  /** Modal visibility */
  isOpen: boolean;
  /** Transaction amount */
  amount: string | number;
  /** Currency symbol */
  currency?: string;
  /** Merchant name */
  merchant: string;
  /** Transaction date */
  date: Date | string;
  /** Optional warning text */
  warningText?: string;
  /** Confirm handler */
  onConfirm: () => void;
  /** Cancel handler */
  onCancel: () => void;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
}

// ─── Icon Components (inline SVG) ──────────────────────────────────
const Icons: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  X: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  AlertTriangle: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Calendar: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Store: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

// ─── Helper Functions ─────────────────────────────────────────────
const formatAmount = (amount: string | number, currency: string = '฿'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `${currency}0.00`;
  return `${currency}${numAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const isHighValueTransaction = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount >= 5000;
};

// ─── Component ─────────────────────────────────────────────────────
export const TransactionConfirmationModal: React.FC<TransactionConfirmationModalProps> = ({
  isOpen,
  amount,
  currency = '฿',
  merchant,
  date,
  warningText,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // A11y: focus management
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

      // Focus trap + keyboard navigation
      setTimeout(() => {
        const container = modalRef.current;
        if (!container) return;

        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        const onKeyDown = (e: KeyboardEvent) => {
          if (e.key !== 'Tab') return;

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        };

        container.addEventListener('keydown', onKeyDown);
        first?.focus();

        return () => container.removeEventListener('keydown', onKeyDown);
      }, 0);
    }
  }, [isOpen]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen) {
      previouslyFocusedElementRef.current?.focus?.();
    }
  }, [isOpen]);

  const fireHaptic = useCallback((presetKey: HapticPresetKey) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const preset = hapticPresets[presetKey];
      const pattern = [
        Math.round(preset.time * preset.sharpness * 0.3),
        Math.round(preset.intensity * 255),
      ];
      navigator.vibrate(pattern);
    }
  }, []);

  const handleConfirm = () => {
    fireHaptic('DEEP_RESONANCE');
    onConfirm();
  };

  const handleCancel = () => {
    fireHaptic('SELECT');
    onCancel();
  };

  const highValue = isHighValueTransaction(amount);
  const defaultWarning = highValue 
    ? 'This is a high-value transaction. Please verify the details before confirming.'
    : undefined;
  const displayWarning = warningText || defaultWarning;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: toSeconds(motionTokens.duration.quick), ease: easing.tight }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef as any}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-confirm-title"
          >
            <GlassSurface
              intensity="heavy"
              radius="xl"
              className="rounded-b-none"
            >
              {/* Drag Handle */}
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 bg-[#2A2A2A] rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4">
                <h2 id="transaction-confirm-title" className="text-lg font-semibold text-white">
                  Confirm Transaction
                </h2>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <Icons.X className="w-5 h-5 text-[#888888]" />
                </button>
              </div>

              {/* Transaction Details Card */}
              <div className="px-4 pb-4">
                <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-[#2A2A2A]">
                  {/* Amount */}
                  <div className="text-center pb-4 border-b border-[#2A2A2A]">
                    <p className="text-sm text-[#888888] mb-1 uppercase tracking-wider">Amount</p>
                    <p 
                      className="text-3xl font-bold text-white tabular-nums"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatAmount(amount, currency)}
                    </p>
                  </div>

                  {/* Merchant & Date */}
                  <div className="pt-4 space-y-3">
                    {/* Merchant */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icons.Store className="w-4 h-4 text-[#888888]" />
                        <span className="text-sm text-[#888888]">Merchant</span>
                      </div>
                      <span className="text-sm font-medium text-white">{merchant}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icons.Calendar className="w-4 h-4 text-[#888888]" />
                        <span className="text-sm text-[#888888]">Date</span>
                      </div>
                      <span className="text-sm text-white">{formatDate(date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning Text */}
              {displayWarning && (
                <div className="px-4 pb-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,159,10,0.12)] border border-[rgba(255,159,10,0.3)]">
                    <Icons.AlertTriangle className="w-5 h-5 text-[#FF9F0A] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#FFB340] leading-relaxed">
                      {displayWarning}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-4 pb-4 space-y-3">
                {/* Confirm Button */}
                <button
                  onClick={handleConfirm}
                  className="w-full py-4 rounded-xl font-semibold text-[#101010] bg-[#56be89] hover:bg-[#6fcca3] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Icons.Check className="w-5 h-5" />
                  {confirmLabel}
                </button>

                {/* Cancel Button */}
                <button
                  onClick={handleCancel}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] active:scale-[0.98] transition-all"
                >
                  {cancelLabel}
                </button>
              </div>
            </GlassSurface>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Exports ──────────────────────────────────────────────────────
export default TransactionConfirmationModal;
