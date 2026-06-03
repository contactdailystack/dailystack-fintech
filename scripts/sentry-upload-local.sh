#!/usr/bin/env bash
# Local helper to create a Sentry release and upload sourcemaps for DailyStack
# Usage: SENTRY_AUTH_TOKEN=... SENTRY_ORG=... SENTRY_PROJECT=... ./scripts/sentry-upload-local.sh

set -euo pipefail

if [ -z "${SENTRY_AUTH_TOKEN:-}" ]; then
  echo "SENTRY_AUTH_TOKEN not set"
  exit 1
fi
if [ -z "${SENTRY_ORG:-}" ]; then
  echo "SENTRY_ORG not set"
  exit 1
fi
if [ -z "${SENTRY_PROJECT:-}" ]; then
  echo "SENTRY_PROJECT not set"
  exit 1
fi

npm ci
npm run build

RELEASE=$(git rev-parse HEAD)
export RELEASE

npx @sentry/cli releases new -p "$SENTRY_PROJECT" "$RELEASE"
npx @sentry/cli releases files "$RELEASE" upload-sourcemaps ./dist --url-prefix '~/assets' --rewrite
npx @sentry/cli releases finalize "$RELEASE"

echo "Sentry upload complete. Release: $RELEASE"
