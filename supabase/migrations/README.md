# Supabase Migrations — Run Order Guide

> ⚠️ The numbered files are NOT strictly ordered by name. Follow this guide.
> Last verified against prod `pexcvfhuvqrwrabpgkzi` on 2026-08-23.

## For THIS project (existing prod DB)

Prod already contains tables from early individual migrations
(`users`, `subscriptions`, `user_transactions`, `emotional_context`,
`money_twin`, `user_wallets`, etc.) but was restored **without** later ones.

Run exactly one script in Dashboard → SQL Editor:

| File | Purpose |
|---|---|
| `PROD-PATCH-2026-08-23_missing_tables.sql` | Creates everything still missing: `budget_categories` (+seed/backfill), `budget_alerts`, `ghost_subscriptions`, net-worth ×3, `goals`. Idempotent. |

Do **NOT** run `024_mvp_budget_alerts_ghosts.sql` standalone on prod — its
Part 4 seed trigger references `budget_categories`, which does not exist yet
(would break new-user signups). The PROD-PATCH orders this correctly and uses
the hardened `search_path` variant of the seed function from `999`.

## For a BRAND-NEW project

Run in order:

1. `999_consolidated_final.sql` — full baseline schema + RLS
   (supersedes 001–023 individual files; includes budget_categories/alerts/ghosts)
2. `PROD-PATCH-2026-08-23_missing_tables.sql` — adds `goals` + net-worth trio
   (idempotent; skips what 999 already created)
3. `MIGRATION_021_ai_coach.sql` / `MIGRATION_020_money_twin.sql` — only if
   features were added after 999 was frozen (check first; 999 may cover them)

## Conventions going forward

- One concern per file: `NNN_short_description.sql`
- Always idempotent: `CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS` → `CREATE POLICY`
- Every table: enable RLS + per-operation user policies (+ service_role policy where edge functions write)
- Never reference a table that an earlier part of the same file doesn't guarantee exists
