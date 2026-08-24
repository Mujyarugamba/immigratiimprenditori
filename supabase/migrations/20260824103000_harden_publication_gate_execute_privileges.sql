-- Harden direct EXECUTE privileges on the publication-gate trigger function.
--
-- Post-Production advisor verification on 2026-08-24 showed that the hosted
-- database still had direct EXECUTE grants for anon/authenticated/service_role
-- on this trigger-only SECURITY DEFINER function. The trigger itself does not
-- require client roles to invoke the function directly.
--
-- Candidate only. Production application requires separate explicit approval.

begin;

revoke all on function public.enforce_content_human_publication_gate()
  from public, anon, authenticated, service_role;

-- Self-check: this migration must fail rather than silently leave any direct
-- client/service execution path open. Trigger firing itself does not depend on
-- these direct EXECUTE grants.
do $$
begin
  if has_function_privilege(
       'anon',
       'public.enforce_content_human_publication_gate()',
       'EXECUTE'
     ) then
    raise exception 'PUBLICATION_GATE_ANON_EXECUTE_STILL_GRANTED';
  end if;

  if has_function_privilege(
       'authenticated',
       'public.enforce_content_human_publication_gate()',
       'EXECUTE'
     ) then
    raise exception 'PUBLICATION_GATE_AUTHENTICATED_EXECUTE_STILL_GRANTED';
  end if;

  if has_function_privilege(
       'service_role',
       'public.enforce_content_human_publication_gate()',
       'EXECUTE'
     ) then
    raise exception 'PUBLICATION_GATE_SERVICE_ROLE_EXECUTE_STILL_GRANTED';
  end if;

  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where not t.tgisinternal
      and n.nspname = 'public'
      and c.relname = 'contents'
      and t.tgname = 'contents_human_publication_gate'
  ) then
    raise exception 'PUBLICATION_GATE_TRIGGER_MISSING_AFTER_PRIVILEGE_HARDENING';
  end if;
end;
$$;

comment on function public.enforce_content_human_publication_gate() is
  'Trigger-only hard editorial publication gate. Direct client/service EXECUTE is revoked; publication remains enforced by the contents trigger.';

commit;
