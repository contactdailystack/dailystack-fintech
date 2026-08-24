#!/usr/bin/env bash
# ============================================================
# verify-no-live-secrets.sh
# Fails CI if any live Stripe / production secrets are found
# in tracked source files.
#
# Run as pre-build step in CI:
#   bash scripts/verify-no-live-secrets.sh
#
# Exits 0 = clean, 1 = live secrets detected.
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Quick check on .env files (where secrets live in dev)
ENV_FILES=(
  "$ROOT_DIR/.env.local"
  "$ROOT_DIR/.env"
  "$ROOT_DIR/app/.env.local"
  "$ROOT_DIR/app/.env"
  "$ROOT_DIR/supabase/.env.local"
)

# Source files to scan
SOURCE_DIRS=(
  "$ROOT_DIR/app/src"
  "$ROOT_DIR/supabase/functions"
  "$ROOT_DIR/scripts"
)

FOUND=0

echo "🔍 Scanning for live Stripe keys..."

# Phase 1: Check .env files
for env_file in "${ENV_FILES[@]}"; do
  if [ -f "$env_file" ]; then
    # Live keys: sk_live_ or pk_live_ followed by 20+ chars
    if grep -En "sk_live_[A-Za-z0-9]{20,}|pk_live_[A-Za-z0-9]{20,}" "$env_file" >/dev/null 2>&1; then
      echo ""
      echo "❌ LIVE SECRETS detected in $env_file:"
      grep -En "sk_live_[A-Za-z0-9]{20,}|pk_live_[A-Za-z0-9]{20,}" "$env_file" | sed 's/^/   /'
      FOUND=1
    fi
  fi
done

# Phase 2: Scan source files (skip node_modules, dist, .git, etc.)
for source_dir in "${SOURCE_DIRS[@]}"; do
  if [ ! -d "$source_dir" ]; then
    continue
  fi
  # Use grep with binary file skip and quiet mode; capture matches
  MATCHES=$(grep -rEn \
    --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
    --include='*.json' --include='*.yml' --include='*.yaml' \
    --exclude-dir='node_modules' \
    --exclude-dir='dist' \
    --exclude-dir='build' \
    --exclude-dir='.git' \
    --exclude-dir='test-results' \
    --exclude-dir='reports' \
    --exclude-dir='.mavis' \
    --exclude-dir='coverage' \
    "sk_live_[A-Za-z0-9]{20,}|pk_live_[A-Za-z0-9]{20,}" \
    "$source_dir" 2>/dev/null || true)

  if [ -n "$MATCHES" ]; then
    echo ""
    echo "❌ LIVE SECRETS detected in $source_dir:"
    echo "$MATCHES" | sed 's/^/   /'
    FOUND=1
  fi
done

if [ $FOUND -eq 1 ]; then
  echo ""
  echo "════════════════════════════════════════════════════════"
  echo "  ❌ BUILD BLOCKED: Live secrets detected in repo!"
  echo "════════════════════════════════════════════════════════"
  echo ""
  echo "Action required:"
  echo "  1. Rotate the affected keys in their respective dashboards:"
  echo "     • Stripe: https://dashboard.stripe.com/apikeys"
  echo "     • Supabase: https://app.supabase.com/project/_/settings/api"
  echo "  2. Update .env.local with the NEW test/dev keys"
  echo "  3. Re-run this script to verify clean state"
  echo ""
  exit 1
fi

echo "✅ No live secrets detected. Safe to build."
exit 0
