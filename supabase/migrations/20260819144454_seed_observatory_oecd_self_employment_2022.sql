begin;

do $$
declare
  v_source_id uuid;
  v_indicator_id uuid;
begin
  select id into v_source_id
  from public.observatory_statistical_sources
  where external_identifier='oecd:imo2024:table4.1'
  order by created_at
  limit 1;

  if v_source_id is null then
    insert into public.observatory_statistical_sources (
      name, producer_name, publication_title, url, external_identifier,
      edition_label, source_published_on, methodology_note, lifecycle_status
    ) values (
      'OECD — Self-employment rate by place of birth, 2022',
      'OECD',
      'International Migration Outlook 2024 — Migrant entrepreneurship in OECD countries, Table 4.1',
      'https://www.oecd.org/en/publications/international-migration-outlook-2024_50b0353e-en/full-report/migrant-entrepreneurship-in-oecd-countries_72f44494.html',
      'oecd:imo2024:table4.1',
      'International Migration Outlook 2024 — Table 4.1, reference year 2022',
      null,
      'Self-employment rate among the employed population, by place of birth. Foreign-born and native-born are population groups, not citizenship categories. For the selected European countries the chapter relies on EU-LFS 2022; the OECD average covers 37 countries. The indicator is not a count of registered firms and should not be compared as the same measure with InfoCamere Registro Imprese data.',
      'active'
    ) returning id into v_source_id;
  end if;

  select id into v_indicator_id
  from public.observatory_indicators
  where code='OBS-OECD-SELF-BIRTH-RATE';

  if v_indicator_id is null then
    insert into public.observatory_indicators (
      code, slug, title, description, purpose_text, methodology_summary,
      value_nature, unit_code, periodicity, operational_status,
      publication_status, published_at
    ) values (
      'OBS-OECD-SELF-BIRTH-RATE',
      'tasso-lavoro-autonomo-per-luogo-nascita',
      'Tasso di lavoro autonomo per luogo di nascita',
      'Quota della popolazione occupata che lavora in proprio, distinta tra persone nate all’estero e persone nate nel Paese.',
      'Confrontare con una misura omogenea la diffusione del lavoro autonomo tra nati all’estero e nati nel Paese, mostrando le differenze tra Paesi senza trasformarle in una classifica di qualità imprenditoriale.',
      'OECD International Migration Outlook 2024, Tabella 4.1. Tasso di self-employment sulla popolazione occupata, anno 2022, percentuale. FB = foreign-born / nati all’estero; NB = native-born / nati nel Paese. La misura riguarda persone occupate e luogo di nascita: non coincide con cittadinanza né con il numero di imprese registrate.',
      'percentage','percent','annual','active','published',now()
    ) returning id into v_indicator_id;
  end if;

  insert into public.observatory_indicator_values (
    indicator_id, source_id, numeric_value, period_start, period_end,
    status, quality_code, territory_level, territory_code, territory_label,
    country_code, country_label, methodology_note, published_at
  )
  select
    v_indicator_id,
    v_source_id,
    x.numeric_value,
    date '2022-01-01',
    date '2022-12-31',
    'final',
    'official',
    'other',
    x.territory_code,
    x.territory_label,
    x.group_code,
    x.group_label,
    case
      when x.territory_code='OECD37' then 'OECD Table 4.1, average across 37 OECD countries; gruppo ' || case when x.group_code='FB' then 'foreign-born.' else 'native-born.' end
      else 'OECD Table 4.1, self-employment rate 2022; gruppo ' || case when x.group_code='FB' then 'foreign-born.' else 'native-born.' end
    end,
    now()
  from (
    values
      ('CZE','Cechia','FB','Nati all’estero',19.8::numeric),
      ('CZE','Cechia','NB','Nati nel Paese',15.0::numeric),
      ('ESP','Spagna','FB','Nati all’estero',17.2::numeric),
      ('ESP','Spagna','NB','Nati nel Paese',13.6::numeric),
      ('PRT','Portogallo','FB','Nati all’estero',15.1::numeric),
      ('PRT','Portogallo','NB','Nati nel Paese',11.9::numeric),
      ('NLD','Paesi Bassi','FB','Nati all’estero',16.0::numeric),
      ('NLD','Paesi Bassi','NB','Nati nel Paese',14.1::numeric),
      ('FRA','Francia','FB','Nati all’estero',12.7::numeric),
      ('FRA','Francia','NB','Nati nel Paese',10.9::numeric),
      ('DEU','Germania','FB','Nati all’estero',7.8::numeric),
      ('DEU','Germania','NB','Nati nel Paese',7.3::numeric),
      ('ITA','Italia','FB','Nati all’estero',13.7::numeric),
      ('ITA','Italia','NB','Nati nel Paese',19.8::numeric),
      ('OECD37','Media OECD (37 Paesi)','FB','Nati all’estero',13.8::numeric),
      ('OECD37','Media OECD (37 Paesi)','NB','Nati nel Paese',13.4::numeric)
  ) as x(territory_code,territory_label,group_code,group_label,numeric_value)
  where not exists (
    select 1
    from public.observatory_indicator_values v
    where v.indicator_id=v_indicator_id
      and v.source_id=v_source_id
      and v.period_start=date '2022-01-01'
      and v.period_end=date '2022-12-31'
      and v.territory_code=x.territory_code
      and v.country_code=x.group_code
  );
end;
$$;

commit;
