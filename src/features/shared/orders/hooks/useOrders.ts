import { useCallback, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabase';
import { PaymentMode } from '@/types/context';
import { Product, TransactionItem } from '@/types/entities';

interface StoredTransaction {
  id: string;
  date: string;
  total_amount: number;
  payment_mode: PaymentMode;
  user_id: number;
  status?: string | null;
  void_reason?: string | null;
}

export interface TransactionRecord {
  id: string;
  date: string;
  total_amount: number;
  payment_mode: PaymentMode;
  user_id: number;
  user_name: string;
  items_count: number;
  status: 'completed' | 'voided';
  void_reason?: string | null;
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
      let query = supabase
        .from('transactions')
        .select(
          'id, date, total_amount, payment_mode, user_id, status, void_reason',
        )
        .order('date', { ascending: false });
      if (role !== 'admin' && user) {
        query = query.eq('user_id', user.user_id);
      }
      const { data, error: transactionsError } = await query;
      if (transactionsError) throw transactionsError;
      const rows = (data as StoredTransaction[]) ?? [];

      let itemsCount = new Map<string, number>();
      if (rows.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('transaction_items')
          .select('transaction_id')
          .in(
            'transaction_id',
            rows.map((row) => row.id),
          );
        if (!itemsError) {
          itemsCount = new Map<string, number>();
          for (const item of (items as Array<{ transaction_id: string }>) ??
            []) {
            itemsCount.set(
              item.transaction_id,
              (itemsCount.get(item.transaction_id) ?? 0) + 1,
            );
          }
        }
      }

      const { data: users } = await supabase
        .from('user')
        .select('user_id, username');
      const userById = new Map(
        ((users as Array<{ user_id: number; username: string }>) ?? []).map(
          (row) => [row.user_id, row.username],
        ),
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
          status: row.status === 'voided' ? 'voided' : 'completed',
          void_reason: row.void_reason ?? null,
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
      const [itemsRes, productsRes] = await Promise.all([
        supabase
          .from('transaction_items')
          .select('*')
          .eq('transaction_id', transactionId),
        supabase.from('product').select('product_id, name, price'),
      ]);
      if (itemsRes.error) throw itemsRes.error;
      if (productsRes.error) throw productsRes.error;

      const items = (itemsRes.data as TransactionItem[]) ?? [];
      const products = (productsRes.data as Product[]) ?? [];
      const productById = new Map(
        products.map((product) => [product.product_id, product]),
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
        const { data: items, error: itemsError } = await supabase
          .from('transaction_items')
          .select('*')
          .eq('transaction_id', transactionId);
        if (itemsError) throw itemsError;

        for (const item of (items as TransactionItem[]) ?? []) {
          const { data: inventory, error: inventoryError } = await supabase
            .from('inventory')
            .select('stock_id, quantity')
            .eq('product_id', item.product_id)
            .maybeSingle();
          if (inventoryError) throw inventoryError;
          if (!inventory) continue;

          const currentQuantity = (inventory.quantity as number) ?? 0;
          const { error: updateError } = await supabase
            .from('inventory')
            .update({ quantity: currentQuantity + item.quantity })
            .eq('stock_id', inventory.stock_id);
          if (updateError) throw updateError;

          const { error: movementError } = await supabase
            .from('stock_movements')
            .insert({
              stock_id: inventory.stock_id,
              type: 'in',
              quantity: item.quantity,
              date: new Date().toISOString(),
            });
          if (movementError) throw movementError;
        }

        const { error: voidError } = await supabase
          .from('transactions')
          .update({ status: 'voided', void_reason: trimmedReason })
          .eq('id', transactionId);
        if (voidError) throw voidError;

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
