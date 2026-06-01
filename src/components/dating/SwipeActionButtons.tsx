/**
 * DailyStack — SwipeAction Buttons Component
 * Phase 3: Scalable Architecture
 * 
 * Action buttons for swipe interactions:
 * - Pass (X)
 * - Superlike (Star)
 * - Like (Heart)
 * 
 * Premium design with:
 * - Glow effects on hover
 * - Scale animations
 * - Haptic feedback simulation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { X, Star, Heart } from 'lucide-react';

export interface SwipeActionButtonsProps {
  onPass: () => void;
  onSuperlike: () => void;
  onLike: () => void;
  superlikeCount?: number;
  disabled?: boolean;
}

const SwipeActionButtons: React.FC<SwipeActionButtonsProps> = ({
  onPass,
  onSuperlike,
  onLike,
  superlikeCount = 1,
  disabled = false,
}) => {
  const buttonSize = 56;
  
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Pass Button */}
      <motion.button
        onClick={onPass}
        disabled={disabled}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-16 h-16 rounded-full bg-[#18181B] border-2 border-[#3f3f46] flex items-center justify-center shadow-lg hover:border-red-500/50 hover:shadow-red-500/20 transition-all duration-300"
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <X className="w-7 h-7 text-red-500" strokeWidth={2.5} />
      </motion.button>
      
      {/* Superlike Button */}
      <motion.button
        onClick={onSuperlike}
        disabled={disabled || superlikeCount <= 0}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          superlikeCount > 0
            ? 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.6)]'
            : 'bg-[#27272a] opacity-50 cursor-not-allowed'
        }`}
      >
        <Star 
          className={`w-6 h-6 ${superlikeCount > 0 ? 'text-black' : 'text-white/30'}`} 
          fill={superlikeCount > 0 ? 'currentColor' : 'none'}
          strokeWidth={2}
        />
      </motion.button>
      
      {/* Like Button */}
      <motion.button
        onClick={onLike}
        disabled={disabled}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-16 h-16 rounded-full bg-[#18181B] border-2 border-[#D9FD82] flex items-center justify-center shadow-lg hover:border-[#D9FD82]/50 hover:shadow-[#D9FD82]/30 transition-all duration-300"
        style={{
          boxShadow: '0 4px 20px rgba(86, 190, 137, 0.2)',
        }}
      >
        <Heart className="w-7 h-7 text-[#D9FD82]" fill="currentColor" strokeWidth={2} />
      </motion.button>
    </div>
  );
};

// Larger variant for desktop
export const SwipeActionButtonsLarge: React.FC<SwipeActionButtonsProps> = ({
  onPass,
  onSuperlike,
  onLike,
  superlikeCount = 1,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-6">
      {/* Pass Button */}
      <motion.button
        onClick={onPass}
        disabled={disabled}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-20 h-20 rounded-full bg-[#18181B] border-3 border-[#3f3f46] flex items-center justify-center shadow-xl hover:border-red-500/50 transition-all duration-200"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}
      >
        <X className="w-9 h-9 text-red-500" strokeWidth={2.5} />
      </motion.button>
      
      {/* Superlike Button */}
      <motion.button
        onClick={onSuperlike}
        disabled={disabled || superlikeCount <= 0}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
          superlikeCount > 0
            ? 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-[0_8px_32px_rgba(251,191,36,0.5)]'
            : 'bg-[#27272a] opacity-50 cursor-not-allowed'
        }`}
      >
        <Star 
          className={`w-7 h-7 ${superlikeCount > 0 ? 'text-black' : 'text-white/30'}`} 
          fill={superlikeCount > 0 ? 'currentColor' : 'none'}
          strokeWidth={2}
        />
      </motion.button>
      
      {/* Like Button */}
      <motion.button
        onClick={onLike}
        disabled={disabled}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-20 h-20 rounded-full bg-[#18181B] border-3 border-[#D9FD82] flex items-center justify-center shadow-xl hover:shadow-[0_8px_40px_rgba(86,190,137,0.4)] transition-all duration-200"
        style={{ boxShadow: '0 8px 32px rgba(86, 190, 137, 0.25)' }}
      >
        <Heart className="w-9 h-9 text-[#D9FD82]" fill="currentColor" strokeWidth={2} />
      </motion.button>
    </div>
  );
};

export default SwipeActionButtons;