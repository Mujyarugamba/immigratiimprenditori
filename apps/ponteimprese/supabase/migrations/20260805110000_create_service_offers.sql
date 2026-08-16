-- M2.1 — create service offers
-- Implements Aggregate Root OffertaDiServizio of Servizi:
--   public.service_offers
-- (docs/architecture/migrations/servizi-migration-plan.md §11 M2.1;
--  docs/architecture/physical/domain-mapping/servizi.md §7, §19–§23, §25–§26;
--  docs/architecture/logical/servizi.md §6.1, §9, §13–§15).
--
-- Scope of this unit only: AR structure, owner XOR, optional provider/source/
-- context FKs, category/economic catalogs, lifecycle axes, indexes, updated_at,
-- RLS, REVOKE.
-- Explicitly out of scope: owned territories/languages/sectors/markets (M3);
-- service_requests (M4); seed; policies; GRANT; marketplace; payments; bookings;
-- calendar; FEV; reviews; membership_id; owner_type; JSONB; Organizzazioni.

create table public.service_offers (
  id uuid not null default gen_random_uuid (),
  owner_person_id uuid null,
  owner_business_id uuid null,
  provider_person_id uuid null,
  provider_professional_profile_id uuid null,
  provider_business_id uuid null,
  source_professional_service_id uuid null,
  source_business_service_id uuid null,
  context_opportunity_id uuid null,
  category_code text not null,
  title text not null,
  summary text null,
  description text not null,
  nature_label text null,
  delivery_mode text not null default 'unspecified',
  audience_kind text not null default 'both',
  audience_note text null,
  specialization_note text null,
  language_direction text null,
  economic_kind text not null default 'none',
  economic_band_code text null,
  economic_note text null,
  editorial_status text not null default 'draft',
  publication_status text not null default 'unpublished',
  availability_status text not null default 'available',
  visibility_status text not null default 'private',
  published_at timestamptz null,
  withdrawn_at timestamptz null,
  archived_at timestamptz null,
  external_organization_label text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_offers_pkey primary key (id),
  constraint service_offers_owner_person_id_fkey
    foreign key (owner_person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint service_offers_owner_business_id_fkey
    foreign key (owner_business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint service_offers_provider_person_id_fkey
    foreign key (provider_person_id)
    references public.profiles (id)
    on update no action
    on delete set null,
  constraint service_offers_provider_prof_profile_id_fkey
    foreign key (provider_professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete set null,
  constraint service_offers_provider_business_id_fkey
    foreign key (provider_business_id)
    references public.businesses (id)
    on update no action
    on delete set null,
  constraint service_offers_source_prof_service_id_fkey
    foreign key (source_professional_service_id)
    references public.professional_services (id)
    on update no action
    on delete set null,
  constraint service_offers_source_business_service_id_fkey
    foreign key (source_business_service_id)
    references public.business_services (id)
    on update no action
    on delete set null,
  constraint service_offers_context_opportunity_id_fkey
    foreign key (context_opportunity_id)
    references public.opportunities (id)
    on update no action
    on delete set null,
  constraint service_offers_category_code_fkey
    foreign key (category_code)
    references public.service_categories (code)
    on update cascade
    on delete restrict,
  constraint service_offers_economic_band_code_fkey
    foreign key (economic_band_code)
    references public.service_economic_bands (code)
    on update cascade
    on delete restrict,
  constraint svc_offers_owner_xor_check check (
    (
      owner_person_id is not null
      and owner_business_id is null
    )
    or (
      owner_person_id is null
      and owner_business_id is not null
    )
  ),
  constraint svc_offers_provider_at_most_one_check check (
    (
      (provider_person_id is not null)::integer
      + (provider_professional_profile_id is not null)::integer
      + (provider_business_id is not null)::integer
    ) <= 1
  ),
  constraint svc_offers_source_xor_check check (
    not (
      source_professional_service_id is not null
      and source_business_service_id is not null
    )
  ),
  constraint svc_offers_title_not_blank_check check (
    length(btrim(title)) > 0
  ),
  constraint svc_offers_description_not_blank_check check (
    length(btrim(description)) > 0
  ),
  constraint svc_offers_delivery_mode_check check (
    delivery_mode in ('in_person', 'remote', 'hybrid', 'unspecified')
  ),
  constraint svc_offers_audience_kind_check check (
    audience_kind in ('persons', 'businesses', 'both')
  ),
  constraint svc_offers_language_direction_check check (
    language_direction is null
    or language_direction in ('mono', 'bidirectional', 'unspecified')
  ),
  constraint svc_offers_economic_kind_check check (
    economic_kind in (
      'none',
      'free',
      'on_request',
      'indicative_band',
      'discounted'
    )
  ),
  constraint svc_offers_economic_band_gate_check check (
    (
      economic_kind = 'indicative_band'
      and economic_band_code is not null
    )
    or (
      economic_kind <> 'indicative_band'
      and economic_band_code is null
    )
  ),
  constraint svc_offers_editorial_status_check check (
    editorial_status in ('draft', 'ready')
  ),
  constraint svc_offers_publication_status_check check (
    publication_status in ('unpublished', 'published', 'withdrawn')
  ),
  constraint svc_offers_availability_status_check check (
    availability_status in ('available', 'paused', 'unavailable')
  ),
  constraint svc_offers_visibility_status_check check (
    visibility_status in ('private', 'public')
  ),
  constraint svc_offers_publication_gates_check check (
    (
      publication_status = 'published'
      and published_at is not null
      and editorial_status = 'ready'
    )
    or (
      publication_status = 'withdrawn'
      and withdrawn_at is not null
    )
    or (
      publication_status = 'unpublished'
      and published_at is null
      and withdrawn_at is null
    )
  ),
  constraint svc_offers_nature_label_check check (
    nature_label is null
    or length(btrim(nature_label)) > 0
  ),
  constraint svc_offers_audience_note_check check (
    audience_note is null
    or length(btrim(audience_note)) > 0
  ),
  constraint svc_offers_specialization_note_check check (
    specialization_note is null
    or length(btrim(specialization_note)) > 0
  ),
  constraint svc_offers_external_org_label_check check (
    external_organization_label is null
    or length(btrim(external_organization_label)) > 0
  ),
  constraint svc_offers_economic_note_check check (
    economic_note is null
    or length(btrim(economic_note)) > 0
  ),
  constraint svc_offers_summary_check check (
    summary is null
    or length(btrim(summary)) > 0
  )
);

comment on table public.service_offers is
  'Aggregate Root of Servizi: structured publishable OffertaDiServizio. Owned by Servizi. Distinct from professional_services (Professionisti) and business_services (Imprese). Optional source_* links are provenance only (SET NULL). Not a marketplace listing; no amounts, payments, bookings, calendar, FEV, or reviews. Owner is exactly one of Persona (profiles) or Impresa (businesses).';

comment on column public.service_offers.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Stable identity of the offer sheet.';

comment on column public.service_offers.owner_person_id is
  'Owning Persona when titolare is a person. XOR with owner_business_id. FK profiles ON DELETE RESTRICT.';

comment on column public.service_offers.owner_business_id is
  'Owning Impresa when titolare is a business. XOR with owner_person_id. FK businesses ON DELETE RESTRICT.';

comment on column public.service_offers.provider_person_id is
  'Optional erogatore Persona. At most one of the three provider_* columns may be set. ON DELETE SET NULL.';

comment on column public.service_offers.provider_professional_profile_id is
  'Optional erogatore Profilo professionale. At most one provider_*. ON DELETE SET NULL.';

comment on column public.service_offers.provider_business_id is
  'Optional erogatore Impresa. At most one provider_*. ON DELETE SET NULL.';

comment on column public.service_offers.source_professional_service_id is
  'Optional descriptive provenance from professional_services. Mutually exclusive with source_business_service_id. ON DELETE SET NULL. Does not own or sync the source row.';

comment on column public.service_offers.source_business_service_id is
  'Optional descriptive provenance from business_services. Mutually exclusive with source_professional_service_id. ON DELETE SET NULL.';

comment on column public.service_offers.context_opportunity_id is
  'Optional opaque context reference to opportunities. ON DELETE SET NULL. Not ownership of Opportunità.';

comment on column public.service_offers.category_code is
  'FK to service_categories(code). Required. ON UPDATE CASCADE; ON DELETE RESTRICT.';

comment on column public.service_offers.title is
  'Required non-blank human-facing title. Homonyms allowed (no UNIQUE).';

comment on column public.service_offers.summary is
  'Optional short synopsis. Nullable; blank rejected when present.';

comment on column public.service_offers.description is
  'Required non-blank substantial description of the offer. Not editorial CMS content.';

comment on column public.service_offers.nature_label is
  'Optional free-text nature label. Not professional_service_natures catalog.';

comment on column public.service_offers.delivery_mode is
  'Closed delivery mode: in_person | remote | hybrid | unspecified. Default unspecified.';

comment on column public.service_offers.audience_kind is
  'Closed audience: persons | businesses | both. Default both.';

comment on column public.service_offers.audience_note is
  'Optional free-text audience segment note. Not a CRM list.';

comment on column public.service_offers.specialization_note is
  'Optional free-text vertical refinement.';

comment on column public.service_offers.language_direction is
  'Optional linguistic direction: mono | bidirectional | unspecified. Null when not linguistic.';

comment on column public.service_offers.economic_kind is
  'Descriptive economic classification only: none | free | on_request | indicative_band | discounted. Not a binding price.';

comment on column public.service_offers.economic_band_code is
  'FK to service_economic_bands when economic_kind = indicative_band; otherwise NULL.';

comment on column public.service_offers.economic_note is
  'Optional free-text economic note. Not an amount, currency, or invoice.';

comment on column public.service_offers.editorial_status is
  'Editorial axis: draft | ready. Default draft.';

comment on column public.service_offers.publication_status is
  'Publication axis: unpublished | published | withdrawn. Default unpublished. Distinct from availability_status.';

comment on column public.service_offers.availability_status is
  'Declarative availability of the offer: available | paused | unavailable. Default available. Not a calendar.';

comment on column public.service_offers.visibility_status is
  'Substantial visibility: private | public. Default private. Not an RLS policy.';

comment on column public.service_offers.published_at is
  'Publication timestamp. Required when publication_status = published; NULL when unpublished.';

comment on column public.service_offers.withdrawn_at is
  'Withdrawal timestamp. Required when publication_status = withdrawn.';

comment on column public.service_offers.archived_at is
  'Archive timestamp. NULL means current; set means archived historically.';

comment on column public.service_offers.external_organization_label is
  'Optional informative external organization label. Not a FK to Organizzazioni (future domain).';

comment on column public.service_offers.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.service_offers.updated_at is
  'Last update timestamp. Maintained by service_offers_set_updated_at.';

create index svc_offers_owner_person_id_idx
  on public.service_offers (owner_person_id)
  where owner_person_id is not null;

create index svc_offers_owner_business_id_idx
  on public.service_offers (owner_business_id)
  where owner_business_id is not null;

create index svc_offers_category_code_idx
  on public.service_offers (category_code);

create index svc_offers_publication_status_idx
  on public.service_offers (publication_status);

create index svc_offers_published_idx
  on public.service_offers (publication_status)
  where publication_status = 'published';

create index svc_offers_availability_status_idx
  on public.service_offers (availability_status);

create index svc_offers_archived_at_idx
  on public.service_offers (archived_at)
  where archived_at is not null;

alter table public.service_offers enable row level security;

revoke all on table public.service_offers from public;
revoke all on table public.service_offers from anon, authenticated;

create or replace function public.set_service_offers_updated_at ()
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

comment on function public.set_service_offers_updated_at () is
  'BEFORE UPDATE trigger function for public.service_offers. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger service_offers_set_updated_at
before update on public.service_offers
for each row
execute function public.set_service_offers_updated_at ();
