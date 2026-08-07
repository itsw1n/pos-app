import { Category, Product } from '../types/entities';

export const UNCATEGORIZED = 'Uncategorized';

/**
 * Raw Supabase row shape for `product` when selected with `*, category(name)`.
 * The embedded `category` object is the resolved FK row; a plain string is
 * tolerated for legacy/offline rows.
 */
export interface ProductRow {
  product_id: number;
  name: string;
  category_id: string;
  price: number;
  is_available: boolean;
  category?: { name: string } | string | null;
}

export interface CategoryRow {
  category_id: string;
  name: string;
  created_at?: string;
}

export function toProduct(row: ProductRow): Product {
  const raw = row.category;
  const category = typeof raw === 'string' ? raw : (raw?.name ?? UNCATEGORIZED);
  return {
    product_id: row.product_id,
    name: row.name,
    category_id: row.category_id,
    category,
    price: Number(row.price),
    is_available: row.is_available,
  };
}

export function toCategory(row: CategoryRow): Category {
  return {
    category_id: row.category_id,
    name: row.name,
    created_at: row.created_at,
  };
}
