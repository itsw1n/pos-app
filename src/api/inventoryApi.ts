import { supabase } from '../services/supabase';
import { Inventory } from '../types/entities';

export async function getInventory(): Promise<Inventory[]> {
  const { data, error } = await supabase.from('inventory').select('*');
  if (error) throw error;
  return (data as Inventory[]) ?? [];
}

export async function deleteInventoryByProduct(
  productId: number,
): Promise<void> {
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('product_id', productId);
  if (error) throw error;
}

export async function adjustStock(
  stockId: number,
  quantity: number,
  supplier: string | null,
): Promise<void> {
  const { error } = await supabase.rpc('adjust_stock', {
    p_stock_id: stockId,
    p_quantity: quantity,
    p_supplier: supplier ?? null,
  });
  if (error) throw error;
}
