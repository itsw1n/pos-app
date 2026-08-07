import { useCallback, useState } from 'react';
import { supabase } from '@/services/supabase';
import { CategoryRow, toCategory, UNCATEGORIZED } from '@/services/catalog';
import { Category } from '@/types/entities';

let sharedCache: Category[] | null = null;

export interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: string;
  loadCategories: (force?: boolean) => Promise<void>;
  createCategory: (name: string) => Promise<Category>;
  deleteCategory: (categoryId: string) => Promise<void>;
  invalidate: () => void;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>(sharedCache ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const invalidate = useCallback((): void => {
    sharedCache = null;
  }, []);

  const loadCategories = useCallback(async (force = false): Promise<void> => {
    if (sharedCache && !force) {
      setCategories(sharedCache);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data, error: loadError } = await supabase
        .from('category')
        .select('*')
        .order('name', { ascending: true });
      if (loadError) throw loadError;
      const rows = (data as unknown as CategoryRow[]) ?? [];
      sharedCache = rows.map(toCategory);
      setCategories(sharedCache);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load categories',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (name: string): Promise<Category> => {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error('Category name is required');
      }
      const { data, error: insertError } = await supabase
        .from('category')
        .insert({ name: trimmed })
        .select()
        .single();
      if (insertError) throw insertError;
      const category = toCategory(data as CategoryRow);
      sharedCache = sharedCache ? [...sharedCache, category] : [category];
      setCategories(sharedCache);
      return category;
    },
    [],
  );

  const deleteCategory = useCallback(
    async (categoryId: string): Promise<void> => {
      const target = sharedCache?.find(
        (category) => category.category_id === categoryId,
      );
      if (!target) return;
      if (target.name === UNCATEGORIZED) {
        throw new Error(`The ${UNCATEGORIZED} category cannot be deleted`);
      }

      let { data: uncategorized, error: uncatError } = await supabase
        .from('category')
        .select('*')
        .eq('name', UNCATEGORIZED)
        .maybeSingle();
      if (uncatError) throw uncatError;

      if (!uncategorized) {
        const insert = await supabase
          .from('category')
          .insert({ name: UNCATEGORIZED })
          .select()
          .single();
        if (insert.error) throw insert.error;
        uncategorized = insert.data;
      }

      const uncategorizedId = (uncategorized as CategoryRow).category_id;

      const { error: reassignError } = await supabase
        .from('product')
        .update({ category_id: uncategorizedId })
        .eq('category_id', categoryId);
      if (reassignError) throw reassignError;

      const { error: deleteError } = await supabase
        .from('category')
        .delete()
        .eq('category_id', categoryId);
      if (deleteError) throw deleteError;

      const remaining = (sharedCache ?? []).filter(
        (category) => category.category_id !== categoryId,
      );
      if (
        !remaining.some((category) => category.category_id === uncategorizedId)
      ) {
        remaining.unshift(toCategory(uncategorized as CategoryRow));
      }
      sharedCache = remaining;
      setCategories(sharedCache);
    },
    [],
  );

  return {
    categories,
    isLoading,
    error,
    loadCategories,
    createCategory,
    deleteCategory,
    invalidate,
  };
}
