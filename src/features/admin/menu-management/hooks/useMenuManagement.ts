import { useCallback, useState } from 'react';
import { supabase } from '@/services/supabase';
import { deleteProductImage } from '@/services/storage';
import { ProductRow, toProduct, UNCATEGORIZED } from '@/services/catalog';
import { Product } from '@/types/entities';

export interface ProductPayload {
  name: string;
  category_id: string;
  price: number;
  is_available: boolean;
  image_url: string | null;
}

export interface UseMenuManagementResult {
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
  if (!payload.category_id.trim()) {
    throw new Error('Product category is required');
  }
  if (!Number.isFinite(payload.price) || payload.price < 0) {
    throw new Error('Price must be a number greater than or equal to zero');
  }
}

export function useMenuManagement(): UseMenuManagementResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: loadError } = await supabase
        .from('product')
        .select('*, category(name)')
        .order('name', { ascending: true });
      if (loadError) throw loadError;
      setProducts((data as unknown as ProductRow[])?.map(toProduct) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = useCallback(
    async (payload: ProductPayload): Promise<Product> => {
      validatePayload(payload);
      const { data, error: insertError } = await supabase
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
      if (insertError) throw insertError;
      const created = toProduct(data as ProductRow);
      setProducts((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const updateProduct = useCallback(
    async (productId: number, payload: ProductPayload): Promise<void> => {
      validatePayload(payload);
      const current = products.find((p) => p.product_id === productId);
      const { error: updateError } = await supabase
        .from('product')
        .update({
          name: payload.name.trim(),
          category_id: payload.category_id,
          price: payload.price,
          is_available: payload.is_available,
          image_url: payload.image_url,
        })
        .eq('product_id', productId);
      if (updateError) throw updateError;
      // Remove the replaced image from storage only after the DB update succeeds.
      if (current?.image_url && current.image_url !== payload.image_url) {
        await deleteProductImage(current.image_url);
      }
      setProducts((prev) =>
        prev.map((product) =>
          product.product_id === productId
            ? {
                ...product,
                name: payload.name.trim(),
                category_id: payload.category_id,
                category:
                  product.category_id === payload.category_id
                    ? product.category
                    : UNCATEGORIZED,
                price: payload.price,
                is_available: payload.is_available,
                image_url: payload.image_url,
              }
            : product,
        ),
      );
    },
    [products],
  );

  const deleteProduct = useCallback(
    async (productId: number): Promise<void> => {
      const current = products.find((p) => p.product_id === productId);
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
      if (current) {
        await deleteProductImage(current.image_url);
      }
      setProducts((prev) =>
        prev.filter((product) => product.product_id !== productId),
      );
    },
    [products],
  );

  return {
    products,
    isLoading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
