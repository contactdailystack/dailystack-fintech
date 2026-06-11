import React from 'react';
import { Check, Sparkles, MessageSquare, Zap, AlertTriangle } from 'lucide-react';
import { resolveWalletIdByBankName, type ParsedSmsResult } from '../../utils/bankSmsParser';

interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card';
  balance: number;
  color: string;
}

interface SmsIngestionProps {
  smsText: string;
  setSmsText: React.Dispatch<React.SetStateAction<string>>;
  smsToast: string | null;
  parsedResult: ParsedSmsResult | null;
  wallets: Wallet[];
  onConfirmSmsTransaction: () => void;
}

export const SmsIngestion: React.FC<SmsIngestionProps> = ({
  smsText,
  setSmsText,
  smsToast,
  parsedResult,
  wallets,
  onConfirmSmsTransaction,
}) => {
  return (
    <section className="bg-white border-0 shadow-lg rounded-2xl p-5 relative overflow-hidden group text-[#000000] space-y-4">
      <span className="absolute top-4 right-4 text-[10px] font-black tracking-widest font-mono text-black/15">04</span>
      
      <div className="flex justify-between items-center">
        <h3 className="font-black text-[#000000] text-sm flex items-center gap-2">
          <MessageSquare size={16} className="text-[#000000]" /> 
          SMS Transaction Auto-Logger <span className="text-[10px] text-gray-400 font-bold">(Sandbox Beta)</span>
        </h3>
        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase tracking-widest">
          Real-time Parser
        </span>
      </div>

      {smsToast && (
        <div className="p-3 bg-primary text-[#000000] rounded-xl text-xs font-black flex items-center gap-2 shadow-md font-kanit">
          <Check size={16} />
          {smsToast}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-kanit">
          จำลองข้อความ SMS จากธนาคาร:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSmsText('SCB: จ่ายบัตร x-8829 จำนวน 250.00 บาท ที่ Starbucks')}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-black/5 rounded-full text-xs font-bold font-mono transition-all"
          >
            <span className="inline-flex items-center gap-1"><Zap size={12} className="text-amber-500" /> SCB (Starbucks)</span>
          </button>
          <button
            onClick={() => setSmsText('KBank: โอนเงิน 120.00 บาท ไปยัง นายสมชาย (ร้านอาหาร)')}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-black/5 rounded-full text-xs font-bold font-mono transition-all"
          >
            <span className="inline-flex items-center gap-1"><Zap size={12} className="text-amber-500" /> KBank (Food)</span>
          </button>
          <button
            onClick={() => setSmsText('UOB: รูดบัตร x-1234 จำนวน 1,200.00 บาท ที่ Tops Supermarket')}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-black/5 rounded-full text-xs font-bold font-mono transition-all"
          >
            <span className="inline-flex items-center gap-1"><Zap size={12} className="text-amber-500" /> UOB (Tops)</span>
          </button>
          {smsText && (
            <button
              onClick={() => { setSmsText(''); }}
              className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200/20 rounded-full text-xs font-bold font-mono transition-all ml-auto"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          placeholder="วางข้อความเเจ้งยอดเงิน SMS ของคุณตรงนี้ เช่น 'SCB: จ่ายบัตร x-8829 จำนวน 250.00 บาท ที่ Starbucks'..."
          className="w-full bg-gray-50 border border-black/10 rounded-xl p-3 text-xs focus:border-[#C7FF2E] focus:bg-white outline-none font-semibold font-kanit min-h-[64px]"
        />
      </div>

      {parsedResult ? (
        <div className="p-4 bg-[#000000] text-white rounded-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary text-black text-[9px] font-black tracking-wider font-mono">
            <Sparkles size={10} />
            PARSED SUCCESS
          </div>
          
          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">สรุปผลการวิเคราะห์ข้อมูล</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <span className="text-[9px] text-gray-500 block uppercase">ธนาคารหลัก</span>
              <span className="text-xs font-black font-mono text-white">{parsedResult.bankName}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-500 block uppercase">หักยอดชำระ</span>
              <span className="text-xs font-black font-mono text-primary">-{parsedResult.amount.toLocaleString()} THB</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-500 block uppercase">หมวดหมู่</span>
              <span className="text-xs font-black font-kanit text-white">{parsedResult.categoryName}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-500 block uppercase">ร้านค้า/ผู้รับ</span>
              <span className="text-xs font-black font-kanit text-white truncate block">{parsedResult.notes}</span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-white/10 text-[10px] text-gray-400 font-kanit flex justify-between items-center">
            <span>บัญชีปลายทาง: <strong className="text-white font-bold">{(() => { const wid = resolveWalletIdByBankName(parsedResult.bankName, wallets); return wallets.find(w => w.id === wid)?.name || parsedResult.bankName; })()}</strong></span>
            <span>งวดงบประมาณ: <strong className="text-white font-bold">{parsedResult.categoryName}</strong></span>
          </div>

          <button
            onClick={onConfirmSmsTransaction}
            className="w-full bg-primary hover:bg-primary/95 text-[#000000] font-black text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] mt-2 shadow-lg"
          >
            <Check size={14} strokeWidth={3} />
            ยืนยันบันทึกธุรกรรมด่วน (Confirm & Log)
          </button>
        </div>
      ) : (
        smsText && (
          <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200/20 rounded-xl text-center text-xs font-semibold font-kanit flex items-center justify-center gap-2">
            <AlertTriangle size={12} className="shrink-0" /> ยังไม่สามารถวิเคราะห์ข้อมูลได้ กรุณาลองปรับเเต่งข้อความหรือใช้ Preset ตัวอย่าง
          </div>
        )
      )}
    </section>
  );
};
