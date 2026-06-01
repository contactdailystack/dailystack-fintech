/**
 * DailyStack — Dashboard v8.1 (5 Psychological Life Dimensions)
 * Bulletproof Runtime Error Catching & Multi-Environment ID Fallbacks
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Shell, FadeUp } from '../components/DesignSystem';
import { EnergyService } from '../../services/energyService';
import { LearningService } from '../../services/learningService';
import { RelationshipService } from '../../services/relationshipService';
import { Goals12wkService } from '../../services/goals12wkService';
import type { Goal12wk, GoalDimension, Milestone } from '../../services/goals12wkService';

const EASE = [0.22, 1, 0.36, 1] as const;

// Universally compatible secure/insecure random ID fallback
const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const Icon = ({ name, size = 24, className = '', style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size, ...style }}>{name}</span>
);

type TabId = 'work' | 'learning' | 'relationships' | 'passions' | 'wellbeing';

const TABS: { id: TabId; label: { en: string; th: string }; description: { en: string; th: string }; icon: string }[] = [
  { 
    id: 'work', 
    label: { en: 'Work & Creation', th: 'การทำงานและการสร้างสรรค์' }, 
    description: { en: 'Build value, solve goals, drive career', th: 'การลงมือทำ การสร้างเนื้อสร้างตัว และการส่งมอบงานสำคัญ' },
    icon: 'work' 
  },
  { 
    id: 'learning', 
    label: { en: 'Learning & Growth', th: 'การเรียนรู้และพัฒนาตนเอง' }, 
    description: { en: 'Acquire skills, master AI, explore tools', th: 'การเติมความรู้และทักษะใหม่ ๆ เพื่ออัปเกรดตัวเราอย่างสม่ำเสมอ' },
    icon: 'school' 
  },
  { 
    id: 'relationships', 
    label: { en: 'Relationships & Family', th: 'ความสัมพันธ์และครอบครัว' }, 
    description: { en: 'Support family, connect friends, build loops', th: 'ขุมพลังทางใจ ดูแลคนที่รัก และการสร้างพาร์ทเนอร์ที่ดี' },
    icon: 'favorite' 
  },
  { 
    id: 'passions', 
    label: { en: 'Passions & Legacy', th: 'ความหลงใหลและสิ่งที่สร้างไว้' }, 
    description: { en: 'Side projects, personal signature, designs', th: 'โปรเจกต์จากสิ่งที่คุณอินและรักที่จะทำเพื่อทิ้งเป็นความภูมิใจ' },
    icon: 'palette' 
  },
  { 
    id: 'wellbeing', 
    label: { en: 'Personal Well-being', th: 'สุขภาพและการชาร์จพลัง' }, 
    description: { en: 'Sleep pattern, fresh energy, self-care', th: 'การพักผ่อน รักษาสุขภาพ และการชาร์จพลังงานเพื่อขับเคลื่อนชีวิต' },
    icon: 'bolt' 
  },
];

/* ── Empty state labels ── */
const GOAL_EMPTY_STATE: Record<GoalDimension, { en: string; th: string }> = {
  work: { en: 'Set your work goal for the next 12 weeks', th: 'ตั้งเป้าหมายการทำงาน 12 สัปดาห์' },
  learning: { en: 'What do you want to learn?', th: 'อยากเรียนรู้อะไร?' },
  relationships: { en: 'Build deeper connections', th: 'สร้างความสัมพันธ์ที่ลึกซึ้ง' },
  passions: { en: 'What drives your heart?', th: 'อะไรคือแรงบันดาลใจของคุณ?' },
  wellbeing: { en: 'Prioritize your health & energy', th: 'ดูแลสุขภาพและพลังงาน' },
};

/* ── 12-WEEK GOALS SECTION (Reusable for all 5 dimensions) ── */
const DimensionGoalsSection: React.FC<{ dimension: GoalDimension; lang: 'en' | 'th' }> = ({ dimension, lang }) => {
  const isThai = lang === 'th';
  const [goals, setGoals] = useState<Goal12wk[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const dbGoals = await Goals12wkService.getByDimension(dimension);
      if (dbGoals && dbGoals.length > 0) {
        setGoals(dbGoals);
        // Cache to localStorage for offline access
        localStorage.setItem(`dailystack-goals-${dimension}`, JSON.stringify(dbGoals));
      } else {
        // No DB goals — check localStorage for offline fallback only
        const storedStr = localStorage.getItem(`dailystack-goals-${dimension}`);
        if (storedStr) {
          setGoals(JSON.parse(storedStr));
        } else {
          // No goals in DB and no offline cache — show empty state
          setGoals([]);
        }
      }
    } catch (e) {
      console.warn("Goals DB error, using localStorage fallback:", e);
      const storedStr = localStorage.getItem(`dailystack-goals-${dimension}`);
      if (storedStr) {
        setGoals(JSON.parse(storedStr));
      } else {
        setGoals([]); // No fallback to demo data
      }
    }
    setLoading(false);
  }, [dimension]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleMilestoneToggle = async (goalId: string, milestoneId: string) => {
    // Optimistic UI updates
    const updatedGoals = goals.map(g => {
      if (g.id !== goalId) return g;
      const updatedMilestones = (g.milestones || []).map(m => {
        if (m.id !== milestoneId) return m;
        return { ...m, completed: !m.completed, completed_at: !m.completed ? new Date().toISOString() : undefined };
      });
      return { ...g, milestones: updatedMilestones };
    });
    setGoals(updatedGoals);
    localStorage.setItem(`dailystack-goals-${dimension}`, JSON.stringify(updatedGoals));

    try {
      if (!goalId.startsWith('mock-')) {
        await Goals12wkService.toggleMilestone(goalId, milestoneId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdvanceWeek = async (goalId: string) => {
    const updatedGoals = goals.map(g => {
      if (g.id !== goalId) return g;
      const nextWeek = Math.min(12, g.current_week + 1);
      return { ...g, current_week: nextWeek };
    });
    setGoals(updatedGoals);
    localStorage.setItem(`dailystack-goals-${dimension}`, JSON.stringify(updatedGoals));

    try {
      if (!goalId.startsWith('mock-')) {
        await Goals12wkService.advanceWeek(goalId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);

    const newGoal: Goal12wk = {
      id: `custom-${generateUUID()}`,
      user_id: 'guest',
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      dimension,
      current_week: 1,
      phase: 'planning',
      is_active: true,
      milestones: [
        { id: generateUUID(), title: isThai ? 'วางแผนและวิเคราะห์เป้าหมายหลัก' : 'Research and define core deliverables', target_week: 2, completed: false },
        { id: generateUUID(), title: isThai ? 'พัฒนาระบบและทดสอบโครงสร้างส่วนแรก' : 'Build prototype core architecture', target_week: 6, completed: false },
        { id: generateUUID(), title: isThai ? 'ตรวจสอบความสมบูรณ์และพร้อมเปิดตัว' : 'Final audit & premium release review', target_week: 12, completed: false }
      ]
    };

    const newGoalsList = [newGoal, ...goals];
    setGoals(newGoalsList);
    localStorage.setItem(`dailystack-goals-${dimension}`, JSON.stringify(newGoalsList));

    try {
      // Try to create in DB
      await Goals12wkService.create({
        title: newGoal.title,
        description: newGoal.description,
        dimension: newGoal.dimension,
        current_week: newGoal.current_week,
        phase: newGoal.phase,
        milestones: newGoal.milestones
      });
    } catch (err) {
      console.warn("DB offline, saved locally:", err);
    }

    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
    setSaving(false);
  };

  const calculateProgress = (g: Goal12wk) => {
    const milestones = g.milestones || [];
    const weekProgress = g.current_week / 12;
    const milestoneProgress = milestones.length > 0
      ? milestones.filter(m => m.completed).length / milestones.length
      : 0;
    return Math.round((weekProgress * 0.4 + milestoneProgress * 0.6) * 100);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center animate-pulse" style={{ background: 'var(--lime-soft)' }}>
            <Icon name="military_tech" size={18} className="text-[var(--lime-text)]" />
          </div>
          <h3 className="ds-heading-section text-[14px]">
            {isThai ? 'เป้าหมาย 12 สัปดาห์' : '12-Week Dimensions Goal'}
          </h3>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold text-[var(--lime-text)] flex items-center gap-1 bg-[var(--surface-4)] py-1.5 px-3 rounded-full hover:bg-[var(--surface-3)] transition-all"
        >
          <Icon name={showAddForm ? 'close' : 'add'} size={14} />
          {showAddForm ? (isThai ? 'ปิด' : 'Close') : (isThai ? 'เพิ่มเป้าหมาย' : 'New Goal')}
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-5 rounded-[28px] bg-[var(--surface-card)] border border-[var(--border-subtle)]">
              <div className="h-5 bg-[var(--surface-3)] rounded w-3/4 animate-pulse mb-3" />
              <div className="h-4 bg-[var(--surface-3)] rounded w-1/2 animate-pulse mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-[var(--surface-3)] rounded-full w-16 animate-pulse" />
                <div className="h-6 bg-[var(--surface-3)] rounded-full w-16 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && goals.length === 0 && !showAddForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateGoal}
            className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-subtle)] mb-4 overflow-hidden"
          >
            <div className="space-y-3">
              <input
                type="text"
                required
                placeholder={isThai ? 'ชื่อเป้าหมาย (เช่น พัฒนาแอปพลิเคชันมือถือ)' : 'Goal Title (e.g. Build product)'}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full p-3 rounded-[12px] bg-[var(--surface-input)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--lime)]"
              />
              <textarea
                placeholder={isThai ? 'คำอธิบายเป้าหมายความสำเร็จ...' : 'Describe your target output...'}
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-[12px] bg-[var(--surface-input)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--lime)] resize-none"
              />
              <button 
                type="submit" 
                disabled={saving}
                className="w-full py-2.5 rounded-[12px] bg-[var(--lime)] text-black font-extrabold text-xs transition-all shadow-[0_4px_12px_rgba(192,245,0,0.2)] hover:opacity-90"
              >
                {saving ? '...' : (isThai ? 'สร้างเป้าหมายรายไตรมาส' : 'Establish 12-Week Goal')}
              </button>
            </div>
          </motion.form>
        )}

      {/* Show goals when loaded and not empty */}
      {!loading && goals.length > 0 && (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = calculateProgress(goal);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-[28px] relative overflow-hidden"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="bg-[var(--lime-soft)] text-[var(--lime-text)] font-mono text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full border border-[var(--lime-glow)]">
                      Week {goal.current_week}/12 · {goal.phase}
                    </span>
                    <h4 className="text-[var(--text-primary)] text-sm font-black mt-2 leading-snug">{goal.title}</h4>
                    {goal.description && <p className="text-[11px] text-[var(--text-secondary)] mt-1">{goal.description}</p>}
                  </div>
                  <button 
                    onClick={() => handleAdvanceWeek(goal.id!)}
                    className="py-1 px-2.5 rounded-full border border-[var(--border-strong)] text-[9px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all flex items-center gap-1"
                    title={isThai ? 'เลื่อนสัปดาห์' : 'Advance week'}
                  >
                    <Icon name="arrow_forward" size={10} />
                    W+1
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)] font-mono mb-1">
                    <span>{isThai ? 'ความสำเร็จเชิงมิติ' : 'Calculated Progress'}</span>
                    <span className="font-bold text-[var(--lime-text)]">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--surface-4)] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[var(--lime)]" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    />
                  </div>
                </div>

                {/* Milestones list */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <p className="text-[9px] uppercase font-mono text-[var(--text-muted)] tracking-wider mb-2">
                    {isThai ? 'ไมล์สโตนเป้าหมาย' : 'Quarterly Milestones'}
                  </p>
                  {(goal.milestones || []).map(m => (
                    <div 
                      key={m.id} 
                      onClick={() => handleMilestoneToggle(goal.id!, m.id)}
                      className="flex items-center gap-3 p-2 rounded-xl bg-[var(--surface-2)]/[0.3] hover:bg-[var(--surface-4)]/[0.5] cursor-pointer transition-all border border-transparent hover:border-[var(--border-subtle)]"
                    >
                      <button 
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          m.completed 
                            ? 'bg-[var(--lime)] border-[var(--lime)] text-black shadow-[0_0_8px_var(--lime-glow)]' 
                            : 'border-[var(--border-strong)] text-transparent'
                        }`}
                      >
                        <Icon name="check" size={12} className="font-black" />
                      </button>
                      <span className={`text-xs ${m.completed ? 'line-through text-[var(--text-muted)] font-medium' : 'text-[var(--text-primary)] font-bold'}`}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── 1. WORK & CREATION TAB RENDER ── */
const WorkCreationSection: React.FC<{ lang: 'en' | 'th' }> = ({ lang }) => {
  const isThai = lang === 'th';
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-[28px] bg-[var(--surface-2)] border border-[var(--border-subtle)]"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-[var(--surface-4)]">
            <Icon name="work" size={20} className="text-[var(--text-primary)]" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] text-sm font-black">{isThai ? 'การทำงานและการสร้างสรรค์' : 'Work & Creation'}</h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono">DIMENSION 01 · PRO-ACTIVE FIELD</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          {isThai 
            ? 'มิติของการลุยงาน การสร้างผลงานเพื่อส่งมอบมูลค่าสูงสุด และการวางสถาปัตยกรรมธุรกิจให้แข็งแกร่ง' 
            : 'Focus on primary deliverables, execution speeds, structural value engineering, and high-impact career tasks.'}
        </p>
      </motion.div>

      <DimensionGoalsSection dimension="work" lang={lang} />
    </div>
  );
};

/* ── 2. LEARNING & GROWTH TAB (Existing Streak + 12wk goals) ── */
const LearningStreak: React.FC<{ lang: 'en' | 'th' }> = ({ lang }) => {
  const isThai = lang === 'th';
  const [today, setToday] = useState<{ minutes_learned: number; completed: boolean } | null>(null);
  const [streak, setStreak] = useState(0);
  const [weekly, setWeekly] = useState<{ day: string; minutes: number; completed: boolean }[]>([]);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [minutes, setMinutes] = useState(5);
  const [activity, setActivity] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [t, s, w, tot] = await Promise.all([
        LearningService.getToday(),
        LearningService.getActiveStreak(),
        LearningService.getWeeklySummary(),
        LearningService.getTotalMinutes(),
      ]);
      setToday(t ? { minutes_learned: t.minutes_learned, completed: t.completed ?? false } : null);
      setStreak(s || 0);
      setWeekly(w || []);
      setTotal(tot || 0);
    } catch (e) {
      console.warn("Learning loading error, default used:", e);
      setToday(null);
      setStreak(0);
      setWeekly([]);
      setTotal(0);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await LearningService.logDay(minutes, activity || undefined);
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }}
        className="rounded-[28px] p-5 relative overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'var(--lime)', filter: 'blur(60px)', opacity: 0.07 }} />
        <div className="relative z-10 text-center">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 800, color: 'var(--lime)' }}>{streak}</p>
          <p className="ds-heading-label" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            {isThai ? 'วันติดต่อกัน · เรียน 5+ นาที' : 'Day Streak · 5+ min learning'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {weekly.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: d.completed ? 'var(--lime)' : 'rgba(255,255,255,0.06)',
                    color: d.completed ? '#000' : 'var(--text-dim)',
                    fontSize: 10, fontWeight: 700,
                  }}>
                  {d.completed ? <Icon name="check" size={12} /> : null}
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: 9 }}>{dayLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-[28px] p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(192,245,0,0.12)' }}>
            <Icon name="school" size={18} className="text-[var(--lime)]" />
          </div>
          <span className="ds-heading-section text-[15px]">{isThai ? 'บันทึกความรู้' : 'Log Today'}</span>
          {today?.completed && (
            <span className="ds-badge" style={{ fontSize: 9, background: 'rgba(192,245,0,0.12)', color: 'var(--lime)', border: '1px solid rgba(192,245,0,0.2)' }}>
              <Icon name="check" size={10} /> {today.minutes_learned}min
            </span>
          )}
        </div>
        <div className="flex gap-2 mb-4 flex-wrap">
          {[5, 15, 30, 60].map(m => (
            <button
              key={m}
              onClick={() => !today && setMinutes(m)}
              disabled={!!today}
              className="flex-1 py-2.5 rounded-[14px] border text-center transition-all duration-200"
              style={{
                background: !today && minutes === m ? 'var(--lime)' : 'var(--surface-input)',
                borderColor: !today && minutes === m ? 'var(--lime)' : 'var(--border-subtle)',
                color: !today && minutes === m ? '#000' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, opacity: today ? 0.4 : 1,
              }}
            >
              {m}min
            </button>
          ))}
        </div>
        <textarea
          placeholder={isThai ? 'วันนี้เรียนอะไรทักษะใดเพิ่มเติมบ้าง?' : 'What did you learn today?'}
          value={activity} onChange={e => setActivity(e.target.value)} rows={2}
          className="w-full p-3 rounded-[16px] bg-[var(--surface-input)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--lime)] resize-none mb-4"
        />
        <button onClick={handleSave} disabled={saving || !!today} className="ds-btn-primary w-full" style={{ opacity: saving || today ? 0.6 : 1 }}>
          {today ? (isThai ? 'บันทึกแล้ว ✓' : 'Already logged ✓') : saving ? (isThai ? 'กำลังบันทึก...' : 'Saving...') : (isThai ? 'บันทึกการเรียนรู้วันนี้' : "Log Today's Learning")}
        </button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: isThai ? 'นาทีสะสมรวม' : 'Total Minutes', value: total, icon: 'schedule' },
          { label: isThai ? 'สตรีคปัจจุบัน' : 'Current Streak', value: streak, icon: 'local_fire_department' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
            className="rounded-[20px] p-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--lime)' }}>{stat.icon}</span>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</p>
            <p style={{ color: 'var(--text-dim)', fontSize: 10 }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <DimensionGoalsSection dimension="learning" lang={lang} />
    </div>
  );
};

/* ── 3. RELATIONSHIPS & FAMILY (Existing + 12wk goals) ── */
const RelationshipsTab: React.FC<{ lang: 'en' | 'th' }> = ({ lang }) => {
  const isThai = lang === 'th';
  const [relationships, setRelationships] = useState<any[]>([]);
  const [needsAttention, setNeedsAttention] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('friend');
  const [frequency, setFrequency] = useState<string>('weekly');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, na] = await Promise.all([
        RelationshipService.getAll(),
        RelationshipService.getNeedsAttention(),
      ]);
      setRelationships(r || []);
      setNeedsAttention(na || []);
    } catch (e) {
      console.warn("Relationships loading error, default used:", e);
      setRelationships([]);
      setNeedsAttention([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await RelationshipService.create({
        name: name.trim(),
        relationship_type: type as any,
        call_frequency: frequency as any,
      });
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setName('');
    setShowForm(false);
    setSaving(false);
  };

  const handleLogInteraction = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await RelationshipService.logInteraction(id, 'call', today);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const typeColors: Record<string, string> = {
    family: '#FF6B9D', partner: '#FF6B9D',
    friend: '#4ECDC4', colleague: '#FFB800',
    mentor: '#9B5DE5', other: 'var(--text-dim)',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" style={{ color: 'var(--text-dim)' }}>
        <Icon name="progress_activity" size={24} className="animate-spin" />
        <span className="ml-2 text-[13px]">{isThai ? 'กำลังประมวลผลเรดาร์...' : 'Synthesizing compatibility...'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {needsAttention.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
          className="rounded-[28px] p-4" style={{ background: 'rgba(255,107,157,0.08)', border: '1px solid rgba(255,107,157,0.2)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="notifications_active" size={18} style={{ color: '#FF6B9D' }} />
            <span className="ds-heading-section text-[13px]" style={{ color: '#FF6B9D' }}>
              {isThai ? 'ควรติดต่อและดูแล' : 'Needs Care & Attention'}
            </span>
          </div>
          <div className="space-y-2">
            {needsAttention.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-[14px] p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    {r.call_frequency} · {isThai ? 'ครั้งสุดท้าย:' : 'Last:'} {r.last_interaction || '—'}
                  </p>
                </div>
                <button onClick={() => handleLogInteraction(r.id)} className="ds-btn-primary" style={{ padding: '6px 14px', fontSize: 11 }}>
                  <Icon name="call" size={14} /> {isThai ? 'โทรหา' : 'Call'}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-[20px] border border-dashed transition-all"
          style={{ borderColor: 'rgba(192,245,0,0.3)', color: 'var(--lime)', fontSize: 13, fontWeight: 600, background: 'rgba(192,245,0,0.02)' }}
        >
          <Icon name="add" size={18} />
          {isThai ? 'เพิ่มความสัมพันธ์สำคัญ' : 'Add Strategic Bond'}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
        >
          <p className="ds-heading-section text-[15px] mb-4">{isThai ? 'เพิ่มสายสัมพันธ์ใหม่' : 'New Strategic Connection'}</p>
          <input
            placeholder={isThai ? 'ระบุชื่อครอบครัว / เพื่อน / เพื่อนร่วมงาน' : 'Name of contact'}
            value={name} onChange={e => setName(e.target.value)}
            className="w-full p-3 rounded-[16px] bg-[var(--surface-input)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--lime)] mb-3"
          />
          <div className="flex flex-wrap gap-2 mb-3">
            {['friend', 'family', 'partner', 'colleague', 'mentor', 'other'].map(t => (
              <button key={t} onClick={() => setType(t)} className="px-3 py-1.5 rounded-[12px] text-[11px] font-bold border transition-all"
                style={{
                  background: type === t ? typeColors[t] : 'var(--surface-input)',
                  borderColor: type === t ? typeColors[t] : 'var(--border-subtle)',
                  color: type === t ? '#000' : 'var(--text-secondary)',
                }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {['daily', 'weekly', 'biweekly', 'monthly', 'quarterly'].map(f => (
              <button key={f} onClick={() => setFrequency(f)} className="px-3 py-1.5 rounded-[12px] text-[11px] font-bold border transition-all"
                style={{
                  background: frequency === f ? 'var(--lime)' : 'var(--surface-input)',
                  borderColor: frequency === f ? 'var(--lime)' : 'var(--border-subtle)',
                  color: frequency === f ? '#000' : 'var(--text-secondary)',
                }}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-[16px] border text-[13px]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              {isThai ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button onClick={handleCreate} disabled={saving || !name.trim()} className="flex-1 ds-btn-primary" style={{ opacity: saving || !name.trim() ? 0.6 : 1 }}>
              {saving ? '...' : (isThai ? 'เพิ่มความสัมพันธ์' : 'Add Bond')}
            </button>
          </div>
        </motion.div>
      )}

      {relationships.length === 0 ? (
        <div className="rounded-[28px] p-8 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--text-dim)' }}>favorite</span>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 8 }}>
            {isThai ? 'ยังไม่มีรายชื่อผู้ติดต่อสำคัญ — เริ่มสร้างสายสัมพันธ์เพื่อสนับสนุนชีวิตวันนี้' : 'No relationships monitored yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {relationships.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-[20px] p-4 flex items-center gap-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: typeColors[r.relationship_type] || 'var(--text-dim)', opacity: 0.2 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: typeColors[r.relationship_type] }}>
                  {r.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  {r.relationship_type} · {isThai ? 'คุยกันทุก:' : 'Sync:'} {r.call_frequency}
                  {r.last_interaction && ` · ${isThai ? 'ล่าสุด:' : 'Last:'} ${new Date(r.last_interaction).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric' })}`}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleLogInteraction(r.id)} className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:bg-[var(--surface-4)]"
                  style={{ borderColor: 'rgba(192,245,0,0.3)', color: 'var(--lime)' }} title={isThai ? 'บันทึกโทรหา' : 'Log call'}>
                  <Icon name="call" size={16} />
                </button>
                <button onClick={() => handleLogInteraction(r.id)} className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:bg-[var(--surface-4)]"
                  style={{ borderColor: 'var(--border-mid)', color: 'var(--text-secondary)' }} title={isThai ? 'แชทส่งข้อความ' : 'Send message'}>
                  <Icon name="chat" size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <DimensionGoalsSection dimension="relationships" lang={lang} />
    </div>
  );
};

/* ── 4. PASSIONS & LEGACY TAB RENDER ── */
const PassionsLegacySection: React.FC<{ lang: 'en' | 'th' }> = ({ lang }) => {
  const isThai = lang === 'th';
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-[28px] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08]"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-[var(--surface-4)]">
            <Icon name="palette" size={20} className="text-[var(--text-primary)]" />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] text-sm font-black">{isThai ? 'ความหลงใหลและสิ่งที่สร้างไว้' : 'Passions & Legacy'}</h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-mono">DIMENSION 04 · CREATIVE SIGNATURE</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          {isThai 
            ? 'พื้นที่เพื่อเป้าหมายนอกเหนือการงานหลัก ความชอบส่วนตัว โปรเจกต์ลายเซ็นความเรียบง่าย หรือดีไซน์พรีเมียมที่สะท้อนตัวตน' 
            : 'Track side projects, custom aesthetic builds, brand concepts, creative portfolios, and signatures you leave behind.'}
        </p>
      </motion.div>

      <DimensionGoalsSection dimension="passions" lang={lang} />
    </div>
  );
};

/* ── 5. PERSONAL WELL-BEING TAB (Energy level tracker + 12wk goals) ── */
const EnergyMeter: React.FC<{ lang: 'en' | 'th' }> = ({ lang }) => {
  const isThai = lang === 'th';
  const [todayLevel, setTodayLevel] = useState(0);
  const [weekly, setWeekly] = useState<{ date: string; avg_level: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [sliderVal, setSliderVal] = useState(70);

  const loadData = useCallback(async () => {
    try {
      const [log, trend, str] = await Promise.all([
        EnergyService.getTodayLog(),
        EnergyService.getWeeklyTrend(),
        EnergyService.getStreak(),
      ]);
      if (log) setTodayLevel(log.energy_level);
      else setTodayLevel(0);
      setWeekly(trend || []);
      setStreak(str || 0);
    } catch (e) {
      console.warn("Energy loading error, default used:", e);
      setTodayLevel(0);
      setWeekly([]);
      setStreak(0);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await EnergyService.logEnergy(sliderVal, note || undefined);
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const getBarColor = (v: number) => v >= 70 ? 'var(--lime)' : v >= 40 ? '#FFB800' : '#FF4757';

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
        className="rounded-[28px] p-5 relative overflow-hidden"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="absolute rounded-full pointer-events-none" style={{ width: 150, height: 150, background: 'var(--lime)', filter: 'blur(60px)', opacity: 0.06, top: '-20%', right: '-10%' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(192,245,0,0.12)' }}>
              <Icon name="bolt" size={18} className="text-[var(--lime)]" />
            </div>
            <span className="ds-heading-section text-[15px]">{isThai ? 'สุขภาพกายใจวันนี้' : 'State Today'}</span>
            {todayLevel > 0 && (
              <span className="ds-badge" style={{ fontSize: 9, background: 'rgba(192,245,0,0.12)', color: 'var(--lime)', border: '1px solid rgba(192,245,0,0.2)' }}>
                <Icon name="check" size={10} /> {todayLevel}%
              </span>
            )}
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{isThai ? 'ระดับความชาร์จพลังงาน' : 'Recharge Energy Level'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 800, color: getBarColor(sliderVal) }}>{sliderVal}</span>
            </div>
            <input
              type="range" min={1} max={100} value={sliderVal}
              onChange={e => setSliderVal(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, ${getBarColor(sliderVal)} ${sliderVal}%, rgba(255,255,255,0.08) ${sliderVal}%)` }}
            />
          </div>
          <textarea
            placeholder={isThai ? 'บันทึกสุขภาพกายใจ/อาการพักผ่อน...' : 'Add a note on self-care (optional)'}
            value={note} onChange={e => setNote(e.target.value)} rows={2}
            className="w-full p-3 rounded-[16px] bg-[var(--surface-input)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--lime)] resize-none mb-4"
          />
          <button onClick={handleSave} disabled={saving} className="ds-btn-primary w-full" style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? (isThai ? 'กำลังบันทึก...' : 'Saving...') : (isThai ? 'บันทึกระดับพลังงานสุขภาพ' : "Log Recharge Energy")}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-[28px] p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(192,245,0,0.12)' }}>
            <Icon name="show_chart" size={18} className="text-[var(--lime)]" />
          </div>
          <span className="ds-heading-section text-[15px]">{isThai ? 'สถิติสัปดาห์นี้' : 'Energy recharge trend'}</span>
        </div>
        {weekly.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
            {isThai ? 'ยังไม่มีสถิติสะสม — เริ่มบันทึกความฟิตวันนี้' : 'No data yet — log your first metric'}
          </p>
        ) : (
          <div className="space-y-2">
            {weekly.map((day, i) => (
              <div key={i} className="flex items-center gap-3">
                <span style={{ color: 'var(--text-dim)', fontSize: 11, width: 28, fontFamily: 'var(--font-mono)' }}>
                  {new Date(day.date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { weekday: 'short' })}
                </span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: getBarColor(day.avg_level) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${day.avg_level}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: getBarColor(day.avg_level) }}>{day.avg_level}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
        className="rounded-[28px] p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="ds-heading-label text-[var(--text-secondary)]">{isThai ? 'สตรีครักษาพลังงานฟิต' : 'Energy Balance Streak'}</p>
            <p style={{ color: 'var(--text-dim)', fontSize: 11 }}>{isThai ? 'วันต่อเนื่องที่รักษาสมดุลร่างกาย ≥ 70' : 'Consecutive days keeping wellness metric ≥ 70'}</p>
          </div>
          <div className="text-right">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 800, color: 'var(--lime)' }}>{streak}</span>
            <p style={{ color: 'var(--text-dim)', fontSize: 10 }}>{isThai ? 'วัน' : 'days'}</p>
          </div>
        </div>
      </motion.div>

      <DimensionGoalsSection dimension="wellbeing" lang={lang} />
    </div>
  );
};

/* ── Tab Bar ── */
const TabBar: React.FC<{ active: TabId; onChange: (id: TabId) => void; lang: 'en' | 'th' }> = ({ active, onChange, lang }) => {
  const isThai = lang === 'th';
  return (
    <div 
      className="flex gap-2 p-1.5 rounded-[22px] mb-6 overflow-x-auto scrollbar-none flex-nowrap relative z-10" 
      style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid var(--border-subtle)',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {TABS.map(tab => {
        const isActive = active === tab.id;
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(tab.id)}
            className="flex-shrink-0 flex items-center justify-center gap-2 py-3 px-4 rounded-[16px] transition-all duration-300"
            style={isActive ? { background: 'var(--lime)', boxShadow: '0 0 20px rgba(192,245,0,0.25)' } : { background: 'transparent' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: isActive ? '#000' : 'var(--text-secondary)' }}>{tab.icon}</span>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: isActive ? '#000' : 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
              {tab.label[isThai ? 'th' : 'en']}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

/* ── HERO ── */
const HeroSection: React.FC<{ lang: 'en' | 'th' }> = ({ lang }) => {
  const isThai = lang === 'th';
  const hour = new Date().getHours();
  const greeting = isThai
    ? (hour < 12 ? 'สวัสดีตอนเช้า' : hour < 17 ? 'สวัสดีช่วงบ่าย' : 'สวัสดีตอนเย็น')
    : (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="ds-heading-label font-mono text-[10px] text-zinc-500 tracking-widest">{greeting}</p>
          <h1 className="ds-heading-hero mt-1 text-2xl font-black font-sans tracking-tight">
            DAILY<span className="text-[var(--lime)]">STACK</span>
          </h1>
        </div>
        <div className="w-11 h-11 rounded-full flex items-center justify-center relative overflow-hidden" style={{ background: 'rgba(192,245,0,0.08)', border: '1px solid rgba(192,245,0,0.20)' }}>
          <span className="text-xs font-black text-[var(--lime)] font-sans">PK</span>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--lime-soft)] to-transparent opacity-40" />
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN DASHBOARD ───*/
export default function Dashboard() {
  const { language, setLanguage } = useLanguage();
  const [lang, setLang] = useState<'en' | 'th'>(language ?? 'en');
  const [activeTab, setActiveTab] = useState<TabId>('work');

  useEffect(() => {
    if (language) setLang(language);
  }, [language]);

  const handleLangChange = (l: 'en' | 'th') => {
    setLang(l);
    setLanguage?.(l);
  };

  const isThai = lang === 'th';
  const currentTabInfo = TABS.find(t => t.id === activeTab);

  return (
    <Shell lang={lang} onLangChange={handleLangChange} showNav showLangToggle showOrbs>
      <div className="screen">
        <FadeUp>
          <HeroSection lang={lang} />
        </FadeUp>

        {/* 5 Life Dimensions Horizontal Pill Navigation */}
        <FadeUp delay={80}>
          <TabBar active={activeTab} onChange={setActiveTab} lang={lang} />
        </FadeUp>

        {/* Dimension Context Banner */}
        {currentTabInfo && (
          <FadeUp delay={120}>
            <div className="mb-6 p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-subtle)] backdrop-blur-3xl">
              <span className="text-[9px] font-mono text-[var(--lime-text)] font-bold uppercase tracking-wider block">
                {isThai ? 'มิติชีวิตหลัก' : 'Key Life Dimension'}
              </span>
              <p className="text-xs font-bold text-[var(--text-primary)] mt-1 leading-relaxed">
                {currentTabInfo.description[isThai ? 'th' : 'en']}
              </p>
            </div>
          </FadeUp>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {activeTab === 'work' && <WorkCreationSection lang={lang} />}
            {activeTab === 'learning' && <LearningStreak lang={lang} />}
            {activeTab === 'relationships' && <RelationshipsTab lang={lang} />}
            {activeTab === 'passions' && <PassionsLegacySection lang={lang} />}
            {activeTab === 'wellbeing' && <EnergyMeter lang={lang} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Shell>
  );
}