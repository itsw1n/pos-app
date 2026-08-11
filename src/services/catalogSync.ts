import { getCategories } from '../api/categoryApi';
import { getInventory } from '../api/inventoryApi';
import { getCatalog } from '../api/productApi';
import { getUsers } from '../api/userApi';
import { toProduct } from './catalog';
import {
  replaceLocalCategories,
  replaceLocalInventory,
  replaceLocalProducts,
  upsertLocalUsers,
} from './sqlite';

/**
 * Mirror reference data (products, categories, inventory, users) from
 * Supabase into SQLite so screens can render offline. Best-effort: any
 * failure is silent and retried on the next connect/sign-in.
 */
export async function refreshLocalCache(): Promise<void> {
  try {
    const [products, categories, inventory, users] = await Promise.all([
      getCatalog(),
      getCategories(),
      getInventory(),
      getUsers(),
    ]);

    // Cache-replace helpers open transactions on one shared SQLite connection,
    // so run them sequentially to keep each replace atomic.
    await replaceLocalProducts(
      products.map((row) => {
        const product = toProduct(row);
        return {
          product_id: product.product_id,
          name: product.name,
          category_id: product.category_id,
          category_name: product.category,
          price: product.price,
          is_available: product.is_available ? 1 : 0,
          image_url: product.image_url,
        };
      }),
    );
    await replaceLocalCategories(
      categories.map((category) => ({
        category_id: category.category_id,
        name: category.name,
        created_at: category.created_at ?? null,
      })),
    );
    await replaceLocalInventory(
      inventory.map((record) => ({
        stock_id: record.stock_id,
        product_id: record.product_id,
        quantity: record.quantity,
        reorder_level: record.reorder_level,
      })),
    );
    await upsertLocalUsers(
      users.map((user) => ({
        user_id: user.user_id,
        username: user.username,
        role: user.role,
      })),
    );
  } catch {
    // Offline cache refresh is best-effort; failures surface next reconnect.
  }
}
