/**
 * DailyStack — Matches List Screen
 * Grid/list of all your matches with filters and search
 * 
 * Design: Coral (#FF6B81) theme with real-time updates
 * Multi-language: EN / TH
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Search, Filter, Heart, Sparkles, Crown,
  Zap, Clock, MessageCircle, MoreHorizontal, Star,
  Users, TrendingUp, CheckCircle2, ArrowUpDown, Grid, List
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { DatingService } from '../../services/datingService';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MatchUser {
  id: string;
  name: string;
  age: number;
  photo: string;
  compatibility: number;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  online?: boolean;
  isUltraMatch?: boolean;
  sharedInterests: string[];
  matchedAt: Date;
  hasConversation?: boolean;
}

interface MatchFilters {
  sortBy: 'recent' | 'compatibility' | 'unread';
  filterBy: 'all' | 'ultra' | 'unread' | 'messages';
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fontFor = (lang: 'en' | 'th') => lang === 'th' ? 'font-kanit' : 'font-sans';

const formatTimeAgo = (date: Date, lang: 'en' | 'th'): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (mins < 1) return lang === 'th' ? 'แทบทันที' : 'Just now';
  if (mins < 60) return lang === 'th' ? `${mins} นาที` : `${mins}m`;
  if (hours < 24) return lang === 'th' ? `${hours} ชม.` : `${hours}h`;
  if (days < 7) return lang === 'th' ? `${days} วัน` : `${days}d`;
  return lang === 'th' ? `${Math.floor(days / 7)} สัปดาห์` : `${Math.floor(days / 7)}w`;
};

// ─── Match Card ────────────────────────────────────────────────────────────────
interface MatchCardProps {
  match: MatchUser;
  onChat: () => void;
  onProfile: () => void;
  lang: 'en' | 'th';
  viewMode: 'list' | 'grid';
}
const MatchCard: React.FC<MatchCardProps> = ({ match, onChat, onProfile, lang, viewMode }) => {
  const isList = viewMode === 'list';
  
  if (isList) {
    return (
      <div
        onClick={onChat}
        className="flex items-center gap-4 p-4 rounded-2xl bg-[#232D38] border border-[rgba(255,255,255,0.06)]
          hover:border-[rgba(255,255,255,0.08)] active:scale-[0.98] transition-all cursor-pointer group"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[rgba(255,255,255,0.06)]">
            <img src={match.photo} alt={match.name} className="w-full h-full object-cover" />
          </div>
          
          {/* Online indicator */}
          {match.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#22C55E] border-2 border-[#0D1117]" />
          )}
          
          {/* Ultra badge */}
          {match.isUltraMatch && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-[#D9FD82] to-[#56be89] flex items-center justify-center shadow-sm">
              <Zap size={10} className="text-[#0D1117]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[#56be89] transition-colors">
                {match.name}, {match.age}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {match.unreadCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-[#FF6B81] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{match.unreadCount}</span>
                </div>
              )}
              <span className="text-[11px] text-[var(--text-muted)]">
                {match.lastMessageTime && formatTimeAgo(match.lastMessageTime, lang)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              <Star size={10} className="text-[#D9FD82]" fill="#FFD700" />
              <span className="text-[11px] font-bold text-[#D9FD82]">{match.compatibility}%</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">·</span>
            <div className="flex items-center gap-1">
              {match.sharedInterests.slice(0, 2).map(interest => (
                <span key={interest} className="text-[10px] text-[var(--text-secondary)]">{interest}</span>
              ))}
            </div>
          </div>
          
          <p className={`text-xs truncate ${match.unreadCount > 0 ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}`}>
            {match.lastMessage || (lang === 'th' ? 'ยังไม่ได้ส่งข้อความ' : 'No messages yet')}
          </p>
        </div>

        {/* Chat button */}
        <button
          onClick={(e) => { e.stopPropagation(); onChat(); }}
          className="w-10 h-10 rounded-full bg-[rgba(86,190,137,0.1)] flex items-center justify-center shrink-0
            hover:bg-[rgba(86,190,137,0.2)] transition-colors"
        >
          <MessageCircle size={18} className="text-[#56be89]" />
        </button>
      </div>
    );
  }
  
  // Grid mode
  return (
    <div
      onClick={onChat}
      className="rounded-2xl overflow-hidden bg-[#232D38] border border-[rgba(255,255,255,0.06)]
        hover:border-[rgba(255,255,255,0.08)] active:scale-[0.98] transition-all cursor-pointer group"
    >
      {/* Photo */}
      <div className="relative aspect-[3/4]">
        <img src={match.photo} alt={match.name} className="w-full h-full object-cover" />
        
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {match.isUltraMatch && (
            <div className="px-2 py-1 rounded-full bg-gradient-to-r from-[#D9FD82] to-[#56be89] flex items-center gap-1">
              <Zap size={10} className="text-[#0D1117]" />
              <span className="text-[9px] font-black text-[#0D1117]">ULTRA</span>
            </div>
          )}
        </div>
        
        {/* Online */}
        {match.online && (
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#232D38]" />
        )}
        
        {/* Unread */}
        {match.unreadCount > 0 && (
          <div className="absolute bottom-16 right-2 px-2 py-1 rounded-full bg-[#FF6B81] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{match.unreadCount}</span>
          </div>
        )}
        
        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white">{match.name}, {match.age}</span>
            <Star size={12} className="text-[#D9FD82]" fill="#FFD700" />
            <span className="text-[11px] font-bold text-[#D9FD82]">{match.compatibility}%</span>
          </div>
          <p className="text-[10px] text-white/60 truncate">
            {match.lastMessage || (lang === 'th' ? 'ยังไม่ได้ส่งข้อความ' : 'No messages yet')}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Filter Chip ────────────────────────────────────────────────────────────────
interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ElementType;
}
const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap
      ${active
        ? 'bg-[rgba(86,190,137,0.15)] text-[#56be89] border border-[rgba(86,190,137,0.2)]'
        : 'bg-[#232D38] text-[var(--text-secondary)] border border-[rgba(255,255,255,0.06)]'
      }`}
  >
    {Icon && <Icon size={12} />}
    {label}
  </button>
);

// ─── Empty State ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  lang: 'en' | 'th';
  type: 'all' | 'ultra' | 'unread';
  onExplore: () => void;
}
const EmptyState: React.FC<EmptyStateProps> = ({ lang, type, onExplore }) => {
  const messages = {
    all: { title: 'No matches yet', titleTh: 'ยังไม่มีการแมตช์', desc: 'Start swiping to find your perfect match!', descTh: 'เริ่มปัดเพื่อหาคู่ที่เหมาะกับคุณ!' },
    ultra: { title: 'No Ultra Matches', titleTh: 'ยังไม่มีอัลตร้า แมตช์', desc: 'Keep swiping to find someone special!', descTh: 'ปัดต่อไปเพื่อหาคนพิเศษ!' },
    unread: { title: 'All caught up!', titleTh: 'ตามทันหมดแล้ว!', desc: 'No unread messages. Great job!', descTh: 'ไม่มีข้อความที่ยังไม่ได้อ่าน ทำได้ดีมาก!' },
  };
  
  const msg = messages[type];
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[rgba(86,190,137,0.1)] flex items-center justify-center mb-6">
        <Heart size={40} className="text-[#56be89]" />
      </div>
      <h3 className={`text-lg font-bold text-[var(--text-primary)] mb-2 ${fontFor(lang)}`}>
        {lang === 'th' ? msg.titleTh : msg.title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs">
        {lang === 'th' ? msg.descTh : msg.desc}
      </p>
      <button
        onClick={onExplore}
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#56be89] to-[#3D9E6E]
          font-bold text-sm text-white shadow-lg shadow-[#56be89]/30"
      >
        {lang === 'th' ? 'เริ่มปัดเลย' : 'Start Exploring'}
      </button>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const MatchesList: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [filters, setFilters] = useState<MatchFilters>({
    sortBy: 'recent',
    filterBy: 'all',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // ── Load matches from backend ──────────────────────────────────────────────
  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const realMatches = await DatingService.match.getMatches();
        
        // Map API response to UI format
        const mappedMatches: MatchUser[] = realMatches.map(m => ({
          id: m.partnerId,
          name: m.partnerName,
          age: 0, // Not available in match data
          photo: m.partnerAvatar || '',
          compatibility: Math.round(m.compatibilityScore),
          unreadCount: 0,
          online: false,
          isUltraMatch: m.isUltraMatch,
          sharedInterests: m.sharedInterests || [],
          matchedAt: new Date(m.matchedAt || Date.now()),
          hasConversation: false,
        }));
        
        setMatches(mappedMatches);
      } catch (error) {
        console.error('Failed to load matches:', error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = DatingService.match.subscribeToMatches((newMatch) => {
      // Add new match to the list
      setMatches(prev => {
        // Check if already exists
        if (prev.find(m => m.id === newMatch.id)) return prev;
        
        const newMatchUser: MatchUser = {
          id: newMatch.partnerId,
          name: newMatch.partnerName,
          age: 0,
          photo: newMatch.partnerAvatar || '',
          compatibility: Math.round(newMatch.compatibilityScore),
          unreadCount: 0,
          online: false,
          isUltraMatch: newMatch.isUltraMatch,
          sharedInterests: [],
          matchedAt: new Date(newMatch.matchedAt || Date.now()),
          hasConversation: false,
        };
        
        return [newMatchUser, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ── Filter & sort matches ─────────────────────────────────────────────────
  const filteredMatches = matches
    .filter(match => {
      // Search filter
      if (searchQuery && !match.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      switch (filters.filterBy) {
        case 'ultra':
          return match.isUltraMatch;
        case 'unread':
          return match.unreadCount > 0;
        case 'messages':
          return match.hasConversation;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'compatibility':
          return b.compatibility - a.compatibility;
        case 'unread':
          return b.unreadCount - a.unreadCount;
        default: // recent
          return (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0);
      }
    });

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    total: matches.length,
    ultra: matches.filter(m => m.isUltraMatch).length,
    unread: matches.filter(m => m.unreadCount > 0).length,
    withMessages: matches.filter(m => m.hasConversation).length,
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[#232D38] font-sans feature-dating">

      {/* ── Top Header ───────────────────────────────────────────────────── */}
      <header className="shrink-0 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]
        bg-[#1C232A] backdrop-blur-xl z-10">
        
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/dating')}
            className="w-9 h-9 rounded-full bg-[#232D38] flex items-center justify-center"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {lang === 'th' ? 'การแมตช์ของฉัน' : 'My Matches'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/dating/discover')}
            className="w-9 h-9 rounded-full bg-[rgba(86,190,137,0.1)] flex items-center justify-center"
          >
            <Heart size={18} className="text-[#56be89]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'th' ? 'ค้นหาการแมตช์...' : 'Search matches...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#232D38] border border-[rgba(255,255,255,0.06)]
              text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:border-[#FF6B81]/40 focus:outline-none transition-all"
          />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#232D38] shrink-0">
            <Heart size={12} className="text-[#56be89]" />
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">{stats.total}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFD700]/10 shrink-0">
            <Zap size={12} className="text-[#D9FD82]" />
            <span className="text-[11px] font-medium text-[#D9FD82]">{stats.ultra} Ultra</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22C55E]/10 shrink-0">
            <MessageCircle size={12} className="text-[#22C55E]" />
            <span className="text-[11px] font-medium text-[#22C55E]">{stats.withMessages} Chats</span>
          </div>
          {stats.unread > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(86,190,137,0.2)] shrink-0">
              <span className="text-[11px] font-bold text-[#56be89]">{stats.unread} {lang === 'th' ? 'ยังไม่อ่าน' : 'Unread'}</span>
            </div>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <FilterChip
            label={lang === 'th' ? 'ทั้งหมด' : 'All'}
            active={filters.filterBy === 'all'}
            onClick={() => setFilters(f => ({ ...f, filterBy: 'all' }))}
          />
          <FilterChip
            label={lang === 'th' ? 'อัลตร้า' : 'Ultra'}
            icon={Zap}
            active={filters.filterBy === 'ultra'}
            onClick={() => setFilters(f => ({ ...f, filterBy: 'ultra' }))}
          />
          <FilterChip
            label={lang === 'th' ? 'ยังไม่อ่าน' : 'Unread'}
            icon={MessageCircle}
            active={filters.filterBy === 'unread'}
            onClick={() => setFilters(f => ({ ...f, filterBy: 'unread' }))}
          />
          <FilterChip
            label={lang === 'th' ? 'ข้อความ' : 'Messages'}
            icon={Users}
            active={filters.filterBy === 'messages'}
            onClick={() => setFilters(f => ({ ...f, filterBy: 'messages' }))}
          />
          
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <button
              onClick={() => setFilters(f => ({ ...f, sortBy: f.sortBy === 'recent' ? 'compatibility' : 'recent' }))}
              className="w-8 h-8 rounded-lg bg-[#232D38] flex items-center justify-center"
              title={lang === 'th' ? 'เรียงลำดับ' : 'Sort'}
            >
              <ArrowUpDown size={14} className="text-[var(--text-secondary)]" />
            </button>
            <button
              onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
              className="w-8 h-8 rounded-lg bg-[#232D38] flex items-center justify-center"
              title={lang === 'th' ? 'เปลี่ยนมุมมอง' : 'View'}
            >
              {viewMode === 'list' ? <Grid size={14} className="text-[var(--text-secondary)]" /> : <List size={14} className="text-[var(--text-secondary)]" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Matches List ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#232D38]/30 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-[#232D38]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#232D38] rounded w-1/3" />
                  <div className="h-3 bg-[#232D38] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            lang={lang}
            type={filters.filterBy as 'all' | 'ultra' | 'unread'}
            onExplore={() => navigate('/dating/discover')}
          />
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                lang={lang}
                viewMode="list"
                onChat={() => navigate(`/dating/chat/${match.id}`)}
                onProfile={() => navigate(`/dating/compatibility/${match.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                lang={lang}
                viewMode="grid"
                onChat={() => navigate(`/dating/chat/${match.id}`)}
                onProfile={() => navigate(`/dating/compatibility/${match.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-4 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => navigate('/dating/discover')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#56be89] to-[#3D9E6E]
            font-bold text-base text-white shadow-lg shadow-[#56be89]/30
            flex items-center justify-center gap-3"
        >
          <Sparkles size={20} />
          {lang === 'th' ? 'หาคู่เพิ่มเติม' : 'Find More Matches'}
        </button>
      </div>
    </div>
  );
};

export default MatchesList;