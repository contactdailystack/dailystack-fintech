# INCIDENT_LOG.md

## Stripe Key Rotation — 2026-06-24

### Summary
DailyStack production Stripe live keys (`sk_live_*`, `pk_live_*`) were detected in the repository. Incident declared 2026-06-24. Keys rotated to Stripe TEST mode keys.

### Timeline
| Date | Action |
|------|--------|
| 2026-06-24 | Incident detected — live keys found in `.env.local` |
| 2026-06-24 | CEO provided 3 Stripe TEST keys |
| 2026-06-24 | Keys rotated, `.env.local` updated |
| 2026-06-24 | INCIDENT_LOG.md created |

### Keys Rotated
| Key Type | Status |
|----------|--------|
| `pk_test_*` (Publishable) | ✅ Updated |
| `sk_test_*` (Secret) | ✅ Updated |
| `whsec_*` (Webhook) | ✅ Updated |

### Verification
- `grep sk_live_` → **0 matches** in repo
- `grep pk_live_` → **0 matches** in repo
- All Stripe keys now in TEST mode

### Next Steps
- [ ] Monitor Stripe Dashboard for any unauthorized access attempts
- [ ] Set up automated pre-commit hook to detect live keys (see `scripts/verify-no-live-secrets.sh`)
- [ ] Add this check to CI pipeline
