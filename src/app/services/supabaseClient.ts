import { createClient } from '@supabase/supabase-js';


/* eslint-disable @typescript-eslint/no-explicit-any */
// Use direct `import.meta.env` property access so Vite can statically replace these
// values at dev/build time. Fall back to `process.env` for Node/test contexts.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? (import.meta.env.SUPABASE_URL as any))
  || ((globalThis as any)?.process?.env?.VITE_SUPABASE_URL ?? (globalThis as any)?.process?.env?.SUPABASE_URL) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? (import.meta.env.SUPABASE_ANON_KEY as any))
  || ((globalThis as any)?.process?.env?.VITE_SUPABASE_ANON_KEY ?? (globalThis as any)?.process?.env?.SUPABASE_ANON_KEY) || '';

// If environment variables are missing, log warnings instead of crashing the app during development.
const isProd = (() => {
  try {
    // Prefer Vite mode when available
    const im = (import.meta as any)?.env;
    if (im && im.MODE) return im.MODE === 'production';
  } catch {
    // ignore
  }
  try {
    // Fallback to NODE_ENV
    const pe = (globalThis as any)?.process?.env;
    if (pe && pe.NODE_ENV) return pe.NODE_ENV === 'production';
  } catch {
    // ignore
  }
  return false;
})();
/* eslint-enable @typescript-eslint/no-explicit-any */

if (!supabaseUrl || !supabaseAnonKey) {
  if (isProd) {
    throw new Error('Missing Supabase environment variables in production environment');
  }

  // In dev/test we warn — this prevents Playwright/Node runs from crashing when envs
  // are intentionally provided via dotenv/process.env instead of Vite's import.meta.env.
  console.error('⚠️ [CRITICAL ERROR]: Missing Supabase env vars (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or SUPABASE_URL/SUPABASE_ANON_KEY)');
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