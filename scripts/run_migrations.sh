#!/usr/bin/env bash
# Run SQL migration files against a Postgres database.
# Usage:
#   SUPABASE_DB_URL="postgres://user:pass@host:5432/dbname" ./scripts/run_migrations.sh
# Or set SUPABASE_DB_URL in env or GitHub Secrets and run via workflow.

set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "ERROR: SUPABASE_DB_URL environment variable is not set. Aborting."
  echo "Example: export SUPABASE_DB_URL=\"postgres://user:pass@host:5432/dbname\""
  exit 2
fi

MIGRATIONS_DIR="db/migrations"
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found at $MIGRATIONS_DIR"
  exit 0
fi

echo "Starting migration run against: ${SUPABASE_DB_URL%%@*}"

# Recommend taking a pg_dump (caller responsibility) — we will not attempt automatic destructive backups here

for f in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  echo "Applying migration: $f"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$f"
done

echo "Migrations complete."
