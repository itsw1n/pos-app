import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';
import { supabase } from './supabase';
import { getUnsyncedRecords, markSynced } from './sqlite';

export interface UnsyncedTransaction {
  id: string;
  total_amount: number;
  payment_mode: string;
  user_id: number;
  date: string;
  synced: number;
}

export function generateSyncId(): string {
  return uuid.v4();
}

export async function syncPendingRecords(): Promise<void> {
  const { isConnected } = await NetInfo.fetch();
  if (!isConnected) return;

  const unsynced = await getUnsyncedRecords<UnsyncedTransaction>('transactions');
  for (const record of unsynced) {
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', record.id)
      .maybeSingle();

    if (existing) {
      await markSynced('transactions', record.id);
      continue;
    }

    const { synced, ...payload } = record;
    const { error } = await supabase.from('transactions').insert(payload);
    if (!error) {
      await markSynced('transactions', record.id);
    }
  }
}
