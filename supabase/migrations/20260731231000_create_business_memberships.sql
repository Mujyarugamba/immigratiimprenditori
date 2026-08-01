-- M1.2 — create business memberships
-- Implements the Aggregate Root of the Appartenenze domain:
--   public.business_memberships
-- (docs/architecture/migrations/appartenenze-migration-plan.md §14 M1.2;
--  docs/architecture/physical/domain-mapping/appartenenze.md §32.2;
--  docs/architecture/logical/appartenenze.md §2, §5–§8, §11–§12).
--
-- Scope of this unit only: Persona–Impresa organizational relationship with
-- role FK, independent state axes, contestation overlay, period, timestamps,
-- updated_at trigger, defensive RLS/privileges.
--
-- Explicitly out of scope: qualifications, sources, evidences, management
-- authorizations, responsibility declarations, aspect verifications,
-- Opportunità membership_id FK, Organizations, definitive RLS policies,
-- UNIQUE(person_id, business_id), CASCADE from profiles/businesses, seed/demo.

create table public.business_memberships (
  id uuid not null default gen_random_uuid (),
  person_id uuid not null,
  business_id uuid not null,
  role_id text not null,
  editorial_status text not null default 'proposed',
  relation_status text not null default 'active',
  verification_status text not null default 'unverified',
  is_contested boolean not null default false,
  visibility_status text not null default 'private',
  started_at date,
  ended_at date,
  cessation_reason text,
  contextual_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bm_pkey primary key (id),
  constraint bm_person_id_fkey
    foreign key (person_id) references public.profiles (id) on delete restrict,
  constraint bm_business_id_fkey
    foreign key (business_id) references public.businesses (id) on delete restrict,
  constraint bm_role_id_fkey
    foreign key (role_id) references public.business_membership_roles (code) on delete restrict,
  constraint bm_editorial_status_check check (
    editorial_status in ('proposed', 'declared')
  ),
  constraint bm_relation_status_check check (
    relation_status in (
      'active',
      'suspended',
      'concluded',
      'revoked',
      'archived'
    )
  ),
  constraint bm_verification_status_check check (
    verification_status in ('unverified', 'in_review', 'confirmed')
  ),
  constraint bm_visibility_status_check check (
    visibility_status in (
      'private',
      'internal',
      'editorial',
      'public',
      'historical'
    )
  ),
  constraint bm_period_order_check check (
    ended_at is null
    or started_at is null
    or ended_at >= started_at
  ),
  -- concluded / revoked / archived require ended_at
  constraint bm_relation_end_required_check check (
    relation_status in ('active', 'suspended')
    or ended_at is not null
  ),
  constraint bm_active_no_end_check check (
    relation_status <> 'active'
    or ended_at is null
  ),
  constraint bm_suspended_no_end_check check (
    relation_status <> 'suspended'
    or ended_at is null
  ),
  constraint bm_cessation_reason_not_blank_check check (
    cessation_reason is null
    or length(btrim(cessation_reason)) > 0
  ),
  constraint bm_contextual_notes_not_blank_check check (
    contextual_notes is null
    or length(btrim(contextual_notes)) > 0
  )
);

comment on table public.business_memberships is
  'Aggregate Root of Appartenenze: organizational Persona–Impresa relationship with role, independent state axes, contestation overlay, and period. Person and Business identities remain owned by Persone and Imprese. Multiple concurrent or successive memberships for the same person–business pair are allowed; role succession closes one row and opens another. Concluded/revoked/archived rows are retained as current-state history of the relationship. Not a technical permission, not RLS, not Opportunità utilization.';

comment on column public.business_memberships.id is
  'Stable technical identity of this membership. Distinct from person_id and business_id. Not a public brand identity.';

comment on column public.business_memberships.person_id is
  'Referenced Persona (public.profiles). Required. ON DELETE RESTRICT. No copy of personal attributes. Not a FK to auth.users.';

comment on column public.business_memberships.business_id is
  'Referenced Impresa (public.businesses). Required. ON DELETE RESTRICT. No copy of business sheet attributes. Does not alter Impresa lifecycle or publication.';

comment on column public.business_memberships.role_id is
  'Organizational role from public.business_membership_roles.code. Required. ON DELETE RESTRICT. Distinct from declared responsibilities, management authorization, and technical permissions. contact_referent does not imply uniqueness per Impresa; sheet_manager does not grant platform access or policies.';

comment on column public.business_memberships.editorial_status is
  'Editorial axis of the declaration: proposed | declared. Independent of relation, verification, contestation, and visibility.';

comment on column public.business_memberships.relation_status is
  'Relation axis: active (Logical in-corso) | suspended | concluded | revoked | archived. Independent of verification and contestation. Contestation does not auto-revoke.';

comment on column public.business_memberships.verification_status is
  'Ordinary verification axis of the membership: unverified | in_review | confirmed. Aggregate current axis, not a verified badge and not computed from future per-aspect verification rows. Contestation is not a value here.';

comment on column public.business_memberships.is_contested is
  'Contestation overlay (boolean). Independent of verification_status, relation_status, and visibility_status. Default false. Does not automatically change relation or verification axes.';

comment on column public.business_memberships.visibility_status is
  'Descriptive visibility axis: private | internal | editorial | public | historical. Not an RLS policy and not technical access. Contested presentation is driven by is_contested, not by a contested visibility literal.';

comment on column public.business_memberships.started_at is
  'Declared start date of the relationship (date). Nullable when uncertain. Not registration time (created_at).';

comment on column public.business_memberships.ended_at is
  'Declared end date of the relationship (date). Nullable while active or suspended. Required for concluded, revoked, and archived.';

comment on column public.business_memberships.cessation_reason is
  'Optional free-text note about cessation/revocation. Anti-blank when set. Not a closed motive vocabulary.';

comment on column public.business_memberships.contextual_notes is
  'Optional free-text contextual notes about the membership. Anti-blank when set. Not JSON and not a dump of other domains.';

comment on column public.business_memberships.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.business_memberships.updated_at is
  'Last update timestamp. Maintained by business_memberships_set_updated_at.';

create index bm_person_id_idx
  on public.business_memberships using btree (person_id);

create index bm_business_id_idx
  on public.business_memberships using btree (business_id);

create index bm_role_id_idx
  on public.business_memberships using btree (role_id);

create index bm_relation_status_idx
  on public.business_memberships using btree (relation_status);

alter table public.business_memberships enable row level security;

-- Defense in depth: no policies in M1.2. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.business_memberships from anon, authenticated;

create or replace function public.set_business_memberships_updated_at ()
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

comment on function public.set_business_memberships_updated_at () is
  'BEFORE UPDATE trigger function for public.business_memberships. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns or other axes.';

create trigger business_memberships_set_updated_at
before update on public.business_memberships
for each row
execute function public.set_business_memberships_updated_at ();
