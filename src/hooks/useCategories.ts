import { useCallback, useState } from 'react';
import {
  createCategory as createRemoteCategory,
  deleteCategory as deleteRemoteCategory,
  getCategories,
  getOrCreateUncategorized,
  reassignProducts,
} from '@/api/categoryApi';
import { toCategory, UNCATEGORIZED } from '@/services/catalog';
import { refreshLocalCache } from '@/services/catalogSync';
import { getLocalCategories } from '@/services/sqlite';
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
      const rows = await getCategories();
      sharedCache = rows.map(toCategory);
      setCategories(sharedCache);
    } catch (err) {
      const cached = await getLocalCategories();
      if (cached.length > 0) {
        sharedCache = cached.map((category): Category =>
          toCategory({
            ...category,
            created_at: category.created_at ?? undefined,
          }),
        );
        setCategories(sharedCache);
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to load categories',
        );
      }
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
      const category = toCategory(await createRemoteCategory(trimmed));
      sharedCache = sharedCache ? [...sharedCache, category] : [category];
      setCategories(sharedCache);
      void refreshLocalCache();
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

      const uncategorized = await getOrCreateUncategorized();
      const uncategorizedId = uncategorized.category_id;

      await reassignProducts(categoryId, uncategorizedId);
      await deleteRemoteCategory(categoryId);

      const remaining = (sharedCache ?? []).filter(
        (category) => category.category_id !== categoryId,
      );
      if (
        !remaining.some((category) => category.category_id === uncategorizedId)
      ) {
        remaining.unshift(toCategory(uncategorized));
      }
      sharedCache = remaining;
      setCategories(sharedCache);
      void refreshLocalCache();
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
