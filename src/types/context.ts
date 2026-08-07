export type PaymentMode = 'cash' | 'gcash' | 'maya';

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: {
    product_id: number;
    name: string;
    price: number;
  }) => void;
  decrementItem: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  getTotal: () => number;
  clearCart: () => void;
}

export interface POSTransaction {
  id: string;
  total_amount: number;
  payment_mode: PaymentMode;
  amount_received: number | null;
  change_given: number | null;
  user_id: number;
  date: string;
  status: 'completed';
  items: CartItem[];
  synced: boolean;
}
