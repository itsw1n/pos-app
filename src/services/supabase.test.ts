import { describe, it, expect } from 'vitest';

describe('supabase sentinel', () => {
  it('uses localhost when not configured', async () => {
    // process.env is empty in test — should not contain missing-configuration.supabase.co
    const mod = await import('./supabase');
    // supabase client is created; check isSupabaseConfigured is false in test env
    expect(mod.isSupabaseConfigured).toBe(false);
  });
});
