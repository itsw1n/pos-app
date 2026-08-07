import { useCallback, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Product } from '../../types/entities';

export interface ProductPayload {
  name: string;
  category: string;
  price: number;
  is_available: boolean;
}

export interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  error: string;
  loadProducts: () => Promise<void>;
  createProduct: (payload: ProductPayload) => Promise<Product>;
  updateProduct: (productId: number, payload: ProductPayload) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
}

function validatePayload(payload: ProductPayload): void {
  if (!payload.name.trim()) {
    throw new Error('Product name is required');
  }
  if (!payload.category.trim()) {
    throw new Error('Product category is required');
  }
  if (!Number.isFinite(payload.price) || payload.price < 0) {
    throw new Error('Price must be a number greater than or equal to zero');
  }
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: loadError } = await supabase
        .from('product')
        .select('*')
        .order('name', { ascending: true });
      if (loadError) throw loadError;
      setProducts((data as Product[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (payload: ProductPayload): Promise<Product> => {
    validatePayload(payload);
    const { data, error: insertError } = await supabase
      .from('product')
      .insert({
        name: payload.name.trim(),
        category: payload.category.trim(),
        price: payload.price,
        is_available: payload.is_available,
      })
      .select()
      .single();
    if (insertError) throw insertError;
    const created = data as Product;
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  const updateProduct = useCallback(
    async (productId: number, payload: ProductPayload): Promise<void> => {
      validatePayload(payload);
      const { error: updateError } = await supabase
        .from('product')
        .update({
          name: payload.name.trim(),
          category: payload.category.trim(),
          price: payload.price,
          is_available: payload.is_available,
        })
        .eq('product_id', productId);
      if (updateError) throw updateError;
      setProducts((prev) =>
        prev.map((product) =>
          product.product_id === productId
            ? {
                ...product,
                name: payload.name.trim(),
                category: payload.category.trim(),
                price: payload.price,
                is_available: payload.is_available,
              }
            : product
        )
      );
    },
    []
  );

  const deleteProduct = useCallback(async (productId: number): Promise<void> => {
    const { error: inventoryError } = await supabase
      .from('inventory')
      .delete()
      .eq('product_id', productId);
    if (inventoryError) throw inventoryError;
    const { error: deleteError } = await supabase
      .from('product')
      .delete()
      .eq('product_id', productId);
    if (deleteError) throw deleteError;
    setProducts((prev) => prev.filter((product) => product.product_id !== productId));
  }, []);

  return { products, isLoading, error, loadProducts, createProduct, updateProduct, deleteProduct };
}
