import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { onAuthStateChange } from '@/api/authApi';
import { refreshLocalCache } from '@/services/catalogSync';
import { getPendingSyncCount, initDb } from '@/services/sqlite';
import { syncPendingRecords, SyncResult } from '@/services/syncService';

export interface OfflineSyncStatus {
  state: 'idle' | 'syncing' | 'success' | 'error';
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

const INITIAL_STATUS: OfflineSyncStatus = {
  state: 'idle',
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
};

let syncing = false;
let lastStatus = INITIAL_STATUS;
const DEBOUNCE_MS = 1500;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let backoffMs = 0;

async function initAndSync(): Promise<SyncResult | null> {
  if (syncing) return null;
  if (backoffMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, backoffMs));
  }
  syncing = true;
  try {
    const state = await NetInfo.fetch();
    if (state.isConnected !== true) return null;
    await initDb();
    await refreshLocalCache();
    const result = await syncPendingRecords();
    backoffMs =
      result.failed > 0 ? Math.min((backoffMs || 1000) * 2, 30000) : 0;
    return result;
  } catch (error) {
    backoffMs = Math.min((backoffMs || 1000) * 2, 30000);
    return {
      synced: 0,
      failed: 1,
      lastError: error instanceof Error ? error.message : String(error),
    };
  } finally {
    syncing = false;
  }
}

async function statusFromResult(
  result: SyncResult | null,
): Promise<OfflineSyncStatus> {
  let pendingCount = lastStatus.pendingCount;
  try {
    pendingCount = await getPendingSyncCount();
  } catch {
    // The database may not be initialized on a brand-new device yet.
  }

  if (result === null) {
    return { ...lastStatus, state: 'idle', pendingCount };
  }
  if (result.failed > 0) {
    return {
      ...lastStatus,
      state: 'error',
      pendingCount,
      lastError: result.lastError ?? 'Some records could not be synchronized',
    };
  }
  return {
    state: 'success',
    pendingCount,
    lastSyncedAt: new Date().toISOString(),
    lastError: null,
  };
}

export function useOfflineSync(): OfflineSyncStatus {
  const [status, setStatus] = useState<OfflineSyncStatus>(lastStatus);

  useEffect(() => {
    let active = true;

    const run = async (): Promise<void> => {
      if (active) {
        setStatus((current) => ({ ...current, state: 'syncing' }));
      }
      const nextStatus = await statusFromResult(await initAndSync());
      lastStatus = nextStatus;
      if (active) setStatus(nextStatus);
    };

    void run();
    const unsubscribeNetInfo = NetInfo.addEventListener(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void run();
      }, DEBOUNCE_MS);
    });
    const { data: subscription } = onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') void run();
    });

    return () => {
      active = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      unsubscribeNetInfo();
      subscription.subscription.unsubscribe();
    };
  }, []);

  return status;
}

export function getLastSyncStatus(): OfflineSyncStatus {
  return lastStatus;
}
