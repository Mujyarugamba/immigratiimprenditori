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

const CS_LEGAL_PENDING =
  "Documento legale Centro Studi in attesa di redazione autonoma (S2-GATE-LEGAL-CS; CS_LEGAL_CONTENT = CUTOVER_BLOCKER). Placeholder, non testo giuridico definitivo. Il testo non è caricato dalla root del monorepo né da PonteImprese.";

/**
 * Loads CS-local legal markdown from apps/centro-studi/docs/architecture/legal
 * when present. The CS-DOCS inventory does not include a CS legal set;
 * informativa dati/fonti root is classified PONTE_IMPRESE and is not copied.
 */
export function loadPublicLegalMarkdown(docId: LegalDocId): string {
  const filename = LEGAL_DOC_FILES[docId];
  const path = join(centroStudiLegalDocsDir(), filename);
  if (!existsSync(path)) {
    return CS_LEGAL_PENDING;
  }
  return readFileSync(path, "utf8").trim();
}
