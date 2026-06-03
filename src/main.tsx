import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css' // Load theme styles first; other CSS imports are handled elsewhere
import App from './App.tsx'
// Init Sentry in prod when DSN available
// Init Sentry in prod when DSN available and capture the exported Sentry object
let SentryLib: any = null;
if ((import.meta.env as any)?.VITE_SENTRY_DSN || (import.meta.env as any)?.SENTRY_DSN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    const mod = await import('./app/config/sentry');
    SentryLib = mod.default || mod;
  } catch {
    // ignore if Sentry package not installed
  }
}
// Dev diagnostics are disabled by default. To enable, set VITE_ENABLE_DEV_DIAG=true in your dev env.
if (import.meta.env && import.meta.env.MODE !== 'production' && (import.meta.env as any).VITE_ENABLE_DEV_DIAG === 'true') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creds = (await import('./app/services/supabaseClient' as any)).getSupabaseCredentials?.();
    // Avoid printing sensitive keys; only show whether placeholders are used.
    console.debug('[DEV DIAG] Supabase URL present:', !!creds?.url, 'Using placeholder:', !!creds?.usingPlaceholder);
  } catch {
    // ignore if module not available at runtime
  }

  // Wrap global fetch to log outgoing network requests (dev only, non-sensitive)
  try {
    const _origFetch = window.fetch;
    window.fetch = async function (this: typeof window, input: RequestInfo, init?: RequestInit) {
      try {
        console.debug('[DEV DIAG] fetch:', typeof input === 'string' ? input : (input as Request).url);
      } catch {
        // ignore logging errors
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (_origFetch as any).call(this, input, init);
    } as typeof window.fetch;
  } catch {
    // ignore
  }
}

const root = createRoot(document.getElementById('root')!);

if (SentryLib && SentryLib?.ErrorBoundary) {
  root.render(
    <StrictMode>
      {/* Wrap app in Sentry ErrorBoundary when Sentry available */}
      <SentryLib.ErrorBoundary fallback={<div>Something went wrong</div>}>
        <App />
      </SentryLib.ErrorBoundary>
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}