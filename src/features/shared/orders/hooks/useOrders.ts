import { useCallback, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/context/AuthContext';
import {
  getTransactionItems as fetchRemoteItems,
  getTransactionItemsByIds,
  getTransactionsList,
  voidSale,
} from '@/api/transactionApi';
import { getProductIdNamePrice } from '@/api/productApi';
import { getUsersIdName } from '@/api/userApi';
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

export function useOrders(): UseTransactionsResult {
  const { user, role } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [error, setError] = useState('');

  const loadTransactions = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');
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

      setTransactions(
        rows.map((row) => ({
          id: row.id,
          date: row.date,
          total_amount: row.total_amount,
          payment_mode: row.payment_mode,
          user_id: row.user_id,
          user_name: userById.get(row.user_id) ?? 'Cashier',
          items_count: itemsCount.get(row.id) ?? 0,
          order_number: row.order_number ?? undefined,
          status: row.status === 'voided' ? 'voided' : 'completed',
          void_reason: row.void_reason ?? null,
          amount_received: row.amount_received ?? null,
          change_given: row.change_given ?? null,
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load transactions',
      );
    } finally {
      setIsLoading(false);
    }
  }, [role, user]);

  const getTransactionItems = useCallback(
    async (transactionId: string): Promise<TransactionItemRow[]> => {
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
