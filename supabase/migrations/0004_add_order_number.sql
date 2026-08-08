-- 0004_add_order_number.sql
-- Daily sequential order numbers (Order #001 each day) + idempotency-safe,
-- concurrency-safe process_sale. Forward-only migration.

-- ---------------------------------------------------------------------------
-- 1) order_number column on transactions.
-- ---------------------------------------------------------------------------
alter table transactions
  add column if not exists order_number int;

-- ---------------------------------------------------------------------------
-- 2) Per-day counter.
--    day PK makes the two-step allocation (INSERT-then-UPDATE) below lock to a
--    single row per calendar day. No custom config: the business day is
--    bucketed in a fixed, server-side zone ('Asia/Manila') so numbers are
--    reproducible and independent of the cashier's device timezone.
-- ---------------------------------------------------------------------------
create table if not exists order_number_counter (
  day  date primary key,
  last int not null default 0
);

-- ---------------------------------------------------------------------------
-- 3) Backfill: point the counter past the highest existing order_number for each
--    day, so a freshly-migrated DEV/PROD keeps numbering continuous.
--    This does NOT renumber any rows; it only primes the counter.
-- ---------------------------------------------------------------------------
insert into order_number_counter(day, last)
  select day_bucket, coalesce(max(order_number), 0)
  from (
    select (date AT TIME ZONE 'Asia/Manila')::date as day_bucket,
           order_number
    from transactions
  ) t
  where order_number is not null
  group by day_bucket
on conflict (day) do update
  set last = greatest(order_number_counter.last, excluded.last);

-- ---------------------------------------------------------------------------
-- 4) process_sale: idempotent + concurrency-safe daily order allocation.
--    Signature matches 0003 exactly so the revoke/grant lines below are stable.
-- ---------------------------------------------------------------------------
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
  v_user_id   uuid := auth.uid();
  v_role      text := get_app_role();
  v_total     numeric := 0;
  v_day       date;
  v_order_no  int;
  v_row       record;
  v_item      jsonb;
  v_product_id bigint;
  v_qty       integer;
  v_unit_price numeric;
  v_stock_id  bigint;
  v_stock_qty integer;
begin
  if v_role is null then
    raise exception 'Not authenticated';
  end if;

  -- Idempotency: a retried RPC with the same id must not duplicate the sale or
  -- consume another order number.
  if exists (select 1 from transactions where id = p_transaction_id) then
    return p_transaction_id;
  end if;

  -- Business day in a fixed, server-side zone (Asia/Manila).
  v_day := (p_date AT TIME ZONE 'Asia/Manila')::date;

  -- Concurrency-safe daily allocation in two statements within one
  -- transaction:
  --   (a) guarantee the counter row exists for this day;
  --   (b) atomically increment last and return the new value.
  -- The UPDATE holds a row-level lock on the counter row for the day, so
  -- concurrent sales serialize on it and RETURNING yields distinct values.
  -- First sale of a new day: INSERT creates (day,0) -> UPDATE -> last=1 ->
  -- RETURNING 1. Aborted transactions roll back the UPDATE, so the counter
  -- never advances for sales that did not commit.
  insert into order_number_counter(day, last)
    values (v_day, 0)
  on conflict (day) do nothing;

  update order_number_counter
    set last = last + 1
  where day = v_day
  returning last into v_order_no;

  insert into transactions (id, user_id, total_amount, payment_mode,
                            date, status, amount_received, change_given,
                            order_number)
  values (p_transaction_id, v_user_id, 0, p_payment_mode,
          p_date, 'completed', p_amount_received, p_change_given, v_order_no);

  -- (Original 0003 item loop / inventory deduction / total recompute, verbatim.)
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
