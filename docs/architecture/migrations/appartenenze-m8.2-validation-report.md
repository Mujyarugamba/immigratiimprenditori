# Appartenenze — M8.2 Validation and Reconciliation Report

## 1. Esito

`ACCETTATA`

## 2. Scopo

Questo rapporto chiude formalmente il ciclo M1–M8 del dominio Appartenenze.

M8.2:

- valida **staticamente** Logical → Physical → Migration Plan → Dependency Map → SQL M1.1–M5.1;
- conferma l’assenza motivata di M6 e M7;
- registra la decisione formale **M8.1 SKIPPATA**;
- distingue l’accettazione statica dalle evidenze runtime già ottenute sulle unità M1.1–M5.1;
- **non** crea schema, **non** applica migration, **non** introduce seed demo, **non** riesegue test runtime.

## 3. Documenti analizzati

| Priorità | Fonte | Ruolo |
|---|---|---|
| 1 | `docs/architecture/logical/appartenenze.md` | Modello logico |
| 2 | `docs/architecture/physical/domain-mapping/appartenenze.md` | DDL-ready normativo |
| 3 | `docs/architecture/migrations/appartenenze-migration-plan.md` | Sequenza unit e accettazione |
| 4 | `docs/architecture/physical/domain-dependency-map.md` | Dipendenze e confini |
| 5 | `docs/architecture/fundamental/domain-patterns.md` | Pattern trasversali |
| 6 | `docs/architecture/physical/architecture-baseline.md` | Catena mapping → piano → SQL |
| 7 | Confini Persone, Imprese, Opportunità, Identità & Accessi, Professionisti, Collaborazioni | Ownership e non-ownership |
| 8 | Otto file `supabase/migrations/2026073123*_create_business_membership*.sql` | DDL effettivo |
| 9 | Assenza di `supabase/seed.sql` | Conferma assenza seed generale |

## 4. Inventario delle unità

| Blocco | Unità | Artefatto | Responsabilità | Stato |
|---|---|---|---|---|
| M1 | M1.1 | `20260731230000_create_business_membership_roles.sql` | Catalogo normativo ruoli (C03) | Completata |
| M1 | M1.2 | `20260731231000_create_business_memberships.sql` | Aggregate Root Persona–Impresa | Completata |
| M2 | M2.1 | `20260731232000_create_business_membership_qualifications.sql` | Qualifiche testuali (E04) | Completata |
| M3 | M3.1 | `20260731233000_create_business_membership_sources.sql` | Fonti informative (V03) | Completata |
| M3 | M3.2 | `20260731234000_create_business_membership_evidences.sql` | Evidenze per aspetto | Completata |
| M4 | M4.1 | `20260731235000_create_business_membership_management_authorizations.sql` | Autorizzazione gestionale (R8) | Completata |
| M4 | M4.2 | `20260731236000_create_business_membership_responsibility_declarations.sql` | Responsabilità dichiarate | Completata |
| M5 | M5.1 | `20260731237000_create_business_membership_verifications.sql` | Verifiche per aspetto (V04) | Completata |
| M6 | — | Nessuno | Integrazione Opportunità | **Assente motivato** |
| M7 | — | Nessuno | Comment-only | **Assente motivato** |
| M8 | M8.1 | Nessuno | Seed demo istanze | **SKIPPATA** |
| M8 | M8.2 | Questo rapporto | Validazione statica finale | **Completata** |

## 5. Inventario migration SQL

| Timestamp | File | Unità | Oggetti principali |
|---|---|---|---|
| 20260731230000 | `create_business_membership_roles.sql` | M1.1 | `business_membership_roles` + 11 insert normativi |
| 20260731231000 | `create_business_memberships.sql` | M1.2 | `business_memberships` |
| 20260731232000 | `create_business_membership_qualifications.sql` | M2.1 | `business_membership_qualifications` |
| 20260731233000 | `create_business_membership_sources.sql` | M3.1 | `business_membership_sources` |
| 20260731234000 | `create_business_membership_evidences.sql` | M3.2 | `business_membership_evidences` |
| 20260731235000 | `create_business_membership_management_authorizations.sql` | M4.1 | `business_membership_management_authorizations` |
| 20260731236000 | `create_business_membership_responsibility_declarations.sql` | M4.2 | `business_membership_responsibility_declarations` |
| 20260731237000 | `create_business_membership_verifications.sql` | M5.1 | `business_membership_verifications` |

Conferme:

- **8** migration SQL Appartenenze;
- timestamp ordinati e non collidenti;
- nessuna migration M6/M7/M8;
- nessun file SQL estraneo attribuito al dominio;
- per ogni tabella mutabile: funzione `updated_at` dedicata + trigger locale.

## 6. Conteggio oggetti

| Classe | Quantità |
|---|---|
| Unità di piano (M1.1–M5.1 + M8.1 skip + M8.2) | 10 (+ M6/M7 assenti motivati) |
| Migration SQL | 8 |
| Tabelle | 8 |
| Funzioni `updated_at` | 8 |
| Trigger locali | 8 |
| Cataloghi normativi | 1 (`business_membership_roles`, 11 codici) |
| Seed demo | 0 |

## 7. Verifica per migration SQL

| Unità | File | Tabelle/oggetti | Dipendenze | Esito |
|---|---|---|---|---|
| M1.1 | `20260731230000_…_roles.sql` | tabella ruoli, fn/trigger, 11 insert | nessuna Appartenenze | OK |
| M1.2 | `20260731231000_…_memberships.sql` | AR memberships, indici, fn/trigger, RLS | profiles, businesses, roles | OK |
| M2.1 | `20260731232000_…_qualifications.sql` | qualifiche, UNIQUE locale, CASCADE | memberships | OK |
| M3.1 | `20260731233000_…_sources.sql` | fonti, CASCADE | memberships | OK |
| M3.2 | `20260731234000_…_evidences.sql` | evidenze; source SET NULL; 7 aspetti | memberships, sources | OK |
| M4.1 | `20260731235000_…_management_authorizations.sql` | authz 0..1, status granted\|revoked | memberships | OK |
| M4.2 | `20260731236000_…_responsibility_declarations.sql` | 5 responsibility codes, UNIQUE locale | memberships | OK |
| M5.1 | `20260731237000_…_verifications.sql` | 7 aspetti, UNIQUE (membership, aspect) | memberships | OK |

Per ciascuna unità: responsabilità atomica; nessun oggetto anticipato; nessuna modifica a domini esterni; naming coerente; commenti presenti; constraint nominati; indici prescritti; RLS ENABLE + REVOKE ALL; nessun GRANT; nessun `auth.uid()`.

## 8. Modello radice (`business_memberships`)

| Controllo | Esito |
|---|---|
| Relazione Persona–Impresa | OK |
| FK `profiles` / `businesses` `ON DELETE RESTRICT` | OK |
| FK catalogo ruolo `ON DELETE RESTRICT` | OK |
| Assi indipendenti (relazione, verifica aggregata, contestazione, visibilità, ruolo) | OK |
| Contestazione separata (`is_contested`) | OK |
| Visibilità distinta da RLS | OK |
| Temporalità coerente (CHECK su date) | OK |
| Nessuna UNIQUE Persona–Impresa | OK |
| Multi-membership e successione consentite | OK |
| Nessun riferimento diretto ad `auth.users` | OK |

## 9. Catalogo ruoli e qualifiche

### Ruoli (M1.1)

| Controllo | Esito |
|---|---|
| 11 codici normativi | OK (`founder` … `sheet_manager`) |
| PK su `code` | OK |
| `typical_natures` descrittivo | OK |
| `contact_referent` non unico per Impresa | OK (nessun vincolo Impresa) |
| `sheet_manager` ≠ accesso tecnico | OK (commenti + assenza policy) |
| Nessun ruolo trasformato in responsabilità/autorizzazione | OK |

### Qualifiche (M2.1)

| Controllo | Esito |
|---|---|
| Ownership Appartenenza + CASCADE | OK |
| Cardinalità 0..N | OK |
| UNIQUE `(membership_id, label)` | OK |
| Distinte da ruoli normativi | OK |
| Distinte da qualifiche professionali | OK (commenti; nessun FK Professionisti) |

## 10. Fonti, Evidenze e Verifiche

| Separazione | Conferma |
|---|---|
| Fonte = origine informativa | OK (M3.1) |
| Evidenza = contenuto riferito a un aspetto | OK (M3.2) |
| Verifica = current-state decisionale per aspetto | OK (M5.1) |

| Controllo | Esito |
|---|---|
| Fonti CASCADE dalla membership | OK |
| Evidenze CASCADE dalla membership | OK |
| Fonte eliminata → `source_id SET NULL` | OK |
| Più Evidenze per aspetto | OK (nessuna UNIQUE aspetto) |
| Una Verifica per membership/aspetto | OK (UNIQUE) |
| Sette aspetti coerenti Evidenze/Verifiche | OK |
| Nessuna FK obbligatoria Evidenza→Verifica | OK |
| Nessuna sync automatica con asse aggregato radice | OK (assenza trigger cross-table) |
| Assenza badge / score / ranking / history | OK |

## 11. Autorizzazioni e responsabilità

### Autorizzazione gestionale (M4.1)

| Controllo | Esito |
|---|---|
| Cardinalità 0..1 (`UNIQUE membership_id`) | OK |
| Status `granted\|revoked` | OK |
| Current-state | OK |
| Distinta da `sheet_manager` e da `sheet_management` | OK |
| Nessun account / `auth.users` / policy tecnica | OK |

### Responsabilità dichiarate (M4.2)

| Controllo | Esito |
|---|---|
| Cinque codici | OK |
| `is_declared` | OK |
| UNIQUE locale per codice | OK |
| 0..5 responsabilità per membership | OK |
| Più `contact_referent` per Impresa via membership distinte | OK |
| Nessuna sync automatica con ruolo o autorizzazione | OK |

## 12. RLS e privilegi

Per tutte le 8 tabelle Appartenenze (verifica statica SQL):

| Controllo | Esito |
|---|---|
| `ENABLE ROW LEVEL SECURITY` | OK |
| `FORCE ROW LEVEL SECURITY` | Assente (OK) |
| Policy | Nessuna (OK) |
| `REVOKE ALL` da `anon` e `authenticated` | OK |
| `GRANT` | Nessuno (OK) |
| `auth.uid()` | Assente (OK) |

Il dominio è **deny-by-default**. Le policy definitive appartengono al ciclo Identità & Accessi; la loro assenza **non** rende incompleto il modello Appartenenze.

## 13. Funzioni e trigger

| Controllo | Esito |
|---|---|
| Una funzione `updated_at` per tabella mutabile | OK (8) |
| `SECURITY INVOKER` | OK |
| `search_path = ''` | OK |
| Un trigger locale per tabella | OK (8) |
| Trigger cross-table | Assenti (OK) |
| Sync automatica degli assi | Assente (OK) |
| Nomi troncati | Accettati dove necessari (`set_bm_*`) e coerenti al Plan |

## 14. Dipendenze interdominio

| Controllo | Esito |
|---|---|
| Dipendenza necessaria verso Persone e Imprese | OK (FK RESTRICT) |
| Nessuna ownership di Persone o Imprese | OK |
| Identità & Accessi applica permessi tecnici, non possiede il fatto | OK (nessuna policy qui) |
| Opportunità conserva `membership_id` opaco | OK (fuori ownership) |
| Nessuna FK a Opportunità da Appartenenze | OK |
| Eventuale FK su `opportunity_representation_utilizations.membership_id` = dominio Opportunità | OK (rinviata) |
| Professionisti / Collaborazioni possono usare Appartenenze senza esserne posseduti | OK |
| Organizzazioni istituzionali fuori perimetro | OK |

## 15. Elementi esclusi (assenti nell’intero set SQL)

Verificata l’assenza di: policy; GRANT; FK a `auth.users`; `auth.uid()`; account/claim/JWT; tabelle Organizzazioni; FK verso Opportunità; trigger su Imprese; modifica pubblicazione Imprese; badge; score; ranking; history; audit; Storage; file metadata; dati demo; stato sintetico unico dell’Appartenenza; UNIQUE Persona–Impresa; referente unico per Impresa.

## 16. Evidenze runtime (già completate; non rieseguite in M8.2)

Tutte le unità M1.1–M5.1 risultano già, nelle verifiche precedenti della conversazione:

- applicate mediante `supabase db reset`;
- presenti in `schema_migrations`;
- verificate nel catalogo PostgreSQL;
- sottoposte a test comportamentali;
- testate con rollback;
- prive di dati residui di test;
- prive di regressioni rilevate.

**Distinzione.** M8.2 è validazione **statica**. Le evidenze runtime sono prerequisito operativo **già soddisfatto** e non vengono rieseguite in questa attività.

## 17. Questioni aperte ammesse (non incompletezze)

Fuori perimetro o rinviate: policy RLS future; integrazione FK con Opportunità; history contestazioni/verifiche; Organizzazioni istituzionali; qualifiche professionali; workflow applicativi di autorizzazione; moderazione; audit tecnico.

## 18. Confutazione indipendente

Tentativo di dimostrare che il dominio non sia chiudibile:

| Accusa | Esito |
|---|---|
| Unità mancanti rispetto al Plan | **Respinta** — M1.1–M5.1 presenti; M6/M7 assenti motivati; M8.1 skip; M8.2 presente |
| Dipendenze non soddisfatte | **Respinta** — Persone/Imprese referenziate con RESTRICT |
| Vocabolari incoerenti | **Respinta** — CHECK chiusi allineati al Physical |
| FK con ON DELETE errato | **Respinta** — RESTRICT su soggetti/ruolo; CASCADE sulle owned; SET NULL su fonte |
| Assi fusi | **Respinta** — contestazione/verifica/visibilità/relazione/ruolo distinti |
| Ruolo/responsabilità/autorizzazione sovrapposti | **Respinta** — tre rappresentazioni separate |
| Fonte/Evidenza/Verifica confuse | **Respinta** — tre tabelle con responsabilità distinte |
| Cardinalità troppo restrittive | **Respinta** — nessuna UNIQUE Persona–Impresa; 0..N qualifiche/fonti/evidenze |
| Politica RLS anticipata | **Respinta** — deny-by-default senza policy |
| Dati demo impropri | **Respinta** — solo catalogo normativo; M8.1 SKIPPATA |
| Oggetti M6/M7 necessari ma omessi | **Respinta** — motivazione Plan §19–§20 |
| Necessità di riaprire Imprese o Opportunità | **Respinta** — nessuna modifica esterna |
| SQL non ancora applicato | **Respinta** — evidenze runtime già registrate |
| Regressioni runtime | **Respinta** — nessuna rilevata nelle verifiche precedenti |
| File mancanti | **Respinta** — 8 SQL + Plan + questo report |

Nessuna confutazione regge. Il dominio è chiudibile.

## 19. Conflitti rilevati

Nessuno.

## 20. Osservazioni non bloccanti

Nessuna nuova osservazione bloccante o non bloccante emersa in M8.2 oltre a quelle già accettate nelle verifiche runtime delle unità M1–M5 (es. assenza intenzionale di CHECK status–timestamp su verifiche; naming abbreviato `set_bm_*` dove necessario).

## 21. Decisione M8.1

`SKIPPATA`

## 22. Decisione finale di dominio

`DOMINIO APPARTENENZE COMPLETATO E ACCETTATO`

## 23. Limiti rispettati da questa attività

- File SQL modificati: nessuno
- SQL eseguito: no
- Database contattato: no
- Commit creato: no
- Push eseguito: no
- Dominio successivo: non avviato
