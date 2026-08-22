-- Publication-series architecture for reports, working papers, policy briefs and dossiers.
-- Prepared on the development branch. Do not expose a public collection merely
-- because its series exists: publication remains gated by the linked content.

insert into public.content_types (code, name_it, description, is_active, sort_order)
values
  ('working_paper', 'Working Paper', 'Contributo di ricerca del Centro Studi pubblicato in una collana numerata.', true, 54),
  ('dossier', 'Dossier', 'Raccolta editoriale o di ricerca dedicata a un tema definito.', true, 55)
on conflict (code) do update
set
  name_it = excluded.name_it,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

create table if not exists public.publication_series (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9-]+$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) > 0),
  description text not null check (length(btrim(description)) > 0),
  publication_kind text not null check (publication_kind in ('report','working_paper','policy_brief','dossier')),
  citation_prefix text not null check (length(btrim(citation_prefix)) > 0),
  is_active boolean not null default true,
  sort_order integer not null default 100 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_publication_metadata (
  content_id uuid primary key references public.contents(id) on delete cascade,
  series_id uuid not null references public.publication_series(id) on delete restrict,
  issue_number integer not null check (issue_number > 0),
  publication_year smallint not null check (publication_year between 1900 and 2100),
  version_label text not null default '1.0' check (length(btrim(version_label)) > 0),
  doi text null check (doi is null or length(btrim(doi)) > 0),
  isbn text null check (isbn is null or length(btrim(isbn)) > 0),
  recommended_citation text null check (recommended_citation is null or length(btrim(recommended_citation)) > 0),
  license_label text null check (license_label is null or length(btrim(license_label)) > 0),
  correction_note text null check (correction_note is null or length(btrim(correction_note)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (series_id, publication_year, issue_number)
);

create index if not exists content_publication_metadata_series_idx
  on public.content_publication_metadata(series_id, publication_year desc, issue_number desc);

insert into public.publication_series (code, slug, name, description, publication_kind, citation_prefix, is_active, sort_order)
values
  ('II-REPORT', 'rapporti', 'Rapporti del Centro Studi', 'Rapporti di ricerca e sintesi prodotti o curati dal Centro Studi Immigrati Imprenditori.', 'report', 'Immigrati Imprenditori — Rapporto', true, 10),
  ('II-WP', 'working-papers', 'Immigrati Imprenditori Working Papers', 'Contributi di ricerca numerati, attribuiti agli autori e corredati da informazioni bibliografiche verificabili.', 'working_paper', 'Immigrati Imprenditori Working Paper', true, 20),
  ('II-PB', 'policy-brief', 'Policy Brief', 'Documenti sintetici orientati a istituzioni e decisori, fondati su dati e fonti esplicite.', 'policy_brief', 'Immigrati Imprenditori Policy Brief', true, 30),
  ('II-DOS', 'dossier', 'Dossier tematici', 'Raccolte strutturate dedicate a un tema, un settore, una popolazione o una relazione tra Paesi.', 'dossier', 'Immigrati Imprenditori — Dossier', true, 40)
on conflict (code) do update
set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  publication_kind = excluded.publication_kind,
  citation_prefix = excluded.citation_prefix,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();

alter table public.publication_series enable row level security;
alter table public.content_publication_metadata enable row level security;

drop policy if exists publication_series_public_read on public.publication_series;
create policy publication_series_public_read
on public.publication_series for select to public
using (is_active or access_is_editor() or access_is_application_admin());

drop policy if exists publication_series_editor_all on public.publication_series;
create policy publication_series_editor_all
on public.publication_series for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

drop policy if exists content_publication_metadata_public_read on public.content_publication_metadata;
create policy content_publication_metadata_public_read
on public.content_publication_metadata for select to public
using (
  exists (
    select 1 from public.contents c
    where c.id = content_id
      and c.editorial_status = 'ready'
      and c.publication_status = 'published'
      and c.visibility_status = 'public'
      and c.archived_at is null
  )
);

drop policy if exists content_publication_metadata_editor_all on public.content_publication_metadata;
create policy content_publication_metadata_editor_all
on public.content_publication_metadata for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

grant select on public.publication_series to anon, authenticated;
grant select on public.content_publication_metadata to anon, authenticated;
grant insert, update, delete on public.publication_series to authenticated;
grant insert, update, delete on public.content_publication_metadata to authenticated;
