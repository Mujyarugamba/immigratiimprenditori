# Production release runbook — Centro Studi

Data di riferimento: 2026-08-23
Stato: **PREPARATO — NON AUTORIZZA IL RILASCIO**
Branch sorgente: `feature/research-radar-ai-knowledge-20260822`
Production branch corrente: `main` — da non modificare prima dei gate finali.

Questo runbook traduce `supabase/CS-PRODUCTION-RELEASE.json` in una sequenza operativa controllata. Non contiene credenziali e non autorizza alcuna scrittura su production.

## Regole inderogabili

1. **Mai** eseguire `supabase db push` sull'intera directory storica `supabase/migrations` per questo rilascio.
2. Le quattro baseline cold-start sono esclusivamente per ricostruzione locale e non vanno applicate al progetto hosted esistente.
3. Le due migration repository già riconciliate con versioni hosted precedenti non vanno riapplicate.
4. Prima di qualsiasi write production occorre una nuova lettura dello storico migration hosted.
5. Occorrono backup production cifrato/checksum e restore drill completato su ambiente non-production.
6. Occorre autorizzazione esplicita prima dell'applicazione delle migration e una seconda autorizzazione separata prima del deploy production.
7. Le **23 candidate** vanno applicate **una alla volta, in ordine cronologico**, verificando l'esito prima di passare alla successiva.
8. Al primo errore inatteso: **STOP**. Non ripetere alla cieca una migration parzialmente eseguita.
9. Nessun contenuto viene auto-pubblicato durante il rilascio; Radar/AI restano review-only.
10. Il form pubblico non è considerato production-hardened finché il rate-limit persistente non è applicato e verificato live.
11. Le Storie reali non sono un gate pre-go-live: outreach/interviste iniziano solo dopo sito online + live smoke PASS.
12. La governance editoriale è **ibrida**: same-editor per contenuti ordinari, seconda approvazione distinta per contenuti sensibili/istituzionali, indicatori Osservatorio e correzioni sostanziali/retraction.

## Stato hosted osservato

Ultima migration production osservata in sola lettura:

`20260820160000_prepare_events_external_ingestion_rls`

Questa fotografia va riletta immediatamente prima del rilascio. Se lo storico hosted è cambiato, il piano deve essere rigenerato e il rilascio si ferma.

## Alias repository già applicate — NON RIAPPLICARE

| File repository | Versione hosted equivalente |
| --- | --- |
| `20260820170000_editorial_foundation_v1.sql` | `20260819102530_editorial_foundation_v1` |
| `20260820171000_editorial_submission_country_labels.sql` | `20260819103031_editorial_submission_country_labels` |

## Candidate delta — ordine vincolante

1. `20260820173000_harden_editorial_public_submission.sql`
2. `20260821235000_prioritize_platform_languages.sql`
3. `20260822120000_prepare_content_translation_groups.sql`
4. `20260822130000_seed_atlas_italian_territories.sql`
5. `20260822131000_seed_atlas_foreign_subnational_priorities.sql`
6. `20260822132000_expand_oecd_birth_self_employment_atlas.sql`
7. `20260822133000_expand_foreign_firms_all_italian_regions.sql`
8. `20260822134000_add_atlas_origin_business_communities.sql`
9. `20260822135000_add_foreign_firms_sector_evidence.sql`
10. `20260822143000_publication_series_architecture.sql`
11. `20260822150000_prepare_content_versions_and_corrections.sql`
12. `20260822151000_prepare_author_profiles.sql`
13. `20260822155000_knowledge_search_architecture.sql`
14. `20260822161000_editorial_automation_architecture.sql`
15. `20260822162500_editorial_activity_insert_policy.sql`
16. `20260822172000_harden_content_publication_gate.sql`
17. `20260822183000_persistent_public_submission_rate_limits.sql`
18. `20260822184500_editorial_login_rate_limits.sql`
19. `20260822190000_enforce_privileged_mfa_aal2.sql`
20. `20260822210500_go_live_audit_analytics.sql`
21. `20260822211500_fix_public_rls_mfa_compatibility.sql`
22. `20260822212000_backfill_futurae_route_evidence.sql`
23. `20260822213000_hybrid_editorial_review_governance.sql`

Il guard `scripts/ci/production-migration-plan-smoke.mjs` verifica automaticamente che l'elenco resti completo, ordinato, senza duplicati e senza drift rispetto ai file post-cutoff del repository.

## Fase 0 — precondizioni editoriali e decisionali

Prima di iniziare qualsiasi procedura live devono essere esplicitamente noti:

- esito QA umano WCAG/device (#92);
- esito revisione legale finale;
- governance review: **DECISA — modello ibrido**, da verificare tecnicamente sul candidato e poi live;
- decisione required checks `main`;
- identità del commit candidato e deployment Vercel candidato;
- restore drill non-production completo e verificato;
- enrollment/verifica MFA reale dell'account privilegiato Production.

Le Storie reali non sono una precondizione: la superficie `/storie` deve essere sana anche a zero contenuti reali e l'acquisizione editoriale parte soltanto dopo il live smoke.

## Fase 1 — fresh read-only audit production

Eseguire senza write:

- stato progetto Supabase;
- storico migration hosted e ultima versione;
- Security Advisor;
- conteggi/visibilità minimi di contenuti, eventi, account, fonti;
- configurazione Auth rilevante;
- stato DNS/hosting candidato.

**Hold point A:** se l'ultima migration hosted non è ancora `20260820160000`, fermarsi e riconciliare il piano.

## Fase 2 — backup e restore drill

Prima delle migration:

1. creare backup logical Supabase CLI coerente con la piattaforma;
2. cifrare l'archivio prima di conservarlo fuori dal runner;
3. calcolare e registrare checksum;
4. verificare ruoli/schema/dati esportati;
5. ripristinare il backup in ambiente **non-production** isolato;
6. eseguire controlli minimi di schema, dati e RLS sul restore.

Al 23 agosto 2026 il restore drill locale ha individuato una resistenza sulla configurazione gestita del ruolo `log_min_messages`; il gate resta **PENDING** e non va aggirato con una dichiarazione manuale di PASS.

**Hold point B:** nessuna migration production senza backup verificato e restore drill riuscito.

## Fase 3 — autorizzazione migration

Richiedere autorizzazione esplicita per l'applicazione delle **23 candidate**. L'autorizzazione deve riferirsi al commit candidato e allo storico hosted appena verificato.

**Hold point C:** senza autorizzazione non eseguire alcuna write.

## Fase 4 — applicazione una per una

Per ogni migration candidate:

1. rileggere il file che si sta per applicare;
2. verificare che corrisponda al commit autorizzato;
3. applicare soltanto quel file;
4. controllare esito SQL e migration history;
5. se l'operazione fallisce o restituisce stato ambiguo: STOP;
6. non passare al file successivo finché l'esito non è deterministico.

### Checkpoint sicurezza obbligatorio dopo #16

Dopo `20260822172000_harden_content_publication_gate.sql` verificare:

- anon non può pubblicare;
- contributor non può auto-elevarsi;
- editor/admin gate ancora coerente;
- nessun bypass service-role applicativo di pubblicazione.

### Checkpoint form obbligatorio dopo #17

Dopo `20260822183000_persistent_public_submission_rate_limits.sql` verificare live:

- tabella rate-limit non leggibile/scrivibile dai client;
- chiavi archiviate come hash, non e-mail raw;
- soglia per e-mail operativa;
- soglia globale operativa;
- submission valida continua ad arrivare in Inbox;
- nessuna auto-pubblicazione.

### Checkpoint Auth obbligatorio dopo #18–#19

Verificare:

- login rate limiting;
- contributor/editor separation;
- AAL1 negato alle operazioni privilegiate;
- TOTP/AAL2 configurato e funzionante per ruoli privilegiati;
- auto-elevazione negata.

### Checkpoint audit/analytics dopo #20–#21

Verificare:

- audit canonico;
- analytics aggregate e cookie-less secondo configurazione autorizzata;
- letture pubbliche compatibili con MFA/RLS;
- nessuna regressione nelle pagine anonime.

### Checkpoint governance ibrida dopo #23

Dopo `20260822213000_hybrid_editorial_review_governance.sql` verificare:

- un contenuto ordinario resta pubblicabile dal medesimo redattore;
- un contenuto sensibile non è pubblicabile senza review;
- il richiedente non può approvare la propria review;
- un secondo account redazionale può approvare;
- una modifica successiva rende stale l'approvazione precedente;
- una nuova review sul nuovo fingerprint consente la pubblicazione;
- gli indicatori Osservatorio richiedono seconda review;
- correzioni pubbliche `substantive`/`retraction` richiedono seconda review;
- registro review non cancellabile dagli utenti applicativi;
- nessun bypass AI/Radar/service-role.

## Fase 5 — smoke DB/API immediato

Dopo tutte le migration eseguire almeno:

- DB lint pertinente;
- RLS/publication smoke;
- smoke 4-eyes con due account redattore distinti;
- rate-limit smoke;
- Auth/MFA smoke;
- version ledger/audit smoke;
- query pubbliche Osservatorio/Atlante/Rotte;
- contribution intake senza pubblicazione;
- Security Advisor read-only di confronto.

Se un controllo critico fallisce, il deploy applicativo non parte.

## Strategia di errore / rollback

Non esiste un generico “rollback automatico” affidabile per una catena di migration DDL/DML già parzialmente applicata.

- **prima scelta:** stop immediato + diagnosi + forward-fix piccolo e revisionato quando lo stato DB è integro;
- **restore:** usare il backup pre-release quando lo stato è corrotto, non deterministico o non recuperabile in sicurezza;
- non improvvisare `DROP`, `TRUNCATE` o reverse migration non provate;
- non continuare la catena dopo un errore per “vedere se si sistema”.

## Fase 6 — build/deploy Production Vercel separato

Migration production riuscite **non autorizzano automaticamente il deploy**.

Prima del deploy:

- CI candidato verde;
- deployment Vercel candidato identificato e configurato;
- visual/device QA completato;
- CSP/header verificati;
- secrets production verificati senza esposizione;
- `NEXT_PUBLIC_SITE_URL` HTTPS verificata;
- configurazione Auth production verificata;
- gate editoriali/legal chiusi.

Richiedere autorizzazione esplicita separata per merge/deploy.

## Fase 7 — smoke live post-deploy

Subito dopo l'eventuale deploy autorizzato verificare:

- homepage 2xx e H1 unico;
- canonical/noindex/robots coerenti con production;
- sette lingue core e RTL;
- Osservatorio/Atlante/Rotte;
- `/contribuisci` con rate limiting attivo;
- `/accedi` e area contributor;
- redazione MFA/AAL2;
- governance 4-eyes sulle superfici sensibili;
- security headers/CSP exact-origin;
- nessun `unsafe-eval`;
- performance/LCP candidato live;
- error log Vercel/Supabase;
- nessun contenuto pubblicato automaticamente.

## Stato attuale

- migration candidate validate nella catena cold-start: **23/23** sul candidato governance; recheck del HEAD finale in CI;
- destructive schema operations rilevate dal guard: **0**;
- production DB writes in questo ciclo: **0**;
- production deploy in questo ciclo: **0**;
- `main` modificato: **NO**;
- governance editoriale: **IBRIDA — DECISA / CANDIDATA, NON ATTIVA IN PRODUCTION**;
- rate-limit production: **PENDING APPLY AUTORIZZATO**;
- backup production + restore drill: **PENDING**;
- merge/deploy: **NON AUTORIZZATI**.
