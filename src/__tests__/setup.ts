import { vi } from 'vitest';

// expo-sqlite mock — in-memory via sql.js style stub will be replaced in Task 6
vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: vi.fn(async () => ({
    execAsync: vi.fn(async () => {}),
    runAsync: vi.fn(async () => {}),
    getAllAsync: vi.fn(async () => []),
    getFirstAsync: vi.fn(async () => null),
    withTransactionAsync: vi.fn(async (fn: () => Promise<void>) => fn()),
  })),
}));

vi.mock('@react-native-community/netinfo', () => ({
  default: {
    fetch: vi.fn(async () => ({ isConnected: true })),
    addEventListener: vi.fn(() => () => {}),
  },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  })),
}));
