# M8.2 — Validate and reconcile — Opportunità

## 1. Scopo

Questo rapporto documenta la validazione e la riconciliazione finale del piano di migrazione del dominio Opportunità (unit M1–M8).

La verifica è **statica**: inventario delle unit e dei file SQL, ordine e dipendenze, riconciliazione Physical ↔ SQL, grafo FK, assenza di seed demo, ammissibilità delle strutture vuote, compatibilità PostgreSQL 17.6.1, applicabilità statica della catena.

In questa fase:

- non è stato eseguito SQL;
- non è stata applicata alcuna migration;
- non è stato creato alcun seed demo;
- non è stato modificato lo schema oltre alle migration già presenti M1.1–M7.2.

## 2. Perimetro

**Incluso**

- Domain Thesis Opportunità;
- Logical Data Model Opportunità;
- Physical Domain Mapping Opportunità (fonte normativa immediata del DDL);
- Migration Plan Opportunità;
- migration SQL M1.1–M7.2;
- decisione architetturale M8.1;
- validazione M8.2 (questo rapporto).

**Escluso**

- esecuzione runtime e deploy;
- caricamento dati reali;
- switch frontend verso database;
- policy RLS applicative future;
- perimetri espressamente rinviati (candidature, Editoriali, ecc.).

## 3. Fonti normative

| Priorità | Fonte | Ruolo |
|---|---|---|
| 1 | `docs/architecture/fundamental/opportunita-domain-thesis.md` | Significato di dominio |
| 2 | `docs/architecture/logical/opportunita.md` | Modello logico |
| 3 | `docs/architecture/physical/domain-mapping/opportunita.md` | **Fonte normativa immediata del DDL** |
| 4 | `docs/architecture/migrations/opportunita-migration-plan.md` | Sequenza unit e accettazione |
| 5 | `docs/architecture/fundamental/domain-patterns.md` | Pattern trasversali |
| 6 | `docs/architecture/physical/domain-dependency-map.md` | Dipendenze consolidate |
| 7 | `supabase/migrations/*opportunit*.sql` (17 file) | DDL effettivo |
| 8 | `src/data/home/opportunities.ts`, `src/types/home.ts` | Conferma natura demo frontend |
| 9 | `supabase/.temp/postgres-version` | Target PostgreSQL 17.6.1 |

## 4. Stato delle unità

| Unità | Nome | Natura | Stato | Output | Applicata al DB |
|---|---|---|---|---|---|
| M1.1 | create opportunity core | SQL | Completata | Migration file | No |
| M1.2 | extend opportunity lifecycle vocabularies | SQL | Completata | Migration file | No |
| M2.1 | create opportunity controlled lists | SQL | Completata | Migration file (+ seed catalogo) | No |
| M2.2 | associate opportunity classifications | SQL | Completata | Migration file | No |
| M3.1 | create opportunity sources | SQL | Completata | Migration file | No |
| M3.2 | create opportunity evidences | SQL | Completata | Migration file | No |
| M4.1 | create opportunity audience classifications | SQL | Completata | Migration file (+ seed catalogo) | No |
| M4.2 | create opportunity requirements | SQL | Completata | Migration file | No |
| M4.3 | create opportunity benefits | SQL | Completata | Migration file | No |
| M4.4 | create opportunity access procedure | SQL | Completata | Migration file | No |
| M5.1 | create opportunity time windows | SQL | Completata | Migration file | No |
| M5.2 | add opportunity temporal milestones | SQL | Completata | Migration file | No |
| M6.1 | create opportunity party references | SQL | Completata | Migration file | No |
| M6.2 | create opportunity representation utilizations | SQL | Completata | Migration file | No |
| M6.3 | create opportunity context references | SQL | Completata | Migration file | No |
| M7.1 | create opportunity verifications | SQL | Completata | Migration file | No |
| M7.2 | add opportunity publication state | SQL | Completata | Migration file | No |
| M8.1 | backfill optional demo/seed opportunities | Seed opzionale | **Skippata** | Nessuno | N/A |
| M8.2 | validate and reconcile | Validazione | **Completata** | Questo rapporto | N/A |

## 5. Inventario delle migration

| Timestamp | File | Unità | Oggetto principale |
|---|---|---|---|
| 20260720225301 | `create_opportunities_core.sql` | M1.1 | `public.opportunities` |
| 20260720231348 | `extend_opportunity_lifecycle_vocabularies.sql` | M1.2 | CHECK lifecycle su AR |
| 20260720234303 | `create_opportunity_controlled_lists.sql` | M2.1 | `opportunity_types`, `opportunity_access_modes` |
| 20260720235323 | `associate_opportunity_classifications.sql` | M2.2 | type/access mode assignments |
| 20260721102213 | `create_opportunity_sources.sql` | M3.1 | `opportunity_sources` |
| 20260721105727 | `create_opportunity_evidences.sql` | M3.2 | `opportunity_evidences` |
| 20260721131942 | `create_opportunity_audience_classifications.sql` | M4.1 | audience types + assignments |
| 20260730094530 | `create_opportunity_requirements.sql` | M4.2 | `opportunity_requirements` |
| 20260730221921 | `create_opportunity_benefits.sql` | M4.3 | `opportunity_benefits` |
| 20260730232814 | `create_opportunity_access_procedure.sql` | M4.4 | `opportunity_access_procedures` |
| 20260730234248 | `create_opportunity_time_windows.sql` | M5.1 | `opportunity_time_windows` |
| 20260730234300 | `add_opportunity_temporal_milestones.sql` | M5.2 | `external_official_published_at` |
| 20260731000110 | `create_opportunity_party_references.sql` | M6.1 | `opportunity_party_references` |
| 20260731000927 | `create_opportunity_representation_utilizations.sql` | M6.2 | `opportunity_representation_utilizations` |
| 20260731001652 | `create_opportunity_context_references.sql` | M6.3 | professional/market/sector refs |
| 20260731010517 | `create_opportunity_verifications.sql` | M7.1 | `opportunity_verifications` |
| 20260731011847 | `add_opportunity_publication_state.sql` | M7.2 | assi editoriali/pubblicazione/visibilità |

**Totale:** 17 migration SQL. Nessun file M8.1 o M8.2 SQL.

## 6. Ordine e dipendenze

- I timestamp delle 17 migration sono **strettamente crescenti**.
- L’ordine logico M1 → M2 → M3 → M4 → M5 → M6 → M7 è rispettato; M7.1 precede M7.2.
- Dipendenze esterne preesistenti: `public.profiles` (M6.1/M6.3), `public.business_sectors` (M6.3).
- Nessuna dipendenza da M8.1; nessun SQL M8.2; nessun ciclo FK nel dominio Opportunità.
- Identificatori opachi senza FK dove previsto (`business_id`, `membership_id`, `market_id`).

## 7. Stato finale dello schema

Schema **definito nel repository**, **non applicato** al database.

Sintesi:

- Aggregate Root `opportunities` (identità, core, origin, soft-delete, lifecycle, milestone ufficiale esterna M5.2, assi M7.2);
- cataloghi C05 (tipologie, modalità accesso, audience);
- associazioni tipologiche e di audience;
- Fonti ed Evidenze (E02);
- Requisiti, Benefici, ProceduraAccesso;
- Temporalità (finestre VO + milestone esterna);
- riferimenti interdominio (party, utilization, professional/market/sector);
- Verifiche (M7.1) e pubblicazione/visibilità current-state (M7.2).

## 8. Tabelle finali

| # | Tabella | Responsabilità | Unità | Vuota ammessa |
|---|---|---|---|---|
| 1 | `opportunities` | Aggregate Root | M1.1 (+ M1.2, M5.2, M7.2) | Sì (istanze) |
| 2 | `opportunity_types` | Catalogo Tipologia | M2.1 | No post-apply (seed catalogo prescritto) |
| 3 | `opportunity_access_modes` | Catalogo ModalitàAccesso | M2.1 | No post-apply (seed catalogo prescritto) |
| 4 | `opportunity_type_assignments` | Associazione tipologia | M2.2 | Sì |
| 5 | `opportunity_access_mode_assignments` | Associazione modalità | M2.2 | Sì |
| 6 | `opportunity_sources` | Fonte (E02) | M3.1 | Sì |
| 7 | `opportunity_evidences` | Evidenza (E02) | M3.2 | Sì |
| 8 | `opportunity_audience_types` | Catalogo destinatari | M4.1 | No post-apply (seed catalogo prescritto) |
| 9 | `opportunity_audience_type_assignments` | Associazione audience | M4.1 | Sì |
| 10 | `opportunity_requirements` | Requisiti | M4.2 | Sì |
| 11 | `opportunity_benefits` | Benefici | M4.3 | Sì |
| 12 | `opportunity_access_procedures` | ProceduraAccesso 0..1 | M4.4 | Sì |
| 13 | `opportunity_time_windows` | Finestre temporali | M5.1 | Sì |
| 14 | `opportunity_party_references` | Riferimenti parte | M6.1 | Sì |
| 15 | `opportunity_representation_utilizations` | Snapshot rappresentanza | M6.2 | Sì |
| 16 | `opportunity_professional_references` | Riferimento Professionisti | M6.3 | Sì |
| 17 | `opportunity_market_references` | Riferimento mercati/territori | M6.3 | Sì |
| 18 | `opportunity_sector_references` | Riferimento settori | M6.3 | Sì |
| 19 | `opportunity_verifications` | Verifica per aspetto | M7.1 | Sì |

I seed dei cataloghi M2.1 e M4.1 sono **prescritti** dalle unit strutturali e **distinti** dal seed demo M8.1 (non eseguito).

## 9. Grafo delle dipendenze

- Owned / composizione → `opportunities` **ON DELETE CASCADE**.
- Assignments → cataloghi **ON DELETE RESTRICT**.
- Evidences → sources su `(id, opportunity_id)` (con SET NULL sul lato fonte dove previsto).
- Representation utilizations → party references **CASCADE**.
- Party / professional references → `profiles` **RESTRICT**.
- Sector references → `business_sectors` **RESTRICT**.
- `business_id`, `membership_id`, `market_id`: UUID opachi senza FK dove il Physical lo prevede.
- Nessun ciclo; nessuna FK verso Eventi o Collaborazioni outbound.

**Ordine topologico sintetico (inserimenti futuri):** cataloghi C05 (+ `profiles` / `business_sectors`) → `opportunities` → assignments → sources → evidences → requirements / benefits / access_procedures / time_windows → party_references → representation_utilizations → context references → verifications.

## 10. Constraint e invarianti

- **PK:** UUID sulle tabelle di istanza; `bigint identity` sui cataloghi; PK composite sulle assignment.
- **FK:** come §9; CASCADE sulle owned; RESTRICT verso cataloghi e `profiles`/`business_sectors`.
- **UNIQUE:** codici catalogo; aspetto verifica `(opportunity_id, aspect)`; procedura 0..1; primary source parziale; vincoli ruolo/publisher party; unique context pairs.
- **Vocabolari chiusi (CHECK text):** origin, lifecycle, kind finestre, ruoli party, aspect/status verifica, editorial/publication/visibility.
- **Anti-blank:** `btrim` su statement/note/label dove prescritto.
- **M7.1:** UNIQUE opportunity/aspect; CHECK status↔timestamp; `source_note` anti-blank se valorizzata; zero verifiche ammesse.
- **M7.2:** default `draft` / `unpublished` / `private` + `platform_*` NULL; `scheduled`/`published` ⇒ `editorial_status = approved`; `public` ⇒ `published`; `withdrawn` ⇒ non `public`; `withdrawn_at >= published_at`; `scheduled_for` obbligatorio solo in ramo `scheduled`.
- **NULL:** stati NOT NULL; timestamp piattaforma/verifica nullable con rami espliciti IS NULL / IS NOT NULL.

## 11. Indici

- Indici espliciti su FK/lookup e partial index M7.2 / primary source.
- Indici impliciti da PK e UNIQUE.
- Nessun indice su `platform_withdrawn_at` (conforme al Physical).
- Nessuna duplicazione o collisione di nome bloccante tra le migration Opportunità.

## 12. Funzioni e trigger

Pattern repository:

- funzione `public.set_<table>_updated_at()`;
- `SECURITY INVOKER`;
- `SET search_path = ''`;
- trigger `BEFORE UPDATE` per riga;
- un trigger per tabella che espone `updated_at`;
- M7.2 riusa `set_opportunities_updated_at` / `opportunities_set_updated_at` (M1);
- nessun `SECURITY DEFINER`.

Le tabelle di sola assignment senza `updated_at` non introducono trigger.

## 13. RLS e privilegi

Su tutte le tabelle Opportunità:

- `ENABLE ROW LEVEL SECURITY`;
- nessun `FORCE ROW LEVEL SECURITY`;
- nessuna policy;
- `REVOKE ALL … FROM anon, authenticated`;
- nessun `GRANT` nelle migration Opportunità.

`visibility_level` **non** modifica RLS. Le policy applicative restano rinviate. Nessun comportamento runtime è stato dimostrato in ambiente.

## 14. M8.1 — Decisione sul seed

### M8.1 SKIPPATA PER DECISIONE ARCHITETTURALE

- Sei record demo in `src/data/home/opportunities.ts`, tutti con `isDemo: true`.
- Dati frontend-only; incompleti rispetto a M1–M7; mapping non deterministico senza invenzioni.
- Assenza di Fonti, Evidenze, Verifiche e ownership editoriale.
- Rischio di contaminazione produzione in assenza di separazione formale seed-dev / seed-prod.
- Nessuna migration M8.1; nessun INSERT demo; nessun backfill; nessuna persistenza dei dati demo.
- I seed catalogo M2.1/M4.1 restano distinti e prescritti.

## 15. Strutture vuote

- `opportunities` può essere vuota.
- Tutte le tabelle owned, i riferimenti e le verifiche possono essere vuote.
- Nessun FK richiede istanze Opportunity.
- Nessun CHECK impone seed di Opportunity.
- I cataloghi prescritti non sono demo.
- M8.2 è valida su un dominio senza istanze di Opportunity.

## 16. Applicabilità statica

- Tutte le migration M1.1–M7.2 risultano **staticamente applicabili**.
- M7.2 è applicabile con soli rilievi editoriali non bloccanti.
- Catena ordinata; nessuna collisione bloccante.
- Prerequisiti esterni (`profiles`, `business_sectors`) presenti a timestamp precedenti.
- Nessuna dipendenza dal seed demo.
- **Nessuna applicazione reale** è stata eseguita.

## 17. Compatibilità PostgreSQL

- Target: **PostgreSQL 17.6.1**.
- Verifica **statica** di ALTER/CREATE, UUID, `gen_random_uuid()`, text, timestamptz, CHECK, UNIQUE, FK, partial indexes, COMMENT, plpgsql INVOKER, RLS, REVOKE.
- Nessun test runtime sul database.

## 18. Perimetri rinviati

| Elemento | Classificazione |
|---|---|
| Candidature / MdI / beneficiari / assegnazioni | Futuro piano dedicato (PC2) |
| Contenuti Editoriali | Futuro bounded context |
| Traduzioni / localizzazione / ricerca | Fuori piano M1–M8 |
| Analytics / notifiche / SEO | Fuori piano M1–M8 |
| Workflow avanzato / audit / storico | Fuori piano M1–M8 |
| Policy RLS applicative | Attività applicativa successiva |
| Frontend DB switch | Attività applicativa successiva |
| Dati reali | Processo editoriale futuro |

Non sono difetti della chiusura statica.

## 19. Rilievi residui

### Importanti

1. ~~Migration Plan non aggiornato rispetto allo stato effettivo~~ — **chiuso** dall’aggiornamento documentale concomitante a questo rapporto.
2. Test runtime non ancora eseguiti — **debito operativo** (vedi §20).

### Minori / editoriali

- Naming UNIQUE M7.1 (`…_key`) rispetto ad altri pattern `…_uidx`.
- Naming CHECK vocabolario M7.2 non citato letteralmente nel Physical (compositi sì).
- Commento finale `opportunities` senza ripetizione della frase M1 sul hard-delete.
- Commento `platform_withdrawn_at` senza parola esplicita «cancellazione/delete».
- Divergenza Logical/Physical sul vocabolario editoriale (dichiarata nel Physical; Thesis/Physical prevalgono).

Nessun rilievo residuo è bloccante per la chiusura statica.

## 20. Debiti operativi

Fuori dalla chiusura statica M8.2:

1. Applicazione controllata della catena migration.
2. Test runtime (strutturali, invarianti, lifecycle).
3. Verifica effettiva RLS e privilegi in ambiente.
4. Test di cancellazione / comportamento FK.
5. Test trigger `updated_at`.
6. Eventuale aggiornamento frontend.
7. Caricamento dati reali tramite processo editoriale futuro.

## 21. Criteri di accettazione M8.2

- [x] tutte le unità obbligatorie presenti;
- [x] ordine valido;
- [x] Physical riconciliato con SQL;
- [x] nessuna collisione bloccante;
- [x] M8.1 skippata;
- [x] nessun seed demo;
- [x] strutture vuote ammesse;
- [x] catena staticamente applicabile;
- [x] perimetri rinviati rispettati;
- [x] nessuna migration M8.2 necessaria;
- [x] nessun SQL eseguito;
- [x] nessuna migration applicata.

## 22. Decisione finale

**M8.2 APPROVATA CON RILIEVI NON BLOCCANTI — MIGRATION PLAN OPPORTUNITÀ COMPLETATO**

- Chiusura **statica** del piano M1–M8.
- Non chiusura operativa/runtime.
- Nessuna migration SQL aggiuntiva richiesta per il perimetro M1–M8.
- Distinzione obbligatoria: schema definito nel repository ≠ schema applicato al database.

## 23. Prossimi passi

1. Applicazione controllata della catena migration M1.1–M7.2.
2. Test runtime.
3. Verifica RLS e privilegi in ambiente.
4. Caricamento dati reali tramite processo editoriale futuro.
5. Switch frontend verso sorgente persistente.
6. Eventuale piano dedicato candidature/assegnazioni.

Questi punti **non** costituiscono nuove unità M8 né M7.3/M8.3.

---

*Fine del rapporto M8.2 — Opportunità.*
