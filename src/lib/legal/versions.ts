/**
 * Public legal document versions (must match terms_acceptances.document_version).
 * Bump when Termini d'Uso published text changes materially.
 */
export const TERMS_OF_USE_VERSION = "2026-08-11";

export const LEGAL_ROUTES = {
  privacy: "/privacy",
  cookie: "/cookie",
  termini: "/termini",
  datiEFonti: "/dati-e-fonti",
} as const;

export type LegalDocId = keyof typeof LEGAL_DOC_FILES;

export const LEGAL_DOC_FILES = {
  privacy: "privacy-policy.md",
  cookie: "cookie-policy.md",
  termini: "termini-duso.md",
  datiEFonti: "informativa-disclaimer-dati-fonti-esterne.md",
} as const;
