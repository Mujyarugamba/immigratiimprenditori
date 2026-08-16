import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LEGAL_DOC_FILES, type LegalDocId } from "@/lib/legal/versions";

function centroStudiAppRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

function centroStudiLegalDocsDir(): string {
  return join(centroStudiAppRoot(), "docs", "architecture", "legal");
}

const CS_DOCS_PENDING =
  "Documento legale Centro Studi in attesa della macro-unità CS-DOCS (Prompt 5/8). Il testo giuridico non è caricato dalla root del monorepo né da PonteImprese.";

/**
 * Loads CS-local legal markdown when present.
 * Until S2-CS-DOCS-01, returns an explicit placeholder (PARTIAL autonomy).
 */
export function loadPublicLegalMarkdown(docId: LegalDocId): string {
  const filename = LEGAL_DOC_FILES[docId];
  const path = join(centroStudiLegalDocsDir(), filename);
  if (!existsSync(path)) {
    return CS_DOCS_PENDING;
  }
  return readFileSync(path, "utf8").trim();
}
