Rotate Supabase Keys — Runbook

Why
- A Supabase anon or service role key was found in committed build assets. Even though anon keys are public-facing, rotating keys removes risk from accidental exposure (especially service role keys).

Which keys
- ANON: Public key used by client (`VITE_SUPABASE_ANON_KEY`). Public but rotate if leaked to unknown parties or included in packaged apps.
- SERVICE_ROLE: Server key (`SUPABASE_SERVICE_ROLE_KEY`). High-privilege — rotate immediately if ever exposed.

Steps to rotate
1. In Supabase Console → Project Settings → API → `Rotate keys`.
   - Rotate the **Service Role key** first if it may be exposed. Record the new key securely.
2. Update environment variables in all places the old key is used:
   - Server env (server host, containers): `SUPABASE_SERVICE_ROLE_KEY`.
   - CI/CD secrets that might use the key.
   - Do NOT embed keys in committed files.
3. Update client anon key usages if you choose to rotate anon key:
   - Update `VITE_SUPABASE_ANON_KEY` in hosting/staging/production envs.
   - Rebuild mobile app and web apps; re-deploy.
4. Verify applications work in a staging environment before rotating prod keys.
5. Revoke old keys if Supabase supports revocation or rotation automatically invalidates prior keys.

Checklist
- [ ] Rotate Service Role key (if exposed)
- [ ] Update server envs and CI secrets
- [ ] Rotate ANON key if leakage risk unacceptable
- [ ] Rebuild and deploy staging, smoke test
- [ ] Rebuild and deploy production
- [ ] Re-run `tools/find-exposed-keys.sh` to ensure no occurrences remain

Notes
- If an attacker had access to a Service Role key, consider performing a security incident response: rotate DB credentials, inspect logs, and revoke compromised sessions.
- We recommend limiting Service Role usage to server-side processes only and using RLS+service principals for minimal risk.
