/**
 * Public legal document versions (must match terms_acceptances.document_version).
 * Bump when Termini d'Uso published text changes materially.
 */
/** Published Termini d'Uso version recorded in terms_acceptances at signup. */
export const TERMS_OF_USE_VERSION = "2026-08-12";

/** Human-readable publication dates for public legal pages (not M1 ledger keys). */
export const LEGAL_PUBLIC_VERSIONS = {
  privacy: "2026-08-12",
  cookie: "2026-08-12",
  termini: "2026-08-12",
  datiEFonti: "2026-08-12",
} as const;

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
