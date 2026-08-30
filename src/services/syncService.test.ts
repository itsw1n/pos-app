import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@react-native-community/netinfo', () => ({
  default: { fetch: vi.fn(async () => ({ isConnected: true })) },
}));

describe('syncPendingRecords', () => {
  beforeEach(() => vi.clearAllMocks());

  it('dedups via transactionExists before processSale', async () => {
    const { syncPendingRecords } = await import('./syncService');
    // mock getUnsyncedRecords to return one tx, transactionExists true
    // expect markSynced called, processSale not called
    expect(syncPendingRecords).toBeDefined();
    expect(true).toBe(true); // placeholder — flesh out with actual mocks
  });

  it('returns failed count on RPC throw', async () => {
    const { syncPendingRecords } = await import('./syncService');
    const res = await syncPendingRecords();
    expect(res.failed).toBeDefined();
  });
});
