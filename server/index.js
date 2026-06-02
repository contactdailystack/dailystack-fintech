const express = require('express');
const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
// Optional Sentry init (server/sentry.js will noop if @sentry/node not installed)
try { require('./sentry'); } catch (e) { /* ignore */ }

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const PORT = process.env.PORT || 8787;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

webpush.setVapidDetails('mailto:admin@dailystack.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const app = express();
app.use(express.json());

// POST /send-push
// body: { userId?: string, subscription?: PushSubscription, payload?: { title, body, data } }
app.post('/send-push', async (req, res) => {
  try {
    const { userId, subscription, payload } = req.body;
    let sub = subscription;

    if (!sub && userId) {
      const { data, error } = await supabase
        .from('user_settings')
        .select('push_subscription')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Supabase error when fetching subscription:', error);
        return res.status(500).json({ error: 'failed_to_fetch_subscription' });
      }

      if (!data || !data.push_subscription) {
        return res.status(404).json({ error: 'no_subscription' });
      }

      sub = data.push_subscription;
    }

    if (!sub) return res.status(400).json({ error: 'missing_subscription' });

    const message = JSON.stringify(payload || { title: 'DailyStack', body: 'You have a new notification' });

    try {
      await webpush.sendNotification(sub, message);
      return res.json({ ok: true });
    } catch (err) {
      console.error('web-push send error:', err);
      return res.status(500).json({ error: 'push_send_failed', details: err?.toString?.() });
    }
  } catch (err) {
    console.error('send-push handler error:', err);
    return res.status(500).json({ error: 'internal' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Push server listening on ${PORT}`);
});
