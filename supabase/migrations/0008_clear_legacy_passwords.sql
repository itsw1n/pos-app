-- Authentication credentials belong exclusively to Supabase Auth. Clear any
-- legacy values that may have been written to the public profile table.
update "user" set password = null where password is not null;
