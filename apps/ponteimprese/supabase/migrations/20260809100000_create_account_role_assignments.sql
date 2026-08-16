-- M2.1 — create account role assignments
-- Implements elevated applicative role assignments of Identità & Accessi:
--   public.account_role_assignments
-- (docs/architecture/migrations/identita-accessi-migration-plan.md §12 M2.1;
--  docs/architecture/physical/domain-mapping/identita-accessi.md §10, §18–§20;
--  docs/architecture/logical/identita-accessi.md §6, §15.A).
--
-- Scope of this unit only: owned assignments for redattore and
-- amministratore_applicativo under accounts; assignment/revoke lifecycle;
-- updated_at; RLS; REVOKE.
-- Explicitly out of scope: account_registrato persistence; moderatore;
-- servizio_tecnico; role catalogs; seed; FK to profiles/businesses/
-- memberships/organizations/contents/events; ownership/substantive rights;
-- policies; GRANT; auth.users triggers.

create table public.account_role_assignments (
  id uuid not null default gen_random_uuid (),
  account_id uuid not null,
  role_code text not null,
  assignment_status text not null default 'active',
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_role_assignments_pkey primary key (id),
  constraint account_role_assignments_account_id_fkey
    foreign key (account_id)
    references public.accounts (id)
    on update no action
    on delete cascade,
  constraint account_role_assignments_account_role_key
    unique (account_id, role_code),
  constraint account_role_assignments_role_code_check check (
    role_code in ('redattore', 'amministratore_applicativo')
  ),
  constraint account_role_assignments_assignment_status_check check (
    assignment_status in ('active', 'revoked')
  ),
  constraint account_role_assignments_revoke_gate_check check (
    (
      assignment_status = 'active'
      and revoked_at is null
    )
    or (
      assignment_status = 'revoked'
      and revoked_at is not null
    )
  )
);

comment on table public.account_role_assignments is
  'Owned Entity of accounts (Identità & Accessi ciclo 1): elevated applicative role assignments. Persists only redattore and amministratore_applicativo. account_registrato is derived from Account status and must not be stored here. Does not prove membership, ownership, professional qualification, or domain substantive rights. Not an RLS policy.';

comment on column public.account_role_assignments.id is
  'Stable assignment identity.';

comment on column public.account_role_assignments.account_id is
  'Owning Aggregate Root (public.accounts). NOT NULL. ON DELETE CASCADE — assignments do not outlive the Account.';

comment on column public.account_role_assignments.role_code is
  'Elevated applicative role: redattore | amministratore_applicativo. Does not include account_registrato (derived), moderatore, or service accounts.';

comment on column public.account_role_assignments.assignment_status is
  'Assignment lifecycle: active | revoked. Default active.';

comment on column public.account_role_assignments.assigned_at is
  'Assignment timestamp. Default now().';

comment on column public.account_role_assignments.revoked_at is
  'Revocation gate timestamp. NULL when active; NOT NULL when revoked.';

comment on column public.account_role_assignments.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.account_role_assignments.updated_at is
  'Last update timestamp. Maintained by account_role_assignments_set_updated_at.';

create index account_role_assignments_role_code_idx
  on public.account_role_assignments (role_code);

alter table public.account_role_assignments enable row level security;

revoke all on table public.account_role_assignments from public;
revoke all on table public.account_role_assignments from anon, authenticated;

create or replace function public.set_account_role_assignments_updated_at ()
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

comment on function public.set_account_role_assignments_updated_at () is
  'BEFORE UPDATE trigger function for public.account_role_assignments. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at, accounts, or other domains.';

create trigger account_role_assignments_set_updated_at
before update on public.account_role_assignments
for each row
execute function public.set_account_role_assignments_updated_at ();
