-- M4.2 — create business membership responsibility declarations
-- Implements independent organizational responsibility declarations:
--   public.business_membership_responsibility_declarations
-- (docs/architecture/migrations/appartenenze-migration-plan.md §17 M4.2;
--  docs/architecture/physical/domain-mapping/appartenenze.md §32.7;
--  docs/architecture/logical/appartenenze.md §8).
--
-- Scope of this unit only: 0..5 declared responsibility rows owned by a
-- business_memberships row. Each row declares exactly one responsibility
-- code. Responsibilities are independent of role_id and of M4.1 management
-- authorization.
--
-- Explicitly out of scope: per-aspect verifications (M5.1); technical
-- permissions; RLS policies; auth.users / JWT claims; history/audit;
-- seed/demo catalog table; Organizations; Opportunità; modifications to
-- M1–M4.1 beyond FK ownership.
--
-- Distinct from role catalog codes and from management authorization.
-- Does not grant technical access, does not sync with M4.1 or role_id,
-- and does not mutate business_memberships or businesses.

create table public.business_membership_responsibility_declarations (
  id uuid not null default gen_random_uuid (),
  membership_id uuid not null,
  responsibility_code text not null,
  is_declared boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmrd_pkey primary key (id),
  constraint bmrd_membership_id_fkey
    foreign key (membership_id)
    references public.business_memberships (id)
    on delete cascade,
  constraint bmrd_membership_responsibility_uidx
    unique (membership_id, responsibility_code),
  constraint bmrd_responsibility_code_check check (
    responsibility_code in (
      'ownership',
      'legal_representation',
      'operational_representation',
      'sheet_management',
      'contact_referent'
    )
  ),
  constraint bmrd_note_not_blank_check check (
    note is null
    or length(btrim(note)) > 0
  )
);

comment on table public.business_membership_responsibility_declarations is
  'Declared organizational responsibilities for a Persona–Impresa membership. Owned by business_memberships; deleted with the membership (ON DELETE CASCADE). Each row declares one responsibility; multiple distinct codes may coexist on the same membership (0..5). Distinct from role_id and from management authorization (M4.1). sheet_management does not grant technical access; contact_referent is not unique per Impresa. Does not mutate membership axes or businesses.';

comment on column public.business_membership_responsibility_declarations.id is
  'Local technical identity of this responsibility declaration row. Not a public catalog code.';

comment on column public.business_membership_responsibility_declarations.membership_id is
  'Owning Appartenenza (public.business_memberships). Required. ON DELETE CASCADE.';

comment on column public.business_membership_responsibility_declarations.responsibility_code is
  'Declared responsibility code: ownership, legal_representation, operational_representation, sheet_management, contact_referent. Required. Not a role catalog code and not a technical permission.';

comment on column public.business_membership_responsibility_declarations.is_declared is
  'Whether this responsibility is currently declared for the membership. Default true. Local declaration flag; does not sync with role_id or M4.1 authorization.';

comment on column public.business_membership_responsibility_declarations.note is
  'Optional free-text note about this responsibility declaration. Anti-blank when present. Not a structured Fonte, Evidence, Verification, audit record, or account reference.';

comment on column public.business_membership_responsibility_declarations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.business_membership_responsibility_declarations.updated_at is
  'Last update timestamp. Maintained by bm_responsibility_declarations_set_updated_at.';

alter table public.business_membership_responsibility_declarations enable row level security;

-- Defense in depth: no policies in M4.2. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.business_membership_responsibility_declarations
from anon, authenticated;

create or replace function public.set_bm_responsibility_declarations_updated_at ()
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

comment on function public.set_bm_responsibility_declarations_updated_at () is
  'BEFORE UPDATE trigger function for public.business_membership_responsibility_declarations. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns, membership axes, M4.1 authorization, businesses, or access controls.';

create trigger bm_responsibility_declarations_set_updated_at
before update on public.business_membership_responsibility_declarations
for each row
execute function public.set_bm_responsibility_declarations_updated_at ();
