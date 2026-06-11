import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Gift, Plus, CreditCard, Sparkles, Check,
  Coffee, Utensils, MapPin, Dumbbell, ShieldCheck, TrendingUp, Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabaseClient';
import { trackEvent } from '../../utils/analytics';
import {
  fetchUserCreditCards,
  addUserCreditCard,
  calculateBestCard,
  PREMIUM_CARD_PRESETS
} from '../services/rewardsService';
import type { CreditCardData } from '../services/rewardsService';

// ─── Extended local translations for Rewards Hub ───
const translations = {
  en: {
    title: "Rewards Hub",
    subtitle: "Cashback & Loyalty Optimizer cockpit",
    totalSaved: "LIFETIME CASHBACK SAVED",
    scoreLabel: "OPTIMIZATION SCORE",
    scoreVal: "98% Excellent",
    pointsEarned: "REWARDS POINTS EARNED",
    cardsTitle: "My Cards Stack",
    addCard: "Add Credit Card",
    presetsTitle: "Select Premium Preset",
    customCardTitle: "Or custom card name",
    enterLastFour: "Last 4 digits",
    addSuccess: "Card added successfully!",
    addError: "Failed to add card. Please check your connection and try again.",
    recommendationTitle: "Best Card Recommender Simulator",
    chooseCategory: "Choose category",
    purchaseAmount: "Enter purchase amount (THB)",
    calcButton: "Analyze Best Card",
    bestChoice: "BEST CHOICE TO PAY",
    altChoices: "ALTERNATIVE PAYMENT METHODS",
    emptyCards: "No cards added. Click + to add your first rewards card!",
    pointsLabel: "Points",
    cashbackLabel: "Cashback",
    savedAlert: "You will save {amount} THB using this card",
    explainText: "Tailored recommendation based on real-time card rules",
    cardNamePlaceholder: "e.g. SCB Cash Back",
    bankNamePlaceholder: "e.g. SCB",
    customPercentRule: "Dining cashback %",
    btnSaveCard: "Register Card to Stack",
    cancel: "Cancel",
    bestChoiceShort: "BEST",
  },
  th: {
    title: "Rewards Hub",
    subtitle: "ห้องควบคุมและคำนวณเครดิตเงินคืนและความคุ้มค่า",
    totalSaved: "ยอดเครดิตเงินคืนสะสมทั้งหมด",
    scoreLabel: "คะแนนความคุ้มค่าการใช้บัตร",
    scoreVal: "98% ยอดเยี่ยม",
    pointsEarned: "คะแนนสะสมที่ได้รับแล้ว",
    cardsTitle: "กระเป๋าบัตรเครดิตของคุณ",
    addCard: "เพิ่มบัตรเครดิตใบใหม่",
    presetsTitle: "เลือกรูปแบบบัตรยอดนิยม",
    customCardTitle: "หรือระบุชื่อบัตรด้วยตนเอง",
    enterLastFour: "เลขท้าย 4 หลัก",
    addSuccess: "เพิ่มบัตรสมาชิกเรียบร้อยแล้ว!",
    addError: "บันทึกบัตรเครดิตล้มเหลว กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง",
    recommendationTitle: "โปรแกรมจำลองแนะนำบัตรที่คุ้มค่าที่สุด",
    chooseCategory: "เลือกหมวดหมู่การใช้จ่าย",
    purchaseAmount: "ระบุจำนวนเงินที่จ่าย (THB)",
    calcButton: "คำนวณบัตรที่ดีที่สุด",
    bestChoice: "บัตรที่แนะนำให้ใช้จ่ายที่สุด",
    altChoices: "ทางเลือกการชำระเงินอื่นของคุณ",
    emptyCards: "ยังไม่ได้เพิ่มบัตรเครดิต กดปุ่ม + เพื่อเพิ่มบัตรใบแรก!",
    pointsLabel: "คะแนนสะสม",
    cashbackLabel: "เงินคืน",
    savedAlert: "คุณจะประหยัดเงินได้ {amount} บาทเมื่อรูดผ่านบัตรใบนี้",
    explainText: "คำแนะนำส่วนบุคคลประเมินตามกฎสิทธิประโยชน์ของบัตรคุณ",
    cardNamePlaceholder: "เช่น SCB Cash Back",
    bankNamePlaceholder: "เช่น SCB",
    customPercentRule: "เครดิตเงินคืนหมวดร้านอาหาร %",
    btnSaveCard: "ลงทะเบียนบัตรเข้าสู่ระบบ",
    cancel: "ยกเลิก",
    bestChoiceShort: "แนะนำ",
  }
};

const CATEGORY_MAP = [
  { name: 'Food & Dining', icon: Utensils, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Specialty Coffee', icon: Coffee, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { name: 'Transportation', icon: MapPin, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { name: 'Active & Fitness', icon: Dumbbell, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
];

export const RewardsHub: React.FC = () => {
  const navigate = useNavigate();
  const { language: lang } = useLanguage();
  const t = translations[lang];

  // ─── Cards & Engine State ───
  const [cards, setCards] = useState<CreditCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Food & Dining');
  const [purchaseAmount, setPurchaseAmount] = useState('500');
  // ─── Analytics Rollups ───
  const [lifetimeSavings, setLifetimeSavings] = useState(1350);
  const [pointsTotal, setPointsTotal] = useState(4200);

  // ─── Add Card Modal State ───
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [presetIndex, setPresetIndex] = useState<number | null>(0);
  const [customBankName, setCustomBankName] = useState('');
  const [customCardName, setCustomCardName] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [customCashbackRate, setCustomCashbackRate] = useState('1.0');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadCards = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      const fetched = await fetchUserCreditCards();
      setCards(fetched);
      setLoading(false);
    };
    loadCards();
  }, [navigate]);

  // Compute recommendation derived state synchronously during render (React Best Practice)
  const recommendation = cards.length > 0
    ? (() => {
        try {
          const amt = parseFloat(purchaseAmount) || 0;
          return calculateBestCard(cards, selectedCategory, amt);
        } catch (err) {
          console.error(err);
          return null;
        }
      })()
    : null;

  const handleAddCard = async () => {
    setIsSaving(true);
    setSuccessMsg('');

    let cardPayload: Omit<CreditCardData, 'id'>;

    if (presetIndex !== null) {
      const preset = PREMIUM_CARD_PRESETS[presetIndex];
      cardPayload = {
        bank_name: preset.bank_name,
        card_name: preset.card_name,
        card_type: preset.card_type,
        color_gradient: preset.color_gradient,
        last_four: lastFour.trim() || '8842',
        rules: preset.rules
      };
    } else {
      // Custom card manual input
      const parsedRate = parseFloat(customCashbackRate) || 1.0;
      cardPayload = {
        bank_name: customBankName.trim() || 'Custom Bank',
        card_name: customCardName.trim() || 'Custom Card',
        card_type: 'visa',
        color_gradient: 'from-gray-700 to-gray-800',
        last_four: lastFour.trim() || '9912',
        rules: [
          { categoryName: 'Food & Dining', cashbackPercent: parsedRate, pointsMultiplier: 1 },
          { categoryName: 'Specialty Coffee', cashbackPercent: parsedRate, pointsMultiplier: 1 },
          { categoryName: 'Transportation', cashbackPercent: parsedRate, pointsMultiplier: 1 },
          { categoryName: 'Active & Fitness', cashbackPercent: parsedRate, pointsMultiplier: 1 }
        ]
      };
    }

    try {
      const saved = await addUserCreditCard(cardPayload);
      setCards((prev) => [...prev, saved]);
      trackEvent('credit_card_optimized_added', { card_name: cardPayload.card_name });

      setSuccessMsg(t.addSuccess);
      setLastFour('');
      setCustomCardName('');
      setCustomBankName('');
      
      setTimeout(() => {
        setIsAddOpen(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg(t.addError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulatePayment = () => {
    if (recommendation) {
      // Simulate real savings contribution
      setLifetimeSavings((prev) => prev + recommendation.savingsAmount);
      setPointsTotal((prev) => prev + recommendation.pointsEarned);
      trackEvent('rewards_saving_simulated', {
        amount: purchaseAmount,
        saved: recommendation.savingsAmount,
        card: recommendation.bestCard.card_name
      });
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-dark-bg text-[#000000] font-sans flex flex-col overflow-x-hidden relative">

      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-black/5
        px-4 md:px-10 py-3.5 md:py-4 flex items-center gap-2 min-h-[56px]
        pt-[calc(0.875rem+env(safe-area-inset-top))] md:pt-[calc(1rem+env(safe-area-inset-top))]">
        
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2.5 -ml-2 hover:bg-gray-100 active:bg-gray-200 text-[#000000] rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="flex items-center gap-2.5">
          <Gift size={20} className="text-[#5B7A00]" />
          <div className="text-left">
            <h1 className="text-sm md:text-base font-black uppercase tracking-[0.1em] text-[#000000]">{t.title}</h1>
            <p className="text-[10px] text-gray-500 font-semibold font-kanit mt-0.5 leading-none">{t.subtitle}</p>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-8 pb-[calc(24px+env(safe-area-inset-bottom))]">

        {/* ─── STATS ROLLUP COCKPIT ─── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-0 shadow-lg rounded-2xl p-5 relative overflow-hidden group text-[#000000]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 font-kanit">
              {t.totalSaved}
            </p>
            <h3 className="text-3xl font-extrabold text-[#000000] tracking-tight leading-none">
              {lifetimeSavings.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <span className="text-xs text-gray-500 font-normal ml-2">THB</span>
            </h3>
            <p className="text-[10px] text-[#5B7A00] font-black mt-3 flex items-center gap-1.5 font-kanit">
              <TrendingUp size={12} /> ยอดคำนวณเงินคืนแบบเรียลไทม์
            </p>
          </div>

          <div className="bg-white border-0 shadow-lg rounded-2xl p-5 flex items-center justify-between gap-4 text-[#000000]">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-kanit">
                {t.scoreLabel}
              </p>
              <h4 className="text-lg font-black text-[#000000] font-kanit">{t.scoreVal}</h4>
              <p className="text-[10px] text-gray-500 font-semibold font-kanit">
                ประหยัดขึ้นสูงสุด 12.5% เมื่อจ่ายตรงบัตร
              </p>
            </div>
            <div className="relative w-12 h-12 rounded-full border border-black/5 bg-gray-50 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent pointer-events-none" />
              <Sparkles size={16} className="text-[#5B7A00] animate-pulse" />
            </div>
          </div>

          <div className="bg-white border-0 shadow-lg rounded-2xl p-5 text-[#000000]">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-kanit">
              {t.pointsEarned}
            </p>
            <h3 className="text-2xl font-black text-[#000000] font-mono leading-none">
              {pointsTotal.toLocaleString()}
              <span className="text-xs text-gray-500 font-normal ml-2">Points</span>
            </h3>
            <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-1.5 font-kanit font-semibold">
              <ShieldCheck size={12} className="text-emerald-500 shrink-0" /> สะสมแต้มคูณสองในหลายหมวดหมู่
            </p>
          </div>
        </section>

        {/* ─── RECOMMENDATION CALCULATOR SIMULATOR ─── */}
        <section className="bg-white border-0 shadow-lg rounded-2xl p-5 space-y-5 text-[#000000]">
          <div className="flex justify-between items-center select-none">
            <h3 className="font-black text-xs uppercase tracking-widest text-[#000000] flex items-center gap-2 font-kanit">
              <Sparkles size={14} className="text-[#5B7A00]" /> {t.recommendationTitle}
            </h3>
          </div>

          {/* Simulator Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-kanit">
                {t.chooseCategory}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_MAP.map((cat) => {
                  const isSelected = cat.name === selectedCategory;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs font-bold leading-tight ${
                        isSelected
                          ? 'bg-[#000000] border-[#000000] text-primary shadow-md'
                          : 'bg-gray-50 border-black/5 text-gray-500 hover:text-[#000000] hover:border-black/10'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg ${cat.color} flex items-center justify-center shrink-0`}>
                        <Icon size={14} />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-kanit">
                {t.purchaseAmount}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 min-h-[48px] bg-gray-50 border border-black/10 rounded-xl text-[#000000] font-mono text-base focus:border-[#C7FF2E] focus:bg-white outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold font-mono">THB</span>
              </div>

              {/* Quick Preset sliders */}
              <div className="flex gap-2 pt-1 font-mono">
                {['100', '350', '800', '1500'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPurchaseAmount(val)}
                    className="px-2.5 py-1 text-[10px] font-bold bg-gray-50 border border-black/5 rounded-full hover:border-[#C7FF2E] text-gray-500 hover:text-[#000000] shadow-sm transition-all"
                  >
                    {val} B
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ENGINE RESULT RENDERING */}
          {recommendation ? (
            <div className="pt-4 border-t border-black/5 space-y-4">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-kanit">{t.bestChoice}</p>
              
              <div className="flex flex-col md:flex-row gap-5 items-stretch">
                {/* 3D Glassmorphic Credit Card Preview */}
                <div className={`relative w-full max-w-[280px] min-h-[160px] bg-gradient-to-br ${recommendation.bestCard.color_gradient} rounded-2xl p-5 flex flex-col justify-between shadow-2xl border border-white/10 overflow-hidden shrink-0 group`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[10px] font-bold tracking-widest text-white/50 leading-none uppercase">
                        {recommendation.bestCard.bank_name}
                      </h4>
                      <p className="text-sm font-black text-white mt-1 leading-none">
                        {recommendation.bestCard.card_name}
                      </p>
                    </div>
                    {/* Visual Card Chip */}
                    <div className="w-8 h-6 bg-yellow-400/20 border border-yellow-400/30 rounded-md shadow-inner shrink-0" />
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    <div>
                      <p className="text-[8px] font-bold tracking-widest text-white/30 leading-none uppercase">
                        CARDHOLDER
                      </p>
                      <p className="text-[10px] font-black text-white tracking-widest leading-none mt-1.5 uppercase font-mono">
                        DAILYSTACK MEMBER
                      </p>
                    </div>
                    <span className="text-xs font-black text-white uppercase tracking-wider font-mono">
                      •••• {recommendation.bestCard.last_four}
                    </span>
                  </div>
                </div>

                {/* Best Choice explanations */}
                <div className="flex-1 flex flex-col justify-between py-1.5">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#000000] text-primary text-[10px] font-black select-none font-kanit shadow-sm">
                      <Sparkles size={11} /> {t.bestChoiceShort}
                    </div>
                    <h4 className="text-lg font-black text-[#000000] font-kanit leading-snug">
                      {recommendation.bestCard.bank_name} {recommendation.bestCard.card_name}
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold font-kanit">
                      {recommendation.explanation}
                    </p>
                  </div>

                  {/* Savings summary popup */}
                  {recommendation.savingsAmount > 0 && (
                    <div className="p-3 bg-gray-50 border border-black/5 rounded-xl flex items-center justify-between gap-3 mt-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#000000] font-kanit">
                        <Info size={14} className="text-[#5B7A00] shrink-0" />
                        <span>{t.savedAlert.replace('{amount}', recommendation.savingsAmount.toFixed(1))}</span>
                      </div>
                      <button
                        onClick={handleSimulatePayment}
                        className="px-3 py-1.5 bg-[#C7FF2E] hover:bg-[#C7FF2E]/90 text-[#000000] text-[10px] font-black rounded-lg transition-all active:scale-[0.97]"
                      >
                        Simulate Saving
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Alternatives List */}
              {recommendation.alternatives.length > 0 && (
                <div className="pt-5 border-t border-black/5 space-y-3">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-kanit">{t.altChoices}</p>
                  
                  <div className="space-y-2.5">
                    {recommendation.alternatives.map((alt) => (
                      <div key={alt.card.id} className="flex items-center justify-between p-3.5 bg-gray-50 border border-black/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${alt.card.color_gradient} border border-white/10 shrink-0 flex items-center justify-center text-[10px] font-black text-white`}>
                            {alt.card.card_name[0]}
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-[#000000] leading-none">{alt.card.bank_name} {alt.card.card_name}</h5>
                            <p className="text-[10px] text-gray-500 font-semibold mt-1 font-kanit leading-none">{alt.explanation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-amber-500 font-mono">-{alt.savingsAmount.toFixed(1)} B</span>
                          <p className="text-[9px] text-gray-500 font-semibold uppercase mt-1 leading-none">-{alt.cashbackPercent}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-4 font-kanit">{t.emptyCards}</p>
          )}
        </section>

        {/* ─── USER CREDIT CARDS DECK LIST ─── */}
        <section className="space-y-3.5 select-none text-[#000000]">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-kanit">
              {t.cardsTitle} ({cards.length})
            </p>
            <button
              onClick={() => { setIsAddOpen(true); setErrorMsg(''); }}
              className="p-1.5 hover:bg-gray-100 active:bg-gray-200 text-[#5B7A00] rounded-full transition-all flex items-center gap-1 text-xs font-bold font-kanit"
            >
              <Plus size={16} /> {t.addCard}
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4
            md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 md:gap-4
            snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-[240px] md:w-auto h-[140px] bg-white border-0 shadow-md rounded-2xl animate-pulse" />
              ))
            ) : cards.length > 0 ? (
              cards.map((c) => (
                <div key={c.id} className={`snap-start shrink-0 w-[240px] md:w-auto bg-gradient-to-br ${c.color_gradient} border border-white/10 rounded-2xl p-4.5 min-h-[140px] flex flex-col justify-between shadow-lg relative group cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[9px] font-bold tracking-widest text-white/50 leading-none uppercase">{c.bank_name}</h4>
                      <p className="text-xs font-black text-white leading-none mt-1">{c.card_name}</p>
                    </div>
                    <CreditCard size={16} className="text-white/40 shrink-0" />
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest leading-none">REWARDS RATE</p>
                      <p className="text-xs font-black text-white leading-none mt-1 font-mono">
                        {c.rules.find((r) => r.categoryName === 'Food & Dining')?.cashbackPercent || 0}% Dining
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-white/40 font-mono">•••• {c.last_four}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 border-2 border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50 flex flex-col items-center justify-center gap-3">
                <CreditCard size={28} className="text-gray-400" />
                <p className="text-xs text-gray-500 font-kanit font-semibold">{t.emptyCards}</p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* ─── ADD PRESET CREDIT CARD BOTTOM DRAWER SHEET ─── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 select-text">
          <div className="absolute inset-0" onClick={() => setIsAddOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white border-t border-black/5 rounded-t-3xl shadow-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#000000]">
            
            {/* Pull Bar */}
            <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="flex justify-between items-center mb-5 select-none">
              <h3 className="font-black text-[#000000] text-base font-kanit">{t.addCard}</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-xs text-white bg-[#000000] hover:bg-[#000000]/90 px-3 py-1.5 rounded-full transition-all"
              >
                {t.cancel}
              </button>
            </div>

            {successMsg && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl flex items-center gap-2 text-xs font-kanit select-none font-bold">
                <Check size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl flex items-start gap-2 text-xs font-kanit select-none">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tabs for Premium Presets vs Custom */}
            <div className="space-y-4">
              
              {/* Preset Selector Grid */}
              <div className="space-y-2 select-none">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest font-kanit">
                  {t.presetsTitle}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PREMIUM_CARD_PRESETS.map((preset, idx) => {
                    const isSelected = presetIndex === idx;
                    return (
                      <button
                        key={preset.card_name}
                        onClick={() => {
                          setPresetIndex(idx);
                          setCustomBankName('');
                          setCustomCardName('');
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[64px] ${
                          isSelected
                            ? 'bg-[#000000] border-[#000000] text-primary shadow-md'
                            : 'bg-gray-50 border-black/5 text-gray-500 hover:border-black/20'
                        }`}
                      >
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-white/50' : 'text-gray-400'}`}>{preset.bank_name}</span>
                        <span className={`text-xs font-black truncate mt-1 ${isSelected ? 'text-primary' : 'text-[#000000]'}`}>{preset.card_name}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPresetIndex(null)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[64px] ${
                      presetIndex === null
                        ? 'bg-[#000000] border-[#000000] text-primary shadow-md'
                        : 'bg-gray-50 border-black/5 text-gray-500 hover:border-black/20'
                    }`}
                  >
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${presetIndex === null ? 'text-white/50' : 'text-gray-400'}`}>MANUAL</span>
                    <span className={`text-xs font-black mt-1 ${presetIndex === null ? 'text-primary' : 'text-[#000000]'}`}>Custom Details</span>
                  </button>
                </div>
              </div>

              {/* Form Input fields */}
              {presetIndex === null && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-kanit">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={customBankName}
                      onChange={(e) => setCustomBankName(e.target.value)}
                      placeholder={t.bankNamePlaceholder}
                      className="w-full bg-gray-50 px-4 py-3 min-h-[44px] rounded-xl border border-black/5 text-[#000000] placeholder-gray-400 text-xs focus:border-[#C7FF2E] outline-none font-semibold font-kanit"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-kanit">
                      Card Name
                    </label>
                    <input
                      type="text"
                      value={customCardName}
                      onChange={(e) => setCustomCardName(e.target.value)}
                      placeholder={t.cardNamePlaceholder}
                      className="w-full bg-gray-50 px-4 py-3 min-h-[44px] rounded-xl border border-black/5 text-[#000000] placeholder-gray-400 text-xs focus:border-[#C7FF2E] outline-none font-semibold font-kanit"
                    />
                  </div>
                </div>
              )}

              {/* Custom rule selection */}
              {presetIndex === null && (
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-kanit">
                    {t.customPercentRule}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customCashbackRate}
                    onChange={(e) => setCustomCashbackRate(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full bg-gray-50 px-4 py-3 min-h-[44px] rounded-xl border border-black/5 text-[#000000] text-xs focus:border-[#C7FF2E] outline-none font-mono font-semibold"
                  />
                </div>
              )}

              {/* Shared parameters: Last 4 digits */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 font-kanit">
                  {t.enterLastFour}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={lastFour}
                  maxLength={4}
                  onChange={(e) => setLastFour(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 8824"
                  className="w-full bg-gray-50 px-4 py-3 min-h-[44px] rounded-xl border border-black/5 text-[#000000] placeholder-gray-400 text-xs focus:border-[#C7FF2E] outline-none font-mono font-semibold"
                />
              </div>
            </div>

            {/* Save Card Action */}
            <button
              onClick={handleAddCard}
              disabled={isSaving || (presetIndex === null && (!customBankName.trim() || !customCardName.trim()))}
              className="w-full py-4 min-h-[52px] rounded-xl font-black text-base text-[#000000] bg-primary
                hover:bg-primary/95 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed
                shadow-[0_8px_32px_rgba(199,255,46,0.25)] flex items-center justify-center gap-2 mt-6 select-none font-kanit"
            >
              {isSaving ? (
                <>
                  <span className="w-5 h-5 border-2 border-[#000000]/30 border-t-[#000000] rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} strokeWidth={3} /> {t.btnSaveCard}
                </>
              )}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default RewardsHub;
