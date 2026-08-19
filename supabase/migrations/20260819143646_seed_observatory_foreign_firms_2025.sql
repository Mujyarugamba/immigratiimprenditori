begin;

do $$
declare
  v_source_id uuid;
  v_indicator_id uuid;
begin
  select id into v_source_id
  from public.observatory_statistical_sources
  where external_identifier='mlps:futurae:imprenditoria-straniera:2025h1'
  order by created_at
  limit 1;

  if v_source_id is null then
    insert into public.observatory_statistical_sources (
      name, producer_name, publication_title, url, external_identifier,
      edition_label, source_published_on, methodology_note, lifecycle_status
    ) values (
      'Futurae — Imprenditoria straniera in Italia, I semestre 2025',
      'InfoCamere / Unioncamere / Ministero del Lavoro e delle Politiche Sociali',
      'L’imprenditoria straniera in Italia. Una lettura attraverso i dati del Registro Imprese. I semestre 2025',
      'https://www.lavoro.gov.it/documenti/limprenditoria-straniera-italia-una-lettura-attraverso-i-dati-del-registro-imprese',
      'mlps:futurae:imprenditoria-straniera:2025h1',
      'I semestre 2025 — dati aggiornati al 30 giugno 2025',
      date '2025-09-25',
      'Registro Imprese. InfoCamere definisce “straniera” l’impresa in cui la partecipazione di persone fisiche non nate in Italia è complessivamente superiore al 50%, mediando quote di partecipazione e cariche amministrative secondo la tipologia d’impresa. Il dato non equivale al numero di imprenditori immigrati e non va confrontato direttamente con indicatori LFS di lavoro autonomo.',
      'active'
    ) returning id into v_source_id;
  end if;

  select id into v_indicator_id
  from public.observatory_indicators
  where code='OBS-IT-FOR-FIRM-REG';

  if v_indicator_id is null then
    insert into public.observatory_indicators (
      code, slug, title, description, purpose_text, methodology_summary,
      value_nature, unit_code, periodicity, operational_status,
      publication_status, published_at
    ) values (
      'OBS-IT-FOR-FIRM-REG',
      'imprese-straniere-registrate',
      'Imprese straniere registrate',
      'Numero di imprese classificate come straniere e iscritte al Registro Imprese alla data di riferimento.',
      'Misurare lo stock camerale di imprese straniere con una definizione esplicita e separata dagli indicatori sul lavoro autonomo delle persone.',
      'Fonte Registro Imprese elaborata da InfoCamere nel programma Futurae. “Straniera” indica una partecipazione di persone fisiche non nate in Italia complessivamente superiore al 50%, mediando quote e cariche amministrative secondo la tipologia d’impresa. È un indicatore di imprese registrate, non un conteggio di persone né una misura LFS di self-employment.',
      'count','units','point_in_time','active','published',now()
    ) returning id into v_indicator_id;
  end if;

  if not exists (
    select 1 from public.observatory_indicator_values
    where indicator_id=v_indicator_id
      and source_id=v_source_id
      and period_start=date '2025-06-30'
      and period_end=date '2025-06-30'
      and territory_level='italy'
      and territory_code='IT'
  ) then
    insert into public.observatory_indicator_values (
      indicator_id, source_id, numeric_value, period_start, period_end,
      status, quality_code, territory_level, territory_code, territory_label,
      methodology_note, published_at
    ) values (
      v_indicator_id,v_source_id,678004,date '2025-06-30',date '2025-06-30',
      'final','official','italy','IT','Italia',
      'Dato ufficiale Registro Imprese al 30 giugno 2025. Valore riferito alle imprese registrate classificate come straniere secondo la definizione InfoCamere; non alle sole imprese attive e non al numero di imprenditori.',
      now()
    );
  end if;

  if not exists (
    select 1 from public.observatory_indicator_values
    where indicator_id=v_indicator_id
      and source_id=v_source_id
      and period_start=date '2025-06-30'
      and period_end=date '2025-06-30'
      and territory_level='region'
      and territory_code='IT-25'
  ) then
    insert into public.observatory_indicator_values (
      indicator_id, source_id, numeric_value, period_start, period_end,
      status, quality_code, territory_level, territory_code, territory_label,
      methodology_note, published_at
    ) values (
      v_indicator_id,v_source_id,135249,date '2025-06-30',date '2025-06-30',
      'final','official','region','IT-25','Lombardia',
      'Dato regionale della Fig. 9 del medesimo report InfoCamere/Futurae al 30 giugno 2025. Stessa definizione del valore nazionale: imprese registrate classificate come straniere.',
      now()
    );
  end if;
end;
$$;

commit;
