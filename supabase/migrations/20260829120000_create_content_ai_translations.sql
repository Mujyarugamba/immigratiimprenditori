-- Public editorial AI translation cache.
-- Prepared on the working branch; not an authorization to apply on Production.

create table if not exists public.content_ai_translations (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  target_locale text not null,
  source_language_id bigint not null references public.languages(id) on delete restrict,
  source_fingerprint text not null,
  translated_title text not null,
  translated_subtitle text null,
  translated_abstract text null,
  translated_body text not null,
  provider text not null,
  model text not null,
  prompt_version text not null,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_ai_translations_target_locale_check
    check (target_locale in ('en', 'fr', 'es', 'de', 'ar', 'zh')),
  constraint content_ai_translations_title_not_blank
    check (length(btrim(translated_title)) > 0),
  constraint content_ai_translations_body_not_blank
    check (length(btrim(translated_body)) > 0),
  constraint content_ai_translations_fingerprint_not_blank
    check (length(btrim(source_fingerprint)) > 0),
  constraint content_ai_translations_provider_not_blank
    check (length(btrim(provider)) > 0),
  constraint content_ai_translations_model_not_blank
    check (length(btrim(model)) > 0),
  constraint content_ai_translations_prompt_version_not_blank
    check (length(btrim(prompt_version)) > 0),
  constraint content_ai_translations_content_locale_key
    unique (content_id, target_locale)
);

create trigger content_ai_translations_set_updated_at
before update on public.content_ai_translations
for each row execute function public.set_updated_at();

create or replace function public.enforce_content_ai_translation_locale()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_content_language_id bigint;
  v_source_code text;
begin
  select language_id
    into v_content_language_id
  from public.contents
  where id = new.content_id;

  if v_content_language_id is null then
    raise exception 'CONTENT_AI_TRANSLATION_UNKNOWN_CONTENT'
      using errcode = '23514';
  end if;

  if new.source_language_id <> v_content_language_id then
    raise exception 'CONTENT_AI_TRANSLATION_SOURCE_LANGUAGE_MISMATCH'
      using errcode = '23514';
  end if;

  select code
    into v_source_code
  from public.languages
  where id = new.source_language_id;

  if v_source_code is null then
    raise exception 'CONTENT_AI_TRANSLATION_UNKNOWN_SOURCE_LANGUAGE'
      using errcode = '23514';
  end if;

  if new.target_locale = v_source_code then
    raise exception 'CONTENT_AI_TRANSLATION_TARGET_EQUALS_SOURCE'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger content_ai_translations_enforce_locale
before insert or update on public.content_ai_translations
for each row execute function public.enforce_content_ai_translation_locale();

comment on table public.content_ai_translations is
  'Cached OpenAI translations of already-public editorial contents. Original contents rows are never overwritten. Anon/authenticated may SELECT only when the source content is public; writes are service-role only.';

comment on function public.enforce_content_ai_translation_locale() is
  'Rejects AI translation rows whose source_language_id differs from the source content language or whose target_locale matches that source language.';

alter table public.content_ai_translations enable row level security;

revoke all on table public.content_ai_translations from public, anon, authenticated;
revoke all on function public.enforce_content_ai_translation_locale() from public, anon, authenticated;

grant select on table public.content_ai_translations to anon, authenticated;
grant select, insert, update on table public.content_ai_translations to service_role;

create policy content_ai_translations_public_read
on public.content_ai_translations
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.contents c
    where c.id = content_id
      and c.editorial_status = 'ready'
      and c.publication_status = 'published'
      and c.visibility_status = 'public'
      and c.archived_at is null
  )
);

-- Explicit deny surface: no INSERT/UPDATE/DELETE policies for anon/authenticated.
-- Service-role writes use the canonical privileged server client and bypass RLS.
