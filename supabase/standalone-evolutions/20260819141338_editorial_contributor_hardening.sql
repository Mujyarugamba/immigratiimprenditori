-- Canonical post-cutover Centro Studi evolution captured from the hosted
-- migration history. It consolidates the production migrations applied between
-- 20260819141338 and 20260819143251. Used for local cold-start validation only;
-- no automatic Production application is performed from this file.

begin;

revoke all on table
  public.geo_territories,
  public.migration_routes,
  public.content_geographies,
  public.content_routes,
  public.event_geographies,
  public.event_routes,
  public.editorial_inbox_items,
  public.editorial_submissions,
  public.editorial_inbox_activity
from anon, authenticated;

grant select on table
  public.geo_territories,
  public.migration_routes,
  public.content_geographies,
  public.content_routes,
  public.event_geographies,
  public.event_routes
  to anon, authenticated;

grant insert, update, delete on table
  public.geo_territories,
  public.migration_routes,
  public.content_geographies,
  public.content_routes,
  public.event_geographies,
  public.event_routes
  to authenticated;

grant select, insert, update, delete on table
  public.editorial_inbox_items,
  public.editorial_submissions
  to authenticated;

grant select on table public.editorial_inbox_activity to authenticated;

commit;

begin;

-- Hosted pre-SPLIT history used account_role_assignments_role_code_check;
-- the standalone SPLIT-3 baseline names the equivalent constraint
-- account_role_code_check. Drop either form before installing the canonical
-- contributor-inclusive constraint used by the cold-start model.
alter table public.account_role_assignments
  drop constraint if exists account_role_assignments_role_code_check;
alter table public.account_role_assignments
  drop constraint if exists account_role_code_check;
alter table public.account_role_assignments
  add constraint account_role_assignments_role_code_check
  check (role_code in ('redattore','amministratore_applicativo','contributore'));

create or replace function public.access_is_contributor()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.access_has_active_application_role('contributore');
$$;

revoke all on function public.access_is_contributor() from public, anon;
grant execute on function public.access_is_contributor() to authenticated;

alter table public.editorial_inbox_items
  add column submitted_by_account_id uuid null
  references public.accounts(id) on delete set null;

create index editorial_inbox_submitted_by_account_idx
  on public.editorial_inbox_items(submitted_by_account_id, received_at desc)
  where submitted_by_account_id is not null;

create or replace function public.submit_editorial_contribution(
  p_submission_kind text,
  p_submitter_name text,
  p_submitter_email text,
  p_contribution_text text,
  p_title text default null,
  p_submitter_phone text default null,
  p_organization_name text default null,
  p_origin_country_code text default null,
  p_destination_country_code text default null,
  p_original_url text default null,
  p_consent_contact boolean default true,
  p_consent_publication boolean default false,
  p_origin_country_label text default null,
  p_destination_country_label text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inbox_id uuid;
  v_item_kind text;
  v_origin text;
  v_destination text;
  v_origin_label text;
  v_destination_label text;
  v_account_id uuid;
  v_source_kind text := 'public_submission';
begin
  if p_submission_kind not in ('story','interview','event','research','publication','other') then raise exception 'invalid submission kind'; end if;
  if length(btrim(coalesce(p_submitter_name, ''))) = 0 then raise exception 'submitter name is required'; end if;
  if length(btrim(coalesce(p_submitter_email, ''))) < 4 or position('@' in p_submitter_email) <= 1 then raise exception 'valid submitter email is required'; end if;
  if length(btrim(coalesce(p_contribution_text, ''))) = 0 then raise exception 'contribution text is required'; end if;

  v_origin := nullif(upper(btrim(p_origin_country_code)), '');
  v_destination := nullif(upper(btrim(p_destination_country_code)), '');
  v_origin_label := nullif(btrim(p_origin_country_label), '');
  v_destination_label := nullif(btrim(p_destination_country_label), '');

  if v_origin is not null and v_origin !~ '^[A-Z]{2}$' then raise exception 'invalid origin country'; end if;
  if v_destination is not null and v_destination !~ '^[A-Z]{2}$' then raise exception 'invalid destination country'; end if;

  if public.access_is_contributor() then
    v_account_id := public.access_current_account_id();
    if v_account_id is not null then
      v_source_kind := 'contributor';
    end if;
  end if;

  v_item_kind := case p_submission_kind
    when 'story' then 'user_testimony'
    when 'interview' then 'interview_proposal'
    when 'event' then 'event'
    when 'research' then 'academic_paper'
    when 'publication' then 'publication_submission'
    else 'other'
  end;

  insert into public.editorial_inbox_items (
    source_kind,item_kind,title,original_url,source_label,summary,
    origin_country_code,destination_country_code,origin_country_label,destination_country_label,
    priority,status,submitted_by_account_id
  ) values (
    v_source_kind,v_item_kind,
    coalesce(nullif(btrim(p_title), ''),'Proposta editoriale — ' || p_submission_kind),
    nullif(btrim(p_original_url), ''),'Segnalazione pubblica',left(btrim(p_contribution_text),2000),
    v_origin,v_destination,v_origin_label,v_destination_label,'normal','new',v_account_id
  ) returning id into v_inbox_id;

  insert into public.editorial_submissions (
    inbox_item_id,submission_kind,submitter_name,submitter_email,submitter_phone,
    organization_name,contribution_text,consent_contact,consent_publication,
    origin_country_label,destination_country_label
  ) values (
    v_inbox_id,p_submission_kind,btrim(p_submitter_name),btrim(p_submitter_email),
    nullif(btrim(p_submitter_phone), ''),nullif(btrim(p_organization_name), ''),
    btrim(p_contribution_text),p_consent_contact,p_consent_publication,
    v_origin_label,v_destination_label
  );

  return v_inbox_id;
end;
$$;

revoke all on function public.submit_editorial_contribution(
  text,text,text,text,text,text,text,text,text,text,boolean,boolean,text,text
) from public;
grant execute on function public.submit_editorial_contribution(
  text,text,text,text,text,text,text,text,text,text,boolean,boolean,text,text
) to anon, authenticated;

create policy editorial_inbox_contributor_read_own
on public.editorial_inbox_items
for select
to authenticated
using (
  public.access_is_contributor()
  and submitted_by_account_id = public.access_current_account_id()
);

create policy editorial_submissions_contributor_read_own
on public.editorial_submissions
for select
to authenticated
using (
  public.access_is_contributor()
  and exists (
    select 1
    from public.editorial_inbox_items i
    where i.id = editorial_submissions.inbox_item_id
      and i.submitted_by_account_id = public.access_current_account_id()
  )
);

commit;

begin;

create index if not exists content_geographies_territory_idx
  on public.content_geographies(territory_id)
  where territory_id is not null;
create index if not exists event_geographies_territory_idx
  on public.event_geographies(territory_id)
  where territory_id is not null;
create index if not exists editorial_inbox_duplicate_idx
  on public.editorial_inbox_items(duplicate_of_id)
  where duplicate_of_id is not null;
create index if not exists editorial_inbox_linked_content_idx
  on public.editorial_inbox_items(linked_content_id)
  where linked_content_id is not null;
create index if not exists editorial_inbox_linked_event_idx
  on public.editorial_inbox_items(linked_event_id)
  where linked_event_id is not null;
create index if not exists editorial_inbox_territory_idx
  on public.editorial_inbox_items(territory_id)
  where territory_id is not null;

commit;

begin;

drop policy if exists editorial_inbox_editor_all on public.editorial_inbox_items;
drop policy if exists editorial_inbox_contributor_read_own on public.editorial_inbox_items;

create policy editorial_inbox_read_authorized
on public.editorial_inbox_items
for select
to authenticated
using (
  public.access_is_editor()
  or public.access_is_application_admin()
  or (
    public.access_is_contributor()
    and submitted_by_account_id = public.access_current_account_id()
  )
);

create policy editorial_inbox_editor_insert
on public.editorial_inbox_items
for insert
to authenticated
with check (public.access_is_editor() or public.access_is_application_admin());

create policy editorial_inbox_editor_update
on public.editorial_inbox_items
for update
to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy editorial_inbox_editor_delete
on public.editorial_inbox_items
for delete
to authenticated
using (public.access_is_editor() or public.access_is_application_admin());

drop policy if exists editorial_submissions_editor_all on public.editorial_submissions;
drop policy if exists editorial_submissions_contributor_read_own on public.editorial_submissions;

create policy editorial_submissions_read_authorized
on public.editorial_submissions
for select
to authenticated
using (
  public.access_is_editor()
  or public.access_is_application_admin()
  or (
    public.access_is_contributor()
    and exists (
      select 1
      from public.editorial_inbox_items i
      where i.id = editorial_submissions.inbox_item_id
        and i.submitted_by_account_id = public.access_current_account_id()
    )
  )
);

create policy editorial_submissions_editor_insert
on public.editorial_submissions
for insert
to authenticated
with check (public.access_is_editor() or public.access_is_application_admin());

create policy editorial_submissions_editor_update
on public.editorial_submissions
for update
to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy editorial_submissions_editor_delete
on public.editorial_submissions
for delete
to authenticated
using (public.access_is_editor() or public.access_is_application_admin());

commit;

begin;

create or replace function public.access_has_active_application_role(p_role text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select (
    p_role is not null
    and public.access_is_active_account()
    and p_role in ('redattore','amministratore_applicativo','contributore')
    and exists (
      select 1
      from public.account_role_assignments r
      where r.account_id = public.access_current_account_id()
        and r.role_code = p_role
        and r.assignment_status = 'active'
    )
  );
$$;

commit;

begin;

create or replace function public.assign_application_role(p_account_id uuid, p_role_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment_id uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'not authorized' using errcode='42501';
  end if;
  if p_account_id is null or p_role_code is null then
    raise exception 'account id and role code required' using errcode='22004';
  end if;
  if p_role_code not in ('redattore','amministratore_applicativo','contributore') then
    raise exception 'role not allowed' using errcode='22023';
  end if;
  if not exists(
    select 1 from public.accounts a
    where a.id=p_account_id and a.account_status<>'closed'
  ) then
    raise exception 'account not available' using errcode='P0002';
  end if;

  insert into public.account_role_assignments(
    account_id, role_code, assignment_status, assigned_at, revoked_at
  ) values (
    p_account_id, p_role_code, 'active', now(), null
  )
  on conflict(account_id,role_code) do update
    set assignment_status='active', revoked_at=null, assigned_at=now()
  returning id into v_assignment_id;

  return v_assignment_id;
end;
$$;

commit;
