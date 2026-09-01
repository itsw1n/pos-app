import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/services/supabase';
import { refreshLocalCache } from '@/services/catalogSync';
import { initDb } from '@/services/sqlite';
import { syncPendingRecords, SyncResult } from '@/services/syncService';

let syncing = false;
let lastResult: SyncResult | null = null;
const DEBOUNCE_MS = 1500;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let backoffMs = 0;

async function initAndSync(): Promise<SyncResult | null> {
  if (syncing) return null;
  if (backoffMs > 0) await new Promise((r) => setTimeout(r, backoffMs));
  syncing = true;
  try {
    const state = await NetInfo.fetch();
    if (state.isConnected !== true) return null;
    await initDb();
    await refreshLocalCache();
    const res = await syncPendingRecords();
    lastResult = res;
    backoffMs = res.failed > 0 ? Math.min((backoffMs || 1000) * 2, 30000) : 0;
    return res;
  } catch (e) {
    lastResult = {
      synced: 0,
      failed: 1,
      lastError: e instanceof Error ? e.message : String(e),
    };
    backoffMs = Math.min((backoffMs || 1000) * 2, 30000);
    return lastResult;
  } finally {
    syncing = false;
  }
}

export function useOfflineSync(): { lastResult: SyncResult | null } {
  const [result, setResult] = useState<SyncResult | null>(lastResult);
  useEffect(() => {
    void initAndSync().then((r) => {
      if (r) setResult(r);
    });
    const unsubscribeNetInfo = NetInfo.addEventListener(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void initAndSync().then((r) => {
          if (r) setResult(r);
        });
      }, DEBOUNCE_MS);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN')
        void initAndSync().then((r) => {
          if (r) setResult(r);
        });
    });
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      unsubscribeNetInfo();
      subscription.subscription.unsubscribe();
    };
  }, []);
  return { lastResult: result };
}

export function getLastSyncResult(): SyncResult | null {
  return lastResult;
}
