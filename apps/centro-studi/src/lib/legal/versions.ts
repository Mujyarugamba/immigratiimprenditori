/**
 * CS public legal identifiers. Full markdown lives in CS-DOCS (Prompt 5/8).
 * Do not load PonteImprese legal documents from the monorepo root.
 */
export const LEGAL_ROUTES = {
  datiEFonti: "/dati-e-fonti",
} as const;

export const LEGAL_DOC_FILES = {
  datiEFonti: "informativa-disclaimer-dati-fonti-esterne.md",
} as const;

export type LegalDocId = keyof typeof LEGAL_DOC_FILES;
