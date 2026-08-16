-- M4.1 — create business membership management authorizations
-- Implements declarative business-sheet management authorization (R8):
--   public.business_membership_management_authorizations
-- (docs/architecture/migrations/appartenenze-migration-plan.md §17 M4.1;
--  docs/architecture/physical/domain-mapping/appartenenze.md §32.6;
--  docs/architecture/logical/appartenenze.md §2 Autorizzazione gestionale).
--
-- Scope of this unit only: current-state 0..1 authorization row owned by a
-- business_memberships row. Declares whether the membership is authorized
-- (or no longer authorized) to manage the Impresa sheet as a business fact.
--
-- Explicitly out of scope: responsibility declarations (M4.2); per-aspect
-- verifications (M5.1); technical permissions; RLS policies; auth.users /
-- JWT claims; history/audit; seed/demo; Organizations; Opportunità;
-- modifications to M1–M3 beyond FK ownership.
--
-- Distinct from role_id sheet_manager and from responsibility
-- sheet_management. Does not grant technical access, does not depend on
-- Identità & Accessi schema, and does not mutate business_memberships or
-- businesses.

create table public.business_membership_management_authorizations (
  id uuid not null default gen_random_uuid (),
  membership_id uuid not null,
  authorization_status text not null default 'granted',
  granted_at timestamptz,
  revoked_at timestamptz,
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmma_pkey primary key (id),
  constraint bmma_membership_id_fkey
    foreign key (membership_id)
    references public.business_memberships (id)
    on delete cascade,
  constraint bmma_membership_id_uidx unique (membership_id),
  constraint bmma_authorization_status_check check (
    authorization_status in ('granted', 'revoked')
  ),
  constraint bmma_revoked_requires_revoked_at_check check (
    authorization_status <> 'revoked'
    or revoked_at is not null
  ),
  constraint bmma_revoked_at_after_granted_at_check check (
    revoked_at is null
    or granted_at is null
    or revoked_at >= granted_at
  ),
  constraint bmma_source_note_not_blank_check check (
    source_note is null
    or length(btrim(source_note)) > 0
  )
);

comment on table public.business_membership_management_authorizations is
  'Declarative business fact (R8): current-state management authorization for a Persona–Impresa membership to manage the Impresa sheet. Owned by business_memberships; at most one row per membership (UNIQUE membership_id); deleted with the membership (ON DELETE CASCADE). Distinct from role sheet_manager and from responsibility sheet_management. Not a technical permission, RLS policy, JWT claim, or auth.users mapping. Does not automatically mutate membership axes or businesses.';

comment on column public.business_membership_management_authorizations.id is
  'Local technical identity of this authorization row. Not a public catalog code.';

comment on column public.business_membership_management_authorizations.membership_id is
  'Owning Appartenenza (public.business_memberships). Required. UNIQUE for 0..1 cardinality. ON DELETE CASCADE.';

comment on column public.business_membership_management_authorizations.authorization_status is
  'Current authorization state: granted or revoked. Default granted. Not a technical access flag and not an RLS policy outcome.';

comment on column public.business_membership_management_authorizations.granted_at is
  'Optional timestamp when the authorization was granted. Nullable. Not an expiry and not a technical session start.';

comment on column public.business_membership_management_authorizations.revoked_at is
  'Optional timestamp when the authorization was revoked. Required when authorization_status = revoked. Must be >= granted_at when both are set. Revocation does not automatically mutate other membership axes.';

comment on column public.business_membership_management_authorizations.source_note is
  'Optional free-text note about the authorization provenance or context. Anti-blank when present. Not a controlled reason catalog.';

comment on column public.business_membership_management_authorizations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.business_membership_management_authorizations.updated_at is
  'Last update timestamp. Maintained by bm_management_authorizations_set_updated_at.';

alter table public.business_membership_management_authorizations enable row level security;

-- Defense in depth: no policies in M4.1. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.business_membership_management_authorizations
from anon, authenticated;

create or replace function public.set_bm_management_authorizations_updated_at ()
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

comment on function public.set_bm_management_authorizations_updated_at () is
  'BEFORE UPDATE trigger function for public.business_membership_management_authorizations. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns, membership axes, businesses, or access controls.';

create trigger bm_management_authorizations_set_updated_at
before update on public.business_membership_management_authorizations
for each row
execute function public.set_bm_management_authorizations_updated_at ();
