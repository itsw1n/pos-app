import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setUserActive } from './userApi';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock('../services/supabase', () => ({
  supabase: { functions: { invoke } },
}));

describe('setUserActive', () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it('uses the protected account-status edge function', async () => {
    invoke.mockResolvedValue({ data: {}, error: null });

    await setUserActive('user-1', false);

    expect(invoke).toHaveBeenCalledWith('set-user-active', {
      body: { user_id: 'user-1', is_active: false },
    });
  });

  it('surfaces the edge function error message', async () => {
    const error = Object.assign(new Error('Function returned an error'), {
      context: new Response(JSON.stringify({ error: 'Cannot disable user' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    });
    invoke.mockResolvedValue({ data: null, error });

    await expect(setUserActive('user-1', false)).rejects.toThrow(
      'Cannot disable user',
    );
  });
});
