Seeding Sample Events (Local)

This project ships a small seeder script to insert sample `user_events` into your Postgres database so you can validate the activation and retention queries.

Prerequisites
- Node.js installed
- A Postgres database reachable with a connection string (Supabase DB or local Postgres)

Steps
1) Install `pg` once in the repo root:

```bash
npm install pg
```

2) Set `DATABASE_URL` environment variable to your Postgres connection string. Example:

Windows (PowerShell):
```powershell
$env:DATABASE_URL="postgres://user:pass@host:5432/dbname"
node scripts/seed_sample_events.js
```

macOS / Linux:
```bash
export DATABASE_URL="postgres://user:pass@host:5432/dbname"
node scripts/seed_sample_events.js
```

3) Run the script. It will insert ~15 sample events across 5 synthetic users.

4) After seeding, open `analytics/activation_funnel.sql` and `analytics/retention_cohorts.sql` in Supabase SQL editor or Metabase and run using an appropriate `:start_date`/`:end_date` range that includes the seed timestamps.

Notes
- The script writes to the `user_events` table created by `db/migrations/005_create_user_events.sql`.
- The script assumes no FK constraints on `user_events.user_id`. If your schema enforces FK to an `auth.users` table, either create test users there or adjust the script to match existing user IDs.
