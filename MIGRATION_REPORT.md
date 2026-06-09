# DailyStack Fintech — Migration Architecture Analysis Report

**Project:** `daily-stack-bug` (sample/legacy) → `dailystack-fintech` (production target)
**Author:** Mavis (AI CEO)
**Date:** 2026-06-05
**Status:** Ready to Execute

---

## 1. Executive Summary

This document maps all business logic from `daily-stack-bug` into `dailystack-fintech`, documenting what to migrate, what to skip, what to adapt, and the full DB gap analysis. The goal is a production-quality fintech app that preserves every feature from the sample without carrying over bugs, technical debt, or dead code.

---

## 2. Business Logic Mapping

### 2.1 Pages (Source → Target)

| Sample Page | Fintech Page | Action | Notes |
|---|---|---|---|
| `AuthPage.tsx` | `LoginPage.tsx` + `SignupPage.tsx` | **Rewrite** | Fintech has separate Login/Signup; sample has combined AuthPage with OTP-first flow |
| `Onboarding.tsx` | **New page** | **Create** | Not in fintech; 4-step wizard (profile → templates → billing → review) |
| `Dashboard.tsx` | `DashboardPage.tsx` | **Replace** | Fintech has skeleton; sample has full dashboard with 5 features |
| `RewardsHub.tsx` | **New page** | **Create** | Not in fintech; cashback engine with Thai credit card rules |
| `Memberships.tsx` | **New page** | **Create** | Not in fintech; track subscriptions with plan tiers |
| `Settings.tsx` | `SettingsPage.tsx` | **Extend** | Fintech has basic settings; sample adds push notifications + thresholds |
| `SubscriptionsPage.tsx` | Already exists | **Keep** | Fintech's is simpler but functional; sample's has more features but will be superseded by Dashboard |

### 2.2 Services (Source → Target)

| Sample Service | Fintech Service | Action | Notes |
|---|---|---|---|
| `authService.ts` | **Split into new services** | **Create** | Profile CRUD, nickname, completion score → `profileService.ts` |
| `subscriptionService.ts` | `subscriptionService.ts` | **Extend** | Add missing methods from sample (archive, bulk operations) |
| `walletService.ts` | `walletService.ts` | **Extend** | Add transaction history, spending breakdown from sample |
| `transactionService.ts` | **New** | **Create** | Sample has wallet transactions; fintech has none |
| `cancellationService.ts` | **New** | **Create** | 5-tab cancellation assistant; not in fintech at all |
| `creditCardService.ts` | **New** | **Create** | Cashback rules engine for Thai credit cards |
| `playbookService.ts` | **New** | **Create** | Cancellation playbooks/guides |
| `smsParserService.ts` | **New** | **Create** | Thai SMS bank message parsing |

---

## 3. Database Gap Analysis

### 3.1 Existing Tables in Fintech (4 tables)

| Table | Columns | Status |
|---|---|---|
| `profiles` | id, email, nickname, phone, avatar_url, created_at, updated_at | Has data, needs extension |
| `subscriptions` | id, user_id, name, cost, billing_cycle, category, next_billing_date, notes, is_active, created_at, updated_at | Full CRUD ready |
| `user_wallets` | id, user_id, balance, currency, created_at, updated_at | Needs transaction tracking |
| `user_credit_cards` | id, user_id, name, last_four, card_network, cashback_rules_json, is_active, created_at, updated_at | Schema exists but no cashback logic |

### 3.2 Missing Tables (6 tables to add)

| New Table | Purpose | Key Columns |
|---|---|---|
| `user_transactions` | Wallet transaction history | id, user_id, wallet_id, type, amount, description, reference_id, created_at |
| `user_memberships` | Subscription plan tiers | id, user_id, subscription_id, plan_name, tier, benefits_json, start_date, end_date, is_active |
| `cancellation_progress` | Cancellation assistant state | id, user_id, subscription_id, current_tab, form_data_json, status, created_at, updated_at |
| `cancellation_documents` | Cancellation documents (Supabase Storage) | id, user_id, subscription_id, document_name, storage_path, file_size, created_at |
| `onboarding_progress` | Onboarding wizard state | id, user_id, current_step, completed_steps_json, skipped, created_at, updated_at |
| `user_notification_settings` | Push notification preferences | id, user_id, notification_type, enabled, threshold_amount, created_at, updated_at |

### 3.3 RLS Policy Requirements

All new tables require:
```sql
-- Enable RLS
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "<table>_owner" ON <table>
  FOR ALL USING (auth.uid() = user_id);
```

---

## 4. Authentication Flow Comparison

### Sample (OTP-first)
```
1. User enters email
2. signInWithOtp() → email sent with OTP
3. User enters OTP → verified → session created
4. No password involved
```

### Fintech (Password + Custom OTP)
```
1. User enters email, password, name
2. signUp() → creates auth.users entry
3. Custom Edge Function sends OTP via email
4. User enters OTP → verified via Edge Function
5. Profile created in profiles table
```

**Decision:** Adopt sample's OTP-first flow (`signInWithOtp`) as it's cleaner and more user-friendly for a fintech app. The custom OTP Edge Function approach introduces unnecessary complexity and security surface area.

---

## 5. Architecture Differences

### 5.1 Supabase Client

| Aspect | Sample | Fintech | Decision |
|---|---|---|---|
| Client setup | Plain `createClient` | Hybrid real+mock query builder | Replace fintech's mock layer with real `createClient` |
| Auth listener | `onAuthStateChange` | `onAuthStateChange` | Keep fintech pattern (already correct) |
| Session management | Supabase default | Supabase default | No change needed |

### 5.2 Design System

| Aspect | Sample | Fintech | Decision |
|---|---|---|---|
| Design system | Pilo (custom CSS variables, Emerald Mint theme) | Existing fintech design system (CSS variables) | Keep fintech's design system; Pilo is incompatible |
| Component library | Custom UI components | Custom UI components | Keep fintech's components; they work well |
| Color tokens | `--pilo-*` variables | `--ds-*` variables | No migration needed |

### 5.3 Internationalization

Sample has `LanguageContext` + i18n system. Fintech does not have it and the scope doesn't call for it. **Skip i18n migration.**

---

## 6. Key Decisions

1. **Auth flow:** Adopt sample's `signInWithOtp` approach — cleaner, no custom OTP Edge Function needed
2. **Design system:** Keep fintech's `--ds-*` design tokens — Pilo is not compatible
3. **Services:** Split sample's monolithic `authService.ts` into domain-specific services matching fintech's architecture
4. **Dashboard:** Replace fintech's skeleton with sample's full dashboard; consolidate subscription management into dashboard
5. **Cancellation:** Build as entirely new feature (not in fintech at all)
6. **i18n:** Skip — outside fintech's current scope
7. **Mock layer:** Remove hybrid mock from `supabase.ts` — use real Supabase throughout

---

## 7. Risk Plan

| Risk | Severity | Mitigation |
|---|---|---|
| Auth flow rewrite breaks existing users | High | Test auth flow thoroughly before merging; keep login flow stable |
| Removing mock layer breaks dev without Supabase | Medium | Ensure Supabase local dev env is documented and accessible |
| RLS policies block data access unexpectedly | Medium | Write and test RLS policies before feature rollout |
| Cancellation feature is large/complex | Medium | Build incrementally; ship cancellation assistant after core features |
| Credit card cashback rules need live data | Low | Use sample's Thai card data as seed; can update later |

---

## 8. Execution Order

```
Phase 1: Foundation (High Risk)
├── 1.1 Replace supabase.ts (remove mock layer)
├── 1.2 Extend types.ts with missing interfaces
├── 1.3 Add DB migrations (6 new tables + RLS)
└── 1.4 Rewrite SignupPage + LoginPage (OTP-first auth)

Phase 2: Core Features (Medium Risk)
├── 2.1 Create Onboarding wizard
├── 2.2 Build new Dashboard (replace skeleton)
├── 2.3 Extend subscriptionService + walletService
├── 2.4 Create transactionService
└── 2.5 Create smsParserService

Phase 3: Advanced Features (Lower Risk)
├── 3.1 Create Rewards Hub (credit card cashback)
├── 3.2 Create Memberships page
├── 3.3 Extend Settings (notifications + thresholds)
├── 3.4 Create cancellationService + Cancellation Assistant
└── 3.5 Create playbookService

Phase 4: Polish
├── 4.1 Test all auth flows end-to-end
├── 4.2 Test RLS on all tables
├── 4.3 Cross-browser testing
└── 4.4 Final code review
```

---

## 9. What NOT to Copy

| Item | Reason |
|---|---|
| Pilo design system | Incompatible with fintech's design tokens |
| `LanguageContext` + i18n | Out of scope for fintech |
| Sample's `supabaseClient.ts` | Uses plain `createClient`; fintech needs its own setup |
| Sample's mock data layer | Being replaced with real Supabase |
| Dead code / commented-out code | Legacy artifacts in sample |
| `playbookService.ts` bugs | Sample has known bugs that were tracked |
| Capacitor shell code | Dead code in sample |

---

## 10. Files to Modify

### New Files to Create (16 files)
```
app/src/pages/Onboarding.tsx
app/src/pages/RewardsHub.tsx
app/src/pages/Memberships.tsx
app/src/services/profileService.ts
app/src/services/transactionService.ts
app/src/services/cancellationService.ts
app/src/services/creditCardService.ts
app/src/services/playbookService.ts
app/src/services/smsParserService.ts
app/src/hooks/useProfile.ts
app/src/hooks/useTransactions.ts
app/src/hooks/useCancellation.ts
app/src/hooks/useCreditCards.ts
app/src/utils/smsParser.ts
app/src/utils/cashbackCalculator.ts
```

### Files to Rewrite (6 files)
```
app/src/pages/LoginPage.tsx       ← adopt sample's signInWithOtp
app/src/pages/SignupPage.tsx      ← adopt sample's OTP-first flow
app/src/pages/DashboardPage.tsx    ← replace skeleton with full dashboard
app/src/pages/SettingsPage.tsx    ← extend with notifications + thresholds
app/src/lib/supabase.ts           ← remove mock layer
app/src/lib/types.ts              ← extend with all missing types
```

### Files to Extend (5 files)
```
app/src/contexts/AuthContext.tsx  ← add profile + completion score
app/src/services/subscriptionService.ts ← add archive + bulk ops
app/src/services/walletService.ts ← add transaction history
app/src/pages/SubscriptionsPage.tsx ← extend with more features
app/src/pages/SettingsPage.tsx    ← extend with push + thresholds
```

### DB Migrations (6 migrations)
```
supabase/migrations/001_add_user_transactions.sql
supabase/migrations/002_add_user_memberships.sql
supabase/migrations/003_add_cancellation_progress.sql
supabase/migrations/004_add_cancellation_documents.sql
supabase/migrations/005_add_onboarding_progress.sql
supabase/migrations/006_add_user_notification_settings.sql
```

---

*Report generated by Mavis. Ready for Phase 1 execution.*
