/**
 * DailyStack — Onboarding Page (v4)
 * Mobile-First Redesign with Enhanced Contrast
 * 
 * Key Changes:
 * - Darker background base for better neon contrast
 * - Mobile-optimized spacing and typography
 * - Enhanced glow effects that work on small screens
 * - Clean visual hierarchy with better readability
 * - Premium feel with strategic whitespace
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import {
  ArrowLeft, ArrowRight, Sparkles, Camera, X, Plus,
  User, Calendar, MapPin, Heart, Moon, Briefcase,
  Users as UsersIcon, Target, Loader2, Check, ChevronRight,
  Coffee, UtensilsCrossed, PawPrint, Dumbbell, Laptop, MoonStar,
  Palette, Sparkle, Plane, Music, BookOpen, Gamepad2,
  ChefHat, Leaf, Shirt, Film, Wind
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ─── Design System ───────────────────────────────────────────────────────────
const colors = {
  lime: '#AAFF00',
  limeDark: '#8FCC00',
  background: '#F0F0F0',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F8F8',
  textPrimary: '#121212',
  textSecondary: '#57606A',
  textMuted: '#8B949E',
  border: '#E5E7EB',
  purple: '#9B7ED9',
  purpleDark: '#7B5EC9',
};

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
  { id: 'coffee', label: 'Specialty Coffee', labelTh: 'กาแฟสเปเชียลตี้', icon: Coffee },
  { id: 'dining', label: 'Fine Dining', labelTh: 'ร้านอาหารพรีเมียม', icon: UtensilsCrossed },
  { id: 'pets', label: 'Pet Friendly', labelTh: 'เป็นมิตรกับสัตว์เลี้ยง', icon: PawPrint },
  { id: 'fitness', label: 'Active & Fitness', labelTh: 'ฟิตเนสและกีฬา', icon: Dumbbell },
  { id: 'tech', label: 'Tech & Gadgets', labelTh: 'เทคโนโลยี', icon: Laptop },
  { id: 'nightlife', label: 'Nightlife', labelTh: 'แฮงเอาท์กลางคืน', icon: MoonStar },
  { id: 'art', label: 'Art & Culture', labelTh: 'ศิลปะและวัฒนธรรม', icon: Palette },
  { id: 'wellness', label: 'Wellness & Spa', labelTh: 'สปาและสุขภาพ', icon: Sparkle },
  { id: 'travel', label: 'Travel', labelTh: 'ท่องเที่ยว', icon: Plane },
  { id: 'music', label: 'Music', labelTh: 'ดนตรี', icon: Music },
  { id: 'reading', label: 'Reading', labelTh: 'การอ่าน', icon: BookOpen },
  { id: 'gaming', label: 'Gaming', labelTh: 'เล่นเกม', icon: Gamepad2 },
  { id: 'cooking', label: 'Cooking', labelTh: 'ทำอาหาร', icon: ChefHat },
  { id: 'photography', label: 'Photography', labelTh: 'ถ่ายรูป', icon: Camera },
  { id: 'nature', label: 'Nature & Outdoors', labelTh: 'ธรรมชาติ', icon: Leaf },
  { id: 'fashion', label: 'Fashion', labelTh: 'แฟชั่น', icon: Shirt },
  { id: 'movies', label: 'Movies', labelTh: 'ดูหนัง', icon: Film },
  { id: 'yoga', label: 'Yoga & Meditation', labelTh: 'โยคะ', icon: Wind },
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
const fontFor = (lang: 'en' | 'th') => lang === 'th' ? 'font-kanit' : 'font-sans';

// ─── Brand Logo ───────────────────────────────────────────────────────────────
const DailyStackLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ob-grad-v4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#AAFF00" />
          <stop offset="100%" stopColor="#8FCC00" />
        </linearGradient>
      </defs>
      <path d="M50 78 L18 62 L18 58 L50 74 L82 58 L82 62 Z" fill="url(#ob-grad-v4)" opacity="0.55" />
      <path d="M50 66 L18 50 L18 46 L50 62 L82 46 L82 50 Z" fill="url(#ob-grad-v4)" opacity="0.78" />
      <path d="M50 22 L82 38 L50 54 L18 38 Z" fill="url(#ob-grad-v4)" />
      <path d="M50 29 L72 39 L50 47 L28 39 Z" fill="#121212" opacity="0.25" />
    </svg>
    <span className="text-sm font-black tracking-[0.15em] uppercase">
      <span className="text-[#121212]">DAILY</span>
      <span className="text-[#AAFF00]">STACK</span>
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
      relative w-full py-4 px-6 rounded-2xl font-bold text-base
      bg-[#AAFF00] text-[#121212]
      shadow-[0_4px_20px_rgba(170,255,0,0.4)]
      hover:shadow-[0_6px_32px_rgba(170,255,0,0.5)]
      hover:-translate-y-0.5 active:translate-y-0
      disabled:opacity-40 disabled:cursor-not-allowed
      transition-all duration-300
      ${className}
    `}
  >
    {loading ? (
      <Loader2 size={20} className="animate-spin mx-auto" />
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
      <span className="text-xs font-medium text-[#57606A]">
        Step {current} of {total}
      </span>
      <span className="text-sm font-bold text-[#AAFF00]">
        {Math.round((current / total) * 100)}%
      </span>
    </div>
    <div className="relative h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#AAFF00] to-[#B8FF3A] rounded-full transition-all duration-700 ease-out"
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
              ? 'bg-[#AAFF00] w-6' 
              : step < current 
                ? 'bg-[#AAFF00] w-2' 
                : 'bg-[#E5E7EB] w-2'
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
    onClick={onClick}
    className={`
      relative w-full flex flex-col items-center justify-center gap-3 p-5 rounded-2xl
      border-2 transition-all duration-300 active:scale-[0.97]
      ${selected
        ? 'bg-[#121212] border-[#121212] shadow-[0_8px_24px_rgba(0,0,0,0.15)]'
        : 'bg-white border-[#E5E7EB] hover:border-[#AAFF00]/40 hover:shadow-[0_4px_16px_rgba(170,255,0,0.1)]'
      }
    `}
  >
    {emoji && <span className="text-3xl">{emoji}</span>}
    {children}
    {selected && (
      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#AAFF00] flex items-center justify-center">
        <Check size={12} className="text-[#121212]" strokeWidth={3} />
      </div>
    )}
  </button>
);

// ─── Interest Card ───────────────────────────────────────────────────────────
const InterestCard: React.FC<{
  label: string;
  icon: React.ElementType;
  selected: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative flex items-center gap-3 px-4 py-3 rounded-full
      border-2 transition-all duration-300 active:scale-[0.95]
      ${selected
        ? 'bg-[#AAFF00] border-[#AAFF00]'
        : 'bg-white border-[#E5E7EB] hover:border-[#AAFF00]/40'
      }
    `}
  >
    <Icon 
      size={18} 
      className={selected ? 'text-[#121212]' : 'text-[#57606A]'} 
      strokeWidth={2}
    />
    <span className={`text-sm font-medium ${selected ? 'text-[#121212]' : 'text-[#121212]'}`}>
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
const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
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
            className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5F5F5] shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            {photo.isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5]">
                <Loader2 size={24} className="animate-spin text-[#AAFF00]" />
              </div>
            ) : (
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
            
            <button
              onClick={() => onRemovePhoto(photo.id)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#121212]/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500 transition-colors"
            >
              <X size={14} />
            </button>
            
            {index === 0 && (
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-[#AAFF00] text-[10px] font-bold text-[#121212]">
                Main
              </div>
            )}
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button
            onClick={() => inputRef.current?.click()}
            className="aspect-[3/4] rounded-2xl border-2 border-dashed border-[#E5E7EB] flex flex-col items-center justify-center gap-2 hover:border-[#AAFF00] hover:bg-[#AAFF00]/5 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <Plus size={20} className="text-[#8B949E]" />
            </div>
            <span className="text-xs text-[#8B949E]">
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
      
      <p className="text-xs text-center text-[#8B949E]">
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

  // Load existing profile data
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
              <span className="inline-block font-mono text-[#AAFF00] text-xs tracking-[0.2em] uppercase font-bold">
                Step 1
              </span>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-[#121212] ${fontFor(language)}`}>
                {title}
              </h2>
              <p className="text-sm text-[#57606A]">
                {language === 'th' ? 'แบ่งปันข้อมูลพื้นฐานเกี่ยวกับตัวคุณ' : 'Share some basic information about yourself'}
              </p>
              <div className="h-1 w-12 bg-[#AAFF00] rounded-full mt-2" />
            </div>
            
            {/* Form */}
            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#121212] flex items-center gap-2">
                  <User size={16} className="text-[#AAFF00]" /> 
                  {language === 'th' ? 'ชื่อที่แสดง' : 'Display Name'}
                </label>
                <input
                  type="text"
                  value={profileData.display_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder={language === 'th' ? 'กรอกชื่อของคุณ' : 'Enter your name'}
                  className="w-full px-4 py-4 rounded-xl bg-white border-2 border-[#E5E7EB] focus:border-[#AAFF00] focus:outline-none text-[#121212] placeholder:text-[#8B949E] text-base"
                />
              </div>
              
              {/* Birth Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#121212] flex items-center gap-2">
                  <Calendar size={16} className="text-[#AAFF00]" /> 
                  {language === 'th' ? 'วันเกิด (เดือน/ปี)' : 'Birth Date (Month/Year)'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={profileData.birth_month || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, birth_month: parseInt(e.target.value) || null }))}
                    className="w-full px-4 py-4 rounded-xl bg-white border-2 border-[#E5E7EB] focus:border-[#AAFF00] focus:outline-none text-[#121212]"
                  >
                    <option value="">{language === 'th' ? 'เดือน' : 'Month'}</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                      <option key={m} value={i + 1}>{language === 'th' ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'][i] : m}</option>
                    ))}
                  </select>
                  
                  <select
                    value={profileData.birth_year || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, birth_year: parseInt(e.target.value) || null }))}
                    className="w-full px-4 py-4 rounded-xl bg-white border-2 border-[#E5E7EB] focus:border-[#AAFF00] focus:outline-none text-[#121212]"
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
                <label className="text-sm font-semibold text-[#121212]">
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
                      <span className={`text-sm font-medium ${profileData.gender === g.id ? 'text-white' : 'text-[#121212]'}`}>
                        {language === 'th' ? g.labelTh : g.label}
                      </span>
                    </OptionCard>
                  ))}
                </div>
              </div>
              
              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#121212] flex items-center gap-2">
                  <MapPin size={16} className="text-[#AAFF00]" /> 
                  {language === 'th' ? 'ประเทศ' : 'Country'}
                </label>
                <select
                  value={profileData.country}
                  onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-4 rounded-xl bg-white border-2 border-[#E5E7EB] focus:border-[#AAFF00] focus:outline-none text-[#121212]"
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
                <label className="text-sm font-semibold text-[#121212]">
                  {language === 'th' ? 'แนะนำตัว (ไม่บังคับ)' : 'Bio (optional)'}
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={language === 'th' ? 'บอกเล่าเกี่ยวกับตัวคุณ...' : 'Tell us about yourself...'}
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-4 rounded-xl bg-white border-2 border-[#E5E7EB] focus:border-[#AAFF00] focus:outline-none text-[#121212] placeholder:text-[#8B949E] resize-none text-base"
                />
                <p className="text-xs text-right text-[#8B949E]">{profileData.bio.length}/300</p>
              </div>
            </div>
          </div>
        );
        
      case 2: // Photos
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-block font-mono text-[#AAFF00] text-xs tracking-[0.2em] uppercase font-bold">
                Step 2
              </span>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-[#121212] ${fontFor(language)}`}>
                {title}
              </h2>
              <p className="text-sm text-[#57606A]">
                {language === 'th' ? 'รูปถ่ายที่ดีจะช่วยให้คุณได้รับการแมตช์มากขึ้น' : 'Good photos will help you get more matches'}
              </p>
              <div className="h-1 w-12 bg-[#AAFF00] rounded-full mt-2" />
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
              <span className="inline-block font-mono text-[#AAFF00] text-xs tracking-[0.2em] uppercase font-bold">
                Step 3
              </span>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-[#121212] ${fontFor(language)}`}>
                {title}
              </h2>
              <p className="text-sm text-[#57606A]">
                {language === 'th' ? 'ช่วยให้เราเข้าใจคุณมากขึ้น' : 'Help us understand you better'}
              </p>
              <div className="h-1 w-12 bg-[#AAFF00] rounded-full mt-2" />
            </div>
            
            <div className="space-y-6">
              {/* Sleep Schedule */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#121212] flex items-center gap-2">
                  <Moon size={16} className="text-[#AAFF00]" /> 
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
                      <div className="text-left">
                        <span className={`text-sm font-semibold block ${profileData.sleep_schedule === s.id ? 'text-white' : 'text-[#121212]'}`}>
                          {language === 'th' ? s.labelTh : s.label}
                        </span>
                        <span className={`text-xs ${profileData.sleep_schedule === s.id ? 'text-white/60' : 'text-[#8B949E]'}`}>
                          {s.desc}
                        </span>
                      </div>
                    </OptionCard>
                  ))}
                </div>
              </div>
              
              {/* Work Style */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#121212] flex items-center gap-2">
                  <Briefcase size={16} className="text-[#AAFF00]" /> 
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
                      <div className="text-left">
                        <span className={`text-sm font-semibold block ${profileData.work_style === w.id ? 'text-white' : 'text-[#121212]'}`}>
                          {language === 'th' ? w.labelTh : w.label}
                        </span>
                        <span className={`text-xs ${profileData.work_style === w.id ? 'text-white/60' : 'text-[#8B949E]'}`}>
                          {w.desc}
                        </span>
                      </div>
                    </OptionCard>
                  ))}
                </div>
              </div>
              
              {/* Social Energy */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#121212] flex items-center gap-2">
                  <UsersIcon size={16} className="text-[#AAFF00]" /> 
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
                      <div className="flex-1 text-left">
                        <span className={`text-sm font-semibold block ${profileData.social_energy === s.id ? 'text-white' : 'text-[#121212]'}`}>
                          {language === 'th' ? s.labelTh : s.label}
                        </span>
                        <span className={`text-xs ${profileData.social_energy === s.id ? 'text-white/60' : 'text-[#8B949E]'}`}>
                          {s.desc}
                        </span>
                      </div>
                    </OptionCard>
                  ))}
                </div>
              </div>
              
              {/* Relationship Goals */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#121212] flex items-center gap-2">
                  <Target size={16} className="text-[#AAFF00]" /> 
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
                      <span className={`text-sm font-medium ${profileData.relationship_goals === g.id ? 'text-white' : 'text-[#121212]'}`}>
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
              <span className="inline-block font-mono text-[#AAFF00] text-xs tracking-[0.2em] uppercase font-bold">
                Step 4
              </span>
              <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-[#121212] ${fontFor(language)}`}>
                {title}
              </h2>
              <p className="text-sm text-[#57606A]">
                {language === 'th' ? 'เลือกอย่างน้อย 3 รายการ' : 'Select at least 3 interests'}
              </p>
              <div className="h-1 w-12 bg-[#AAFF00] rounded-full mt-2" />
            </div>
            
            <div className="flex flex-wrap gap-3">
              {INTERESTS.map(interest => {
                const Icon = interest.icon;
                return (
                  <InterestCard
                    key={interest.id}
                    label={language === 'th' ? interest.labelTh : interest.label}
                    icon={Icon}
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
              <div className="flex items-center gap-2 text-sm text-[#57606A]">
                <span className="w-6 h-6 rounded-full bg-[#AAFF00] text-[#121212] text-xs font-bold flex items-center justify-center">
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
              <div className="absolute inset-0 rounded-full bg-[#AAFF00] blur-3xl opacity-30 scale-[1.2] animate-pulse" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-[#AAFF00]/20 to-[#AAFF00]/5 border-2 border-[#AAFF00] rounded-full flex items-center justify-center shadow-[0_12px_48px_rgba(170,255,18,0.35)]">
                <Sparkles size={48} className="text-[#AAFF00]" />
              </div>
            </div>
            
            {/* Success Message */}
            <div className="space-y-4">
              <h2 className={`text-4xl font-black tracking-tight text-[#121212] ${fontFor(language)}`}>
                {language === 'th' ? 'คุณพร้อมแล้ว!' : "You're All Set!"}
              </h2>
              <p className={`text-base text-[#57606A] ${fontFor(language)}`}>
                {language === 'th'
                  ? 'โปรไฟล์ของคุณเสร็จสมบูรณ์แล้ว'
                  : 'Your profile is complete. AI is starting to analyze compatibility'
                }
              </p>
            </div>
            
            {/* Summary */}
            <div className="space-y-3 text-left max-w-sm mx-auto">
              {[
                { icon: User, label: profileData.display_name || 'New User' },
                { icon: Camera, label: `${profileData.photos.length} photos` },
                { icon: Heart, label: `${profileData.interests.length} interests` },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="w-8 h-8 rounded-full bg-[#AAFF00]/10 flex items-center justify-center">
                    <item.icon size={16} className="text-[#AAFF00]" />
                  </div>
                  <span className="text-sm text-[#121212]">{item.label}</span>
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
    <div className="min-h-screen min-h-[100dvh] bg-[#F0F0F0] text-[#121212] font-sans relative">
      
      {/* ── Background Decoration ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0F0F0] via-[#F5F5F5] to-[#F8F8F8]" />
        
        {/* Top-right accent glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#AAFF00]/20 to-transparent rounded-full blur-3xl" />
        
        {/* Bottom-left accent */}
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-[#AAFF00]/15 to-transparent rounded-full blur-2xl" />
      </div>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-lg border-b border-[#E5E7EB] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            {/* Back button */}
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#121212] hover:bg-[#E5E7EB] transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            
            {/* Logo */}
            <DailyStackLogo />
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-full bg-[#F5F5F5] text-xs font-bold text-[#57606A] hover:text-[#AAFF00] transition-colors border border-transparent hover:border-[#AAFF00]/30"
            >
              <span className={language === 'en' ? 'text-[#AAFF00] font-bold' : 'opacity-50'}>EN</span>
              <span className="opacity-30 mx-1">/</span>
              <span className={language === 'th' ? 'text-[#AAFF00] font-bold' : 'opacity-50'}>TH</span>
            </button>
          </div>
          
          {/* Step Progress */}
          <StepProgress current={currentStep} total={5} language={language} />
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-[140px]">
        {renderStep()}
      </main>

      {/* ── Fixed CTA Button ───────────────────────────────────────────────── */}
      {currentStep < 5 && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-lg border-t border-[#E5E7EB] px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="max-w-lg mx-auto">
            <PrimaryButton 
              onClick={handleNext} 
              disabled={!canProceed()}
              className="w-full"
            >
              {language === 'th' ? 'ต่อไป' : 'Continue'}
              <ArrowRight size={18} />
            </PrimaryButton>
            
            {!canProceed() && (
              <p className="text-xs text-center text-[#8B949E] mt-2">
                {currentStep === 1 && (language === 'th' ? 'กรุณากรอกข้อมูลที่จำเป็น' : 'Please fill in required fields')}
                {currentStep === 2 && (language === 'th' ? 'ต้องเพิ่มรูปถ่ายอย่างน้อย 3 รูป' : 'Add at least 3 photos')}
                {currentStep === 3 && (language === 'th' ? 'กรุณาเลือกไลฟ์สไตล์ของคุณ' : 'Please select your lifestyle')}
                {currentStep === 4 && (language === 'th' ? 'เลือกความสนใจอย่างน้อย 3 รายการ' : 'Select at least 3 interests')}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* ── Complete Button ───────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-lg border-t border-[#E5E7EB] px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="max-w-lg mx-auto">
            <PrimaryButton 
              onClick={handleComplete}
              loading={loading}
              className="w-full"
            >
              {language === 'th' ? 'เริ่มสำรวจ DailyStack' : 'Start Exploring DailyStack'}
              <ArrowRight size={18} />
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;