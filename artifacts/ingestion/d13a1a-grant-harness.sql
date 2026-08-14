-- LOCAL TRANSACTIONAL HARNESS ONLY. Production execution requires a separate human GO.
-- All mutations below are transactional and the final ROLLBACK is unconditional.
BEGIN;

REVOKE ALL ON TABLE public.observatory_statistical_sources FROM service_role;
REVOKE ALL ON TABLE public.observatory_indicators FROM service_role;
REVOKE ALL ON TABLE public.observatory_indicator_values FROM service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.observatory_statistical_sources TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.observatory_indicators TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.observatory_indicator_values TO service_role;

SELECT c.relname AS table_name,
  has_table_privilege('service_role', c.oid, 'SELECT') AS sel,
  has_table_privilege('service_role', c.oid, 'INSERT') AS ins,
  has_table_privilege('service_role', c.oid, 'UPDATE') AS upd,
  has_table_privilege('service_role', c.oid, 'DELETE') AS del
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'observatory_indicators',
    'observatory_statistical_sources',
    'observatory_indicator_values'
  )
ORDER BY 1;

SELECT
  has_table_privilege('anon', 'public.observatory_indicators', 'INSERT') AS anon_ins,
  has_table_privilege('anon', 'public.observatory_indicators', 'UPDATE') AS anon_upd,
  has_table_privilege('anon', 'public.observatory_indicators', 'DELETE') AS anon_del,
  has_table_privilege('anon', 'public.observatory_indicators', 'SELECT') AS anon_sel;

SELECT
  has_table_privilege('authenticated', 'public.observatory_indicators', 'INSERT') AS auth_ins,
  has_table_privilege('authenticated', 'public.observatory_indicators', 'UPDATE') AS auth_upd,
  has_table_privilege('authenticated', 'public.observatory_indicators', 'DELETE') AS auth_del;

DO $$
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  BEGIN
    INSERT INTO public.observatory_indicators (
      code, slug, title, description, purpose_text, methodology_summary,
      value_nature, unit_code, periodicity, operational_status, publication_status
    ) VALUES (
      'OBS-TEST-D131A1A', 'obs-test-d131a1a', 't', 'd', 'p', 'm',
      'count', 'units', 'annual', 'active', 'unpublished'
    );
    RAISE EXCEPTION 'UNEXPECTED: authenticated insert succeeded without editor';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'authenticated write blocked (privilege/RLS): %', SQLERRM;
    WHEN OTHERS THEN
      IF SQLERRM LIKE 'UNEXPECTED:%' THEN
        RAISE;
      END IF;
      RAISE NOTICE 'authenticated write blocked as expected: %', SQLERRM;
  END;
  PERFORM set_config('role', 'postgres', true);
END $$;

DO $$
DECLARE
  v_src uuid;
  v_ind uuid;
  v_val uuid;
BEGIN
  PERFORM set_config('role', 'service_role', true);

  IF NOT has_table_privilege('service_role', 'public.observatory_indicators', 'SELECT')
     OR NOT has_table_privilege('service_role', 'public.observatory_indicators', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.observatory_indicators', 'UPDATE')
     OR has_table_privilege('service_role', 'public.observatory_indicators', 'DELETE')
  THEN
    RAISE EXCEPTION 'service_role privileges not least-privilege SIU';
  END IF;

  INSERT INTO public.observatory_statistical_sources (
    name, producer_name, publication_title, url, external_identifier, license_note, lifecycle_status
  ) VALUES (
    'D1.3A-1a harness source', 'Harness', 'harness', 'https://example.test',
    'harness:d13a1a', 'test', 'active'
  ) RETURNING id INTO v_src;

  INSERT INTO public.observatory_indicators (
    code, slug, title, description, purpose_text, methodology_summary,
    value_nature, unit_code, periodicity, operational_status, publication_status
  ) VALUES (
    'OBS-HARNESS-D13A1A', 'obs-harness-d13a1a', 'Harness', 'desc', 'purpose', 'method',
    'count', 'units', 'annual', 'active', 'unpublished'
  ) RETURNING id INTO v_ind;

  INSERT INTO public.observatory_indicator_values (
    indicator_id, source_id, numeric_value, period_start, period_end,
    status, quality_code, territory_level, territory_code, territory_label,
    country_code, country_label, published_at
  ) VALUES (
    v_ind, v_src, 1.0, '2023-01-01', '2023-12-31',
    'final', 'official', 'italy', 'IT', 'Italia',
    'FOR', 'Cittadini stranieri', now()
  ) RETURNING id INTO v_val;

  UPDATE public.observatory_indicator_values
  SET status = 'withdrawn', withdrawn_at = now()
  WHERE id = v_val;

  INSERT INTO public.observatory_indicator_values (
    indicator_id, source_id, numeric_value, period_start, period_end,
    status, quality_code, territory_level, territory_code, territory_label,
    country_code, country_label, published_at, revised_at, supersedes_value_id
  ) VALUES (
    v_ind, v_src, 2.0, '2023-01-01', '2023-12-31',
    'revised', 'official', 'italy', 'IT', 'Italia',
    'FOR', 'Cittadini stranieri', now(), now(), v_val
  );

  BEGIN
    DELETE FROM public.observatory_indicators WHERE id = v_ind;
    RAISE EXCEPTION 'UNEXPECTED: service_role DELETE succeeded';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'service_role DELETE denied as expected';
  END;

  PERFORM set_config('role', 'postgres', true);
  RAISE NOTICE 'UPSERT-like path OK (insert/update/revise)';
END $$;

ROLLBACK;

SELECT count(*) AS leftover_harness
FROM public.observatory_indicators
WHERE code = 'OBS-HARNESS-D13A1A';
