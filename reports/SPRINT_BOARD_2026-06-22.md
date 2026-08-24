# DailyStack FinTech — Sprint Board (Post-QA-Audit)

**Sprint Window:** 2026-06-22 → 2026-06-29 (7 working days)
**Sprint Goal:** Clear all P0 + High bugs. Ship MVP to Soft Launch by Day 5, Full Launch by Day 7.
**Sprint Capacity:** 1 FE × 100%, 1 BE × 100%, 1 DO/SEC × 50%, 1 QA × 100%
**Source of truth:** `reports/QA_AUDIT_REPORT_2026-06-22.md`

---

## 📊 Sprint Burndown Summary

| Phase | Tasks | Effort (h) | Allocated | Owner |
|---|---|---|---|---|
| **P0** Stop the bleeding | 3 | 2 | Day 0 | FE + BE + DO |
| **P1** Unblock users | 4 | 16 | Day 1-2 | FE |
| **P2** Harden the engine | 6 | 18 | Day 3-4 | BE + DO |
| **P3** Polish & Coverage | 9 | 20 | Day 5-7 | FE + QA |
| **TOTAL** | **22** | **56 h** | 5-7 days | — |

---

## 🏃 Owners & Roles

| Code | Role | Name (placeholder) | Slack handle |
|---|---|---|---|
| FE-A | Frontend Engineer A | (FE lead) | @fe-a |
| FE-B | Frontend Engineer B | (FE #2) | @fe-b |
| BE-A | Backend Engineer A | (BE lead) | @be-a |
| BE-B | Backend Engineer B | (BE #2) | @be-b |
| DO | DevOps / Infra | (SRE) | @do |
| SEC | Security Reviewer | (Sec) | @sec |
| QA-A | QA Engineer | (QA) | @qa-a |
| CEO | CEO / Approver | Pick | (you) |

---

## 🟥 PHASE 0 — Stop the bleeding

> **Goal:** Build green + secret rotated. No external deploy.
> **Deadline:** 2026-06-22 EOD
> **Block on:** Nothing — start immediately.
> **Owner:** FE-A (TS), BE-A (Stripe), DO (CI guard)

---

### Task P0-01 — Rotate Stripe live keys
| Field | Value |
|---|---|
| Bug ID | BUG-C2 |
| Severity | 🔴 Critical |
| Type | Backend / Security |
| Owner | BE-A + DO |
| Effort | 30 min |
| Due | 2026-06-22 17:30 |
| Blockers | None |

**Steps:**
1. Login to Stripe Dashboard → Developers → API keys → Roll `sk_live_*` and `whsec_*`
2. Issue new `sk_test_*` + `whsec_*` (test mode)
3. Replace values in `app/.env.local`
4. Confirm `supabase/functions/stripe-webhook/` env config uses matching test keys
5. Document old keys were revoked in `docs/INCIDENT_LOG.md`

**Acceptance:**
- [ ] `grep -r "sk_live" .` returns zero hits in repo
- [ ] Test charge with `4242 4242 4242 4242` succeeds in dev
- [ ] Old live keys return 401 in Stripe Dashboard

---

### Task P0-02 — Fix tsconfig `ignoreDeprecations` value
| Field | Value |
|---|---|
| Bug ID | BUG-C6 |
| Severity | 🔴 Critical |
| Type | Frontend / Build |
| Owner | FE-A |
| Effort | 5 min |
| Due | 2026-06-22 17:30 |
| Blockers | None |

**Steps:**
1. Edit `app/tsconfig.json:20` → change `"6.0"` to `"5.0"`
2. Run `cd app && npx tsc --noEmit` → expect 3 errors remaining (those are P0-03)

**Acceptance:**
- [ ] `npm run build` runs `tsc -b` without TS5103
- [ ] CI build green

---

### Task P0-03 — Fix 3 TS strict errors in alerts
| Field | Value |
|---|---|
| Bug ID | BUG-H4 |
| Severity | 🟧 High |
| Type | Frontend / Type Safety |
| Owner | FE-A |
| Effort | 30 min |
| Due | 2026-06-22 18:00 |
| Blockers | None |

**Steps:**
1. `app/src/services/alerts/alertEngine.ts:711` — add `success: 0` to `scores` object
2. `app/src/services/alerts/alertService.ts:599` and `:652` — add `success: 0` to both `alertsBySeverity` objects
3. Re-run `tsc --noEmit` → expect 0 errors

**Acceptance:**
- [ ] `tsc --noEmit` returns 0 errors
- [ ] When alert with `severity: 'success'` is counted, `stats.alertsBySeverity.success` is a number, not undefined

---

### Task P0-04 — CI guard: block live Stripe keys
| Field | Value |
|---|---|
| Bug ID | BUG-C2 (preventive) |
| Severity | 🟧 High |
| Type | DevOps / CI |
| Owner | DO |
| Effort | 30 min |
| Due | 2026-06-22 18:00 |
| Blockers | None |

**Steps:**
1. Create `scripts/verify-no-live-secrets.sh`:
   ```bash
   #!/bin/bash
   set -e
   if grep -rE "sk_live_|pk_live_|whsec_(?!_test)" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include=".env*" .; then
     echo "❌ Live Stripe keys found in repo!"
     exit 1
   fi
   ```
2. Add to `.github/workflows/ci.yml` as a pre-build step
3. Add to Vercel build command: `"prebuild": "bash scripts/verify-no-live-secrets.sh"`

**Acceptance:**
- [ ] CI fails when test commit adds `sk_live_xxx` to any file
- [ ] CI passes on current `master`

---

## 🟧 PHASE 1 — Unblock users

> **Goal:** Signup → Login → Logout flows work end-to-end. E2E tests pass.
> **Deadline:** 2026-06-24 EOD
> **Block on:** Phase 0 complete
> **Owner:** FE-A (lead), FE-B (assistance)

---

### Task P1-01 — Wire OTP input on email-confirmation screen
| Field | Value |
|---|---|
| Bug ID | BUG-C3 |
| Severity | 🔴 Critical |
| Type | Frontend / Auth |
| Owner | FE-A |
| Effort | 4 h |
| Due | 2026-06-23 12:00 |
| Blockers | None |

**Steps:**
1. Import `OTPInput` component into `app/src/components/AuthPage.tsx`
2. Add OTP state + submit handler that calls `verify-otp` edge function
3. Show error toast on wrong OTP, auto-redirect to dashboard on success
4. Alternative: In `supabase/config.toml`, disable email confirmation and route directly to dashboard after signup (simpler for MVP)
5. **Decision needed from CEO:** (A) OTP flow vs (B) auto-confirm
   - Recommend **(B)** for MVP — Supabase default behavior matches Thai fintech expectations (instant access, email verification as soft check)

**Acceptance:**
- [ ] User signs up → lands on dashboard within 3 seconds
- [ ] If (A) chosen: user can paste OTP from email and proceed
- [ ] Playwright `auth.signup.spec.ts` passes

---

### Task P1-02 — Convert SPA state-routing to React Router routes
| Field | Value |
|---|---|
| Bug ID | BUG-C4 |
| Severity | 🔴 Critical |
| Type | Frontend / Routing |
| Owner | FE-A |
| Effort | 6 h |
| Due | 2026-06-24 18:00 |
| Blockers | None (independent of P1-01) |

**Steps:**
1. Edit `app/src/App.tsx`:
   - Replace `currentSection` state with URL-based routing
   - Add `<Route>` for: `/dashboard`, `/activity`, `/subscriptions`, `/networth`, `/settings`, `/paywall`, `/more`, `/coach`, `/coachHistory`, `/evolution`, `/alternative`, `/simulation`, `/budget`, `/moneyTwin`, `/stories`, `/insights`, `/database`, `/notifications`, `/balance`
2. Replace `setCurrentSection(...)` calls with `useNavigate()`
3. Each page component receives route param instead of prop callback
4. Update `FloatingBottomNav.tsx` to use `<Link to="/...">` instead of state setter
5. Keep `/auth/callback` route as-is (OAuth flow)

**Acceptance:**
- [ ] Refresh on `/settings` keeps you on settings page
- [ ] Browser back button works
- [ ] Logout button (`data-testid="logout-button"`) reachable from `/settings`
- [ ] All Playwright P0 tests pass

---

### Task P1-03 — Remove dead dynamic import in App.tsx
| Field | Value |
|---|---|
| Bug ID | BUG-H6 |
| Severity | 🟦 Low |
| Type | Frontend / Build |
| Owner | FE-B |
| Effort | 10 min |
| Due | 2026-06-24 14:00 |
| Blockers | None |

**Steps:**
1. `app/src/App.tsx:163` — replace `const { updateUserDisplayName } = await import('./services/userTierService');` with direct `updateUserDisplayName` from top import

**Acceptance:**
- [ ] Vite build warning gone
- [ ] `npm run build` clean

---

### Task P1-04 — Re-run P0 Playwright suite
| Field | Value |
|---|---|
| Bug ID | BUG-C3, BUG-C4 (verification) |
| Severity | 🟧 High |
| Type | QA |
| Owner | QA-A |
| Effort | 1 h |
| Due | 2026-06-24 19:00 |
| Blockers | P1-01, P1-02 |

**Steps:**
1. `cd dailystack-fintech && npx playwright test --config playwright.config.ts`
2. Capture screenshots for evidence
3. Update `tests/p0/README.md` with pass results

**Acceptance:**
- [ ] All 3 P0 tests pass
- [ ] HTML report committed to `reports/html/`

---

## 🟨 PHASE 2 — Harden the engine

> **Goal:** Backend integrity, edge functions complete, no data corruption under load.
> **Deadline:** 2026-06-26 EOD
> **Block on:** Phase 1 complete (need working auth first to test edge fns)
> **Owner:** BE-A (lead), BE-B, DO, SEC

---

### Task P2-01 — Consolidate migrations into one canonical set
| Field | Value |
|---|---|
| Bug ID | BUG-C1, BUG-C5 |
| Severity | 🔴 Critical |
| Type | Backend / DB |
| Owner | BE-A |
| Effort | 4 h |
| Due | 2026-06-25 18:00 |
| Blockers | None |

**Steps:**
1. Create new `supabase/migrations/999_consolidated_final.sql` containing the **final** schema after all known changes
2. Tables must use `users` (not `profiles`) as canonical name
3. RLS policies must be self-consistent: `auth.uid() = user_id` everywhere, with `SECURITY DEFINER` on `handle_new_user()`
4. Add `SET search_path = public, auth` to all PL/pgSQL functions
5. Test on fresh Supabase project from scratch
6. Verify migration 001-024 are kept as historical but the new project runs only `999_*.sql`

**Acceptance:**
- [ ] Fresh DB provisioned from scratch has expected schema after running only `999_*.sql`
- [ ] `handle_new_user()` inserts into `users` (not `profiles`)
- [ ] Signup trigger works on fresh DB
- [ ] No conflicting RLS policies

---

### Task P2-02 — Create `send-alert-email` edge function
| Field | Value |
|---|---|
| Bug ID | BUG-H1 |
| Severity | 🟧 High |
| Type | Backend / Edge Function |
| Owner | BE-B |
| Effort | 2 h |
| Due | 2026-06-25 14:00 |
| Blockers | None |

**Steps:**
1. Create `supabase/functions/send-alert-email/index.ts`
2. Accept `{ to, subject, html, alertId }` payload
3. Use Resend API (mirror pattern from `resend-otp`)
4. Validate caller user_id matches alert owner (use `getCallerUserId` pattern)
5. Update `app/src/services/alerts/alertNotifications.ts:266` if needed
6. Deploy: `supabase functions deploy send-alert-email`

**Acceptance:**
- [ ] POST to function with valid alert triggers email in test inbox
- [ ] POST with mismatched alert owner returns 403
- [ ] HTML email renders correctly (no `[object Object]`)

---

### Task P2-03 — Validate caller in `resend-otp`
| Field | Value |
|---|---|
| Bug ID | BUG-H2 |
| Severity | 🟧 High |
| Type | Backend / Security |
| Owner | BE-A + SEC |
| Effort | 1 h |
| Due | 2026-06-25 14:00 |
| Blockers | None |

**Steps:**
1. `supabase/functions/resend-otp/index.ts:125` — add `getCallerUserId(req)` check
2. Require `callerId === user_id` else return 403
3. Add rate limiting: max 3 OTPs per user per 10 minutes (use Postgres or in-memory)
4. Document in edge function header comment

**Acceptance:**
- [ ] POST with mismatched user_id returns 403
- [ ] POST with valid auth header succeeds
- [ ] 4th request within 10 min returns 429

---

### Task P2-04 — Atomic wallet transfer
| Field | Value |
|---|---|
| Bug ID | BUG-H3 |
| Severity | 🟧 High |
| Type | Backend / Data Integrity |
| Owner | BE-B |
| Effort | 3 h |
| Due | 2026-06-26 12:00 |
| Blockers | None |

**Steps:**
1. Create `supabase/migrations/999_atomic_transfer.sql`:
   ```sql
   CREATE OR REPLACE FUNCTION decrement_wallet_balance(p_user_id UUID, p_amount NUMERIC)
   RETURNS NUMERIC
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public
   AS $$
   DECLARE
     current_balance NUMERIC;
   BEGIN
     SELECT balance INTO current_balance
     FROM user_wallets
     WHERE user_id = p_user_id
     FOR UPDATE;
     IF current_balance IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;
     IF current_balance < p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
     UPDATE user_wallets SET balance = balance - p_amount, updated_at = NOW()
     WHERE user_id = p_user_id;
     RETURN current_balance - p_amount;
   END;
   $$;
   ```
2. Update `app/src/services/walletService.ts:124-138` to call this via `supabase.rpc('decrement_wallet_balance', {...})`
3. Remove the read-modify-write pattern

**Acceptance:**
- [ ] Concurrent test: 50 simultaneous transfers of 10 THB from 100 THB wallet → exactly 10 succeed, 40 fail with "Insufficient"
- [ ] Wallet balance ends at 0, not negative

---

### Task P2-05 — Enforce Stripe price env vars (fail fast)
| Field | Value |
|---|---|
| Bug ID | BUG-H5 |
| Severity | 🟧 High |
| Type | Backend / Payment |
| Owner | BE-A |
| Effort | 30 min |
| Due | 2026-06-25 11:00 |
| Blockers | None |

**Steps:**
1. `supabase/functions/stripe-webhook/index.ts` top:
   ```ts
   const STRIPE_PRICE_PRO = Deno.env.get("STRIPE_PRICE_PRO");
   const STRIPE_PRICE_ELITE = Deno.env.get("STRIPE_PRICE_ELITE");
   if (!STRIPE_PRICE_PRO || !STRIPE_PRICE_ELITE) {
     throw new Error("Missing STRIPE_PRICE_PRO or STRIPE_PRICE_ELITE env vars");
   }
   ```
2. Better: use Stripe price IDs and look up amount via `stripe.prices.retrieve(price_id).unit_amount`

**Acceptance:**
- [ ] Function fails to start if env vars missing (visible in logs)
- [ ] Test charge matches expected amount

---

### Task P2-06 — supabaseClient fail-fast on missing env
| Field | Value |
|---|---|
| Bug ID | (preventive) |
| Severity | 🟨 Medium |
| Type | Frontend / DX |
| Owner | FE-B |
| Effort | 30 min |
| Due | 2026-06-26 12:00 |
| Blockers | None |

**Steps:**
1. `app/src/supabaseClient.ts` — replace `console.warn` with `throw new Error('Missing Supabase env vars — copy .env.example to .env.local')`
2. Add build-time check in Vite config to validate env presence

**Acceptance:**
- [ ] App refuses to start without env vars
- [ ] Clear error message in console

---

## 🟦 PHASE 3 — Polish & Coverage

> **Goal:** UX issues fixed, test coverage ≥ 60%, Lighthouse mobile ≥ 80.
> **Deadline:** 2026-06-29 EOD
> **Block on:** Phase 2 complete
> **Owner:** FE-A, FE-B, QA-A

---

### 3A. UX / Dead UI Fixes

#### Task P3-01 — Wire Forgot Password flow
| Field | Value |
|---|---|
| Bug ID | BUG-M2 |
| Severity | 🟨 Medium |
| Owner | FE-A |
| Effort | 1 h |
| Due | 2026-06-27 12:00 |

**Steps:**
1. `AuthPage.tsx:629-636` — add `onClick` handler that calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth/reset' })`
2. Show confirmation toast
3. Create `app/src/components/AuthResetPasswordPage.tsx` for the redirect target

**Acceptance:**
- [ ] Click "Forgot Password?" → success toast shown
- [ ] Email arrives with reset link

---

#### Task P3-02 — Wire Google OAuth
| Field | Value |
|---|---|
| Bug ID | BUG-M3 |
| Severity | 🟨 Medium |
| Owner | FE-A |
| Effort | 2 h |
| Due | 2026-06-27 16:00 |

**Steps:**
1. Configure Google OAuth in Supabase Dashboard
2. `AuthPage.tsx:489-494` — replace fake spinner with `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })`
3. Handle redirect in `AuthCallbackPage.tsx`

**Acceptance:**
- [ ] Click "Continue with Google" → Google popup opens
- [ ] After Google auth, user lands on dashboard

---

#### Task P3-03 — Success screen i18n
| Field | Value |
|---|---|
| Bug ID | (related to M1) |
| Severity | 🟨 Medium |
| Owner | FE-B |
| Effort | 30 min |
| Due | 2026-06-27 17:00 |

**Steps:**
1. `AuthPage.tsx:281-356` — replace hardcoded "Login Successful!" and "Taking you to your dashboard..." with `t('auth.success.title')` and `t('auth.success.subtitle')`
2. Add keys to `translations.ts` for both `en` and `th`

**Acceptance:**
- [ ] When `lang === 'th'`, success screen shows Thai text
- [ ] When `lang === 'en'`, success screen shows English text

---

#### Task P3-04 — AuthCallbackPage timeout + retry
| Field | Value |
|---|---|
| Bug ID | BUG-M4 |
| Severity | 🟨 Medium |
| Owner | FE-B |
| Effort | 30 min |
| Due | 2026-06-27 17:30 |

**Steps:**
1. `AuthCallbackPage.tsx:20-24` — change 3 s → 10 s
2. Add "Retry" button on `failed` state that re-runs the verification logic
3. Show a spinner with progress text

**Acceptance:**
- [ ] On slow network (>3 s), page stays in verifying state, not failed
- [ ] Retry button restarts the flow

---

#### Task P3-05 — Consolidate i18n to single source of truth
| Field | Value |
|---|---|
| Bug ID | BUG-M1 |
| Severity | 🟨 Medium |
| Owner | FE-A |
| Effort | 3 h |
| Due | 2026-06-28 12:00 |

**Steps:**
1. Decide: keep `translations.ts` (recommend) — delete `i18n.ts`, `locales/en.json`, `locales/th.json`
2. Replace `useTranslation()` calls with direct `translations[lang]` lookup
3. Remove `i18next` + `react-i18next` from `package.json`

**Acceptance:**
- [ ] No file imports `i18next` or `react-i18next`
- [ ] Bundle size reduced by ~30 KB (i18next removal)

---

### 3B. Test Coverage Expansion

#### Task P3-06 — Subscription CRUD test
| Field | Value |
|---|---|
| Bug ID | (test gap) |
| Severity | 🟨 Medium |
| Owner | QA-A |
| Effort | 3 h |
| Due | 2026-06-28 15:00 |

**Steps:**
1. Create `tests/p1/subscriptions.spec.ts`
2. Add `pages/SubscriptionsPage.ts` POM
3. Test: create subscription, edit, delete, mark inactive, ghost detection
4. Verify on dashboard after creation

**Acceptance:**
- [ ] Test passes
- [ ] Subscription appears on dashboard with correct amount

---

#### Task P3-07 — Transaction CRUD test
| Field | Value |
|---|---|
| Bug ID | (test gap) |
| Severity | 🟨 Medium |
| Owner | QA-A |
| Effort | 3 h |
| Due | 2026-06-28 18:00 |

**Steps:**
1. Create `tests/p1/transactions.spec.ts`
2. Add `pages/TransactionsPage.ts` POM
3. Test: add transaction, edit, delete, filter by category

**Acceptance:**
- [ ] Test passes
- [ ] Transaction persists after refresh

---

#### Task P3-08 — Mobile responsive test
| Field | Value |
|---|---|
| Bug ID | (test gap) |
| Severity | 🟨 Medium |
| Owner | QA-A |
| Effort | 2 h |
| Due | 2026-06-29 11:00 |

**Steps:**
1. Create `tests/p1/responsive.spec.ts`
2. Use Playwright's `devices` config: iPhone SE, iPhone 13, iPad, Desktop Chrome
3. For each, test: dashboard, settings, signup pages
4. Take screenshots at 3 breakpoints

**Acceptance:**
- [ ] No layout breakage at any breakpoint
- [ ] Bottom nav doesn't overlap content

---

#### Task P3-09 — Lighthouse CI
| Field | Value |
|---|---|
| Bug ID | (test gap) |
| Severity | 🟨 Medium |
| Owner | DO + QA-A |
| Effort | 2 h |
| Due | 2026-06-29 14:00 |

**Steps:**
1. Add `@lhci/cli` to devDependencies
2. Configure `lighthouserc.json` with thresholds: Performance ≥ 80, A11y ≥ 90, Best Practices ≥ 90
3. Add to GitHub Actions on PR
4. Block merge if score drops

**Acceptance:**
- [ ] Lighthouse report on current `master` baseline
- [ ] CI blocks PR if score < threshold

---

## 🔗 Dependency Graph

```
P0-01 ─────┐
P0-02 ─────┤
P0-03 ─────┼──► [GATE 0] Internal deploy OK
P0-04 ─────┘
            │
            ▼
P1-01 ─────┐
P1-02 ─────┤
P1-03 ─────┼──► P1-04 (run tests) ──► [GATE 1] SOFT LAUNCH ✅
            │
            ▼
P2-01 ─────┐
P2-02 ─────┤
P2-03 ─────┤
P2-04 ─────┼──► [GATE 2] 10k users OK
P2-05 ─────┤
P2-06 ─────┘
            │
            ▼
P3-01 ─────┐
P3-02 ─────┤
P3-03 ─────┤
P3-04 ─────┤
P3-05 ─────┼──► P3-06, P3-07, P3-08, P3-09 ──► [GATE 3] FULL LAUNCH ✅
P3-06 ─────┤
P3-07 ─────┤
P3-08 ─────┤
P3-09 ─────┘
```

---

## 🚦 Daily Standup Template

```markdown
### Date: YYYY-MM-DD | Phase: X | Gate: Y
**Yesterday:**
- [task] [done/in-progress/blocked] — [note]

**Today:**
- [task] [planned] — [ETA]

**Blockers:**
- [what's blocking / who's needed]

**Risk register updates:**
- [new risks / mitigations]

**Gate progress:**
- [ ] Gate 0 — % complete
- [ ] Gate 1 — % complete
- [ ] Gate 2 — % complete
- [ ] Gate 3 — % complete
```

---

## ⚠️ Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Phase 1 React Router refactor breaks existing tests | High | Medium | Add `data-testid` to all pages BEFORE refactor, run E2E between refactor steps |
| Stripe key rotation disrupts existing users | Low | Critical | Coordinate with DO, do during off-peak hours, send comm to test users first |
| Migration consolidation needs DB downtime | Medium | High | Use blue-green: new DB alongside, swap DNS after verify |
| Email alerts land in spam | Medium | Medium | Configure SPF/DKIM, use Resend's verified domain |
| Supabase auth auto-confirm breaks in prod | Low | High | Test on staging with real Resend, monitor first 24h |

---

## 📈 Definition of Done (per task)

- [ ] Code committed to `master` (or feature branch merged)
- [ ] PR reviewed by at least one peer
- [ ] CI green (build + tests)
- [ ] No new TypeScript errors introduced
- [ ] If user-facing: verified manually with Playwright screenshot
- [ ] Bug marked as RESOLVED in `reports/QA_AUDIT_REPORT_2026-06-22.md` (table at end of each section)
- [ ] Slack `#daily-stack-sprint` notified with link to commit

---

## 🎉 Sprint Definition of Success

**Hard metrics:**
- ✅ 22/22 bug fixes merged
- ✅ Playwright P0: 3/3 pass (target: pass)
- ✅ Playwright P1: 5+ new specs pass (target: pass)
- ✅ Lighthouse mobile: ≥ 80 (target)
- ✅ Zero live keys in repo (verified by CI guard)
- ✅ Zero critical bugs reported in 48h soft launch window

**Soft signals:**
- Stakeholder demo on Day 5 passes (Soft Launch demo)
- No emergency patches between Day 5 and Day 7
- All-hands retro on Day 7 captures learnings

---

## 📅 Calendar View

```
Sun 22  Mon 22  Tue 23  Wed 24  Thu 25  Fri 26  Sat 27  Sun 28  Mon 29
 Day0   ─P0─►  ─── P1 ───────►  ─── P2 ───────►  ─── P3 ────────────►
                                                                Demo Day
                                                                (Soft Launch)
                                                                              Full Launch
```

**Note:** Day 0 = Sunday (today, 2026-06-22). Working days start Mon 23.

---

**Owner of this board:** CEO (Pick) — review daily at 09:00 and 17:00.
**Last updated:** 2026-06-22 17:13
