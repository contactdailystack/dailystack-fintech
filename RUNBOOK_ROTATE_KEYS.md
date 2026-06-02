RUNBOOK: Rotate leaked keys and configure secrets store

This runbook lists step-by-step actions to rotate leaked Supabase/VAPID keys and configure GitHub Actions secrets / staging environment. Execute in order.

1) Immediately: Revoke leaked keys
   - Supabase (project owner): Go to Supabase Dashboard → Settings → API
     - Rotate `ANON` and `SERVICE_ROLE` keys. Note: rotating service role will break any backend that uses the old key.
     - Regenerate keys and copy fresh values securely.
   - VAPID keys: regenerate in your push provider (or run web-push generateVAPIDKeys()) and replace.

2) Update production/staging secret storage (do NOT commit to repo)
   - GitHub Actions (recommended): Settings → Secrets → Actions → New repository secret
     - SUPABASE_URL
     - SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY (only used in backend workflows or server deploys)
     - VAPID_PUBLIC_KEY
     - VAPID_PRIVATE_KEY
     - SENTRY_DSN (optional)
     - HOSTING_API_KEY (if using a provider)

3) Update hosting environment / CI
   - On your hosting provider (Vercel / Netlify / Railway / Render / DigitalOcean), set the same env vars in the staging and production environments.

4) Rotate locally and in dev machines
   - Remove `.env` from local clones (it was removed from repo). Place secrets in local `.env` but DO NOT commit.
   - Example `.env` (local only): copy `./.env.example` → `./.env` and fill values.

5) Validate deployment
   - Trigger CI (push to branch) and confirm `ci-smoke` job passes.
   - Verify staging app loads and, as applicable, check `/health` endpoint.

6) Post-incident
   - Announce rotation to team and list required steps for dependent services.
   - Schedule periodic key rotation policy (quarterly recommended).

Commands (examples)

Generate new VAPID keys (Node):

```bash
node -e "const webpush=require('web-push'); console.log(JSON.stringify(webpush.generateVAPIDKeys()));"
```

Set GitHub secret via CLI (example):

```bash
# Requires gh CLI and repo permissions
gh secret set SUPABASE_URL --body "https://your-project.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SUPABASE_SERVICE_ROLE_KEY"
```

If you need help executing these steps, assign an owner and I can provide exact commands for your provider.
