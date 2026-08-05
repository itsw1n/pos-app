/*
 * scripts/seed.cjs
 * Seeds the Supabase Dev project with demo data (users, products, inventory,
 * transactions) so the UI can be previewed without a live backend.
 *
 *   node scripts/seed.cjs seed    -> create schema if missing, upsert demo data
 *   node scripts/seed.cjs reset    -> drop schema, recreate, insert demo data
 *
 * Required env (read from .env / .env.development when present):
 *   DATABASE_URL              (Postgres connection string, service access)
 *   SUPABASE_URL              (project URL)
 *   SUPABASE_SERVICE_ROLE_KEY (service_role key for Auth admin actions)
 *
 * Demo credentials:
 *   admin   @elvira.cafe / admin123   (Admin)
 *   cashier @elvira.cafe / cashier123 (Cashier)
 *
 * Run the app with the matching anon key in .env.development, then log in with
 * one of the demo credentials above.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const ROOT = path.resolve(__dirname, '..');
const SQL_FILE = path.join(ROOT, 'supabase/migrations/0001_init.sql');

function loadEnvFile(file) {
  const target = path.join(ROOT, file);
  if (!fs.existsSync(target)) return;
  for (const line of fs.readFileSync(target, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.development');
loadEnvFile('.env.local');

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLES = [
  'transaction_items',
  'stock_movements',
  'transactions',
  'inventory',
  'user',
  'product',
];

function readSql() {
  return fs.readFileSync(SQL_FILE, 'utf8');
}

async function withDb(callback) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required (set in .env.development / .env.local)');
  }
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await callback(client);
  } finally {
    await client.end();
  }
}

async function ensureSchema(client) {
  await client.query(readSql());
}

async function resetSchema(client) {
  for (const table of TABLES) {
    await client.query(`drop table if exists ${table} cascade;`);
  }
}

const ADMIN_EMAIL = 'admin@elvira.cafe';
const CASHIER_EMAIL = 'cashier@elvira.cafe';

const authUsers = [
  { email: ADMIN_EMAIL, password: 'admin123', role: 'admin', username: 'admin' },
  { email: CASHIER_EMAIL, password: 'cashier123', role: 'cashier', username: 'cashier' },
];

const products = [
  { product_id: 1, name: 'Americano', category: 'Coffee', price: 100, is_available: true },
  { product_id: 2, name: 'Cappuccino', category: 'Coffee', price: 140, is_available: true },
  { product_id: 3, name: 'Affogato', category: 'Dessert', price: 160, is_available: true },
  { product_id: 4, name: 'Iced Coffee Milk', category: 'Coffee', price: 130, is_available: true },
  { product_id: 5, name: 'Luwak Coffee', category: 'Coffee', price: 250, is_available: true },
  { product_id: 6, name: 'Caramel Latte', category: 'Coffee', price: 150, is_available: true },
  { product_id: 7, name: 'Matcha Latte', category: 'Non-Coffee', price: 145, is_available: true },
  { product_id: 8, name: 'Chocolate Cake', category: 'Dessert', price: 120, is_available: true },
  { product_id: 9, name: 'Cheesecake', category: 'Dessert', price: 135, is_available: true },
];

const inventory = [
  { stock_id: 1, product_id: 1, quantity: 40, reorder_level: 20 },
  { stock_id: 2, product_id: 2, quantity: 12, reorder_level: 15 },
  { stock_id: 3, product_id: 3, quantity: 8, reorder_level: 10 },
  { stock_id: 4, product_id: 4, quantity: 0, reorder_level: 15 },
  { stock_id: 5, product_id: 5, quantity: 25, reorder_level: 10 },
  { stock_id: 6, product_id: 6, quantity: 30, reorder_level: 10 },
  { stock_id: 7, product_id: 7, quantity: 18, reorder_level: 10 },
  { stock_id: 8, product_id: 8, quantity: 22, reorder_level: 10 },
  { stock_id: 9, product_id: 9, quantity: 0, reorder_level: 5 },
];

const stockMovements = [
  { movement_id: 1, stock_id: 1, type: 'in', quantity: 40, date: '2026-08-01T09:00:00Z', supplier: 'Green Bean Co.' },
  { movement_id: 2, stock_id: 2, type: 'out', quantity: 12, date: '2026-08-02T10:00:00Z', supplier: null },
  { movement_id: 3, stock_id: 5, type: 'in', quantity: 25, date: '2026-08-01T09:00:00Z', supplier: 'Bean Roasters' },
  { movement_id: 4, stock_id: 4, type: 'out', quantity: 25, date: '2026-08-04T12:00:00Z', supplier: null },
];

// Deterministic UUIDs for transactions (so links are stable between re-seeds).
const TX = {
  amer: '6ba7b810-9dad-11d1-80b4-00c04fd4cafe',
  capp: '6ba7b811-9dad-11d1-80b4-00c04fd4cafe',
  aff: '6ba7b812-9dad-11d1-80b4-00c04fd4cafe',
  iced: '6ba7b813-9dad-11d1-80b4-00c04fd4cafe',
};

let adminId = ADMIN_EMAIL;
let cashierId = CASHIER_EMAIL;

const transactions = [
  {
    id: TX.amer,
    total_amount: 340,
    payment_mode: 'cash',
    user_id: cashierId,
    date: '2026-07-30T10:15:00Z',
    status: 'completed',
    void_reason: null,
    amount_received: 500,
    change_given: 160,
  },
  {
    id: TX.capp,
    total_amount: 610,
    payment_mode: 'gcash',
    user_id: adminId,
    date: '2026-07-31T13:40:00Z',
    status: 'completed',
    void_reason: null,
    amount_received: null,
    change_given: null,
  },
  {
    id: TX.aff,
    total_amount: 295,
    payment_mode: 'cash',
    user_id: cashierId,
    date: '2026-08-01T16:20:00Z',
    status: 'completed',
    void_reason: null,
    amount_received: 500,
    change_given: 205,
  },
  {
    id: TX.iced,
    total_amount: 470,
    payment_mode: 'maya',
    user_id: adminId,
    date: '2026-08-02T18:10:00Z',
    status: 'voided',
    void_reason: 'Customer refund',
    amount_received: null,
    change_given: null,
  },
];

// transaction_id -> items
const transactionItems = [
  { id: '11111111-1111-1111-1111-100000000001', transaction_id: TX.amer, product_id: 1, quantity: 2, subtotal: 200 },
  { id: '11111111-1111-1111-1111-100000000002', transaction_id: TX.amer, product_id: 2, quantity: 1, subtotal: 140 },
  { id: '11111111-1111-1111-1111-100000000003', transaction_id: TX.capp, product_id: 2, quantity: 2, subtotal: 280 },
  { id: '11111111-1111-1111-1111-100000000004', transaction_id: TX.capp, product_id: 7, quantity: 2, subtotal: 290 },
  { id: '11111111-1111-1111-1111-100000000005', transaction_id: TX.aff, product_id: 6, quantity: 1, subtotal: 150 },
  { id: '11111111-1111-1111-1111-100000000006', transaction_id: TX.aff, product_id: 1, quantity: 1, subtotal: 145 },
  { id: '11111111-1111-1111-1111-100000000007', transaction_id: TX.iced, product_id: 4, quantity: 2, subtotal: 260 },
  { id: '11111111-1111-1111-1111-100000000008', transaction_id: TX.iced, product_id: 1, quantity: 1, subtotal: 210 },
];

const UPSERT_PRODUCTS = `
insert into product (product_id, name, category, price, is_available)
values $1
on conflict (product_id) do update
  set name = excluded.name,
      category = excluded.category,
      price = excluded.price,
      is_available = excluded.is_available;`;

const UPSERT_INVENTORY = `
insert into inventory (stock_id, product_id, quantity, reorder_level)
values $1
on conflict (stock_id) do update
  set product_id = excluded.product_id,
      quantity = excluded.quantity,
      reorder_level = excluded.reorder_level;`;

const UPSERT_USER = `
insert into "user" (user_id, username, password, role, is_active)
values $1
on conflict (username) do update
  set user_id = excluded.user_id,
      role = excluded.role,
      is_active = excluded.is_active;`;

const UPSERT_MOVEMENTS = `
insert into stock_movements (movement_id, stock_id, type, quantity, date, supplier)
values $1
on conflict (movement_id) do update
  set stock_id = excluded.stock_id,
      type = excluded.type,
      quantity = excluded.quantity,
      date = excluded.date,
      supplier = excluded.supplier;`;

function valuesClause(rows, columns) {
  const clauses = rows
    .map(
      (_, i) =>
        '(' +
        columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ') +
        ')'
    )
    .join(', ');
  const flattened = rows.flatMap((row) => columns.map((c) => row[c]));
  return { text: clauses, values: flattened };
}

async function upsertRows(client, sql, rows, columns) {
  if (rows.length === 0) return;
  const { text, values } = valuesClause(rows, columns);
  await client.query(`${sql} ${text};`, values);
}

async function upsertTransactions(client) {
  // Idempotent: replace the seeded transaction set.
  await client.query('delete from transaction_items where transaction_id = any($1::uuid[]);', [
    transactions.map((t) => t.id),
  ]);
  await client.query('delete from transactions where id = any($1::uuid[]);', [
    transactions.map((t) => t.id),
  ]);

  const txRows = transactions.map((t) => ({
    id: t.id,
    total_amount: t.total_amount,
    payment_mode: t.payment_mode,
    user_id: t.user_id,
    date: t.date,
    status: t.status,
    void_reason: t.void_reason,
    amount_received: t.amount_received,
    change_given: t.change_given,
  }));
  await upsertRows(
    client,
    'insert into transactions (id, total_amount, payment_mode, user_id, date, status, void_reason, amount_received, change_given) values',
    txRows,
    ['id', 'total_amount', 'payment_mode', 'user_id', 'date', 'status', 'void_reason', 'amount_received', 'change_given']
  );

  await upsertRows(
    client,
    'insert into transaction_items (id, transaction_id, product_id, quantity, subtotal) values',
    transactionItems,
    ['id', 'transaction_id', 'product_id', 'quantity', 'subtotal']
  );
}

async function upsertAuthUsers() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are required to seed auth users');
  }
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const resolvedIds = {};
  const page = await admin.auth.admin.listUsers();
  const existingUsers = (page.data?.users ?? []).reduce((acc, u) => {
    acc[u.email] = u;
    return acc;
  }, {});

  for (const u of authUsers) {
    const existing = existingUsers[u.email];
    if (existing) {
      resolvedIds[u.username] = existing.id;
      await admin.auth.admin.updateUserById(existing.id, {
        password: u.password,
        user_metadata: { role: u.role, username: u.username },
        app_metadata: { role: u.role },
      });
    } else {
      const created = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { username: u.username, role: u.role },
        app_metadata: { role: u.role },
      });
      if (created.error) throw created.error;
      resolvedIds[u.username] = created.data.user.id;
    }
  }
  return resolvedIds;
}

async function runSeed(mode) {
  console.log(`[seed] mode=${mode}`);
  const authIds = await upsertAuthUsers();
  adminId = authIds.admin;
  cashierId = authIds.cashier;
  // Refresh transactions to use the real auth uuids.
  transactions[0].user_id = cashierId;
  transactions[1].user_id = adminId;
  transactions[2].user_id = cashierId;
  transactions[3].user_id = adminId;

  await withDb(async (client) => {
    if (mode === 'reset') {
      console.log('[seed] resetting schema');
      await resetSchema(client);
    }
    await ensureSchema(client);

    await upsertRows(client, UPSERT_PRODUCTS, products, [
      'product_id', 'name', 'category', 'price', 'is_available',
    ]);
    await upsertRows(client, UPSERT_INVENTORY, inventory, [
      'stock_id', 'product_id', 'quantity', 'reorder_level',
    ]);
    await upsertRows(client, UPSERT_MOVEMENTS, stockMovements, [
      'movement_id', 'stock_id', 'type', 'quantity', 'date', 'supplier',
    ]);

    // Users must be inserted after auth users resolve to their uuid.
    const rows = authUsers.map((u) => ({
      user_id: authIds[u.username],
      username: u.username,
      password: u.password,
      role: u.role,
      is_active: true,
    }));
    await upsertRows(client, UPSERT_USER, rows, [
      'user_id', 'username', 'password', 'role', 'is_active',
    ]);

    await upsertTransactions(client);
    console.log('[seed] seed complete');
  });
}

const mode = process.argv[2] || 'seed';
runSeed(mode).catch((err) => {
  console.error('[seed] failed:', err.message);
  process.exit(1);
});