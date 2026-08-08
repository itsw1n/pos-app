-- 0003_rbac.sql
-- Role-based access control + atomic, server-validated write RPCs.
--
-- Goals (see AGENTS.md > Data Privacy / RA 10173):
--   * stop trusting the client for totals, stock math, and role enforcement
--   * cashiers/members can read the catalog but cannot write product/user data
--   * the only way to mutate sales, stock-in, and voids is via SECURITY DEFINER
--     RPCs that run in a single transaction (no partial commits, no oversell)
--   * the app `role` can no longer be changed by calling .from('user').update

-- ---------------------------------------------------------------------------
-- 1) App-role helper. Security definer reads "user" with the function owner's
--    privileges so it bypasses RLS (avoids postgres loop-protection errors).
-- ---------------------------------------------------------------------------
create or replace function public.get_app_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public."user" where user_id = auth.uid()
$$;

revoke all on function public.get_app_role() from public;
grant execute on function public.get_app_role() to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Drop the permissive dev-preview policies from 0001 / 0002.
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated full access" on product;
drop policy if exists "authenticated full access" on "user";
drop policy if exists "authenticated full access" on inventory;
drop policy if exists "authenticated full access" on transactions;
drop policy if exists "authenticated full access" on transaction_items;
drop policy if exists "authenticated full access" on stock_movements;
drop policy if exists "authenticated full access" on category;

-- The app gates on login, so unauthenticated catalog reads are no longer needed.
drop policy if exists "anon can read catalog" on product;
drop policy if exists "anon can read catalog" on "user";
drop policy if exists "anon can read catalog" on inventory;
drop policy if exists "anon can read catalog" on category;

-- ---------------------------------------------------------------------------
-- 3) Role-gated policies.
-- ---------------------------------------------------------------------------

-- Product catalog: read for everyone signed in, write for admin only.
create policy "product_read" on product
  for select using (get_app_role() in ('admin', 'cashier'));
create policy "product_admin_write" on product
  for all using (get_app_role() = 'admin') with check (get_app_role() = 'admin');

-- Category: same as products.
create policy "category_read" on category
  for select using (get_app_role() in ('admin', 'cashier'));
create policy "category_admin_write" on category
  for all using (get_app_role() = 'admin') with check (get_app_role() = 'admin');

-- Inventory: both can read; only admin writes directly (cashier stock changes
-- via the security-definer adjust_stock / process_sale RPCs).
create policy "inventory_read" on inventory
  for select using (get_app_role() in ('admin', 'cashier'));
create policy "inventory_admin_write" on inventory
  for all using (get_app_role() = 'admin') with check (get_app_role() = 'admin');

-- Stock movements: admin may read the audit trail; the RPCs manage writes.
create policy "stock_movements_read" on stock_movements
  for select using (get_app_role() = 'admin');

-- Transactions: admin sees all, cashier sees only their own. No direct
-- insert/update/delete for either role -- mutation happens via process_sale /
-- void_sale ONLY, so totals are recomputed server-side.
create policy "transactions_read_admin" on transactions
  for select using (get_app_role() = 'admin');
create policy "transactions_read_own" on transactions
  for select using (get_app_role() = 'cashier' and user_id = auth.uid());

-- Transaction items: reachable only through transactions you can read.
create policy "transaction_items_read_admin" on transaction_items
  for select using (get_app_role() = 'admin');
create policy "transaction_items_read_own" on transaction_items
  for select using (
    get_app_role() = 'cashier'
    and exists (
      select 1 from transactions t
      where t.id = transaction_id and t.user_id = auth.uid()
    )
  );

-- User table: sign-in reads your own row; admin reads all. No direct writes
-- for anyone -- an admin cannot even be fooled into self-promotion and there
-- is no write path that upgrades a `role` from the client.
create policy "user_read_own" on "user"
  for select using (user_id = auth.uid());
create policy "user_read_admin" on "user"
  for select using (get_app_role() = 'admin');

-- ---------------------------------------------------------------------------
-- 4) Integrity / CHECK constraints.
-- ---------------------------------------------------------------------------
alter table transactions
  add constraint transactions_payment_mode_check
    check (payment_mode in ('cash', 'gcash', 'maya'));
alter table transactions
  add constraint transactions_amounts_nonneg_check
    check (total_amount >= 0 and (amount_received is null or amount_received >= 0));
alter table transaction_items
  add constraint transaction_items_qty_check check (quantity > 0);
alter table transaction_items
  add constraint transaction_items_subtotal_check check (subtotal >= 0);
alter table inventory
  add constraint inventory_qty_check check (quantity >= 0);
alter table stock_movements
  add constraint stock_movements_qty_check check (quantity > 0);

-- ---------------------------------------------------------------------------
-- 5) Atomic, server-validated write RPCs (SECURITY DEFINER).
-- ---------------------------------------------------------------------------

-- process_sale: persists a completed transaction and its line items, recomputes
-- the total from product.price (client-supplied amounts/totals are ignored),
-- and decrements inventory with a stock guard. Runs inside one transaction;
-- any failure rolls everything back.
create or replace function public.process_sale(
  p_transaction_id uuid,
  p_payment_mode   text,
  p_amount_received numeric,
  p_change_given    numeric,
  p_items           jsonb,
  p_date            timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid     := auth.uid();
  v_role     text     := get_app_role();
  v_total    numeric  := 0;
  v_row      record;
  v_item     jsonb;
  v_product_id bigint;
  v_qty        integer;
  v_unit_price numeric;
  v_stock_id   bigint;
  v_stock_qty  integer;
begin
  if v_role is null then
    raise exception 'Not authenticated';
  end if;

  insert into transactions (id, user_id, total_amount, payment_mode,
                            date, status, amount_received, change_given)
  values (p_transaction_id, v_user_id, 0, p_payment_mode,
          p_date, 'completed', p_amount_received, p_change_given);

  for v_row in
    select value from jsonb_array_elements(p_items)
  loop
    v_item := v_row.value;
    v_product_id := (v_item->>'product_id')::bigint;
    v_qty        := (v_item->>'quantity')::integer;

    select price into v_unit_price from product where product_id = v_product_id;
    if v_unit_price is null then
      raise exception 'Product % not found', v_product_id;
    end if;
    if v_qty <= 0 then
      raise exception 'Quantity must be greater than zero';
    end if;

    insert into transaction_items (id, transaction_id, product_id, quantity, subtotal)
    values (gen_random_uuid(), p_transaction_id, v_product_id, v_qty, v_unit_price * v_qty);

    select stock_id, quantity into v_stock_id, v_stock_qty
      from inventory
      where product_id = v_product_id
      for update;
    if v_stock_id is null then
      raise exception 'No inventory record for product %', v_product_id;
    end if;
    if v_stock_qty < v_qty then
      raise exception 'Insufficient stock for product %', v_product_id;
    end if;

    update inventory set quantity = v_stock_qty - v_qty where stock_id = v_stock_id;
    insert into stock_movements (stock_id, type, quantity, date)
    values (v_stock_id, 'out', v_qty, p_date);

    v_total := v_total + (v_unit_price * v_qty);
  end loop;

  update transactions set total_amount = v_total where id = p_transaction_id;
  return p_transaction_id;
end;
$$;

revoke all on function public.process_sale(uuid, text, numeric, numeric, jsonb, timestamptz) from public;
grant execute on function public.process_sale(uuid, text, numeric, numeric, jsonb, timestamptz) to authenticated;

-- adjust_stock: atomic stock-in with supplier + audit movement (admin only).
create or replace function public.adjust_stock(
  p_stock_id bigint,
  p_quantity integer,
  p_supplier text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if get_app_role() <> 'admin' then
    raise exception 'Admin only';
  end if;
  if p_quantity <= 0 then
    raise exception 'Stock-in quantity must be greater than zero';
  end if;

  update inventory set quantity = quantity + p_quantity where stock_id = p_stock_id;
  if not found then
    raise exception 'Inventory record % not found', p_stock_id;
  end if;

  insert into stock_movements (stock_id, type, quantity, date, supplier)
  values (p_stock_id, 'in', p_quantity, now(), p_supplier);
end;
$$;

revoke all on function public.adjust_stock(bigint, integer, text) from public;
grant execute on function public.adjust_stock(bigint, integer, text) to authenticated;

-- void_sale: guards already-voided transactions, restores stock atomically, and
-- applies the owner/admin permission check. No over-restore.
create or replace function public.void_sale(
  p_transaction_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role   text := get_app_role();
  v_status text;
  v_row    record;
  v_stock_id bigint;
begin
  if v_role not in ('admin', 'cashier') then
    raise exception 'Not authorized';
  end if;

  select status into v_status from transactions where id = p_transaction_id;
  if v_status is null then
    raise exception 'Transaction not found';
  end if;
  if v_status = 'voided' then
    raise exception 'Transaction already voided';
  end if;

  if v_role <> 'admin'
     and not exists (select 1 from transactions where id = p_transaction_id and user_id = auth.uid()) then
    raise exception 'Not authorized to void this transaction';
  end if;

  for v_row in
    select * from transaction_items where transaction_id = p_transaction_id
  loop
    select stock_id into v_stock_id
      from inventory
      where product_id = v_row.product_id
      for update;
    if v_stock_id is not null then
      update inventory set quantity = quantity + v_row.quantity where stock_id = v_stock_id;
      insert into stock_movements (stock_id, type, quantity, date)
      values (v_stock_id, 'in', v_row.quantity, now());
    end if;
  end loop;

  update transactions set status = 'voided', void_reason = p_reason
  where id = p_transaction_id;
end;
$$;

revoke all on function public.void_sale(uuid, text) from public;
grant execute on function public.void_sale(uuid, text) to authenticated;

-- set_user_active: admin-only toggling of an account's is_active flag. No role
-- column is ever writable from a client (prevents privilege escalation).
create or replace function public.set_user_active(
  p_user_id uuid,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if get_app_role() <> 'admin' then
    raise exception 'Admin only';
  end if;
  update "user" set is_active = p_active where user_id = p_user_id;
end;
$$;

revoke all on function public.set_user_active(uuid, boolean) from public;
grant execute on function public.set_user_active(uuid, boolean) to authenticated;