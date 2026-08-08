-- 0007_secure_product_image_storage.sql
-- Security hardening for the product-images bucket: the policies created in
-- 0005 constrained writes to "authenticated" but checked only bucket_id, so
-- any logged-in cashier could overwrite or delete another user's uploaded
-- product photo. Restrict mutation to the file owner; admins keep a full
-- manage path (e.g. cleanup on product delete).

drop policy if exists "product-images authenticated update" on storage.objects;
create policy "product-images authenticated update" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
      and (owner_id = auth.uid() or get_app_role() = 'admin')
  )
  with check (bucket_id = 'product-images');

drop policy if exists "product-images authenticated delete" on storage.objects;
create policy "product-images authenticated delete" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
      and (owner_id = auth.uid() or get_app_role() = 'admin')
  );

drop policy if exists "product-images authenticated upload" on storage.objects;
create policy "product-images authenticated upload" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images');