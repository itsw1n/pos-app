import { useCallback, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/services/supabase';
import { saveToSQLite } from '@/services/sqlite';
import { ProductRow, toProduct } from '@/services/catalog';
import { CartItem, PaymentMode, POSTransaction } from '@/types/context';
import { Product } from '@/types/entities';

export interface UseMenuResult {
  cart: CartItem[];
  products: Product[];
  isLoading: boolean;
  error: string;
  loadProducts: () => Promise<void>;
  addToCart: (product: {
    product_id: number;
    name: string;
    price: number;
    image_url: string | null;
  }) => void;
  decrementItem: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  getTotal: () => number;
  processTransaction: (
    paymentMode: PaymentMode,
    amountReceived?: number,
  ) => Promise<POSTransaction>;
}

export function useMenu(): UseMenuResult {
  const { user } = useAuth();
  const {
    cart,
    addToCart,
    decrementItem,
    removeFromCart,
    getTotal,
    clearCart,
  } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await supabase
        .from('product')
        .select('*, category(name)')
        .order('name', { ascending: true });
      setProducts((data as unknown as ProductRow[])?.map(toProduct) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async data load from Supabase
    void loadProducts();
  }, [loadProducts]);

  const processTransaction = useCallback(
    async (
      paymentMode: PaymentMode,
      amountReceived?: number,
    ): Promise<POSTransaction> => {
      const total = getTotal();
      const transaction: POSTransaction = {
        id: uuid.v4(),
        total_amount: total,
        payment_mode: paymentMode,
        amount_received: amountReceived ?? null,
        change_given:
          paymentMode === 'cash' && amountReceived !== undefined
            ? amountReceived - total
            : null,
        user_id: user?.user_id ?? 0,
        date: new Date().toISOString(),
        status: 'completed',
        items: cart,
        synced: false,
      };

      const { isConnected } = await NetInfo.fetch();
      if (isConnected) {
        const { error: processError } = await supabase.rpc('process_sale', {
          p_transaction_id: transaction.id,
          p_payment_mode: transaction.payment_mode,
          p_amount_received: transaction.amount_received,
          p_change_given: transaction.change_given,
          p_items: cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.qty,
          })),
          p_date: transaction.date,
        });
        if (processError) throw processError;
      } else {
        await saveToSQLite('transactions', {
          id: transaction.id,
          total_amount: transaction.total_amount,
          payment_mode: transaction.payment_mode,
          amount_received: transaction.amount_received,
          change_given: transaction.change_given,
          user_id: transaction.user_id,
          date: transaction.date,
          synced: false,
        });
        for (const item of cart) {
          await saveToSQLite('transaction_items', {
            id: uuid.v4(),
            transaction_id: transaction.id,
            product_id: item.product_id,
            quantity: item.qty,
            subtotal: item.price * item.qty,
          });
        }
      }

      clearCart();
      return transaction;
    },
    [cart, getTotal, user, clearCart],
  );

  return {
    cart,
    products,
    isLoading,
    error,
    loadProducts,
    addToCart,
    decrementItem,
    removeFromCart,
    getTotal,
    processTransaction,
  };
}
