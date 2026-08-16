import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ponteImpreseLegalDocsDir } from "@/lib/app-paths";
import { LEGAL_DOC_FILES, type LegalDocId } from "@/lib/legal/versions";

const INTERNAL_LINE =
  /(versione\s+bozza|bozza\s+di\s+lavoro|bozza\s+revisionata|\(bozza\)|DOCUMENTO DA REVISIONARE|DOCUMENTO DA VERIFICARE|Legal Review Report|Change Log|Decision Table|Revisione Claude|\[TASK TECNICO|\[VERIFICA TECNICA|\[VERIFICA|\[DA DEFINIRE|\[DA CONFERMARE|^\*Fine |\*\*Stato:\*\*|\*\*Versione bozza)/i;

/**
 * Loads legal markdown from apps/ponteimprese/docs/architecture/legal
 * (never from the monorepo root docs tree) and strips internal review markers
 * so public pages never expose drafting notes.
 */
export function loadPublicLegalMarkdown(docId: LegalDocId): string {
  const filename = LEGAL_DOC_FILES[docId];
  const path = join(ponteImpreseLegalDocsDir(), filename);
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
