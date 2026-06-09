# DailyStack — TEST_DATA

This file lists required test data for running manual and automated tests on staging. Use unique values (qa+timestamp) for parallel runs.

## Test Users
- `qa+signup@example.com` — basic user, no subscription
- `qa+billing@example.com` — user with payment method and active subscription
- `qa+admin@example.com` — admin user with elevated privileges
- `qa+pdpa@example.com` — user for PDPA/DSAR testing

Each user record should include: password (e.g., `P@ssw0rd!`), full_name, locale (th), timezone (Asia/Bangkok).

## Test Transactions
- Small expense: 9.99 USD, category: subscriptions, date: today
- Large expense: 10000.00 USD, category: rent, date: today-1
- Past expense: 50.00 USD, date: 3 months ago
- Recurring expense: Netflix-like monthly subscription sample

## Required Subscription Plans
- `monthly_basic` — cost: 4.99 monthly
- `monthly_pro` — cost: 9.99 monthly
- `yearly_pro` — cost: 99.99 yearly

## Payment Scenarios (Sandbox)
- Successful charge (Visa test token)
- Declined charge (card_declined token)
- 3DS/auth required flow (if supported)
- Refund processing (partial/full)

## Edge Cases
- Signup with existing email
- Signup with missing email (SSO) — check behavior
- Transaction with negative amount (reject)
- Transaction with extremely large amount (overflow guard)
- Subscription upgrade mid-cycle (proration)
- Multiple concurrent subscription purchase attempts (race)

## Test Data Management
- Use unique emails `qa+<iso-timestamp>@example.com`.
- Tests must remove created rows after run or use a disposable DB/schema.
- Store sandbox keys and secrets in CI secret manager (do not commit keys).
