import express from 'express';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import subscriptionsRouter from './routes/subscriptions.js';
import { authGuard } from './middleware/authGuard.js';
import { errorHandler } from './middleware/errorHandler.js';
import { otpCache, OTP_TTL_MS } from './middleware/otpCache.js';
import './sentry.js';

dotenv.config();
// Basic rate limiting to protect push endpoint from abuse
const rateLimit = require('express-rate-limit');
// Optional Sentry init (server/sentry.js will noop if @sentry/node not installed)
try { require('./sentry'); } catch (e) { /* ignore */ }

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const PUSH_SERVER_API_KEY = process.env.PUSH_SERVER_API_KEY; // REQUIRED for /send-push
const PORT = process.env.PORT || 8787;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error('Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY in environment');
  process.exit(1);
}

if (!PUSH_SERVER_API_KEY) {
  console.error('Missing PUSH_SERVER_API_KEY in environment — requests to /send-push will be rejected');
  // Do not exit; allow operator to decide. But warn loudly.
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

webpush.setVapidDetails('mailto:admin@dailystack.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const app = express();
app.use(express.json());
// Request logger
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger }));

// Security middlewares
app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use('/api', authGuard, subscriptionsRouter);

// Apply a conservative rate limit to the push endpoint to reduce abuse impact
const pushLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP protections:
//  - per-IP quick limiter to slow down bursts
//  - per-email limiter to prevent repeated OTP sends to the same address
const otpIpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

const otpEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each email to 5 requests per hour
  keyGenerator: (req /*, res*/) => {
    try {
      const email = (req.body && req.body.email) ? String(req.body.email).trim().toLowerCase() : '';
      return email || req.ip;
    } catch (e) {
      return req.ip;
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /send-push
// body: { userId?: string, subscription?: PushSubscription, payload?: { title, body, data } }
app.post('/send-push', pushLimiter, async (req, res) => {
  try {
    const { userId, subscription, payload } = req.body;
    let sub = subscription;

    // Require an API key to use this endpoint.
    const incomingKey = req.get('x-api-key') || req.get('X-API-KEY') || '';
    if (!PUSH_SERVER_API_KEY || incomingKey !== PUSH_SERVER_API_KEY) {
      return res.status(401).json({ error: 'unauthorized' });
    }

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

    // Basic validation of provided subscription to avoid invalid sends
    if (!sub || typeof sub !== 'object' || !sub.endpoint || typeof sub.endpoint !== 'string') {
      return res.status(400).json({ error: 'missing_subscription' });
    }

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

// POST /send-otp
// Body: { email: string, options?: object }
// This endpoint proxies OTP requests to Supabase while applying server-side rate limits.
app.post('/send-otp', otpIpLimiter, otpEmailLimiter, async (req, res) => {
  try {
    const { email, options } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'missing_email' });
    }

    // Normalize email
    const normalized = email.trim().toLowerCase();

    // Server‑side OTP throttling & expiration check
    const cached = otpCache.get(normalized);
    if (cached) {
      const age = Date.now() - cached;
      if (age < OTP_TTL_MS) {
        const remaining = Math.ceil((OTP_TTL_MS - age) / 1000);
        return res.status(429).json({ error: 'otp_throttled', remaining });
      }
    }

    // Use Supabase client (service role key) to trigger OTP send
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email: normalized, options: options || {} });
      if (error) {
        console.error('[send-otp] Supabase error:', error);
        return res.status(500).json({ error: 'supabase_error', details: error.message || String(error) });
      }
      // Record timestamp for throttling
      otpCache.set(normalized, Date.now());
      // Do NOT return raw SDK responses that may include sensitive info — return a minimal indicator
      return res.json({ ok: true });
    } catch (err) {
      console.error('[send-otp] Unexpected error calling supabase:', err);
      return res.status(500).json({ error: 'otp_send_failed' });
    }
  } catch (err) {
    console.error('send-otp handler error:', err);
    return res.status(500).json({ error: 'internal' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/healthz', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler (must be after all routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Push server listening on ${PORT}`);
});
