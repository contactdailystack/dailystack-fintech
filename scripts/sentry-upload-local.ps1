# PowerShell helper to create a Sentry release and upload sourcemaps
# Usage (PowerShell):
# $env:SENTRY_AUTH_TOKEN = '...'; $env:SENTRY_ORG = '...'; $env:SENTRY_PROJECT = '...'; ./scripts/sentry-upload-local.ps1

if (-not $env:SENTRY_AUTH_TOKEN) { Write-Error 'SENTRY_AUTH_TOKEN not set'; exit 1 }
if (-not $env:SENTRY_ORG) { Write-Error 'SENTRY_ORG not set'; exit 1 }
if (-not $env:SENTRY_PROJECT) { Write-Error 'SENTRY_PROJECT not set'; exit 1 }

npm ci
npm run build

$RELEASE = (git rev-parse HEAD).Trim()

npx @sentry/cli releases new -p $env:SENTRY_PROJECT $RELEASE
npx @sentry/cli releases files $RELEASE upload-sourcemaps .\dist --url-prefix '~/assets' --rewrite
npx @sentry/cli releases finalize $RELEASE

Write-Output "Sentry upload complete. Release: $RELEASE"
