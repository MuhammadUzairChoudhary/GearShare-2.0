import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../../services/supabase/client';
import { isMockDataEnabled } from '../../constants/env';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

type AuthCallback = (state: AuthState) => void;

let authListeners: AuthCallback[] = [];
let currentState: AuthState = { user: null, session: null, isLoading: true };

function notifyListeners() {
  authListeners.forEach((cb) => cb(currentState));
}

export function onAuthStateChanged(callback: AuthCallback): () => void {
  authListeners.push(callback);
  callback(currentState);
  return () => {
    authListeners = authListeners.filter((cb) => cb !== callback);
  };
}

export function getCurrentAuthState(): AuthState {
  return currentState;
}

export async function initializeAuth(): Promise<AuthState> {
  if (isMockDataEnabled()) {
    currentState = { user: null, session: null, isLoading: false };
    notifyListeners();
    return currentState;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[Auth] Session restore failed:', error.message);
    }

    currentState = {
      user: data?.session?.user ?? null,
      session: data?.session ?? null,
      isLoading: false,
    };

    supabase.auth.onAuthStateChange((_event, session) => {
      currentState = {
        user: session?.user ?? null,
        session,
        isLoading: false,
      };
      notifyListeners();
    });
  } catch (error) {
    console.error('[Auth] Initialization error:', error);
    currentState = { user: null, session: null, isLoading: false };
  }

  notifyListeners();
  return currentState;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  if (isMockDataEnabled()) {
    return { error: 'Mock mode active. No real authentication available.' };
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<{ error?: string }> {
  if (isMockDataEnabled()) {
    return { error: 'Mock mode active. No real authentication available.' };
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

export async function signOut(): Promise<{ error?: string }> {
  if (isMockDataEnabled()) {
    currentState = { user: null, session: null, isLoading: false };
    notifyListeners();
    return {};
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}
