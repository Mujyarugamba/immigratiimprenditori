-- M2.1 — create business membership qualifications
-- Implements optional textual role refinements (E04) for Appartenenze:
--   public.business_membership_qualifications
-- (docs/architecture/migrations/appartenenze-migration-plan.md §15 M2.1;
--  docs/architecture/physical/domain-mapping/appartenenze.md §32.3;
--  docs/architecture/logical/appartenenze.md §2 Qualifica).
--
-- Scope of this unit only: 0..N free-text qualifications owned by a
-- business_memberships row. Precises an existing role; does not replace
-- role_id or the roles catalog.
--
-- Explicitly out of scope: role catalog changes; professional qualifications
-- (Professionisti); responsibility declarations; management authorizations;
-- sources/evidences/verifications; seed/demo; policies; Organizations;
-- Opportunità; modifications to M1.1/M1.2 tables beyond FK ownership.

create table public.business_membership_qualifications (
  id uuid not null default gen_random_uuid (),
  membership_id uuid not null,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmq_pkey primary key (id),
  constraint bmq_membership_id_fkey
    foreign key (membership_id)
    references public.business_memberships (id)
    on delete cascade,
  constraint bmq_membership_label_uidx unique (membership_id, label),
  constraint bmq_label_not_blank_check check (length(btrim(label)) > 0),
  constraint bmq_sort_order_check check (sort_order >= 0)
);

comment on table public.business_membership_qualifications is
  'Optional textual qualifications (E04) that refine the role of a specific Persona–Impresa membership. Owned by business_memberships; deleted with the membership (ON DELETE CASCADE). Does not replace role_id or the normative roles catalog. Not a professional qualification (Professionisti). Does not confer responsibility, representation, management authorization, or technical access.';

comment on column public.business_membership_qualifications.id is
  'Local technical identity of this qualification row. Not a public catalog code.';

comment on column public.business_membership_qualifications.membership_id is
  'Owning Appartenenza (public.business_memberships). Required. ON DELETE CASCADE.';

comment on column public.business_membership_qualifications.label is
  'Free-text qualification label that precises the membership role (e.g. amministratore unico). Required; anti-blank. Not a controlled catalog entry and not a role_id.';

comment on column public.business_membership_qualifications.sort_order is
  'Local display order within a single membership, lower values first. Default 0. Not unique; not a global ranking.';

comment on column public.business_membership_qualifications.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.business_membership_qualifications.updated_at is
  'Last update timestamp. Maintained by business_membership_qualifications_set_updated_at.';

create index bmq_membership_id_idx
  on public.business_membership_qualifications using btree (membership_id);

alter table public.business_membership_qualifications enable row level security;

-- Defense in depth: no policies in M2.1. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.business_membership_qualifications
from anon, authenticated;

create or replace function public.set_business_membership_qualifications_updated_at ()
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

comment on function public.set_business_membership_qualifications_updated_at () is
  'BEFORE UPDATE trigger function for public.business_membership_qualifications. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns.';

create trigger business_membership_qualifications_set_updated_at
before update on public.business_membership_qualifications
for each row
execute function public.set_business_membership_qualifications_updated_at ();
