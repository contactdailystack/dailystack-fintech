/**
 * DailyStack — Chat Components Index
 * Phase 4: Chat Component & Conversation Experience
 * 
 * Barrel export for all chat components
 * Usage: import { ChatContainer, ConversationsList } from '@/components/chat';
 */

export { 
  ChatContainer, 
  MessageList, 
  MessageBubble, 
  ChatInput, 
  ChatHeader, 
  ConversationStates, 
  ConnectionStatus, 
  MatchSuccess 
} from './ChatContainer';

export type {
  Message,
  Conversation,
  ChatState,
  ChatContainerProps,
  MessageBubbleProps,
  ChatInputProps,
  ChatHeaderProps,
  MatchSuccessProps,
} from './ChatContainer';

export { 
  ConversationsList, 
  ConversationItem, 
  EmptyConversations, 
  SectionHeader 
} from './ConversationsList';

export type {
  ConversationsListProps,
  ConversationItemProps,
  EmptyConversationsProps,
  SectionHeaderProps,
} from './ConversationsList';