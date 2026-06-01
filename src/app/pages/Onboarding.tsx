/**
 * DailyStack — Onboarding Page (v6.0 Cyber-Technical Fintech)
 * Dark theme redesign — matches Cyber-Technical Fintech reference:
 * - Background: #131313 deep void
 * - Lime accent: #56BE89
 * - Surface cards: #161616, #242424
 * - Uses DesignSystem Shell
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Shell } from '../components/DesignSystem';
import { AuthService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

// ─── Material Symbols helpers ─────────────────────────────────────────────────
const Icon: React.FC<{ name: string; size?: number; className?: string }> = ({
  name, size = 20, className = ''
}) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>{name}</span>
);

// Icon map: lucide name → material-symbols name
const iconMap: Record<string, string> = {
  ArrowLeft: 'arrow_back', ArrowRight: 'arrow_forward', Sparkles: 'auto_awesome',
  Camera: 'photo_camera', X: 'close', Plus: 'add', User: 'person',
  Calendar: 'calendar_today', Heart: 'favorite', Moon: 'dark_mode',
  Briefcase: 'work', Users: 'group', Target: 'track_changes',
  Loader2: 'progress_activity', Check: 'check', ChevronRight: 'chevron_right',
  Coffee: 'local_cafe', UtensilsCrossed: 'restaurant', PawPrint: 'pets',
  Dumbbell: 'fitness_center', Laptop: 'laptop', MoonStar: 'nightlight_round',
  Palette: 'palette', Sparkle: 'auto_awesome', Plane: 'flight',
  Music: 'music_note', BookOpen: 'menu_book', Gamepad2: 'sports_esports',
  ChefHat: 'bakery_dining', Leaf: 'eco', Shirt: 'checkroom', Film: 'movie',
  Wind: 'air', Sun: 'light_mode', MapPin: 'location_on',
};

// Lucide-style icon wrapper
const LIcon: React.FC<{ name: string; size?: number; className?: string }> = ({
  name, size = 20, className = ''
}) => <Icon name={iconMap[name] ?? name} size={size} className={className} />;

// ─── Constants ────────────────────────────────────────────────────────────────
const ONSBOARDING_STEPS = [
  { id: 1, label: 'About', labelTh: 'ข้อมูล', title: 'Basic Profile', titleTh: 'โปรไฟล์พื้นฐาน' },
  { id: 2, label: 'Photos', labelTh: 'รูปถ่าย', title: 'Your Photos', titleTh: 'รูปถ่ายของคุณ' },
  { id: 3, label: 'Lifestyle', labelTh: 'ไลฟ์สไตล์', title: 'Your Lifestyle', titleTh: 'ไลฟ์สไตล์ของคุณ' },
  { id: 4, label: 'Interests', labelTh: 'ความสนใจ', title: 'Your Interests', titleTh: 'ความสนใจของคุณ' },
  { id: 5, label: 'Done', labelTh: 'เสร็จ', title: "You're All Set!", titleTh: 'คุณพร้อมแล้ว!' },
];

const GENDERS = [
  { id: 'male', label: 'Man', labelTh: 'ชาย', emoji: '👨' },
  { id: 'female', label: 'Woman', labelTh: 'หญิง', emoji: '👩' },
  { id: 'non-binary', label: 'Non-binary', labelTh: 'ไม่ระบุ', emoji: '✨' },
];

const COUNTRIES = [
  { code: 'TH', name: 'Thailand', nameTh: 'ไทย' },
  { code: 'US', name: 'United States', nameTh: 'สหรัฐอเมริกา' },
  { code: 'UK', name: 'United Kingdom', nameTh: 'สหราชอาณาจักร' },
  { code: 'SG', name: 'Singapore', nameTh: 'สิงคโปร์' },
  { code: 'JP', name: 'Japan', nameTh: 'ญี่ปุ่น' },
  { code: 'KR', name: 'South Korea', nameTh: 'เกาหลีใต้' },
  { code: 'AU', name: 'Australia', nameTh: 'ออสเตรเลีย' },
  { code: 'OTHER', name: 'Other', nameTh: 'ประเทศอื่น ๆ' },
];

const SLEEP_SCHEDULES = [
  { id: 'early', label: 'Early Bird', labelTh: 'เช้ามาก', desc: '6AM - 9PM', emoji: '🌅' },
  { id: 'balanced', label: 'Balanced', labelTh: 'สมดุล', desc: '8AM - 11PM', emoji: '⏰' },
  { id: 'night', label: 'Night Owl', labelTh: 'เล่นคน', desc: '10PM - 2AM', emoji: '🦉' },
  { id: 'flexible', label: 'Flexible', labelTh: 'ยืดหยุ่น', desc: 'No specific time', emoji: '🎯' },
];

const WORK_STYLES = [
  { id: 'office', label: 'Office', labelTh: 'ออฟฟิศ', desc: '9-5 job', emoji: '🏢' },
  { id: 'remote', label: 'Remote', labelTh: 'ทำงานจากบ้าน', desc: 'Work from home', emoji: '🏠' },
  { id: 'hybrid', label: 'Hybrid', labelTh: 'ผสมผสาน', desc: 'Mix of both', emoji: '🔄' },
  { id: 'freelance', label: 'Freelance', labelTh: 'ฟรีแลนซ์', desc: 'Self-employed', emoji: '🚀' },
];

const SOCIAL_ENERGY = [
  { id: 'introvert', label: 'Introvert', labelTh: 'คนภายใน', desc: 'Prefer small groups', emoji: '📚' },
  { id: 'balanced', label: 'Balanced', labelTh: 'สมดุล', desc: 'Adaptable', emoji: '⚖️' },
  { id: 'extrovert', label: 'Extrovert', labelTh: 'คนภายนอก', desc: 'Love social events', emoji: '🎉' },
];

const RELATIONSHIP_GOALS = [
  { id: 'long-term', label: 'Long-term', labelTh: 'ความสัมพันธ์ระยะยาว', emoji: '💕' },
  { id: 'marriage', label: 'Marriage', labelTh: 'แต่งงาน', emoji: '💍' },
  { id: 'dating', label: 'Dating', labelTh: 'เดท', emoji: '💫' },
  { id: 'friendship', label: 'Friendship', labelTh: 'เพื่อน', emoji: '🤝' },
  { id: 'exploring', label: 'Exploring', labelTh: 'สำรวจ', emoji: '🔭' },
];

const INTERESTS = [
  { id: 'coffee', label: 'Specialty Coffee', labelTh: 'กาแฟสเปเชียลตี้', icon: 'Coffee' },
  { id: 'dining', label: 'Fine Dining', labelTh: 'ร้านอาหารพรีเมียม', icon: 'UtensilsCrossed' },
  { id: 'pets', label: 'Pet Friendly', labelTh: 'เป็นมิตรกับสัตว์เลี้ยง', icon: 'PawPrint' },
  { id: 'fitness', label: 'Active & Fitness', labelTh: 'ฟิตเนสและกีฬา', icon: 'Dumbbell' },
  { id: 'tech', label: 'Tech & Gadgets', labelTh: 'เทคโนโลยี', icon: 'Laptop' },
  { id: 'nightlife', label: 'Nightlife', labelTh: 'แฮงเอาท์กลางคืน', icon: 'MoonStar' },
  { id: 'art', label: 'Art & Culture', labelTh: 'ศิลปะและวัฒนธรรม', icon: 'Palette' },
  { id: 'wellness', label: 'Wellness & Spa', labelTh: 'สปาและสุขภาพ', icon: 'Sparkle' },
  { id: 'travel', label: 'Travel', labelTh: 'ท่องเที่ยว', icon: 'Plane' },
  { id: 'music', label: 'Music', labelTh: 'ดนตรี', icon: 'Music' },
  { id: 'reading', label: 'Reading', labelTh: 'การอ่าน', icon: 'BookOpen' },
  { id: 'gaming', label: 'Gaming', labelTh: 'เล่นเกม', icon: 'Gamepad2' },
  { id: 'cooking', label: 'Cooking', labelTh: 'ทำอาหาร', icon: 'ChefHat' },
  { id: 'photography', label: 'Photography', labelTh: 'ถ่ายรูป', icon: 'Camera' },
  { id: 'nature', label: 'Nature & Outdoors', labelTh: 'ธรรมชาติ', icon: 'Leaf' },
  { id: 'fashion', label: 'Fashion', labelTh: 'แฟชั่น', icon: 'Shirt' },
  { id: 'movies', label: 'Movies', labelTh: 'ดูหนัง', icon: 'Film' },
  { id: 'yoga', label: 'Yoga & Meditation', labelTh: 'โยคะ', icon: 'Wind' },
];

// ─── Type Definitions ─────────────────────────────────────────────────────────
interface PhotoUpload {
  id: string;
  url: string;
  file?: File;
  isUploading: boolean;
}

interface ProfileData {
  display_name: string;
  birth_month: number | null;
  birth_year: number | null;
  age: number | null;
  gender: string;
  country: string;
  bio: string;
  photos: string[];
  relationship_goals: string;
  sleep_schedule: string;
  work_style: string;
  social_energy: string;
  interests: string[];
  occupation: string;
  education: string;
  mbti: string;
}

// ─── Font Helper ─────────────────────────────────────────────────────────────
const fontFor = (_lang: 'en' | 'th') => 'font-sans';

// ─── Brand Logo ───────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
          <linearGradient id="ob-grad-v4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#56BE89" />
          <stop offset="100%" stopColor="#7FD7B1" />
        </linearGradient>
      </defs>
      <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#ob-grad-v4)" opacity="0.55" />
      <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#ob-grad-v4)" opacity="0.78" />
      <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#ob-grad-v4)" />
      <path d="M50 29 L72 39 L50 47 L28 39 Z" fill="currentColor" className="text-[var(--text-primary)] dark:text-[#1c232a]" opacity="0.25" />
    </svg>
    <span className="text-sm font-black tracking-[0.15em] uppercase text-[var(--text-primary)] text-[var(--text-primary)]">
      DAILY<span className="text-[var(--lime)]">STACK</span>
    </span>
  </div>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}> = ({ children, onClick, disabled = false, loading = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      relative w-full py-4 px-6 rounded-2xl font-bold text-base cursor-pointer
      bg-[var(--lime)] text-white
      shadow-[0_4px_20px_rgba(86,190,137,0.25)]
      hover:shadow-[0_6px_32px_rgba(86,190,137,0.4)]
      hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]
      disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
      transition-all duration-300
      ${className}
    `}
  >
    {loading ? (
      <LIcon name="Loader2" size={20} className="animate-spin mx-auto text-white" />
    ) : (
      <span className="flex items-center justify-center gap-2">
        {children}
      </span>
    )}
  </button>
);

// ─── Step Progress ───────────────────────────────────────────────────────────
const StepProgress: React.FC<{ current: number; total: number; language: 'en' | 'th' }> = ({ 
  current, total, language 
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between gap-3 mb-3">
      <span className="text-xs font-semibold text-[#888888] text-[var(--text-primary)]/60">
        Step {current} of {total}
      </span>
      <span className="text-sm font-bold text-[var(--lime)]">
        {Math.round((current / total) * 100)}%
      </span>
    </div>
    <div className="relative h-1.5 bg-[var(--border-subtle)] dark:bg-[var(--surface-card)]/10 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--lime)] to-[var(--mint)] rounded-full transition-all duration-700 ease-out"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
    {/* Step dots - mobile optimized */}
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: total }, (_, i) => i + 1).map(step => (
        <div
          key={step}
          className={`h-2 rounded-full transition-all duration-300 ${
            step === current 
              ? 'bg-[var(--lime)] w-6' 
              : step < current 
                ? 'bg-[var(--lime)] w-2' 
                : 'bg-[var(--border-subtle)] dark:bg-[var(--surface-card)]/10 w-2'
          }`}
        />
      ))}
    </div>
  </div>
);

// ─── Option Card ───────────────────────────────────────────────────────────────
const OptionCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  emoji?: string;
  children: React.ReactNode;
}> = ({ selected, onClick, emoji, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative w-full flex flex-col items-center justify-center gap-3 p-5 rounded-[24px] cursor-pointer
      border transition-all duration-300 hover:scale-[1.02] active:scale-[0.95]
      ${selected
        ? 'bg-[var(--bg-elevated)] text-[var(--neon)] border-[var(--neon)] shadow-[0_8px_32px_var(--neon-glow)]'
        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:shadow-md'
      }
    `}
  >
    {emoji && <span className="text-3xl">{emoji}</span>}
    {children}
    {selected && (
      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--neon)] flex items-center justify-center shadow-[0_0_8px_var(--neon-glow)]">
        <LIcon name="Check" size={12} className="text-[var(--text-inverse)]" />
      </div>
    )}
  </button>
);

// ─── Interest Card ───────────────────────────────────────────────────────────
const InterestCard: React.FC<{
  label: string;
  iconName: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, iconName, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative flex items-center gap-2.5 px-5 py-3 rounded-full cursor-pointer
      border transition-all duration-300 hover:scale-[1.03] active:scale-[0.93]
      ${selected
        ? 'bg-[var(--neon)] border-[var(--neon)] text-[var(--text-inverse)] shadow-[0_4px_16px_var(--neon-glow)] font-bold'
        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
      }
    `}
  >
    <LIcon
      name={iconName}
      size={16}
      className={selected ? 'text-[var(--text-inverse)]' : 'text-[var(--text-muted)]'}
    />
    <span className="text-sm font-semibold">
      {label}
    </span>
  </button>
);

// ─── Photo Upload Grid ────────────────────────────────────────────────────────
interface PhotoUploadZoneProps {
  photos: PhotoUpload[];
  onAddPhoto: (file: File) => void;
  onRemovePhoto: (id: string) => void;
  maxPhotos?: number;
}
const PhotoUploadZone: React.FC<{
  photos: PhotoUpload[];
  onAddPhoto: (file: File) => void;
  onRemovePhoto: (id: string) => void;
  maxPhotos?: number;
}> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  maxPhotos = 6
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const remainingSlots = maxPhotos - photos.length;
      for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
        onAddPhoto(files[i]);
      }
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-[var(--bg-card)] shadow-md border border-[var(--border-subtle)] hover:border-[var(--neon)] hover:shadow-[0_0_15px_var(--neon-glow-sm)] transition-all duration-300 group"
          >
            {photo.isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)]">
                <LIcon name="Loader2" size={24} className="animate-spin text-[var(--neon)]" />
              </div>
            ) : (
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
            
            <button
              type="button"
              onClick={() => onRemovePhoto(photo.id)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-red-500/80 active:scale-90 transition-all opacity-0 group-hover:opacity-100 duration-200"
            >
              <LIcon name="X" size={14} />
            </button>
            
            {index === 0 && (
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-[var(--neon)] text-[10px] font-bold text-[var(--text-inverse)] shadow-sm">
                Main
              </div>
            )}
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-[3/4] rounded-[24px] border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-elevated)] flex flex-col items-center justify-center gap-2 hover:border-[var(--neon)] hover:bg-[var(--neon-surface)] active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--surface-bg)] flex items-center justify-center">
              <LIcon name="Plus" size={20} className="text-[var(--text-muted)]" />
            </div>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {photos.length === 0 ? 'Add Photo' : 'Add More'}
            </span>
          </button>
        )}
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-center font-mono text-[var(--text-muted)]">
        {photos.length >= 3
          ? `✓ ${photos.length} photos added - Looking great!`
          : `Add at least 3 photos (${photos.length}/3)`
        }
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [mounted] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<PhotoUpload[]>([]);

  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    birth_month: null,
    birth_year: null,
    age: null,
    gender: '',
    country: '',
    bio: '',
    photos: [],
    relationship_goals: '',
    sleep_schedule: '',
    work_style: '',
    social_energy: '',
    interests: [],
    occupation: '',
    education: '',
    mbti: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await AuthService.getUserProfile();
      if (profile) {
        setProfileData({
          display_name: profile.display_name || profile.nickname || '',
          birth_month: profile.birth_month || null,
          birth_year: profile.birth_year || null,
          age: profile.age || null,
          gender: profile.gender || '',
          country: profile.location || '',
          bio: profile.bio || '',
          photos: profile.dating_photos || [],
          relationship_goals: profile.relationship_goals || '',
          sleep_schedule: profile.sleep_schedule || '',
          work_style: profile.work_style || '',
          social_energy: profile.social_energy || '',
          interests: profile.interests || [],
          occupation: profile.occupation || '',
          education: profile.education || '',
          mbti: profile.mbti || '',
        });
      }
    };
    loadProfile();
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!profileData.display_name && !!profileData.gender && !!profileData.country && !!profileData.birth_month && !!profileData.birth_year;
      case 2:
        return profileData.photos.length >= 3;
      case 3:
        return !!profileData.sleep_schedule && !!profileData.work_style && !!profileData.relationship_goals;
      case 4:
        return profileData.interests.length >= 3;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const completionPercent = calculateCompletion();
      
      await AuthService.upsertUserProfile({
        display_name: profileData.display_name,
        birth_month: profileData.birth_month,
        birth_year: profileData.birth_year,
        age: profileData.age,
        gender: profileData.gender,
        location: profileData.country,
        bio: profileData.bio,
        dating_photos: profileData.photos,
        relationship_goals: profileData.relationship_goals,
        sleep_schedule: profileData.sleep_schedule,
        work_style: profileData.work_style,
        social_energy: profileData.social_energy,
        onboarding_completed: true,
        onboarding_step: 5,
        profile_completion_percent: completionPercent,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = (): number => {
    let score = 0;
    if (profileData.display_name) score += 10;
    if (profileData.age) score += 5;
    if (profileData.gender) score += 5;
    if (profileData.country) score += 5;
    if (profileData.bio) score += 5;
    if (profileData.photos.length >= 3) score += 15;
    if (profileData.photos.length >= 5) score += 10;
    if (profileData.sleep_schedule) score += 5;
    if (profileData.work_style) score += 5;
    if (profileData.social_energy) score += 5;
    if (profileData.relationship_goals) score += 10;
    if (profileData.interests.length >= 3) score += 10;
    if (profileData.interests.length >= 6) score += 10;
    return Math.min(100, score);
  };

  // ─── Photo Upload ───────────────────────────────────────────────────────────
  const handleAddPhoto = async (file: File) => {
    const tempId = `temp-${Date.now()}`;
    
    setUploadingPhotos(prev => [...prev, {
      id: tempId,
      url: URL.createObjectURL(file),
      file,
      isUploading: true,
    }]);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const result = await AuthService.uploadProfilePhoto(file, user.id);
      
      if (result.success && result.url) {
        setUploadingPhotos(prev => prev.filter(p => p.id !== tempId));
        setProfileData(prev => ({
          ...prev,
          photos: [...prev.photos, result.url!],
        }));
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadingPhotos(prev => prev.filter(p => p.id !== tempId));
    }
  };

  const handleRemovePhoto = (id: string) => {
    const uploading = uploadingPhotos.find(p => p.id === id);
    if (uploading) {
      URL.revokeObjectURL(uploading.url);
      setUploadingPhotos(prev => prev.filter(p => p.id !== id));
      return;
    }
    
    setProfileData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p !== id),
    }));
  };

  // ─── Render Steps ────────────────────────────────────────────────────────────
  const renderStep = () => {
    const step = ONSBOARDING_STEPS[currentStep - 1];
    const title = language === 'th' ? step.titleTh : step.title;

    switch (currentStep) {
      case 1: // Basic Info
        return (
          <div className="space-y-6">
            {/* Step Header */}
            <div className="space-y-3">
              <span className="inline-block font-mono text-[#56BE89] text-xs tracking-[0.2em] uppercase font-bold">
                Step 1
              </span>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] text-[var(--text-primary)] ${fontFor(language)}`}>
                {title}
              </h2>
              <p className="text-sm text-[#888888] text-[var(--text-primary)]/60">
                {language === 'th' ? 'แบ่งปันข้อมูลพื้นฐานเกี่ยวกับตัวคุณ' : 'Share some basic information about yourself'}
              </p>
              <div className="h-1 w-12 bg-[#56BE89] rounded-full mt-2" />
            </div>
            
            {/* Form */}
            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <LIcon name="User" size={16} className="text-[var(--neon)]" /> 
                  {language === 'th' ? 'ชื่อที่แสดง' : 'Display Name'}
                </label>
                <input
                  type="text"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder={language === 'th' ? 'กรอกชื่อของคุณ' : 'Enter your name'}
                  className="ds-input"
                />
              </div>
              
              {/* Birth Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <LIcon name="Calendar" size={16} className="text-[var(--neon)]" /> 
                  {language === 'th' ? 'วันเกิด (เดือน/ปี)' : 'Birth Date (Month/Year)'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={profileData.birth_month || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, birth_month: parseInt(e.target.value) || null }))}
                    className="ds-input"
                  >
                    <option value="">{language === 'th' ? 'เดือน' : 'Month'}</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                      <option key={m} value={i + 1}>{language === 'th' ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'][i] : m}</option>
                    ))}
                  </select>
                  
                  <select
                    value={profileData.birth_year || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, birth_year: parseInt(e.target.value) || null }))}
                    className="ds-input"
                  >
                    <option value="">{language === 'th' ? 'ปี' : 'Year'}</option>
                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i - 18).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Gender */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--text-primary)]">
                  {language === 'th' ? 'เพศ' : 'Gender'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDERS.map(g => (
                    <OptionCard
                      key={g.id}
                      selected={profileData.gender === g.id}
                      onClick={() => setProfileData(prev => ({ ...prev, gender: g.id }))}
                      emoji={g.emoji}
                    >
                      <span className="text-sm font-semibold block">
                        {language === 'th' ? g.labelTh : g.label}
                      </span>
                    </OptionCard>
                  ))}
                </div>
              </div>
              
              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <LIcon name="MapPin" size={16} className="text-[var(--neon)]" /> 
                  {language === 'th' ? 'ประเทศ' : 'Country'}
                </label>
                <select
                  value={profileData.country}
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  className="ds-input"
                >
                  <option value="">{language === 'th' ? 'เลือกประเทศของคุณ' : 'Select your country'}</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {language === 'th' ? c.nameTh : c.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--text-primary)]">
                  {language === 'th' ? 'แนะนำตัว (ไม่บังคับ)' : 'Bio (optional)'}
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={language === 'th' ? 'บอกเล่าเกี่ยวกับตัวคุณ...' : 'Tell us about yourself...'}
                  rows={3}
                  maxLength={300}
                  className="ds-input min-h-[100px] py-3 resize-none"
                />
                <p className="text-xs text-right font-mono text-[var(--text-muted)]">{profileData.bio.length}/300</p>
              </div>
            </div>
          </div>
        );
        
      case 2: // Photos
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-block font-mono text-[#56BE89] text-xs tracking-[0.2em] uppercase font-bold">
                Step 2
              </span>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] text-[var(--text-primary)] ${fontFor(language)}`}>
                {title}
              </h2>
              <p className="text-sm text-[#888888] text-[var(--text-primary)]/60">
                {language === 'th' ? 'รูปถ่ายที่ดีจะช่วยให้คุณได้รับการแมตช์มากขึ้น' : 'Good photos will help you get more matches'}
              </p>
              <div className="h-1 w-12 bg-[#56BE89] rounded-full mt-2" />
            </div>
            
            <PhotoUploadZone
              photos={[
                ...uploadingPhotos,
                ...profileData.photos.map(url => ({ id: url, url, isUploading: false }))
              ]}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              maxPhotos={6}
            />
          </div>
        );
        
      case 3: // Lifestyle
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-block font-mono text-[#56BE89] text-xs tracking-[0.2em] uppercase font-bold">
                Step 3
              </span>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] text-[var(--text-primary)] ${fontFor(language)}`}>
                {title}
              </h2>
              <p className="text-sm text-[#888888] text-[var(--text-primary)]/60">
                {language === 'th' ? 'ช่วยให้เราเข้าใจคุณมากขึ้น' : 'Help us understand you better'}
              </p>
              <div className="h-1 w-12 bg-[#56BE89] rounded-full mt-2" />
            </div>
            
            <div className="space-y-6">
              {/* Sleep Schedule */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--text-primary)] text-[var(--text-primary)] flex items-center gap-2">
                  <LIcon name="Moon" size={16} className="text-[#56BE89]" /> 
                  {language === 'th' ? 'ตารางการนอน' : 'Sleep Schedule'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SLEEP_SCHEDULES.map(s => (
                    <OptionCard
                      key={s.id}
                      selected={profileData.sleep_schedule === s.id}
                      onClick={() => setProfileData(prev => ({ ...prev, sleep_schedule: s.id }))}
                      emoji={s.emoji}
                    >
                      <div className="text-center">
                        <span className={`text-sm font-bold block ${profileData.sleep_schedule === s.id ? 'text-white' : 'text-[var(--text-primary)] text-[var(--text-primary)]'}`}>
                          {language === 'th' ? s.labelTh : s.label}
                        </span>
                        <span className={`text-xs ${profileData.sleep_schedule === s.id ? 'text-white/70' : 'text-[#555555] text-[var(--text-primary)]/40'}`}>
                          {s.desc}
                        </span>
                      </div>
                    </OptionCard>
                  ))}
                </div>
              </div>
              
              {/* Work Style */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--text-primary)] text-[var(--text-primary)] flex items-center gap-2">
                  <LIcon name="Briefcase" size={16} className="text-[#56BE89]" /> 
                  {language === 'th' ? 'รูปแบบการทำงาน' : 'Work Style'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {WORK_STYLES.map(w => (
                    <OptionCard
                      key={w.id}
                      selected={profileData.work_style === w.id}
                      onClick={() => setProfileData(prev => ({ ...prev, work_style: w.id }))}
                      emoji={w.emoji}
                    >
                      <div className="text-center">
                        <span className={`text-sm font-bold block ${profileData.work_style === w.id ? 'text-white' : 'text-[var(--text-primary)] text-[var(--text-primary)]'}`}>
                          {language === 'th' ? w.labelTh : w.label}
                        </span>
                        <span className={`text-xs ${profileData.work_style === w.id ? 'text-white/70' : 'text-[#555555] text-[var(--text-primary)]/40'}`}>
                          {w.desc}
                        </span>
                      </div>
                    </OptionCard>
                  ))}
                </div>
              </div>
              
              {/* Social Energy */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--text-primary)] text-[var(--text-primary)] flex items-center gap-2">
                  <LIcon name="Users" size={16} className="text-[#56BE89]" /> 
                  {language === 'th' ? 'พลังทางสังคม' : 'Social Energy'}
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {SOCIAL_ENERGY.map(s => (
                    <OptionCard
                      key={s.id}
                      selected={profileData.social_energy === s.id}
                      onClick={() => setProfileData(prev => ({ ...prev, social_energy: s.id }))}
                      emoji={s.emoji}
                    >
                      <div className="flex-1 text-center">
                        <span className={`text-sm font-bold block ${profileData.social_energy === s.id ? 'text-white' : 'text-[var(--text-primary)] text-[var(--text-primary)]'}`}>
                          {language === 'th' ? s.labelTh : s.label}
                        </span>
                        <span className={`text-xs ${profileData.social_energy === s.id ? 'text-white/70' : 'text-[#555555] text-[var(--text-primary)]/40'}`}>
                          {s.desc}
                        </span>
                      </div>
                    </OptionCard>
                  ))}
                </div>
              </div>
              
              {/* Relationship Goals */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--text-primary)] text-[var(--text-primary)] flex items-center gap-2">
                  <LIcon name="Target" size={16} className="text-[#56BE89]" /> 
                  {language === 'th' ? 'เป้าหมายในการเดท' : 'Relationship Goals'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {RELATIONSHIP_GOALS.map(g => (
                    <OptionCard
                      key={g.id}
                      selected={profileData.relationship_goals === g.id}
                      onClick={() => setProfileData(prev => ({ ...prev, relationship_goals: g.id }))}
                      emoji={g.emoji}
                    >
                      <span className={`text-sm font-semibold block ${profileData.relationship_goals === g.id ? 'text-white' : 'text-[var(--text-primary)] text-[var(--text-primary)]'}`}>
                        {language === 'th' ? g.labelTh : g.label}
                      </span>
                    </OptionCard>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4: // Interests
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-block font-mono text-[#56BE89] text-xs tracking-[0.2em] uppercase font-bold">
                Step 4
              </span>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] text-[var(--text-primary)] ${fontFor(language)}`}>
                {title}
              </h2>
              <p className="text-sm text-[#888888] text-[var(--text-primary)]/60">
                {language === 'th' ? 'เลือกอย่างน้อย 3 รายการ' : 'Select at least 3 interests'}
              </p>
              <div className="h-1 w-12 bg-[#56BE89] rounded-full mt-2" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              {INTERESTS.map(interest => {
                return (
                  <InterestCard
                    key={interest.id}
                    label={language === 'th' ? interest.labelTh : interest.label}
                    iconName={interest.icon}
                    selected={profileData.interests.includes(interest.id)}
                    onClick={() => {
                      setProfileData(prev => ({
                        ...prev,
                        interests: prev.interests.includes(interest.id)
                          ? prev.interests.filter(i => i !== interest.id)
                          : [...prev.interests, interest.id]
                      }));
                    }}
                  />
                );
              })}
            </div>
            
            {profileData.interests.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] text-[var(--text-primary)]/50">
                <span className="w-6 h-6 rounded-full bg-[#56BE89] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {profileData.interests.length}
                </span>
                {language === 'th' ? 'ความสนใจที่เลือก' : 'interests selected'}
              </div>
            )}
          </div>
        );
        
      case 5: // Complete
        return (
          <div className="space-y-8 py-8 text-center">
            {/* Success Animation */}
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-[#56BE89] blur-3xl opacity-30 scale-[1.2] animate-pulse" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-[var(--lime)]/20 to-[#56BE89]/5 border-2 border-[#56BE89] rounded-full flex items-center justify-center shadow-[0_12px_48px_rgba(86,190,137,0.35)]">
                <LIcon name="Sparkles" size={48} className="text-[#56BE89]" />
              </div>
            </div>
            
            {/* Success Message */}
            <div className="space-y-4">
              <h2 className={`text-4xl font-black tracking-tight text-[var(--text-primary)] text-[var(--text-primary)] ${fontFor(language)}`}>
                {language === 'th' ? 'คุณพร้อมแล้ว!' : "You're All Set!"}
              </h2>
              <p className={`text-base text-[#888888] text-[var(--text-primary)]/60 ${fontFor(language)}`}>
                {language === 'th'
                  ? 'โปรไฟล์ของคุณเสร็จสมบูรณ์แล้ว'
                  : 'Your profile is complete. AI is starting to analyze compatibility'
                }
              </p>
            </div>
            
            {/* Summary */}
            <div className="space-y-3 text-left max-w-sm mx-auto">
              {[
                { iconName: 'User', label: profileData.display_name || 'New User' },
                { iconName: 'Camera', label: `${profileData.photos.length} photos` },
                { iconName: 'Heart', label: `${profileData.interests.length} interests` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-[var(--lime)]/10 flex items-center justify-center shrink-0">
                    <LIcon name={item.iconName} size={16} className="text-[#56BE89]" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)] font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Shell lang={language} onLangChange={setLanguage} showNav showLangToggle showOrbs>
      <div className="px-4 pt-[calc(var(--safe-top)+16px)] pb-[120px]">

        {/* ── Inline Header (above Shell's floating nav) ─────────────────── */}
        <div className="flex items-center justify-between gap-3 mb-5">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-[var(--surface-card)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <LIcon name="ArrowLeft" size={20} />
            </button>
          ) : (
            <div className="w-10 h-10" />
          )}

          <span className="text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider">
            {language === 'th' ? 'การตั้งค่าโปรไฟล์' : 'PROFILE SETUP'}
          </span>
          <div className="w-10 h-10" />
        </div>

        {/* ── Premium Step Progress ────────────────────────────────────── */}
        <StepProgress current={currentStep} total={ONSBOARDING_STEPS.length} language={language} />

        {/* ── Main Content ─────────────────────────────────────────────── */}
        {renderStep()}

        {/* ── Fixed CTA Button ──────────────────────────────────────────── */}
        {currentStep < 5 && (
          <div className="fixed bottom-[calc(24px+env(safe-area-inset-bottom)+56px)] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] z-10">
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="ds-btn-primary w-full"
            >
              {language === 'th' ? 'ต่อไป' : 'Continue'}
              <LIcon name="ArrowRight" size={18} />
            </button>
            {!canProceed() && (
              <p className="text-xs text-center text-[var(--text-muted)] mt-2 font-mono">
                {currentStep === 1 && (language === 'th' ? 'กรุณากรอกข้อมูลที่จำเป็น' : 'Please fill in required fields')}
                {currentStep === 2 && (language === 'th' ? 'ต้องเพิ่มรูปถ่ายอย่างน้อย 3 รูป' : 'Add at least 3 photos')}
                {currentStep === 3 && (language === 'th' ? 'กรุณาเลือกไลฟ์สไตล์ของคุณ' : 'Please select your lifestyle')}
                {currentStep === 4 && (language === 'th' ? 'เลือกความสนใจอย่างน้อย 3 รายการ' : 'Select at least 3 interests')}
              </p>
            )}
          </div>
        )}

        {/* ── Complete Button ───────────────────────────────────────────── */}
        {currentStep === 5 && (
          <div className="fixed bottom-[calc(24px+env(safe-area-inset-bottom)+56px)] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] z-10">
            <button
              onClick={handleComplete}
              disabled={loading}
              className="ds-btn-primary w-full"
            >
              {loading ? (
                <LIcon name="Loader2" size={18} className="animate-spin" />
              ) : (
                <>
                  {language === 'th' ? 'เริ่มสำรวจ ' : 'Start Exploring '}
                  DAILY<span className="text-[var(--text-primary)]">STACK</span>
                  <LIcon name="ArrowRight" size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
};

export default Onboarding;