/**
 * ============================================================
 * DailyStack — Profile Page v10.0
 * ============================================================
 * Rocket Money / Apple iOS Style Profile Layout
 * 
 * v10.0 Improvements (from Rocket Money analysis):
 * - iOS-style Header with logo center + settings + notifications
 * - Avatar with inline edit button
 * - Setup Progress Banner (1/6)
 * - Account cards with icon circles + value + chevron
 * - iOS tab bar navigation style
 */

import {
  ArrowRight,
  Camera,
  Crown,
  Pencil,
  Wallet,
  CreditCard,
  Bell,
  BellRing,
  Shield,
  Moon,
  HelpCircle,
  LogOut,
  Globe,
  X,
  Trash2,
  Image,
  TrendingUp,
  TrendingDown,
  Settings,
  ChevronDown,
  Building,
  PiggyBank,
  BarChart3,
  User,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { translations, Language } from '../data/translations';
import { haptics } from '../services/hapticService';
import { subscribeToPush, unsubscribeFromPush } from '../services/pushService';

interface ProfilePageProps {
  profile: UserProfile;
  lang: Language;
  totalSubscriptions?: number;
  monthlySpending?: number;
  monthlyBudget?: number;
  activeSubscriptions?: number;
  lastMonthSpending?: number;
  notificationCount?: number;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  onLogout: () => void;
  onNavigateToBalance?: () => void;
  onNavigateToCardDetails?: () => void;
  onNavigateToMyPlan?: () => void;
  onNavigateToMyCards?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToSubscriptions?: () => void;
  onLanguageChange: (lang: Language) => void;
  onAvatarChange?: (avatarUrl: string) => void;
}

// Settings menu items with icons
const SETTINGS_ITEMS_EN = [
  { icon: Wallet, label: 'My Balance', sublabel: 'View your balance', action: 'balance' },
  { icon: CreditCard, label: 'Card Details', sublabel: 'Manage payment methods', action: 'cardDetails' },
  { icon: Bell, label: 'Notifications', sublabel: 'View alerts', action: 'notifications', hasBadge: true },
  { icon: BellRing, label: 'Push Alerts', sublabel: 'Enable device notifications', action: 'push' },
  { icon: Shield, label: 'Privacy & Security', sublabel: 'Manage your data', action: 'privacy' },
];

const SETTINGS_ITEMS_TH = [
  { icon: Wallet, label: 'ยอดเงินของฉัน', sublabel: 'ดูยอดเงินของคุณ', action: 'balance' },
  { icon: CreditCard, label: 'รายละเอียดบัตร', sublabel: 'จัดการวิธีการชำระเงิน', action: 'cardDetails' },
  { icon: Bell, label: 'การแจ้งเตือน', sublabel: 'ดูการแจ้งเตือน', action: 'notifications', hasBadge: true },
  { icon: BellRing, label: 'การแจ้งเตือนอุปกรณ์', sublabel: 'เปิดการแจ้งเตือนบนอุปกรณ์', action: 'push' },
  { icon: Shield, label: 'ความเป็นส่วนตัว', sublabel: 'จัดการข้อมูลของคุณ', action: 'privacy' },
];

// Edit Modal Component
const EditModal = ({ 
  isOpen, 
  onClose, 
  field, 
  value, 
  onSave,
  lang 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  field: 'name' | 'email';
  value: string;
  onSave: (value: string) => void;
  lang: Language;
}) => {
  const [inputValue, setInputValue] = useState(value);
  
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  if (!isOpen) return null;
  
  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#171C15] border border-zinc-800/80 rounded-2xl w-[320px] mx-4 overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
          <h3 className="text-[17px] font-bold text-white" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
            {field === 'name' 
              ? (lang === 'en' ? 'Edit Name' : 'แก้ไขชื่อ')
              : (lang === 'en' ? 'Edit Email' : 'แก้ไขอีเมล')
            }
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <input
            type={field === 'email' ? 'email' : 'text'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={field === 'name' 
              ? (lang === 'en' ? 'Enter your name' : 'ใส่ชื่อของคุณ')
              : (lang === 'en' ? 'Enter your email' : 'ใส่อีเมลของคุณ')
            }
            className="w-full px-4 py-3 bg-[#0B0F0A] border border-zinc-800 rounded-xl text-[15px] text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-[#56be89] focus:border-[#56be89] transition-all"
            style={{ fontFamily: '"Inter", sans-serif' }}
            autoFocus
          />
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full mt-4 py-3 bg-[#56be89] rounded-xl text-[15px] font-semibold text-black hover:bg-[#6fcca3] active:scale-[0.98] transition-all"
            style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
          >
            {lang === 'en' ? 'Save' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Avatar Options Modal
const AvatarOptionsModal = ({ 
  isOpen, 
  onClose, 
  onChangePhoto,
  onDeletePhoto,
  lang 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onChangePhoto: () => void;
  onDeletePhoto: () => void;
  lang: Language;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#171C15] border-t border-zinc-800 rounded-t-3xl w-full max-w-md overflow-hidden" style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-zinc-800 rounded-full" />
        </div>
        
        {/* Title */}
        <h3 className="text-[17px] font-bold text-white text-center pb-4" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
          {lang === 'en' ? 'Profile Photo' : 'รูปโปรไฟล์'}
        </h3>
        
        {/* Options */}
        <div className="pb-8">
          {/* Change Photo */}
          <button
            onClick={() => { haptics.fire('SELECT'); onChangePhoto(); onClose(); }}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/50 active:bg-zinc-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#0B0F0A] flex items-center justify-center">
              <Image className="w-5 h-5 text-[#56be89]" />
            </div>
            <span className="text-[15px] font-medium text-white" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
              {lang === 'en' ? 'Change Photo' : 'เปลี่ยนรูป'}
            </span>
          </button>
          
          {/* Delete Photo */}
          <button
            onClick={() => { haptics.fire('SELECT'); onDeletePhoto(); onClose(); }}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/50 active:bg-zinc-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-950/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[15px] font-medium text-red-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
              {lang === 'en' ? 'Remove Photo' : 'ลบรูป'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper: deterministic emoji from name string
const getAvatarEmoji = (name: string): string => {
  const emojis = ['😀','😎','🥳','🤩','😇','🌟','💫','✨','🔥','💪','🧡','💚','💙','💜','🩷'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return emojis[Math.abs(hash) % emojis.length];
};

export default function ProfilePage({
  profile,
  lang,
  totalSubscriptions = 0,
  monthlySpending = 0,
  monthlyBudget = 5000,
  activeSubscriptions = 0,
  lastMonthSpending = 0,
  notificationCount = 0,
  onUpdateProfile,
  onLogout,
  onNavigateToBalance,
  onNavigateToCardDetails,
  onNavigateToMyPlan,
  onNavigateToMyCards,
  onNavigateToNotifications,
  onNavigateToPrivacy,
  onNavigateToSubscriptions,
  onLanguageChange,
  onAvatarChange,
}: ProfilePageProps) {
  
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('userAvatar') || profile.avatarUrl || '';
  });
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editField, setEditField] = useState<'name' | 'email'>('name');
  const [avatarOptionsOpen, setAvatarOptionsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsItems = lang === 'en' ? SETTINGS_ITEMS_EN : SETTINGS_ITEMS_TH;
  
  // Fade-in animation
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Calculate trend
  const spendingTrend = lastMonthSpending > 0 
    ? ((monthlySpending - lastMonthSpending) / lastMonthSpending) * 100 
    : 0;
  const trendUp = spendingTrend > 0;
  
  const getCurrentPlanLabel = (): string => {
    const labels: Record<string, string> = {
      basic: 'Plan Basic',
      pro: 'Plan Pro',
      elite: 'Plan Elite'
    };
    return labels[profile.plan] || 'Plan Basic';
  };

  // Generate avatar initial based on name (accessibility-safe, no emoji)
  const getAvatarInitial = (name: string): string => {
    return name.trim().charAt(0).toUpperCase() || 'U';
  };

  const handleEditClick = (field: 'name' | 'email') => {
    haptics.fire('SELECT');
    setEditField(field);
    setEditModalOpen(true);
  };
  
  const handleSaveEdit = (value: string) => {
    haptics.fire('DEEP_RESONANCE');
    onUpdateProfile({ [editField]: value });
  };
  
  const handleSettingsClick = (action: string) => {
    haptics.fire('SELECT');
    switch (action) {
      case 'balance': onNavigateToBalance?.(); break;
      case 'cardDetails': onNavigateToCardDetails?.(); break;
      case 'myPlan': onNavigateToMyPlan?.(); break;
      case 'notifications': onNavigateToNotifications?.(); break;
      case 'privacy': onNavigateToPrivacy?.(); break;
      case 'push': void handlePushToggle(); break;
    }
  };

  const handlePushToggle = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const ok = await unsubscribeFromPush();
      alert(lang === 'en'
        ? (ok ? 'Push alerts disabled' : 'Could not disable push alerts')
        : (ok ? 'ปิดการแจ้งเตือนอุปกรณ์แล้ว' : 'ไม่สามารถปิดการแจ้งเตือนได้'));
    } else {
      const ok = await subscribeToPush();
      alert(lang === 'en'
        ? (ok ? 'Push alerts enabled!' : 'Push alerts unavailable — permission denied or not supported')
        : (ok ? 'เปิดการแจ้งเตือนอุปกรณ์แล้ว!' : 'ไม่สามารถเปิดการแจ้งเตือนได้ — ถูกปฏิเสธหรือเบราว์เซอร์ไม่รองรับ'));
    }
  };
  
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      haptics.fire('ERROR_REJECT');
      alert(lang === 'en' ? 'Image must be less than 2MB' : 'รูปภาพต้องมีขนาดไม่เกิน 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      haptics.fire('ERROR_REJECT');
      alert(lang === 'en' ? 'Please select an image file' : 'กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAvatarUrl(base64);
      localStorage.setItem('userAvatar', base64);
      onAvatarChange?.(base64);
      haptics.fire('DEEP_RESONANCE');
    };
    reader.readAsDataURL(file);
  };
  
  const handleAvatarOptions = () => {
    haptics.fire('SELECT');
    setAvatarOptionsOpen(true);
  };
  
  const handleDeleteAvatar = () => {
    haptics.fire('DEEP_RESONANCE');
    setAvatarUrl('');
    localStorage.removeItem('userAvatar');
    onAvatarChange?.('');
  };

  const t = translations[lang];

  return (
    <div className={`min-h-screen bg-[#0B0F0A] text-white transition-opacity duration-500 pb-24 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

      {/* Header - Rocket Money iOS Style */}
      <div className="bg-[#171C15] px-4 pt-12 pb-4 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          {/* Left: Settings */}
          <button 
            onClick={() => { haptics.fire('SELECT'); }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-800/50 active:scale-95 transition-all"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>

          {/* Center: Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#56be89] flex items-center justify-center">
              <span className="text-black font-bold text-sm" style={{ fontFamily: '"Kanit", sans-serif' }}>PS</span>
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: '"Kanit", sans-serif' }}>
              PicksWise
            </span>
          </div>

          {/* Right: Notifications */}
          <button 
            onClick={() => { haptics.fire('SELECT'); onNavigateToNotifications?.(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-800/50 active:scale-95 transition-all relative"
          >
            <Bell className="w-6 h-6 text-white" />
            {/* Notification Badge */}
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Profile Card - Avatar + Info */}
      <div className="bg-[#0B0F0A] px-6 pb-6">
        <div className="flex flex-col items-center pt-2">
          {/* Avatar Button - Memoji-style with ring glow */}
          <button
            onClick={handleAvatarOptions}
            className="relative p-3 -m-3 active:scale-95 transition-transform animate-fade-in"
          >
            {/* Outer glow ring */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#56be89]/20 to-[#7FFF00]/10 blur-lg" />
              
              {/* Avatar Container */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-[#56be89]/50 ring-offset-4 ring-offset-[#0B0F0A]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  /* Memoji-style placeholder with gradient face */
                  <div className="w-full h-full relative overflow-hidden">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2a3f2a] via-[#1a2a1a] to-[#0B0F0A]" />
                    
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-[#56be89]/30" />
                      <div className="absolute top-6 right-4 w-3 h-3 rounded-full bg-[#56be89]/20" />
                      <div className="absolute bottom-4 left-6 w-2 h-2 rounded-full bg-[#56be89]/25" />
                    </div>
                    
                    {/* Avatar initial with emoji style */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                        {profile.name && profile.name.length > 0 ? getAvatarEmoji(profile.name) : '😊'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
              
            {/* Camera icon badge */}
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#171C15] border-2 border-[#0B0F0A] flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-[#56be89]" />
            </div>
          </button>

          {/* Name - clickable to edit */}
          <button 
            onClick={() => { haptics.fire('SELECT'); handleEditClick('name'); }}
            className="text-xl font-bold text-white text-center mt-4 flex items-center gap-2 active:scale-95 transition-transform"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            {profile.name || (lang === 'en' ? 'Your Name' : 'ชื่อของคุณ')}
            <Pencil className="w-4 h-4 text-zinc-500" />
          </button>
          
          {/* Email - clickable to edit */}
          <p 
            onClick={() => { haptics.fire('SELECT'); handleEditClick('email'); }}
            className="text-sm text-zinc-400 text-center mt-1 cursor-pointer hover:text-zinc-300 transition-colors"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            {profile.email || 'your@email.com'}
          </p>

          {/* Plan Badge - Clickable */}
          <button 
            onClick={() => { haptics.fire('SELECT'); onNavigateToMyPlan?.(); }}
            className="mt-3 px-3 py-1 rounded-full bg-[#56be89] shadow-[0_0_15px_rgba(199,255,46,0.3)] hover:bg-[#6fcca3] active:scale-95 transition-all duration-200"
          >
            <span className="text-xs font-bold text-black" style={{ fontFamily: '"Kanit", sans-serif' }}>
              {getCurrentPlanLabel()}
            </span>
          </button>

          {/* Member Since */}
          <p className="text-xs text-zinc-500 mt-3" style={{ fontFamily: '"Inter", sans-serif' }}>
            {lang === 'en' ? 'Member since Jan 2026' : 'สมาชิกตั้งแต่ ม.ค. 2026'}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-900/80 mx-6" />

      {/* Banking-Style Account Card */}
      <div className="px-6 py-4">
        {totalSubscriptions === 0 ? (
          /* Empty State */
          <div className="bg-[#171C15] border border-zinc-800/40 rounded-[32px] px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900 mx-auto mb-4 flex items-center justify-center border border-zinc-800">
              <Wallet className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="text-lg font-bold text-white mb-2" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
              {lang === 'en' ? 'No subscriptions yet' : 'ยังไม่มีรายการ'}
            </p>
            <p className="text-sm text-zinc-400 mb-4" style={{ fontFamily: '"Inter", sans-serif' }}>
              {lang === 'en' ? 'Add your first subscription to track spending' : 'เพิ่มรายการแรกเพื่อติดตามค่าใช้จ่าย'}
            </p>
            {/* Quick Action Button */}
            <button
              onClick={() => { haptics.fire('SELECT'); onNavigateToSubscriptions?.(); }}
              className="px-6 py-3 bg-[#56be89] rounded-full text-sm font-semibold text-black hover:bg-[#6fcca3] active:scale-95 transition-transform"
              style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
            >
              {lang === 'en' ? '+ Add Subscription' : '+ เพิ่มรายการ'}
            </button>
          </div>
        ) : (
          /* Banking Account Card */
          <div className="relative bg-gradient-to-br from-[#1a2a1a] via-[#171C15] to-[#0f120f] border border-[#56be89]/20 rounded-3xl overflow-hidden">
            {/* Geometric Pattern Background */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#56be89" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Content */}
            <div className="relative px-6 py-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs text-[#56be89]/70 font-medium tracking-wider uppercase" style={{ fontFamily: '"Inter", sans-serif' }}>
                  {lang === 'en' ? 'My Subscriptions' : 'รายการสมัครของฉัน'}
                </span>
                {/* Edit Button */}
                <button 
                  onClick={() => { haptics.fire('SELECT'); onNavigateToSubscriptions?.(); }}
                  className="w-8 h-8 rounded-full bg-[#56be89]/10 flex items-center justify-center hover:bg-[#56be89]/20 active:scale-95 transition-all"
                >
                  <Pencil className="w-4 h-4 text-[#56be89]" />
                </button>
              </div>

              {/* Stats Grid - 2 columns */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Column 1: Monthly Spending */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
                    {lang === 'en' ? 'Monthly' : 'รายเดือน'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#56be89]" style={{ 
                      fontFamily: '"Inter", sans-serif',
                      textShadow: '0 0 20px rgba(86, 190, 137, 0.3)'
                    }}>
                      ฿{monthlySpending.toLocaleString()}
                    </span>
                    {/* Trend Indicator */}
                    {lastMonthSpending > 0 && (
                      <span className={`text-xs font-bold flex items-center gap-0.5 ${trendUp ? 'text-red-400' : 'text-green-400'}`}>
                        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      </span>
                    )}
                  </div>
                </div>

                {/* Column 2: Active Subs */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
                    {lang === 'en' ? 'Active subs' : 'รายการเปิดใช้'}
                  </span>
                  <span className="text-2xl font-bold text-white" style={{ fontFamily: '"Inter", sans-serif' }}>
                    {activeSubscriptions}
                  </span>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="bg-[#0B0F0A]/60 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-zinc-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
                    {lang === 'en' ? 'Budget' : 'งบประมาณ'}
                  </span>
                  <span className="text-xs font-bold" style={{ 
                    color: (monthlySpending / monthlyBudget) > 0.8 ? '#FF6B6B' : '#56be89',
                    fontFamily: '"Inter", sans-serif'
                  }}>
                    {Math.round((monthlySpending / monthlyBudget) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#0B0F0A] rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-[#56be89] to-[#7FFF00] h-2 rounded-full"
                    style={{ width: `${Math.min((monthlySpending / monthlyBudget) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-500" style={{ fontFamily: '"Inter", sans-serif' }}>
                  {lang === 'en' ? 'Remaining: ' : 'คงเหลือ: '}
                  <span className="text-[#56be89]">฿{Math.max(0, monthlyBudget - monthlySpending).toLocaleString()}</span>
                  {' / '}
                  <span>฿{monthlyBudget.toLocaleString()}</span>
                </span>
              </div>

              {/* Bottom row: Total subs */}
              <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                <span className="text-sm text-zinc-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
                  {lang === 'en' ? 'Total subscriptions' : 'รายการทั้งหมด'}
                </span>
                <span className="text-lg font-bold text-white" style={{ fontFamily: '"Inter", sans-serif' }}>
                  {totalSubscriptions}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Informations Section - Two Column Layout */}
      <div className="px-6 py-4">
        <h2 
          className="text-lg font-bold text-white mb-4"
          style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
        >
          {lang === 'en' ? 'Profile Informations' : 'ข้อมูลโปรไฟล์'}
        </h2>
        
        {/* Two-column info card */}
        <div className="bg-[#171C15] border border-zinc-800/40 rounded-2xl overflow-hidden">
          {/* Row 1: Legal Name */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/40">
            <span className="text-sm text-zinc-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
              {lang === 'en' ? 'Legal Name' : 'ชื่อจริง'}
            </span>
            <span className="text-sm text-white font-medium" style={{ fontFamily: '"Inter", sans-serif' }}>
              {profile.name || (lang === 'en' ? 'Not set' : 'ยังไม่ได้ตั้ง')}
            </span>
          </div>
          
          {/* Row 2: Display Name */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/40">
            <span className="text-sm text-zinc-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
              {lang === 'en' ? 'Display Name' : 'ชื่อที่แสดง'}
            </span>
            <span className="text-sm text-white font-medium" style={{ fontFamily: '"Inter", sans-serif' }}>
              {profile.name || (lang === 'en' ? 'Not set' : 'ยังไม่ได้ตั้ง')}
            </span>
          </div>
          
          {/* Row 3: Email */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/40">
            <span className="text-sm text-zinc-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
              Email
            </span>
            <span className="text-sm text-white font-medium" style={{ fontFamily: '"Inter", sans-serif' }}>
              {profile.email || (lang === 'en' ? 'Not set' : 'ยังไม่ได้ตั้ง')}
            </span>
          </div>
          
          {/* Row 4: My Documents */}
          <button 
            onClick={() => { haptics.fire('SELECT'); }}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-zinc-800/40 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm text-zinc-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
              {lang === 'en' ? 'My Documents' : 'เอกสารของฉัน'}
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-500" />
          </button>
          
          {/* Row 5: Connected Partners */}
          <button 
            onClick={() => { haptics.fire('SELECT'); }}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/30 active:bg-zinc-800/50 transition-colors"
          >
            <span className="text-sm text-zinc-400" style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}>
              {lang === 'en' ? 'Connected Partners' : 'พันธมิตรที่เชื่อมต่อ'}
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Settings Menu - Pill Cards */}
      <div className="px-6 pb-4 space-y-3">
        {settingsItems.map((item) => {
          const IconComponent = item.icon;
          const hasBadge = item.hasBadge && notificationCount > 0;
          return (
            <button
              key={item.action}
              onClick={() => { haptics.fire('SELECT'); handleSettingsClick(item.action); }}
              className="w-full flex items-center justify-between bg-[#171C15] hover:bg-zinc-800/60 active:bg-zinc-800 border border-zinc-800/40 rounded-full px-6 py-4 active:scale-[0.98] transition-all"
            >
              {/* Left: Icon + Text */}
              <div className="flex items-center gap-4">
                <div className="relative text-[#56be89]">
                  <IconComponent className="w-5 h-5" />
                  {/* Notification Badge */}
                  {hasBadge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span 
                    className="text-[15px] font-semibold text-white leading-tight"
                    style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
                  >
                    {item.label}
                  </span>
                  <span 
                    className="text-xs text-zinc-400 leading-tight"
                    style={{ fontFamily: '"Inter", sans-serif' }}
                  >
                    {item.sublabel}
                  </span>
                </div>
              </div>
              
              {/* Right: Chevron */}
              <ArrowRight className="w-5 h-5 text-zinc-500" />
            </button>
          );
        })}

        {/* My Plan */}
        <button
          onClick={() => { haptics.fire('SELECT'); onNavigateToMyPlan?.(); }}
          className="w-full flex items-center justify-between bg-[#171C15] hover:bg-zinc-800/60 active:bg-zinc-800 border border-zinc-800/40 rounded-full px-6 py-4 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <Crown className="w-5 h-5 text-yellow-400" />
            <div className="flex flex-col items-start gap-0.5">
              <span 
                className="text-[15px] font-semibold text-white leading-tight"
                style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
              >
                {lang === 'en' ? 'My Plan' : 'แพลนของฉัน'}
              </span>
              <span 
                className="text-xs text-zinc-400 leading-tight"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                {lang === 'en' ? 'Upgrade your subscription' : 'อัปเกรดการสมัครของคุณ'}
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Help & Language - Pill Cards */}
      <div className="px-6 pb-4 space-y-3">
        {/* Help & Support */}
        <button
          onClick={() => { haptics.fire('SELECT'); }}
          className="w-full flex items-center justify-between bg-[#171C15] hover:bg-zinc-800/60 active:bg-zinc-800 border border-zinc-800/40 rounded-full px-6 py-4 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <HelpCircle className="w-5 h-5 text-zinc-400" />
            <div className="flex flex-col items-start gap-0.5">
              <span 
                className="text-[15px] font-semibold text-white leading-tight"
                style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
              >
                {lang === 'en' ? 'Help & Support' : 'ช่วยเหลือ'}
              </span>
              <span 
                className="text-xs text-zinc-400 leading-tight"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                {lang === 'en' ? 'Get help with your account' : 'รับความช่วยเหลือ'}
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-500" />
        </button>

        {/* Language - Pill Toggle */}
        <div className="flex items-center justify-between bg-[#171C15] border border-zinc-800/40 rounded-full px-6 py-3">
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5 text-[#56be89]" />
            <span 
              className="text-[15px] font-semibold text-white leading-tight"
              style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
            >
              {lang === 'en' ? 'Language' : 'ภาษา'}
            </span>
          </div>
          {/* Pill Toggle */}
          <div className="flex rounded-full overflow-hidden bg-zinc-950/80 p-0.5 border border-zinc-800/60">
            <button
              onClick={() => { haptics.fire('SELECT'); onLanguageChange('th'); }}
              className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer rounded-full ${
                lang === 'th' ? 'bg-[#56be89] text-black' : 'bg-transparent text-zinc-500 hover:text-zinc-300'
              }`}
              style={{ fontFamily: '"Kanit", sans-serif' }}
            >
              ไทย
            </button>
            <button
              onClick={() => { haptics.fire('SELECT'); onLanguageChange('en'); }}
              className={`px-4 py-2 text-xs font-bold transition-all cursor-pointer rounded-full ${
                lang === 'en' ? 'bg-[#56be89] text-black' : 'bg-transparent text-zinc-500 hover:text-zinc-300'
              }`}
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              EN
            </button>
          </div>
        </div>

        {/* Dark Mode - Disabled (Coming Soon) */}
        <div className="flex items-center justify-between bg-[#171C15] border border-zinc-800/40 rounded-full px-6 py-4 opacity-50">
          <div className="flex items-center gap-4">
            <Moon className="w-5 h-5 text-zinc-600" />
            <div className="flex flex-col items-start gap-0.5">
              <span 
                className="text-[15px] font-semibold text-zinc-500 leading-tight"
                style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
              >
                {lang === 'en' ? 'Dark Mode' : 'โหมดมืด'}
              </span>
              <span 
                className="text-xs text-zinc-500 leading-tight"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                {lang === 'en' ? 'Coming soon' : 'เร็วๆ นี้'}
              </span>
            </div>
          </div>
          {/* Disabled Toggle */}
          <div className="relative w-12 h-7 rounded-full bg-zinc-850 cursor-not-allowed">
            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-zinc-700 shadow" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-900/80" />

        {/* Logout Button */}
        <button
          onClick={() => { haptics.fire('SELECT'); onLogout(); }}
          className="w-full flex items-center gap-4 px-6 py-4 bg-red-950/10 border border-red-900/30 rounded-full hover:bg-red-950/20 active:scale-[0.98] transition-all"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span 
            className="text-[15px] font-semibold text-red-400"
            style={{ fontFamily: lang === 'th' ? '"Kanit", sans-serif' : '"Inter", sans-serif' }}
          >
            {lang === 'en' ? 'Log out' : 'ออกจากระบบ'}
          </span>
        </button>
      </div>

      {/* App Version */}
      <p className="text-center text-zinc-600 text-xs pb-8" style={{ fontFamily: '"Inter", sans-serif' }}>
        PicksWise v1.0.0 · © 2026
      </p>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        field={editField}
        value={editField === 'name' ? (profile.name || '') : (profile.email || '')}
        onSave={handleSaveEdit}
        lang={lang}
      />

      {/* Avatar Options Modal */}
      <AvatarOptionsModal
        isOpen={avatarOptionsOpen}
        onClose={() => setAvatarOptionsOpen(false)}
        onChangePhoto={() => fileInputRef.current?.click()}
        onDeletePhoto={handleDeleteAvatar}
        lang={lang}
      />
    </div>
  );
}
