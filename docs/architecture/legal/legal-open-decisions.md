# Legal Open Decisions — post L1.3 alignment (arresto pre-apply)

## CHIUSO

| Tema | Decisione |
|---|---|
| Titolare AIPEL | Associazione; Viale Molise n. 54, 20137 Milano (MI); CF 97342380157; P.IVA 04222160964 |
| Contatto privacy | info@immigratiimprenditori.it |
| Età minima | 18 |
| Basi giuridiche | Confermate (no consenso universale) |
| Retention principle | Per finalità + minimizzazione |
| Cancellazione account (principio) | A/B/C; distinto art. 17; self-service da implementare |
| Cookie Case A | Confermato |
| L1.1b contatti | Confermato |
| Legge / foro | Legge italiana; consumatore → foro inderogabile; altri → Foro di Milano |

## VERIFICA NECESSARIA (manuale)

1. Regione progetto Supabase + accettazione DPA
2. Regione deploy Vercel + accettazione DPA
3. SMTP Auth produzione
4. Nomi/attributi cookie Auth in produzione
5. Ciclo backup provider (numerico)

## TASK TECNICO / MIGRATION (L1.3)

1. **M1** `terms_acceptances` — **APPLICATO** local+remote · signup wired  
2. Wire signup: checkbox Termini + insert version/timestamp — **CHIUSO**  
3. **M2** legal retention archive — **APPLICATO** local+remote  
4. **M3** self-service cancellazione account — **APPLICATO** + UX + Auth ban  
5. **M4** orphan management reassignment — **APPLICATO** + admin resolve UI  

## BLOCCANTI residui per chiusura L1.3 (post M3+M4)

- Confermare `LEGAL_SUBJECT_HMAC_SECRET` su Vercel Production prima del deploy app  
- Verifiche DPA/regioni se i testi pubblici affermano garanzie specifiche  
- Legal finalization / publish definitive texts after technical alignment check

---

*End*
