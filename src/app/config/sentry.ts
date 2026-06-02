// Initialize Sentry if DSN provided. Optional; dynamically import to avoid hard dependency.
const dsn = (import.meta.env as any)?.VITE_SENTRY_DSN || (import.meta.env as any)?.SENTRY_DSN;
let Sentry: any = null;
if (dsn) {
  (async () => {
    try {
      // dynamic import — will be no-op if package missing
      // @ts-ignore
      const mod = await import('@sentry/react');
      Sentry = mod.default || mod;
      Sentry.init({ dsn });
      console.info('[Sentry] initialized');
    } catch (err) {
      console.warn('[Sentry] not available:', (err as any)?.message || String(err));
    }
  })();
}

export default Sentry;
