# DailyStack — Regression Suite

This document defines the structured regression suite: Smoke, Critical (P0), Full Regression (P0+P1+P2).

## Execution Strategy
- Run Smoke on every staging deploy. Quick checks: signup, login, dashboard load, create transaction.
- Run P0 Regression before any release and nightly. Includes payment and DB trigger checks.
- Run Full Regression on major release or weekly.

## Smoke Tests (fast)
- SMOKE-001: Signup happy path (AUTH-SIGN-001) — create user, verify profile
- SMOKE-002: Login (AUTH-LOGIN-001) — login then dashboard load
- SMOKE-003: Create transaction (TXN-CREATE-001)

## Critical Regression (P0)
- AUTH-SIGN-001: Signup (see TEST_MATRIX)
- AUTH-LOGIN-001: Login
- AUTH-PWRESET-001: Password Reset
- TXN-CREATE-001: Transaction Create
- SUB-PURCHASE-001: Subscription Purchase (sandbox)
- SUB-PAYFAIL-001: Payment Failure handling
- DB-RLS-TRIG-001: Trigger & RLS validation
- RFUNNEL-001: Revenue Funnel end-to-end
- PDPA-CONSENT-001: Consent capture verification

## Full Regression (P0 + P1 + P2)
- All Critical tests plus:
  - Profile update and validation (PROF-UPDATE-001)
  - Transaction edit/delete (TXN-EDIT-001)
  - Dashboard charts & filters (DASH-STAT-001)
  - AI insight basic flows and premium gating
  - OAuth/social login tests

## Test Execution Order (recommended)
1. Smoke Tests
2. P0 Regression (sequential by dependency: Auth → Profile → Transactions → Subscriptions → DB checks)
3. P1 Regression
4. P2 Regression

## Reporting
- Each test run must produce a report with: Test ID, status (Pass/Fail), logs, screenshots (on failures), DB query outputs, and duration.
- Store reports in CI artifacts and link to release ticket.

## Cleanup & Isolation
- Use unique test accounts per run or ensure teardown removes users, transactions, subscriptions after tests.
- For PR runs, use ephemeral test tenants or a disposable DB schema.
