/**
 * CS public legal identifiers. Markdown is CS-local when present.
 * Root informativa dati/fonti is PONTE_IMPRESE (S2-GATE-LEGAL-CS).
 * Do not load PonteImprese legal documents.
 */
export const LEGAL_ROUTES = {
  datiEFonti: "/dati-e-fonti",
} as const;

export const LEGAL_DOC_FILES = {
  datiEFonti: "informativa-disclaimer-dati-fonti-esterne.md",
} as const;

export type LegalDocId = keyof typeof LEGAL_DOC_FILES;
