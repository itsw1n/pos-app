-- Edge Functions use the service-role key for trusted Auth/profile operations.
-- BYPASSRLS does not replace ordinary PostgreSQL table/sequence privileges.
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
