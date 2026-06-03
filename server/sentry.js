// Optional Sentry init for server
try {
  const Sentry = require('@sentry/node');
  const dsn = process.env.SENTRY_DSN;
  if (dsn) {
    Sentry.init({ dsn });
    console.info('[Sentry] server initialized');

    // Capture unhandled errors and rejections and ensure Sentry flushes before exit
    process.on('uncaughtException', (err) => {
      try {
        Sentry.captureException(err);
        Sentry.flush(2000).then(() => {
          console.error('Uncaught Exception, exiting:', err);
          process.exit(1);
        }).catch(() => process.exit(1));
      } catch (e) {
        console.error('Uncaught Exception (Sentry failed):', err);
        process.exit(1);
      }
    });

    process.on('unhandledRejection', (reason) => {
      try {
        Sentry.captureException(reason);
        Sentry.flush(2000).catch(() => {});
        console.error('Unhandled Rejection:', reason);
      } catch (e) {
        console.error('Unhandled Rejection (Sentry failed):', reason);
      }
    });
  }
} catch (err) {
  // Sentry not installed — ignore
}
