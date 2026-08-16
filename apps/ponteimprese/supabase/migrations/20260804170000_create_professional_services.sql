-- M4.3 — create professional services
-- Implements owned descriptive professional service declarations of Professionisti:
--   public.professional_services
-- (docs/architecture/migrations/professionisti-migration-plan.md §15 M4.3;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.10,
--  §29.5, §29.6, §29.15–§29.17, §29.19, §29.22.15, §29.23–§29.26, §29.32;
--  docs/architecture/logical/professionisti.md — Servizio dichiarato vs
--  OffertaDiServizio / marketplace).
--
-- Scope of this unit only: one owned descriptive services table under
-- professional_profiles, FK to professional_service_natures, CHECK
-- vocabularies, indexes (including optional partial on active), updated_at
-- function/trigger, RLS, REVOKE.
-- Explicitly out of scope: price / fee_amount_* / fee_currency / fee_visibility;
-- checkout; bookings; payments; contracts; SLA; OffertaDiServizio; FK to
-- Opportunità/Collaborazioni; per-service territory/language links (M5);
-- membership_id; seed; policies; GRANT; alterations to M1–M4.2.

create table public.professional_services (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  title text not null,
  description text null,
  service_nature_code text not null,
  audience_kind text not null default 'both',
  delivery_mode text not null default 'unspecified',
  is_standardized boolean not null default false,
  service_status text not null default 'declared',
  visibility_status text not null default 'private',
  availability_status text null,
  fee_indication_kind text not null default 'none',
  fee_note text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_services_pkey primary key (id),
  constraint professional_services_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint professional_services_service_nature_code_fkey
    foreign key (service_nature_code)
    references public.professional_service_natures (code)
    on update cascade
    on delete restrict,
  constraint prof_services_title_not_blank_check check (
    length(btrim(title)) > 0
  ),
  constraint prof_services_audience_kind_check check (
    audience_kind in ('persons', 'businesses', 'both')
  ),
  constraint prof_services_delivery_mode_check check (
    delivery_mode in ('in_person', 'remote', 'hybrid', 'unspecified')
  ),
  constraint prof_services_service_status_check check (
    service_status in ('declared', 'active', 'suspended', 'unavailable')
  ),
  constraint prof_services_visibility_status_check check (
    visibility_status in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_services_availability_status_check check (
    availability_status is null
    or availability_status in (
      'available',
      'limited',
      'unavailable',
      'future',
      'case_by_case',
      'temporarily_unavailable'
    )
  ),
  constraint prof_services_fee_indication_kind_check check (
    fee_indication_kind in (
      'none',
      'hourly_range',
      'fixed_range',
      'on_request',
      'free',
      'discounted'
    )
  ),
  constraint prof_services_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.professional_services is
  'Owned Entity (E02) of professional_profiles: descriptive declared professional service. Not OffertaDiServizio, not marketplace listing, not ServizioImpresa, not Opportunità. Fee limited to fee_indication_kind + fee_note (no amount/currency/visibility columns on this table). No UNIQUE on title (homonyms allowed). Lifecycle via service_status; availability_status NULL inherits profile availability. Historical rows retained; no soft-delete.';

comment on column public.professional_services.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_services.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — services do not outlive the profile.';

comment on column public.professional_services.title is
  'Required non-blank title of the declared service. Homonyms across the same profile are allowed (no UNIQUE).';

comment on column public.professional_services.description is
  'Optional free-text description of the declared service. Nullable.';

comment on column public.professional_services.service_nature_code is
  'FK to public.professional_service_natures(code). Required. ON UPDATE CASCADE; ON DELETE RESTRICT.';

comment on column public.professional_services.audience_kind is
  'Closed audience of the service: persons | businesses | both. Default both.';

comment on column public.professional_services.delivery_mode is
  'Closed delivery mode: in_person | remote | hybrid | unspecified. Default unspecified.';

comment on column public.professional_services.is_standardized is
  'Whether the service is standardized vs customized. Default false.';

comment on column public.professional_services.service_status is
  'Service lifecycle S01: declared | active | suspended | unavailable. Default declared. unavailable is terminal for the row per Physical §29.19.';

comment on column public.professional_services.visibility_status is
  'Visibility VIS vocabulary (same as profile/credentials): private | editorial | network | selected | public | partially_anonymous. Default private.';

comment on column public.professional_services.availability_status is
  'Optional local availability override. NULL means inherit profile availability_status. When present: available | limited | unavailable | future | case_by_case | temporarily_unavailable.';

comment on column public.professional_services.fee_indication_kind is
  'Descriptive fee classification only: none | hourly_range | fixed_range | on_request | free | discounted. Default none. Not a binding price; no amount/currency columns on this table.';

comment on column public.professional_services.fee_note is
  'Optional free-text indicative fee note. Nullable. Not a quote, tariff schedule, or checkout amount.';

comment on column public.professional_services.sort_order is
  'Display/order weight among services of the same profile. Default 0. Must be >= 0.';

comment on column public.professional_services.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_services.updated_at is
  'Last update timestamp. Maintained by professional_services_set_updated_at.';

create index prof_services_professional_profile_id_idx
  on public.professional_services (professional_profile_id);

create index prof_services_active_idx
  on public.professional_services (service_status)
  where service_status = 'active';

create or replace function public.set_professional_services_updated_at ()
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

comment on function public.set_professional_services_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_services. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce marketplace, pricing, Opportunità links, or M5 coverage.';

create trigger professional_services_set_updated_at
before update on public.professional_services
for each row
execute function public.set_professional_services_updated_at ();

alter table public.professional_services enable row level security;

-- Defense in depth: no policies in M4.3. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_services from public;
revoke all on table public.professional_services from anon, authenticated;
