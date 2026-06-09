# EXECUTIVE ORDER No. EO-2026-0608-001
## DAILYSTACK FINTECH — LAUNCH COMMAND CENTER
## CORRECTED — Target: D:\Coding Folder\dailystack-fintech

**Date:** 8 June 2026
**From:** AI CEO, DailyStack FinTech (PicksWise)
**To:** AI Chief of Staff, All Division Heads
**Re:** P0 Task Distribution — Target: Launch June 12, 2026
**Authority:** Master Constitution SSOT v3.4
**Project Root:** D:\Coding Folder\dailystack-fintech

---

## PREAMBLE

Final Founder Rule: ห้ามออกแบบระบบโดยถามว่า "Transaction นี้มีมูลค่าเท่าไร" เพียงอย่างเดียว ให้ถามเสมอว่า **"Transaction นี้กำลังบอกอะไรเกี่ยวกับพฤติกรรมของผู้ใช้ และเราจะช่วยให้เขาตัดสินใจดีขึ้นได้อย่างไร"**

แพลตฟอร์มคือ **AI-Native Financial Operating System** ไม่ใช่แอปบันทึกรายรับรายจ่ายทั่วไป

**Design System Constraints:**
- Background: #0B0F0A
- Surface: #171C15
- Primary: #C7FF2E
- Text Primary: #FFFFFF
- Font EN + Numbers: Space Grotesk
- Font TH: Kanit
- Iconography: [Icon: Name] เท่านั้น — ห้ามอิโมจิเด็ดขาด
- Aesthetic: Premium Minimalist, Luxury Japanese, Calm Finance

**Project Root:** D:\Coding Folder\dailystack-fintech

---

## CURRENT STATE ASSESSMENT

### Already Implemented (Keep)
- WeeklyStoryPage.tsx — Storytelling approach [OK]
- AICoachPage.tsx — AI Coach with archetypes [OK]
- PaywallPage.tsx — Premium tier [NEEDS UPDATE to BASIC/PRO/ELITE]
- ActivityPage.tsx — Adaptive form + emotion tracking [OK]
- DashboardPage.tsx — Behavior Score + sparklines [OK]
- InsightsPage.tsx — Analytics [OK]
- types.ts — Emotion + Behavioral layers [OK]
- 11 SQL migrations (001-011) [OK]

### Gaps to Fill
1. Alternative Assets Service — Gold, Mutual Funds, Bonds, Crypto
2. FBIS Calculation Logic — Base 1000, XP, Streak Multiplier, AI Coach
3. Tier Architecture Update — Premium OS → BASIC/PRO/ELITE
4. Adaptive Transaction Form — "วันนี้เกิดอะไรขึ้น?" conversational flow
5. PaywallGate Component — Feature gate for tier access
6. CoachSettings Page — Persona selection
7. IDOR Security Fix — cancellationService

---

## DIVISION 1 — [Icon: Target] AI CHIEF OF STAFF (Orchestrator)

- กุมบังเหียนไทม์ไลน์ให้เสร็จก่อน 12 มิถุนายน 2026
- ประสาน Product + Tech + AI ไม่ให้คอขวด
- รายงาน Milestone ทุก 24 ชั่วโมง

**Launch Checklist by June 11:**
- [ ] Adaptive Transaction Form
- [ ] Weekly Money Story (verify existing implementation)
- [ ] Emotional Spending Tracker (verify existing ActivityPage)
- [ ] AI Coach + FBIS Integration
- [ ] BASIC/PRO/ELITE Tier Architecture
- [ ] Upgrade Flow + Paywall
- [ ] Design System Compliance Audit
- [ ] Security Audit Sign-off

---

## DIVISION 2 — [Icon: Chart Up] PRODUCT & UX DIVISION

### UX Researcher + Design QA

**Design System Audit — CONFIRMED ALREADY:**
- ตรวจสอบ WeeklyStoryPage.tsx: ใช้ #C7FF2E ถูกต้อง [PASS]
- ตรวจสอบ PaywallPage.tsx: Primary color #C7FF2E [PASS]
- ตรวจสอบ DashboardPage.tsx: Primary color #C7FF2E [PASS]
- ตรวจสอบ ActivityPage.tsx: Emotion chips + adaptive form [PASS]

**Remaining Design Tasks:**
- Emoji audit ทั้ง project — ห้ามอิโมจิ
- Font audit — ต้องเป็น Space Grotesk + Kanit
- Dark theme verification — #0B0F0A base

---

## DIVISION 3 — [Icon: Building] ENGINEERING & ARCHITECTURE DIVISION

### 3.1 [Icon: Database] Database QA — Schema Check

**Files to audit:**
- app/src/data/mockFintechData.ts (mock data structure)
- supabase/migrations/ (existing 11 migrations)

**Actions:**
1. Add billing_cycle column to user_subscriptions (migration 012)
2. Create alternative_assets table (migration 013)
3. Create emotional_context table (migration 014)
4. Create fbis_meta table (migration 015)
5. Create user_financial_profiles table (migration 016)

### 3.2 [Icon: Gear] Engineering QA — Tier Update

**Task: Update PaywallPage.tsx to BASIC/PRO/ELITE**

Current: Premium OS (monthly $19.99 / yearly $11.99)
Target: BASIC (Free) / PRO (99 THB/mo) / ELITE (199 THB/mo)

Update:
- Replace price constants
- Update tier names and positioning
- Update feature lists per Constitution v3.4 Section 9
- Add BASIC tier card (free)
- Update "Premium OS" text to "ELITE"

### 3.3 [Icon: Building] Solution Architect — Services

**Create: app/src/services/alternativeAssetsService.ts**
- CRUD for gold, mutual_fund, bond, crypto, other
- User isolation via auth.uid()

**Create: app/src/core/fbis.ts**
- Base Score = 1000
- +50 XP: ลด Impulse Spending ตามเป้าต่อสัปดาห์
- +20 XP/week: บันทึกต่อเนื่อง (Streak > 7 days)
- +100 XP: บรรลุ Milestone การออมเงิน
- -10 XP: Budget Drift
- AI Warning (ไม่หักแต้ม): Emotional Spending สูงกว่าค่าเฉลี่ย
- Streak Multiplier: 1.0x (3 วัน) → 2.0x (60+ วัน)

**Create: app/src/services/userTierService.ts**
- getUserTier(), getTierInfo(), canAccessFeature()
- BASIC: awareness, tracking, basic_budget
- PRO: + emotional_tracker, weekly_story, ai_coach_basic, fbis
- ELITE: + alternative_assets, advanced_analytics, priority_support

### 3.4 [Icon: Shield] Security QA — IDOR Fix

**Priority: CRITICAL**
- ไฟล์: cancellationService ที่มี IDOR via userId parameter
- Fix: ใช้ auth.uid() แทน userId parameter
- Audit: ทุก service ที่รับ userId เป็น parameter

---

## DIVISION 4 — [Icon: Rocket] GROWTH & AI DIVISION

### 4.1 [Icon: Rocket] Growth Strategist — Tier Architecture

**Revenue Architecture (per Constitution v3.4):**

| Tier | Price | Positioning |
|------|-------|-------------|
| BASIC | Free | Financial Awareness — รู้ว่าเงินไปไหน |
| PRO | 99 THB/mo | Financial Understanding — เข้าใจว่าทำไมใช้เงินแบบนี้ |
| ELITE | 199 THB/mo | Financial Transformation — เปลี่ยนพฤติกรรมด้วย AI |

**Upsell Flow:**
- หลังบันทึก 5 ครั้ง: แสดง "Upgrade เพื่อรับ AI Insight"
- Weekly Money Story: Paywall หลัง 3 สัปดาห์ (BASIC)
- Emotional Spending Tracker: PRO Feature
- AI Coach Full Personalization: ELITE Feature

### 4.2 [Icon: Robot] AI QA — FBIS + AI Coach

**Integrate FBIS into AICoachPage.tsx:**
- Import fbis.ts
- Display current FBIS score + Level
- Show streak days + XP multiplier
- Show AI recommendation based on persona
- Use getAICOachRecommendation() function

**Three Coach Personas (per Constitution):**
- [Icon: User] Coach Max (Strict) — ตรงไปตรงมา
- [Icon: Heart] Coach Mai (Supportive) — เข้าใจอารมณ์
- [Icon: Brain] Coach Jin (Analytical) — วิเคราะห์เชิงลึก

**Create: app/src/components/CoachSettings.tsx**
- Select persona: Strict / Supportive / Analytical
- Preview each persona's tone
- Save to user_preferences

### 4.3 [Icon: Handshake] Customer Success

**Create: app/src/components/PaywallGate.tsx**

```typescript
interface PaywallGateProps {
  requiredTier: 'pro' | 'elite';
  children: React.ReactNode;
  fallbackUI?: 'blur' | 'lock' | 'banner';
}
```

Usage:
- Weekly Money Story: <PaywallGate requiredTier="pro">
- AI Coach insights: <PaywallGate requiredTier="elite">
- Alternative Assets: <PaywallGate requiredTier="elite">

---

## TIMELINE — LAUNCH COMMAND CENTER

| Date | Phase | Deliverables |
|------|-------|-------------|
| June 8-9 | Phase 1 | Schema Migrations + Tier Update + FBIS Logic |
| June 9-10 | Phase 2 | Adaptive Transaction Form + PaywallGate |
| June 10-11 | Phase 3 | Coach Settings + IDOR Fix + Design Audit |
| June 11 | Phase 4 | Security Audit + Full Integration Test |
| June 12 | LAUNCH | |

## PRIORITY OVERRIDE

1. Security — IDOR Fix ห้าม Launch หากยังไม่แก้
2. FBIS + AI Coach — Core Differentiation ห้ามตัด
3. Design System — #C7FF2E on #0B0F0A ห้าม Deviate
4. Revenue — BASIC/PRO/ELITE Tier ต้องพร้อมก่อน Launch
