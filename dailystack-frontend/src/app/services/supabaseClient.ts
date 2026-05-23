import { createClient } from '@supabase/supabase-js';

// Helper to read environment variables from Vite's import.meta.env when available,
// and fall back to Node's process.env for test / Node contexts (Playwright, SSR, etc.).
function readEnv(key: string): string {
  try {
    // Try Vite's import.meta.env first (works in the browser via Vite).
    // Access via (import.meta as any) to avoid TS errors when compiled to Node.
    // Wrap in try/catch because import.meta may not be available in some runtimes.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const im = (import.meta as any)?.env;
    if (im && typeof im[key] !== 'undefined' && im[key] !== '') {
      return String(im[key]);
    }
  } catch (e) {
    // ignore — fallback to process.env below
  }

  // Node / Playwright runner environment
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pe = (globalThis as any)?.process?.env;
    if (pe) {
      if (pe[key]) return String(pe[key]);
      // Allow reading non-VITE variants: VITE_SUPABASE_URL -> SUPABASE_URL
      if (key.startsWith('VITE_')) {
        const alt = key.replace(/^VITE_/, '');
        if (pe[alt]) return String(pe[alt]);
      }
    }
  } catch (e) {
    // ignore
  }

  return '';
}

const supabaseUrl = readEnv('VITE_SUPABASE_URL') || readEnv('SUPABASE_URL');
const supabaseAnonKey = readEnv('VITE_SUPABASE_ANON_KEY') || readEnv('SUPABASE_ANON_KEY');

// If environment variables are missing, log warnings instead of crashing the app during development.
const isProd = (() => {
  try {
    // Prefer Vite mode when available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const im = (import.meta as any)?.env;
    if (im && im.MODE) return im.MODE === 'production';
  } catch (e) {
    // ignore
  }
  try {
    // Fallback to NODE_ENV
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pe = (globalThis as any)?.process?.env;
    if (pe && pe.NODE_ENV) return pe.NODE_ENV === 'production';
  } catch (e) {
    // ignore
  }
  return false;
})();

if (!supabaseUrl || !supabaseAnonKey) {
  if (isProd) {
    throw new Error('Missing Supabase environment variables in production environment');
  }

  // In dev/test we warn — this prevents Playwright/Node runs from crashing when envs
  // are intentionally provided via dotenv/process.env instead of Vite's import.meta.env.
  // eslint-disable-next-line no-console
  console.error('⚠️ [CRITICAL ERROR]: Missing Supabase env vars (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or SUPABASE_URL/SUPABASE_ANON_KEY)');
  // eslint-disable-next-line no-console
  console.warn('ℹ️ Fix: Provide Supabase credentials via a .env file or environment variables for tests.');
}

// Use placeholder values so the app can render even when env vars are absent.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Helper to expose the resolved credentials (useful for diagnostics in dev/test)
export function getSupabaseCredentials() {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    usingPlaceholder: !supabaseUrl || !supabaseAnonKey,
  };
}