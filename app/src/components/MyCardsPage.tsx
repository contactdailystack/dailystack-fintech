/**
 * ============================================================
 * DailyStack — My Cards Page v1.0
 * ============================================================
 * E-Pay style virtual cards management screen
 * 
 * Design Specs:
 * - Header with "Your Cards" and back arrow
 * - Main Virtual Card display with lime gradient
 * - Total balance and growth indicator
 * - Add Card button (pill shape, lime green)
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  ArrowLeft,
  TrendingUp,
  CreditCard,
  Eye,
  EyeOff,
  MoreVertical,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VirtualCard } from '../design-system/components/VirtualCard';
import { Language, translations } from '../data/translations';
import { getUserCards, createVirtualCard, dbCardToUI, type VirtualCard as DBVirtualCard } from '../services/cardService';

interface MyCardsPageProps {
  lang: Language;
  onBack?: () => void;
}

interface CardData {
  id: string;
  cardholderName: string;
  lastFour: string;
  balance: number;
  expiry: string;
  variant: 'lime' | 'emerald' | 'gold';
  isPrimary?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function MyCardsPage({ lang, onBack }: MyCardsPageProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  const t = translations[lang];

  // Fetch cards from Supabase on mount
  useEffect(() => {
    const loadCards = async () => {
      setIsLoading(true);
      const dbCards = await getUserCards();
      
      if (dbCards.length > 0) {
        // Use real cards from database
        setCards(dbCards.map(dbCardToUI));
      } else {
        // MVP fallback: use mock data if no cards in database
        setCards([
          {
            id: '1',
            cardholderName: 'Kristin Watson',
            lastFour: '4293',
            balance: 1234.56,
            expiry: '12/28',
            variant: 'lime',
            isPrimary: true,
          },
          {
            id: '2',
            cardholderName: 'Kristin Watson',
            lastFour: '7856',
            balance: 856.00,
            expiry: '06/27',
            variant: 'emerald',
          },
        ]);
      }
      setIsLoading(false);
    };
    loadCards();
  }, []);

  // Calculate total balance
  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const monthlyGrowth = 12.5; // Mock growth percentage

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        backgroundColor: '#050D1F',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1F2328' }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white uppercase tracking-wider">
            {lang === 'en' ? 'Your Cards' : 'บัตรของคุณ'}
          </h1>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1F2328' }}
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Card Balance Overview */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
              {lang === 'en' ? 'Total Balance' : 'ยอดรวม'}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">
                {showBalance ? formatCurrency(totalBalance) : '••••••'}
              </p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                {showBalance ? (
                  <Eye className="w-4 h-4 text-zinc-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">
              +{monthlyGrowth}%
            </span>
          </div>
        </div>
      </section>

      {/* Virtual Card Carousel */}
      <section className="px-4">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={selectedCard || 'primary'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <VirtualCard
              cardholderName={
                selectedCard
                  ? cards.find((c) => c.id === selectedCard)?.cardholderName || 'Kristin Watson'
                  : cards[0]?.cardholderName || 'Kristin Watson'
              }
              lastFour={
                selectedCard
                  ? cards.find((c) => c.id === selectedCard)?.lastFour || '4293'
                  : cards[0]?.lastFour || '4293'
              }
              balance={
                selectedCard
                  ? cards.find((c) => c.id === selectedCard)?.balance || 1234.56
                  : cards[0]?.balance || 1234.56
              }
              variant={
                selectedCard
                  ? (cards.find((c) => c.id === selectedCard)?.variant || 'lime')
                  : (cards[0]?.variant || 'lime')
              }
              expiry={
                selectedCard
                  ? cards.find((c) => c.id === selectedCard)?.expiry || '12/28'
                  : cards[0]?.expiry || '12/28'
              }
              className="w-full"
            />
          </motion.div>
        </AnimatePresence>

        {/* Card Selector Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card.id)}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-200
                ${
                  (selectedCard || cards[0]?.id) === card.id
                    ? 'bg-[#0FB0CE] w-6'
                    : 'bg-zinc-600 hover:bg-zinc-500'
                }
              `}
            />
          ))}
        </div>
      </section>

      {/* Card Actions */}
      <section className="px-4 mt-6">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowAddCardModal(true)}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl"
            style={{
              backgroundColor: 'rgba(15, 176, 206, 0.1)',
              border: '1px solid rgba(15, 176, 206, 0.2)',
            }}
          >
            <Plus className="w-6 h-6" style={{ color: '#0FB0CE' }} />
            <span className="text-xs font-medium" style={{ color: '#0FB0CE' }}>
              {lang === 'en' ? 'Add Card' : 'เพิ่มบัตร'}
            </span>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl"
            style={{
              backgroundColor: '#1F2328',
              border: '1px solid #2A2A2A',
            }}
          >
            <CreditCard className="w-6 h-6 text-white" />
            <span className="text-xs font-medium text-white">
              {lang === 'en' ? 'Manage' : 'จัดการ'}
            </span>
          </button>

          <button
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl"
            style={{
              backgroundColor: '#1F2328',
              border: '1px solid #2A2A2A',
            }}
          >
            <Sparkles className="w-6 h-6 text-white" />
            <span className="text-xs font-medium text-white">
              {lang === 'en' ? 'Upgrade' : 'อัปเกรด'}
            </span>
          </button>
        </div>
      </section>

      {/* All Cards List */}
      <section className="px-4 mt-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          {lang === 'en' ? 'All Cards' : 'บัตรทั้งหมด'}
        </h2>
        <div className="space-y-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card.id)}
              className={`
                w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-200
                ${
                  (selectedCard || cards[0]?.id) === card.id
                    ? 'bg-[#1F2328] border border-[#0FB0CE]/30'
                    : 'bg-[#1A1A1A] border border-[#2A2A2A]'
                }
              `}
            >
              {/* Mini Card Preview */}
              <div
                className="w-12 h-8 rounded"
                style={{
                  background:
                    card.variant === 'lime'
                      ? 'linear-gradient(135deg, #0FB0CE 0%, #A3D91A 100%)'
                      : card.variant === 'emerald'
                      ? 'linear-gradient(135deg, #00E676 0%, #00A843 100%)'
                      : 'linear-gradient(135deg, #FFD700 0%, #FFB300 100%)',
                }}
              />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">
                  •••• {card.lastFour}
                </p>
                <p className="text-xs text-zinc-400">
                  {card.isPrimary
                    ? lang === 'en'
                      ? 'Primary Card'
                      : 'บัตรหลัก'
                    : `${lang === 'en' ? 'Expires' : 'หมดอายุ'} ${card.expiry}`}
                </p>
              </div>
              <p className="text-sm font-semibold text-white">
                {showBalance ? formatCurrency(card.balance) : '••••'}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Add Card Button - Floating Pill */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddCardModal(true)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full shadow-lg"
        style={{
          backgroundColor: '#0FB0CE',
          boxShadow: '0 4px 24px rgba(15, 176, 206, 0.4)',
        }}
      >
        <Plus className="w-5 h-5 text-black" strokeWidth={2.5} />
        <span className="text-sm font-bold text-black">
          {lang === 'en' ? 'Add Card' : 'เพิ่มบัตร'}
        </span>
      </motion.button>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowAddCardModal(false)}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddCardModal(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-t-3xl p-6"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto mb-6" />

              <h3 className="text-lg font-bold text-white mb-6 text-center">
                {lang === 'en' ? 'Add New Card' : 'เพิ่มบัตรใหม่'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">
                    {lang === 'en' ? 'Card Number' : 'หมายเลขบัตร'}
                  </label>
                  <input
                    type="text"
                    placeholder="•••• •••• •••• ••••"
                    className="w-full px-4 py-3 rounded-xl bg-[#050D1F] border border-[#2A2A2A] text-white placeholder-zinc-500 focus:border-[#0FB0CE] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">
                      {lang === 'en' ? 'Expiry' : 'วันหมดอายุ'}
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-xl bg-[#050D1F] border border-[#2A2A2A] text-white placeholder-zinc-500 focus:border-[#0FB0CE] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="•••"
                      className="w-full px-4 py-3 rounded-xl bg-[#050D1F] border border-[#2A2A2A] text-white placeholder-zinc-500 focus:border-[#0FB0CE] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-2">
                    {lang === 'en' ? 'Card Name' : 'ชื่อบัตร'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'Name on card' : 'ชื่อที่แสดงบนบัตร'}
                    className="w-full px-4 py-3 rounded-xl bg-[#050D1F] border border-[#2A2A2A] text-white placeholder-zinc-500 focus:border-[#0FB0CE] focus:outline-none"
                  />
                </div>

                <button
                  className="w-full py-4 rounded-xl font-bold text-black mt-4"
                  style={{ backgroundColor: '#0FB0CE' }}
                >
                  {lang === 'en' ? 'Add Card' : 'เพิ่มบัตร'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
