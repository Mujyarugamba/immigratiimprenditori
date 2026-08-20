begin;

do $$
declare
  v_event_id uuid;
begin
  select id into v_event_id
  from public.events
  where external_natural_key='one-way-summit:2026'
  limit 1;

  if v_event_id is null then
    insert into public.events(
      owned_by_editorial,type_code,title,summary,description,delivery_mode,
      audience_kind,audience_note,nature_label,economic_kind,
      external_organization_label,editorial_status,publication_status,visibility_status,
      published_at,source_url,source_label,external_source_code,external_id,
      canonical_url,external_natural_key,acquired_at
    ) values (
      true,'conference','One Way Summit 2026',
      'Incontro internazionale a San Francisco dedicato agli immigrant founders, con imprenditori, investitori e policy leader.',
      'Evento annuale dedicato agli imprenditori immigrati nell’ecosistema startup statunitense. Il programma ufficiale prevede main stage, sessioni con esperti e una competizione internazionale per startup. La scheda riporta soltanto informazioni verificate sulla pagina ufficiale; programma, relatori e modalità di partecipazione possono essere aggiornati dall’organizzatore.',
      'in_presence','both',
      'Founder, investitori, operatori dell’ecosistema startup e policy leader interessati all’imprenditoria migrante.',
      'Imprenditoria migrante · startup · venture capital','unspecified',
      'One Way Ventures','ready','published','public',now(),
      'https://www.onewaysummit.com/','One Way Summit',
      'one-way-summit','2026','https://www.onewaysummit.com/',
      'one-way-summit:2026',now()
    ) returning id into v_event_id;
  end if;

  if not exists(
    select 1 from public.event_editions
    where event_id=v_event_id
      and starts_at='2026-10-28 00:00:00-07'::timestamptz
  ) then
    insert into public.event_editions(
      event_id,title,starts_at,ends_at,timezone,all_day,delivery_mode,
      venue_label,city_text,country_ref,occurrence_status,
      registration_status,registration_access,registration_required
    ) values (
      v_event_id,'One Way Summit 2026',
      '2026-10-28 00:00:00-07'::timestamptz,
      '2026-10-29 23:59:59-07'::timestamptz,
      'America/Los_Angeles',true,'in_presence',
      'San Francisco, CA','San Francisco','US','scheduled',
      'open','registration_required',true
    );
  end if;

  if not exists(
    select 1 from public.event_geographies
    where event_id=v_event_id and country_code='US' and relation_kind='focus'
  ) then
    insert into public.event_geographies(event_id,country_code,territory_id,relation_kind,sort_order)
    values(v_event_id,'US',null,'focus',0);
  end if;
end;
$$;

commit;
