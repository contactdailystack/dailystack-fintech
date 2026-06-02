const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails('mailto:admin@dailystack.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch (e) {
    console.error('Failed to set VAPID details:', e);
  }
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  try {
    const { userId, subscription, payload } = req.body || {};
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
      return res.status(500).json({ error: 'push_send_failed', details: String(err) });
    }
  } catch (err) {
    console.error('send-push handler error:', err);
    return res.status(500).json({ error: 'internal' });
  }
};
