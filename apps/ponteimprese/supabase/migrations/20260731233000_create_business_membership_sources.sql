-- M3.1 — create business membership sources
-- Implements informative sources (V03) for Appartenenze:
--   public.business_membership_sources
-- (docs/architecture/migrations/appartenenze-migration-plan.md §16 M3.1;
--  docs/architecture/physical/domain-mapping/appartenenze.md §32.4;
--  docs/architecture/logical/appartenenze.md §2 Fonte).
--
-- Scope of this unit only: 0..N source rows owned by a business_memberships
-- row (applicative minimum 1..N when Dichiarata; DB admits 0 for incomplete
-- proposals). Documents the origin of information for a specific
-- Persona–Impresa membership.
--
-- Explicitly out of scope: evidences (M3.2); per-aspect verifications;
-- management authorizations; responsibility declarations; history/audit;
-- Storage files; score/badge; seed/demo; policies; Organizations;
-- Opportunità; modifications to M1.1/M1.2/M2.1 beyond FK ownership.
--
-- Fonte ≠ Evidenza ≠ Verifica. A source does not assert validity,
-- reliability score, or publishability, and does not mutate AR axes.

create table public.business_membership_sources (
  id uuid not null default gen_random_uuid (),
  membership_id uuid not null,
  source_kind text not null,
  reliability_note text,
  reference_label text,
  declared_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bms_pkey primary key (id),
  constraint bms_membership_id_fkey
    foreign key (membership_id)
    references public.business_memberships (id)
    on delete cascade,
  constraint bms_source_kind_check check (
    source_kind in (
      'person_self_declaration',
      'business_declaration',
      'public_register',
      'entitled_third_party',
      'editorial_moderation'
    )
  ),
  constraint bms_reliability_note_not_blank_check check (
    reliability_note is null
    or length(btrim(reliability_note)) > 0
  ),
  constraint bms_reference_label_not_blank_check check (
    reference_label is null
    or length(btrim(reference_label)) > 0
  )
);

comment on table public.business_membership_sources is
  'Informative sources (V03) documenting the origin of information for a specific Persona–Impresa membership. Owned by business_memberships; deleted with the membership (ON DELETE CASCADE). Not an Evidence and not a Verification: does not assert validity, reliability score, or publishability, and does not mutate membership axes. Future evidences (M3.2) may reference a source.';

comment on column public.business_membership_sources.id is
  'Local technical identity of this source row. Not a public catalog code.';

comment on column public.business_membership_sources.membership_id is
  'Owning Appartenenza (public.business_memberships). Required. ON DELETE CASCADE.';

comment on column public.business_membership_sources.source_kind is
  'Controlled typology of the informative source: person_self_declaration, business_declaration, public_register, entitled_third_party, editorial_moderation. Required. Does not imply verification outcome.';

comment on column public.business_membership_sources.reliability_note is
  'Optional qualitative reliability note for this source. Not a numeric score. Anti-blank when present. Does not assert verification.';

comment on column public.business_membership_sources.reference_label is
  'Optional free-text label or citation of the source material (e.g. register name, act reference). Not a URL field and not Storage. Anti-blank when present.';

comment on column public.business_membership_sources.declared_at is
  'Optional timestamp when the source information was declared or observed. Distinct from created_at/updated_at. Not a verification or expiry timestamp.';

comment on column public.business_membership_sources.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.business_membership_sources.updated_at is
  'Last update timestamp. Maintained by business_membership_sources_set_updated_at.';

create index bms_membership_id_idx
  on public.business_membership_sources using btree (membership_id);

alter table public.business_membership_sources enable row level security;

-- Defense in depth: no policies in M3.1. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.business_membership_sources
from anon, authenticated;

create or replace function public.set_business_membership_sources_updated_at ()
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

comment on function public.set_business_membership_sources_updated_at () is
  'BEFORE UPDATE trigger function for public.business_membership_sources. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns.';

create trigger business_membership_sources_set_updated_at
before update on public.business_membership_sources
for each row
execute function public.set_business_membership_sources_updated_at ();
