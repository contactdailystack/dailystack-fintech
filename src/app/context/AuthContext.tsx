import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: Session['user'] | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Retrieval
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error('[AuthContext] Failed to get session on mount:', err);
      setLoading(false);
    });

    // 2. Real-time Subscription to Session State Transitions
    let unsubscribeFn = () => {};
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoading(false);
      });
      if (data && data.subscription) {
        unsubscribeFn = () => data.subscription.unsubscribe();
      }
    } catch (err) {
      console.warn('[AuthContext] onAuthStateChange failed, falling back safely:', err);
      Promise.resolve().then(() => {
        setLoading(false); // Make sure to stop loading state even if subscription fails safely
      });
    }

    return () => {
      unsubscribeFn();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Error during signout:', err);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
