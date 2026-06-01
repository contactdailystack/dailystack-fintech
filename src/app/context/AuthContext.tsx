import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';

interface User {
  id: string;
  email?: string;
  user_metadata?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    AuthService.autoLogin().then((sessionUser) => {
      setUser(sessionUser ?? null);
      setIsLoading(false);
    });
  }, []);

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    const result = password ? await AuthService.signInWithEmail(email, password) : await AuthService.sendEmailOtp(email);
    if (result.user) setUser(result.user);
    setIsLoading(false);
    return result;
  };

  const signOut = async () => {
    setIsLoading(true);
    await AuthService.signOut();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
