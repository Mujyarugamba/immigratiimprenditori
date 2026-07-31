# Imprese — M8.2 Validation and Reconciliation Report

## 1. Esito

`ACCETTATA`

## 2. Scopo

Questo rapporto documenta la validazione e la riconciliazione finale del piano di migrazione del dominio Imprese (unit M1–M8).

M8.2:

- valida **staticamente** il dominio Imprese;
- riconcilia Logical → Physical → Migration Plan → Dependency Map → migration SQL M1–M7;
- **non** crea schema;
- **non** applica migration;
- **non** introduce seed;
- **non** sostituisce i test runtime post-applicazione.

## 3. Documenti analizzati

| Priorità | Fonte | Ruolo |
|---|---|---|
| 1 | `docs/architecture/logical/imprese.md` | Modello logico |
| 2 | `docs/architecture/physical/domain-mapping/imprese.md` | Fonte normativa immediata del DDL / §12.1 / §15.1 |
| 3 | `docs/architecture/migrations/imprese-migration-plan.md` | Sequenza unit e accettazione |
| 4 | `docs/architecture/physical/domain-dependency-map.md` | Dipendenze e confini (Blocco M6 / M7) |
| 5 | `docs/architecture/fundamental/domain-patterns.md` | Pattern trasversali (PF7, PF12, PF13, …) |
| 6 | `docs/architecture/physical/architecture-baseline.md` | Catena mapping → piano → SQL |
| 7 | `supabase/migrations/20260731070000` … `20260731220000` (12 file Imprese) | DDL / COMMENT effettivi |
| 8 | `src/data/home/enterprises.ts` | Conferma natura demo frontend (`isDemo: true`) |
| 9 | Assenza di `supabase/seed.sql` | Conferma assenza seed generale prescritto |

## 4. Inventario delle unità

| Blocco | Unità | Artefatto | Responsabilità | Stato |
| ------ | ----- | --------- | -------------- | ----- |
| M1 | M1.1 | `20260731070000_create_businesses_core.sql` | Aggregate Root `businesses` | Completata |
| M1 | M1.2 | `20260731080000_add_business_lifecycle_and_publication_axes.sql` | Assi S01/S02/S04/S07/S08 | Completata |
| M2 | M2.1 | `20260731090000_create_business_sector_declarations.sql` | Dichiarazioni settore (VO03) | Completata |
| M2 | M2.2 | `20260731100000_create_business_operational_language_declarations.sql` | Dichiarazioni lingua operativa | Completata |
| M3 | M3.1 | `20260731110000_create_business_locations.sql` | Sedi | Completata |
| M3 | M3.2 | `20260731120000_create_business_channels.sql` | Canali | Completata |
| M4 | M4.1 | `20260731130000_create_business_services.sql` | Servizi | Completata |
| M4 | M4.2 | `20260731140000_create_business_products.sql` | Prodotti | Completata |
| M5 | M5.1 | `20260731150000_create_business_certifications.sql` | Certificazioni | Completata |
| M5 | M5.2 | `20260731160000_create_business_media.sql` | Media | Completata |
| M6 | M6.1 | `20260731170000_create_business_verifications.sql` | Verifiche owned Impresa | Completata |
| M7 | M7.1 | `20260731220000_add_business_publication_and_visibility_coherence.sql` | Coerenza pubblicazione (comment-only) | Completata |
| M8 | M8.1 | Nessuno | Seed demo opzionale | **SKIPPATA** |
| M8 | M8.2 | Questo rapporto | Validazione e riconciliazione statica | **Completata** |

## 5. Inventario migration SQL

| Timestamp | File | Blocco | Oggetti principali | Stato |
| --------- | ---- | ------ | ------------------ | ----- |
| 20260731070000 | `create_businesses_core.sql` | M1.1 | `public.businesses` | Presente |
| 20260731080000 | `add_business_lifecycle_and_publication_axes.sql` | M1.2 | Assi su `businesses` | Presente |
| 20260731090000 | `create_business_sector_declarations.sql` | M2.1 | `business_sector_declarations` | Presente |
| 20260731100000 | `create_business_operational_language_declarations.sql` | M2.2 | `business_operational_language_declarations` | Presente |
| 20260731110000 | `create_business_locations.sql` | M3.1 | `business_locations` | Presente |
| 20260731120000 | `create_business_channels.sql` | M3.2 | `business_channels` | Presente |
| 20260731130000 | `create_business_services.sql` | M4.1 | `business_services` | Presente |
| 20260731140000 | `create_business_products.sql` | M4.2 | `business_products` | Presente |
| 20260731150000 | `create_business_certifications.sql` | M5.1 | `business_certifications` | Presente |
| 20260731160000 | `create_business_media.sql` | M5.2 | `business_media` | Presente |
| 20260731170000 | `create_business_verifications.sql` | M6.1 | `business_verifications` | Presente |
| 20260731220000 | `add_business_publication_and_visibility_coherence.sql` | M7.1 | 14 `COMMENT ON COLUMN` | Presente |

Conferme:

- ordine crescente dei timestamp;
- assenza di timestamp duplicati tra le unit Imprese;
- assenza di collisioni di nome file;
- M7.1 (`20260731220000`) successiva a M6.1 (`20260731170000`);
- nessuna migration M8.

Nota: `20260718192646_create_business_sectors_table.sql` è catalogo condiviso preesistente, **non** ownership del dominio Imprese e **non** unità M1–M7.

## 6. Riconciliazione Logical → Physical

| Requisito logico | Rappresentazione fisica | Esito |
| ---------------- | ----------------------- | ----- |
| Impresa (AR) | `businesses` A01/E03 | OK |
| SedeImpresa | `business_locations` E02 | OK |
| SettoreImpresa | `business_sector_declarations` + VO03 `business_sectors` | OK |
| LinguaOperativaImpresa | `business_operational_language_declarations` + VO03 `languages` | OK |
| CanaleImpresa | `business_channels` | OK |
| ServizioImpresa | `business_services` | OK |
| ProdottoImpresa | `business_products` | OK |
| CertificazioneImpresa | `business_certifications` | OK |
| MediaImpresa | `business_media` | OK |
| Verifica multidimensionale owned | `business_verifications` (§12.1) | OK |
| Visibilità / pubblicazione | Assi S04 + ceiling presentazione §15.1 / M7.1 | OK |
| AppartenenzaImpresa | Non owned — Appartenenze | OK (esclusa) |
| MercatoImpresa | Non owned — Mercati Internazionali | OK (esclusa) |
| StoriaImpresa | Contenuti Editoriali | OK (esclusa) |
| Badge “Impresa verificata” | Vietato | OK (assente) |

## 7. Riconciliazione Physical → Migration

| Oggetto fisico | Migration | Conformità | Note |
| -------------- | --------- | ---------- | ---- |
| `businesses` core | M1.1 | OK | PK uuid; soft-delete `deleted_at`; RLS + REVOKE; trigger `updated_at` |
| Assi S01/S02/S04/S07/S08 | M1.2 | OK | Vocabolari chiusi; assi indipendenti |
| Settore dichiarazioni | M2.1 | OK | FK catalogo `ON DELETE RESTRICT`; UNIQUE parziali |
| Lingua dichiarazioni | M2.2 | OK | FK `languages`; UNIQUE parziale |
| Sedi | M3.1 | OK | `visibility_status`; `location_status`; primary parziale |
| Canali | M3.2 | OK | `channel_value`; C05; `visibility_status` |
| Servizi | M4.1 | OK | `publication_status` draft/published; `service_status` |
| Prodotti | M4.2 | OK | Stessi assi S04/S08 distinti da servizi |
| Certificazioni | M5.1 | OK | Cinque stati; `expires_at` opzionale; no S04 locale |
| Media | M5.2 | OK | `visibility_status`; logo primario UNIQUE parziale |
| Verifiche | M6.1 | OK | Tre `aspect`; UNIQUE `(business_id, aspect)` |
| Coerenza pubblicazione | M7.1 | OK | Solo 14 COMMENT; nessun DDL strutturale |

Controlli trasversali sulle owned Imprese (evidenza SQL statica nei file):

- colonne e CHECK allineati al Physical prescrittivo;
- PK locali; FK `business_id` → `businesses(id)` `ON DELETE CASCADE` sulle owned;
- indici di supporto e UNIQUE parziali dove prescritti;
- trigger / funzioni `set_*_updated_at` dedicati;
- `ENABLE ROW LEVEL SECURITY`; nessuna `CREATE POLICY` nelle migration Imprese M1–M7;
- `REVOKE ALL` da `anon`, `authenticated`; nessun `GRANT` nelle stesse unit;
- commenti presenti; M7.1 sostituisce/aggiorna i 14 commenti di coerenza.

## 8. Inventario tabelle Imprese

| Tabella | Blocco | Responsabilità | Dipendenze | Ownership corretta |
| ------- | ------ | -------------- | ---------- | ------------------ |
| `public.businesses` | M1 | Aggregate Root | Nessuna FK esterna | Sì — Imprese |
| `public.business_sector_declarations` | M2.1 | Dichiarazione settore | `businesses`, `business_sectors` | Sì — dichiarazione Imprese |
| `public.business_operational_language_declarations` | M2.2 | Dichiarazione lingua | `businesses`, `languages` | Sì — dichiarazione Imprese |
| `public.business_locations` | M3.1 | Sede | `businesses` | Sì |
| `public.business_channels` | M3.2 | Canale | `businesses` | Sì |
| `public.business_services` | M4.1 | Servizio | `businesses` | Sì |
| `public.business_products` | M4.2 | Prodotto | `businesses` | Sì |
| `public.business_certifications` | M5.1 | Certificazione | `businesses` | Sì |
| `public.business_media` | M5.2 | Media | `businesses` | Sì |
| `public.business_verifications` | M6.1 | Verifica scheda | `businesses` | Sì |

Non owned da Imprese (confermato assente come tabelle Imprese): Appartenenze; Mercati; Editoriali; Moderazione; Identità & Accessi; `profiles`.

## 9. Grafo delle dipendenze

| Da | A | Natura | ON DELETE | Esito |
| -- | - | ------ | --------- | ----- |
| `business_sector_declarations` | `businesses` | Ownership | CASCADE | OK |
| `business_sector_declarations` | `business_sectors` | VO03 catalogo | RESTRICT | OK |
| `business_operational_language_declarations` | `businesses` | Ownership | CASCADE | OK |
| `business_operational_language_declarations` | `languages` | VO03 catalogo | RESTRICT | OK |
| `business_locations` | `businesses` | Ownership | CASCADE | OK |
| `business_channels` | `businesses` | Ownership | CASCADE | OK |
| `business_services` | `businesses` | Ownership | CASCADE | OK |
| `business_products` | `businesses` | Ownership | CASCADE | OK |
| `business_certifications` | `businesses` | Ownership | CASCADE | OK |
| `business_media` | `businesses` | Ownership | CASCADE | OK |
| `business_verifications` | `businesses` | Ownership | CASCADE | OK |

Conferme:

- `businesses` radice dell’Aggregate;
- nessuna FK verso `profiles`;
- nessuna FK verso Appartenenze;
- nessuna dipendenza circolare di ownership;
- M6 dipende solo da `businesses`;
- M7 non introduce nuove dipendenze strutturali.

## 10. Verifica dei confini di dominio

| Confine | Esito |
|---|---|
| Referente non modellato in Imprese | OK — gate Appartenenze |
| Moderazione non posseduta da Imprese | OK — trasversale; overlay S07 locale distinto |
| StoriaImpresa non owned | OK |
| Mercati non posseduti | OK |
| Opportunità non anticipata (nessuna FK da Imprese) | OK |
| Profili utente non collegati direttamente | OK |
| RLS definitiva / accesso pubblico non introdotti da M7/M8 | OK |
| Storage non introdotto | OK — solo `media_reference` dichiarativo |
| Badge e score assenti | OK |

## 11. Verifica degli assi

Assi distinti su `businesses`: `editorial_status`, `substantial_status`, `publication_status`, `administrative_status`, `is_archived`; verifica su `business_verifications`; certificazione su `business_certifications`.

Assenti: stato sintetico di scheda; publishability persistita; badge; score; derivazioni materializzate non prescritte.

## 12. Verifica M6

- Tabella `business_verifications` presente (Plan + SQL).
- Aspect: `existence` \| `company_data` \| `contested_profile`.
- Status compatibili con aspect; `verified_at` vincolato agli esiti conclusivi.
- Nessuna duplicazione di `certification_status` (M5.1).
- Nessun badge; nessuna Evidence/Fonte come Entity; dipendenza dura solo `businesses`.
- Contratto non riaperto: riconciliazione conforme a Physical §12.1.

## 13. Verifica M7

- Migration comment-only: 14 istruzioni `COMMENT ON COLUMN`.
- Nessun ALTER strutturale, CHECK, trigger, funzione, view, policy, GRANT.
- Ceiling = esposizione/presentazione; stati locali conservabili; nessuna propagazione automatica.
- Certificazioni `expired`/`revoked` persistite e non rappresentate come valide (commento M7.1).
- RLS e VIS02 esclusi da M7.1.

## 14. Verifica seed M8.1

- M8.1 **SKIPPATA** (Plan §20).
- Nessuna migration seed; nessun INSERT demo; nessun backfill da `enterprises.ts`.
- Nessun `supabase/seed.sql`.
- Strutture di istanza ammesse vuote.
- Nessun dato personale reale introdotto dal dominio Imprese in questa chiusura.

## 15. Verifica RLS e privilegi

Evidenza SQL statica nei file M1–M7:

- `ENABLE ROW LEVEL SECURITY` sulle tabelle Imprese elencate;
- nessuna `CREATE POLICY` nelle migration Imprese M1–M7;
- `REVOKE ALL` da `anon` e `authenticated`;
- nessun accesso pubblico definitivo introdotto da M7/M8;
- VIS02 rinviato a Identità & Accessi.

Questa sezione **non** dichiara esiti runtime di sessioni database.

## 16. Verifica oggetti vietati

| Categoria | Esito statico |
|---|---|
| Colonna/tabella `publishability` | Assente |
| Badge / score / ranking persistiti | Assenti |
| History / audit non prescritti | Assenti come tabelle Imprese |
| `expires_at` | Solo su `business_certifications` (contratto M5.1) |
| FK a `profiles` | Assente |
| FK ad Appartenenze | Assente |
| Policy definitive di lettura pubblica | Assenti nelle unit Imprese |
| Storage / bucket | Assente |
| Seed / INSERT demo nelle migration Imprese | Assente |
| Trigger cross-table di propagazione pubblicazione | Assente |
| View di pubblicazione | Assente |

Nota: la parola “publishability” compare solo in commenti documentali (M1.2 / M7.1) che ne **negano** la persistenza.

## 17. Collocazione delle strutture vuote

Tabelle senza record di istanza sono valide. L’assenza di dati non rende incompleto lo schema. Il dominio è accettabile senza seed. Completezza strutturale e popolamento restano concetti distinti.

## 18. Runtime non compreso in M8.2

**Incluso in M8.2:** inventario, ordine, riconciliazione documentale↔SQL, grafo FK, confini, assenza seed, oggetti vietati, checklist statica.

**Debito operativo / evidenza pregressa (non attività di questa fase):**

| Attività | Collocazione |
|---|---|
| `supabase db reset` / applicazione sequenziale locale | Evidenza pregressa controllata (M6/M7); non rieseguita in M8.2 |
| Test INSERT validi/invalidi, cascade, UNIQUE, trigger | Debito runtime Plan §23 |
| Test privilegi / RLS a runtime | Debito / Identità & Accessi |
| Verifica catalogo commenti M7.1 a runtime | Evidenza pregressa post-applicazione M7.1 |

I test runtime non sono difetti della chiusura statica.

## 19. Osservazioni

1. `size_band` su `businesses` resta senza CHECK chiuso: conforme a M1.1 / Logical (bande non enumerate).
2. Opportunità continua a referenziare `business_id` in modo opaco: FK additiva resta fuori piano Imprese (questione aperta Plan §29.9).

## 20. Problemi bloccanti

Nessuno.

## 21. Checklist finale

| Punto | Esito | Evidenza |
| ----- | ----- | -------- |
| 1. Logical riconciliato | OK | §6 |
| 2. Physical riconciliato | OK | §6–§7 |
| 3. Migration Plan riconciliato | OK | Plan §12/§20 aggiornato |
| 4. Dependency Map coerente | OK | Blocchi M6/M7; confini §10 |
| 5. Unità M1–M7 presenti | OK | 12 file SQL |
| 6. Ordine migration corretto | OK | §5 |
| 7. Ownership corretta | OK | §8 |
| 8. FK corrette | OK | §9 |
| 9. Vocabolari chiusi | OK | CHECK nei file M1–M6 |
| 10. Trigger coerenti | OK | `set_*_updated_at` per tabella |
| 11. RLS coerente | OK | ENABLE + no policy Imprese |
| 12. Privilegi coerenti | OK | REVOKE anon/authenticated |
| 13. M6 ≠ certificazioni | OK | §12 |
| 14. M7 comment-only | OK | 14 COMMENT; §13 |
| 15. M8.1 skippata | OK | Plan §20 |
| 16. Nessun seed demo | OK | §14 |
| 17. Nessun badge/score | OK | §11/§16 |
| 18. Nessuna dipendenza estranea | OK | §9–§10 |
| 19. Nessuna collisione | OK | §5 |
| 20. Strutture vuote ammesse | OK | §17 |
| 21. Runtime distinto da M8.2 | OK | §18 |

## 22. Debito residuo

Attività **fuori** M8 / fuori ownership Imprese (non difetti di questo dominio):

- Identità & Accessi (VIS02, policy definitive);
- Appartenenze (referente, autorizzazione gestionale);
- Moderazione trasversale;
- Contenuti Editoriali / StoriaImpresa;
- Mercati Internazionali;
- Storage file;
- eventuale FK Opportunità → `businesses`;
- switch frontend da `enterprises.ts` a dati persistenti;
- programma runtime globale, se ripreso;
- questioni aperte Logical/Physical già documentate (marchi, dati fiscali, fusioni, territori strutturati, ecc.).

## 23. Decisione di accettazione

`DOMINIO IMPRESE ACCETTATO`

## 24. Stop point

Raggiunto:

`Dominio Imprese strutturalmente e architetturalmente completato; popolamento, accesso pubblico definitivo e integrazioni interdominio restano separati.`
