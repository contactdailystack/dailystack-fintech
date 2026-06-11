import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  WalletCards,
  Plus,
  CreditCard,
  ChevronLeft,
  Check,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Crown,
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';
import {
  getUserTier,
  getTierDisplayName,
  getTierPrice,
  SubscriptionTier,
} from '../services/userTierService';

const TIER_ORDER: SubscriptionTier[] = ['basic', 'pro', 'elite'];

const TIER_COLORS = {
  basic: { bg: 'bg-white/10', text: 'text-white/60', border: 'border-white/10' },
  pro: { bg: 'bg-[#C7FF2E]/10', text: 'text-[#C7FF2E]', border: 'border-[#C7FF2E]/20' },
  elite: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

const CardSkeleton: React.FC = () => (
  <div className="bg-[#171C15] border border-white/5 rounded-2xl p-4 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-white/10 mb-3" />
    <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
    <div className="h-3 bg-white/10 rounded w-1/3" />
  </div>
);

interface MembershipCardData {
  id: string;
  brand_name: string;
  card_number?: string;
}

const MembershipCard: React.FC<{ card: MembershipCardData; index: number }> = ({
  card,
  index,
}) => {
  const mod = index % 3;
  const colors = [
    { bg: 'bg-primary text-[#000000] border-transparent', iconBg: 'bg-black/10' },
    { bg: 'bg-[#000000] text-white border-transparent', iconBg: 'bg-white/10' },
    { bg: 'bg-white text-[#000000] border-black/5', iconBg: 'bg-black/10' },
  ][mod];

  return (
    <div
      className={`relative px-5 py-5 flex items-center gap-4 min-h-[78px] hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer rounded-3xl ${colors.bg}`}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${colors.iconBg}`}
      >
        <CreditCard size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-black text-sm truncate leading-snug">{card.brand_name}</h3>
        <p className="text-[10px] uppercase tracking-widest mt-1 font-mono font-semibold opacity-40">
          ID: {card.card_number || 'N/A'}
        </p>
      </div>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col items-center gap-4 px-6">
    <WalletCards className="text-white/20" size={44} />
    <div>
      <p className="text-white font-black text-sm font-kanit">ยังไม่มีบัตรสมาชิก</p>
      <p className="text-white/40 text-xs mt-1 font-kanit font-semibold">
        กด + เพื่อเพิ่มบัตรสมาชิกใบแรกของคุณ
      </p>
    </div>
  </div>
);

export const Memberships: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<MembershipCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<SubscriptionTier>('basic');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const tierInfo = await getUserTier();
      setUserTier(tierInfo.tier);

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
    fetchData();
  }, []);

  const currentTierIndex = TIER_ORDER.indexOf(userTier);
  const nextTier = TIER_ORDER[currentTierIndex + 1] as SubscriptionTier | undefined;

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

  const tierColors = TIER_COLORS[userTier];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0B0F0A] text-white font-sans flex flex-col overflow-x-hidden relative">
      <header className="sticky top-0 z-20 bg-[#0B0F0A]/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-10 py-3.5 md:py-4 flex items-center gap-2 min-h-[56px]">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 -ml-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="flex items-center gap-2.5">
          <WalletCards size={20} className="text-[#C7FF2E]" />
          <h1 className="text-base md:text-xl font-black">Memberships</h1>
        </div>

        {!loading && cards.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 bg-white/10 text-white text-xs font-bold rounded-full">
            {cards.length}
          </span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 md:px-10 py-5 md:py-8 pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-10">
        <div className="max-w-3xl mx-auto">
          <div
            className={`rounded-2xl p-5 mb-6 border ${tierColors.border} ${tierColors.bg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown size={18} className={tierColors.text} />
                <span className={`font-black text-lg ${tierColors.text}`}>
                  {getTierDisplayName(userTier)}
                </span>
              </div>
              <span className={`text-sm ${tierColors.text}`}>
                {getTierPrice(userTier)}
              </span>
            </div>

            {nextTier && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white/40 text-xs mb-2 font-kanit">
                  Upgrade to {getTierDisplayName(nextTier)} for more features
                </p>
                <button
                  onClick={() => navigate('/upgrade')}
                  className="w-full py-2.5 bg-[#C7FF2E] text-[#0B0F0A] font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#C7FF2E]/90 transition-colors"
                >
                  <ArrowUpRight size={14} />
                  Upgrade to {getTierDisplayName(nextTier)}
                </button>
              </div>
            )}

            {userTier === 'basic' && (
              <button
                onClick={() => navigate('/upgrade')}
                className="mt-3 w-full py-2.5 bg-[#C7FF2E] text-[#0B0F0A] font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-[#C7FF2E]/90 transition-colors"
              >
                <Sparkles size={14} />
                Unlock PRO Features
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-kanit">
              {loading ? 'กำลังโหลด…' : `บัตรทั้งหมด ${cards.length} ใบ`}
            </p>
            <button
              onClick={() => navigate('/upgrade')}
              className="text-xs text-[#C7FF2E] font-semibold hover:underline"
            >
              View Plans
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : cards.length > 0 ? (
              cards.map((card, index) => (
                <MembershipCard key={card.id} card={card} index={index} />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      <button
        onClick={() => setIsAddOpen(true)}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        className="fixed right-5 md:right-10 z-30 bg-[#C7FF2E] text-[#0B0F0A] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(199,255,46,0.35)] hover:scale-105 active:scale-95 transition-transform"
        aria-label="Add membership card"
      >
        <Plus size={24} />
      </button>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0" onClick={() => setIsAddOpen(false)} />

          <div className="relative w-full max-w-lg bg-[#171C15] border border-white/10 rounded-t-3xl shadow-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-5" />

            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-white text-base font-kanit">
                เพิ่มบัตรสมาชิกใหม่
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl flex items-start gap-2 text-xs font-kanit">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 font-kanit">
                  ชื่อแบรนด์สมาชิก (Brand Name)
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Starbucks, Fitness First"
                  className="w-full bg-white/5 px-4 py-3 min-h-[48px] rounded-xl border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#C7FF2E]/50 transition-all text-sm font-kanit font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 font-kanit">
                  รหัสบัตรสมาชิก (Loyalty ID / Card Number)
                </label>
                <input
                  type="text"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  placeholder="e.g. 1092837498"
                  className="w-full bg-white/5 px-4 py-3 min-h-[48px] rounded-xl border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#C7FF2E]/50 transition-all text-sm font-kanit font-semibold"
                />
              </div>
            </div>

            <button
              onClick={handleSaveCard}
              disabled={isSaving || !newBrandName.trim()}
              className="w-full py-4 min-h-[52px] rounded-xl font-black text-base text-[#0B0F0A] bg-[#C7FF2E] hover:bg-[#C7FF2E]/95 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_32px_rgba(199,255,46,0.35)] flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-5 h-5 border-2 border-[#0B0F0A]/30 border-t-[#0B0F0A] rounded-full animate-spin" />
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