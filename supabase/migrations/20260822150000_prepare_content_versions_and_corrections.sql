-- Versioning and public correction-register architecture.
-- Prepared on the development branch. Apply only after production-schema review.
-- Historical version snapshots are private, append-only editorial records.
-- The public correction register must be exposed only when this migration is live
-- and at least one public notice exists; no empty public placeholder page.

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  version_label text not null check (length(btrim(version_label)) > 0),
  change_summary text not null check (length(btrim(change_summary)) > 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  created_by uuid null,
  created_at timestamptz not null default now(),
  unique (content_id, version_number)
);

create index if not exists content_versions_content_created_idx
  on public.content_versions(content_id, created_at desc);

create table if not exists public.content_corrections (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  version_id uuid null references public.content_versions(id) on delete set null,
  correction_kind text not null check (
    correction_kind in ('metadata','minor','substantive','retraction')
  ),
  notice text not null check (length(btrim(notice)) > 0),
  corrected_at timestamptz not null default now(),
  public_notice boolean not null default true,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_corrections_public_idx
  on public.content_corrections(public_notice, corrected_at desc)
  where public_notice = true;

alter table public.content_versions enable row level security;
alter table public.content_corrections enable row level security;

-- Append-only version ledger: editors may inspect and append snapshots, but an
-- already recorded version cannot be rewritten or deleted through Data API/RLS.
drop policy if exists content_versions_editor_all on public.content_versions;
drop policy if exists content_versions_editor_read on public.content_versions;
create policy content_versions_editor_read
on public.content_versions for select to authenticated
using (access_is_editor() or access_is_application_admin());

drop policy if exists content_versions_editor_insert on public.content_versions;
create policy content_versions_editor_insert
on public.content_versions for insert to authenticated
with check (access_is_editor() or access_is_application_admin());

-- Version snapshots may contain draft text, internal corrections or superseded
-- material. They remain private to authenticated editors even when the current
-- content is public. Public transparency is provided by content_corrections only.
drop policy if exists content_versions_public_read on public.content_versions;

drop policy if exists content_corrections_editor_all on public.content_corrections;
create policy content_corrections_editor_all
on public.content_corrections for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

drop policy if exists content_corrections_public_read on public.content_corrections;
create policy content_corrections_public_read
on public.content_corrections for select to anon, authenticated
using (
  public_notice
  and exists (
    select 1
    from public.contents c
    where c.id = content_id
      and c.editorial_status = 'ready'
      and c.publication_status = 'published'
      and c.visibility_status = 'public'
      and c.archived_at is null
  )
);

revoke all on public.content_versions from anon;
revoke update, delete on public.content_versions from authenticated;
grant select, insert on public.content_versions to authenticated;
grant select on public.content_corrections to anon, authenticated;
grant insert, update, delete on public.content_corrections to authenticated;

-- Capture the state that exists when versioning is activated. This gives every
-- pre-existing content a v1 baseline without inventing editorial history.
insert into public.content_versions (
  content_id,
  version_number,
  version_label,
  change_summary,
  snapshot,
  created_by,
  created_at
)
select
  c.id,
  1,
  'v1',
  'Baseline al momento dell’attivazione del versionamento',
  to_jsonb(c),
  null,
  now()
from public.contents c
where not exists (
  select 1
  from public.content_versions v
  where v.content_id = c.id
);

create or replace function public.capture_content_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version integer;
  v_changed_fields text[];
  v_summary text;
begin
  if tg_op = 'UPDATE' then
    v_changed_fields := array_remove(array[
      case when new.owner_person_id is distinct from old.owner_person_id then 'owner_person_id' end,
      case when new.owner_business_id is distinct from old.owner_business_id then 'owner_business_id' end,
      case when new.owned_by_editorial is distinct from old.owned_by_editorial then 'owned_by_editorial' end,
      case when new.type_code is distinct from old.type_code then 'type_code' end,
      case when new.primary_category_code is distinct from old.primary_category_code then 'primary_category_code' end,
      case when new.language_id is distinct from old.language_id then 'language_id' end,
      case when new.title is distinct from old.title then 'title' end,
      case when new.subtitle is distinct from old.subtitle then 'subtitle' end,
      case when new.abstract is distinct from old.abstract then 'abstract' end,
      case when new.body is distinct from old.body then 'body' end,
      case when new.body_format is distinct from old.body_format then 'body_format' end,
      case when new.slug is distinct from old.slug then 'slug' end,
      case when new.cover_url is distinct from old.cover_url then 'cover_url' end,
      case when new.source_url is distinct from old.source_url then 'source_url' end,
      case when new.source_label is distinct from old.source_label then 'source_label' end,
      case when new.editorial_status is distinct from old.editorial_status then 'editorial_status' end,
      case when new.publication_status is distinct from old.publication_status then 'publication_status' end,
      case when new.visibility_status is distinct from old.visibility_status then 'visibility_status' end,
      case when new.is_featured is distinct from old.is_featured then 'is_featured' end,
      case when new.published_at is distinct from old.published_at then 'published_at' end,
      case when new.withdrawn_at is distinct from old.withdrawn_at then 'withdrawn_at' end,
      case when new.archived_at is distinct from old.archived_at then 'archived_at' end
    ], null);

    if coalesce(cardinality(v_changed_fields), 0) = 0 then
      return new;
    end if;
    v_summary := 'Aggiornamento: ' || array_to_string(v_changed_fields, ', ');
  else
    v_summary := 'Creazione contenuto';
  end if;

  select coalesce(max(v.version_number), 0) + 1
    into v_version
  from public.content_versions v
  where v.content_id = new.id;

  insert into public.content_versions (
    content_id,
    version_number,
    version_label,
    change_summary,
    snapshot,
    created_by
  ) values (
    new.id,
    v_version,
    'v' || v_version::text,
    v_summary,
    to_jsonb(new),
    public.access_current_account_id()
  );

  return new;
end;
$$;

revoke all on function public.capture_content_version() from public, anon, authenticated;

drop trigger if exists contents_capture_initial_version on public.contents;
create trigger contents_capture_initial_version
after insert on public.contents
for each row execute function public.capture_content_version();

drop trigger if exists contents_capture_version on public.contents;
create trigger contents_capture_version
after update of
  owner_person_id,
  owner_business_id,
  owned_by_editorial,
  type_code,
  primary_category_code,
  language_id,
  title,
  subtitle,
  abstract,
  body,
  body_format,
  slug,
  cover_url,
  source_url,
  source_label,
  editorial_status,
  publication_status,
  visibility_status,
  is_featured,
  published_at,
  withdrawn_at,
  archived_at
on public.contents
for each row execute function public.capture_content_version();

comment on table public.content_versions is
  'Private append-only editorial snapshots captured automatically on creation and meaningful content changes; never exposed directly to anonymous readers.';
comment on table public.content_corrections is
  'Correction and retraction notices; public rows are visible only for currently public content.';
comment on function public.capture_content_version() is
  'Database-canonical append-only content version capture. Ignores updated_at-only changes.';
