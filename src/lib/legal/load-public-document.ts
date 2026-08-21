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

const SAFE_PUBLIC_FALLBACK =
  "Le fonti utilizzate dal Centro Studi sono indicate nelle singole schede e nei contenuti pubblicati. Per segnalazioni o richieste di chiarimento: info@aipel.it.";

/** Loads CS-local legal and methodology markdown. */
export function loadPublicLegalMarkdown(docId: LegalDocId): string {
  const filename = LEGAL_DOC_FILES[docId];
  const path = join(centroStudiLegalDocsDir(), filename);
  if (!existsSync(path)) {
    return SAFE_PUBLIC_FALLBACK;
  }
  return readFileSync(path, "utf8").trim();
}
