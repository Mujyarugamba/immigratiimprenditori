-- M2.1 — create professional profiles
-- Implements the Aggregate Root of Professionisti:
--   public.professional_profiles
-- (docs/architecture/migrations/professionisti-migration-plan.md §13 M2.1;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.2, §29.3.5,
--  §29.4–§29.8, §29.16–§29.20, §29.22–§29.26, §29.28;
--  docs/architecture/logical/professionisti.md — Profilo professionale).
--
-- Scope of this unit only: professional profile AR structure (identity,
-- presentation, practice mode, optional business context, status axes,
-- availability, contestation overlay, experience VO, indicative fees,
-- professional contacts, timestamps), constraints, indexes, updated_at
-- trigger, RLS infrastructure, REVOKE.
-- Explicitly out of scope: seed/demo; categories link table; credentials;
-- associations; competencies; services; territories; languages; markets;
-- sectors; FEV; specializations; membership_id; anagraphic Person fields;
-- persisted overall verification_status; rating; marketplace; policies; GRANT.
-- Depends on: public.profiles; public.businesses; M1.2 professional_practice_modes.
-- Does not alter M1.* tables, profiles, or businesses. Stop point after M2.1.

create table public.professional_profiles (
  id uuid not null default gen_random_uuid (),
  person_id uuid not null,
  headline text null,
  summary text null,
  practice_mode_code text null,
  context_business_id uuid null,
  editorial_status text not null default 'draft',
  professional_status text not null default 'active',
  administrative_origin text null,
  publication_status text not null default 'unpublished',
  visibility_status text not null default 'private',
  availability_status text not null default 'available',
  availability_note text null,
  availability_until date null,
  is_contested boolean not null default false,
  experience_years numeric(5, 1) null,
  experience_summary text null,
  fee_indication_kind text not null default 'none',
  fee_currency text null,
  fee_amount_min numeric(12, 2) null,
  fee_amount_max numeric(12, 2) null,
  fee_note text null,
  fee_visibility text not null default 'private',
  professional_email text null,
  professional_phone text null,
  contacts_visibility text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prof_profiles_pkey primary key (id),
  constraint prof_profiles_person_id_key unique (person_id),
  constraint prof_profiles_person_id_fkey foreign key (person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint prof_profiles_practice_mode_code_fkey foreign key (practice_mode_code)
    references public.professional_practice_modes (code)
    on update cascade
    on delete restrict,
  constraint prof_profiles_context_business_id_fkey foreign key (context_business_id)
    references public.businesses (id)
    on update no action
    on delete set null,
  constraint prof_profiles_editorial_status_check check (
    editorial_status in ('draft', 'declared', 'published')
  ),
  constraint prof_profiles_professional_status_check check (
    professional_status in (
      'active',
      'suspended',
      'ceased',
      'revoked',
      'archived'
    )
  ),
  constraint prof_profiles_admin_origin_check check (
    administrative_origin is null
    or (
      administrative_origin in ('voluntary', 'disciplinary', 'moderation')
      and professional_status in (
        'suspended',
        'ceased',
        'revoked',
        'archived'
      )
    )
  ),
  constraint prof_profiles_publication_status_check check (
    publication_status in ('unpublished', 'published')
  ),
  constraint prof_profiles_visibility_status_check check (
    visibility_status in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_profiles_availability_status_check check (
    availability_status in (
      'available',
      'limited',
      'unavailable',
      'future',
      'case_by_case',
      'temporarily_unavailable'
    )
  ),
  constraint prof_profiles_availability_future_check check (
    availability_status <> 'future'
    or availability_until is not null
  ),
  constraint prof_profiles_experience_years_check check (
    experience_years is null
    or experience_years >= 0
  ),
  constraint prof_profiles_fee_kind_check check (
    fee_indication_kind in (
      'none',
      'hourly_range',
      'fixed_range',
      'on_request',
      'free',
      'discounted'
    )
  ),
  constraint prof_profiles_fee_check check (
    (
      (
        fee_indication_kind = 'none'
        and fee_amount_min is null
        and fee_amount_max is null
        and fee_currency is null
      )
      or (
        fee_indication_kind in ('on_request', 'free')
        and fee_amount_min is null
        and fee_amount_max is null
      )
      or (
        fee_indication_kind in ('hourly_range', 'fixed_range')
        and (
          fee_amount_min is not null
          or fee_amount_max is not null
        )
      )
      or fee_indication_kind = 'discounted'
    )
    and (
      fee_amount_min is null
      or fee_amount_min >= 0
    )
    and (
      fee_amount_max is null
      or fee_amount_max >= 0
    )
    and (
      fee_amount_min is null
      or fee_amount_max is null
      or fee_amount_max >= fee_amount_min
    )
    and (
      fee_currency is null
      or fee_currency ~ '^[A-Z]{3}$'
    )
  ),
  constraint prof_profiles_fee_visibility_check check (
    fee_visibility in ('private', 'public')
  ),
  constraint prof_profiles_contacts_visibility_check check (
    contacts_visibility in ('private', 'public', 'on_request')
  )
);

comment on table public.professional_profiles is
  'Aggregate Root (A01) of Professionisti: the professional profile bound to exactly one Persona. Owns future credentials, declared scope, coverage, services, and profile FEV. Not a Person anagraphic duplicate, not an Impresa, not a membership, not a credential, not a concrete service offer, and not a marketplace listing. No overall verification_status column (projection only). No seed in M2.1 (M8.1 SKIP).';

comment on column public.professional_profiles.id is
  'Surrogate primary key of the professional profile. Stable identity for owned tables. Distinct from person_id.';

comment on column public.professional_profiles.person_id is
  'Mandatory owning Persona (public.profiles). UNIQUE: at most one professional profile per Persona. ON DELETE RESTRICT — profile cannot outlive Persona without explicit removal. Does not duplicate personal anagraphic data.';

comment on column public.professional_profiles.headline is
  'Optional short professional synthesis. Not the Persona biographical name or personal bio.';

comment on column public.professional_profiles.summary is
  'Optional professional presentation text. Distinct from profiles.bio and from personal stories.';

comment on column public.professional_profiles.practice_mode_code is
  'Optional primary practice mode from professional_practice_modes (M1.2). Not a category, not a specialization, and not a multi-value list (categories are declared later via professional_profile_categories).';

comment on column public.professional_profiles.context_business_id is
  'Optional organizational context (public.businesses). Descriptive only: NOT a membership, NOT proof of Appartenenza, NOT ownership of the profile by an Impresa. ON DELETE SET NULL clears context if the business is removed.';

comment on column public.professional_profiles.editorial_status is
  'Editorial axis S02 (distinct from professional_status, publication_status, visibility_status, availability_status): draft | declared | published. Default draft.';

comment on column public.professional_profiles.professional_status is
  'Substantial professional axis S01 (exercise lifecycle): active | suspended | ceased | revoked | archived. Distinct from availability and publication. Default active.';

comment on column public.professional_profiles.administrative_origin is
  'Optional S07 qualifier of how a non-active professional_status arose: voluntary | disciplinary | moderation. NULL when professional_status is active; when set, professional_status must be suspended|ceased|revoked|archived.';

comment on column public.professional_profiles.publication_status is
  'Publication axis S04: unpublished | published. Distinct from visibility_status and editorial_status. Default unpublished. No CHECK equating publication to visibility.';

comment on column public.professional_profiles.visibility_status is
  'Visibility axis: private | editorial | network | selected | public | partially_anonymous. Distinct from publication_status. Default private.';

comment on column public.professional_profiles.availability_status is
  'Availability for assignments (distinct from professional_status and publication): available | limited | unavailable | future | case_by_case | temporarily_unavailable. Default available.';

comment on column public.professional_profiles.availability_note is
  'Optional free-text note clarifying availability. Not a calendar and not a booking slot.';

comment on column public.professional_profiles.availability_until is
  'Optional horizon date when availability_status is future (required in that case). Not a profile existence validity interval.';

comment on column public.professional_profiles.is_contested is
  'Contestation overlay boolean. Not a verification status axis and not S03. Default false.';

comment on column public.professional_profiles.experience_years is
  'Optional declared years of professional experience (value object on the AR). Must be >= 0 when present. Not a structured employment history table.';

comment on column public.professional_profiles.experience_summary is
  'Optional free-text experience synthesis. Not qualifications or credentials.';

comment on column public.professional_profiles.fee_indication_kind is
  'Nature of the indicative economic signal: none | hourly_range | fixed_range | on_request | free | discounted. Descriptive only — not a binding price, checkout, invoice, or marketplace tariff. Default none.';

comment on column public.professional_profiles.fee_currency is
  'Optional ISO 4217 currency code (exactly three uppercase letters when present). NULL when fee_indication_kind is none. Not a payment rail.';

comment on column public.professional_profiles.fee_amount_min is
  'Optional indicative lower amount. Non-negative. NULL for none/on_request/free. Not a binding quote.';

comment on column public.professional_profiles.fee_amount_max is
  'Optional indicative upper amount. Non-negative and >= fee_amount_min when both set. NULL for none/on_request/free. Not a binding quote.';

comment on column public.professional_profiles.fee_note is
  'Optional free-text indicative fee note. Not a structured estimate, contract, or invoice.';

comment on column public.professional_profiles.fee_visibility is
  'Visibility of the fee indication: private | public. Distinct from profile visibility_status. Default private.';

comment on column public.professional_profiles.professional_email is
  'Optional professional contact email declared on the profile. Distinct from mandatory Persona contact channels; not an auth identity.';

comment on column public.professional_profiles.professional_phone is
  'Optional professional contact phone declared on the profile. Distinct from Persona personal contacts.';

comment on column public.professional_profiles.contacts_visibility is
  'Visibility of professional contacts: private | public | on_request. Default private.';

comment on column public.professional_profiles.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_profiles.updated_at is
  'Last update timestamp. Maintained by professional_profiles_set_updated_at.';

create index prof_profiles_publication_status_idx
  on public.professional_profiles (publication_status);

create index prof_profiles_availability_status_idx
  on public.professional_profiles (availability_status);

create index prof_profiles_professional_status_idx
  on public.professional_profiles (professional_status);

create or replace function public.set_professional_profiles_updated_at ()
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

comment on function public.set_professional_profiles_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_profiles. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce publication, availability, membership, or verification projection.';

create trigger professional_profiles_set_updated_at
before update on public.professional_profiles
for each row
execute function public.set_professional_profiles_updated_at ();

alter table public.professional_profiles enable row level security;

-- Defense in depth: no policies in M2.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_profiles from public;
revoke all on table public.professional_profiles from anon, authenticated;
