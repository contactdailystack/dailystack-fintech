# DailyStack / PicksWise FinTech — 4-Sprint Development Plan

**Created:** June 13, 2026  
**Based on:** MVP Audit Report + QA Audit (June 12, 2026)  
**Target:** Production-ready launch with Apple × Tesla + Friendly Thai UX

---

## Executive Summary

| Sprint | Focus | Duration | Goal |
|--------|-------|----------|------|
| **Sprint 1** | P0 Fixes | 3-5 days | Fix routing bugs, brand compliance, wire alerts |
| **Sprint 2** | Backend Wiring | 1 week | Connect apiService → all features |
| **Sprint 3** | UX Polish | 1-2 weeks | ZeroButtonDashboard, unified theme, motion |
| **Sprint 4** | Quality Gate | 1 week | E2E tests, TypeScript audit, beta launch |

**Current State:** ~70-73% production-ready  
**Target State:** 95%+ production-ready

---

## Sprint 1: P0 Fixes ⚡

**Objective:** Fix critical bugs that block production launch

### 1.1 Routing & Navigation Fixes

#### Bug #1: Activity Tab Duplicate Render
**Location:** `app/src/App.tsx` lines 629-655

```typescript
// ❌ CURRENT (BUG)
{currentTab === 'activity' && (
  <ActivityPage ... />
)}
...
{currentTab === 'activity' && (  // DUPLICATE!
  <MyCardsPage lang={lang} />
)}

// ✅ FIXED
{currentTab === 'activity' && (
  <ActivityPage ... />
)}
```

**Action:** Remove duplicate `currentTab === 'activity'` block (lines 651-655)

#### Bug #2: AICoachPage Not Mounted
**Location:** `app/src/App.tsx`

**Action:** 
1. Add AICoachPage to lazy imports (line 43 ✅ already imported)
2. Add route OR conditional mount in main tab flow
3. Add navigation entry point (QuickEntryModal or SidebarTools)

#### Bug #3: AlertsProvider Not Wrapped
**Location:** `app/src/App.tsx`

**Action:** Wrap entire App with `<AlertsProvider>`

#### Bug #4: Dedicated Pages Not Accessible
**Routes registered but no navigation entry:**
- `/subscriptions` → SubscriptionTrackerPage
- `/budget` → BudgetManagementPage
- `/moneyTwin` → MoneyTwinPage
- `/weeklyStory` → WeeklyStoryPage
- `/database` → DatabasePage
- `/coachHistory` → AICoachHistoryPage

**Action:** 
1. Add links from QuickEntryModal → dedicated pages
2. Add entry from Dashboard quick actions → feature pages
3. Update FloatingBottomNav if needed

### 1.2 Brand Compliance Fixes

#### Issue #1: Emoji in Scan Tab
**Location:** `app/src/App.tsx` line 641

```typescript
// ❌ BEFORE
<span className="text-4xl">📷</span>

// ✅ AFTER
import { ScanLine } from 'lucide-react';
<ScanLine className="w-10 h-10 text-mint-400" />
```

#### Issue #2: Red Color Violations
**Files to audit:**
- `SubscriptionTrackerPage.tsx`
- `ProfileSettingsPage.tsx`

**Action:** Replace all red colors with:
- Mint `#C7FF2E` for positive/success
- Amber `#F97316` for warnings
- Surface colors for neutral

```typescript
// ❌ Avoid
className="text-red-500"
className="bg-red-600"

// ✅ Use
className="text-mint-400"
className="text-amber-400"
```

### 1.3 Sprint 1 Deliverables

| Task | Status | Priority |
|------|--------|----------|
| Fix activity tab duplicate render | ⬜ | P0 |
| Mount AICoachPage | ⬜ | P0 |
| Wrap AlertsProvider | ⬜ | P0 |
| Add navigation to dedicated pages | ⬜ | P1 |
| Replace emoji in Scan tab | ⬜ | P0 |
| Audit & fix red colors | ⬜ | P1 |
| Verify TypeScript compilation | ⬜ | P0 |

**Effort:** 3-5 days  
**Owner:** Frontend Developer + QA

---

## Sprint 2: Backend Wiring 🔌

**Objective:** Connect all features to Supabase via apiService

### 2.1 apiService Integration

**Current State:** `apiService.ts` has typed wrappers but NO component calls them

**Functions Ready to Wire:**
```typescript
// Ghost Detection
detectGhostSubscriptions()

// Budget Alerts
getBudgetAlerts()

// Money Twin
analyzeSpendingPatterns()
getUserInsights()

// Weekly Story
generateWeeklyStory()

// AI Chat
sendChatMessage()
```

### 2.2 Wire Priority

#### P0 — Core MVP Features
1. **Transaction CRUD**
   - `DashboardPage.handleAddTransaction` → `saveTransaction()`
   - `ActivityPage` → `getTransactions()` + real-time subscription
   - `TransactionHistoryPage` → `getTransactions()`

2. **Subscription Tracker**
   - `SubscriptionTrackerPage` → `getSubscriptions()` + `addSubscription()`
   - Connect to `detectGhostSubscriptions()`

3. **Budget Management**
   - `BudgetManagementPage` → `getBudgets()` + `updateBudget()`
   - Connect to `getBudgetAlerts()`

#### P1 — Launch-Ready Features
4. **Money Twin**
   - `MoneyTwinPage` → `analyzeSpendingPatterns()`
   - Show real archetype instead of mock

5. **Weekly Story**
   - `WeeklyStoryPage` → `generateWeeklyStory()`
   - Replace static `WEEKLY_STORIES` with real data

6. **Insights Page**
   - Connect to `getUserInsights()`
   - Show real financial health score

#### P2 — Enhanced Features
7. **AI Coach**
   - `AICoachPage` → `sendChatMessage()`
   - `AICoachHistoryPage` → conversation history

8. **Ghost Detection**
   - Run as scheduled edge function
   - Push results to alerts system

### 2.3 Sprint 2 Deliverables

| Task | Edge Function | UI Wire | Status |
|------|---------------|---------|--------|
| Transaction CRUD | N/A (Supabase direct) | ✅ | ⬜ |
| Subscription CRUD | `detectGhostSubscriptions` | ✅ | ⬜ |
| Budget CRUD + Alerts | `getBudgetAlerts` | ✅ | ⬜ |
| Money Twin Analysis | `analyzeSpendingPatterns` | ✅ | ⬜ |
| Weekly Story | `generateWeeklyStory` | ✅ | ⬜ |
| Insights Page | `getUserInsights` | ✅ | ⬜ |
| AI Coach Chat | `ai-chat` | ✅ | ⬜ |
| Ghost Detection | `ghost_detect` (scheduled) | ✅ | ⬜ |

**Effort:** 1 week  
**Owner:** Full-stack Developer

### 2.4 Edge Functions to Deploy

| Function | Status | Deploy? |
|----------|--------|---------|
| `ghost-detect` | Ready | ✅ |
| `budget-alerts` | Ready | ✅ |
| `user-insights` | Ready | ✅ |
| `weekly-story` | Ready | ✅ |
| `ai-chat` | Ready | ✅ |

**Action:** Deploy all edge functions from `supabase/functions/`

---

## Sprint 3: UX Polish ✨

**Objective:** Achieve Apple × Tesla + Friendly Thai UX standard

### 3.1 ZeroButtonDashboard Integration

**Current State:** `ZeroButtonDashboard.tsx` exists (~850 lines) but NOT used as home

**Vision:** "The Tesla of Personal Finance" — user sees everything at a glance, minimal taps needed

#### Implementation:
1. Replace `DashboardPage` with `ZeroButtonDashboard` as default home
2. Keep `DashboardPage` for power users (accessible via settings)
3. Update navigation routes

```typescript
// App.tsx
const DashboardPage = lazy(() => import('./components/ZeroButtonDashboard'));
// OR keep both
const LegacyDashboard = lazy(() => import('./components/DashboardPage'));
```

### 3.2 Theme Unification

#### Issue #1: Font Mismatch
**Spec:** Space Grotesk (EN) + Kanit (TH)  
**Current:** Outfit

```typescript
// global.css or App.tsx
import { Space_Grotesk } from 'next/font/google';
import { Kanit } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });
const kanit = Kanit({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-thai'
});
```

#### Issue #2: ProfileSettings Light Theme
**Current:** `#F2F2F7` light theme  
**Fix:** Dark theme `#0B0F0A` consistent with app

```typescript
// ProfileSettingsPage.tsx
// Remove: bg-[#F2F2F7]
// Use: bg-[#0B0F0A] dark theme
```

#### Issue #3: Radius Inconsistency
**Spec:** 16-20px  
**Current:** 24px some places

Audit all components and standardize radius

### 3.3 Motion & Haptic Enhancement

| Moment | Motion | Haptic | Status |
|--------|--------|--------|--------|
| App open | Splash → fade hero | SELECT | ⬜ |
| Net Worth change | Count-up/down | DEEP_RESONANCE | ⬜ |
| Add transaction | Card slide-in + stagger | CRISP_CLICK | ⬜ |
| Transfer success | Particle + success | SUCCESS_CASCADE | ⬜ |
| Budget warning | Amber pulse | AMBER_PULSE | ⬜ |
| Pull-to-refresh | Shimmer skeleton | LONG_PRESS | ⬜ |

**Action:** Add haptic feedback to all interactions per PRINCIPLES.md

### 3.4 Loading & Empty States

#### Loading Skeleton
Every screen that fetches data should show:
```typescript
// Before data loads
{isLoading && <LoadingSkeleton variant="card" />}

// Animation: shimmer effect
```

#### Empty States
```typescript
// Transaction empty
"เริ่มบันทึกรายการแรก ใช้เวลาแค่ 10 วินาที"

// Subscription empty
"ยังไม่มีการสมัครสมาชิก — เพิ่มได้เลยตอนนี้"

// Budget empty
"ตั้งงบประมาณแรก — ช่วยให้รู้ว่าใช้ได้เท่าไหร่"
```

### 3.5 Sprint 3 Deliverables

| Task | Status | Priority |
|------|--------|----------|
| Replace home with ZeroButtonDashboard | ⬜ | P0 |
| Migrate to Space Grotesk + Kanit | ⬜ | P1 |
| ProfileSettings → dark theme | ⬜ | P0 |
| Standardize border-radius | ⬜ | P2 |
| Add haptic to all interactions | ⬜ | P1 |
| Add skeleton loading to all screens | ⬜ | P1 |
| Friendly empty states | ⬜ | P1 |

**Effort:** 1-2 weeks  
**Owner:** Frontend Developer + UX Designer

---

## Sprint 4: Quality Gate 🛡️

**Objective:** Ship with confidence — tests, audit, beta launch

### 4.1 Playwright E2E Tests

#### Critical Paths to Test

```typescript
// auth.spec.ts
test('signup → onboarding → dashboard', async ({ page }) => {
  // Already exists: tests/p0/auth.spec.ts
});

// Add:
test('add transaction → appears in history', async ({ page }) => {
  await login(page);
  await page.click('[data-testid="add-transaction"]');
  await page.fill('[data-testid="amount"]', '500');
  await page.fill('[data-testid="description"]', 'Test Transaction');
  await page.click('[data-testid="save"]');
  await expect(page.locator('text=Test Transaction')).toBeVisible();
});

test('budget → warning at 80%', async ({ page }) => {
  // Add transactions until budget 80%
  // Expect amber warning
});

test('paywall → upgrade flow', async ({ page }) => {
  await login(page);
  await page.click('[data-testid="upgrade-button"]');
  await expect(page.locator('text=ราคา')).toBeVisible();
});
```

#### Coverage Targets

| Area | Current | Target |
|------|---------|--------|
| Auth | 3 specs | 5 specs |
| Transactions | 0 specs | 3 specs |
| Budget | 0 specs | 2 specs |
| Subscriptions | 0 specs | 2 specs |
| Paywall | 0 specs | 2 specs |
| Money Twin | 0 specs | 1 spec |

### 4.2 TypeScript Compliance

#### Audit Checklist
```bash
cd app && npx tsc --noEmit
```

#### Fix Protocol
1. Run `tsc --noEmit`
2. Fix ALL errors (0 tolerance)
3. Fix ALL warnings (strict mode)
4. No `any` types
5. No `// @ts-ignore` comments

#### Brand Compliance Audit
```bash
# Zero Emoji Check
grep -r "📷\|🔔\|❌\|✅" --include="*.tsx" app/src/

# Zero Red Check
grep -r "red-" --include="*.tsx" app/src/
```

### 4.3 Accessibility Audit

Per `ACCESSIBILITY_I18N_CHECKLIST.md`:

- [ ] WCAG AA contrast ratios
- [ ] 44pt minimum touch targets
- [ ] `prefers-reduced-motion` respected
- [ ] Screen reader labels
- [ ] Keyboard navigation

### 4.4 Beta Launch

#### Pre-Launch Checklist
- [ ] All P0 bugs fixed
- [ ] TypeScript 0 errors
- [ ] Brand compliance 100%
- [ ] E2E tests passing
- [ ] Edge functions deployed
- [ ] Migration 024 applied
- [ ] Privacy Policy ready
- [ ] Terms of Service ready

#### Beta Metrics
| KPI | Target |
|-----|--------|
| Signup → First Transaction | < 3 minutes |
| Onboarding completion | > 70% |
| Day 1 retention | > 50% |
| Bug reports | < 5 critical |

### 4.5 Sprint 4 Deliverables

| Task | Status | Priority |
|------|--------|----------|
| Playwright E2E: auth | ✅ | - |
| Playwright E2E: transactions | ⬜ | P0 |
| Playwright E2E: budget | ⬜ | P1 |
| Playwright E2E: paywall | ⬜ | P1 |
| TypeScript audit | ⬜ | P0 |
| Brand compliance audit | ⬜ | P0 |
| Accessibility audit | ⬜ | P1 |
| Beta 50 users | ⬜ | P0 |

**Effort:** 1 week  
**Owner:** QA + DevOps

---

## Dependencies & Milestones

```
Week 1: Sprint 1 (P0 Fixes)
    │
    ├── Day 1-2: Fix routing bugs
    ├── Day 3: Brand compliance
    └── Day 4-5: Alerts wiring + verification

Week 2-3: Sprint 2 (Backend Wiring)
    │
    ├── Deploy edge functions
    ├── Wire transaction CRUD
    ├── Wire subscription/budget
    └── Wire AI features

Week 4-5: Sprint 3 (UX Polish)
    │
    ├── ZeroButtonDashboard integration
    ├── Theme unification
    └── Motion & haptic enhancement

Week 6: Sprint 4 (Quality Gate)
    │
    ├── E2E tests
    ├── Audit & fixes
    └── Beta launch
```

---

## Resource Requirements

| Role | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|------|----------|----------|----------|----------|
| Frontend Dev | 1 | 1 | 1-2 | 1 |
| Full-stack Dev | 0.5 | 1 | 0.5 | 0.5 |
| QA | 0.5 | 0.5 | 0.5 | 1 |
| UX Designer | 0 | 0 | 1 | 0 |

**Total Duration:** 6 weeks  
**Minimum Team:** 2 developers + 1 QA

---

## Success Metrics

| Metric | Current | Sprint 4 Target |
|--------|---------|-----------------|
| Production Readiness | ~70% | 95%+ |
| TypeScript Errors | 0 | 0 |
| Brand Violations | 5+ | 0 |
| E2E Coverage | ~10% | 80%+ |
| SSOT Compliance | ~65% | 95%+ |

---

## Next Steps

1. **Approve this plan** → Proceed to Sprint 1
2. **Prioritize differently** → Adjust scope
3. **Add more detail** → Request specific task breakdown

Ready to begin when you are! 🚀
