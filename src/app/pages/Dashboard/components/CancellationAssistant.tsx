import React from 'react';
import { AlertTriangle, Check, Plus, FileText } from 'lucide-react';
import { type Playbook } from '../../data/cancellationPlaybooks';
import { CancellationStepTracker } from '../../components/CancellationStepTracker';
import type {
  CancellationProgress as CancellationProgressType,
  CancellationDocument as CancellationDocumentType,
  CompletedCancellation,
} from '../../services/cancellationService';

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextBillingDate: string;
  logoColor: string;
  category: string;
  utilizationWarning?: string;
}

interface CancellationAssistantProps {
  activePlaybook: Playbook;
  activePlaybookTab: 'info' | 'checklist' | 'proof' | 'history' | 'saved';
  setActivePlaybookTab: React.Dispatch<React.SetStateAction<'info' | 'checklist' | 'proof' | 'history' | 'saved'>>;
  subscriptions: Subscription[];
  cancellationChecklists: Record<string, ChecklistItem[]>;
  cancellationProgresses: Record<string, CancellationProgressType>;
  cancellationDocuments: CancellationDocumentType[];
  completedCancellationHistory: CompletedCancellation[];
  timelineItems: Record<string, any[]>;
  showCountMap: Record<string, number>;
  timelineFilterType: 'all' | 'document' | 'progress' | 'event';
  timelineSearchQuery: string;
  onClose: () => void;
  onToggleChecklistItem: (subId: string, itemId: string) => void;
  onUploadProof: (subId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveProof: (docId: string) => void;
  setTimelineItems: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  setShowCountMap: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setTimelineFilterType: React.Dispatch<React.SetStateAction<'all' | 'document' | 'progress' | 'event'>>;
  setTimelineSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  getCancellationDeadlineFromBilling: (billingDate: string, noticeDays: number) => Date | null;
  getDaysUntil: (target: Date) => number;
  formatSubscriptionDate: (date: string) => string;
}

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M7 3h6l4 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckBadgeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 12.5l1.75 1.75L15 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CancellationAssistant: React.FC<CancellationAssistantProps> = ({
  activePlaybook,
  activePlaybookTab,
  setActivePlaybookTab,
  subscriptions,
  cancellationChecklists,
  cancellationProgresses,
  cancellationDocuments,
  completedCancellationHistory,
  timelineItems,
  showCountMap,
  timelineFilterType,
  timelineSearchQuery,
  onClose,
  onToggleChecklistItem,
  onUploadProof,
  onRemoveProof,
  setTimelineItems,
  setShowCountMap,
  setTimelineFilterType,
  setTimelineSearchQuery,
  getCancellationDeadlineFromBilling,
  getDaysUntil,
  formatSubscriptionDate,
}) => {
  const matchedSub = subscriptions.find(s => s.name === activePlaybook.provider_name);
  const subId = matchedSub?.id || 'default';
  const subAmount = matchedSub?.amount || 0;

  const checklist = cancellationChecklists[subId] || [];
  const progress = cancellationProgresses[subId] || { subscriptionId: subId, currentStep: 1, completed: false };
  const docs = cancellationDocuments.filter(d => d.subscriptionId === subId);

  const deadline = matchedSub && activePlaybook
    ? getCancellationDeadlineFromBilling(matchedSub.nextBillingDate, activePlaybook.notice_period_days)
    : null;
  const remainingDays = deadline ? getDaysUntil(deadline) : null;
  const deadlineDate = deadline
    ? deadline.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'ไม่ระบุวัน';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white border-t border-black/5 rounded-t-3xl shadow-2xl p-5 max-h-[92dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#000000] animate-sheet-spring flex flex-col gap-4">

        <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-1 shrink-0" />

        <div className="flex justify-between items-start shrink-0">
          <div>
            <span className="px-2 py-0.5 bg-[#000000] text-primary text-[9px] font-black rounded uppercase tracking-widest font-mono">
              Cancellation Assistant
            </span>
            <h3 className="font-black text-[#000000] text-lg mt-1 font-sans">
              {activePlaybook.provider_name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-white bg-[#000000] hover:bg-[#000000]/90 px-3 py-1.5 rounded-full transition-all font-bold"
          >
            Close
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3 shrink-0">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs font-kanit">
            <p className="font-black text-amber-800 leading-snug">
              กำหนดส่งคำร้องยกเลิกเพื่อไม่ให้ตัดรอบถัดไป
            </p>
            <p className="text-amber-700 mt-0.5 font-semibold">
              {activePlaybook?.notice_period_days === 0 ? (
                <>ยกเลิกได้ทันทีก่อนรอบบิลถัดไป <strong className="font-extrabold text-amber-900">{deadlineDate}</strong></>
              ) : deadline ? (
                <>ต้องแจ้งยกเลิกก่อน <strong className="font-extrabold text-amber-900">{deadlineDate}</strong> (เหลือเวลาอีก <strong className="font-extrabold text-amber-900 text-sm font-mono">{remainingDays}</strong> วัน)</>
              ) : (
                <>ยังไม่พบวันกำหนดยกเลิกที่ชัดเจน</>
              )}
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 gap-1">
          {(['info', 'checklist', 'proof', 'history', 'saved'] as const).map((tab) => {
            let label = '';
            if (tab === 'info') label = 'สิ่งที่ต้องทำ';
            if (tab === 'checklist') label = 'Checklist';
            if (tab === 'proof') label = 'Proof Vault';
            if (tab === 'history') label = 'ประวัติ';
            if (tab === 'saved') label = 'ประหยัดได้';

            const isSelected = activePlaybookTab === tab;

            return (
              <button
                key={tab}
                onClick={() => {
                  setActivePlaybookTab(tab);
                }}
                className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all font-kanit ${
                  isSelected
                    ? 'bg-[#000000] text-primary shadow-sm'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[50vh] pr-1">

          {activePlaybookTab === 'info' && (
            <div className="space-y-4 font-kanit">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">ช่องทางการยกเลิกสมาชิก</span>
                  <p className="text-xs font-black text-black mt-0.5">{activePlaybook.cancellation_method}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">ต้องแจ้งล่วงหน้า</span>
                    <p className="text-xs font-black text-black mt-0.5">{activePlaybook.notice_period_days === 0 ? 'ยกเลิกได้ทันที' : `${activePlaybook.notice_period_days} วัน`}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">ระยะเวลาดำเนินการ</span>
                    <p className="text-xs font-black text-black mt-0.5">{activePlaybook.estimated_duration}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">เอกสารที่ต้องใช้แสดง</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activePlaybook.required_documents.map((doc, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-700 border border-black/5">
                        <FileText size={12} className="text-gray-500" /> {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">เงื่อนไขค่าธรรมเนียมและค่าปรับ</span>
                  <p className="text-xs font-semibold text-amber-500 bg-amber-50/10 border border-amber-500/30 rounded-xl p-3 mt-1 leading-relaxed flex items-start gap-1.5">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {activePlaybook.penalty_information}
                  </p>
                </div>

                <div className="border-t border-black/5 pt-3">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-1.5">ข้อมูลการติดต่อผู้ให้บริการ</span>
                  <div className="bg-gray-50 border border-black/5 rounded-xl p-3 space-y-1.5 text-[11px] font-semibold text-gray-700">
                    <p><strong className="text-black">ช่องทาง:</strong> {activePlaybook.contact_information.channel}</p>
                    <p><strong className="text-black">รายละเอียด:</strong> {activePlaybook.contact_information.details}</p>
                    {activePlaybook.contact_information.phone && (
                      <p><strong className="text-black">เบอร์ติดต่อ:</strong> {activePlaybook.contact_information.phone}</p>
                    )}
                    {activePlaybook.contact_information.hours && (
                      <p><strong className="text-black">เวลาทำการ:</strong> {activePlaybook.contact_information.hours}</p>
                    )}
                    {activePlaybook.contact_information.url && (
                      <a
                        href={activePlaybook.contact_information.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black text-black bg-[#C7FF2E] px-2.5 py-1.5 rounded-lg border border-black/10 mt-1 shadow-sm uppercase tracking-wider"
                      >
                        ไปยังเว็บไซต์ผู้ให้บริการ ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePlaybookTab === 'checklist' && (
            <div className="space-y-5 font-kanit">
              <CancellationStepTracker
                currentStep={progress.currentStep - 1}
                totalSteps={4}
                stepLabels={['Review Account', 'Contact Provider', 'Confirm Cancellation', 'Complete']}
                stepDescriptions={[
                  'Review your account terms and conditions',
                  'Get in touch with the provider officially',
                  'Confirm cancellation in their system',
                  'Cancellation successfully processed',
                ]}
                completedSteps={Array.from({ length: Math.max(0, progress.currentStep - 1) }, (_, i) => i)}
              />

              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                  ขั้นตอนดำเนินการของท่าน (Interactive Checklist)
                </p>

                <div className="space-y-1.5">
                  {checklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onToggleChecklistItem(subId, item.id)}
                      className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                        item.completed
                          ? 'bg-gray-50 border-black/10 text-gray-500 line-through'
                          : 'bg-white border-black/5 hover:border-black/20 text-black font-semibold'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                        item.completed
                          ? 'bg-[#000000] border-[#000000] text-primary'
                          : 'bg-white border-black/20 text-transparent'
                      }`}>
                        {item.completed && <Check size={12} strokeWidth={4} />}
                      </div>
                      <span className="text-xs leading-snug">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePlaybookTab === 'proof' && (
            <div className="space-y-4 font-kanit">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
                คลังหลักฐานเพื่อความปลอดภัย (Proof Vault)
              </p>

              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                เพื่อลดความเสี่ยงจากการแอบอ้างตัดเงินซ้ำซ้อนหลังบอกเลิกบริการ ท่านสามารถอัปโหลดใบเสร็จ หนังสือยกเลิก หรือ Screenshot ข้อความโต้ตอบไว้เป็นหลักฐานที่นี่ได้
              </p>

              <div className="border-2 border-dashed border-black/10 hover:border-black/30 bg-gray-50 rounded-2xl p-5 text-center relative transition-all group">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => onUploadProof(subId, e)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-1.5 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-spring">
                    <Plus size={20} strokeWidth={2.5} className="text-black" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-black">กดเลือกไฟล์เพื่ออัปโหลดหลักฐาน</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">รองรับรูปภาพ ใบรับรองแพทย์ และไฟล์เอกสารยืนยัน</p>
                  </div>
                </div>
              </div>

              {docs.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {docs.map((doc) => (
                    <div key={doc.id} className="bg-gray-50 border border-black/5 rounded-xl p-2.5 relative flex flex-col justify-between gap-2 overflow-hidden shadow-sm">
                      <button
                        onClick={() => onRemoveProof(doc.id)}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black text-white hover:bg-black/90 flex items-center justify-center text-[10px] font-bold z-10 active:scale-90 transition-all cursor-pointer"
                        title="ลบหลักฐาน"
                      >
                        ✕
                      </button>

                      <div className="w-full h-24 bg-black/5 rounded-lg flex items-center justify-center overflow-hidden border border-black/5 relative">
                        {doc.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img src={doc.fileUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={20} className="text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0 pr-4">
                        <p className="text-[10px] font-black text-black truncate" title={doc.fileName}>
                          {doc.fileName}
                        </p>
                        <p className="text-[8px] text-gray-400 font-semibold font-mono mt-0.5">
                          อัปเมื่อ: {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-400 bg-gray-50/50 border border-black/5 border-dashed rounded-2xl font-semibold">
                  📭 ยังไม่มีการอัปโหลดเอกสารหลักฐานใดๆ ในตู้เซฟนี้
                </div>
              )}
            </div>
          )}

          {activePlaybookTab === 'history' && (
            <div className="space-y-4 font-kanit">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">ประวัติการยกเลิก</p>

              <div>
                <h4 className="text-sm font-black text-black mb-2">Timeline</h4>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    placeholder="ค้นหาประวัติ (ค้นหาไทเทิล/คำอธิบาย)"
                    className="timeline-search px-3 py-2 rounded-xl border border-black/5 text-sm flex-1"
                    value={timelineSearchQuery}
                    onChange={(e) => setTimelineSearchQuery(e.target.value)}
                  />
                  <select value={timelineFilterType} onChange={(e) => setTimelineFilterType(e.target.value as any)} className="px-3 py-2 rounded-xl border border-black/5 text-sm">
                    <option value="all">All</option>
                    <option value="document">Document</option>
                    <option value="progress">Progress</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                {(() => {
                  const items = (timelineItems[subId] || []) as any[];
                  if (!items || items.length === 0) {
                    return <div className="text-center py-6 text-xs text-gray-400">ยังไม่มีกิจกรรมย้อนหลังสำหรับบริการนี้</div>;
                  }
                  const PAGE_SIZE = 8;
                  const total = items.length;
                  const shown = (showCountMap[subId] || PAGE_SIZE);

                  const flat = items.slice().sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

                  const filtered = flat.filter((t) => {
                    if (timelineFilterType !== 'all' && t.type !== timelineFilterType) return false;
                    if (!timelineSearchQuery) return true;
                    const q = timelineSearchQuery.trim().toLowerCase();
                    const title = String(prettifyTitle(t)).toLowerCase();
                    const details = String(renderDetails(t) || '').toLowerCase();
                    return title.includes(q) || details.includes(q);
                  });

                  const visible = filtered.slice(0, shown);

                  const formatLabel = (iso: string) => {
                    const d = new Date(iso);
                    const today = new Date();
                    const y = new Date(); y.setDate(today.getDate() - 1);
                    const isToday = d.toDateString() === today.toDateString();
                    const isYesterday = d.toDateString() === y.toDateString();
                    if (isToday) return 'วันนี้';
                    if (isYesterday) return 'เมื่อวานนี้';
                    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
                  };

                  const groups: Record<string, any[]> = {};
                  visible.forEach(it => {
                    const key = new Date(it.timestamp).toISOString().slice(0,10);
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(it);
                  });

                  const dates = Object.keys(groups).sort((a,b) => +new Date(b) - +new Date(a));

                  const prettifyTitle = (t: any) => {
                    if (t.type === 'document') return 'อัปโหลดหลักฐาน';
                    if (t.type === 'progress') return t.title || 'Progress update';
                    const raw = String(t.title || 'Event');
                    return raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  };

                  const renderDetails = (t: any) => {
                    if (!t.details) return null;
                    try {
                      const parsed = JSON.parse(t.details);
                      if (t.type === 'event') {
                        if (parsed.subscriptionId || parsed.subscription_id) {
                          return `Subscription: ${parsed.subscriptionId || parsed.subscription_id}`;
                        }
                        if (parsed.amount) return `Amount: ${parsed.amount}`;
                        return JSON.stringify(parsed);
                      }
                      return String(t.details).slice(0, 200);
                    } catch (e) {
                      return String(t.details).slice(0, 200);
                    }
                  };

                  return (
                    <div className="space-y-3">
                      {dates.map(date => (
                        <div key={date} className="space-y-2">
                          <div className="text-[12px] font-black text-gray-600">{formatLabel(groups[date][0].timestamp)}</div>
                          <div className="space-y-2">
                            {groups[date].map((t: any, idx: number) => (
                              <div key={t.id}
                                className="p-3 rounded-xl bg-gray-50 border border-black/5 flex items-start gap-3 animate-timeline-item"
                                style={{ animationDelay: `${idx * 70}ms` }}
                              >
                                <div className="shrink-0 mt-1 text-gray-700">
                                  {t.type === 'document' ? (
                                    <DocumentIcon className="w-6 h-6 text-gray-700" />
                                  ) : t.type === 'progress' ? (
                                    <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                                  ) : (
                                    <ChatIcon className="w-6 h-6 text-gray-600" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black truncate">{prettifyTitle(t)}</p>
                                  {t.type === 'document' && t.details && (
                                    <p className="text-[11px] mt-1">
                                      <a href={t.details} target="_blank" rel="noreferrer" className="text-primary underline">เปิดเอกสาร</a>
                                    </p>
                                  )}
                                  {t.type !== 'document' && t.details && (
                                    <p className="text-[11px] text-gray-500 mt-1 truncate">{renderDetails(t)}</p>
                                  )}
                                  <p className="text-[10px] text-gray-400 font-mono mt-1">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {visible.length < total && (
                        <div className="text-center">
                          <button onClick={() => setShowCountMap(prev => ({ ...prev, [subId]: (prev[subId] || PAGE_SIZE) + PAGE_SIZE }))} className="text-sm text-primary font-black">Load more</button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <h4 className="text-sm font-black text-black mb-2">Uploaded Proofs</h4>
                {docs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {docs.map((doc) => (
                      <div key={doc.id} className="bg-gray-50 border border-black/5 rounded-xl p-3 overflow-hidden">
                        <div className="w-full h-20 bg-black/5 rounded-lg flex items-center justify-center overflow-hidden mb-2">
                          {doc.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img src={doc.fileUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <FileText size={24} className="text-gray-400" />
                          )}
                        </div>
                        <p className="text-[10px] font-black truncate" title={doc.fileName}>{doc.fileName}</p>
                        <p className="text-[8px] text-gray-400 font-mono mt-1">อัปเมื่อ: {doc.uploadedAt}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-gray-400">ยังไม่มีเอกสารหลักฐานสำหรับบริการนี้</div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-black text-black mt-4 mb-2">Completed Cancellations</h4>
                {completedCancellationHistory.filter(h => h.subscriptionId === subId).length > 0 ? (
                  <div className="space-y-2">
                    {completedCancellationHistory.filter(h => h.subscriptionId === subId).map((h) => (
                      <div key={`${h.subscriptionId}-${h.updatedAt}`} className="p-3 rounded-xl bg-gray-50 border border-black/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-black">{matchedSub?.name || h.subscriptionId}</p>
                            <p className="text-[10px] text-gray-500 mt-1">ยกเลิกสำเร็จเมื่อ {h.updatedAt}</p>
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-600 bg-white border border-black/5 rounded-full px-3 py-1">Completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-gray-400">ยังไม่มีประวัติการยกเลิกสำเร็จสำหรับบริการนี้</div>
                )}
              </div>
            </div>
          )}

          {activePlaybookTab === 'saved' && (
            <div className="space-y-4 font-kanit text-center py-6">
              <div className="inline-flex w-16 h-16 rounded-full bg-primary border-4 border-black/5 items-center justify-center text-3xl shrink-0 shadow-lg animate-bounce">
                <Sparkles size={32} className="text-[#0B0F0A]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-black">ยินดีด้วยกับการบอกเลิกสิทธิ์สำเร็จ!</h4>
                <p className="text-xs text-gray-500 font-semibold">
                  DailyStack ช่วยให้คุณประหยัดค่าใช้จ่ายฟุ่มเฟือยได้แล้ว
                </p>
              </div>

              <div className="bg-[#000000] rounded-2xl p-5 text-center shadow-lg border border-white/5 relative overflow-hidden group max-w-sm mx-auto">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#C7FF2E]/10 rounded-full blur-2xl pointer-events-none" />

                <p className="text-[10px] text-primary uppercase tracking-widest font-black mb-1.5">
                  ยอดการประหยัดเงินสุทธิของท่าน (Net Money Saved)
                </p>

                <div className="grid grid-cols-2 gap-4 divide-x divide-white/10 mt-3 pt-3 border-t border-white/10 text-white">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-black">ประหยัดได้ / เดือน</p>
                    <p className="text-xl font-extrabold text-primary font-mono tracking-tight mt-1">
                      {subAmount.toLocaleString()}
                      <span className="text-[10px] text-white font-normal ml-1">THB</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase font-black">ประหยัดได้ / ปี</p>
                    <p className="text-xl font-extrabold text-white font-mono tracking-tight mt-1">
                      {(subAmount * 12).toLocaleString()}
                      <span className="text-[10px] text-white font-normal ml-1">THB</span>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 font-semibold leading-relaxed max-w-xs mx-auto">
                ระบบคำนวณจากค่าใช้จ่ายจริงของบริการ {activePlaybook.provider_name} ปลุกสุขภาพการเงินของท่านให้กลับมารวดเร็วแข็งแกร่งอีกครั้ง!
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
