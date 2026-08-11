import { useCallback, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/context/AuthContext';
import {
  getTransactionItems as fetchRemoteItems,
  getTransactionItemsByIds,
  getTransactionsList,
  TransactionRow,
  voidSale,
} from '@/api/transactionApi';
import { getProductIdNamePrice } from '@/api/productApi';
import { getUsersIdName } from '@/api/userApi';
import {
  getLocalProducts,
  getLocalTransactionItems,
  getLocalTransactions,
  getLocalUsers,
  LocalTransaction,
} from '@/services/sqlite';
import { PaymentMode } from '@/types/context';

export interface TransactionRecord {
  id: string;
  date: string;
  total_amount: number;
  payment_mode: PaymentMode;
  user_id: number;
  user_name: string;
  items_count: number;
  order_number?: number;
  status: 'completed' | 'voided';
  void_reason?: string | null;
  amount_received?: number | null;
  change_given?: number | null;
}

export interface TransactionItemRow {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface UseTransactionsResult {
  transactions: TransactionRecord[];
  isLoading: boolean;
  isVoiding: boolean;
  error: string;
  loadTransactions: () => Promise<void>;
  getTransactionItems: (transactionId: string) => Promise<TransactionItemRow[]>;
  voidTransaction: (transactionId: string, reason: string) => Promise<void>;
}

function toLocalRecord(
  transaction: LocalTransaction,
  itemsCount: number,
  userById: Map<string, string>,
): TransactionRecord {
  return {
    id: transaction.id,
    date: transaction.date,
    total_amount: transaction.total_amount,
    payment_mode: (transaction.payment_mode as PaymentMode) ?? 'cash',
    user_id: transaction.user_id,
    user_name: userById.get(String(transaction.user_id)) ?? 'Cashier',
    items_count: itemsCount,
    order_number: transaction.order_number ?? undefined,
    status: transaction.status === 'voided' ? 'voided' : 'completed',
    void_reason: transaction.void_reason ?? null,
    amount_received: transaction.amount_received ?? null,
    change_given: transaction.change_given ?? null,
  };
}

function countLocalItems(transactions: LocalTransaction[]): Promise<number[]> {
  return Promise.all(
    transactions.map(async (transaction) => {
      const items = await getLocalTransactionItems(transaction.id);
      return items.length;
    }),
  );
}

function mapRemoteRecord(
  row: TransactionRow,
  itemsCount: number,
  userById: Map<number, string>,
): TransactionRecord {
  return {
    id: row.id,
    date: row.date,
    total_amount: row.total_amount,
    payment_mode: row.payment_mode,
    user_id: row.user_id,
    user_name: userById.get(row.user_id) ?? 'Cashier',
    items_count: itemsCount,
    order_number: row.order_number ?? undefined,
    status: row.status === 'voided' ? 'voided' : 'completed',
    void_reason: row.void_reason ?? null,
    amount_received: row.amount_received ?? null,
    change_given: row.change_given ?? null,
  };
}

export function useOrders(): UseTransactionsResult {
  const { user, role } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [error, setError] = useState('');

  const loadTransactions = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    let servedFromCache = false;
    try {
      let userById = new Map<string, string>();
      try {
        const cachedUsers = await getLocalUsers();
        userById = new Map(
          cachedUsers.map((row) => [row.user_id, row.username]),
        );
      } catch {
        // No cached users; user_name falls back below.
      }
      const locals = await getLocalTransactions();
      if (locals.length > 0) {
        servedFromCache = true;
        const itemCounts = await countLocalItems(locals);
        setTransactions(
          locals.map((row, index) =>
            toLocalRecord(row, itemCounts[index] ?? 0, userById),
          ),
        );
      }
    } catch {
      // Cache read is best-effort; the remote call below is authoritative.
    }

    try {
      const rows = await getTransactionsList(role, user?.user_id);

      let itemsCount = new Map<string, number>();
      if (rows.length > 0) {
        try {
          const items = await getTransactionItemsByIds(
            rows.map((row) => row.id),
          );
          itemsCount = new Map<string, number>();
          for (const item of items) {
            itemsCount.set(
              item.transaction_id,
              (itemsCount.get(item.transaction_id) ?? 0) + 1,
            );
          }
        } catch {
          // Items count is secondary; the list still renders without it.
        }
      }

      const users = await getUsersIdName();
      const userById = new Map(
        (users ?? []).map((row) => [row.user_id, row.username]),
      );

      const merged = new Map<string, TransactionRecord>();
      for (const row of rows) {
        merged.set(
          row.id,
          mapRemoteRecord(row, itemsCount.get(row.id) ?? 0, userById),
        );
      }

      const locals = await getLocalTransactions();
      const unsynced = locals.filter((row) => row.synced === 0);
      if (unsynced.length > 0) {
        const itemCounts = await countLocalItems(unsynced);
        let localUserById = new Map<string, string>();
        try {
          const cachedUsers = await getLocalUsers();
          localUserById = new Map(
            cachedUsers.map((row) => [row.user_id, row.username]),
          );
        } catch {
          // Fall back to the default label.
        }
        unsynced.forEach((row, index) => {
          if (!merged.has(row.id)) {
            merged.set(
              row.id,
              toLocalRecord(row, itemCounts[index] ?? 0, localUserById),
            );
          }
        });
      }

      setTransactions(Array.from(merged.values()));
    } catch (err) {
      if (!servedFromCache) {
        setError(
          err instanceof Error ? err.message : 'Failed to load transactions',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [role, user]);

  const getTransactionItems = useCallback(
    async (transactionId: string): Promise<TransactionItemRow[]> => {
      try {
        const [items, productRows] = await Promise.all([
          fetchRemoteItems(transactionId),
          getProductIdNamePrice(),
        ]);
        const productById = new Map(
          productRows.map((product) => [product.product_id, product]),
        );

        return items.map((item) => {
          const product = productById.get(item.product_id);
          return {
            product_id: item.product_id,
            product_name: product?.name ?? `Product #${item.product_id}`,
            quantity: item.quantity,
            price: product?.price ?? 0,
            subtotal: item.subtotal,
          };
        });
      } catch {
        const [items, productRows] = await Promise.all([
          getLocalTransactionItems(transactionId),
          getLocalProducts(),
        ]);
        const productById = new Map(
          productRows.map((product) => [product.product_id, product]),
        );

        return items.map((item) => {
          const product = productById.get(item.product_id);
          return {
            product_id: item.product_id,
            product_name: product?.name ?? `Product #${item.product_id}`,
            quantity: item.quantity,
            price: product?.price ?? 0,
            subtotal: item.subtotal,
          };
        });
      }
    },
    [],
  );

  const voidTransaction = useCallback(
    async (transactionId: string, reason: string): Promise<void> => {
      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        throw new Error('A void reason is required');
      }
      const { isConnected } = await NetInfo.fetch();
      if (!isConnected) {
        throw new Error(
          'Cannot void a transaction while offline. Connect to the network and try again.',
        );
      }

      setIsVoiding(true);
      setError('');
      try {
        await voidSale(transactionId, trimmedReason);

        await loadTransactions();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to void transaction';
        setError(message);
        throw err;
      } finally {
        setIsVoiding(false);
      }
    },
    [loadTransactions],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async data load from Supabase
    void loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    isLoading,
    isVoiding,
    error,
    loadTransactions,
    getTransactionItems,
    voidTransaction,
  };
}
