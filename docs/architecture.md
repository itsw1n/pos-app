# Architecture

How IPSS is organized: the 4-layer model, the offline-first data flow, and the
navigation / state structure.

---

## 1. Four-layer architecture

Screens never touch the database and never call Supabase directly. All remote
transport lives in `src/api/*`.

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1 — UI / Screens (React Native components only)           │
│   features/*/pages/*.tsx                                         │
└───────────────▲───────────────────────────────┬─────────────────┘
                │ reads hooks                    │ user actions
┌───────────────┴───────────────────────────────▼─────────────────┐
│ Layer 2 — Hooks + Services (business logic)                     │
│   hooks/useInventory.ts · useReports.ts · ...                   │
│   services/receiptService.ts · printerService.ts · catalogSync  │
└───────────────▲───────────────────────────────┬─────────────────┘
                │ cache-first reads              │ writes
┌───────────────┴───────────────────────────────▼─────────────────┐
│ Layer 3 — Transport (pure Supabase calls) — src/api/*            │
│   authApi · productApi · categoryApi · inventoryApi             │
│   transactionApi · userApi · storageApi                          │
└───────────────┬───────────────────────────────▲─────────────────┘
                │                               │
┌───────────────▼───────────────────────────────┴─────────────────┐
│ Layer 4 — Data                                                  │
│   Supabase (online)  ·  SQLite (offline) via services/sqlite.ts │
└─────────────────────────────────────────────────────────────────┘
```

| Layer               | Lives in              | Responsibilities                                                             |
| ------------------- | --------------------- | ---------------------------------------------------------------------------- |
| 1. UI / Screens     | `features/*/pages/`   | Rendering, gestures, form state. No business logic.                          |
| 2. Hooks + Services | `hooks/`, `services/` | Business rules, SQLite cache reads, sync, receipt/print generation.          |
| 3. Transport        | `api/*`               | Pure Supabase calls: auth, catalog, inventory, transactions, users, storage. |
| 4. Data             | Supabase + SQLite     | Online source of truth + offline mirror.                                     |

**Shared state:** two React contexts wrap the app:

- `context/AuthContext.tsx` — `{ user, role, isHydrating, login, logout }`;
  restores sessions offline from the cached profile.
- `context/CartContext.tsx` — cart items, quantity ops, running total.

---

## 2. Folder structure (role-first)

Features are grouped by user role, then named by **user action** (Login,
Orders, Menu, MenuManagement, Dashboard) — not by DB entity.

```
src/
├── app/                  # entry (index.tsx) + navigation/ (role navigators)
├── features/
│   ├── shared/           # login, orders, settings (both roles)
│   ├── cashier/          # menu (POS), inventory (read-only)
│   └── admin/            # menu-management, inventory-management, reports
├── components/common/    # shared UI, each {Component}.tsx + {Component}.styles.ts
├── context/              # AuthContext, CartContext
├── hooks/                # cross-role hooks: useInventory, useCategories, useConnectivity
├── api/                  # pure Supabase transport
├── services/             # supabase, sqlite, sync, catalogSync, receipt, printer
├── styles/               # textStyles.ts
├── theme/                # design tokens (colors, spacing, typography, radius, shadows)
└── types/                # entities, context, entityNames
```

Imports use the `@/*` alias (`tsconfig.json` `paths: {"@/*": ["./src/*"]}`) — e.g. `@/theme`, `@/services/supabase`. New code should use `@/`; relative imports are allowed for co-located files.

---

## 3. App bootstrap

`App.tsx` → `src/app/index.tsx` (`App` named export):

```
ErrorBoundary
  └─ FontGate (Inter font load)
       └─ AuthProvider
            └─ CartProvider
                 └─ Navigation
                      └─ OfflineBanner (useOfflineSync — init DB, cache, sync)
```

If `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` are missing,
`App` renders a "not configured" screen instead of crashing
(`services/supabase.ts` → `isSupabaseConfigured`).

`useOfflineSync` has one owner (`OfflineBanner`). It runs once on mount and again on **network change** and
**SIGNED_IN**: it (1) checks connectivity, (2) `initDb()` (SQLite), (3)
`refreshLocalCache()` (mirror products/categories/inventory/users), (4)
`syncPendingRecords()` (push queued writes). The banner reports pending-record
counts and retry state without exposing raw backend errors.

---

## 4. Navigation

Root `app/navigation/Navigation.tsx`:

```
Navigation (stack)
├─ isHydrating? ── LoadingScreen (spinner)
├─ no user ── Login screen (+ OfflineBanner)
└─ signed in ── Main (role-switched tabs)
        ├─ role === 'admin'   ── AdminNavigator
        └─ role === 'cashier' ── CashierNavigator
```

**Admin tabs** (`AdminNavigator.tsx`): Products → Orders → Dashboard → Settings.

**Cashier tabs** (`CashierNavigator.tsx`): Menu → Orders → Inventory → Settings.

Each feature exposes its own stack navigator (`MenuNavigator`,
`OrdersNavigator`, `SettingsNavigator`, `ReportsNavigator`,
`MenuManagementNavigator`) co-located in the feature folder.

---

## 5. Offline-first data flow

**Reads (reference data).** On app start, sign-in, and reconnection,
`catalogSync.refreshLocalCache()` mirrors products, categories, inventory, and
users into SQLite. Hooks hydrate from the cache first (instant render) and then
refresh from `api/*` when online; remote failures silently fall back to the
cache.

```
Screen → hook reads SQLite → render
        → hook fetches api/* → update state (online only)
```

**Writes.**

| Operation                     | Online                                                                            | Offline                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Sale                          | `rpc('process_sale')` — server recomputes total, deducts stock, allocates order # | `saveOfflineSale` (SQLite txn) + local inventory decrement; `synced: 0` |
| Stock-in                      | `rpc('adjust_stock')`                                                             | `saveOfflineStockIn` (SQLite txn); `synced: 0`                          |
| Void                          | `rpc('void_sale')`                                                                | not supported offline                                                   |
| Product/category/user changes | direct Supabase calls                                                             | not supported offline (managed actions)                                 |

**Sync** (`services/syncService.ts`, driven by `useOfflineSync` on reconnect):

1. Read unsynced transactions + stock movements from SQLite.
2. For each transaction: if the remote id already exists (`transactionExists`),
   mark synced and skip — UUID ids + remote check make retries idempotent.
3. Otherwise `process_sale` and mark synced. Same for stock-ins via
   `adjust_stock`.
4. Failures are swallowed and retried on the next sync — nothing is lost.

**Offline session restore.** A successful login persists the profile to the
local `users` table. On a later offline cold start, `AuthContext` matches the
Supabase session's user id against the cache and restores the profile without a
password. A brand-new device has no cache, so first login is online-only.
Supabase Auth persists its session through the documented React Native storage
adapter and refreshes tokens only while the app is active. Credentials are
request inputs only and are never part of the `User` entity or SQLite schema.

---

## 6. Styling

Design-token system in `src/theme/` (colors, spacing, typography, radius,
shadows) + shared `styles/textStyles.ts`. Rules:

- `StyleSheet.create()` per component; co-located `{Component}.styles.ts`.
- Never hardcode colors/spacing/type values — import from `theme`.
- Reusable components expose a `style` prop; conditional styling uses arrays.
- Semantic props (`variant`, `size`) instead of ad-hoc consumer styles.
- Screen roots use the shared `components/common/Screen` safe-area component.
- Initial loading, blocking errors, and empty results use the shared state
  components. A failed refresh does not hide usable cached data.

---

## 7. Configuration & environments

- Three isolated variants: local `development`, hosted `preview`, and hosted
  `production`. Only `EXPO_PUBLIC_*` env vars are bundled (never secrets).
- Local values come from `supabase status` through
  `scripts/local-supabase-env.sh`; hosted values come from EAS environments.
- Each variant has a separate native package ID, isolating Auth and SQLite.
- Native module (`react-native-thermal-printer-driver`) requires a **custom
  development build** (`make devbuild`); the app cannot run in Expo Go.

See `AGENTS.md` for the full command reference (`make dev`, `make db-reset`,
`make build`, `make devbuild`, CI/CD).
