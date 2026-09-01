\set ON_ERROR_STOP on

create extension if not exists pgtap with schema extensions;

begin;
select plan(12);

select
  max(user_id::text) filter (where username = 'admin') as admin_id,
  max(user_id::text) filter (where username = 'cashier') as cashier_id
from public."user"
\gset

set local role authenticated;
select set_config('request.jwt.claim.sub', :'admin_id', true);

select is(
  public.get_app_role(),
  'admin',
  'an active admin receives the admin application role'
);

select throws_ok(
  format(
    'select public.set_user_active(%L::uuid, false)',
    :'admin_id'
  ),
  'P0001',
  'You cannot disable your own account',
  'an admin cannot disable their own account'
);

select lives_ok(
  format(
    'select public.set_user_active(%L::uuid, false)',
    :'cashier_id'
  ),
  'an admin can disable a cashier profile'
);

select is(
  (select is_active from public."user" where user_id = :'cashier_id'::uuid),
  false,
  'disabling updates the public profile status'
);

select set_config('request.jwt.claim.sub', :'cashier_id', true);

select ok(
  public.get_app_role() is null,
  'an inactive profile receives no application role'
);

select is(
  (select count(*)::integer from public.product),
  0,
  'RLS hides the catalog from an inactive profile'
);

select throws_ok(
  $$
    select public.process_sale(
      'a1000000-0000-4000-8000-000000000001'::uuid,
      'cash',
      100,
      0,
      '[{"product_id": 1, "quantity": 1}]'::jsonb,
      now()
    )
  $$,
  'P0001',
  'Not authenticated',
  'an inactive profile cannot process a sale with an existing JWT'
);

select set_config('request.jwt.claim.sub', :'admin_id', true);

select lives_ok(
  format(
    'select public.set_user_active(%L::uuid, true)',
    :'cashier_id'
  ),
  'an admin can reactivate a cashier profile'
);

select set_config('request.jwt.claim.sub', :'cashier_id', true);

select is(
  public.get_app_role(),
  'cashier',
  'a reactivated cashier receives the cashier role again'
);

select throws_ok(
  format(
    'select public.set_user_active(%L::uuid, false)',
    :'admin_id'
  ),
  'P0001',
  'Admin only',
  'a cashier cannot change account status'
);

select throws_ok(
  format(
    'update public."user" set role = %L where user_id = %L::uuid',
    'admin',
    :'cashier_id'
  ),
  '42501',
  'permission denied for table user',
  'authenticated clients have no direct user-table update privilege'
);

select is(
  (select role from public."user" where user_id = :'cashier_id'::uuid),
  'cashier',
  'a cashier cannot promote their profile through a direct update'
);

select * from finish();
rollback;
