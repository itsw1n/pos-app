import * as SQLite from 'expo-sqlite';

export type LocalTableName =
  | 'transactions'
  | 'transaction_items'
  | 'inventory'
  | 'stock_movements'
  | 'categories'
  | 'products'
  | 'users';

export interface LocalProduct {
  product_id: number;
  name: string;
  category_id: string;
  category_name: string;
  price: number;
  is_available: boolean;
  image_url: string | null;
}

export interface LocalUser {
  user_id: string;
  username: string;
  role: 'admin' | 'cashier';
}

export interface LocalTransaction {
  id: string;
  total_amount: number;
  payment_mode: string;
  user_id: number;
  date: string;
  synced: number;
  status?: string | null;
  void_reason?: string | null;
  order_number?: number | null;
  amount_received?: number | null;
  change_given?: number | null;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('ipss.db');
  }
  return dbPromise;
}

export async function initDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      total_amount REAL NOT NULL,
      payment_mode TEXT NOT NULL,
      amount_received REAL,
      change_given REAL,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS transaction_items (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id)
    );
    CREATE TABLE IF NOT EXISTS inventory (
      stock_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      reorder_level INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stock_movements (
      movement_id INTEGER PRIMARY KEY AUTOINCREMENT,
      stock_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      date TEXT NOT NULL,
      supplier TEXT,
      synced INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS categories (
      category_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      category_name TEXT NOT NULL,
      price REAL NOT NULL,
      is_available INTEGER NOT NULL,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `);
  try {
    await db.execAsync(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product ON inventory (product_id);',
    );
  } catch {
    // Legacy local DBs may hold duplicate rows; a later full cache replace
    // keeps exactly one row per product.
  }
  try {
    await db.execAsync(
      'ALTER TABLE stock_movements ADD COLUMN synced INTEGER DEFAULT 0;',
    );
  } catch {
    // Column already exists on newer local DBs.
  }
  for (const column of ['amount_received', 'change_given']) {
    try {
      await db.execAsync(`ALTER TABLE transactions ADD COLUMN ${column} REAL;`);
    } catch {
      // Column already exists on newer local DBs.
    }
  }
}

const pkColumn: Partial<Record<LocalTableName, string>> = {
  transactions: 'id',
  transaction_items: 'id',
  inventory: 'stock_id',
  stock_movements: 'movement_id',
};

export async function getTransactionItemsLocal(
  transactionId: string,
): Promise<{ product_id: number; quantity: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ product_id: number; quantity: number }>(
    `SELECT product_id, quantity FROM transaction_items WHERE transaction_id = ?`,
    transactionId,
  );
}

export async function saveToSQLite<
  T extends Record<string, SQLite.SQLiteBindValue>,
>(table: LocalTableName, data: T): Promise<void> {
  const db = await getDb();
  const keys = Object.keys(data) as (keyof T & string)[];
  const values = keys.map((key) => data[key]);
  const placeholders = keys.map(() => '?').join(', ');
  await db.runAsync(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
    values,
  );
}

export async function getUnsyncedRecords<T>(
  table: 'transactions' | 'stock_movements',
): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(`SELECT * FROM ${table} WHERE synced = 0`);
}

export async function markSynced(
  table: 'transactions' | 'stock_movements',
  id: string | number,
): Promise<void> {
  const pk = pkColumn[table];
  if (!pk) return;
  const db = await getDb();
  await db.runAsync(`UPDATE ${table} SET synced = 1 WHERE ${pk} = ?`, id);
}

export async function getLocalProducts(): Promise<LocalProduct[]> {
  const db = await getDb();
  return db.getAllAsync<LocalProduct>(`SELECT * FROM products`);
}

export async function replaceLocalProducts(
  products: LocalProduct[],
): Promise<void> {
  const db = await getDb();
  await db.execAsync('BEGIN');
  try {
    await db.runAsync('DELETE FROM products;');
    for (const product of products) {
      await db.runAsync(
        `INSERT INTO products (product_id, name, category_id, category_name, price, is_available, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        product.product_id,
        product.name,
        product.category_id,
        product.category_name,
        product.price,
        product.is_available ? 1 : 0,
        product.image_url,
      );
    }
    await db.execAsync('COMMIT');
  } catch (err) {
    await db.execAsync('ROLLBACK');
    throw err;
  }
}

export async function getLocalCategories(): Promise<
  { category_id: string; name: string; created_at?: string | null }[]
> {
  const db = await getDb();
  return db.getAllAsync<{
    category_id: string;
    name: string;
    created_at?: string | null;
  }>(`SELECT * FROM categories`);
}

export async function replaceLocalCategories(
  categories: {
    category_id: string;
    name: string;
    created_at?: string | null;
  }[],
): Promise<void> {
  const db = await getDb();
  await db.execAsync('BEGIN');
  try {
    await db.runAsync('DELETE FROM categories;');
    for (const category of categories) {
      await db.runAsync(
        `INSERT INTO categories (category_id, name, created_at) VALUES (?, ?, ?)`,
        category.category_id,
        category.name,
        category.created_at ?? null,
      );
    }
    await db.execAsync('COMMIT');
  } catch (err) {
    await db.execAsync('ROLLBACK');
    throw err;
  }
}

export async function getLocalUsers(): Promise<LocalUser[]> {
  const db = await getDb();
  return db.getAllAsync<LocalUser>(`SELECT * FROM users`);
}

export async function upsertLocalUsers(users: LocalUser[]): Promise<void> {
  const db = await getDb();
  await db.execAsync('BEGIN');
  try {
    await db.runAsync('DELETE FROM users;');
    for (const user of users) {
      await db.runAsync(
        `INSERT INTO users (user_id, username, role) VALUES (?, ?, ?)`,
        user.user_id,
        user.username,
        user.role,
      );
    }
    await db.execAsync('COMMIT');
  } catch (err) {
    await db.execAsync('ROLLBACK');
    throw err;
  }
}

export async function upsertLocalUser(profile: LocalUser): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO users (user_id, username, role) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET username = excluded.username, role = excluded.role`,
    profile.user_id,
    profile.username,
    profile.role,
  );
}

export async function getLocalInventory(): Promise<
  {
    stock_id: number;
    product_id: number;
    quantity: number;
    reorder_level: number;
  }[]
> {
  const db = await getDb();
  return db.getAllAsync<{
    stock_id: number;
    product_id: number;
    quantity: number;
    reorder_level: number;
  }>(`SELECT * FROM inventory`);
}

export async function replaceLocalInventory(
  inventory: {
    stock_id: number;
    product_id: number;
    quantity: number;
    reorder_level: number;
  }[],
): Promise<void> {
  const db = await getDb();
  await db.execAsync('BEGIN');
  try {
    await db.runAsync('DELETE FROM inventory;');
    for (const record of inventory) {
      await db.runAsync(
        `INSERT INTO inventory (stock_id, product_id, quantity, reorder_level)
         VALUES (?, ?, ?, ?)`,
        record.stock_id,
        record.product_id,
        record.quantity,
        record.reorder_level,
      );
    }
    await db.execAsync('COMMIT');
  } catch (err) {
    await db.execAsync('ROLLBACK');
    throw err;
  }
}

export async function upsertLocalInventory(record: {
  product_id: number;
  quantity: number;
  reorder_level: number;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO inventory (product_id, quantity, reorder_level) VALUES (?, ?, ?)
     ON CONFLICT(product_id) DO UPDATE SET quantity = excluded.quantity, reorder_level = excluded.reorder_level`,
    record.product_id,
    record.quantity,
    record.reorder_level,
  );
}

export async function decrementLocalInventory(
  productId: number,
  quantity: number,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE inventory SET quantity = MAX(0, quantity - ?) WHERE product_id = ?`,
    quantity,
    productId,
  );
}

export async function getLocalTransactions(): Promise<LocalTransaction[]> {
  const db = await getDb();
  return db.getAllAsync<LocalTransaction>(`SELECT * FROM transactions`);
}

export async function getLocalTransactionItems(
  transactionId: string,
): Promise<{ product_id: number; quantity: number; subtotal: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{
    product_id: number;
    quantity: number;
    subtotal: number;
  }>(
    `SELECT product_id, quantity, subtotal FROM transaction_items WHERE transaction_id = ?`,
    transactionId,
  );
}
