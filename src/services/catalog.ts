import type { LocalProduct } from './sqlite';
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
  image_url: string | null;
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
    image_url: row.image_url ?? null,
  };
}

export function toCategory(row: CategoryRow): Category {
  return {
    category_id: row.category_id,
    name: row.name,
    created_at: row.created_at,
  };
}

/** Map a cached `products` row back to the domain `Product` shape. */
export function toProductFromCache(local: LocalProduct): Product {
  return {
    product_id: local.product_id,
    name: local.name,
    category: local.category_name,
    category_id: local.category_id,
    price: local.price,
    is_available: Boolean(local.is_available),
    image_url: local.image_url ?? null,
  };
}
