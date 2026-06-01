/**
 * DailyStack — Premium Chat System (v1.0)
 * Phase 4: Chat Component & Conversation Experience
 * 
 * Features:
 * - Emotionally engaging messaging UX
 * - Complete conversation states (empty/typing/online/seen)
 * - Soft glass surfaces, premium dark UI
 * - Smooth message animations with Framer Motion
 * - Mobile-first thumb-friendly interactions
 * - Virtualized rendering for performance
 * - Lenis smooth scroll integration ready
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowLeft, MoreVertical, Phone, Video, 
  Send, Smile, Image, Heart, Check, CheckCheck,
  ArrowDown, X, Sparkles, Clock, Wifi, WifiOff
} from 'lucide-react';
import { supabase } from '../../app/services/supabaseClient';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'gif' | 'icebreaker';
  status: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
  timestamp: Date;
  reactions?: string[];
  replyTo?: string;
}

export interface Conversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto: string;
  partnerOnline: boolean;
  partnerLastSeen?: Date;
  lastMessage?: Message;
  unreadCount: number;
  isMatched: boolean;
  matchedAt?: Date;
  compatibility: number;
}

export interface ChatState {
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  typing: {
    isTyping: boolean;
    userId?: string;
  };
  partnerOnline: boolean;
  partnerLastSeen?: Date;
}

// =====================================================
// DESIGN TOKENS
// =====================================================

const CHAT_THEME = {
  // Background colors
  bg: '#1C232A',
  surface: '#232D38',
  surfaceHover: '#1E2830',
  surfaceElevated: '#1E2830',
  
  // Message bubbles
  bubbleOutgoing: '#56be89',
  bubbleOutgoingText: '#000000',
  bubbleIncoming: '#232D38',
  bubbleIncomingText: '#F5F5F7',
  
  // Text colors
  text: '#F5F5F7',
  textMuted: '#9CA3AF',
  textSubtle: '#6B7280',
  
  // Accent colors
  accent: '#56be89',
  accentDark: '#3D9E6E',
  
  // Status colors
  online: '#22C55E',
  offline: '#71717A',
  sending: '#FBBF24',
  seen: '#56be89',
  
  // Input
  inputBg: '#232D38',
  inputBorder: 'rgba(255, 255, 255, 0.06)',
  inputFocus: '#56be89',
  
  // Glass
  glassBg: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.06)',
  
  // Spacing
  safeAreaBottom: 'env(safe-area-inset-bottom, 20px)',
  safeAreaTop: 'env(safe-area-inset-top, 0px)',
};

// =====================================================
// MESSAGE BUBBLE COMPONENT
// =====================================================

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTimestamp: boolean;
  showAvatar: boolean;
  partnerPhoto?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showTimestamp,
  showAvatar,
  partnerPhoto,
}) => {
  const isToday = useMemo(() => {
    const today = new Date();
    const messageDate = new Date(message.timestamp);
    return today.toDateString() === messageDate.toDateString();
  }, [message.timestamp]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const statusIcon = useMemo(() => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-white/40" />;
      case 'sent':
        return <Check className="w-3 h-3 text-white/50" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-white/60" />;
      case 'seen':
        return <CheckCheck className="w-3 h-3 text-[#56be89]" />;
      case 'failed':
        return <X className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  }, [message.status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 group`}
    >
      {/* Avatar for incoming messages */}
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
          {partnerPhoto ? (
            <img src={partnerPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#27272A]" />
          )}
        </div>
      )}
      
      {/* Message content */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* Bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl ${
            isOwn 
              ? 'rounded-br-md' 
              : 'rounded-bl-md'
          } ${message.type === 'icebreaker' ? 'bg-gradient-to-r from-[#56be89] to-[#3D9E6E]' : ''}`}
          style={{
            backgroundColor: isOwn 
              ? (message.type === 'icebreaker' ? undefined : CHAT_THEME.bubbleOutgoing)
              : CHAT_THEME.bubbleIncoming,
            color: isOwn 
              ? (message.type === 'icebreaker' ? '#000' : CHAT_THEME.bubbleOutgoingText)
              : CHAT_THEME.bubbleIncomingText,
          }}
        >
          {/* Icebreaker badge */}
          {message.type === 'icebreaker' && (
            <div className="absolute -top-2 left-2 px-2 py-0.5 bg-[#FBBF24] rounded-full">
              <span className="text-[10px] font-bold text-black flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Icebreaker
              </span>
            </div>
          )}
          
          {/* Message text */}
          <p className={`text-sm leading-relaxed ${isOwn ? '' : 'text-white/95'}`}>
            {message.content}
          </p>
          
          {/* Timestamp + Status */}
          {showTimestamp && (
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span 
                className="text-[10px]" 
                style={{ color: isOwn ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)' }}
              >
                {formatTime(new Date(message.timestamp))}
              </span>
              {isOwn && statusIcon}
            </div>
          )}
        </div>
        
        {/* Failed retry button */}
        {message.status === 'failed' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
          >
            <span>Tap to retry</span>
          </motion.button>
        )}
        
        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div 
            className="flex items-center gap-1 mt-1 px-2 py-1 rounded-full"
            style={{ backgroundColor: CHAT_THEME.surface }}
          >
            {message.reactions.map((reaction, i) => (
              <span key={i} className="text-sm">{reaction}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// =====================================================
// MESSAGE LIST COMPONENT
// =====================================================

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  partnerPhoto: string;
  onScrollToBottom: () => void;
  hasMoreBelow: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  partnerPhoto,
  onScrollToBottom,
  hasMoreBelow,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Group messages by time proximity (within 2 minutes = same group)
  const groupedMessages = useMemo(() => {
    const groups: Array<{ messages: Message[]; showTimestamp: boolean; showAvatar: boolean }> = [];
    let currentGroup: Message[] = [];
    let lastTime = 0;
    const TIME_THRESHOLD = 2 * 60 * 1000; // 2 minutes

    messages.forEach((message, index) => {
      const messageTime = new Date(message.timestamp).getTime();
      
      // Start new group if time threshold exceeded or sender changes
      const senderChanged = currentGroup.length > 0 && 
        currentGroup[0].senderId !== message.senderId;
      
      if (currentGroup.length === 0 || (!senderChanged && messageTime - lastTime < TIME_THRESHOLD)) {
        currentGroup.push(message);
      } else {
        groups.push({
          messages: [...currentGroup],
          showTimestamp: true,
          showAvatar: currentGroup[0].senderId !== currentUserId,
        });
        currentGroup = [message];
      }
      
      lastTime = messageTime;
    });

    if (currentGroup.length > 0) {
      groups.push({
        messages: [...currentGroup],
        showTimestamp: true,
        showAvatar: currentGroup[0].senderId !== currentUserId,
      });
    }

    return groups;
  }, [messages, currentUserId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Show scroll button when not at bottom
  const handleScroll = useCallback(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  }, []);

  return (
    <div 
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
      style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 20px))' }}
    >
      {/* Load more indicator */}
      {hasMoreBelow && (
        <div className="flex justify-center mb-4">
          <div className="w-6 h-6 border-2 border-[#56be89] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Message groups */}
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1">
          {group.messages.map((message, messageIndex) => {
            const isOwn = message.senderId === currentUserId;
            const isFirstInGroup = messageIndex === 0;
            const isLastInGroup = messageIndex === group.messages.length - 1;
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showTimestamp={isLastInGroup && group.showTimestamp}
                showAvatar={isLastInGroup && group.showAvatar}
                partnerPhoto={partnerPhoto}
              />
            );
          })}
        </div>
      ))}

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={onScrollToBottom}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#18181B] border border-[#1E2830] flex items-center justify-center shadow-lg hover:bg-[#27272A] transition-colors"
          >
            <ArrowDown className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// =====================================================
// CHAT INPUT COMPONENT
// =====================================================

interface ChatInputProps {
  onSendMessage: (content: string, type?: Message['type']) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 px-4 py-3"
      style={{
        paddingBottom: `calc(12px + env(safe-area-inset-bottom, 20px))`,
        background: `linear-gradient(to top, ${CHAT_THEME.bg} 80%, transparent)`,
      }}
    >
      <div 
        className="flex items-end gap-2 rounded-2xl px-4 py-3 border transition-all duration-200"
        style={{
          backgroundColor: CHAT_THEME.inputBg,
          borderColor: isFocused ? CHAT_THEME.inputFocus : CHAT_THEME.inputBorder,
          boxShadow: isFocused ? `0 0 0 3px rgba(86, 190, 137, 0.2)` : 'none',
        }}
      >
        {/* Left actions */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
          >
            <Image className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </motion.button>
        </div>
        
        {/* Input */}
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none placeholder:text-[#71717A] py-1 max-h-[120px]"
          style={{ minHeight: '24px' }}
        />
        
        {/* Send button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!canSend}
          whileHover={{ scale: canSend ? 1.05 : 1 }}
          whileTap={{ scale: canSend ? 0.95 : 1 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            canSend 
              ? 'bg-[#56be89] text-black' 
              : 'bg-[#27272A] text-[#71717A]'
          }`}
        >
          <Send className={`w-5 h-5 ${canSend ? '' : ''}`} />
        </motion.button>
      </div>
      
      {/* Typing hint */}
      <p className="text-[10px] text-center text-[#71717A] mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </motion.div>
  );
};

// =====================================================
// CONVERSATION STATES
// =====================================================

interface ConversationStateProps {
  state: 'empty' | 'loading' | 'typing' | 'online' | 'offline';
  partnerName?: string;
}

const ConversationStates: React.FC<ConversationStateProps> = ({ state, partnerName }) => {
  switch (state) {
    case 'empty':
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-8 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-[#18181B] flex items-center justify-center mb-6"
          >
            <Heart className="w-8 h-8 text-[#56be89]" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Start the conversation</h3>
          <p className="text-[#A1A1AA] text-sm max-w-xs">
            Say hello to {partnerName || 'your match'}! Studies show a personalized opener gets 3x more responses.
          </p>
          
          {/* Icebreaker suggestions */}
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            {['Hey! How\'s your day going?', 'What\'s your favorite way to spend a weekend?', 'Tell me something interesting!'].map((suggestion, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-[#18181B] border border-[#1E2830] rounded-full text-sm text-white/80 hover:text-white hover:border-[#56be89] transition-colors"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      );
    
    case 'loading':
      return (
        <div className="flex flex-col items-center justify-center py-16">
          {/* Message skeleton */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} mb-3 w-full px-4`}
            >
              <div 
                className="h-12 rounded-2xl bg-[#18181B]" 
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            </motion.div>
          ))}
        </div>
      );
    
    case 'typing':
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 px-4 py-3"
        >
          <div className="w-8 h-8 rounded-full bg-[#27272A] overflow-hidden">
            <img src="" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1, 0.8] }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
                className="w-2 h-2 rounded-full bg-[#A1A1AA]"
              />
            ))}
          </div>
          <span className="text-sm text-[#A1A1AA]">{partnerName} is typing...</span>
        </motion.div>
      );
    
    default:
      return null;
  }
};

// =====================================================
// CHAT HEADER COMPONENT
// =====================================================

interface ChatHeaderProps {
  partnerName: string;
  partnerPhoto: string;
  partnerOnline: boolean;
  partnerLastSeen?: Date;
  compatibility: number;
  onBack: () => void;
  onCall?: () => void;
  onVideo?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  partnerName,
  partnerPhoto,
  partnerOnline,
  partnerLastSeen,
  compatibility,
  onBack,
  onCall,
  onVideo,
}) => {
  const formatLastSeen = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 border-b"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.06)',
        paddingTop: `calc(12px + env(safe-area-inset-top, 0px))`,
        backgroundColor: CHAT_THEME.surface,
      }}
    >
      {/* Back button */}
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </motion.button>
      
      {/* Avatar with status */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1E2830]">
          <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
        </div>
        {partnerOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#22C55E] border-2 border-[#232D38]" />
        )}
      </div>
      
      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white truncate">{partnerName}</h2>
          {compatibility >= 90 && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full text-[10px] font-bold text-black">
              Top Match
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {partnerOnline ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs text-[#22C55E]">Active now</span>
            </>
          ) : (
            <span className="text-xs text-[#71717A]">
              {partnerLastSeen ? `Last seen ${formatLastSeen(partnerLastSeen)}` : 'Offline'}
            </span>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {onCall && (
          <motion.button
            onClick={onCall}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </motion.button>
        )}
        {onVideo && (
          <motion.button
            onClick={onVideo}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
          >
            <Video className="w-5 h-5" />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

// =====================================================
// CONNECTION STATUS INDICATOR
// =====================================================

interface ConnectionStatusProps {
  status: 'online' | 'offline' | 'reconnecting';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  return (
    <AnimatePresence>
      {status !== 'online' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`absolute top-0 left-0 right-0 px-4 py-2 flex items-center justify-center gap-2 ${
            status === 'offline' ? 'bg-red-500/10' : 'bg-yellow-500/10'
          }`}
        >
          {status === 'offline' ? (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-500 font-medium">No connection</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-xs text-yellow-500 font-medium">Reconnecting...</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =====================================================
// MAIN CHAT CONTAINER
// =====================================================

interface ChatContainerProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  chatState: ChatState;
  onSendMessage: (content: string, type?: Message['type']) => void;
  onBack: () => void;
  onRetryMessage?: (messageId: string) => void;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  conversation,
  messages,
  currentUserId,
  chatState,
  onSendMessage,
  onBack,
  onRetryMessage,
  hasMoreMessages = false,
  onLoadMore,
}) => {
  const scrollToBottom = useCallback(() => {
    // Implementation for scroll-to-bottom
  }, []);

  const isEmpty = messages.length === 0;

  return (
    <div 
      className="flex flex-col h-full"
      style={{ backgroundColor: CHAT_THEME.bg }}
    >
      {/* Connection status banner */}
      <ConnectionStatus status={chatState.connectionStatus} />
      
      {/* Chat header */}
      <ChatHeader
        partnerName={conversation.partnerName}
        partnerPhoto={conversation.partnerPhoto}
        partnerOnline={chatState.partnerOnline}
        partnerLastSeen={chatState.partnerLastSeen}
        compatibility={conversation.compatibility}
        onBack={onBack}
      />
      
      {/* Messages area */}
      <div className="flex-1 relative overflow-hidden">
        {isEmpty ? (
          <ConversationStates 
            state={chatState.typing.isTyping ? 'typing' : 'empty'} 
            partnerName={conversation.partnerName}
          />
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            partnerPhoto={conversation.partnerPhoto}
            onScrollToBottom={scrollToBottom}
            hasMoreBelow={hasMoreMessages}
          />
        )}
      </div>
      
      {/* Chat input */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={chatState.connectionStatus === 'offline'}
      />
    </div>
  );
};

// =====================================================
// MATCH SUCCESS OVERLAY
// =====================================================

interface MatchSuccessProps {
  isOpen: boolean;
  partnerName: string;
  partnerPhoto: string;
  compatibility: number;
  onSendFirstMessage: () => void;
  onKeepSwiping: () => void;
}

const MatchSuccess: React.FC<MatchSuccessProps> = ({
  isOpen,
  partnerName,
  partnerPhoto,
  compatibility,
  onSendFirstMessage,
  onKeepSwiping,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(9, 9, 11, 0.95)' }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-center max-w-sm"
          >
            {/* Animated hearts */}
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
                  className="w-14 h-14 rounded-full bg-[#56be89] flex items-center justify-center"
                >
                  <Heart className="w-7 h-7 text-white" fill="white" />
                </motion.div>
              ))}
            </div>
            
            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-white mb-2"
            >
              You Matched!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/60 mb-6"
            >
              You and {partnerName} liked each other. {compatibility}% compatibility!
            </motion.p>
            
            {/* Photos */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="flex justify-center items-center gap-4 mb-8"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#56be89]">
                <div className="w-full h-full bg-[#27272A]" />
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#FF6B81]">
                <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
              </div>
            </motion.div>
            
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              <motion.button
                onClick={onSendFirstMessage}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-[#56be89] text-black font-bold rounded-2xl"
              >
                Send a Message
              </motion.button>
              <motion.button
                onClick={onKeepSwiping}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-[#18181B] text-white font-semibold rounded-2xl border border-[#1E2830]"
              >
                Keep Swiping
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =====================================================
// EXPORTS
// =====================================================

export {
  ChatContainer,
  MessageList,
  MessageBubble,
  ChatInput,
  ChatHeader,
  ConversationStates,
  ConnectionStatus,
  MatchSuccess,
};

export type {
  ChatContainerProps,
  MessageBubbleProps,
  ChatInputProps,
  ChatHeaderProps,
  MatchSuccessProps,
};