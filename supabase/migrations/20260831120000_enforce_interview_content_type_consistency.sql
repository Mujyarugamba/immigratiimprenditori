-- Keep editorial interview contents and workflow rows semantically aligned.
-- Prepared on the working branch; not an authorization to apply on Production.

create or replace function public.enforce_interview_workflow_content_type()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_type_code text;
  v_owned_by_editorial boolean;
begin
  select c.type_code, c.owned_by_editorial
    into v_type_code, v_owned_by_editorial
  from public.contents c
  where c.id = new.content_id;

  if v_type_code is distinct from 'interview'
     or v_owned_by_editorial is distinct from true then
    raise exception 'INTERVIEW_WORKFLOW_REQUIRES_EDITORIAL_INTERVIEW_CONTENT'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_interview_workflow_content_type() from public, anon, authenticated;

create trigger content_interview_workflow_enforce_content_type
before insert or update of content_id on public.content_interview_workflow
for each row execute function public.enforce_interview_workflow_content_type();

create or replace function public.prevent_interview_content_type_detach()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.type_code = 'interview'
     and new.type_code is distinct from 'interview'
     and exists (
       select 1
       from public.content_interview_workflow w
       where w.content_id = old.id
     ) then
    raise exception 'INTERVIEW_CONTENT_TYPE_IMMUTABLE_AFTER_WORKFLOW'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_interview_content_type_detach() from public, anon, authenticated;

create trigger contents_prevent_interview_type_detach
before update of type_code on public.contents
for each row execute function public.prevent_interview_content_type_detach();

create or replace function public.ensure_interview_workflow_for_editorial_content()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.owned_by_editorial and new.type_code = 'interview' then
    insert into public.content_interview_workflow (content_id, workflow_status, source_origin)
    values (new.id, 'candidate', 'editorial')
    on conflict (content_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.ensure_interview_workflow_for_editorial_content() from public, anon, authenticated;

create trigger contents_ensure_interview_workflow_after_insert
after insert on public.contents
for each row execute function public.ensure_interview_workflow_for_editorial_content();

create trigger contents_ensure_interview_workflow_after_type_update
after update of type_code, owned_by_editorial on public.contents
for each row execute function public.ensure_interview_workflow_for_editorial_content();

comment on function public.enforce_interview_workflow_content_type() is
  'Rejects interview workflow rows that are not attached to an editorial content whose type_code is interview.';
comment on function public.prevent_interview_content_type_detach() is
  'Prevents changing an interview content to another type while its workflow row exists.';
comment on function public.ensure_interview_workflow_for_editorial_content() is
  'Ensures editorial contents of type interview have a candidate/editorial workflow row, including direct SQL/API writes.';
