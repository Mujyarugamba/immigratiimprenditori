/**
 * Pre-generate AI translations for already-public editorial contents.
 *
 * Default is dry-run. Writes require --apply.
 * Never run this against Production in the current task.
 *
 *   npx tsx scripts/i18n/backfill-ai-translations.ts --dry-run
 *   npx tsx scripts/i18n/backfill-ai-translations.ts --apply --target=en
 *   npx tsx scripts/i18n/backfill-ai-translations.ts --apply --target=all --limit=20
 */

import { createClient } from "@supabase/supabase-js";
import { resolveDeploymentEnvironment } from "@/lib/deployment/environment";
import { getPublicSupabaseEnv, getSupabaseServiceRoleKey } from "@/lib/env";
import { createPublicReadClient } from "@/lib/supabase/public-read";
import {
  AI_TRANSLATION_TARGET_LOCALES,
  translationGenerationGate,
  type AiTranslationTargetLocale,
} from "@/lib/i18n/ai-translation/config";
import { editorialContentFingerprint, fingerprintsMatch } from "@/lib/i18n/ai-translation/fingerprint";
import { isPublicEditorialContent } from "@/lib/i18n/ai-translation/gates";
import {
  presentEditorialContent,
  type CachedAiTranslation,
  type TranslationSourceContent,
} from "@/lib/i18n/ai-translation/resolve";
import { readAiTranslation } from "@/lib/i18n/ai-translation/cache-read";
import { requestEditorialTranslation } from "@/lib/i18n/ai-translation/openai";
import { catalogLanguageCodeFromId } from "@/lib/i18n/content-direction";
import { isPlatformLocale } from "@/lib/i18n/config";

type Report = {
  mode: "dry-run" | "apply";
  target: string;
  attempted: number;
  generated: number;
  skipped_fresh: number;
  skipped_same_language: number;
  failed: number;
  estimated_input_tokens: number;
  estimated_output_tokens: number;
  failures: Array<{ contentId: string; target: string; reason: string }>;
};

function argValue(argv: string[], name: string): string | null {
  const prefix = `${name}=`;
  const hit = argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function parseTargets(raw: string | null): AiTranslationTargetLocale[] {
  if (!raw || raw === "all") return [...AI_TRANSLATION_TARGET_LOCALES];
  if (!(AI_TRANSLATION_TARGET_LOCALES as readonly string[]).includes(raw)) {
    throw new Error(`Unsupported target locale: ${raw}`);
  }
  return [raw as AiTranslationTargetLocale];
}

function concurrencyFrom(argv: string[]): number {
  const raw = argValue(argv, "--concurrency");
  const value = raw ? Number.parseInt(raw, 10) : 2;
  if (!Number.isFinite(value) || value < 1 || value > 4) {
    throw new Error("concurrency must be between 1 and 4");
  }
  return value;
}

async function mapLimit<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      out[current] = await mapper(items[current]!);
    }
  });
  await Promise.all(workers);
  return out;
}

async function persistAiTranslation(row: CachedAiTranslation): Promise<boolean> {
  if (resolveDeploymentEnvironment(process.env).isReadOnlyPreview) {
    return false;
  }
  if (!translationGenerationGate(process.env).allowed) {
    return false;
  }
  try {
    const { url } = getPublicSupabaseEnv();
    const supabase = createClient(url, getSupabaseServiceRoleKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { error } = await supabase.from("content_ai_translations").upsert(
      {
        content_id: row.content_id,
        target_locale: row.target_locale,
        source_language_id: row.source_language_id,
        source_fingerprint: row.source_fingerprint,
        translated_title: row.translated_title,
        translated_subtitle: row.translated_subtitle,
        translated_abstract: row.translated_abstract,
        translated_body: row.translated_body,
        provider: row.provider,
        model: row.model,
        prompt_version: row.prompt_version,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "content_id,target_locale" },
    );
    return !error;
  } catch {
    return false;
  }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log("tsx scripts/i18n/backfill-ai-translations.ts [--dry-run|--apply] [--target=en|all] [--limit=20] [--concurrency=2]");
    return;
  }

  const apply = argv.includes("--apply");
  const mode = apply ? "apply" : "dry-run";
  const targets = parseTargets(argValue(argv, "--target"));
  const limitRaw = argValue(argv, "--limit");
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 50;
  const concurrency = concurrencyFrom(argv);
  const deployment = resolveDeploymentEnvironment(process.env);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (deployment.isReadOnlyPreview) {
    throw new Error("Refusing AI translation backfill in Preview read-only mode.");
  }
  if (/hvfvfatlaspcpszgizhg|immigratiimprenditori\.supabase\.co/i.test(supabaseUrl)) {
    throw new Error("Refusing AI translation backfill against hosted Production.");
  }
  if (apply) {
    const gate = translationGenerationGate(process.env);
    if (!gate.allowed) {
      throw new Error(`Generation is not allowed: ${gate.reason}`);
    }
  }

  const supabase = createPublicReadClient();
  const { data, error } = await supabase
    .from("contents")
    .select("id, language_id, title, subtitle, abstract, body, body_format, editorial_status, publication_status, visibility_status, archived_at")
    .eq("editorial_status", "ready")
    .eq("publication_status", "published")
    .eq("visibility_status", "public")
    .is("archived_at", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(Number.isFinite(limit) ? limit : 50);

  if (error) throw new Error(error.message);
  const contents = ((data ?? []) as TranslationSourceContent[]).filter(isPublicEditorialContent);

  const jobs = contents.flatMap((content) =>
    targets.map((target) => ({ content, target })),
  );

  const report: Report = {
    mode,
    target: argValue(argv, "--target") ?? "all",
    attempted: 0,
    generated: 0,
    skipped_fresh: 0,
    skipped_same_language: 0,
    failed: 0,
    estimated_input_tokens: 0,
    estimated_output_tokens: 0,
    failures: [],
  };

  await mapLimit(jobs, concurrency, async ({ content, target }) => {
    const sourceCode = catalogLanguageCodeFromId(content.language_id);
    if (sourceCode === target) {
      report.skipped_same_language += 1;
      return;
    }
    if (!isPlatformLocale(target)) return;
    report.attempted += 1;
    const fingerprint = editorialContentFingerprint(content);
    const existing = await readAiTranslation(content.id, target);
    if (existing && fingerprintsMatch(existing.source_fingerprint, fingerprint)) {
      report.skipped_fresh += 1;
      return;
    }
    if (mode === "dry-run") {
      report.generated += 1;
      return;
    }
    try {
      const presented = await presentEditorialContent(content, target, { allowGenerate: true }, {
        env: process.env,
        readTranslation: readAiTranslation,
        writeTranslation: persistAiTranslation,
        translate: requestEditorialTranslation,
        reloadPublicContent: async (id) => contents.find((item) => item.id === id) ?? null,
      });
      if (presented.isAiTranslation && presented.writes > 0) {
        report.generated += 1;
        report.estimated_input_tokens += presented.usage.inputTokens ?? 0;
        report.estimated_output_tokens += presented.usage.outputTokens ?? 0;
      } else if (presented.isAiTranslation) {
        report.skipped_fresh += 1;
      } else {
        report.failed += 1;
        report.failures.push({ contentId: content.id, target, reason: "fallback_original" });
      }
    } catch {
      report.failed += 1;
      report.failures.push({ contentId: content.id, target, reason: "exception" });
    }
  });

  console.log(JSON.stringify({
    mode: report.mode,
    target: report.target,
    attempted: report.attempted,
    generated: report.generated,
    skipped_fresh: report.skipped_fresh,
    skipped_same_language: report.skipped_same_language,
    failed: report.failed,
    estimated_input_tokens: report.estimated_input_tokens || null,
    estimated_output_tokens: report.estimated_output_tokens || null,
    failures: report.failures,
  }, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "backfill_failed";
  console.error(message);
  process.exitCode = 1;
});
