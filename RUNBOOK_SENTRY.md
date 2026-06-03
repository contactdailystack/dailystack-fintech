Sentry Runbook (frontend + server)

Purpose
- Enable reliable error collection and alerting for DailyStack during Closed Beta and Production.

Environment variables
- Frontend (Vite): `VITE_SENTRY_DSN` (public DSN), optional `VITE_ENABLE_DEV_DIAG=true` for developer-only diagnostics.
- Server: `SENTRY_DSN` (server DSN)

Install
- Frontend (root):
  ```bash
  npm install @sentry/react @sentry/tracing
  ```

- Server (server/):
  ```bash
  cd server
  npm install @sentry/node
  ```

Configuration
- Frontend: `src/app/config/sentry.ts` dynamically imports `@sentry/react` when `VITE_SENTRY_DSN` is present. Ensure `VITE_SENTRY_DSN` is set in the environment for staging/production builds. Do NOT commit the DSN to repo.

- Server: `server/sentry.js` will initialize `@sentry/node` when `SENTRY_DSN` exists. The file also captures `uncaughtException` and `unhandledRejection` and attempts to flush events before exit.

Alerting (Recommended)
- Create alert rules in Sentry for:
  - New issues with `level=error` and frequency > 5 in 5 minutes.
  - High error rate (spike) alerts tied to releases.
  - Deploy/Release alerts for failed source map uploads.
- Configure integrations: Slack or PagerDuty for on-call notifications during beta.

Release & Source Maps
- For frontend sourcemaps, during build, upload source maps to Sentry or configure Sentry CLI in CI. This improves stack traces.
- Tag releases (`SENTRY_RELEASE`) from CI to correlate errors with releases.

CI Example (GitHub Actions)
- A sample workflow is provided at `.github/workflows/sentry-upload.yml`.
- Required repository secrets:
  - `SENTRY_AUTH_TOKEN` — token with `project:releases` and `project:releases:write` scope
  - `SENTRY_ORG` — your Sentry organization slug
  - `SENTRY_PROJECT` — your Sentry project slug

Example behaviour:
- The workflow builds the app (`npm run build`), creates a release identified by the current `github.sha`, uploads source maps from `./dist`, and finalizes the release.

 
 Security: rotating leaked keys
- If you find keys in commits or build artifacts, rotate them immediately (see docs/ROTATE_SUPABASE_KEYS.md).
- Use `tools/find-exposed-keys.sh` to scan the repo for obvious leaks before and after rotating.

Testing
1. Frontend smoke test (in staging, with `VITE_SENTRY_DSN`):
   - Open app and manually throw an error in console:
     ```js
     // in browser console
     throw new Error('Sentry test error - frontend');
     ```
   - Verify event appears in Sentry.

2. Server smoke test (with `SENTRY_DSN`):
   - From server code, `throw new Error('Sentry test error - server');` or run a script to send a test exception.
   - Verify event appears in Sentry.

Operational notes
- Do not log or print DSNs or secret keys in application logs.
- Use separate DSNs/projects for staging vs production.
- Ensure sampling and rate limits in Sentry project settings to avoid bill shocks.

Troubleshooting
- If no events show, check DSN values, network egress (firewall), and whether SDK packages are installed.

Maintainers: Backend/Frontend leads
