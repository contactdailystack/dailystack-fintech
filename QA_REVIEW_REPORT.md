QA Review Report — Playwright P0 Tests
Date: 2026-06-05

Scope: review `tests/p0/auth.signup.spec.ts`, `tests/p0/auth.login.spec.ts`, `tests/p0/db.trigger.spec.ts` for quality, flakiness, assertions, false-positive risks, test data isolation, cleanup strategy, and staging safety.

SUMMARY
- Overall status: PASS (UI coverage) with important caveats — tests exercise the happy-path flows but lack important robustness, cleanup, and DB-level verification. Run risk: MODERATE-HIGH for production/staging due to data pollution and possible flakiness.

COMMON OBSERVATIONS
- Tests reuse Page Objects (good). They avoid service_role keys and admin endpoints (meets constraints).
- Tests generate unique emails per run (good for isolation) but do not implement cleanup (leads to data accumulation in staging).
- Assertions are minimal: mostly URL checks and absence of a specific error message. No assertions on concrete UI state, profile data, or backend state.
- Flakiness risks: reliance on single implicit waits (`waitForURL`, `waitForWidgets`) without defensive checks for element stability, network variability, or slow DB-trigger propagation.

RECOMMENDATIONS (global)
- Add stronger, explicit assertions for key UI elements (e.g., display name, balance widget counts, presence of profile fields).
- Harden waits: wait for specific element states (visible/enabled/text) rather than only URL transitions.
- Implement a test-account lifecycle/cleanup strategy: either schedule server-side cleanup of `qa+` accounts or add an opt-in admin cleanup invoked outside tests. Avoid leaving thousands of accounts in staging.
- Mark tests as non-destructive in CI policy and run them against an isolated staging instance.
- Annotate tests that require manual DB verification; consider adding a secure read-only admin API for automated checks (outside the constraints given).

DETAILED PER-TEST REVIEW

1) tests/p0/auth.signup.spec.ts
- PASS / FAIL: PASS (functional coverage) — meets the basic signup happy-path test.
- Risk Level: High
- Missing Coverage:
  - No assertion that the user profile data (full name, email) is present in UI after signup.
  - No verification that authentication tokens/session cookies are set and persistent beyond redirect.
  - No DB-level verification that `public.profiles` row exists (MANUAL_CHECK_REQUIRED if needed).
- Flaky behavior:
  - Relies on `page.waitForURL('**/dashboard')` and `dashboard.waitForWidgets()` only. If dashboard loads slowly or has intermittent API latency, the test may time out.
  - The locator for the DB error is a text search for a single string; error wording changes will cause false negatives.
- False-positive risks:
  - If the app redirects to a cached dashboard or placeholder without properly creating profile rows, the test may pass while backend failed to create data.
- Test data isolation:
  - Uses `generateUniqueEmail` to avoid collisions (good). No cleanup — test accounts accumulate.
- Cleanup strategy: NONE in test. Recommendation: define retention/cleanup policy for `qa+` accounts or provide an out-of-band cleanup job.
- Recommended Improvements:
  - Assert presence of `full name` in header/profile area.
  - Assert a specific widget metric (e.g., recent transactions count = 0) to confirm a fresh user state.
  - After redirect, verify an element that only appears for authenticated users (e.g., profile avatar or logout button) is visible.
  - Capture and log auth cookie or session identifier (for traceability) but do not store secrets in logs.

2) tests/p0/auth.login.spec.ts
- PASS / FAIL: PASS (functional coverage) — signs up, logs out, logs in, checks dashboard.
- Risk Level: High
- Missing Coverage:
  - No explicit assertion that logout completed (e.g., redirected to `/login` or login button visible) before proceeding to login.
  - No check that session is cleared after logout (e.g., attempting to access dashboard without login redirects to login).
  - No verification that the same user account can be used repeatedly (idempotency / concurrency checks).
- Flaky behavior:
  - Calling `login.logout()` assumes a logout button/flow is immediately available after signup — UI may show modal or onboarding first, causing failure.
  - Rapid sequence (signup -> logout -> login) may collide with async background tasks on backend (profile creation, triggers), causing intermittent failures.
- False-positive risks:
  - A successful redirect back to `/dashboard` after login could be caused by cached auth state or a stale cookie; test should validate that the login flow used credentials.
- Test data isolation:
  - Each test creates its own unique email (good); but no cleanup.
- Cleanup strategy: NONE — recommended external cleanup.
- Recommended Improvements:
  - After logout, explicitly wait for authoritative unauthenticated state (e.g., `page.waitForURL('**/login')` or check login form visible) before proceeding.
  - Add an assertion that login success is due to fresh auth (e.g., check for a welcome message containing the newly created display name).
  - Add retry/backoff around login if backend tasks are known to be eventually consistent.

3) tests/p0/db.trigger.spec.ts
- PASS / FAIL: PASS (UI-level) / INCOMPLETE (DB-level)
  - UI-level: PASS — verifies signup redirect, dashboard load, absence of the visible DB error, and subsequent login.
  - DB-level: INCOMPLETE — no automated validation of the `profiles` row or trigger side-effects; test contains manual SQL guidance.
- Risk Level: High
- Missing Coverage:
  - No automated check of DB rows to confirm trigger worked and `profiles` row created.
  - No checks for trigger race conditions or search_path misconfiguration (the original bug source).
- Flaky behavior:
  - Trigger propagation delays could cause login to fail intermittently immediately after signup; test doesn't wait for backend stabilization.
- False-positive risks:
  - The test only checks UI-level absence of a specific error string; trigger failures that don't surface as that text will be missed.
- Test data isolation:
  - Unique emails used (good). No cleanup — DB will retain test profiles.
- Cleanup strategy: NONE — recommended scheduled cleanup or admin removal process.
- Recommended Improvements:
  - If automation requirements permit, add a secure, audit-read-only API to confirm `profiles` row presence and return sanitized row for test validation. If not permitted, document and require manual SQL verification as currently provided.
  - Add a backoff/wait-for condition after signup before attempting login to allow database triggers and async jobs to complete (configurable short polling loop with total timeout).
  - Broaden DB error detection: scan page for any server/error banners, not only one exact phrase.

CONCLUSION
- The P0 tests cover the core happy-path flows and respect the constraint of using staging without admin/service keys. However, they are at risk of false positives and flakiness due to minimal assertions, missing DB verification, absence of cleanup, and brittle waits.
- Immediate actions to raise test quality to acceptable production standard:
  1. Add explicit UI assertions for authenticated state and profile data.
  2. Harden wait logic and add small polling/backoff for backend stabilization where necessary.
  3. Implement a cleanup policy for test accounts (server-side periodic cleanup or admin API used outside tests).
  4. If automated DB verification is required, enable a secure read-only endpoint for CI or allow a short-lived service to run validation (avoid embedding service_role keys in tests).

If you want, I will draft a prioritized implementation plan for the recommended improvements (e.g., assert matrix, wait strategy, cleanup options). 
