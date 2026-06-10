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


// ��� OTP Functions ��������������������

export interface OtpResult {
  success: boolean;
  error?: string;
  code?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Request a new OTP for email verification.
 * Returns success + expires_in seconds, or error message.
 */
export const requestOtp = async (userId: string, email: string): Promise<{ success: boolean; error?: string; expires_in?: number }> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId, email }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to send OTP' };
    }

    return { success: true, expires_in: json.expires_in };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error during OTP request';
    return { success: false, error: message };
  }
};

/**
 * Verify an OTP code.
 * Returns success or error with optional code for UI handling.
 */
export const verifyOtp = async (userId: string, otpCode: string): Promise<OtpResult> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId, otp_code: otpCode }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.error, code: json.code };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error during OTP verification';
    return { success: false, error: message };
  }
};
