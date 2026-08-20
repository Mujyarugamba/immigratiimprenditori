-- Private development fixtures for functional QA only. Never publish automatically.

insert into public.contents (
  owner_person_id,
  owner_business_id,
  owned_by_editorial,
  type_code,
  primary_category_code,
  language_id,
  title,
  subtitle,
  abstract,
  body,
  body_format,
  slug,
  source_label,
  editorial_status,
  publication_status,
  visibility_status,
  is_featured
)
select
  null,
  null,
  true,
  'analysis',
  'entrepreneurship',
  1,
  '[QA] Scheda funzionale contenuto editoriale',
  'Fixture privata per controllare rendering, relazioni e metadati.',
  'Contenuto di sviluppo non destinato alla pubblicazione, usato per verificare autore, tag, geografia, Markdown e collegamento a un indicatore dell’Osservatorio.',
  E'## Obiettivo QA\n\nQuesta è una **fixture privata di sviluppo**. Non contiene informazioni editoriali reali e non deve essere pubblicata.\n\n## Elementi da verificare\n\n- rendering Markdown e gerarchia dei titoli;\n- autore e attribuzione;\n- tag e geografia;\n- collegamento a un indicatore dell’Osservatorio;\n- link esterno di prova: [example.org](https://example.org/);\n- comportamento su schermi piccoli con paragrafi più lunghi.\n\n> Questo riquadro serve a verificare anche la resa delle citazioni Markdown.\n\n## Tabella di prova\n\n| Controllo | Stato atteso |\n| --- | --- |\n| Visibilità pubblica | No |\n| Sitemap | No |\n| Autore | Visibile solo alla redazione |\n| Indicatore collegato | Sì |\n\n## Nota finale\n\nSe questa scheda compare a un utente anonimo, il test deve essere considerato fallito.',
  'markdown',
  'qa-scheda-funzionale-contenuto-editoriale',
  'Fixture QA interna — non pubblicare',
  'draft',
  'unpublished',
  'private',
  false
where not exists (
  select 1 from public.contents where slug='qa-scheda-funzionale-contenuto-editoriale'
);

insert into public.content_authors (
  content_id, role_kind, display_label, is_primary, sort_order, attribution_note
)
select c.id, 'author', 'Redazione QA — non pubblicare', true, 0, 'Fixture tecnica privata'
from public.contents c
where c.slug='qa-scheda-funzionale-contenuto-editoriale'
  and not exists (
    select 1 from public.content_authors a
    where a.content_id=c.id and a.display_label='Redazione QA — non pubblicare'
  );

insert into public.content_tag_links (content_id, tag_code, sort_order)
select c.id, t.tag_code, t.sort_order
from public.contents c
cross join (values
  ('migration-and-business'::text, 0),
  ('digitalization'::text, 1),
  ('territories'::text, 2)
) as t(tag_code, sort_order)
where c.slug='qa-scheda-funzionale-contenuto-editoriale'
on conflict (content_id, tag_code) do nothing;

insert into public.content_geographies (content_id, territory_id, relation_kind, sort_order)
select c.id, g.id, 'focus', 0
from public.contents c
join public.geo_territories g on g.slug='lombardia' and g.is_active=true
where c.slug='qa-scheda-funzionale-contenuto-editoriale'
  and not exists (
    select 1 from public.content_geographies cg
    where cg.content_id=c.id and cg.territory_id=g.id and cg.relation_kind='focus'
  );

insert into public.content_observatory_indicator_links (
  content_id, indicator_id, relation_kind, sort_order
)
select c.id, i.id, 'context', 0
from public.contents c
join public.observatory_indicators i on i.slug='imprese-straniere-registrate'
where c.slug='qa-scheda-funzionale-contenuto-editoriale'
on conflict (content_id, indicator_id, relation_kind) do nothing;

insert into public.events (
  owner_person_id,
  owner_business_id,
  owned_by_editorial,
  type_code,
  title,
  summary,
  description,
  delivery_mode,
  audience_kind,
  audience_note,
  nature_label,
  economic_kind,
  economic_note,
  external_organization_label,
  editorial_status,
  publication_status,
  visibility_status,
  external_source_code,
  external_id,
  external_natural_key,
  acquisition_fingerprint,
  editorial_internal_notes
)
select
  null,
  null,
  true,
  'conference',
  '[QA] Evento ibrido per test funzionale',
  'Fixture privata per verificare date, fuso orario, modalità ibrida, registrazione e geografia.',
  'Evento esclusivamente tecnico. Serve a controllare la resa di un’edizione futura ibrida con luogo fisico, collegamento online e registrazione. Non rappresenta un evento reale e non deve essere pubblicato.',
  'hybrid',
  'both',
  'Pubblico QA interno',
  'Test funzionale',
  'free',
  'Nessun pagamento: fixture privata',
  'QA interno — non pubblicare',
  'draft',
  'unpublished',
  'private',
  'qa',
  'qa-event-hybrid-2026',
  'qa:functional-event:hybrid:2026',
  'qa-functional-event-hybrid-2026-v1',
  'Fixture di sviluppo. Non usare come fonte editoriale.'
where not exists (
  select 1 from public.events
  where external_natural_key='qa:functional-event:hybrid:2026'
);

insert into public.event_editions (
  event_id,
  title,
  starts_at,
  ends_at,
  timezone,
  all_day,
  delivery_mode,
  venue_label,
  address_text,
  city_text,
  country_ref,
  online_reference,
  occurrence_status,
  registration_status,
  registration_access,
  registration_required,
  capacity,
  registration_opens_at,
  registration_deadline
)
select
  e.id,
  'Edizione QA ottobre 2026',
  '2026-10-15 09:00:00+02'::timestamptz,
  '2026-10-15 17:30:00+02'::timestamptz,
  'Europe/Rome',
  false,
  'hybrid',
  'Spazio QA Milano',
  'Indirizzo di test — non reale',
  'Milano',
  'IT',
  'https://example.org/qa-event',
  'scheduled',
  'open',
  'registration_required',
  true,
  42,
  '2026-09-01 09:00:00+02'::timestamptz,
  '2026-10-14 18:00:00+02'::timestamptz
from public.events e
where e.external_natural_key='qa:functional-event:hybrid:2026'
  and not exists (
    select 1 from public.event_editions ee
    where ee.event_id=e.id and ee.title='Edizione QA ottobre 2026'
  );

insert into public.event_geographies (event_id, territory_id, relation_kind, sort_order)
select e.id, g.id, 'focus', 0
from public.events e
join public.geo_territories g on g.slug='lombardia' and g.is_active=true
where e.external_natural_key='qa:functional-event:hybrid:2026'
  and not exists (
    select 1 from public.event_geographies eg
    where eg.event_id=e.id and eg.territory_id=g.id and eg.relation_kind='focus'
  );
