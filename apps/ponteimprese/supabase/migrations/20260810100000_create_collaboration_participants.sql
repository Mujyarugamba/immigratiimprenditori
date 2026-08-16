-- M2.1 — create collaboration participants
-- Implements owned indicated counterparts of Collaborazioni:
--   public.collaboration_participants
-- (docs/architecture/migrations/collaborazioni-migration-plan.md §14 M2.1;
--  docs/architecture/physical/domain-mapping/collaborazioni.md §14, §19–§22;
--  docs/architecture/logical/collaborazioni.md §6.2, §15.A).
--
-- Scope of this unit only: indicated counterparts 0..N owned by collaborations;
-- Persona XOR Impresa; fixed role_code indicated_counterpart; sort_order; note;
-- partial UNIQUE anti-duplication; indexes; updated_at; RLS; REVOKE.
-- Explicitly out of scope: promoter (lives on AR); external_label structured here;
-- organization_id; professional_id; account_id; interest/candidacy/invite/match;
-- catalogs/seed; policies; GRANT; cross-table promoter≠counterpart trigger;
-- contacts/email/phone; CRM; metadata/JSON.

create table public.collaboration_participants (
  id uuid not null default gen_random_uuid (),
  collaboration_id uuid not null,
  role_code text not null default 'indicated_counterpart',
  person_id uuid null,
  business_id uuid null,
  sort_order integer not null default 0,
  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collaboration_participants_pkey primary key (id),
  constraint collaboration_participants_collaboration_id_fkey
    foreign key (collaboration_id)
    references public.collaborations (id)
    on update no action
    on delete cascade,
  constraint collaboration_participants_person_id_fkey
    foreign key (person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint collaboration_participants_business_id_fkey
    foreign key (business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint collaboration_participants_role_code_check check (
    role_code = 'indicated_counterpart'
  ),
  constraint collaboration_participants_subject_xor_check check (
    (
      person_id is not null
      and business_id is null
    )
    or (
      person_id is null
      and business_id is not null
    )
  ),
  constraint collaboration_participants_sort_order_check check (
    sort_order >= 0
  ),
  constraint collaboration_participants_note_check check (
    note is null
    or length(btrim(note)) > 0
  )
);

create unique index collaboration_participants_person_uidx
  on public.collaboration_participants (collaboration_id, person_id)
  where person_id is not null;

create unique index collaboration_participants_business_uidx
  on public.collaboration_participants (collaboration_id, business_id)
  where business_id is not null;

comment on table public.collaboration_participants is
  'Owned Entity of collaborations: indicated counterparts only (role_code = indicated_counterpart). Subject is Persona XOR Impresa (exactly one). Not the promoter (promoter is on collaborations AR). Not membership/Appartenenze, not Organization participant, not Professional as subject type, not Account, not external_label row (external context stays on AR). ON DELETE CASCADE from collaborations. Promoter≠counterpart is an application invariant (no cross-table trigger).';

comment on column public.collaboration_participants.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.collaboration_participants.collaboration_id is
  'Owning Aggregate Root (public.collaborations). NOT NULL. ON DELETE CASCADE.';

comment on column public.collaboration_participants.role_code is
  'Local role. Cycle 1 fixed to indicated_counterpart only (CHECK + default). Not Appartenenza roles. Promoter is not stored in this table.';

comment on column public.collaboration_participants.person_id is
  'Persona counterpart when subject is a person. Mutually exclusive with business_id (XOR stretto). FK profiles ON DELETE RESTRICT. Not auth.users.';

comment on column public.collaboration_participants.business_id is
  'Impresa counterpart when subject is a business. Mutually exclusive with person_id (XOR stretto). FK businesses ON DELETE RESTRICT. Not Organization.';

comment on column public.collaboration_participants.sort_order is
  'Display/order weight within the collaboration. Default 0. Must be >= 0.';

comment on column public.collaboration_participants.note is
  'Optional short synthetic note. Nullable; blank rejected when present. Not CRM; not duplicated anagraphics.';

comment on column public.collaboration_participants.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.collaboration_participants.updated_at is
  'Last update timestamp. Maintained by collaboration_participants_set_updated_at.';

create index collaboration_participants_collaboration_id_sort_order_idx
  on public.collaboration_participants (collaboration_id, sort_order);

create index collaboration_participants_person_id_idx
  on public.collaboration_participants (person_id)
  where person_id is not null;

create index collaboration_participants_business_id_idx
  on public.collaboration_participants (business_id)
  where business_id is not null;

alter table public.collaboration_participants enable row level security;

revoke all on table public.collaboration_participants from public;
revoke all on table public.collaboration_participants from anon, authenticated;

create or replace function public.set_collaboration_participants_updated_at ()
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

comment on function public.set_collaboration_participants_updated_at () is
  'BEFORE UPDATE trigger function for public.collaboration_participants. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables. No cross-domain sync.';

create trigger collaboration_participants_set_updated_at
before update on public.collaboration_participants
for each row
execute function public.set_collaboration_participants_updated_at ();
