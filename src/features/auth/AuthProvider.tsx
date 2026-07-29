import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  initializeAuth,
  onAuthStateChanged,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from './authService';
import type { PendingAuthIntent } from '../../types/auth-intent';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  pendingAction: PendingAuthIntent | null;
  setPendingAction: (action: PendingAuthIntent | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAuthIntent | null>(null);

  useEffect(() => {
    initializeAuth().then((state) => {
      setUser(state.user);
      setSession(state.session);
      setIsLoading(false);
    });

    const unsubscribe = onAuthStateChanged((state) => {
      setUser(state.user);
      setSession(state.session);
      setIsLoading(state.isLoading);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: user !== null,
      signIn: signInWithEmail,
      signUp: signUpWithEmail,
      signOut,
      pendingAction,
      setPendingAction,
    }),
    [user, session, isLoading, pendingAction],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
