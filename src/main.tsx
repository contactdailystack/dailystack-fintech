import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css' // Load theme styles first; other CSS imports are handled elsewhere
import App from './App.tsx'
// Init Sentry in prod when DSN available
if ((import.meta.env as any)?.VITE_SENTRY_DSN || (import.meta.env as any)?.SENTRY_DSN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    await import('./app/config/sentry');
  } catch {
    // ignore if Sentry package not installed
  }
}
// Dev-only diagnostics: log Supabase credentials and intercept fetch to show endpoints
if (import.meta.env && import.meta.env.MODE !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creds = (await import('./app/services/supabaseClient' as any)).getSupabaseCredentials?.();
    console.debug('[DEV DIAG] getSupabaseCredentials()', creds);
  } catch {
    // ignore if module not available at runtime
  }

  // Wrap global fetch to log outgoing network requests (dev only)
  try {
    const _origFetch = window.fetch;
    window.fetch = async function (this: typeof window, input: RequestInfo, init?: RequestInit) {
      try {
        console.debug('[DEV DIAG] fetch:', typeof input === 'string' ? input : input.url, init && init.headers ? init.headers : null);
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)