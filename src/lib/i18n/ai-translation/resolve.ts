import type { PlatformLocale } from "@/lib/i18n/config";
import { catalogLanguageCodeFromId } from "@/lib/i18n/content-direction";
import type { DeploymentEnv } from "@/lib/deployment/environment";
import {
  AI_TRANSLATION_PROMPT_VERSION,
  AI_TRANSLATION_PROVIDER,
  canUseTargetLocale,
  translationGenerationGate,
  type AiTranslationTargetLocale,
} from "./config";
import { editorialContentFingerprint, fingerprintsMatch } from "./fingerprint";
import { isPublicEditorialContent } from "./gates";
import type { OpenAiTranslationRequest, OpenAiTranslationSuccess } from "./openai";
import { singleFlight, translationFlightKey } from "./single-flight";
import { validateStructuredTranslation, type StructuredTranslation } from "./validate";

export type TranslationSourceContent = {
  id: string;
  slug?: string;
  language_id: number;
  title: string;
  subtitle?: string | null;
  abstract?: string | null;
  body: string;
  body_format: string;
  editorial_status?: string | null;
  publication_status?: string | null;
  visibility_status?: string | null;
  archived_at?: string | null;
};

export type CachedAiTranslation = {
  content_id: string;
  target_locale: string;
  source_language_id: number;
  source_fingerprint: string;
  translated_title: string;
  translated_subtitle: string | null;
  translated_abstract: string | null;
  translated_body: string;
  provider: string;
  model: string;
  prompt_version: string;
};

export type TranslationPresentation = {
  title: string;
  subtitle: string | null;
  abstract: string | null;
  body: string;
  displayLanguageCode: string;
  sourceLanguageCode: string;
  isAiTranslation: boolean;
  isViewingOriginal: boolean;
  openaiCalls: number;
  writes: number;
  usage: { inputTokens: number | null; outputTokens: number | null };
};

export type TranslationDeps = {
  env: DeploymentEnv;
  readTranslation: (
    contentId: string,
    targetLocale: AiTranslationTargetLocale,
  ) => Promise<CachedAiTranslation | null>;
  readTranslations?: (
    contentIds: string[],
    targetLocale: AiTranslationTargetLocale,
  ) => Promise<Map<string, CachedAiTranslation>>;
  writeTranslation: (row: CachedAiTranslation) => Promise<boolean>;
  translate: (request: OpenAiTranslationRequest) => Promise<OpenAiTranslationSuccess | { ok: false }>;
  reloadPublicContent?: (contentId: string) => Promise<TranslationSourceContent | null>;
};

function sourceLanguageCode(content: TranslationSourceContent): string {
  return catalogLanguageCodeFromId(content.language_id) ?? "und";
}

function originalPresentation(
  content: TranslationSourceContent,
  extra: Partial<TranslationPresentation> = {},
): TranslationPresentation {
  const source = sourceLanguageCode(content);
  return {
    title: content.title,
    subtitle: content.subtitle ?? null,
    abstract: content.abstract ?? null,
    body: content.body,
    displayLanguageCode: source,
    sourceLanguageCode: source,
    isAiTranslation: false,
    isViewingOriginal: extra.isViewingOriginal ?? false,
    openaiCalls: extra.openaiCalls ?? 0,
    writes: extra.writes ?? 0,
    usage: extra.usage ?? { inputTokens: null, outputTokens: null },
  };
}

function translatedPresentation(
  content: TranslationSourceContent,
  target: AiTranslationTargetLocale,
  translation: StructuredTranslation,
  extra: Partial<TranslationPresentation> = {},
): TranslationPresentation {
  return {
    title: translation.title,
    subtitle: translation.subtitle,
    abstract: translation.abstract,
    body: translation.body,
    displayLanguageCode: target,
    sourceLanguageCode: sourceLanguageCode(content),
    isAiTranslation: true,
    isViewingOriginal: false,
    openaiCalls: extra.openaiCalls ?? 0,
    writes: extra.writes ?? 0,
    usage: extra.usage ?? { inputTokens: null, outputTokens: null },
  };
}

function cacheToStructured(row: CachedAiTranslation): StructuredTranslation {
  return {
    title: row.translated_title,
    subtitle: row.translated_subtitle,
    abstract: row.translated_abstract,
    body: row.translated_body,
  };
}

export async function presentEditorialContent(
  content: TranslationSourceContent,
  locale: PlatformLocale,
  options: { preferOriginal?: boolean; allowGenerate?: boolean } = {},
  deps: TranslationDeps,
): Promise<TranslationPresentation> {
  if (options.preferOriginal || locale === "it") {
    return originalPresentation(content, { isViewingOriginal: Boolean(options.preferOriginal) });
  }

  const sourceCode = sourceLanguageCode(content);
  const targetCheck = canUseTargetLocale(locale, sourceCode);
  if (!targetCheck.ok) {
    return originalPresentation(content);
  }
  if (!isPublicEditorialContent(content)) {
    return originalPresentation(content);
  }

  const fingerprint = editorialContentFingerprint(content);
  const cached = await deps.readTranslation(content.id, targetCheck.target);
  if (cached && fingerprintsMatch(cached.source_fingerprint, fingerprint)) {
    return translatedPresentation(content, targetCheck.target, cacheToStructured(cached));
  }

  if (!options.allowGenerate) {
    return originalPresentation(content);
  }

  const gate = translationGenerationGate(deps.env);
  if (!gate.allowed) {
    return originalPresentation(content);
  }

  return singleFlight(translationFlightKey(content.id, targetCheck.target), () =>
    generateAndCache(content, targetCheck.target, fingerprint, deps),
  );
}

async function generateAndCache(
  content: TranslationSourceContent,
  target: AiTranslationTargetLocale,
  fingerprint: string,
  deps: TranslationDeps,
): Promise<TranslationPresentation> {
  const latest = deps.reloadPublicContent ? await deps.reloadPublicContent(content.id) : content;
  if (!latest || !isPublicEditorialContent(latest)) {
    return originalPresentation(content);
  }
  const latestFingerprint = editorialContentFingerprint(latest);
  if (!fingerprintsMatch(latestFingerprint, fingerprint)) {
    return originalPresentation(latest);
  }

  const existing = await deps.readTranslation(latest.id, target);
  if (existing && fingerprintsMatch(existing.source_fingerprint, latestFingerprint)) {
    return translatedPresentation(latest, target, cacheToStructured(existing));
  }

  const result = await deps.translate({
    sourceLanguageCode: sourceLanguageCode(latest),
    targetLocale: target,
    bodyFormat: latest.body_format,
    title: latest.title,
    subtitle: latest.subtitle ?? null,
    abstract: latest.abstract ?? null,
    body: latest.body,
  });
  if (!result.ok) {
    return originalPresentation(latest, { openaiCalls: 1 });
  }

  const invalid = validateStructuredTranslation({
    original: latest,
    translated: result.translation,
    targetLocale: target,
    contentId: latest.id,
  });
  if (invalid) {
    return originalPresentation(latest, { openaiCalls: 1 });
  }

  const stillPublic = deps.reloadPublicContent ? await deps.reloadPublicContent(latest.id) : latest;
  if (!stillPublic || !isPublicEditorialContent(stillPublic)) {
    return originalPresentation(latest, { openaiCalls: 1 });
  }
  const persistFingerprint = editorialContentFingerprint(stillPublic);
  if (!fingerprintsMatch(persistFingerprint, latestFingerprint)) {
    return originalPresentation(stillPublic, { openaiCalls: 1 });
  }

  const written = await deps.writeTranslation({
    content_id: stillPublic.id,
    target_locale: target,
    source_language_id: stillPublic.language_id,
    source_fingerprint: persistFingerprint,
    translated_title: result.translation.title,
    translated_subtitle: result.translation.subtitle,
    translated_abstract: result.translation.abstract,
    translated_body: result.translation.body,
    provider: result.provider ?? AI_TRANSLATION_PROVIDER,
    prompt_version: result.promptVersion ?? AI_TRANSLATION_PROMPT_VERSION,
    model: result.model,
  });

  if (!written) {
    return originalPresentation(stillPublic, { openaiCalls: 1 });
  }

  return translatedPresentation(stillPublic, target, result.translation, {
    openaiCalls: 1,
    writes: 1,
    usage: result.usage ?? { inputTokens: null, outputTokens: null },
  });
}

export async function presentEditorialContentList(
  items: TranslationSourceContent[],
  locale: PlatformLocale,
  deps: TranslationDeps,
): Promise<TranslationPresentation[]> {
  const targetCheck = canUseTargetLocale(locale, locale === "it" ? "it" : "und");
  if (!targetCheck.ok || !deps.readTranslations) {
    return Promise.all(
      items.map((item) => presentEditorialContent(item, locale, { allowGenerate: false }, deps)),
    );
  }
  const target = targetCheck.target;
  const batched = await deps.readTranslations(
    items.map((item) => item.id),
    target,
  );
  const listDeps: TranslationDeps = {
    ...deps,
    readTranslation: async (contentId, targetLocale) => {
      if (targetLocale !== target) return deps.readTranslation(contentId, targetLocale);
      return batched.get(contentId) ?? null;
    },
  };
  return Promise.all(
    items.map((item) => presentEditorialContent(item, locale, { allowGenerate: false }, listDeps)),
  );
}
