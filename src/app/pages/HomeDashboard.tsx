/**
 * ================================================================
 * DailyStack — Home Dashboard v7.0
 * ================================================================
 * 5-Part Life Dimensions System
 * Premium Mobile-first UI with Global Startup design standards
 *
 * Design Principles (Design Concept v6.5 aligned):
 * - Neon accent (#C0F500) used sparingly: 5-10% of screen
 * - Large rounded cards with subtle shadows
 * - Dark base (#1C232A) with high contrast
 * - Minimal icons, focus on typography
 * - Smooth animations, spring physics
 * - Light Mode: Clean white cards, soft shadows, pale mint bg
 * - Premium motion: Orbs, staggered entrances, ambient float
 * - Confetti-style accents for streak celebrations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { FloatingNav } from '../components/DesignSystem';
import { LarkTodoList } from '../components/LarkTodoList';
import { TodoService } from '../../services/todoService';

// Extracted Modular Components (Pilo-inspired Refactor Phase 2)
import { HeroSection } from '../components/dashboard/HeroSection';
import { PartNavigation } from '../components/dashboard/PartNavigation';
import { 
  WorkPart, LearningPart, RelationshipsPart, PassionsPart, WellbeingPart 
} from '../components/dashboard/DimensionParts';
import type { PartId } from '../components/dashboard/DashboardTypes';

// ═══════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function HomeDashboard() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<'en' | 'th'>(language ?? 'en');
  const [activePart, setActivePart] = useState<PartId>('work');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTodoBoard, setShowTodoBoard] = useState<boolean>(false);
  const [activeTasksCount, setActiveTasksCount] = useState<number>(0);

  const refreshTasksCount = async () => {
    const count = await TodoService.getActiveTasksCount();
    setActiveTasksCount(count);
  };

  useEffect(() => {
    refreshTasksCount();
  }, []);

  useEffect(() => {
    if (language) setLang(language);
  }, [language]);

  const handleLangChange = (l: 'en' | 'th') => {
    setLang(l);
    setLanguage?.(l);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className="phone-frame"
      data-theme={theme}
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Main Content */}
      <div className="screen">
        {/* Hero Section */}
        <HeroSection
          lang={lang}
          onThemeToggle={toggleTheme}
          isDark={isDark}
        />

        {/* Part Navigation */}
        <PartNavigation
          active={activePart}
          onChange={setActivePart}
          lang={lang}
        />

        <div className="pt-4">
          {activePart === 'work' && (
            <WorkPart 
              lang={lang} 
              onAddGoal={() => setShowAddModal(true)} 
              activeTasksCount={activeTasksCount}
              onTasksClick={() => setShowTodoBoard(true)}
            />
          )}
          {activePart === 'learning' && <LearningPart lang={lang} />}
          {activePart === 'relationships' && <RelationshipsPart lang={lang} />}
          {activePart === 'passions' && <PassionsPart lang={lang} />}
          {activePart === 'wellbeing' && <WellbeingPart lang={lang} />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <FloatingNav />

      {/* Lark To Do List sliding board */}
      <LarkTodoList 
        isOpen={showTodoBoard} 
        onClose={() => {
          setShowTodoBoard(false);
          refreshTasksCount();
        }} 
        lang={lang} 
      />

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowAddModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg bg-[var(--surface-1)] rounded-t-xl p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-[var(--surface-4)] rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold mb-4">
              {lang === 'th' ? 'เพิ่มเป้าหมายใหม่' : 'Add New Goal'}
            </h3>
            <button
              className="w-full py-4 rounded-xl bg-[var(--neon)] text-[var(--text-inverse)] font-bold"
              onClick={() => setShowAddModal(false)}
            >
              {lang === 'th' ? 'บันทึก' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
