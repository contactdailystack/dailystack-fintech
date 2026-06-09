SECURITY REMEDIATION PLAN
Based on: SECURITY_TEST_AUDIT.md
Date: 2026-06-05

Purpose: For each finding in the security audit, classify priority, describe risk and business impact, recommend a non-code remediation, and estimate effort to implement.

FINDING 1: Predictable / hardcoded test passwords in tests and fixtures
- Classification: Must Fix Before Beta
- Risk: High — predictable credentials increase risk of account takeover on staging and make attack surface trivial to enumerate.
- Business Impact: High — leaked/staged accounts may expose PII, allow fraudulent billing flows, and damage trust if staging data leaks to public.
- Recommended Fix: Remove hardcoded passwords from committed tests/fixtures. Generate cryptographically-strong random passwords per test run and store them only in ephemeral test context. Update documentation to require CI secret injection for any long-lived test credentials. Label test accounts with metadata so they are identifiable for cleanup/monitoring.
- Estimated Effort: Small (2–8 hours) — update test helpers, fixtures, and docs; validate pipeline runs.

FINDING 2: Sensitive test output in logs (test emails printed to stdout)
- Classification: Must Fix Before Beta
- Risk: Medium — CI logs and artifacts can leak identifiers; combined with predictable passwords this becomes a higher risk.
- Business Impact: Medium — leaked emails aid targeted attacks and may expose internal test planning or user patterns.
- Recommended Fix: Stop printing full emails or credentials to stdout. If logging is necessary, log only a hashed or truncated identifier (e.g., last 4 chars) and store full data in secure ephemeral storage accessible only to authorized QA engineers. Review CI log retention and ensure artifacts are protected.
- Estimated Effort: Small (2–6 hours) — update tests to redact logs and update CI job policies.

FINDING 3: References to admin endpoint (`ADMIN_ENDPOINT`) and callAdminEndpoint placeholder
- Classification: Must Fix Before Beta
- Risk: Medium — presence of admin integration increases risk of accidental misuse if implemented insecurely.
- Business Impact: High (if implemented incorrectly) — an insecure admin endpoint could permit data exposure or unauthorized DB changes.
- Recommended Fix: Lock down admin endpoints behind signed CI tokens or mutual TLS; require server-side validation, rate-limiting, and scoped read-only behavior for verification endpoints. Keep all admin keys exclusively in CI secret store and document expected API contract. Do not permit arbitrary client-side calls in tests.
- Estimated Effort: Medium (1–3 days) — design secure contract, implement serverless wrapper (if not present), and integrate CI secrets.

FINDING 4: No account cleanup / test data retention policy for staging
- Classification: Must Fix Before Beta
- Risk: Medium — unbounded accumulation of test accounts creates noise and increases attack surface over time.
- Business Impact: Medium — storage and test reliability degrade; data may contain sensitive artifacts and cause billing/test interference.
- Recommended Fix: Define and implement a cleanup policy: either scheduled DB job that deletes `qa+` accounts older than X days, or an admin endpoint to purge test accounts after runs. Ensure cleanup requires tight auth and audit logging. Add test metadata to help safe deletion.
- Estimated Effort: Medium (1–3 days) — design policy, implement server-side cleanup, update test docs.

FINDING 5: Generic console logger and potential sensitive object logging (`utils/logger.ts`)
- Classification: Fix After Beta
- Risk: Low — current usage is informational; risk only materializes when sensitive objects are logged.
- Business Impact: Low — minor unless used to log secrets or PII to CI artifacts.
- Recommended Fix: Harden logger to redact known sensitive keys; adopt structured logging and add a policy that tests must not log raw network responses or secrets. Run a sweep to find other ad-hoc `console.log` calls in tests.
- Estimated Effort: Small (4–12 hours) — update logger and add lint rule or code review checklist.

FINDING 6: Sample fixture accounts committed with sample passwords (`fixtures/users.ts`)
- Classification: Fix After Beta
- Risk: Low — sample data may be used as reference but predictable credentials should be avoided.
- Business Impact: Low — may encourage bad practice; not directly exploitable if staging is protected.
- Recommended Fix: Replace sample passwords with placeholders or remove password fields from committed fixtures. Update docs to show how to generate runtime credentials.
- Estimated Effort: Small (1–3 hours)

FINDING 7: No `SUPABASE_SERVICE_ROLE` found in repo (positive finding)
- Classification: Ignore For Now
- Risk: None found in code.
- Business Impact: N/A
- Recommended Fix: Continue policy to store service role or other sensitive keys only in secret managers; periodically scan repo for accidental leaks.
- Estimated Effort: Ongoing monitoring.

IMPLEMENTATION NOTES
- Prioritize items marked "Must Fix Before Beta" before running P0 tests in automated CI against shared staging.
- Changes that require server-side implementation (admin endpoint, cleanup job) should be scheduled with engineering owners and accompanied by security review.
- All fixes should avoid embedding secrets in code; CI secret manager usage and limited-scope tokens are mandatory.

APPROVAL
- Security QA: available to help vet changes and review pull requests for the fixes above.
