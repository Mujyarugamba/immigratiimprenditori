# Production release runbook — Centro Studi

Data di riferimento: 2026-08-23  
Stato: **PREPARATO — NON AUTORIZZA IL RILASCIO**  
Branch sorgente: `feature/research-radar-ai-knowledge-20260822`  
Production branch corrente: `main` — da non modificare prima dei gate finali.

Questo runbook traduce `supabase/CS-PRODUCTION-RELEASE.json` in una sequenza operativa controllata. Non contiene credenziali e non autorizza alcuna scrittura su Production.

## Regole inderogabili

1. **Mai** eseguire `supabase db push` sull'intera directory storica `supabase/migrations` per questo rilascio.
2. Le quattro baseline cold-start sono esclusivamente per ricostruzione locale e non vanno applicate al progetto hosted esistente.
3. Le due migration repository già riconciliate con versioni hosted precedenti non vanno riapplicate.
4. Prima di qualsiasi write Production occorre una nuova lettura dello storico migration hosted.
5. Occorrono backup Production cifrato/checksum e restore drill **Production-source → non-Production** completato.
6. Occorre autorizzazione esplicita prima dell'applicazione delle migration e una seconda autorizzazione separata prima del deploy Production.
7. Le **24 candidate** vanno applicate **una alla volta, in ordine cronologico**, verificando l'esito prima di passare alla successiva.
8. Al primo errore inatteso: **STOP**. Non ripetere alla cieca una migration parzialmente eseguita.
9. Nessun contenuto viene auto-pubblicato durante il rilascio; Radar/AI restano review-only.
10. Il form pubblico non è considerato Production-hardened finché il rate-limit persistente non è applicato e verificato live.
11. Le Storie reali non sono un gate pre-go-live: outreach/interviste iniziano solo dopo sito online + live smoke PASS.
12. La governance editoriale è **ibrida**: same-editor per contenuti ordinari, seconda approvazione distinta per contenuti sensibili/istituzionali, indicatori Osservatorio e correzioni sostanziali/retraction.
13. Un PASS locale/CI non viene mai trasformato in PASS Production senza il corrispondente controllo live.

## Stato hosted osservato

Ultima migration Production osservata in sola lettura:

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
24. `20260822213100_fix_hybrid_null_category_classifier.sql`

La #24 è una **forward-fix esplicita** scoperta dal test due-redattori: il classificatore originario poteva restituire `NULL` per contenuti ordinari senza `primary_category_code`. La correzione tratta tale assenza come non sensibile, salvo tipo sensibile o escalation manuale.

Il guard `scripts/ci/production-migration-plan-smoke.mjs` verifica automaticamente che l'elenco resti completo, ordinato, senza duplicati e senza drift rispetto ai file post-cutoff del repository.

## Fase 0 — precondizioni editoriali e decisionali

Prima di iniziare qualsiasi procedura live devono essere esplicitamente noti:

- esito QA umano WCAG/device (#92), secondo `docs/operations/go-live-a-closure-kit-2026-08-23.md`;
- esito revisione legale professionale finale, con handoff in `docs/operations/legal-professional-review-handoff-2026-08-23.md`;
- governance review: **DECISA — modello ibrido**, validata nel laboratorio e da riverificare live dopo eventuale apply;
- decisione required checks `main`;
- identità del commit candidato e deployment Vercel candidato;
- restore drill **Production-source → non-Production** completo e verificato;
- enrollment/verifica MFA reale dell'account privilegiato Production.

Le Storie reali non sono una precondizione: la superficie `/storie` deve essere sana anche a zero contenuti reali e l'acquisizione editoriale parte soltanto dopo il live smoke.

## Fase 1 — fresh read-only audit Production

Eseguire senza write:

- stato progetto Supabase;
- storico migration hosted e ultima versione;
- Security Advisor;
- conteggi/visibilità minimi di contenuti, eventi, account, fonti;
- configurazione Auth rilevante;
- inventario account privilegiati e fattori MFA;
- stato DNS/hosting candidato.

**Hold point A:** se l'ultima migration hosted non è ancora `20260820160000`, fermarsi e riconciliare il piano.

## Fase 2 — backup e restore drill

### 2A. Drill tecnico CI — CHIUSO

Il laboratorio ha già completato un vero ciclo di recovery contro un **secondo stack Supabase-managed fresco**:

1. dump logico `roles.sql`, `schema.sql`, `data.sql` tramite Supabase CLI;
2. verifica preflight dei componenti;
3. normalizzazione chirurgica del solo privilegio platform-managed `log_min_messages` nel role dump;
4. stop dello stack sorgente;
5. avvio di uno stack Supabase fresco senza migration applicative preinstallate;
6. restore ruoli/schema/dati;
7. reattach idempotente del solo hook applicativo `on_auth_user_created` su `auth.users` tramite `scripts/ci/post-restore-auth-hooks.sql`;
8. verifica tabelle critiche e RLS;
9. Auth integration smoke con due utenti effimeri reali;
10. verifica provisioning `public.profiles`, login password, JWT/RPC, contributor/editor separation e auto-elevazione negata;
11. build applicativa contro il database ripristinato;
12. HTTP/security smoke;
13. browser E2E autenticato;
14. cleanup stack/utenti effimeri.

Esito:

`CI_EPHEMERAL_RESTORE_DRILL = PASS`

Il precedente errore su:

`GRANT SET ON PARAMETER "log_min_messages" ...`

è chiuso. È chiuso anche il successivo problema del trigger applicativo su `auth.users` non incluso dal logical dump: il post-restore script ricrea soltanto quell'hook e ne verifica la presenza.

### 2B. Drill da sorgente Production reale — ANCORA PENDING

Prima delle migration Production occorre ancora:

1. ottenere un dump logico dalla **Production reale** usando una macchina/ambiente amministrativo controllato e credenziali non registrate nel repository;
2. cifrare/conservare il backup secondo `docs/security/BACKUP-RECOVERY.md`;
3. verificare checksum e componenti;
4. ripristinare il dump su un target **non-Production** Supabase-managed pulito;
5. applicare il post-restore hook applicativo previsto;
6. ripetere almeno schema/data/RLS/Auth/postflight;
7. registrare origine dump, data, target non-Production, risultato e cleanup.

Il workflow `Production encrypted backup` è preparato sul candidato ma, per sicurezza, è inerte fuori da `main`. Non va aggirato anticipando accessi Production da feature branch.

**Hold point B:** nessuna migration Production senza `PRODUCTION_SOURCE_RESTORE_DRILL = PASS`.

## Fase 2C — enrollment MFA privilegiato Production

Il codice applicativo supporta enrollment e verifica TOTP tramite l'area MFA. L'operazione reale resta una write Auth Production e richiede intervento dell'utente privilegiato.

Sequenza operativa dopo che la migration MFA è presente nel target live autorizzato:

1. accedere con l'account privilegiato corretto;
2. aprire `/app/mfa` / superficie sicurezza prevista dall'applicazione;
3. selezionare **Aggiungi autenticatore**;
4. scansionare il QR con un'app TOTP controllata oppure usare il secret mostrato;
5. inserire il codice TOTP a 6 cifre e completare **Verifica e attiva**;
6. verificare che il fattore risulti `verified` e che la sessione sia `aal2`;
7. effettuare logout/login o nuova sessione e verificare che l'accesso privilegiato a AAL1 venga bloccato;
8. completare il challenge del fattore esistente e verificare il passaggio ad AAL2;
9. confermare l'accesso alle funzioni privilegiate solo dopo AAL2;
10. rileggere in sola lettura `auth.mfa_factors` e l'inventario dei ruoli per registrare il risultato.

Non rimuovere l'ultimo fattore verificato durante il collaudo. Non copiare QR/secret TOTP nei log, ticket o repository.

`PRODUCTION_PRIVILEGED_MFA = PENDING` finché l'enrollment reale non è completato e verificato.

## Fase 3 — autorizzazione migration

Richiedere autorizzazione esplicita per l'applicazione delle **24 candidate**. L'autorizzazione deve riferirsi al commit candidato e allo storico hosted appena verificato.

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

### Checkpoint governance ibrida dopo #23–#24

Dopo `20260822213000_hybrid_editorial_review_governance.sql` e la forward-fix `20260822213100_fix_hybrid_null_category_classifier.sql` verificare:

- un contenuto ordinario resta pubblicabile dal medesimo redattore;
- un contenuto ordinario senza categoria non viene classificato sensibile per il solo `NULL`;
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

Migration Production riuscite **non autorizzano automaticamente il deploy**.

Prima del deploy:

- CI candidato verde;
- deployment Vercel candidato identificato e configurato;
- visual/device QA completato;
- CSP/header verificati;
- secrets Production verificati senza esposizione;
- `NEXT_PUBLIC_SITE_URL` HTTPS verificata;
- configurazione Auth Production verificata;
- gate editoriali/legal chiusi.

Richiedere autorizzazione esplicita separata per merge/deploy.

## Fase 7 — smoke live post-deploy

Subito dopo l'eventuale deploy autorizzato verificare:

- homepage 2xx e H1 unico;
- canonical/noindex/robots coerenti con Production;
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

- candidate migration: **24/24 validate**;
- destructive schema operations rilevate dal guard: **0**;
- standalone cold-start: **PASS**;
- PostgreSQL lint: **PASS**;
- publication/RLS smoke: **PASS**;
- governance ibrida due-redattori: **PASS**;
- persistent rate-limit smoke: **PASS**;
- go-live DB smoke: **PASS**;
- logical backup locale Supabase: **PASS**;
- clean Supabase-managed restore: **PASS**;
- post-restore Auth hook: **PASS**;
- Auth integration reale su utenti effimeri: **PASS**;
- build contro DB ripristinato: **PASS**;
- HTTP/security smoke contro DB ripristinato: **PASS**;
- browser E2E autenticato contro DB ripristinato: **PASS**;
- Editorial CI sul candidato funzionale: **PASS**;
- Production-source restore drill: **PENDING**;
- QA umano/device #92: **PENDING**;
- revisione legale professionale: **PENDING**;
- MFA privilegiato Production: **PENDING**;
- first source-health run default branch: **PENDING POST-MERGE**;
- required checks `main`: **PENDING / NON MODIFICATI**;
- Production DB writes in questo ciclo: **0**;
- Production deploy in questo ciclo: **0**;
- `main` modificato: **NO**;
- governance editoriale: **IBRIDA — DECISA / VALIDATA NEL LABORATORIO, NON ATTIVA IN PRODUCTION**;
- rate-limit Production: **PENDING APPLY AUTORIZZATO**;
- merge/deploy: **NON AUTORIZZATI**.
