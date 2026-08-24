/**
 * ============================================================
 * DailyStack — Rocket Money Style Paywall
 * ============================================================
 * Design: Rocket Money "pay what you think is fair" model
 * - Single Premium tier (internal tier: 'pro')
 * - Price slider $7–$14/month, all features equal
 * - 7-day free trial, cancel anytime
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Sparkles, QrCode } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import QRCode from 'qrcode';
import { haptics } from '../services/hapticService';
import billingService, {
  PREMIUM_MIN_CENTS,
  PREMIUM_MAX_CENTS,
  PREMIUM_DEFAULT_CENTS,
  formatPrice,
} from '../services/billingService';
import { createPromptPayPayment, checkPaymentStatus, PaymentIntentResult } from '../services/stripeService';
import { UserProfile } from '../types';
import { Language, translations } from '../data/translations';

interface PaywallPageProps {
  profile: UserProfile;
  onUpgradeComplete: (tier: 'pro' | 'elite') => void;
  onClose?: () => void;
  lang: Language;
  theme: 'dark' | 'light';
}

const NAVY = '#001C5A';
const POLL_INTERVAL_MS = 3000;

type PaymentStage = 'form' | 'qr' | 'expired' | 'failed';

export default function PaywallPage({
  profile,
  onUpgradeComplete,
  onClose,
  lang,
}: PaywallPageProps) {
  const [priceCents, setPriceCents] = useState<number>(PREMIUM_DEFAULT_CENTS);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStage, setPaymentStage] = useState<PaymentStage>('form');
  const [payment, setPayment] = useState<PaymentIntentResult | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const t = translations[lang];

  // Premium feature list (PicksWise capabilities — manual-first)
  const features = lang === 'th'
    ? [
        'งบประมาณและหมวดหมู่ไม่จำกัด',
        'ติดตามรายจ่ายประจำ + ปฏิทินบิล',
        'แจ้งเตือนราคาขึ้น / Ghost subscription',
        'Smart Savings เป้าหมายการออม',
        'มูลค่าสุทธิ + สุขภาพการเงินรายวัน',
        'AI Coach ผู้ช่วยวิเคราะห์การเงินส่วนตัว',
        'Priority support',
      ]
    : [
        'Unlimited budgets & custom categories',
        'Recurring tracking + upcoming bills calendar',
        'Price hike & ghost subscription alerts',
        'Smart Savings goals',
        'Net worth + daily financial health score',
        'Personal AI Money Coach insights',
        'Priority support',
      ];

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const completeUpgrade = useCallback(() => {
    stopPolling();
    haptics.fire('DEEP_RESONANCE');
    setIsUpgraded(true);
    onUpgradeComplete('pro');
  }, [onUpgradeComplete, stopPolling]);

  // Poll Stripe until the PromptPay payment settles or the QR expires.
  const startPolling = useCallback((paymentIntentId: string, expiresAtSec: number) => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      if (Date.now() / 1000 > expiresAtSec) {
        setPaymentStage('expired');
        stopPolling();
        return;
      }
      try {
        const res = await checkPaymentStatus(paymentIntentId);
        if (res.status === 'succeeded') {
          completeUpgrade();
        } else if (res.status === 'failed' || res.status === 'cancelled') {
          setPaymentStage('failed');
          stopPolling();
        }
      } catch {
        // Transient network error — keep polling until expiry.
      }
    }, POLL_INTERVAL_MS);
  }, [completeUpgrade, stopPolling]);

  // Countdown ticker for the QR expiry clock.
  useEffect(() => {
    if (paymentStage !== 'qr' || !payment) return;
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.floor(payment.expiresAt - Date.now() / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [paymentStage, payment]);

  // Cleanup polling on unmount.
  useEffect(() => stopPolling, [stopPolling]);

  const handleUpgrade = async () => {
    haptics.fire('DEEP_RESONANCE');
    setIsProcessing(true);
    try {
      const result = await createPromptPayPayment('pro');
      const dataUrl = await QRCode.toDataURL(result.qrData, { width: 512, margin: 1 });
      setPayment(result);
      setQrDataUrl(dataUrl);
      setSecondsLeft(Math.max(0, Math.floor(result.expiresAt - Date.now() / 1000)));
      setPaymentStage('qr');
      startPolling(result.paymentIntentId, result.expiresAt);
      return;
    } catch (stripeErr) {
      console.warn('[Paywall] Stripe unavailable, falling back to dev billing:', stripeErr);
      // Dev fallback — Stripe keys not configured yet.
      try {
        const res = await billingService.createSubscription('pro', {
          trialDays: 7,
          monthlyPriceCents: priceCents,
        });
        if (res.success) {
          setIsUpgraded(true);
          onUpgradeComplete('pro');
        }
      } catch (err) {
        console.error('Billing error', err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryPayment = async () => {
    setPaymentStage('form');
    setPayment(null);
    setQrDataUrl(null);
    await handleUpgrade();
  };

  const handleDismiss = () => {
    haptics.fire('SELECT');
    stopPolling();
    if (onClose) {
      onClose();
    }
  };

  const handleSlider = (value: number) => {
    setPriceCents(value);
  };

  // QR Payment Screen (PromptPay)
  if (paymentStage === 'qr' || paymentStage === 'expired' || paymentStage === 'failed') {
    const formatCountdown = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : undefined}
        className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleDismiss();
        }}
      >
        <motion.div
          initial={reduceMotion ? undefined : { y: '100%' }}
          animate={{ y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl overflow-hidden"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex justify-end px-5 pt-6">
            <button
              onClick={handleDismiss}
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#F4F4F5' }}
              aria-label={lang === 'th' ? 'ปิด' : 'Close'}
            >
              <X className="w-4 h-4" style={{ color: '#000000' }} />
            </button>
          </div>

          <div className="flex flex-col items-center text-center px-5 pb-10 pt-2">
            {paymentStage === 'qr' && qrDataUrl && payment ? (
              <>
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: '#000000', fontFamily: '"Inter", sans-serif' }}
                >
                  {t.paywallScanQr}
                </h2>
                <p
                  className="text-sm mb-4"
                  style={{ color: '#6E6E73', fontFamily: '"Inter", sans-serif' }}
                >
                  {t.paywallScanQrHint}
                </p>
                <div
                  className="p-3 rounded-2xl mb-4"
                  style={{ border: '1px solid #E5E5EA', backgroundColor: '#FFFFFF' }}
                >
                  <img src={qrDataUrl} alt={t.paywallScanQr} width={220} height={220} />
                </div>
                <p
                  className="text-[28px] font-bold mb-1"
                  style={{
                    color: NAVY,
                    fontFamily: '"Inter", sans-serif',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  ฿{(payment.amount / 100).toLocaleString('th-TH', { minimumFractionDigits: 0 })}
                  <span className="text-sm font-medium" style={{ color: '#6E6E73' }}>
                    {' '}
                    {payment.currency.toUpperCase()}
                  </span>
                </p>
                <p
                  className="text-sm mb-2"
                  style={{
                    color: secondsLeft < 60 ? '#B45309' : '#6E6E73',
                    fontFamily: '"Inter", sans-serif',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {t.paywallQrExpiresIn} {formatCountdown(secondsLeft)}
                </p>
                <motion.div
                  animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" style={{ color: NAVY }} />
                  <span className="text-sm" style={{ color: NAVY, fontFamily: '"Inter", sans-serif' }}>
                    {t.paywallWaitingPayment}
                  </span>
                </motion.div>
              </>
            ) : (
              <>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#F4F4F5' }}
                >
                  <X className="w-8 h-8" style={{ color: '#6E6E73' }} />
                </div>
                <p
                  className="text-base font-semibold mb-6"
                  style={{ color: '#1C1C1E', fontFamily: '"Inter", sans-serif' }}
                >
                  {paymentStage === 'expired' ? t.paywallQrExpired : t.paywallPaymentFailed}
                </p>
              </>
            )}

            <button
              onClick={paymentStage === 'qr' ? handleDismiss : handleRetryPayment}
              className="mt-4 w-full rounded-full font-semibold"
              style={{
                backgroundColor: paymentStage === 'qr' ? '#F4F4F5' : NAVY,
                color: paymentStage === 'qr' ? '#000000' : '#FFFFFF',
                fontFamily: '"Inter", sans-serif',
                fontSize: '17px',
                height: '52px',
              }}
            >
              {paymentStage === 'qr'
                ? t.paywallBack
                : lang === 'th'
                  ? t.paywallTryAgain
                  : t.paywallTryAgain}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Success State
  if (isUpgraded) {
    return (
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : undefined}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <motion.div
          initial={reduceMotion ? undefined : { y: '100%' }}
          animate={{ y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl p-6 pb-10"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex flex-col items-center text-center py-8">
            <motion.div
              initial={reduceMotion ? undefined : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: NAVY }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: '#000000', fontFamily: '"Inter", sans-serif' }}
            >
              {t.paywallWelcome}
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: '#6E6E73', fontFamily: '"Inter", sans-serif' }}
            >
              {t.paywallSuccessText}
            </p>
            <button
              onClick={handleDismiss}
              className="px-8 py-3 rounded-full font-semibold"
              style={{ backgroundColor: NAVY, color: '#FFFFFF', fontFamily: '"Inter", sans-serif' }}
            >
              {t.paywallGetStarted}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : undefined}
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <motion.div
        initial={reduceMotion ? undefined : { y: '100%' }}
        animate={{ y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {/* Close Button - Top Right */}
        <div className="flex justify-end px-5 pt-6">
          <button
            onClick={handleDismiss}
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#F4F4F5' }}
            aria-label={lang === 'th' ? 'ปิด' : 'Close'}
          >
            <X className="w-4 h-4" style={{ color: '#000000' }} />
          </button>
        </div>

        {/* Hero Icon - Centered */}
        <div className="flex justify-center pt-4">
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{
              backgroundColor: NAVY,
              borderRadius: '8px',
              transform: 'rotate(45deg)',
            }}
          >
            <Sparkles className="w-8 h-8 text-white" style={{ transform: 'rotate(-45deg)' }} />
          </div>
        </div>

        {/* Header - Centered */}
        <div className="px-5 pt-6 text-center">
          <h1
            className="text-[32px] font-bold mb-3"
            style={{
              color: '#000000',
              fontFamily: '"Inter", sans-serif',
              letterSpacing: '-0.5px',
            }}
          >
            {lang === 'th' ? 'ลอง Premium ฟรี 7 วัน' : 'Try Premium free for 7 days'}
          </h1>
          <p
            className="text-base mb-6"
            style={{
              color: '#6E6E73',
              fontFamily: '"Inter", sans-serif',
              lineHeight: '24px',
            }}
          >
            {lang === 'th'
              ? 'ปลดล็อกทุกฟีเจอร์ ไม่ต้องผูกบัญชีธนาคาร — และจ่ายในราคาที่คุณคิดว่ายุติธรรม'
              : 'Unlock every feature — no bank account required — and pay what you think is fair.'}
          </p>
        </div>

        {/* Feature List */}
        <div className="px-5 mb-6">
          <div
            className="rounded-2xl px-5 py-2"
            style={{ border: '1px solid #E5E5EA' }}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3"
                style={{ borderBottom: i < features.length - 1 ? '1px solid #F0F0F0' : 'none' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: NAVY }}
                />
                <span
                  className="text-base"
                  style={{ color: '#1C1C1E', fontFamily: '"Inter", sans-serif' }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pay-What-You-Want Slider */}
        <div className="px-5 mb-2">
          <div className="flex items-baseline justify-between mb-3">
            <span
              className="text-sm font-semibold"
              style={{ color: '#1C1C1E', fontFamily: '"Inter", sans-serif' }}
            >
              {lang === 'th' ? 'จ่ายเท่าที่คุณคิดว่ายุติธรรม' : 'Pay what you think is fair'}
            </span>
            <span
              style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700,
                fontSize: '20px',
                color: NAVY,
              }}
            >
              {formatPrice(priceCents)}
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#6E6E73' }}>
                {t.paywallPerMonth}
              </span>
            </span>
          </div>
          <input
            type="range"
            min={PREMIUM_MIN_CENTS}
            max={PREMIUM_MAX_CENTS}
            step={100}
            value={priceCents}
            onChange={(e) => handleSlider(Number(e.target.value))}
            className="w-full accent-[#001C5A]"
            style={{ accentColor: NAVY, height: 32 }}
            aria-label={
              lang === 'th'
                ? `ราคาต่อเดือน ${formatPrice(priceCents)}`
                : `Monthly price ${formatPrice(priceCents)}`
            }
          />
          <div className="flex justify-between mt-1">
            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: '#8E8E93' }}>
              {formatPrice(PREMIUM_MIN_CENTS)}
            </span>
            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: '#8E8E93' }}>
              {lang === 'th' ? 'ปรับราคาได้ทุกเมื่อ' : 'Adjust your price anytime'}
            </span>
            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: '#8E8E93' }}>
              {formatPrice(PREMIUM_MAX_CENTS)}
            </span>
          </div>
        </div>

        {/* Subscribe Button */}
        <div className="px-5 pb-8 pt-4">
          <motion.button
            onClick={handleUpgrade}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            disabled={isProcessing}
            className="w-full rounded-full font-semibold transition-all disabled:opacity-50"
            style={{
              backgroundColor: NAVY,
              color: '#FFFFFF',
              fontFamily: '"Inter", sans-serif',
              fontSize: '18px',
              height: '56px',
            }}
          >
            {isProcessing
              ? t.paywallLoading
              : lang === 'th'
                ? `เริ่มทดลองฟรี 7 วัน — ${formatPrice(priceCents)}/เดือน`
                : `Start my free trial — ${formatPrice(priceCents)}/mo`}
          </motion.button>
          <p
            className="text-center mt-3"
            style={{
              color: '#6E6E73',
              fontFamily: '"Inter", sans-serif',
              fontSize: '13px',
            }}
          >
            {t.paywallAutoRenew}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
