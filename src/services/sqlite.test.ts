import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('sqlite schema', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('creates transactions.user_id as TEXT', async () => {
    const execCalls: string[] = [];
    const mockDb = {
      execAsync: vi.fn(async (sql: string) => {
        execCalls.push(sql);
      }),
      runAsync: vi.fn(async () => {}),
      getAllAsync: vi.fn(async () => []),
      getFirstAsync: vi.fn(async () => null),
      withTransactionAsync: vi.fn(async (fn: () => Promise<void>) => fn()),
    };
    vi.doMock('expo-sqlite', () => ({ openDatabaseAsync: async () => mockDb }));
    const { initDb } = await import('./sqlite');
    await initDb();
    const createSql = execCalls.join('\n');
    expect(createSql).toContain('user_id TEXT NOT NULL');
    expect(createSql).not.toContain('user_id INTEGER NOT NULL');
  });
});

describe('saveOfflineSale', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('saveOfflineSale writes transaction + items + decrements inventory atomically', async () => {
    const runCalls: string[] = [];
    const mockDb = {
      execAsync: vi.fn(async () => {}),
      runAsync: vi.fn(async (sql: string) => {
        runCalls.push(sql);
      }),
      getAllAsync: vi.fn(async () => []),
      getFirstAsync: vi.fn(async () => null),
      withTransactionAsync: vi.fn(async (fn: () => Promise<void>) => fn()),
    };
    vi.doMock('expo-sqlite', () => ({ openDatabaseAsync: async () => mockDb }));
    const { saveOfflineSale } = await import('./sqlite');
    await saveOfflineSale(
      {
        id: 'uuid-1',
        total_amount: 100,
        payment_mode: 'cash',
        amount_received: 100,
        change_given: 0,
        user_id: 'user-1',
        date: new Date().toISOString(),
      },
      [
        {
          id: 'item-1',
          transaction_id: 'uuid-1',
          product_id: 1,
          quantity: 2,
          subtotal: 100,
        },
      ],
    );
    expect(runCalls.join('\n')).toContain('INSERT INTO transactions');
    expect(runCalls.join('\n')).toContain('INSERT INTO transaction_items');
    expect(runCalls.join('\n')).toContain('UPDATE inventory');
  });

  it('withTransactionAsync rolls back on item insert failure', async () => {
    let callCount = 0;
    const runCalls: string[] = [];
    const mockDb = {
      execAsync: vi.fn(async () => {}),
      runAsync: vi.fn(async (sql: string) => {
        callCount += 1;
        runCalls.push(sql);
        if (callCount === 2) throw new Error('insert failed');
      }),
      getAllAsync: vi.fn(async () => []),
      getFirstAsync: vi.fn(async () => null),
      withTransactionAsync: vi.fn(async (fn: () => Promise<void>) => fn()),
    };
    vi.doMock('expo-sqlite', () => ({ openDatabaseAsync: async () => mockDb }));
    const { saveOfflineSale } = await import('./sqlite');
    await expect(
      saveOfflineSale(
        {
          id: 'uuid-2',
          total_amount: 200,
          payment_mode: 'cash',
          amount_received: 200,
          change_given: 0,
          user_id: 'user-1',
          date: new Date().toISOString(),
        },
        [
          {
            id: 'item-1',
            transaction_id: 'uuid-2',
            product_id: 1,
            quantity: 1,
            subtotal: 100,
          },
          {
            id: 'item-2',
            transaction_id: 'uuid-2',
            product_id: 2,
            quantity: 1,
            subtotal: 100,
          },
        ],
      ),
    ).rejects.toThrow('insert failed');
    expect(runCalls.join('\n')).not.toContain('UPDATE inventory');
  });
});

describe('getPendingSyncCount', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('adds unsynced transaction and stock movement counts', async () => {
    const mockDb = {
      execAsync: vi.fn(async () => {}),
      runAsync: vi.fn(async () => {}),
      getAllAsync: vi.fn(async () => []),
      getFirstAsync: vi
        .fn()
        .mockResolvedValueOnce({ count: 3 })
        .mockResolvedValueOnce({ count: 2 }),
      withTransactionAsync: vi.fn(async (fn: () => Promise<void>) => fn()),
    };
    vi.doMock('expo-sqlite', () => ({ openDatabaseAsync: async () => mockDb }));

    const { getPendingSyncCount } = await import('./sqlite');

    await expect(getPendingSyncCount()).resolves.toBe(5);
  });
});
