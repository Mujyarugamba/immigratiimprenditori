-- M3.5 — create professional association memberships
-- Implements the owned light entity IscrizioneAssociativa / Adesione associativa:
--   public.professional_association_memberships
-- (docs/architecture/migrations/professionisti-migration-plan.md §14 M3.5;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.8,
--  §29.5, §29.6, §29.14.4, §29.19–§29.20, §29.22.10, §29.23–§29.26;
--  docs/architecture/logical/professionisti.md — Adesione associativa vs
--  Iscrizione professionale and vs Appartenenze Persona–Impresa).
--
-- Scope of this unit only: one owned light table under professional_profiles,
-- constraints, owner index, updated_at function/trigger, RLS, REVOKE.
-- Explicitly out of scope: seed; qualifications; registrations; authorizations;
-- certifications; association catalogs; Organizations/business FK; Appartenenze
-- tables; FEV; verification_status; evidence_visibility; origin/equivalence;
-- credential_status; Storage; policies; GRANT; alterations to M3.1–M3.4.

create table public.professional_association_memberships (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  association_label text not null,
  role_label text null,
  joined_on date null,
  ended_on date null,
  declaration_status text not null default 'declared',
  visibility_status text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prof_assoc_memberships_pkey primary key (id),
  constraint prof_assoc_memberships_professional_profile_id_fkey foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint prof_assoc_memberships_association_label_not_blank_check check (
    length(btrim(association_label)) > 0
  ),
  constraint prof_assoc_memberships_declaration_status_check check (
    declaration_status in ('declared', 'removed')
  ),
  constraint prof_assoc_memberships_visibility_status_check check (
    visibility_status in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_assoc_memberships_date_range_check check (
    ended_on is null
    or joined_on is null
    or ended_on >= joined_on
  )
);

comment on table public.professional_association_memberships is
  'Owned Entity (E02) of professional_profiles: declared voluntary membership in a non-statutory professional association (IscrizioneAssociativa). Distinct from regulated professional registrations (Orders/Colleges/registers), qualifications, authorizations, certifications, competencies, and from Appartenenze Persona–Impresa memberships. association_label is an opaque association name — not an associations catalog FK and not an Organization/business entity. No dedicated verification axis (S03) in cycle 1. Lifecycle via declaration_status (declared|removed); historical rows retained; no soft-delete.';

comment on column public.professional_association_memberships.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_association_memberships.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — association memberships do not outlive the profile. No direct FK to profiles (Persona) and no ownership by the association.';

comment on column public.professional_association_memberships.association_label is
  'Opaque label of the professional association. Required and non-blank. Not a FK to associations, Organizations, businesses, or Appartenenze. Not a regulated Order/College/register body.';

comment on column public.professional_association_memberships.role_label is
  'Optional opaque label of a role held in the association. Nullable. Not a roles catalog FK.';

comment on column public.professional_association_memberships.joined_on is
  'Optional membership start / joining date. Temporal coherence with ended_on enforced by CHECK when both ends are present.';

comment on column public.professional_association_memberships.ended_on is
  'Optional membership end date. NULL means still valid / no known end (Physical §29.20). Does not delete historical rows. No CHECK tying declaration_status to dates.';

comment on column public.professional_association_memberships.declaration_status is
  'Light declaration lifecycle S01: declared | removed. Default declared. Distinct from credential_status vocabularies of qualifications, registrations, authorizations, and certifications. removed is terminal for the row; historical retention applies.';

comment on column public.professional_association_memberships.visibility_status is
  'Visibility of this association membership declaration (VIS). Default private. No evidence_visibility column — no dedicated evidence axis on this light entity in cycle 1.';

comment on column public.professional_association_memberships.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_association_memberships.updated_at is
  'Last update timestamp. Maintained by prof_assoc_memberships_set_updated_at.';

create index prof_assoc_memberships_professional_profile_id_idx
  on public.professional_association_memberships (professional_profile_id);

create or replace function public.set_prof_assoc_memberships_updated_at ()
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

comment on function public.set_prof_assoc_memberships_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_association_memberships. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce verification, Appartenenze sync, or FEV.';

create trigger prof_assoc_memberships_set_updated_at
before update on public.professional_association_memberships
for each row
execute function public.set_prof_assoc_memberships_updated_at ();

alter table public.professional_association_memberships enable row level security;

-- Defense in depth: no policies in M3.5. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_association_memberships from public;
revoke all on table public.professional_association_memberships from anon, authenticated;
