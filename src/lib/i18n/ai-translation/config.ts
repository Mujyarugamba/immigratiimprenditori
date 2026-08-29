import { resolveDeploymentEnvironment, type DeploymentEnv } from "@/lib/deployment/environment";
import type { PlatformLocale } from "@/lib/i18n/config";

export const DEFAULT_AI_TRANSLATION_MODEL = "gpt-5.6-terra";
export const AI_TRANSLATION_PROVIDER = "openai";
export const AI_TRANSLATION_PROMPT_VERSION = "editorial-public-v1";
export const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

export const AI_TRANSLATION_TARGET_LOCALES = ["en", "fr", "es", "de", "ar", "zh"] as const;
export type AiTranslationTargetLocale = (typeof AI_TRANSLATION_TARGET_LOCALES)[number];

export type TranslationGenerationBlockReason =
  | "preview_read_only"
  | "disabled"
  | "missing_api_key"
  | "invalid_target"
  | "same_language"
  | "not_public";

export function isAiTranslationTargetLocale(value: string): value is AiTranslationTargetLocale {
  return (AI_TRANSLATION_TARGET_LOCALES as readonly string[]).includes(value);
}

export function aiTranslationModel(env: DeploymentEnv = process.env): string {
  const configured = env.AI_TRANSLATION_MODEL?.trim();
  return configured || DEFAULT_AI_TRANSLATION_MODEL;
}

export function openaiApiKey(env: DeploymentEnv = process.env): string | null {
  const key = env.OPENAI_API_KEY?.trim();
  return key ? key : null;
}

export function translationGenerationGate(
  env: DeploymentEnv = process.env,
): { allowed: true } | { allowed: false; reason: TranslationGenerationBlockReason } {
  if (resolveDeploymentEnvironment(env).isReadOnlyPreview) {
    return { allowed: false, reason: "preview_read_only" };
  }
  if (env.AI_TRANSLATION_ENABLED !== "true") {
    return { allowed: false, reason: "disabled" };
  }
  if (!openaiApiKey(env)) {
    return { allowed: false, reason: "missing_api_key" };
  }
  return { allowed: true };
}

export function canUseTargetLocale(
  targetLocale: string,
  sourceLanguageCode: string | undefined,
): { ok: true; target: AiTranslationTargetLocale } | { ok: false; reason: TranslationGenerationBlockReason } {
  if (!isAiTranslationTargetLocale(targetLocale)) {
    return { ok: false, reason: "invalid_target" };
  }
  if (sourceLanguageCode && sourceLanguageCode === targetLocale) {
    return { ok: false, reason: "same_language" };
  }
  return { ok: true, target: targetLocale };
}

export function isItalianInterfaceLocale(locale: PlatformLocale): boolean {
  return locale === "it";
}
