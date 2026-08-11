import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LEGAL_DOC_FILES, type LegalDocId } from "@/lib/legal/versions";

const INTERNAL_LINE =
  /(bozza|DOCUMENTO DA REVISIONARE|Legal Review|Change Log|Decision Table|Revisione Claude|\[TASK TECNICO|\[VERIFICA|\[DA DEFINIRE|^\*Fine |\*\*Stato:\*\*|\*\*Versione bozza)/i;

/**
 * Loads legal markdown from docs/architecture/legal and strips internal review markers
 * so public pages never expose drafting notes.
 */
export function loadPublicLegalMarkdown(docId: LegalDocId): string {
  const filename = LEGAL_DOC_FILES[docId];
  const path = join(process.cwd(), "docs", "architecture", "legal", filename);
  const raw = readFileSync(path, "utf8");
  const lines = raw.split(/\r?\n/);
  const kept: string[] = [];
  for (const line of lines) {
    if (INTERNAL_LINE.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function assertNoInternalLegalMarkers(text: string): boolean {
  return !INTERNAL_LINE.test(text);
}
