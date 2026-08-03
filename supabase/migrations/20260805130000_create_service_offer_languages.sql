-- M3.2 — create service offer languages
-- Implements owned delivery/source/target language links for OffertaDiServizio:
--   public.service_offer_languages
-- (docs/architecture/migrations/servizi-migration-plan.md §12 M3.2;
--  docs/architecture/physical/domain-mapping/servizi.md §15, §23–§26;
--  docs/architecture/logical/servizi.md §17).
--
-- Explicitly out of scope: professional_operational_languages; DV4
-- profile_language_services; seed; policies; GRANT.

create table public.service_offer_languages (
  id uuid not null default gen_random_uuid (),
  service_offer_id uuid not null,
  language_id bigint not null,
  usage_role text not null default 'delivery',
  pair_group_id uuid null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_offer_languages_pkey primary key (id),
  constraint service_offer_languages_service_offer_id_fkey
    foreign key (service_offer_id)
    references public.service_offers (id)
    on update no action
    on delete cascade,
  constraint service_offer_languages_language_id_fkey
    foreign key (language_id)
    references public.languages (id)
    on update no action
    on delete restrict,
  constraint service_offer_languages_uidx unique (
    service_offer_id,
    language_id,
    usage_role
  ),
  constraint svc_offer_lang_usage_role_check check (
    usage_role in ('delivery', 'source', 'target', 'support')
  ),
  constraint svc_offer_lang_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.service_offer_languages is
  'Owned Entity of service_offers: languages of delivery or linguistic pairs for an OffertaDiServizio. language_id is bigint FK to languages. Distinct from professional_operational_languages and DV4 profile_language_services. Optional pair_group_id links source/target rows of one pair.';

comment on column public.service_offer_languages.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.service_offer_languages.service_offer_id is
  'Owning Aggregate Root (public.service_offers). NOT NULL. ON DELETE CASCADE.';

comment on column public.service_offer_languages.language_id is
  'FK to public.languages(id) bigint. ON DELETE RESTRICT.';

comment on column public.service_offer_languages.usage_role is
  'Closed role: delivery | source | target | support. Default delivery. Part of UNIQUE key.';

comment on column public.service_offer_languages.pair_group_id is
  'Optional UUID grouping source/target rows of one linguistic pair. Not enforced as a pair completeness CHECK in cycle 1.';

comment on column public.service_offer_languages.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.service_offer_languages.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.service_offer_languages.updated_at is
  'Last update timestamp. Maintained by service_offer_languages_set_updated_at.';

create index svc_offer_lang_service_offer_id_idx
  on public.service_offer_languages (service_offer_id);

create index svc_offer_lang_language_id_idx
  on public.service_offer_languages (language_id);

alter table public.service_offer_languages enable row level security;

revoke all on table public.service_offer_languages from public;
revoke all on table public.service_offer_languages from anon, authenticated;

create or replace function public.set_service_offer_languages_updated_at ()
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

comment on function public.set_service_offer_languages_updated_at () is
  'BEFORE UPDATE trigger function for public.service_offer_languages. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger service_offer_languages_set_updated_at
before update on public.service_offer_languages
for each row
execute function public.set_service_offer_languages_updated_at ();
