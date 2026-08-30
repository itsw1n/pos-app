/* eslint-disable import/first */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./sqlite', () => ({
  getUnsyncedRecords: vi.fn(),
  getTransactionItemsLocal: vi.fn(),
  markSynced: vi.fn(),
}));

vi.mock('../api/transactionApi', () => ({
  transactionExists: vi.fn(),
  processSale: vi.fn(),
}));

vi.mock('../api/inventoryApi', () => ({
  adjustStock: vi.fn(),
}));

vi.mock('@react-native-community/netinfo', () => ({
  default: { fetch: vi.fn(async () => ({ isConnected: true })) },
}));

import {
  getUnsyncedRecords,
  getTransactionItemsLocal,
  markSynced,
} from './sqlite';
import { transactionExists, processSale } from '../api/transactionApi';
import { syncPendingRecords } from './syncService';

describe('syncPendingRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dedups via transactionExists before processSale', async () => {
    vi.mocked(getUnsyncedRecords)
      .mockResolvedValueOnce([
        {
          id: 'dup-1',
          total_amount: 100,
          payment_mode: 'cash',
          user_id: 'user-1',
          date: new Date().toISOString(),
          synced: 0,
          amount_received: 100,
          change_given: 0,
        } as unknown as never,
      ])
      .mockResolvedValueOnce([]);
    vi.mocked(transactionExists).mockResolvedValue(true);
    vi.mocked(getTransactionItemsLocal).mockResolvedValue([]);

    const result = await syncPendingRecords();

    expect(transactionExists).toHaveBeenCalledWith('dup-1');
    expect(processSale).not.toHaveBeenCalled();
    expect(markSynced).toHaveBeenCalledWith('transactions', 'dup-1');
    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);
  });

  it('calls processSale with correct amountReceived/changeGiven when not deduped', async () => {
    const dateIso = new Date().toISOString();
    vi.mocked(getUnsyncedRecords)
      .mockResolvedValueOnce([
        {
          id: 'new-1',
          total_amount: 150,
          payment_mode: 'gcash',
          user_id: 'user-2',
          date: dateIso,
          synced: 0,
          amount_received: 200,
          change_given: 50,
        } as unknown as never,
      ])
      .mockResolvedValueOnce([]);
    vi.mocked(transactionExists).mockResolvedValue(false);
    vi.mocked(getTransactionItemsLocal).mockResolvedValue([
      { product_id: 1, quantity: 2 },
      { product_id: 2, quantity: 1 },
    ]);
    vi.mocked(processSale).mockResolvedValue(undefined);
    vi.mocked(markSynced).mockResolvedValue(undefined);

    const result = await syncPendingRecords();

    expect(transactionExists).toHaveBeenCalledWith('new-1');
    expect(processSale).toHaveBeenCalledWith({
      transactionId: 'new-1',
      paymentMode: 'gcash',
      amountReceived: 200,
      changeGiven: 50,
      items: [
        { product_id: 1, quantity: 2 },
        { product_id: 2, quantity: 1 },
      ],
      date: dateIso,
    });
    expect(markSynced).toHaveBeenCalledWith('transactions', 'new-1');
    expect(result.synced).toBe(1);
    expect(result.failed).toBe(0);
  });

  it('returns failed count on RPC throw', async () => {
    vi.mocked(getUnsyncedRecords)
      .mockResolvedValueOnce([
        {
          id: 'fail-1',
          total_amount: 100,
          payment_mode: 'cash',
          user_id: 'user-1',
          date: new Date().toISOString(),
          synced: 0,
          amount_received: 100,
          change_given: 0,
        } as unknown as never,
      ])
      .mockResolvedValueOnce([]);
    vi.mocked(transactionExists).mockResolvedValue(false);
    vi.mocked(getTransactionItemsLocal).mockResolvedValue([
      { product_id: 1, quantity: 1 },
    ]);
    vi.mocked(processSale).mockRejectedValue(new Error('rpc failed'));

    const result = await syncPendingRecords();

    expect(result.failed).toBe(1);
    expect(result.synced).toBe(0);
    expect(result.lastError).toBe('rpc failed');
    expect(markSynced).not.toHaveBeenCalled();
  });
});
