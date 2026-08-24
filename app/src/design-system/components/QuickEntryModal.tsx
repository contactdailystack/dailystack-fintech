/**
 * ============================================================
 * DailyStack Design System — QuickEntryModal Component v1.0
 * ============================================================
 * Bottom sheet modal for expense/income entry
 * 
 * Design Philosophy:
 * - GlassSurface backdrop with blur
 * - Large amount input with currency
 * - Category picker with icons
 * - Emotion selector
 * - Framer Motion spring animations
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassSurface } from './GlassSurface';
import { hapticPresets, type HapticPresetDefinition } from '../haptic-tokens';
import { semantic, text, border } from '../color-tokens';
import { motionTokens, toSeconds, easing, spring } from '../motion-tokens';

// ─── Category Types ────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  nameTH?: string;
  /** Icon can be either a component or string name that maps to Icons */
  icon: React.ElementType | string;
  color: string;
}

export interface QuickEntryData {
  amount: string;
  category: Category | null;
  emotion: string;
  note?: string;
  type: 'expense' | 'income';
}

// ─── Default Categories ─────────────────────────────────────────────
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#F97316' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#3B82F6' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#8B5CF6' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Zap', color: '#F59E0B' },
  { id: 'health', name: 'Health', icon: 'Heart', color: '#10B981' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#6366F1' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#888888' },
];

// ─── Emotions ──────────────────────────────────────────────────────
export const EMOTIONS = [
  { id: 'joy', label: 'Joy', color: '#10B981' },
  { id: 'value', label: 'Value', color: '#56be89' },
  { id: 'neutral', label: 'Neutral', color: '#888888' },
  { id: 'impulse', label: 'Impulse', color: '#F97316' },
  { id: 'stress', label: 'Stress', color: '#F59E0B' },
];

// ─── Component Props ───────────────────────────────────────────────
export interface QuickEntryModalProps {
  /** Modal visibility */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Save handler */
  onSave: (data: QuickEntryData) => void;
  /** Initial amount */
  initialAmount?: string;
  /** Currency symbol */
  currency?: string;
  /** Categories to display */
  categories?: Category[];
  /** Default type */
  defaultType?: 'expense' | 'income';
}

// ─── Icon Components (inline SVG for reliability) ───────────────────
const Icons: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  UtensilsCrossed: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  ),
  Car: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  ShoppingBag: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Film: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ),
  Zap: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Heart: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  GraduationCap: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  ),
  MoreHorizontal: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
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
  Plus: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  TrendingUp: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  TrendingDown: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  ChevronDown: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

// ─── Component ─────────────────────────────────────────────────────
export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAmount = '',
  currency = '฿',
  categories = DEFAULT_CATEGORIES,
  defaultType = 'expense',
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState('neutral');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'expense' | 'income'>(defaultType);
  const [showCategories, setShowCategories] = useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setAmount(initialAmount);
      setSelectedCategory(null);
      setSelectedEmotion('neutral');
      setNote('');
      setType(defaultType);
      setShowCategories(false);
    }
  }, [isOpen, initialAmount, defaultType]);

  const fireHaptic = useCallback((preset: HapticPresetDefinition) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const pattern = [
        Math.round(preset.time * preset.sharpness * 0.3),
        Math.round(preset.intensity * 255),
      ];
      navigator.vibrate(pattern);
    }
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowCategories(false);
    fireHaptic(hapticPresets.SELECT);
  };

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    fireHaptic(hapticPresets.SELECT);
  };

  const handleTypeToggle = (newType: 'expense' | 'income') => {
    setType(newType);
    fireHaptic(hapticPresets.CRISP_CLICK);
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    
    fireHaptic(hapticPresets.DEEP_RESONANCE);
    onSave({
      amount,
      category: selectedCategory,
      emotion: selectedEmotion,
      note: note.trim() || undefined,
      type,
    });
  };

  const formatAmount = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden"
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
                <h2 className="text-lg font-semibold text-white">Add Transaction</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <Icons.X className="w-5 h-5 text-[#888888]" />
                </button>
              </div>

              {/* Type Toggle */}
              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={() => handleTypeToggle('expense')}
                  className={`
                    flex-1 py-3 rounded-xl font-medium text-sm transition-all
                    ${type === 'expense' 
                      ? 'bg-[#FF5733] text-white' 
                      : 'bg-[#1A1A1A] text-[#888888] border border-[#2A2A2A]'}
                  `}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icons.TrendingDown className="w-4 h-4" />
                    Expense
                  </span>
                </button>
                <button
                  onClick={() => handleTypeToggle('income')}
                  className={`
                    flex-1 py-3 rounded-xl font-medium text-sm transition-all
                    ${type === 'income' 
                      ? 'bg-[#4CAF50] text-white' 
                      : 'bg-[#1A1A1A] text-[#888888] border border-[#2A2A2A]'}
                  `}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icons.TrendingUp className="w-4 h-4" />
                    Income
                  </span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="px-4 pb-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-[#888888]">
                    {currency}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`
                      w-full pl-14 pr-4 py-4
                      text-4xl font-bold text-white
                      bg-[#1A1A1A] border border-[#2A2A2A]
                      rounded-xl
                      placeholder:text-[#666666]
                      focus:outline-none focus:border-[#56be89]
                      tabular-nums
                    `}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                </div>
                {amount && (
                  <p className="text-sm text-[#666666] mt-2 text-right">
                    {formatAmount(amount)} THB
                  </p>
                )}
              </div>

              {/* Category Picker */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="w-full py-3 px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl flex items-center justify-between"
                >
                  <span className="text-[#888888]">
                    {selectedCategory ? selectedCategory.name : 'Select category'}
                  </span>
                  <Icons.ChevronDown className="w-5 h-5 text-[#666666]" />
                </button>

                <AnimatePresence>
                  {showCategories && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: toSeconds(motionTokens.duration.quick), ease: easing.tight }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {categories.map((cat) => {
                          // Handle icon as string name or component
                          const getIconComponent = () => {
                            if (typeof cat.icon === 'string') {
                              return Icons[cat.icon] || Icons.MoreHorizontal;
                            }
                            return cat.icon;
                          };
                          const IconComponent = getIconComponent();
                          return (
                            <button
                              key={cat.id}
                              onClick={() => handleCategorySelect(cat)}
                              className={`
                                p-3 rounded-xl flex flex-col items-center gap-2 transition-all
                                ${selectedCategory?.id === cat.id 
                                  ? 'border-2' 
                                  : 'bg-[#1A1A1A] border border-[#2A2A2A]'}
                              `}
                              style={{
                                borderColor: selectedCategory?.id === cat.id ? cat.color : undefined,
                                backgroundColor: selectedCategory?.id === cat.id ? `${cat.color}15` : undefined,
                              }}
                            >
                              <IconComponent className="w-5 h-5" style={{ color: cat.color }} />
                              <span className="text-[10px] text-[#888888] text-center truncate w-full">
                                {cat.name.split(' ')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Emotion Selector */}
              <div className="px-4 pb-4">
                <p className="text-xs text-[#666666] mb-2 uppercase tracking-wider">How do you feel?</p>
                <div className="flex gap-2">
                  {EMOTIONS.map((emotion) => (
                    <button
                      key={emotion.id}
                      onClick={() => handleEmotionSelect(emotion.id)}
                      className={`
                        flex-1 py-2 px-2 rounded-xl text-xs font-medium transition-all
                        ${selectedEmotion === emotion.id 
                          ? 'border-2' 
                          : 'bg-[#1A1A1A] border border-[#2A2A2A]'}
                      `}
                      style={{
                        borderColor: selectedEmotion === emotion.id ? emotion.color : undefined,
                        color: selectedEmotion === emotion.id ? emotion.color : '#888888',
                        backgroundColor: selectedEmotion === emotion.id ? `${emotion.color}15` : undefined,
                      }}
                    >
                      {emotion.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Input */}
              <div className="px-4 pb-6">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#56be89]"
                />
              </div>

              {/* Save Button */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleSave}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className={`
                    w-full py-4 rounded-xl font-semibold text-[#101010]
                    transition-all
                    ${amount && parseFloat(amount) > 0
                      ? 'bg-[#56be89] hover:bg-[#6fcca3] active:scale-[0.98]'
                      : 'bg-[#2A2A2A] text-[#666666] cursor-not-allowed'}
                  `}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icons.Plus className="w-5 h-5" />
                    Save Transaction
                  </span>
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
export default QuickEntryModal;
