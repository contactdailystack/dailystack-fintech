// Optional Sentry init for server
try {
  const Sentry = require('@sentry/node');
  const dsn = process.env.SENTRY_DSN;
  if (dsn) {
    Sentry.init({ dsn });
    console.info('[Sentry] server initialized');
  }
} catch (err) {
  // Sentry not installed — ignore
}
