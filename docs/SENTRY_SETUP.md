Sentry CI & Secrets Setup

This document explains required GitHub Secrets and how to locally test Sentry release + sourcemap upload for DailyStack.

Required GitHub repository secrets
- SENTRY_AUTH_TOKEN — A Sentry auth token with `project:releases` and `project:releases:write` scopes.
- SENTRY_ORG — Your Sentry organization slug (e.g. `my-org`).
- SENTRY_PROJECT — Your Sentry project slug (e.g. `dailystack-frontend`).

Optional / environment variables (for staging/dev deploy)
- VITE_SENTRY_DSN — Frontend DSN used by Sentry SDK.
- SENTRY_RELEASE — Release identifier (CI sets this to git sha by default).

How to add GitHub Secrets (via GitHub UI)
1. Go to your repository on GitHub.
2. Settings → Secrets and variables → Actions → New repository secret.
3. Add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` with their values.

How to test locally (bash)
1. Install Sentry CLI locally (or use npx): `npm install -g @sentry/cli` or use `npx @sentry/cli`.
2. Export env vars and run the script (example):

```bash
export SENTRY_AUTH_TOKEN=<<YOUR_TOKEN>>
export SENTRY_ORG=<<YOUR_ORG>>
export SENTRY_PROJECT=<<YOUR_PROJECT>>
export VITE_SENTRY_DSN=<<YOUR_DSN>> # optional for frontend runtime

npm ci
npm run build

RELEASE=$(git rev-parse HEAD)
# create release
npx @sentry/cli releases new -p $SENTRY_PROJECT $RELEASE
# upload sourcemaps from ./dist
npx @sentry/cli releases files $RELEASE upload-sourcemaps ./dist --url-prefix '~/assets' --rewrite
# finalize
npx @sentry/cli releases finalize $RELEASE

# Verify: open Sentry → Releases → $RELEASE and check files/errors
```

How to test locally (PowerShell)

```powershell
$env:SENTRY_AUTH_TOKEN = "<<YOUR_TOKEN>>"
$env:SENTRY_ORG = "<<YOUR_ORG>>"
$env:SENTRY_PROJECT = "<<YOUR_PROJECT>>"
$env:VITE_SENTRY_DSN = "<<YOUR_DSN>>"

npm ci
npm run build

$RELEASE = (git rev-parse HEAD).Trim()
npx @sentry/cli releases new -p $env:SENTRY_PROJECT $RELEASE
npx @sentry/cli releases files $RELEASE upload-sourcemaps .\dist --url-prefix '~/assets' --rewrite
npx @sentry/cli releases finalize $RELEASE
```

CI notes
- The repository already contains `.github/workflows/sentry-upload.yml` which:
  - Builds the app, creates a release with `github.sha`, uploads `./dist` sourcemaps, and finalizes the release.
  - Requires the three secrets above to be set in the repository settings.
- `vite.config.ts` has been updated to enable `build.sourcemap = true`.

Verify in Sentry
- After upload, go to Sentry → Project → Releases → open the release and confirm sourcemap files are present.
- Trigger a test error in the frontend (temporary throw) and confirm stack trace maps to source files.

Rollout checklist
- Add secrets to GitHub
- Merge CI workflow and ensure it runs on `main` (or trigger `workflow_dispatch`)
- Verify release appears in Sentry and traces resolve

If you want, I can create a PR that adds an optional `sentry.release` build script or run the local upload if you provide `SENTRY_AUTH_TOKEN` in a secure way.
