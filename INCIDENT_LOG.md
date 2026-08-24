# INCIDENT LOG — P0-01 Stripe Key Rotation

## Date: 2026-06-24
## Incident: Stripe Test Key Rotation for Local Development

### Problem
- Stripe live keys were in `.env.local` — needed test keys for development
- PROD keys cannot be used for local testing

### Resolution
1. CEO rotated keys at https://dashboard.stripe.com/test/apikeys
2. New test keys applied to `.env.local`

### New Keys (Test Environment)
> [REDACTED 2026-08-23] — keys stored in `.env.local` only, never in docs.
```
STRIPE_PUBLISHABLE_KEY=pk_test_[REDACTED]
STRIPE_SECRET_KEY=sk_test_[REDACTED]
STRIPE_WEBHOOK_SECRET=whsec_[REDACTED]
```

### Status
- [x] Test keys applied to `.env.local`
- [x] Webhook secret obtained via Stripe CLI

### Final Values
> [REDACTED 2026-08-23] — see `.env.local` / Vercel dashboard for current values.
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_[REDACTED]
STRIPE_SECRET_KEY=sk_test_[REDACTED]
VITE_STRIPE_WEBHOOK_SECRET=whsec_[REDACTED]
```

### CLI Setup (2026-06-24)
```bash
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```
