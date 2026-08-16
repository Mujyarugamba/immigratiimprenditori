-- M3.1 — create international market presences
-- Implements the Aggregate Root PresenzaDiMercato of Mercati Internazionali:
--   public.international_market_presences
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M3.1;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.7;
--  docs/architecture/logical/mercati-internazionali.md §4, §7, §12).
--
-- Scope of this unit only: presence of a business XOR person in a Market,
-- with editorial / relation / verification / visibility axes, is_contested,
-- presence_configuration, optional period, declaration_origin, timestamps,
-- RLS defense, updated_at trigger.
-- Explicitly out of scope: interests (M3.2), activities and type links (M3.3),
-- commercial relations, needs (M4), sources/evidences/verifications (M5),
-- Professionisti subject, CASCADE from subjects, demo/normative seed.
-- Depends on M2.1 international_markets; public.profiles; public.businesses;
-- public.business_memberships. Does not alter M1.*, M2.*, or subject tables.

create table public.international_market_presences (
  id uuid not null default gen_random_uuid (),
  market_id uuid not null,
  subject_kind text not null,
  business_id uuid null,
  person_id uuid null,
  membership_id uuid null,
  editorial_status text not null default 'proposed',
  relation_status text not null default 'under_evaluation',
  verification_status text not null default 'unverified',
  is_contested boolean not null default false,
  visibility_status text not null default 'private',
  presence_configuration text not null default 'ongoing',
  started_at date null,
  ended_at date null,
  motivation_note text null,
  declaration_origin text not null default 'subject_declaration',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint imp_pkey primary key (id),
  constraint imp_market_id_fkey foreign key (market_id)
    references public.international_markets (id)
    on delete restrict,
  constraint imp_business_id_fkey foreign key (business_id)
    references public.businesses (id)
    on delete restrict,
  constraint imp_person_id_fkey foreign key (person_id)
    references public.profiles (id)
    on delete restrict,
  constraint imp_membership_id_fkey foreign key (membership_id)
    references public.business_memberships (id)
    on delete restrict,
  constraint imp_subject_check check (
    (
      subject_kind = 'business'
      and business_id is not null
      and person_id is null
    )
    or (
      subject_kind = 'person'
      and person_id is not null
      and business_id is null
    )
  ),
  constraint imp_membership_check check (
    membership_id is null
    or subject_kind = 'business'
  ),
  constraint imp_editorial_status_check check (
    editorial_status in (
      'signaled',
      'proposed',
      'declared'
    )
  ),
  constraint imp_relation_status_check check (
    relation_status in (
      'under_evaluation',
      'planned',
      'started',
      'active',
      'consolidated',
      'suspended',
      'interrupted',
      'concluded',
      'archived'
    )
  ),
  constraint imp_verification_status_check check (
    verification_status in (
      'unverified',
      'in_review',
      'confirmed'
    )
  ),
  constraint imp_visibility_status_check check (
    visibility_status in (
      'private',
      'involved',
      'editorial',
      'partners',
      'public',
      'historical'
    )
  ),
  constraint imp_presence_configuration_check check (
    presence_configuration in (
      'occasional',
      'ongoing',
      'export_oriented',
      'import_oriented',
      'stable_presence',
      'via_intermediary',
      'abandoned'
    )
  ),
  constraint imp_declaration_origin_check check (
    declaration_origin in (
      'subject_declaration',
      'editorial',
      'informative_import',
      'institutional_source'
    )
  ),
  constraint imp_dates_order_check check (
    ended_at is null
    or started_at is null
    or ended_at >= started_at
  ),
  constraint imp_open_status_no_end_check check (
    relation_status not in (
      'under_evaluation',
      'planned',
      'started',
      'active',
      'consolidated',
      'suspended'
    )
    or ended_at is null
  ),
  constraint imp_closed_status_end_required_check check (
    relation_status not in (
      'interrupted',
      'concluded',
      'archived'
    )
    or ended_at is not null
  ),
  constraint imp_abandoned_end_required_check check (
    presence_configuration <> 'abandoned'
    or ended_at is not null
  )
);

comment on table public.international_market_presences is
  'Aggregate Root PresenzaDiMercato (Physical §35.7 / Logical §4): a declared fact that a business XOR person operates in a Market. Owned by Mercati Internazionali. Distinct from Interest, Activity, commercial relation, need, Opportunity, and platform Partner. Multi-presence / succession per subject+market allowed.';

comment on column public.international_market_presences.id is
  'Stable internal identity of the Presence. Independent of market, subject, and status axes.';

comment on column public.international_market_presences.market_id is
  'Referenced Market (public.international_markets). ON DELETE RESTRICT: a Market with presences cannot be removed. Not owned composition (contrast M2.2/M2.3 CASCADE).';

comment on column public.international_market_presences.subject_kind is
  'Declaring subject discriminator: business or person (ciclo 1). Professionisti excluded. XOR with business_id / person_id enforced by imp_subject_check.';

comment on column public.international_market_presences.business_id is
  'Opaque identity reference to public.businesses when subject_kind = business. ON DELETE RESTRICT. Null when subject is person. Does not embed Impresa attributes.';

comment on column public.international_market_presences.person_id is
  'Opaque identity reference to public.profiles when subject_kind = person. ON DELETE RESTRICT. Null when subject is business. Does not embed Persona attributes.';

comment on column public.international_market_presences.membership_id is
  'Optional Appartenenza title (public.business_memberships) when the declaring subject is a business. Allowed only if subject_kind = business. ON DELETE RESTRICT. This schema does not enforce that membership.business_id equals presence.business_id.';

comment on column public.international_market_presences.editorial_status is
  'Editorial axis (distinct from relation_status / verification_status / visibility_status): signaled, proposed, declared. Default proposed.';

comment on column public.international_market_presences.relation_status is
  'Relational / lifecycle axis of the Presence: under_evaluation, planned, started, active, consolidated, suspended, interrupted, concluded, archived. Default under_evaluation. Interacts with ended_at via temporal CHECKs.';

comment on column public.international_market_presences.verification_status is
  'Verification axis on the Presence root: unverified, in_review, confirmed. Default unverified. Contestation is the separate is_contested overlay, not a verification_status value.';

comment on column public.international_market_presences.is_contested is
  'Independent contestation overlay. Default false. Not a verification_status value and not a relation_status.';

comment on column public.international_market_presences.visibility_status is
  'Visibility axis: private, involved, editorial, partners, public, historical. Default private. Must not exceed visibility of the involved Impresa/Persona/Appartenenza (application rule).';

comment on column public.international_market_presences.presence_configuration is
  'Operational configuration of the Presence (Logical §4): occasional, ongoing, export_oriented, import_oriented, stable_presence, via_intermediary, abandoned. Default ongoing. abandoned requires ended_at.';

comment on column public.international_market_presences.started_at is
  'Optional start date of the Presence period. Nullable. Ordered against ended_at when both present.';

comment on column public.international_market_presences.ended_at is
  'Optional end date of the Presence period. Required for interrupted/concluded/archived relation_status and for abandoned configuration; forbidden for open relation statuses.';

comment on column public.international_market_presences.motivation_note is
  'Optional free-text motivation or context note. Nullable.';

comment on column public.international_market_presences.declaration_origin is
  'Origin of the Presence declaration: subject_declaration, editorial, informative_import, institutional_source. Default subject_declaration. Not a structured Source or Evidence entity.';

comment on column public.international_market_presences.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_market_presences.updated_at is
  'Last update timestamp. Maintained by international_market_presences_set_updated_at.';

create index imp_market_id_idx
  on public.international_market_presences (market_id);

create index imp_business_id_idx
  on public.international_market_presences (business_id);

create index imp_person_id_idx
  on public.international_market_presences (person_id);

create index imp_relation_status_idx
  on public.international_market_presences (relation_status);

alter table public.international_market_presences enable row level security;

-- Defense in depth: no policies in M3.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.international_market_presences from anon, authenticated;

create or replace function public.set_international_market_presences_updated_at ()
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

comment on function public.set_international_market_presences_updated_at () is
  'BEFORE UPDATE trigger function for public.international_market_presences. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger international_market_presences_set_updated_at
before update on public.international_market_presences
for each row
execute function public.set_international_market_presences_updated_at ();
