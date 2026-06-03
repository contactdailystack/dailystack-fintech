PR: Rotate Supabase Keys — Draft

Purpose
- Rotate Supabase Service Role and (optionally) ANON keys after accidental exposure in committed build artifacts.

What this PR contains
- Runbook (docs/ROTATE_SUPABASE_KEYS.md) with step-by-step rotation checklist.
- CI/infra checklist for updating secrets and deployments.
- Guidance for QA steps to verify staging before prod rotation.

Action items for reviewer/owner
1. Approve scheduling a brief maintenance window (5-15 minutes) for rotation.
2. Identify responsible operator to perform rotation in Supabase Console.
3. Update environment variables in the following places after rotation:
   - Hosting (Cloudflare Pages or other static host): `VITE_SUPABASE_ANON_KEY` (if rotated)
   - Server (Push server): `SUPABASE_SERVICE_ROLE_KEY`
   - CI Secrets / GitHub Actions: update any secrets that reference Service Role or anon keys.
4. Trigger a staging deployment and run smoke tests: `npm run smoke` (CI will use secrets).
5. After verification, deploy to production and run smoke tests again.

Rollback plan
- If issues appear post-rotation: re-insert previous key (if still valid) and rollback deployments to previous commit while we investigate and fix.
- If Supabase rotation invalidates old key immediately, contact Supabase support and use access logs to triage.

Testing notes
- Ensure RLS policies prevent unauthenticated writes. Use service role only on server components.
- Verify push server (`server/index.js`) continues to work using updated `SUPABASE_SERVICE_ROLE_KEY`.

Estimated time
- ~15-45 minutes depending on environment update processes.
