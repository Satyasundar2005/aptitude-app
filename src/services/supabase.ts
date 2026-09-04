import 'expo-sqlite/localStorage/install';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { safeStorage } from '../utils/safeStorage';

function cleanSupabaseUrl(url: string): string {
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = cleanSupabaseUrl(rawUrl);
const supabasePublishableKey = (
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  ''
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabasePublishableKey !== 'your-anon-key' &&
  supabasePublishableKey !== 'your-publishable-key' &&
  supabasePublishableKey !== 'PASTE_YOUR_SUPABASE_ANON_KEY_HERE'
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] Warning: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY are not configured.\n' +
      'Please set them in your .env or .env.local file to enable database and realtime multiplayer features.\n' +
      'AptiClash will fall back to local offline mode.'
  );
}

// Fallback dummy URL and key to prevent createClient from crashing if credentials are not yet added
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

// Use global localStorage installed by expo-sqlite, or safeStorage fallback
const storageEngine = typeof localStorage !== 'undefined' ? localStorage : safeStorage;

export const supabase = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabasePublishableKey : fallbackKey,
  {
    auth: {
      storage: storageEngine,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Instruct Supabase to auto-refresh auth tokens only when the app is active
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
