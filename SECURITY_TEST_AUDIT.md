SECURITY TEST AUDIT — Playwright Tests
Date: 2026-06-05

Scope: Audit of Playwright test code and related fixtures/helpers in the workspace. Checked for:
- Secrets or keys committed in code
- `service_role` or Supabase service keys
- Admin bypasses or test-only production backdoors
- Hardcoded tokens or unsafe credentials
- Sensitive/logging of secrets

Summary Result
- No committed service_role or other production secret tokens were found in the repository.
- No admin bypass or test-only production backdoor code was found in the Playwright tests.
- There are insecure test practices that present security/privacy risks when running tests against staging. See findings below.

FINDINGS (by severity)

Critical
- None found.

High
- Predictable / hardcoded test passwords present in tests and fixtures
  - Locations: `tests/p0/*.spec.ts` use password 'P@ssw0rd!1'; `fixtures/users.ts` contains 'P@ssw0rd!'.
  - Risk: Test accounts created with predictable passwords can be targeted and used to access staging data or escalate attacks if staging is publicly reachable. If the staging environment reuses production auth rules or sends emails, this increases exposure.
  - Recommendation: Generate per-run strong passwords (randomized), do not hardcode passwords in committed tests/fixtures, and mark test accounts with metadata so they can be cleaned up and monitored.

Medium
- Sensitive test output in logs (test emails printed to stdout)
  - Locations: `tests/p0/auth.signup.spec.ts`, `tests/p0/db.trigger.spec.ts` use `console.log('P0_SIGNUP_TEST_EMAIL:', email)` and similar.
  - Risk: CI logs or test artifacts may store test account emails; if logs are retained or publicly accessible, this leaks identifiers and aids attackers. Combined with predictable passwords, risk increases.
  - Recommendation: Avoid emitting full credentials in logs. If logging is necessary, redact parts of the email or log only an identifier. Ensure CI log retention/access controls are strict and artifacts are protected.

- No automated DB verification but references to admin endpoint/fixtures requiring ADMIN_ENDPOINT
  - Locations: `fixtures/testUsers.ts`, `fixtures/testTransactions.ts`, `fixtures/testSubscriptions.ts`, `helpers/apiHelper.ts`, `utils/env.ts` reference `ADMIN_ENDPOINT` and `callAdminEndpoint` placeholder.
  - Risk: Tests currently do not call admin endpoint, but the presence of sample admin integration increases risk of accidental misuse. If an admin endpoint is implemented incorrectly and accepts test-supplied tokens, it could be abused.
  - Recommendation: Keep any admin endpoint keys strictly in CI secret store, do not accept arbitrary requests without authentication, and require signed CI tokens. Document secure contract for admin endpoints.

Low
- Generic console logger and metadata logging
  - Locations: `utils/logger.ts` has `console.log` wrappers; several files log info/messages.
  - Risk: Low. If used to log sensitive meta objects, could leak data.
  - Recommendation: Ensure logger obfuscates or omits sensitive fields when called from tests; adopt structured logging with redaction policy.

- Sample fixture accounts present in repository
  - Locations: `fixtures/users.ts` contains `qa+basic@example.com` + sample password.
  - Risk: Low. These are explicitly labeled sample data, but should not contain even predictable passwords.
  - Recommendation: Keep sample fixtures but avoid including even predictable passwords; use placeholders or encourage runtime generation.

False Positives / Not Issues
- No `SUPABASE_SERVICE_ROLE` or other service_role value was found committed in code.
- `callAdminEndpoint` is a stub and not implemented; therefore no admin key leakage in code.

Staging Safety Observations
- Tests are designed to run against a staging environment (`TEST_BASE_URL`). Running them without an account cleanup policy will accumulate accounts and data in staging.
- If staging is publicly accessible, predictable test credentials and printed emails increase the attack surface.

Actionable Remediations (prioritized)
1. Replace hardcoded passwords with per-run generated strong passwords (High priority).
2. Remove or redact console logging of full emails/credentials; log only non-sensitive identifiers (Medium priority).
3. Implement a documented cleanup/retention policy for test accounts in staging. Prefer an automated scheduled job or secure admin endpoint (High priority).
4. Ensure any admin endpoints accept signed CI tokens and are stored in CI secret store; never embed admin/service_role keys in tests or client code (High priority).
5. Add CI artifact retention and access controls; redact sensitive outputs in artifact archives (Medium priority).
6. Add redaction to logger utilities and audit any places that log network responses or meta objects (Low priority).

Conclusion
- No immediate code-level secret exposures or service_role keys are present in the committed tests.
- There are several operational security risks (predictable passwords, logging of test emails, lack of cleanup) that must be remediated before these tests are run routinely against shared staging environments.

If you want, I can produce a short patch plan with exact code/CI config changes (no secret values included) to remediate the items above.
