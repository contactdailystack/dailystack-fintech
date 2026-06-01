import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowRightLeft, ArrowDownRight, ArrowUpRight, Cpu, Tag, FileText, CheckCircle } from 'lucide-react';
import type { Account, Transaction, TransactionType } from '../types';

interface LedgerAndOCRProps {
  accounts: Account[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  maskingMode: boolean;
}

const SAMPLE_RECEIPTS = [
  { store: 'Slowbar Drip Cafe', amount: 250, category: 'Specialty Coffee', tags: ['coffee', 'caffeine', 'ocr'], note: 'Scanned Receipt: Slowbar Drip Cafe' },
  { store: 'Craft Coffee Lab', amount: 340, category: 'Specialty Coffee', tags: ['caffeine', 'coffee', 'ocr'], note: 'Scanned Receipt: Craft Coffee Lab' },
  { store: 'Intelligent Caffeine Shop', amount: 180, category: 'Specialty Coffee', tags: ['matcha', 'caffeine', 'ocr'], note: 'Scanned Receipt: Intelligent Caffeine Shop' },
  { store: 'Midnight Roast House', amount: 450, category: 'Specialty Coffee', tags: ['caffeine', 'beans', 'ocr'], note: 'Scanned Receipt: Midnight Roast House' }
];

export const LedgerAndOCR: React.FC<LedgerAndOCRProps> = ({
  accounts,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  maskingMode
}) => {
  // Form State
  const isThai = true;
  const [amount, setAmount] = useState<string>('');
  const [calcExpr, setCalcExpr] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [category, setCategory] = useState<string>('Specialty Coffee');
  const [note, setNote] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  // OCR Scan Animation State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanReceiptIndex, setScanReceiptIndex] = useState<number | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);

  // Form helper: set defaults on load
  React.useEffect(() => {
    if (accounts.length > 0) {
      if (type === 'expense' || type === 'transfer') {
        const cashOrCC = accounts.find(a => a.type === 'credit_card' || a.type === 'cash');
        setFromAccountId(cashOrCC ? cashOrCC.id : accounts[0].id);
      }
      if (type === 'income' || type === 'transfer') {
        const bank = accounts.find(a => a.type === 'bank');
        setToAccountId(bank ? bank.id : accounts[0].id);
      }
    }
  }, [type, accounts]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleCalcPress = (key: string) => {
    if (key === '⌫') {
      setCalcExpr(prev => prev.slice(0, -1));
      setAmount(prev => prev.slice(0, -1));
    } else if (key === '=') {
      try {
        const cleaned = calcExpr.replace(/[^0-9+\-*/.]/g, '');
        const evaluated = new Function(`return ${cleaned}`)();
        if (evaluated !== undefined && !isNaN(evaluated) && isFinite(evaluated)) {
          const formatted = Number(Number(evaluated).toFixed(2)).toString();
          setCalcExpr(formatted);
          setAmount(formatted);
        }
      } catch {}
    } else if (key === 'ยืนยัน') {
      // Evaluate expression first
      let finalAmount = amount;
      try {
        const cleaned = calcExpr.replace(/[^0-9+\-*/.]/g, '');
        const evaluated = new Function(`return ${cleaned}`)();
        if (evaluated !== undefined && !isNaN(evaluated) && isFinite(evaluated)) {
          finalAmount = Number(Number(evaluated).toFixed(2)).toString();
        }
      } catch {}
      
      if (!finalAmount || isNaN(Number(finalAmount)) || Number(finalAmount) <= 0) return;
      
      onAddTransaction({
        amount: Number(finalAmount),
        type,
        fromAccountId: type !== 'income' ? fromAccountId : undefined,
        toAccountId: type !== 'expense' ? toAccountId : undefined,
        category,
        note: note || undefined,
        tags,
        transactionDate: new Date().toISOString()
      });

      // Reset Form
      setAmount('');
      setCalcExpr('');
      setNote('');
      setTags([]);
    } else {
      // Limit operators to valid structure
      setCalcExpr(prev => prev + key);
      setAmount(prev => prev + key);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    onAddTransaction({
      amount: Number(amount),
      type,
      fromAccountId: type !== 'income' ? fromAccountId : undefined,
      toAccountId: type !== 'expense' ? toAccountId : undefined,
      category,
      note: note || undefined,
      tags,
      transactionDate: new Date().toISOString()
    });

    // Reset Form
    setAmount('');
    setNote('');
    setTags([]);
  };

  // Simulate OCR Receipt Scan with Horizontal Neon Laser Bar
  const handleSimulateOCR = () => {
    setIsScanning(true);
    setScanSuccess(false);
    
    const index = Math.floor(Math.random() * SAMPLE_RECEIPTS.length);
    setScanReceiptIndex(index);

    setTimeout(() => {
      const receipt = SAMPLE_RECEIPTS[index];
      
      setAmount(receipt.amount.toString());
      setType('expense');
      setCategory(receipt.category);
      setTags(receipt.tags);
      setNote(receipt.note);
      
      setIsScanning(false);
      setScanSuccess(true);
      
      setTimeout(() => setScanSuccess(false), 3000);
    }, 2000);
  };

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat('th-TH', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(val);
    return `${formatted}`;
  };

  const getAccountName = (id?: string) => {
    if (!id) return '';
    const acc = accounts.find(a => a.id === id);
    return acc ? acc.name : '';
  };

  return (
    <div className="space-y-6">
      
      {/* 1. OCR Laser Scanner Card */}
      <div className="bg-[#14171E] border border-gray-850 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C0F500] flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#C0F500]" /> Laser Receipt OCR
          </h3>
          {isScanning && (
            <span className="text-[9px] font-mono text-[#D6453E] animate-pulse">
              [SCANNING RECEIPT...]
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Receipt display viewport */}
          <div className="relative w-full h-36 bg-gray-950 border border-gray-850 rounded-lg flex flex-col justify-between p-4 overflow-hidden select-none">
            {isScanning && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '98%', '0%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-0 w-full h-[2px] bg-[#D6453E] shadow-[0_0_8px_#D6453E] z-10"
              />
            )}
            
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

            {scanReceiptIndex !== null ? (
              <div className="relative font-mono text-[9px] text-gray-400 space-y-1 z-0">
                <div className="text-center border-b border-gray-850 pb-1.5 font-bold tracking-widest text-[#D6453E]">
                  {SAMPLE_RECEIPTS[scanReceiptIndex].store}
                </div>
                <div className="flex justify-between mt-2 font-mono">
                  <span>1x Specialty Drip Coffee</span>
                  <span>{SAMPLE_RECEIPTS[scanReceiptIndex].amount}.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-850/60 pt-1 font-bold text-white">
                  <span>TOTAL</span>
                  <span>THB {SAMPLE_RECEIPTS[scanReceiptIndex].amount}.00</span>
                </div>
              </div>
            ) : (
              <div className="relative h-full flex flex-col justify-center items-center text-center font-mono text-[9px] text-gray-500 space-y-1.5">
                <FileText className="w-6 h-6 text-gray-700 animate-bounce" />
                <span>WAITING FOR SLIP SCAN SIMULATION</span>
              </div>
            )}
          </div>

          {/* Action description */}
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500 leading-normal font-mono">
              จำลองระบบสแกนสลิปอัจฉริยะ ดึงยอดค่าใช้จ่าย หมวดหมู่ และแท็กสลิปเข้าสู่ระบบกรอกข้อมูลทันที ช่วยประหยัดเวลาพิมพ์
            </p>
            
            <button
              type="button"
              onClick={handleSimulateOCR}
              disabled={isScanning}
              className="w-full py-2.5 bg-[#D6453E]/10 border border-[#D6453E]/30 hover:bg-[#D6453E]/20 text-[#D6453E] rounded-lg font-mono text-[10px] font-bold tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
            >
              {isScanning ? 'SCANNING SLIP METRICS...' : 'SIMULATE SLIP OCR SCAN'}
            </button>

            <AnimatePresence>
              {scanSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2 bg-[#C0F500]/10 border border-[#C0F500]/30 rounded text-[#C0F500] font-mono text-[8px] flex items-center gap-1.5 justify-center"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> OCR COMPLETED - FORM AUTO-FILLED!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Manual Form (Money Mgr. Clone) */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleCalcPress('ยืนยัน');
        }} 
        className="bg-[#14171E] border border-gray-850 rounded-xl p-5 shadow-lg space-y-4"
      >
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C0F500] flex items-center gap-1.5 border-b border-gray-850/80 pb-2 select-none">
            <Plus className="w-4 h-4 text-[#C0F500]" /> สมุดบัญชี / MANUAL LEDGER ENTRY
          </h3>

          {/* Money Mgr. Tab Pills */}
          <div className="grid grid-cols-3 gap-2 bg-gray-950 p-1 border border-gray-855 rounded-xl select-none">
            {[
              { id: 'income', label: 'รายรับ', activeStyle: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
              { id: 'expense', label: 'รายจ่าย', activeStyle: 'bg-[#D6453E]/15 border-[#D6453E]/30 text-[#D6453E]' },
              { id: 'transfer', label: 'ยอดโอน', activeStyle: 'bg-amber-500/15 border-amber-500/30 text-amber-500' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as any)}
                className={`py-2 px-1 rounded-lg border text-center font-bold text-[10px] tracking-wide transition-all active:scale-95 ${
                  type === t.id
                    ? t.activeStyle
                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Form Fields matching Money Mgr. */}
          <div className="space-y-3">
            
            {/* Date Field */}
            <div className="grid grid-cols-3 items-center border-b border-gray-850/40 pb-2">
              <span className="text-xs font-bold text-gray-400">วันที่ (Date)</span>
              <span className="col-span-2 text-xs font-mono font-semibold text-white text-right">
                ศ. 29/5/2569
              </span>
            </div>

            {/* Source Account (เงินที่จ่ายออก) */}
            {type !== 'income' && (
              <div className="grid grid-cols-3 items-center border-b border-gray-850/40 pb-2">
                <span className="text-xs font-bold text-gray-400">เงินที่จ่ายออก</span>
                <select
                  required
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="col-span-2 bg-transparent text-xs font-semibold text-white text-right outline-none text-right-custom border-none focus:ring-0 cursor-pointer"
                  style={{ direction: 'rtl' }}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id} className="bg-[#14171E]">{a.name} ({formatCurrency(a.balance)} ฿)</option>
                  ))}
                </select>
              </div>
            )}

            {/* Target Account (เงินที่เข้ามา) */}
            {type !== 'expense' && (
              <div className="grid grid-cols-3 items-center border-b border-gray-850/40 pb-2">
                <span className="text-xs font-bold text-gray-400">เงินที่เข้ามา</span>
                <select
                  required
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="col-span-2 bg-transparent text-xs font-semibold text-white text-right outline-none text-right-custom border-none focus:ring-0 cursor-pointer"
                  style={{ direction: 'rtl' }}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id} className="bg-[#14171E]">{a.name} ({formatCurrency(a.balance)} ฿)</option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Select */}
            {type !== 'transfer' && (
              <div className="grid grid-cols-3 items-center border-b border-gray-850/40 pb-2">
                <span className="text-xs font-bold text-gray-400">หมวดหมู่</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="col-span-2 bg-transparent text-xs font-semibold text-white text-right outline-none text-right-custom border-none focus:ring-0 cursor-pointer"
                  style={{ direction: 'rtl' }}
                >
                  <option value="Specialty Coffee" className="bg-[#14171E]">☕ Specialty Coffee</option>
                  <option value="Premium Dining" className="bg-[#14171E]">🍣 Premium Dining</option>
                  <option value="Gadgets & Gear" className="bg-[#14171E]">⌨️ Gadgets & Gear</option>
                  <option value="Salary" className="bg-[#14171E]">💼 Salary & Income</option>
                  <option value="Rent & Housing" className="bg-[#14171E]">🏠 Rent & Housing</option>
                  <option value="Subscriptions" className="bg-[#14171E]">📺 Media Subscriptions</option>
                  <option value="Transport & Fuel" className="bg-[#14171E]">🚗 Transport & Fuel</option>
                  <option value="Wellbeing" className="bg-[#14171E]">💊 Wellbeing & Health</option>
                </select>
              </div>
            )}

            {/* Note Memo (เนื้อหา) */}
            <div className="grid grid-cols-3 items-center border-b border-gray-850/40 pb-2">
              <span className="text-xs font-bold text-gray-400">เนื้อหา</span>
              <input
                type="text"
                placeholder={isThai ? 'พิมพ์รายละเอียด...' : 'e.g. Starbucks Drip'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="col-span-2 bg-transparent text-xs font-semibold text-white text-right outline-none placeholder-gray-700"
              />
            </div>

            {/* Tags (ป้ายกำกับ) */}
            <div className="grid grid-cols-3 items-start border-b border-gray-850/40 pb-2">
              <span className="text-xs font-bold text-gray-400 pt-1.5">ป้ายกำกับ</span>
              <div className="col-span-2 space-y-2 text-right">
                <div className="flex gap-2 justify-end">
                  <input
                    type="text"
                    placeholder="กด ENTER เพื่อเพิ่ม"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="w-24 bg-transparent text-[10px] text-white text-right outline-none placeholder-gray-750"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="text-[9px] font-bold text-[var(--neon)]"
                  >
                    + ADD
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#C0F500]/5 border border-[#C0F500]/20 rounded text-[#C0F500] text-[8px] font-mono"
                      >
                        #{t}
                        <button type="button" onClick={() => handleRemoveTag(idx)} className="hover:text-red-500 text-gray-500 font-bold ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Custom Calculator Keypad Grid (Money Mgr. Clone) */}
          <div className="border-t border-gray-800/80 pt-4 space-y-2 select-none">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] font-mono uppercase tracking-wider text-gray-500">
                แผงควบคุมมูลค่า / Calculator Keypad
              </label>
              <div className="text-[10px] font-mono font-bold text-gray-400">
                ยอดเงิน: <span className="text-white">{calcExpr || '0.00'}</span>
              </div>
            </div>
            
            {/* Expression Screen */}
            <div className="bg-gray-950 border border-gray-855 p-3 rounded-lg flex items-center justify-between font-mono font-bold text-sm text-white mb-2 min-h-[44px]">
              <span className="text-gray-500 text-[10px]">มูลค่า (Value):</span>
              <span className="text-[var(--neon)] tracking-wide font-mono text-base">{calcExpr || '0'}</span>
            </div>

            <div className="grid grid-cols-4 gap-1 font-mono text-sm font-bold">
              {/* Row 1: Operations */}
              {['+', '-', '*', '/'].map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => handleCalcPress(op)}
                  className="py-2.5 bg-gray-950/60 border border-gray-855 hover:bg-gray-900 text-gray-300 hover:text-white rounded-lg transition-all active:scale-95"
                >
                  {op === '*' ? '×' : op === '/' ? '÷' : op}
                </button>
              ))}

              {/* Row 2: 7, 8, 9, = */}
              {['7', '8', '9', '='].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleCalcPress(num)}
                  className={`py-2.5 border rounded-lg transition-all active:scale-95 ${
                    num === '=' 
                      ? 'bg-[var(--neon-surface)] border-[var(--neon)] text-[var(--neon)] font-black text-base' 
                      : 'bg-gray-950/60 border border-gray-855 text-white hover:bg-gray-900'
                  }`}
                >
                  {num}
                </button>
              ))}

              {/* Row 3: 4, 5, 6, . */}
              {['4', '5', '6', '.'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleCalcPress(num)}
                  className="py-2.5 bg-gray-950/60 border border-gray-855 hover:bg-gray-900 text-white rounded-lg transition-all active:scale-95"
                >
                  {num}
                </button>
              ))}

              {/* Row 4: 1, 2, 3, delete */}
              {['1', '2', '3', '⌫'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleCalcPress(num)}
                  className={`py-2.5 border rounded-lg transition-all active:scale-95 ${
                    num === '⌫' 
                      ? 'bg-gray-950/60 border-red-500/20 text-red-400 hover:bg-red-500/5 font-mono text-xs' 
                      : 'bg-gray-950/60 border border-gray-855 text-white hover:bg-gray-900'
                  }`}
                >
                  {num}
                </button>
              ))}

              {/* Row 5: 00, 0, 000, Confirm */}
              {['00', '0', '000', 'ยืนยัน'].map(num => (
                <button
                  key={num}
                  type={num === 'ยืนยัน' ? 'submit' : 'button'}
                  onClick={(e) => {
                    if (num === 'ยืนยัน') {
                      e.preventDefault();
                      handleCalcPress('ยืนยัน');
                    } else {
                      handleCalcPress(num);
                    }
                  }}
                  className={`py-2.5 border rounded-lg transition-all active:scale-95 ${
                    num === 'ยืนยัน'
                      ? 'bg-[#D6453E] border-[#D6453E] text-white shadow-[0_0_10px_rgba(214,69,62,0.3)] hover:bg-[#c43c36] font-bold text-xs uppercase'
                      : 'bg-gray-950/60 border border-gray-855 text-white hover:bg-gray-900'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Ledger History scrolling book */}
        <div className="bg-[#14171E] border border-gray-850 rounded-xl p-5 shadow-lg flex flex-col h-[480px]">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C0F500] mb-3 border-b border-gray-850/60 pb-2 select-none">
            <span>●</span> Ledger History Book
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {transactions.length === 0 ? (
              <div className="text-center py-24 text-[10px] font-mono text-gray-600">
                NO LEDGER TRANSACTIONS FOUND
              </div>
            ) : (
              transactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';
                
                return (
                  <div
                    key={tx.id}
                    className="bg-gray-950/40 border border-gray-850 hover:border-gray-800 rounded-lg p-3 flex justify-between items-start transition-all"
                  >
                    <div className="space-y-1 text-[10px] min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isExpense ? 'bg-[#D6453E]' : isIncome ? 'bg-[#56BE89]' : 'bg-blue-400'
                        }`} />
                        <span className="font-bold text-gray-200 tracking-tight truncate">{tx.category}</span>
                      </div>
                      
                      {tx.note && <p className="text-gray-400 text-[9px] leading-snug break-words">{tx.note}</p>}
                      
                      <div className="text-[8px] font-mono text-gray-500 flex items-center gap-1.5 flex-wrap">
                        {tx.fromAccountId && <span className="truncate">{getAccountName(tx.fromAccountId)}</span>}
                        {tx.type === 'transfer' && <ArrowRightLeft className="w-2.5 h-2.5 text-blue-400" />}
                        {tx.toAccountId && <span className="truncate">{getAccountName(tx.toAccountId)}</span>}
                      </div>

                      {tx.tags && tx.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tx.tags.map((t, i) => (
                            <span key={i} className="px-1 py-0.5 bg-gray-900 border border-gray-850 rounded text-[7px] text-gray-500 font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0 font-mono">
                      <span className={`font-bold tracking-tight text-xs ${
                        isExpense ? 'text-[#D6453E]' : isIncome ? 'text-[#56BE89]' : 'text-blue-400'
                      } ${maskingMode ? 'blur-[5px] select-none opacity-20 pointer-events-none' : ''}`}>
                        {isExpense ? '-' : isIncome ? '+' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="text-gray-600 hover:text-red-500 p-1 hover:bg-red-500/10 rounded transition-all active:scale-90"
                        title="Delete Ledger Entry"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-850/60 pt-2 text-center text-[7px] font-mono text-gray-600 select-none uppercase">
            SECURED LEDGER VAULT NODE
          </div>
        </div>

      </div>
  );
};
export default LedgerAndOCR;
