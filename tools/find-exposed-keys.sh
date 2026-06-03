#!/usr/bin/env bash
# Simple scanner to find likely-exposed keys in the repo (Supabase URLs, JWT-like tokens, long base64 strings)
# Usage: ./tools/find-exposed-keys.sh

set -euo pipefail

echo "Scanning repository for supabase URLs and JWT-like tokens..."

grep -RIn --line-number "supabase.co" || true

grep -RIn --line-number "VITE_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|VITE_SENTRY_DSN" || true

# JWT-like tokens (very permissive: looks for long base64 segments starting with eyJ)
egrep -RIn --line-number "eyJ[^"]{20,}" || true

echo "Scan complete. Review matches and remove/rotate any leaked keys." 
