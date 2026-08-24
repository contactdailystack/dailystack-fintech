/**
 * BillNegotiationCard Component
 * Premium card for bill negotiation concierge service (Rocket Money style)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Handshake, Sparkles } from 'lucide-react';

export interface BillNegotiationCardProps {
  onGetStarted?: () => void;
  isPremium?: boolean;
  lang?: 'en' | 'th';
}

export const BillNegotiationCard: React.FC<BillNegotiationCardProps> = ({
  onGetStarted,
  isPremium = false,
  lang = 'en'
}) => {
  const translations = {
    en: {
      title: 'Need help negotiating bills?',
      subtitle: 'Let our concierge help you lower your internet, phone & more',
      getStarted: 'Get Started',
      premium: 'Premium',
      estimatedSavings: 'Users save up to $740/year',
    },
    th: {
      title: 'ต้องการความช่วยเหลือในการต่อรองค่าใช้จ่าย?',
      subtitle: 'ให้ทีมงานของเราช่วยคุณลดค่าอินเทอร์เน็ต โทรศัพท์ และอื่นๆ',
      getStarted: 'ลองเลย',
      premium: 'Premium',
      estimatedSavings: 'ผู้ใช้ประหยัดได้ถึง $740/ปี',
    }
  };

  const t = translations[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[24px]"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a]" />
      
      {/* Accent glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#56be89]/20 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#56be89]/10 border border-[#56be89]/20 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-[#56be89]" />
          </div>

          {/* Premium badge */}
          <div className="flex items-center gap-2">
            {isPremium ? (
              <span className="px-3 py-1 rounded-full bg-[#56be89] text-black text-[10px] font-bold uppercase tracking-wider">
                {t.premium}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-medium uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {t.premium}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-white text-lg mb-2 leading-tight">
          {t.title}
        </h3>

        {/* Subtitle */}
        <p className="text-white/60 text-sm mb-5 leading-relaxed">
          {t.subtitle}
        </p>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="w-full bg-[#56be89] text-black font-display font-bold text-sm py-3.5 rounded-xl uppercase tracking-wider hover:bg-[#6fcca3] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#56be89]/20"
        >
          {t.getStarted}
        </button>

        {/* Estimated savings */}
        <div className="flex items-center justify-center gap-2 mt-4 text-white/40 text-xs">
          <Handshake className="w-3.5 h-3.5" />
          <span>{t.estimatedSavings}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default BillNegotiationCard;
