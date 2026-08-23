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

comment on table public.content_versions is
  'Private append-only editorial snapshots used to document substantive content versions; never exposed directly to anonymous readers.';
comment on table public.content_corrections is
  'Correction and retraction notices; public rows are visible only for currently public content.';
