import React from 'react';
import { Trophy, Share2 } from 'lucide-react';
import { UserProfile } from '../types';
import { FBISMetaRecord } from '../services/fbisService';

interface Props {
  profile: UserProfile;
  lang: 'en' | 'th';
  fbis: FBISMetaRecord | null;
}

export function FinancialEvolutionPage({ profile, lang, fbis }: Props) {
  // Real FBIS score from Supabase
  const fbisScore = fbis?.current_score ?? 1000;
  // Normalize to 0-100 for display ring (1000 base → 100%)
  const pct = Math.max(0, Math.min(100, Math.round((fbisScore / 1000) * 100)));

  return (
    <div className="space-y-6 animate-slide-up text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-white">{lang === 'en' ? 'Financial Evolution' : 'วิวัฒนาการการเงิน'}</h2>
          <p className="text-sm text-zinc-400">{lang === 'en' ? 'Score, achievements and progress' : 'คะแนน ความสำเร็จ และความก้าวหน้า'}</p>
        </div>
        <button className="px-3 py-2 rounded-xl bg-brand text-black font-bold flex items-center gap-2">
          <Share2 className="w-4 h-4" /> {lang === 'en' ? 'Share' : 'แชร์'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-dark-card p-5 rounded-2xl border border-zinc-900 flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" stroke="var(--color-dark-border)" strokeWidth="12" fill="none" />
              <circle cx="60" cy="60" r="54" stroke="var(--color-brand)" strokeWidth="12" fill="none" strokeDasharray={`${(pct/100)*339.292}% 339.292`} strokeLinecap="round" transform="rotate(-90 60 60)" />
            </svg>
            <div className="absolute text-center">
              <div className="text-xs text-zinc-400">{lang === 'en' ? 'Score' : 'คะแนน'}</div>
              <div className="text-2xl font-display font-extrabold">{Math.round(pct)}</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-zinc-400">{lang === 'en' ? 'Level' : 'ระดับ'}</div>
            <div className="font-display text-sm text-white">{`Level ${Math.max(1, Math.ceil(fbisScore / 200))}`}</div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-dark-card p-4 rounded-2xl border border-zinc-900">
            <h3 className="font-bold text-white">{lang === 'en' ? 'Achievements' : 'ความสำเร็จ'}</h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {['Consistent Saver','AutoBudget Master','Decision Streak'].map((a,i) => (
                <div key={a} className="p-3 bg-dark-card rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-md bg-zinc-800 text-brand"><Trophy className="w-4 h-4" /></div>
                  <div>
                    <div className="text-xs text-zinc-400">{a}</div>
                    <div className="text-sm text-white font-medium">{i === 0 ? 'Earned' : i === 1 ? 'In progress' : `Streak: ${fbis?.streak_days ?? 0}d`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-card p-4 rounded-2xl border border-zinc-900">
            <h3 className="font-bold text-white">{lang === 'en' ? 'Active Challenges' : 'ความท้าทายที่กำลังดำเนินอยู่'}</h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between bg-dark-card p-3 rounded-xl">
                <div>
                  <div className="text-xs text-zinc-400">{lang === 'en' ? 'No-Spend Weekend' : 'งดใช้ช่วงสุดสัปดาห์'}</div>
                  <div className="text-sm text-white">{lang === 'en' ? '2 days left' : 'เหลือ 2 วัน'}</div>
                </div>
                <div className="text-xs text-zinc-400">{lang === 'en' ? 'Progress' : 'ความคืบหน้า'}: 70%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialEvolutionPage;
