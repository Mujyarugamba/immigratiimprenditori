-- M5.3 — create professional served markets
-- Implements owned international-market coverage declarations of Professionisti:
--   public.professional_served_markets
-- (docs/architecture/migrations/professionisti-migration-plan.md §16 M5.3;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.13,
--  §29.5, §29.6, §29.11, §29.22.13, §29.23–§29.26, §29.33;
--  docs/architecture/logical/professionisti.md §8 — Mercati conosciuti/serviti
--  without owning Presenza/Interesse/Attività).
--
-- Scope of this unit only: one owned link table under professional_profiles,
-- FK to public.international_markets(id) uuid, partial UNIQUE, indexes,
-- updated_at function/trigger, RLS, REVOKE.
-- Explicitly out of scope: PresenzaDiMercato; InteresseDiMercato;
-- AttivitàInternazionale; market entry dates; revenue/investment fields;
-- verification_status column; M6 FEV; seed; policies; GRANT;
-- alterations to M1–M5.2; creating MI domain relations.

create table public.professional_served_markets (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  market_id uuid not null,
  relation_kind text not null default 'served',
  declaration_status text not null default 'declared',
  notes text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_served_markets_pkey primary key (id),
  constraint professional_served_markets_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint professional_served_markets_market_id_fkey
    foreign key (market_id)
    references public.international_markets (id)
    on update no action
    on delete restrict,
  constraint prof_served_markets_relation_kind_check check (
    relation_kind in ('known', 'served', 'supported')
  ),
  constraint prof_served_markets_declaration_status_check check (
    declaration_status in ('declared', 'removed')
  ),
  constraint prof_served_markets_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.professional_served_markets is
  'Owned link/E02 of professional_profiles: declared known/served/supported relation to an international market. Opaque reference to public.international_markets — does not create PresenzaDiMercato, InteresseDiMercato, or AttivitàInternazionale, and does not own the Market. No dedicated verification_status column in cycle 1. Lifecycle via declaration_status; historical rows retained; no soft-delete.';

comment on column public.professional_served_markets.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_served_markets.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — market declarations do not outlive the profile.';

comment on column public.professional_served_markets.market_id is
  'FK to public.international_markets(id) uuid. Required. ON UPDATE NO ACTION; ON DELETE RESTRICT. Does not create MI presence/interest/activity rows.';

comment on column public.professional_served_markets.relation_kind is
  'Closed relation kind: known | served | supported. Default served.';

comment on column public.professional_served_markets.declaration_status is
  'Light declaration lifecycle: declared | removed. Default declared. Partial UNIQUE applies only to declared rows.';

comment on column public.professional_served_markets.notes is
  'Optional free-text note on this market declaration. Nullable. Not geographic ownership of the Market.';

comment on column public.professional_served_markets.sort_order is
  'Display/order weight among markets of the same profile. Default 0. Must be >= 0.';

comment on column public.professional_served_markets.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_served_markets.updated_at is
  'Last update timestamp. Maintained by professional_served_markets_set_updated_at.';

create unique index prof_served_markets_declared_uidx
  on public.professional_served_markets (professional_profile_id, market_id)
  where declaration_status = 'declared';

create index prof_served_markets_professional_profile_id_idx
  on public.professional_served_markets (professional_profile_id);

create index prof_served_markets_market_id_idx
  on public.professional_served_markets (market_id);

create or replace function public.set_professional_served_markets_updated_at ()
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

comment on function public.set_professional_served_markets_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_served_markets. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not create MI presence/interest/activity or M6 FEV rows.';

create trigger professional_served_markets_set_updated_at
before update on public.professional_served_markets
for each row
execute function public.set_professional_served_markets_updated_at ();

alter table public.professional_served_markets enable row level security;

-- Defense in depth: no policies in M5.3. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_served_markets from public;
revoke all on table public.professional_served_markets from anon, authenticated;
