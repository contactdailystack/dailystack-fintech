# DailyStack FinTech — QA Audit Report

**Audit Date:** 2026-06-22
**Auditor:** Senior QA Engineer (automated audit)
**Scope:** Frontend, Backend, Database, Edge Functions, Auth, Integration, P0 E2E tests
**Stack:** React 18 + Vite 6 + TypeScript 5.6 + Tailwind 3 + Supabase (Postgres + Edge Functions + Auth) + Stripe

---

## TL;DR — QA Verdict: ❌ **NO-GO**

The build compiles, but the system **fails 3 of 3 P0 end-to-end tests** and contains **multiple Critical/High severity bugs** in migration ordering, authentication routing, and security. Launching to production in current state would expose users to broken signup, broken logout, broken email alerts, and a known-class migration-conflict risk on `profiles` vs `users` tables.

| Severity | Count |
|---|---|
| Critical (P0 — blocks launch) | **6** |
| High (revenue/data risk) | **7** |
| Medium (UX/regression risk) | **5** |
| Low (tech debt / warnings) | **4** |
| **Total** | **22** |

---

## 1. Test Execution Results

### 1.1 TypeScript Compile Check (`tsc --noEmit`)
- **3 errors** in `src/services/alerts/` — `Record<AlertSeverity, number>` missing `success` key.
- `app/tsconfig.json:20` has invalid `ignoreDeprecations: "6.0"` — TS 5.6 only supports `"5.0"`. Command `npm run build` therefore errors out with `TS5103`. Workaround `tsc -b` silently ignores this in `vite build`, hiding the bug from CI.
- **Verdict:** 0 of 3 errors block production code execution; all are correctness bugs that surface in stats paths.

### 1.2 Production Build (`vite build`)
- ✅ Build succeeds (2403 modules transformed, ~21 s).
- ⚠️ Warning: `userTierService.ts` is both static-imported **and** dynamically-imported by `App.tsx`. Dynamic import is dead code and prevents chunk splitting.
- Bundle: ~750 KB JS / 92 KB CSS (gzip: ~290 KB JS / 15 KB CSS). Largest vendor: `vendor-supabase` 211 KB, `vendor-react` 161 KB, `vendor-motion` 115 KB.

### 1.3 Playwright P0 E2E Tests — **3 of 3 FAILED**
| Test ID | Result | Failure |
|---|---|---|
| AUTH-LOGIN-001 | ❌ FAIL (49 s) | `data-testid="dashboard-widgets"` never appears after signup |
| AUTH-SIGN-001 | ❌ FAIL (39 s) | Same — signup returns to email-confirmation view, never reaches dashboard |
| DB-RLS-TRIG-001 | ❌ FAIL (50 s) | Same root cause + later `data-testid="logout-button"` not found |

**Root cause of all 3 failures:** The app uses **SPA `currentSection` state-based navigation** (no URL routing for `/login`, `/signup`, `/dashboard`, `/settings`). When Playwright navigates to `/settings` expecting a logout button on that page, the route matches the catch-all `<Route path="/*">` and renders the **default landing section (dashboard)**, which has no logout button. The test then times out waiting for the dashboard widgets to appear after signup because Supabase Auth requires email confirmation and the app correctly routes the user to the **email-confirmation screen** rather than the dashboard.

---

## 2. Detected Bugs (Categorized)

### 🟥 CRITICAL (P0 — launch blockers)

#### **BUG-C1: Migration ordering conflict on `profiles` vs `users` table**
- **Category:** Database / Migration
- **Reproduction:**
  1. Run migrations in alphabetical order (`001` → `024`)
  2. Migration `008_create_user_wallets_and_add_premium_column.sql:18` does `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`
  3. Migration `019_rename_profiles_to_users.sql:13` later renames `profiles` → `users`
- **Expected:** Migration ordering produces a stable schema.
- **Actual:** After `019` runs, the table is `users`, not `profiles`. Migrations `008`, `010`, `011`, `018` all reference `profiles` and will fail or behave incorrectly on a fresh DB or a DB being migrated forward. `018` also re-enables RLS on `profiles` AFTER `001` disabled it (with the documented reason that signup trigger can't bypass RLS), so even on legacy DBs you get flicker-on-flicker-off.
- **Files:**
  - `supabase/migrations/008_create_user_wallets_and_add_premium_column.sql`
  - `supabase/migrations/010_add_subscription_tier_to_profiles.sql`
  - `supabase/migrations/018_fix_profiles_rls.sql`
  - `supabase/migrations/019_rename_profiles_to_users.sql`
- **Fix:** Either (a) consolidate to a single canonical migration that creates `users` directly, (b) keep `profiles` as the public name and rename in code only, or (c) update all migrations to use `users` from the start. Whichever is chosen, lock the migration ordering and document it.

#### **BUG-C2: Live Stripe secret keys present in `.env.local` (security)**
- **Category:** Security / Configuration
- **Reproduction:** `cat app/.env.local`
- **Expected:** Test keys (`pk_test_*`, `sk_test_*`) or no keys.
- **Actual:** Contains `STRIPE_SECRET_KEY=sk_live_***[REDACTED]***` (live key starting with `sk_live_`). A live webhook secret (`whsec_***[REDACTED]***`) is also exposed.
- **Risk:** Anyone with the local repo + .env.local can charge real cards and read the webhook secret. The file is in `.gitignore`, but it's still on disk and any Vercel/deploy pipeline that reads `.env.local` will deploy with live keys.
- **Fix:**
  1. Rotate the Stripe keys immediately (revoke current `sk_live_*` and `whsec_*`).
  2. Replace with `sk_test_*` for non-prod.
  3. Audit Supabase Edge Function env config — confirm it has its own set of live keys (not duplicated).
  4. Add a pre-commit hook + CI guard that fails if any `.env*` file contains `sk_live_` or `pk_live_`.

#### **BUG-C3: Signup flow does not reach dashboard (P0 E2E test fails)**
- **Category:** Auth / UX
- **Reproduction:**
  1. Visit `/signup` (SPA fallback) → AuthPage renders register view.
  2. Submit email + password + name → `signUp()` returns `needsEmailConfirmation: true`.
  3. App shows email-confirmation view; **never sets `currentSection = 'dashboard'`**.
  4. A real user with email confirmation disabled in Supabase Auth (or a session-less environment) ends up stuck on the email-confirmation screen.
- **Expected:** After signup, the user lands on the dashboard (or onboarding).
- **Actual:** After signup, the user is stuck on the email-confirmation screen until they click the magic link. There is no OTP input on the email-confirmation screen — the `AuthPage` references `OTPInput` in the TSX but never wires it up; the UI only shows "We sent a 6-digit code to..." with a Resend button. **No code-entry UI exists.**
- **Files:** `app/src/components/AuthPage.tsx:870–1001` (email-confirmation view has no OTP input wired)
- **Fix:** Either (a) wire up the OTPInput component and call `verify-otp` edge function, (b) auto-confirm emails in Supabase Auth config for MVP and route directly to dashboard after signup, or (c) show a "Confirmation link sent. Open your email" message with a clear next step and let users click a "I've confirmed, continue" button that polls `supabase.auth.getSession()`.

#### **BUG-C4: Logout flow broken because Playwright can't navigate to `/settings`**
- **Category:** Auth / Routing
- **Reproduction:** Click any tab (e.g., profile button at bottom-right). The URL **does not change** — only React state `currentSection` changes.
- **Expected:** Browser URL updates to reflect the current view (e.g., `/settings`, `/dashboard`) so users can deep-link, share, and refresh.
- **Actual:** URL is always `/` (or `/auth/callback` during OAuth). Refreshing the page **loses navigation state** and lands the user back on the dashboard. Logout button only exists on `ProfileSettingsPage`, but the bottom-nav `Profile` button is the only way to reach it. There is no deep link, no back button, no browser-back handling.
- **Files:** `app/src/App.tsx:64–69` (Routes), `app/src/App.tsx:87–400` (state-based routing)
- **Fix:** Convert `currentSection` to URL routes via React Router (`<Route path="/dashboard" element={...} />`, etc.). At minimum, use `useNavigate` + `navigate('/settings')` when the profile button is clicked so refresh preserves state.

#### **BUG-C5: Signup trigger race condition on `auth.users` insert**
- **Category:** Database / Trigger
- **Reproduction:**
  1. Migration `001_initial_schema.sql` creates `handle_new_user()` and `profiles` table with RLS disabled.
  2. Migration `019` renames `profiles` → `users` and recreates `handle_new_user()` to insert into `users`.
  3. If a fresh database hits `019` BEFORE `001`, the trigger creation fails because `profiles` doesn't exist (but `INSERT INTO users (...)` works). If `001` runs without `019`, the trigger inserts into `profiles`. If both run, the second `handle_new_user()` definition from `019` overrides the first — but the `search_path` was unset (PG 12+ defaults to empty), and `003_fix_handle_new_user_search_path.sql` exists to fix this — verify it runs in the right order.
- **Expected:** One canonical handle_new_user function on `users` table with `search_path` set.
- **Actual:** Function is recreated 3+ times across migrations (`001`, `019`, `003_fix_handle_new_user_search_path`). Race + ordering means some envs end up with a trigger inserting into a non-existent table.
- **Files:** `supabase/migrations/001_initial_schema.sql:35–46`, `supabase/migrations/003_fix_handle_new_user_search_path.sql`, `supabase/migrations/019_rename_profiles_to_users.sql:28–42`
- **Fix:** Consolidate into a single migration. Add `SET search_path = public, auth` to the function definition so it works regardless of caller context.

#### **BUG-C6: Vercel build will fail on CI due to invalid tsconfig**
- **Category:** Build / CI
- **Reproduction:**
  1. `cd app && npm ci && npm run build`
  2. `npm run build` runs `tsc -b && vite build`.
  3. `tsc -b` errors out with `TS5103: Invalid value for '--ignoreDeprecations'` because `tsconfig.json:20` has `"ignoreDeprecations": "6.0"` but TS 5.6 only supports `"5.0"`.
- **Expected:** Build succeeds.
- **Actual:** Local `npx tsc --noEmit` errors out. CI builds will fail with the same error.
- **Files:** `app/tsconfig.json:20`
- **Fix:** Change `"ignoreDeprecations": "6.0"` → `"ignoreDeprecations": "5.0"`.

---

### 🟧 HIGH (revenue / data risk)

#### **BUG-H1: `send-alert-email` edge function doesn't exist**
- **Category:** Backend / Edge Functions
- **Location:** `app/src/services/alerts/alertNotifications.ts:266`
  ```ts
  const { error } = await supabase.functions.invoke('send-alert-email', { body: {...} });
  ```
- **Expected:** Edge function exists and sends email.
- **Actual:** No `send-alert-email` function exists in `supabase/functions/`. The `EmailNotificationSender.send()` silently fails (try/catch returns `false`) — email alerts never arrive.
- **Reproduction:** Trigger any alert with `channel: 'email'`. User never receives email.
- **Fix:** Create `supabase/functions/send-alert-email/index.ts` (similar to `resend-otp` for Resend API).

#### **BUG-H2: `resend-otp` endpoint allows arbitrary OTP generation for any user**
- **Category:** Security / Edge Functions
- **Location:** `supabase/functions/resend-otp/index.ts:125–168`
- **Reproduction:** Anyone can call the endpoint with `{ user_id: <any-uuid>, email: <any-email> }` and trigger an OTP email to that user. Repeated calls = email spam / DoS.
- **Expected:** Only the authenticated user can request OTP for their own account.
- **Actual:** No `getCallerUserId(req)` check. Service-role key used, no caller validation. While `verify-otp` does enforce `callerId === targetUserId`, anyone can still **spam** users with OTPs.
- **Fix:** Validate `callerId === user_id` (same pattern as `verify-otp`). If unauthenticated, require an additional proof-of-possession (e.g., captcha) or rate-limit by IP.

#### **BUG-H3: Money transfer wallet race condition (no DB transaction)**
- **Category:** Backend / Data Integrity
- **Location:** `app/src/services/walletService.ts:109–165`
- **Reproduction:** Two concurrent transfers for the same user. Both read `wallet.balance = 100`, both check `>= amount`, both subtract. User ends up with negative balance.
- **Expected:** Wallet balance update is atomic (DB transaction with `SELECT ... FOR UPDATE` or atomic decrement).
- **Actual:** Plain read-modify-write. No row lock, no transaction, no optimistic concurrency.
- **Files:** `walletService.ts:124–158`
- **Fix:** Wrap in a Postgres function `decrement_wallet_balance(user_id, amount)` with `SELECT ... FOR UPDATE`. Or use Supabase RPC.

#### **BUG-H4: TypeScript strict-mode errors in alerts (severity type)**
- **Category:** Build / Type Safety
- **Location:**
  - `app/src/services/alerts/alertEngine.ts:711` — `severityToScore` missing `success` key
  - `app/src/services/alerts/alertService.ts:599,652` — `alertsBySeverity` missing `success` key
- **Expected:** Compiles with `--strict`.
- **Actual:** `tsc --noEmit` returns 3 TS2741 errors. Runtime: when an alert with `severity: 'success'` is counted, `stats.alertsBySeverity['success']++` writes to `undefined` and creates a NaN.
- **Fix:** Add `success: <value>` to all three objects.

#### **BUG-H5: Stripe webhook expects live `STRIPE_PRICE_*` env vars that aren't set**
- **Category:** Backend / Payment
- **Location:** `supabase/functions/stripe-webhook/index.ts:72–73`
  ```ts
  const expectedPrices: Record<string, number> = {
    pro: parseInt(Deno.env.get("STRIPE_PRICE_PRO") ?? "9900"),
    elite: parseInt(Deno.env.get("STRIPE_PRICE_ELITE") ?? "19900"),
  };
  ```
- **Expected:** Tier upgrade is verified against the actual Stripe price.
- **Actual:** Falls back to hardcoded `9900` / `19900` satang. If the live Stripe price is different, the verification **silently rejects** all upgrades. The `paywall` page would never successfully upgrade any user.
- **Fix:** Require these env vars at function boot (fail fast). Use Stripe price IDs (`price_xxx`) and look up via `stripe.prices.retrieve()` for the canonical amount.

#### **BUG-H6: Dynamic import of `userTierService` is dead code + bundle bloat**
- **Category:** Build / Performance
- **Location:** `app/src/App.tsx:15` (static import), `app/src/App.tsx:163` (dynamic import)
- **Expected:** Either fully static (most pages already pay the cost) or fully dynamic.
- **Actual:** Both. Vite warns. The dynamic `import()` resolves the same already-loaded module — no benefit, just noise.
- **Fix:** Remove the `await import('./services/userTierService')` wrapper; use the static import.

#### **BUG-H7: CSP allows `unsafe-inline` scripts**
- **Category:** Security / Deployment
- **Location:** `app/vercel.json:38`
  ```
  "script-src 'self' 'unsafe-inline'"
  ```
- **Expected:** Strict CSP that disallows inline scripts (use nonce/hash).
- **Actual:** `unsafe-inline` is allowed, defeating CSP's primary XSS protection.
- **Fix:** Either accept and document the trade-off (Framer Motion + Vite inline runtime make hash-based CSP difficult), OR move to a CSP with `script-src 'self' 'nonce-...'` and inject the nonce at runtime. Low priority for MVP if XSS risk is otherwise contained.

---

### 🟨 MEDIUM (UX / regression risk)

#### **BUG-M1: Two parallel translation systems**
- **Category:** Architecture / i18n
- **Locations:**
  - `app/src/data/translations.ts` (1,258 lines, used by most components)
  - `app/src/locales/en.json` (~1.2 KB, 30 entries) and `th.json` (~2 KB, 30 entries) loaded via `i18n.ts`
- **Reproduction:** Some strings fall through to i18next, others use `translations[lang]`. The two systems are not kept in sync.
- **Fix:** Pick one. Recommend `translations.ts` (TypeScript types + autocomplete) — remove `i18n.ts`, `locales/en.json`, `locales/th.json`.

#### **BUG-M2: AuthPage `Forgot Password?` button does nothing**
- **Category:** UX / Dead UI
- **Location:** `app/src/components/AuthPage.tsx:629–636`
  ```tsx
  <button type="button" className="text-xs font-bold underline...">Forgot Password?</button>
  ```
- **Expected:** Clicking navigates to a password-reset flow or opens a dialog.
- **Actual:** No `onClick` handler. The button is decorative.
- **Fix:** Wire to `supabase.auth.resetPasswordForEmail(email, { redirectTo: '...' })` or remove the button.

#### **BUG-M3: "Continue with Google" is a fake spinner**
- **Category:** UX / Trust
- **Location:** `app/src/components/AuthPage.tsx:489–494, 651–653`
  ```ts
  const handleSocialLogin = async () => {
    setSocialLoading('google');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSocialLoading(null);
  };
  ```
- **Expected:** OAuth flow opens Google popup, then either completes or shows error.
- **Actual:** Shows a spinner for 1.5 s, then nothing. Users may believe their login succeeded.
- **Fix:** Wire to `supabase.auth.signInWithOAuth({ provider: 'google' })`.

#### **BUG-M4: `AuthCallbackPage` timeout 3 s is too short for slow networks**
- **Category:** UX / Edge case
- **Location:** `app/src/components/AuthCallbackPage.tsx:20–24`
- **Reproduction:** On a 3G connection, Supabase session token exchange can take >3 s. The component switches to `failed` state and shows a misleading "Verification failed" message.
- **Fix:** Increase to 10 s, and add a retry mechanism.

#### **BUG-M5: AuthContext runs `onAuthStateChange` listener twice**
- **Category:** Logic / Resource leak
- **Location:** `app/src/services/AuthContext.tsx:59–109`
- **Reproduction:** In React StrictMode (which the app uses per `main.tsx:13`), useEffect runs twice on mount in dev. The `unsubscribe` from the first run is correctly returned and cleaned up, but during the double-mount window there are two listeners attached.
- **Impact:** Mostly benign in dev. In production, the listener is registered once on mount. The note on line 134 (`// onAuthStateChange already registered in the first useEffect above`) suggests an earlier duplicate was removed but the code still looks confusing.
- **Fix:** Consolidate `getCurrentUser()` and `onAuthStateChange` registration into one useEffect (already done correctly), but rename the unused `state` callback signature and remove the dead comment.

---

### 🟦 LOW (tech debt / warnings)

#### **BUG-L1: `console.error` leaks raw DB errors to user console**
- 41 instances across `app/src/services/*.ts`. Errors are logged but not shown to the user; if logging is enabled in prod, sensitive schema info may leak. Use a centralized logger with redaction.

#### **BUG-L2: Mock data returned when DB calls fail (silent failure)**
- `getRecentRecipients`, `getPaymentSources` in `walletService.ts:171–201` return hardcoded mock data with no indication that the real fetch failed. Users may transact with stale info.

#### **BUG-L3: Unused imports / dead exports**
- `app/src/components/FloatingBottomNav.tsx:18` imports `Wallet` from lucide-react but uses `Wallet` from icon set — verify each icon is actually referenced. (Spot check passed, but worth a `ts-prune` sweep.)

#### **BUG-L4: `App.tsx` is 426 lines and mixes routing, data loading, and event handlers**
- Split into `useAppShell()` hook + `<AppShellView>` component for testability.

---

## 3. Integration / API Findings

| Area | Finding | Severity |
|---|---|---|
| Stripe webhook | Validates amount via env vars (good), but env vars may be unset in prod → silent upgrade failure | High |
| Stripe webhook | No idempotency — replaying the same event upgrades the user twice and inserts duplicate `user_subscriptions` rows | Medium |
| OTP | Stored as SHA-256 hash (good). Verify-otp enforces caller==target (good). Resend-otp does NOT (BUG-H2) | High |
| Edge Function CORS | All functions allow `Access-Control-Allow-Origin: *` — fine for MVP but should be locked down before public launch | Low |
| Auth flow | Supabase email confirmation enabled (causes BUG-C3). No auto-confirm path for dev/staging. | Critical |
| `supabaseClient.ts` | Uses placeholder URL when env vars are missing — silently fails all DB calls. Should throw on startup. | Medium |

---

## 4. UI/UX Findings (Static Code Review)

| Component | Issue |
|---|---|
| `FloatingBottomNav.tsx` | Only 5 tabs visible (dashboard, subscriptions, networth, activity, settings). The "More" page is unreachable from the bottom nav. |
| `AuthPage.tsx` | Thai strings are hardcoded English (e.g., "Login Successful!" instead of "เข้าสู่ระบบสำเร็จ!"). User requested Thai-first UI but the success screen is English. |
| `AuthPage.tsx` | The "Login Successful!" success screen hardcodes English text even when `lang === 'th'`. |
| `SubscriptionTrackerPage.tsx` | 1,650 lines — single file, hard to test. Refactor into sub-components. |
| `DashboardPage.tsx` | 870 lines, 6 page layouts stacked. Hard to navigate. |
| Bottom nav safe area | Uses `env(safe-area-inset-bottom)` correctly on iOS but on Android Chrome bottom-bar overlays content in landscape. |
| All `*.tsx` | `framer-motion` is imported from 34 files; `motion/react` from 31. Both work because `framer-motion` is a transitive dep, but the inconsistency should be standardized. |

---

## 5. Performance Findings

| Metric | Value | Target | Status |
|---|---|---|---|
| Main JS bundle | 199 KB (66 KB gzip) | < 150 KB gzip | ⚠️ borderline |
| Vendor supabase | 211 KB (54 KB gzip) | n/a (necessary) | ⚠️ heavy |
| Total JS | ~750 KB (~290 KB gzip) | < 300 KB gzip | ⚠️ above target |
| Total CSS | 92 KB (15 KB gzip) | < 30 KB gzip | ⚠️ above target |
| Initial render | unknown — needs Lighthouse run | < 2 s FCP | ❓ untested |
| Edge Function cold start | unknown | < 500 ms | ❓ untested |

**Recommendation:** Run `vite build` with `visualizer` plugin (`rollup-plugin-visualizer`) to find unused exports in `vendor-supabase`. The size is dominated by `@supabase/supabase-js`; if only `auth` + `from` are used, switch to the slim build.

---

## 6. Regression Test Coverage

| Feature | Has test? | Status |
|---|---|---|
| Auth signup | ✅ Playwright `auth.signup.spec.ts` | ❌ failing |
| Auth login | ✅ Playwright `auth.login.spec.ts` | ❌ failing |
| DB trigger | ✅ Playwright `db.trigger.spec.ts` | ❌ failing |
| Subscription tracker | ❌ no test | gap |
| Transactions CRUD | ❌ no test | gap |
| Paywall / Stripe | ❌ no test | gap |
| Edge Functions | ❌ no test (only docs) | gap |
| Mobile responsive | ❌ no test | gap |
| Accessibility (a11y) | ❌ no test | gap |

**Coverage is ~10% of critical paths.** High risk of regressions after every release.

---

## 7. QA Verdict

### ❌ **NO-GO** for production launch

**Top 3 launch blockers (must fix before release):**

1. **BUG-C3** — Signup flow ends on email-confirmation screen with no way to enter OTP code. New users cannot complete onboarding.
2. **BUG-C4** — No URL routing means refresh loses navigation and the app is unusable as a real web app (only as a single-page kiosk).
3. **BUG-C2** — Live Stripe secret key sitting in `.env.local`. Even if `.gitignore`d, it's a data breach waiting to happen.

**Top 3 fixes within 1 week post-launch:**

4. **BUG-C1 / C5** — Migration consistency on `profiles` ↔ `users`.
5. **BUG-H3** — Wallet transfer atomicity.
6. **BUG-H1** — Email alert pipeline.

**Suggested fix order (engineering priority):**

| # | Bug | Owner | Effort |
|---|---|---|---|
| 1 | C2 — Rotate Stripe keys | Backend | 30 min |
| 2 | C6 — Fix tsconfig | Frontend | 5 min |
| 3 | H4 — Fix TS errors in alerts | Frontend | 30 min |
| 4 | C3 — Wire OTP or auto-confirm | Frontend + Backend | 4 h |
| 5 | C4 — Add React Router routes | Frontend | 6 h |
| 6 | H1 — Create `send-alert-email` | Backend | 2 h |
| 7 | H2 — Validate resend-otp caller | Backend | 1 h |
| 8 | H3 — Atomic wallet transfer | Backend | 3 h |
| 9 | H5 — Stripe price env validation | Backend | 30 min |
| 10 | C1 / C5 — Migration consolidation | Backend | 4 h |

After fixes 1–10, re-run the 3 P0 Playwright tests. If all pass, **GO for soft launch** (limited user cohort). After 48 h with no critical bug reports, **GO for full launch**.

---

## 8. Reproducible Bug Cards

For each P0 bug, a one-line reproduction card for the dev team:

```
[BUG-C3] Signup OTP entry missing
  Step: Sign up with email/password/name
  Expect: Land on dashboard
  Actual: Land on "Check Your Email" screen with no OTP input
  File: app/src/components/AuthPage.tsx:870-1001

[BUG-C4] Logout navigation broken
  Step: Click profile button in bottom nav
  Expect: URL = /settings, logout button visible
  Actual: URL stays at /, logout button not on dashboard
  File: app/src/App.tsx:87-400

[BUG-C6] TS config invalid
  Step: cd app && npx tsc --noEmit
  Expect: Compiles
  Actual: TS5103 error
  File: app/tsconfig.json:20
```

---

**End of audit. Re-test after fixes — happy to run another pass.**
