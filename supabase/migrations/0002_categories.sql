-- 0002_categories.sql
-- Dynamic product categories.
-- Replaces the free-text product.category column with a normalized
-- category table + FK (category.category_id) on product.

create table if not exists category (
  category_id uuid primary key default gen_random_uuid(),
  name        text        not null unique,
  created_at  timestamptz not null default now()
);

alter table category enable row level security;

drop policy if exists "authenticated full access" on category;
create policy "authenticated full access" on category
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "anon can read catalog" on category;
create policy "anon can read catalog" on category
  using (auth.role() = 'anon');

-- Data migration is guarded so the file stays idempotent across re-seeds:
-- once the legacy product.category column has been dropped it is skipped.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'product' and column_name = 'category'
  ) then
    -- Backfill categories from the legacy free-text column.
    insert into category (name)
    select distinct category from product
    where category is not null and category <> ''
    on conflict (name) do nothing;

    -- Add the FK column and migrate existing data.
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'product' and column_name = 'category_id'
    ) then
      alter table product add column category_id uuid references category (category_id);
    end if;

    update product p
    set category_id = c.category_id
    from category c
    where c.name = p.category
      and p.category_id is null;

    alter table product drop column category;
  end if;
end $$;

alter table product alter column category_id set not null;
