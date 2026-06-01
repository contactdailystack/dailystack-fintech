import { 
  Briefcase, GraduationCap, Heart, Palette, Zap, 
  Plus, ChevronRight, Check, Settings, Flame, 
  Calendar, Target, Phone, Star, TrendingUp, 
  Users, Moon, Sun, Sparkles, PartyPopper, 
  Trophy, Medal
} from 'lucide-react';

export type PartId = 'work' | 'learning' | 'relationships' | 'passions' | 'wellbeing';

export interface PartConfig {
  id: PartId;
  icon: string;
  label: { en: string; th: string };
  labelShort: { en: string; th: string };
  accent: string;
  description: { en: string; th: string };
}

export const PARTS: PartConfig[] = [
  {
    id: 'work',
    icon: 'work',
    label: { en: 'Work & Creation', th: 'การทำงานและสร้างสรรค์' },
    labelShort: { en: 'Work', th: 'งาน' },
    accent: 'var(--accent-work)',
    description: {
      en: 'Build value, solve problems, drive your career forward.',
      th: 'มิติของการลงมือทำ การสร้างเนื้อสร้างตัว และการส่งมอบคุณค่าสูงสุด',
    },
  },
  {
    id: 'learning',
    icon: 'school',
    label: { en: 'Learning & Growth', th: 'การเรียนรู้และพัฒนา' },
    labelShort: { en: 'Learn', th: 'เรียน' },
    accent: 'var(--accent-learning)',
    description: {
      en: 'Acquire new skills, master AI, explore tools.',
      th: 'เติมความรู้และทักษะใหม่ ๆ เพื่ออัปเกรดตัวเองอย่างสม่ำเสมอ',
    },
  },
  {
    id: 'relationships',
    icon: 'favorite',
    label: { en: 'Relationships', th: 'ความสัมพันธ์' },
    labelShort: { en: 'Social', th: 'สังคม' },
    accent: 'var(--accent-social)',
    description: {
      en: 'Support family, connect friends, build meaningful bonds.',
      th: 'ขุมพลังทางใจ ดูแลคนที่รัก และสร้างความสัมพันธ์ที่ดี',
    },
  },
  {
    id: 'passions',
    icon: 'palette',
    label: { en: 'Passions & Legacy', th: 'ความหลงใหลและสิ่งที่สร้างไว้' },
    labelShort: { en: 'Create', th: 'สร้างสรรค์' },
    accent: 'var(--accent-passion)',
    description: {
      en: 'Side projects, personal signature, creative expression.',
      th: 'โปรเจกต์จากสิ่งที่อินและรักที่จะทำเพื่อสร้างลายเซ็นของตัวเอง',
    },
  },
  {
    id: 'wellbeing',
    icon: 'bolt',
    label: { en: 'Well-being', th: 'สุขภาพและพลังงาน' },
    labelShort: { en: 'Energy', th: 'พลัง' },
    accent: 'var(--accent-wellbeing)',
    description: {
      en: 'Sleep pattern, fresh energy, self-care rituals.',
      th: 'การพักผ่อน รักษาสุขภาพ และชาร์จพลังงานเพื่อขับเคลื่อนชีวิต',
    },
  },
];

export const MOCK_STATS = {
  work: { goals: 12, tasks: 8, streak: 3 },
  learning: { streak: 47, minutes: 1240, courses: 5 },
  relationships: { family: 5, friends: 12, needsAttention: 1 },
  passions: { projects: 2, ideas: 7, progress: 45 },
  wellbeing: { energy: 78, sleep: 7.3, streak: 14 },
};
