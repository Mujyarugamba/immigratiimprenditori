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

## VERIFICA MANUALE (post Production gate)

1. `LEGAL_SUBJECT_HMAC_SECRET` Production — **CONFIGURED** (2026-08-12; value never stored in repo/reports)
2. Accettazione DPA account AIPEL (Vercel / Supabase) — MANUAL
3. Regione Vercel runtime — MANUAL (Supabase project region **VERIFIED** `eu-west-3`)
4. SMTP Auth produzione — MANUAL
5. Nomi/attributi cookie Auth runtime in Production — MANUAL
6. Ciclo backup provider (numerico) — MANUAL
7. Re-consent Termini `2026-08-11` → `2026-08-12` — **N/A** (0 acceptance rows di qualsiasi versione sul remoto)
8. Ops: 1 account attivo senza riga `terms_acceptances` — follow-up amministrativo (non re-consent di versione precedente)

## RESIDUI TECNICI NON BLOCCANTI PER I TESTI

- Colonne legacy `professional_phone` / `professional_email` e contatti `organization_officials`: residuali in schema; **0** valori non-null su remoto al 2026-08-12; hardening migration **non** introdotta in L1.4 (fuori scope salvo finding bloccante dimostrato)

---

*End*
