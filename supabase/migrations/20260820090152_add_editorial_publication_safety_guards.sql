create or replace function public.guard_content_publication_safety()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_text text;
begin
  if new.publication_status <> 'published' or new.visibility_status <> 'public' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    raise exception 'publication_guard: create content as unpublished before publishing'
      using errcode = 'P0001';
  end if;

  if new.slug ~* '^qa-' or new.title ~* '^\[QA\]' then
    raise exception 'publication_guard: QA content cannot be published'
      using errcode = 'P0001';
  end if;

  v_text := concat_ws(' ', new.title, new.subtitle, new.abstract, new.body, new.source_label);

  if v_text ~* 'numero[[:space:]]+zero' then
    raise exception 'publication_guard: internal launch label detected'
      using errcode = 'P0001';
  end if;

  if v_text ~* '(NUMBER_ZERO_|BOZZA EDITORIALE|NON PUBBLICARE|Check prima della pubblicazione)' then
    raise exception 'publication_guard: internal editorial marker detected'
      using errcode = 'P0001';
  end if;

  if new.body ~ E'(^|\n)#[[:space:]]' then
    raise exception 'publication_guard: body contains an H1; use the title field instead'
      using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.content_authors a
    where a.content_id = new.id
  ) then
    raise exception 'publication_guard: at least one author is required'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

comment on function public.guard_content_publication_safety() is
  'Blocks publication of QA/internal editorial content, duplicate H1 bodies, internal launch labels and authorless content.';

revoke all on function public.guard_content_publication_safety() from public, anon, authenticated;

drop trigger if exists contents_publication_safety_guard on public.contents;
create trigger contents_publication_safety_guard
before insert or update of publication_status, visibility_status, title, subtitle, abstract, body, slug, source_label
on public.contents
for each row
execute function public.guard_content_publication_safety();

create or replace function public.guard_event_publication_safety()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.publication_status <> 'published' or new.visibility_status <> 'public' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    raise exception 'publication_guard: create event as unpublished before publishing'
      using errcode = 'P0001';
  end if;

  if new.title ~* '^\[QA\]'
     or coalesce(new.external_source_code, '') = 'qa'
     or coalesce(new.external_natural_key, '') like 'qa:%' then
    raise exception 'publication_guard: QA event cannot be published'
      using errcode = 'P0001';
  end if;

  if coalesce(new.editorial_internal_notes, '') ~* 'NON PUBBLICARE' then
    raise exception 'publication_guard: event contains an internal do-not-publish marker'
      using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.event_editions ee
    where ee.event_id = new.id
  ) then
    raise exception 'publication_guard: at least one event edition is required'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

comment on function public.guard_event_publication_safety() is
  'Blocks publication of QA/internal events and events without at least one edition.';

revoke all on function public.guard_event_publication_safety() from public, anon, authenticated;

drop trigger if exists events_publication_safety_guard on public.events;
create trigger events_publication_safety_guard
before insert or update of publication_status, visibility_status, title, external_source_code, external_natural_key, editorial_internal_notes
on public.events
for each row
execute function public.guard_event_publication_safety();
