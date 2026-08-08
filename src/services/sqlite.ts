import * as SQLite from 'expo-sqlite';

export type LocalTableName =
  'transactions' | 'transaction_items' | 'inventory' | 'stock_movements';

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
  `);
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

const pkColumn: Record<LocalTableName, string> = {
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
  table: LocalTableName,
): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(`SELECT * FROM ${table} WHERE synced = 0`);
}

export async function markSynced(
  table: LocalTableName,
  id: string | number,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE ${table} SET synced = 1 WHERE ${pkColumn[table]} = ?`,
    id,
  );
}
