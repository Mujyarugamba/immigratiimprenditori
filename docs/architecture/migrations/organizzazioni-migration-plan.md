# Organizzazioni — Migration Plan

**Stato del documento:** Pianificazione statica completa — ciclo 1.
**Natura:** piano di migrazione documentale. Non crea file `.sql`, non applica migration, non contatta database, non esegue Supabase CLI operativa, non modifica Logical né Physical.

**Contratto fisico vincolante:** `docs/architecture/physical/domain-mapping/organizzazioni.md`.
**Contratto logico vincolante:** `docs/architecture/logical/organizzazioni.md`.

**Regola di autorità.** Il Plan **organizza** Logical + Physical in blocchi e unità; **non** li ridiscute, non li altera, non aggiunge/rimuove/rinomina tabelle o colonne, non cambia vocabolari, FK, `ON DELETE`, RLS o privilegi.

---

## 1. Titolo e stato

| Campo | Valore |
|---|---|
| Dominio | **Organizzazioni** |
| Artefatto | Migration Plan ciclo 1 |
| HEAD di riferimento (pre-SQL) | `6520bf80384c4c3658befc5622e1752c964b19e0` |
| Ultima migration repository | `20260807200000` (Contenuti M5.3) |
| SQL Organizzazioni | **Assenti** (da creare dopo approvazione Plan) |
| Stato | **Chiuso per creazione cumulativa M1–M3 (4 unità)** |

---

## 2. Scopo

Trasformare Logical e Physical Organizzazioni in roadmap operativa DDL-ready del ciclo 1:

* blocchi M1–M8 (con M4–M7 assenti espliciti);
* **4 unità SQL** (una tabella = una migration);
* timestamp, file, dipendenze, contratti operativi;
* modalità **accelerata cumulativa**;
* test statici/runtime, apply locale/remoto, Git, validazione M8.2.

Al termine di questo documento il dominio è **strutturalmente determinabile per SQL**. L’azione autorizzabile successiva è la **creazione contemporanea delle 4 migration**.

---

## 3. Fonti

| Priorità | Documento | Ruolo |
|---|---|---|
| 1 | `physical/domain-mapping/organizzazioni.md` | Contratto DDL-ready |
| 2 | `logical/organizzazioni.md` | Semantica |
| 3 | Migration Plan Contenuti / Eventi / Servizi | Pattern operativi |
| 4 | Validation report domini chiusi | Criteri M8.2 |
| 5 | Migration SQL `profiles`, `businesses`, `languages` | Tipi FK reali |
| 6 | `domain-dependency-map.md` | DC2, DV3, confini |
| 7 | `domain-model.md` / reconciliation | Gate; dominio a sé |

**Contraddizioni Logical ↔ Physical:** nessuna materiale. Plan creatibile senza nuove decisioni.

---

## 4. Modalità accelerata

Workflow **unico** per le 4 unità SQL:

1. creazione contemporanea delle **4** migration SQL;
2. controlli rapidi unitari (statici);
3. review indipendente **unica** M1–M3;
4. apply locale cumulativo `supabase migration up --local`;
5. validazione integrata runtime con `BEGIN`/`ROLLBACK`;
6. commit e push **unico** (Logical + Physical + Plan + 4 SQL);
7. dry-run remoto **unico** `supabase db push --linked --dry-run`;
8. apply remoto **unico** `supabase db push --linked`;
9. M8 finale (M8.1 SKIP; M8.2 report documentale).

**Una migration distinta per unità.** Nessun raggruppamento multi-tabella.
**Non** prevedere un ciclo completo apply/commit/push per ogni blocco.

---

## 5. Prerequisiti

| Prerequisito | Stato atteso |
|---|---|
| Branch `main` | Allineato a `origin/main` |
| Working tree pre-SQL | Logical + Physical + questo Plan (??) |
| Dipendenze esterne | `profiles`, `businesses`, `languages` |
| Head migration | ≥ `20260807200000` |
| Nessuna collision timestamp `20260808*` | Verificata al Plan |
| Nessuna migration Organizzazioni | Verificata |
| Domini chiusi intatti | Eventi/Servizi/Contenuti/Appartenenze/MI non modificati |
| Nessun `.temp` estraneo | Ok |

---

## 6. Inventario Physical

| # | Tabella | Natura | Unità |
|---|---|---|---|
| 1 | `organization_types` | Catalogo C03 | M1.1 |
| 2 | `organization_activity_scopes` | Catalogo C03 | M1.2 |
| 3 | `organizations` | Aggregate Root | M2.1 |
| 4 | `organization_officials` | Owned / ruolo | M3.1 |

**4/4 tabelle. Nessuna tabella extra.**

---

## 7. Dipendenze

### 7.1 Esterne

| Target | PK | Usata da | ON DELETE tipico |
|---|---|---|---|
| `profiles` | uuid | M2.1, M3.1 | RESTRICT (owner); RESTRICT (ufficiale; XOR stretto) |
| `businesses` | uuid | M2.1 | RESTRICT (owner e linked) |
| `languages` | **bigint** | M2.1 | RESTRICT |

### 7.2 Interne

| Target | Usata da |
|---|---|
| `organization_types` | M2.1 |
| `organization_activity_scopes` | M2.1 |
| `organizations` | M3.1 |

### 7.3 Vietate

Membership / Appartenenze Org; Eventi; Servizi; Contenuti; Opportunità; MI; `auth.users` come owner; Storage; FEV; Org–Org; `profiles.organization_type` come catalogo.

### 7.4 Assenza cicli

Cataloghi → AR → ufficiali. **Aciclico.**

---

## 8. Sequenza M1–M8

| Blocco | Presenza | Responsabilità | Unità SQL |
|---|---|---|---|
| **M1** | Presente | Cataloghi tipologies + ambiti | M1.1–M1.2 |
| **M2** | Presente | AR Organizzazione | M2.1 |
| **M3** | Presente | Ufficiali owned | M3.1 |
| **M4** | **Assente** | — | 0 |
| **M5** | **Assente** | — | 0 |
| **M6** | **Assente** | — | 0 |
| **M7** | **Assente** | — | 0 |
| **M8** | Presente (non SQL) | M8.1 SKIP; M8.2 report | 0 SQL |

**Ordine globale:**
M1.1 → M1.2 → M2.1 → M3.1 → (M8.1 SKIP) → M8.2.

---

## 9. Matrice blocchi / unità

| Codice | Blocco | Tabella | Timestamp | File futuro |
|---|---|---|---|---|
| M1.1 | M1 | `organization_types` | `20260808090000` | `20260808090000_create_organization_types.sql` |
| M1.2 | M1 | `organization_activity_scopes` | `20260808100000` | `20260808100000_create_organization_activity_scopes.sql` |
| M2.1 | M2 | `organizations` | `20260808110000` | `20260808110000_create_organizations.sql` |
| M3.1 | M3 | `organization_officials` | `20260808120000` | `20260808120000_create_organization_officials.sql` |
| M8.1 | M8 | — | — | **SKIP** |
| M8.2 | M8 | — | — | `docs/architecture/migrations/organizzazioni-validation-report.md` |

**4 timestamp univoci**, > `20260807200000`, nessuna collisione `20260808*` al Plan.

---

## 10. Contratti unitari

### M1.1 — `organization_types`

| Voce | Prescrizione |
|---|---|
| Codice | **M1.1** |
| Responsabilità | Catalogo C03 tipologies istituzionali + seed normativo 11 |
| Tabella | `public.organization_types` |
| Dipendenze | Nessuna tabella Organizzazioni |
| Prerequisiti | Schema `public` operativo |
| Ordine | 1 |
| Motivazione separazione | Catalogo autonomo referenziato da AR; seed normativo distinto |
| Timestamp / file | `20260808090000` / `…_create_organization_types.sql` |
| Contratto DDL | Physical §10.1–§10.2: PK `code`; C03; seed esatto 11; CHECK blank/sort; indici; trigger; RLS; REVOKE; COMMENT |
| Seed | `association` … `other` (sort 10…110) |
| Stop | Dopo file; review cumulativa successiva |

### M1.2 — `organization_activity_scopes`

| Voce | Prescrizione |
|---|---|
| Codice | **M1.2** |
| Responsabilità | Catalogo C03 ambiti di attività (struttura pronta) |
| Tabella | `public.organization_activity_scopes` |
| Dipendenze | Nessuna |
| Prerequisiti | Nessuno oltre M1.1 (ordine di blocco) |
| Ordine | 2 |
| Motivazione separazione | Catalogo distinto da tipologies; seed assente; responsabilità autonoma |
| Timestamp / file | `20260808100000` / `…_create_organization_activity_scopes.sql` |
| Contratto DDL | Physical §10.3: forma C03; seed **0** |
| Stop | Dopo file |

### M2.1 — `organizations`

| Voce | Prescrizione |
|---|---|
| Codice | **M2.1** |
| Responsabilità | Aggregate root scheda Organizzazione |
| Tabella | `public.organizations` |
| Dipendenze | M1.1, M1.2; `profiles`; `businesses`; `languages` |
| Prerequisiti | Cataloghi creati; FK esterne esistenti |
| Ordine | 3 |
| Motivazione separazione | Unica AR; ownership ternaria; sede su colonne; link Impresa; lifecycle |
| Timestamp / file | `20260808110000` / `…_create_organizations.sql` |
| Contratto DDL | Physical §7–§9, §11–§12: 35 colonne; CHECK ternary; publication gates; slug UNIQUE; indici; RLS; REVOKE; COMMENT; seed 0 |
| Invariante applicativa | Nessuna membership; link Impresa ≠ fusione |
| Stop | Dopo file |

### M3.1 — `organization_officials`

| Voce | Prescrizione |
|---|---|
| Codice | **M3.1** |
| Responsabilità | Rappresentanti e referenti owned |
| Tabella | `public.organization_officials` |
| Dipendenze | M2.1 (`organizations`); `profiles` |
| Prerequisiti | AR presente |
| Ordine | 4 |
| Motivazione separazione | Entity owned CASCADE; XOR Persona/etichetta; non mescolare con AR |
| Timestamp / file | `20260808120000` / `…_create_organization_officials.sql` |
| Contratto DDL | Physical §13: role_kind chiuso; XOR stretto Persona/etichetta; UNIQUE parziali primary e person+role; RESTRICT person; RLS; REVOKE; COMMENT; seed 0 |
| Stop | Chiusura SQL 4/4 |

---

## 11. M4–M7 — Assenti

| Blocco | Decisione |
|---|---|
| M4 | **Assente** — nessun link Eventi/Servizi/Contenuti/Opp/MI |
| M5 | **Assente** — nessuna membership / Org–Org |
| M6 | **Assente** — nessun FEV / documenti / Storage |
| M7 | **Assente** — COMMENT/RLS/REVOKE sono responsabilità di ogni unità M1–M3 |

Nessuna migration comment-only. Nessun SQL M4–M8.

---

## 12. M8 — Chiusura

### M8.1 — Seed dimostrativi

**SKIP.** Seed normativo solo M1.1 (11). Nessun seed AR/ufficiali.

### M8.2 — Validazione finale (non SQL)

File futuro: `docs/architecture/migrations/organizzazioni-validation-report.md`

Deve verificare: 4 migration; 4 tabelle; head `20260808120000`; drift 0; seed 11+0; RLS 4/12 pattern; policy 0; privilegi; COMMENT; hash; legacy/domini chiusi intatti; chiusura ciclo 1 `ACCETTATA`.

---

## 13. Timestamp e naming

| Verifica | Esito |
|---|---|
| > `20260807200000` | Sì |
| Univoci | 4 |
| Crescenti | Sì (`090000`…`120000` del 2026-08-08) |
| Collisioni `20260808*` | Nessuna al Plan |
| Pattern nome | `{timestamp}_create_{table}.sql` |

Funzioni: `set_organization_*_updated_at` (≤63 byte).  
Trigger: `{table}_set_updated_at`.

---

## 14. Pattern comune per ogni unità SQL

Per ciascuna delle 4 migration:

* una sola `CREATE TABLE` in `public`;
* PK/FK/UNIQUE/CHECK/indici come Physical;
* funzione `set_*_updated_at` `SECURITY INVOKER`, `search_path = ''`;
* trigger BEFORE UPDATE FOR EACH ROW;
* `ENABLE ROW LEVEL SECURITY`; FORCE false; **0 policy**;
* `REVOKE ALL` da PUBLIC, anon, authenticated;
* **0 GRANT** applicativi;
* COMMENT ON TABLE + colonne chiave + FUNCTION;
* vietati: `IF NOT EXISTS`, `DO`, SQL dinamico, `ON CONFLICT`, JSONB modellante, `entity_type`/`entity_id`.

---

## 15. RLS e privilegi

Prescritti per tutte e 4 le tabelle: ENABLE RLS; FORCE false; zero policy; REVOKE PUBLIC/anon/authenticated; zero GRANT; nessuna modifica impropria a postgres/service_role.

---

## 16. Test statici

Controlli su: 4 file; 4 CREATE TABLE; timestamp; nomi; colonne/tipi/null/default; PK/FK/azioni; UNIQUE/CHECK; indici; trigger; RLS; REVOKE; COMMENT; seed 11+0; identificatori ≤63; assenza SQL vietato; integrità migration precedenti.

---

## 17. Test runtime (ROLLBACK)

| Area | Casi |
|---|---|
| Cataloghi | seed types=11; scopes=0; PK/blank; RESTRICT |
| AR | owner Persona/Impresa/Redazione; ownership invalide; FK type/scope/language; slug duplicato; publication gates; operational indipendente; linked_business; sede blank-guard; updated_at |
| Ufficiali | Persona; etichetta; XOR; ruolo; primary unica; CASCADE |
| RLS | deny anon/authenticated su tutte e 4 |
| ROLLBACK | seed invariati; AR/ufficiali vuoti; zero fixture |

---

## 18. Apply locale / remoto / Git

| Fase | Prescrizione |
|---|---|
| Locale | `supabase migration up --local` cumulativo; vietati reset/repair/SQL manuale |
| Commit | Unico: Logical + Physical + Plan + 4 SQL |
| Remoto | `db push --linked --dry-run` → verifica 4 → `db push --linked` → `migration list --linked` |
| Vietati remoto | `--include-all`, `--include-seed`, `--db-url`, repair, reset |

---

## 19. Confini e oggetti vietati

Assenza di: membership; HR; CRM; Org–Org; FEV; Storage; multi-sede; grafi; workflow; FK retroattive Eventi/Servizi/Contenuti/Opp/MI; `auth.users` owner; policy applicative; seed demo AR; cooperativa come tipology; riuso `profiles.organization_type`.

---

## 20. Tabella riepilogativa

| Migration | Responsabilità | Tabelle | Dipendenze | Ordine |
|---|---|---|---|---|
| **M1.1** | Catalogo tipologies + seed 11 | `organization_types` | — | 1 |
| **M1.2** | Catalogo ambiti (seed 0) | `organization_activity_scopes` | — | 2 |
| **M2.1** | Aggregate root scheda | `organizations` | M1.1, M1.2, `profiles`, `businesses`, `languages` | 3 |
| **M3.1** | Ufficiali (rappresentanti/referenti) | `organization_officials` | M2.1, `profiles` | 4 |
| **M8.1** | Seed dimostrativi | — | — | SKIP |
| **M8.2** | Validation report | — | M1–M3 applicate | post-remoto |

---

## 21. Criteri di chiusura Plan

* 4/4 tabelle → 4 unità  
* Una tabella = una migration  
* Timestamp univoci > `20260807200000`  
* Dipendenze acicliche  
* M4–M7 assenti  
* M8.1 SKIP; M8.2 path definito  
* Coerenza integrale con Physical  
* Sufficiente per creare tutte le migration in un unico ciclo  

---

## 22. Stato roadmap

| Fase | Stato |
|---|---|
| Logical | Presente (working tree) |
| Physical | Presente (working tree) |
| Migration Plan | **Questo documento** |
| SQL M1–M3 (4 file) | Da creare in ciclo cumulativo |
| M8.2 | Da produrre a fine ciclo |

---

## 23. Stato finale

**Migration Plan Organizzazioni completo e approvabile.**  
4 unità SQL determinate; AR unico `organizations`; ownership ternaria; M4–M7 assenti; M8 non SQL.  
**Prossima azione autorizzabile:** creazione contemporanea delle 4 migration SQL secondo questo Plan.  
Nessun file `.sql` creato da questo documento.

---

## Checklist conclusiva

- [x] 4/4 tabelle → 4 unità
- [x] Timestamp univoci > `20260807200000`
- [x] AR unico (`organizations`)
- [x] Seed esatti 11+0
- [x] M4–M7 assenti
- [x] M8.1 SKIP; M8.2 path definito
- [x] Dipendenze acicliche
- [x] Nessuna membership / Org–Org / FEV / Storage
- [x] Modalità accelerata cumulativa
- [x] Sufficiente per creare tutte le migration in un unico ciclo
