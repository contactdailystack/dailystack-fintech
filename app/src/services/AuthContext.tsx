/**
 * AuthContext.ts — Global auth state via React Context
 * Single listener registration. All components consume from this context.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { signIn, signUp, signOut, onAuthStateChange, getCurrentUser } from './authService';
import { getUserProfile } from './userTierService';
import type { SubscriptionTier } from './userTierService';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  tier: SubscriptionTier;
  profileName: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tier: 'basic',
    profileName: null,
    loading: true,
    error: null,
  });

  // Load current user + register auth state listener on mount
  useEffect(() => {
    const init = async () => {
      // P1-02: Add timeout to prevent hanging on slow/offline Supabase
      const timeout = setTimeout(() => {
        setState(prev => {
          if (prev.loading) {
            console.warn('[AuthContext] getCurrentUser timed out after 15s — proceeding as guest');
            return { ...prev, user: null, loading: false, error: null };
          }
          return prev;
        });
      }, 15000);

      try {
        const user = await getCurrentUser();
        clearTimeout(timeout);

        if (!user) {
          setState({ user: null, tier: 'basic', profileName: null, loading: false, error: null });
          return;
        }

        // Perf Phase 1: render the authed tree immediately with defaults,
        // then enrich tier/profileName when the fetch lands (−1 RTT to TTI).
        setState({
          user,
          tier: 'basic',
          profileName: null,
          loading: false,
          error: null,
        });
        getUserProfile()
          .then(profile => {
            setState(prev => (prev.user?.id === user.id
              ? {
                  ...prev,
                  tier: (profile?.subscription_tier as SubscriptionTier) || 'basic',
                  profileName: profile?.display_name || null,
                }
              : prev));
          })
          .catch(() => { /* keep basic defaults */ });
      } catch {
        clearTimeout(timeout);
        setState(prev => ({ ...prev, user: null, loading: false, error: null }));
      }
    };

    init();

    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        setState({ user: null, tier: 'basic', profileName: null, loading: false, error: null });
        return;
      }

      // Same render-first pattern as init(): don't block the UI on profile fetch.
      setState(prev => ({ ...prev, user, tier: prev.user?.id === user.id ? prev.tier : 'basic', loading: false, error: null }));
      getUserProfile()
        .then(profile => {
          setState(prev => (prev.user?.id === user.id
            ? {
                ...prev,
                tier: (profile?.subscription_tier as SubscriptionTier) || 'basic',
                profileName: profile?.display_name || null,
              }
            : prev));
        })
        .catch(() => { /* keep current values */ });
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await signIn(email, password);
    if (!result.success) {
      setState(prev => ({ ...prev, loading: false, error: result.error || 'Login failed' }));
    }
    return { success: result.success, error: result.error };
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await signUp({ email, password, fullName });
    if (!result.success) {
      setState(prev => ({ ...prev, loading: false, error: result.error || 'Registration failed' }));
    }
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setState({ user: null, tier: 'basic', profileName: null, loading: false, error: null });
  }, []);

  // onAuthStateChange already registered in the first useEffect above
  // No duplicate registration needed

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
