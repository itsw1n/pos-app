import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { CartContextType, CartItem } from '../types/context';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [cart, setCart] = useState<CartItem[]>([]);

  const total = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cart],
  );

  const addToCart = useCallback(
    (product: { product_id: number; name: string; price: number }): void => {
      setCart((prev) => {
        const exists = prev.find((i) => i.product_id === product.product_id);
        if (exists) {
          return prev.map((i) =>
            i.product_id === product.product_id ? { ...i, qty: i.qty + 1 } : i,
          );
        }
        return [...prev, { ...product, qty: 1 }];
      });
    },
    [],
  );

  const decrementItem = useCallback((productId: number): void => {
    setCart((prev) =>
      prev
        .map((i) => (i.product_id === productId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: number): void => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const getTotal = useCallback((): number => {
    return total;
  }, [total]);

  const clearCart = useCallback((): void => {
    setCart([]);
  }, []);

  const value = useMemo(
    () => ({
      cart,
      total,
      addToCart,
      decrementItem,
      removeFromCart,
      getTotal,
      clearCart,
    }),
    [
      cart,
      total,
      addToCart,
      decrementItem,
      removeFromCart,
      getTotal,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
