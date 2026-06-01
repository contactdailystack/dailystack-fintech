/**
 * ================================================================
 * DailyStack — Pilo Design System Showcase v8.0
 * ================================================================
 * Demonstrates the complete Pilo Design System
 * 
 * Pilo Aesthetic:
 * - High Contrast Minimalism (60-30-10 Rule)
 * - Electric Lime (#D1FF3B) as primary accent
 * - Deep Black (#111111) for accent cards
 * - Pure White (#FFFFFF) for light mode
 * - Extreme rounded corners
 * - Soft, floating shadows
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

/* ── Icon Components ─────────────────────────────────────────── */
const Icon = ({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>
    {name}
  </span>
);

/* ── Progress Ring Component ──────────────────────────────────── */
const ProgressRing = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  accent = 'var(--pilo)'
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  accent?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="ds-progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="ds-progress-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="ds-progress-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: accent }}
        />
      </svg>
      <div className="ds-progress-ring-text">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

/* ── Main Showcase Component ──────────────────────────────────── */
export const PiloDesignShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('colors');

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-base)] border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black tracking-tight">
                DailyStack <span className="inline-flex items-center rounded-full bg-[var(--pilo-surface)] px-2 py-0.5 text-sm font-bold">PILO</span>
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Design System v8.0</p>
            </div>
            <div className="ds-badge ds-badge-pilo">Premium</div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[73px] z-40 bg-[var(--bg-base)] border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-5">
          <div className="ds-notion-pill-container py-3">
            {['colors', 'buttons', 'cards', 'inputs', 'navigation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`ds-notion-pill capitalize ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-5 py-8 space-y-10">
        
        {/* ═══════════════════════════════════════════════════════
            COLORS SECTION
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'colors' && (
          <section className="space-y-8">
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold mb-2">Color System</h2>
              <p className="text-[var(--text-secondary)]">Pilo uses a high-contrast palette with Electric Lime (#D1FF3B) as the hero accent.</p>
            </div>

            {/* Primary Palette */}
            <div className="space-y-4 animate-fade-up stagger-1">
              <h3 className="text-lg font-semibold">Primary — Pilo Lime</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: 'Default', hex: '#D1FF3B', class: 'bg-[#D1FF3B]' },
                  { name: 'Light', hex: '#E8FF7A', class: 'bg-[#E8FF7A]' },
                  { name: 'Dark', hex: '#B8E600', class: 'bg-[#B8E600]' },
                  { name: 'Surface', hex: '10%', class: 'bg-[rgba(209,255,59,0.10)] border border-[var(--border-mid)]' },
                ].map((color) => (
                  <div key={color.name} className="text-center">
                    <div className={`h-20 rounded-xl ${color.class} mb-2`} />
                    <p className="text-xs font-medium">{color.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{color.hex}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Surface Colors */}
            <div className="space-y-4 animate-fade-up stagger-2">
              <h3 className="text-lg font-semibold">Surface System</h3>
              <div className="grid grid-cols-5 gap-3">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div key={level} className="text-center">
                    <div 
                      className="h-16 rounded-xl mb-2 border border-[var(--border-subtle)]" 
                      style={{ background: `var(--surface-${level})` }} 
                    />
                    <p className="text-xs font-medium">Surface {level}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Card */}
            <div className="space-y-4 animate-fade-up stagger-3">
              <h3 className="text-lg font-semibold">Surface Black — Pilo Signature</h3>
              <div className="ds-card-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[#A3A3A3]">Weekly Progress</p>
                    <p className="text-4xl font-black mt-1">87%</p>
                  </div>
                  <div className="ds-badge ds-badge-pilo">On Track</div>
                </div>
                <div className="ds-progress-bar-track">
                  <div className="ds-progress-bar-fill" style={{ width: '87%' }} />
                </div>
              </div>
            </div>

            {/* Life Dimensions */}
            <div className="space-y-4 animate-fade-up stagger-4">
              <h3 className="text-lg font-semibold">Life Dimensions</h3>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { name: 'Work', color: '#D1FF3B' },
                  { name: 'Learning', color: '#5BE89C' },
                  { name: 'Social', color: '#FF7EAD' },
                  { name: 'Passions', color: '#A78BFA' },
                  { name: 'Wellbeing', color: '#FBBF24' },
                ].map((dim) => (
                  <div key={dim.name} className="text-center">
                    <div 
                      className="h-16 rounded-xl mb-2 flex items-center justify-center"
                      style={{ background: `${dim.color}20`, border: `1px solid ${dim.color}40` }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ background: dim.color }}
                      />
                    </div>
                    <p className="text-xs font-medium">{dim.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="space-y-4 animate-fade-up stagger-5">
              <h3 className="text-lg font-semibold">Semantic Colors</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: 'Success', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
                  { name: 'Warning', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
                  { name: 'Error', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
                  { name: 'Info', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
                ].map((sem) => (
                  <div key={sem.name} className="text-center">
                    <div 
                      className="h-16 rounded-xl mb-2 flex items-center justify-center"
                      style={{ background: sem.bg, border: `1px solid ${sem.color}30` }}
                    >
                      <div className="ds-status-dot" style={{ background: sem.color }} />
                    </div>
                    <p className="text-xs font-medium" style={{ color: sem.color }}>{sem.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            BUTTONS SECTION
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'buttons' && (
          <section className="space-y-8">
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold mb-2">Buttons</h2>
              <p className="text-[var(--text-secondary)]">Pill-shaped buttons with subtle glow effects on hover.</p>
            </div>

            {/* Primary Buttons */}
            <div className="space-y-4 animate-fade-up stagger-1">
              <h3 className="text-lg font-semibold">Primary</h3>
              <div className="ds-card p-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <button className="ds-btn ds-btn-primary">Primary Button</button>
                  <button className="ds-btn ds-btn-primary" disabled>Disabled</button>
                </div>
                <p className="text-sm text-[var(--text-muted)]">Full Pilo accent with glow shadow on hover.</p>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="space-y-4 animate-fade-up stagger-2">
              <h3 className="text-lg font-semibold">Secondary & Ghost</h3>
              <div className="ds-card p-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <button className="ds-btn ds-btn-secondary">Secondary</button>
                  <button className="ds-btn ds-btn-ghost">Ghost</button>
                </div>
                <p className="text-sm text-[var(--text-muted)]">Subtle borders, no fill.</p>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="space-y-4 animate-fade-up stagger-3">
              <h3 className="text-lg font-semibold">Icon Buttons</h3>
              <div className="ds-card p-6">
                <div className="flex items-center gap-4">
                  <button className="ds-btn-icon ds-btn-icon-lg">
                    <Icon name="add" size={28} />
                  </button>
                  <button className="ds-btn-icon">
                    <Icon name="settings" size={22} />
                  </button>
                  <button className="ds-btn-icon ds-btn-icon-sm">
                    <Icon name="close" size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Button Sizes */}
            <div className="space-y-4 animate-fade-up stagger-4">
              <h3 className="text-lg font-semibold">FAB & Large</h3>
              <div className="ds-card p-6">
                <div className="flex items-center gap-4">
                  <button className="ds-fab">
                    <Icon name="add" size={28} />
                  </button>
                  <button className="ds-btn ds-btn-primary" style={{ minHeight: '60px', padding: '18px 36px', fontSize: '1.125rem' }}>
                    Large Button
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            CARDS SECTION
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'cards' && (
          <section className="space-y-8">
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold mb-2">Cards</h2>
              <p className="text-[var(--text-secondary)]">Multiple card variants with Pilo's signature floating effect.</p>
            </div>

            {/* Base Cards */}
            <div className="grid grid-cols-2 gap-4 animate-fade-up stagger-1">
              <div className="ds-card">
                <p className="text-sm font-semibold mb-1">Base Card</p>
                <p className="text-xs text-[var(--text-muted)]">Standard elevated surface</p>
              </div>
              <div className="ds-card-elevated">
                <p className="text-sm font-semibold mb-1">Elevated Card</p>
                <p className="text-xs text-[var(--text-muted)]">Hover for lift effect</p>
              </div>
            </div>

            {/* Dark Card */}
            <div className="ds-card-dark animate-fade-up stagger-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-bold">Dark Card</p>
                <div className="ds-status-dot ds-status-dot-success pulse" />
              </div>
              <p className="text-sm text-[#A3A3A3]">High contrast accent for key information.</p>
            </div>

            {/* Glow Card */}
            <div className="ds-card-glow animate-fade-up stagger-3">
              <p className="text-lg font-bold mb-2">Glow Card</p>
              <p className="text-sm text-[var(--text-secondary)]">Subtle Pilo accent glow on border.</p>
            </div>

            {/* Hero Card */}
            <div className="ds-hero-card animate-fade-up stagger-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase tracking-wider">Weekly Overview</p>
                  <h3 className="text-3xl font-black mt-1">Hello, User</h3>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black">78%</p>
                  <p className="text-xs text-[#A3A3A3]">Complete</p>
                </div>
              </div>
              <div className="ds-progress-bar-track h-3">
                <div className="ds-progress-bar-fill h-full" style={{ width: '78%' }} />
              </div>
            </div>

            {/* Goal Card */}
            <div className="ds-goal-card animate-fade-up stagger-5">
              <div className="ds-goal-card-header">
                <div>
                  <p className="ds-goal-card-title">Complete Morning Routine</p>
                  <p className="ds-goal-card-subtitle">
                    <span className="ds-status-dot ds-status-dot-success" />
                    On Track
                  </p>
                </div>
                <button className="ds-goal-card-action">
                  <Icon name="check" size={20} />
                </button>
              </div>
              <div className="ds-goal-card-progress">
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                  <span>Progress</span>
                  <span>3/5 tasks</span>
                </div>
                <div className="ds-progress-bar-track h-2">
                  <div className="ds-progress-bar-fill" style={{ width: '60%' }} />
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="ds-bento-grid ds-bento-grid-3 animate-fade-up stagger-6">
              {[
                { value: '12', label: 'Goals' },
                { value: '87%', label: 'Progress' },
                { value: '+15%', label: 'Growth' },
              ].map((stat) => (
                <div key={stat.label} className="ds-stat-card">
                  <p className="ds-stat-value">{stat.value}</p>
                  <p className="ds-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="space-y-4 animate-fade-up">
              <h3 className="text-lg font-semibold">Badges</h3>
              <div className="flex flex-wrap gap-3">
                <span className="ds-badge ds-badge-pilo">Pilo Badge</span>
                <span className="ds-badge ds-badge-dark">Dark Badge</span>
                <span className="ds-badge ds-badge-muted">Muted</span>
                <span className="ds-badge ds-badge-success">Success</span>
                <span className="ds-badge ds-badge-warning">Warning</span>
                <span className="ds-badge ds-badge-error">Error</span>
              </div>
            </div>

            {/* Micro Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="ds-micro-badge ds-micro-badge-gold">PRO</span>
              <span className="ds-micro-badge ds-micro-badge-blue">NEW</span>
              <span className="ds-micro-badge ds-micro-badge-green">LIVE</span>
              <span className="ds-micro-badge ds-micro-badge-purple">AI</span>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            INPUTS SECTION
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'inputs' && (
          <section className="space-y-8">
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold mb-2">Inputs</h2>
              <p className="text-[var(--text-secondary)]">Clean input fields with Pilo accent on focus.</p>
            </div>

            {/* Text Inputs */}
            <div className="space-y-4 animate-fade-up stagger-1">
              <h3 className="text-lg font-semibold">Text Input</h3>
              <div className="ds-card p-6 space-y-4">
                <input 
                  type="text" 
                  className="ds-input" 
                  placeholder="Enter your name..."
                />
                <input 
                  type="text" 
                  className="ds-input ds-input-error" 
                  placeholder="Error state example"
                />
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-4 animate-fade-up stagger-2">
              <h3 className="text-lg font-semibold">OTP Input</h3>
              <div className="ds-card p-6">
                <div className="flex justify-center">
                  <div className="ds-otp-container">
                    {[1, 2, 3, 4].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        className="ds-otp-cell"
                        defaultValue={i === 1 ? '5' : ''}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4 animate-fade-up stagger-3">
              <h3 className="text-lg font-semibold">Progress Bar</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <div className="ds-progress-bar-track">
                    <div className="ds-progress-bar-fill" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                    <span>With Glow</span>
                    <span>60%</span>
                  </div>
                  <div className="ds-progress-bar-track">
                    <div className="ds-progress-bar-fill animate-pulse-glow" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Ring */}
            <div className="space-y-4 animate-fade-up stagger-4">
              <h3 className="text-lg font-semibold">Progress Ring</h3>
              <div className="ds-card p-6 flex justify-center">
                <ProgressRing progress={78} size={140} strokeWidth={10} />
              </div>
            </div>

            {/* Language Toggle */}
            <div className="space-y-4 animate-fade-up stagger-5">
              <h3 className="text-lg font-semibold">Language Toggle</h3>
              <div className="ds-card p-6">
                <div className="ds-lang-toggle inline-flex">
                  <button className="ds-lang-btn active">EN</button>
                  <button className="ds-lang-btn">TH</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            NAVIGATION SECTION
        ═══════════════════════════════════════════════════════ */}
        {activeTab === 'navigation' && (
          <section className="space-y-8">
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold mb-2">Navigation</h2>
              <p className="text-[var(--text-secondary)]">Pilo-style floating navigation with pill-shaped items.</p>
            </div>

            {/* Bottom Nav */}
            <div className="space-y-4 animate-fade-up stagger-1">
              <h3 className="text-lg font-semibold">Floating Bottom Nav</h3>
              <div className="relative">
                <div className="h-32 bg-[var(--surface-2)] rounded-2xl flex items-end justify-center pb-4">
                  <nav className="ds-bottom-nav relative">
                    {[
                      { icon: 'home', label: 'Home', active: true },
                      { icon: 'checklist', label: 'Tasks', active: false },
                      { icon: 'payments', label: 'Value', active: false },
                      { icon: 'person', label: 'Profile', active: false },
                    ].map((item) => (
                      <button key={item.label} className={`ds-nav-item ${item.active ? 'active' : ''}`}>
                        <span className="material-symbols-outlined">
                          {item.icon}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Part Navigation */}
            <div className="space-y-4 animate-fade-up stagger-2">
              <h3 className="text-lg font-semibold">Part Navigation</h3>
              <div className="ds-part-nav">
                {['Work', 'Learning', 'Social', 'Passions', 'Wellbeing'].map((part, i) => (
                  <button 
                    key={part} 
                    className={`ds-part-pill ${i === 0 ? 'active' : ''}`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>

            {/* Notion Pills */}
            <div className="space-y-4 animate-fade-up stagger-3">
              <h3 className="text-lg font-semibold">Notion-Style Pills</h3>
              <div className="ds-notion-pill-container">
                {['All', 'Active', 'Completed', 'Upcoming'].map((pill, i) => (
                  <button 
                    key={pill} 
                    className={`ds-notion-pill ${i === 0 ? 'active' : ''}`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Lark Icon Circles */}
            <div className="space-y-4 animate-fade-up stagger-4">
              <h3 className="text-lg font-semibold">Icon Circles</h3>
              <div className="flex items-center gap-4">
                {[
                  { icon: '💼', bg: '#D1FF3B20', border: '#D1FF3B40' },
                  { icon: '📚', bg: '#5BE89C20', border: '#5BE89C40' },
                  { icon: '💬', bg: '#FF7EAD20', border: '#FF7EAD40' },
                  { icon: '🎯', bg: '#A78BFA20', border: '#A78BFA40' },
                  { icon: '🌟', bg: '#FBBF2420', border: '#FBBF2440' },
                ].map((circle, i) => (
                  <div 
                    key={i}
                    className="ds-lark-icon-circle"
                    style={{ 
                      background: circle.bg, 
                      border: `2px solid ${circle.border}`,
                    }}
                  >
                    {circle.icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            <div className="space-y-4 animate-fade-up stagger-5">
              <h3 className="text-lg font-semibold">Empty State</h3>
              <div className="ds-empty-state ds-card">
                <span className="material-symbols-outlined ds-empty-icon">inbox</span>
                <h3 className="ds-empty-title">No tasks yet</h3>
                <p className="ds-empty-desc">Start by adding your first goal to this dimension.</p>
                <button className="ds-btn ds-btn-primary">Add First Goal</button>
              </div>
            </div>

            {/* Skeleton */}
            <div className="space-y-4 animate-fade-up stagger-6">
              <h3 className="text-lg font-semibold">Skeleton Loader</h3>
              <div className="ds-card p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="ds-skeleton ds-skeleton-circle w-12 h-12" />
                  <div className="flex-1 space-y-2">
                    <div className="ds-skeleton ds-skeleton-text w-3/4" />
                    <div className="ds-skeleton ds-skeleton-text w-1/2" />
                  </div>
                </div>
                <div className="ds-skeleton ds-skeleton-heading w-full" />
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default PiloDesignShowcase;
