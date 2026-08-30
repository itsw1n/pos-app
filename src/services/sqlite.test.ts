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
    // re-import after mock
    const { initDb } = await import('./sqlite');
    await initDb();
    const createSql = execCalls.join('\n');
    expect(createSql).toContain('user_id TEXT NOT NULL');
    expect(createSql).not.toContain('user_id INTEGER NOT NULL');
  });
});
