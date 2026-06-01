import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, TrendingUp, AlertTriangle, CheckCircle, Flame, Plus } from 'lucide-react';
import type { Budget, BudgetVelocity } from '../types';

interface BudgetPlannerProps {
  budgets: Budget[];
  budgetVelocities: BudgetVelocity[];
  onAddBudget: (category: string, limit: number) => void;
  maskingMode: boolean;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  budgets,
  budgetVelocities,
  onAddBudget,
  maskingMode
}) => {
  const [category, setCategory] = useState<string>('Specialty Coffee');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [limit, setLimit] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit || isNaN(Number(limit)) || Number(limit) <= 0) return;

    const finalCategory = category === 'custom' ? customCategory.trim() : category;
    if (!finalCategory) return;

    onAddBudget(finalCategory, Number(limit));

    // Reset Form
    setLimit('');
    setCustomCategory('');
  };

  const formatCurrency = (val: number) => {
    const formatted = new Intl.NumberFormat('th-TH', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(val);
    return `${formatted}`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Information & Pace Indicator */}
      <div className="bg-[#14171E] border border-gray-850 rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C0F500] flex items-center gap-1.5">
            <span>●</span> Spending Limits & Velocities
          </h3>
          <p className="text-[8px] font-mono text-gray-500 mt-0.5">Real-time lifestyle spending forecasting</p>
        </div>
        
        <div className="px-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-[9px] font-mono text-gray-400 flex items-center gap-1.5 select-none self-stretch md:self-auto justify-center">
          <Calendar className="w-3.5 h-3.5 text-[#C0F500]" /> Day {new Date().getDate()} of {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
        </div>
      </div>

      {/* 2. Budget Grid (Balanced card layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetVelocities.length === 0 ? (
          <div className="md:col-span-2 bg-[#14171E] border border-gray-850 rounded-xl p-12 text-center text-xs font-mono text-gray-600">
            NO ACTIVE MONTHLY BUDGET LIMITS FOUND
          </div>
        ) : (
          budgetVelocities.map((vel, idx) => {
            const percent = Math.min(100, vel.percentUsed);
            const isOver = vel.percentUsed >= 100;
            const isWarning = vel.percentUsed >= 80 && vel.percentUsed < 100;
            
            let barColor = 'bg-[#56BE89]'; // Stable green
            if (isOver) barColor = 'bg-[#D6453E]'; // Red
            else if (isWarning) barColor = 'bg-amber-500'; // Yellow

            return (
              <div key={idx} className="bg-[#14171E] border border-gray-850 rounded-xl p-5 flex flex-col justify-between shadow-lg space-y-4">
                
                {/* Visual Status Tag */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-gray-200 tracking-tight flex items-center gap-2">
                      {vel.category}
                      {vel.isOverrunning && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6453E] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D6453E]"></span>
                        </span>
                      )}
                    </h4>
                    <p className="text-[8px] font-mono text-gray-500 mt-0.5">
                      Pace: <span className={vel.isOverrunning ? 'text-amber-500 font-bold' : 'text-gray-400'}>
                        {formatCurrency(vel.currentVelocity)} THB/Day
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold ${
                      isOver ? 'text-[#D6453E]' : isWarning ? 'text-amber-500' : 'text-[#C0F500]'
                    } ${maskingMode ? 'blur-[5px] select-none opacity-20 pointer-events-none' : ''}`}>
                      {formatCurrency(vel.spent)} / {formatCurrency(vel.limit)} THB
                    </span>
                    <div className="text-[7px] font-mono text-gray-500 uppercase mt-0.5">{vel.percentUsed}% used</div>
                  </div>
                </div>

                {/* Thicker premium progress bar */}
                <div className="w-full h-2 bg-gray-950 border border-gray-850 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  />
                </div>

                {/* Streamlined Predictive Alert Block */}
                <div className="pt-2 border-t border-gray-850/60">
                  {vel.isOverrunning ? (
                    <div className="bg-[#D6453E]/5 border border-[#D6453E]/20 text-[#D6453E] p-2.5 rounded-lg flex gap-2">
                      <Flame className="w-4 h-4 text-[#D6453E] shrink-0 animate-pulse mt-0.5" />
                      <div className="text-[8px] font-mono leading-normal">
                        <span className="font-bold uppercase tracking-wider block">AI VELOCITY OVERRUN ALERT</span>
                        คาดว่ายอดงบประมาณจะใช้เต็มขีดจำกัดภายในวันที่ <span className="text-white font-bold">{vel.overrunDate || 'ไม่กี่วันข้างหน้า'}</span> และมียอดรวมสิ้นเดือนแตะ {formatCurrency(vel.predictedSpend)} THB!
                      </div>
                    </div>
                  ) : vel.percentUsed >= 75 ? (
                    <div className="bg-amber-500/5 border border-amber-500/20 text-amber-500 p-2.5 rounded-lg flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-[8px] font-mono leading-normal">
                        <span className="font-bold uppercase tracking-wider block">AI VELOCITY WARNING</span>
                        การใช้จ่ายเริ่มตึงตัว แนะนำให้ควบคุมพฤติกรรมการจ่ายในหมวดหมู่นี้ชั่วคราว เพื่อป้องกันยอดบานปลายสะสม
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#56BE89]/5 border border-[#56BE89]/20 text-[#56BE89] p-2.5 rounded-lg flex gap-2">
                      <CheckCircle className="w-4 h-4 text-[#56BE89] shrink-0 mt-0.5" />
                      <div className="text-[8px] font-mono leading-normal">
                        <span className="font-bold uppercase tracking-wider block">AI VELOCITY STABLE</span>
                        สมดุลการกินดีอยู่ดีและการเงินมีความเสถียร งบประมาณของหมวดหมู่นี้ดำเนินไปอย่างมั่นคง
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 3. Add Monthly Budget Form (Bottom Balanced alignment) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        
        {/* Budget form - takes 2 cols on tablet/desktop */}
        <div className="md:col-span-2 bg-[#14171E] border border-gray-850 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C0F500] flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Establish Monthly Limit
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-[8px] font-mono uppercase tracking-wider text-gray-500">Category Name</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-850 rounded-lg text-white text-[11px] focus:outline-none focus:border-[#C0F500] select-custom"
              >
                <option value="Specialty Coffee">☕ Specialty Coffee</option>
                <option value="Premium Dining">🍣 Premium Dining</option>
                <option value="Gadgets & Gear">⌨️ Gadgets & Gear</option>
                <option value="Rent & Housing">🏠 Rent & Housing</option>
                <option value="Subscriptions">📺 Media Subscriptions</option>
                <option value="Transport & Fuel">🚗 Transport & Fuel</option>
                <option value="Wellbeing">💊 Wellbeing & Health</option>
                <option value="custom">✎ Custom Category Name...</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] font-mono uppercase tracking-wider text-gray-500">Limit Target (THB)</label>
              <input
                type="number"
                required
                placeholder="e.g. 5000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-855 rounded-lg text-white font-mono font-bold text-[11px] focus:outline-none focus:border-[#C0F500] placeholder-gray-800"
              />
            </div>

            {category === 'custom' && (
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[8px] font-mono uppercase tracking-wider text-gray-500">Custom Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shopping, Hobby"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-855 rounded-lg text-white text-[11px] focus:outline-none focus:border-[#C0F500] placeholder-gray-800"
                />
              </div>
            )}

            <button
              type="submit"
              className="sm:col-span-2 py-2.5 bg-[#C0F500] hover:bg-[#b0df00] text-black font-mono text-[10px] font-bold tracking-widest rounded-lg transition-all active:scale-95 shadow-md uppercase"
            >
              Add budget cap
            </button>
          </form>
        </div>

        {/* AI Predictive explanation block */}
        <div className="bg-[#14171E] border border-gray-850 rounded-xl p-5 shadow-lg space-y-3 select-none">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#C0F500] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> AI Predictive guide
          </h4>
          <p className="text-[9px] font-mono text-gray-500 leading-relaxed">
            ระบบคำนวณความเร็วการใช้จ่ายรายวัน (Daily Pace) โดยหารยอดรวมจริงด้วยจำนวนวันที่ผ่านมาในเดือนนั้นๆ เทียบกับสัดส่วน Target (ขีดจำกัด / วันทั้งหมด)
          </p>
          <p className="text-[9px] font-mono text-gray-400 leading-relaxed pt-1 border-t border-gray-850/60">
            แม้ยอดการชำระบิลรวมจะยังไม่พุ่งทะลุวงเงินในสัปดาห์นี้ แต่หากระบบตรวจพบว่าคุณใช้เงินเร็วเกินกว่าแผนเฉลี่ยล่วงหน้า ปลุกเร้า AI Warning จะเปิดฟังก์ชันกะพริบเพื่อปกป้องกระเป๋าเงินของคุณล่วงหน้า
          </p>
        </div>

      </div>

    </div>
  );
};
export default BudgetPlanner;
