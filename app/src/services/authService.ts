/**
 * authService.ts - Supabase Auth integration
 * All auth operations go through here. No direct supabase.auth calls outside this file.
 * Uses Supabase built-in email confirmation (no custom OTP required).
 */
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

// Types
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  needsEmailConfirmation?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

// Sign Up with Supabase built-in email confirmation
export const signUp = async ({ email, password, fullName }: SignUpData): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || '' },
        // Supabase will send confirmation email automatically
        // User must click confirmation link to activate account
      },
    });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Signup failed - no user returned.' };

    // If user needs to confirm email
    if (data.user && !data.session) {
      return {
        success: true,
        user: data.user,
        needsEmailConfirmation: true,
        error: 'Please check your email to confirm your account.',
      };
    }

    return { success: true, user: data.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during signup.';
    return { success: false, error: message };
  }
};

// Sign In
export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Login failed - no user returned.' };

    return { success: true, user: data.user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during sign in.';
    return { success: false, error: message };
  }
};

// Sign Out
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

// Get Current User
export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data) return null;
  return data.user;
};

// Auth State Listener
type AuthCallback = (user: User | null) => void;

export const onAuthStateChange = (callback: AuthCallback): (() => void) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => data.subscription.unsubscribe();
};

// Resend confirmation email (if user did not receive it)
export const resendConfirmationEmail = async (email: string): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error resending confirmation.';
    return { success: false, error: message };
  }
};