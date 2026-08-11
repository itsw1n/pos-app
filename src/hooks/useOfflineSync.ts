import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/services/supabase';
import { refreshLocalCache } from '@/services/catalogSync';
import { initDb } from '@/services/sqlite';
import { syncPendingRecords } from '@/services/syncService';

let syncing = false;

async function initAndSync(): Promise<void> {
  if (syncing) {
    return;
  }
  syncing = true;
  try {
    const state = await NetInfo.fetch();
    if (state.isConnected !== true) {
      return;
    }
    await initDb();
    await refreshLocalCache();
    await syncPendingRecords();
  } catch {
    // Offline sync is best-effort; failures are surfaced next reconnect.
  } finally {
    syncing = false;
  }
}

export function useOfflineSync(): void {
  useEffect(() => {
    void initAndSync();

    const unsubscribeNetInfo = NetInfo.addEventListener(() => {
      void initAndSync();
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        void initAndSync();
      }
    });

    return () => {
      unsubscribeNetInfo();
      subscription.subscription.unsubscribe();
    };
  }, []);
}
