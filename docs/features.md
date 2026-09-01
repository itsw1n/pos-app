# Feature Inventory

Developer-facing map of every feature in the codebase: what it does, where it
lives in code, and its build status.

**Status definitions**

- **implemented** — full working code path (UI → hook → api → DB).
- **partial** — works with known limits.
- **stubbed** — UI visible but inert (rendered gray, no behavior).
- **planned** — does not exist in the app yet (see `future-plans.md`).

All paths are relative to `src/` unless noted.

---

## Cross-cutting

| Concern                                            | Status      | Code                                                           |
| -------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| Supabase client (env-gated, crash-proof)           | implemented | `services/supabase.ts`                                         |
| SQLite local mirror (7 tables)                     | implemented | `services/sqlite.ts`                                           |
| Offline cache refresh on start / connect / sign-in | implemented | `services/catalogSync.ts`, `hooks/useOfflineSync.ts`           |
| Pending write sync (sales + stock-ins, dedup)      | implemented | `services/syncService.ts`                                      |
| Connectivity banner                                | implemented | `components/common/OfflineBanner/`, `hooks/useConnectivity.ts` |
| Error boundary                                     | implemented | `components/common/ErrorBoundary/`                             |
| Design-token theme                                 | implemented | `theme/`, `styles/textStyles.ts`                               |

---

## Auth & session

| Status      | Screens                                 | Hooks / Context           | API              | DB                          |
| ----------- | --------------------------------------- | ------------------------- | ---------------- | --------------------------- |
| implemented | `features/shared/login/pages/Login.tsx` | `context/AuthContext.tsx` | `api/authApi.ts` | `user` table, Supabase Auth |

Details:

- Sign-in via `supabase.auth.signInWithPassword` (email = username).
- Profile (`user_id`, `username`, `role`) fetched from the `user` table.
- Profile persisted to the local `users` cache; offline cold start restores it
  without a password prompt (`AuthContext.tsx` → `resolveProfileOffline`).
- Login form supports demo-account hint; role gates navigation.

---

## POS (cashier core)

| Status      | Screens                                                                              | Hooks / Context                               | API                                          | DB                                                                             |
| ----------- | ------------------------------------------------------------------------------------ | --------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| implemented | `features/cashier/menu/pages/Menu.tsx`, `Checkout.tsx`, `Payment.tsx`, `Receipt.tsx` | `hooks/useMenu.ts`, `context/CartContext.tsx` | `api/productApi.ts`, `api/transactionApi.ts` | `product`, `transactions`, `transaction_items`, `inventory`, `stock_movements` |

Details:

- Menu reads products (cache-first via `useMenu`), grouped by category with
  search; unavailable items hidden/disabled.
- Cart is a global context (`CartContext`): add / increment / decrement /
  remove, running total.
- Checkout captures optional customer name; Payment handles cash
  (amount received → change), GCash, and Maya.
- `processTransaction` (see `useMenu.ts` / checkout flow):
  - Online → `supabase.rpc('process_sale')` (server recomputes total, deducts
    stock, logs `stock_movements` `out`, allocates daily order number).
  - Offline → `services/sqlite.ts::saveOfflineSale` (transaction + items +
    local inventory decrement in one SQLite transaction).
  - UUID ids from `react-native-uuid` prevent sync duplicates.
- Receipt screen → view / share PDF / thermal print (see Receipts below).

---

## Receipts & printing

| Status      | Screens                                   | Hooks / Services                                                                         | API                        | DB             |
| ----------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------- | -------------- |
| implemented | `features/cashier/menu/pages/Receipt.tsx` | `services/receiptService.ts`, `services/printerService.ts`, `services/printerStorage.ts` | — (reads transaction rows) | `transactions` |

Details:

- `buildReceiptHtml` is the single HTML source of truth used by both the share
  PDF and the system-dialog fallback (`receiptService.ts:73`).
- Thermal print: `printReceiptToThermal` builds an ESC/POS document
  (`buildReceiptDocument`) for Bluetooth/BLE/WiFi printers via
  `react-native-thermal-printer-driver`. Requires a **custom dev build** —
  `THERMAL_SUPPORTED = Platform.OS !== 'web'` and the module is loaded lazily
  so importing never crashes Expo Go/web bundles.
- Pairing config persisted in AsyncStorage (`printerStorage.ts`).
- Barcode (Code128) rendered via `utils/code128.ts` and embedded in both the
  HTML receipt and the thermal document.

---

## Orders / transactions

| Status      | Screens                                                                                   | Hooks / Services     | API                     | DB                                  |
| ----------- | ----------------------------------------------------------------------------------------- | -------------------- | ----------------------- | ----------------------------------- |
| implemented | `features/shared/orders/pages/Orders.tsx`, `TransactionDetail.tsx`, `VoidTransaction.tsx` | `hooks/useOrders.ts` | `api/transactionApi.ts` | `transactions`, `transaction_items` |

Details:

- List filters by role: cashier sees own (`user_id = me`), admin sees all.
- Detail shows items, payment, status; row count sanity-checks local/remote.
- Void: requires non-empty reason; calls `supabase.rpc('void_sale')` — guards
  already-voided, checks owner/admin, restores stock, logs `in` movement.
- Offline void is not supported (void requires the server RPC).

---

## Inventory

| Status      | Screens                                                                                                                                          | Hooks                   | API                   | DB                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | --------------------- | ------------------------------ |
| implemented | `features/cashier/inventory/pages/Inventory.tsx` (read-only), `features/admin/inventory-management/pages/InventoryManagement.tsx`, `StockIn.tsx` | `hooks/useInventory.ts` | `api/inventoryApi.ts` | `inventory`, `stock_movements` |

Details:

- `useInventory` hydrates from SQLite first, then refreshes remotely.
- Stock status: `quantity <= 0` → critical (danger), `<= reorder_level` → low
  (warning), else ok (success). Badges rendered via `StockBadge`.
- Stock-in (`addStock`): online → `rpc('adjust_stock')`; offline →
  `saveOfflineStockIn` (movement + local increment in one transaction), pushed
  later by `syncService`.
- Admin manages reorder levels; cashier only views.

---

## Menu management (admin)

| Status      | Screens                                                                                                                                     | Hooks                                                  | API                                                            | DB                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------ |
| implemented | `features/admin/menu-management/pages/MenuManagement.tsx`, `AddEditMenuItem.tsx`; components `AddCategoryModal.tsx`, `ImagePickerField.tsx` | `hooks/useMenuManagement.ts`, `hooks/useCategories.ts` | `api/productApi.ts`, `api/categoryApi.ts`, `api/storageApi.ts` | `product`, `category`, storage bucket `product-images` |

Details:

- Product CRUD + availability toggle; image upload via `expo-image-picker` →
  `storageApi.uploadProductImage` (base64 → public URL).
- Category CRUD; deleting a category reassigns its products to
  `Uncategorized` (guarded, non-deletable).
- Deleting a product best-effort removes its image (`deleteProductImage`).

---

## Reports & dashboard (admin)

| Status      | Screens                                                                       | Hooks                 | API                                                                 | DB                                                          |
| ----------- | ----------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- |
| implemented | `features/admin/reports/pages/Dashboard.tsx`, `Reports.tsx`, `TopSelling.tsx` | `hooks/useReports.ts` | `api/transactionApi.ts`, `api/inventoryApi.ts`, `api/productApi.ts` | `transactions`, `transaction_items`, `inventory`, `product` |

Details:

- Dashboard: total revenue, order count, 7-day custom react-native-svg bar chart, low-stock list,
  top 5 products today.
- Reports: date-range sales report (revenue, orders, AOV, payment-mode
  breakdown, daily breakdown), inventory report (stock value, low/out counts).
- Voided transactions are excluded from all metrics (`isActive`).
- Top selling: aggregates `transaction_items` grouped by product, sorted by
  revenue.

---

## User management (admin)

| Status      | Screens                                             | Hooks               | API                                                          | DB                       |
| ----------- | --------------------------------------------------- | ------------------- | ------------------------------------------------------------ | ------------------------ |
| implemented | `features/shared/settings/pages/UserManagement.tsx` | `hooks/useUsers.ts` | `api/userApi.ts`, edge fns `create-user` / `set-user-active` | `user` (+ Supabase Auth) |

Details:

- Create user via `supabase.functions.invoke('create-user', …)` — admin-only
  edge function provisions the Auth account + profile row; email validated
  before submit.
- Enable/disable via the admin-only `set-user-active` edge function. It updates
  the profile through the guarded `set_user_active` RPC and bans/unbans the
  matching Supabase Auth identity. An admin cannot disable their own account or
  the final active admin.

---

## Printer settings (admin)

| Status      | Screens                                              | Services                                                   | API |
| ----------- | ---------------------------------------------------- | ---------------------------------------------------------- | --- |
| implemented | `features/shared/settings/pages/PrinterSettings.tsx` | `services/printerService.ts`, `services/printerStorage.ts` | —   |

Details:

- Scan Bluetooth printers, connect/test, save pairing, manual WiFi
  (`host:port`), reconnect + test print.

---

## Stubbed / planned features

These rows exist in the Settings screen (`features/shared/settings/pages/Settings.tsx`)
rendered gray and inert with a "Coming soon" badge. No screen, hook, API, or DB
code exists for them.

| Feature                        | Settings row (line)         | Promised caption                        | Status      |
| ------------------------------ | --------------------------- | --------------------------------------- | ----------- |
| Personal Information           | `Settings.tsx:140`          | "Update your name, email, and phone"    | stubbed     |
| Security & Password / 2FA      | `Settings.tsx:146`          | "Change your password and enable 2FA"   | stubbed     |
| Notification Preferences       | `Settings.tsx:165`          | "Manage sales and stock notifications"  | stubbed     |
| Dark Mode                      | `Settings.tsx:172`          | "Switch the app to a dark color scheme" | stubbed     |
| Excel export (inventory / POS) | Admin inventory and reports | `services/exportService.ts`             | implemented |

> Shipping requirements for each are in [`future-plans.md`](future-plans.md).
