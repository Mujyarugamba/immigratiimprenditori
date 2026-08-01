# Mercati Internazionali — Migration Plan

## Nota introduttiva di esclusione

Questo documento è un **piano di migrazione concettuale**. Non crea file `.sql`, non scrive SQL eseguibile, non applica migrazioni, non contatta database, non usa Supabase CLI o Docker. Traduce Logical + Physical Domain Mapping (§35 DDL-ready) di Mercati Internazionali in una sequenza di unità additive, atomiche e revisionabili.

Fonti normative: Logical Mercati Internazionali → Physical Domain Mapping Mercati Internazionali (§35) → Dependency Map → Domain Patterns → Architecture Baseline. I piani Appartenenze/Imprese/Opportunità sono riferimenti di **metodo**, non autorità sul contenuto.

---

## Indice

1. Scopo  
2. Documenti vincolanti  
3. Principi  
4. Inventario oggetti  
5. Dipendenze  
6. Ordine delle migration  
7. Inventario delle unità  
8. Contratti per unità (M1–M5)  
9. M6 — Assente  
10. M7 — Assente  
11. M8 — Seed e validazione  
12. RLS e privilegi  
13. Seed  
14. Test statici e runtime  
15. Stop point  
16. Checklist generazione / review / applicazione  
17. Rischi e questioni rinviate  
18. Confutazione indipendente  
19. Deliverable di sequenza  

---

## 1. Scopo

Determinare in modo definitivo le unità **M1–M8** del dominio Mercati Internazionali **prima** della generazione di qualsiasi migration SQL, chiudendo ciclo 1 **Persona–Impresa**.

---

## 2. Documenti vincolanti

| Priorità | Documento |
|---|---|
| 1 | `docs/architecture/logical/mercati-internazionali.md` |
| 2 | `docs/architecture/physical/domain-mapping/mercati-internazionali.md` (§35) |
| 3 | `docs/architecture/physical/domain-dependency-map.md` (D6–D9 consolidate) |
| 4 | `docs/architecture/fundamental/domain-patterns.md` |
| 5 | `docs/architecture/physical/architecture-baseline.md` |

Confini letti: Persone, Imprese, Appartenenze, Professionisti, Opportunità, Collaborazioni, Identità & Accessi. Convenzioni tecniche da migration Appartenenze/Imprese/Opportunità (RLS, `updated_at`, naming) — senza trasferire vocabolari.

---

## 3. Principi

1. Single Owner: relazioni di mercato possedute da Mercati Internazionali.  
2. Nessun catalogo Paesi locale; `country_ref` opaco finché Territori non esiste.  
3. Presenza ≠ Interesse.  
4. Attività owned dalla Presenza.  
5. Esigenza ≠ Opportunità/Collaborazione.  
6. Relazione commerciale ≠ Collaborazione.  
7. Assi indipendenti; contestazione = `is_contested`.  
8. Soggetto ciclo 1: `business` XOR `person`; Professionisti rinviati.  
9. `membership_id` opzionale (D9) quando si agisce per Impresa.  
10. Deny-by-default RLS; policy → Identità & Accessi.  
11. Seed normativo ≠ seed demo.  
12. Nessuna unità M6/M7 artificiale.  

---

## 4. Inventario oggetti

| Oggetto | Tabella | Natura |
|---|---|---|
| Tipologie attività | `international_activity_types` | Catalogo C03 |
| Canali accesso | `international_access_channels` | Catalogo C05 |
| Tipi esigenza | `internationalization_need_types` | Catalogo C03 |
| Mercato | `international_markets` | AR governance |
| Composizione Paese | `international_market_countries` | Owned |
| Risorsa supporto | `international_market_support_resources` | Entity locale |
| Presenza | `international_market_presences` | AR |
| Interesse | `international_market_interests` | AR |
| Attività | `international_market_activities` | E02 |
| Link tipologia | `international_market_activity_type_links` | Owned |
| Relazione commerciale | `international_commercial_relations` | AR |
| Esigenza | `internationalization_needs` | AR |
| Fonti/Evidenze/Verifiche Presenza | `international_market_presence_*` | Owned |
| Fonti/Evidenze/Verifiche Relazione | `international_commercial_relation_*` | Owned |

**Totale tabelle ciclo 1: 18.**

---

## 5. Dipendenze

### Esterne disponibili

| Target | Uso |
|---|---|
| `public.profiles` | `person_id` RESTRICT |
| `public.businesses` | `business_id` / counterpart RESTRICT |
| `public.business_memberships` | `membership_id` opzionale RESTRICT |
| `public.business_sectors` | `sector_id` opzionale su Attività RESTRICT |

### Esterne non disponibili / gestite

| Target | Decisione |
|---|---|
| Catalogo Territori | Assente in SQL → `country_ref` text opaco (dipendenza aperta documentata) |
| Professionisti | Dominio non migrato → fuori ciclo 1 |
| Opportunità / Collaborazioni / Eventi | Nessuna FK da questo dominio |
| `auth.users` | Vietato |

### Grafo interno

```
activity_types ──────────────► activity_type_links ← activities
access_channels ─────────────► activities
need_types ──────────────────► internationalization_needs
markets ─┬─► market_countries
         ├─► support_resources
         ├─► presences ─┬─► activities
         │              └─► presence_sources → evidences; presence_verifications
         ├─► interests
         └─► commercial_relations ─► commercial_* sources/evidences/verifications
```

---

## 6. Ordine delle migration

1. M1.1 activity types (+ seed)  
2. M1.2 access channels (+ seed)  
3. M1.3 need types (+ seed)  
4. M2.1 international markets  
5. M2.2 market countries  
6. M2.3 support resources  
7. M3.1 presences  
8. M3.2 interests  
9. M3.3 activities + type links  
10. M4.1 commercial relations  
11. M4.2 internationalization needs  
12. M5.1 presence sources  
13. M5.2 presence evidences  
14. M5.3 presence verifications  
15. M5.4 commercial relation sources  
16. M5.5 commercial relation evidences  
17. M5.6 commercial relation verifications  
18. *(M6 assente)*  
19. *(M7 assente)*  
20. M8.1 seed demo = SKIP  
21. M8.2 validation report (non SQL)

**Stop point consigliati:** dopo M2.1; dopo M3.3; dopo M5.6; dopo M8.2.

**Numero definitivo migration SQL: 17.**

---

## 7. Inventario delle unità

| Blocco | Unità | Nome | Natura | Dipendenze |
|---|---|---|---|---|
| M1 | M1.1 | create international activity types | SQL | — |
| M1 | M1.2 | create international access channels | SQL | — |
| M1 | M1.3 | create internationalization need types | SQL | — |
| M2 | M2.1 | create international markets | SQL | — |
| M2 | M2.2 | create international market countries | SQL | M2.1 |
| M2 | M2.3 | create international market support resources | SQL | M2.1 |
| M3 | M3.1 | create international market presences | SQL | M2.1; profiles; businesses; memberships |
| M3 | M3.2 | create international market interests | SQL | M2.1; profiles; businesses; memberships |
| M3 | M3.3 | create international market activities | SQL | M3.1; M1.1; M1.2; business_sectors |
| M4 | M4.1 | create international commercial relations | SQL | M2.1; profiles; businesses; memberships |
| M4 | M4.2 | create internationalization needs | SQL | M1.3; M2.1 (nullable); profiles; businesses; memberships |
| M5 | M5.1 | create international market presence sources | SQL | M3.1 |
| M5 | M5.2 | create international market presence evidences | SQL | M5.1 |
| M5 | M5.3 | create international market presence verifications | SQL | M3.1 |
| M5 | M5.4 | create international commercial relation sources | SQL | M4.1 |
| M5 | M5.5 | create international commercial relation evidences | SQL | M5.4 |
| M5 | M5.6 | create international commercial relation verifications | SQL | M4.1 |
| M6 | — | *(assente)* | — | — |
| M7 | — | *(assente)* | — | — |
| M8 | M8.1 | demo/seed instances | **SKIP** | — |
| M8 | M8.2 | validate and reconcile | Report non SQL | M1–M5 |

---

## 8. Contratti per unità (M1–M5)

Per ogni unità: responsabilità atomica; oggetti = Physical §35 corrispondente; RLS/REVOKE; `updated_at` dedicato; commenti SQL; nessun GRANT/policy/`auth.uid()`.

### M1.1 — activity types

* **Output SQL:** `create_international_activity_types`  
* **Tabelle:** `international_activity_types`  
* **Seed:** **20** code normativi da Logical §5 (§35.1); non confondere con i 19 tipi Esigenza (M1.3)  
* **Esclusi:** demo; tipologie Imprese  
* **Test statici:** PK code; 20 insert; RLS  
* **Stop point:** no  

### M1.2 — access channels

* **Output:** `create_international_access_channels`  
* **Seed:** 6 code (§35.2)  
* **Esclusi:** `business_channels`  

### M1.3 — need types

* **Output:** `create_internationalization_need_types`  
* **Seed:** 19 code (§35.3)  

### M2.1 — markets

* **Output:** `create_international_markets`  
* **Physical:** §35.4  
* **Stop point:** sì — governance reviewabile  

### M2.2 — market countries

* **Output:** `create_international_market_countries`  
* **Physical:** §35.5  
* **Nota Territori:** `country_ref` opaco; dipendenza aperta  

### M2.3 — support resources

* **Output:** `create_international_market_support_resources`  
* **Physical:** §35.6  

### M3.1 — presences

* **Output:** `create_international_market_presences`  
* **Physical:** §35.7  
* **Stop point:** sì — primo AR relazionale  

### M3.2 — interests

* **Output:** `create_international_market_interests`  
* **Physical:** §35.8  

### M3.3 — activities (+ type links)

* **Output:** `create_international_market_activities`  
* **Tabelle:** activities + activity_type_links  
* **Physical:** §35.9  
* **Stop point:** sì  

### M4.1 — commercial relations

* **Output:** `create_international_commercial_relations`  
* **Physical:** §35.10  

### M4.2 — internationalization needs

* **Output:** `create_internationalization_needs`  
* **Physical:** §35.11  
* **`market_id`:** NULL ammessi  

### M5.1–M5.3 — presence sources / evidences / verifications

* **Physical:** §35.12  
* **Stop point dopo M5.3:** opzionale  

### M5.4–M5.6 — commercial relation sources / evidences / verifications

* **Physical:** §35.13  
* **Stop point:** sì — dominio strutturale completo  

---

## 9. M6 — Assente

Nessuna migration Mercati appartiene a M6.

**Motivazione.** Opportunità/Collaborazioni/Eventi referenziano il Mercato in modo unidirezionale; nessuna FK da creare in questo dominio. Professionisti resta fuori ciclo 1 senza unità artificiale di integrazione.

---

## 10. M7 — Assente

Nessuna M7.1 comment-only.

**Motivazione.** I commenti SQL prescritti sono parte di ciascuna unità M1–M5; §35 chiude i contratti DDL-ready. Non si replica M7 Imprese.

---

## 11. M8 — Seed e validazione

### M8.1 — seed demo

**Default: SKIP.**  
Non inserire mercati, soggetti, presenze, relazioni o esigenze dimostrative. I cataloghi M1.1–M1.3 sono seed **normativi**, non demo.

### M8.2 — validation report

Artefatto markdown non SQL da produrre dopo le migration SQL: verifica statica di oggetti, vincoli, ownership, assenza elementi vietati; distinzione da evidenze runtime.

---

## 12. RLS e privilegi

Per **tutte** le 18 tabelle:

* `ENABLE ROW LEVEL SECURITY`  
* nessun FORCE  
* nessuna policy  
* `REVOKE ALL` da `anon` e `authenticated`  
* nessun `GRANT`  
* nessun `auth.uid()`  

---

## 13. Seed

| Tipo | Ammissione |
|---|---|
| Seed normativo cataloghi M1.1–M1.3 | **Sì** |
| Seed demo istanze | **SKIP (M8.1)** |

---

## 14. Test statici e runtime

### Statici (ogni unità)

Oggetti; colonne; vincoli; dipendenze; ownership; vocabolari chiusi; assenza `auth.users`, CASCADE da soggetti, FK Opportunità, policy, GRANT, seed demo, catalogo Paesi locale.

### Runtime (dopo SQL, non in questo documento)

Reset completo; FK RESTRICT/CASCADE/SET NULL; CHECK temporali; UNIQUE; trigger `updated_at`; RLS senza policy; rollback; cataloghi invariati (20+6+19); zero residui.

**Non** attribuire al DB gate applicativi non prescritti (es. unicità globale di composizione tra Mercati).

---

## 15. Stop point finale

`Dominio Mercati Internazionali strutturalmente determinabile per SQL ciclo 1 Persona–Impresa; Territori opachi; Professionisti rinviati; policy e integrazioni additive separate.`

---

## 16. Checklist

### Generazione SQL

- [ ] Una responsabilità per file  
- [ ] Nomi ≤ 63 byte  
- [ ] Contratto §35 rispettato senza interpretazioni  
- [ ] Seed solo cataloghi  
- [ ] Nessuna FK a tabelle inesistenti  

### Review

- [ ] Presenza ≠ Interesse  
- [ ] Attività CASCADE da Presenza  
- [ ] Esigenza ≠ Opportunità  
- [ ] Relazione ≠ Collaborazione  
- [ ] Fonte/Evidenza/Verifica separate  
- [ ] `is_contested` overlay  
- [ ] RLS uniforme  

### Applicazione

- [ ] Solo `supabase db reset` in ambiente locale controllato  
- [ ] Verifica `schema_migrations`  
- [ ] Test in transazione con ROLLBACK  

---

## 17. Rischi e questioni rinviate

1. FK futura `country_ref` → catalogo Territori  
2. Soggetto Professionista (ALTER futuro)  
3. History composizione Mercato  
4. Ownership futura Risorsa → Organizzazioni istituzionali  
5. Estensione C03→C02 tipologie  
6. Volumi commerciali  
7. Collegamento Esigenza→Opportunità (dominio Opportunità)  
8. Policy RLS Identità & Accessi  
9. Unicità globale composizione tra Mercati (governance)  

---

## 18. Confutazione indipendente

| Accusa | Esito |
|---|---|
| Mercato senza radice | **Respinta** — `international_markets` A01 |
| Cataloghi non determinati | **Respinta** — M1.1–M1.3 + seed |
| Territori duplicato | **Respinta** — solo `country_ref` |
| FK Professionisti inesistente | **Respinta** — fuori ciclo 1 |
| Soggetto polimorfico irrisolto | **Respinta** — `subject_kind` + XOR FK |
| Presenza/Interesse fusi | **Respinta** — due AR |
| Attività non owned da Presenza | **Respinta** — CASCADE da presence |
| Relazione = Collaborazione | **Respinta** — esplicitamente esclusa |
| Esigenza = Opportunità | **Respinta** — esclusa |
| Fonte/Evidenza/Verifica confuse | **Respinta** — tabelle distinte |
| Assi fusi / badge | **Respinta** |
| Policy anticipate | **Respinta** |
| M6/M7 artificiali | **Respinta** — assenti motivati |
| Seed demo | **Respinta** — SKIP |
| Unità non atomiche | **Respinta** — 17 SQL revisionabili |
| Contratti insufficienti | **Respinta** — §35 DDL-ready |

Nessuna confutazione regge. Piano approvabile per generare M1.1.

---

## 19. Deliverable di sequenza

| Unit | Nome file previsto (descrittivo) | Stato piano |
|---|---|---|
| M1.1 | `create_international_activity_types` | **Pianificata** — SQL non creato |
| M1.2 | `create_international_access_channels` | **Pianificata** |
| M1.3 | `create_internationalization_need_types` | **Pianificata** |
| M2.1 | `create_international_markets` | **Pianificata** |
| M2.2 | `create_international_market_countries` | **Pianificata** |
| M2.3 | `create_international_market_support_resources` | **Pianificata** |
| M3.1 | `create_international_market_presences` | **Pianificata** |
| M3.2 | `create_international_market_interests` | **Pianificata** |
| M3.3 | `create_international_market_activities` | **Pianificata** |
| M4.1 | `create_international_commercial_relations` | **Pianificata** |
| M4.2 | `create_internationalization_needs` | **Pianificata** |
| M5.1 | `create_international_market_presence_sources` | **Pianificata** |
| M5.2 | `create_international_market_presence_evidences` | **Pianificata** |
| M5.3 | `create_international_market_presence_verifications` | **Pianificata** |
| M5.4 | `create_international_commercial_relation_sources` | **Pianificata** |
| M5.5 | `create_international_commercial_relation_evidences` | **Pianificata** |
| M5.6 | `create_international_commercial_relation_verifications` | **Pianificata** |
| M8.1 | demo seed | **SKIP** |
| M8.2 | validation report | **Da produrre dopo SQL** |

**MIGRATION PLAN MERCATI INTERNAZIONALI COMPLETATO A LIVELLO STATICO** — 17 unità SQL determinate; M6/M7 assenti; M8.1 SKIP; pronto per generare M1.1 su richiesta.
