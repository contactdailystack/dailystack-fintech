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
