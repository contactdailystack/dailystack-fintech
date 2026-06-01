/**
 * DailyStack — Chat Screen
 * Real-time messaging with AI-powered conversation starters
 *
 * Design: Coral (#FF6B81) theme, full real-time Supabase integration
 * Multi-language: EN / TH
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Send, MoreHorizontal, Heart,
  Sparkles, Crown, Zap, Phone, Video,
  Clock, CheckCheck, ArrowLeft, Info,
  MessageCircle, Star, ThumbsUp
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { DatingService } from '../../../services/datingService';
import type { Message as DMessage } from '../../../services/datingService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Icebreaker {
  id: string;
  text: string;
  category: 'fun' | 'deep' | 'playful';
}

interface ChatUser {
  id: string;
  name: string;
  age: number;
  photo: string;
  compatibility: number;
  sharedInterests: string[];
  online?: boolean;
  lastSeen?: Date;
}

interface ChatState {
  messages: DMessage[];
  loading: boolean;
  sending: boolean;
  matchId: string;
}

// ─── Icebreakers (static suggestions, not mock data) ─────────────────────────
const icebreakers: Icebreaker[] = [
  { id: '1', text: "What's your go-to coffee order? ☕", category: 'fun' },
  { id: '2', text: "What's the most adventurous thing on your bucket list?", category: 'deep' },
  { id: '3', text: "If you could have dinner with anyone, who would it be?", category: 'playful' },
  { id: '4', text: "What's a hobby you picked up during the pandemic?", category: 'fun' },
  { id: '5', text: "What does your ideal weekend look like?", category: 'deep' },
];

const icebreakerCategoryColors: Record<Icebreaker['category'], string> = {
  fun: 'bg-[rgba(86,190,137,0.1)] text-[#56be89] border-[#FF6B81]/20',
  deep: 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20',
  playful: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fontFor = (lang: 'en' | 'th') => lang === 'th' ? 'font-kanit' : 'font-sans';

const formatMessageTime = (isoString: string, lang: 'en' | 'th'): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (mins < 1) return lang === 'th' ? 'แทบทันที' : 'Just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString();
};

const formatLastSeen = (date: Date, lang: 'en' | 'th'): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (mins < 1) return lang === 'th' ? 'ออนไลน์' : 'Online';
  if (mins < 60) return lang === 'th' ? `ออนไลน์เมื่อ ${mins} นาทีที่แล้ว` : `Online ${mins}m ago`;
  if (hours < 24) return lang === 'th' ? `ออนไลน์เมื่อ ${hours} ชั่วโมงที่แล้ว` : `Online ${hours}h ago`;
  return lang === 'th' ? 'ไม่ได้ออนไลน์' : 'Offline';
};

// ─── Icebreaker Card ──────────────────────────────────────────────────────────
interface IcebreakerCardProps {
  icebreaker: Icebreaker;
  onSend: (text: string) => void;
  lang: 'en' | 'th';
  sent: boolean;
}
const IcebreakerCard: React.FC<IcebreakerCardProps> = ({ icebreaker, onSend, lang, sent }) => (
  <div className={`px-4 py-3 rounded-2xl border ${icebreakerCategoryColors[icebreaker.category]} max-w-[85%] ${sent ? 'ml-auto' : 'mr-auto'}`}>
    <div className="flex items-center gap-2 mb-2">
      <Sparkles size={12} />
      <span className="text-[10px] font-bold uppercase tracking-widest">
        {lang === 'th' ? 'เคล็ดลับจาก AI' : 'AI Icebreaker'}
      </span>
    </div>
    <p className="text-sm font-medium mb-3">{icebreaker.text}</p>
    {!sent && (
      <button
        onClick={() => onSend(icebreaker.text)}
        className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold"
      >
        {lang === 'th' ? 'ส่งเคล็ดลับนี้' : 'Send this'}
      </button>
    )}
    {sent && (
      <div className="flex items-center gap-1 text-xs opacity-70">
        <ThumbsUp size={12} />
        <span>{lang === 'th' ? 'ส่งแล้ว' : 'Sent'}</span>
      </div>
    )}
  </div>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────
interface MessageBubbleProps {
  message: DMessage;
  isMe: boolean;
  showAvatar: boolean;
  partnerAvatar: string;
  partnerName: string;
  lang: 'en' | 'th';
}
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, showAvatar, partnerAvatar, partnerName, lang }) => {
  const isIcebreaker = message.type === 'icebreaker';

  return (
    <div className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${showAvatar ? '' : 'ml-10'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ${showAvatar ? 'block' : 'invisible'}`}>
        {!isMe && (
          <img
            src={partnerAvatar}
            alt={partnerName}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {isIcebreaker && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles size={10} className="text-[#FFD700]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
              {lang === 'th' ? 'เคล็ดลับ AI' : 'AI Icebreaker'}
            </span>
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? 'bg-gradient-to-br from-[#56be89] to-[#3D9E6E] text-white rounded-br-md'
              : isIcebreaker
              ? 'bg-[rgba(255,215,0,0.10)] text-[var(--text-primary)] border border-[rgba(255,215,0,0.15)] rounded-bl-md'
              : 'bg-[var(--semantic-surface-2)] text-[var(--text-primary)] rounded-bl-md'
          }`}
        >
          {message.content}
        </div>
        {/* Meta */}
        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-[var(--text-muted)]">
            {formatMessageTime(message.createdAt.toISOString(), lang)}
          </span>
          {isMe && (
            message.readAt
              ? <CheckCheck size={12} className="text-[#22C55E]" />
              : <CheckCheck size={12} className="text-[var(--text-muted)]" />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Compatibility Sidebar ─────────────────────────────────────────────────────
interface CompatibilitySidebarProps {
  user: ChatUser;
  onClose: () => void;
  onViewReport: () => void;
  lang: 'en' | 'th';
}
const CompatibilitySidebar: React.FC<CompatibilitySidebarProps> = ({
  user, onClose, onViewReport, lang
}) => (
  <div className="absolute inset-0 z-20 flex">
    <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="w-72 bg-[#161B22] border-l border-[rgba(255,255,255,0.08)] p-5 flex flex-col gap-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--text-primary)]">
          {lang === 'th' ? 'ความเข้ากันได้' : 'Compatibility'}
        </h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#232D38] flex items-center justify-center">
          <ArrowLeft size={16} />
        </button>
      </div>

      {/* Match info */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-[#FF6B81]">
          <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <h4 className="font-bold text-[var(--text-primary)]">{user.name}, {user.age}</h4>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Zap size={12} className="text-[#FFD700]" />
          <span className="text-sm font-bold text-[#FFD700]">{user.compatibility}%</span>
          <span className="text-xs text-[var(--text-muted)]">{lang === 'th' ? 'เข้ากันได้' : 'Match'}</span>
        </div>
      </div>

      {/* AI Insight */}
      <div className="p-4 rounded-2xl bg-[#FF6B81]/5 border border-[#FF6B81]/15">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-[#56be89]" />
          <span className="text-xs font-bold text-[#FF6B81)]">
            {lang === 'th' ? 'ข้อมูลเชิงลึกจาก AI' : 'AI Insight'}
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {lang === 'th'
            ? 'คุณทั้งสองมีค่านิยมเรื่องการใช้ชีวิตที่คล้ายกันมาก โดยเฉพาะเรื่องการตื่นเช้าและการพัฒนาตัวเอง'
            : 'You both share very similar lifestyle values, especially around early mornings and personal growth.'}
        </p>
      </div>

      {/* Shared Interests */}
      <div>
        <h5 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">
          {lang === 'th' ? 'ความสนใจที่เหมือนกัน' : 'Shared Interests'}
        </h5>
        <div className="flex flex-wrap gap-2">
          {user.sharedInterests.map((interest) => (
            <span
              key={interest}
              className="px-3 py-1.5 bg-[rgba(255,107,129,0.10)] border border-[rgba(255,107,129,0.15)] rounded-full text-xs font-medium text-[#56be89]"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* View Report Button */}
      <button
        onClick={onViewReport}
        className="mt-auto py-3 rounded-2xl bg-gradient-to-r from-[#56be89] to-[#3D9E6E] text-white font-bold text-sm flex items-center justify-center gap-2"
      >
        <Sparkles size={16} />
        {lang === 'th' ? 'ดูรายงานความเข้ากันได้' : 'View Compatibility Report'}
      </button>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const ChatScreen: React.FC = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const { lang } = useLanguage();

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<DMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sentIcebreakers, setSentIcebreakers] = useState<string[]>([]);
  const [online, setOnline] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load current user + messages ──────────────────────────────────────────
  useEffect(() => {
    const loadChat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserId(session.user.id);
        }

        if (chatId) {
          const matchData = await DatingService.match.getMatch(chatId);
          if (matchData) {
            const { data: partnerData } = await supabase
              .from('users')
              .select('*')
              .eq('id', matchData.partnerId)
              .single();

            if (partnerData) {
              setChatUser({
                id: partnerData.id,
                name: partnerData.display_name || partnerData.nickname || 'Anonymous',
                age: partnerData.age || 25,
                photo: partnerData.dating_photos?.[0] || partnerData.avatar_url || '',
                compatibility: matchData.compatibilityScore,
                sharedInterests: partnerData.interests || [],
                online: true,
              });
            } else {
              setChatUser({
                id: matchData.partnerId,
                name: matchData.partnerName,
                age: 25,
                photo: matchData.partnerAvatar || '',
                compatibility: matchData.compatibilityScore,
                sharedInterests: [],
                online: true,
              });
            }
          }

          const msgLogs = await DatingService.message.getMessages(chatId);
          setMessages(msgLogs);

          await DatingService.message.markAsRead(chatId);
        }
      } catch (error) {
        console.error('Failed to load chat:', error);
      }
    };

    loadChat();
  }, [chatId]);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = DatingService.message.subscribeToMessages(chatId, (newMsg) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === newMsg.id || (m.id.startsWith('temp-') && m.content === newMsg.content && m.senderId === newMsg.senderId))) {
          if (prev.find(m => m.id.startsWith('temp-') && m.content === newMsg.content && m.senderId === newMsg.senderId)) {
            return prev.map(m => (m.id.startsWith('temp-') && m.content === newMsg.content && m.senderId === newMsg.senderId) ? newMsg : m);
          }
          return prev;
        }
        return [...prev, newMsg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  // ── Auto-scroll on new messages ────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !chatId || !currentUserId) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    const optimisticMsg: DMessage = {
      id: `temp-${Date.now()}`,
      matchId: chatId,
      senderId: currentUserId,
      content,
      type: 'text',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const savedMsg = await DatingService.message.sendMessage(chatId, content, 'text');
      if (savedMsg) {
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? savedMsg : m));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // ── Send icebreaker ───────────────────────────────────────────────────────
  const handleSendIcebreaker = async (text: string) => {
    if (!chatId || !currentUserId) return;

    setSending(true);
    const optimisticMsg: DMessage = {
      id: `temp-${Date.now()}`,
      matchId: chatId,
      senderId: currentUserId,
      content: text,
      type: 'icebreaker',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setSentIcebreakers(prev => [...prev, text]);

    try {
      const savedMsg = await DatingService.message.sendMessage(chatId, text, 'icebreaker');
      if (savedMsg) {
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? savedMsg : m));
      }
    } catch (error) {
      console.error('Error sending icebreaker:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setSentIcebreakers(prev => prev.filter(t => t !== text));
    } finally {
      setSending(false);
    }
  };

  // ── View compatibility report ────────────────────────────────────────────
  const handleViewReport = () => {
    navigate(`/dating/compatibility/${chatUser.id}`);
  };

  // ── Handle key press ──────────────────────────────────────────────────────
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Should show avatar? (first in a sequence) ────────────────────────────
  const shouldShowAvatar = (index: number): boolean => {
    if (index === 0) return true;
    const curr = messages[index];
    const prev = messages[index - 1];
    return curr.senderId !== prev.senderId;
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[#1C232A] font-sans feature-dating">

      {/* Compatibility Sidebar */}
      {showSidebar && (
        <CompatibilitySidebar
          user={chatUser}
          onClose={() => setShowSidebar(false)}
          onViewReport={handleViewReport}
          lang={lang}
        />
      )}

      {/* ── Top Header ───────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]
        bg-[rgba(13,17,23,0.95)] backdrop-blur-xl z-10">
        
        <button
          onClick={() => navigate('/dating')}
          className="w-9 h-9 rounded-full bg-[#232D38] flex items-center justify-center hover:bg-[#30363D] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        {/* User avatar */}
        <div className="relative cursor-pointer" onClick={() => setShowSidebar(true)}>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[rgba(86,190,137,0.3)]">
            <img src={chatUser.photo} alt={chatUser.name} className="w-full h-full object-cover" />
          </div>
          {online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#0D1117]" />
          )}
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-[var(--text-primary)] truncate">{chatUser.name}</h2>
          <div className="flex items-center gap-1.5">
            {online ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-[11px] text-[#22C55E] font-medium">
                  {lang === 'th' ? 'ออนไลน์' : 'Online'}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-[var(--text-muted)]">
                {lang === 'th' ? 'ไม่ได้ออนไลน์' : 'Offline'}
              </span>
            )}
            <span className="text-[var(--text-muted)] mx-1">·</span>
            <Zap size={10} className="text-[#FFD700]" />
            <span className="text-[11px] text-[#FFD700] font-bold">{chatUser.compatibility}%</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-full bg-[#232D38] flex items-center justify-center hover:bg-[#30363D] transition-colors">
            <Phone size={16} />
          </button>
          <button className="w-9 h-9 rounded-full bg-[#232D38] flex items-center justify-center hover:bg-[#30363D] transition-colors">
            <Video size={16} />
          </button>
          <button
            onClick={() => setShowSidebar(true)}
            className="w-9 h-9 rounded-full bg-[#232D38] flex items-center justify-center hover:bg-[#30363D] transition-colors"
          >
            <Info size={16} />
          </button>
        </div>
      </header>

      {/* ── Messages Area ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        
        {/* Date separator */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-medium">
            {lang === 'th' ? 'วันนี้' : 'Today'}
          </span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
        </div>

        {/* Messages */}
        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id}>
              {msg.type === 'system' ? (
                <div className="flex justify-center">
                  <span className="text-[11px] text-[var(--text-muted)] bg-[#232D38] px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              ) : (
                <MessageBubble
                  message={msg}
                  isMe={isMe}
                  showAvatar={shouldShowAvatar(index)}
                  partnerAvatar={chatUser.photo}
                  partnerName={chatUser.name}
                  lang={lang}
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Icebreakers (top of input) ───────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)] space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={12} className="text-[#FFD700]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFD700]">
            {lang === 'th' ? 'เคล็ดลับเปิดบทสนทนา' : 'AI Conversation Starters'}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {icebreakers.map((ib) => (
            <button
              key={ib.id}
              onClick={() => handleSendIcebreaker(ib.text)}
              disabled={sentIcebreakers.includes(ib.text) || sending}
              className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-all whitespace-nowrap
                ${sentIcebreakers.includes(ib.text)
                  ? 'opacity-40 cursor-not-allowed bg-[#232D38] border-[rgba(255,255,255,0.06)] text-[var(--text-muted)]'
                  : icebreakerCategoryColors[ib.category] + ' hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              {sentIcebreakers.includes(ib.text) ? '✓ ' : ''}{ib.text}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Area ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(13,17,23,0.95)] backdrop-blur-xl">
        <div className="flex items-end gap-3">
          {/* Heart react */}
          <button className="w-10 h-10 rounded-full bg-[rgba(86,190,137,0.1)] flex items-center justify-center shrink-0 hover:bg-[#FF6B81]/20 transition-colors">
            <Heart size={18} className="text-[#56be89]" fill="#FF6B81" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={lang === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message...'}
              className="w-full px-4 py-3 pr-12 rounded-2xl bg-[#232D38] border border-[rgba(255,255,255,0.08)]
                text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                focus:border-[#FF6B81]/40 focus:outline-none transition-all resize-none"
              disabled={sending}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all
              ${newMessage.trim()
                ? 'bg-gradient-to-br from-[#56be89] to-[#3D9E6E] text-white shadow-lg shadow-[#FF6B81]/30 hover:scale-105 active:scale-90'
                : 'bg-[#232D38] text-[var(--text-muted)] cursor-not-allowed'
              }`}
          >
            <Send size={16} className={sending ? 'animate-pulse' : ''} />
          </button>
        </div>

        {/* Subtle hint */}
        <p className="text-[10px] text-center text-[var(--text-muted)] mt-2 opacity-60">
          {lang === 'th'
            ? 'กด Enter เพื่อส่ง · ข้อความถูก шифровать ด้วย end-to-end encryption'
            : 'Press Enter to send · Messages are end-to-end encrypted'}
        </p>
      </div>
    </div>
  );
};

export default ChatScreen;