# Android Release Acceptance Checklist

Use this checklist for every preview candidate before Cafe Elvira relies on it
for live transactions. Record the APK build ID, tester, phone model, Android
version, printer model, date, and evidence for every failure.

## 1. Automated gate

- [ ] `make check` passes: types, lint, format, unit tests, Android bundle.
- [ ] `make integration-test` passes all local migrations, RLS/RPC, Auth, and
      Edge Function checks. **This command resets local Supabase data.**
- [ ] The preview Supabase project has all migrations applied.
- [ ] `create-user` and `set-user-active` are deployed.
- [ ] Preview EAS environment contains the correct non-secret
      `EXPO_PUBLIC_SUPABASE_URL` and anon key.

## 2. Installation and startup

- [ ] Build with `make preview` and install the APK on the target Android phone.
- [ ] A fresh install opens without Metro and shows Login.
- [ ] The app survives close/reopen and device restart without crashing.
- [ ] No development/demo password is used in the preview or production admin
      account.

## 3. Authentication and roles

- [ ] Admin can sign in online and sees all admin tabs.
- [ ] Cashier can sign in online and cannot see admin-only screens.
- [ ] Invalid credentials show a safe error without exposing backend details.
- [ ] Forgot-password email opens the correct app variant and resets the
      password.
- [ ] Admin can create a cashier with an email address and temporary password.
- [ ] Disabled cashier cannot sign in and cannot perform server operations with
      an already-issued session.
- [ ] Re-enabled cashier can sign in again.
- [ ] Admin cannot disable their own account or remove the final active admin.

## 4. Online POS and inventory

- [ ] Add, change quantity, and remove cart items.
- [ ] Complete Cash payment; received amount and change are correct.
- [ ] Complete one GCash and one Maya payment.
- [ ] Each sale appears once in Orders with a unique transaction/order number.
- [ ] Inventory decreases by the exact sold quantities.
- [ ] Out-of-stock items cannot be oversold.
- [ ] Cashier sees only their transactions; admin sees all transactions.
- [ ] Admin stock-in increases inventory and records supplier information.
- [ ] Admin can add/edit a category and product, including a product image.
- [ ] Voiding restores inventory, requires a reason, and cannot run twice.
- [ ] Cashier cannot void another user's transaction.

## 5. Offline and recovery

- [ ] Sign in online once, then restart offline; the cached session restores.
- [ ] Complete multiple offline sales and verify the queued-sync count.
- [ ] Local stock badges decrease while offline.
- [ ] Reconnect and verify every queued sale syncs exactly once.
- [ ] Restart during a pending sync; no duplicate transaction is created.
- [ ] A server-rejected queued operation remains visible for investigation and
      does not silently alter remote stock.
- [ ] Understand the operational limit: a fully offline device cannot learn
      that its account was disabled until connectivity returns.

## 6. Receipts, printer, and exports

- [ ] Receipt content, totals, payment mode, cashier, date, and order number are
      correct.
- [ ] PDF receipt opens and shares successfully.
- [ ] Pair the real Bluetooth or WiFi thermal printer and run a test print.
- [ ] Print receipts repeatedly after app restart and printer reconnect.
- [ ] Verify accented characters, long item names, wrapping, and paper width.
- [ ] Export inventory and transactions; open both files in Microsoft Excel or
      another compatible spreadsheet application.

## 7. Pilot and go/no-go

- [ ] Run at least one controlled shift with paper/manual totals available as a
      fallback.
- [ ] Compare POS revenue, order count, cash, e-wallet totals, and stock changes
      with the manual record.
- [ ] Record crashes, sync failures, duplicate/missing orders, printer failures,
      and staff usability issues.
- [ ] Confirm a named admin owns account recovery and Supabase access.
- [ ] Confirm the database backup/recovery procedure before production launch.
- [ ] Release only when there are no unresolved transaction, inventory, auth,
      or data-loss defects.
