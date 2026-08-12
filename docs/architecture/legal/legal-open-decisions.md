# Legal Open Decisions — post L1.4 finalization

## CHIUSO

| Tema | Decisione |
|---|---|
| Titolare AIPEL | Associazione; Viale Molise n. 54, 20137 Milano (MI); CF 97342380157; P.IVA 04222160964 |
| Contatto privacy | info@immigratiimprenditori.it |
| Età minima | 18 |
| Basi giuridiche | Confermate (no consenso universale) |
| Retention principle | Per finalità + minimizzazione |
| Cancellazione account | Self-service area riservata; A/B/C; distinto art. 17; aggregati preservati |
| Cookie Case A | Confermato (ri-audit L1.4) |
| L1.1b contatti | Confermato |
| Legge / foro | Legge italiana; consumatore → foro inderogabile; altri → Foro di Milano |
| Terms acceptance signup | Checkbox Termini + Privacy informativa (non consenso) |
| M1–M4 | Applicati local+remote |

## VERIFICA MANUALE (pre-deploy)

1. Configurare `LEGAL_SUBJECT_HMAC_SECRET` su Vercel Production (**NOT CONFIGURED** al 2026-08-12)
2. Regione progetto Supabase + accettazione DPA account AIPEL
3. Regione deploy Vercel + accettazione DPA account AIPEL
4. SMTP Auth produzione
5. Nomi/attributi cookie Auth runtime in Production
6. Ciclo backup provider (numerico)
7. Decisione Gestore: eventuali utenti già iscritti con Termini `2026-08-11` devono riactettare `2026-08-12`? (nuovo signup usa già `2026-08-12`; nessun workflow di re-consent implementato in L1.4)

## RESIDUI TECNICI NON BLOCCANTI PER I TESTI

- Colonne legacy `professional_phone` / `professional_email` e contatti `organization_officials`: residuali in schema; **0** valori non-null su remoto al 2026-08-12; hardening migration **non** introdotta in L1.4 (fuori scope salvo finding bloccante dimostrato)

---

*End*
