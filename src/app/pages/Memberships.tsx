import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { WalletCards, Plus, CreditCard, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const CardSkeleton: React.FC = () => (
  <div className="bg-white border-0 shadow-sm rounded-2xl p-4 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-gray-200 rounded-full w-2/3" />
      <div className="h-2.5 bg-gray-200 rounded-full w-1/3" />
    </div>
  </div>
);

// ─── Single membership card ───────────────────────────────────────────────────
interface MembershipCardData {
  id: string;
  brand_name: string;
  card_number?: string;
}
const MembershipCard: React.FC<{ card: MembershipCardData; index: number }> = ({ card, index }) => {
  const mod = index % 3;
  const seqNum = String(index + 1).padStart(2, '0');
  
  // Dynamic Pilo color-block themes
  let cardBg: string;
  let iconBg: string;
  let titleColor: string;
  let numColor: string;
  let idColor: string;
  
  if (mod === 0) {
    // Solid Pilo Lime
    cardBg = 'bg-primary text-[#000000] border-transparent shadow-lg';
    iconBg = 'bg-black/10 text-[#000000]';
    titleColor = 'text-[#000000]';
    idColor = 'text-[#000000]/65';
    numColor = 'text-[#000000]/20';
  } else if (mod === 1) {
    // Solid Pilo Charcoal
    cardBg = 'bg-[#000000] text-white border-transparent shadow-lg';
    iconBg = 'bg-white/10 text-primary shadow-md';
    titleColor = 'text-white';
    idColor = 'text-gray-400';
    numColor = 'text-white/20';
  } else {
    // Solid Pilo White
    cardBg = 'bg-white text-[#000000] border border-black/5 shadow-lg';
    iconBg = 'bg-[#000000] text-primary shadow-md';
    titleColor = 'text-[#000000]';
    idColor = 'text-gray-500';
    numColor = 'text-black/15';
  }

  return (
    <div className={`relative px-5 py-5 flex items-center gap-4 min-h-[78px] 
      hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer rounded-3xl ${cardBg}`}>
      
      {/* Low-contrast sequence number in corner */}
      <span className={`absolute top-3.5 right-4 text-[9px] font-black tracking-widest font-mono ${numColor}`}>
        {seqNum}
      </span>
      
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <CreditCard size={20} />
      </div>
      <div className="min-w-0 flex-1 pr-4">
        <h3 className={`font-black text-sm truncate leading-snug ${titleColor}`}>{card.brand_name}</h3>
        <p className={`text-[10px] uppercase tracking-widest mt-1 font-mono font-semibold ${idColor}`}>
          ID: {card.card_number || 'N/A'}
        </p>
      </div>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200
    rounded-2xl bg-white/50 flex flex-col items-center gap-4 px-6 text-[#000000]">
    <WalletCards className="text-[#000000]" size={44} />
    <div>
      <p className="text-[#000000] font-black text-sm font-kanit">ยังไม่มีบัตรสมาชิก</p>
      <p className="text-gray-500 text-xs mt-1 font-kanit font-semibold">กด + เพื่อเพิ่มบัตรสมาชิกใบแรกของคุณ</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const Memberships: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<MembershipCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Add Card UI State ───
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
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
    fetchMemberships();
  }, []);

  const handleSaveCard = async () => {
    if (!newBrandName.trim()) {
      setErrorMsg('กรุณากรอกชื่อแบรนด์สมาชิก');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_memberships')
          .insert({
            user_id: user.id,
            brand_name: newBrandName.trim(),
            card_number: newCardNumber.trim() ? newCardNumber.trim() : undefined,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setCards((prev) => [...prev, data]);
          trackEvent('membership_card_added', { brand_name: newBrandName.trim() });
          
          // Reset Form & Close
          setNewBrandName('');
          setNewCardNumber('');
          setIsAddOpen(false);
        }
      } else {
        throw new Error('No user session active');
      }
    } catch (err) {
      console.error('Error saving membership card:', err);
      setErrorMsg('บันทึกบัตรสมาชิกล้มเหลว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-dark-bg text-[#000000] font-sans
      flex flex-col overflow-x-hidden relative">

      {/* ── Sticky top header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl
        border-b border-black/5 px-4 md:px-10 py-3.5 md:py-4
        flex items-center gap-2 min-h-[56px]
        pt-[calc(0.875rem+env(safe-area-inset-top))]
        md:pt-[calc(1rem+env(safe-area-inset-top))]">

        {/* Back button — 44px touch target */}
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 -ml-2 hover:bg-gray-100 active:bg-gray-200 text-[#000000]
            rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="flex items-center gap-2.5">
          <WalletCards size={20} className="text-[#5B7A00]" />
          <h1 className="text-base md:text-xl font-black text-[#000000]">My Memberships</h1>
        </div>

        {/* Card count badge */}
        {!loading && cards.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 bg-[#000000] text-primary text-xs font-black rounded-full shadow-sm">
            {cards.length}
          </span>
        )}
      </header>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 md:px-10 py-5 md:py-8
        pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-10">

        {/* Section label */}
        <p className="text-[10px] font-semibold text-gray-mid uppercase tracking-widest mb-4 font-kanit">
          {loading ? 'กำลังโหลด…' : `บัตรทั้งหมด ${cards.length} ใบ`}
        </p>

        {/* Grid layouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : cards.length > 0 ? (
            cards.map((card, index) => <MembershipCard key={card.id} card={card} index={index} />)
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      {/* ── Floating Add Button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setIsAddOpen(true)}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        className="fixed right-5 md:right-10 z-30
          bg-primary text-[#000000] w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-[0_8px_32px_rgba(199,255,46,0.35)]
          hover:scale-105 active:scale-95 transition-transform"
        aria-label="Add membership card"
      >
        <Plus size={24} />
      </button>

      {/* ── Add Card Bottom Sheet Overlay ────────────────────────────────────── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0" onClick={() => setIsAddOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white border-t border-black/5 rounded-t-3xl shadow-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#000000]">
            
            {/* Pull Bar */}
            <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-[#000000] text-base font-kanit">เพิ่มบัตรสมาชิกใหม่</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-xs text-white bg-[#000000] hover:bg-[#000000]/90 px-3 py-1.5 rounded-full transition-all"
              >
                Cancel
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2 text-xs font-kanit">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-kanit">
                  ชื่อแบรนด์สมาชิก (Brand Name)
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Starbucks, Fitness First"
                  className="w-full bg-gray-50 px-4 py-3 min-h-[48px] rounded-xl border border-black/5 text-[#000000] placeholder-gray-400 focus:outline-none focus:border-black/30 transition-all text-sm font-kanit font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-kanit">
                  รหัสบัตรสมาชิก (Loyalty ID / Card Number)
                </label>
                <input
                  type="text"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  placeholder="e.g. 1092837498"
                  className="w-full bg-gray-50 px-4 py-3 min-h-[48px] rounded-xl border border-black/5 text-[#000000] placeholder-gray-400 focus:outline-none focus:border-black/30 transition-all text-sm font-kanit font-semibold"
                />
              </div>
            </div>

            {/* Save Action */}
            <button
              onClick={handleSaveCard}
              disabled={isSaving || !newBrandName.trim()}
              className="w-full py-4 min-h-[52px] rounded-xl font-black text-base text-dark-bg bg-primary
                hover:bg-primary/95 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed
                shadow-[0_8px_32px_rgba(199,255,46,0.35)] flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-5 h-5 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} strokeWidth={3} /> บันทึกบัตรสมาชิก
                </>
              )}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default Memberships;