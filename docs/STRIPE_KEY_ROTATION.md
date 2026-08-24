# 🔐 STRIPE KEY ROTATION — ACTION REQUIRED

**Priority:** 🔴 CRITICAL
**Created:** 2026-06-22
**Owner:** Pick (CEO — needs Stripe Dashboard access)

---

## ⚠️ Why This Is Critical

We have **live Stripe secret keys** (`sk_live_*`) sitting in `app/.env.local` on this development machine:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[REDACTED — rotated to test keys 2026-06, see INCIDENT_LOG]
STRIPE_SECRET_KEY=sk_live_[REDACTED — rotated to test keys 2026-06, see INCIDENT_LOG]
VITE_STRIPE_WEBHOOK_SECRET=whsec_[REDACTED — rotated to test keys 2026-06, see INCIDENT_LOG]
```

**Risk:** Anyone with access to this machine (or the file if leaked) can charge real credit cards via Stripe API on the DailyStack merchant account.

**Good news:** The file is in `.gitignore` so it won't be committed to git. But it's still on disk and any deploy pipeline that reads `.env.local` will deploy with live keys.

---

## 🎯 Action Steps (do in order)

### Step 1: Rotate keys in Stripe Dashboard (10 min)

1. Open **https://dashboard.stripe.com/apikeys**
2. **Verify you're in TEST MODE** (toggle in top-right of Dashboard) — this is critical!
   - If it says "Test mode", proceed.
   - If it says "Live mode", click to switch to Test mode first.
3. Under **Standard keys**, click **Roll** next to:
   - Publishable key (will create new `pk_test_...`)
   - Secret key (will create new `sk_test_...`)
   - **Save both new keys somewhere safe** (password manager, NOT this file).
4. For the webhook secret:
   - Open **https://dashboard.stripe.com/test/webhooks**
   - Find your webhook endpoint (probably points to `https://pexcvfhuvqrwrabpgkzi.supabase.co/functions/v1/stripe-webhook`)
   - Click on it → **Roll secret**
   - **Save the new `whsec_...`**

### Step 2: Update `.env.local` with new test keys (5 min)

Replace contents of `app/.env.local` with:

```bash
# DailyStack — TEST MODE KEYS (post-rotation 2026-06-22)
VITE_SUPABASE_URL=https://pexcvfhuvqrwrabpgkzi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleGN2Zmh1dnFyd3JhYnBna3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjY3NjksImV4cCI6MjA5NjE0Mjc2OX0.uezcNBATopjfxfq7TWUPZaeXOtMZnlmMnCCguOSSB3E

# NEW test keys from Stripe Dashboard (paste from Step 1)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_PASTE_NEW_KEY_HERE
STRIPE_SECRET_KEY=sk_test_PASTE_NEW_KEY_HERE
VITE_STRIPE_WEBHOOK_SECRET=whsec_PASTE_NEW_KEY_HERE
```

Replace the three `PASTE_NEW_KEY_HERE` placeholders with the actual new values from Stripe Dashboard.

### Step 3: Update Supabase Edge Function env vars (5 min)

The Stripe webhook runs in Supabase Edge Functions, which has its own env config.

1. Open **https://app.supabase.com/project/pexcvfhuvqrwrabpgkzi/settings/functions**
2. Update secrets:
   - `STRIPE_SECRET_KEY` = new `sk_test_...`
   - `STRIPE_WEBHOOK_SECRET` = new `whsec_...`
3. Save

### Step 4: Verify with CI guard (1 min)

Open a terminal in the project root and run:

```bash
bash scripts/verify-no-live-secrets.sh
```

**Expected output:**
```
🔍 Scanning for live Stripe keys...
✅ No live secrets detected. Safe to build.
```

If it still says `❌ BUILD BLOCKED`, you missed updating `.env.local` or Supabase env.

### Step 5: Test that everything still works (5 min)

```bash
# Start dev server
cd app && npm run dev

# In browser, test signup → login → dashboard
# Open browser DevTools → Network tab → look for Stripe API calls
# Confirm they're going to api.stripe.com (not charging real cards)
```

Test card to use: `4242 4242 4242 4242` (any future expiry, any CVC).

---

## 📋 Checklist (mark as you go)

- [ ] Stripe Dashboard: Switched to Test mode
- [ ] Stripe Dashboard: Rolled publishable key
- [ ] Stripe Dashboard: Rolled secret key
- [ ] Stripe Dashboard: Rolled webhook secret
- [ ] Saved new keys in password manager (NOT in this file)
- [ ] Updated `app/.env.local` with new test keys
- [ ] Updated Supabase Edge Function env vars
- [ ] Ran `bash scripts/verify-no-live-secrets.sh` → got ✅
- [ ] Tested signup flow with `4242 4242 4242 4242` test card
- [ ] Documented rotation in `docs/INCIDENT_LOG.md`

---

## 🚨 If You Suspect Keys Were Compromised

If you ever believe the live keys were leaked (e.g., accidentally committed, sent in Slack, etc.):

1. **Immediately** roll the live keys in Stripe Dashboard (LIVE mode this time)
2. Review Stripe Dashboard → Events for any suspicious charges
3. Contact Stripe Support if unauthorized transactions occurred
4. Update `.env.local` with the new live keys (only after rotation is complete)

---

## ❓ Questions

- **Q: Why not just delete the live keys from `.env.local`?**
  A: Deleting without rotating leaves the merchant account vulnerable if the same key was leaked elsewhere. Always rotate first, then update files.

- **Q: What's the difference between test mode and live mode?**
  A: Test mode uses Stripe's test API (`sk_test_*` / `pk_test_*`) — charges go through but no real money moves. Live mode (`sk_live_*` / `pk_live_*`) charges real cards.

- **Q: Can I just use the same `sk_test_*` key for both frontend and backend?**
  A: No. The publishable key (`pk_test_*`) is safe to expose in frontend code. The secret key (`sk_test_*`) must only be used server-side (in Edge Functions, never in browser code).

---

**After completing all steps, reply to the team: "Stripe keys rotated ✅" so we can move to Phase 1.**
