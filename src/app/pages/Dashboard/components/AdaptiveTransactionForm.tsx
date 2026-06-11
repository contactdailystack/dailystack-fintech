import React, { useState } from 'react';
import {
  ShoppingBag, Repeat, TrendingUp, PiggyBank,
  Smile, Frown, Zap, Meh, Flame, Heart,
  Coffee, Train, Gift, Home,
  ChevronRight, ChevronLeft, X,
  CheckCircle, AlertTriangle
} from 'lucide-react';

export type TransactionIntent = 'shopping' | 'recurring' | 'income' | 'savings';
export type TransactionMood = 'happy' | 'sad' | 'stressed' | 'neutral' | 'impulse' | 'reward';
export type TransactionTrigger = 'food' | 'travel' | 'urgent' | 'gift' | 'home';

interface AdaptiveTransactionFormProps {
  onSave: (data: AdaptiveTransactionData) => void;
  onClose: () => void;
  categories: Array<{ name: string; icon: React.ElementType; bg: string }>;
  wallets: Array<{ id: string; name: string; balance: number }>;
}

export interface AdaptiveTransactionData {
  intent: TransactionIntent;
  amount: number;
  mood: TransactionMood | null;
  trigger: TransactionTrigger | null;
  categoryName: string;
  walletId: string;
  notes: string;
}

const INTENTS: { key: TransactionIntent; icon: React.ElementType; label: string; sub: string }[] = [
  { key: 'shopping', icon: ShoppingBag, label: 'ซื้อของ', sub: 'Shopping' },
  { key: 'recurring', icon: Repeat, label: 'ค่าใช้จ่ายประจำ', sub: 'Recurring/Bills' },
  { key: 'income', icon: TrendingUp, label: 'รายได้', sub: 'Income' },
  { key: 'savings', icon: PiggyBank, label: 'ออมเงิน', sub: 'Savings' },
];

const MOODS: { key: TransactionMood; icon: React.ElementType; label: string }[] = [
  { key: 'happy', icon: Smile, label: 'ดีใจ' },
  { key: 'sad', icon: Frown, label: 'เศร้า' },
  { key: 'stressed', icon: Zap, label: 'เครียด' },
  { key: 'neutral', icon: Meh, label: 'ธรรมดา' },
  { key: 'impulse', icon: Flame, label: 'Impulse' },
  { key: 'reward', icon: Heart, label: 'ตั้งใจ/รางวัลตัวเอง' },
];

const TRIGGERS: { key: TransactionTrigger; icon: React.ElementType; label: string }[] = [
  { key: 'food', icon: Coffee, label: 'กินข้าว' },
  { key: 'travel', icon: Train, label: 'เดินทาง' },
  { key: 'urgent', icon: Zap, label: 'ด่วน/ฉุกเฉิน' },
  { key: 'gift', icon: Gift, label: 'ให้ของขวัญ' },
  { key: 'home', icon: Home, label: 'บ้าน/ครอบครัว' },
];

const AdaptiveTransactionForm: React.FC<AdaptiveTransactionFormProps> = ({
  onSave,
  onClose,
  categories,
  wallets,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [intent, setIntent] = useState<TransactionIntent | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [mood, setMood] = useState<TransactionMood | null>(null);
  const [trigger, setTrigger] = useState<TransactionTrigger | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || 'Food & Dining');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(wallets[0]?.id || '');
  const [notes, setNotes] = useState<string>('');

  const handleClose = () => {
    setStep(1);
    setIntent(null);
    setAmount('');
    setMood(null);
    setTrigger(null);
    setSelectedCategory(categories[0]?.name || 'Food & Dining');
    setSelectedWalletId(wallets[0]?.id || '');
    setNotes('');
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && intent) setStep(2);
    else if (step === 2 && Number(amount) > 0) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) setStep(5);
    else if (step === 5) handleSave();
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleSave = () => {
    onSave({
      intent: intent!,
      amount: Number(amount),
      mood,
      trigger,
      categoryName: selectedCategory,
      walletId: selectedWalletId,
      notes,
    });
    handleClose();
  };

  const canProceed = () => {
    if (step === 1) return intent !== null;
    if (step === 2) return Number(amount) > 0;
    return true;
  };

  const getInsight = (): string => {
    if (!amount || !selectedCategory) return '';
    const num = Number(amount);
    if (intent === 'savings') return `ดีมาก! คุณกำลังออมเงิน ${num.toLocaleString()} บาท`;
    if (num > 5000) return `จำนวนที่ใช้ค่อนข้างสูง — คุณแน่ใจหรือเปล่า?`;
    if (mood === 'impulse') return `ดูเหมือนการใช้จ่ายแบบฉุกเฉิน — ลองคิดทบทวนก่อนตัดสินใจนะ`;
    if (mood === 'stressed') return `ดูเหมือนคุณกำลังเครียด — ลองหาวิธีผ่อนคลายอื่นแทนการใช้จ่ายนะ`;
    return `การใช้จ่ายปกติ — ทำได้ดีมากเลย!`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-[#171C15] border border-white/10 rounded-t-3xl shadow-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-white animate-sheet-spring">
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 transition"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Transaction</p>
              <h3 className="text-lg font-black text-white">
                {step === 1 && 'วันนี้เกิดอะไรขึ้น?'}
                {step === 2 && 'ใส่จำนวนเงิน'}
                {step === 3 && 'รู้สึกอย่างไร?'}
                {step === 4 && 'เลือกหมวดหมู่'}
                {step === 5 && 'บันทึกสำเร็จ'}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {INTENTS.map(({ key, icon: Icon, label, sub }) => (
                <button
                  key={key}
                  onClick={() => setIntent(key)}
                  className={`p-4 rounded-2xl border transition-all text-left ${
                    intent === key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 bg-white/5 text-white hover:border-white/30'
                  }`}
                >
                  <Icon size={28} className={intent === key ? 'text-primary' : 'text-white/60'} />
                  <p className="font-bold mt-2 text-sm">{label}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{sub}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-white/40 text-xs mb-2">
                  {intent === 'shopping' && 'ซื้อของ'}
                  {intent === 'recurring' && 'ค่าใช้จ่ายประจำ'}
                  {intent === 'income' && 'รายได้'}
                  {intent === 'savings' && 'ออมเงิน'}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-5xl font-black text-primary text-center w-full focus:outline-none"
                  />
                  <span className="text-2xl font-bold text-white/60">บาท</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex gap-2 flex-wrap">
                  {[100, 500, 1000, 2000, 5000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(String(Number(amount) + val))}
                      className="px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs font-bold hover:bg-white/20 transition"
                    >
                      +{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <p className="text-white/60 text-sm text-center">รู้สึกอย่างไรกับการใช้จ่ายนี้?</p>
              <div className="grid grid-cols-3 gap-3">
                {MOODS.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setMood(key)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      mood === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-white/10 bg-white/5 text-white hover:border-white/30'
                    }`}
                  >
                    <Icon size={24} className={mood === key ? 'text-primary' : 'text-white/60'} />
                    <span className="text-xs font-bold">{label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10 pt-6">
                <p className="text-white/40 text-xs mb-3">มีปัจจัยอะไรที่ทำให้ต้องใช้จ่าย?</p>
                <div className="flex gap-2 flex-wrap">
                  {TRIGGERS.map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setTrigger(trigger === key ? null : key)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                        trigger === key
                          ? 'bg-primary text-[#000000]'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-white/40 text-xs mb-3">หมวดหมู่</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(({ name, icon: Icon, bg }) => (
                    <button
                      key={name}
                      onClick={() => setSelectedCategory(name)}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        selectedCategory === name
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-white">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-3">กระเป๋าเงิน</p>
                <div className="space-y-2">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => setSelectedWalletId(wallet.id)}
                      className={`w-full p-3 rounded-xl border transition-all flex justify-between items-center ${
                        selectedWalletId === wallet.id
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <span className="text-xs font-bold text-white">{wallet.name}</span>
                      <span className="text-xs text-white/60">{wallet.balance.toLocaleString()} บาท</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-3">โน้ต (optional)</p>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="เพิ่มโน้ต..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <CheckCircle size={40} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black text-primary">{Number(amount).toLocaleString()} บาท</p>
                <p className="text-white/60 text-sm mt-1">
                  {intent === 'shopping' && 'ซื้อของ'}
                  {intent === 'recurring' && 'ค่าใช้จ่ายประจำ'}
                  {intent === 'income' && 'รายได้'}
                  {intent === 'savings' && 'ออมเงิน'}
                  {selectedCategory && ` • ${selectedCategory}`}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-left">
                <p className="text-xs font-bold text-primary mb-2">AI Insight</p>
                <p className="text-sm text-white/80">{getInsight()}</p>
              </div>
              <button
                onClick={handleSave}
                className="w-full py-4 rounded-xl bg-primary text-[#000000] font-black uppercase tracking-widest shadow-[0_8px_32px_rgba(199,255,46,0.35)] hover:bg-primary/95 transition"
              >
                บันทึก
              </button>
            </div>
          )}
        </div>

        {step < 5 && (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all mt-6 ${
              canProceed()
                ? 'bg-primary text-[#000000] shadow-[0_8px_32px_rgba(199,255,46,0.35)] hover:bg-primary/95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {step === 4 ? 'ดูผลลัพธ์' : 'ต่อไป'}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdaptiveTransactionForm;