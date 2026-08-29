import "server-only";

import type { PlatformLocale } from "@/lib/i18n/config";
import type { PublicContentDetail, PublicContentListItem } from "@/lib/data/public/contents";
import { requestEditorialTranslation } from "./openai";
import {
  readAiTranslation,
  readAiTranslations,
  loadPublicTranslationSource,
  loadPublicTranslationSources,
  loadPublicTranslationSourcesBySlugs,
} from "./cache-read";
import { writeAiTranslation } from "./cache-write";
import {
  presentEditorialContent,
  presentEditorialContentList,
  type TranslationPresentation,
  type TranslationSourceContent,
} from "./resolve";

function detailToSource(content: PublicContentDetail): TranslationSourceContent {
  return {
    id: content.id,
    slug: content.slug,
    language_id: content.language_id,
    title: content.title,
    subtitle: content.subtitle ?? null,
    abstract: content.abstract,
    body: content.body,
    body_format: content.body_format,
    editorial_status: content.editorial_status,
    publication_status: content.publication_status,
    visibility_status: content.visibility_status,
    archived_at: content.archived_at,
  };
}

function runtimeDeps() {
  return {
    env: process.env,
    readTranslation: readAiTranslation,
    readTranslations: readAiTranslations,
    writeTranslation: writeAiTranslation,
    translate: (request: Parameters<typeof requestEditorialTranslation>[0]) =>
      requestEditorialTranslation(request),
    reloadPublicContent: loadPublicTranslationSource,
  };
}

export type PresentedPublicContent = TranslationPresentation & {
  id: string;
  slug: string;
  type_code: string;
  language_id: number;
};

export async function presentLocalizedContentDetail(
  content: PublicContentDetail,
  locale: PlatformLocale,
  options: { preferOriginal?: boolean; allowGenerate?: boolean } = {},
): Promise<PresentedPublicContent> {
  const presented = await presentEditorialContent(detailToSource(content), locale, {
    preferOriginal: options.preferOriginal,
    allowGenerate: options.allowGenerate ?? !options.preferOriginal,
  }, runtimeDeps());
  return {
    ...presented,
    id: content.id,
    slug: content.slug,
    type_code: content.type_code,
    language_id: content.language_id,
  };
}

export async function presentLocalizedContentCards(
  items: PublicContentListItem[],
  locale: PlatformLocale,
): Promise<PresentedPublicContent[]> {
  if (items.length === 0) return [];
  const sources = await loadPublicTranslationSources(items.map((item) => item.id));
  const ordered: TranslationSourceContent[] = items.map((item) => {
    const source = sources.get(item.id);
    if (source) return source;
    return {
      id: item.id,
      slug: item.slug,
      language_id: item.language_id,
      title: item.title,
      subtitle: null,
      abstract: item.abstract,
      body: "",
      body_format: "plain_text",
      editorial_status: "ready",
      publication_status: "published",
      visibility_status: "public",
      archived_at: null,
    };
  });
  const presented = await presentEditorialContentList(ordered, locale, runtimeDeps());
  return items.map((item, index) => ({
    ...presented[index]!,
    id: item.id,
    slug: item.slug,
    type_code: item.type_code,
    language_id: item.language_id,
  }));
}

function contentSlugFromHref(href: string): string | null {
  const match = href.match(/\/contenuti\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export async function presentLocalizedContentByHrefs(
  hrefs: string[],
  locale: PlatformLocale,
): Promise<Map<string, PresentedPublicContent>> {
  const slugs = [...new Set(hrefs.map(contentSlugFromHref).filter((slug): slug is string => Boolean(slug)))];
  if (slugs.length === 0) return new Map();
  const sources = await loadPublicTranslationSourcesBySlugs(slugs);
  const items: PublicContentListItem[] = [...sources.values()].map((source) => ({
    id: source.id,
    slug: source.slug ?? "",
    title: source.title,
    abstract: source.abstract ?? null,
    type_code: "article",
    primary_category_code: null,
    language_id: source.language_id,
    is_featured: false,
    published_at: null,
    cover_url: null,
  }));
  const presented = await presentLocalizedContentCards(items, locale);
  return new Map(presented.filter((item) => item.slug).map((item) => [item.slug, item]));
}
