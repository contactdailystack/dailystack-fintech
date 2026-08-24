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
} from 'lucide-react';
import { UserProfile } from '../types';
import { translations, Language } from '../data/translations';

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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56be89] to-[#9BE800] flex items-center justify-center overflow-hidden">
              {profile.name && profile.name.length > 0 ? (
                <span className="text-xl font-extrabold text-black font-display">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="text-xl font-extrabold text-black font-display">P</span>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#56be89] rounded-full border-2 border-white" />
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



        {/* App Version */}
        <p className="text-center text-zinc-400 text-[10px] font-mono mt-6">
          PicksWise v1.0.0 &nbsp;·&nbsp; © 2026
        </p>
      </div>
    </div>
  );
}
