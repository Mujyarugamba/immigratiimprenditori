# Mercati Internazionali — M8.2 Validation and Reconciliation Report

## 1. Esito

`APPROVATO DOPO REVIEW INDIPENDENTE — CICLO 1 TECNICAMENTE CHIUSO`

Il dominio Mercati Internazionali risulta **strutturalmente completo per il ciclo 1 Persona–Impresa** secondo Logical (nel perimetro fisico chiuso), Physical §35, Migration Plan e SQL M1–M5 applicati, verificati e pubblicati. Questo rapporto M8.2 è stato sottoposto a review indipendente documentale/tecnica/avversariale ed è **approvato** con le precisazioni sotto. Autorizzati esclusivamente staging, commit dedicato e push del **solo** file report.

## 2. Finalità

Questo rapporto è l’unità **M8.2 — validate and reconcile** del Migration Plan Mercati Internazionali.

M8.2:

- è un **artefatto Markdown non SQL** (Plan §7, §11, §19);
- valida staticamente Logical → Physical → Plan → Dependency Map → SQL M1–M5;
- riconcilia repository, cronologia migration e cataloghi PostgreSQL remoti;
- registra la decisione formale **M8.1 SKIP**;
- conferma l’assenza motivata di M6 e M7;
- **non** crea schema, **non** applica migration, **non** introduce seed demo, **non** crea policy/RPC/viste;
- **non** sostituisce test runtime mutanti esaustivi oltre agli smoke di catalogo.

## 3. Natura di M8.1 e M8.2

| Unità | Natura | File SQL | Responsabilità |
|---|---|---|---|
| **M8.1** | Seed demo istanze | Nessuno | **SKIP** — non inserire mercati, soggetti, presenze, relazioni o esigenze dimostrative. I seed M1.1–M1.3 sono **normativi**, non demo (Plan §11, §13). |
| **M8.2** | Report di validazione e riconciliazione | Nessuno | Markdown in `docs/architecture/migrations/`; prerequisito: SQL M1–M5 creati, applicati e allineati. |

**Nome file adottato** (Plan non fissa il path letterale; stile domini Imprese / Appartenenze / Opportunità):

`docs/architecture/migrations/mercati-internazionali-m8.2-validation-report.md`

## 4. Fonti documentali

| Priorità | Fonte | Ruolo |
|---|---|---|
| 1 | `docs/architecture/logical/mercati-internazionali.md` | Modello logico |
| 2 | `docs/architecture/physical/domain-mapping/mercati-internazionali.md` (§35 DDL-ready) | Contratto fisico normativo |
| 3 | `docs/architecture/migrations/mercati-internazionali-migration-plan.md` | Sequenza M1–M8, SKIP, chiusura |
| 4 | `docs/architecture/physical/domain-dependency-map.md` §6, D6–D9 | Dipendenze e confini |
| 5 | `docs/architecture/fundamental/domain-patterns.md` | Pattern trasversali |
| 6 | `docs/architecture/physical/architecture-baseline.md` | Catena mapping → piano → SQL |
| 7 | `docs/domain-model.md` | Collocazione dominio (quarto pilastro) |
| 8 | 17 file `supabase/migrations/20260731238*`…`20260802220000*` | DDL effettivo |
| 9 | Report M8.2 Imprese / Appartenenze / Opportunità | Convenzione naming/struttura |
| 10 | `supabase/.temp/postgres-version` | Target `17.6.1.147` |
| 11 | `supabase migration list` + `supabase db query --linked` | Remoto sviluppo |

## 5. Stato Git

| Controllo | Evidenza |
|---|---|
| Branch | `main` |
| Allineamento | `main` = `origin/main` |
| Working tree (post-M5, pre-commit M8.2) | solo untracked: questo report |
| HEAD | `eaee6e3` — `feat(db): add international markets block M5` |
| File M8.2 | creato; non ancora committato |
| Migration non versionate | nessuna |
| Migration SQL M8 | assente |
| Commit M1–M5 | `9138dc2` (M1), `002559b` (M2.1), `3afb791` (M2.2), `75d5833` (M2.3), `a7b49e8` (M3), `e2dae7e` (M4), `eaee6e3` (M5) |

## 6. Stato remoto

| Controllo | Evidenza |
|---|---|
| Progetto | `immigratiimprenditori` / ref `hvfvfatlaspcpszgizhg` |
| PostgreSQL | `17.6.1` |
| Cronologia | Local = Remote fino a `20260802220000` |
| Migration successive inattese | nessuna |
| M8 SQL | assente (conforme) |
| Tabelle dominio | **18** presenti (query catalogo) |
| Policy dominio | **0** |
| Seed demo | assente (solo cataloghi normativi popolati) |

## 7. Intervallo migration certificato

`20260731238000` … `20260802220000`

- **17** migration SQL di dominio;
- M6/M7 assenti per piano;
- M8.1 SKIP; M8.2 = questo report.

## 8. Inventario unità e migration

| Blocco | Unità | Timestamp | File | Tabelle | Dipendenze | Locale | Remoto | Commit | Seed |
|---|---|---|---|---|---|---|---|---|---|
| M1 | M1.1 | `20260731238000` | `create_international_activity_types.sql` | `international_activity_types` | — | sì | sì | `9138dc2` | 20 tipologiche |
| M1 | M1.2 | `20260731239000` | `create_international_access_channels.sql` | `international_access_channels` | — | sì | sì | `9138dc2` | 6 canali |
| M1 | M1.3 | `20260731240000` | `create_internationalization_need_types.sql` | `internationalization_need_types` | — | sì | sì | `9138dc2` | 19 tipi esigenza |
| M2 | M2.1 | `20260802090000` | `create_international_markets.sql` | `international_markets` | — | sì | sì | `002559b` | no |
| M2 | M2.2 | `20260802100000` | `create_international_market_countries.sql` | `international_market_countries` | M2.1 | sì | sì | `3afb791` | no |
| M2 | M2.3 | `20260802110000` | `create_international_market_support_resources.sql` | `international_market_support_resources` | M2.1 | sì | sì | `75d5833` | no |
| M3 | M3.1 | `20260802120000` | `create_international_market_presences.sql` | `international_market_presences` | M2.1; profiles; businesses; memberships | sì | sì | `a7b49e8` | no |
| M3 | M3.2 | `20260802130000` | `create_international_market_interests.sql` | `international_market_interests` | M2.1; profiles; businesses; memberships | sì | sì | `a7b49e8` | no |
| M3 | M3.3 | `20260802140000` | `create_international_market_activities.sql` | `international_market_activities` + `international_market_activity_type_links` | M3.1; M1.1; M1.2; business_sectors | sì | sì | `a7b49e8` | no |
| M4 | M4.1 | `20260802150000` | `create_international_commercial_relations.sql` | `international_commercial_relations` | M2.1; profiles; businesses; memberships | sì | sì | `e2dae7e` | no |
| M4 | M4.2 | `20260802160000` | `create_internationalization_needs.sql` | `internationalization_needs` | M1.3; M2.1 nullable; soggetto | sì | sì | `e2dae7e` | no |
| M5 | M5.1 | `20260802170000` | `create_international_market_presence_sources.sql` | `international_market_presence_sources` | M3.1 | sì | sì | `eaee6e3` | no |
| M5 | M5.2 | `20260802180000` | `create_international_market_presence_evidences.sql` | `international_market_presence_evidences` | M5.1; M3.1 | sì | sì | `eaee6e3` | no |
| M5 | M5.3 | `20260802190000` | `create_international_market_presence_verifications.sql` | `international_market_presence_verifications` | M3.1 | sì | sì | `eaee6e3` | no |
| M5 | M5.4 | `20260802200000` | `create_international_commercial_relation_sources.sql` | `international_commercial_relation_sources` | M4.1 | sì | sì | `eaee6e3` | no |
| M5 | M5.5 | `20260802210000` | `create_international_commercial_relation_evidences.sql` | `international_commercial_relation_evidences` | M5.4; M4.1 | sì | sì | `eaee6e3` | no |
| M5 | M5.6 | `20260802220000` | `create_international_commercial_relation_verifications.sql` | `international_commercial_relation_verifications` | M4.1 | sì | sì | `eaee6e3` | no |
| M6 | — | — | — | — | — | — | — | — | assente motivato |
| M7 | — | — | — | — | — | — | — | — | assente motivato |
| M8 | M8.1 | — | — | — | — | — | — | — | **SKIP** |
| M8 | M8.2 | — | questo report | — | M1–M5 | creato | n/a | non ancora | n/a |

**Ordine topologico effettivo:** M1.1→M1.2→M1.3→M2.1→M2.2→M2.3→M3.1→M3.2→M3.3→M4.1→M4.2→M5.1→M5.2→M5.3→M5.4→M5.5→M5.6. Conforme al Plan §6–§7.

## 9. Inventario tabelle (totale = 18)

| # | Tabella | Categoria | Classificazione | Ownership | PK | RLS | Seed | Confine |
|---|---|---|---|---|---|---|---|---|
| 1 | `international_activity_types` | Catalogo C03 | Catalogo | Dominio | `code` (`iat_pkey`) | sì | 20 | Tipologie Attività |
| 2 | `international_access_channels` | Catalogo C05 | Catalogo | Dominio | `code` (`iac_pkey`) | sì | 6 | ≠ `business_channels` |
| 3 | `internationalization_need_types` | Catalogo C03 | Catalogo | Dominio | `code` (`intnt_pkey`) | sì | 19 | Tipi Esigenza |
| 4 | `international_markets` | Governance | **AR** | Dominio | `id` (`inm_pkey`) | sì | 0 | Mercato |
| 5 | `international_market_countries` | Composizione | Entity owned | Mercato CASCADE | `id` (`imc_pkey`) | sì | 0 | `country_ref` opaco |
| 6 | `international_market_support_resources` | Supporto | Entity owned (provvisoria) | Mercato CASCADE | `id` (`imsr_pkey`) | sì | 0 | Futuro Organizzazioni |
| 7 | `international_market_presences` | Relazione d’uso | **AR** | Dominio | `id` (`imp_pkey`) | sì | 0 | Presenza |
| 8 | `international_market_interests` | Relazione d’uso | **AR** | Dominio | `id` (`imi_pkey`) | sì | 0 | Interesse |
| 9 | `international_market_activities` | Operatività | Entity owned | Presenza CASCADE | `id` (`ima_pkey`) | sì | 0 | Attività |
| 10 | `international_market_activity_type_links` | Link | Entity owned | Attività CASCADE | `id` (`imatl_pkey`) | sì | 0 | Tipi 0..N |
| 11 | `international_commercial_relations` | Relazione | **AR** | Dominio | `id` (`icr_pkey`) | sì | 0 | ≠ Collaborazione |
| 12 | `internationalization_needs` | Bisogno | **AR** | Dominio | `id` (`inn_pkey`) | sì | 0 | ≠ Opportunità |
| 13 | `international_market_presence_sources` | V03 | Entity owned | Presenza CASCADE | `id` (`imps_pkey`) | sì | 0 | Fonte Presenza |
| 14 | `international_market_presence_evidences` | V02 | Entity owned | Presenza CASCADE | `id` (`impe_pkey`) | sì | 0 | Evidenza Presenza |
| 15 | `international_market_presence_verifications` | V01 | Entity owned | Presenza CASCADE | `id` (`impv_pkey`) | sì | 0 | Verifica Presenza |
| 16 | `international_commercial_relation_sources` | V03 | Entity owned | Relazione CASCADE | `id` (`icrs_pkey`) | sì | 0 | Fonte Relazione |
| 17 | `international_commercial_relation_evidences` | V02 | Entity owned | Relazione CASCADE | `id` (`icre_pkey`) | sì | 0 | Evidenza Relazione |
| 18 | `international_commercial_relation_verifications` | V01 | Entity owned | Relazione CASCADE | `id` (`icrv_pkey`) | sì | 0 | Verifica Relazione |

**Conteggio colonne remote (somma):** 6+7+8+8+9+21+13+5+8+18+8+8+9+18+13+15+6+17 = **197** colonne sulle 18 tabelle (cataloghi PostgreSQL).

## 10. Copertura Logical Model

**Qualificazione.** La completezza dichiarata è **relativa al ciclo 1 Persona–Impresa** chiuso da Physical §35 e dal Plan, non una realizzazione esaustiva di ogni menzione Logical (F/E/V su Interesse/Attività; catalogo Territori; Organizzazioni; Professionisti).

| Concetto logico | Tabella fisica | Migration | Copertura ciclo 1 | Limite intenzionale |
|---|---|---|---|---|
| Mercato | `international_markets` | M2.1 | Completa | History composizione rinviata |
| Paese del Mercato | `international_market_countries` | M2.2 | Completa come ref opaco | Nessun catalogo Paesi locale; FK Territori futura |
| Risorsa di supporto | `international_market_support_resources` | M2.3 | Completa locale | Ownership futura → Organizzazioni |
| Presenza | `international_market_presences` | M3.1 | Completa | Professionista fuori ciclo 1 |
| Interesse | `international_market_interests` | M3.2 | Completa come AR | Nessuna catena F/E/V multi-aspetto (§35.15) |
| Attività | `international_market_activities` | M3.3 | Completa | Soggetto/mercato solo via Presenza |
| Tipi di Attività | catalogo + `…_activity_type_links` | M1.1 + M3.3 | Completa | 20 code |
| Canali di accesso | `international_access_channels` | M1.2 | Completa | 6 code; ≠ Imprese |
| Relazione commerciale | `international_commercial_relations` | M4.1 | Completa | No volumi/transazioni |
| Esigenza | `internationalization_needs` | M4.2 | Completa | No verifica/contestazione dedicate |
| Tipo Esigenza | `internationalization_need_types` | M1.3 | Completa | 19 code |
| Fonte | due tabelle M5.1/M5.4 | M5 | Parziale vs Logical pieno | Solo Presenza + Relazione; non Interesse/Attività |
| Evidenza | due tabelle M5.2/M5.5 | M5 | Parziale vs Logical pieno | Idem |
| Verifica | due tabelle M5.3/M5.6 + assi radice | M5 + M3/M4 | Parziale vs Logical pieno | Interesse: solo asse radice; Relazione: asse radice + tabella M5 |

Nessuna entità estranea introdotta (nessuna tabella Opportunità/Collaborazioni/Organizzazioni/Storage/`auth.users`).

## 11. Copertura Physical Model (§35)

| Contratto §35 | Natura | SQL | Esito |
|---|---|---|---|
| 35.1–35.3 cataloghi + seed | DDL | M1.1–M1.3 | OK (20/6/19 remoto) |
| 35.4 markets | DDL | M2.1 | OK |
| 35.5 countries | DDL | M2.2 | OK |
| 35.6 support resources | DDL | M2.3 | OK |
| 35.7 presences | DDL | M3.1 | OK |
| 35.8 interests | DDL | M3.2 | OK |
| 35.9 activities + links | DDL | M3.3 | OK |
| 35.10 commercial relations | DDL | M4.1 | OK |
| 35.11 needs | DDL | M4.2 | OK |
| 35.12 presence F/E/V | DDL | M5.1–M5.3 | OK |
| 35.13 commercial F/E/V | DDL | M5.4–M5.6 | OK |
| **35.14** funzioni/indici/commenti/privilegi | Pattern trasversale (non tabelle) | applicato nelle unit | OK — non è un contratto di tabella aggiuntiva |
| **35.15** mapping decisioni chiuse | Decisioni/limiti (non DDL) | riflesso in M1–M5 | OK — non richiede migration propria |
| Pattern RLS/privilegi | Pattern §35 intro | tutte le 18 | OK remoto |
| Pattern soggetto | Pattern §35 intro | quattro radici | OK SQL |

**Nota di precisione (review indipendente).** §35.8/§35.10/§35.11 prescrivono colonne di asse (`editorial_status`, `visibility_status`, e su Relazione anche `verification_status`) con default, ma **non** elencano sempre CHECK chiusi per tali assi. Il SQL è conforme a tali contratti: dove §35 non chiude il vocabolario, le colonne restano text+default senza CHECK. Non è un’omissione SQL rispetto a §35; è un limite di prescrittività del contratto fisico.

## 12. Aggregate Root

Classificazione da Logical §4/§9 e Physical §35 (non per analogia):

| Aggregate Root | Tabella |
|---|---|
| Mercato | `international_markets` |
| Presenza | `international_market_presences` |
| Interesse | `international_market_interests` |
| Relazione commerciale | `international_commercial_relations` |
| Esigenza | `internationalization_needs` |

**Risorsa di supporto:** Physical §35.6 = **E01** con `market_id` CASCADE (composizione owned del Mercato nel ciclo 1); Logical la descrive come entità di riferimento autonoma; Plan §17 rinvia ownership futura a Organizzazioni. **Classificazione ciclo 1: Entity owned del Mercato (provvisoria), non AR distinto.**

## 13. Entity owned

| Entity | Owner | ON DELETE |
|---|---|---|
| Paese del Mercato | Mercato | CASCADE |
| Risorsa di supporto | Mercato | CASCADE |
| Attività | Presenza | CASCADE |
| Link Attività–Tipo | Attività | CASCADE |
| Fonti / Evidenze / Verifiche Presenza | Presenza | CASCADE (Fonte→Evidenza SET NULL) |
| Fonti / Evidenze / Verifiche Relazione | Relazione | CASCADE (Fonte→Evidenza SET NULL) |

## 14. Cataloghi

| Catalogo | PK | Colonne remote | Seed remoto | Utilizzi |
|---|---|---|---|---|
| `international_activity_types` | `code` | 7 | **20** | Link M3.3 |
| `international_access_channels` | `code` | 6 | **6** | Attività `primary_access_channel_code` |
| `internationalization_need_types` | `code` | 6 | **19** | Esigenza `need_type_code` |

Cataloghi deliberatamente **non** creati: Paesi locali; Organizzazioni; Professionisti.

## 15. Pattern soggetto

Applicato su Presenza, Interesse, Relazione commerciale, Esigenza (Physical §35 pattern):

| Controllo | Esito |
|---|---|
| `subject_kind` ∈ `business` \| `person` | OK |
| XOR `business_id` / `person_id` | OK (CHECK) |
| `membership_id` solo se business | OK (CHECK) |
| FK soggetti `ON DELETE RESTRICT` | OK |
| Cross-row membership↔business | **Non enforced** (limite intenzionale) |
| Professionista | Assente (rinviato) |

Coerenza del pattern: **sì** sulle quattro radici.

## 16. Presenza

- Operatività effettiva nel Mercato; assi editoriale / relazione / verifica / visibilità + `is_contested` + `presence_configuration`.
- Nessuna UNIQUE (soggetto, market).
- Quattro indici applicativi prescritti: `imp_market_id_idx`, `imp_business_id_idx`, `imp_person_id_idx`, `imp_relation_status_idx` (presenti remoto).
- CHECK temporali su `started_at`/`ended_at` e stati aperti/chiusi/`abandoned`.
- Catena F/E/V dedicata (M5.1–M5.3).

## 17. Interesse

- Intenzione distinta dalla Presenza; nessuna FK reciproca Presenza↔Interesse.
- Nessuna conversione automatica; nessuna UNIQUE (soggetto, market).
- CHECK chiusi: `interest_level`, `relation_status`, `verification_status` (include `rejected`), soggetto, membership.
- Colonne `editorial_status`, `visibility_status`, `declaration_origin` presenti con default; **senza CHECK chiuso** (§35.8 non li elenca come CHECK).
- Nessun CHECK temporale su `started_at`/`ended_at` (conforme: prescritti solo su Presenza).
- Verifica della sola dichiarazione sull’asse radice; **nessuna** tabella F/E/V multi-aspetto (conforme §35.8 / §35.15). Tensione Logical (menziona fonti/evidenze anche per Interesse) vs Physical ciclo 1: **dichiarata e chiusa**.
- Nessun indice applicativo oltre PK.

## 18. Attività

- Owned da Presenza (`presence_id` CASCADE).
- Nessun `subject_*` / `market_id` duplicato.
- Tipologie 0..N via link UNIQUE `(activity_id, activity_type_code)`.
- Canale opzionale → catalogo M1.2 RESTRICT; settore opzionale → `business_sectors` RESTRICT.

## 19. Relazione commerciale

- `market_id` obbligatorio RESTRICT.
- Soggetto + controparte `external|business|person` con CHECK XOR label/FK.
- `relation_nature`: customer, supplier, distributor, agent, partner, investor (CHECK).
- `relation_status`: active, suspended, concluded, contested_hold, archived (CHECK).
- Colonne `editorial_status`, `verification_status`, `visibility_status` presenti con default; **senza CHECK chiuso** (conforme a §35.10, che non li elenca).
- Self-relation non vietata dal DDL.
- Assenza volumi/transazioni; assenza dipendenza da Presenza.
- Catena F/E/V dedicata (M5.4–M5.6) oltre all’asse radice.

## 20. Esigenza

- `market_id` nullable, `ON DELETE SET NULL`.
- Catalogo M1.3 RESTRICT; CHECK `priority` e `need_status`.
- Colonne `editorial_status`, `visibility_status` con default; **senza CHECK chiuso** (conforme a §35.11).
- Assenza colonne `verification_status` / `is_contested`; nessuna catena M5.
- Separata da Interesse, Opportunità, Servizio.

## 21–23. Fonti, Evidenze, Verifiche

| Catena | Radice | Fonti | Evidenze | Verifiche |
|---|---|---|---|---|
| Presenza | M3.1 | M5.1 CASCADE | M5.2 CASCADE; `source_id` SET NULL | M5.3 CASCADE; UNIQUE `(presence_id, aspect)`; 7 aspetti |
| Relazione | M4.1 | M5.4 CASCADE | M5.5 CASCADE; `source_id` SET NULL | M5.6 CASCADE; UNIQUE `(commercial_relation_id, aspect)`; 2 aspetti |

Certificazioni:

- nessuna FK Verifica→Fonte/Evidenza;
- nessuna sync automatica con assi radice;
- status per-aspetto: `unverified|in_review|confirmed|rejected` (default `unverified`);
- same-root Fonte–Evidenza **non** enforced (limite intenzionale).

## 24. PK

| Tabella | PK |
|---|---|
| tre cataloghi | `code` text |
| quindici tabelle istanza | `id` uuid DEFAULT `gen_random_uuid()` |

Totale: **18 PK**.

## 25. UNIQUE

| Nome | Tabella | Colonne | Tipo |
|---|---|---|---|
| `inm_code_unique` | markets | `code` | UNIQUE |
| `imc_market_country_unique` | countries | `(market_id, country_ref)` | UNIQUE |
| `imc_one_primary_per_market_uidx` | countries | `market_id` WHERE `is_primary` | UNIQUE parziale |
| `imatl_activity_type_unique` | type links | `(activity_id, activity_type_code)` | UNIQUE |
| `impv_presence_aspect_unique` | presence verifications | `(presence_id, aspect)` | current-state |
| `icrv_commercial_relation_aspect_unique` | relation verifications | `(commercial_relation_id, aspect)` | current-state |

Assenti (conforme): UNIQUE soggetto–mercato su Presenza/Interesse.

## 26–27. FK e ON DELETE (matrice)

**Conteggio remoto verificato:** **34** foreign key sul dominio (`pg_constraint` contype `f`).

| Da | Colonna | A | ON DELETE | Natura |
|---|---|---|---|---|
| countries | `market_id` | markets | CASCADE | owned |
| support_resources | `market_id` | markets | CASCADE | owned |
| presences | `market_id` | markets | RESTRICT | ref |
| presences | `business_id` / `person_id` / `membership_id` | businesses / profiles / memberships | RESTRICT | soggetto |
| interests | `market_id` + soggetto + membership | markets / businesses / profiles / memberships | RESTRICT | ref/soggetto |
| activities | `presence_id` | presences | CASCADE | owned |
| activities | `primary_access_channel_code` | access_channels | RESTRICT | catalogo |
| activities | `sector_id` | business_sectors | RESTRICT | condiviso |
| type_links | `activity_id` | activities | CASCADE | owned |
| type_links | `activity_type_code` | activity_types | RESTRICT | catalogo |
| commercial_relations | `market_id` | markets | RESTRICT | ref |
| commercial_relations | `business_id` / `person_id` / `membership_id` | businesses / profiles / memberships | RESTRICT | soggetto |
| commercial_relations | `counterpart_business_id` / `counterpart_person_id` | businesses / profiles | RESTRICT | controparte |
| needs | `market_id` | markets | **SET NULL** | opzionale |
| needs | soggetto + membership + `need_type_code` | businesses / profiles / memberships / need_types | RESTRICT | ref/catalogo |
| presence_sources | `presence_id` | presences | CASCADE | owned |
| presence_evidences | `presence_id` | presences | CASCADE | owned |
| presence_evidences | `source_id` | presence_sources | **SET NULL** | opzionale |
| presence_verifications | `presence_id` | presences | CASCADE | owned |
| commercial_relation_sources | `commercial_relation_id` | commercial_relations | CASCADE | owned |
| commercial_relation_evidences | `commercial_relation_id` | commercial_relations | CASCADE | owned |
| commercial_relation_evidences | `source_id` | commercial_relation_sources | **SET NULL** | opzionale |
| commercial_relation_verifications | `commercial_relation_id` | commercial_relations | CASCADE | owned |

Assenti: CASCADE da soggetti; FK Opportunità/Collaborazioni/Contenuti/Storage/`auth.users`; FK incrociate tra le due catene M5; FK Territori.

Inventario nominale completo delle 34 FK: nei file SQL M1–M5 e in `pg_constraint` remoto.

## 28–29. CHECK e vocabolari (sintesi certificata)

**Conteggio remoto verificato:** **64** CHECK sul dominio.

Inventario nominale completo: file SQL delle 17 migration + `pg_constraint` (contype `c`). Questa sezione classifica; non elenca tutti i 64 nomi.

### Assi con CHECK chiuso (estratto)

- Cataloghi: anti-blank code/label; `sort_order >= 0`.
- Soggetto XOR + membership-business sulle 4 radici.
- Mercato: kind / substantial / editorial + anti-blank.
- Presenza: editorial / relation / verification **senza** `rejected` / visibility / configuration / origin + **4** CHECK temporali.
- Interesse: interest_level / relation / verification **con** `rejected` (non editorial/visibility/origin).
- Attività: activity_status / visibility.
- Relazione: nature / counterpart_kind / counterpart XOR / relation_status (non editorial/verification/visibility).
- Esigenza: priority / need_status (non editorial/visibility).
- Support resources: kind / substantial / verification / visibility.
- M5: source_kind (9×2), aspect Presenza (7), aspect Relazione (2), status verifica (4×2).

### Colonne di asse senza CHECK chiuso (conforme a §35 ove non prescritto)

| Tabella | Colonne text+default senza CHECK |
|---|---|
| Interesse | `editorial_status`, `visibility_status`, `declaration_origin` |
| Relazione commerciale | `editorial_status`, `verification_status`, `visibility_status` |
| Esigenza | `editorial_status`, `visibility_status` |

I default di queste colonne **non** sono “appartenenti a un CHECK” inesistente; restano vincoli applicativi / estensioni future se il Physical chiuderà i vocabolari.

## 30. Temporalità

| Campo | Dove | Tipo | Note |
|---|---|---|---|
| `created_at` / `updated_at` | tutte le 18 | timestamptz NOT NULL default now() | tecnici |
| `started_at` / `ended_at` | Presenza, Interesse, Attività, Relazione | date NULL | CHECK solo Presenza (prescritti) |
| `opened_at` / `closed_at` | Esigenza | date NULL | |
| `declared_at` | Fonti | timestamptz NULL | |
| `observed_at` | Evidenze | timestamptz NULL | |
| `verified_at` / `expires_at` | Verifiche | timestamptz NULL | no auto-fill; no expiry auto |

## 31. Indici (remoto = SQL)

Prescritti e presenti oltre PK/UNIQUE:

- Markets: `inm_substantial_status_idx`, `inm_editorial_status_idx`, `inm_market_kind_idx`
- Countries: UNIQUE parziale primary
- Support resources: `imsr_market_id_idx`, `imsr_substantial_status_idx`
- Presences: quattro indici M3.1

Assenti (conforme): indici applicativi su M3.2, M3.3, M4, M5 oltre PK/UNIQUE.

Totale indici dominio osservati remoto: **33** (inclusi PK e UNIQUE).

## 32–33. Funzioni e trigger

- **18** funzioni `set_<table>_updated_at` — tutte `SECURITY INVOKER`, presenti remoto.
- **18** trigger `BEFORE UPDATE FOR EACH ROW` locali.
- Nessuna funzione cross-table / sync.
- Identificatore più lungo: `set_international_commercial_relation_verifications_updated_at` / trigger omonimo = **62 byte** (< 63).

## 34–36. RLS, policy, privilegi

Per tutte le 18 tabelle (SQL + remoto):

- RLS **ENABLE**; FORCE assente;
- policy = **0** (`pg_policies`);
- `REVOKE ALL` da `anon`, `authenticated` nelle migration;
- **zero** grant residui a `anon`/`authenticated` sul dominio (query `role_table_grants`, count = 0);
- nessun `GRANT` applicativo nelle migration del dominio;
- «nessun GRANT dominio» = nessuna istruzione GRANT nelle 17 migration e nessun privilegio residuo a ruoli client Supabase tipici; non afferma l’assenza di privilegi dell’owner PostgreSQL (attesi e non applicativi);
- pattern deny-by-default del ciclo corrente.

## 37. Seed

| Tipo | Stato |
|---|---|
| Normativo M1.1 / M1.2 / M1.3 | Presente (20 / 6 / 19) — verificato remoto |
| Demo istanze (M8.1) | **SKIP** — zero righe su AR/Entity |
| Seed frontend | Fuori perimetro SQL |

## 38. Dipendenze esterne ciclo 1

| Target | Uso | Natura |
|---|---|---|
| `profiles` | soggetto / controparte person | RESTRICT opaco |
| `businesses` | soggetto / controparte business | RESTRICT opaco |
| `business_memberships` | titolo opzionale | RESTRICT |
| `business_sectors` | settore Attività opzionale | RESTRICT |

Inbound attesi (non ownership): Imprese, Professionisti, Opportunità, Collaborazioni, Eventi, Contenuti, Osservatorio referenziano il Mercato senza possedere Presenza/Interesse.

## 39. Ordine

Ordine Plan = ordine file = ordine apply remoto. Nessuna collisione timestamp; nessuna migration M8 SQL.

## 40. Confini di dominio

Assenza di sovrapposizione ownership con:

| Dominio | Evidenza |
|---|---|
| Territori | solo `country_ref` testo |
| Organizzazioni | support resources locali provvisorie |
| Contenuti | nessun FK |
| Opportunità | nessuna FK; Esigenza distinta |
| Servizi | non nel dominio |
| Collaborazioni | Relazione commerciale distinta |
| Professionisti | fuori ciclo 1 |
| Identità & Accessi | nessun `auth.users` / policy |
| Storage | nessun file/hash URL strutturato obbligatorio |

## 41. Elementi esclusi / rinviati

| Elemento | Classificazione |
|---|---|
| M8.1 seed demo | Vietato / SKIP |
| Policy RLS applicative | Rinviato / applicativo |
| Badge / score / ranking | Vietato |
| Sync Verifiche → assi radice | Vietato (ciclo 1) |
| Conversione Interesse→Presenza automatica | Vietato |
| Catalogo Paesi locale | Vietato |
| FK Territori | Rinviato |
| Organizzazioni istituzionali | Futuro dominio / ownership Risorsa |
| Professionista come soggetto | Rinviato |
| F/E/V per Interesse e Attività | Limite intenzionale ciclo 1 |
| Enforcement same-root Fonte–Evidenza | Limite intenzionale |
| Enforcement membership↔business cross-row | Limite intenzionale |
| Volumi/transazioni commerciali | Rinviato |
| History/audit | Rinviato |
| API/RPC/UI | Applicativo futuro |
| M6 / M7 | Assenti motivati |

## 42. Limiti intenzionali

1. Fonte/Evidenza/Verifica solo per Presenza e Relazione commerciale.
2. Interesse verificabile solo come dichiarazione (asse radice).
3. `country_ref` opaco senza FK Territori.
4. Risorsa di supporto owned dal Mercato in attesa di Organizzazioni.
5. Nessun gate DB su same-root Fonte–Evidenza.
6. Nessun gate DB su coerenza membership.business_id ↔ business_id riga.
7. Assenza M6/M7 (comment-only / integrazioni) come da Plan.

## 43. Debiti tecnici vs rinvii (classificazione corretta)

| Voce | Classificazione corretta | Nota |
|---|---|---|
| Test mutanti runtime residuali (CASCADE/CHECK edge) non rieseguiti in questa attività | **Debito operativo di verifica** | Non è difetto di schema; smoke catalogo già eseguiti |
| Policy RLS applicative | **Attività applicativa / Identità & Accessi** | Rinviato intenzionalmente; non debito SQL |
| FK / mapping Territori | **Integrazione dominio futuro** | Limite intenzionale ciclo 1 (`country_ref`) |
| Ownership Risorse → Organizzazioni | **Futuro dominio / riorganizzazione ownership** | Limite intenzionale; non debito nascosto |
| Aggiornamento stati unità nel Migration Plan («Pianificata»→«Completata») | **Nota documentale opzionale** | Non richiesto da M8.2; non blocca chiusura tecnica SQL |
| Vocabolari asse senza CHECK su Interesse/Relazione/Esigenza | **Limite di prescrittività Physical §35** | SQL conforme; eventuale chiusura CHECK = estensione futura del contratto, non fix obbligatorio del ciclo 1 |

## 44. Osservazioni non bloccanti

- Logical menziona fonti/evidenze anche per Interesse/Attività; Physical ciclo 1 le limita a Presenza/Relazione — divergenza **dichiarata e chiusa** in §35.15.
- Commit M2.2/M2.3 separati rispetto al blocco M3 (ordine comunque corretto).
- Naming prefissi `imp_` / `imi_` / `ima_` / `icr_` / `inn_` / `imps_`… coerenti e ≤ 63 byte.

## 45. Anomalie

Nessuna anomalia **bloccante** tra Plan, Physical, SQL, remoto e Git.

**Rilievo non bloccante corretto in review:** la prima stesura del report sovrastimava i CHECK chiusi sugli assi editorial/visibility (e verification di Relazione). Corretto in §11, §17, §19, §20, §28–29.

## 46. Riconciliazione documenti ↔ SQL

| Asse | Esito |
|---|---|
| 17 SQL = Plan | OK |
| 18 tabelle = Plan §12 | OK |
| Seed 20/6/19 | OK remoto |
| Indici prescritti | OK remoto |
| M8.1 SKIP | OK (nessun SQL demo) |
| M6/M7 assenti | OK |

## 47. Riconciliazione locale ↔ remoto

| Controllo | Esito |
|---|---|
| Local = Remote fino a `20260802220000` | OK |
| 18 tabelle presenti | OK |
| RLS / zero policy | OK |
| Cataloghi 20/6/19 | OK |
| AR/Entity a 0 righe | OK (solo cataloghi popolati) |

## 48. Riconciliazione Git

| Controllo | Esito |
|---|---|
| HEAD `eaee6e3` | OK |
| Migration M1–M5 applicate, committate e pubblicate | OK |
| Report M8.2 | untracked; unico file fuori dal commit HEAD |
| Commit/push M8.2 | **autorizzati** dopo questa review (solo questo file) |

## 49. Condizioni di chiusura (Plan)

| Condizione | Stato |
|---|---|
| 17 unità SQL create | Soddisfatta |
| Ordine topologico rispettato | Soddisfatta |
| Apply remoto allineato | Soddisfatta |
| Contratti DDL §35.1–§35.13 coperti | Soddisfatta |
| Pattern §35.14 e decisioni §35.15 riflessi | Soddisfatta |
| M8.1 SKIP rispettato | Soddisfatta |
| M8.2 report prodotto | Soddisfatta |
| Review indipendente del report | **Soddisfatta** |
| Chiusura tecnica ciclo 1 | **Soddisfatta** |
| Commit/push del report | Pendente (passo successivo autorizzato) |

## 50. Esito finale del dominio (tecnico)

Il dominio Mercati Internazionali ha **chiusura tecnica del ciclo 1 Persona–Impresa** (SQL + remoto + Git delle migration + M8.2 approvato).

Restano fuori ciclo: policy applicative, integrazioni Territori/Organizzazioni/Professionisti, UI/API, dati editoriali.

## 51. Prossimi passi consentiti

1. Staging del solo `mercati-internazionali-m8.2-validation-report.md`.
2. Commit dedicato del solo report.
3. Push su `origin/main`.
4. Nessuna modifica SQL; nessuna nuova migration; nessun seed/policy in questa chiusura.

---

## Appendice A — Smoke remoto eseguito (sola lettura)

Strumento: `supabase db query --linked` (CLI 2.109.1). Nessun DML mutante.

Verificato in review indipendente: 18 tabelle; RLS/FORCE; 0 policy; **33** indici; **18** funzioni INVOKER; **18** trigger; **64** CHECK; **34** FK; grant `anon`/`authenticated` = 0; seed 20/6/19; istanze AR/Entity = 0.

## Appendice B — Review indipendente (post-creazione)

### Passaggio 1 — Documentale

Logical / Physical §35 / Plan / Dependency Map / Patterns / Baseline / domain-model: AR/Entity, M8.1 SKIP, M8.2 Markdown, confini OK. Correzione: completezza Logical qualificata al ciclo 1; §35.14–§35.15 distinte da DDL.

### Passaggio 2 — SQL

17 migration ricostruite; M3.3 = una migration / due tabelle; CHECK/FK/UNIQUE confrontati. Difetto report: CHECK sovrastimati su assi non chiusi. SQL conforme a §35 come scritto.

### Passaggio 3 — Remoto e Git

`migration list` Local=Remote fino a `20260802220000`; HEAD `eaee6e3`; solo report untracked; conteggi 18/33/18/18/64/34/0 policy confermati.

### Passaggio 4 — Confutazione (estratto 60 ipotesi)

| # | Ipotesi | Esito |
|---|---|---|
| 1–3 | M8.1 non SKIP / M8.2 non MD / path errato | Respinte |
| 4–7 | Intervallo / 17 migration / M3.3 doppia / 18 tabelle | Respinte (ricostruite) |
| 8–13 | Tabelle/AR/Entity/Risorsa | Respinte — Risorsa = owned provvisoria |
| 14–15 | Copertura Logical nascosta / Physical sovrastimata | **Parzialmente accolte sul report** — corrette qualifiche ciclo 1 e §35.14–15; CHECK assi aperti precisati |
| 16–18 | Seed / catalogo Paesi / soggetto | Respinte |
| 19–25 | membership enforced / sync P–I / Attività market / Esigenza obbligatoria / F/E/V Interesse / same-root | Respinte |
| 26–36 | PK/UNIQUE/FK/ON DELETE/CHECK/vocabolario/default/temporalità | **CHECK report corretto**; SQL OK vs §35 |
| 37–44 | Indici/fn/trigger/naming/RLS/policy/privilegi | Respinte (33/18/18/62 byte/0 policy/0 grants client) |
| 45–52 | Seed/dipendenze/confini/debiti/remoto/Git | **Debiti riclassificati**; resto OK |
| 53–60 | Commit M5 / file unico / SQL mutato / chiusura prematura | Respinte — chiusura tecnica dopo review; commit report autorizzato ora |

### Correzioni eseguite sul solo file M8.2

1. Esito e condizioni di chiusura aggiornati post-review.
2. Copertura Logical qualificata al ciclo 1.
3. §35.14–§35.15 distinte da contratti DDL.
4. CHECK/vocabolari: distinzione assi chiusi vs text+default.
5. Matrice FK esplicitata (controparti, M5 commercial); conteggi 34 FK / 64 CHECK.
6. Privilegi: precisato significato di «nessun GRANT».
7. Debiti tecnici riclassificati (policy/Territori/Organizzazioni/Plan ≠ debito SQL).
8. Sezioni Interesse / Relazione / Esigenza allineate ai CHECK reali.
