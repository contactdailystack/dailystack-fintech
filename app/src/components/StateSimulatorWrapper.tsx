import { motion } from 'motion/react';
import { 
  Sparkles, RefreshCw, AlertTriangle, CheckCircle2, 
  ShieldAlert, FileText, Database, Radio
} from 'lucide-react';

interface StateSimulatorWrapperProps {
  state: 'normal' | 'empty' | 'loading' | 'error' | 'success';
  onReset: () => void;
  screenId: string;
  lang: 'en' | 'th';
  children: React.ReactNode;
}

export function StateSimulatorWrapper({ state, onReset, screenId, lang, children }: StateSimulatorWrapperProps) {
  if (state === 'normal') {
    return <>{children}</>;
  }

  const t = {
    en: {
      emptyDashboardTitle: "Room Space Unfunded",
      emptyDashboardDesc: "Deploy a core reserve buffer to start Habit Analytics. Active portfolio calibrations are currently standing by.",
      emptyActivityTitle: "Emotional Slate Clean",
      emptyActivityDesc: "No premium emotional outlays or impulse regret transactions captured in this session. Enjoy absolute dopamine sovereignty.",
      emptyInsightsTitle: "Diagnostic Core Standby",
      emptyInsightsDesc: "Record at least 3 emotive entries in your Activity Ledger to compile diagnostic coping-economy charts.",
      emptyRadarTitle: "Conscious Core Ready",
      emptyRadarDesc: "AI reasoning models are primed. Tap below or run normal state mode to calibrate your Money Twin's financial signature.",
      emptySettingsTitle: "No Secondary Proxies",
      emptySettingsDesc: "Standard node is fully active. Connect API keys inside .env.example or upgrade the system to link external banks.",

      loadingDashboardText: "Shimmering Core Snapshot...",
      loadingActivityText: "Constructing Habit Ledger...",
      loadingInsightsText: "Compiling Psychometrics...",
      loadingRadarText: "Syncing Cognitive Calibrations...",
      loadingSettingsText: "Securing Token Enclave...",

      errorTitle: "Shield Security Fault",
      errorDescLine1: "INTEGRITY_SHIELD: Network signal interrupted or cookie sandbox boundary reached. Diagnostic code: ERROR_SYS_LOCK_V4.",
      errorAction: "RE-ESTABLISH SECURE PROTOCOL",

      successTitle: "Protocol Securely Executed",
      successDescLine1: "LEDGER_INTEGRITY_STAMPED: Vault balances consolidated. +150 XP rewarded to your financial behavior level.",
      successAction: "RESUME TRACKING WORKSPACE"
    },
    th: {
      emptyDashboardTitle: "ห้องนิรภัยอวกาศว่างเปล่า (Unfunded Node)",
      emptyDashboardDesc: "สตรีมโหนดสะสมทุนแรกของคุณเพื่อเปิดไฟวิเคราะห์วินัย พิมพ์เขียวพฤติกรรมของคุณกำลังรออยู่อย่างอดทน",
      emptyActivityTitle: "กระดานจดจำสติบริสุทธิ์ (Sovereign Slate)",
      emptyActivityDesc: "ยังไม่มีประวัติโอนย้ายเงินระบายอารมณ์วู่วามหรือใช้จ่ายเสียใจเกิดขึ้นในสัปดาห์นี้ ขอแสดงความยินดีในความควบคุมที่เด็ดขาด",
      emptyInsightsTitle: "ระบบวิเคราะห์อัตโนมัติสแตนด์บาย (Diagnostics Standby)",
      emptyInsightsDesc: "กรุณาสลักจดบันทึกสติผูกมัดค่าอารมณ์ประเภท Impulse หรือ Stress เพิ่มขึ้นอีก 3 รายการเพื่อคลี่พิมพ์เขียวจิตวิทยา",
      emptyRadarTitle: "จิตวิญญาณแห่งเซสชั่นพร้อม (Cognitive Ready)",
      emptyRadarDesc: "ระบบอัจฉริยะคาลิเบรตเรียบร้อย กรุณาทักทายคำถามแรกเพื่อเริ่มถอดบทสรุปแฝดการเงินส่วนตัวคุณทันที",
      emptySettingsTitle: "ปราศจากสิทธิเชื่อมต่อภายนอก",
      emptySettingsDesc: "โหนดท้องถิ่นทำงานปกติ กรุณาปักหมุด API คีย์ส่วนตัวใน .env.example เพื่อประสานสะพานตลาดหุ้นโลก",

      loadingDashboardText: "กำลังฉายแสงสแกนห้องสำรองดัชนี...",
      loadingActivityText: "กำลังสร้างบัญชีแยกประเภทสติจิตศึกษา...",
      loadingInsightsText: "กำลังนวดแผนผังดัชนีความเสียใจแปรผัน...",
      loadingRadarText: "กำลังประกอบร่างวงแหวนชีวมาตรสมดุล...",
      loadingSettingsText: "กำลังปิดขอบเขตคลังเข้ารหัสมาตรฐานแบงก์...",

      errorTitle: "โปรโตคอลระบบติดขัด (Shield Integrity Fault)",
      errorDescLine1: "INTEGRITY_SHIELD: การเชื่อมต่อระบบสตรีมข้อมูลสะดุดชั่วคราว รหัสการขัดข้องทางเทคนิค: ERROR_SYS_LOCK_V4",
      errorAction: "สถาปนาเกราะโปรโตคอลใหม่ทันที",

      successTitle: "โปรโตคอลยืนยันผลเสร็จสมบูรณ์",
      successDescLine1: "LEDGER_INTEGRITY_STAMPED: การอนุมัติแปรผันสมบูรณ์แบบ ได้รับกระแสรางวัล +150 XP มอบให้โบนัสระดับของสติคุณ",
      successAction: "กลับเข้าสู่ศูนย์จัดการระบบห้องนิรภัย"
    }
  }[lang];

  // 1. LOADING WIREFRAME STATE
  if (state === 'loading') {
    return (
      <div id="simulation-loading-view" className="space-y-6 md:space-y-8 animate-pulse text-left py-4">
        <div className="flex justify-between items-center bg-zinc-950/60 p-3 rounded-2xl border border-[#C7FF2E]/25 font-mono text-xs text-[#C7FF2E]">
          <span className="flex items-center gap-1.5 font-bold font-mono">
            <Radio className="w-3.5 h-3.5 animate-bounce" /> {t.loadingDashboardText}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">SKELETON PROTOTYPE</span>
        </div>

        {screenId === 'dashboard' && (
          <div className="space-y-6" id="skeleton-dashboard">
            <div className="h-44 bg-zinc-900 rounded-[32px] border border-zinc-850 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-36 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
              <div className="h-36 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
            </div>
            <div className="h-48 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
          </div>
        )}

        {screenId === 'activity' && (
          <div className="space-y-4" id="skeleton-activity">
            <div className="h-16 bg-zinc-900 rounded-2xl border border-zinc-850"></div>
            <div className="h-10 bg-zinc-900 rounded-xl border border-zinc-850 w-2/3"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="h-14 bg-zinc-900 rounded-2xl border border-zinc-850"></div>
              ))}
            </div>
          </div>
        )}

        {screenId === 'insights' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="skeleton-insights">
            <div className="col-span-1 md:col-span-7 h-96 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
            <div className="col-span-1 md:col-span-5 space-y-6">
              <div className="h-44 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
              <div className="h-44 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
            </div>
          </div>
        )}

        {screenId === 'radar' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="skeleton-radar">
            <div className="col-span-1 md:col-span-4 h-96 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
            <div className="col-span-1 md:col-span-8 h-96 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
          </div>
        )}

        {screenId === 'settings' && (
          <div className="space-y-6 animate-pulse" id="skeleton-settings">
            <div className="h-32 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
            <div className="h-48 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
            <div className="h-20 bg-zinc-900 rounded-[32px] border border-zinc-500/10"></div>
          </div>
        )}

        {screenId === 'paywall' && (
          <div className="space-y-6" id="skeleton-paywall">
            <div className="h-24 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
            <div className="h-64 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
            <div className="h-20 bg-zinc-900 rounded-[32px] border border-zinc-850"></div>
          </div>
        )}
      </div>
    );
  }

  // 2. ERROR WIREFRAME STATE
  if (state === 'error') {
    return (
      <motion.div 
        id="simulation-error-view"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[50vh] flex flex-col justify-center items-center p-8 border rounded-[36px] bg-gradient-to-b from-red-950/20 to-black/95 border-red-500/20 backdrop-blur-md text-left max-w-xl mx-auto my-6"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/35 flex items-center justify-center mb-6" id="error-badge">
          <ShieldAlert className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="font-display font-black text-xl md:text-2xl text-red-400 uppercase tracking-tight text-center">
          {t.errorTitle}
        </h2>
        <div className="p-4 rounded-2xl bg-black/50 border border-zinc-900 font-mono text-zinc-400 text-xs leading-relaxed my-4 text-center w-full" id="error-diagnostic-details">
          {t.errorDescLine1}
        </div>
        
        <button
          id="btn-error-simulation-reset"
          onClick={onReset}
          className="w-full mt-4 font-mono font-bold text-[10px] py-4 rounded-xl uppercase tracking-wider bg-red-500 text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/10"
        >
          <RefreshCw className="w-3.5 h-3.5 text-white" />
          {t.errorAction}
        </button>
      </motion.div>
    );
  }

  // 3. SUCCESS WIREFRAME STATE
  if (state === 'success') {
    return (
      <motion.div 
        id="simulation-success-view"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[50vh] flex flex-col justify-center items-center p-8 border rounded-[36px] bg-gradient-to-b from-[#C7FF2E]/5 to-black/95 border-[#C7FF2E]/20 backdrop-blur-md text-left max-w-xl mx-auto my-6"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#C7FF2E]/10 border border-[#C7FF2E]/35 flex items-center justify-center mb-6 animate-bounce" id="success-badge">
          <CheckCircle2 className="w-7 h-7 text-[#C7FF2E]" />
        </div>
        <h2 className="font-display font-black text-xl md:text-2xl text-white uppercase tracking-tight text-center">
          {t.successTitle}
        </h2>
        <div className="p-4 rounded-2xl bg-black/50 border border-zinc-900 font-mono text-[#C7FF2E] text-xs leading-relaxed my-4 text-center w-full" id="success-diagnostic-details">
          {t.successDescLine1}
        </div>
        
        <button
          id="btn-success-simulation-reset"
          onClick={onReset}
          className="w-full mt-4 font-mono font-bold text-[10px] py-4 rounded-xl uppercase tracking-wider bg-[#C7FF2E] text-black hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#C7FF2E]/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-black" />
          {t.successAction}
        </button>
      </motion.div>
    );
  }

  // 4. EMPTY WIREFRAME STATE RENDERERS
  let emptyTitle = "";
  let emptyDesc = "";
  let GraphicIcon = FileText;

  switch (screenId) {
    case 'dashboard':
      emptyTitle = t.emptyDashboardTitle;
      emptyDesc = t.emptyDashboardDesc;
      GraphicIcon = Database;
      break;
    case 'activity':
      emptyTitle = t.emptyActivityTitle;
      emptyDesc = t.emptyActivityDesc;
      GraphicIcon = FileText;
      break;
    case 'insights':
      emptyTitle = t.emptyInsightsTitle;
      emptyDesc = t.emptyInsightsDesc;
      GraphicIcon = AlertTriangle;
      break;
    case 'radar':
      emptyTitle = t.emptyRadarTitle;
      emptyDesc = t.emptyRadarDesc;
      GraphicIcon = Radio;
      break;
    case 'settings':
      emptyTitle = t.emptySettingsTitle;
      emptyDesc = t.emptySettingsDesc;
      GraphicIcon = FileText;
      break;
    case 'paywall':
      emptyTitle = t.emptySettingsTitle;
      emptyDesc = t.emptySettingsDesc;
      GraphicIcon = FileText;
      break;
    default:
      emptyTitle = "Data Node offline";
      emptyDesc = "No structural properties to parse.";
  }

  return (
    <motion.div
      id={`empty-state-${screenId}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="min-h-[55vh] flex flex-col justify-center items-center py-10 px-6 border border-dashed rounded-[36px] bg-zinc-950/40 border-zinc-800 text-center max-w-xl mx-auto my-4 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C7FF2E]/5 rounded-full blur-[48px] pointer-events-none" />
      
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-500" id="empty-state-icon">
        <GraphicIcon className="w-6 h-6 text-[#C7FF2E]" />
      </div>
 
      <div className="space-y-3 z-10" id="empty-state-labels">
        <h3 className="font-display font-extrabold text-xl tracking-tight text-white uppercase">
          {emptyTitle}
        </h3>
        <p className="text-xs leading-relaxed font-sans text-zinc-400 max-w-sm mx-auto">
          {emptyDesc}
        </p>
      </div>

      {screenId === 'dashboard' && (
        <button
          id="btn-empty-deploy-buffer"
          onClick={onReset}
          className="mt-8 font-mono font-bold text-[10px] px-6 py-3.5 rounded-xl uppercase tracking-wider bg-[#C7FF2E] text-black hover:bg-white transition-all cursor-pointer shadow-md shadow-[#C7FF2E]/15 font-bold"
        >
          {lang === 'en' ? "Consolidate Mock Capital Buffer" : "สตรีมสมทบกองคลังสำรองเริ่มต้น"}
        </button>
      )}

      {screenId !== 'dashboard' && (
        <button
          id="btn-empty-return-normal"
          onClick={onReset}
          className="mt-8 font-mono font-bold text-[10px] px-6 py-3.5 rounded-xl border border-zinc-700 uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer hover:bg-zinc-900"
        >
          {lang === 'en' ? "Back to Normal Workspace" : "กลับสู่หน้ากระดาษจารึกปกติ"}
        </button>
      )}
    </motion.div>
  );
}
