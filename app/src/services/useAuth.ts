/**
 * useAuth.ts — Global auth state hook
 * Call useAuth() anywhere in the app to get current user + tier + loading state.
 */
import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { signIn, signUp, signOut, onAuthStateChange, getCurrentUser } from './authService';
import { getOrInitFBIS, type FBISMetaRecord } from './fbisService';
import { getUserProfile, type UserRecord, type SubscriptionTier } from './userTierService';

// ─── Shared auth context ─────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  profile: UserRecord | null;
  tier: SubscriptionTier;
  fbis: FBISMetaRecord | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFBIS: () => Promise<void>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

let globalSetState: ((state: Partial<AuthState>) => void) | null = null;

// Centralized listener registration — runs once at app startup
const initializeAuthListener = (setState: (partial: Partial<AuthState>) => void) => {
  globalSetState = setState;

  const unsubscribe = onAuthStateChange(async (user) => {
    if (!user) {
      setState({ user: null, profile: null, tier: 'basic', fbis: null, loading: false, error: null });
      return;
    }

    // User signed in — fetch profile and FBIS in parallel
    setState({ user, loading: true, error: null });

    const [profile, fbis] = await Promise.all([
      getUserProfile(),
      getOrInitFBIS(),
    ]);

    setState({
      user,
      profile,
      tier: (profile?.subscription_tier as SubscriptionTier) || 'basic',
      fbis,
      loading: false,
      error: null,
    });
  });

  return unsubscribe;
};

export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    tier: 'basic',
    fbis: null,
    loading: true,
    error: null,
  });

  // Wire up the Supabase auth listener on mount
  useEffect(() => {
    const unsubscribe = initializeAuthListener((partial) => {
      setState(prev => ({ ...prev, ...partial }));
    });

    // Profile + FBIS are fetched inside initializeAuthListener when user is known

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
    setState(prev => ({ ...prev, loading: true }));
    await signOut();
    setState({ user: null, profile: null, tier: 'basic', fbis: null, loading: false, error: null });
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await getUserProfile();
    setState(prev => ({
      ...prev,
      profile,
      tier: (profile?.subscription_tier as SubscriptionTier) || prev.tier,
    }));
  }, []);

  const refreshFBIS = useCallback(async () => {
    const fbis = await getOrInitFBIS();
    setState(prev => ({ ...prev, fbis }));
  }, []);

  return { ...state, login, register, logout, refreshProfile, refreshFBIS };
};
