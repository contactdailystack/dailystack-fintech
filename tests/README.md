# Playwright Tests

This folder contains Playwright test suites organized by priority.

Structure:
- smoke/ — quick sanity checks run on every deploy
- p0/ — revenue-critical regression tests
- p1/ — core product regression tests
- p2/ — enhancement tests

Place test files as `*.spec.ts` under the appropriate folder. Do not commit secrets.

Running tests

- Install Playwright and dev deps from the `app` folder (recommended):

```bash
cd app
npm install --save-dev playwright @playwright/test
# install browser binaries
npx playwright install
```

- Set `TEST_BASE_URL` to point to the environment under test (local or staging):

```bash
# Linux / macOS
export TEST_BASE_URL=https://staging.example.com
# Windows PowerShell
$env:TEST_BASE_URL = "https://staging.example.com"
```

- Run the full suite:

```bash
cd app
npm run test
```

- Run Chromium-only tests:

```bash
cd app
npm run test:ui
```

Reports and artifacts

- HTML report is generated to `reports/html` by default. Open it with `npm run test:report` from the `app` folder after a run.
- Screenshots and videos are retained on failure per `playwright.config.ts` settings.

CI notes

- Ensure `TEST_BASE_URL` is set in the CI job and Playwright browser binaries are installed. Retries are enabled when `CI` environment variable is set.

DB verification

- Some tests will indicate `MANUAL_CHECK_REQUIRED` if DB-level verification is necessary and no admin endpoint is configured. Follow instructions in the test file for SQL to run in Supabase SQL editor.
