import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabaseClient';

interface EditProfileScreenProps {
  email: string;
  onComplete: (data: any) => void;
}

interface LifestyleOption {
  id: string;
  label: string;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ email, onComplete }) => {
  const { t } = useLanguage();
  const [name, setName] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const lifestyleOptions: LifestyleOption[] = [
    { id: 'pet_lover', label: 'Pet Lover' },
    { id: 'cafe_hopper', label: 'Cafe Hopper' },
    { id: 'wellness', label: 'Wellness & Health' },
    { id: 'tech', label: 'Tech Gadgets' },
    { id: 'camping', label: 'Camping & Outdoor' },
    { id: 'foodie', label: 'Foodie' }
  ];

  const toggleInterest = (id: string): void => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim()) return;
    setIsSubmitting(true);

    try {
      // ดึงข้อมูล ID ของผู้ใช้งานปัจจุบันที่กำลังล็อกอินค้างอยู่ในเซสชัน
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ไม่พบข้อมูลเซสชันผู้ใช้งานกรุณาเข้าสู่ระบบใหม่อีกครั้งครับ');

      // ────────────────────────────────────────────────────────
      // 🔥 SUPABASE DATABASE: UPSERT USER PROFILE & TAGS
      // ────────────────────────────────────────────────────────
      const { error: dbError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: email,
        display_name: name.trim(),
        birthday: birthday || null,
        lifestyle_interests: selectedInterests,
        updated_at: new Date().toISOString()
      });

      if (dbError) throw dbError;

      // ส่งมอบออบเจกต์สำเร็จรูปกลับไปแสดงผลหน้าสุดท้ายที่ AppRoutes
      onComplete({ email, name: name.trim(), birthday, interests: selectedInterests });
    } catch (err: any) {
      console.error('Supabase Profile Upsert Failure:', err.message || err);
      alert('เกิดข้อผิดพลาดในการบันทึกประวัติข้อมูลสมาชิกครับ กรุณาลองใหม่อีกครั้งครับ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-2 tracking-tight">
          {t('editProfileTitle')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('editProfileSub')}
        </p>
      </div>

      <div className="space-y-6 text-left">
        <div className="relative">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t('displayName')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--color-dark-input)] border border-[var(--color-dark-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary-glow)] rounded-xl text-[var(--color-text-main)] font-space text-base px-4 py-3 outline-none focus:ring-4 transition-all"
            placeholder="John Doe"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">{t('birthday')}</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full bg-[var(--color-dark-input)] border border-[var(--color-dark-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary-glow)] rounded-xl text-[var(--color-text-main)] font-space text-base px-4 py-3 outline-none focus:ring-4 transition-all [color-scheme:dark]"
          />
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">{t('lifestyle')}</label>
          <div className="flex flex-wrap gap-2.5">
            {lifestyleOptions.map(option => {
              const isSelected = selectedInterests.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleInterest(option.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    isSelected 
                      ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)] shadow-[0_0_10px_rgba(86,190,137,0.2)] transform scale-105' 
                      : 'bg-[var(--color-dark-input)] border-[var(--color-dark-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-dark-bg)] font-space font-semibold text-base py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-[var(--color-dark-bg)]/30 border-t-[var(--color-dark-bg)] rounded-full animate-spin" />
            ) : (
              <span>{t('saveChanges')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};