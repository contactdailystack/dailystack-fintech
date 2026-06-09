# DailyStack — Release Checklist

This checklist is required for each release to staging/production. It is divided into Pre-deployment, Post-deployment verification, and Rollback criteria.

## Pre-deployment Checks (must pass before deploy)
- Migrations applied on staging and verified (001–003)
- All P0 tests passing in staging (manual or CI)
- Payment sandbox keys configured in staging and webhooks validated
- Email sending (SMTP/Mailtrap) working and verification emails testable
- Monitoring/Alerting configured for `500: Database error saving new user`
- Backups and DB snapshot created before deploy
- Release notes and rollback plan published

## Deployment Steps
1. Deploy frontend build to staging
2. Deploy migrations and DB changes (apply idempotent SQL)
3. Deploy any serverless admin endpoints (DB-check endpoints)
4. Run smoke tests

## Post-deployment Verification (run immediately)
- Smoke tests pass (auth, dashboard, transaction)
- Controlled signup successfully creates `auth.users` + `public.profiles`
- Payment test transaction succeeds via sandbox and webhook processed
- Password reset email sent and reset link valid
- DB triggers show no recent errors in log for the deploy timestamp
- PDPA checks: consent persisted for new signups

## Rollback Criteria
- Rollback if any of the following occur and cannot be mitigated within agreed SLA (30 minutes):
  - Reproducible `500: Database error saving new user` on signup
  - Payment processing failures blocking upgrade purchases for all users
  - Critical data corruption observed (FK or constraint violations affecting production data)

## Rollback Steps
1. Revert frontend to previous build
2. Restore database from pre-deploy snapshot if data corruption detected
3. Reapply fixes on a staging copy and validate before re-deploy

## Post-release Tasks
- Run nightly P0 regression suite
- Monitor conversion metrics for 24–72 hours
- Create hotfix PR and test before merging if issues found
