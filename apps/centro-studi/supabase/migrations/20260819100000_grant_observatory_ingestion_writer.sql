-- D1.3A-1a — Observatory ingestion writer (least privilege)
--
-- Path: offline Node importer → Supabase JS client → JWT role service_role
--       → PostgREST → table DML (BYPASSRLS; no service_role RLS policies).
--
-- Importer operations (apply-lfsa-esgan):
--   observatory_statistical_sources: SELECT, INSERT, UPDATE
--   observatory_indicators:          SELECT, INSERT, UPDATE
--   observatory_indicator_values:    SELECT, INSERT, UPDATE
-- Idempotent value revision uses UPDATE (withdraw) + INSERT (revised row),
-- not SQL DELETE and not ON CONFLICT upsert.
--
-- PKs use gen_random_uuid() — no SEQUENCE privileges required.
--
-- Intentionally NOT granted: DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN.
-- Intentionally unchanged: anon/authenticated grants; all RLS policies.
--
-- REVOKE ALL first so hosted environments that previously had GRANT ALL
-- (or partial defaults) converge to the same least-privilege surface.

revoke all on table public.observatory_statistical_sources from service_role;
revoke all on table public.observatory_indicators from service_role;
revoke all on table public.observatory_indicator_values from service_role;

grant select, insert, update on table public.observatory_statistical_sources to service_role;
grant select, insert, update on table public.observatory_indicators to service_role;
grant select, insert, update on table public.observatory_indicator_values to service_role;
