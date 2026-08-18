-- SPLIT-3B ImmigratiImprenditori deterministic local validation.
-- READ-ONLY validation after the isolated baseline cold start (00..03).

DO $$
DECLARE
  v bigint;
BEGIN
  SELECT count(*) INTO v
  FROM pg_catalog.pg_tables
  WHERE schemaname = 'public';
  IF v <> 29 THEN
    RAISE EXCEPTION 'SPLIT3 FAIL: expected 29 Immigrati public tables, found %', v;
  END IF;

  SELECT count(*) INTO v
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind IN ('r','p')
    AND c.relrowsecurity;
  IF v <> 29 THEN
    RAISE EXCEPTION 'SPLIT3 FAIL: expected RLS on 29 Immigrati tables, found %', v;
  END IF;

  SELECT count(*) INTO v
  FROM pg_catalog.pg_policies
  WHERE schemaname = 'public';
  IF v <> 57 THEN
    RAISE EXCEPTION 'SPLIT3 FAIL: expected 57 Immigrati RLS policies, found %', v;
  END IF;

  SELECT count(*) INTO v
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname='public'
    AND p.proname IN ('handle_new_user','access_provision_account','access_link_person','assign_application_role');
  IF v <> 4 THEN
    RAISE EXCEPTION 'SPLIT3 FAIL: expected 4 Auth-gate functions, found %', v;
  END IF;

  SELECT count(*) INTO v
  FROM pg_catalog.pg_trigger t
  JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid
  JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  JOIN pg_catalog.pg_proc p ON p.oid=t.tgfoid
  JOIN pg_catalog.pg_namespace pn ON pn.oid=p.pronamespace
  WHERE n.nspname='auth'
    AND c.relname='users'
    AND t.tgname='on_auth_user_created'
    AND pn.nspname='public'
    AND p.proname='handle_new_user'
    AND NOT t.tgisinternal;
  IF v <> 1 THEN
    RAISE EXCEPTION 'SPLIT3 FAIL: expected one auth.users -> public.handle_new_user trigger, found %', v;
  END IF;

  SELECT count(*) INTO v
  FROM pg_catalog.pg_constraint con
  JOIN pg_catalog.pg_class child ON child.oid = con.conrelid
  JOIN pg_catalog.pg_namespace child_ns ON child_ns.oid = child.relnamespace
  JOIN pg_catalog.pg_class parent ON parent.oid = con.confrelid
  JOIN pg_catalog.pg_namespace parent_ns ON parent_ns.oid = parent.relnamespace
  WHERE con.contype = 'f'
    AND child_ns.nspname = 'public'
    AND parent_ns.nspname NOT IN ('public','auth');
  IF v <> 0 THEN
    RAISE EXCEPTION 'SPLIT3 FAIL: found % unexpected cross-schema FKs', v;
  END IF;

  SELECT count(*) INTO v FROM public.languages;
  IF v <> 30 THEN RAISE EXCEPTION 'SPLIT3 FAIL: languages expected 30, found %', v; END IF;

  SELECT count(*) INTO v FROM public.business_sectors;
  IF v <> 21 THEN RAISE EXCEPTION 'SPLIT3 FAIL: business_sectors expected 21, found %', v; END IF;

  SELECT count(*) INTO v FROM public.content_types;
  IF v <> 11 THEN RAISE EXCEPTION 'SPLIT3 FAIL: content_types expected 11, found %', v; END IF;

  SELECT count(*) INTO v FROM public.content_categories;
  IF v <> 9 THEN RAISE EXCEPTION 'SPLIT3 FAIL: content_categories expected 9, found %', v; END IF;

  SELECT count(*) INTO v FROM public.content_tags;
  IF v <> 0 THEN RAISE EXCEPTION 'SPLIT3 FAIL: content_tags expected 0, found %', v; END IF;

  SELECT count(*) INTO v FROM public.contents;
  IF v <> 18 THEN RAISE EXCEPTION 'SPLIT3 FAIL: contents expected 18, found %', v; END IF;

  SELECT count(*) INTO v FROM public.contents WHERE publication_status = 'published';
  IF v <> 17 THEN RAISE EXCEPTION 'SPLIT3 FAIL: published contents expected 17, found %', v; END IF;

  SELECT count(*) INTO v FROM public.contents WHERE owner_person_id IS NOT NULL;
  IF v <> 0 THEN RAISE EXCEPTION 'SPLIT3 FAIL: contents with local person owner expected 0, found %', v; END IF;

  SELECT count(*) INTO v FROM public.event_types;
  IF v <> 10 THEN RAISE EXCEPTION 'SPLIT3 FAIL: event_types expected 10, found %', v; END IF;

  SELECT count(*) INTO v FROM public.events;
  IF v <> 0 THEN RAISE EXCEPTION 'SPLIT3 FAIL: events expected 0, found %', v; END IF;

  SELECT count(*) INTO v FROM public.observatory_indicators;
  IF v <> 1 THEN RAISE EXCEPTION 'SPLIT3 FAIL: observatory_indicators expected 1, found %', v; END IF;

  SELECT count(*) INTO v FROM public.observatory_statistical_sources;
  IF v <> 1 THEN RAISE EXCEPTION 'SPLIT3 FAIL: observatory_statistical_sources expected 1, found %', v; END IF;

  SELECT count(*) INTO v FROM public.observatory_indicator_values;
  IF v <> 6 THEN RAISE EXCEPTION 'SPLIT3 FAIL: observatory_indicator_values expected 6, found %', v; END IF;

  SELECT
      (SELECT count(*) FROM public.content_authors)
    + (SELECT count(*) FROM public.content_event_links)
    + (SELECT count(*) FROM public.content_market_links)
    + (SELECT count(*) FROM public.content_opportunity_links)
    + (SELECT count(*) FROM public.content_relations)
    + (SELECT count(*) FROM public.content_service_links)
    + (SELECT count(*) FROM public.content_subject_links)
    + (SELECT count(*) FROM public.content_tag_links)
    + (SELECT count(*) FROM public.event_editions)
    + (SELECT count(*) FROM public.event_languages)
    + (SELECT count(*) FROM public.event_markets)
    + (SELECT count(*) FROM public.event_organizers)
    + (SELECT count(*) FROM public.event_registrations)
    + (SELECT count(*) FROM public.event_sessions)
    + (SELECT count(*) FROM public.event_speakers)
  INTO v;
  IF v <> 0 THEN
    RAISE EXCEPTION 'SPLIT3 FAIL: expected current content/event link/runtime tables to be empty, found % total rows', v;
  END IF;
END
$$;

SELECT 'SPLIT3_IMMIGRATI_LOCAL_00_03' AS check_name, 'PASS' AS result;

SELECT 'public_tables' AS metric, count(*)::text AS value
FROM pg_catalog.pg_tables WHERE schemaname = 'public'
UNION ALL SELECT 'rls_policies', count(*)::text FROM pg_catalog.pg_policies WHERE schemaname = 'public'
UNION ALL SELECT 'contents', count(*)::text FROM public.contents
UNION ALL SELECT 'event_types', count(*)::text FROM public.event_types
UNION ALL SELECT 'events', count(*)::text FROM public.events
UNION ALL SELECT 'observatory_indicators', count(*)::text FROM public.observatory_indicators
UNION ALL SELECT 'observatory_statistical_sources', count(*)::text FROM public.observatory_statistical_sources
UNION ALL SELECT 'observatory_indicator_values', count(*)::text FROM public.observatory_indicator_values
ORDER BY metric;

-- Anonymous public-read smoke: verifies grants + RLS from the public role.
BEGIN;
SET LOCAL ROLE anon;

SELECT 1 / CASE WHEN count(*) = 17 THEN 1 ELSE 0 END AS contents_public_gate
FROM public.contents;

SELECT 1 / CASE WHEN count(*) = 11 THEN 1 ELSE 0 END AS content_types_public_gate
FROM public.content_types;

SELECT 1 / CASE WHEN count(*) = 9 THEN 1 ELSE 0 END AS content_categories_public_gate
FROM public.content_categories;

SELECT 1 / CASE WHEN count(*) = 10 THEN 1 ELSE 0 END AS event_types_public_gate
FROM public.event_types;

SELECT 1 / CASE WHEN count(*) = 0 THEN 1 ELSE 0 END AS events_public_gate
FROM public.events;

SELECT 1 / CASE WHEN count(*) = 1 THEN 1 ELSE 0 END AS observatory_indicators_public_gate
FROM public.observatory_indicators;

SELECT 1 / CASE WHEN count(*) = 1 THEN 1 ELSE 0 END AS observatory_sources_public_gate
FROM public.observatory_statistical_sources;

SELECT 1 / CASE WHEN count(*) = 6 THEN 1 ELSE 0 END AS observatory_values_public_gate
FROM public.observatory_indicator_values;

SELECT 1 / CASE WHEN count(*) = 30 THEN 1 ELSE 0 END AS languages_public_gate
FROM public.languages;

SELECT 1 / CASE WHEN count(*) = 21 THEN 1 ELSE 0 END AS sectors_public_gate
FROM public.business_sectors;

ROLLBACK;

SELECT 'SPLIT3_IMMIGRATI_ANON_PUBLIC_READS' AS check_name, 'PASS' AS result;
