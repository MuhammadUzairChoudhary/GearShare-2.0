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

// ---------------------------------------------------------------------------
// Mock user & session used when mock-data mode is active
// ---------------------------------------------------------------------------
const mockUserId = 'user-1';
const mockUserEmail = 'alex@gmx.ch';

const mockUser: User = {
  id: mockUserId,
  aud: 'authenticated',
  role: 'authenticated',
  email: mockUserEmail,
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Alex Morgan' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_anonymous: false,
};

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
};

function setMockSignedIn() {
  currentState = { user: mockUser, session: mockSession, isLoading: false };
  notifyListeners();
}

function setMockSignedOut() {
  currentState = { user: null, session: null, isLoading: false };
  notifyListeners();
}

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
    setMockSignedIn();
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
  _email: string,
  _password: string,
): Promise<{ error?: string }> {
  if (isMockDataEnabled()) {
    setMockSignedIn();
    return {};
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email: _email, password: _password });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
  }
}

export async function signUpWithEmail(
  _email: string,
  _password: string,
  _fullName: string,
): Promise<{ error?: string }> {
  if (isMockDataEnabled()) {
    setMockSignedIn();
    return {};
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email: _email,
      password: _password,
      options: {
        data: { full_name: _fullName },
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
    setMockSignedOut();
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
