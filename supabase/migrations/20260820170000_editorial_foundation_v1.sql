-- Immigrati Imprenditori — Editorial Foundation v1
-- Additive standalone migration: geography, routes, editorial inbox, public submissions.
-- No destructive DDL. No PonteImprese dependencies.

begin;

-- Geography is global. Countries are canonical ISO-3166 alpha-2 codes; labels are localized in UI.
create table public.geo_territories (
  id uuid primary key default gen_random_uuid(),
  country_code text null check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  parent_id uuid null references public.geo_territories(id) on delete restrict,
  level_kind text not null check (level_kind in (
    'continent','supranational','region','province_state',
    'metropolitan_area','municipality_city','other'
  )),
  code text null check (code is null or length(btrim(code)) > 0),
  name text not null check (length(btrim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

comment on table public.geo_territories is
  'Editorial geography for Immigrati Imprenditori. Global model; Italy has no privileged technical role.';

create unique index geo_territories_scoped_code_uidx
  on public.geo_territories (coalesce(country_code, ''), level_kind, lower(code))
  where code is not null;
create index geo_territories_country_idx on public.geo_territories(country_code);
create index geo_territories_parent_idx on public.geo_territories(parent_id);

create table public.migration_routes (
  id uuid primary key default gen_random_uuid(),
  origin_country_code text not null check (origin_country_code ~ '^[A-Z]{2}$'),
  destination_country_code text not null check (destination_country_code ~ '^[A-Z]{2}$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (origin_country_code <> destination_country_code),
  unique(origin_country_code, destination_country_code)
);
create index migration_routes_destination_idx on public.migration_routes(destination_country_code);

-- Geographic context of editorial contents.
create table public.content_geographies (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  country_code text null check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  territory_id uuid null references public.geo_territories(id) on delete restrict,
  relation_kind text not null default 'focus' check (relation_kind in ('focus','origin','destination','context')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((country_code is null) <> (territory_id is null))
);
create unique index content_geographies_country_uidx
  on public.content_geographies(content_id, country_code, relation_kind) where country_code is not null;
create unique index content_geographies_territory_uidx
  on public.content_geographies(content_id, territory_id, relation_kind) where territory_id is not null;
create index content_geographies_content_idx on public.content_geographies(content_id);

create table public.content_routes (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  route_id uuid not null references public.migration_routes(id) on delete restrict,
  relation_kind text not null default 'focus' check (relation_kind in ('focus','related')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_id, route_id, relation_kind)
);
create index content_routes_route_idx on public.content_routes(route_id);

-- Geographic context of events.
create table public.event_geographies (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  country_code text null check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  territory_id uuid null references public.geo_territories(id) on delete restrict,
  relation_kind text not null default 'focus' check (relation_kind in ('focus','origin','destination','context')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((country_code is null) <> (territory_id is null))
);
create unique index event_geographies_country_uidx
  on public.event_geographies(event_id, country_code, relation_kind) where country_code is not null;
create unique index event_geographies_territory_uidx
  on public.event_geographies(event_id, territory_id, relation_kind) where territory_id is not null;
create index event_geographies_event_idx on public.event_geographies(event_id);

create table public.event_routes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  route_id uuid not null references public.migration_routes(id) on delete restrict,
  relation_kind text not null default 'focus' check (relation_kind in ('focus','related')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, route_id, relation_kind)
);
create index event_routes_route_idx on public.event_routes(route_id);

-- Unified editorial Inbox: automatic radar + human submissions + manual arrivals.
create table public.editorial_inbox_items (
  id uuid primary key default gen_random_uuid(),
  source_kind text not null check (source_kind in ('radar','public_submission','contributor','editorial_manual')),
  item_kind text not null check (item_kind in (
    'news','report','academic_paper','dataset','statistical_release','event',
    'policy','law_regulation','story_tip','interview_proposal','user_testimony',
    'publication_submission','other'
  )),
  title text not null check (length(btrim(title)) > 0),
  original_url text null check (original_url is null or length(btrim(original_url)) > 0),
  source_label text null check (source_label is null or length(btrim(source_label)) > 0),
  source_published_at timestamptz null,
  summary text null check (summary is null or length(btrim(summary)) > 0),
  origin_country_code text null check (origin_country_code is null or origin_country_code ~ '^[A-Z]{2}$'),
  destination_country_code text null check (destination_country_code is null or destination_country_code ~ '^[A-Z]{2}$'),
  territory_id uuid null references public.geo_territories(id) on delete restrict,
  relevance_band text null check (relevance_band is null or relevance_band in (
    'lombardy','italy','italians_abroad','europe_migrant_entrepreneurship','rest_of_world'
  )),
  priority text not null default 'normal' check (priority in ('critical','high','normal','low')),
  status text not null default 'new' check (status in (
    'new','to_review','needs_research','assigned','draft_created','rejected','archived'
  )),
  duplicate_of_id uuid null references public.editorial_inbox_items(id) on delete set null,
  assigned_account_id uuid null references public.accounts(id) on delete set null,
  linked_content_id uuid null references public.contents(id) on delete set null,
  linked_event_id uuid null references public.events(id) on delete set null,
  raw_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(raw_metadata) = 'object'),
  received_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (duplicate_of_id is null or duplicate_of_id <> id)
);
create index editorial_inbox_status_idx on public.editorial_inbox_items(status, priority, received_at desc);
create index editorial_inbox_origin_idx on public.editorial_inbox_items(origin_country_code);
create index editorial_inbox_destination_idx on public.editorial_inbox_items(destination_country_code);
create index editorial_inbox_assignee_idx on public.editorial_inbox_items(assigned_account_id)
  where assigned_account_id is not null;

-- Personal data of one-off contributors is separated from the general Inbox item.
create table public.editorial_submissions (
  id uuid primary key default gen_random_uuid(),
  inbox_item_id uuid not null unique references public.editorial_inbox_items(id) on delete cascade,
  submission_kind text not null check (submission_kind in ('story','interview','event','research','publication','other')),
  submitter_name text not null check (length(btrim(submitter_name)) > 0),
  submitter_email text not null check (length(btrim(submitter_email)) > 3 and position('@' in submitter_email) > 1),
  submitter_phone text null check (submitter_phone is null or length(btrim(submitter_phone)) > 0),
  organization_name text null check (organization_name is null or length(btrim(organization_name)) > 0),
  contribution_text text not null check (length(btrim(contribution_text)) > 0),
  consent_contact boolean not null,
  consent_publication boolean not null default false,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index editorial_submissions_kind_idx on public.editorial_submissions(submission_kind, submitted_at desc);

-- Standard updated_at handling.
create trigger geo_territories_set_updated_at before update on public.geo_territories
for each row execute function public.set_updated_at();
create trigger migration_routes_set_updated_at before update on public.migration_routes
for each row execute function public.set_updated_at();
create trigger content_geographies_set_updated_at before update on public.content_geographies
for each row execute function public.set_updated_at();
create trigger content_routes_set_updated_at before update on public.content_routes
for each row execute function public.set_updated_at();
create trigger event_geographies_set_updated_at before update on public.event_geographies
for each row execute function public.set_updated_at();
create trigger event_routes_set_updated_at before update on public.event_routes
for each row execute function public.set_updated_at();
create trigger editorial_inbox_items_set_updated_at before update on public.editorial_inbox_items
for each row execute function public.set_updated_at();
create trigger editorial_submissions_set_updated_at before update on public.editorial_submissions
for each row execute function public.set_updated_at();

-- New editorial content types. Existing referenced types remain untouched.
insert into public.content_types (code, name_it, description, is_active, sort_order)
values
  ('analysis', 'Analisi', 'Analisi editoriale documentata del fenomeno imprenditoriale migrante.', true, 31),
  ('testimony', 'Testimonianza', 'Testimonianza diretta sottoposta a cura e verifica redazionale.', true, 41),
  ('research_report', 'Rapporto / ricerca', 'Rapporto, ricerca o studio presentato o prodotto dal Centro Studi.', true, 51),
  ('data_note', 'Nota dati', 'Lettura editoriale di dati, indicatori o serie statistiche.', true, 52),
  ('policy_brief', 'Politiche e normative', 'Analisi documentata di politiche pubbliche, norme o programmi pertinenti.', true, 53),
  ('event_report', 'Resoconto evento', 'Contenuto editoriale derivato da un evento o convegno.', true, 61)
on conflict (code) do update set
  name_it = excluded.name_it,
  description = excluded.description,
  is_active = true,
  sort_order = excluded.sort_order;

-- These former commercial classifications have zero current content references.
-- Preserve them for history but prevent new editorial selection.
update public.content_types
set is_active = false
where code in ('opportunity_presentation','service_presentation','market_content');

-- Canonical editorial themes use the existing content_tags catalog.
insert into public.content_tags (code, name_it, description, is_active, sort_order)
values
  ('migration-and-business', 'Migrazione e impresa', null, true, 10),
  ('employment', 'Occupazione', null, true, 20),
  ('business-demography', 'Demografia d’impresa', null, true, 30),
  ('territories', 'Territori', null, true, 40),
  ('diaspora', 'Diaspora', null, true, 50),
  ('internationalization', 'Internazionalizzazione', null, true, 60),
  ('trade-links', 'Relazioni commerciali', null, true, 70),
  ('access-to-credit', 'Accesso al credito', null, true, 80),
  ('finance', 'Finanza', null, true, 90),
  ('innovation', 'Innovazione', null, true, 100),
  ('digitalization', 'Digitalizzazione', null, true, 110),
  ('skills-qualifications', 'Competenze e qualifiche', null, true, 120),
  ('second-generation', 'Seconda generazione', null, true, 130),
  ('return-migration', 'Migrazione di ritorno', null, true, 140),
  ('integration-policy', 'Politiche di integrazione', null, true, 150),
  ('migration-policy', 'Politiche migratorie', null, true, 160),
  ('business-regulation', 'Normativa d’impresa', null, true, 170),
  ('barriers-discrimination', 'Ostacoli e discriminazioni', null, true, 180),
  ('community-impact', 'Impatto sulle comunità', null, true, 190),
  ('culture-identity', 'Cultura e identità', null, true, 200),
  ('women-entrepreneurs', 'Imprenditoria femminile', null, true, 210),
  ('youth-entrepreneurship', 'Imprenditoria giovanile', null, true, 220)
on conflict (code) do update set
  name_it = excluded.name_it,
  description = excluded.description,
  is_active = true,
  sort_order = excluded.sort_order;

-- One-off public contribution: creates Inbox + private submission, never public content.
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
  p_consent_publication boolean default false
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
begin
  if p_submission_kind not in ('story','interview','event','research','publication','other') then
    raise exception 'invalid submission kind';
  end if;
  if length(btrim(coalesce(p_submitter_name, ''))) = 0 then
    raise exception 'submitter name is required';
  end if;
  if length(btrim(coalesce(p_submitter_email, ''))) < 4 or position('@' in p_submitter_email) <= 1 then
    raise exception 'valid submitter email is required';
  end if;
  if length(btrim(coalesce(p_contribution_text, ''))) = 0 then
    raise exception 'contribution text is required';
  end if;

  v_origin := nullif(upper(btrim(p_origin_country_code)), '');
  v_destination := nullif(upper(btrim(p_destination_country_code)), '');
  if v_origin is not null and v_origin !~ '^[A-Z]{2}$' then raise exception 'invalid origin country'; end if;
  if v_destination is not null and v_destination !~ '^[A-Z]{2}$' then raise exception 'invalid destination country'; end if;

  v_item_kind := case p_submission_kind
    when 'story' then 'user_testimony'
    when 'interview' then 'interview_proposal'
    when 'event' then 'event'
    when 'research' then 'academic_paper'
    when 'publication' then 'publication_submission'
    else 'other'
  end;

  insert into public.editorial_inbox_items (
    source_kind, item_kind, title, original_url, source_label, summary,
    origin_country_code, destination_country_code, priority, status
  ) values (
    'public_submission', v_item_kind,
    coalesce(nullif(btrim(p_title), ''), 'Proposta editoriale — ' || p_submission_kind),
    nullif(btrim(p_original_url), ''), 'Segnalazione pubblica',
    left(btrim(p_contribution_text), 2000), v_origin, v_destination, 'normal', 'new'
  ) returning id into v_inbox_id;

  insert into public.editorial_submissions (
    inbox_item_id, submission_kind, submitter_name, submitter_email,
    submitter_phone, organization_name, contribution_text,
    consent_contact, consent_publication
  ) values (
    v_inbox_id, p_submission_kind, btrim(p_submitter_name), btrim(p_submitter_email),
    nullif(btrim(p_submitter_phone), ''), nullif(btrim(p_organization_name), ''),
    btrim(p_contribution_text), p_consent_contact, p_consent_publication
  );

  return v_inbox_id;
end;
$$;

revoke all on function public.submit_editorial_contribution(
  text,text,text,text,text,text,text,text,text,text,boolean,boolean
) from public;
grant execute on function public.submit_editorial_contribution(
  text,text,text,text,text,text,text,text,text,text,boolean,boolean
) to anon, authenticated;

-- RLS.
alter table public.geo_territories enable row level security;
alter table public.migration_routes enable row level security;
alter table public.content_geographies enable row level security;
alter table public.content_routes enable row level security;
alter table public.event_geographies enable row level security;
alter table public.event_routes enable row level security;
alter table public.editorial_inbox_items enable row level security;
alter table public.editorial_submissions enable row level security;

create policy geo_territories_public_read on public.geo_territories
for select using (is_active or public.access_is_editor() or public.access_is_application_admin());
create policy geo_territories_editor_write on public.geo_territories
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy migration_routes_public_read on public.migration_routes
for select using (is_active or public.access_is_editor() or public.access_is_application_admin());
create policy migration_routes_editor_write on public.migration_routes
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy content_geographies_public_read on public.content_geographies
for select using (exists (
  select 1 from public.contents c where c.id = content_id
  and c.publication_status = 'published' and c.visibility_status = 'public' and c.archived_at is null
));
create policy content_geographies_editor_all on public.content_geographies
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy content_routes_public_read on public.content_routes
for select using (exists (
  select 1 from public.contents c where c.id = content_id
  and c.publication_status = 'published' and c.visibility_status = 'public' and c.archived_at is null
));
create policy content_routes_editor_all on public.content_routes
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy event_geographies_public_read on public.event_geographies
for select using (exists (
  select 1 from public.events e where e.id = event_id
  and e.publication_status = 'published' and e.visibility_status = 'public' and e.archived_at is null
));
create policy event_geographies_editor_all on public.event_geographies
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy event_routes_public_read on public.event_routes
for select using (exists (
  select 1 from public.events e where e.id = event_id
  and e.publication_status = 'published' and e.visibility_status = 'public' and e.archived_at is null
));
create policy event_routes_editor_all on public.event_routes
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy editorial_inbox_editor_all on public.editorial_inbox_items
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());
create policy editorial_submissions_editor_all on public.editorial_submissions
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

-- Grants remain narrower than RLS. Anonymous submissions only use the RPC.
grant select on public.geo_territories, public.migration_routes,
  public.content_geographies, public.content_routes, public.event_geographies, public.event_routes
  to anon, authenticated;
grant insert, update, delete on public.geo_territories, public.migration_routes,
  public.content_geographies, public.content_routes, public.event_geographies, public.event_routes
  to authenticated;
grant select, insert, update, delete on public.editorial_inbox_items, public.editorial_submissions
  to authenticated;
revoke all on public.editorial_inbox_items, public.editorial_submissions from anon;

commit;
