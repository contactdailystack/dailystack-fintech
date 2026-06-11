import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  Heart,
  Brain,
  Check,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { getAICOachRecommendation, FBISState } from '../../core/fbis';

type Persona = 'strict' | 'supportive' | 'analytical';

interface CoachConfig {
  id: Persona;
  name: string;
  icon: React.ReactNode;
  tagline: string;
  tone: string;
  color: string;
  sampleRecommendation: string;
}

const COACHES: CoachConfig[] = [
  {
    id: 'strict',
    name: 'Coach Max',
    icon: <User size={24} />,
    tagline: 'ตรงไปตรงมา คุณต้องรับผิดชอบ',
    tone: 'Direct & Firm',
    color: '#FF6B6B',
    sampleRecommendation:
      'You need to record at least 3 days consistently. Start today. No excuses.',
  },
  {
    id: 'supportive',
    name: 'Coach Mai',
    icon: <Heart size={24} />,
    tagline: 'เข้าใจคุณ มาลองด้วยกันนะ',
    tone: 'Encouraging & Warm',
    color: '#C7FF2E',
    sampleRecommendation:
      "Starting is the hardest part. Just one entry today — you can do it! Let's work together.",
  },
  {
    id: 'analytical',
    name: 'Coach Jin',
    icon: <Brain size={24} />,
    tagline: 'ข้อมูลบอกว่า...',
    tone: 'Data-Driven & Logical',
    color: '#4ECDC4',
    sampleRecommendation:
      'Current score: 1250. 750 XP below baseline. Average daily gain needed: 25 XP/day to reach baseline in 30 days.',
  },
];

const CoachSettings: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCoach, setSelectedCoach] = useState<Persona>('supportive');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            ai_coach_persona: selectedCoach,
          });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Error saving coach preference:', err);
    } finally {
      setSaving(false);
    }
  };

  const currentCoach = COACHES.find((c) => c.id === selectedCoach) || COACHES[1];

  const mockFbisState: FBISState = {
    currentScore: 1000,
    streakDays: 3,
    lastRecordedAt: null,
    xpMultiplier: 1.1,
  };

  return (
    <div className="min-h-screen bg-[#0B0F0A] text-white font-sans">
      <header className="sticky top-0 z-20 bg-[#0B0F0A]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-[#C7FF2E]" />
          <h1 className="text-lg font-bold">Coach Settings</h1>
        </div>
      </header>

      <main className="px-4 pb-12 max-w-lg mx-auto">
        <div className="py-8 text-center">
          <h2 className="text-2xl font-black mb-2 font-kanit">เลือก AI Coach ของคุณ</h2>
          <p className="text-white/60 font-kanit">
            แต่ละ Coach มีสไตล์การให้คำแนะนำที่ต่างกัน
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {COACHES.map((coach) => (
            <button
              key={coach.id}
              onClick={() => setSelectedCoach(coach.id)}
              className={`w-full rounded-2xl p-5 text-left transition-all ${
                selectedCoach === coach.id
                  ? 'border-2'
                  : 'border border-white/10 hover:border-white/20'
              }`}
              style={{
                borderColor: selectedCoach === coach.id ? coach.color : undefined,
                backgroundColor:
                  selectedCoach === coach.id ? `${coach.color}10` : '#171C15',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${coach.color}20` }}
                >
                  <span style={{ color: coach.color }}>{coach.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black text-lg" style={{ color: selectedCoach === coach.id ? coach.color : 'white' }}>
                      {coach.name}
                    </h3>
                    {selectedCoach === coach.id && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: coach.color }}
                      >
                        <Check size={14} className="text-[#0B0F0A]" />
                      </div>
                    )}
                  </div>
                  <p className="text-white/60 text-sm font-kanit mb-2">{coach.tagline}</p>
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
                    <Sparkles size={10} style={{ color: coach.color }} />
                    <span className="text-xs text-white/60">{coach.tone}</span>
                  </div>
                </div>
              </div>

              {selectedCoach === coach.id && (
                <div
                  className="mt-4 pt-4 border-t rounded-xl p-4"
                  style={{ borderColor: `${coach.color}30`, backgroundColor: `${coach.color}05` }}
                >
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                    Sample Recommendation
                  </p>
                  <p className="text-white/80 font-kanit text-sm leading-relaxed">
                    "{coach.sampleRecommendation}"
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="sticky bottom-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              saving
                ? 'bg-white/10 text-white/40'
                : saved
                ? 'bg-green-500 text-white'
                : 'bg-[#C7FF2E] text-[#0B0F0A] hover:bg-[#C7FF2E]/90'
            }`}
          >
            {saving ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check size={18} /> Saved!
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Save {currentCoach.name}
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default CoachSettings;