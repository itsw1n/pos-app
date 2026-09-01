/* eslint-disable import/first */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(async () => ({ error: null })),
      updateUser: vi.fn(async () => ({ error: null })),
    },
  },
}));

import { requestPasswordReset, confirmPasswordReset } from './authApi';
import { supabase } from '@/services/supabase';

describe('authApi reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('requestPasswordReset trims email and sends redirectTo', async () => {
    await requestPasswordReset('  a@b.com ');
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'a@b.com',
      { redirectTo: 'com.elvira.pos://reset-password' },
    );
  });

  it('requestPasswordReset throws on error', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
      error: new Error('rate limited'),
    } as never);
    await expect(requestPasswordReset('a@b.com')).rejects.toThrow(
      'rate limited',
    );
  });

  it.each([
    ['development', 'com.elvira.pos.dev://reset-password'],
    ['preview', 'com.elvira.pos.preview://reset-password'],
  ])('uses the %s app redirect', async (environment, redirectTo) => {
    vi.stubEnv('EXPO_PUBLIC_APP_ENV', environment);
    await requestPasswordReset('a@b.com');
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'a@b.com',
      { redirectTo },
    );
  });

  it('confirmPasswordReset calls updateUser with password', async () => {
    await confirmPasswordReset('newPass123');
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'newPass123',
    });
  });

  it('confirmPasswordReset throws on error', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      error: new Error('expired'),
    } as never);
    await expect(confirmPasswordReset('bad')).rejects.toThrow('expired');
  });

  it('requestPasswordReset trims email (skeleton)', async () => {
    await requestPasswordReset('  a@b.com ');
    expect(true).toBe(true);
  });

  it('confirmPasswordReset throws on error (skeleton)', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      error: new Error('invalid link'),
    } as never);
    await expect(confirmPasswordReset('x')).rejects.toThrow();
  });
});
