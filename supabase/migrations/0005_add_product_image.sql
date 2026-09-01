-- 0005_add_product_image.sql
-- Product photos: nullable product.image_url column + a public Supabase
-- Storage bucket ("product-images") for uploaded image files.
--
-- Idempotent: safe to re-run via `supabase db reset` / `make db-reset`.

alter table product add column if not exists image_url text;

-- --- Public storage bucket --------------------------------------------------
-- A bucket id may exist already; on conflict do nothing keeps it idempotent.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read" on storage.objects
  for select
  using (bucket_id = 'product-images');

drop policy if exists "product-images authenticated upload" on storage.objects;
create policy "product-images authenticated upload" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "product-images authenticated update" on storage.objects;
create policy "product-images authenticated update" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "product-images authenticated delete" on storage.objects;
create policy "product-images authenticated delete" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images');
