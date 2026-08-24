import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Info,
  Pencil,
  Wallet,
  CreditCard,
  Target,
  Grid3X3,
  Settings,
  HelpCircle,
  Power,
  ChevronRight,
  Filter,
  Plus,
  Trash2,
  Fingerprint,
  LockKeyhole,
  Download,
  Share2,
  FileText,
  AlertTriangle,
  Bell,
  Languages,
} from 'lucide-react';
import { UserProfile } from '../types';
import { translations, Language } from '../data/translations';
import { loadRules, addRule, deleteRule } from '../services/ruleEngine';
import type { TxRule } from '../services/ruleEngine';
import { haptics } from '../services/hapticService';
import {
  isLockEnabled,
  setPin as saveLockPin,
  disableLock,
  biometricAvailable,
  registerBiometric,
  removeBiometric,
  hasBiometric,
} from '../services/appLockService';
import { buildExport, downloadExport } from '../services/dataExportService';
import { loadTransactions, dbTransactionsToActivityTx } from '../services/transactionService';
import { shareApp } from '../services/shareService';
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from '../services/pushService';
import { supabase } from '../supabaseClient';

const RULE_CATEGORIES = ['Food', 'Transportation', 'Bills', 'Shopping', 'Health', 'Investment', 'Entertainment'];

interface ProfileSettingsPageProps {
  profile: UserProfile;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  onLogout: () => void;
  onNavigateToUpgrade: () => void;
  onNavigateToBalance?: () => void;
  onNavigateToCardDetails?: () => void;
  onNavigateToMyPlan?: () => void;
  onNavigateToMyCards?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToHelp?: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

const MENU_ITEMS_EN = [
  { label: 'My Balance', icon: Wallet, action: 'balance' },
  { label: 'Card Details', icon: CreditCard, action: 'cardDetails' },
  { label: 'My Plan', icon: Target, action: 'myPlan' },
  { label: 'My Cards', icon: Grid3X3, action: 'myCards' },
  { label: 'Control Center', icon: Settings, action: 'settings' },
  { label: 'Help & Support', icon: HelpCircle, action: 'help' },
];

const MENU_ITEMS_TH = [
  { label: 'ยอดเงินของฉัน', icon: Wallet, action: 'balance' },
  { label: 'รายละเอียดบัตร', icon: CreditCard, action: 'cardDetails' },
  { label: 'แพลนของฉัน', icon: Target, action: 'myPlan' },
  { label: 'บัตรของฉัน', icon: Grid3X3, action: 'myCards' },
  { label: 'ศูนย์ควบคุม', icon: Settings, action: 'settings' },
  { label: 'ช่วยเหลือ', icon: HelpCircle, action: 'help' },
];

export default function ProfileSettingsPage({
  profile,
  onUpdateProfile,
  onLogout,
  onNavigateToUpgrade,
  onNavigateToBalance,
  onNavigateToCardDetails,
  onNavigateToMyPlan,
  onNavigateToMyCards,
  onNavigateToSettings,
  onNavigateToHelp,
  lang,
  setLang,
}: ProfileSettingsPageProps) {
  const t = translations[lang];
  const menuItems = lang === 'en' ? MENU_ITEMS_EN : MENU_ITEMS_TH;

  // ── Transaction rules manager (#6c) ──
  const [rules, setRules] = useState<TxRule[]>([]);
  const [newPattern, setNewPattern] = useState('');
  const [newRuleCat, setNewRuleCat] = useState(RULE_CATEGORIES[0]);

  useEffect(() => { loadRules().then(setRules); }, []);

  const handleAddRule = async () => {
    if (newPattern.trim().length < 2) return;
    haptics.fire('SELECT');
    const created = await addRule(newPattern.trim(), newRuleCat);
    if (created) {
      setRules(prev => [...prev, created]);
      setNewPattern('');
    }
  };

  const handleDeleteRule = async (id: string) => {
    haptics.fire('THUD');
    if (await deleteRule(id)) setRules(prev => prev.filter(r => r.id !== id));
  };

  // ── Security & Data (App Lock / Share / Export / Delete) ──
  const [lockEnabled, setLockEnabled] = useState(isLockEnabled());
  const [bioOk, setBioOk] = useState(false);
  const [bioOn, setBioOn] = useState(hasBiometric());
  const [pinModal, setPinModal] = useState<null | 'setup' | 'setup2' | 'disable'>(null);
  const [pinFirst, setPinFirst] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [toast, setToast] = useState('');
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Push alerts (P1-10) — mirrors the toggle from the legacy ProfilePage
  const [pushOk, setPushOk] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => { biometricAvailable().then(setBioOk); }, []);

  useEffect(() => {
    if (!isPushSupported()) return;
    setPushOk(true);
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setPushOn(!!sub))
      .catch(() => {});
  }, []);

  const handleTogglePush = async () => {
    haptics.fire('SELECT');
    setPushBusy(true);
    try {
      if (!pushOn) {
        const ok = await subscribeToPush();
        setPushOn(ok);
        flashToast(ok
          ? (lang === 'en' ? 'Push alerts enabled' : 'เปิดการแจ้งเตือนแล้ว')
          : (lang === 'en' ? 'Could not enable push' : 'เปิดการแจ้งเตือนไม่สำเร็จ'));
      } else {
        const ok = await unsubscribeFromPush();
        if (ok) setPushOn(false);
        flashToast(ok
          ? (lang === 'en' ? 'Push alerts off' : 'ปิดการแจ้งเตือนแล้ว')
          : (lang === 'en' ? 'Could not disable push' : 'ปิดการแจ้งเตือนไม่สำเร็จ'));
      }
    } finally {
      setPushBusy(false);
    }
  };

  const flashToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2600);
  };

  const closePinModal = () => {
    setPinModal(null);
    setPinInput('');
    setPinFirst('');
    setPinError('');
  };

  const submitPin = async () => {
    if (!/^\d{4}$/.test(pinInput)) {
      setPinError(lang === 'th' ? 'กรอกตัวเลข 4 หลัก' : 'Enter exactly 4 digits');
      return;
    }
    if (pinModal === 'setup') {
      haptics.fire('SELECT');
      setPinFirst(pinInput);
      setPinInput('');
      setPinError('');
      setPinModal('setup2');
      return;
    }
    if (pinModal === 'setup2') {
      if (pinInput !== pinFirst) {
        haptics.fire('THUD');
        setPinError(lang === 'th' ? 'PIN ไม่ตรงกัน' : "PINs don't match");
        setPinInput('');
        return;
      }
      await saveLockPin(pinInput);
      haptics.fire('LOCK_CONFIRM');
      setLockEnabled(true);
      closePinModal();
      flashToast(lang === 'th' ? 'เปิดล็อกแอปแล้ว' : 'App lock enabled');
      return;
    }
    // disable
    if (await disableLock(pinInput)) {
      haptics.fire('SELECT');
      setLockEnabled(false);
      setBioOn(false);
      removeBiometric();
      closePinModal();
      flashToast(lang === 'th' ? 'ปิดล็อกแอปแล้ว' : 'App lock disabled');
    } else {
      haptics.fire('THUD');
      setPinError(lang === 'th' ? 'PIN ไม่ถูกต้อง' : 'Incorrect PIN');
      setPinInput('');
    }
  };

  const toggleBiometric = async () => {
    haptics.fire('SELECT');
    if (bioOn) {
      removeBiometric();
      setBioOn(false);
      return;
    }
    const ok = await registerBiometric(profile.email || 'pickswise@local');
    setBioOn(ok && hasBiometric());
    flashToast(ok
      ? (lang === 'th' ? 'ลงทะเบียนไบโอเมตริกสำเร็จ' : 'Biometric registered')
      : (lang === 'th' ? 'ไม่สามารถลงทะเบียนได้' : 'Registration failed'));
  };

  const handleExportData = async () => {
    haptics.fire('SELECT');
    try {
      const dbTxs = await loadTransactions();
      const payload = await buildExport(profile, dbTxs.length > 0 ? dbTransactionsToActivityTx(dbTxs) : []);
      downloadExport(payload);
      flashToast(lang === 'th' ? 'ดาวน์โหลดข้อมูลแล้ว' : 'Export downloaded');
    } catch {
      flashToast(lang === 'th' ? 'ส่งออกไม่สำเร็จ' : 'Export failed');
    }
  };

  const handleShare = async () => {
    haptics.fire('SELECT');
    const result = await shareApp(window.location.origin + '/dashboard');
    flashToast(result === 'copied'
      ? (lang === 'th' ? 'คัดลอกลิงก์แล้ว' : 'Link copied')
      : result === 'shared' ? '' : (lang === 'th' ? 'แชร์ไม่สำเร็จ' : 'Share failed'));
  };

  const handleDeleteAccount = async () => {
    if (!deleteArmed) {
      haptics.fire('THUD');
      setDeleteArmed(true);
      window.setTimeout(() => setDeleteArmed(false), 5000);
      return;
    }
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account', { body: {} });
      if (error) throw error;
      flashToast(lang === 'th' ? 'ลบบัญชีแล้ว ขอบคุณที่ใช้ PicksWise' : 'Account deleted — thanks for using PicksWise');
      window.setTimeout(() => onLogout(), 1200);
    } catch {
      haptics.fire('THUD');
      flashToast(lang === 'th'
        ? 'ยังไม่พร้อมใช้งาน — โปรดติดต่อ privacy@pickswise.app'
        : 'Not available yet — contact privacy@pickswise.app');
    } finally {
      setDeleting(false);
      setDeleteArmed(false);
    }
  };

  const handleMenuClick = (action: string) => {
    switch (action) {
      case 'balance':
        onNavigateToBalance?.();
        break;
      case 'cardDetails':
        onNavigateToCardDetails?.();
        break;
      case 'myPlan':
        onNavigateToMyPlan?.();
        break;
      case 'myCards':
        onNavigateToMyCards?.();
        break;
      case 'settings':
        onNavigateToSettings?.();
        break;
      case 'help':
        onNavigateToHelp?.();
        break;
    }
  };

  return (
    <div id="settings-viewport" className="space-y-0 min-h-screen bg-white text-left pb-[max(112px,calc(env(safe-area-inset-bottom,0px)+96px))]">
      
      {/* Light Header */}
      <div id="profile-header" className="bg-white px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-6 border-b border-zinc-200">
        {/* Header Row: Back + Title + Info */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => window.history.back()}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-zinc-100 text-zinc-900 active:scale-95 transition-colors"
            aria-label={t.commonGoBack}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display font-extrabold text-lg text-zinc-900 tracking-tight">
            {t.profileTitle}
          </h2>
          <button
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-zinc-100 text-zinc-900 active:scale-95 transition-colors"
            aria-label={t.commonInfo}
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div id="profile-card" className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0FB0CE] to-[#1786C2] flex items-center justify-center overflow-hidden">
              {profile.name && profile.name.length > 0 ? (
                <span className="text-xl font-extrabold text-black font-display">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="text-xl font-extrabold text-black font-display">P</span>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#0FB0CE] rounded-full border-2 border-white" />
          </div>

          {/* Name & Email */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-zinc-900 font-display font-extrabold text-base truncate">
                {profile.name || t.profileDefaultsName}
              </h3>
              {/* P2-8: Set up complete badge — always visible by default */}
              {profile.email && (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200"
                  aria-label={t.profileSetupComplete}
                >
                  <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{lang === 'en' ? 'Verified' : 'ยืนยันแล้ว'}</span>
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs truncate mt-0.5">{profile.email || 'your@email.com'}</p>
          </div>

          {/* Edit Button */}
          <button
            id="btn-edit-profile"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-zinc-100 text-zinc-900 flex-shrink-0 hover:bg-zinc-200 active:scale-95 transition-colors"
            aria-label={t.profileEditProfileAria}
            onClick={() => {
              const name = prompt(t.profileEditNamePrompt, profile.name);
              const email = prompt(t.profileEditEmailPrompt, profile.email);
              if (name !== null && email !== null) {
                onUpdateProfile({ name: name.trim(), email: email.trim() });
              }
            }}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings List */}
      <div id="settings-list-container" className="px-4 pt-4 pb-8">
        <div id="settings-list" className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-zinc-200">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.action}
                onClick={() => handleMenuClick(item.action)}
                className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-zinc-50 active:bg-zinc-100 transition-colors text-left min-h-[44px] ${
                  index < menuItems.length - 1 ? 'border-b border-zinc-100' : ''
                }`}
              >
                {/* Icon Circle */}
                <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-zinc-700" />
                </div>
                {/* Label */}
                <span className="flex-1 text-sm font-semibold text-zinc-900 font-display">
                  {item.label}
                </span>
                {/* Chevron */}
                <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* ── Transaction Rules (#6c) ── */}
        <div className="mt-3 bg-white rounded-[28px] shadow-sm border border-zinc-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-zinc-700" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              {lang === 'en' ? 'Transaction Rules' : 'กฎจัดหมวดหมู่อัตโนมัติ'}
            </h4>
          </div>
          <p className="text-xs text-zinc-500 mb-3">
            {lang === 'en'
              ? 'Transactions containing these words are auto-categorized on entry and CSV import.'
              : 'รายการที่มีคำเหล่านี้จะถูกจัดหมวดหมู่อัตโนมัติ ทั้งกรอกมือและนำเข้าไฟล์'}
          </p>
          {rules.length > 0 && (
            <ul className="mb-3 space-y-1.5">
              {rules.map(r => (
                <li key={r.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 text-xs">
                  <span className="text-zinc-900 font-medium truncate mr-2">“{r.pattern}”</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">{r.category}</span>
                    <button onClick={() => handleDeleteRule(r.id)} aria-label="Delete rule" className="min-w-[28px] min-h-[28px] flex items-center justify-center rounded-full hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. starbucks' : 'เช่น เซเว่น'}
              maxLength={100}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-zinc-100 text-xs outline-none focus:ring-2 focus:ring-emerald-300"
            />
            <select
              value={newRuleCat}
              onChange={(e) => setNewRuleCat(e.target.value)}
              className="px-2 py-2 rounded-xl bg-zinc-100 text-xs outline-none"
            >
              {RULE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={handleAddRule}
              disabled={newPattern.trim().length < 2}
              className="w-10 min-w-[40px] min-h-[36px] rounded-xl bg-[#0FB0CE] text-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
              aria-label="Add rule"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Security & Data (Platform & Access + Compliance) ── */}
        <div className="mt-3 bg-white rounded-[28px] shadow-sm border border-zinc-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <LockKeyhole className="w-4 h-4 text-zinc-700" />
            <h4 className="text-sm font-semibold text-zinc-900 font-display">
              {lang === 'en' ? 'Security & Data' : 'ความปลอดภัยและข้อมูล'}
            </h4>
          </div>

          {/* App Lock toggle */}
          <button
            onClick={() => {
              haptics.fire('SELECT');
              if (lockEnabled) { setPinModal('disable'); }
              else { setPinModal('setup'); setPinError(''); }
            }}
            className="w-full flex items-center justify-between py-3 min-h-[44px] text-left"
          >
            <span>
              <span className="block text-xs font-semibold text-zinc-900">
                {lang === 'en' ? 'App Lock (PIN)' : 'ล็อกแอปด้วย PIN'}
              </span>
              <span className="block text-[11px] text-zinc-500 mt-0.5">
                {lang === 'en'
                  ? lockEnabled ? 'On — locks after 5 min idle' : 'Require a PIN to open the app'
                  : lockEnabled ? 'เปิดอยู่ — ล็อกหลังไม่ใช้ 5 นาที' : 'ต้องกรอก PIN ก่อนเข้าใช้แอป'}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`w-11 h-7 rounded-full relative transition-colors shrink-0 ${lockEnabled ? 'bg-[#0FB0CE]' : 'bg-zinc-300'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${lockEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </span>
          </button>

          {/* Biometric (only when supported) */}
          {bioOk && (
            <button
              onClick={toggleBiometric}
              disabled={!lockEnabled}
              className="w-full flex items-center justify-between py-3 min-h-[44px] text-left disabled:opacity-40"
            >
              <span className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-zinc-700" />
                <span className="text-xs font-semibold text-zinc-900">
                  {lang === 'en' ? 'Unlock with biometrics' : 'ปลดล็อกด้วยไบโอเมตริก'}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`w-11 h-7 rounded-full relative transition-colors shrink-0 ${bioOn ? 'bg-[#0FB0CE]' : 'bg-zinc-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${bioOn ? 'translate-x-6' : 'translate-x-1'}`} />
              </span>
            </button>
          )}

          <div className="border-t border-zinc-100 my-2" />

          {/* Language (P1-10) */}
          <div className="w-full flex items-center justify-between py-3 min-h-[44px]">
            <span className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-zinc-700" />
              <span className="text-xs font-semibold text-zinc-900">
                {lang === 'en' ? 'Language' : 'ภาษา'}
              </span>
            </span>
            <div className="flex rounded-xl bg-zinc-100 p-0.5" role="group" aria-label="Language">
              {(['en', 'th'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => { haptics.fire('SELECT'); setLang(l); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    lang === l ? 'bg-white shadow text-zinc-900' : 'text-zinc-500'
                  }`}
                  aria-pressed={lang === l}
                >
                  {l === 'en' ? 'EN' : 'ไทย'}
                </button>
              ))}
            </div>
          </div>

          {/* Push alerts toggle (P1-10) — only when the browser supports web push */}
          {pushOk && (
            <button
              onClick={handleTogglePush}
              disabled={pushBusy}
              className="w-full flex items-center justify-between py-3 min-h-[44px] text-left disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-zinc-700" />
                <span>
                  <span className="block text-xs font-semibold text-zinc-900">
                    {lang === 'en' ? 'Push alerts' : 'การแจ้งเตือนแบบพุช'}
                  </span>
                  <span className="block text-[11px] text-zinc-500 mt-0.5">
                    {lang === 'en'
                      ? pushOn ? 'On — bills, budgets & insights' : 'Get notified about bills and budgets'
                      : pushOn ? 'เปิดอยู่ — บิล งบประมาณ และข้อมูลเชิงลึก' : 'แจ้งเตือนบิลครบกำหนดและงบประมาณ'}
                  </span>
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`w-11 h-7 rounded-full relative transition-colors shrink-0 ${pushOn ? 'bg-[#0FB0CE]' : 'bg-zinc-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${pushOn ? 'translate-x-6' : 'translate-x-1'}`} />
              </span>
            </button>
          )}

          {/* Export / Share / Delete */}
          <button onClick={handleExportData} className="w-full flex items-center gap-3 py-3 min-h-[44px] text-left">
            <Download className="w-4 h-4 text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-900 flex-1">
              {lang === 'en' ? 'Export my data (JSON)' : 'ส่งออกข้อมูลของฉัน (JSON)'}
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </button>

          <button onClick={handleShare} className="w-full flex items-center gap-3 py-3 min-h-[44px] text-left">
            <Share2 className="w-4 h-4 text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-900 flex-1">
              {lang === 'en' ? 'Share PicksWise' : 'แชร์ PicksWise'}
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </button>

          {/* Legal links */}
          <a href="/privacy" className="flex items-center gap-3 py-3 min-h-[44px]">
            <FileText className="w-4 h-4 text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-900 flex-1">
              {lang === 'en' ? 'Privacy Policy' : 'นโยบายความเป็นส่วนตัว'}
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </a>
          <a href="/terms" className="flex items-center gap-3 py-3 min-h-[44px]">
            <FileText className="w-4 h-4 text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-900 flex-1">
              {lang === 'en' ? 'Terms of Service' : 'ข้อกำหนดการใช้บริการ'}
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </a>

          <div className="border-t border-zinc-100 my-2" />

          {/* Delete account — two-tap confirm */}
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className={`w-full flex items-center gap-3 py-3 px-3 rounded-xl min-h-[44px] transition-colors ${
              deleteArmed ? 'bg-red-50' : ''
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${deleteArmed ? 'text-red-600' : 'text-red-400'}`} />
            <span className={`text-xs font-bold flex-1 ${deleteArmed ? 'text-red-600' : 'text-red-500'}`}>
              {deleting
                ? (lang === 'en' ? 'Deleting…' : 'กำลังลบ…')
                : deleteArmed
                  ? (lang === 'en' ? 'Tap again to permanently delete' : 'แตะอีกครั้งเพื่อลบถาวร')
                  : (lang === 'en' ? 'Delete account & all data' : 'ลบบัญชีและข้อมูลทั้งหมด')}
            </span>
          </button>
        </div>

        {/* Log Out Button */}
        <div className="mt-3">
          <button
            id="btn-logout-settings"
            data-testid="logout-button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-[28px] shadow-sm border border-zinc-200 hover:bg-amber-50 active:bg-amber-100 transition-colors text-left min-h-[44px]"
          >
            {/* Icon Circle */}
            <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Power className="w-4 h-4 text-white" />
            </div>
            {/* Label */}
            <span className="flex-1 text-sm font-semibold text-[#D97706] font-display">
              {t.profileLogOut}
            </span>
            {/* Chevron */}
            <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
          </button>
        </div>



        {/* Disclaimer (Compliance) */}
        <p className="text-center text-zinc-400 text-[10px] mt-6 px-6 leading-relaxed">
          {lang === 'en'
            ? 'PicksWise is a personal finance tracker. Content is for informational purposes only and is not financial advice.'
            : 'PicksWise เป็นเครื่องมือจัดการการเงินส่วนบุคคล เนื้อหาในแอปใช้เพื่อการศึกษา ไม่ใช่คำแนะนำทางการเงิน'}
        </p>

        {/* App Version */}
        <p className="text-center text-zinc-400 text-[10px] font-mono mt-2">
          PicksWise v1.0.0 &nbsp;·&nbsp; © 2026
        </p>
      </div>

      {/* PIN modal */}
      {pinModal && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={closePinModal} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md bg-white rounded-t-3xl p-5 pb-[max(20px,env(safe-area-inset-bottom))]"
          >
            <h3 className="text-base font-bold font-display text-zinc-900 mb-1">
              {pinModal === 'disable'
                ? (lang === 'en' ? 'Enter your PIN to disable' : 'กรอก PIN เพื่อปิดล็อก')
                : pinModal === 'setup'
                  ? (lang === 'en' ? 'Set a 4-digit PIN' : 'ตั้ง PIN 4 หลัก')
                  : (lang === 'en' ? 'Confirm your PIN' : 'ยืนยัน PIN อีกครั้ง')}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              {lang === 'en' ? 'Stored only on this device.' : 'เก็บไว้บนอุปกรณ์นี้เท่านั้น'}
            </p>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && submitPin()}
              className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-xl bg-zinc-100 outline-none focus:ring-2 focus:ring-[#0FB0CE]"
              autoFocus
            />
            {pinError && <p className="text-xs text-red-500 mt-2">{pinError}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={closePinModal}
                className="flex-1 py-3 rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-700 active:scale-95 transition-transform min-h-[44px]">
                {lang === 'en' ? 'Cancel' : 'ยกเลิก'}
              </button>
              <button onClick={submitPin} disabled={pinInput.length !== 4}
                className="flex-1 py-3 rounded-xl bg-[#0FB0CE] text-sm font-bold text-white active:scale-95 transition-transform disabled:opacity-40 min-h-[44px]">
                {(lang === 'en' ? 'Confirm' : 'ยืนยัน')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[85] px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg"
          style={{ backgroundColor: '#071838', color: '#E0F2FC' }}
          role="status"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}
