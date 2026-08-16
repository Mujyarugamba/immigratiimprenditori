-- M6.1 — create opportunity party references
-- Implements R02 inter-domain party references of the Opportunità domain
-- as a multivalue composition of public.opportunities
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §17;
--  docs/architecture/physical/domain-mapping/opportunita.md §15.A §15.A.1–§15.A.17;
--  approved Physical §15 micro-review with non-blocking findings).
--
-- Depends on:
--   public.opportunities (M1.1)
--   public.profiles (Persone)
--
-- Creates:
--   public.opportunity_party_references
--
-- Scope of this unit only: opaque subject+role links on the opportunity
-- sheet (promoter, funder, manager, implementer, signaler, publisher,
-- related). Explicitly out of scope: M6.2 representation utilizations,
-- M6.3 professional/market/sector references, candidature, beneficiaries,
-- editorial roles, platform publication/visibility (M7), Sources/Evidences,
-- Events/Collaborations outbound, Organizations domain, seed data, policies,
-- and grants.
--
-- Party reference ≠ Persona ≠ Impresa ≠ Fonte ≠ Evidenza ≠
-- candidatura ≠ pubblicazione piattaforma ≠ redazione.
-- Soft deletion of opportunities (deleted_at) does not remove party rows;
-- physical delete of an opportunity cascades owned party composition rows.
-- The technical id does not confer autonomous domain identity.
-- business_id is an opaque UUID without FK until the Impresa table exists;
-- subjects not on the platform use subject_kind = external.

create table public.opportunity_party_references (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  role text not null,
  subject_kind text not null,
  person_id uuid references public.profiles (id) on delete restrict,
  business_id uuid,
  external_label text,
  external_identifier text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_party_references_role_check check (
    role in (
      'promoter',
      'funder',
      'manager',
      'implementer',
      'signaler',
      'publisher',
      'related'
    )
  ),
  constraint opportunity_party_references_subject_kind_check check (
    subject_kind in (
      'person',
      'business',
      'external'
    )
  ),
  constraint opportunity_party_references_subject_resolution_check check (
    (
      subject_kind = 'person'
      and person_id is not null
      and business_id is null
      and external_label is null
      and external_identifier is null
    )
    or (
      subject_kind = 'business'
      and business_id is not null
      and person_id is null
      and external_label is null
      and external_identifier is null
    )
    or (
      subject_kind = 'external'
      and external_label is not null
      and btrim(external_label) <> ''
      and person_id is null
      and business_id is null
      and (
        external_identifier is null
        or btrim(external_identifier) <> ''
      )
    )
  ),
  constraint opportunity_party_references_person_only_roles_check check (
    role not in ('signaler', 'publisher')
    or subject_kind = 'person'
  ),
  constraint opportunity_party_references_sort_order_check check (sort_order >= 0)
);

comment on table public.opportunity_party_references is
  'R02 party-reference composition owned by an Opportunità: opaque PF5 link stating that a subject holds a role on the opportunity sheet. Multivalue (0..N); not Persona, not Impresa, not Fonte, not Evidenza, not candidature, not platform publication (M7), not editorial staff. Current relationship state only (no history table). Physical delete of the opportunity cascades owned rows.';

comment on column public.opportunity_party_references.id is
  'Technical row identifier only. Does not confer autonomous domain identity and must not be referenced by other domains as a subject.';

comment on column public.opportunity_party_references.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row.';

comment on column public.opportunity_party_references.role is
  'Declared role on the sheet: promoter, funder, manager, implementer, signaler, publisher, or related. Not source, evidence, candidate, beneficiary, editor, or owner. publisher is subject identity only — not platform publication status (M7).';

comment on column public.opportunity_party_references.subject_kind is
  'Subject resolution mode: person (profiles FK), business (opaque UUID, no FK in M6.1), or external (non-authoritative label). Exactly one branch must be populated.';

comment on column public.opportunity_party_references.person_id is
  'Opaque Persona identity (D14) via public.profiles. Required when subject_kind = person; ON DELETE RESTRICT. No copied anagraphic attributes.';

comment on column public.opportunity_party_references.business_id is
  'Opaque Impresa identity (D15) as UUID only. Required when subject_kind = business. No foreign key in M6.1 because the Impresa table is not yet in schema; a later additive migration may add FK ON DELETE RESTRICT when available. Until then integrity is application-level; subjects not on the platform use subject_kind = external.';

comment on column public.opportunity_party_references.external_label is
  'Declared non-authoritative label of an external subject not resolved as Persona/Impresa on the platform. Required (anti-blank) when subject_kind = external. Not an authoritative identity.';

comment on column public.opportunity_party_references.external_identifier is
  'Optional opaque external identifier for subject_kind = external only (anti-blank when set). Must be null for person and business branches. Not structured tax/VAT modelling.';

comment on column public.opportunity_party_references.sort_order is
  'Editorial display order among party references of the same opportunity, lower values first. Not unique, not scoring, not identity.';

comment on column public.opportunity_party_references.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_party_references.updated_at is
  'Last update timestamp. Maintained by opportunity_party_references_set_updated_at.';

create index opportunity_party_references_opportunity_id_idx
  on public.opportunity_party_references using btree (opportunity_id);

create index opportunity_party_references_person_id_idx
  on public.opportunity_party_references using btree (person_id)
  where person_id is not null;

create index opportunity_party_references_business_id_idx
  on public.opportunity_party_references using btree (business_id)
  where business_id is not null;

-- At most one publisher identity per opportunity (structural 0..1).
create unique index opportunity_party_references_one_publisher_uidx
  on public.opportunity_party_references using btree (opportunity_id)
  where role = 'publisher';

-- Same person cannot hold the same role twice on one opportunity.
create unique index opportunity_party_references_person_role_uidx
  on public.opportunity_party_references using btree (opportunity_id, role, person_id)
  where person_id is not null;

-- Same business UUID cannot hold the same role twice on one opportunity.
create unique index opportunity_party_references_business_role_uidx
  on public.opportunity_party_references using btree (opportunity_id, role, business_id)
  where business_id is not null;

create or replace function public.set_opportunity_party_references_updated_at ()
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

create trigger opportunity_party_references_set_updated_at
before update on public.opportunity_party_references
for each row
execute function public.set_opportunity_party_references_updated_at ();

alter table public.opportunity_party_references enable row level security;

-- Defense in depth: no policies in M6.1. Publication/visibility completeness
-- gates (including minimum one promoter) belong to later units (M7). With
-- RLS enabled and no policy, roles subject to RLS cannot read or write.
-- service_role and owner privileges are not revoked.
revoke all on table public.opportunity_party_references from anon, authenticated;
