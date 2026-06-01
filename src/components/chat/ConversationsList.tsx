/**
 * DailyStack — Conversations List Component (v1.0)
 * Phase 4: Chat Component & Conversation Experience
 * 
 * Features:
 * - Modern chat list with conversation previews
 * - Online/offline status indicators
 * - Unread message badges
 * - Last message preview with truncation
 * - Smooth hover/press animations
 * - Match time display
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreVertical, Sparkles } from 'lucide-react';
import type { Conversation } from './ChatContainer';

// =====================================================
// DESIGN TOKENS
// =====================================================

const LIST_THEME = {
  bg: '#1C232A',
  surface: '#232D38',
  surfaceHover: '#1E2830',
  text: '#F5F5F7',
  textMuted: '#9CA3AF',
  textSubtle: '#6B7280',
  accent: '#56be89',
  unread: '#D9FD82',
  online: '#22C55E',
  border: 'rgba(255, 255, 255, 0.06)',
};

// =====================================================
// CONVERSATION ITEM COMPONENT
// =====================================================

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  // Format relative time
  const formatTime = useMemo(() => {
    const now = new Date();
    const lastMessage = conversation.lastMessage;
    if (!lastMessage) return '';
    
    const messageDate = new Date(lastMessage.timestamp);
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [conversation.lastMessage]);

  // Check if matched recently (within 24 hours)
  const isNewMatch = useMemo(() => {
    if (!conversation.matchedAt) return false;
    const now = new Date();
    const matchedDate = new Date(conversation.matchedAt);
    const diff = now.getTime() - matchedDate.getTime();
    return diff < 86400000; // 24 hours
  }, [conversation.matchedAt]);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: LIST_THEME.surfaceHover }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 px-4 py-4 transition-colors ${
        isSelected ? 'bg-[#27272A]' : ''
      }`}
      style={{ borderBottom: `1px solid ${LIST_THEME.border}` }}
    >
      {/* Avatar with status */}
      <div className="relative flex-shrink-0">
        <div 
          className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
            isNewMatch ? 'border-[#FF6B81] shadow-lg shadow-[#FF6B81]/20' : 'border-transparent'
          }`}
        >
          <img 
            src={conversation.partnerPhoto} 
            alt={conversation.partnerName}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Online indicator */}
        {conversation.partnerOnline && (
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#22C55E] border-3 border-[#09090B]" />
        )}
        
        {/* New match badge */}
        {isNewMatch && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#56be89] flex items-center justify-center"
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-white truncate">{conversation.partnerName}</h3>
          <span className="text-xs text-[#71717A] flex-shrink-0 ml-2">{formatTime}</span>
        </div>
        
        {/* Last message preview */}
        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-white font-medium' : 'text-[#A1A1AA]'}`}>
            {conversation.lastMessage 
              ? conversation.lastMessage.content 
              : isNewMatch 
                ? 'You matched! Start the conversation' 
                : 'Start the conversation'
            }
          </p>
          
          {/* Unread badge */}
          {conversation.unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-[#56be89] rounded-full ml-2"
            >
              <span className="text-xs font-bold text-white">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </span>
            </motion.div>
          )}
        </div>
        
        {/* Compatibility badge */}
        {conversation.compatibility >= 90 && (
          <div className="flex items-center gap-1 mt-1">
            <Heart className="w-3 h-3 text-[#FF6B81] fill-current" />
            <span className="text-[10px] text-[#FF6B81] font-medium">{conversation.compatibility}% match</span>
          </div>
        )}
      </div>
      
      {/* Action menu */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          // Handle more options
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[#71717A] hover:text-white hover:bg-white/5 transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </motion.button>
    </motion.button>
  );
};

// =====================================================
// EMPTY STATE COMPONENT
// =====================================================

interface EmptyConversationsProps {
  onFindMatches: () => void;
}

const EmptyConversations: React.FC<EmptyConversationsProps> = ({ onFindMatches }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      {/* Animated icon */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          y: [0, -5, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-20 h-20 rounded-full bg-[#18181B] flex items-center justify-center mb-6"
      >
        <MessageCircle className="w-10 h-10 text-[#56be89]" />
      </motion.div>
      
      <h3 className="text-xl font-bold text-white mb-2">No conversations yet</h3>
      <p className="text-[#A1A1AA] text-sm max-w-xs mb-6">
        When you match with someone, your conversations will appear here.
      </p>
      
      <motion.button
        onClick={onFindMatches}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-6 py-3 bg-[#56be89] text-black font-semibold rounded-full flex items-center gap-2"
      >
        <Heart className="w-5 h-5" />
        Find Matches
      </motion.button>
    </motion.div>
  );
};

// =====================================================
// SECTION HEADER COMPONENT
// =====================================================

interface SectionHeaderProps {
  title: string;
  count?: number;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count }) => {
  return (
    <div 
      className="flex items-center justify-between px-4 py-2"
      style={{ backgroundColor: LIST_THEME.bg }}
    >
      <h2 className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">{title}</h2>
      {count !== undefined && (
        <span className="text-xs text-[#71717A]">{count}</span>
      )}
    </div>
  );
};

// =====================================================
// MAIN CONVERSATIONS LIST COMPONENT
// =====================================================

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onFindMatches?: () => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedId,
  onSelect,
  onFindMatches,
}) => {
  // Separate new matches from regular conversations
  const { newMatches, activeConversations } = useMemo(() => {
    const matches: Conversation[] = [];
    const regular: Conversation[] = [];
    
    conversations.forEach(conv => {
      // Consider as new match if matched within 48 hours
      if (conv.matchedAt) {
        const now = new Date();
        const matchedDate = new Date(conv.matchedAt);
        const diff = now.getTime() - matchedDate.getTime();
        if (diff < 172800000) { // 48 hours
          matches.push(conv);
          return;
        }
      }
      regular.push(conv);
    });
    
    return { newMatches: matches, activeConversations: regular };
  }, [conversations]);

  // Sort by last message time (most recent first)
  const sortedMatches = useMemo(() => 
    [...newMatches].sort((a, b) => {
      const aTime = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bTime = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    }), [newMatches]);

  const sortedRegular = useMemo(() =>
    [...activeConversations].sort((a, b) => {
      const aTime = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bTime = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    }), [activeConversations]);

  if (conversations.length === 0) {
    return <EmptyConversations onFindMatches={onFindMatches || (() => {})} />;
  }

  return (
    <div className="flex flex-col">
      {/* New matches section */}
      {sortedMatches.length > 0 && (
        <>
          <SectionHeader title="New Matches" count={sortedMatches.length} />
          <AnimatePresence>
            {sortedMatches.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ConversationItem
                  conversation={conversation}
                  isSelected={selectedId === conversation.id}
                  onClick={() => onSelect(conversation)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}
      
      {/* Active conversations section */}
      {sortedRegular.length > 0 && (
        <>
          <SectionHeader title="Messages" count={sortedRegular.length} />
          <AnimatePresence>
            {sortedRegular.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (sortedMatches.length + index) * 0.05 }}
              >
                <ConversationItem
                  conversation={conversation}
                  isSelected={selectedId === conversation.id}
                  onClick={() => onSelect(conversation)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

// =====================================================
// EXPORTS
// =====================================================

export {
  ConversationsList,
  ConversationItem,
  EmptyConversations,
  SectionHeader,
};

export type {
  ConversationsListProps,
  ConversationItemProps,
  EmptyConversationsProps,
  SectionHeaderProps,
};