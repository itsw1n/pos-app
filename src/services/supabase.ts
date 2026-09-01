import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (typeof window !== 'undefined') {
  // Diagnostic: log actual URL being used so web/phone can verify tunnel vs hosted vs LAN
  // eslint-disable-next-line no-console
  console.log(
    '[supabase] URL:',
    supabaseUrl || '(empty)',
    'host:',
    (() => {
      try {
        return new URL(supabaseUrl).host;
      } catch {
        return '(invalid)';
      }
    })(),
  );
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'http://localhost:54321',
  isSupabaseConfigured ? supabaseAnonKey : 'missing-anon-key',
);
