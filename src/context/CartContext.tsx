import React, { createContext, useCallback, useContext, useState } from 'react';
import { CartContextType, CartItem } from '../types/context';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [cart, setCart] = useState<CartItem[]>([]);

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
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }, [cart]);

  const clearCart = useCallback((): void => {
    setCart([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        decrementItem,
        removeFromCart,
        getTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
