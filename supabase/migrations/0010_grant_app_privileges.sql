-- PostgreSQL privileges are evaluated before RLS. Grant only the operations
-- for which 0003_rbac.sql defines authenticated policies; RLS still decides
-- which rows each admin/cashier may access.
grant select on table
  public.product,
  public.category,
  public.inventory,
  public.transactions,
  public.transaction_items,
  public.stock_movements,
  public."user"
to authenticated;

grant insert, update, delete on table
  public.product,
  public.category,
  public.inventory
to authenticated;

grant usage, select on sequence public.product_product_id_seq to authenticated;
