#!/usr/bin/env bash
# Backup a Postgres database using pg_dump.
# Usage:
#   SUPABASE_DB_URL="postgres://user:pass@host:5432/dbname" ./scripts/backup_db.sh ./backups/backup.sql

set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "ERROR: SUPABASE_DB_URL environment variable is not set. Aborting."
  exit 2
fi

OUTFILE=${1:-./backups/backup-$(date +%Y%m%dT%H%M%S).sql}
mkdir -p "$(dirname "$OUTFILE")"

echo "Creating pg_dump -> $OUTFILE"
pg_dump "$SUPABASE_DB_URL" -Fc -f "$OUTFILE"

echo "Backup complete: $OUTFILE"
