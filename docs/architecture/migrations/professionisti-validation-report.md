# Professionisti — Validation and Reconciliation Report (M8.2)

## 1. Titolo e identificazione

| Campo | Valore |
|---|---|
| Dominio | Professionisti |
| Unità | **M8.2** — Validazione e accettazione finale |
| Artefatto | `docs/architecture/migrations/professionisti-validation-report.md` |
| Data verifica | 2026-08-03 |
| Branch | `main` |
| HEAD | `6d32dc01696b6d55ce5156b9ef4e2f816431491b` |
| `origin/main` | `6d32dc01696b6d55ce5156b9ef4e2f816431491b` |
| Ahead/behind | `0/0` |
| Supabase CLI | `2.109.1` |
| PostgreSQL locale | `17.6` (container) |
| PostgreSQL remoto (CLI temp) | `17.6.1.147` |
| Project ref | `hvfvfatlaspcpszgizhg` |
| Local migration head | `20260804240000` |
| Remote migration head | `20260804240000` |

---

## 2. Esito finale

`ACCETTATA`

Il ciclo 1 strutturale del dominio Professionisti (M1–M6 SQL + M8.1 SKIP + M8.2 report) è **accettato** a livello di riconciliazione documentale e di verifica catalogale locale/remota in sola lettura.

---

## 3. Scopo e perimetro

M8.2:

- valida **staticamente** Logical → Physical §29 → Migration Plan → 20 migration SQL M1–M6;
- confronta history e catalogo **locale** e **remoto**;
- registra formalmente **M8.1 SKIP** e **M7 assente**;
- **non** crea schema;
- **non** applica migration;
- **non** introduce seed demo;
- **non** sostituisce i test runtime già eseguiti per blocco (M1–M6).

**Fuori perimetro di questo report:** policy Identità & Accessi; Storage evidenze; catalogo Specializzazioni; FK `membership_id`; FEV per-credenziale; marketplace; domini successivi.

---

## 4. Prerequisiti

| Prerequisito | Stato | Evidenza |
|---|---|---|
| M1–M6 SQL in repository | Verificato | 20 file `20260803090000`…`20260804240000` |
| Commit M6 su `origin/main` | Verificato | `6d32dc0` |
| History locale fino a `20260804240000` | Verificato | `schema_migrations` locale |
| History remota fino a `20260804240000` | Verificato | `supabase migration list --linked` + query remota |
| M7 assente | Verificato | nessun file/unità M7 Professionisti |
| Working tree (pre-report) | Verificato | soli 3 docs architetturali M8 determinati |
| Stack locale operativo | Verificato | `supabase status` / Docker |

---

## 5. Inventario migration M1–M6

| Timestamp | File | Unità | Tabella / oggetti | Locale | Remoto | Repo |
|---|---|---|---|---|---|---|
| 20260803090000 | `create_professional_categories.sql` | M1.1 | `professional_categories` + seed 33 | Sì | Sì | Sì |
| 20260803100000 | `create_professional_practice_modes.sql` | M1.2 | `professional_practice_modes` + seed 11 | Sì | Sì | Sì |
| 20260803110000 | `create_professional_source_kinds.sql` | M1.3 | `professional_source_kinds` + seed 13 | Sì | Sì | Sì |
| 20260803120000 | `create_professional_service_natures.sql` | M1.4 | `professional_service_natures` + seed 7 | Sì | Sì | Sì |
| 20260804090000 | `create_professional_profiles.sql` | M2.1 | `professional_profiles` | Sì | Sì | Sì |
| 20260804100000 | `create_professional_qualifications.sql` | M3.1 | `professional_qualifications` | Sì | Sì | Sì |
| 20260804110000 | `create_professional_registrations.sql` | M3.2 | `professional_registrations` | Sì | Sì | Sì |
| 20260804120000 | `create_professional_authorizations.sql` | M3.3 | `professional_authorizations` | Sì | Sì | Sì |
| 20260804130000 | `create_professional_certifications.sql` | M3.4 | `professional_certifications` | Sì | Sì | Sì |
| 20260804140000 | `create_professional_association_memberships.sql` | M3.5 | `professional_association_memberships` | Sì | Sì | Sì |
| 20260804150000 | `create_professional_profile_categories.sql` | M4.1 | `professional_profile_categories` | Sì | Sì | Sì |
| 20260804160000 | `create_professional_competencies.sql` | M4.2 | `professional_competencies` | Sì | Sì | Sì |
| 20260804170000 | `create_professional_services.sql` | M4.3 | `professional_services` | Sì | Sì | Sì |
| 20260804180000 | `create_professional_served_territories.sql` | M5.1 | `professional_served_territories` | Sì | Sì | Sì |
| 20260804190000 | `create_professional_operational_languages.sql` | M5.2 | `professional_operational_languages` | Sì | Sì | Sì |
| 20260804200000 | `create_professional_served_markets.sql` | M5.3 | `professional_served_markets` | Sì | Sì | Sì |
| 20260804210000 | `create_professional_served_sectors.sql` | M5.4 | `professional_served_sectors` | Sì | Sì | Sì |
| 20260804220000 | `create_professional_profile_sources.sql` | M6.1 | `professional_profile_sources` | Sì | Sì | Sì |
| 20260804230000 | `create_professional_profile_evidences.sql` | M6.2 | `professional_profile_evidences` | Sì | Sì | Sì |
| 20260804240000 | `create_professional_profile_verifications.sql` | M6.3 | `professional_profile_verifications` | Sì | Sì | Sì |

**Conferme verificate.** Totale **20** migration SQL Professionisti; nessun file M7/M8; nessun gap nella sequenza Professionisti; local count = remote count = 20 nell’intervallo `20260803090000`–`20260804240000`.

**Nota storica (non errore Professionisti).** Alcuni timestamp di altri domini nel repository (es. `20260731236000`…) non sono calendar-valid; restano artefatti storici esterni a Professionisti e non alterano la history M1–M6 di questo dominio.

### Commit Git di blocco (verificati)

| Blocco | Commit | Messaggio |
|---|---|---|
| M1 | `b48b147` | `feat(db): add professionals block M1 catalogs` |
| M2 | `82fa4e4` | `feat(db): add professionals block M2 profile root` |
| M3 | `5761217` | `feat(db): add professionals block M3 credentials` |
| M4 | `54dfcff` | `feat(db): add professionals block M4 scope and services` |
| M5 | `f6079e3` | `feat(db): add professionals block M5 operational coverage` |
| M6 | `6d32dc0` | `feat(db): add professionals block M6 profile FEV` |

---

## 6. M8.1 — Seed dimostrativi: SKIP

**Decisione formale: SKIP.**

| Controllo | Esito |
|---|---|
| File SQL M8.1 | Assente (verificato in `supabase/migrations/`) |
| INSERT demo previsti dal Plan | Assenti |
| Modifica seed esistenti M1 | Non eseguita in M8 |
| Seed normativo C03 M1 | Presente e invariato (33/11/13/7) |
| Coerenza Logical / Physical / Plan | Sì — M8.1 SKIP dichiarato in §19 Plan / §29.35 Physical |

Nessun seed dimostrativo è stato creato, applicato o richiesto.

---

## 7. Matrice delle 20 tabelle

### 7.1 Esistenza, colonne, RLS, COMMENT (locale verificato; remoto riepilogato)

| Tabella | Cols (locale) | RLS | FORCE | Policy | COMMENT TABLE | Locale | Remoto |
|---|---:|---|---|---:|---|---|---|
| `professional_categories` | 8 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_practice_modes` | 6 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_source_kinds` | 6 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_service_natures` | 6 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_profiles` | 28 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_qualifications` | 19 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_registrations` | 19 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_authorizations` | 19 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_certifications` | 19 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_association_memberships` | 10 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_profile_categories` | 9 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_competencies` | 11 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_services` | 16 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_served_territories` | 11 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_operational_languages` | 10 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_served_markets` | 9 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_served_sectors` | 7 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_profile_sources` | 8 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_profile_evidences` | 8 | ON | OFF | 0 | Sì | Sì | Sì |
| `professional_profile_verifications` | 10 | ON | OFF | 0 | Sì | Sì | Sì |

**Remoto (aggregati verificati).** 20/20 tabelle presenti; 0 extra `professional_*`; 20/20 con RLS ON e FORCE OFF; policy=0; COMMENT TABLE=20; trigger=20.

**Locale aggiuntivo.** PK presenti su tutte; 20 trigger BEFORE UPDATE; 20 funzioni `updated_at` (19 `set_professional_*` + `set_prof_assoc_memberships_updated_at`); COMMENT ON COLUMN = **239/239** colonne; tabelle extra = 0.

### 7.2 Controlli strutturali chiave (locale)

| Controllo | Esito |
|---|---|
| FK owner → `professional_profiles` CASCADE sulle owned | Verificato (catalogo `pg_constraint`) |
| FK cataloghi / VO esterni RESTRICT o CASCADE UPDATE dove prescritto | Verificato (es. `source_kinds`, `languages`, `business_sectors`, `international_markets`, `competencies`) |
| UNIQUE `professional_profiles.person_id` | Verificato |
| UNIQUE current-state FEV `(professional_profile_id, aspect)` | Verificato |
| UNIQUE parziali declared (categorie/competenze/lingue/territori/mercati/settori) | Verificati via indici `*_declared_uidx` |
| CHECK count > 0 su tutte tranne sources (nessun CHECK vocabolario obbligatorio sulle note) | Verificato (`professional_profile_sources` check_count=0 — conforme Plan) |
| Privilegi PUBLIC/anon/authenticated | 0 grant (locale e remoto) |

---

## 8. Riconciliazione Logical / Physical / Plan / SQL

| Blocco | Responsabilità Logical | Physical | Plan | SQL | Catalogo L/R | Esito |
|---|---|---|---|---|---|---|
| M1 | Cataloghi C03 | §29.2 / §29.3.1–4 | §12 | 4 migration | 4 tabelle + seed | OK |
| M2 | Profilo AR Persona 1:1 | §29.3.5 | §13 | 1 migration | `professional_profiles` | OK |
| M3 | Credenziali + adesioni associative | §29.3.6–8 | §14 | 5 migration | 5 tabelle | OK |
| M4 | Ambito / competenze / servizi | §29.3.9–10 / §29.32 | §15 | 3 migration | 3 tabelle | OK |
| M5 | Copertura operativa | §29.3.11–14 / §29.33 | §16 | 4 migration | 4 tabelle | OK |
| M6 | FEV profilo | §29.3.15 / §29.21 / §29.34 | §17 | 3 migration | 3 tabelle | OK |
| M7 | — | Assente | §18 | nessuna | — | OK (assente) |
| M8 | Chiusura | §29.35 | §19 | nessuna SQL | report | OK (in corso di chiusura) |

**Assenze coerenti.** Nessuna tabella SQL senza fondamento §29; nessuna unità Plan M1–M6 non attuata; nessuna migration Professionisti aggiuntiva oltre le 20; nessuna responsabilità Logical del ciclo 1 lasciata senza tabella o SKIP esplicito (Specializzazioni = testo / rinviato; Storage = rinviato; membership FK = esclusa).

---

## 9. History locale e remota

| Controllo | Locale | Remoto |
|---|---|---|
| Head | `20260804240000` | `20260804240000` |
| Count Professionisti M1–M6 | 20 | 20 |
| Gap nella sequenza Professionisti | Nessuno | Nessuno |
| Migration M7 Professionisti | Nessuna | Nessuna |
| Migration M8 | Nessuna | Nessuna |
| Local-only / remote-only Professionisti | Nessuna | Nessuna |

`supabase migration list --local` e `--linked` mostrano allineamento sulle 20 versioni Professionisti. **Drift history = 0** (verificato).

---

## 10. RLS, policy e privilegi

| Controllo | Locale | Remoto |
|---|---|---|
| RLS ENABLE 20/20 | Verificato | Verificato (count=20) |
| FORCE RLS = false 20/20 | Verificato | Verificato |
| `pg_policies` su `professional_%` | 0 | 0 |
| Grant a PUBLIC/anon/authenticated | 0 | 0 |
| Deny-by-default | Inferito da RLS ON + 0 policy + REVOKE | Stesso pattern |

Nessun GRANT applicativo inatteso rilevato sulle 20 tabelle.

---

## 11. Seed e cataloghi

| Catalogo | Atteso | Locale | Remoto | Codici univoci (locale) |
|---|---:|---:|---:|---|
| `professional_categories` | 33 | 33 | 33 | dups=0 |
| `professional_practice_modes` | 11 | 11 | 11 | dups=0 |
| `professional_source_kinds` | 13 | 13 | 13 | dups=0 |
| `professional_service_natures` | 7 | 7 | 7 | dups=0 |

| Tabella istanza M2–M6 | Locale count | Remoto (campione) |
|---|---:|---|
| `professional_profiles` | 0 | 0 |
| FEV sources/evidences/verifications | 0 | 0 (sources/evidences/verifications campione remoto) |

Nessun seed M8; nessun dato runtime residuo sulle tabelle di istanza al momento della verifica.

---

## 12. COMMENT ON e documentazione

| Controllo | Esito |
|---|---|
| COMMENT ON TABLE 20/20 | Verificato locale e remoto |
| COMMENT ON COLUMN | Verificato locale **239/239** |
| COMMENT ON FUNCTION `updated_at` | Presenti nei file SQL / funzioni locali (pattern INVOKER + `search_path=''`) |
| Migration comment-only M7/M8 | Assente — conforme |

Nessuna mancanza contrattuale di COMMENT ON TABLE rilevata. Non è stata modificata alcuna migration per commenti.

---

## 13. Drift, limiti e osservazioni

### Drift

| Controllo | Esito |
|---|---|
| Tabella Professionisti senza migration | Nessuna |
| Migration Professionisti senza tabella | Nessuna |
| Oggetti M7/M8 SQL | Nessuno |
| Policy/GRANT inattesi | Nessuno |
| Trigger duplicati sulle 20 | Nessuno (1 per tabella) |
| Funzioni `updated_at` orfane rilevanti | Nessuna (20 funzioni dedicate) |
| Extra `professional_*` | 0 |

### Limiti noti (non bloccanti)

1. **Warning pg-delta / CLI:** eventuali warning CLI di confronto non bloccanti già osservati in cicli precedenti; non costituiscono drift strutturale delle 20 tabelle (history local=remote verificata).
2. **Timestamp non calendar-valid** di altri domini (`20260731236000`…): storici del repository; fuori perimetro Professionisti.
3. **Trailer `Co-authored-by: Cursor`** presente in commit di blocco recenti: metadato Git, non schema.
4. **Column counts remoti per-tabella:** non riesposti riga-per-riga in questa sessione; esistenza 20/20 + history identica + seed/RLS/policy allineati. Conteggio colonne dettagliato verificato **localmente**.
5. **Runtime M1–M6:** non rieseguiti in M8.2; restano evidenza dei cicli di blocco già chiusi.

### Esclusioni post-M8

Policy applicative Identità & Accessi; Storage/file evidenze; catalogo Specializzazioni; FK Appartenenze; FEV per-credenziale; badge complessivo; marketplace; history table generica.

---

## 14. Decisione finale e chiusura del dominio

| Voce | Decisione |
|---|---|
| M1–M6 | Chiusi (SQL applicate locale/remoto; versionate su Git) |
| M7 | Assente (motivato) |
| M8.1 | **SKIP** |
| M8.2 | **ACCETTATA** |
| Migration SQL M8 | Nessuna |
| Ciclo 1 Professionisti | **CHIUSO** a livello strutturale e documentale di accettazione |

**Formula di accettazione.**

`DOMINIO PROFESSIONISTI CICLO 1 ACCETTATO` — 20 migration SQL create, applicate e allineate locale/remoto fino a `20260804240000`; M7 assente; M8.1 SKIP; M8.2 ACCETTATA.

Messaggio commit previsto per la chiusura Git di questo report: `docs(db): add professionals validation report`.
