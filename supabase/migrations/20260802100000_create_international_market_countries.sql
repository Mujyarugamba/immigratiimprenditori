-- M2.2 — create international market countries
-- Implements the owned Market–Country composition relation of Mercati Internazionali:
--   public.international_market_countries
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M2.2;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.5;
--  docs/architecture/logical/mercati-internazionali.md §2–§3, §12 rule 15).
--
-- Scope of this unit only: composition rows linking a Market to opaque country
-- references, with is_primary / sort_order / optional country_label.
-- Explicitly out of scope: countries catalog, FK to Territori, support resources
-- (M2.3), presences, interests, activities, commercial relations, need instances,
-- sources, evidences, verifications, demo/normative seed.
-- Depends on M2.1 public.international_markets. Does not alter M1.* or M2.1.

create table public.international_market_countries (
  id uuid not null default gen_random_uuid (),
  market_id uuid not null,
  country_ref text not null,
  country_label text null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint imc_pkey primary key (id),
  constraint imc_market_id_fkey foreign key (market_id)
    references public.international_markets (id)
    on delete cascade,
  constraint imc_market_country_unique unique (market_id, country_ref),
  constraint imc_country_ref_not_blank_check check (length(btrim(country_ref)) > 0),
  constraint imc_sort_order_check check (sort_order >= 0)
);

comment on table public.international_market_countries is
  'Owned Market–Country composition relation for Mercati Internazionali (Physical §35.5). Each row associates a Market with an opaque country reference whose authoritative identity belongs to the shared Territori catalog, not to a local countries table. Distinct from Presence, Interest, Activity, commercial relation, support resource, and need instance.';

comment on column public.international_market_countries.id is
  'Stable internal identity of the composition row. Independent of market_id and country_ref values.';

comment on column public.international_market_countries.market_id is
  'Owning Market (public.international_markets). ON DELETE CASCADE removes composition when the Market is removed. Not a subject (Persona/Impresa) reference.';

comment on column public.international_market_countries.country_ref is
  'Opaque textual reference to a Country whose authoritative identity belongs to the shared Territori catalog. Not a local countries primary key, not an ISO format enforcement, and not a foreign key to Territori. Must be non-blank.';

comment on column public.international_market_countries.country_label is
  'Optional descriptive display label for the referenced country. Not authoritative Territori data and not identity. Nullable.';

comment on column public.international_market_countries.is_primary is
  'When true, marks the primary country association for the Market. At most one true value per market_id (partial unique index). Default false. Not a Presence or Interest flag.';

comment on column public.international_market_countries.sort_order is
  'Display/composition order within a Market, lower values first. Default 0. Not priority of a Presence and not uniqueness.';

comment on column public.international_market_countries.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_market_countries.updated_at is
  'Last update timestamp. Maintained by international_market_countries_set_updated_at.';

-- At most one primary country per market (Physical §35.5 partial UNIQUE).
create unique index imc_one_primary_per_market_uidx
  on public.international_market_countries (market_id)
  where is_primary = true;

alter table public.international_market_countries enable row level security;

-- Defense in depth: no policies in M2.2. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.international_market_countries from anon, authenticated;

create or replace function public.set_international_market_countries_updated_at ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_international_market_countries_updated_at () is
  'BEFORE UPDATE trigger function for public.international_market_countries. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger international_market_countries_set_updated_at
before update on public.international_market_countries
for each row
execute function public.set_international_market_countries_updated_at ();
