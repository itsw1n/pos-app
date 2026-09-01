\set ON_ERROR_STOP on

create extension if not exists pgtap with schema extensions;

begin;
select plan(17);

select
  max(user_id::text) filter (where username = 'admin') as admin_id,
  max(user_id::text) filter (where username = 'cashier') as cashier_id
from public."user"
\gset

select
  price as product_price,
  (select quantity from public.inventory where product_id = product.product_id) as initial_quantity,
  (select stock_id from public.inventory where product_id = product.product_id) as stock_id
from public.product
where product_id = 1
\gset

set local role authenticated;
select set_config('request.jwt.claim.sub', :'cashier_id', true);

select lives_ok(
  $$
    select public.process_sale(
      'a2000000-0000-4000-8000-000000000001'::uuid,
      'cash',
      500,
      240,
      '[{"product_id": 1, "quantity": 2}]'::jsonb,
      '2026-09-01T08:00:00+08:00'::timestamptz
    )
  $$,
  'a cashier can process a valid sale'
);

select is(
  (select count(*)::integer from public.transactions where id = 'a2000000-0000-4000-8000-000000000001'),
  1,
  'the sale creates exactly one transaction'
);

select is(
  (select total_amount from public.transactions where id = 'a2000000-0000-4000-8000-000000000001'),
  (:'product_price'::numeric * 2),
  'the server recomputes the transaction total from product prices'
);

select is(
  (select quantity from public.inventory where product_id = 1),
  (:'initial_quantity'::integer - 2),
  'a sale atomically deducts inventory'
);

reset role;

select is(
  (
    select count(*)::integer
    from public.stock_movements
    where stock_id = :'stock_id'::bigint and type = 'out' and quantity = 2
  ),
  1,
  'a sale records its stock movement'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', :'cashier_id', true);

select lives_ok(
  $$
    select public.process_sale(
      'a2000000-0000-4000-8000-000000000001'::uuid,
      'cash',
      500,
      240,
      '[{"product_id": 1, "quantity": 2}]'::jsonb,
      '2026-09-01T08:00:00+08:00'::timestamptz
    )
  $$,
  'retrying the same transaction ID is accepted'
);

select is(
  (select quantity from public.inventory where product_id = 1),
  (:'initial_quantity'::integer - 2),
  'an idempotent retry does not deduct inventory twice'
);

select throws_ok(
  $$
    select public.process_sale(
      'a2000000-0000-4000-8000-000000000002'::uuid,
      'cash',
      500,
      0,
      '[{"product_id": 6, "quantity": 1}]'::jsonb,
      '2026-09-01T08:01:00+08:00'::timestamptz
    )
  $$,
  'P0001',
  'Insufficient stock for product 6',
  'a sale cannot oversell inventory'
);

select is(
  (select count(*)::integer from public.transactions where id = 'a2000000-0000-4000-8000-000000000002'),
  0,
  'a rejected sale rolls back its transaction row'
);

select throws_ok(
  format(
    'select public.adjust_stock(%s, 5, %L)',
    :'stock_id',
    'Integration Supplier'
  ),
  'P0001',
  'Admin only',
  'a cashier cannot perform stock-in'
);

select set_config('request.jwt.claim.sub', :'admin_id', true);

select lives_ok(
  format(
    'select public.adjust_stock(%s, 5, %L)',
    :'stock_id',
    'Integration Supplier'
  ),
  'an admin can perform stock-in'
);

select is(
  (select quantity from public.inventory where product_id = 1),
  (:'initial_quantity'::integer + 3),
  'stock-in adds the requested quantity after the sale deduction'
);

select set_config('request.jwt.claim.sub', :'cashier_id', true);

select lives_ok(
  $$
    select public.void_sale(
      'a2000000-0000-4000-8000-000000000001'::uuid,
      'Integration test void'
    )
  $$,
  'the owning cashier can void their transaction'
);

select is(
  (select status from public.transactions where id = 'a2000000-0000-4000-8000-000000000001'),
  'voided',
  'voiding marks the transaction as voided'
);

select is(
  (select quantity from public.inventory where product_id = 1),
  (:'initial_quantity'::integer + 5),
  'voiding restores the sold inventory'
);

select throws_ok(
  $$
    select public.void_sale(
      'a2000000-0000-4000-8000-000000000001'::uuid,
      'Duplicate void'
    )
  $$,
  'P0001',
  'Transaction already voided',
  'a transaction cannot be voided twice'
);

select throws_ok(
  $$
    select public.void_sale(
      '6ba7b811-9dad-11d1-80b4-00c04fd4cafe'::uuid,
      'Not my transaction'
    )
  $$,
  'P0001',
  'Not authorized to void this transaction',
  'a cashier cannot void another user transaction'
);

select * from finish();
rollback;
