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
  - The `user` table has **no name column** — schema change needed
    (add `full_name` to `user`; backfill migration). Phone is YAGNI — not needed for cafe ops.
  - No client write path exists for the `user` table: RLS allows `select`
    only (`database.md` RLS matrix). Needs a new `SECURITY DEFINER` RPC
    `update_own_profile(...)` that lets a user update only their own row and
    never their `role`/`user_id`.
  - Changing email = changing the Auth identity; Supabase requires
    `auth.admin.updateUserById` (service role) — a new edge function or admin
    path. Recommend starting with **name only**, defer email change.
- **Effort:** S — schema + RPC + one screen + hook.

### Gap 2. Security & Password / 2FA

- **Where:** Settings → _Security & Password_ (`Settings.tsx:146`), caption "Change your password and enable 2FA".
- **Current behavior:** row is gray and inert.
- **What's missing:**
  - Password change uses `supabase.auth.updateUser({ password })` — no new
    schema needed, but requires the user's current password (or re-auth).
  - 2FA in Supabase = TOTP via `supabase.auth.mfa.*` + enrollment UI
    (QR code, backup codes). Substantial UI + state work.
- **Recommendation:** ship password change first (P2), 2FA later (P3).

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

### 1. Personal Information editing — P1 (name only)

Ship the non-email part of Gap 1. See Gap 1 for schema + RPC work (just `full_name`).

### 2. Password change (while logged in) — P2

See Gap 2. No schema work; needs current-password re-auth UI.

### 3. Dark Mode — P2

See Gap 4. This is a cross-cutting theme refactor.

### 4. 2FA — P3

Supabase MFA/TOTP. Depends on Supabase plan + enrollment UI.

### 5. Push notifications — P3

Expo Push/FCM + `device_tokens` + preferences (unblocks Gap 3).

### 6. Offline void — P3

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

1. **Phase 1 (P1):** Personal Info (name only).
2. **Phase 2 (P2):** Password change → Dark Mode.
3. **Phase 3 (P3):** 2FA → Push notifications → Offline void.

Each item ships as its own feature branch off `dev`, one layer per commit
(see `AGENTS.md` → Commit Rules).
