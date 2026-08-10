import { supabase } from '../services/supabase';
import { ProductRow } from '../services/catalog';
import { Product } from '../types/entities';

export interface ProductPayload {
  name: string;
  category_id: string;
  price: number;
  is_available: boolean;
  image_url: string | null;
}

export async function getCatalog(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('product')
    .select('*, category(name)')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as unknown as ProductRow[]) ?? [];
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('product').select('*');
  if (error) throw error;
  return (data as Product[]) ?? [];
}

export async function getProductIdNamePrice(): Promise<
  Pick<Product, 'product_id' | 'name' | 'price'>[]
> {
  const { data, error } = await supabase
    .from('product')
    .select('product_id, name, price');
  if (error) throw error;
  return (data as Pick<Product, 'product_id' | 'name' | 'price'>[]) ?? [];
}

export async function createProduct(
  payload: ProductPayload,
): Promise<ProductRow> {
  const { data, error } = await supabase
    .from('product')
    .insert({
      name: payload.name.trim(),
      category_id: payload.category_id,
      price: payload.price,
      is_available: payload.is_available,
      image_url: payload.image_url,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ProductRow;
}

export async function updateProduct(
  productId: number,
  payload: ProductPayload,
): Promise<void> {
  const { error } = await supabase
    .from('product')
    .update({
      name: payload.name.trim(),
      category_id: payload.category_id,
      price: payload.price,
      is_available: payload.is_available,
      image_url: payload.image_url,
    })
    .eq('product_id', productId);
  if (error) throw error;
}

export async function deleteProduct(productId: number): Promise<void> {
  const { error } = await supabase
    .from('product')
    .delete()
    .eq('product_id', productId);
  if (error) throw error;
}
