import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { trackEvent } from '../../utils/analytics';
import {
  Coffee, Utensils, Cat, Dumbbell,
  Laptop, Moon, Palette, Heart,
  ArrowRight, Sparkles,
} from 'lucide-react';

// ─── Types & Constants ───────────────────────────────────────────────────────
interface Interest {
  id: string;
  label: string;
  labelTh: string;
  icon: React.ElementType;
}

const INTERESTS: Interest[] = [
  { id: 'coffee',    label: 'Specialty Coffee', labelTh: 'กาแฟสเปเชียลตี้',       icon: Coffee   },
  { id: 'dining',    label: 'Fine Dining',       labelTh: 'ร้านอาหารพรีเมียม',      icon: Utensils },
  { id: 'pets',      label: 'Pet Friendly',      labelTh: 'เป็นมิตรกับสัตว์เลี้ยง', icon: Cat      },
  { id: 'fitness',   label: 'Active & Fitness',  labelTh: 'ฟิตเนสและกีฬา',          icon: Dumbbell },
  { id: 'tech',      label: 'Tech & Gadgets',    labelTh: 'เทคโนโลยี',              icon: Laptop   },
  { id: 'nightlife', label: 'Nightlife',         labelTh: 'แฮงเอาท์กลางคืน',       icon: Moon     },
  { id: 'art',       label: 'Art & Culture',     labelTh: 'ศิลปะและวัฒนธรรม',       icon: Palette  },
  { id: 'wellness',  label: 'Wellness & Spa',    labelTh: 'สปาและสุขภาพ',           icon: Heart    },
];

// ─── Interest Tile ────────────────────────────────────────────────────────────
interface InterestTileProps {
  interest: Interest;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const InterestTile: React.FC<InterestTileProps> = ({ interest, isSelected, onToggle }) => {
  const Icon = interest.icon;
  return (
    // min-h 100px ensures comfortable tap; active:scale gives tactile feedback
    <button
      onClick={() => onToggle(interest.id)}
      className={`group flex flex-col items-center justify-center px-2 py-5 min-h-[100px]
        rounded-2xl border transition-all duration-200 active:scale-[0.96] w-full ${
        isSelected
          ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(86,190,137,0.15)]'
          : 'bg-dark-card border-white/5 hover:border-white/20 active:border-primary/30'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 transition-colors ${
          isSelected ? 'bg-primary text-dark-bg' : 'bg-dark-bg text-gray-400 group-hover:text-white'
        }`}
      >
        <Icon size={22} />
      </div>
      {/* English label: slightly smaller on mobile to prevent truncation */}
      <h3 className="font-bold text-xs sm:text-sm font-sans mb-0.5 text-white text-center leading-tight">
        {interest.label}
      </h3>
      <p className={`text-[10px] sm:text-xs text-center leading-tight font-kanit ${
        isSelected ? 'text-primary' : 'text-gray-500'
      }`}>
        {interest.labelTh}
      </p>
    </button>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const finalNickname = location.state?.nickname || user.user_metadata?.nickname || 'New Member';

        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          interests: selected,
          nickname: finalNickname,
          updated_at: new Date().toISOString()
        });

        await trackEvent('onboarding_completed', { tags_count: selected.length });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error during onboarding save:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-dark-bg text-white font-sans overflow-x-hidden">

      {/*
        Mobile: sticky header with progress context stays visible while scrolling.
        Compact on mobile, more breathing room on desktop.
      */}
      <header className="sticky top-0 z-10 bg-dark-bg/95 backdrop-blur-lg border-b border-white/5
        px-4 md:px-12 py-4 md:py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold
            tracking-widest uppercase">
            <Sparkles size={12} /> Personalize
          </div>
          {/* Live selection counter */}
          <span className="text-xs text-gray-500 font-kanit">
            {selected.length} รายการที่เลือก
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-12 pb-[calc(100px+env(safe-area-inset-bottom))]
        md:pb-16 pt-6 md:pt-10">

        {/* Page title — more compact on mobile */}
        <div className="mb-6 md:mb-10 md:text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 text-white leading-tight">
            What do you{' '}
            <span className="text-primary">love?</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-kanit max-w-lg md:mx-auto">
            เลือกไลฟ์สไตล์ที่คุณชื่นชอบ เพื่อให้ระบบแนะนำสิ่งที่ตรงใจคุณที่สุด
          </p>
        </div>

        {/*
          2 cols on all mobile (fits well at 320px+)
          4 cols on md+ (desktop original)
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {INTERESTS.map((item) => (
            <InterestTile
              key={item.id}
              interest={item}
              isSelected={selected.includes(item.id)}
              onToggle={toggleInterest}
            />
          ))}
        </div>
      </div>

      {/*
        CTA fixed to bottom — always within thumb reach.
        Safe-area padding keeps it above iPhone home bar.
      */}
      <div className="fixed bottom-0 inset-x-0 z-20
        bg-dark-bg/95 backdrop-blur-lg border-t border-white/5
        px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]
        md:relative md:bg-transparent md:border-0 md:px-12 md:py-8 md:pb-0 md:backdrop-blur-none">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
          <button
            onClick={handleContinue}
            disabled={selected.length === 0 || loading}
            className="w-full md:w-auto flex items-center justify-center gap-2.5
              px-8 py-4 min-h-[52px] rounded-full font-bold text-base bg-primary text-dark-bg
              hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200 active:scale-[0.98]"
          >
            {loading ? 'Processing…' : 'Continue to DailyStack'}
            {!loading && <ArrowRight size={18} />}
          </button>
          {selected.length === 0 && (
            <p className="text-xs text-gray-600 font-kanit">เลือกอย่างน้อย 1 รายการเพื่อดำเนินการต่อ</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Onboarding;