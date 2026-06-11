# DailyStack FinTech — Zero-Button Dashboard Design Specification

**Version:** 1.0
**Based on:** Design Constitution v4.1 (The Sentient Edition)
**Author:** UX Constitution Agent
**Date:** 2026-06-10
**Status:** Ready for `ds-frontend-eng` Implementation

---

## Table of Contents

1. [Overview](#1-overview)
2. [Layout Architecture](#2-layout-architecture)
3. [Gesture Architecture](#3-gesture-architecture)
4. [Information Hierarchy (Z-axis)](#4-information-hierarchy-z-axis)
5. [Typography Scale](#5-typography-scale)
6. [Color Application](#6-color-application)
7. [Breathing Aura Spec](#7-breathing-aura-spec)
8. [AI Money Twin Message Format](#8-ai-money-twin-message-format)
9. [Motion Specifications](#9-motion-specifications)
10. [Microcopy Examples](#10-microcopy-examples)
11. [Migration Path: MVP vs Post-MVP](#11-migration-path-mvp-vs-post-mvp)
12. [Current Code Violations](#12-current-code-violations)

---

## 1. Overview

### Design Philosophy

The Zero-Button Dashboard is the embodiment of **The Sentient Interface** — a living financial organism that breathes, responds, and guides without demanding interaction. Every pixel serves a purpose; every motion communicates meaning.

**Core Principle:** The interface should feel like a calm, intelligent companion — always present, never demanding. Users do not "use" the dashboard; they coexist with it.

### What Exists Today (Baseline)

The current `Dashboard.tsx` and `DashboardHome.tsx` feature:
- Bottom tab bar (Dashboard / Cards / Rewards) — **REMOVE**
- Floating "+" button for transaction entry — **REMOVE**
- White/light sticky header — **REPLACE with #0B0F0A**
- Card-grid layout with borders and shadows — **REPLACE with gesture-first layout**
- Traditional numpad bottom sheet — **REPLACE with Swipe-Down Voice Capture**

### Target Experience

- **No visible buttons** on the main view
- **Center screen:** AI Money Twin message + Status Ring
- **All interactions:** Pure gesture-based (Swipe, Pinch, Long-Press)
- **Feel:** Like gazing into a calm financial mirror, not using an app

---

## 2. Layout Architecture

### Screen Zones (Top to Bottom)

```
┌─────────────────────────────────────────┐
│           STATUS RING (ทำนายการเงิน)        │  ← Z-axis Layer 1 (foreground)
│         AI Money Twin Message             │  ← Z-axis Layer 1 (foreground)
│                                         │
│                                         │
│     [Background: 35% opacity history]   │  ← Z-axis Layer 3
│                                         │
├─────────────────────────────────────────┤
│         Quick Entry Gesture Area         │  ← Invisible zone, bottom 20%
│           (Swipe Down to Capture)        │
└─────────────────────────────────────────┘
```

### Zone Specifications

#### Center Stage (60% of screen height)
- **AI Money Twin Message:** 1-2 sentences, vertically centered
- **Status Ring (ทำนายการเงิน):** Surrounds the message, shows financial health as glowing ring proportions
- **Z-axis:** Layer 1 (foreground), full opacity, glassmorphism glow

#### Quick Entry Gesture Area (bottom 20%)
- Invisible touch zone — no visual indicator
- **Trigger:** Swipe Down from anywhere in this zone
- **Result:** Opens Voice Capture overlay
- **Haptic:** Deep Resonance on activation

#### Context Zone (remaining 20%, top)
- **User greeting:** "สวัสดี [Name]" at 60% opacity
- **Current date/time:** 35% opacity
- **Z-axis:** Layer 2 (mid-ground)

#### Historical Layer (full screen background)
- **Opacity:** 35%
- **Content:** Transaction patterns, spending rings from past weeks
- **Blur:** Background blur (backdrop-filter: blur(20px))
- **Z-axis:** Layer 3 (deep background)

### Status Ring (ทำนายการเงิน Ring)

The Status Ring is a **360° circular visualization** of financial health.

```
        ╭──────────────╮
       ╱   AI Money     ╲
      │   Twin Message   │
      │    "วันนี้...    │
      │   [Icon: Ring]   │
       ╲   ═══════════  ╱
        ╰──────────────╯
```

**Ring Segments:**
| Segment | Color | Represents |
|---------|-------|------------|
| Savings | `#C7FF2E` (100%) | Emergency fund coverage |
| Essentials | `#C7FF2E` (80%) | Fixed expenses ratio |
| Discretionary | `#C7FF2E` (60%) | Flexible spending room |
| Warning | Amber (pulse) | Budget drift detected |

**Ring Animation:** 60 BPM breathing glow, clockwise fill on load

---

## 3. Gesture Architecture

### Gesture Map

| Gesture | Action | Trigger Zone | Result |
|---------|--------|--------------|--------|
| [Icon: SwipeDown] | Voice Capture | Bottom 20% or anywhere | Opens voice input overlay |
| [Icon: Pinch] | Zen Mode | Two fingers, anywhere | Hides all numbers, shows ring proportions only |
| [Icon: SwipeLeft] | 3-Month Projection | Full screen, horizontal | Opens Predictive Topography view |
| [Icon: SwipeRight] | Spending Memory | Full screen, horizontal | Opens Spending Memory view |
| [Icon: LongPress] | Butterfly Effect | On any expense item | Ripple + goal-shift display |

### Gesture Specifications

#### 3.1 Swipe Down — Voice Capture

**Trigger:** Finger moves down >50px from anywhere on bottom 20% zone (or pull-down gesture from top)

**What Happens:**
1. Screen dims to 40% brightness
2. A soft glowing ring expands from the gesture origin point
3. Voice waveform visualization appears (pulse lines, not bars)
4. AI Money Twin listens and processes
5. Result appears as floating card with [Icon: Checkmark] confirmation

**Haptic:** Deep Resonance (300ms) on activation

**Fallback:** If voice fails, show text-input card

**Example:**
```
User: "ใช้เงินไป 500 บาท ค่ากาแฟ"
System: Parses → Categorizes → Updates ring → AI Twin speaks result
```

#### 3.2 Pinch — Zen Mode

**Trigger:** Two-finger pinch gesture detected anywhere on screen

**What Happens:**
1. Numbers dissolve (not disappear — dissolve into particles)
2. Ring segments remain but show only proportional arcs (no values)
3. Context labels remain at 60% opacity
4. Screen calms — breathing aura slows to 40 BPM
5. "Zen Mode" label appears briefly at top, then fades

**Exit:** Pinch-out gesture (reverse pinch)

**Use Case:** Privacy in public, meditation moment, stress relief

#### 3.3 Swipe Left — 3-Month Projection (Predictive Topography)

**Trigger:** Horizontal swipe left >80px from anywhere on screen

**What Happens:**
1. Current view slides right (momentum)
2. Projected financial landscape appears:
   - Income trajectory line (dashed, `#C7FF2E`)
   - Expense projection zones (gradient fills)
   - Goal markers (milestone diamonds)
   - Risk indicators (amber pulses at danger points)
3. Time axis at bottom (Month 1, 2, 3 labels)
4. AI Money Twin message: "ใน 3 เดือนข้างหน้า..."

**Haptic:** Crisp Click at threshold, Deep Resonance on view settle

#### 3.4 Swipe Right — Spending Memory

**Trigger:** Horizontal swipe right >80px from anywhere on screen

**What Happens:**
1. Current view slides left
2. Historical spending patterns emerge:
   - Weekly spending rings (stacked, oldest at back)
   - Category breakdown as fading arc segments
   - Pattern highlights: "You spend 40% more on food during weekdays"
3. Time scrubbing: drag left/right to move through weeks

**Haptic:** Crisp Click at threshold, Deep Resonance on view settle

#### 3.5 Long Press — Butterfly Effect

**Trigger:** Press and hold on any expense item for >400ms

**What Happens:**
1. Ripple effect emanates from touch point
2. Connected expense items subtly pulse
3. Goal line on projection graph bends (if in projection view)
4. Label appears: "[Expense amount] shifts goal by [X days]"
5. Frictionless Upgrade card slides up (if applicable)

**Haptic:** Progressive haptic — light → medium → heavy over 400ms

---

## 4. Information Hierarchy (Z-axis)

### Three-Layer Depth System

```
Z-axis Depth Configuration:

Layer 1 (Foreground, Z: 0)
├── AI Money Twin message (100% opacity, #C7FF2E or White)
├── Status Ring (100% opacity, #C7FF2E fill)
├── Active decision prompt (glassmorphism glow)
└── Crisis alert (amber pulse, if needed)

Layer 2 (Mid-ground, Z: -20)
├── User greeting + date (60% opacity)
├── Context labels (60% opacity, Muted Silver)
├── Category icons (60% opacity)
└── Gesture hints (35% opacity, fade after first use)

Layer 3 (Background, Z: -40)
├── Historical spending rings (35% opacity)
├── Past transaction ghosts (25% opacity)
├── Projection lines when not focused (20% opacity)
└── Ambient background blur (backdrop-filter: blur(20px))
```

### Z-axis Animation Rules

| Transition | Animation | Duration |
|------------|-----------|----------|
| Layer 1 → Layer 2 | Opacity 100% → 60%, blur 0 → 8px | 300ms ease-out |
| Layer 2 → Layer 3 | Opacity 60% → 35%, blur 8px → 20px | 400ms ease-out |
| Layer 3 → Layer 2 | Reverse of above | 300ms ease-in |
| Focus pull (Layer 3 → 1) | Scale 0.95 → 1, opacity 35% → 100% | 350ms cubic-bezier(0.34, 1.56, 0.64, 1) |

---

## 5. Typography Scale

### Font Stack

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Primary Numbers / English | Space Grotesk | Bold (700) / Medium (500) | Balances, amounts, percentages |
| Primary Thai | Kanit | Light (300) / Regular (400) | All Thai text, AI messages |
| Critical Data | Space Grotesk | Bold (700) | Main balance (100% opacity, White or #C7FF2E) |
| Context Data | Kanit | Regular (400) | Labels, units (60% opacity, Muted Silver) |
| Historical Data | Kanit | Light (300) | Past data (35% opacity) |

### Size Scale

| Element | Size | Weight | Opacity | Line Height |
|---------|------|--------|---------|-------------|
| AI Money Twin Message | 20px | Regular (400) | 100% | 1.5 |
| Status Balance (main) | 48px | Bold (700) | 100% | 1.2 |
| Status Balance (secondary) | 24px | Medium (500) | 80% | 1.3 |
| Context Labels | 14px | Regular (400) | 60% | 1.4 |
| Unit Indicators | 12px | Regular (400) | 60% | 1.4 |
| Historical Data | 11px | Light (300) | 35% | 1.5 |
| Greeting | 16px | Regular (400) | 60% | 1.3 |

### Typography Rules

1. **Never use emoji** — use `[Icon: Name]` format exclusively
2. **Numbers always in Space Grotesk** — never mix fonts for numerals
3. **Thai text always in Kanit** — never use Space Grotesk for Thai
4. **Text alignment:** Center for primary content, left for lists
5. **Letter spacing:** Tight (-0.02em) for large numbers, normal for Thai

### Example Typography Application

```
┌─────────────────────────────────────────┐
│     สวัสดี, สมชาย    (16px, 60%, left)  │
│                                         │
│     "วันนี้ค่าใช้จ่ายอาหารลดลง 12%      │
│      จากสัปดาห์ที่แล้ว"                  │  ← 20px, Kanit Regular
│                                         │
│            ╭───────────╮                 │
│           ╱   ฿42,580   ╲               │  ← 48px, Space Grotesk Bold
│          │    คงเหลือ    │              │  ← 24px, 80%
│           ╲   ═══════   ╱               │
│            ╰───────────╯                 │
│         [Status Ring with segments]     │
│                                         │
│  ─── Historical rings at 35% ───        │
└─────────────────────────────────────────┘
```

---

## 6. Color Application

### Color Palette (Constitution v4.1)

| Role | Hex | Usage |
|------|-----|-------|
| Deep Background | `#0B0F0A` | Main screen background |
| Spatial Surface | `#171C15` | Cards, overlays, sheet backgrounds |
| Sentient Primary | `#C7FF2E` | Primary actions, positive indicators, ring fill |
| Muted Silver | `#9CA3AF` | Context labels, secondary text (60% opacity) |
| Budget Drift Warning | `#F59E0B` (Amber) | Warning states — NEVER red |
| White | `#FFFFFF` | Primary text at 100% |
| Obsidian Glass | `rgba(23, 28, 21, 0.8)` | Glassmorphism panels |

### Color Application Map

| Element | Color | Opacity/Effect |
|---------|-------|----------------|
| Screen Background | `#0B0F0A` | 100% |
| Gesture Overlay | `#171C15` | 90% with blur(20px) |
| Status Ring Fill (Healthy) | `#C7FF2E` | 100% |
| Status Ring Fill (Warning) | `#F59E0B` | Pulse rate varies by severity |
| AI Twin Message | `#FFFFFF` | 100% or `#C7FF2E` for emphasis |
| Primary Balance | `#C7FF2E` | 100% |
| Context Labels | `#9CA3AF` | 60% |
| Historical Data | `#9CA3AF` | 35% |
| Breathing Aura | `#C7FF2E` | 5-15% at 60 BPM |

### Calm Warning Protocol

**NEVER use red (`#FF0000` or `#EF4444`) for warnings.**

Budget drift uses **Amber + Pulse Rate**:

| Severity | Color | Pulse Rate | Animation |
|----------|-------|------------|-----------|
| Low | `#F59E0B` | 30 BPM | Slow breathe |
| Medium | `#F59E0B` | 60 BPM | Medium breathe |
| High | `#F59E0B` | 90 BPM | Fast breathe |
| Critical | `#F59E0B` | 120 BPM + ring shake | Urgent pulse |

---

## 7. Breathing Aura Spec

### 60 BPM Breathing System

The Breathing Aura is ambient light that surrounds key elements, pulsing at 60 BPM (beats per minute) to create a living, breathing interface.

### CSS Animation Specification

```css
/* Breathing Aura Keyframes */
@keyframes breathe-glow {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(199, 255, 46, 0.05),
      0 0 40px rgba(199, 255, 46, 0.03),
      inset 0 0 20px rgba(199, 255, 46, 0.02);
    opacity: 0.85;
  }
  50% {
    box-shadow: 
      0 0 30px rgba(199, 255, 46, 0.12),
      0 0 60px rgba(199, 255, 46, 0.06),
      inset 0 0 30px rgba(199, 255, 46, 0.04);
    opacity: 1;
  }
}

/* Applied to Status Ring container */
.status-ring-container {
  animation: breathe-glow 1s /* 60 BPM = 1s per cycle */ ease-in-out infinite;
}

/* Screen edge ambient glow */
.screen-aura {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(ellipse at 50% 0%, rgba(199, 255, 46, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%, rgba(199, 255, 46, 0.02) 0%, transparent 40%),
    radial-gradient(ellipse at 100% 100%, rgba(199, 255, 46, 0.02) 0%, transparent 40%);
  animation: breathe-glow 1s ease-in-out infinite;
}

/* Breathing slowdown when budget is healthy */
.status-ring-container.healthy {
  animation-duration: 1.5s; /* 40 BPM - relaxed state */
  box-shadow: 
    0 0 15px rgba(199, 255, 46, 0.04),
    0 0 30px rgba(199, 255, 46, 0.02);
}

/* Breathing speedup on warning */
.status-ring-container.warning {
  animation-duration: 0.67s; /* 90 BPM - alert state */
}
```

### Elements with Breathing Aura

| Element | Aura Radius | Intensity | BPM Modifier |
|---------|-------------|----------|--------------|
| Status Ring | 40px | High (15%) | Base 60 BPM |
| Screen edges | Full bleed | Low (3%) | Base 60 BPM |
| Voice capture ring | 60px | Medium (10%) | 60 BPM while listening |
| Transaction success | 30px | Burst (20%) then fade | One-time 90 BPM burst |

### Breathing Aura Response to User Actions

| Action | Aura Response |
|--------|---------------|
| User logs successful transaction | 90 BPM burst → settle to 60 BPM |
| Budget on track | Slow to 40 BPM |
| Budget drift detected | Speed to 90 BPM, amber tint |
| Enter Zen Mode | Slow to 30 BPM |
| Exit Zen Mode | Return to 60 BPM |

---

## 8. AI Money Twin Message Format

### Core Principles

1. **1-2 sentences maximum** — less is more
2. **Warm, energizing, non-judgmental** tone
3. **Use "วันนี้..." or "ในสัปดาห์นี้..."** — never "คุณควร..."
4. **Never use emoji** — use `[Icon: Name]` if icons needed
5. **Focus on insight, not instruction**

### Message Structure

```
[Observation statement]
+ [Implied positive action or neutral fact]
```

### Examples

**Good (Calm Finance):**
> "วันนี้พลังงานการเงินของคุณเสถียร — ค่าใช้จ่ายอาหารลดลง 12% จากสัปดาห์ที่แล้ว"

**Good (Encouraging):**
> "ในสัปดาห์นี้คุณใช้จ่ายอย่างมีสติ — เป้าหมายเก็บเงินขยับเข้ามา 5 วัน"

**Bad (Judgmental):**
> "คุณใช้จ่ายเกินงบ! ควรลดค่าอาหารลง 15%" [Icon: Warning]

**Bad (Instructional):**
> "คุณควรเช็คการใช้จ่ายวันนี้" [Icon: Alert]

### Message Triggers

| Trigger | Message Tone | Example Topic |
|---------|-------------|---------------|
| Good financial week | Celebrating | Savings rate, spending reduction |
| Overspending detected | Calm, supportive | Budget drift without blame |
| First-time user | Welcoming, guiding | Getting started, what to expect |
| Goal progress update | Energizing | Milestone reached, days saved |
| Monthly summary | Reflective | Patterns, insights, trends |

---

## 9. Motion Specifications

### 9.1 Liquid Data Animation (Number Transitions)

When transaction amounts update, numbers must **dissolve into particles and reform**, not snap.

```css
/* Liquid particle dissolve */
@keyframes liquid-dissolve {
  0% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0px);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
    filter: blur(2px);
    background: radial-gradient(circle, rgba(199,255,46,0.3) 0%, transparent 70%);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
    filter: blur(8px);
    background: radial-gradient(circle, rgba(199,255,46,0.1) 0%, transparent 100%);
  }
}

/* Liquid particle coalesce */
@keyframes liquid-coalesce {
  0% {
    opacity: 0;
    transform: scale(0.8);
    filter: blur(8px);
  }
  60% {
    opacity: 0.8;
    transform: scale(1.05);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0px);
  }
}

.number-update {
  animation: liquid-dissolve 200ms ease-out forwards;
}

.number-update-new {
  animation: liquid-coalesce 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: 200ms; /* Wait for dissolve */
}
```

### 9.2 Kinetic Haptics Patterns

| Event | Haptic Pattern | Duration | Intensity |
|-------|----------------|----------|-----------|
| Tap any number | Crisp Click | 10ms | Light |
| Successful transaction log | Deep Resonance | 300ms | Medium |
| High-value transaction | Haptic Mass | 500ms | Heavy, ramping |
| Swipe threshold reached | Crisp Click | 10ms | Light |
| View transition complete | Deep Resonance | 200ms | Soft |
| Long press activated | Progressive: Light → Medium | 400ms total | Escalating |
| Warning state change | Triple Crisp Click | 3 × 15ms | Medium |

### Haptic Implementation Notes

```javascript
// Crisp Click: short, sharp vibration
triggerHaptic('crisp');

// Deep Resonance: smooth, warm rumble
triggerHaptic('success'); // maps to Deep Resonance

// Haptic Mass: heavy, viscous feedback
triggerHaptic('heavy'); // maps to Haptic Mass
```

### 9.3 Transition Durations

| Transition | Duration | Easing |
|------------|----------|--------|
| View change (Swipe) | 350ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) |
| Number update (liquid) | 400ms total | See liquid keyframes |
| Layer opacity change | 300ms | ease-out |
| Zen Mode toggle | 500ms | ease-in-out |
| Ring segment fill | 600ms | cubic-bezier(0.34, 1.56, 0.64, 1) |
| Ripple effect | 400ms | ease-out |
| Breathing cycle | 1000ms (60 BPM) | ease-in-out |

### 9.4 Particle Behavior

```javascript
// Number dissolve into particles
const particleConfig = {
  count: 12,
  size: { min: 2, max: 6 },
  color: '#C7FF2E',
  velocity: { outward: 20, random: 10 },
  duration: 300,
  opacity: { start: 0.8, end: 0 }
};

// Particle coalesce configuration  
const coalesceConfig = {
  count: 12,
  size: { min: 2, max: 6 },
  targetPosition: 'center',
  duration: 400,
  delay: 200, // After dissolve completes
  opacity: { start: 0, end: 1 }
};
```

---

## 10. Microcopy Examples

### Scenario 1: Good Financial Week

**Trigger:** Spending 15% below weekly average, all goals on track

**AI Twin Message:**
> "สัปดาห์นี้พลังงานการเงินของคุณลื่นไหล — ค่าใช้จ่ายลดลง 15% จากสัปดาห์ก่อน เป้าหมายเก็บเงินเดินหน้าตามแผน"

**Visual:** Ring shows 85% healthy, breathing at 40 BPM (relaxed)

---

### Scenario 2: Overspending Detected (Budget Drift)

**Trigger:** Food spending up 25% vs weekly average

**AI Twin Message:**
> "ในสัปดาห์นี้ค่าอาหารขยับขึ้นเล็กน้อย — ไม่เป็นไร, สัปดาห์หน้าปรับเป็นจังหวะเดิมได้"

**Visual:** Ring shows amber segment for food, pulse at 60 BPM (calm attention, not alarm)

---

### Scenario 3: First-Time User (Week 1)

**Trigger:** New user, fewer than 10 transactions logged

**AI Twin Message:**
> "ยินดีต้อนรับสู่ DailyStack — วันนี้เริ่มติดตามรายจ่ายกันง่ายๆ แค่ปัดลงแล้วบอกสิ่งที่ซื้อ"

**Visual:** Ring at 50% (neutral start), subtle onboarding pulse animation

---

### Scenario 4: Goal Progress Update

**Trigger:** User is 3 days from reaching monthly savings goal

**AI Twin Message:**
> "อีก 3 วัน คุณจะถึงเป้าหมายเก็บเงินเดือนนี้ — พลังงานการเงินกำลังเร่งสปีด"

**Visual:** Ring shows goal segment almost full, pulsing at 80 BPM (excited)

---

### Scenario 5: Zen Mode Activated

**Trigger:** User enters Zen Mode

**AI Twin Message:**
> "Zen Mode — ตัวเลขถอยออก ความสงบเข้ามา"

**Visual:** Numbers dissolve, ring shows abstract proportions only

---

## 11. Migration Path: MVP vs Post-MVP

### MVP Features (June 12, 2026) — Critical Path

| Feature | Priority | Description |
|---------|----------|-------------|
| Remove Bottom Tab Bar | P0 | Replace with gesture-only navigation |
| Remove "+" Button | P0 | Replace with Swipe-Down Voice Capture |
| Dark Background | P0 | Replace white header with #0B0F0A |
| AI Money Twin Message | P0 | Center message, Constitution-compliant copy |
| Status Ring | P1 | Circular health indicator with breathing aura |
| Swipe Down Voice | P1 | Basic voice capture (can fallback to text) |
| Pinch Zen Mode | P1 | Hide numbers, show proportions |
| Liquid Number Animation | P1 | Dissolve → coalesce on update |
| Breathing Aura | P1 | 60 BPM ambient glow on ring |
| Typography Compliance | P1 | Space Grotesk + Kanit enforcement |
| Color Compliance | P0 | Replace any red with Amber |
| No Emoji | P0 | Replace all emoji with [Icon: Name] |

### Post-MVP Features (Nice to Have)

| Feature | Priority | Description |
|---------|----------|-------------|
| Swipe Left Projection | P2 | 3-month predictive topography |
| Swipe Right Memory | P2 | Historical spending patterns |
| Long Press Butterfly | P2 | Ripple + goal shift display |
| Gyroscope Glass Effect | P3 | Device tilt → light reflection shift |
| Z-axis Depth Layers | P3 | Full glassmorphism depth system |
| Haptic Mass (high-value) | P3 | Value-based haptic intensity |
| Frictionless Upgrade | P3 | Slide-to-transform pro card |
| Breathing BPM Modulation | P3 | Aura speed responds to financial health |

---

## 12. Current Code Violations

### Dashboard.tsx & DashboardHome.tsx Violations

| Location | Violation | Fix Required |
|----------|-----------|--------------|
| Line ~1836-1853 | Bottom tab bar (`<nav> fixed bottom`) | **REMOVE** — Zero-Button compliance |
| Line ~1317-1324 | Floating "+" button | **REMOVE** — Replaced by Swipe-Down |
| Line ~1301 | White header background (`bg-white/90`) | **REPLACE** with `#0B0F0A` |
| Line ~1820-1825 | Red text for negative amounts (`text-red-500`) | **REPLACE** with Amber + pulse |
| Line ~1308 | Sparkles icon (lucide) used decoratively | Replace with `[Icon: Sparkle]` if needed |
| Throughout | Emoji in comments/messages | Ensure no emoji in UI strings |
| Line ~1220-1244 | `navItems` array defines tab bar | **REMOVE** tab items |
| Line ~825 | Thai text in non-Kanit context | Ensure Kanit font family applied |

### Required Visual Changes

```tsx
// REMOVE: Bottom tab bar
<nav className="md:hidden fixed bottom-0 ...">
  {navItems.map((item) => (...))}
</nav>

// REMOVE: Plus button  
<button onClick={() => setIsLogOpen(true)} className="...">
  <Plus size={20} ... />
</button>

// REMOVE: White sticky header
<header className="sticky top-0 z-20 bg-white/90 ...">

// REPLACE: Red transaction amounts
<span className="text-xs font-black text-red-500 font-mono">
  → <span className="text-amber-500 animate-pulse">
```

---

## Appendix A: Gesture Detection Implementation Guide

```typescript
// Gesture detection thresholds
const GESTURE_THRESHOLDS = {
  swipeDown: { distance: 50, velocity: 0.5 },
  swipeLeft: { distance: 80, velocity: 0.3 },
  swipeRight: { distance: 80, velocity: 0.3 },
  pinch: { scaleThreshold: 0.8 },
  longPress: { duration: 400 }
};

// Swipe detection hook (pseudocode)
function useGestures() {
  // Track touch start position
  // Calculate delta on touch move
  // Determine gesture type on touch end
  // Dispatch appropriate action
}
```

## Appendix B: Icon Reference

All icons must use `[Icon: Name]` format. Recommended icons:

| Concept | Icon Name |
|---------|-----------|
| Warning | `[Icon: AlertTriangle]` |
| Success | `[Icon: Check]` |
| Voice | `[Icon: Mic]` |
| Settings | `[Icon: Settings]` |
| Profile | `[Icon: User]` |
| Arrow Up | `[Icon: ArrowUp]` |
| Arrow Down | `[Icon: ArrowDown]` |
| Ring/Status | `[Icon: Circle]` |
| Sparkle | `[Icon: Sparkle]` |
| Zen | `[Icon: Lotus]` |

---

*Document ends. Ready for `ds-frontend-eng` implementation handoff.*
