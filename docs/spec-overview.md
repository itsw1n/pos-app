# IPSS — Product Specification Overview

**IPSS: Integrated POS and Stock Monitoring System for Cafe Elvira** is a
mobile-only Point-of-Sale + inventory application. Cashiers take orders from
the menu and complete sales with cash, GCash, or Maya; admins manage the menu,
stock, users, and read reports — all from the same device, with offline-first
support so the counter keeps working when the internet drops.

- Platform: Android (Expo SDK 57 / React Native 0.86, mobile-only)
- Language: TypeScript (strict)
- Online DB + Auth: Supabase
- Offline storage: SQLite (`expo-sqlite`)

> Status legend used throughout: **Shipped** = fully working in the current
> build · **Partial** = works but has known limits · **Coming soon** = visible
> in the UI but inert · **Planned** = not yet in the app.

---

## 1. Users & roles

| Role        | Who they are    | What they can do                                                                                                                                    |
| ----------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cashier** | Counter staff   | Take orders, process payments, issue receipts, view their own sales history, view inventory (read-only)                                             |
| **Admin**   | Owner / manager | Everything a cashier can, plus: menu management, category management, stock-in with supplier, user management, reports, dashboard, printer settings |

A brand-new device has no local profile, so the **first login is online-only**.
After a successful login the profile is cached locally, letting a later cold
start restore the session offline (see `architecture.md`).

### Demo accounts (seeded)

| Role    | Username              | Password     |
| ------- | --------------------- | ------------ |
| Admin   | `admin@elvira.cafe`   | `admin123`   |
| Cashier | `cashier@elvira.cafe` | `cashier123` |

---

## 2. Capability matrix

| Capability                                          | Cashier  | Admin | Status                          |
| --------------------------------------------------- | :------: | :---: | ------------------------------- |
| Sales & checkout (menu → cart → pay)                |    ✓     |   ✓   | Shipped                         |
| Payments — Cash (change calc)                       |    ✓     |   ✓   | Shipped                         |
| Payments — GCash                                    |    ✓     |   ✓   | Shipped                         |
| Payments — Maya                                     |    ✓     |   ✓   | Shipped                         |
| Receipt — on-screen view + share PDF                |    ✓     |   ✓   | Shipped                         |
| Receipt — thermal printer (Bluetooth/WiFi)          |    ✓     |   ✓   | Shipped (custom build required) |
| Transaction history                                 | Own only |  All  | Shipped                         |
| Void a transaction (with reason, restores stock)    | Own only |  All  | Shipped                         |
| View inventory + stock status badges                |    ✓     |   ✓   | Shipped                         |
| Menu management (add/edit/delete items)             |    —     |   ✓   | Shipped                         |
| Category management                                 |    —     |   ✓   | Shipped                         |
| Product photos                                      |    —     |   ✓   | Shipped                         |
| Stock-in (quantity + supplier)                      |    —     |   ✓   | Shipped                         |
| Reorder level configuration                         |    —     |   ✓   | Shipped                         |
| User management (create/disable accounts)           |    —     |   ✓   | Shipped                         |
| Reports (daily/weekly/monthly sales)                |    —     |   ✓   | Shipped                         |
| Dashboard (revenue, chart, low-stock, top products) |    —     |   ✓   | Shipped                         |
| Printer pairing & test print                        |    —     |   ✓   | Shipped (admin only)            |
| Offline mode — sales queued & synced later          |    ✓     |   ✓   | Shipped                         |
| Offline mode — stock-in queued & synced later       |    —     |   ✓   | Shipped                         |
| Personal Information editing                        |    —     |   —   | Coming soon (Settings)          |
| Security & Password / 2FA                           |    —     |   —   | Coming soon (Settings)          |
| Notification preferences                            |    —     |   —   | Coming soon (Settings)          |
| Dark Mode                                           |    —     |   —   | Coming soon (Settings)          |
| Excel export (inventory / transactions)             |    —     |   —   | Planned                         |

> The four **Coming soon** rows are visible in the Settings screen but
> rendered gray and inert. Details and shipping requirements in
> [`future-plans.md`](future-plans.md).

---

## 3. Core workflows

### 3.1 Sale (POS)

1. Cashier opens the **Menu** tab and taps items to add them to the cart.
2. Cart quantities can be increased, decreased, or removed.
3. **Checkout** → optional customer name → **Payment**.
4. Choose **Cash** (enter amount received; change is calculated), **GCash**, or **Maya**.
5. Confirm → transaction is created, inventory is deducted, cart clears.
6. **Receipt** screen offers view, share-as-PDF, and thermal print.

### 3.2 Void

1. From **Orders → transaction detail**, choose **Void**.
2. A non-empty reason is required.
3. On confirmation the transaction is marked `voided`, its line items are
   returned to stock, and a stock movement (`in`) is logged.

### 3.3 Stock-in

1. Admin opens **Inventory Management → Stock In**.
2. Enter a quantity and optional supplier.
3. Stock increases, `stock_movements` logs an `in` entry.
4. Works offline: queued locally and pushed to Supabase on reconnect.

### 3.4 User management

1. Admin opens **Settings → User Management**.
2. Create staff accounts (email + password + role) — provisioning runs through
   the `create-user` edge function so passwords never touch the client DB.
3. Toggle accounts active/inactive.

### 3.5 Receipt printing

- **Thermal (ESC/POS):** Bluetooth Classic/BLE or WiFi (`lan:host:port`)
  printers via `react-native-thermal-printer-driver`. Requires a **custom
  dev build / EAS APK** — does not work in Expo Go or on web.
- **Fallback:** system print dialog / share-as-PDF via `expo-print` +
  `expo-sharing`.

---

## 4. Non-functional requirements

| Area               | Requirement                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Availability       | Offline-first: reads render from the SQLite cache immediately; writes queue locally and sync when connectivity returns                                  |
| Integrity          | Sale totals and stock math are recomputed server-side in atomic RPCs (`process_sale`, `adjust_stock`, `void_sale`) — the client cannot influence totals |
| Security / privacy | Role-based access control on every table (RLS); no PII in logs; passwords hashed by Supabase Auth; per **RA 10173** (Philippine Data Privacy Act)       |
| Concurrency        | Sales are idempotent (UUID ids + remote existence check) and daily order numbers are allocated atomically server-side                                   |
| Consistency        | `transactions`/`transaction_items` write and inventory deduction commit in a single DB transaction — no partial sales                                   |
| Compatibility      | Mobile-only (Android APK). Thermal printing needs a native build                                                                                        |

---

## 5. Offline behavior (user-visible)

| Situation                                | What happens                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| No network at open                       | Catalog/inventory render from the local SQLite cache; profile restored if previously signed in |
| No network during a sale                 | Sale is saved locally with `synced: false`; inventory badges update locally                    |
| Reconnect                                | Queued sales + stock-ins push to Supabase in order; a remote id check prevents duplicates      |
| Offline cold start on a brand-new device | Not possible — first login is online-only                                                      |

An **"Offline — sales are queued"** banner is shown whenever connectivity is lost.
