# PicksWise / DailyStack FinTech — Agent Knowledge Base

## Project Overview
- **App Name:** PicksWise (formerly DailyStack FinTech)
- **Type:** Thai fintech subscription tracker app
- **Framework:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase

## QA Audit Lessons (2026-06-12)

### Feature Rename QA Workflow
When auditing feature renames across the codebase:

1. **Grep first** — Search for new terminology across all `.ts`, `.tsx` files
   ```
   grep -r "NEW_TERM" --include="*.tsx" --include="*.ts"
   ```

2. **Verify translations.ts** — All user-facing strings must be in `translations.ts`
   - Check both `en` and `th` sections
   - Verify key names match between sections

3. **Check notification templates** — Tesla-style features need push notification templates
   - Located in `app/src/services/alerts/alertNotifications.ts`
   - Template functions: `ghost_detected`, `weekly_story`, `guardian_alert`, `goal_progress`, `money_twin_insight`

4. **Verify navigation** — Check `FloatingBottomNav.tsx` for tab labels

5. **TypeScript check** — Run `npx tsc --noEmit` after any code changes
   - In project: `cd app && npx tsc --noEmit`

### Tesla-Style Feature Naming (2026-06)
| Feature | English Name | Thai Name |
|---------|-------------|----------|
| Dashboard | Money Pulse | พัลส์เงิน |
| Subscriptions | Subscription Shadow | เงาการสมัคร |
| Weekly Summary | Money Story | เรื่องราวเงิน |
| AI Insights | Money Twin | มันนี่ทวิน |
| Goals | Goal Launcher | ตัวปล่อยเป้าหมาย |
| Budgets | Spending Guardian | ผู้พิทักษ์การใช้จ่าย |
| Settings | Control Center | ศูนย์ควบคุม |

### Common Issues Found
1. **Thai typos** — Thai text often has missing characters (ร, ะ, etc.)
   - Always verify Thai strings against expected spelling

2. **Hardcoded strings** — Some components have hardcoded Thai/English
   - Best practice: Always use `translations.ts` for user-facing text

### Design Tokens (Verified 2026-06)
- Background: `#0B0F0A`
- Surface: `#171C15`
- Accent: `#C7FF2E`
- Font: Space Grotesk (EN), Kanit (TH)

---

## Changelog

### 2026-08-24 (latest — Perf Phase 1: fonts + boot parallelization)
- FONT BUG FOUND: all 8 self-hosted woff2 files were the SAME variable-font file duplicated under 4 weight URLs each (identical MD5) → browser could fetch identical bytes up to 4× (~294KB worst case); consolidated to 3 files (inter-var-latin / jetbrains-mono-var-latin / noto-sans-thai-var-thai, 113KB total) with weight-range @font-face + unicode-range (Noto only serves Thai glyphs; Latin falls through to Inter)
- DEAD FONT IMPORTS REMOVED: Onest was loaded from Google Fonts TWICE (index.html link + index.css @import) but no CSS token referenced it — both deleted along with JetBrains Mono @import; ZERO third-party font requests now
- Preload first-paint faces in index.html: inter-var-latin + jetbrains-mono-var-latin (crossorigin); Noto Thai intentionally NOT preloaded (EN users shouldn't pay for it)
- AuthContext render-first: user state set immediately on session restore/login, getUserProfile() enrichment runs async after (−1 RTT to TTI); guards against stale-user overwrite via prev.user?.id check
- MEASURED & REVERTED: removing lucide-react from manualChunks produced 30+ icon micro-chunks, inflated SubscriptionTrackerPage 75→93KB and net-zero byte savings — vendor-icons shared chunk KEPT (rationale commented in vite.config.ts)
- Shipped: commit 0823825 (branch + main fast-forward from 09f07fa) → vercel --prod READY dpl_9TJczEpKRbZnLGfX7CHZy2zkXTxp, live at https://dailystack-fintech.vercel.app (preloads verified in prod HTML)
- TypeScript: 0 errors; production build passes

### 2026-08-24 (RM parity round 3: auto-discovery + cancel instructions + net income)
- #1 Auto-discover subscriptions: NEW services/recurringDetector.ts detectSubscriptionSuggestions(txns, subs) — groups expenses by normalized merchant, ≥2 charges, amount max/min ≤1.25×, interval window weekly 6-9d / monthly 25-35d / yearly 350-380d, median amount, ranked by annual impact, top 5, skips merchants matching existing active subs (contains both ways); SuggestionCard on /subscriptions (upcoming+all tabs) w/ Add button (matches MERCHANT_DATABASE template for category/color) + X dismiss persisted in pickswise.subsuggestions.dismissed.v1; App passes transactions prop
- #2 Cancel instructions (replaces RM concierge): CANCEL_INSTRUCTIONS map in merchantDatabase.ts (Netflix/Spotify/YouTube/Disney+/HBO GO/IQIYI/WeTV/Apple/Google/Amazon/Microsoft/Grab/Foodpanda — TH+EN steps + official URLs), findCancelInfo() longest-match fuzzy lookup; ActionsMenu gains "ดูคู่มือการยกเลิก" row (only when known) → CancelInstructionsSheet bottom sheet w/ numbered steps + open-official-page button + "cancelling here only hides it" disclaimer; wired at BOTH ActionsMenu call sites (calendar view + main)
- #3 Net income stat: QuickStatsGrid new card "สุทธิเดือนนี้" = Σ tx.amount filtered to current calendar month (income−expense), green/red by sign w/ TrendingUp/Down icon
- Orphaned translation key subShadowViewCancelInstructions superseded by inline labels (translations.ts untouched)
- TypeScript: 0 errors; production build passes

### 2026-08-24 (RM parity P2 features #1–#4 + dead-code purge + production deploy)
- A1 annual price per row: AllTabItem shows "≈ ฿X/ปี" under monthly/weekly subs (getAnnualAmount weekly×52 · monthly×12; yearly rows unchanged); optional showAmount prop
- A2 Merchant leaderboard in InsightsPage: top-5 merchants by cumulative spend with rank badges (#1 tan premium color) + mini bars (% of total spend) + largest-single-purchase footer line; skips empty merchant names
- A3 bill calendar already existed (FullCalendarView tab w/ month nav, date→upcoming drill-down) — verified reachable, no work needed
- A4 Activation checklist on DashboardPage: 3 steps (add sub / record or import txs / set budget) computed from real data, tap-to-navigate, auto-dismisses permanently when all done (pickswise.checklist.dismissed.v1) or via X
- Dead code deleted: DatabasePage (+ its orphaned /database route & lazy import), ProfilePage, BalancePage, SplashScreen, OnboardingPage, PrivacyPage; AlertsPage REVIVED — routed at /alerts (GlobalAlertBanners navigates there)
- Production shipped: commit d86c8b3 pushed to main (fast-forward from 41fc1c0) + vercel --prod → https://dailystack-fintech.vercel.app READY (dpl_CU85cmcLxHN4n6TgXmiPsGgjmvyZ)
- Supabase CLI still 403 (LegacyDbConfigLoginRoleStatusError / FunctionsApiStatusError) — migration 029 apply + delete-account deploy remain USER actions in Dashboard
- Dark mode dropped from backlog per user decision
- TypeScript: 0 errors; production build passes

### 2026-08-24 (RM parity P1: Safe to Spend + global alert banners + new alert types + ฿ fix)
- Research pass: Rocket Money UX/UI compared against PicksWise; gaps = safe-to-spend, in-app banners, alert types (low balance / duplicate charge / bill-due), $ hardcode; PicksWise already ahead on tx search/filter, notes/splits/rules, ghost hunter
- Safe to Spend: NEW services/safeToSpend.ts computeSafeToSpend({balance,paydayDay,subs}) → balance − Σ active subs due before next payday (30d window when paydayDay unset); DashboardPage gains 'safe' section (FIRST in DASH_SECTIONS; loadDashPrefs auto-appends for existing users) rendering SafeToSpendCard (big mono amount respects showAmounts, negative → error red + "short by", sub-line bills summary, View-bills CTA → /subscriptions)
- Alerts system actually alive now: AlertsProvider was NEVER mounted (AlertsPage crashed on open; evaluateAlerts had zero callers) → provider now wraps the whole authed tree in App.tsx; initializeDefaultRules made idempotent per-rule-name (existing users receive newly added defaults without duplicates)
- GlobalAlertBanners.tsx: fixed top stack (safe-area aware, max 2, severity colors critical/alert/warning/info, TH/EN), X = acknowledge+local close, tap = acknowledge + navigate /alerts; only status='active' alerts surface (no re-flash after reload)
- AlertsRuntime.tsx: headless bridge inside provider — debounced 4s evaluateAlerts(transactions,{balance,subscriptions}) keyed on tx count+newest id + balance; App loads active subs once per login into alertSubs state (reset on logout) for the engine
- New alert metrics: balance (ctx-injected; -1 when unknown so lt-rules never misfire), duplicate_count (same merchant±contains + same amount ≤48h apart, distinct ids), bills_due_7d (active subs due within 7 days); AlertMetric union extended; generateAlertContent has Thai-first copy for all three
- New DEFAULT_ALERT_RULES: Low Balance Warning (<฿2,000, push+in_app, cooldown 12h), Duplicate Charge Detected (≥1, security category, no auto-resolve), Upcoming Bills Reminder (≥1 due 7d, push+in_app)
- Cooldown dedupe in evaluateAlerts: skips rule if its latest alert is younger than cooldownMinutes (was trusting caller that never checked)
- AlertsPage hooks violation fixed: acknowledge/resolve/dismiss destructured at top (were calling useAlerts() inside onClick closures — runtime crash)
- InsightsPage: hardcoded `$` ×2 (spend hero + category bars) → ฿
- TypeScript: 0 errors; production build passes

### 2026-08-24 (P2 polish: real goals + ghost/mark-paid integrity + budget page demo-data purge)
- Real goals loaded: App `goals` state now fetches via goalService.fetchGoals(user.id) on login (was empty useState forever); reset on logout; passed to BudgetManagementPage (new optional `goals` prop) and GoalSimulationPage
- Budget page Goals tab: fake savingsGoals array deleted → maps real Supabase goals (goal_name/target_amount/current_amount/target_date→YYYY-MM); zero-goal empty-state card links to /simulation
- GHOST BUG FIX: isGhostSubscription flagged EVERY active sub as ghost (`!lastPaidDate → return isActive`; nothing ever wrote lastPaidDate) → now: inactive never ghost; paid-date stale >60d = ghost; never-paid = ghost only if created_at >60d ago (createdAt added to Subscription type + mapper)
- Mark-as-Paid now real: handleMarkPaid was console.log stub → persists lastPaidDate (DB `notes` column, documented hack) via updateSubscription + local update; failure surfaces loadError
- Budget page demo-data purge: monthlyData hardcoded 6-month chart → computed from real transactions (expenses grouped by month, current totalBudget reference line); fake "AI overspent Shopping 30%" card → aiInsight memo (highest-utilisation category with spend; over-budget red variant; dead Cooling-Rule button → link to /profile rules manager)
- Custom category delete: Trash2 button on custom-* budget rows → saveBudgets(filter); default categories intentionally undeletable (loadBudgets re-seeds them — edit limit to 0 instead)
- Subs payday wiring completed: dead paydayEnabled/paydayDay useStates + getSafeToSpend + currentBalance prop removed → windowMode '7d'|'payday' toggle above HeroCard (renders when profile.paydayDay set; App passes it); getDaysUntilDue localized (lang param)
- ErrorBoundary mounted around AuthProvider in App.tsx; tokens.css light --text-muted #9CA3AF → #6B7280 (4.6:1 AA)
- TypeScript: 0 errors; production build passes

### 2026-08-24 (UX/UI Audit Fix Pass: P0 data integrity + P1 RM parity + quick wins)
- P0-1 Delete now persists: App.handleDeleteTransaction → async, awaits transactionService.deleteTransaction(id) then filters local; cascades `${id}-split` synthetic twin (synthetic ids skip DB)
- P0-2 AuthPage Thai mojibake (~35 spots incl. hero JSX) repaired via Edit tool only
- P0-3 Mock flash gated: App seeds profile balance/portfolioValue = 0, transactions [] until Supabase loads; logout resets to zeros; SubscriptionTrackerPage MOCK_SUBSCRIPTIONS block deleted entirely (honest empty state)
- P0-4 Activity drawer Edit seeds form (editingTx state; merchant/amount/category/note); new updateTransactionCore(id,{amount,description→reference_id,category}) in transactionService (sign via amountToDB); modal title/button switch to Edit mode; balance check skipped on edit
- P1-5 Subs Inactive flow: activeSubscriptions/inactiveSubscriptions split; CANCELLED section in All tab; ActionsMenu gains onToggleActive (Cancel subscription / Reactivate replaces Hide — onHide prop removed from all 4 call sites)
- P1-6 Budget red tier >100% (cards, overall %, progress bars, over-budget alerts, "Left" negative); Days-Left/Avg/Day/Projected quick stats now computed from real dates (were 21 / ÷10 hardcodes)
- P1-7 alertEngine budget_variance wired: MetricCalculator.calculateBudgetVariance() = max over-limit % across budgetStore categories this month
- P1-8 Price-hike + trial badges added to AllTabItem (active rows only), same styling as Upcoming
- P1-9 Modal edit preserves subscription.brand color (category color only for new subs); dashboard UpcomingBills rows get letter avatars from sub.color
- P1-10 ProfileSettingsPage: Language EN/ไทย segmented control using plumbed setLang; Push alerts toggle (isPushSupported-gated, subscribeToPush/unsubscribeFromPush, reflects existing pushManager subscription)
- P1-11 HeroCard activeCount bug fixed (was summing money as count; new activeCount prop); DashboardPage monthlyBudget no longer defaults ฿5,000 — derives total limit from budgetStore when prop absent
- Quick wins: DashboardPage getCat case-insensitive; 'stories' nav targets → 'insights' ×2; ActivityPage formatCurrency always ฿ (EN was $÷100); DailyStack sweep → PicksWise (App loading ×4, AICoach greeting rewritten without emotion-system copy, alertNotifications [PicksWise]/pickswise.app/tag/event, pickswise-*.csv, AuthCallback D→P); 'ลัดเลา'→'ทางลัด'
- TypeScript: 0 errors; production build passes

### 2026-08-24 (Platform & Access + Compliance)
- PWA: manifest.json rewritten (PicksWise, theme #071838, PNG icons — SVG-only refs were broken); generated icon-192/512 + apple-touch-icon 180 + sw notification/badge icons via .NET System.Drawing; index.html: manifest link, theme-color, apple meta, title → PicksWise; sw.js already registered via pushService
- App Lock: services/appLockService.ts (PIN SHA-256+salt in localStorage pickswise.applock.v1, session unlock sessionStorage, WebAuthn platform biometric register/unlock local, AUTOLOCK_MINUTES=5); components/AppLockScreen.tsx (keypad overlay z-100, error shake, biometric button, sign-out escape); wired in AppShell: idle timer + visibilitychange re-lock
- Share: services/shareService.ts (navigator.share → clipboard fallback), settings entry
- PDPA consent: services/consentStore.ts (pickswise.consent.v1, version-gated) + PdpaConsentBanner (bottom sheet, Accept all / Essential only, links to legal pages) mounted for authed users until accepted
- Legal: NEW LegalDocsPage.tsx bilingual (/privacy /terms routes) — PDPA controller/purposes/retention/rights §30 sections + ToS with financial disclaimer
- Data rights: dataExportService.ts (JSON export: profile/consent/txs/subs/budgets/rules download); delete-account edge function written (supabase/functions/delete-account, service-role purge across user tables + auth.admin.deleteUser) — NOT deployed (403 FunctionsApiStatusError, same privilege issue as Management API)
- Settings "Security & Data" card: PIN setup/disable modal, biometric toggle (only when platform auth available), Export, Share, legal links, two-tap Delete account (graceful failure toast until function deployed)
- Financial disclaimer added above app version in settings
- TypeScript compilation: 0 errors; production build passes

### 2026-08-24 (later — Rocket Money parity features #3–#7 + 2026 rebrand)
- Migration 029 written (NOT yet applied — Supabase Management API returns 403 LegacyDbConfigLoginRoleStatusError; user must run supabase/migrations/029_premium_transaction_features.sql in Dashboard SQL Editor): subscriptions.trial_end_date, user_transactions.note/is_ignored/split_category/split_amount, transaction_rules table + RLS
- #3 Free trials: SubscriptionTrackerPage modal toggle+date, trial badge (≤3d red / ≤14d amber), trialEndDate wired through validation + service both directions
- #4 Smart budgets: services/budgetStore.ts (localStorage pickswise.budgets.v1, custom keys preserved); BudgetManagementPage now store-backed with REAL month spend; suggestions = avg 3-month spend per category (skips zero-history), Apply all
- #5 Dashboard budget rings: SVG donuts (top 4 categories) reading same budgetStore, over-limit → warning/error colors
- #6 Notes/Ignore/Split/Rules: transactionService note+is_ignored+split columns, dbTransactionsToActivityTx synthesizes split rows client-side (primary=total−moved, synthetic `${id}-split`); ActivityPage detail drawer note editor + ignore toggle + split form; hidden-tx view (EyeOff header button); ruleEngine.ts (transaction_rules CRUD, longest-pattern match); merchant-blur category suggestion; CSV import applies rules before heuristics; rules manager card in ProfileSettingsPage
- FIX: App.tsx used singular dbTransactionToActivityTx → notes/splits lost on reload; switched to plural mapper. handleUpdateTransaction confirmed local-only (no DB double-write)
- #7 Customizable dashboard: section registry (upcoming/rings/insight/stats/recent/actions), localStorage pickswise.dash.v1 order+hidden, SlidersHorizontal header button opens bottom sheet (toggle + reorder)
- 2026 REBRAND: palette #071838 navy (primary CTA) · #1786C2 blue (info) · #0FB0CE cyan (accent) · #C7A784 tan (premium) · #E0F2FC ice (tinted surfaces); tokens.css v3.0 + index.css @theme updated; dark mode block → navy family; Node-script sweep replaced 733 legacy refs across 93 files (greens/lime/RM clone); merchant brand colors + semantic green/red untouched
- Fonts: EN Inter, TH Noto Sans Thai — self-hosted woff2 (400-700) in app/public/fonts + design-system/fonts.css @font-face; Kanit/Space Grotesk removed everywhere incl. index.html Google Fonts link (Onest display + JetBrains Mono stay on Google); resend-otp email template updated too
- translations.ts NOT modified for any of the above (inline lang ternaries used)
- TypeScript compilation: 0 errors; production build passes

### 2026-08-24
- Removed 4 feature groups permanently: Money Twin/Money Story/Emotion tracking, Alternative Assets, Tax Engine/FBIS, Financial Evolution
- Deleted pages/services/edge functions; migrations 026 (drop tables), 027 (subscription_price_history + price-hike trigger), 028 (push_subscriptions)
- Restored paywall translation keys after PS 5.1 Set-Content corrupted Thai text (NEVER use shell text-editing on translations.ts — Edit tool only)
- Price-hike detection: DB trigger logs cost changes; loadSubscriptions surfaces priceChange to UI
- Real web push: public/sw.js, services/pushService.ts, send-push-notification edge function (VAPID via web-push npm), ProfilePage Push Alerts toggle
- user-insights edge function made stateless (no money_twin table); ai-chat no longer uses FBIS
- Deployed to Supabase (project pexcvfhuvqrwrabpgkzi): migrations 026-028 applied via `db query --linked`, VAPID secrets set, edge functions send-push-notification / user-insights / ai-chat deployed
- VITE_VAPID_PUBLIC_KEY added to app/.env.local (dev); production hosting env var still needs manual setup
- TypeScript compilation: 0 errors; production build passes

### 2026-06-12
- QA Audit completed for Tesla-style renamed features
- All 7 features verified (98.3% compliance)
- TypeScript compilation: 0 errors
