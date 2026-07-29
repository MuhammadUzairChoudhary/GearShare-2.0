// Environment configuration using Zod v4
// Zod v4 safeParse returns { data, error } where error is a ZodError instance
import { z } from 'zod/v3';

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).default('placeholder-key'),
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']).default('development'),
  EXPO_PUBLIC_USE_MOCK_DATA: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
});

function getEnv() {
  const parsed = envSchema.safeParse({
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    EXPO_PUBLIC_USE_MOCK_DATA: process.env.EXPO_PUBLIC_USE_MOCK_DATA,
  });

  if (parsed.error) {
    if (process.env.NODE_ENV === 'test') {
      return {
        supabaseUrl: 'https://placeholder.supabase.co',
        supabasePublishableKey: 'placeholder-key',
        appEnv: 'development' as const,
        useMockData: true,
      };
    }
    console.warn(
      '[GearShare] Environment validation failed. Using defaults.',
      parsed.error.message,
    );
  }

  const data = parsed.data ?? envSchema.parse({});
  return {
    supabaseUrl: data.EXPO_PUBLIC_SUPABASE_URL,
    supabasePublishableKey: data.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    appEnv: data.EXPO_PUBLIC_APP_ENV,
    useMockData: data.EXPO_PUBLIC_USE_MOCK_DATA,
  };
}

export const env = getEnv();

export function isMockDataEnabled(): boolean {
  return env.useMockData;
}

export function isDevelopment(): boolean {
  return env.appEnv === 'development';
}

export function isProduction(): boolean {
  return env.appEnv === 'production';
}
