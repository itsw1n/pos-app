# AGENTS.md

Agent and developer guide for **IPSS: Integrated POS and Stock Monitoring System for Cafe Elvira** — a mobile-only Point-of-Sale + inventory app built with React Native (Expo) + TypeScript + Supabase.

> **Expo HAS CHANGED.** This project uses **Expo SDK 57 / React Native 0.86 / React 19**. Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code. Do not assume older Expo APIs exist (e.g. `expo-sqlite`'s legacy `SQLite.openDatabase` was removed — the modern `openDatabaseAsync`/`execAsync` API is used here).

---

## Tech Stack

| Concern | Choice |
|---|---|
| Platform | Mobile-only (Expo Go / Android APK via EAS) |
| Framework | Expo SDK 57, React Native 0.86, React 19 |
| Language | TypeScript (~6.0, `strict: true`) |
| UI styling | React Native `StyleSheet` + design tokens (no Tailwind, no inline style objects) |
| Navigation | `@react-navigation/native` (Stack + Bottom Tabs), role-based |
| Online DB / Auth | Supabase (`@supabase/supabase-js`) — Auth + Postgres |
| Offline storage | `expo-sqlite` (modern async API) |
| Connectivity | `@react-native-community/netinfo` |
| Receipts | `expo-print`, `expo-sharing` (+ Bluetooth/WiFi printer skeleton) |
| Charts | `victory-native` + `react-native-svg` |
| IDs | `react-native-uuid` (transaction dedup) |

### Key versions
- `expo ~57.0.10`, `react-native 0.86.2`, `react 19.2.3`, `typescript ~6.0.3`
- `@supabase/supabase-js ^2`, `@react-navigation/* ^7`

---

## Commands

```bash
npm install              # install deps
npm start                # expo start (Metro)
npm run android          # expo start --android
npx tsc --noEmit         # typecheck (MUST pass before committing — zero errors, no `any`)
npx expo export --platform android   # verify the Metro bundle actually builds
```

There is no configured linter — `tsc --noEmit` is the gate.

---

## Environment

Two environments are supported: `development` and `production`. Each has its
own Supabase project. Only variables prefixed with `EXPO_PUBLIC_` are bundled
into the app (read via `process.env.EXPO_PUBLIC_*`, see
`src/services/supabase.ts`); **never put secret keys in `EXPO_PUBLIC_*`**.

```
# runtime env files (NEVER commit — gitignored):
.env.development   # EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY (dev project, EXPO_PUBLIC_APP_ENV=development)
.env.production    # same, for the prod project (EXPO_PUBLIC_APP_ENV=production)
.env.local         # SEED-ONLY: DATABASE_URL + SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
.env.example       # tracked template
.env.local.example # tracked template (seed secrets)
```

`.env.local` is used **only** by `scripts/seed.cjs` (and `make seed`/`make reset`).
It holds the **service_role** key and the Postgres connection string — admin
credentials that must never ship to a client. The app bundle never reads it.
You need `.env.local` only to run the seed; the app itself only needs
`.env.development` (or `.env.production`).

### Local Development (Makefile)
```
make setup        # npm install
make dev          # expo start against the development env
make seed         # apply schema + upsert demo data into the configured DB
make reset        # drop + recreate schema, then seed
make typecheck    # npx tsc --noEmit
make build        # npx expo export --platform android (mobile-only)
```
Demo credentials created by the seed: `admin@elvira.cafe`/`admin123` (admin),
`cashier@elvira.cafe`/`cashier123` (cashier). Log in with the email address;
AuthContext signs in with `email: username`.

### Docker (tooling only — backend is a hosted Supabase project)
The database is NOT containerized; Docker runs the Node tooling:
```
make docker-seed / docker-reset / docker-typecheck / docker-build
```


---

## Architecture

**3-layer, feature-based.** Screens never touch the DB.

```
Screen (UI only)
  → Hook / Service (business logic)
    → online?  → Supabase
      offline? → SQLite (expo-sqlite)
      → returns typed result to Screen
```

- **Layer 1 — UI/Screens:** React Native components only. No business logic.
- **Layer 2 — Hooks + Services:** API calls, SQLite, sync, receipt generation.
- **Layer 3 — Data:** Supabase (online) + SQLite (offline) via `src/services/*`.

**Offline sync:** transaction saved to SQLite with `synced: false` → on reconnect `syncService.ts` pushes to Supabase → marks `synced: true`. UUID transaction IDs (`react-native-uuid`) prevent duplicates (`syncService.ts` checks remote id before insert).

---

## Folder Structure

```
src/
├── app/                  # entry (index.tsx) + navigation (navigation/ + role navigators)
├── features/             # all user-action features, grouped role-first
│   ├── shared/           # cross-role features: login, orders, settings
│   │   ├── login/        # Login.tsx + Login.styles.ts
│   │   ├── orders/       # Orders, VoidTransaction (pages/ + hooks/ + OrdersNavigator)
│   │   └── settings/     # Settings, PrinterSettings, UserManagement (pages/ + hooks/ + SettingsNavigator)
│   ├── cashier/          # cashier-only features (user actions, not DB entities)
│   │   ├── menu/         # Menu, Checkout, Payment, Receipt (pages/ + hooks/ + MenuNavigator)
│   │   └── inventory/    # Inventory (view-only)
│   └── admin/            # admin-only features
│       ├── menu-management/  # MenuManagement, AddEditMenuItem (pages/ + components/ + hooks/ + MenuManagementNavigator)
│       ├── inventory/        # InventoryManagement, StockIn (pages/)
│       └── reports/          # Dashboard, Reports (pages/ + hooks/ + ReportsNavigator)
├── components/
│   └── common/           # shared UI: Button, Card, ProductCard, StockBadge, TextField
│       └── {Component}/  # Component.tsx + Component.styles.ts (co-located)
├── context/              # AuthContext (user+role), CartContext (cart state)
├── hooks/                # cross-role hooks: useInventory, useCategories
├── services/             # supabase.ts, sqlite.ts, syncService.ts,
│   │                     #   receiptService.ts, printerService.ts
├── styles/               # textStyles.ts (shared text styles)
├── theme/                # design tokens: colors, spacing, typography, radius, shadows, index
└── types/                # entities.ts (6 ERD entities), context.ts, entityNames.ts
```

Features are grouped **role-first** (`features/shared` / `features/cashier` / `features/admin`) and named by **user action** (Login, Orders, Menu, MenuManagement, Dashboard), not by DB entity. Import alias `@/*` → `src/*` is configured via tsconfig `paths`. Feature-local hooks live under that feature's `hooks/`; hooks shared across roles live in `src/hooks/`. Navigators for nested feature stacks live alongside their feature (e.g. `src/features/admin/menu-management/MenuManagementNavigator.tsx`).

`App.tsx` (root) → `src/app/index.tsx` (`App` named export) → providers → `Navigation`.

---

## Styling Architecture (design-token system)

Single source of truth = theme tokens. **Never hardcode design values.**

### Rules
1. `StyleSheet.create()` for every component.
2. Never hardcode colors/spacing/typography/radius/shadows — import from theme.
3. Co-locate styles: `{Component}.styles.ts` next to `{Component}.tsx`.
4. Named exports only; PascalCase component names.
5. Reusable components expose a `style` prop and merge it (RN equivalent of `className`):
   ```tsx
   <Pressable style={[styles.root, style]} />
   ```
6. Conditional styling uses style arrays, never string concatenation:
   ```tsx
   style={[styles.root, disabled && styles.disabled, selected && styles.selected]}
   ```
7. Expose semantic props (`variant="primary" size="large"`) instead of forcing consumers to build styles manually.
8. Styling separated from business logic.

### Theme tokens (`src/theme/index.ts`)
```ts
import { colors, spacing, typography, radius, shadows } from '../theme';
```
- **colors** (`src/theme/colors.ts`): `primary #364C35`, `secondary #4D644B`, `navActive #ADC5AB`, `background #F5F5F5`, `surface #FFFFFF`, `success #4CAF72`, `warning #F5A623`, `danger #E8614A`, `disabled #C2C5C5`, `textPrimary #1A1A1A`, `textSecondary #6B6B6B`, `border #E0E0E0`.
- **spacing**: 12-step scale, 4px base — `0, xs(4), sm(8), md(12), lg(16), xl(20), 2xl(24) … 7xl(80)`.
- **typography**: 8 steps — `xs(10) … 4xl(32)`, each `{fontSize, fontWeight, lineHeight}`.
- **radius**: `none, sm(2), md(4), lg(8), xl(12), full(9999)`.
- **shadows**: `resting, hover, active, modal`.
- **textStyles** (`src/styles/textStyles.ts`): `h1-h3, body, caption, label, error, success`.

### Shared components (`src/components/common/`)
`Button` (variant/size/disabled), `Card`, `ProductCard`, `StockBadge` (ok/low/critical → success/warning/danger), `TextField` (label/error). All named exports, all accept `style`.

---

## TypeScript Conventions

- `strict: true`. No `any`. Explicit return types on hooks/services.
- Every feature has a `use{Feature}` hook; screens call the hook and render only.
- All imports are **relative** (e.g. `../../theme`, `../../services/supabase`). Do not introduce the `@/` alias unless every import is migrated consistently.
- Type names: interfaces for shapes, `as const` for token objects, union types for enums.

### Domain types (`src/types/entities.ts`)
```ts
UserRole = 'admin' | 'cashier'

User            { user_id, username, password, role, is_active? }
Product         { product_id, name, category, price, is_available }
Transaction     { transaction_id, date, total_amount, payment_mode: 'cash'|'gcash'|'maya', user_id }
TransactionItem { item_id, transaction_id, product_id, quantity, subtotal }
Inventory       { stock_id, product_id, quantity, reorder_level }
StockMovement   { movement_id, stock_id, type: 'in'|'out', quantity, date, supplier? }
```

### Context types (`src/types/context.ts`)
`PaymentMode = 'cash' | 'gcash' | 'maya'`, `CartItem`, `CartContextType`, `POSTransaction` (has `id: string` UUID + `synced` flag).

---

## Auth & Role-Based Access

- `src/context/AuthContext.tsx` — `AuthProvider` wraps the app; `useAuth()` returns `{ user, role, login, logout }`. Throws if used outside provider.
- Login: `supabase.auth.signInWithPassword` → fetch role from `user` table.
- Navigation (`src/app/navigation/`):
  - not logged in → `Login`
  - `cashier` → Menu(POS) | Orders | Inventory(read-only) | Settings
  - `admin` → Menu(POS) | Orders | Inventory(manage) | Dashboard | Settings

---

## Services (`src/services/`)

| File | Purpose |
|---|---|
| `supabase.ts` | `createClient` from `EXPO_PUBLIC_*` env vars |
| `sqlite.ts` | `initDb` (4 local tables), `saveToSQLite<T>`, `getUnsyncedRecords<T>`, `markSynced` — modern async `expo-sqlite` API |
| `syncService.ts` | `syncPendingRecords()` pushes unsynced transactions, dedup via remote id check; `generateSyncId()` |
| `receiptService.ts` | `generateReceipt(ReceiptData)` → PDF URI, `shareReceipt(uri)` |
| `printerService.ts` | `printReceipt(html)` |

**Local SQLite tables:** `transactions`, `transaction_items`, `inventory`, `stock_movements` (see `initDb`).

---

## POS Flow (core feature)

Menu → Add to cart (global `CartContext`) → Checkout → Payment (Cash w/ change / GCash / Maya) → `processTransaction`:
1. Build `POSTransaction` with UUID id, `synced: false`.
2. Online: insert transaction + items into Supabase, auto-deduct inventory, log `stock_movements` (type `out`).
3. Offline: save transaction + items to SQLite.
4. Clear cart, return transaction.

---

## Inventory Rules

- Stock status: `quantity <= 0` → critical (`danger`), `quantity <= reorder_level` → low (`warning`), else OK (`success`).
- Admin: full management (Stock-In with supplier, reorder levels). Cashier: read-only view.
- Stock-in logs `stock_movements` type `in`.

---

## Reports / Transactions

- Reports: daily/weekly/monthly sales + inventory (admin).
- Dashboard: revenue, order count, weekly Victory chart, low-stock, top products (admin).
- Transaction history: cashier sees own, admin sees all.
- Void: requires a non-empty reason; restores inventory on confirmation.

---

## Commit Rules

Follow `type(scope):message` — **one commit = one layer, not one feature.**

- Format: `type(scope):message` — lowercase, imperative, no space before colon.
- Allowed types: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`, `test`.
- Scope = layer/module (e.g. `config`, `types`, `theme`, `api`, `auth`, `frontend`, `pos`, `inventory`, `reports`, `products`, `settings`, `navigation`, `docs`).
- Never mix layers in one commit (e.g. split UI vs logic vs types).
- Stage only related files; verify `npx tsc --noEmit` passes before committing.

Examples:
```
feat(auth): add auth context and login screen
feat(api): add supabase, sqlite, sync, and receipt services
feat(pos): add point-of-sale transaction flow
chore(config): scaffold Expo TypeScript project
```

---

## Branching & Release Policy (CI/CD)

GitFlow-style model enforced by `.github/workflows`. `main` is always stable;
all integration happens on `dev`.

**Branches**
- `main` — stable/releaseable only. Do not commit or push directly. Only merged
  from `dev` via the promote PR (`--no-ff`).
- `dev` — integration branch. All `feature/`, `refactor/`, `fix/`, `chore/`
  branches branch **off `dev`** (never off `main`) and merge back into `dev`.
- When `dev` is stable, open a PR `dev → main`. That merge is the release.

**CI (`ci.yml`)** — runs on every PR to `main`/`dev` and on pushes to both:
- `npm run typecheck` (`tsc --noEmit`) — must pass.
- `npm run build` (`expo export --platform android`) — verifies the Metro
  bundle. Uses dummy `EXPO_PUBLIC_*` values in CI; real values only ship via
  git-ignored `.env.*` at runtime.

**Tagging (`release.yml`)** — `googleapis/release-please-action` runs on push
to `main`:
- Derives a semantic version from conventional commits:
  `feat` → minor, `fix` → patch, `BREAKING CHANGE`/`!` → major.
- Opens a release PR and, once merged back to `main`, tags `vX.Y.Z`,
  bumps `package.json`/`package-lock.json`, and updates `CHANGELOG.md`.
- Because tags are driven by commit types, keep Commit Rules (above) accurate —
  a mis-typed `feat` mis-bumps the version.

**Branch protection (apply in GitHub UI — Settings → Branches → Add rule)**
1. Add a rule for `main` and one for `dev`.
2. Enable: "Require a pull request before merging" (1 approval, `dismiss stale`).
3. Enable: "Require status checks to pass before merging" → select `Typecheck`
   and `Android bundle`.
4. Enable: "Do not allow bypassing"; set "Restrict who can push" to your team
   (or keep admins as exception deliberately).
5. Optionally enable "Do not allow force pushes" on `dev`.

**No CI-driven secret access**: workflows never read `.env.*`. The app only
receives `EXPO_PUBLIC_*` values, which are non-secret by design.

---

## Data Privacy (RA 10173)

- No PII in logs. Passwords are hashed by Supabase Auth (never store plaintext).
- Role-based access must strictly limit admin-only features from cashier accounts.

---

## Do / Don't

- **Do** read the Expo SDK 57 docs before using an Expo API.
- **Do** run `npx tsc --noEmit` before every commit.
- **Do** use theme tokens and co-located `*.styles.ts`.
- **Don't** hardcode colors/spacing/font sizes in components.
- **Don't** use `any`; keep strict types.
- **Don't** commit `.env` or Supabase keys.
- **Don't** create commits that mix layers.
