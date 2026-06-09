/**
 * authService.ts — Supabase Auth integration
 * All auth operations go through here. No direct supabase.auth calls outside this file.
 */
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

// ─── Sign Up ───────────────────────────────────────────────────────────────

export const signUp = async ({ email, password, fullName }: SignUpData): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || '' },
      },
    });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Signup failed — no user returned.' };

    return { success: true, user: data.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during signup.';
    return { success: false, error: message };
  }
};

// ─── Sign In ───────────────────────────────────────────────────────────────

export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Login failed — no user returned.' };

    return { success: true, user: data.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during sign in.';
    return { success: false, error: message };
  }
};

// ─── Sign Out ──────────────────────────────────────────────────────────────

export const signOut = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during sign out.';
    return { success: false, error: message };
  }
};

// ─── Get Current User ──────────────────────────────────────────────────────

export const getCurrentUser = async (): Promise<User | null> => {
  // Async - validates session with a lightweight network call
  const { data, error } = await supabase.auth.getUser();
  if (error || !data) return null;
  return data.user;
};

// ─── Auth State Listener ────────────────────────────────────────────────────

type AuthCallback = (user: User | null) => void;

export const onAuthStateChange = (callback: AuthCallback): (() => void) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  // Return cleanup function
  return () => data.subscription.unsubscribe();
};
