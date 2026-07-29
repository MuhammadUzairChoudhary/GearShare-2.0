import { useEffect, useState } from 'react';
import { onAuthStateChanged, type AuthState } from './authService';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(setAuthState);
    return unsubscribe;
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAuthenticated: authState.user !== null,
  };
}
