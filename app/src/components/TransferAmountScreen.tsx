/**
 * ============================================================
 * DailyStack — Transfer Amount Screen v1.0
 * ============================================================
 * Sprint 2: Transaction & Wallet Core
 * 
 * Design Specs (UX Screens Inventory v4.2):
 * - Background: Dark (#0B0F0A)
 * - Primary Accent: Lime Green (#56be89)
 * - Typography: Inter font
 * - Layout: One-handed operation optimized
 * 
 * Interactive Controls:
 * - Avatar Quick Selection Carousel (frequent recipients)
 * - Card Bank Selector (payment source)
 * - Custom Numerical Keypad (0-9, decimal, clear)
 * - Send Money button (bottom, thumb zone)
 */

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Edit3,
  Send,
  X,
  Check,
  CreditCard,
  Wallet,
  Banknote,
  User,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../data/translations';
import { haptics } from '../services/hapticService';

interface Recipient {
  id: string;
  name: string;
  icon: 'person' | 'woman' | 'elder' | 'user' | 'building';
}

interface PaymentSource {
  id: string;
  type: 'card' | 'wallet' | 'bank';
  name: string;
  last4?: string;
  color: string;
}

interface TransferAmountScreenProps {
  lang: Language;
  onBack: () => void;
  onSend: (amount: number, recipient: Recipient, source: PaymentSource) => void;
  initialRecipient?: Recipient;
  userBalance?: number;
}

type TransferState = 'select-recipient' | 'enter-amount' | 'confirm' | 'success';

export default function TransferAmountScreen({
  lang,
  onBack,
  onSend,
  initialRecipient,
  userBalance = 50000,
}: TransferAmountScreenProps) {
  const t = translations[lang];
  const [state, setState] = useState<TransferState>(
    initialRecipient ? 'enter-amount' : 'select-recipient'
  );
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(
    initialRecipient || null
  );
  const [selectedSource, setSelectedSource] = useState<PaymentSource | null>(null);
  const [amount, setAmount] = useState('');
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock data - frequent recipients
  const recipients: Recipient[] = [
    { id: '1', name: 'สมชาย', icon: 'person' },
    { id: '2', name: 'สมหญิง', icon: 'woman' },
    { id: '3', name: 'แม่', icon: 'elder' },
    { id: '4', name: 'พี่วิน', icon: 'user' },
    { id: '5', name: 'บริษัท', icon: 'building' },
  ];

  // Helper to render recipient icon (accessibility-safe SVG)
  const RecipientIcon = ({ icon, size = 20 }: { icon: Recipient['icon']; size?: number }) => {
    switch (icon) {
      case 'person': return <User size={size} style={{ color: '#56be89' }} />;
      case 'woman': return <User size={size} style={{ color: '#FF69B4' }} />;
      case 'elder': return <User size={size} style={{ color: '#AAAAAA' }} />;
      case 'user': return <User size={size} style={{ color: '#56be89' }} />;
      case 'building': return <Building2 size={size} style={{ color: '#56be89' }} />;
      default: return <User size={size} />;
    }
  };

  // Mock data - payment sources
  const paymentSources: PaymentSource[] = [
    { id: 'card1', type: 'card', name: 'Visa •••• 4242', last4: '4242', color: '#1a1a2e' },
    { id: 'card2', type: 'card', name: 'Mastercard •••• 5555', last4: '5555', color: '#2d1b4e' },
    { id: 'wallet', type: 'wallet', name: 'PicksWise Wallet', color: '#0B0F0A' },
    { id: 'bank', type: 'bank', name: 'KBANK •••• 1234', last4: '1234', color: '#0d7377' },
  ];

  // Initialize selected source
  useEffect(() => {
    if (!selectedSource && paymentSources.length > 0) {
      setSelectedSource(paymentSources[0]);
    }
  }, []);

  const handleAmountChange = (digit: string) => {
    // Haptic feedback for each keypress
    if (digit === 'clear' || digit === 'backspace') {
      haptics.fire('CRISP_CLICK');
    } else {
      haptics.fire('SELECT');
    }

    if (digit === 'clear') {
      setAmount('');
    } else if (digit === 'backspace') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (digit === '.') {
      if (!amount.includes('.')) {
        setAmount((prev) => prev + '.');
      }
    } else {
      // Limit decimal places to 2
      const parts = amount.split('.');
      if (parts.length === 2 && parts[1].length >= 2) {
        return;
      }
      // Limit total length
      if (amount.length >= 12) {
        return;
      }
      setAmount((prev) => prev + digit);
    }
  };

  const handleContinue = () => {
    if (!selectedRecipient || !amount || parseFloat(amount) <= 0) return;
    setState('confirm');
  };

  const handleConfirm = () => {
    if (!selectedRecipient || !amount || !selectedSource) return;
    onSend(parseFloat(amount), selectedRecipient, selectedSource);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

  const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'wallet':
        return <Wallet className="w-5 h-5" />;
      case 'bank':
        return <Banknote className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  // Success Animation
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: '#0B0F0A' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: '#0B0F0A',
            boxShadow: '0 0 60px rgba(86, 190, 137, 0.3)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Check className="w-16 h-16" style={{ color: '#56be89' }} />
          </motion.div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-xl font-medium"
          style={{ color: '#56be89' }}
        >
          {lang === 'th' ? 'โอนสำเร็จ!' : 'Transfer Successful!'}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0B0F0A' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <button
          onClick={state === 'select-recipient' ? onBack : () => setState('select-recipient')}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">
          {state === 'select-recipient'
            ? lang === 'th' ? 'เลือกผู้รับ' : 'Select Recipient'
            : state === 'confirm'
            ? lang === 'th' ? 'ยืนยันการโอน' : 'Confirm Transfer'
            : lang === 'th' ? 'โอนเงิน' : 'Send Money'}
        </h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 pb-6">
        {/* Recipient Section */}
        {state === 'select-recipient' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {lang === 'th' ? 'โอนให้' : 'Send to'}
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recipients.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRecipient(r);
                    setState('enter-amount');
                  }}
                  className="flex flex-col items-center min-w-[72px] p-3 rounded-2xl transition-all"
                  style={{
                    backgroundColor:
                      selectedRecipient?.id === r.id
                        ? 'rgba(86, 190, 137, 0.15)'
                        : 'rgba(255,255,255,0.05)',
                    border:
                      selectedRecipient?.id === r.id
                        ? '1px solid rgba(86, 190, 137, 0.5)'
                        : '1px solid transparent',
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center mb-2">
                    <RecipientIcon icon={r.icon} size={20} />
                  </div>
                  <span className="text-xs text-white/80">{r.name}</span>
                </button>
              ))}
              <button
                onClick={() => setShowRecipientPicker(true)}
                className="flex flex-col items-center justify-center min-w-[72px] h-[88px] rounded-2xl border border-dashed border-white/20"
              >
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs text-white/60">
                  {lang === 'th' ? 'เพิ่ม' : 'Add'}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Amount Section */}
        {(state === 'enter-amount' || state === 'confirm') && selectedRecipient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Recipient Badge */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
                <RecipientIcon icon={selectedRecipient.icon} size={18} />
              </div>
              <span className="text-lg text-white font-medium">{selectedRecipient.name}</span>
              <button
                onClick={() => setState('select-recipient')}
                className="text-sm px-3 py-1 rounded-full"
                style={{ color: '#56be89', backgroundColor: 'rgba(199,255,46,0.1)' }}
              >
                {lang === 'th' ? 'เปลี่ยน' : 'Change'}
              </button>
            </div>

            {/* Payment Source Selector */}
            {selectedSource && (
              <button
                onClick={() => setShowSourcePicker(true)}
                className="flex items-center justify-between mx-auto mb-6 px-4 py-2 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedSource.color }}
                  >
                    {getSourceIcon(selectedSource.type)}
                  </div>
                  <span className="text-sm text-white">{selectedSource.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-white/60" />
              </button>
            )}

            {/* Amount Display */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl text-white/60">฿</span>
                <span
                  className="text-6xl font-bold tracking-tight"
                  style={{ color: amount ? '#FFFFFF' : 'rgba(255,255,255,0.3)' }}
                >
                  {amount || '0'}
                </span>
              </div>
              {selectedSource && (
                <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {lang === 'th' ? 'ยอดคงเหลือ' : 'Balance'}: ฿
                  {userBalance.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            {/* Confirm State - Show Details */}
            {state === 'confirm' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 rounded-2xl p-4 mb-6"
              >
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-white/60">
                    {lang === 'th' ? 'จำนวนเงิน' : 'Amount'}
                  </span>
                  <span className="text-white font-medium">฿{parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-white/60">
                    {lang === 'th' ? 'ค่าธรรมเนียม' : 'Fee'}
                  </span>
                  <span className="text-white font-medium" style={{ color: '#56be89' }}>
                    {lang === 'th' ? 'ฟรี' : 'Free'}
                  </span>
                </div>
                <div className="h-px bg-white/10 my-3" />
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">
                    {lang === 'th' ? 'รวมทั้งหมด' : 'Total'}
                  </span>
                  <span className="text-white font-bold">฿{parseFloat(amount).toLocaleString()}</span>
                </div>
              </motion.div>
            )}

            {/* Numeric Keypad */}
            {state === 'enter-amount' && (
              <div className="mt-auto grid grid-cols-3 gap-2">
                {numericKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleAmountChange(key)}
                    className="h-14 rounded-xl text-xl font-medium transition-all active:scale-95"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      color: key === '⌫' ? '#FF6B6B' : 'white',
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {state === 'enter-amount' && (
              <button
                onClick={handleContinue}
                disabled={!amount || parseFloat(amount) <= 0}
                className="mt-4 w-full py-4 rounded-2xl font-semibold text-lg transition-all"
                style={{
                  backgroundColor:
                    amount && parseFloat(amount) > 0 ? '#56be89' : 'rgba(199,255,46,0.2)',
                  color: amount && parseFloat(amount) > 0 ? '#0B0F0A' : 'rgba(0,0,0,0.3)',
                }}
              >
                {lang === 'th' ? 'ดำเนินการต่อ' : 'Continue'}
              </button>
            )}

            {state === 'confirm' && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setState('enter-amount')}
                  className="flex-1 py-4 rounded-2xl font-semibold text-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                >
                  {lang === 'th' ? 'ย้อนกลับ' : 'Back'}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#56be89', color: '#0B0F0A' }}
                >
                  <Send className="w-5 h-5" />
                  {lang === 'th' ? 'โอนเลย' : 'Send'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Source Picker Modal */}
      <AnimatePresence>
        {showSourcePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowSourcePicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-3xl p-6"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <div className="w-12 h-1 rounded-full mx-auto mb-6 bg-white/20" />
              <h3 className="text-lg font-semibold text-white mb-4">
                {lang === 'th' ? 'เลือกบัญชีต้นทาง' : 'Select Payment Source'}
              </h3>
              <div className="space-y-3">
                {paymentSources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => {
                      setSelectedSource(source);
                      setShowSourcePicker(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                    style={{
                      backgroundColor:
                        selectedSource?.id === source.id
                          ? 'rgba(86, 190, 137, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                      border:
                        selectedSource?.id === source.id
                          ? '1px solid rgba(86, 190, 137, 0.5)'
                          : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: source.color }}
                    >
                      {getSourceIcon(source.type)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{source.name}</p>
                      {source.last4 && (
                        <p className="text-sm text-white/60">
                          {lang === 'th' ? 'ยอดคงเหลือ' : 'Balance'}: ฿
                          {userBalance.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                    {selectedSource?.id === source.id && (
                      <Check className="w-5 h-5" style={{ color: '#56be89' }} />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipient Picker Modal */}
      <AnimatePresence>
        {showRecipientPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowRecipientPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-3xl p-6"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <div className="w-12 h-1 rounded-full mx-auto mb-6 bg-white/20" />
              <h3 className="text-lg font-semibold text-white mb-4">
                {lang === 'th' ? 'เพิ่มผู้รับใหม่' : 'Add New Recipient'}
              </h3>
              <p className="text-sm text-white/60 mb-6">
                {lang === 'th'
                  ? 'กรุณากรอกหมายเลขบัญชีหรือเบอร์โทรศัพท์ของผู้รับ'
                  : 'Please enter account number or phone number'}
              </p>
              <input
                type="text"
                placeholder={lang === 'th' ? 'หมายเลขบัญชี / เบอร์โทร' : 'Account number / Phone'}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 outline-none mb-4"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                onClick={() => setShowRecipientPicker(false)}
                className="w-full py-4 rounded-2xl font-semibold"
                style={{ backgroundColor: '#56be89', color: '#0B0F0A' }}
              >
                {lang === 'th' ? 'ค้นหา' : 'Search'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
