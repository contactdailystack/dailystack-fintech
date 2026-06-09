# Regression Test Suite — Business-Critical Flows

Scope: Professional, manual- or automation-ready test cases focused on revenue-impacting and core business flows for DailyStack. Each test case uses the strict template requested.

---

TEST ID: AUTH-SIGN-001
Priority: P0
Feature: Authentication — Signup
Preconditions: Application reachable at `TEST_BASE_URL`; no pre-existing account with test email.
Steps:
1. Navigate to the Signup page.
2. Enter full name, unique email, and valid password that meets policy.
3. Submit the signup form.
Expected Result: User is created, redirected to `/dashboard`, and dashboard widgets load. No visible "Database error saving new user" appears.
Automation Candidate (Yes/No): Yes

---

TEST ID: AUTH-LOGIN-001
Priority: P0
Feature: Authentication — Login
Preconditions: A valid user account exists (created manually or via fixture).
Steps:
1. Navigate to the Login page.
2. Enter registered email and password.
3. Submit the form.
Expected Result: User is authenticated and redirected to `/dashboard`. Session persists (refresh remains logged in).
Automation Candidate (Yes/No): Yes

---

TEST ID: AUTH-LOGOUT-001
Priority: P1
Feature: Authentication — Logout
Preconditions: User is logged in and on any authenticated page.
Steps:
1. Click the Logout control.
2. Observe redirect and try to access `/dashboard`.
Expected Result: User is redirected to the public landing or login page. Access to `/dashboard` redirects to login when not authenticated.
Automation Candidate (Yes/No): Yes

---

TEST ID: AUTH-PWRESET-001
Priority: P1
Feature: Authentication — Password Reset
Preconditions: Email sending configured in staging; test account exists.
Steps:
1. Navigate to Password Reset page.
2. Enter the account email and request reset.
3. Retrieve reset link from email logs (Mailtrap/Supabase email logs) and open it.
4. Set a new valid password and login with it.
Expected Result: Reset email delivered, reset link allows password change, and new password authenticates successfully.
Automation Candidate (Yes/No): No (email retrieval requires secure test fixtures or email API)

---

TEST ID: PROFILE-CREATE-001
Priority: P0
Feature: Profile — Profile Creation
Preconditions: User has just completed signup and is authenticated.
Steps:
1. On first login, observe creation of profile fields (full name displayed, onboarding step shows profile info).
2. Query UI profile fields for name/email.
Expected Result: Profile is populated with signup data and visible in UI.
Automation Candidate (Yes/No): Yes

---

TEST ID: PROFILE-UPDATE-001
Priority: P1
Feature: Profile — Profile Update
Preconditions: User is authenticated and has a profile.
Steps:
1. Navigate to Settings / Profile.
2. Update the display name and save.
3. Refresh and revisit profile page.
Expected Result: The updated name persists and is reflected throughout the UI.
Automation Candidate (Yes/No): Yes

---

TEST ID: TXN-CREATE-001
Priority: P0
Feature: Transactions — Create
Preconditions: User is authenticated and on Transactions page.
Steps:
1. Click Add Transaction.
2. Enter valid amount, category, and date.
3. Save the transaction.
Expected Result: New transaction appears in transaction list with correct values and affects dashboard totals.
Automation Candidate (Yes/No): Yes

---

TEST ID: TXN-EDIT-001
Priority: P1
Feature: Transactions — Edit
Preconditions: Transaction exists for the user.
Steps:
1. Select a transaction and choose Edit.
2. Change the amount/category and save.
Expected Result: The transaction is updated in the list and totals/statistics reflect the change.
Automation Candidate (Yes/No): Yes

---

TEST ID: TXN-DELETE-001
Priority: P1
Feature: Transactions — Delete
Preconditions: Transaction exists for the user.
Steps:
1. Select a transaction and delete it, confirm deletion when prompted.
Expected Result: Transaction removed from UI and totals/statistics update accordingly.
Automation Candidate (Yes/No): Yes

---

TEST ID: DASH-LOAD-001
Priority: P0
Feature: Dashboard — Load Dashboard
Preconditions: User is authenticated and has transaction/subscription data.
Steps:
1. Navigate to `/dashboard`.
2. Observe loading behavior and widgets.
Expected Result: Dashboard loads within reasonable time (e.g., <5s in staging); key widgets (balance, monthly summary, recent transactions) are visible and populated.
Automation Candidate (Yes/No): Yes

---

TEST ID: DASH-STATS-001
Priority: P1
Feature: Dashboard — Statistics
Preconditions: User has transactions and subscriptions data for the month.
Steps:
1. View aggregate stats on dashboard (income, expenses, net balance).
2. Cross-check totals against transaction list filtered by month.
Expected Result: Statistics match the transaction aggregation for the selected period.
Automation Candidate (Yes/No): Yes

---

TEST ID: DASH-MONTHLY-001
Priority: P1
Feature: Dashboard — Monthly Summary
Preconditions: Multiple transactions exist across months.
Steps:
1. Switch month in dashboard controls.
2. Review monthly summary details and charts.
Expected Result: Monthly totals and charts reflect the selected month and match transaction details.
Automation Candidate (Yes/No): Yes

---

TEST ID: SUB-UPGRADE-001
Priority: P0
Feature: Subscription — Upgrade Plan
Preconditions: Test user on a free plan; payment sandbox available (Stripe test keys) OR admin endpoint to provision subscription.
Steps:
1. Navigate to Subscriptions.
2. Click Upgrade on a paid plan and follow payment flow (or simulated payment in sandbox).
3. Confirm subscription active in UI and billing state.
Expected Result: Subscription status becomes Active, user access updated to paid features, and billing records created in sandbox.
Automation Candidate (Yes/No): No (payment provider interaction; recommend API-level provisioning for automation)

---

TEST ID: SUB-CANCEL-001
Priority: P1
Feature: Subscription — Cancel Plan
Preconditions: User has an active paid subscription.
Steps:
1. Navigate to Subscriptions.
2. Click Cancel and confirm cancellation.
Expected Result: Subscription moves to canceled/pending-cancel state; access to paid features revoked per billing period.
Automation Candidate (Yes/No): Yes (if API/provisioning stubs available; otherwise No)

---

TEST ID: SEC-RLS-001
Priority: P0
Feature: Security — RLS Validation
Preconditions: RLS policies deployed to staging as in production.
Steps:
1. Sign up or log in as User A.
2. Attempt to access User B's resources (e.g., monthly_records, subscriptions) via UI and direct API requests.
Expected Result: Access is denied; API returns 401/403 or empty result sets as per policy. No elevation of privileges.
Automation Candidate (Yes/No): Yes (UI-level checks + API tests), DB row-level verification may be MANUAL_CHECK_REQUIRED if no admin endpoint.

---

TEST ID: SEC-CROSS-USER-001
Priority: P0
Feature: Security — Cross-user Access Prevention
Preconditions: Two test users exist (User A and User B) with transactions.
Steps:
1. Auth as User A.
2. Attempt to access direct URL or API endpoint referencing User B's resource identifiers.
Expected Result: Access denied and no cross-user data exposed in UI or API responses.
Automation Candidate (Yes/No): Yes (API + UI)

---

TEST ID: PDPA-CONSENT-001
Priority: P0
Feature: PDPA — Consent Collection
Preconditions: New user signup flow requires explicit consent collection (privacy/terms checkbox).
Steps:
1. Navigate to Signup page.
2. Try to submit without consenting to required checkboxes.
3. Submit with consent.
Expected Result: Signup blocked until consent is provided; when consent given, consent record stored and visible in profile/audit logs.
Automation Candidate (Yes/No): Yes (UI) — DB audit log check may be MANUAL_CHECK_REQUIRED when no admin endpoint.

---

Notes and Traceability
- Use P0 for revenue-impacting flows (signup, login, subscription purchase, RLS enforcement).
- Add references to related SQL checks, Supabase trigger tests, or manual verification steps in individual test case docs when DB-level proof is required.
- For automation candidates marked No, implement equivalent API or provisioning stubs before automating.

Change log
- 2026-06-05: Initial version covering Authentication, Profile, Transactions, Dashboard, Subscriptions, Security, and PDPA.
# DailyStack — Test Matrix

This document is the master test matrix for DailyStack-Fintech. Tests are prioritized P0 (Revenue Critical), P1 (Core Product), and P2 (Enhancement). Each test includes Preconditions, Steps, Expected Result, and Pass Criteria.

## How to read
- Test ID: Unique identifier
- Priority: P0 / P1 / P2
- Pass Criteria: What must be true for the test to be considered successful

---

## P0 — Revenue Critical

### AUTH-SIGN-001
- Feature: Authentication — Signup (email)
- Priority: P0
- Preconditions: Staging URL available; email sandbox configured; no existing user with test email
- Test Steps:
  1. Open `/signup`.
  2. Enter full name, `qa+ts@example.com`, password (>=6).
  3. Submit.
  4. Capture network call and frontend logs.
  5. Verify `auth.users` and `public.profiles` rows exist.
- Expected Result: Signup returns success, `auth.users` created, `public.profiles` created, verification email queued.
- Pass Criteria: Both DB rows exist and no `500` signup errors appear in logs.

### AUTH-LOGIN-001
- Feature: Authentication — Login
- Priority: P0
- Preconditions: Test user confirmed
- Test Steps:
  1. Open `/login`.
  2. Submit credentials.
  3. Observe redirect and session cookie/JWT.
- Expected Result: 200 OK, session persisted, redirect to `/dashboard`.
- Pass Criteria: Token/cookie present; dashboard loads.

### AUTH-PWRESET-001
- Feature: Password Reset
- Priority: P0
- Preconditions: Test user exists; email sandbox enabled
- Test Steps:
  1. Request password reset for test user.
  2. Capture reset email and follow link.
  3. Set new password and login.
- Expected Result: Reset email sent; link valid; login succeeds with new password.
- Pass Criteria: Reset flow completes and old sessions revoked if policy requires.

### TXN-CREATE-001
- Feature: Transactions — Create
- Priority: P0
- Preconditions: Authenticated test user
- Test Steps:
  1. Add a transaction (amount, category, date).
  2. Save.
  3. Verify transaction appears and aggregates update.
- Expected Result: 201 created, list updates, totals recalculated.
- Pass Criteria: Transaction present in DB and UI; totals match DB.

### SUB-PURCHASE-001
- Feature: Subscriptions — Purchase/Upgrade
- Priority: P0
- Preconditions: Payment sandbox configured; authenticated user
- Test Steps:
  1. Begin upgrade flow, enter sandbox payment method.
  2. Confirm payment and observe webhook handling.
  3. Verify subscription record and invoice.
- Expected Result: Subscription active, invoice generated, user role updated.
- Pass Criteria: Subscription row active and invoice exists.

### SUB-PAYFAIL-001
- Feature: Subscriptions — Payment Failure
- Priority: P0
- Preconditions: Payment sandbox supports failure simulation
- Test Steps:
  1. Attempt payment with declined card.
  2. Observe UI and webhook events.
- Expected Result: Payment rejected, subscription not activated, error message shown.
- Pass Criteria: No subscription row created; clear user-facing error.

### DB-RLS-TRIG-001
- Feature: Database — RLS & Trigger Validation
- Priority: P0
- Preconditions: Migrations 001–003 applied; admin SQL access available
- Test Steps:
  1. Create a test user via Auth.
  2. Verify `public.profiles` created by trigger.
  3. Check logs for trigger errors.
- Expected Result: Trigger runs, profile created, no RLS violations.
- Pass Criteria: `profiles` row present; no trigger errors in logs.

### RFUNNEL-001
- Feature: Revenue Funnel — Signup → Activation → Upgrade
- Priority: P0
- Preconditions: Email + payment sandbox configured
- Test Steps:
  1. Signup → verify email → login → upgrade.
  2. Track funnel events in DB/analytics.
- Expected Result: Events logged at each funnel step; upgrade succeeds.
- Pass Criteria: Conversion events present and subscription active.

### PDPA-CONSENT-001
- Feature: PDPA — Consent Capture
- Priority: P0
- Preconditions: Consent UI enabled on signup
- Test Steps:
  1. Signup and accept consent.
  2. Confirm consent persisted with timestamp.
- Expected Result: Consent recorded in DB with version and timestamp.
- Pass Criteria: Consent record present and retrievable.

---

## P1 — Core Product

### PROF-UPDATE-001
- Feature: Profile — Update Profile
- Priority: P1
- Preconditions: Authenticated test user
- Test Steps:
  1. Edit profile fields (name, currency).
  2. Save and refresh.
- Expected Result: Changes persisted and visible in UI.
- Pass Criteria: DB values match UI.

### TXN-EDIT-001
- Feature: Transactions — Edit
- Priority: P1
- Preconditions: Transaction exists
- Test Steps:
  1. Edit transaction fields and save.
  2. Verify history/audit.
- Expected Result: Updated values persisted; audit trail updated.
- Pass Criteria: DB reflects edits; audit entries present.

### DASH-STAT-001
- Feature: Dashboard — Statistics
- Priority: P1
- Preconditions: Data exists for chosen period
- Test Steps:
  1. Open dashboard; apply date filters.
  2. Verify charts and totals.
- Expected Result: Charts display accurate data matching DB.
- Pass Criteria: Aggregates match DB calculations.

---

## P2 — Enhancements

### AI-INSIGHT-EDGE-001
- Feature: AI Insights — Large dataset handling
- Priority: P2
- Preconditions: Large dataset exists
- Test Steps:
  1. Request insight for wide date range.
  2. Observe response (timeout/acceptance pattern).
- Expected Result: 202 accepted or result within SLA; no crash.
- Pass Criteria: Job accepted or result returned within SLA.

### OAUTH-001
- Feature: OAuth / Social Login
- Priority: P2
- Preconditions: Provider configured
- Test Steps:
  1. Use social login, allow provider, return to app.
- Expected Result: Account linked or created, login succeeds.
- Pass Criteria: User can login via provider and roles set.

---

## Notes
- Each test must include cleanup steps (delete test data) to keep staging stable.
- For DB verification automate via a secure admin endpoint; never embed service_role keys in client tests.
