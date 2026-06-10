import { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, ShieldCheck, Star, Zap,
  Rocket, Target, Cpu, X, Check, Lock, QrCode, Clock, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import SlideToUpgrade from './SlideToUpgrade';

import { UserProfile } from '../types';
import { translations, Language } from '../data/translations';
import {
  createPromptPayPayment,
  checkPaymentStatus,
} from '../services/stripeService';

interface PaywallPageProps {
  profile: UserProfile;
  onUpgradeComplete: (tier: 'pro' | 'elite') => void;
  onClose?: () => void;
  lang: Language;
  theme: 'dark' | 'light';
}

const tiers = [
  {
    id: 'basic' as const,
    name: 'BASIC',
    price: 0,
    priceLabel: 'Free',
    tagline: { en: 'Financial Awareness', th: 'ความตระหนักทางการเงิน' },
    color: 'text-white/60',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10',
    badge: null,
  },
  {
    id: 'pro' as const,
    name: 'PRO',
    price: 99,
    priceLabel: 'THB/mo',
    tagline: { en: 'Financial Understanding', th: 'ความเข้าใจทางการเงิน' },
    features: {
      en: ['emotional_tracker', 'weekly_story', 'ai_coach_basic', 'fbis'],
      th: ['ตัวติดตามอารมณ์', 'เรื่องเล่าประจำสัปดาห์', 'AI Coach เบื้องต้น', 'FBIS'],
    },
    color: 'text-[#C7FF2E]',
    bgColor: 'bg-[#C7FF2E]/5',
    borderColor: 'border-[#C7FF2E]/30',
    badge: { en: 'Most Popular', th: 'ยอดนิยม' },
  },
  {
    id: 'elite' as const,
    name: 'ELITE',
    price: 199,
    priceLabel: 'THB/mo',
    tagline: { en: 'Financial Transformation', th: 'การเปลี่ยนแปลงทางการเงิน ด้วย AI' },
    features: {
      en: ['alternative_assets', 'advanced_analytics', 'priority_support'],
      th: ['สินทรัพย์ทางเลือก', 'การวิเคราะห์ขั้นสูง', 'สนับสนุนลำดับความสำคัญ'],
    },
    color: 'text-[#FFD700]',
    bgColor: 'bg-[#FFD700]/5',
    borderColor: 'border-[#FFD700]/30',
    badge: { en: 'Full Access', th: 'เข้าถึงทุกฟีเจอร์' },
  },
];

const capabilityFeatures = [
  {
    tier: 'pro' as const,
    title: { en: 'Emotional Trigger Radar', th: 'เรดาร์ตัวกระตุ้นอารมณ์' },
    desc: {
      en: 'Discover what triggers your spending and route capital efficiently.',
      th: 'ค้นพบสิ่งที่กระตุ้นการใช้จ่ายของคุณและบริหารเงินอย่างชาญฉลาด',
    },
    icon: Cpu,
    iconColor: 'text-[#C7FF2E]',
  },
  {
    tier: 'pro' as const,
    title: { en: 'Weekly Financial Story', th: 'เรื่องเล่าการเงินประจำสัปดาห์' },
    desc: {
      en: 'Receive weekly story digests with tactical wealth milestones.',
      th: 'รับเรื่องเล่าประจำสัปดาห์พร้อมเป้าหมายความมั่งคั่ง',
    },
    icon: Sparkles,
    iconColor: 'text-[#C7FF2E]',
  },
  {
    tier: 'elite' as const,
    title: { en: 'Alternative Assets', th: 'สินทรัพย์ทางเลือก' },
    desc: {
      en: 'Track gold, mutual funds, bonds, and crypto in one place.',
      th: 'ติดตามทองคำ กองทุน พันธบัตร และคริปโตในที่เดียว',
    },
    icon: Target,
    iconColor: 'text-[#FFD700]',
  },
  {
    tier: 'elite' as const,
    title: { en: 'AI Financial Coach', th: 'AI Coach การเงิน' },
    desc: {
      en: '24/7 dedicated AI coach delivering tailored strategic advice.',
      th: 'AI Coach เฉพาะทาง 24 ชม. ให้คำแนะนำเชิงกลยุทธ์',
    },
    icon: Zap,
    iconColor: 'text-[#FFD700]',
  },
];

export default function PaywallPage({
  profile,
  onUpgradeComplete,
  onClose,
  lang,
  theme,
}: PaywallPageProps) {
  const [selectedTier, setSelectedTier] = useState<'pro' | 'elite'>(
    profile.plan === 'basic' ? 'pro' : (profile.plan as 'pro' | 'elite')
  );
  const [loading, setLoading] = useState(false);
  const [upgraded, setUpgraded] = useState(profile.plan !== 'basic');
  const [showQR, setShowQR] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(900);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const t = translations[lang];
  const selectedTierData = tiers.find((tier) => tier.id === selectedTier) || tiers[1];

  useEffect(() => {
    if (!showQR || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentError(
            lang === 'en'
              ? 'QR expired. The payment window has closed.'
              : 'QR หมดอายุ กรุณาลองใหม่'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showQR, countdown, lang]);

  useEffect(() => {
    if (!showQR || !paymentIntentId) return;
    const poll = async () => {
      try {
        const result = await checkPaymentStatus(paymentIntentId);
        if (result.status === 'succeeded') {
          setShowQR(false);
          setUpgraded(true);
          onUpgradeComplete(selectedTier);
        } else if (['failed', 'cancelled', 'expired'].includes(result.status)) {
          setPaymentError(
            result.status === 'expired'
              ? lang === 'en'
                ? 'QR code expired.'
                : 'QR หมดอายุ'
              : lang === 'en'
              ? 'Payment failed.'
              : 'ชำระเงินล้มเหลว'
          );
          setShowQR(false);
        }
      } catch (err) {
        console.warn('[PaywallPage] Payment status poll error:', err);
      }
    };
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [showQR, paymentIntentId, selectedTier, onUpgradeComplete, lang]);

  const handleUpgradeTrigger = async () => {
    if (selectedTierData.price === 0) {
      setUpgraded(true);
      onUpgradeComplete(selectedTier);
      return;
    }
    setQrLoading(true);
    setPaymentError(null);
    setShowQR(true);
    setCountdown(900);
    try {
      const result = await createPromptPayPayment(selectedTier);
      const qrDataUrl = await QRCode.toDataURL(result.qrData, {
        width: 280,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      setQrImageUrl(qrDataUrl);
      setPaymentIntentId(result.paymentIntentId);
      setQrLoading(false);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to create payment.');
      setShowQR(false);
      setQrLoading(false);
    }
  };

  const handleCancelQR = () => {
    // PromptPay QR payments cannot be cancelled once generated.
    // User must let it expire or await timeout.
    setShowQR(false);
    setQrImageUrl(null);
    setPaymentIntentId(null);
    setPaymentError(null);
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
  };

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-[#131416]' : 'bg-white';
  const border = isDark ? 'border-zinc-800' : 'border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-zinc-900';
  const textMuted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const textSubtle = isDark ? 'text-white/40' : 'text-zinc-500';
  const surfaceBg = isDark ? 'bg-[#171C15]' : 'bg-slate-50';
  const inputSurface = isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200';
  const btnGhost = isDark
    ? 'bg-[#131416] border-zinc-800 text-zinc-400 hover:text-white'
    : 'bg-white border-slate-200 text-zinc-600 hover:text-zinc-900';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between p-6 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0B0F0A] text-white' : 'bg-[#F4F6F8] text-zinc-900'}`}
    >
      {/* Ambient glows */}
      <div
        className={`absolute top-1/4 right-1/4 w-[380px] h-[380px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-[#C7FF2E]/5' : 'bg-emerald-500/10'}`}
      />
      <div className="absolute bottom-10 left-10 w-[240px] h-[240px] rounded-full bg-emerald-500/5 blur-[90px] pointer-events-none" />

      {/* QR Payment Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-sm rounded-[32px] p-8 border ${cardBg} ${border}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#C7FF2E]" />
                  <span className="font-display font-black text-sm uppercase tracking-wider">
                    {lang === 'en' ? 'PromptPay QR' : 'สแกนจ่ายด้วย QR'}
                  </span>
                </div>
                <button
                  onClick={handleCancelQR}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${btnGhost}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center mb-6">
                <p className={`text-4xl font-display font-black ${selectedTierData.color}`}>
                  ฿{selectedTierData.price}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  DailyStack {selectedTierData.name} Plan
                </p>
              </div>

              {qrLoading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <div className="w-12 h-12 border-3 border-[#C7FF2E] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : qrImageUrl ? (
                <div className="relative flex items-center justify-center mb-6">
                  <div className="p-4 rounded-2xl border-2 border-[#C7FF2E]/30 bg-white">
                    <img src={qrImageUrl} alt="PromptPay QR" className="w-[240px] h-[240px]" />
                  </div>
                  <div
                    className={`absolute -top-3 -right-3 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-mono font-bold ${countdown < 120 ? 'bg-red-500 text-white' : 'bg-[#C7FF2E] text-black'}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {formatCountdown(countdown)}
                  </div>
                </div>
              ) : null}

              {paymentError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-xs text-red-400">{paymentError}</span>
                </div>
              )}

              {!qrLoading && (
                <div className={`text-center text-xs leading-relaxed ${textMuted}`}>
                  {lang === 'en'
                    ? 'Open your mobile banking app → Scan QR code. Payment confirms automatically.'
                    : 'เปิดแอปธนาคาร → สแกน QR Code การชำระเงินจะยืนยันอัตโนมัติ'}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto z-10">
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[9px] tracking-widest uppercase border ${cardBg} ${border} ${textSubtle}`}
        >
          <Star className={`w-3.5 h-3.5 ${isDark ? 'text-[#C7FF2E]' : 'text-emerald-700'}`} />
          {lang === 'en' ? 'DailyStack Plan Upgrade' : 'อัพเกรดแพลน DailyStack'}
        </div>
        {onClose && (
          <button
            id="btn-close-paywall"
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${btnGhost}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto w-full my-auto py-8 md:py-12 z-10">
        {upgraded ? (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center p-10 md:p-12 rounded-[36px] relative overflow-hidden max-w-lg mx-auto shadow-2xl border ${cardBg} border-[#C7FF2E]/30`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-[#C7FF2E]/10' : 'bg-emerald-100'}`}
            >
              <Star className={`w-8 h-8 animate-bounce ${isDark ? 'text-[#C7FF2E]' : 'text-emerald-600'}`} />
            </div>
            <h2
              className={`font-display font-black text-3xl tracking-tight leading-none uppercase ${textPrimary}`}
            >
              {lang === 'en' ? 'Sovereign Status Active' : 'สถานะพรีเมียมเปิดใช้งานแล้ว'}
            </h2>
            <p className={`text-sm font-sans mt-4 leading-relaxed ${textMuted}`}>
              {lang === 'en' ? (
                <span>
                  Welcome to{' '}
                  <strong className="text-[#C7FF2E]">
                    DailyStack {selectedTier.toUpperCase()}
                  </strong>
                  . Your AI financial coach is ready.
                </span>
              ) : (
                <span>
                  ยินดีต้อนรับสู่{' '}
                  <strong className="text-emerald-800 dark:text-[#C7FF2E]">
                    DailyStack {selectedTier.toUpperCase()}
                  </strong>
                  . AI Coach ของคุณพร้อมแล้ว
                </span>
              )}
            </p>
            <div
              className={`p-4 rounded-2xl border mt-8 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 ${surfaceBg} ${border} ${textSubtle}`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 font-bold" />{' '}
              {t.sovereignVerified}
            </div>
            {onClose && (
              <button
                id="btn-success-close"
                onClick={onClose}
                className={`w-full text-black font-display font-extrabold text-xs py-4 rounded-2xl uppercase tracking-wider mt-6 hover:scale-[1.01] transition-transform cursor-pointer ${isDark ? 'bg-[#C7FF2E]' : 'bg-[#C7FF2E] border border-black/10 shadow-md'}`}
              >
                {lang === 'en' ? 'RETURN TO DASHBOARD' : 'กลับสู่แดชบอร์ด'}
              </button>
            )}
          </motion.div>
        ) : (
          /* Plan selection */
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1
                className={`font-display font-black text-3xl md:text-4xl tracking-tight leading-none uppercase ${textPrimary}`}
              >
                {lang === 'en' ? 'Choose Your' : 'เลือก'}{' '}
                <span className={isDark ? 'text-[#C7FF2E]' : 'text-emerald-800'}>
                  {lang === 'en' ? 'Plan' : 'แพลน'}
                </span>
              </h1>
              <p className={`text-sm mt-3 leading-relaxed ${textMuted}`}>
                {lang === 'en'
                  ? 'Start free. Upgrade when you are ready to transform your financial behavior.'
                  : 'เริ่มฟรี อัพเกรดเมื่อพร้อมเปลี่ยนพฤติกรรมทางการเงินของคุณ'}
              </p>
            </div>

            {/* Tier cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((tier) => {
                const isSelected = selectedTier === tier.id;
                const isDisabled = tier.id === 'basic';
                return (
                  <button
                    key={tier.id}
                    onClick={() =>
                      !isDisabled && setSelectedTier(tier.id as 'pro' | 'elite')
                    }
                    className={`relative rounded-2xl border-2 p-5 text-left transition-all ${isSelected && !isDisabled ? tier.borderColor + ' ' + tier.bgColor : isDark ? 'border-white/10 bg-[#171C15]' : 'border-slate-200 bg-white'} ${isDisabled ? 'opacity-60' : 'hover:border-white/20 cursor-pointer'}`}
                    disabled={isDisabled}
                  >
                    {tier.badge && (
                      <span
                        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${isDark ? 'bg-[#C7FF2E] text-[#0B0F0A]' : 'bg-emerald-600 text-white'}`}
                      >
                        {tier.badge[lang]}
                      </span>
                    )}
                    <div className="space-y-3">
                      <div>
                        <p className={`font-black text-lg ${tier.color}`}>
                          {tier.name}
                        </p>
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                          {tier.tagline[lang]}
                        </p>
                      </div>
                      <div className="py-3 border-t border-b border-white/10">
                        <p className={`font-display font-black text-2xl ${tier.color}`}>
                          {tier.price === 0 ? 'FREE' : '฿' + tier.price}
                        </p>
                        {tier.price > 0 && (
                          <p className="text-[10px] text-white/40">{tier.priceLabel}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Premium features */}
            <div className="space-y-4">
              <h3
                className={`text-center text-xs font-mono uppercase tracking-widest ${textSubtle}`}
              >
                {lang === 'en' ? 'Premium Features' : 'ฟีเจอร์พรีเมียม'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {capabilityFeatures.map((cap, i) => {
                  const Icon = cap.icon;
                  return (
                    <div
                      key={i}
                      className={`flex gap-4 p-4 rounded-2xl border transition-all ${cardBg} ${border} ${isDark ? 'hover:border-white/10' : ''}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${inputSurface}`}
                      >
                        <Icon className={`w-5 h-5 ${cap.iconColor}`} />
                      </div>
                      <div>
                        <h3
                          className={`font-display font-extrabold text-xs uppercase ${textPrimary}`}
                        >
                          {cap.title[lang]}
                        </h3>
                        <p className={`text-xs leading-relaxed mt-1 ${textMuted}`}>
                          {cap.desc[lang]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA bar */}
            <div className={`rounded-[24px] p-6 md:p-8 border transition-all ${cardBg} ${border}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className={`font-display font-black text-xl ${selectedTierData.color}`}>
                    {selectedTierData.name}{' '}
                    {lang === 'en' ? 'Plan' : 'แพลน'}
                  </p>
                  <p className="text-sm text-white/50 mt-1">
                    {selectedTierData.tagline[lang]}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-display font-black text-2xl ${selectedTierData.color}`}>
                      {selectedTierData.price === 0
                        ? 'FREE'
                        : '฿' + selectedTierData.price}
                    </p>
                    {selectedTierData.price > 0 && (
                      <p className="text-[10px] text-white/40">
                        /{selectedTierData.priceLabel}
                      </p>
                    )}
                  </div>
                   {selectedTierData.price > 0 ? (
                     <div className="w-44">
                       <SlideToUpgrade
                         onSlideComplete={handleUpgradeTrigger}
                         lang={lang}
                         tierColor={selectedTier === 'elite' ? '#FFD700' : '#C7FF2E'}
                         isLoading={loading || qrLoading}
                       />
                     </div>
                   ) : (
                     <span className="text-xs font-mono text-white/40 px-4 py-2">
                       {lang === 'en' ? 'Current Plan' : 'แพลนปัจจุบัน'}
                     </span>
                   )}
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] text-white/40">
                    {lang === 'en' ? 'AES-256 Encrypted' : 'เข้ารหัส AES-256'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] text-white/40">
                    {lang === 'en' ? 'Cancel Anytime' : 'ยกเลิกได้ทุกเมื่อ'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer compliance */}
      <div
        className={`max-w-5xl mx-auto w-full text-center text-[9px] font-mono text-zinc-500 border-t pt-6 ${border}`}
      >
        DAILYSTACK SYSTEMS SECURITIES LTD - CLOUDFLARE ENCRYPTED VAULT NETWORKS -
        GLOBAL CORE ARCHITECTURES
      </div>
    </div>
  );
}