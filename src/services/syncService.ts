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

async function isOnline(): Promise<boolean> {
  const { isConnected } = await NetInfo.fetch();
  return isConnected === true;
}

export async function syncPendingRecords(): Promise<void> {
  if (!(await isOnline())) return;

  const transactions =
    await getUnsyncedRecords<UnsyncedTransaction>('transactions');
  for (const record of transactions) {
    try {
      if (await transactionExists(record.id)) {
        await markSynced('transactions', record.id);
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
    } catch {
      // Remote insert failed or is unreachable; retry next sync.
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
    } catch {
      // Remote adjustment failed; retry next sync.
    }
  }
}
