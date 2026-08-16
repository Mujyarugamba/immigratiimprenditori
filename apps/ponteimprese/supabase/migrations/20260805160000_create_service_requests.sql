-- M4.1 — create service requests
-- Implements Aggregate Root RichiestaDiServizio of Servizi:
--   public.service_requests
-- (docs/architecture/migrations/servizi-migration-plan.md §13 M4.1;
--  docs/architecture/physical/domain-mapping/servizi.md §8, §19–§23, §25–§26;
--  docs/architecture/logical/servizi.md §6.2, §10, §13–§15).
--
-- Explicitly out of scope: provider_*; source_*; availability_status;
-- matching; candidature; ManifestazioneDiInteresse; marketplace; payments;
-- owned territories/languages/sectors (M5); seed; policies; GRANT.

create table public.service_requests (
  id uuid not null default gen_random_uuid (),
  owner_person_id uuid null,
  owner_business_id uuid null,
  context_opportunity_id uuid null,
  category_code text not null,
  title text not null,
  summary text null,
  description text not null,
  nature_label text null,
  delivery_mode text not null default 'unspecified',
  audience_kind text not null default 'both',
  specialization_note text null,
  language_direction text null,
  economic_kind text not null default 'none',
  economic_band_code text null,
  economic_note text null,
  editorial_status text not null default 'draft',
  publication_status text not null default 'unpublished',
  process_status text not null default 'open',
  visibility_status text not null default 'private',
  urgency_kind text null,
  expires_at date null,
  published_at timestamptz null,
  withdrawn_at timestamptz null,
  archived_at timestamptz null,
  external_organization_label text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_requests_pkey primary key (id),
  constraint service_requests_owner_person_id_fkey
    foreign key (owner_person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint service_requests_owner_business_id_fkey
    foreign key (owner_business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint service_requests_context_opportunity_id_fkey
    foreign key (context_opportunity_id)
    references public.opportunities (id)
    on update no action
    on delete set null,
  constraint service_requests_category_code_fkey
    foreign key (category_code)
    references public.service_categories (code)
    on update cascade
    on delete restrict,
  constraint service_requests_economic_band_code_fkey
    foreign key (economic_band_code)
    references public.service_economic_bands (code)
    on update cascade
    on delete restrict,
  constraint svc_requests_owner_xor_check check (
    (
      owner_person_id is not null
      and owner_business_id is null
    )
    or (
      owner_person_id is null
      and owner_business_id is not null
    )
  ),
  constraint svc_requests_title_not_blank_check check (
    length(btrim(title)) > 0
  ),
  constraint svc_requests_description_not_blank_check check (
    length(btrim(description)) > 0
  ),
  constraint svc_requests_delivery_mode_check check (
    delivery_mode in ('in_person', 'remote', 'hybrid', 'unspecified')
  ),
  constraint svc_requests_audience_kind_check check (
    audience_kind in ('persons', 'businesses', 'both')
  ),
  constraint svc_requests_language_direction_check check (
    language_direction is null
    or language_direction in ('mono', 'bidirectional', 'unspecified')
  ),
  constraint svc_requests_economic_kind_check check (
    economic_kind in (
      'none',
      'free',
      'on_request',
      'indicative_band',
      'discounted'
    )
  ),
  constraint svc_requests_economic_band_gate_check check (
    (
      economic_kind = 'indicative_band'
      and economic_band_code is not null
    )
    or (
      economic_kind <> 'indicative_band'
      and economic_band_code is null
    )
  ),
  constraint svc_requests_editorial_status_check check (
    editorial_status in ('draft', 'ready')
  ),
  constraint svc_requests_publication_status_check check (
    publication_status in ('unpublished', 'published', 'withdrawn')
  ),
  constraint svc_requests_process_status_check check (
    process_status in (
      'open',
      'in_evaluation',
      'concluded',
      'expired'
    )
  ),
  constraint svc_requests_visibility_status_check check (
    visibility_status in ('private', 'public')
  ),
  constraint svc_requests_urgency_kind_check check (
    urgency_kind is null
    or urgency_kind in ('low', 'medium', 'high')
  ),
  constraint svc_requests_publication_gates_check check (
    (
      publication_status = 'published'
      and published_at is not null
      and editorial_status = 'ready'
    )
    or (
      publication_status = 'withdrawn'
      and withdrawn_at is not null
    )
    or (
      publication_status = 'unpublished'
      and published_at is null
      and withdrawn_at is null
    )
  ),
  constraint svc_requests_nature_label_check check (
    nature_label is null
    or length(btrim(nature_label)) > 0
  ),
  constraint svc_requests_specialization_note_check check (
    specialization_note is null
    or length(btrim(specialization_note)) > 0
  ),
  constraint svc_requests_external_org_label_check check (
    external_organization_label is null
    or length(btrim(external_organization_label)) > 0
  ),
  constraint svc_requests_economic_note_check check (
    economic_note is null
    or length(btrim(economic_note)) > 0
  ),
  constraint svc_requests_summary_check check (
    summary is null
    or length(btrim(summary)) > 0
  )
);

comment on table public.service_requests is
  'Aggregate Root of Servizi: structured RichiestaDiServizio. Owned by Servizi. Distinct from Opportunità, Collaborazioni, and OffertaDiServizio. No provider/source columns, no matching, candidature, ManifestazioneDiInteresse, marketplace, or payments. Owner is exactly one of Persona or Impresa. process_status replaces offer availability_status.';

comment on column public.service_requests.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Stable identity of the request sheet.';

comment on column public.service_requests.owner_person_id is
  'Owning/requesting Persona. XOR with owner_business_id. FK profiles ON DELETE RESTRICT.';

comment on column public.service_requests.owner_business_id is
  'Owning/requesting Impresa. XOR with owner_person_id. FK businesses ON DELETE RESTRICT.';

comment on column public.service_requests.context_opportunity_id is
  'Optional opaque context reference to opportunities. ON DELETE SET NULL. Not ownership of Opportunità.';

comment on column public.service_requests.category_code is
  'FK to service_categories(code). Required. ON UPDATE CASCADE; ON DELETE RESTRICT.';

comment on column public.service_requests.title is
  'Required non-blank human-facing title. Homonyms allowed (no UNIQUE).';

comment on column public.service_requests.summary is
  'Optional short synopsis. Nullable; blank rejected when present.';

comment on column public.service_requests.description is
  'Required non-blank substantial description of the need. Not editorial CMS content.';

comment on column public.service_requests.nature_label is
  'Optional free-text nature label.';

comment on column public.service_requests.delivery_mode is
  'Preferred delivery mode: in_person | remote | hybrid | unspecified. Default unspecified.';

comment on column public.service_requests.audience_kind is
  'Self-description of requester audience kind: persons | businesses | both. Default both.';

comment on column public.service_requests.specialization_note is
  'Optional free-text vertical refinement.';

comment on column public.service_requests.language_direction is
  'Optional linguistic direction: mono | bidirectional | unspecified.';

comment on column public.service_requests.economic_kind is
  'Descriptive budget classification only: none | free | on_request | indicative_band | discounted. Not a binding price.';

comment on column public.service_requests.economic_band_code is
  'FK to service_economic_bands when economic_kind = indicative_band; otherwise NULL.';

comment on column public.service_requests.economic_note is
  'Optional free-text economic note. Not an amount or invoice.';

comment on column public.service_requests.editorial_status is
  'Editorial axis: draft | ready. Default draft.';

comment on column public.service_requests.publication_status is
  'Publication axis: unpublished | published | withdrawn. Default unpublished.';

comment on column public.service_requests.process_status is
  'Declarative process axis: open | in_evaluation | concluded | expired. Default open. Not assignment/matching.';

comment on column public.service_requests.visibility_status is
  'Substantial visibility: private | public. Default private. Not an RLS policy.';

comment on column public.service_requests.urgency_kind is
  'Optional urgency: low | medium | high.';

comment on column public.service_requests.expires_at is
  'Optional descriptive deadline date. Not an automatic expiry job in cycle 1.';

comment on column public.service_requests.published_at is
  'Publication timestamp. Required when publication_status = published.';

comment on column public.service_requests.withdrawn_at is
  'Withdrawal timestamp. Required when publication_status = withdrawn.';

comment on column public.service_requests.archived_at is
  'Archive timestamp. NULL means current.';

comment on column public.service_requests.external_organization_label is
  'Optional informative external organization label. Not a FK to Organizzazioni.';

comment on column public.service_requests.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.service_requests.updated_at is
  'Last update timestamp. Maintained by service_requests_set_updated_at.';

create index svc_requests_owner_person_id_idx
  on public.service_requests (owner_person_id)
  where owner_person_id is not null;

create index svc_requests_owner_business_id_idx
  on public.service_requests (owner_business_id)
  where owner_business_id is not null;

create index svc_requests_category_code_idx
  on public.service_requests (category_code);

create index svc_requests_publication_status_idx
  on public.service_requests (publication_status);

create index svc_requests_published_idx
  on public.service_requests (publication_status)
  where publication_status = 'published';

create index svc_requests_process_status_idx
  on public.service_requests (process_status);

create index svc_requests_expires_at_idx
  on public.service_requests (expires_at)
  where expires_at is not null;

create index svc_requests_archived_at_idx
  on public.service_requests (archived_at)
  where archived_at is not null;

alter table public.service_requests enable row level security;

revoke all on table public.service_requests from public;
revoke all on table public.service_requests from anon, authenticated;

create or replace function public.set_service_requests_updated_at ()
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

comment on function public.set_service_requests_updated_at () is
  'BEFORE UPDATE trigger function for public.service_requests. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger service_requests_set_updated_at
before update on public.service_requests
for each row
execute function public.set_service_requests_updated_at ();
