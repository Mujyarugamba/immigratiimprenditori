-- M1.1 — create collaborations
-- Implements Aggregate Root Collaborazione of Collaborazioni:
--   public.collaborations
-- (docs/architecture/migrations/collaborazioni-migration-plan.md §13 M1.1;
--  docs/architecture/physical/domain-mapping/collaborazioni.md §7–§13, §19–§22;
--  docs/architecture/logical/collaborazioni.md §8.0, §15.A–§15.D).
--
-- Scope of this unit only: declarative collaboration sheet AR, ternary ownership,
-- registered_by Persona, promoter XOR on AR, closed form_code, content fields,
-- slug, four-axis lifecycle, optional Appartenenza snapshot, indexes, updated_at,
-- RLS, REVOKE.
-- Explicitly out of scope: participants table; interest/candidacy/invite/match;
-- relational phase; catalogs/seed; organizations/professionals/opportunities/
-- markets/events/services/contents FK; account/auth.users owner; membership owned;
-- policies; GRANT; can_* columns; metadata/JSON; Storage/CRM/HR.

create table public.collaborations (
  id uuid not null default gen_random_uuid (),
  owner_person_id uuid null,
  owner_business_id uuid null,
  owned_by_editorial boolean not null default false,
  registered_by_person_id uuid not null,
  promoter_person_id uuid null,
  promoter_business_id uuid null,
  acting_membership_id uuid null,
  acting_title_snapshot text null,
  form_code text not null,
  title text not null,
  object_text text not null,
  purpose_text text not null,
  description text null,
  sought_counterpart_text text null,
  external_context_label text null,
  context_area_text text null,
  slug text not null,
  availability_starts_on date null,
  availability_ends_on date null,
  editorial_status text not null default 'draft',
  operational_status text not null default 'open',
  outcome_status text not null default 'not_reported',
  published_at timestamptz null,
  withdrawn_at timestamptz null,
  closed_at timestamptz null,
  cancelled_at timestamptz null,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collaborations_pkey primary key (id),
  constraint collaborations_owner_person_id_fkey
    foreign key (owner_person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint collaborations_owner_business_id_fkey
    foreign key (owner_business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint collaborations_registered_by_person_id_fkey
    foreign key (registered_by_person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint collaborations_promoter_person_id_fkey
    foreign key (promoter_person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint collaborations_promoter_business_id_fkey
    foreign key (promoter_business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint collaborations_acting_membership_id_fkey
    foreign key (acting_membership_id)
    references public.business_memberships (id)
    on update no action
    on delete set null,
  constraint collaborations_slug_key unique (slug),
  constraint collaborations_ownership_ternary_check check (
    (
      owner_person_id is not null
      and owner_business_id is null
      and owned_by_editorial = false
    )
    or (
      owner_person_id is null
      and owner_business_id is not null
      and owned_by_editorial = false
    )
    or (
      owner_person_id is null
      and owner_business_id is null
      and owned_by_editorial = true
    )
  ),
  constraint collaborations_promoter_xor_check check (
    (
      promoter_person_id is not null
      and promoter_business_id is null
    )
    or (
      promoter_person_id is null
      and promoter_business_id is not null
    )
  ),
  constraint collaborations_form_code_check check (
    form_code in (
      'ricerca',
      'offerta',
      'partnership',
      'progetto',
      'disponibilita_aperta'
    )
  ),
  constraint collaborations_editorial_status_check check (
    editorial_status in ('draft', 'published', 'withdrawn')
  ),
  constraint collaborations_operational_status_check check (
    operational_status in ('open', 'closed', 'cancelled')
  ),
  constraint collaborations_outcome_status_check check (
    outcome_status in (
      'not_reported',
      'positive',
      'negative',
      'partial'
    )
  ),
  constraint collaborations_publication_gates_check check (
    (
      editorial_status = 'draft'
      and published_at is null
      and withdrawn_at is null
    )
    or (
      editorial_status = 'published'
      and published_at is not null
      and withdrawn_at is null
    )
    or (
      editorial_status = 'withdrawn'
      and withdrawn_at is not null
    )
  ),
  constraint collaborations_operational_gates_check check (
    (
      operational_status = 'open'
      and closed_at is null
      and cancelled_at is null
    )
    or (
      operational_status = 'closed'
      and closed_at is not null
    )
    or (
      operational_status = 'cancelled'
      and cancelled_at is not null
    )
  ),
  constraint collaborations_availability_dates_check check (
    availability_ends_on is null
    or availability_starts_on is null
    or availability_ends_on >= availability_starts_on
  ),
  constraint collaborations_acting_membership_context_check check (
    acting_membership_id is null
    or owner_business_id is not null
    or promoter_business_id is not null
  ),
  constraint collaborations_title_not_blank_check check (
    length(btrim(title)) > 0
  ),
  constraint collaborations_object_text_not_blank_check check (
    length(btrim(object_text)) > 0
  ),
  constraint collaborations_purpose_text_not_blank_check check (
    length(btrim(purpose_text)) > 0
  ),
  constraint collaborations_slug_not_blank_check check (
    length(btrim(slug)) > 0
  ),
  constraint collaborations_slug_format_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint collaborations_description_check check (
    description is null
    or length(btrim(description)) > 0
  ),
  constraint collaborations_sought_counterpart_text_check check (
    sought_counterpart_text is null
    or length(btrim(sought_counterpart_text)) > 0
  ),
  constraint collaborations_external_context_label_check check (
    external_context_label is null
    or length(btrim(external_context_label)) > 0
  ),
  constraint collaborations_context_area_text_check check (
    context_area_text is null
    or length(btrim(context_area_text)) > 0
  ),
  constraint collaborations_acting_title_snapshot_check check (
    acting_title_snapshot is null
    or length(btrim(acting_title_snapshot)) > 0
  )
);

comment on table public.collaborations is
  'Aggregate Root of Collaborazioni: declarative collaboration sheet (search/offer/proposal). Owned by Collaborazioni. Not a contract, membership, delegation, active relation, application permission, Opportunity, OffertaDiServizio, Organization, Account, or Storage. Owner is exactly one of Persona (profiles), Impresa (businesses), or Redazione (owned_by_editorial). Exactly one promoter (Persona XOR Impresa) on the AR. Indicated counterparts live in collaboration_participants. Interest/matching/relational phase deferred. Appartenenza title usage is optional historical snapshot only (V10).';

comment on column public.collaborations.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Autonomous identity (PF5); not derived from participants or Opportunity.';

comment on column public.collaborations.owner_person_id is
  'Owning Persona when titolare is a person. Mutually exclusive with owner_business_id and owned_by_editorial. FK profiles ON DELETE RESTRICT. Not auth.users. Not Account.';

comment on column public.collaborations.owner_business_id is
  'Owning Impresa when titolare is a business. Mutually exclusive with owner_person_id and owned_by_editorial. FK businesses ON DELETE RESTRICT. Does not prove representation or create membership.';

comment on column public.collaborations.owned_by_editorial is
  'When true, titolare is platform Redazione (no auth.users, no organizations as owner). Requires both owner_* NULL. Default false. Not Contesto Organizzazione.';

comment on column public.collaborations.registered_by_person_id is
  'Persona who materially registered the sheet. NOT NULL. FK profiles ON DELETE RESTRICT. Conceptually distinct from owner and promoter; not Account; does not grant application rights.';

comment on column public.collaborations.promoter_person_id is
  'Promoter Persona when the declaration promoter is a person. XOR with promoter_business_id (exactly one promoter). FK profiles ON DELETE RESTRICT. Local role promotore; not membership.';

comment on column public.collaborations.promoter_business_id is
  'Promoter Impresa when the declaration promoter is a business. XOR with promoter_person_id (exactly one promoter). FK businesses ON DELETE RESTRICT. Does not prove representation.';

comment on column public.collaborations.acting_membership_id is
  'Optional historical reference to Appartenenza (business_memberships) used when acting for an Impresa (D23). ON DELETE SET NULL. Does not own membership, roles, or representation (V10). Legitimacy remains derived from Appartenenze.';

comment on column public.collaborations.acting_title_snapshot is
  'Optional opaque title label snapshot at registration time. Nullable; blank rejected when present. Survives membership SET NULL. Informative/historical only.';

comment on column public.collaborations.form_code is
  'Closed declaration form: ricerca | offerta | partnership | progetto | disponibilita_aperta. CHECK only; no catalog table; no seed.';

comment on column public.collaborations.title is
  'Required non-blank sheet title.';

comment on column public.collaborations.object_text is
  'Required non-blank object of the collaboration declaration.';

comment on column public.collaborations.purpose_text is
  'Required non-blank purpose of the collaboration declaration.';

comment on column public.collaborations.description is
  'Optional longer description. Nullable; blank rejected when present.';

comment on column public.collaborations.sought_counterpart_text is
  'Optional descriptive sought counterpart criteria (not a named participant). Nullable; blank rejected when present.';

comment on column public.collaborations.external_context_label is
  'Optional opaque label for unregistered external context/entity. Not a FK to organizations. Nullable; blank rejected when present.';

comment on column public.collaborations.context_area_text is
  'Optional descriptive territorial/sector context text. Not a Markets/Eventi FK. Nullable; blank rejected when present.';

comment on column public.collaborations.slug is
  'Required globally unique URL slug. Pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$. Not blank.';

comment on column public.collaborations.availability_starts_on is
  'Optional availability window start. No default expiry.';

comment on column public.collaborations.availability_ends_on is
  'Optional availability window end. When both dates set, must be >= availability_starts_on.';

comment on column public.collaborations.editorial_status is
  'Editorial axis: draft | published | withdrawn. Default draft. Maps Logical bozza/pubblicata/ritirata. Independent from operational/outcome/archive within DDL gates.';

comment on column public.collaborations.operational_status is
  'Operational axis: open | closed | cancelled. Default open. Maps Logical aperta/chiusa/annullata. Not relational-phase Avviata/Attiva.';

comment on column public.collaborations.outcome_status is
  'Outcome axis: not_reported | positive | negative | partial. Default not_reported. Independent from editorial/operational axes.';

comment on column public.collaborations.published_at is
  'Publication timestamp. Required when editorial_status = published; NULL when draft; NULL when published per gate with withdrawn_at NULL.';

comment on column public.collaborations.withdrawn_at is
  'Withdrawal timestamp. Required when editorial_status = withdrawn. Must be NULL when published.';

comment on column public.collaborations.closed_at is
  'Operational close timestamp. Required when operational_status = closed.';

comment on column public.collaborations.cancelled_at is
  'Operational cancel timestamp. Required when operational_status = cancelled.';

comment on column public.collaborations.archived_at is
  'Archive timestamp. NULL means corrente; set means archiviata. Independent from withdrawn/closed.';

comment on column public.collaborations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.collaborations.updated_at is
  'Last update timestamp. Maintained by collaborations_set_updated_at.';

create index collaborations_owner_person_id_idx
  on public.collaborations (owner_person_id)
  where owner_person_id is not null;

create index collaborations_owner_business_id_idx
  on public.collaborations (owner_business_id)
  where owner_business_id is not null;

create index collaborations_owned_by_editorial_idx
  on public.collaborations (owned_by_editorial)
  where owned_by_editorial;

create index collaborations_form_code_idx
  on public.collaborations (form_code);

create index collaborations_editorial_status_idx
  on public.collaborations (editorial_status);

create index collaborations_operational_status_idx
  on public.collaborations (operational_status);

create index collaborations_published_at_idx
  on public.collaborations (published_at)
  where editorial_status = 'published';

create index collaborations_archived_at_idx
  on public.collaborations (archived_at);

create index collaborations_promoter_person_id_idx
  on public.collaborations (promoter_person_id)
  where promoter_person_id is not null;

create index collaborations_promoter_business_id_idx
  on public.collaborations (promoter_business_id)
  where promoter_business_id is not null;

create index collaborations_registered_by_person_id_idx
  on public.collaborations (registered_by_person_id);

alter table public.collaborations enable row level security;

revoke all on table public.collaborations from public;
revoke all on table public.collaborations from anon, authenticated;

create or replace function public.set_collaborations_updated_at ()
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

comment on function public.set_collaborations_updated_at () is
  'BEFORE UPDATE trigger function for public.collaborations. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables. No cross-domain sync.';

create trigger collaborations_set_updated_at
before update on public.collaborations
for each row
execute function public.set_collaborations_updated_at ();
