-- Create public.training_offer_languages: which business languages
-- (public.languages) a training offer is actually available in, and HOW.
--
-- This distinction is the core reason this table exists: it must never be
-- possible to represent "corso in arabo" as a single flat fact when in
-- reality only some translated handouts exist. delivery_level makes the
-- level of language support explicit and auditable.

create table public.training_offer_languages (
  training_offer_id uuid not null references public.training_offers (id) on delete cascade,
  language_id bigint not null references public.languages (id) on delete restrict,
  delivery_level text not null,
  notes text,
  created_at timestamptz not null default now(),
  primary key (training_offer_id, language_id),
  constraint training_offer_languages_delivery_level_check check (
    delivery_level in (
      'full_course',
      'trainer_language',
      'interpreter_supported',
      'materials_only',
      'basic_support'
    )
  )
);

comment on table public.training_offer_languages is
  'Business languages a training offer is available in, each qualified by delivery_level so a full course taught in the language is never confused with merely having translated materials.';

comment on column public.training_offer_languages.delivery_level is
  'How the language is actually supported: full_course (the entire course is delivered in this language), trainer_language (the trainer speaks and teaches directly in this language), interpreter_supported (the course runs with an interpreter/mediator), materials_only (materials are translated but teaching happens in another language), basic_support (limited linguistic assistance only).';

comment on column public.training_offer_languages.notes is
  'Optional free-form clarification, e.g. which materials are translated or which interpreter arrangement is used.';

-- The primary key already indexes training_offer_id (as its leading
-- column), covering "languages available for a given offer". The reverse
-- lookup ("offers available in a given language", optionally filtered by
-- delivery_level, e.g. "corsi in arabo con formatore arabofono") needs its
-- own index since language_id is not a leading column of the PK.
create index training_offer_languages_language_level_idx on public.training_offer_languages using btree (language_id, delivery_level);

alter table public.training_offer_languages enable row level security;

-- 1. Publicly readable only when the underlying offer is itself publicly
-- visible (active offer, active provider profile, active course type,
-- active delivery mode) and the language is active.
create policy "Public can view languages of active training offers"
  on public.training_offer_languages
  for select
  to public
  using (
    exists (
      select 1
      from public.training_offers o
      join public.profiles p on p.id = o.provider_profile_id
      join public.training_course_types t on t.id = o.course_type_id
      where
        o.id = training_offer_languages.training_offer_id
        and o.is_active = true
        and p.is_active = true
        and t.is_active = true
        and (
          o.delivery_mode_id is null
          or exists (
            select 1
            from public.training_delivery_modes m
            where
              m.id = o.delivery_mode_id
              and m.is_active = true
          )
        )
    )
    and exists (
      select 1
      from public.languages l
      where
        l.id = training_offer_languages.language_id
        and l.is_active = true
    )
  );

-- 2. The provider can always see the languages of their own offers, even
-- when the offer or profile is not otherwise publicly visible.
create policy "Providers can view languages of their own training offers"
  on public.training_offer_languages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_languages.training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
  );

-- 3. A provider may add a language only to their own offer, and only an
-- active language.
create policy "Providers can add languages to their own training offers"
  on public.training_offer_languages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
    and exists (
      select 1
      from public.languages l
      where
        l.id = language_id
        and l.is_active = true
    )
  );

-- 4. A provider may update only the language rows of their own offers.
create policy "Providers can update languages of their own training offers"
  on public.training_offer_languages
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_languages.training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
    and exists (
      select 1
      from public.languages l
      where
        l.id = language_id
        and l.is_active = true
    )
  );

-- 5. A provider may remove a language only from their own offer.
create policy "Providers can remove languages from their own training offers"
  on public.training_offer_languages
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_languages.training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
  );

grant select on public.training_offer_languages to anon;

grant select, insert, update, delete on public.training_offer_languages to authenticated;
