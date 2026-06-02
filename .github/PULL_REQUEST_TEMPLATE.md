## Summary

This PR groups security and MVP readiness changes:

- Remove leaked `.env` and add `.env.example`.
- Add pre-commit secret-scan script and `npm run scan:secrets`.
- Add Sentry optional initializers for frontend and server.
- Add DB migrations for `subscriptions` and `subscription_templates` and seed templates.
- Add quick-add subscription templates UI and dashboard top-fold component.
- Add CI workflow for secret-scan, build, and smoke checks.

## Security
- Revoke any leaked keys immediately after merging.
- Do NOT add production secrets to the repo. Use GitHub Actions secrets / hosting env vars.

## How to test
- Run `npm run scan:secrets` locally.
- Run `npm ci && npm run build`.
- Verify `dist/index.html` is produced and `npm run smoke` passes.

## Notes
- This PR prepares the repo for a Closed Beta. Follow the runbook `RUNBOOK_ROTATE_KEYS.md` to rotate keys and set secrets.
