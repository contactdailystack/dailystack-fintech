# DailyStack MVP — Product Brief & Feature Freeze
**Date:** June 12, 2026
**Version:** 1.0
**Status:** READY FOR LAUNCH

---

## Executive Summary

DailyStack is a Thai personal finance app — "The Tesla of Personal Finance."
This document defines the MVP scope for the June 12, 2026 launch.

**Goal:** Ship a polished, production-ready fintech app that delivers immediate value to users on day 1.

---

## Feature Freeze Assessment

### READY — Components Fully Implemented (Redesign Only)

| Component | Status | Notes |
|-----------|--------|-------|
| AuthPage | ✅ READY | Tesla-style glass-morphism, Supabase Auth |
| OnboardingPage | ✅ READY | 3-step premium walkthrough |
| SplashScreen | ✅ READY | Loading animation |
| DashboardPage | ✅ READY | Net Worth hero, Financial Stack View |
| FloatingBottomNav | ✅ READY | Tesla-style pill nav, 5 tabs |
| ActivityPage | ✅ READY | Timeline design, emotion tracking |
| InsightsPage | ✅ READY | Financial health score, category bars |
| MoneyTwinPage | ✅ READY | Archetype display, trait cards |
| BudgetManagementPage | ✅ READY | Progress rings, category budgets |
| SubscriptionTrackerPage | ✅ READY | Subscription cards, billing alerts |
| AlertsPage | ✅ READY | Severity indicators, read/unread |
| PaywallPage | ✅ READY | Tesla premium style, plan comparison |
| PaywallGate | ✅ READY | Feature gating component |
| MorePage | ✅ READY | Settings, profile, about |
| ProfileSettingsPage | ✅ READY | User settings |
| AlternativeAssetsPage | ✅ READY | Gold, Property, P2P, Crypto |
| FinancialEvolutionPage | ✅ READY | Timeline milestones |
| DatabasePage | ✅ READY | Data export, privacy |
| AICoachPage | ✅ READY | Chat interface (backend pending) |
| AICoachHistoryPage | ✅ READY | Conversation history |
| CoachSettings | ✅ READY | Coach preferences |
| GoalSimulationPage | ✅ READY | Goal visualization |
| TransactionHistoryPage | ✅ READY | Full transaction list |
| SlideToUpgrade | ✅ READY | Swipe-to-paywall |
| ChartTabs | ✅ READY | Donut + Line charts |
| DonutChart | ✅ READY | Category breakdown |
| LineChart | ✅ READY | Trend visualization |

**Total: 27 components — ALL READY**

### NEEDS-WORK — Backend Integration Required (MVP Can Ship With Mock)

| Feature | Status | MVP Approach |
|---------|--------|--------------|
| AI Coach Chat | ⚠️ Needs backend | Ship with mock AI responses, real API post-launch |
| Money Twin Analysis | ⚠️ Needs backend | Ship with pre-computed archetype data |
| Ghost Subscription Detection | ⚠️ Needs Edge Function | Ship with manual detection UI, auto-detect post-launch |
| Push Notifications | ⚠️ Needs service worker | Ship with in-app alerts only |
| Stripe Integration | ⚠️ Needs backend | Ship with "Coming Soon" on paywall |
| Weekly Money Story | ⚠️ Needs backend | Ship with static demo chapters |

### WON'T DO — Post-Launch Phase

| Feature | Priority | Reason |
|---------|----------|--------|
| Multi-currency support | LOW | THB only for MVP |
| Bank account linking | MEDIUM | Manual entry for MVP |
| Investment portfolio | MEDIUM | Basic tracking only |
| Bill splitting | LOW | Not MVP scope |
| Family/team features | LOW | Solo user for MVP |

---

## MVP Scope Definition

### TIER 1 — CORE MVP (Must Ship)
**This is the minimum viable product — ship these or don't launch.**

- ✅ User authentication (email/password)
- ✅ Dashboard with Net Worth display
- ✅ Transaction entry and history
- ✅ Subscription tracking (manual entry)
- ✅ Budget management with progress rings
- ✅ Financial health score
- ✅ App Store / Play Store listing

### TIER 2 — LAUNCH READY (Ship with mock data if backend not ready)
**Features that enhance the product but can work with mock data.**

- 🤖 Money Twin archetype display (mock data → real post-launch)
- 📊 Insights with category breakdown
- 🔔 In-app alerts (budget warnings, billing reminders)
- 💳 Paywall with plan comparison (Stripe pending)
- 🧭 AI Coach chat interface (mock → real post-launch)
- 👻 Ghost subscription detection (manual → auto post-launch)

### TIER 3 — POST-LAUNCH (Week 2+)
**Features to ship within 2 weeks after launch.**

- Stripe payment integration
- Ghost subscription auto-detection (Edge Functions)
- Push notifications (service worker)
- Real AI Coach responses (OpenAI/Anthropic)
- Weekly Money Story chapters (Edge Function)
- Bank account linking (Plaid Thailand alternative)

---

## Launch Timeline

```
June 12 (Today):
├── Phase 1: Infrastructure complete ✓
│   ├── Product Brief ← YOU ARE HERE
│   ├── Architecture Design
│   ├── Design System Audit
│   ├── Database Schema
│   ├── Security Audit
│   └── DevOps CI/CD
├── Phase 2: Implementation (Hours 3-8)
│   ├── Frontend Redesign
│   ├── Backend Edge Functions
│   └── API Integration
├── Phase 3: QA & Testing (Hours 8-10)
│   ├── Integration Testing
│   └── Test Suite
└── Phase 4: Final Gate (Hours 10-12)
    ├── Build Verification
    └── Launch Readiness Report

June 13:
└── App Store / Play Store submission

June 14-21:
└── Beta testing with 50 users
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Signup completion rate | > 50% | Signups / Visitors |
| Dashboard activation | > 60% | Users who add first transaction within 24h |
| Subscription added within Day 3 | > 40% | Active subscriptions / signups |
| DAU / MAU ratio | > 25% | Retention indicator |
| Time to first value | < 3 minutes | Onboarding → first transaction |
| Crash-free sessions | > 99% | Sentry / Crashlytics |
| App Store rating | > 4.5 stars | User reviews |

---

## Launch Blockers — MUST FIX BEFORE LAUNCH

1. **P0 — Build must pass** (`npm run build` must succeed)
2. **P0 — Zero emoji in codebase** (grep audit)
3. **P0 — Zero red colors in UI** (use Amber only)
4. **P0 — RLS policies on all tables** (verify every table)
5. **P1 — Supabase Edge Functions deployed** (ghost detection, budget alerts)
6. **P1 — Stripe configured** (even if paywall disabled)
7. **P2 — App Store assets ready** (screenshots, descriptions)

---

## Post-Launch Priorities

1. **Week 1:** Monitor crash reports, fix P0 issues
2. **Week 2:** Ship Stripe integration, real AI Coach
3. **Week 3:** Ghost subscription auto-detection
4. **Week 4:** Push notifications, weekly Money Story

---

*Document Owner: AI Product Manager (Mavis)*
*Approved by: Pickky (CEO)*
