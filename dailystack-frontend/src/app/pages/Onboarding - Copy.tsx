import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // แก้ไข: เพิ่ม useLocation เข้ามาดึงค่า State จาก Router
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

// ─── Sub-components ──────────────────────────────────────────────────────────
interface InterestTileProps {
  interest: Interest;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const InterestTile: React.FC<InterestTileProps> = ({ interest, isSelected, onToggle }) => {
  const Icon = interest.icon;
  return (
    <button
      onClick={() => onToggle(interest.id)}
      className={`group flex flex-col items-center p-5 rounded-2xl border transition-all duration-300 ${
        isSelected
          ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(86,190,137,0.15)]'
          : 'bg-dark-card border-white/5 hover:border-white/20'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
          isSelected ? 'bg-primary text-dark-bg' : 'bg-dark-bg text-gray-400 group-hover:text-white'
        }`}
      >
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-sm font-sans mb-1 text-white">{interest.label}</h3>
      <p className={`text-xs ${isSelected ? 'text-primary' : 'text-gray-500'}`}>{interest.labelTh}</p>
    </button>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // เรียกใช้ Hook เพื่ออ่านค่าที่ส่งมาจากหน้า AuthPage
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
        // ลำดับการเลือกดึงชื่อเล่น:
        // 1. ดึงจากค่าชื่อจริงที่ผู้ใช้กรอกเข้ามาและส่งผ่าน Router State (location.state)
        // 2. ถ้าไม่มี ให้ดึงจาก Supabase User Metadata
        // 3. ถ้าไม่มีจริง ๆ ให้ใส่เป็น 'New Member' เพื่อความปลอดภัยของระบบ
        const finalNickname = location.state?.nickname || user.user_metadata?.nickname || 'New Member';

        // บันทึกลงฐานข้อมูล Supabase ตาราง user_profiles
        await supabase.from('user_profiles').upsert({ 
          user_id: user.id, 
          interests: selected,
          nickname: finalNickname, // แก้ไข: บันทึกด้วยค่าชื่อจริงที่คุ้ยพบตัวล่าสุด
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
    <div className="min-h-screen bg-dark-bg text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-widest uppercase mb-6">
            <Sparkles size={14} /> Personalize Your Experience
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 text-white">
            What do you <span className="text-primary">love?</span>
          </h1>
          <p className="text-gray-400 text-base max-w-lg mx-auto font-kanit">
            เลือกไลฟ์สไตล์ที่คุณชื่นชอบ เพื่อให้ระบบแนะนำสิ่งที่ตรงใจคุณที่สุด
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {INTERESTS.map((item) => (
            <InterestTile
              key={item.id}
              interest={item}
              isSelected={selected.includes(item.id)}
              onToggle={toggleInterest}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleContinue}
            disabled={selected.length === 0 || loading}
            className="flex items-center gap-2.5 px-10 py-4 rounded-full font-bold text-base bg-primary text-dark-bg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
          >
            {loading ? 'Processing...' : 'Continue to DailyStack'}
            {!loading && <ArrowRight size={18} />}
          </button>
          <p className="text-xs text-gray-600 font-kanit">
            {selected.length} รายการที่เลือก
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;