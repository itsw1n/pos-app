# Future Plans — Gaps & Roadmap

Two sections:

- **Part A — Current gaps**: things the app _promises_ (visible in the UI or
  documented) that are not actually implemented yet.
- **Part B — Planned features**: new capabilities we want to build.

Priority legend: **P1** = high value / likely soon · **P2** = nice-to-have ·
**P3** = later, depends on other work.

> This is a living document. When an item ships, move it to
> `spec-overview.md` / `features.md` as `implemented` and remove it here.

---

## Part A — Current gaps (promised but missing)

### Gap 1. Personal Information editing

- **Where:** Settings → _Personal Information_ (`features/shared/settings/pages/Settings.tsx:140`), caption "Update your name, email, and phone", badge "Coming soon".
- **Current behavior:** row is gray and inert.
- **What's missing:**
  - A profile-edit screen + navigation route (Settings stack).
  - The `user` table has **no name/phone columns** — schema change needed
    (add `full_name`, `phone` to `user`; backfill migration).
  - No client write path exists for the `user` table: RLS allows `select`
    only (`database.md` RLS matrix). Needs a new `SECURITY DEFINER` RPC
    `update_own_profile(...)` that lets a user update only their own row and
    never their `role`/`user_id`.
  - Changing email = changing the Auth identity; Supabase requires
    `auth.admin.updateUserById` (service role) — a new edge function or admin
    path. Recommend starting with **name/phone only**, defer email change.
- **Effort:** M — schema + RPC + one screen + hook.

### Gap 2. Security & Password / 2FA

- **Where:** Settings → _Security & Password_ (`Settings.tsx:146`), caption "Change your password and enable 2FA".
- **Current behavior:** row is gray and inert.
- **What's missing:**
  - Password change uses `supabase.auth.updateUser({ password })` — no new
    schema needed, but requires the user's current password (or re-auth).
  - 2FA in Supabase = TOTP via `supabase.auth.mfa.*` + enrollment UI
    (QR code, backup codes). Substantial UI + state work.
- **Recommendation:** ship password change first (P2), 2FA later (P3).

### Gap 2.1 Forgot Password (self-service via email link) — P2

- **Where:** Login → _Forgot password?_ link (below password field, `features/shared/login/pages/Login.tsx`), flows to `ForgotPassword` → email link → `ResetPassword`.
- **Current behavior:** no forgot link; Login only has email + password + error `Invalid credentials`.
- **What's needed (free on Supabase Free tier — default SMTP ~4 emails/hour, 3k/mo; no custom SMTP required):**
  - **Supabase Auth URL config:** allow each app variant's reset URL (`com.elvira.pos.dev`, `com.elvira.pos.preview`, and `com.elvira.pos`).
  - **`app.config.ts`:** variant-specific schemes (one `make devbuild` after native configuration changes).
  - **ForgotPassword screen:** `InputField` email + `Button` send → `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'com.elvira.pos://reset-password' })` → success "Check email". Online-only; offline shows `useConnectivity()` banner.
  - **ResetPassword screen:** deep link `com.elvira.pos://reset-password?code=xxx` → session → `InputField` new password + confirm + `supabase.auth.updateUser({ password })` → `Login`. Rate-limit + `Invalid/expired link` error.
  - **Navigation:** `LoginStack` `ForgotPassword` + `ResetPassword` routes, `Linking` config for scheme.
- **Cost:** free — Supabase default email `noreply@supabase.co` free (small team 2–10 never hits limit). Custom sender (Resend/Gmail) optional via `SUPABASE_AUTH_SMTP_*`.
- **Security:** link is single-use, short-lived, no PII in logs; offline void stays queued in SQLite.
- **Effort:** S — two screens + `authApi.resetPassword/reset` helpers + deep link — no schema.
- **Setup to make it work (APK, no domain needed — do later):**
  1. Configure each hosted Supabase project's Auth redirect allowlist for its matching app-variant URL; local redirects live in `supabase/config.toml`.
  2. `app.config.ts` defines the schemes — rebuild the relevant APK and reinstall after changes.
  3. Test: Login → `Forgot password?` → enter email → `Check email` → tap link on same phone → `Reset password` → set new password → Login. Needs internet (email + link); offline POS still queues.
  4. If no email: check spam + Dashboard → Auth → Users → Logs; default SMTP ~4/hr limit — never hit with 10 staff.

### Gap 3. Notification preferences

- **Where:** Settings → _Notification Preferences_ (`Settings.tsx:165`), caption "Manage sales and stock notifications".
- **Current behavior:** row is gray and inert.
- **What's missing:** push notifications require Expo Push / FCM + a
  notification service, a `device_tokens` table, and preference persistence.
  Biggest lift in this list; defer to phase 2.
- **Effort:** L.

### Gap 4. Dark Mode

- **Where:** Settings → _Dark Mode_ (`Settings.tsx:172`), caption "Switch the app to a dark color scheme".
- **Current behavior:** row is gray and inert.
- **What's missing:**
  - Theme system is single-value (`src/theme/colors.ts`). Needs a
    light/dark token set + a `ThemeContext` + persistence
    (AsyncStorage) + `useColorScheme()` default.
  - Every `StyleSheet` uses static `colors.*` imports — needs to consume the
    active theme (largest mechanical change; many files).
  - StatusBar styling + `expo-navigation-bar` for Android nav bar.
- **Effort:** L (cross-cutting).

---

## Part B — Planned features

### 1. Excel export (inventory + POS transactions) — P1

**Goal:** export current **inventory** and **POS transactions** to an Excel
file (`.xlsx`) that opens in Microsoft Excel, shared via the OS share sheet.

**Scope / behavior**

- Two export entry points, both **admin-only**:
  - **Inventory Management** screen — "Export inventory".
  - **Reports** screen — "Export transactions" (respects the selected date
    range; otherwise exports all).
- Sheet layout:
  - _Inventory_ sheet: `product_id`, `name`, `category`, `price`,
    `quantity`, `reorder_level`, `status (ok/low/critical)`,
    `stock value (price × qty)`, optional supplier of the last stock-in.
  - _Transactions_ sheet: `order_number`, `transaction_id`, `date`,
    `items (summary)`, `payment_mode`, `total_amount`, `status`, `cashier`.
- Uses current data sources (`hooks/useInventory.ts`, `hooks/useReports.ts`),
  so what you see on screen is what exports.

**Technical approach**

- **Recommended:** `exceljs` (MIT, works in React Native / Expo, pure JS — no
  native modules). Generate the workbook in a new service, e.g.
  `src/services/exportService.ts`, write to cache via `expo-file-system`
  (already bundled, `package-lock.json:5658`), share via `expo-sharing`
  (already a dependency, used by `receiptService.ts:190`).
- **Fallback (zero new deps):** generate a UTF-8 CSV (handle quoting/escaping)
  that Excel opens natively — loses multi-sheet but ships faster.
- Reuse the existing share flow (`Sharing.shareAsync(uri)`) — consistent with
  the receipt PDF path.

**Dependencies to add:** `exceljs` + `expo-file-system` (direct dep).

**Effort:** M. Risk: verify `exceljs` bundle works in the Expo SDK 57 Metro
build before committing to it (do a spike first).

### 2. Personal Information editing — P1 (name/phone only)

Ship the non-email part of Gap 1. See Gap 1 for schema + RPC work.

### 3. Forgot Password (email link) — P2

See Gap 2.1. Two screens (`ForgotPassword` + `ResetPassword`) on Login stack, `supabase.auth.resetPasswordForEmail` + `updateUser`, deep link `com.elvira.pos://reset-password`, online-only, no schema.

### 4. Password change (while logged in) — P2

See Gap 2. No schema work; needs current-password re-auth UI.

### 5. Dark Mode — P2

See Gap 4. Cross-cutting theme refactor; do after Excel export so both are
reviewed independently.

### 6. 2FA — P3

Supabase MFA/TOTP. Depends on Supabase plan + enrollment UI.

### 7. Push notifications — P3

Expo Push/FCM + `device_tokens` + preferences (unblocks Gap 3).

### 8. Offline void — P3

Currently voids require the server RPC. An offline void would need an
`is_voided` local flag + a sync-time RPC. Non-trivial; defer.

---

## Deliberately not planned (YAGNI)

- Multi-branch / multi-store support — out of scope for a single-cafe POS.
- Loyalty programs, coupons, taxes/VAT — no requirement yet.
- iOS release — mobile-only Android for now.
- Cash drawer control / barcode scanner hardware — only printer hardware is
  supported today.

---

## Sequencing

1. **Phase 1 (P1):** Excel export → Personal Info (name/phone).
2. **Phase 2 (P2):** Forgot Password → Password change → Dark Mode.
3. **Phase 3 (P3):** 2FA → Push notifications → Offline void.

Each item ships as its own feature branch off `dev`, one layer per commit
(see `AGENTS.md` → Commit Rules).
