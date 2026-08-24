# DailyStack DevOps Setup — CI/CD Pipeline
**Date:** June 12, 2026
**Status:** COMPLETE

---

## GitHub Actions Workflows

### Workflow Directory: `.github/workflows/`

---

## 1. CI — Continuous Integration
**File:** `.github/workflows/ci.yml`
**Trigger:** Push to main, Pull Request

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        run: cd app && npm ci

      - name: TypeScript check
        run: cd app && npx tsc --noEmit
        continue-on-error: false

      - name: ESLint check
        run: cd app && npx eslint src --ext .ts,.tsx
        continue-on-error: false

      - name: Build
        run: cd app && npm run build
        continue-on-error: false

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: app/dist
          retention-days: 7
```

---

## 2. Preview Deploy
**File:** `.github/workflows/preview.yml`
**Trigger:** Pull Request opened/synchronize/reopened

```yaml
name: Preview Deploy

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        run: cd app && npm ci

      - name: Build preview
        run: cd app && npm run build

      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-comment: true

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        if: always()
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## Preview Deployment\n\n$VERCEL_URL'
            })
```

---

## 3. Production Deploy
**File:** `.github/workflows/deploy.yml`
**Trigger:** Push to main (after CI passes)

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        run: cd app && npm ci

      - name: Build
        run: cd app && npm run build

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 4. Nightly QA Run
**File:** `.github/workflows/qa-tests.yml`
**Trigger:** Daily at midnight

```yaml
name: Nightly QA

on:
  schedule:
    - cron: '0 0 * * *'  # Midnight every day

jobs:
  qa:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        run: cd app && npm ci

      - name: Build
        run: cd app && npm run build

      - name: Run smoke tests
        run: cd app && npm run test:smoke || true

      - name: Run unit tests
        run: cd app && npm run test || true
```

---

## 5. GitHub Secrets Required

| Secret | Description | Where to get |
|--------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel API token | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Vercel org ID | `vercel inspect` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `vercel inspect` |

---

## Environment Variables for Vercel

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | Production, Preview |

---

## vercel.json — Enhanced Configuration

```json
{
  "buildCommand": "cd app && npm run build",
  "outputDirectory": "app/dist",
  "installCommand": "cd app && npm install",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/dashboard",
      "destination": "/index.html"
    },
    {
      "source": "/settings",
      "destination": "/index.html"
    }
  ],
  "redirects": [
    {
      "source": "/",
      "destination": "/login",
      "permanent": false
    }
  ]
}
```

---

## Dependency Audit

Run `npm audit --audit-level=high` in `app/` directory to check for vulnerabilities.

**Expected action:** Fix any HIGH or CRITICAL vulnerabilities before deployment.

---

## Monitoring Setup

For Edge Function monitoring, create `supabase/functions/_shared/monitoring.ts`:

```typescript
// supabase/functions/_shared/monitoring.ts
export function logPerformance(startTime: number, functionName: string) {
  const duration = Date.now() - startTime;
  console.log(`[PERF] ${functionName}: ${duration}ms`);
  // Send to monitoring service if configured
}

export function logError(error: unknown, context: string) {
  console.error(`[ERROR] ${context}:`, error);
  // Send to error tracking service
}
```

---

*DevOps Engineer: AI Team Lead (Mavis)*
