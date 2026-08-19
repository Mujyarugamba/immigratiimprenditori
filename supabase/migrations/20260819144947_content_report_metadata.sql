begin;

create table public.content_report_metadata (
  content_id uuid primary key references public.contents(id) on delete cascade,
  report_kind text not null check (report_kind in (
    'aipel_report','external_report','academic_study','institutional_report','dossier'
  )),
  publisher_name text not null check (length(btrim(publisher_name)) > 0),
  source_publication_year smallint not null check (source_publication_year between 1900 and 2100),
  source_publication_date date null,
  external_identifier text null check (external_identifier is null or length(btrim(external_identifier)) > 0),
  document_url text null check (document_url is null or length(btrim(document_url)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_report_metadata_date_year_check check (
    source_publication_date is null
    or extract(year from source_publication_date)::integer = source_publication_year
  )
);

create trigger content_report_metadata_set_updated_at
before update on public.content_report_metadata
for each row execute function public.set_updated_at();

alter table public.content_report_metadata enable row level security;

create policy content_report_metadata_public_read
on public.content_report_metadata
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.contents c
    where c.id=content_report_metadata.content_id
      and c.publication_status='published'
      and c.visibility_status='public'
      and c.archived_at is null
  )
);

create policy content_report_metadata_editor_all
on public.content_report_metadata
for all
to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

revoke all on table public.content_report_metadata from anon, authenticated;
grant select on table public.content_report_metadata to anon, authenticated;
grant insert, update, delete on table public.content_report_metadata to authenticated;

commit;
