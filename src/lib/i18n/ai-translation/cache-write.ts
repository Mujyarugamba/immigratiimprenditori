import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { resolveDeploymentEnvironment } from "@/lib/deployment/environment";
import type { CachedAiTranslation } from "./resolve";

export async function writeAiTranslation(row: CachedAiTranslation): Promise<boolean> {
  if (resolveDeploymentEnvironment(process.env).isReadOnlyPreview) {
    return false;
  }
  try {
    const supabase = createServiceRoleClient();
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
