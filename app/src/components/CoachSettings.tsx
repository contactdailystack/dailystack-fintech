import { useState } from 'react';
import { User, Heart, Brain, Check } from 'lucide-react';
import { translations, Language } from '../data/translations';

interface CoachSettingsProps {
  lang: Language;
  onSelectPersona: (persona: 'strict' | 'supportive' | 'analytical') => void;
  currentPersona: 'strict' | 'supportive' | 'analytical';
}

const personas = [
  {
    id: 'strict' as const,
    name: { en: 'Coach Max', th: 'โค้ชแม็กซ์' },
    tagline: { en: 'Accountability First', th: 'ผู้รับผิดชอบเป็นอันดับหนึ่ง' },
    description: {
      en: 'Direct. No excuses. You will know exactly where you stand.',
      th: 'ตรงไปตรงมา ไม่มีข้อแก้ตัว คุณจะรู้ว่าอยู่ตรงไหน'
    },
    Icon: User,
    accent: 'text-red-400',
    sampleMessage: {
      en: 'Your score is 850. Below baseline. You need to take action now.',
      th: 'คะแนนของคุณอยู่ที่ 850 ต่ำกว่าระดับพื้นฐาน คุณต้องลงมือทำตอนนี้'
    },
  },
  {
    id: 'supportive' as const,
    name: { en: 'Coach Mai', th: 'โค้ชใหม่' },
    tagline: { en: 'Empathy Meets Growth', th: 'เห็นอกเห็นใจ พร้อมเติบโต' },
    description: {
      en: 'Understands your feelings. Encourages without judgment.',
      th: 'เข้าใจความรู้สึกของคุณ ให้กำลังใจโดยไม่ตัดสิน'
    },
    Icon: Heart,
    accent: 'text-pink-400',
    sampleMessage: {
      en: 'You are at Level 1. Just one step at a time — you can do this.',
      th: 'คุณอยู่ที่เลเวล 1 ทีละก้าว คุณทำได้'
    },
  },
  {
    id: 'analytical' as const,
    name: { en: 'Coach Jin', th: 'โค้ชจิน' },
    tagline: { en: 'Data-Driven Clarity', th: 'ความชัดเจนจากข้อมูล' },
    description: {
      en: 'Numbers do not lie. Get precise insights from your financial patterns.',
      th: 'ตัวเลขไม่โกหก รับข้อมูลเชิงลึกจากรูปแบบทางการเงินของคุณ'
    },
    Icon: Brain,
    accent: 'text-blue-400',
    sampleMessage: {
      en: 'Level 2, 450/1000 XP. Streak: 5 days (1.1x multiplier active.',
      th: 'เลเวล 2, 450/1000 XP. วันติดต่อ: 5 วัน (ตัวคูณ 1.1x)'
    },
  },
];

export function CoachSettings({ lang, onSelectPersona, currentPersona }: CoachSettingsProps) {
  const [selected, setSelected] = useState(currentPersona);

  const handleSave = () => {
    onSelectPersona(selected);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-white mb-1">
          {lang === 'en' ? 'Choose Your AI Coach' : 'เลือก AI Coach ของคุณ'}
        </h2>
        <p className="text-white/50 text-xs">
          {lang === 'en'
            ? 'Your coach adapts to your style. Change anytime.'
            : 'โค้ชของคุณจะปรับตามสไตล์ สามารถเปลี่ยนได้ทุกเมื่อ'}
        </p>
      </div>

      <div className="space-y-3">
        {personas.map((persona) => {
          const Icon = persona.Icon;
          const isSelected = selected === persona.id;

          return (
            <button
              key={persona.id}
              onClick={() => setSelected(persona.id)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                isSelected
                  ? 'border-[#C7FF2E] bg-[#C7FF2E]/5'
                  : 'border-white/10 bg-[#171C15] hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-[#C7FF2E]/10' : 'bg-white/5'
                }`}>
                  <Icon className={`w-5 h-5 ${isSelected ? persona.accent : 'text-white/40'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>
                      {persona.name[lang]}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 bg-[#C7FF2E] text-[#0B0F0A] rounded text-[9px] font-black uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] font-semibold mt-0.5 ${isSelected ? persona.accent : 'text-white/40'}`}>
                    {persona.tagline[lang]}
                  </p>
                  <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                    {persona.description[lang]}
                  </p>
                  <div className={`mt-2 p-2 rounded-xl ${isSelected ? 'bg-[#0B0F0A]' : 'bg-white/5'}`}>
                    <p className="text-[10px] text-white/40 italic font-kanit">
                      &quot;{persona.sampleMessage[lang]}&quot;
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <Check className={`w-5 h-5 shrink-0 ${persona.accent}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-[#C7FF2E] text-[#0B0F0A] font-black rounded-xl mt-2"
      >
        {lang === 'en' ? 'Save Coach' : 'บันทึก Coach'}
      </button>
    </div>
  );
}