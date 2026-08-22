-- Immigrati Imprenditori — hard publication gate
--
-- Prepared on the research branch only. Do not apply to Production as part of
-- this cycle.
--
-- Goal: publication must remain a human editorial act. Owner/person/business
-- RLS policies may allow draft editing, but no authenticated owner, anonymous
-- caller, ingestion service or background automation may make a content record
-- publicly visible by directly changing lifecycle columns.

begin;

-- New/future published rows must be editorial-owned. NOT VALID deliberately
-- avoids rewriting or validating historical rows during rollout; PostgreSQL
-- still enforces the constraint for new rows and future updates.
alter table public.contents
  add constraint contents_published_requires_editorial_owner_check
  check (
    publication_status <> 'published'
    or (
      owned_by_editorial = true
      and owner_person_id is null
      and owner_business_id is null
    )
  ) not valid;

create or replace function public.enforce_content_human_publication_gate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_requires_editor boolean;
  v_is_editor boolean;
begin
  -- Any row that is published, publicly visible or featured is on a public
  -- editorial axis and therefore requires a human editorial identity.
  v_requires_editor :=
    new.publication_status = 'published'
    or new.visibility_status = 'public'
    or new.is_featured = true;

  if not v_requires_editor then
    return new;
  end if;

  -- access_* helpers resolve the active application account from auth.uid().
  -- A service-role/background process has no active editorial account here and
  -- therefore does not satisfy this gate. This is intentional: automations may
  -- create Inbox records or drafts, never publish directly.
  v_is_editor :=
    coalesce(public.access_is_editor(), false)
    or coalesce(public.access_is_application_admin(), false);

  if not v_is_editor then
    raise exception 'CONTENT_PUBLICATION_REQUIRES_EDITOR'
      using errcode = '42501';
  end if;

  if new.owned_by_editorial is distinct from true
     or new.owner_person_id is not null
     or new.owner_business_id is not null then
    raise exception 'CONTENT_PUBLICATION_REQUIRES_EDITORIAL_OWNERSHIP'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_content_human_publication_gate() from public;

-- Trigger executes for all SQL callers, including roles that bypass RLS.
-- There is intentionally no service-role bypass branch.
drop trigger if exists contents_human_publication_gate on public.contents;
create trigger contents_human_publication_gate
before insert or update on public.contents
for each row execute function public.enforce_content_human_publication_gate();

comment on function public.enforce_content_human_publication_gate() is
  'Hard editorial publication gate: public/published/featured contents require an authenticated editor/admin and editorial ownership. Background/service-role automation has no bypass.';

commit;
