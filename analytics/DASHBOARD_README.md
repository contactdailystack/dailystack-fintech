DailyStack Analytics: Activation & Retention Dashboard

Overview
--------
This folder contains SQL queries and instructions to build activation and retention dashboards in Supabase/Metabase.

Key events required (emit these from `src/utils/analytics.ts`):
- `signup_completed`
- `first_subscription_added`
- `second_subscription_added`
- `aha_moment_seen`
- `cancellation_flow_started`
- `cancellation_flow_completed`
- `savings_confirmed`

Files
-----
- `activation_funnel.sql` — per-day counts, funnel summary
- `retention_cohorts.sql` — cohort retention D1, D7, D30
- `005_create_user_events.sql` — migration to create `user_events` table (db/migrations)

Dashboard setup (Supabase / Metabase)
-----------------------------------
1) Add the SQL queries above as saved queries in Metabase or Supabase SQL editor.
2) Create a dashboard with these tiles:
   - Daily Signups (activation_funnel.sql — signups)
   - Daily First/Second Adds
   - Aha Seen (daily)
   - Funnel summary (single-number tiles showing signup → add1 → add2 → aha)
   - Retention cohort chart (retention_cohorts.sql)

Parameters
----------
Use `:start_date` and `:end_date` dashboard parameters for queries. For Metabase, map parameters to dashboard filters.

Next steps
----------
- Ensure `src/utils/analytics.ts` is used at these UX points to emit events.
- Seed a small set of test events for Wave 1 (internal testing) to validate dashboards.
