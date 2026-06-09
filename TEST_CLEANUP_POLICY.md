# Test Account Cleanup Policy

Purpose
-------
Define lifecycle, retention, and safe cleanup procedures for test accounts, subscriptions, and transactions used by Playwright, QA, and temporary staging activities. This policy avoids admin backdoors and service_role usage, and does not modify production databases.

Scope
-----
- Playwright test accounts (P0/P1 automated tests)
- QA accounts created manually by engineers or QA team
- Temporary staging accounts created for exploratory/testing sessions
- Test subscriptions and test transactions created against staging

Principles & Constraints
-----------------------
- No admin backdoors: tests and cleanup processes must not rely on untracked admin endpoints or service_role keys committed to repo.
- No service_role usage from frontend tests: service_role keys must never be used by Playwright/browser tests.
- No production DB modifications: cleanup applies only to staging/testing databases approved by owners.
- Safety first: cleanup operations must be reversible (logs, dry-run) and require approvals for bulk deletions.

1. Lifecycle of Test Accounts
----------------------------
- Creation: Accounts are created with a `qa+` or `test+` email prefix and a timestamped/unique suffix (e.g., `qa+2026-06-05T12-00-00-<rand>@example.com`).
- Marking: Accounts created by automation or QA must include a metadata flag when possible (e.g., identifiable email prefix). No secrets in logs.
- Usage: Test accounts may be used for UI, API, or integration tests against staging only.
- Verification: When a test requires DB-level proof (e.g., profile row), include documented manual SQL checks rather than embedding privileged calls.
- Retirement: Accounts older than the retention period are eligible for cleanup.

2. Playwright Test Accounts
---------------------------
- Creation: Generated at runtime (strong passwords) and never logged in plaintext.
- Ownership: Created by CI or local test runners; marked in logs with redacted identifiers only.
- Retention: Keep for 7 days by default unless a longer retention is requested and approved.
- Cleanup: Automated or manual removal from staging per Cleanup Frequency below.

3. QA Accounts (manual)
-----------------------
- Creation: Created by QA engineers for manual testing and exploratory work.
- Retention: Keep for 30 days by default; individual QA owners may request extensions with justification.
- Cleanup: Owner-initiated deletion or scheduled cleanup after retention period.

4. Temporary Staging Accounts
-----------------------------
- Creation: For debug or feature demo; clearly named with `staging-temp+` prefix.
- Retention: Short-lived — 48 hours by default unless extension requested.
- Cleanup: Owners must delete when no longer needed; otherwise cleanup job removes them after retention.

5. Test Subscriptions & Transactions
-----------------------------------
- Marking: Test payment records must use sandbox payment gateways or clearly identifiable test IDs.
- Retention: Align with associated account retention; subscriptions/transactions older than the account retention window are eligible for cleanup.
- Data handling: Sensitive payment tokens or PII must not be recorded in logs or artifacts; use sandbox/test tokens only.

6. Retention Periods (defaults)
-------------------------------
- Playwright test accounts: 7 days
- QA manual accounts: 30 days
- Temporary staging accounts: 48 hours
- Test subscriptions/transactions: aligned with account retention (default 7 days)

7. Cleanup Frequency
--------------------
- Automated sweep: Weekly sweep for Playwright/test accounts (full run in dry-run mode first).
- QA manual cleanup: Weekly reminder to owners; monthly automated pass for expired QA accounts.
- Temp accounts: Daily sweep for accounts older than 48 hours.

8. Manual Cleanup Process
-------------------------
Steps for safe manual cleanup (owner or admin):

1. Identify targets by prefix (`qa+`, `test+`, `staging-temp+`) and age.
2. Run read-only verification queries on staging to list candidate records. Export the list to a CSV for audit.
3. Perform a dry-run deletion in the staging admin UI or via approved admin tooling (no untracked endpoints). Record output and approvals.
4. If results are correct, perform deletion during a maintenance window or low-traffic period.
5. Validate tests and critical workflows post-cleanup (smoke test).
6. Log the operation (who, when, what was removed) to the project audit channel and attach CSV evidence.

Manual Deletion Checklist
- Confirm target environment is staging (not production).
- Confirm deletion list is limited to `qa+`, `test+`, or `staging-temp+` prefixes.
- Ensure a backup/snapshot is available per infra policy (if supported).
- Acquire approvals: at least one QA lead or engineering owner sign-off for bulk deletions.
- Run dry-run and inspect the output.
- Execute deletion and run post-cleanup verification steps.

9. Future Automated Cleanup Strategy
-----------------------------------
- Build a scheduled cleanup job (CI/CD or infra-side) that:
  - Runs in dry-run mode and posts candidates to PR or audit channel for approval.
  - After approval, runs the deletion with rate-limiting and retry/backoff.
  - Emits an audit artifact (CSV, log) stored in secure CI artifacts for 90 days.
- Implementation constraints:
  - The cleanup job must use an approved admin API or infra tooling managed by ops (no hardcoded service_role keys in repo).
  - Access must require secret injection from the CI secret store and be auditable.

10. Approvals & Governance
--------------------------
- Small deletions (<100 accounts): one QA lead approval.
- Bulk deletions (>100 accounts): engineering manager + QA lead approval and infra ops notification.
- All deletions must be communicated in the project audit channel with links to dry-run output.

11. Constraints & Non-Goals
--------------------------
- This policy prohibits creating admin backdoors or embedding `service_role` keys in tests.
- This policy does not authorize any changes to production databases or production data deletion.

12. Cleanup Checklist (Deliverable)
----------------------------------
- [ ] Verify target environment is staging
- [ ] Export candidate list (CSV) from staging read-only queries
- [ ] Dry-run deletion and inspect
- [ ] Obtain required approvals
- [ ] Schedule deletion during maintenance window
- [ ] Execute deletion
- [ ] Run post-cleanup smoke tests
- [ ] Upload audit artifact to secure storage

13. Risk Assessment
-------------------
- Risk: Accidental deletion of production data
  - Mitigation: Strict prefix rules, environment checks, and approvals; never run scripts without explicit staging target confirmation.
- Risk: Sensitive data leakage in logs or artifacts
  - Mitigation: Redact PII in logs; never write plaintext passwords or tokens to artifacts.
- Risk: Orphaned references or broken integrations after cleanup
  - Mitigation: Post-cleanup smoke tests and a rollback plan (restore from snapshot or re-create small sample accounts).
- Risk: Unauthorized admin access for cleanup tooling
  - Mitigation: Use CI secret store and infra-managed admin tooling; require audit trail and limited scope tokens.

14. Rollback Plan
-----------------
- If cleanup caused regressions, restore from most recent staging snapshot (if available) or re-create a small set of test accounts manually for immediate testing.
- For missing test data that blocks releases, notify the engineering owner and re-seed minimal test accounts from documented fixtures.

15. Ownership
-------------
- Policy owner: QA Lead + Engineering Lead (joint)
- Execution owner: QA Engineers (manual) + Infra/Ops (automated tooling)

Revision History
----------------
- 2026-06-05: Initial policy created by automation and QA scaffolding work.
