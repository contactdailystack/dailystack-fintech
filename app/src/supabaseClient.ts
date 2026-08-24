import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[DailyStack] Missing Supabase env vars — copy .env.example to .env.local and fill in your credentials.'
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseOptions: any = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  supabaseOptions
);
