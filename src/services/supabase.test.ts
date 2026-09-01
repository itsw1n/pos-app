import { createClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock('react-native', () => ({
  AppState: { addEventListener: vi.fn() },
  Platform: { OS: 'android' },
}));

describe('supabase sentinel', () => {
  it('uses localhost when not configured', async () => {
    // process.env is empty in test — should not contain missing-configuration.supabase.co
    const mod = await import('./supabase');
    // supabase client is created; check isSupabaseConfigured is false in test env
    expect(mod.isSupabaseConfigured).toBe(false);
    expect(vi.mocked(createClient)).toHaveBeenCalledWith(
      'http://localhost:54321',
      'missing-anon-key',
      expect.objectContaining({
        auth: expect.objectContaining({
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        }),
      }),
    );
  });
});
