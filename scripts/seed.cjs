/*
 * scripts/seed.cjs
 * Seeds the local Supabase database with demo data (users, categories,
 * products, inventory, demo transactions) so the UI can be previewed.
 *
 * Responsibilities (DATA ONLY — this does NOT apply or modify any schema):
 *   - upsert demo auth users + app "user" profile rows
 *   - upsert categories / products / inventory
 *   - upsert stock-movement history and demo transactions
 *   - realign identity sequences so seeded explicit ids don't collide with
 *     the next runtime insert (the runtime inserts go through the process_sale
 *     RPC / adjust_stock RPC, not this script)
 *
 * Safety:
 *   - Refuses to run against non-local API and database URLs.
 *   - Assumes the DB schema is already migrated by `supabase db reset`.
 *
 * Usage:
 *   make db-seed                     # idempotent local seed
 *
 * Required env (injected by scripts/local-supabase-env.sh):
 *   DATABASE_URL              (local Postgres connection string)
 *   SUPABASE_URL              (local API URL)
 *   SUPABASE_SERVICE_ROLE_KEY (local service_role key)
 *
 * Demo credentials (created here):
 *   admin   @elvira.cafe / admin123   (Admin)
 *   cashier @elvira.cafe / cashier123 (Cashier)
 */
'use strict';

const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- Safety guard: local-only ----------------------------------------------
function assertLocalOnly() {
  if (!DATABASE_URL || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      'DATABASE_URL, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are required. Run through make db-seed.',
    );
  }

  try {
    const databaseHost = new URL(DATABASE_URL).hostname;
    const apiHost = new URL(SUPABASE_URL).hostname;
    const localHosts = new Set(['127.0.0.1', 'localhost', '::1']);
    if (!localHosts.has(databaseHost) || !localHosts.has(apiHost)) {
      throw new Error('refusing to seed a non-local Supabase project');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid URL';
    throw new Error(`Local seed safety check failed: ${message}`);
  }
}

assertLocalOnly();

async function withDb(callback) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required (run through make db-seed)');
  }
  const client = new Client({
    connectionString: DATABASE_URL,
  });
  try {
    await client.connect();
    await callback(client);
  } finally {
    await client.end();
  }
}

const ADMIN_EMAIL = 'admin@elvira.cafe';
const CASHIER_EMAIL = 'cashier@elvira.cafe';

const authUsers = [
  {
    email: ADMIN_EMAIL,
    password: 'admin123',
    role: 'admin',
    username: 'admin',
  },
  {
    email: CASHIER_EMAIL,
    password: 'cashier123',
    role: 'cashier',
    username: 'cashier',
  },
];

// Deterministic category UUIDs (stable across re-seeds).
const CATEGORIES = [
  { name: 'All Day Breakfast', id: 1 },
  { name: 'Set Meal', id: 2 },
  { name: 'Sandwiches', id: 3 },
  { name: 'Short Order', id: 4 },
  { name: 'Hot Drinks', id: 5 },
  { name: 'Ice Drinks', id: 6 },
  { name: 'Blended Coffee / Frappe', id: 7 },
  { name: 'Blended Milkshake / Frappe', id: 8 },
  { name: 'Fruit Smoothies', id: 9 },
  { name: 'Fruit Soda', id: 10 },
  { name: 'Lemonade / Tea', id: 11 },
].map(({ name, id }) => ({
  name,
  category_id: `9f5a3c3e-0000-4000-8000-0000000000${String(id).padStart(2, '0')}`,
}));

const CATEGORY_ID_BY_NAME = Object.fromEntries(
  CATEGORIES.map((category) => [category.name, category.category_id]),
);

// Full Elvira menu, grouped in menu order. product ids are deterministic so
// transactions / inventory links stay stable across re-seeds.
const MENU = [
  ['All Day Breakfast', '1000000001', 'Corned Beef with Egg', 130],
  ['All Day Breakfast', '1000000002', 'Tocino with Egg', 120],
  ['All Day Breakfast', '1000000003', 'Longganisa with Egg', 120],
  ['All Day Breakfast', '1000000004', 'Bacon with Egg', 130],
  ['Set Meal', '1000000005', 'Pork Tonkatsu', 125],
  ['Set Meal', '1000000006', 'Chicken Tonkatsu', 125],
  ['Set Meal', '1000000007', 'Chicken Karaage', 125],
  ['Set Meal', '1000000008', 'Shrimp Tempura', 145],
  ['Sandwiches', '1000000009', 'Tuna Spread', 100],
  ['Sandwiches', '1000000010', 'Ham and Cheese', 110],
  ['Sandwiches', '1000000011', 'Club Sandwich', 125],
  ['Sandwiches', '1000000012', 'Chicken Sandwich', 110],
  ['Short Order', '1000000013', 'Pancit Canton w/ Egg', 69],
  ['Short Order', '1000000014', 'Chicken Nuggets', 99],
  ['Short Order', '1000000015', 'French Fries w/ Flavor', 95],
  ['Short Order', '1000000016', 'Instant Ramen Noodles', 100],
  ['Hot Drinks', '1000000017', 'Espresso', 110],
  ['Hot Drinks', '1000000018', 'Café Americano', 110],
  ['Hot Drinks', '1000000019', 'Latte', 120],
  ['Hot Drinks', '1000000020', 'Café Elvira', 145],
  ['Ice Drinks', '1000000021', 'Black', 120],
  ['Ice Drinks', '1000000022', 'Latte', 120],
  ['Ice Drinks', '1000000023', 'Mocha', 130],
  ['Ice Drinks', '1000000024', 'Caramel', 130],
  ['Blended Coffee / Frappe', '1000000025', 'Almond Mocha', 155],
  ['Blended Coffee / Frappe', '1000000026', 'Salted Caramel', 155],
  ['Blended Coffee / Frappe', '1000000027', 'Butterscotch Latte', 155],
  ['Blended Coffee / Frappe', '1000000028', 'Matcha Latte', 160],
  ['Blended Milkshake / Frappe', '1000000029', 'Matcha', 155],
  ['Blended Milkshake / Frappe', '1000000030', 'Dark Chocolate', 150],
  ['Blended Milkshake / Frappe', '1000000031', "Cookies N' Cream", 150],
  ['Blended Milkshake / Frappe', '1000000032', 'White Vanilla', 150],
  ['Fruit Smoothies', '1000000033', 'Avocado', 150],
  ['Fruit Smoothies', '1000000034', 'Mango', 150],
  ['Fruit Soda', '1000000035', 'Peach', 95],
  ['Fruit Soda', '1000000036', 'Lemon', 95],
  ['Fruit Soda', '1000000037', 'Kiwi', 95],
  ['Fruit Soda', '1000000038', 'Strawberry', 95],
  ['Lemonade / Tea', '1000000039', 'Cucumber Lemonade', 58],
  ['Lemonade / Tea', '1000000040', 'Ice Tea', 55],
  ['Lemonade / Tea', '1000000041', 'Lipton Tea', 100],
  ['Lemonade / Tea', '1000000042', 'Ombre Tea', 100],
];

const products = MENU.map(([category, _productId, name, price], index) => ({
  product_id: index + 1,
  name,
  category,
  price,
  is_available: true,
})).map((product) => ({
  ...product,
  category_id: CATEGORY_ID_BY_NAME[product.category],
}));

// Stock for each product (stock_id mirrors product_id). A few items are
// intentionally low/out-of-stock so the StockBadge states are visible.
const stockOverrides = {
  4: [8, 10], // Bacon w/ Egg — low
  6: [0, 10], // Chicken Tonkatsu - critical
  19: [45, 8], // Latte - healthy
  30: [40, 10], // Dark Chocolate - healthy
};

const inventory = products.map((product) => {
  const [quantity, reorder_level] = stockOverrides[product.product_id] ?? [
    30, 10,
  ];
  return {
    stock_id: product.product_id,
    product_id: product.product_id,
    quantity,
    reorder_level,
  };
});

const stockMovements = [
  {
    movement_id: 1,
    stock_id: 1,
    type: 'in',
    quantity: 30,
    date: '2026-08-01T09:00:00Z',
    supplier: 'Fresh Provisions',
  },
  {
    movement_id: 2,
    stock_id: 6,
    type: 'out',
    quantity: 6,
    date: '2026-08-02T10:00:00Z',
    supplier: null,
  },
  {
    movement_id: 3,
    stock_id: 19,
    type: 'in',
    quantity: 25,
    date: '2026-08-01T09:00:00Z',
    supplier: 'Bean Roasters',
  },
  {
    movement_id: 4,
    stock_id: 31,
    type: 'out',
    quantity: 10,
    date: '2026-08-04T12:00:00Z',
    supplier: null,
  },
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

const productPrice = new Map(
  products.map((product) => [product.product_id, product.price]),
);

// [transaction_id, product_id, quantity]
const TX_ITEMS = [
  [TX.amer, 28, 1], // Matcha Latte x1
  [TX.amer, 3, 1], // Longganisa x1
  [TX.capp, 4, 1], // Bacon w/ Egg x1
  [TX.capp, 14, 2], // Chicken Nuggets x2
  [TX.aff, 19, 1], // Latte x1
  [TX.aff, 37, 1], // Strawberry x1
  [TX.iced, 24, 1], // Caramel x1
].map(([transactionId, productId, quantity]) => ({
  transaction_id: transactionId,
  product_id: productId,
  quantity: quantity ?? 1,
}));

const transactions = [
  {
    id: TX.amer,
    payment_mode: 'cash',
    user_id: cashierId,
    date: '2026-07-30T10:15:00Z',
    status: 'completed',
    void_reason: null,
    amount_received: 300,
  },
  {
    id: TX.capp,
    payment_mode: 'gcash',
    user_id: adminId,
    date: '2026-07-31T13:40:00Z',
    status: 'completed',
    void_reason: null,
    amount_received: null,
  },
  {
    id: TX.aff,
    payment_mode: 'cash',
    user_id: cashierId,
    date: '2026-08-01T16:20:00Z',
    status: 'completed',
    void_reason: null,
    amount_received: 300,
  },
  {
    id: TX.iced,
    payment_mode: 'maya',
    user_id: adminId,
    date: '2026-08-02T18:10:00Z',
    status: 'voided',
    void_reason: 'Customer refund',
    amount_received: null,
  },
];

function itemSubtotal({ product_id, quantity }) {
  return (productPrice.get(product_id) ?? 0) * quantity;
}

const transactionItems = TX_ITEMS.map((item, index) => ({
  id: `11111111-1111-1111-1111-${String(100000000000 + index + 1)}`,
  ...item,
  subtotal: itemSubtotal(item),
}));

// Replace the hardcoded totals / change with computed, consistent values.
for (const txn of transactions) {
  const items = transactionItems.filter(
    (item) => item.transaction_id === txn.id,
  );
  txn.total_amount = items.reduce((sum, item) => sum + item.subtotal, 0);
  if (txn.amount_received != null && txn.payment_mode === 'cash') {
    txn.change_given = txn.amount_received - txn.total_amount;
  }
}

const UPSERT_CATEGORIES = `
insert into category (category_id, name)
values $1
on conflict (name) do update
  set category_id = excluded.category_id;`;

const UPSERT_PRODUCTS = `
insert into product (product_id, name, category_id, price, is_available)
values $1
on conflict (product_id) do update
  set name = excluded.name,
      category_id = excluded.category_id,
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
      password = null,
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
        ')',
    )
    .join(', ');
  const flattened = rows.flatMap((row) => columns.map((c) => row[c]));
  return { text: clauses, values: flattened };
}

async function upsertRows(client, sql, rows, columns) {
  if (rows.length === 0) return;
  const { text, values } = valuesClause(rows, columns);
  const expanded = sql.includes('$1')
    ? sql.replace('$1', text)
    : `${sql} ${text}`;
  await client.query(expanded, values);
}

// `generated by default as identity` sequences are not advanced when rows are
// inserted with an explicit id. After seeding identity-backed tables, push each
// sequence past the max seeded id so runtime inserts (new products / stock-in
// movements via adjust_stock / process_sale) don't collide with a seeded id and
// surface as a unique-violation (HTTP 409).
const IDENTITY_TABLES = [
  { table: 'product', column: 'product_id' },
  { table: 'inventory', column: 'stock_id' },
  { table: 'stock_movements', column: 'movement_id' },
];

async function syncIdentitySequences(client) {
  for (const { table, column } of IDENTITY_TABLES) {
    await client.query(
      `select setval(
         pg_get_serial_sequence('${table}', '${column}'),
         coalesce((select max(${column}) from ${table}), 0),
         true
       )`,
    );
  }
}

async function upsertTransactions(client) {
  // Idempotent: replace the seeded transaction set.
  await client.query(
    'delete from transaction_items where transaction_id = any($1::uuid[]);',
    [transactions.map((t) => t.id)],
  );
  await client.query('delete from transactions where id = any($1::uuid[]);', [
    transactions.map((t) => t.id),
  ]);

  // Assign daily sequential order numbers per Manila-calendar day, mirroring
  // the process_sale RPC so seeded rows look like real ones. The 0004
  // order_number_counter backfill already primes the counter from the max, so
  // these numbers continue cleanly after the seeded set.
  const dayCounters = {};
  const txRows = transactions.map((t) => {
    const day = new Date(t.date).toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const n = (dayCounters[day] ?? 0) + 1;
    dayCounters[day] = n;
    return {
      id: t.id,
      total_amount: t.total_amount,
      payment_mode: t.payment_mode,
      user_id: t.user_id,
      date: t.date,
      status: t.status,
      void_reason: t.void_reason,
      amount_received: t.amount_received,
      change_given: t.change_given,
      order_number: n,
    };
  });
  await upsertRows(
    client,
    'insert into transactions (id, total_amount, payment_mode, user_id, date, status, void_reason, amount_received, change_given, order_number) values',
    txRows,
    [
      'id',
      'total_amount',
      'payment_mode',
      'user_id',
      'date',
      'status',
      'void_reason',
      'amount_received',
      'change_given',
      'order_number',
    ],
  );

  await upsertRows(
    client,
    'insert into transaction_items (id, transaction_id, product_id, quantity, subtotal) values',
    transactionItems,
    ['id', 'transaction_id', 'product_id', 'quantity', 'subtotal'],
  );
}

async function upsertAuthUsers() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are required to seed auth users (DEV only).',
    );
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

async function runSeed() {
  const authIds = await upsertAuthUsers();
  adminId = authIds.admin;
  cashierId = authIds.cashier;
  // Refresh transactions to use the real auth uuids.
  transactions[0].user_id = cashierId;
  transactions[1].user_id = adminId;
  transactions[2].user_id = cashierId;
  transactions[3].user_id = adminId;

  await withDb(async (client) => {
    await upsertRows(client, UPSERT_CATEGORIES, CATEGORIES, [
      'category_id',
      'name',
    ]);
    await upsertRows(client, UPSERT_PRODUCTS, products, [
      'product_id',
      'name',
      'category_id',
      'price',
      'is_available',
    ]);
    await upsertRows(client, UPSERT_INVENTORY, inventory, [
      'stock_id',
      'product_id',
      'quantity',
      'reorder_level',
    ]);
    await upsertRows(client, UPSERT_MOVEMENTS, stockMovements, [
      'movement_id',
      'stock_id',
      'type',
      'quantity',
      'date',
      'supplier',
    ]);

    // Realign identity sequences so seeded ids don't collide with runtime inserts.
    await syncIdentitySequences(client);

    // Users must be inserted after auth users resolve to their uuid.
    const rows = authUsers.map((u) => ({
      user_id: authIds[u.username],
      username: u.username,
      password: null,
      role: u.role,
      is_active: true,
    }));
    await upsertRows(client, UPSERT_USER, rows, [
      'user_id',
      'username',
      'password',
      'role',
      'is_active',
    ]);

    await upsertTransactions(client);
  });
}

console.log('[seed] mode=seed (local data only)');
runSeed()
  .then(() => console.log('[seed] complete'))
  .catch((err) => {
    console.error('[seed] failed:', err.message);
    process.exit(1);
  });
