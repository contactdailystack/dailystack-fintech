/**
 * ============================================================
 * DailyStack — ConfirmationModal Component (App-level, i18n)
 * ============================================================
 * Bottom-sheet modal for confirming financial transactions.
 * Clearly shows what user is about to do.
 * Warning text: "This action cannot be undone"
 * Large Confirm/Cancel buttons (min 44px touch target).
 * Haptic feedback on confirm.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Calendar, Store } from 'lucide-react';

// ─── Props ───────────────────────────────────────────────────────
export interface ConfirmationModalProps {
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
  /** Optional warning text override */
  warningText?: string;
  /** Default warning text */
  defaultWarning?: string;
  /** Confirm handler */
  onConfirm: () => void;
  /** Cancel handler */
  onCancel: () => void;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Modal title */
  title?: string;
  /** Amount label */
  amountLabel?: string;
  /** Merchant label */
  merchantLabel?: string;
  /** Date label */
  dateLabel?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────
const formatAmount = (amount: string | number, currency = '฿'): string => {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return `${currency}0.00`;
  return `${currency}${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const isHighValue = (amount: string | number): boolean => {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return n >= 5000;
};

// ─── Component ───────────────────────────────────────────────────
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  amount,
  currency = '฿',
  merchant,
  date,
  warningText,
  defaultWarning,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  title = 'Confirm Transaction',
  amountLabel = 'Amount',
  merchantLabel = 'Merchant',
  dateLabel = 'Date',
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    prevFocusRef.current = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => {
      const container = modalRef.current;
      if (!container) return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      };
      container.addEventListener('keydown', onKey);
      first?.focus();
      return () => container.removeEventListener('keydown', onKey);
    }, 0);
    return () => { clearTimeout(timer); prevFocusRef.current?.focus?.(); };
  }, [isOpen]);

  const fireHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 30, 10, 30]);
    }
  }, []);

  const handleConfirm = () => { fireHaptic(); onConfirm(); };
  const handleCancel = () => { onCancel(); };

  const highValue = isHighValue(amount);
  const defaultWarn = highValue
    ? 'This is a high-value transaction. Please verify the details before confirming.'
    : defaultWarning;
  const displayWarning = warningText ?? defaultWarn;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleCancel}
          />

          {/* Bottom sheet */}
          <motion.div
            ref={modalRef as any}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            {/* Sheet */}
            <div
              className="rounded-b-none"
              style={{
                background: 'rgba(11, 15, 10, 0.95)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 bg-[#2A2A2A] rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4">
                <h2 id="confirm-modal-title" className="text-lg font-semibold text-white">
                  {title}
                </h2>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-[#888888]" />
                </button>
              </div>

              {/* Details card */}
              <div className="px-4 pb-4">
                <div
                  className="rounded-2xl p-4"
                  style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
                >
                  {/* Amount */}
                  <div className="text-center pb-4 border-b border-[#2A2A2A]">
                    <p className="text-sm text-[#888888] mb-1 uppercase tracking-wider">{amountLabel}</p>
                    <p className="text-3xl font-bold text-white tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatAmount(amount, currency)}
                    </p>
                  </div>

                  {/* Merchant + Date */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store size={16} className="text-[#888888]" />
                        <span className="text-sm text-[#888888]">{merchantLabel}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{merchant}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#888888]" />
                        <span className="text-sm text-[#888888]">{dateLabel}</span>
                      </div>
                      <span className="text-sm text-white">{formatDate(date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning */}
              {displayWarning && (
                <div className="px-4 pb-4">
                  <div
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,159,10,0.12)', border: '1px solid rgba(255,159,10,0.3)' }}
                  >
                    <AlertTriangle size={20} className="text-[#FF9F0A] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#FFB340] leading-relaxed">{displayWarning}</p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="px-4 pb-4 space-y-3">
                <button
                  onClick={handleConfirm}
                  className="w-full py-4 rounded-xl font-semibold text-[#101010] bg-[#0FB0CE] hover:bg-[#3FC4DB] active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Check size={20} />
                  {confirmLabel}
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] active:scale-[0.98] transition-all min-h-[48px]"
                >
                  {cancelLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
