import type { AiTranslationTargetLocale } from "./config";
import { isAiTranslationTargetLocale } from "./config";

export type StructuredTranslation = {
  title: string;
  subtitle: string | null;
  abstract: string | null;
  body: string;
};

const ALLOWED_KEYS = new Set(["title", "subtitle", "abstract", "body"]);
const URL_RE = /https?:\/\/[^\s)\]>'"]+/gi;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const MARKDOWN_LINK_RE = /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;

export type TranslationValidationFailure =
  | "invalid_json"
  | "unexpected_fields"
  | "empty_title"
  | "empty_body"
  | "missing_subtitle"
  | "invented_subtitle"
  | "missing_abstract"
  | "invented_abstract"
  | "missing_url"
  | "broken_markdown_link"
  | "missing_email"
  | "invalid_target"
  | "invalid_content_id"
  | "fingerprint_changed"
  | "not_public";

function normalizeNullable(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return undefined as unknown as null;
  const trimmed = value.trim();
  return trimmed.length ? value : null;
}

function uniqueMatches(text: string, pattern: RegExp): string[] {
  const values = new Set<string>();
  const copy = new RegExp(pattern.source, pattern.flags);
  for (const match of text.matchAll(copy)) {
    const value = match[0]?.replace(/[.,;:]+$/, "");
    if (value) values.add(value);
  }
  return [...values];
}

function markdownLinkTargets(text: string): string[] {
  const values = new Set<string>();
  const copy = new RegExp(MARKDOWN_LINK_RE.source, MARKDOWN_LINK_RE.flags);
  for (const match of text.matchAll(copy)) {
    if (match[1]) values.add(match[1]);
  }
  return [...values];
}

export function sourceTextBlob(input: {
  title: string;
  subtitle?: string | null;
  abstract?: string | null;
  body: string;
}): string {
  return [input.title, input.subtitle ?? "", input.abstract ?? "", input.body].join("\n");
}

export function parseStructuredTranslation(raw: unknown): StructuredTranslation | { error: TranslationValidationFailure } {
  if (typeof raw !== "object" || raw == null || Array.isArray(raw)) {
    return { error: "invalid_json" };
  }
  const record = raw as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) return { error: "unexpected_fields" };
  }
  if (typeof record.title !== "string" || !record.title.trim()) return { error: "empty_title" };
  if (typeof record.body !== "string" || !record.body.trim()) return { error: "empty_body" };
  if (record.subtitle !== undefined && record.subtitle !== null && typeof record.subtitle !== "string") {
    return { error: "invalid_json" };
  }
  if (record.abstract !== undefined && record.abstract !== null && typeof record.abstract !== "string") {
    return { error: "invalid_json" };
  }
  return {
    title: record.title,
    subtitle: normalizeNullable(record.subtitle ?? null),
    abstract: normalizeNullable(record.abstract ?? null),
    body: record.body,
  };
}

export function validateStructuredTranslation(args: {
  original: {
    title: string;
    subtitle?: string | null;
    abstract?: string | null;
    body: string;
  };
  translated: StructuredTranslation;
  targetLocale: string;
  contentId: string;
}): TranslationValidationFailure | null {
  if (!isAiTranslationTargetLocale(args.targetLocale)) return "invalid_target";
  if (!args.contentId.trim()) return "invalid_content_id";
  if (!args.translated.title.trim()) return "empty_title";
  if (!args.translated.body.trim()) return "empty_body";

  const originalSubtitle = args.original.subtitle?.trim() ? args.original.subtitle : null;
  const originalAbstract = args.original.abstract?.trim() ? args.original.abstract : null;
  if (originalSubtitle && !args.translated.subtitle?.trim()) return "missing_subtitle";
  if (!originalSubtitle && args.translated.subtitle) return "invented_subtitle";
  if (originalAbstract && !args.translated.abstract?.trim()) return "missing_abstract";
  if (!originalAbstract && args.translated.abstract) return "invented_abstract";

  const originalBlob = sourceTextBlob(args.original);
  const translatedBlob = sourceTextBlob(args.translated);

  for (const url of uniqueMatches(originalBlob, URL_RE)) {
    if (!translatedBlob.includes(url)) return "missing_url";
  }
  for (const href of markdownLinkTargets(originalBlob)) {
    if (!translatedBlob.includes(href) || !translatedBlob.includes(`](${href}`)) {
      return "broken_markdown_link";
    }
  }
  for (const email of uniqueMatches(originalBlob, EMAIL_RE)) {
    if (!translatedBlob.toLowerCase().includes(email.toLowerCase())) return "missing_email";
  }

  return null;
}

export function assertTargetLocale(value: string): AiTranslationTargetLocale {
  if (!isAiTranslationTargetLocale(value)) {
    throw new Error("invalid_target");
  }
  return value;
}
