/**
 * ============================================================
 * DailyStack — CSVImportModal.tsx
 * ============================================================
 * CSV / Bank Statement Import Modal
 * P1: Structure + UI only — no Bank API integration
 *
 * Flow:
 *   [File Upload] → [Parsing] → [Preview] → [Confirm Import] → [Done]
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  Upload,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  FileWarning,
} from 'lucide-react';
import {
  runImportPipeline,
  commitImport,
  type ImportSession,
  type ImportPreviewItem,
} from '../services/csvImportService';
import { loadSubscriptions } from '../services/subscriptionService';
import { MERCHANT_DATABASE, CATEGORY_META } from './SubscriptionTrackerPage';

// ─── Design Tokens ──────────────────────────────────────────────────────────
const ACCENT = '#0FB0CE';
const TEXT = '#111827';
const TEXT_MUTED = '#666666';
const BORDER = '#E5E5E5';
const NEGATIVE = '#EF4444';
const WARNING = '#F97316';

// ─── Progress Steps ─────────────────────────────────────────────────────────
type Step = 'upload' | 'parsing' | 'preview' | 'importing' | 'done' | 'error';

const STEP_LABELS_EN = ['Upload', 'Preview', 'Import'];
const STEP_LABELS_TH = ['อัปโหลด', 'ตรวจสอบ', 'นำเข้า'];

interface StepIndicatorProps {
  currentStep: Step;
  lang: 'en' | 'th';
}
const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, lang }) => {
  const steps: Step[] = ['upload', 'preview', 'importing'];
  const activeIdx = currentStep === 'upload' ? 0 : currentStep === 'preview' || currentStep === 'parsing' ? 1 : currentStep === 'importing' || currentStep === 'done' ? 2 : -1;
  const labels = lang === 'th' ? STEP_LABELS_TH : STEP_LABELS_EN;

  if (currentStep === 'error') return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      {steps.map((step, idx) => {
        const isDone = idx < activeIdx;
        const isActive = idx === activeIdx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all"
                style={{
                  backgroundColor: isDone ? ACCENT : isActive ? `${ACCENT}20` : '#F5F5F5',
                  color: isDone ? '#111827' : isActive ? ACCENT : TEXT_MUTED,
                  border: isActive ? `2px solid ${ACCENT}` : 'none',
                }}
              >
                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? ACCENT : TEXT_MUTED }}
              >
                {labels[idx]}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="flex-1 h-px mb-5" style={{ backgroundColor: isDone ? ACCENT : BORDER }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Preview Item Row ────────────────────────────────────────────────────────
interface PreviewItemRowProps {
  item: ImportPreviewItem;
  lang: 'en' | 'th';
  onToggle: (id: string) => void;
}
const PreviewItemRow: React.FC<PreviewItemRowProps> = ({ item, lang, onToggle }) => {
  const { candidate } = item;
  const cat = CATEGORY_META[candidate.category] || CATEGORY_META.other;
  const isSelected = item.selected;
  const isDuplicate = item.status === 'duplicate';

  const cycleLabel = lang === 'th'
    ? candidate.billingCycle === 'weekly' ? 'รายสัปดาห์'
      : candidate.billingCycle === 'yearly' ? 'รายปี' : 'รายเดือน'
    : candidate.billingCycle === 'weekly' ? 'Weekly'
      : candidate.billingCycle === 'yearly' ? 'Yearly' : 'Monthly';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isDuplicate ? 'opacity-50' : isSelected ? '' : 'opacity-60'
      }`}
      style={{
        backgroundColor: isSelected && !isDuplicate ? `${cat.color}10` : '#F8F8F8',
        border: isSelected && !isDuplicate ? `1.5px solid ${cat.color}60` : `1.5px solid ${BORDER}`,
      }}
    >
      {/* Checkbox / logo */}
      <button
        onClick={() => !isDuplicate && onToggle(candidate.name)}
        disabled={isDuplicate}
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
          isDuplicate ? '' : 'active:scale-90'
        }`}
        style={{
          backgroundColor: isDuplicate ? '#F5F5F5'
            : isSelected ? ACCENT : 'transparent',
          border: isDuplicate ? 'none'
            : isSelected ? 'none' : `2px solid ${BORDER}`,
        }}
      >
        {!isDuplicate && isSelected && <Check className="w-3.5 h-3.5" style={{ color: '#111827' }} />}
        {isDuplicate && <FileWarning className="w-3.5 h-3.5" style={{ color: TEXT_MUTED }} />}
      </button>

      {/* Color dot */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
        style={{ backgroundColor: cat.color }}
      >
        {candidate.name[0]?.toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[14px] font-semibold truncate" style={{ color: TEXT }}>
            {candidate.name}
          </p>
          {item.status === 'duplicate' && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: `${WARNING}20`, color: WARNING }}>
              {lang === 'th' ? 'ซ้ำ' : 'Duplicate'}
            </span>
          )}
          {candidate.autoCategory && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}>
              {lang === 'th' ? 'ตรวจพบ' : 'Auto'}
            </span>
          )}
        </div>
        <p className="text-[11px]" style={{ color: TEXT_MUTED }}>
          {lang === 'th' ? cat.labelTh : cat.labelEn} · {cycleLabel} · {lang === 'th' ? 'วันที่' : 'Day'} {candidate.dueDate}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="text-[14px] font-bold" style={{ color: TEXT, fontFamily: 'JetBrains Mono, monospace' }}>
          ฿{candidate.amount.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US')}
        </p>
        <p className="text-[10px]" style={{ color: TEXT_MUTED }}>
          /{lang === 'th' ? 'เดือน' : 'mo'}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Main Modal Component ────────────────────────────────────────────────────
interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void; // callback after successful import
  lang: 'en' | 'th';
}

export default function CSVImportModal({ isOpen, onClose, onImportComplete, lang }: CSVImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [session, setSession] = useState<ImportSession | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [dragOverId, setDragOverId] = useState(false);

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setSession(null);
      setParseProgress(0);
      setImportProgress({ done: 0, total: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── File Upload ──────────────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    setStep('parsing');
    setParseProgress(20);

    // Run import pipeline
    const existingSubs = await loadSubscriptions();
    setParseProgress(50);

    const result = await runImportPipeline(file, existingSubs);
    setParseProgress(100);

    setSession(result);

    if (result.status === 'error') {
      setStep('error');
    } else if (result.previewItems.length === 0) {
      setStep('error');
      setSession(prev => prev ? { ...prev, error: lang === 'th' ? 'ไม่พบรายการที่เป็นการสมัครในไฟล์นี้' : 'No subscription-like transactions found in this file.' } : null);
    } else {
      setStep('preview');
    }
  }, [lang]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleImport = useCallback(async () => {
    if (!session) return;
    setStep('importing');
    setImportProgress({ done: 0, total: session.previewItems.filter(i => i.selected).length });

    const result = await commitImport(
      session.previewItems,
      (done, total) => setImportProgress({ done, total })
    );

    setSession(prev => prev ? { ...prev, status: 'done' } : null);
    setStep('done');
  }, [session]);

  const toggleItem = useCallback((name: string) => {
    if (!session) return;
    setSession(prev => {
      if (!prev) return null;
      const updated = prev.previewItems.map(item =>
        item.candidate.name === name && item.status !== 'duplicate'
          ? { ...item, selected: !item.selected }
          : item
      );
      const selectedCount = updated.filter(i => i.selected).length;
      const totalMonthlyImpact = updated
        .filter(i => i.selected)
        .reduce((sum, i) => {
          const amt = i.candidate.amount;
          const cycle = i.candidate.billingCycle;
          const monthly = cycle === 'weekly' ? amt * 52 / 12
            : cycle === 'yearly' ? amt / 12 : amt;
          return sum + monthly;
        }, 0);
      return { ...prev, previewItems: updated, selectedCount, totalMonthlyImpact };
    });
  }, [session]);

  const toggleAll = useCallback((select: boolean) => {
    if (!session) return;
    setSession(prev => {
      if (!prev) return null;
      const updated = prev.previewItems.map(item =>
        item.status !== 'duplicate' ? { ...item, selected: select } : item
      );
      const selectedCount = updated.filter(i => i.selected).length;
      const totalMonthlyImpact = updated
        .filter(i => i.selected)
        .reduce((sum, i) => {
          const amt = i.candidate.amount;
          const cycle = i.candidate.billingCycle;
          const monthly = cycle === 'weekly' ? amt * 52 / 12
            : cycle === 'yearly' ? amt / 12 : amt;
          return sum + monthly;
        }, 0);
      return { ...prev, previewItems: updated, selectedCount, totalMonthlyImpact };
    });
  }, [session]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center"
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-t-3xl bg-white flex flex-col"
          style={{ maxHeight: '92vh' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center py-3 shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 shrink-0">
            <h2 className="text-[17px] font-bold" style={{ color: TEXT, fontFamily: lang === 'th' ? 'Noto Sans Thai, sans-serif' : 'Inter, sans-serif' }}>
              {lang === 'th' ? 'นำเข้าจากไฟล์' : 'Import from File'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5" style={{ color: TEXT_MUTED }} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="px-5 shrink-0">
            <StepIndicator currentStep={step} lang={lang} />
          </div>

          {/* ── Scrollable Content ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-5 pb-6">

            {/* ── Step: Upload ── */}
            {step === 'upload' && (
              <div>
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    flex flex-col items-center justify-center gap-3 py-10 px-4 rounded-2xl border-2 border-dashed cursor-pointer
                    transition-all active:scale-[0.98]
                    ${dragOver
                      ? 'border-[#0FB0CE] bg-[rgba(15, 176, 206,0.06)]'
                      : 'border-[#E5E5E5] bg-gray-50 hover:border-[#0FB0CE] hover:bg-[rgba(15, 176, 206,0.04)]'
                    }
                  `}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: dragOver ? `${ACCENT}20` : '#F5F5F5' }}
                  >
                    {dragOver
                      ? <Upload className="w-6 h-6" style={{ color: ACCENT }} />
                      : <FileSpreadsheet className="w-6 h-6" style={{ color: TEXT_MUTED }} />
                    }
                  </div>
                  <div className="text-center">
                    <p className="text-[15px] font-semibold" style={{ color: TEXT }}>
                      {lang === 'th' ? 'วางไฟล์ CSV หรือคลิกเพื่อเลือก' : 'Drop CSV file here or tap to browse'}
                    </p>
                    <p className="text-[13px] mt-1" style={{ color: TEXT_MUTED }}>
                      {lang === 'th'
                        ? 'รองรับ CSV จากธนาคารไทย (SCB, KBank, BBL, Krungsri, TMB)'
                        : 'Supports CSV from Thai banks (SCB, KBank, BBL, Krungsri, TMB)'}
                    </p>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,text/csv,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />

                {/* Format guide */}
                <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: '#F8F8F8' }}>
                  <p className="text-[12px] font-semibold mb-2" style={{ color: TEXT_MUTED }}>
                    {lang === 'th' ? '📋 รูปแบบที่รองรับ' : '📋 Supported formats'}
                  </p>
                  <div className="space-y-1.5">
                    {[
                      lang === 'th' ? 'Export CSV จากแอปธนาคาร (SCB, KBank, BBL, Krungsri, TMB)' : 'CSV export from Thai bank apps (SCB, KBank, BBL, Krungsri, TMB)',
                      lang === 'th' ? 'Statement CSV จาก internet banking' : 'Statement CSV from internet banking',
                      lang === 'th' ? 'ไฟล์ CSV ที่มีคอลัมน์: วันที่, รายละเอียด, จำนวนเงิน' : 'CSV with columns: Date, Description, Amount',
                    ].map((fmt, i) => (
                      <p key={i} className="text-[12px] flex items-start gap-1.5" style={{ color: TEXT_MUTED }}>
                        <span className="shrink-0 mt-0.5">•</span>
                        <span>{fmt}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Cancel */}
                <button
                  onClick={onClose}
                  className="w-full mt-4 py-3 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98]"
                  style={{ backgroundColor: '#F5F5F5', color: TEXT }}
                >
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
              </div>
            )}

            {/* ── Step: Parsing ── */}
            {step === 'parsing' && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative">
                  <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
                </div>
                <p className="text-[15px] font-semibold" style={{ color: TEXT }}>
                  {lang === 'th' ? 'กำลังวิเคราะห์ไฟล์...' : 'Analyzing file...'}
                </p>
                <p className="text-[13px]" style={{ color: TEXT_MUTED }}>
                  {lang === 'th'
                    ? 'ตรวจหารายการที่ซ้ำๆ ในงวด เช่น รายเดือน รายปี'
                    : 'Detecting recurring payments (monthly, yearly)'}
                </p>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: ACCENT }}
                    animate={{ width: `${parseProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-[12px]" style={{ color: TEXT_MUTED }}>{parseProgress}%</p>
              </div>
            )}

            {/* ── Step: Preview ── */}
            {step === 'preview' && session && (
              <div>
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: lang === 'th' ? 'พบ' : 'Found', value: session.candidates.length.toString(), color: ACCENT },
                    { label: lang === 'th' ? 'เลือก' : 'Selected', value: session.selectedCount.toString(), color: ACCENT },
                    { label: lang === 'th' ? 'ซ้ำ' : 'Dup', value: session.duplicateCount.toString(), color: WARNING },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center py-3 rounded-xl" style={{ backgroundColor: '#F8F8F8' }}>
                      <p className="text-[20px] font-bold" style={{ color: stat.color, fontFamily: 'JetBrains Mono, monospace' }}>
                        {stat.value}
                      </p>
                      <p className="text-[11px]" style={{ color: TEXT_MUTED }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Monthly impact */}
                <div className="mb-4 flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: `${ACCENT}10`, border: `1px solid ${ACCENT}40` }}>
                  <span className="text-[13px] font-medium" style={{ color: TEXT }}>
                    {lang === 'th' ? 'ผลกระทบต่อเดือนนี้' : 'Monthly impact'}
                  </span>
                  <span className="text-[17px] font-bold" style={{ color: ACCENT, fontFamily: 'JetBrains Mono, monospace' }}>
                    ฿{session.totalMonthlyImpact.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { maximumFractionDigits: 0 })}/{lang === 'th' ? 'เดือน' : 'mo'}
                  </span>
                </div>

                {/* Select all / deselect all */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => toggleAll(true)}
                    className="text-[12px] font-medium"
                    style={{ color: ACCENT }}
                  >
                    {lang === 'th' ? 'เลือกทั้งหมด' : 'Select all'}
                  </button>
                  <button
                    onClick={() => toggleAll(false)}
                    className="text-[12px] font-medium"
                    style={{ color: TEXT_MUTED }}
                  >
                    {lang === 'th' ? 'ยกเลิกเลือกทั้งหมด' : 'Deselect all'}
                  </button>
                </div>

                {/* Items list */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {session.previewItems.map((item) => (
                    <PreviewItemRow
                      key={item.candidate.name}
                      item={item}
                      lang={lang}
                      onToggle={toggleItem}
                    />
                  ))}
                </div>

                {/* Import button */}
                <button
                  onClick={handleImport}
                  disabled={session.selectedCount === 0}
                  className="w-full mt-5 py-4 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-40"
                  style={{
                    backgroundColor: session.selectedCount > 0 ? ACCENT : '#E5E5E5',
                    color: session.selectedCount > 0 ? '#111827' : '#9CA3AF',
                  }}
                >
                  {lang === 'th'
                    ? `✓ นำเข้า ${session.selectedCount} รายการ`
                    : `✓ Import ${session.selectedCount} items`}
                </button>

                <button
                  onClick={() => setStep('upload')}
                  className="w-full mt-2 py-3 text-[14px] font-medium transition-all"
                  style={{ color: TEXT_MUTED }}
                >
                  {lang === 'th' ? '← เลือกไฟล์อื่น' : '← Choose a different file'}
                </button>
              </div>
            )}

            {/* ── Step: Importing ── */}
            {step === 'importing' && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT }} />
                <p className="text-[15px] font-semibold" style={{ color: TEXT }}>
                  {lang === 'th' ? 'กำลังนำเข้า...' : 'Importing subscriptions...'}
                </p>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: ACCENT }}
                    animate={{
                      width: `${importProgress.total > 0 ? (importProgress.done / importProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-[13px]" style={{ color: TEXT_MUTED }}>
                  {lang === 'th'
                    ? `${importProgress.done} / ${importProgress.total} รายการ`
                    : `${importProgress.done} / ${importProgress.total} items`}
                </p>
              </div>
            )}

            {/* ── Step: Done ── */}
            {step === 'done' && session && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${ACCENT}20` }}
                >
                  <CheckCircle className="w-10 h-10" style={{ color: ACCENT }} />
                </motion.div>
                <div className="text-center">
                  <p className="text-[17px] font-bold" style={{ color: TEXT }}>
                    {lang === 'th' ? 'นำเข้าสำเร็จ!' : 'Import Complete!'}
                  </p>
                  <p className="text-[14px] mt-1" style={{ color: TEXT_MUTED }}>
                    {lang === 'th'
                      ? `${session.selectedCount} รายการถูกเพิ่มเข้าระบบแล้ว`
                      : `${session.selectedCount} subscriptions added`}
                  </p>
                </div>
                <button
                  onClick={() => { onImportComplete(); onClose(); }}
                  className="w-full py-4 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98]"
                  style={{ backgroundColor: ACCENT, color: '#111827' }}
                >
                  {lang === 'th' ? '✓ เสร็จสิ้น' : '✓ Done'}
                </button>
              </div>
            )}

            {/* ── Step: Error ── */}
            {step === 'error' && session && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${NEGATIVE}15` }}
                >
                  <AlertCircle className="w-8 h-8" style={{ color: NEGATIVE }} />
                </div>
                <div className="text-center px-4">
                  <p className="text-[15px] font-semibold" style={{ color: TEXT }}>
                    {lang === 'th' ? 'นำเข้าไม่สำเร็จ' : 'Import Failed'}
                  </p>
                  <p className="text-[13px] mt-2" style={{ color: TEXT_MUTED }}>
                    {session.error || (lang === 'th'
                      ? 'เกิดข้อผิดพลาด กรุณาลองใหม่'
                      : 'Something went wrong. Please try again.')}
                  </p>
                </div>
                <button
                  onClick={() => setStep('upload')}
                  className="w-full py-4 rounded-xl text-[15px] font-bold transition-all active:scale-[0.98]"
                  style={{ backgroundColor: ACCENT, color: '#111827' }}
                >
                  {lang === 'th' ? 'ลองใหม่' : 'Try Again'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
