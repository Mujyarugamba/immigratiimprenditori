-- L1.3 unit 1 — Terms of Use acceptance ledger (signup demonstrability)
-- Micro-review M1 (adversarial): append-only evidence; Account-scoped; Terms ≠ Privacy consent.
-- Scope ONLY:
--   public.terms_acceptances
--   RLS/grants: owner INSERT (column-limited) + SELECT; admin SELECT; no UPDATE/DELETE
-- Explicitly OUT OF SCOPE:
--   privacy consent rows; account self-deletion; legal retention archive;
--   orphan reassignment; AuthForm wiring; seeds; SECURITY DEFINER helpers.

-- ---------------------------------------------------------------------------
-- 1) Table
-- ---------------------------------------------------------------------------
create table public.terms_acceptances (
  id uuid not null default gen_random_uuid (),
  account_id uuid not null,
  document_kind text not null,
  document_version text not null,
  accepted_at timestamptz not null default now (),
  acceptance_channel text not null,
  constraint terms_acceptances_pkey primary key (id),
  constraint terms_acceptances_account_id_fkey
    foreign key (account_id)
    references public.accounts (id)
    on update no action
    on delete restrict,
  constraint terms_acceptances_document_kind_check check (
    document_kind = 'terms_of_use'
  ),
  constraint terms_acceptances_acceptance_channel_check check (
    acceptance_channel in ('signup')
  ),
  constraint terms_acceptances_document_version_nonblank_chk check (
    length(btrim(document_version)) > 0
  ),
  constraint terms_acceptances_account_kind_version_key unique (
    account_id,
    document_kind,
    document_version
  )
);

comment on table public.terms_acceptances is
  'L1.3: append-only demonstrable acceptance of Termini d''Uso (not Privacy consent). One row per Account per document_version. FK ON DELETE RESTRICT so hard Account deletion cannot silently destroy evidence; M2/M3 must archive or explicitly remove rows first. Soft account close (status=closed) does not touch this table.';

comment on column public.terms_acceptances.account_id is
  'Applicative Account (public.accounts.id). Not auth.users id. Not Persona/profiles.id.';
comment on column public.terms_acceptances.document_kind is
  'Only terms_of_use in v1. Privacy Policy is informational and is not logged as consent here.';
comment on column public.terms_acceptances.document_version is
  'Opaque stable version string from application constant (e.g. 2026-08-11). Not an enum; future revisions need no DDL change.';
comment on column public.terms_acceptances.accepted_at is
  'Server-side acceptance time (DEFAULT now()). Not granted for client INSERT; authority is the database clock.';
comment on column public.terms_acceptances.acceptance_channel is
  'Channel of acceptance. v1: signup only (expand CHECK later if new channels are added).';

comment on constraint terms_acceptances_account_id_fkey on public.terms_acceptances is
  'RESTRICT: preserves acceptance evidence until M2/M3 explicitly archives or deletes rows before hard Account DELETE.';

-- Lookup by Account; uniqueness already indexes (account_id, document_kind, document_version).
create index terms_acceptances_account_id_idx
  on public.terms_acceptances (account_id);

-- ---------------------------------------------------------------------------
-- 2) RLS + grants (append-only)
-- ---------------------------------------------------------------------------
alter table public.terms_acceptances enable row level security;

revoke all on table public.terms_acceptances from public, anon, authenticated;

-- Column-limited INSERT: client cannot supply id or accepted_at (defaults apply).
grant select on table public.terms_acceptances to authenticated;
grant insert (
  account_id,
  document_kind,
  document_version,
  acceptance_channel
) on table public.terms_acceptances to authenticated;

create policy terms_acceptances_select_own
  on public.terms_acceptances
  for select
  to authenticated
  using (
    account_id = public.access_current_account_id ()
    or public.access_is_application_admin ()
  );

create policy terms_acceptances_insert_own
  on public.terms_acceptances
  for insert
  to authenticated
  with check (
    account_id = public.access_current_account_id ()
    and document_kind = 'terms_of_use'
    and acceptance_channel = 'signup'
  );

-- No UPDATE/DELETE policies and no UPDATE/DELETE grants for authenticated.
-- service_role bypasses RLS for operational tooling if needed (not browser).
