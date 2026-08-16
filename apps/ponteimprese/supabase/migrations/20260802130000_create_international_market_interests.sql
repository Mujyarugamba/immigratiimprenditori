-- M3.2 — create international market interests
-- Implements the Aggregate Root InteresseDiMercato of Mercati Internazionali:
--   public.international_market_interests
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M3.2;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.8;
--  docs/architecture/logical/mercati-internazionali.md §4, §12 rule 4).
--
-- Scope of this unit only: declared intention / orientation of a business XOR
-- person toward a Market (not yet operational Presence), with interest_level,
-- editorial / relation / verification / visibility axes, is_contested,
-- optional period, declaration_origin, timestamps, RLS, updated_at trigger.
-- Explicitly out of scope: Presence (M3.1 objects), activities/type links (M3.3),
-- needs (M4), commercial relations (M4), sources/evidences/verifications (M5),
-- Professionisti subject, CASCADE from subjects, demo/normative seed.
-- Depends on M2.1 international_markets; public.profiles; public.businesses;
-- public.business_memberships. Does not require M3.1. Does not alter M1.*, M2.*,
-- M3.1, or subject tables.

create table public.international_market_interests (
  id uuid not null default gen_random_uuid (),
  market_id uuid not null,
  subject_kind text not null,
  business_id uuid null,
  person_id uuid null,
  membership_id uuid null,
  editorial_status text not null default 'proposed',
  interest_level text not null default 'future',
  relation_status text not null default 'under_evaluation',
  verification_status text not null default 'unverified',
  is_contested boolean not null default false,
  visibility_status text not null default 'private',
  started_at date null,
  ended_at date null,
  motivation_note text null,
  declaration_origin text not null default 'subject_declaration',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint imi_pkey primary key (id),
  constraint imi_market_id_fkey foreign key (market_id)
    references public.international_markets (id)
    on delete restrict,
  constraint imi_business_id_fkey foreign key (business_id)
    references public.businesses (id)
    on delete restrict,
  constraint imi_person_id_fkey foreign key (person_id)
    references public.profiles (id)
    on delete restrict,
  constraint imi_membership_id_fkey foreign key (membership_id)
    references public.business_memberships (id)
    on delete restrict,
  constraint imi_subject_check check (
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
  constraint imi_membership_check check (
    membership_id is null
    or subject_kind = 'business'
  ),
  constraint imi_interest_level_check check (
    interest_level in (
      'future',
      'under_assessment'
    )
  ),
  constraint imi_relation_status_check check (
    relation_status in (
      'under_evaluation',
      'planned',
      'withdrawn',
      'archived'
    )
  ),
  constraint imi_verification_status_check check (
    verification_status in (
      'unverified',
      'in_review',
      'confirmed',
      'rejected'
    )
  )
);

comment on table public.international_market_interests is
  'Aggregate Root InteresseDiMercato (Physical §35.8 / Logical §4): a declared intention or orientation of a business XOR person toward a Market, not yet an operational Presence. Owned by Mercati Internazionali. Distinct from Presence, Activity, commercial relation, internationalization need, Opportunity, and Service. No automatic deduction to/from Presence. Verification of the declaration is carried on this root.';

comment on column public.international_market_interests.id is
  'Stable internal identity of the Interest. Independent of market, subject, and status axes.';

comment on column public.international_market_interests.market_id is
  'Referenced Market (public.international_markets). Required. ON DELETE RESTRICT: a Market referenced by interests cannot be removed. Not owned composition (CASCADE reserved for owned tables such as M2.2/M2.3).';

comment on column public.international_market_interests.subject_kind is
  'Declaring subject discriminator: business or person (ciclo 1 pattern §35). Professionisti excluded. XOR with business_id / person_id enforced by imi_subject_check.';

comment on column public.international_market_interests.business_id is
  'Opaque identity reference to public.businesses when subject_kind = business. ON DELETE RESTRICT. Null when subject is person.';

comment on column public.international_market_interests.person_id is
  'Opaque identity reference to public.profiles when subject_kind = person. ON DELETE RESTRICT. Null when subject is business.';

comment on column public.international_market_interests.membership_id is
  'Optional Appartenenza title (public.business_memberships) when the declaring subject is a business. Allowed only if subject_kind = business. ON DELETE RESTRICT. This schema does not enforce that membership.business_id equals interest.business_id.';

comment on column public.international_market_interests.editorial_status is
  'Editorial axis of the Interest. Default proposed. Distinct from relation_status, verification_status, and visibility_status.';

comment on column public.international_market_interests.interest_level is
  'Interest configuration (Logical §4): future or under_assessment. Default future. Not a Presence configuration and not an Activity status.';

comment on column public.international_market_interests.relation_status is
  'Lifecycle axis of the Interest: under_evaluation, planned, withdrawn, archived. Default under_evaluation. Distinct from Presence relation_status.';

comment on column public.international_market_interests.verification_status is
  'Verification of the Interest declaration only: unverified, in_review, confirmed, rejected. Default unverified. Contestation is the separate is_contested overlay.';

comment on column public.international_market_interests.is_contested is
  'Independent contestation overlay. Default false. Not a verification_status value.';

comment on column public.international_market_interests.visibility_status is
  'Visibility axis of the Interest. Default private. Distinct from editorial_status and verification_status.';

comment on column public.international_market_interests.started_at is
  'Optional start date of the Interest period. Nullable.';

comment on column public.international_market_interests.ended_at is
  'Optional end date of the Interest period. Nullable.';

comment on column public.international_market_interests.motivation_note is
  'Optional free-text motivation or context note. Nullable. Not an internationalization need.';

comment on column public.international_market_interests.declaration_origin is
  'Origin of the Interest declaration. Default subject_declaration. Not a structured Source or Evidence entity.';

comment on column public.international_market_interests.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_market_interests.updated_at is
  'Last update timestamp. Maintained by international_market_interests_set_updated_at.';

alter table public.international_market_interests enable row level security;

-- Defense in depth: no policies in M3.2. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.international_market_interests from anon, authenticated;

create or replace function public.set_international_market_interests_updated_at ()
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

comment on function public.set_international_market_interests_updated_at () is
  'BEFORE UPDATE trigger function for public.international_market_interests. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger international_market_interests_set_updated_at
before update on public.international_market_interests
for each row
execute function public.set_international_market_interests_updated_at ();
