import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';
import {
  getTransactionItemsLocal,
  getUnsyncedRecords,
  markSynced,
} from './sqlite';

export interface UnsyncedTransaction {
  id: string;
  total_amount: number;
  payment_mode: string;
  user_id: number;
  date: string;
  synced: number;
  amount_received: number | null;
  change_given: number | null;
}

export interface UnsyncedStockMovement {
  movement_id: number;
  stock_id: number;
  type: string;
  quantity: number;
  date: string;
  supplier?: string | null;
  synced: number;
}

async function isOnline(): Promise<boolean> {
  const { isConnected } = await NetInfo.fetch();
  return isConnected === true;
}

export async function syncPendingRecords(): Promise<void> {
  if (!(await isOnline())) return;

  const transactions =
    await getUnsyncedRecords<UnsyncedTransaction>('transactions');
  for (const record of transactions) {
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', record.id)
      .maybeSingle();

    if (existing) {
      await markSynced('transactions', record.id);
      continue;
    }

    const items = await getTransactionItemsLocal(record.id);
    const { error } = await supabase.rpc('process_sale', {
      p_transaction_id: record.id,
      p_payment_mode: record.payment_mode,
      p_amount_received: record.amount_received,
      p_change_given: record.change_given,
      p_items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      p_date: record.date,
    });
    if (!error) {
      await markSynced('transactions', record.id);
    }
  }

  const movements =
    await getUnsyncedRecords<UnsyncedStockMovement>('stock_movements');
  for (const movement of movements) {
    const { error } = await supabase.rpc('adjust_stock', {
      p_stock_id: movement.stock_id,
      p_quantity: movement.quantity,
      p_supplier: movement.supplier ?? null,
    });
    if (!error) {
      await markSynced('stock_movements', movement.movement_id);
    }
  }
}
