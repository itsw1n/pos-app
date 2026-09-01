# API Reference

Two surfaces:

1. **Client transport** — `src/api/*`, the only place screens/hooks/services
   touch Supabase. Pure function modules, one per domain.
2. **Edge function** — `supabase/functions/create-user/`, a Deno edge function
   for admin-only user provisioning.

All client transport functions are `async`, throw on Supabase errors, and
return typed results. Authorization is enforced server-side via RLS/RPCs (see
`database.md`).

---

## 1. Client transport (`src/api/`)

### `authApi.ts` — authentication & profile

| Function                              | Returns                      | Notes                                                      |
| ------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| `signInWithPassword(email, password)` | `User`                       | `supabase.auth.signInWithPassword`; email is the username  |
| `getUserProfile(userId)`              | `StoredUserProfile \| null`  | reads `user(user_id, username, role)` for the session user |
| `getSession()`                        | `Session \| null`            | `supabase.auth.getSession`                                 |
| `getCurrentUser()`                    | `User \| null`               | `supabase.auth.getUser`                                    |
| `signOut()`                           | `void`                       |                                                            |
| `onAuthStateChange(callback)`         | `{ data: { subscription } }` | auth event listener                                        |

`StoredUserProfile = { user_id, username, role }`. Used by `AuthContext` for
login, session restore, and offline profile caching.

### `productApi.ts` — catalog

| Function                            | Returns                     | Roles           |
| ----------------------------------- | --------------------------- | --------------- |
| `getCatalog()`                      | `ProductRow[]`              | admin + cashier |
| `getProducts()`                     | `Product[]`                 | admin + cashier |
| `getProductIdNamePrice()`           | `{product_id,name,price}[]` | admin + cashier |
| `createProduct(payload)`            | `ProductRow`                | admin           |
| `updateProduct(productId, payload)` | `void`                      | admin           |
| `deleteProduct(productId)`          | `void`                      | admin           |

`getCatalog` selects `*, category(name)` and resolves the category name for
display. `ProductPayload = { name, category_id, price, is_available, image_url }`.

### `categoryApi.ts` — categories

| Function                         | Returns         | Roles                                   |
| -------------------------------- | --------------- | --------------------------------------- |
| `getCategories()`                | `CategoryRow[]` | admin + cashier                         |
| `createCategory(name)`           | `CategoryRow`   | admin                                   |
| `getOrCreateUncategorized()`     | `CategoryRow`   | admin — upserts `Uncategorized`         |
| `reassignProducts(fromId, toId)` | `void`          | admin — moves products before delete    |
| `deleteCategory(categoryId)`     | `void`          | admin — `Uncategorized` guarded in hook |

### `inventoryApi.ts` — inventory

| Function                                   | Returns       | Roles                            |
| ------------------------------------------ | ------------- | -------------------------------- |
| `getInventory()`                           | `Inventory[]` | admin + cashier                  |
| `deleteInventoryByProduct(productId)`      | `void`        | admin                            |
| `adjustStock(stockId, quantity, supplier)` | `void`        | admin — calls RPC `adjust_stock` |

### `transactionApi.ts` — transactions

| Function                                  | Returns                   | Notes                                            |
| ----------------------------------------- | ------------------------- | ------------------------------------------------ |
| `getTransactionsList(role, userId)`       | `TransactionRow[]`        | cashier → filtered to own `user_id`; admin → all |
| `getTransactionItemsByIds(ids)`           | `{transaction_id}[]`      | existence/join check                             |
| `getTransactionItems(transactionId)`      | `TransactionItemRow[]`    | full rows                                        |
| `transactionExists(transactionId)`        | `boolean`                 | used by sync dedup                               |
| `getTransactionStatusRange(start?, end?)` | `{id,status}[]`           | for reports/top-products                         |
| `getTransactionItemsForProducts(ids)`     | `TransactionItemSparse[]` | `{product_id,quantity,subtotal}`                 |
| `getTransactionsForDashboard()`           | `TransactionRow[]`        |                                                  |
| `getTransactionsInRange(start, end)`      | `TransactionRow[]`        |                                                  |
| `processSale(params)`                     | `void`                    | calls RPC `process_sale`                         |
| `voidSale(transactionId, reason)`         | `void`                    | calls RPC `void_sale`                            |

`TransactionRow` matches the `transactions` columns. `ProcessSaleParams =
{ transactionId, paymentMode, amountReceived, changeGiven, items: SaleItem[],
date }` with `SaleItem = { product_id, quantity }`.

### `userApi.ts` — users (admin)

| Function                          | Returns                | Notes                           |
| --------------------------------- | ---------------------- | ------------------------------- |
| `getUsers()`                      | `User[]`               | all users + `is_active`         |
| `getUsersIdName()`                | `{user_id,username}[]` |                                 |
| `createUser(payload)`             | `User`                 | via edge function `create-user` |
| `setUserActive(userId, isActive)` | `void`                 | via RPC `set_user_active`       |

`createUser` surfaces the edge function's JSON error body as the thrown
message (see `errorMessage`).

### `storageApi.ts` — product images

| Function                    | Returns               | Notes                                       |
| --------------------------- | --------------------- | ------------------------------------------- |
| `getStoragePath(urlOrPath)` | `string \| null`      | parses public URL / path, guards bucket     |
| `getPublicUrl(path)`        | `string`              |                                             |
| `uploadProductImage(file)`  | `string` (public URL) | base64 → bytes → upload to `product-images` |
| `deleteProductImage(url)`   | `void`                | best-effort, never throws                   |

`ProductImageFile = { base64, mimeType, fileName }`. File names are sanitized
and prefixed with a random UUID to avoid collisions.

---

## 2. Edge function — `create-user`

`supabase/functions/create-user/index.ts` (Deno). Admin-only user provisioning.

### Endpoint

- **Method:** `POST`
- **Path:** `functions/v1/create-user`
- **CORS:** preflight `OPTIONS` → `204` with `Access-Control-Allow-*`.

### Request

```json
{
  "username": "cashier@elvira.cafe",
  "password": "a-strong-password",
  "role": "cashier"
}
```

### Validation

- `username` and `password` required (trimmed username).
- `role` must be `admin` or `cashier`.

### Authorization

1. Reads the caller's `authorization` header.
2. Creates a Supabase client with that header and calls
   `rpc('get_app_role')`.
3. Non-admin caller → `403 { error: 'Admin access required' }`.
   Prevents a cashier from escalating by invoking the function directly.

### Behavior

1. Creates the auth user with a **service-role** client:
   `admin.auth.admin.createUser({ email, password, email_confirm: true,
user_metadata: { role } })`.
2. Inserts the profile row into `user` (`password: null` — never plaintext).
3. Returns:

| Status | Body                                                    |
| ------ | ------------------------------------------------------- |
| `201`  | `{ user_id }`                                           |
| `400`  | `{ error }` — validation or auth-user creation failure  |
| `401`  | `{ error: 'Unauthorized' }` — missing auth header       |
| `403`  | `{ error: 'Admin access required' }` — non-admin caller |
| `405`  | `{ error: 'Method not allowed' }`                       |
| `500`  | `{ error }` — profile insert failure                    |

---

## 3. Error model

- Supabase client errors are thrown as-is (callers catch and surface
  messages).
- `userApi.createUser` unwraps the edge function's `{ error }` body for a
  clean message.
- Storage cleanup (`deleteProductImage`) and sync pushes (`syncService`) are
  best-effort and never throw outward.

---

## 4. Env config

- Client: `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  (bundled non-secret values, see `services/supabase.ts`).
- Edge function: uses Deno env `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` — provided automatically by Supabase when the
  function runs.
