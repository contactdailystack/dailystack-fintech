#!/usr/bin/env bash
# Create Sentry alert rules from docs/SENTRY_ALERT_TEMPLATES.json using Sentry API
# Requires SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT env vars

set -euo pipefail

if [ -z "${SENTRY_AUTH_TOKEN:-}" ]; then
  echo "SENTRY_AUTH_TOKEN required"
  exit 1
fi
if [ -z "${SENTRY_ORG:-}" ]; then
  echo "SENTRY_ORG required"
  exit 1
fi
if [ -z "${SENTRY_PROJECT:-}" ]; then
  echo "SENTRY_PROJECT required"
  exit 1
fi

TEMPLATES=docs/SENTRY_ALERT_TEMPLATES.json

if [ ! -f "$TEMPLATES" ]; then
  echo "Templates not found: $TEMPLATES"
  exit 1
fi

# This is a simplified example; creating alert rules via Sentry API requires more detailed payloads.
# Use this script as a starting point and adapt payload shapes per Sentry API docs.

echo "Templates available at $TEMPLATES. Review and apply manually using Sentry UI or adapt this script."
