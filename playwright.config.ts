import { defineConfig, devices } from '@playwright/test';

// Production-ready Playwright config for DailyStack
export default defineConfig({
  testDir: 'tests',
  // Maximum time for the entire test run (global)
  globalTimeout: 30_000,
  // Maximum time per test
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retries in CI to reduce flakiness
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }]
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm --prefix app run dev',
    url: 'http://localhost:5173',
    timeout: 120_000,
     reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
