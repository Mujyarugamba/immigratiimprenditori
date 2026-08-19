begin;

do $$
declare
  v_it_lang bigint;
  v_info_id uuid;
  v_oecd_id uuid;
  v_oecd_territory uuid;
begin
  select id into v_it_lang from public.languages where code='it' and is_active=true limit 1;
  if v_it_lang is null then raise exception 'Italian language missing'; end if;

  select id into v_oecd_territory from public.geo_territories where slug='oecd' limit 1;
  if v_oecd_territory is null then
    insert into public.geo_territories(country_code,parent_id,level_kind,code,name,slug,is_active)
    values(null,null,'supranational','OECD','OCSE / OECD','oecd',true)
    returning id into v_oecd_territory;
  end if;

  select id into v_info_id from public.contents where slug='imprenditoria-straniera-italia-primo-semestre-2025' limit 1;
  if v_info_id is null then
    insert into public.contents(
      owned_by_editorial,type_code,language_id,title,subtitle,abstract,body,body_format,
      slug,source_url,source_label,editorial_status,publication_status,visibility_status,
      is_featured,published_at
    ) values (
      true,'research_report',v_it_lang,
      'L’imprenditoria straniera in Italia — I semestre 2025',
      'Una lettura attraverso i dati del Registro Imprese',
      'Rapporto InfoCamere realizzato nell’ambito di Futurae con dati del Registro Imprese al 30 giugno 2025. Analizza consistenza, dinamica, forma giuridica, settori e distribuzione territoriale delle imprese classificate come straniere.',
      'Scheda editoriale del rapporto ufficiale InfoCamere/Futurae. Il documento misura le imprese registrate classificate come straniere secondo la metodologia camerale: la partecipazione di persone fisiche non nate in Italia è complessivamente superiore al 50%, considerando quote e cariche amministrative secondo la tipologia d’impresa. Questa misura non equivale al numero di imprenditori immigrati e va tenuta distinta dagli indicatori sul lavoro autonomo delle persone.',
      'markdown',
      'imprenditoria-straniera-italia-primo-semestre-2025',
      'https://www.lavoro.gov.it/documenti/limprenditoria-straniera-italia-una-lettura-attraverso-i-dati-del-registro-imprese',
      'InfoCamere / Unioncamere / Ministero del Lavoro e delle Politiche Sociali',
      'ready','published','public',true,now()
    ) returning id into v_info_id;
  end if;

  insert into public.content_report_metadata(
    content_id,report_kind,publisher_name,source_publication_year,source_publication_date,
    external_identifier,document_url
  ) values (
    v_info_id,'institutional_report',
    'InfoCamere / Unioncamere / Ministero del Lavoro e delle Politiche Sociali',
    2025,date '2025-09-25','mlps:futurae:imprenditoria-straniera:2025h1',
    'https://www.lavoro.gov.it/documenti/limprenditoria-straniera-italia-una-lettura-attraverso-i-dati-del-registro-imprese'
  ) on conflict(content_id) do nothing;

  if not exists(select 1 from public.content_authors where content_id=v_info_id and display_label='InfoCamere') then
    insert into public.content_authors(content_id,role_kind,display_label,is_primary,sort_order,attribution_note)
    values(v_info_id,'curator','InfoCamere',true,0,'Rapporto curato da InfoCamere nell’ambito del progetto Futurae.');
  end if;

  if not exists(select 1 from public.content_geographies where content_id=v_info_id and country_code='IT' and relation_kind='focus') then
    insert into public.content_geographies(content_id,country_code,territory_id,relation_kind,sort_order)
    values(v_info_id,'IT',null,'focus',0);
  end if;

  insert into public.content_tag_links(content_id,tag_code,sort_order)
  select v_info_id,x.tag_code,x.sort_order
  from (values
    ('migration-and-business'::text,0),
    ('business-demography'::text,1),
    ('territories'::text,2)
  ) x(tag_code,sort_order)
  where not exists(
    select 1 from public.content_tag_links l where l.content_id=v_info_id and l.tag_code=x.tag_code
  );

  select id into v_oecd_id from public.contents where slug='oecd-migrant-entrepreneurship-2024' limit 1;
  if v_oecd_id is null then
    insert into public.contents(
      owned_by_editorial,type_code,language_id,title,subtitle,abstract,body,body_format,
      slug,source_url,source_label,editorial_status,publication_status,visibility_status,
      is_featured,published_at
    ) values (
      true,'research_report',v_it_lang,
      'Migrant entrepreneurship in OECD countries',
      'International Migration Outlook 2024 — capitolo sull’imprenditoria migrante',
      'Capitolo OECD che confronta il lavoro autonomo delle persone nate all’estero e nate nel Paese, la sua evoluzione e il contributo occupazionale dell’imprenditoria migrante nei Paesi OECD.',
      'Scheda editoriale del capitolo tematico dell’International Migration Outlook 2024. Il confronto usa il tasso di lavoro autonomo tra gli occupati per luogo di nascita. È una misura riferita alle persone, non alle imprese registrate. Per questo non viene sovrapposta ai dati camerali italiani. Il capitolo documenta forti differenze tra Paesi e distingue inoltre lavoro autonomo con e senza dipendenti.',
      'markdown',
      'oecd-migrant-entrepreneurship-2024',
      'https://www.oecd.org/en/publications/international-migration-outlook-2024_50b0353e-en/full-report/migrant-entrepreneurship-in-oecd-countries_72f44494.html',
      'OECD',
      'ready','published','public',true,now()
    ) returning id into v_oecd_id;
  end if;

  insert into public.content_report_metadata(
    content_id,report_kind,publisher_name,source_publication_year,source_publication_date,
    external_identifier,document_url
  ) values (
    v_oecd_id,'institutional_report','OECD',2024,null,
    'oecd:imo2024:migrant-entrepreneurship',
    'https://www.oecd.org/en/publications/international-migration-outlook-2024_50b0353e-en/full-report/migrant-entrepreneurship-in-oecd-countries_72f44494.html'
  ) on conflict(content_id) do nothing;

  if not exists(select 1 from public.content_authors where content_id=v_oecd_id and display_label='OECD') then
    insert into public.content_authors(content_id,role_kind,display_label,is_primary,sort_order,attribution_note)
    values(v_oecd_id,'author','OECD',true,0,'Fonte istituzionale del capitolo e dei dati comparativi.');
  end if;

  if not exists(select 1 from public.content_geographies where content_id=v_oecd_id and territory_id=v_oecd_territory and relation_kind='focus') then
    insert into public.content_geographies(content_id,country_code,territory_id,relation_kind,sort_order)
    values(v_oecd_id,null,v_oecd_territory,'focus',0);
  end if;

  insert into public.content_tag_links(content_id,tag_code,sort_order)
  select v_oecd_id,x.tag_code,x.sort_order
  from (values
    ('migration-and-business'::text,0),
    ('employment'::text,1),
    ('internationalization'::text,2),
    ('diaspora'::text,3)
  ) x(tag_code,sort_order)
  where not exists(
    select 1 from public.content_tag_links l where l.content_id=v_oecd_id and l.tag_code=x.tag_code
  );
end;
$$;

commit;
