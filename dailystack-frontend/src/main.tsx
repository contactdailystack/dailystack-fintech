import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css' // Load theme styles first; other CSS imports are handled elsewhere
import App from './App.tsx'
// Dev-only diagnostics: log Supabase credentials and intercept fetch to show endpoints
if (import.meta.env && import.meta.env.MODE !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creds = (await import('./app/services/supabaseClient' as any)).getSupabaseCredentials?.();
    // eslint-disable-next-line no-console
    console.debug('[DEV DIAG] getSupabaseCredentials()', creds);
  } catch (e) {
    // ignore if module not available at runtime
  }

  // Wrap global fetch to log outgoing network requests (dev only)
  try {
    const _origFetch = window.fetch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.fetch = async function (input: RequestInfo, init?: RequestInit) {
      try {
        // eslint-disable-next-line no-console
        console.debug('[DEV DIAG] fetch:', typeof input === 'string' ? input : input.url, init && init.headers ? init.headers : null);
      } catch (err) {
        // ignore logging errors
      }
      // @ts-ignore
      return _origFetch.apply(this, arguments);
    } as typeof window.fetch;
  } catch (e) {
    // ignore
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)