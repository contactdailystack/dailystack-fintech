/**
 * DailyStack — EmptyState Component
 * Phase 3: Scalable Architecture
 * 
 * Premium empty state with:
 * - Animated illustration
 * - Message + CTA button
 * - Subtle background pattern
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Users, MessageCircle, RefreshCw, ArrowRight } from 'lucide-react';

export type EmptyStateType = 
  | 'no-profiles'
  | 'no-matches'
  | 'no-messages'
  | 'no-connections';

export interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  actionLabel?: string;
  customTitle?: string;
  customMessage?: string;
}

const EmptyStateConfig: Record<EmptyStateType, {
  icon: React.ElementType;
  title: string;
  message: string;
  actionLabel?: string;
}> = {
  'no-profiles': {
    icon: Sparkles,
    title: 'Finding Your Matches',
    message: 'We\'re discovering new people for you. Check back soon for fresh profiles!',
    actionLabel: 'Refresh',
  },
  'no-matches': {
    icon: Heart,
    title: 'No Matches Yet',
    message: 'Keep swiping to find your perfect match. Your someone special is out there!',
    actionLabel: 'Start Swiping',
  },
  'no-messages': {
    icon: MessageCircle,
    title: 'No Messages Yet',
    message: 'When you match with someone, your conversations will appear here.',
    actionLabel: 'Find Matches',
  },
  'no-connections': {
    icon: Users,
    title: 'No Connections',
    message: 'Start connecting with people to build your network.',
    actionLabel: 'Explore',
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  actionLabel,
  customTitle,
  customMessage,
}) => {
  const config = EmptyStateConfig[type];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      {/* Animated Icon Background */}
      <div className="relative mb-8">
        {/* Glow Effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-[#D9FD82]/20 rounded-full blur-2xl"
        />
        
        {/* Icon Container */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-20 h-20 bg-[#18181B] rounded-full flex items-center justify-center border border-[#27272a]"
        >
          <Icon className="w-10 h-10 text-[#D9FD82]" />
        </motion.div>
        
        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-4 -right-4 w-8 h-8"
        >
          <Sparkles className="w-full h-full text-[#D9FD82]/30" />
        </motion.div>
        
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-2 -left-4 w-6 h-6"
        >
          <Heart className="w-full h-full text-[#D9FD82]/20" />
        </motion.div>
      </div>
      
      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-bold text-white mb-2"
      >
        {customTitle || config.title}
      </motion.h3>
      
      {/* Message */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/50 text-sm max-w-xs mb-6"
      >
        {customMessage || config.message}
      </motion.p>
      
      {/* Action Button */}
      {(onAction || config.actionLabel) && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 bg-[#D9FD82] hover:bg-[#4ade80] text-black font-semibold rounded-full flex items-center gap-2 shadow-lg transition-colors"
          style={{ boxShadow: '0 4px 20px rgba(86, 190, 137, 0.3)' }}
        >
          {type === 'no-profiles' ? (
            <>
              <RefreshCw className="w-4 h-4" />
              {actionLabel || config.actionLabel}
            </>
          ) : (
            <>
              {actionLabel || config.actionLabel}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

// Loading variant
export const EmptyStateLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="relative mb-8">
        {/* Pulsing Icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-20 h-20 bg-[#18181B] rounded-full flex items-center justify-center border border-[#27272a]"
        >
          <div className="w-10 h-10 rounded-full bg-[#D9FD82]/30 animate-pulse" />
        </motion.div>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="h-6 w-40 bg-[#27272a] rounded animate-pulse" />
        <div className="h-4 w-64 bg-[#27272a]/50 rounded animate-pulse" />
      </div>
    </div>
  );
};

// Error variant
export const EmptyStateError: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
          <span className="text-3xl">⚠️</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">Oops!</h3>
      <p className="text-white/50 text-sm max-w-xs mb-6">{message}</p>
      
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-6 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white font-semibold rounded-full flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;