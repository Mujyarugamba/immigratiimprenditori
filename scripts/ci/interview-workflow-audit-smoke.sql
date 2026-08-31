\set ON_ERROR_STOP on

-- Runs only against the ephemeral local Supabase stack.
do $$
declare
  v_content_id uuid;
  v_language_id bigint;
  v_type_code text;
  v_slug text := 'ci-interview-audit-' || replace(gen_random_uuid()::text, '-', '');
  v_count bigint;
  v_secret_note text := 'CI_PRIVATE_INTERVIEW_NOTE_MUST_NOT_BE_AUDITED';
begin
  select id into v_language_id
  from public.languages
  where is_active
  order by sort_order, id
  limit 1;

  select code into v_type_code
  from public.content_types
  where is_active
  order by sort_order, code
  limit 1;

  if v_language_id is null or v_type_code is null then
    raise exception 'INTERVIEW_AUDIT_SMOKE_MISSING_CATALOG';
  end if;

  insert into public.contents (
    owned_by_editorial,
    owner_person_id,
    owner_business_id,
    type_code,
    language_id,
    title,
    slug,
    body,
    editorial_status,
    publication_status,
    visibility_status,
    is_featured
  ) values (
    true,
    null,
    null,
    v_type_code,
    v_language_id,
    'CI interview audit fixture',
    v_slug,
    'Temporary local-only interview workflow audit fixture.',
    'draft',
    'unpublished',
    'private',
    false
  ) returning id into v_content_id;

  insert into public.content_interview_workflow (content_id)
  values (v_content_id);

  select count(*) into v_count
  from public.editorial_content_activity
  where content_id = v_content_id
    and changes ->> 'scope' = 'interview_workflow';

  if v_count <> 1 then
    raise exception 'INTERVIEW_AUDIT_CREATE_MISSING: %', v_count;
  end if;

  if not exists (
    select 1
    from public.editorial_content_activity
    where content_id = v_content_id
      and action = 'updated'
      and changes ->> 'scope' = 'interview_workflow'
      and changes -> 'fields' ? 'workflow_created'
      and changes #>> '{after_interview,workflow_status}' = 'candidate'
  ) then
    raise exception 'INTERVIEW_AUDIT_CREATE_PAYLOAD_INVALID';
  end if;

  update public.content_interview_workflow
  set workflow_status = 'contacted',
      contacted_at = now()
  where content_id = v_content_id;

  if not exists (
    select 1
    from public.editorial_content_activity
    where content_id = v_content_id
      and action = 'status_changed'
      and changes ->> 'scope' = 'interview_workflow'
      and changes -> 'fields' ? 'workflow_status'
      and changes -> 'fields' ? 'contacted_at'
      and changes #>> '{before_interview,workflow_status}' = 'candidate'
      and changes #>> '{after_interview,workflow_status}' = 'contacted'
  ) then
    raise exception 'INTERVIEW_AUDIT_STATUS_CHANGE_MISSING';
  end if;

  update public.content_interview_workflow
  set publication_consent_status = 'granted',
      publication_consent_at = now()
  where content_id = v_content_id;

  if not exists (
    select 1
    from public.editorial_content_activity
    where content_id = v_content_id
      and action = 'updated'
      and changes ->> 'scope' = 'interview_workflow'
      and changes -> 'fields' ? 'publication_consent_status'
      and changes -> 'fields' ? 'publication_consent_at'
      and changes #>> '{before_interview,publication_consent_status}' = 'pending'
      and changes #>> '{after_interview,publication_consent_status}' = 'granted'
      and changes #>> '{after_interview,publication_consent_at}' is not null
  ) then
    raise exception 'INTERVIEW_AUDIT_CONSENT_CHANGE_MISSING';
  end if;

  select count(*) into v_count
  from public.editorial_content_activity
  where content_id = v_content_id
    and changes ->> 'scope' = 'interview_workflow';

  if v_count <> 3 then
    raise exception 'INTERVIEW_AUDIT_UNEXPECTED_COUNT_BEFORE_NOTE: %', v_count;
  end if;

  update public.content_interview_workflow
  set internal_notes = v_secret_note
  where content_id = v_content_id;

  select count(*) into v_count
  from public.editorial_content_activity
  where content_id = v_content_id
    and changes ->> 'scope' = 'interview_workflow';

  if v_count <> 3 then
    raise exception 'INTERVIEW_AUDIT_INTERNAL_NOTE_CREATED_EVENT: %', v_count;
  end if;

  if exists (
    select 1
    from public.editorial_content_activity
    where content_id = v_content_id
      and changes::text like '%' || v_secret_note || '%'
  ) then
    raise exception 'INTERVIEW_AUDIT_INTERNAL_NOTE_LEAKED';
  end if;

  delete from public.contents where id = v_content_id;
  delete from public.editorial_content_activity where content_id = v_content_id;
end;
$$;

select 'INTERVIEW_WORKFLOW_AUDIT_SMOKE = PASS' as result;
