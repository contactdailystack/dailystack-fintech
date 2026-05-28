/**
 * DailyStack — Memberships Page (v3)
 * Redesigned to match GiGi Energy Reference:
 * - White background with gradient
 * - Bold hero-style typography
 * - Animated floating circles
 * - 3D cards with shadows
 * - Lime Green (#AAFF00) accent
 * 
 * Features:
 * - Membership cards list with 3D card styling
 * - Add new membership button
 * - Skeleton loading states
 * - Empty state design
 * - Multi-language (EN/TH)
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  WalletCards, Plus, CreditCard, ChevronLeft,
  Sparkles, Loader2, Gift, X
} from 'lucide-react';

// ─── Design System ───────────────────────────────────────────────────────────
const colors = {
  lime: '#AAFF00',
  limeDark: '#8FCC00',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#121212',
  textSecondary: '#57606A',
  textMuted: '#8B949E',
  border: '#E5E7EB',
  success: '#22C55E',
};

// ─── Font Helper ─────────────────────────────────────────────────────────────
const fontFor = (lang: 'en' | 'th') => lang === 'th' ? 'font-kanit' : 'font-sans';

// ─── Animated Floating Circle ───────────────────────────────────────────────
const FloatingCircle: React.FC<{
  size?: number;
  color?: string;
  blur?: number;
  duration?: number;
  delay?: number;
  className?: string;
}> = ({ size = 96, color = colors.lime, blur = 48, duration = 8, delay = 0, className = '' }) => (
  <div
    className={`absolute rounded-full pointer-events-none ${className}`}
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color}30, transparent 70%)`,
      filter: `blur(${blur}px)`,
    }}
    data-animate="float"
    data-delay={delay}
    data-duration={duration}
  />
);

// ─── Brand Logo ───────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative">
      <div className="absolute inset-0 bg-[#AAFF00] blur-xl opacity-20 rounded-full" />
      <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
        <defs>
          <linearGradient id="mb-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#AAFF00" />
            <stop offset="100%" stopColor="#8FCC00" />
          </linearGradient>
        </defs>
        <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#mb-grad)" opacity="0.55" />
        <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#mb-grad)" opacity="0.78" />
        <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#mb-grad)" />
        <path d="M50 29 L72 39 L50 47 L28 39 Z" fill="#121212" opacity="0.25" />
      </svg>
    </div>
    <span className="text-sm font-black tracking-[0.15em] uppercase">
      <span className="text-[#121212]">DAILY</span>
      <span className="text-[#AAFF00]">STACK</span>
    </span>
  </div>
);

// ─── Badge Label ───────────────────────────────────────────────────────────────
const BadgeLabel: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ 
  children, icon 
}) => (
  <div className="inline-flex items-center gap-2 bg-[#121212] text-white px-4 py-2 rounded-full text-xs font-mono tracking-wider">
    {icon && <span className="text-[#AAFF00]">{icon}</span>}
    {children}
  </div>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}> = ({ children, onClick, disabled = false, loading = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      relative px-6 py-3.5 rounded-full font-bold text-sm tracking-wide overflow-hidden
      disabled:opacity-50 disabled:cursor-not-allowed
      bg-[#AAFF00] text-[#121212]
      shadow-[0_4px_16px_rgba(170,255,0,0.3)]
      hover:shadow-[0_8px_32px_rgba(170,255,0,0.4)]
      hover:-translate-y-[1px] active:translate-y-0
      transition-all duration-300
      ${className}
    `}
  >
    {loading ? (
      <Loader2 size={18} className="animate-spin mx-auto" />
    ) : (
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    )}
  </button>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const CardSkeleton: React.FC = () => (
  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-[#F5F5F5] shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-[#F5F5F5] rounded-full w-2/3" />
      <div className="h-3 bg-[#F5F5F5] rounded-full w-1/3" />
    </div>
  </div>
);

// ─── Membership Card ─────────────────────────────────────────────────────────
interface MembershipCardData {
  id: string;
  brand_name: string;
  card_number?: string;
  tier?: string;
  points?: number;
}

const MembershipCard: React.FC<{ card: MembershipCardData; onClick?: () => void }> = ({ 
  card, onClick 
}) => (
  <div 
    onClick={onClick}
    className="relative bg-white rounded-2xl p-5 border border-[#E5E7EB] overflow-hidden group cursor-pointer
      hover:border-[#AAFF00]/50 hover:shadow-[0_8px_24px_rgba(170,255,0,0.15)] 
      active:scale-[0.98] transition-all duration-300"
    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
  >
    {/* Hover glow */}
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, rgba(170,255,0,0.1), transparent, rgba(170,255,0,0.1))',
        filter: 'blur(8px)',
      }}
    />
    
    {/* Top accent line */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#AAFF00] to-[#B8FF3A]" />
    
    <div className="relative z-10 flex items-center gap-4">
      {/* Card Icon */}
      <div className="w-14 h-14 bg-[#AAFF00]/10 rounded-2xl flex items-center justify-center shrink-0">
        <CreditCard size={24} className="text-[#AAFF00]" />
      </div>
      
      {/* Card Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#121212] text-base truncate leading-tight">
          {card.brand_name}
        </h3>
        <p className="text-xs text-[#8B949E] mt-1 uppercase tracking-wider">
          ID: {card.card_number || 'N/A'}
        </p>
        {card.tier && (
          <span className="inline-block mt-2 px-2 py-1 bg-[#F5F5F5] rounded-full text-[10px] font-bold text-[#57606A]">
            {card.tier}
          </span>
        )}
      </div>
      
      {/* Arrow */}
      <ChevronLeft size={20} className="text-[#8B949E] rotate-180 group-hover:text-[#AAFF00] transition-colors" />
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ onAdd?: () => void; language: 'en' | 'th' }> = ({ onAdd, language }) => (
  <div className="col-span-full py-16 text-center">
    {/* Decorative card icon */}
    <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
      <WalletCards size={36} className="text-[#8B949E]" />
    </div>
    
    <h3 className="text-lg font-bold text-[#121212] mb-2">
      {language === 'th' ? 'ยังไม่มีบัตรสมาชิก' : 'No Memberships Yet'}
    </h3>
    <p className="text-sm text-[#8B949E] mb-6 max-w-xs mx-auto">
      {language === 'th' 
        ? 'เพิ่มบัตรสมาชิกเพื่อรวบรวมคะแนนและสิทธิประโยชน์ทั้งหมดในที่เดียว'
        : 'Add your membership cards to collect points and rewards in one place'
      }
    </p>
    
    <PrimaryButton onClick={onAdd}>
      <Plus size={16} />
      {language === 'th' ? 'เพิ่มบัตร' : 'Add Card'}
    </PrimaryButton>
  </div>
);

// ─── Add Card Modal (Neo-Brutalist design) ──────────────────────────────────
interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: 'en' | 'th';
}

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onSuccess, language }) => {
  const [brandName, setBrandName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [tier, setTier] = useState('member');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('user_memberships')
        .insert({
          user_id: user.id,
          brand_name: brandName.trim(),
          card_number: cardNumber.trim() || null,
          tier: tier || 'member',
          status: 'active'
        });
      if (!error) {
        onSuccess();
        onClose();
        setBrandName('');
        setCardNumber('');
        setTier('member');
      } else {
        alert(language === 'th' ? 'เกิดข้อผิดพลาดในการบันทึก: ' + error.message : 'Error adding card: ' + error.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#121212] rounded-3xl p-6 w-full max-w-md relative shadow-[6px_6px_0px_#121212] overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#AAFF00]" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-[#AAFF00]" />
            <h2 className="text-xl font-black text-[#121212]">
              {language === 'th' ? 'เพิ่มบัตรสมาชิก' : 'Add Membership'}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#121212] bg-[#F5F5F5] flex items-center justify-center hover:bg-[#AAFF00] transition-colors"
          >
            <X size={16} className="text-[#121212]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-[#57606A] block mb-1.5 pl-1">
              {language === 'th' ? 'ชื่อแบรนด์ / ร้านค้า' : 'Brand Name'} *
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder={language === 'th' ? 'เช่น The Roasters Co.' : 'e.g. Starbucks'}
              className="w-full px-4 py-3.5 bg-[#F5F5F5] border-2 border-[#121212] rounded-xl focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#121212] text-sm text-[#121212] font-semibold transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-[#57606A] block mb-1.5 pl-1">
              {language === 'th' ? 'เลขบัตรสมาชิก' : 'Card Number'}
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="e.g. 12345678"
              className="w-full px-4 py-3.5 bg-[#F5F5F5] border-2 border-[#121212] rounded-xl focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#121212] text-sm text-[#121212] font-semibold transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-[#57606A] block mb-1.5 pl-1">
              {language === 'th' ? 'ระดับสมาชิก' : 'Tier'}
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#F5F5F5] border-2 border-[#121212] rounded-xl focus:bg-white focus:outline-none focus:shadow-[3px_3px_0px_#121212] text-sm text-[#121212] font-semibold transition-all"
            >
              <option value="member">{language === 'th' ? 'สมาชิกทั่วไป' : 'Member'}</option>
              <option value="silver">{language === 'th' ? 'ระดับเงิน (Silver)' : 'Silver'}</option>
              <option value="gold">{language === 'th' ? 'ระดับทอง (Gold)' : 'Gold'}</option>
              <option value="platinum">{language === 'th' ? 'ระดับแพลทินัม (Platinum)' : 'Platinum'}</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-full border-2 border-[#121212] bg-white text-[#121212] font-bold text-sm hover:bg-[#F5F5F5] active:scale-[0.98] transition-all"
            >
              {language === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <PrimaryButton
              loading={submitting}
              className="flex-1"
            >
              {language === 'th' ? 'บันทึกบัตร' : 'Save Card'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Memberships: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [cards, setCards] = useState<MembershipCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchMemberships = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_memberships')
        .select('*')
        .eq('user_id', user.id);
      if (data) setCards(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const toggleLanguage = () => setLanguage(language === 'en' ? 'th' : 'en');

  const handleAddCard = () => {
    setIsAddOpen(true);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white text-[#121212] font-sans relative overflow-hidden">

      {/* ── Background Decoration ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#AAFF00]/3 to-white" />
        <FloatingCircle size={200} blur={80} duration={10} delay={0} className="top-0 right-0" />
        <FloatingCircle size={150} blur={60} duration={8} delay={2} className="bottom-20 left-10" />
        <FloatingCircle size={100} blur={40} duration={12} delay={1} className="top-1/3 right-1/4" />
      </div>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#121212] hover:bg-[#E5E7EB] transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-[#AAFF00]/10 rounded-xl flex items-center justify-center">
                <WalletCards size={20} className="text-[#AAFF00]" />
              </div>
              <h1 className={`text-xl font-bold ${fontFor(language)}`}>
                {language === 'th' ? 'บัตรของฉัน' : 'My Memberships'}
              </h1>
            </div>
            
            {/* Card count badge */}
            {!loading && cards.length > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-[#AAFF00] text-[#121212] text-xs font-bold rounded-full">
                {cards.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-full bg-[#F5F5F5] text-xs font-bold hover:text-[#AAFF00] transition-colors"
            >
              <span className={language === 'en' ? 'text-[#AAFF00]' : 'opacity-50'}>EN</span>
              <span className="opacity-30 mx-1">/</span>
              <span className={language === 'th' ? 'text-[#AAFF00]' : 'opacity-50'}>TH</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6">

        {/* Hero Section */}
        <div className="mb-8">
          <BadgeLabel icon={<Sparkles size={12} />}>
            {language === 'th' ? 'กระเป๋าเงินดิจิทัล' : 'DIGITAL WALLET'}
          </BadgeLabel>
          <h1 className={`text-3xl md:text-4xl font-black tracking-tight text-[#121212] mt-3 ${fontFor(language)}`}>
            {language === 'th' ? 'บัตรสมาชิกทั้งหมด' : 'All Your Cards'}
          </h1>
          <p className="text-sm text-[#57606A] mt-2">
            {language === 'th' 
              ? 'รวบรวมบัตรสมาชิกและสิทธิประโยชน์ในที่เดียว'
              : 'Collect all your memberships and rewards in one place'
            }
          </p>
          <div className="h-[3px] w-12 bg-[#AAFF00] rounded-full mt-3" />
        </div>

        {/* Section Label */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-widest">
            {loading 
              ? (language === 'th' ? 'กำลังโหลด…' : 'Loading…')
              : (language === 'th' ? `บัตรทั้งหมด ${cards.length} ใบ` : `All cards (${cards.length})`)
            }
          </p>
          {cards.length > 0 && (
            <span className="text-xs text-[#AAFF00] font-medium flex items-center gap-1">
              <Gift size={14} />
              {language === 'th' ? 'คะแนนรวม: 1,250' : 'Total points: 1,250'}
            </span>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : cards.length > 0 ? (
            cards.map((card) => (
              <MembershipCard 
                key={card.id} 
                card={card}
                onClick={() => navigate('/memberships/' + card.id)}
              />
            ))
          ) : (
            <EmptyState onAdd={handleAddCard} language={language} />
          )}
        </div>
      </main>

      {/* ── Floating Add Button ─────────────────────────────────────────────── */}
      {cards.length > 0 && (
        <button
          onClick={handleAddCard}
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          className="fixed right-5 md:right-10 z-30
            bg-[#AAFF00] text-[#121212] w-14 h-14 rounded-full
            flex items-center justify-center
            shadow-[0_8px_32px_rgba(170,255,0,0.4)]
            hover:scale-105 active:scale-95 transition-all"
          aria-label="Add membership card"
        >
          <Plus size={24} />
        </button>
      )}

      {/* ── CSS Animations ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        
        [data-animate="float"] {
          animation: float var(--duration, 8s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
      `}</style>

      {/* Add Card Modal */}
      <AddCardModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={fetchMemberships} 
        language={language} 
      />
    </div>
  );
};

export { Memberships };
export default Memberships;