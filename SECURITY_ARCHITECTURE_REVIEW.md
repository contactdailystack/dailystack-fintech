SECURITY ARCHITECTURE REVIEW
Based on: SECURITY_PATCH_PLAN.md
Date: 2026-06-05

Purpose
Review the proposed security patch plan for must-fix items and validate architectural impact, regression risks, dependencies, and implementation order. Produce a Go / No-Go recommendation and mitigation controls prior to any code or infrastructure changes.

1. Impact Analysis — Which files will be modified
- Tests and fixtures
  - `tests/p0/auth.signup.spec.ts`
  - `tests/p0/auth.login.spec.ts`
  - `tests/p0/db.trigger.spec.ts`
  - `tests/README.md`, `tests/p0/README.md`
- Test helpers and fixtures
  - `fixtures/testUsers.ts`
  - `fixtures/users.ts`
  - (possible) `fixtures/testTransactions.ts`, `fixtures/testSubscriptions.ts` (defensive checks)
- Logging utility
  - `utils/logger.ts`
- Admin-client placeholder
  - `helpers/apiHelper.ts`
- Environment helper / docs
  - `utils/env.ts`
- CI/CD and infra (not in repo code but impacted)
  - CI secret store entries: `ADMIN_ENDPOINT`, `ADMIN_ENDPOINT_KEY`, other secrets
  - Serverless admin endpoint (new infra) OR scheduled DB cleanup job (infra)

2. Dependencies Affected
- CI pipeline: needs secret management and possibly new jobs for cleanup and integration testing.
- Supabase staging DB: will be target of cleanup job or admin endpoint read queries. Requires appropriate network access and roles.
- Test runners and developers: tests will depend on runtime password generation and optional admin verification keys.
- Monitoring and logging: change in what is logged, artifact retention and redaction tooling in CI.

3. Potential Regression Risks
- Auth timing/consistency: replacing static passwords with generated ones is low risk for auth flows, but tests that rely on predictable credentials must be updated; ensure generated passwords are propagated to all test steps in a run.
- Test flakiness from backend timing: adding waits/backoff for triggers and trigger-verification could mask or reveal timing-sensitive failures; tests may become slower.
- Cleanup job risk: accidental deletion of non-test accounts if selectors are too broad (e.g., email LIKE '%qa+%'); must implement strict selectors and run dry-run first.
- Admin endpoint implementation: if it performs writes or has excessive privileges, it could cause production-impacting changes. Must be read-only and audited.
- CI secrets misconfiguration: if secrets are leaked to logs or environment, risk increases. CI changes must be validated in a safe environment.

4. Security Design Validation
- Supabase service_role constraint: plan does not recommend embedding `service_role` in frontend tests. All DB-level checks are recommended to go through a server-side admin endpoint or scheduled DB job. This satisfies the constraint.
- No admin backdoors: recommended admin endpoint is scoped to read-only verification and requires signed CI tokens; rollout must include audit logging, rate-limiting, and strict auth.
- No production-only test logic: plan keeps testing logic in tests/fixtures and serverless admin tooling separate from production app. Validate that no prod code paths are modified.
- Secrets handling: plan requires CI secret manager for admin keys and restricts access. Also requires redaction in logs and removal of printed emails in tests.

5. Over-engineering and Unnecessary Infrastructure
- Mutual TLS for admin endpoint is secure but may be overkill for early rollout. A signed JWT/HMAC token rotated from CI is simpler and adequate if enforced with short TTL and audit logs. Classification: recommend HMAC-signed CI tokens first, then consider mTLS only if threat model requires.
- Full-featured admin microservice is not necessary immediately. A small serverless function limited to a few read-only SQL statements and strong auth is sufficient. Classification: prefer minimal serverless wrapper over new persistent infra.

6. Constraints Check (DailyStack Requirements)
- Supabase Auth unchanged: plan does not modify Supabase Auth or application code. Confirmed.
- Existing Playwright tests continue to work: with recommended changes (password generation and propagation, redaction) tests should continue, but require updating test code to consume generated passwords; ensure consistent test fixture API to avoid breaking tests.
- No `service_role` keys in frontend: plan explicitly forbids embedding service_role in tests; admin tasks use server-side secrets only.
- No admin backdoors: plan enforces signed-token auth and read-only behavior; must be reviewed prior to deployment.
- No production-only test logic: tests and helpers will be updated only; no production code changes proposed.

7. Recommended Implementation Order (with safeguards)
Priority: P0 (execute in staging isolated environment only)

Step 1 — Prepare CI and test scaffolding (Low risk)
- Create CI secret names (no values yet): `ADMIN_ENDPOINT`, `ADMIN_ENDPOINT_KEY`.
- Add short-lived test-run secret pattern and document use. (CI/CD Change)
- Create a feature branch and run local smoke tests. (Docs)

Step 2 — Remove hardcoded passwords and implement secure runtime password generation (Code Change)
- Implement `generateRandomPassword()` helper used by tests and fixtures.
- Update tests to use the helper; ensure password is passed to all steps in the test run.
- Validate locally and in isolated staging with a single test run.
- Safeguard: tests must not log the generated password; use ephemeral in-memory only.

Step 3 — Replace direct `console.log` email prints with redaction (Code + CI)
- Update `utils/logger.ts` with a `redact()` method and update tests to use the logger.
- Update CI job to minimize log retention and ensure logs are only accessible to authorized users.
- Safeguard: run tests, verify logs do not contain full emails.

Step 4 — Define and document `ADMIN_ENDPOINT` contract (Doc + Small infra)
- Publish exact API contract (inputs, outputs, auth scheme) and mock responses in staging until infra exists.
- Implement a minimal serverless function (read-only SQL) or schedule DB job in parallel; do NOT wire tests to use admin endpoint until infra is approved and secrets available.

Step 5 — Implement cleanup strategy (Infra + CI)
- Preferred: scheduled DB job that safely anonymizes or deletes `qa+%` accounts older than a threshold. Provide dry-run mode and backup snapshots prior to first run.
- Alternative: secure admin purge endpoint callable only from CI with signed token.
- Safeguard: run in dry-run mode first, verify only expected rows are targeted, create DB backup, then enable deletion.

Step 6 — Integrate optional automated DB verification (Code)
- After admin endpoint and secrets are in place, update `helpers/apiHelper.ts` and fixtures to optionally use read-only admin checks. Keep feature-flagged (enabled only in CI with admin secrets present).

Step 7 — Monitoring and validation (CI/CD)
- Add secret-scan and artifact scanning jobs to CI; schedule periodic review of staging cleanup results.

8. Risk Assessment (final)
- Overall residual risk after plan: LOW-MEDIUM if all P0 items are implemented and tested in staging. Highest residual risk stems from misconfigured cleanup job or admin endpoint; mitigate with dry-run, backups, strict auth, and limited scope.

9. Go / No-Go Recommendation
- Recommendation: GO with conditions.
- Conditions to satisfy before implementing code or infra changes:
  1. Create isolated staging environment or ensure staging is safe for ephemeral test data (backup + access control).
  2. Approve CI secret names and access model; do NOT populate secrets until admin endpoint is ready.
  3. Run Step 2 (password generation) and Step 3 (redaction) first in a feature branch and validate with a limited test run in staging.
  4. Prepare backup and dry-run plan before enabling cleanup job; schedule maintenance window for first cleanup run.
  5. Security and Engineering leads must sign off on the admin endpoint contract prior to any infra rollout.

If any of the above preconditions cannot be met, return NO-GO and address the blocker (e.g., create isolated staging, obtain approvals).

Deliverables for approval
- This document (`SECURITY_ARCHITECTURE_REVIEW.md`)
- `SECURITY_PATCH_PLAN.md` (already created)
- Proposed small PR checklist (upon approval) and a list of non-secret CI variables to be provisioned.

End of Review