Database Migrations — Runbook

Overview
This project includes SQL migration files under `db/migrations/`. Before running migrations against any environment (staging/prod), take a backup and run in staging first.

Files to use
- `scripts/run_migrations.sh` — Executes all `db/migrations/*.sql` in sorted order using `psql` against `SUPABASE_DB_URL`.
- `scripts/backup_db.sh` — Create a binary `pg_dump` archive before changes.
- `.github/workflows/run-migrations.yml` — Optional manual GitHub Actions job to run migrations using `SUPABASE_DB_URL` secret.

Recommended procedure
1. Take a backup:
   - Locally: `SUPABASE_DB_URL=... ./scripts/backup_db.sh ./backups/pre-migration.dump`
   - In Supabase: use Project Backups UI
2. Test on staging:
   - Configure staging DB URL as `SUPABASE_DB_URL` in environment or Secrets.
   - Run `./scripts/run_migrations.sh` pointing to staging DB.
   - Run smoke tests: `npm run smoke`.
3. If staging checks pass, schedule a short maintenance window for production.
4. Repeat steps for production pointing `SUPABASE_DB_URL` at production DB.

Rollback
- If a migration is destructive and cannot be reversed, restore from backup:
  - `pg_restore -d postgres://user:pass@host:5432/dbname ./backups/pre-migration.dump`
- For reversible migrations, provide SQL down scripts and run them manually.

Security
- Never put Service Role keys or production DB credentials into version control.
- Use GitHub Secrets for `SUPABASE_DB_URL` and restrict who can run the workflow.

Notes
- The scripts use `psql` and `pg_dump` — ensure these are available in CI/runner.
- Review each `db/migrations/*.sql` before applying; do not run blindly on production.
