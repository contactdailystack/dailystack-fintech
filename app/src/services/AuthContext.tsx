/**
 * AuthContext.ts — Global auth state via React Context
 * Single listener registration. All components consume from this context.
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { signIn, signUp, signOut, onAuthStateChange, getCurrentUser } from './authService';
import { getOrInitFBIS } from './fbisService';
import { getUserProfile } from './userTierService';
import type { SubscriptionTier } from './userTierService';
import type { FBISMetaRecord } from './fbisService';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  tier: SubscriptionTier;
  fbis: FBISMetaRecord | null;
  profileName: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshFBIS: () => Promise<void>;
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
    fbis: null,
    profileName: null,
    loading: true,
    error: null,
  });

  const refreshFBIS = useCallback(async () => {
    const fbis = await getOrInitFBIS();
    setState(prev => ({ ...prev, fbis }));
  }, []);

  // Load current user + register auth state listener on mount
  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();

      if (!user) {
        setState({ user: null, tier: 'basic', fbis: null, profileName: null, loading: false, error: null });
        return;
      }

      const [profile, fbis] = await Promise.all([
        getUserProfile(),
        getOrInitFBIS(),
      ]);

      setState({
        user,
        tier: (profile?.subscription_tier as SubscriptionTier) || 'basic',
        fbis,
        profileName: profile?.display_name || null,
        loading: false,
        error: null,
      });
    };

    init();

    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        setState({ user: null, tier: 'basic', fbis: null, profileName: null, loading: false, error: null });
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const [profile, fbis] = await Promise.all([
        getUserProfile(),
        getOrInitFBIS(),
      ]);

      setState({
        user,
        tier: (profile?.subscription_tier as SubscriptionTier) || 'basic',
        fbis,
        profileName: profile?.display_name || null,
        loading: false,
        error: null,
      });
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
    setState({ user: null, tier: 'basic', fbis: null, profileName: null, loading: false, error: null });
  }, []);

  // onAuthStateChange already registered in the first useEffect above
  // No duplicate registration needed

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshFBIS }}>
      {children}
    </AuthContext.Provider>
  );
}
