# Database Reference

Hand-written from `supabase/migrations/` (0001–0007) and the local SQLite
schema in `src/services/sqlite.ts`. Two stores:

- **Supabase (Postgres)** — online source of truth. Auth lives in Supabase
  Auth (`auth.users`); the app's `user` table holds the role profile row.
- **SQLite** — offline mirror of reference data + queue of unsynced writes.

---

## 1. Supabase tables

### `product`

| Column         | Type                          | Notes                                                                               |
| -------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| `product_id`   | bigint identity PK            |                                                                                     |
| `name`         | text NOT NULL                 |                                                                                     |
| `category_id`  | uuid NOT NULL                 | FK → `category.category_id` (from 0002; legacy free-text `category` column dropped) |
| `price`        | numeric NOT NULL DEFAULT 0    |                                                                                     |
| `is_available` | boolean NOT NULL DEFAULT true |                                                                                     |
| `image_url`    | text                          | nullable; added 0005                                                                |

### `category`

| Column        | Type                               | Notes                                             |
| ------------- | ---------------------------------- | ------------------------------------------------- |
| `category_id` | uuid PK DEFAULT gen_random_uuid()  |                                                   |
| `name`        | text NOT NULL UNIQUE               | `Uncategorized` is reserved and cannot be deleted |
| `created_at`  | timestamptz NOT NULL DEFAULT now() |                                                   |

### `user`

| Column      | Type                            | Notes                                                                   |
| ----------- | ------------------------------- | ----------------------------------------------------------------------- |
| `user_id`   | uuid PK                         | references `auth.users`                                                 |
| `username`  | text UNIQUE NOT NULL            | used as the login email/identifier                                      |
| `password`  | text                            | legacy/seed only — auth lives in `auth.users`; never written by the app |
| `role`      | text NOT NULL DEFAULT 'cashier' | CHECK `in ('admin','cashier')`                                          |
| `is_active` | boolean NOT NULL DEFAULT true   |                                                                         |

### `inventory`

| Column          | Type                       | Notes                                        |
| --------------- | -------------------------- | -------------------------------------------- |
| `stock_id`      | bigint identity PK         |                                              |
| `product_id`    | bigint NOT NULL            | FK → `product(product_id)` ON DELETE CASCADE |
| `quantity`      | integer NOT NULL DEFAULT 0 | CHECK `>= 0`                                 |
| `reorder_level` | integer NOT NULL DEFAULT 0 |                                              |

### `transactions`

| Column            | Type                              | Notes                                                |
| ----------------- | --------------------------------- | ---------------------------------------------------- |
| `id`              | uuid PK                           | client-generated UUID (dedup)                        |
| `order_number`    | int                               | per-day sequence, allocated by `process_sale` (0004) |
| `total_amount`    | numeric NOT NULL DEFAULT 0        | recomputed server-side; CHECK `>= 0`                 |
| `payment_mode`    | text NOT NULL                     | CHECK `in ('cash','gcash','maya')`                   |
| `user_id`         | uuid NOT NULL                     | FK → `user(user_id)`                                 |
| `date`            | timestamptz NOT NULL              |                                                      |
| `status`          | text NOT NULL DEFAULT 'completed' | `completed` / `voided`                               |
| `void_reason`     | text                              | nullable                                             |
| `amount_received` | numeric                           | nullable; CHECK `>= 0`                               |
| `change_given`    | numeric                           | nullable                                             |

Index: `idx_transactions_user (user_id)` (cashier "own transactions" filter).

### `transaction_items`

| Column           | Type             | Notes                                     |
| ---------------- | ---------------- | ----------------------------------------- |
| `id`             | uuid PK          | generated by RPC (`gen_random_uuid()`)    |
| `transaction_id` | uuid NOT NULL    | FK → `transactions(id)` ON DELETE CASCADE |
| `product_id`     | bigint NOT NULL  | FK → `product(product_id)`                |
| `quantity`       | integer NOT NULL | CHECK `> 0`                               |
| `subtotal`       | numeric NOT NULL | CHECK `>= 0`; recomputed server-side      |

### `stock_movements`

| Column        | Type                 | Notes                                        |
| ------------- | -------------------- | -------------------------------------------- |
| `movement_id` | bigint identity PK   |                                              |
| `stock_id`    | bigint NOT NULL      | FK → `inventory(stock_id)` ON DELETE CASCADE |
| `type`        | text NOT NULL        | CHECK `in ('in','out')`                      |
| `quantity`    | integer NOT NULL     | CHECK `> 0`                                  |
| `date`        | timestamptz NOT NULL |                                              |
| `supplier`    | text                 | nullable; set on stock-in                    |

### `order_number_counter`

| Column | Type                   | Notes                         |
| ------ | ---------------------- | ----------------------------- |
| `day`  | date PK                | business day in `Asia/Manila` |
| `last` | int NOT NULL DEFAULT 0 |                               |

Allocated by `process_sale` under a row lock; RLS enabled with no client
policies (only the SECURITY DEFINER RPC touches it — 0006).

---

## 2. RPCs (SECURITY DEFINER)

All are `security definer` with `set search_path = public`, revoked from
`public` and granted to `authenticated`.

### `get_app_role() → text`

Reads the caller's `role` from `user` bypassing RLS. Used by every policy and
RPC for authorization.

### `process_sale(p_transaction_id uuid, p_payment_mode text, p_amount_received numeric, p_change_given numeric, p_items jsonb, p_date timestamptz) → uuid`

- **Idempotent:** if the transaction id already exists, returns it unchanged
  (0004) — safe for offline-sync retries.
- Rejects unauthenticated calls (`get_app_role()` null).
- Allocates a daily `order_number` (fixed `Asia/Manila` business day, row-lock
  on `order_number_counter`).
- Inserts the transaction with `total_amount = 0`, then loops `p_items`
  (array of `{ product_id, quantity }`):
  - looks up `product.price` (client amounts ignored), validates `qty > 0`,
  - inserts `transaction_items` with `subtotal = price × qty`,
  - locks the `inventory` row (`FOR UPDATE`), rejects insufficient stock,
  - decrements stock and logs a `stock_movements` `out` row,
  - accumulates the real total.
- Updates `total_amount` and returns the id. One transaction — any failure
  rolls back everything.

### `adjust_stock(p_stock_id bigint, p_quantity integer, p_supplier text) → void`

- Admin only.
- Validates `quantity > 0`, increments inventory, logs `stock_movements`
  `in` with supplier. Errors if the stock row doesn't exist.

### `void_sale(p_transaction_id uuid, p_reason text) → void`

- Admin or the transaction's owning cashier.
- Rejects already-voided transactions; requires a non-empty path (app enforces
  reason).
- Restores each line item's quantity to `inventory`, logs `stock_movements`
  `in` rows, then sets `status = 'voided'` + `void_reason`.

### `set_user_active(p_user_id uuid, p_active boolean) → void`

- Active-admin only. Toggles `is_active`; rejects self-disable and disabling
  the final active admin. Account-status changes are serialized to keep that
  safeguard valid under concurrent requests. Role is never client-writable.
- The client invokes this through `set-user-active`, which also bans/unbans the
  corresponding Supabase Auth user.

---

## 3. RLS matrix

Policies use `get_app_role()`, which returns no role for an inactive profile.
Direct client writes to `transactions`,
`transaction_items`, and `user` are **not allowed for either role** — mutation
goes through the RPCs above.

| Table                                       | Admin                       | Cashier                                |
| ------------------------------------------- | --------------------------- | -------------------------------------- |
| `product`                                   | read + write                | read                                   |
| `category`                                  | read + write                | read                                   |
| `inventory`                                 | read + write                | read                                   |
| `stock_movements`                           | read                        | no access                              |
| `transactions`                              | read (all)                  | read (own `user_id`)                   |
| `transaction_items`                         | read (all)                  | read (via own transaction)             |
| `user`                                      | read (all)                  | read (own row only)                    |
| `order_number_counter`                      | no client access (RPC only) | no client access                       |
| `storage.objects` (bucket `product-images`) | read + upload/update/delete | read + upload; update/delete own files |

> Bucket policies: public read; `insert` for any authenticated user; `update`/
> `delete` for the file owner or admin (0007 hardening — a cashier can only
> mutate their own uploads).

---

## 4. Storage

- Bucket **`product-images`** (public, id = name = `product-images`).
- Uploads store `image_url` on `product`. Cleanup on product delete is
  best-effort (`storageApi.deleteProductImage`).

---

## 5. Local SQLite mirror (`ipss.db`)

Modern async `expo-sqlite` (`openDatabaseAsync` / `execAsync`). Seven tables:

| Table               | Purpose                                              | Sync flag |
| ------------------- | ---------------------------------------------------- | --------- |
| `products`          | catalog cache (denormalized with `category_name`)    | —         |
| `categories`        | category cache                                       | —         |
| `users`             | user/profile cache (offline session restore)         | —         |
| `inventory`         | stock cache (one row per `product_id`, unique index) | —         |
| `transactions`      | completed + unsynced sales                           | `synced`  |
| `transaction_items` | line items for local transactions                    | —         |
| `stock_movements`   | offline stock-ins                                    | `synced`  |

Key behaviors:

- **Cache replace** (`replaceLocalProducts/Categories/Inventory`,
  `upsertLocalUsers`): DELETE + INSERT in one SQLite transaction
  (`withTransactionAsync`), run sequentially from `catalogSync`.
- **Offline sale** (`saveOfflineSale`): inserts the transaction + all items +
  decrements local inventory in a **single transaction** — a partial write can
  never commit.
- **Offline stock-in** (`saveOfflineStockIn`): inserts the movement (`synced 0`)
  - increments local inventory atomically.
- **Dedup guard**: `idx_inventory_product` unique index on `product_id`
  (inventory dedup cleanup runs on init).

---

## 6. Migration map

| File                                    | Content                                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `0001_init.sql`                         | Core tables + permissive dev-preview RLS                                                                                              |
| `0002_categories.sql`                   | `category` table + FK; legacy `product.category` backfilled and dropped                                                               |
| `0003_rbac.sql`                         | Role-gated RLS, CHECK constraints, atomic write RPCs (`get_app_role`, `process_sale`, `adjust_stock`, `void_sale`, `set_user_active`) |
| `0004_add_order_number.sql`             | `order_number` + `order_number_counter`; idempotent/concurrency-safe `process_sale`                                                   |
| `0005_add_product_image.sql`            | `product.image_url` + public `product-images` bucket + policies                                                                       |
| `0006_secure_order_counter_rls.sql`     | RLS on `order_number_counter`, revoke client access                                                                                   |
| `0007_secure_product_image_storage.sql` | Storage hardening: update/delete restricted to owner/admin                                                                            |
| `0008_clear_legacy_passwords.sql`       | Clears legacy plaintext values from the public user profile table                                                                     |
| `0009_enforce_active_users.sql`         | Denies inactive profiles through RLS and protects self/final-admin account status changes                                             |

All migrations are reproducible locally via `make db-reset`; `make db-seed`
idempotently refreshes demo users and data.
