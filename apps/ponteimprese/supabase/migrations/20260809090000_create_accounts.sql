-- M1.1 — create accounts
-- Implements Aggregate Root Account of Identità & Accessi:
--   public.accounts
-- (docs/architecture/migrations/identita-accessi-migration-plan.md §12 M1.1;
--  docs/architecture/physical/domain-mapping/identita-accessi.md §8–§9, §14–§20;
--  docs/architecture/logical/identita-accessi.md §15.A–§15.C).
--
-- Scope of this unit only: AR Account, opaque FK to auth.users, optional FK
-- to profiles, lifecycle/gates, uniqueness Auth/Persona, updated_at,
-- local person-unlink coherence trigger, RLS, REVOKE.
-- Explicitly out of scope: role assignments; Deleghe; Consensi; sessions;
-- devices; tokens; MFA; OAuth; passwords; email duplication; Account–Impresa;
-- Account–Organizzazione; membership; auth.users triggers; profiles changes;
-- seed; policies; GRANT.

create table public.accounts (
  id uuid not null default gen_random_uuid (),
  auth_user_id uuid not null,
  person_id uuid null,
  person_association_status text null,
  person_linked_at timestamptz null,
  account_status text not null default 'registered',
  activated_at timestamptz null,
  suspended_at timestamptz null,
  disabled_at timestamptz null,
  closed_at timestamptz null,
  status_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_pkey primary key (id),
  constraint accounts_auth_user_id_fkey
    foreign key (auth_user_id)
    references auth.users (id)
    on update no action
    on delete cascade,
  constraint accounts_person_id_fkey
    foreign key (person_id)
    references public.profiles (id)
    on update no action
    on delete set null,
  constraint accounts_auth_user_id_key unique (auth_user_id),
  constraint accounts_person_id_key unique (person_id),
  constraint accounts_account_status_check check (
    account_status in (
      'registered',
      'active',
      'limited',
      'suspended',
      'disabled',
      'closed'
    )
  ),
  constraint accounts_person_association_check check (
    (
      person_id is null
      and person_association_status is null
      and person_linked_at is null
    )
    or (
      person_id is not null
      and person_association_status in ('declared', 'verified', 'contested')
      and person_linked_at is not null
    )
  ),
  constraint accounts_active_requires_person_check check (
    account_status <> 'active'
    or person_id is not null
  ),
  constraint accounts_suspended_gate_check check (
    account_status <> 'suspended'
    or suspended_at is not null
  ),
  constraint accounts_disabled_gate_check check (
    account_status <> 'disabled'
    or disabled_at is not null
  ),
  constraint accounts_closed_gate_check check (
    account_status <> 'closed'
    or closed_at is not null
  ),
  constraint accounts_active_gate_check check (
    account_status <> 'active'
    or activated_at is not null
  ),
  constraint accounts_status_reason_check check (
    status_reason is null
    or length(btrim(status_reason)) > 0
  )
);

comment on table public.accounts is
  'Aggregate Root of Identità & Accessi (ciclo 1): applicative Account distinct from auth.users and from Persona (public.profiles). Owns opaque Auth link, optional Person association, and operational lifecycle. Does not own credentials, memberships, Deleghe, Consensi, sessions, Impresa/Organizzazione context tables, or domain policies.';

comment on column public.accounts.id is
  'Stable Account identity. Distinct from auth.users.id and from profiles.id.';

comment on column public.accounts.auth_user_id is
  'Mandatory opaque link to technical Auth subject (auth.users). UNIQUE: at most one ordinary Account per Auth user in cycle 1. ON DELETE CASCADE. Does not duplicate email, password, provider, tokens, MFA, or Auth sessions.';

comment on column public.accounts.person_id is
  'Optional association to Persona (public.profiles). UNIQUE when set: at most one ordinary Account per Persona in cycle 1. ON DELETE SET NULL. NULL means no personal identity association (limited/transitory Account). Not forced equal to auth_user_id.';

comment on column public.accounts.person_association_status is
  'Association axis when person_id is set: declared | verified | contested. NULL iff person_id is NULL.';

comment on column public.accounts.person_linked_at is
  'Timestamp of Person association. NOT NULL iff person_id is set.';

comment on column public.accounts.account_status is
  'Operational lifecycle (cycle 1): registered | active | limited | suspended | disabled | closed. Default registered. active requires person_id and activated_at.';

comment on column public.accounts.activated_at is
  'First operational activation timestamp. Required when account_status = active.';

comment on column public.accounts.suspended_at is
  'Suspension gate timestamp. Required when account_status = suspended.';

comment on column public.accounts.disabled_at is
  'Voluntary disable gate timestamp. Required when account_status = disabled.';

comment on column public.accounts.closed_at is
  'Definitive closure gate timestamp. Required when account_status = closed.';

comment on column public.accounts.status_reason is
  'Optional opaque status note. When set, must be non-blank after trim.';

comment on column public.accounts.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.accounts.updated_at is
  'Last update timestamp. Maintained by accounts_set_updated_at.';

create index accounts_account_status_idx
  on public.accounts (account_status);

alter table public.accounts enable row level security;

revoke all on table public.accounts from public;
revoke all on table public.accounts from anon, authenticated;

create or replace function public.set_accounts_updated_at ()
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

comment on function public.set_accounts_updated_at () is
  'BEFORE UPDATE trigger function for public.accounts. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at, auth.users, profiles, or other tables.';

create trigger accounts_set_updated_at
before update on public.accounts
for each row
execute function public.set_accounts_updated_at ();

-- Physical §20.2 — authorized normalization when person_id becomes NULL
-- (manual UPDATE or FK ON DELETE SET NULL from profiles). Runs BEFORE CHECK.
create or replace function public.accounts_clear_person_association ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.person_id is null and old.person_id is not null then
    new.person_association_status := null;
    new.person_linked_at := null;
    if new.account_status = 'active' then
      new.account_status := 'limited';
    end if;
  end if;
  return new;
end;
$$;

comment on function public.accounts_clear_person_association () is
  'Physical §20.2. BEFORE UPDATE on public.accounts. When person_id is cleared (including FK ON DELETE SET NULL from profiles), nulls person_association_status and person_linked_at and demotes active to limited so association CHECK and active-requires-person CHECK remain satisfiable. SECURITY INVOKER; empty search_path. Does not modify profiles or auth.users.';

create trigger accounts_clear_person_association
before update on public.accounts
for each row
execute function public.accounts_clear_person_association ();
