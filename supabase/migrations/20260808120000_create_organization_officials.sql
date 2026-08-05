-- M3.1 — create organization officials
-- Implements owned representatives / contacts of Organizzazioni:
--   public.organization_officials
-- (docs/architecture/migrations/organizzazioni-migration-plan.md §10 M3.1;
--  docs/architecture/physical/domain-mapping/organizzazioni.md §13, §16–§19;
--  docs/architecture/logical/organizzazioni.md).
--
-- Scope of this unit only: minimal representatives and referents owned by AR.
-- Subject is Persona XOR opaque display_label (exactly one). Not membership,
-- not CRM address book, not HR/org chart, not Impresa as official subject,
-- not Professional Profile required, not auth.users.

create table public.organization_officials (
  id uuid not null default gen_random_uuid (),
  organization_id uuid not null,
  role_kind text not null,
  person_id uuid null,
  display_label text null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  email text null,
  phone text null,
  valid_from date null,
  valid_to date null,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_officials_pkey primary key (id),
  constraint organization_officials_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update no action
    on delete cascade,
  constraint organization_officials_person_id_fkey
    foreign key (person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint organization_officials_role_kind_check check (
    role_kind in (
      'legal_representative',
      'president',
      'director',
      'secretary',
      'spokesperson',
      'board_member',
      'public_contact',
      'operational_contact',
      'other'
    )
  ),
  constraint organization_officials_subject_xor_check check (
    (
      person_id is not null
      and display_label is null
    )
    or (
      person_id is null
      and display_label is not null
      and length(btrim(display_label)) > 0
    )
  ),
  constraint organization_officials_sort_order_check check (
    sort_order >= 0
  ),
  constraint organization_officials_display_label_check check (
    display_label is null
    or length(btrim(display_label)) > 0
  ),
  constraint organization_officials_email_check check (
    email is null
    or length(btrim(email)) > 0
  ),
  constraint organization_officials_phone_check check (
    phone is null
    or length(btrim(phone)) > 0
  ),
  constraint organization_officials_note_check check (
    note is null
    or length(btrim(note)) > 0
  ),
  constraint organization_officials_validity_dates_check check (
    valid_to is null
    or valid_from is null
    or valid_to >= valid_from
  )
);

create unique index organization_officials_primary_uidx
  on public.organization_officials (organization_id)
  where is_primary;

create unique index organization_officials_person_role_uidx
  on public.organization_officials (organization_id, role_kind, person_id)
  where person_id is not null;

comment on table public.organization_officials is
  'Owned Entity of organizations: minimal representatives and referents (legal_representative, president, director, secretary, spokesperson, board_member, public_contact, operational_contact, other). Subject is Persona (profiles) XOR opaque display_label (exactly one; never both; never neither). Not membership/Appartenenze, not CRM, not HR/org chart, not Impresa as official subject, not Professional Profile required, not auth.users. ON DELETE CASCADE from organizations.';

comment on column public.organization_officials.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.organization_officials.organization_id is
  'Owning Aggregate Root (public.organizations). NOT NULL. ON DELETE CASCADE.';

comment on column public.organization_officials.role_kind is
  'Closed role: legal_representative | president | director | secretary | spokesperson | board_member | public_contact | operational_contact | other.';

comment on column public.organization_officials.person_id is
  'Persona subject when the official is a platform person. Mutually exclusive with display_label (XOR stretto). ON DELETE RESTRICT. Not auth.users.';

comment on column public.organization_officials.display_label is
  'Opaque external label when no Persona is linked. Mutually exclusive with person_id (XOR stretto). Required non-blank when person_id is NULL. Not a FK to Impresa or Organizzazioni.';

comment on column public.organization_officials.is_primary is
  'Primary official flag. At most one primary per organization (partial UNIQUE). Default false.';

comment on column public.organization_officials.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.organization_officials.email is
  'Optional declarative contact email. Blank rejected when present. Not CRM.';

comment on column public.organization_officials.phone is
  'Optional declarative contact phone. Blank rejected when present. Not CRM.';

comment on column public.organization_officials.valid_from is
  'Optional validity start date of the official role.';

comment on column public.organization_officials.valid_to is
  'Optional validity end date. When both dates set, must be >= valid_from.';

comment on column public.organization_officials.note is
  'Optional free-text note. Nullable; blank rejected when present.';

comment on column public.organization_officials.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.organization_officials.updated_at is
  'Last update timestamp. Maintained by organization_officials_set_updated_at.';

create index organization_officials_organization_id_idx
  on public.organization_officials (organization_id);

create index organization_officials_person_id_idx
  on public.organization_officials (person_id)
  where person_id is not null;

create index organization_officials_primary_idx
  on public.organization_officials (organization_id)
  where is_primary;

alter table public.organization_officials enable row level security;

revoke all on table public.organization_officials from public;
revoke all on table public.organization_officials from anon, authenticated;

create or replace function public.set_organization_officials_updated_at ()
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

comment on function public.set_organization_officials_updated_at () is
  'BEFORE UPDATE trigger function for public.organization_officials. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger organization_officials_set_updated_at
before update on public.organization_officials
for each row
execute function public.set_organization_officials_updated_at ();
