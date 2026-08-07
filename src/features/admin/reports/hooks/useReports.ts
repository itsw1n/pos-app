import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { PaymentMode } from '@/types/context';
import { Inventory, Product, TransactionItem } from '@/types/entities';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export type StockLevel = 'ok' | 'low' | 'critical';

const PAYMENT_MODES: PaymentMode[] = ['cash', 'gcash', 'maya'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_MS = 24 * 60 * 60 * 1000;

interface StoredTransaction {
  id: string;
  date: string;
  total_amount: number;
  payment_mode: PaymentMode;
  user_id: number;
  status?: string | null;
}

export type DaySales = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

export interface PaymentModeBreakdown {
  payment_mode: PaymentMode;
  orders: number;
  revenue: number;
}

export interface SalesReport {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentModeBreakdown: PaymentModeBreakdown[];
  dailyBreakdown: DaySales[];
}

export interface InventoryReportRow {
  stock_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  reorder_level: number;
  status: StockLevel;
}

export interface InventoryReport {
  generatedAt: string;
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockValue: number;
  items: InventoryReportRow[];
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface LowStockItem {
  stock_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  reorder_level: number;
}

export interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  weeklyBreakdown: DaySales[];
  lowStock: LowStockItem[];
  topProducts: TopProduct[];
}

export interface UseReportsResult {
  dashboard: DashboardData | null;
  isLoading: boolean;
  error: string;
  loadDashboard: () => Promise<void>;
  getSalesReport: (period: ReportPeriod) => Promise<SalesReport>;
  getInventoryReport: () => Promise<InventoryReport>;
}

function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getPeriodRange(period: ReportPeriod): { start: Date; end: Date } {
  const now = new Date();
  if (period === 'daily') {
    return { start: startOfDay(now), end: now };
  }
  if (period === 'weekly') {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 6);
    return { start, end: now };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end: now };
}

export function buildDaySales(transactions: StoredTransaction[], dayCount: number): DaySales[] {
  const now = new Date();
  const buckets: DaySales[] = [];
  for (let i = dayCount - 1; i >= 0; i -= 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    buckets.push({ date: dayKey(day), label: DAY_LABELS[day.getDay()], revenue: 0, orders: 0 });
  }
  const bucketByDate = new Map(buckets.map((bucket) => [bucket.date, bucket]));
  for (const transaction of transactions) {
    const bucket = bucketByDate.get(dayKey(new Date(transaction.date)));
    if (bucket) {
      bucket.revenue += transaction.total_amount;
      bucket.orders += 1;
    }
  }
  return buckets;
}

function isActive(transaction: StoredTransaction): boolean {
  return transaction.status !== 'voided';
}

function inRange(date: string, start: Date, end: Date): boolean {
  const time = new Date(date).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

export function buildSalesReport(
  period: ReportPeriod,
  transactions: StoredTransaction[],
  start: Date,
  end: Date
): SalesReport {
  const active = transactions.filter((transaction) => isActive(transaction) && inRange(transaction.date, start, end));
  const totalRevenue = active.reduce((sum, transaction) => sum + transaction.total_amount, 0);
  const totalOrders = active.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const dayCount = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;

  const paymentModeBreakdown = PAYMENT_MODES.map((paymentMode) => {
    const rows = active.filter((transaction) => transaction.payment_mode === paymentMode);
    return {
      payment_mode: paymentMode,
      orders: rows.length,
      revenue: rows.reduce((sum, transaction) => sum + transaction.total_amount, 0),
    };
  });

  return {
    period,
    startDate: start.toLocaleDateString(),
    endDate: end.toLocaleDateString(),
    totalRevenue,
    totalOrders,
    averageOrderValue,
    paymentModeBreakdown,
    dailyBreakdown: buildDaySales(active, dayCount),
  };
}

export function useReports(): UseReportsResult {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const [transactionsRes, inventoryRes, productsRes, itemsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, date, total_amount, payment_mode, user_id, status')
          .order('date', { ascending: false }),
        supabase.from('inventory').select('*'),
        supabase.from('product').select('*'),
        supabase.from('transaction_items').select('product_id, quantity, subtotal'),
      ]);
      if (transactionsRes.error) throw transactionsRes.error;
      if (inventoryRes.error) throw inventoryRes.error;
      if (productsRes.error) throw productsRes.error;
      if (itemsRes.error) throw itemsRes.error;

      const transactions = ((transactionsRes.data as StoredTransaction[]) ?? []).filter(isActive);
      const inventory = (inventoryRes.data as Inventory[]) ?? [];
      const products = (productsRes.data as Product[]) ?? [];
      const items = (itemsRes.data as TransactionItem[]) ?? [];

      const productById = new Map(products.map((product) => [product.product_id, product]));

      const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total_amount, 0);
      const weeklyBreakdown = buildDaySales(transactions, 7);

      const lowStock = inventory
        .filter((record) => record.quantity <= record.reorder_level)
        .map((record) => ({
          stock_id: record.stock_id,
          product_id: record.product_id,
          product_name: productById.get(record.product_id)?.name ?? `Product #${record.product_id}`,
          quantity: record.quantity,
          reorder_level: record.reorder_level,
        }))
        .sort((a, b) => a.quantity - b.quantity);

      const soldByProduct = new Map<number, { quantity_sold: number; revenue: number }>();
      for (const item of items) {
        const current = soldByProduct.get(item.product_id) ?? { quantity_sold: 0, revenue: 0 };
        current.quantity_sold += item.quantity;
        current.revenue += item.subtotal;
        soldByProduct.set(item.product_id, current);
      }
      const topProducts = Array.from(soldByProduct.entries())
        .map(([productId, value]) => ({
          product_id: productId,
          product_name: productById.get(productId)?.name ?? `Product #${productId}`,
          quantity_sold: value.quantity_sold,
          revenue: value.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setDashboard({
        totalRevenue,
        totalOrders: transactions.length,
        weeklyBreakdown,
        lowStock,
        topProducts,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSalesReport = useCallback(async (period: ReportPeriod): Promise<SalesReport> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, date, total_amount, payment_mode, user_id, status');
    if (error) throw error;
    const transactions = (data as StoredTransaction[]) ?? [];
    const { start, end } = getPeriodRange(period);
    return buildSalesReport(period, transactions, start, end);
  }, []);

  const getInventoryReport = useCallback(async (): Promise<InventoryReport> => {
    const [inventoryRes, productsRes] = await Promise.all([
      supabase.from('inventory').select('*'),
      supabase.from('product').select('*'),
    ]);
    if (inventoryRes.error) throw inventoryRes.error;
    if (productsRes.error) throw productsRes.error;

    const inventory = (inventoryRes.data as Inventory[]) ?? [];
    const products = (productsRes.data as Product[]) ?? [];
    const productById = new Map(products.map((product) => [product.product_id, product]));

    let stockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const rows: InventoryReportRow[] = inventory.map((record) => {
      const product = productById.get(record.product_id);
      const productName = product?.name ?? `Product #${record.product_id}`;
      const price = product?.price ?? 0;
      const status: StockLevel =
        record.quantity <= 0 ? 'critical' : record.quantity <= record.reorder_level ? 'low' : 'ok';
      stockValue += price * record.quantity;
      if (status === 'critical') outOfStockCount += 1;
      else if (status === 'low') lowStockCount += 1;
      return {
        stock_id: record.stock_id,
        product_id: record.product_id,
        product_name: productName,
        quantity: record.quantity,
        reorder_level: record.reorder_level,
        status,
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      totalItems: rows.length,
      lowStockCount,
      outOfStockCount,
      stockValue,
      items: rows,
    };
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return { dashboard, isLoading, error, loadDashboard, getSalesReport, getInventoryReport };
}
