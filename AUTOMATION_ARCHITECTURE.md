# DailyStack — Playwright Automation Architecture & Implementation Plan

Purpose: provide a complete, implementation-ready architecture for Playwright-based E2E and regression automation for DailyStack-Fintech. This is an architecture and execution plan only — no Playwright code is included.

1. Folder Structure
-------------------
Root layout (recommended):

```
tests/
  smoke/
  p0/
  p1/
  p2/
fixtures/
  users/
  payments/
  sample-db/
pages/
  SignupPage.ts
  LoginPage.ts
  DashboardPage.ts
  TransactionsPage.ts
  SubscriptionsPage.ts
  InsightsPage.ts
helpers/
  apiHelper.ts
  dbHelper.ts
  mailHelper.ts
  paymentHelper.ts
  authHelper.ts
reports/
  archive/ (CI artifacts)
playwright.config.ts
package.json
README.md (test-runner docs)
```

Notes:
- `tests/` contains suites grouped by priority and purpose. Files use `*.spec.ts` naming.
- `fixtures/` store non-secret sample data; secrets are in CI secret store.
- `pages/` follows Page Object Model (POM).
- `helpers/` encapsulates API/db/mail/payment interactions.

2. Page Object Model (POM)
-------------------------
Principles:
- One class per page/feature. Methods represent intentions (e.g., `signupWith(email, password)`).
- Minimal assertions inside POM; assertions live in tests unless obvious element presence checks help flow.
- Expose both low-level actions and high-level flows (e.g., `completeSignup()`).

Core page objects:
- `BasePage` — shared utilities (navigation, wait helpers, screenshot hooks)
- `SignupPage` — `fillForm()`, `submit()`, `getError()`
- `LoginPage` — `login()`, `assertLoginSuccess()`
- `DashboardPage` — `waitForLoad()`, `getBalance()`
- `TransactionsPage` — `addTransaction()`, `editTransaction()`, `deleteTransaction()`
- `SubscriptionsPage` — `startUpgradeFlow()`, `completePurchase()`
- `InsightsPage` — `requestInsight()`, `waitForResult()`

3. Fixtures
------------
Use Playwright fixtures to provide: authenticated sessions, fresh user creation, test payment tokens, and DB cleanup hooks.

Suggested fixtures (names):
- `testUser` — creates and returns a user object (email, id) and ensures teardown.
- `authState` — storageState for an authenticated session (reusable per test).
- `mailbox` — helper to read verification/reset emails from Mailtrap API.
- `paymentSandbox` — exposes sandbox tokens and helper for webhook verification.
- `db` — admin helper that can run SQL via a secured admin endpoint.

Security: fixtures must not contain secrets. Use CI secret storage for keys.

4. Test Data Strategy
---------------------
- Use synthetic, deterministic data with `qa+<timestamp>@example.com` pattern. Tests must NOT run against production.
- Seed minimal sandboxed datasets where needed (e.g., a plan catalog). Use migrations or an API to seed.
- Each test tombstones created data in `afterEach` or uses a disposable tenant. Prefer teardown over destructive restores.
- Centralize sample data in `fixtures/` and reference by id in tests.

5. Environment Strategy
-----------------------
- Supported environments: `local` (developer), `staging` (CI), `ci` (isolated), `preprod` (optional), `production` (read-only monitoring only).
- Env config via `.env.test`, `process.env`, and GitHub Actions secrets. Required env variables:
  - `TEST_BASE_URL` (staging app)
  - `ADMIN_ENDPOINT` (secure serverless endpoint for DB checks)
  - `MAILTRAP_API_KEY` (CI secret)
  - `PAYMENT_SANDBOX_KEY` (CI secret)
- Developer local runs use a `.env.local.example` template and developers pull secrets from vault.

6. Staging Strategy
-------------------
- Use a dedicated staging project that mirrors production configuration (Supabase project, env vars, feature flags ON/OFF as required).
- Isolate staging data: use a separate Supabase project or schema scoped for QA.
- Maintain a staging migrations pipeline: apply migrations to staging before running tests.
- Use test feature flags to enable AI Premium and payment paths where needed.

7. CI/CD Strategy
-----------------
- Test Matrix runs in CI with multiple jobs:
  - `smoke` job: fast checks on each deploy (parallel browsers disabled, headless chromium)
  - `p0` job: run critical regression in parallel where safe
  - `p1` / `p2` jobs: scheduled nightly or run-on-demand
- Use caching for `node_modules` and Playwright browsers.
- Tests should be idempotent; implement retry/backoff for flakiness only when necessary.

8. GitHub Actions Integration
-----------------------------
Example pipeline (high-level):

- `workflow: e2e-tests.yml` triggers:
  - on: `push` to `main` (smoke), `pull_request` (smoke), `release` (p0/p1)
  - jobs:
    - `install` (sets up node, caches deps, installs Playwright browsers)
    - `smoke-tests` (runs tests/smoke)
    - `p0-regression` (conditional on release or manual dispatch)
    - `artifact-upload` (uploads screenshots, videos, traces)

Secrets usage:
- Store `ADMIN_ENDPOINT_KEY`, `MAILTRAP_KEY`, `STRIPE_TEST_KEY`, and `SUPABASE_SERVICE_ROLE` (if used server-side) in GitHub Secrets. Never expose `service_role` to tests running in browsers.

9. Reporting
------------
- Use Playwright Test's HTML reporter as primary; augment with Allure or ReportPortal if required.
- CI should upload:
  - HTML report
  - trace files (for failed tests)
  - screenshots (failures)
  - videos (failed tests or smoke runs)
- Persist artifact links in release ticket automatically.

10. Screenshots & Video Recording
--------------------------------
- Configure Playwright to capture screenshots on failure and record video for retries or failures.
- Store artifacts per test run under `reports/archive/<run-id>/` with retention policy (e.g., 30 days).
- For sensitive flows (payments), redact tokens before storing artifacts.

11. Retry Strategy
------------------
- Use Playwright's retry feature for CI jobs only (e.g., `retries: 1` for smoke, `2` for p0). Local runs: `retries: 0`.
- Do NOT mask legitimate failures — retries intended for known flaky infra issues.
- Maintain a flaky test registry (tests marked flaky require triage and permanent fix).

12. Database Validation Strategy
--------------------------------
Design principles:
- Never embed Supabase `service_role` in client-side tests. Use a secure admin endpoint (serverless function) that accepts a signed request from CI and executes read-only verification SQL.
- Admin endpoint only exposes specific SQL queries (whitelist) and requires JWT signed by CI (short TTL).

Verification patterns:
- After critical flows run, call admin endpoint to validate DB state:
  - `auth.users` row exists
  - `public.profiles` created by trigger
  - Subscription row status and invoice existence
  - Aggregates (monthly totals) equal expected value
- Use transaction-safe queries and clean-up commands to remove created test data (teardown).

Security & Audit
----------------
- Ensure CI secrets rotate and are limited in scope. Admin endpoint logs requests and rate-limits by CI job id.
- Mask PII in logs and stored artifacts where possible.

Maintenance & Ownership
-----------------------
- QA Automation Owner: maintains tests, updates POM, and maintains fixtures.
- Backend Owner: provides/maintains admin endpoint, test data seeding APIs, and staging config.
- Devs own fixes for flaky tests within 48 hours of triage.

Run Commands (developer)
------------------------
Install:
```
npm ci
npx playwright install
```
Run smoke locally:
```
npx playwright test tests/smoke --project=chromium
```

Appendix: Quick checklist before running P0 in CI
- Staging migrations applied
- Payment sandbox and mail sandbox keys configured in Secrets
- ADMIN_ENDPOINT reachable and returns expected payload for a sample query
- Feature flags for AI Premium set as required

This architecture document is the canonical plan for implementing Playwright automation for DailyStack. When approved, the next step is to scaffold the folder structure and implement the core POM and fixtures.
