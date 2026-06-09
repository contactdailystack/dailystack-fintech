P0 Playwright Tests — Run Instructions

These tests are intended to run against a real staging environment (no mocks, no admin endpoints).

Prerequisites
- Node 18+ and npm installed
- Playwright dev deps installed in `app` (recommended)
- `TEST_BASE_URL` must point to the staging URL

Install and browsers (from repo root):

```bash
cd app
npm install --save-dev playwright @playwright/test
npx playwright install
```

Run only P0 tests:

```bash
cd app
npx playwright test tests/p0 --config ../playwright.config.ts
```

Manual DB verification (if required)
---------------------------------
If you need to confirm the `profiles` row was created in Supabase run this in the Supabase SQL editor on staging, replacing `<email>` with the email printed in test logs (tests now redact emails in logs):

```sql
SELECT u.id AS auth_user_id, u.email, p.*
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = '<email>'
ORDER BY u.created_at DESC
LIMIT 1;
```

# Notes
- Tests write to staging data; ensure the staging environment is safe to run tests and test accounts are allowed.
- Never add service_role keys to client tests. Use only UI flows and publicly available endpoints.
- Password generation: P0 tests now generate strong passwords at runtime. Do NOT log or persist passwords.
- Logging: tests redact email addresses in logs. Do not add console.log of sensitive data.
# P0 Regression Tests

Place revenue-critical regression tests here. These tests should be stable and fast enough for pre-release runs.
