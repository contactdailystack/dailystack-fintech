SECURITY PATCH PLAN — Must Fix Before Beta
Based on: SECURITY_TEST_AUDIT.md
Date: 2026-06-05

Overview
This plan covers all findings classified as "Must Fix Before Beta" in `SECURITY_TEST_AUDIT.md` and provides a file-by-file remediation checklist, classification of required changes, target state, estimated effort, and expected risk reduction.

Must-Fix Findings Covered
- FINDING 1: Predictable / hardcoded test passwords in tests and fixtures
- FINDING 2: Sensitive test output in logs (test emails printed to stdout)
- FINDING 3: References to admin endpoint (`ADMIN_ENDPOINT`) and `callAdminEndpoint` placeholder
- FINDING 4: No account cleanup / test data retention policy for staging

Note: This is a remediation plan only. No code will be modified until you approve.

1) FINDING 1 — Hardcoded / Predictable Passwords
------------------------------------------------
Files identified for remediation
- `tests/p0/auth.signup.spec.ts` (hardcoded password)
- `tests/p0/auth.login.spec.ts` (hardcoded password)
- `tests/p0/db.trigger.spec.ts` (hardcoded password)
- `fixtures/users.ts` (sample passwords)
- `fixtures/testUsers.ts` (default password used in factory)

Change classification per file
- `tests/p0/*.spec.ts`: Code Change, Documentation Change
- `fixtures/users.ts`: Code Change (fixture), Documentation Change
- `fixtures/testUsers.ts`: Code Change (factory), Documentation Change

Current Risk
- High: Predictable passwords increase risk of account takeover on staging and simplify attack automation.

Target State
- No committed hardcoded or predictable passwords. Tests generate strong per-run passwords or accept runtime-provisioned credentials passed via secure CI variables.

Required Changes
- Replace literal password strings in `tests/p0/*.spec.ts` with references to a test helper that generates a secure random password at runtime.
- Update `fixtures/testUsers.ts` to remove default static password and accept generated/runtime passwords.
- Update `fixtures/users.ts` to remove or replace real passwords with placeholders or doc-only examples.
- Update test documentation to explain how passwords are supplied (test helper, CI env, or secure admin provisioning).

Estimated Effort: 2–8 hours

Risk Reduction: High — removes trivial credential discovery vector and reduces chance of credential reuse attacks.

File-by-file checklist (FINDING 1)
- `tests/p0/auth.signup.spec.ts`: Replace `const password = 'P@ssw0rd!1'` with `const password = generateRandomPassword()` or `process.env.TEST_PASSWORD || generateRandomPassword()` and remove any dependency on static strings.
- `tests/p0/auth.login.spec.ts`: Same as above.
- `tests/p0/db.trigger.spec.ts`: Same as above.
- `fixtures/testUsers.ts`: Remove `const password = opts?.password ?? 'P@ssw0rd!';` default; require caller to provide password or generate internally using secure RNG.
- `fixtures/users.ts`: Replace password values with `'<GENERATE_AT_RUNTIME>'` or remove the `password` property.
- Update `tests/README.md` and `tests/p0/README.md` with guidance.

2) FINDING 2 — Sensitive test output in logs
------------------------------------------------
Files identified for remediation
- `tests/p0/auth.signup.spec.ts` (console.log email)
- `tests/p0/db.trigger.spec.ts` (console.log email)
- `utils/logger.ts` (generic console wrappers)
- `tests/README.md` and `tests/p0/README.md` (documentation references to logging)

Change classification per file
- `tests/p0/*.spec.ts`: Code Change, Documentation Change
- `utils/logger.ts`: Code Change
- CI pipeline: CI/CD Change (log retention / redaction policy)

Current Risk
- Medium: Printing full test account emails to stdout risks leakage via CI logs or retained artifacts.

Target State
- Tests do not print full sensitive identifiers to stdout. If an identifier is required for debugging, tests print a redacted identifier (e.g., `qa+...@example.com` → `qa+*****@example.com`) or a short hash. CI retains logs with strict access controls and artifact expiration.

Required Changes
- Replace `console.log('P0_SIGNUP_TEST_EMAIL:', email)` with a redacted output: `console.log('P0_SIGNUP_TEST_ID:', hash(email))` or `console.log('P0_SIGNUP_TEST_EMAIL_REDACTED:', redact(email))`.
- Update `utils/logger.ts` to include a `redact()` helper and a configuration flag to prevent printing sensitive fields by default.
- Add CI/CD policy changes: ensure log retention and artifact access limited, and optionally enable automatic redaction before storing artifacts.
- Update `tests/README.md` and `tests/p0/README.md` to document logging policy.

Estimated Effort: 2–6 hours (code + CI adjustments)

Risk Reduction: Medium — reduces information leaked to logs and mitigates correlation attacks.

File-by-file checklist (FINDING 2)
- `tests/p0/auth.signup.spec.ts`: Replace `console.log` with `logger.info('P0_SIGNUP_TEST_ID', { id: shortId })` or redact the email.
- `tests/p0/db.trigger.spec.ts`: Same change.
- `utils/logger.ts`: Add `redact()` helper and config flag; avoid printing object payloads containing credentials.
- `.github/workflows/*` or CI config: Add steps/policy (CI/CD Change) to redact or limit artifact retention and to restrict log access.

3) FINDING 3 — Admin endpoint references (`ADMIN_ENDPOINT`) and `callAdminEndpoint`
--------------------------------------------------------------------------
Files identified for remediation
- `fixtures/testUsers.ts`, `fixtures/testTransactions.ts`, `fixtures/testSubscriptions.ts` (refer to `callAdminEndpoint`)
- `helpers/apiHelper.ts` (stub)
- `utils/env.ts` (exports `ADMIN_ENDPOINT`, `MAILTRAP_API_KEY`, `PAYMENT_SANDBOX_KEY`)

Change classification per file
- `fixtures/*.ts`: Code Change (defensive), Documentation Change
- `helpers/apiHelper.ts`: Code Change (implement secure client or keep stub) and Documentation Change
- `utils/env.ts`: Documentation Change and CI/CD Change (document required secret names)
- Infrastructure Change: Implement a secure serverless admin endpoint and CI secret creation

Current Risk
- Medium: While currently stubbed, an insecure admin endpoint implementation could expose DB-level access or permit unintended operations.

Target State
- Any admin endpoint used by tests is strictly read-only for verification, requires signed CI tokens, and is not directly accessible from browser tests. All admin credentials are stored in CI secret manager and not in repo.

Required Changes
- Document the exact contract for `ADMIN_ENDPOINT` in repo docs (inputs, outputs, authentication scheme). (Documentation Change)
- Implement serverless admin endpoint outside test code (Infrastructure Change) that:
  - Accepts signed CI tokens (JWT or HMAC with rotation)
  - Performs scoped, read-only SQL queries (no write operations)
  - Rate-limits and logs requests with audit trail
- Update `helpers/apiHelper.ts` to implement a secure client that reads API key from `process.env.ADMIN_ENDPOINT_KEY` and signs requests. (Code Change)
- Update `fixtures/*` to only use admin endpoint when `process.env.ADMIN_ENDPOINT` is set, and to fail-safe when not configured. (Code Change)
- Update CI to provision the admin endpoint key under a secure secret variable. (CI/CD Change)

Estimated Effort: 1–3 days (design + secure endpoint + CI integration)

Risk Reduction: High — prevents accidental elevation of privileges and standardizes secure DB verification.

File-by-file checklist (FINDING 3)
- `helpers/apiHelper.ts`: Implement secure signing client (or maintain stub and document that usage is disallowed until infra is in place).
- `fixtures/testUsers.ts`, `fixtures/testTransactions.ts`, `fixtures/testSubscriptions.ts`: Add defensive checks and require `ADMIN_ENDPOINT` + `ADMIN_ENDPOINT_KEY` to be present to enable admin-mode; otherwise tests must use UI flows only.
- `utils/env.ts`: Add comments documenting required env names and warn against committing keys.
- CI/CD: Create `ADMIN_ENDPOINT` and `ADMIN_ENDPOINT_KEY` secrets in CI, limit access to trusted jobs.

4) FINDING 4 — No account cleanup / test data retention policy
------------------------------------------------------------
Files / systems identified
- Tests create accounts in staging via signup UI and fixtures.
- DB / Supabase staging environment — requires retention/cleanup.

Change classification
- Infrastructure Change (cleanup job or admin endpoint)
- CI/CD Change (optional: schedule cleanup runs)
- Documentation Change (test-data retention policy)

Current Risk
- Medium: Accumulation of test accounts increases surface area, storage usage, and can cause noisy test results.

Target State
- Staging automatically removes or archives test accounts older than a retention threshold (e.g., 7 days). Test accounts are tagged/identifiable by `email` prefix (`qa+`) or metadata.

Required Changes
- Implement one of the following Infrastructure options:
  Option A — Scheduled DB job (preferred): Implement a time-based DB job or SQL script that deletes or anonymizes `auth.users` and `public.profiles` where email LIKE 'qa+%@%'
  Option B — Secure admin purge endpoint: Implement serverless function that purges test accounts and requires signed CI tokens. Use audit logs and dry-run mode.
- Add a CI job to run cleanup on schedule or as a final step in nightly pipeline. (CI/CD Change)
- Update test docs to require test accounts to use `qa+` email prefix and include metadata to assist cleanup. (Documentation Change)

Estimated Effort: 1–3 days

Risk Reduction: High — reduces long-term exposure and keeps staging clean.

Remediation Roadmap (ordered, with estimated durations)
---------------------------------------------------
P0 — Immediate (Must Fix Before Beta)
1. Remove hardcoded passwords from tests and fixtures (2–8 hours) — Code Change, Docs
2. Stop logging full emails/credentials; implement redaction in tests and update `utils/logger.ts` (2–6 hours) — Code Change, CI/CD Change
3. Define and document secure admin endpoint contract and require CI secrets (0.5–1 day) — Documentation Change, CI/CD Change
4. Implement staging cleanup strategy (1–3 days) — Infrastructure Change, CI/CD Change

P1 — Next (After P0 completion)
5. Implement secure `helpers/apiHelper.ts` client and integrate with admin endpoint (1–2 days) — Code Change
6. Add automation to use admin endpoint for optional DB verification (1 day) — Code Change

P2 — Later (Optional hardening)
7. Add logging redaction enforcement and lint rules (4–12 hours) — Code Change, Docs
8. Regularly scheduled secret-scan jobs and anomaly detection (1–2 days) — CI/CD / Infra

Priority Order
- P0 (Immediate): FINDING 1, FINDING 2, FINDING 3 (contract + CI), FINDING 4 (cleanup infra)
- P1 (Secondary): Implement secure admin client, optional automated DB verification
- P2 (Ongoing): Logging hardening, secret scans, monitoring

Approval
- Wait for security and engineering approval before any code or infra changes.
- After approval, create PRs with small, focused diffs for each item and include test plan and rollout steps.

Contact
- Security QA lead available to review PRs and CI changes.
