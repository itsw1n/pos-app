import { supabase } from '../services/supabase';
import { PaymentMode } from '../types/context';
import { UserRole } from '../types/entities';

export interface TransactionRow {
  id: string;
  date: string;
  total_amount: number;
  payment_mode: PaymentMode;
  user_id: string;
  status?: string | null;
  void_reason?: string | null;
  order_number?: number | null;
  amount_received?: number | null;
  change_given?: number | null;
}

/** Full `transaction_items` row (`select('*')`). `id` is the uuid PK. */
export interface TransactionItemRow {
  id: string;
  transaction_id: string;
  product_id: number;
  quantity: number;
  subtotal: number;
}

/** Sparse `transaction_items` projection for product analytics. */
export interface TransactionItemSparse {
  product_id: number;
  quantity: number;
  subtotal: number;
}

export async function getTransactionsList(
  role: UserRole | null,
  userId: string | undefined,
): Promise<TransactionRow[]> {
  if (role !== 'admin' && userId === undefined) {
    return [];
  }
  let query = supabase
    .from('transactions')
    .select(
      'id, date, total_amount, payment_mode, user_id, status, void_reason, order_number, amount_received, change_given',
    )
    .order('date', { ascending: false });
  if (role !== 'admin' && userId !== null) {
    query = query.eq('user_id', userId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as TransactionRow[]) ?? [];
}

export async function getTransactionItemsByIds(
  ids: string[],
): Promise<{ transaction_id: string }[]> {
  const { data, error } = await supabase
    .from('transaction_items')
    .select('transaction_id')
    .in('transaction_id', ids);
  if (error) throw error;
  return (data as { transaction_id: string }[]) ?? [];
}

export async function getTransactionItems(
  transactionId: string,
): Promise<TransactionItemRow[]> {
  const { data, error } = await supabase
    .from('transaction_items')
    .select('*')
    .eq('transaction_id', transactionId);
  if (error) throw error;
  return (data as TransactionItemRow[]) ?? [];
}

export async function transactionExists(
  transactionId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('id', transactionId)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

export async function getTransactionStatusRange(
  start?: Date,
  end?: Date,
): Promise<Pick<TransactionRow, 'id' | 'status'>[]> {
  let query = supabase.from('transactions').select('id, status');
  if (start !== undefined) {
    query = query.gte('date', start.toISOString());
  }
  if (end !== undefined) {
    query = query.lte('date', end.toISOString());
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as Pick<TransactionRow, 'id' | 'status'>[]) ?? [];
}

export async function getTransactionItemsForProducts(
  ids: string[],
): Promise<TransactionItemSparse[]> {
  const { data, error } = await supabase
    .from('transaction_items')
    .select('product_id, quantity, subtotal')
    .in('transaction_id', ids);
  if (error) throw error;
  return (data as TransactionItemSparse[]) ?? [];
}

export async function getTransactionsForDashboard(): Promise<TransactionRow[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, date, total_amount, payment_mode, user_id, status')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data as TransactionRow[]) ?? [];
}

export async function getTransactionsInRange(
  start: Date,
  end: Date,
): Promise<TransactionRow[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, date, total_amount, payment_mode, user_id, status')
    .gte('date', start.toISOString())
    .lte('date', end.toISOString());
  if (error) throw error;
  return (data as TransactionRow[]) ?? [];
}

export interface SaleItem {
  product_id: number;
  quantity: number;
}

export interface ProcessSaleParams {
  transactionId: string;
  paymentMode: PaymentMode;
  amountReceived: number | null;
  changeGiven: number | null;
  items: SaleItem[];
  date: string;
}

export async function processSale(params: ProcessSaleParams): Promise<void> {
  const { error } = await supabase.rpc('process_sale', {
    p_transaction_id: params.transactionId,
    p_payment_mode: params.paymentMode,
    p_amount_received: params.amountReceived,
    p_change_given: params.changeGiven,
    p_items: params.items,
    p_date: params.date,
  });
  if (error) throw error;
}

export async function voidSale(
  transactionId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase.rpc('void_sale', {
    p_transaction_id: transactionId,
    p_reason: reason,
  });
  if (error) throw error;
}
