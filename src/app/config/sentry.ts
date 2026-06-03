// Initialize Sentry if DSN provided. Optional; dynamically import to avoid hard dependency.
const dsn = (import.meta.env as any)?.VITE_SENTRY_DSN || (import.meta.env as any)?.SENTRY_DSN;
let Sentry: any = null;
if (dsn) {
  (async () => {
    try {
      // dynamic import — will be no-op if package missing
      // @ts-ignore
      const mod = await import('@sentry/react');
      // @ts-ignore
      const tracing = await import('@sentry/tracing');
      Sentry = mod.default || mod;

      const release = (import.meta.env as any)?.VITE_SENTRY_RELEASE || (import.meta.env as any)?.SENTRY_RELEASE;
      const environment = (import.meta.env as any)?.MODE || (import.meta.env as any)?.NODE_ENV || 'production';
      const tracesSampleRate = Number((import.meta.env as any)?.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1);

      Sentry.init({
        dsn,
        release,
        environment,
        integrations: [new (tracing as any).BrowserTracing()],
        tracesSampleRate,
      });

      console.info('[Sentry] initialized (dsn present)');
    } catch (err) {
      console.warn('[Sentry] not available:', (err as any)?.message || String(err));
    }
  })();
}

export default Sentry;
