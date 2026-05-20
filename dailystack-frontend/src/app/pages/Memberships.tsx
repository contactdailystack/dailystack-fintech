import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { WalletCards, Plus, CreditCard, ChevronLeft } from 'lucide-react';

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const CardSkeleton: React.FC = () => (
  <div className="bg-dark-card border border-white/5 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-white/5 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-white/5 rounded-full w-2/3" />
      <div className="h-2.5 bg-white/5 rounded-full w-1/3" />
    </div>
  </div>
);

// ─── Single membership card ───────────────────────────────────────────────────
interface MembershipCardData {
  id: string;
  brand_name: string;
  card_number?: string;
}
const MembershipCard: React.FC<{ card: MembershipCardData }> = ({ card }) => (
  // min-h 72px — comfortable for thumbs; full-width on mobile
  <div className="bg-dark-card border border-white/5 rounded-2xl px-4 py-4 flex items-center gap-4
    min-h-[72px] hover:border-primary/30 active:scale-[0.98] active:bg-white/[0.02]
    transition-all cursor-pointer">
    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center
      justify-center text-primary shrink-0">
      <CreditCard size={22} />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="font-bold text-white text-sm truncate leading-snug">{card.brand_name}</h3>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
        ID: {card.card_number || 'N/A'}
      </p>
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <div className="col-span-full py-16 text-center border-2 border-dashed border-white/5
    rounded-2xl bg-dark-card/30 flex flex-col items-center gap-4 px-6">
    <WalletCards className="text-gray-600" size={44} />
    <div>
      <p className="text-gray-400 font-medium text-sm">ยังไม่มีบัตรสมาชิก</p>
      <p className="text-gray-600 text-xs mt-1 font-kanit">กด + เพื่อเพิ่มบัตรสมาชิกของคุณ</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const Memberships: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<MembershipCardData[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen min-h-[100dvh] bg-dark-bg text-white font-sans
      flex flex-col overflow-x-hidden">

      {/* ── Sticky top header ──────────────────────────────────────────────── */}
      {/* pt includes safe-area for notched phones */}
      <header className="sticky top-0 z-20 bg-dark-bg/90 backdrop-blur-xl
        border-b border-white/5 px-4 md:px-10 py-3.5 md:py-4
        flex items-center gap-2 min-h-[56px]
        pt-[calc(0.875rem+env(safe-area-inset-top))]
        md:pt-[calc(1rem+env(safe-area-inset-top))]">

        {/* Back button — 44px touch target */}
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 -ml-2 hover:bg-white/5 active:bg-white/10
            rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="flex items-center gap-2.5">
          <WalletCards size={20} className="text-primary" />
          <h1 className="text-base md:text-xl font-bold">My Memberships</h1>
        </div>

        {/* Card count badge */}
        {!loading && cards.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 bg-primary/10 border border-primary/20
            text-primary text-xs font-bold rounded-full">
            {cards.length}
          </span>
        )}
      </header>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {/* pb accounts for FAB + safe-area-inset-bottom */}
      <main className="flex-1 overflow-y-auto px-4 md:px-10 py-5 md:py-8
        pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-10">

        {/* Section label */}
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4 font-kanit">
          {loading ? 'กำลังโหลด…' : `บัตรทั้งหมด ${cards.length} ใบ`}
        </p>

        {/*
          Mobile: single column — full-width cards are easiest to tap.
          sm: 2 cols, lg: 3 cols.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : cards.length > 0 ? (
            cards.map((card) => <MembershipCard key={card.id} card={card} />)
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      {/* ── Floating Add Button ─────────────────────────────────────────────── */}
      {/*
        bottom offset = 24px + safe-area so it clears iPhone home bar.
        Kept at 56px diameter for easy tap.
      */}
      <button
        onClick={() => alert('ระบบเพิ่มบัตรจะมาในขั้นตอนถัดไปครับ!')}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        className="fixed right-5 md:right-10 z-30
          bg-primary text-dark-bg w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-[0_8px_32px_rgba(86,190,137,0.35)]
          hover:scale-105 active:scale-95 transition-transform"
        aria-label="Add membership card"
      >
        <Plus size={24} />
      </button>

    </div>
  );
};

export default Memberships;