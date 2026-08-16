# Centro Studi — ownership migration (SPLIT-2)

`CS_MIGRATION_OWNERSHIP = COPIED`
`CS_DATABASE_BOOTSTRAP = SPLIT_3_PENDING`
`CS_MIGRATION_SQL_MODIFIED = 0`

Copia non distruttiva di **21** file inventario `CENTRO_STUDI` (`tipo_file=migration_sql`).

- Nomi, timestamp e SQL **invariati** (hash identico agli originali root).
- Originali root `supabase/**` **preservati**.
- Questa copia **non** è una catena eseguibile autonoma: dipende dallo schema CONDIVISO (34 file), dagli helper identità/account, e da oggetti Ponte/Eventi fuori dal set.
- Le 12 migration evento `TEMPLATE_COMUNE` **non** sono in questo set e **non** sono state copiate.
- `content_event_links` (`20260807160000`, inventario `PONTE_IMPRESE`) **non** è in questo set.
- **Non eseguire** queste migration da questa cartella in SPLIT-2.
- Baseline/database fisico: **SPLIT-3**.
- Gate aperti sul DB: `S2-GATE-ORG`, `S2-GATE-EVENTI`, `S2-GATE-DATI-ACQUISITI`.

Questo manifesto **non** sostituisce `split-1-file-inventory.csv`.

| path | timestamp | oggetti principali | dominio | schema CONDIVISO | identità/account Ponte |
|---|---|---|---|---|---|
| `supabase/migrations/20260807090000_create_content_types.sql` | 20260807090000 | `content_types` | contenuti | cataloghi ciclo unico | no |
| `supabase/migrations/20260807100000_create_content_categories.sql` | 20260807100000 | `content_categories` | contenuti | cataloghi ciclo unico | no |
| `supabase/migrations/20260807110000_create_content_tags.sql` | 20260807110000 | `content_tags` | contenuti | cataloghi ciclo unico | no |
| `supabase/migrations/20260807120000_create_contents.sql` | 20260807120000 | `contents` | contenuti | `profiles`, `businesses`, lingue | FK `profiles`; ownership redazione |
| `supabase/migrations/20260807130000_create_content_authors.sql` | 20260807130000 | `content_authors` | contenuti | `profiles`, `professional_profiles` | FK identità/professionisti |
| `supabase/migrations/20260807140000_create_content_tag_links.sql` | 20260807140000 | `content_tag_links` | contenuti | cataloghi contenuti | no |
| `supabase/migrations/20260807150000_create_content_subject_links.sql` | 20260807150000 | `content_subject_links` | contenuti | `profiles`, `professional_profiles`, `businesses` | FK identità |
| `supabase/migrations/20260807170000_create_content_opportunity_links.sql` | 20260807170000 | `content_opportunity_links` | contenuti↔opportunità | tabella opportunità PI | no FK account |
| `supabase/migrations/20260807180000_create_content_service_links.sql` | 20260807180000 | `content_service_links` | contenuti↔servizi | tabella servizi PI | no |
| `supabase/migrations/20260807190000_create_content_market_links.sql` | 20260807190000 | `content_market_links` | contenuti↔mercati | tabella mercati PI | no |
| `supabase/migrations/20260807200000_create_content_relations.sql` | 20260807200000 | `content_relations` | contenuti | — | no |
| `supabase/migrations/20260811090000_create_observatory_indicators.sql` | 20260811090000 | `observatory_indicators` | osservatorio | cataloghi geografici/lingue | commenti; nessun FK org |
| `supabase/migrations/20260811100000_create_observatory_statistical_sources.sql` | 20260811100000 | `observatory_statistical_sources` | osservatorio | — | nessun FK org (esplicitamente fuori scope) |
| `supabase/migrations/20260811110000_create_observatory_indicator_values.sql` | 20260811110000 | `observatory_indicator_values` | osservatorio | indicatori/fonti CS | nessun FK org |
| `supabase/migrations/20260812260000_create_access_contenuti_rls.sql` | 20260812260000 | policy RLS contenuti | contenuti-rls | helper `access_*` CONDIVISO | `access_is_editor`, membership impresa |
| `supabase/migrations/20260812280000_create_access_osservatorio_rls.sql` | 20260812280000 | policy RLS osservatorio | osservatorio-rls | helper `access_*` CONDIVISO | ruoli editoriali |
| `supabase/migrations/20260813110000_extend_professional_cultural_creative_categories.sql` | 20260813110000 | seed/extend categorie culturali | cultura | cataloghi professionisti PI | catalogo identità professionale |
| `supabase/migrations/20260813130000_seed_cultural_content_service_categories.sql` | 20260813130000 | seed categorie culturali contenuti/servizi | cultura | cataloghi contenuti/servizi | no |
| `supabase/migrations/20260819100000_grant_observatory_ingestion_writer.sql` | 20260819100000 | GRANT writer ingest osservatorio | osservatorio | ruoli DB progetto unico | no account applicativo |
| `supabase/migrations/20260820110000_fix_opportunity_rls_recursion_for_editorial.sql` | 20260820110000 | helper RLS opportunità | editorial-support misto | opportunità PI + `access_*` | party/membership Ponte |
| `supabase/migrations/20260820130000_mercati_editorial_select_rls.sql` | 20260820130000 | policy SELECT editoriale mercati | editorial-support misto | mercati PI + `access_*` | `access_is_editor` |
