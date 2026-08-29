import { createPublicReadClient } from "@/lib/supabase/public-read";
import type { AiTranslationTargetLocale } from "./config";
import type { CachedAiTranslation, TranslationSourceContent } from "./resolve";
import { isPublicEditorialContent } from "./gates";

function mapCacheRow(row: Record<string, unknown>): CachedAiTranslation {
  return {
    content_id: row.content_id as string,
    target_locale: row.target_locale as string,
    source_language_id: row.source_language_id as number,
    source_fingerprint: row.source_fingerprint as string,
    translated_title: row.translated_title as string,
    translated_subtitle: (row.translated_subtitle as string | null) ?? null,
    translated_abstract: (row.translated_abstract as string | null) ?? null,
    translated_body: row.translated_body as string,
    provider: row.provider as string,
    model: row.model as string,
    prompt_version: row.prompt_version as string,
  };
}

export async function readAiTranslation(
  contentId: string,
  targetLocale: AiTranslationTargetLocale,
): Promise<CachedAiTranslation | null> {
  try {
    const supabase = createPublicReadClient();
    const { data, error } = await supabase
      .from("content_ai_translations")
      .select(
        "content_id, target_locale, source_language_id, source_fingerprint, translated_title, translated_subtitle, translated_abstract, translated_body, provider, model, prompt_version",
      )
      .eq("content_id", contentId)
      .eq("target_locale", targetLocale)
      .maybeSingle();
    if (error || !data) return null;
    return mapCacheRow(data);
  } catch {
    return null;
  }
}

export async function readAiTranslations(
  contentIds: string[],
  targetLocale: AiTranslationTargetLocale,
): Promise<Map<string, CachedAiTranslation>> {
  const result = new Map<string, CachedAiTranslation>();
  if (contentIds.length === 0) return result;
  try {
    const supabase = createPublicReadClient();
    const { data, error } = await supabase
      .from("content_ai_translations")
      .select(
        "content_id, target_locale, source_language_id, source_fingerprint, translated_title, translated_subtitle, translated_abstract, translated_body, provider, model, prompt_version",
      )
      .in("content_id", contentIds)
      .eq("target_locale", targetLocale);
    if (error || !data) return result;
    for (const row of data) {
      const mapped = mapCacheRow(row);
      result.set(mapped.content_id, mapped);
    }
    return result;
  } catch {
    return result;
  }
}

export async function loadPublicTranslationSource(
  contentId: string,
): Promise<TranslationSourceContent | null> {
  try {
    const supabase = createPublicReadClient();
    const { data, error } = await supabase
      .from("contents")
      .select(
        "id, slug, language_id, title, subtitle, abstract, body, body_format, editorial_status, publication_status, visibility_status, archived_at",
      )
      .eq("id", contentId)
      .maybeSingle();
    if (error || !data) return null;
    const source = data as TranslationSourceContent;
    return isPublicEditorialContent(source) ? source : null;
  } catch {
    return null;
  }
}

export async function loadPublicTranslationSources(
  contentIds: string[],
): Promise<Map<string, TranslationSourceContent>> {
  const result = new Map<string, TranslationSourceContent>();
  if (contentIds.length === 0) return result;
  try {
    const supabase = createPublicReadClient();
    const { data, error } = await supabase
      .from("contents")
      .select(
        "id, slug, language_id, title, subtitle, abstract, body, body_format, editorial_status, publication_status, visibility_status, archived_at",
      )
      .in("id", contentIds)
      .eq("editorial_status", "ready")
      .eq("publication_status", "published")
      .eq("visibility_status", "public")
      .is("archived_at", null);
    if (error || !data) return result;
    for (const row of data as TranslationSourceContent[]) {
      result.set(row.id, row);
    }
    return result;
  } catch {
    return result;
  }
}
