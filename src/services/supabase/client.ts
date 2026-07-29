import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: false,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClient;
}
