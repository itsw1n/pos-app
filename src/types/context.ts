export type PaymentMode = 'cash' | 'gcash' | 'maya';

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
  image_url: string | null;
}

export interface CartContextType {
  cart: CartItem[];
  total: number;
  addToCart: (product: {
    product_id: number;
    name: string;
    price: number;
    image_url: string | null;
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
  user_id: string;
  date: string;
  status: 'completed';
  items: CartItem[];
  order_number?: number;
  synced: boolean;
}
