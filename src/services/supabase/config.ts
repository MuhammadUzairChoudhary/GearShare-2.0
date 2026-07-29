// Supabase configuration imports from the central environment module.
// This avoids duplicating environment variable parsing.
import { env } from '../../constants/env';

export const supabaseConfig = {
  url: env.supabaseUrl,
  publishableKey: env.supabasePublishableKey,
};
