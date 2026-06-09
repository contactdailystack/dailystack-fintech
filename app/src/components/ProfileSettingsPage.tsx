import { useState } from 'react';
import {
  User, LogOut, ChevronRight, Crown, Shield
} from 'lucide-react';
import { UserProfile } from '../types';
import { getTierDisplayName } from '../services/userTierService';
import { translations, Language } from '../data/translations';

interface ProfileSettingsPageProps {
  profile: UserProfile;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  onLogout: () => void;
  onNavigateToUpgrade: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export default function ProfileSettingsPage({ 
  profile, 
  onUpdateProfile, 
  onLogout, 
  onNavigateToUpgrade,
  lang,
  setLang
}: ProfileSettingsPageProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  const t = translations[lang];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email });
  };

  return (
    <div id="settings-viewport" className="space-y-6 md:space-y-8 animate-slide-up text-left">
      
      {/* Settings Header */}
      <div id="settings-head" className="text-left">
        <h2 className="font-display font-extrabold text-2xl text-white">{lang === 'en' ? 'Identity & Settings' : 'ข้อมูลพอร์ตและสิทธิส่วนบุคคล'}</h2>
        <p className="text-xs text-zinc-500 font-mono text-left">CREDENTIAL MATRICES & SUBSCRIPTION CHANNELS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="settings-layout-grid">
        
        {/* Left Column: Identity Management Form */}
        <div className="col-span-1 lg:col-span-7 border rounded-[32px] p-6 md:p-8 shadow-sm relative overflow-hidden transition-all duration-300 bg-[#131416]/90 border-[#222428]" id="identity-management-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7FF2E]/5 rounded-bl-[120px] pointer-events-none" />
          
          <h3 className="font-display font-extrabold text-lg mb-6 uppercase tracking-tight flex items-center gap-2 text-white">
            <User className="w-5 h-5 text-[#C7FF2E]" /> {lang === 'en' ? 'Master Credentials' : 'สิทธิ์ผู้ควบคุมพอร์ตเอกสิทธิ์'}
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5" id="profile-edit-form">
            <div className="space-y-1.5" id="field-set-name">
              <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{t.legalName}</label>
              <input
                id="input-set-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="pickky"
                className="w-full border rounded-xl px-4 py-3.5 text-xs focus:outline-none transition-colors bg-[#1A1B1E] border-zinc-900 text-white focus:border-[#C7FF2E]"
              />
            </div>

            <div className="space-y-1.5" id="field-set-email">
              <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest">{t.commsRoute}</label>
              <input
                id="input-set-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pickky.kotchakorn@gmail.com"
                className="w-full border rounded-xl px-4 py-3.5 text-xs focus:outline-none transition-colors bg-[#1A1B1E] border-zinc-900 text-white focus:border-[#C7FF2E]"
              />
            </div>

            <div className="pt-6 border-t flex justify-between items-center border-zinc-800" id="settings-action-bar">
              <button
                id="btn-logout-settings"
                type="button"
                onClick={onLogout}
                className="font-mono text-[10px] text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1.5 cursor-pointer font-bold"
              >
                <LogOut className="w-3.5 h-3.5" /> {t.terminateSession}
              </button>

              <button
                id="btn-save-settings"
                type="submit"
                className="font-display font-extrabold text-[10px] px-6 py-3.5 rounded-xl uppercase tracking-wider hover:scale-[1.01] transition-transform cursor-pointer bg-[#C7FF2E] text-black hover:bg-white"
              >
                {t.commitSpecs}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Dynamic preferences and Premium status card */}
        <div className="col-span-1 lg:col-span-5 space-y-6" id="settings-pricing-sidebar">
          
          {/* Preferences controls card */}
          <div className="border rounded-[32px] p-6 shadow-sm relative overflow-hidden transition-all duration-300 bg-[#131416] border-[#222428] shadow-black/80" id="preferences-card">
            <h3 className="font-display font-bold text-xs uppercase tracking-widest mb-5 text-white">
              {lang === 'en' ? 'APP PREF CONVENTIONS' : 'การตีกรอบความพึงพอใจการแสดงผล'}
            </h3>
            
            <div className="space-y-5" id="pref-controllers">
              {/* Language toggle section */}
              <div className="flex justify-between items-center py-1.5" id="pref-language">
                <div>
                  <h4 className="text-xs font-bold leading-normal text-zinc-300">{lang === 'en' ? 'System Language' : 'สลับภาษาทั้งหมด'}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase">BILINGUAL MULTIPLIER</p>
                </div>
                <div className="flex border rounded-xl overflow-hidden border-zinc-800 bg-[#1A1B1E]" id="lang-switch-box">
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-3 py-1.5 text-[10px] font-bold font-mono transition-colors cursor-pointer ${lang === 'en' ? 'bg-[#C7FF2E] text-black font-extrabold' : 'bg-transparent text-zinc-500 hover:text-zinc-400'}`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('th')}
                    className={`px-3 py-1.5 text-[10px] font-bold font-mono transition-colors cursor-pointer ${lang === 'th' ? 'bg-[#C7FF2E] text-black font-extrabold' : 'bg-transparent text-zinc-500 hover:text-zinc-400'}`}
                  >
                    TH
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Tier display */}
          <div className="border rounded-[32px] p-6 shadow-sm relative overflow-hidden transition-all duration-300 bg-[#131416] border-[#222428] shadow-black/80" id="tier-indicator-card">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] pointer-events-none bg-emerald-500/5" />
            
            <div className="space-y-4">
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-[#C7FF2E]">{t.currentOperationalTier}</span>
              <p className="text-xs text-zinc-500">{t.currentOperationalTierDesc}</p>
              
              <div className="flex items-center gap-2 text-xl font-bold font-display uppercase tracking-tight text-white">
                {profile.plan !== 'basic' && <Crown className="w-5 h-5 text-amber-400" />}
                <span>{getTierDisplayName(profile.plan)}</span>
              </div>

              {profile.plan === 'basic' ? (
                <div className="space-y-3.5 pt-2" id="tier-pitch-box">
                  <p className="text-xs leading-relaxed font-sans text-zinc-400">
                    {t.freeTierPitch}
                  </p>
                  <button
                    id="btn-settings-upgrade-trigger"
                    onClick={onNavigateToUpgrade}
                    className="w-full font-display font-extrabold text-[10px] py-3.5 rounded-xl uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer flex items-center justify-center gap-1.5 shadow-sm bg-[#C7FF2E] text-black hover:bg-white"
                  >
                    <span>{t.activateLuxury}</span> <ChevronRight className="w-3.5 h-3.5 font-bold" />
                  </button>
                </div>
              ) : (
                <div className="p-3.5 border text-xs font-mono rounded-xl text-center bg-emerald-500/10 border-emerald-500/20 text-emerald-400" id="active-premium-check">
                  All systems operating normally under sovereign encryption guidelines.
                </div>
              )}
            </div>
          </div>

          {/* Secure compliance information */}
          <div className="p-4 rounded-2xl border border-dashed text-xs font-mono space-y-2 text-left bg-zinc-950/40 border-zinc-900 text-zinc-500" id="settings-security-compliance">
            <span className="uppercase text-[9px] tracking-widest font-bold block text-[#C7FF2E]">{t.secureEncryptionTitle}</span>
            <p className="text-[11px] leading-relaxed">
              {t.secureEncryptionPitch}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
