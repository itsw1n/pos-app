import { useCallback, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/services/supabase';
import { saveToSQLite } from '@/services/sqlite';
import { ProductRow, toProduct } from '@/services/catalog';
import { Inventory, Product } from '@/types/entities';

export type StockStatus = 'ok' | 'low' | 'critical';

export interface InventoryItem extends Inventory {
  product_name: string;
  product_category: string;
  price: number;
  is_available: boolean;
}

export interface StockInPayload {
  stockId: number;
  quantity: number;
  supplier?: string;
}

export interface UseInventoryResult {
  items: InventoryItem[];
  isLoading: boolean;
  error: string;
  loadInventory: () => Promise<void>;
  getStatus: (item: InventoryItem) => StockStatus;
  addStock: (payload: StockInPayload) => Promise<void>;
  lowCount: number;
  criticalCount: number;
}

export function useInventory(): UseInventoryResult {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadInventory = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const [inventoryRes, productRes] = await Promise.all([
        supabase.from('inventory').select('*'),
        supabase.from('product').select('*, category(name)'),
      ]);
      const inventory = (inventoryRes.data as Inventory[]) ?? [];
      const products = (((productRes.data as unknown) as ProductRow[]) ?? []).map(toProduct);
      const productById = new Map(products.map((p) => [p.product_id, p]));
      setItems(
        inventory.map((record) => {
          const product = productById.get(record.product_id);
          return {
            ...record,
            product_name: product?.name ?? `Product #${record.product_id}`,
            product_category: product?.category ?? 'Uncategorized',
            price: product?.price ?? 0,
            is_available: product?.is_available ?? false,
          };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatus = useCallback((item: InventoryItem): StockStatus => {
    if (item.quantity <= 0) return 'critical';
    if (item.quantity <= item.reorder_level) return 'low';
    return 'ok';
  }, []);

  const { lowCount, criticalCount } = useMemo(() => {
    let low = 0;
    let critical = 0;
    for (const item of items) {
      const status = getStatus(item);
      if (status === 'critical') critical += 1;
      else if (status === 'low') low += 1;
    }
    return { lowCount: low, criticalCount: critical };
  }, [items, getStatus]);

  const addStock = useCallback(
    async (payload: StockInPayload): Promise<void> => {
      if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) {
        throw new Error('Stock-in quantity must be a whole number greater than zero');
      }

      const date = new Date().toISOString();
      const { isConnected } = await NetInfo.fetch();
      if (isConnected) {
        const { data: current } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('stock_id', payload.stockId)
          .maybeSingle();
        const currentQuantity = (current?.quantity as number | undefined) ?? 0;
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: currentQuantity + payload.quantity })
          .eq('stock_id', payload.stockId);
        if (updateError) throw updateError;
        const { error: movementError } = await supabase.from('stock_movements').insert({
          stock_id: payload.stockId,
          type: 'in',
          quantity: payload.quantity,
          date,
          supplier: payload.supplier ?? null,
        });
        if (movementError) throw movementError;
      } else {
        await saveToSQLite('stock_movements', {
          stock_id: payload.stockId,
          type: 'in',
          quantity: payload.quantity,
          date,
          supplier: payload.supplier ?? '',
        });
      }
      await loadInventory();
    },
    [loadInventory]
  );

  return { items, isLoading, error, loadInventory, getStatus, addStock, lowCount, criticalCount };
}
