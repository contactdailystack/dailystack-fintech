import React from 'react';
import { CreditCard, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';
import { SubscriptionBrandIcon, getCancellationPlaybook } from '../DashboardHome';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextBillingDate: string;
  logoColor: string;
  category: string;
  utilizationWarning?: string;
}

interface CancellationDeadlineAlert {
  subscriptionId: string;
  name: string;
  daysLeft: number;
  deadline: Date;
  noticeDays: number;
}

interface SubscriptionListProps {
  subscriptions: Subscription[];
  loadingSubscriptions: boolean;
  nextRenewalSubscription: Subscription | null;
  cancellationDeadlineAlerts: CancellationDeadlineAlert[];
  cancellationDeadlineMap: Map<string, CancellationDeadlineAlert>;
  urgentBadgeDays: number;
  totalSubscriptionSpend: number;
  estimatedSavings: number;
  onOpenSubscriptionForm: () => void;
  onEditSubscription: (sub: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
  onOpenPlaybook: (sub: Subscription) => void;
  formatSubscriptionDate: (date: string) => string;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  loadingSubscriptions,
  nextRenewalSubscription,
  cancellationDeadlineAlerts,
  cancellationDeadlineMap,
  urgentBadgeDays,
  totalSubscriptionSpend,
  estimatedSavings,
  onOpenSubscriptionForm,
  onEditSubscription,
  onDeleteSubscription,
  onOpenPlaybook,
  formatSubscriptionDate,
}) => {
  return (
    <div className="bg-white border-0 shadow-lg rounded-2xl p-5 space-y-4 text-[#000000]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-[#000000]" />
          <h3 className="font-black text-[#000000] text-sm">Active Subscription Stack</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#000000] text-primary text-[10px] font-black rounded-full font-mono">
            {subscriptions.length} items
          </span>
          <button
            onClick={() => onOpenSubscriptionForm()}
            className="px-3 py-2 bg-primary text-[#000000] rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-primary/95 transition"
          >
            + Add Subscription
          </button>
        </div>
      </div>

      {nextRenewalSubscription ? (
        <div className="p-3 bg-[#000000] rounded-xl flex items-start gap-3 text-white shadow-md">
          <AlertTriangle size={18} className="text-primary shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <p className="font-black text-white leading-snug">แจ้งเตือนตัดรอบบิลถัดไป ({nextRenewalSubscription.name})</p>
            <p className="text-gray-300 mt-1 font-kanit">
              จะทำการหักเงิน {nextRenewalSubscription.amount} บาท ในวันที่ {formatSubscriptionDate(nextRenewalSubscription.nextBillingDate)}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 rounded-xl flex items-start gap-3 text-[#000000] shadow-sm">
          <ShieldAlert size={18} className="text-gray-500 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600">
            ยังไม่มี subscription ที่จะตัดบิลในเร็ว ๆ นี้
          </div>
        </div>
      )}

      {cancellationDeadlineAlerts.length > 0 && (
        <div className="space-y-2 mt-3">
          {cancellationDeadlineAlerts.map((alert) => (
            <div key={alert.subscriptionId} className="p-3 bg-amber-50 border border-amber-200 rounded-3xl text-amber-900 text-xs">
              <p className="font-black flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /> ต้องแจ้งยกเลิก {alert.name} ภายใน {alert.deadline.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="mt-1 text-[11px] text-amber-900/90">
                เหลือเวลาอีก {alert.daysLeft} วันก่อนวันกำหนดแจ้งยกเลิก
              </p>
            </div>
          ))}
        </div>
      )}

      {loadingSubscriptions ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 rounded-3xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-3xl bg-[#F7F7F7] border border-black/5 text-[#000000] shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500">Total Recurring Spend</p>
              <p className="mt-2 text-2xl font-black text-[#000000]">{totalSubscriptionSpend.toLocaleString()} THB</p>
              <p className="mt-2 text-[10px] text-gray-500">ค่าใช้จ่าย subscription ต่อเดือนทั้งหมด</p>
            </div>
            <div className="p-4 rounded-3xl bg-[#F7F7F7] border border-black/5 text-[#000000] shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500">Potential Savings</p>
              <p className="mt-2 text-2xl font-black text-[#000000]">{estimatedSavings.toLocaleString()} THB</p>
              <p className="mt-2 text-[10px] text-gray-500">จาก {subscriptions.filter((s) => s.utilizationWarning).length} บริการที่ดูเหมือนใช้งานน้อย</p>
            </div>
          </div>

          {subscriptions.length === 0 ? (
            <div className="p-6 border border-dashed border-gray-200 rounded-3xl text-center text-sm text-gray-500">
              ยังไม่มี subscription รายเดือนในระบบ
              <div className="mt-3 text-xs text-gray-400">กดปุ่ม Add Subscription เพื่อเริ่มบันทึกบริการแ第一</div>
            </div>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((s) => (
                <div key={s.id} className="p-3.5 bg-gray-50 border border-black/5 rounded-xl transition-all hover:border-black/20">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <SubscriptionBrandIcon name={s.name} logoColor={s.logoColor} />
                      <div>
                        <h4 className="text-sm font-black text-[#000000]">{s.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-1">ตัดรอบบิลถัดไป: {formatSubscriptionDate(s.nextBillingDate)}</p>
                        <p className="text-[10px] text-gray-500 mt-1">หมวดหมู่: {s.category}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <span className="text-xs font-black text-[#000000] font-mono">{s.amount} THB</span>
                      {cancellationDeadlineMap.has(s.id) && (() => {
                        const d = cancellationDeadlineMap.get(s.id)?.daysLeft ?? 0;
                        if (d <= urgentBadgeDays) {
                          return (
                            <span className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white text-[12px] font-black">
                              {d}
                            </span>
                          );
                        }
                        return (
                          <span className="ml-2 inline-flex items-center gap-2 px-2 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-black">
                            <AlertTriangle size={12} /> {d} วัน
                          </span>
                        );
                      })()}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onEditSubscription(s)}
                          className="px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-gray-100 rounded-full text-[#000000] hover:bg-gray-200 transition"
                        >Edit</button>
                        <button
                          onClick={() => onDeleteSubscription(s.id)}
                          className="px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition"
                        >Delete</button>
                      </div>
                    </div>
                  </div>

                  {s.utilizationWarning && (
                    <div className="mt-3 pt-3 border-t border-black/5 text-[10px] text-amber-500 font-kanit font-black flex items-start gap-1.5">
                      <ShieldAlert size={12} className="shrink-0 mt-0.5" />
                      <span>{s.utilizationWarning}</span>
                    </div>
                  )}

                  {getCancellationPlaybook(s.name) && (
                    <button
                      onClick={() => onOpenPlaybook(s)}
                      className="mt-3 w-full py-2.5 bg-[#000000] hover:bg-[#000000]/95 text-primary border border-primary/20 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 font-sans"
                    >
                      <Sparkles size={11} strokeWidth={2.5} />
                      ยกเลิกสมาชิก (Cancel)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
