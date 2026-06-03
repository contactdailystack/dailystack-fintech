Push Server (Web Push)
======================

This small Express server sends Web Push notifications using VAPID keys and reads
push subscriptions from your Supabase `user_settings.push_subscription` JSONB column.

Environment variables (required):

- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service_role key (keep secret)
- `VAPID_PUBLIC_KEY` — VAPID public key used by clients
- `VAPID_PRIVATE_KEY` — VAPID private key used to sign notifications
- `PORT` — optional server port (default 8787)

New (security):
- `PUSH_SERVER_API_KEY` — required header `x-api-key` value for requests to `/send-push` (protects the endpoint from unauthenticated use)

How to run locally:

1. Install deps:

```bash
cd server
npm install
```

2. Create a `.env` file with the required variables.

3. Start the server:

```bash
npm start
```

Example request (send notification to user by userId):

```bash
curl -X POST http://localhost:8787/send-push \
  -H "Content-Type: application/json" \
  -H "x-api-key: <YOUR_PUSH_SERVER_API_KEY>" \
  -d '{"userId":"<USER_UUID>","payload":{"title":"Hello","body":"This is a test"}}'
```

Notes:
- The server requires that `user_settings.push_subscription` contains a valid PushSubscription object
  (as returned by `ServiceWorkerRegistration.pushManager.subscribe`).
 - The `/send-push` endpoint is rate-limited to reduce abuse (default: 30 reqs/min per IP). Adjust limits in `server/index.js`.
- Deploy this to any Node-friendly host (Vercel Serverless, Heroku, Fly, etc.).
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `VAPID_PRIVATE_KEY` secret; do NOT commit them.

Vercel deployment
-----------------

You can deploy a serverless function instead of the Express server by using the `api/send-push.js`
file at the project root. On Vercel, set the following Environment Variables in the Project Settings:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

Then deploy the repo to Vercel; the function will be available at `https://<your-deploy>/api/send-push`.

