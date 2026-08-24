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

comment on function public.enforce_content_human_publication_gate() is
  'Trigger-only hard editorial publication gate. Direct client/service EXECUTE is revoked; publication remains enforced by the contents trigger.';

commit;
