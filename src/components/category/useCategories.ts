import { useCallback, useState } from 'react';
import { supabase } from '../../services/supabase';
import { CategoryRow, toCategory } from '../../services/catalog';
import { Category } from '../../types/entities';

let sharedCache: Category[] | null = null;

export interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: string;
  loadCategories: (force?: boolean) => Promise<void>;
  createCategory: (name: string) => Promise<Category>;
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
      const rows = ((data as unknown) as CategoryRow[]) ?? [];
      sharedCache = rows.map(toCategory);
      setCategories(sharedCache);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (name: string): Promise<Category> => {
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
  }, []);

  return { categories, isLoading, error, loadCategories, createCategory, invalidate };
}