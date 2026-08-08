-- 0006_secure_order_counter_rls.sql
-- Security hardening: order_number_counter was created in 0004 without row
-- level security, so Supabase's default grants left it readable/writable by
-- anon and authenticated clients. Only the security-definer process_sale RPC
-- should touch it. Enabling RLS with no policies denies all client access
-- while leaving the RPC (which runs as the function owner) unaffected.

alter table order_number_counter enable row level security;

revoke all on table order_number_counter from anon, authenticated;
