import NetInfo from '@react-native-community/netinfo';
import { adjustStock } from '../api/inventoryApi';
import { processSale, transactionExists } from '../api/transactionApi';
import {
  getTransactionItemsLocal,
  getUnsyncedRecords,
  markSynced,
} from './sqlite';

export interface UnsyncedTransaction {
  id: string;
  total_amount: number;
  payment_mode: string;
  user_id: string;
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

export interface SyncResult {
  synced: number;
  failed: number;
  lastError?: string;
}

async function isOnline(): Promise<boolean> {
  const { isConnected } = await NetInfo.fetch();
  return isConnected === true;
}

export async function syncPendingRecords(): Promise<SyncResult> {
  if (!(await isOnline())) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  let lastError: string | undefined;

  const transactions =
    await getUnsyncedRecords<UnsyncedTransaction>('transactions');
  for (const record of transactions) {
    try {
      if (await transactionExists(record.id)) {
        await markSynced('transactions', record.id);
        synced++;
        continue;
      }
      await processSale({
        transactionId: record.id,
        paymentMode: record.payment_mode as 'cash' | 'gcash' | 'maya',
        amountReceived: record.amount_received,
        changeGiven: record.change_given,
        items: (await getTransactionItemsLocal(record.id)).map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        date: record.date,
      });
      await markSynced('transactions', record.id);
      synced++;
    } catch (e) {
      failed++;
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  const movements =
    await getUnsyncedRecords<UnsyncedStockMovement>('stock_movements');
  for (const movement of movements) {
    try {
      await adjustStock(
        movement.stock_id,
        movement.quantity,
        movement.supplier ?? null,
      );
      await markSynced('stock_movements', movement.movement_id);
      synced++;
    } catch (e) {
      failed++;
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  return { synced, failed, lastError };
}
