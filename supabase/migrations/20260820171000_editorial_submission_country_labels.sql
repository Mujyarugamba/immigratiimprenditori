begin;

alter table public.editorial_inbox_items
  add column origin_country_label text null check (origin_country_label is null or length(btrim(origin_country_label)) > 0),
  add column destination_country_label text null check (destination_country_label is null or length(btrim(destination_country_label)) > 0);

alter table public.editorial_submissions
  add column origin_country_label text null check (origin_country_label is null or length(btrim(origin_country_label)) > 0),
  add column destination_country_label text null check (destination_country_label is null or length(btrim(destination_country_label)) > 0);

drop function public.submit_editorial_contribution(text,text,text,text,text,text,text,text,text,text,boolean,boolean);

create function public.submit_editorial_contribution(
  p_submission_kind text,
  p_submitter_name text,
  p_submitter_email text,
  p_contribution_text text,
  p_title text default null,
  p_submitter_phone text default null,
  p_organization_name text default null,
  p_origin_country_code text default null,
  p_destination_country_code text default null,
  p_original_url text default null,
  p_consent_contact boolean default true,
  p_consent_publication boolean default false,
  p_origin_country_label text default null,
  p_destination_country_label text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inbox_id uuid;
  v_item_kind text;
  v_origin text;
  v_destination text;
  v_origin_label text;
  v_destination_label text;
begin
  if p_submission_kind not in ('story','interview','event','research','publication','other') then raise exception 'invalid submission kind'; end if;
  if length(btrim(coalesce(p_submitter_name, ''))) = 0 then raise exception 'submitter name is required'; end if;
  if length(btrim(coalesce(p_submitter_email, ''))) < 4 or position('@' in p_submitter_email) <= 1 then raise exception 'valid submitter email is required'; end if;
  if length(btrim(coalesce(p_contribution_text, ''))) = 0 then raise exception 'contribution text is required'; end if;

  v_origin := nullif(upper(btrim(p_origin_country_code)), '');
  v_destination := nullif(upper(btrim(p_destination_country_code)), '');
  v_origin_label := nullif(btrim(p_origin_country_label), '');
  v_destination_label := nullif(btrim(p_destination_country_label), '');

  if v_origin is not null and v_origin !~ '^[A-Z]{2}$' then raise exception 'invalid origin country'; end if;
  if v_destination is not null and v_destination !~ '^[A-Z]{2}$' then raise exception 'invalid destination country'; end if;

  v_item_kind := case p_submission_kind
    when 'story' then 'user_testimony'
    when 'interview' then 'interview_proposal'
    when 'event' then 'event'
    when 'research' then 'academic_paper'
    when 'publication' then 'publication_submission'
    else 'other'
  end;

  insert into public.editorial_inbox_items (
    source_kind,item_kind,title,original_url,source_label,summary,
    origin_country_code,destination_country_code,origin_country_label,destination_country_label,
    priority,status
  ) values (
    'public_submission',v_item_kind,
    coalesce(nullif(btrim(p_title), ''),'Proposta editoriale — ' || p_submission_kind),
    nullif(btrim(p_original_url), ''),'Segnalazione pubblica',left(btrim(p_contribution_text),2000),
    v_origin,v_destination,v_origin_label,v_destination_label,'normal','new'
  ) returning id into v_inbox_id;

  insert into public.editorial_submissions (
    inbox_item_id,submission_kind,submitter_name,submitter_email,submitter_phone,
    organization_name,contribution_text,consent_contact,consent_publication,
    origin_country_label,destination_country_label
  ) values (
    v_inbox_id,p_submission_kind,btrim(p_submitter_name),btrim(p_submitter_email),
    nullif(btrim(p_submitter_phone), ''),nullif(btrim(p_organization_name), ''),
    btrim(p_contribution_text),p_consent_contact,p_consent_publication,
    v_origin_label,v_destination_label
  );

  return v_inbox_id;
end;
$$;

revoke all on function public.submit_editorial_contribution(
  text,text,text,text,text,text,text,text,text,text,boolean,boolean,text,text
) from public;
grant execute on function public.submit_editorial_contribution(
  text,text,text,text,text,text,text,text,text,text,boolean,boolean,text,text
) to anon, authenticated;

commit;
