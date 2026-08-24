import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import { saveConsent } from '../services/consentStore';
import { Language } from '../data/translations';
import { hapticPresets } from '../design-system/haptic-tokens';

const fireHaptic = () => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const p = hapticPresets.SELECT;
    navigator.vibrate([Math.round(p.time * p.sharpness * 0.3), Math.round(p.intensity * 255)]);
  }
};

interface PdpaConsentBannerProps {
  lang: Language;
  onAccept: (analytics: boolean) => void;
}

export default function PdpaConsentBanner({ lang, onAccept }: PdpaConsentBannerProps) {
  const [leaving, setLeaving] = useState(false);

  const accept = (analytics: boolean) => {
    fireHaptic();
    setLeaving(true);
    setTimeout(() => {
      saveConsent(analytics);
      onAccept(analytics);
    }, 220);
  };

  const th = lang === 'th';

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: leaving ? '100%' : 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3"
      role="dialog"
      aria-live="polite"
      aria-label={th ? 'การยินยอมเก็บข้อมูลส่วนบุคคล' : 'Personal data consent'}
    >
      <div
        className="mx-auto max-w-md rounded-2xl p-4 shadow-2xl"
        style={{
          backgroundColor: '#0C2140',
          border: '1px solid rgba(224,242,252,0.12)',
          boxShadow: '0 -8px 40px rgba(5,13,31,0.6)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(15,176,206,0.15)' }}>
            <ShieldCheck className="w-5 h-5" style={{ color: '#0FB0CE' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold leading-snug" style={{ color: '#E0F2FC' }}>
              {th ? 'ความเป็นส่วนตัวของคุณ' : 'Your privacy'}
            </p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'rgba(224,242,252,0.7)' }}>
              {th
                ? 'เราเก็บข้อมูลการเงินที่คุณกรอกไว้ในบัญชีของคุณเท่านั้น ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล อ่าน'
                : 'We store the financial data you enter only in your own account, per Thailand PDPA. Read our '}
              <a href="/privacy" target="_blank" rel="noreferrer" className="underline" style={{ color: '#0FB0CE' }}>
                {th ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
              </a>
              {th ? ' และ ' : ' and '}
              <a href="/terms" target="_blank" rel="noreferrer" className="underline" style={{ color: '#0FB0CE' }}>
                {th ? 'ข้อกำหนดการใช้บริการ' : 'Terms'}
              </a>.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => accept(false)}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95 min-h-[44px]"
            style={{ backgroundColor: 'rgba(224,242,252,0.08)', color: '#E0F2FC' }}
          >
            {th ? 'จำเป็นเท่านั้น' : 'Essential only'}
          </button>
          <button
            onClick={() => accept(true)}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-95 min-h-[44px]"
            style={{ backgroundColor: '#071838', color: '#FFFFFF', border: '1px solid rgba(15,176,206,0.5)' }}
          >
            {th ? 'ยอมรับทั้งหมด' : 'Accept all'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
