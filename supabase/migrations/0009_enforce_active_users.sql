-- Inactive accounts have no application role, so every RLS policy and RPC
-- that depends on get_app_role() rejects them immediately, even while an old
-- access token remains valid.
create or replace function public.get_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public."user"
  where user_id = auth.uid()
    and is_active = true
$$;

revoke all on function public.get_app_role() from public;
grant execute on function public.get_app_role() to authenticated;

-- Keep database-level safeguards even though the application normally calls
-- the set-user-active Edge Function, which also bans/unbans the Auth identity.
create or replace function public.set_user_active(
  p_user_id uuid,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_role text;
  v_active_admins integer;
begin
  if get_app_role() <> 'admin' then
    raise exception 'Admin only';
  end if;

  if p_user_id = auth.uid() and not p_active then
    raise exception 'You cannot disable your own account';
  end if;

  -- Serialize account-status changes so two concurrent requests cannot both
  -- disable administrators after observing the same count.
  lock table public."user" in share row exclusive mode;

  select role into v_target_role
  from public."user"
  where user_id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  if not p_active and v_target_role = 'admin' then
    select count(*) into v_active_admins
    from public."user"
    where role = 'admin' and is_active = true;

    if v_active_admins <= 1 then
      raise exception 'The final active admin cannot be disabled';
    end if;
  end if;

  update public."user"
  set is_active = p_active
  where user_id = p_user_id;
end;
$$;

revoke all on function public.set_user_active(uuid, boolean) from public;
grant execute on function public.set_user_active(uuid, boolean) to authenticated;
