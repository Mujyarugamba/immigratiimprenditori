import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import type { DeploymentEnv } from "@/lib/deployment/environment";
import { writingDirectionForLanguageCode, localizedCtaArrow } from "./content-direction";
import { aiTranslationMessages } from "./ai-translation/messages";
import {
  DEFAULT_AI_TRANSLATION_MODEL,
  translationGenerationGate,
} from "./ai-translation/config";
import { editorialContentFingerprint } from "./ai-translation/fingerprint";
import { isPublicEditorialContent } from "./ai-translation/gates";
import { requestEditorialTranslation } from "./ai-translation/openai";
import {
  presentEditorialContent,
  type CachedAiTranslation,
  type TranslationDeps,
  type TranslationSourceContent,
} from "./ai-translation/resolve";
import { resetTranslationFlightsForTests } from "./ai-translation/single-flight";
import {
  parseStructuredTranslation,
  validateStructuredTranslation,
} from "./ai-translation/validate";

const MIGRATION = fs.readFileSync(
  path.join(process.cwd(), "supabase/migrations/20260829120000_create_content_ai_translations.sql"),
  "utf8",
);

const publicContent: TranslationSourceContent = {
  id: "11111111-1111-1111-1111-111111111111",
  language_id: 1,
  title: "Imprese e credito in Italia",
  subtitle: null,
  abstract: "Una nota su accesso al credito. Vedi https://example.org/report e info@immigratiimprenditori.it.",
  body: "Primo paragrafo.\n\nSecondo paragrafo con [fonte](https://example.org/report).",
  body_format: "markdown",
  editorial_status: "ready",
  publication_status: "published",
  visibility_status: "public",
  archived_at: null,
};

function cachedRow(overrides: Partial<CachedAiTranslation> = {}): CachedAiTranslation {
  return {
    content_id: publicContent.id,
    target_locale: "en",
    source_language_id: 1,
    source_fingerprint: editorialContentFingerprint(publicContent),
    translated_title: "Businesses and credit in Italy",
    translated_subtitle: null,
    translated_abstract: "A note on access to credit. See https://example.org/report and info@immigratiimprenditori.it.",
    translated_body: "First paragraph.\n\nSecond paragraph with [source](https://example.org/report).",
    provider: "openai",
    model: DEFAULT_AI_TRANSLATION_MODEL,
    prompt_version: "editorial-public-v1",
    ...overrides,
  };
}

function deps(overrides: Partial<TranslationDeps> & { env?: DeploymentEnv } = {}): TranslationDeps {
  return {
    env: overrides.env ?? {},
    readTranslation: overrides.readTranslation ?? (async () => null),
    writeTranslation: overrides.writeTranslation ?? (async () => true),
    translate: overrides.translate ?? (async () => ({ ok: false })),
    reloadPublicContent: overrides.reloadPublicContent ?? (async () => publicContent),
  };
}

test("fingerprint is stable for identical editorial originals", () => {
  const a = editorialContentFingerprint(publicContent);
  const b = editorialContentFingerprint({ ...publicContent });
  assert.equal(a, b);
  assert.match(a, /^[a-f0-9]{64}$/);
});

test("changing title, body or language changes the fingerprint", () => {
  const base = editorialContentFingerprint(publicContent);
  assert.notEqual(editorialContentFingerprint({ ...publicContent, title: "Altro titolo" }), base);
  assert.notEqual(editorialContentFingerprint({ ...publicContent, body: "Corpo diverso" }), base);
  assert.notEqual(editorialContentFingerprint({ ...publicContent, language_id: 2 }), base);
});

test("fresh cache produces zero OpenAI calls", async () => {
  resetTranslationFlightsForTests();
  let openaiCalls = 0;
  let writes = 0;
  const presented = await presentEditorialContent(publicContent, "en", { allowGenerate: true }, deps({
    env: { AI_TRANSLATION_ENABLED: "true", OPENAI_API_KEY: "sk-test" },
    readTranslation: async () => cachedRow(),
    translate: async () => {
      openaiCalls += 1;
      return { ok: false };
    },
    writeTranslation: async () => {
      writes += 1;
      return true;
    },
  }));
  assert.equal(presented.isAiTranslation, true);
  assert.equal(presented.title, "Businesses and credit in Italy");
  assert.equal(openaiCalls, 0);
  assert.equal(writes, 0);
  assert.equal(presented.displayLanguageCode, "en");
});

test("target equal to source produces zero OpenAI calls", async () => {
  resetTranslationFlightsForTests();
  let openaiCalls = 0;
  const englishOriginal = { ...publicContent, language_id: 2 };
  const presented = await presentEditorialContent(englishOriginal, "en", { allowGenerate: true }, deps({
    env: { AI_TRANSLATION_ENABLED: "true", OPENAI_API_KEY: "sk-test" },
    translate: async () => {
      openaiCalls += 1;
      return { ok: false };
    },
  }));
  assert.equal(presented.isAiTranslation, false);
  assert.equal(presented.title, englishOriginal.title);
  assert.equal(openaiCalls, 0);
});

test("Preview read-only blocks OpenAI calls and writes", async () => {
  resetTranslationFlightsForTests();
  let openaiCalls = 0;
  let writes = 0;
  const presented = await presentEditorialContent(publicContent, "en", { allowGenerate: true }, deps({
    env: {
      NEXT_PUBLIC_PREVIEW_READ_ONLY: "true",
      AI_TRANSLATION_ENABLED: "true",
      OPENAI_API_KEY: "sk-test",
    },
    translate: async () => {
      openaiCalls += 1;
      return { ok: false };
    },
    writeTranslation: async () => {
      writes += 1;
      return true;
    },
  }));
  assert.equal(translationGenerationGate({
    NEXT_PUBLIC_PREVIEW_READ_ONLY: "true",
    AI_TRANSLATION_ENABLED: "true",
    OPENAI_API_KEY: "sk-test",
  }).allowed, false);
  assert.equal(presented.isAiTranslation, false);
  assert.equal(openaiCalls, 0);
  assert.equal(writes, 0);
});

test("disabled flag and missing API key do not call OpenAI", async () => {
  resetTranslationFlightsForTests();
  let openaiCalls = 0;
  const translate = async () => {
    openaiCalls += 1;
    return { ok: false } as const;
  };
  const disabled = await presentEditorialContent(publicContent, "fr", { allowGenerate: true }, deps({
    env: { AI_TRANSLATION_ENABLED: "false", OPENAI_API_KEY: "sk-test" },
    translate,
  }));
  const missing = await presentEditorialContent(publicContent, "fr", { allowGenerate: true }, deps({
    env: { AI_TRANSLATION_ENABLED: "true" },
    translate,
  }));
  assert.equal(disabled.isAiTranslation, false);
  assert.equal(missing.isAiTranslation, false);
  assert.equal(openaiCalls, 0);
});

test("public content may be translated and unpublished content is refused", async () => {
  resetTranslationFlightsForTests();
  let writes = 0;
  const translation = cachedRow();
  const publicResult = await presentEditorialContent(publicContent, "en", { allowGenerate: true }, deps({
    env: { AI_TRANSLATION_ENABLED: "true", OPENAI_API_KEY: "sk-test" },
    translate: async () => ({
      ok: true,
      translation: {
        title: translation.translated_title,
        subtitle: translation.translated_subtitle,
        abstract: translation.translated_abstract,
        body: translation.translated_body,
      },
      model: DEFAULT_AI_TRANSLATION_MODEL,
      provider: "openai",
      promptVersion: "editorial-public-v1",
      usage: { inputTokens: 10, outputTokens: 20 },
    }),
    writeTranslation: async () => {
      writes += 1;
      return true;
    },
  }));
  assert.equal(isPublicEditorialContent(publicContent), true);
  assert.equal(publicResult.isAiTranslation, true);
  assert.equal(writes, 1);

  writes = 0;
  let openaiCalls = 0;
  const privateResult = await presentEditorialContent({
    ...publicContent,
    publication_status: "unpublished",
    visibility_status: "private",
    editorial_status: "draft",
  }, "en", { allowGenerate: true }, deps({
    env: { AI_TRANSLATION_ENABLED: "true", OPENAI_API_KEY: "sk-test" },
    translate: async () => {
      openaiCalls += 1;
      return { ok: false };
    },
    writeTranslation: async () => {
      writes += 1;
      return true;
    },
  }));
  assert.equal(privateResult.isAiTranslation, false);
  assert.equal(openaiCalls, 0);
  assert.equal(writes, 0);
});

test("valid structured output can be cached and invalid output is not written", () => {
  const valid = parseStructuredTranslation({
    title: "Businesses and credit in Italy",
    subtitle: null,
    abstract: "A note on access to credit. See https://example.org/report and info@immigratiimprenditori.it.",
    body: "First paragraph.\n\nSecond paragraph with [source](https://example.org/report).",
  });
  assert.equal("error" in valid, false);
  if ("error" in valid) return;
  assert.equal(
    validateStructuredTranslation({
      original: publicContent,
      translated: valid,
      targetLocale: "en",
      contentId: publicContent.id,
    }),
    null,
  );

  const extra = parseStructuredTranslation({
    title: "Ok",
    subtitle: null,
    abstract: null,
    body: "Body",
    comment: "nope",
  });
  assert.deepEqual(extra, { error: "unexpected_fields" });
  assert.equal(
    validateStructuredTranslation({
      original: publicContent,
      translated: { title: "Missing link", subtitle: null, abstract: "no url", body: "nope" },
      targetLocale: "en",
      contentId: publicContent.id,
    }),
    "missing_url",
  );
});

test("OpenAI transport is used only when generation is requested and output is valid", async () => {
  resetTranslationFlightsForTests();
  let writes = 0;
  const presented = await presentEditorialContent(publicContent, "en", { allowGenerate: true }, deps({
    env: { AI_TRANSLATION_ENABLED: "true", OPENAI_API_KEY: "sk-test" },
    translate: async () => ({
      ok: true,
      translation: {
        title: "Businesses and credit in Italy",
        subtitle: null,
        abstract: "A note on access to credit. See https://example.org/report and info@immigratiimprenditori.it.",
        body: "First paragraph.\n\nSecond paragraph with [source](https://example.org/report).",
      },
      model: DEFAULT_AI_TRANSLATION_MODEL,
      provider: "openai",
      promptVersion: "editorial-public-v1",
      usage: { inputTokens: 1, outputTokens: 2 },
    }),
    writeTranslation: async () => {
      writes += 1;
      return true;
    },
  }));
  assert.equal(presented.isAiTranslation, true);
  assert.equal(writes, 1);

  writes = 0;
  const invalid = await presentEditorialContent(publicContent, "fr", { allowGenerate: true }, deps({
    env: { AI_TRANSLATION_ENABLED: "true", OPENAI_API_KEY: "sk-test" },
    translate: async () => ({
      ok: true,
      translation: { title: "Sans URL", subtitle: null, abstract: "rien", body: "rien" },
      model: DEFAULT_AI_TRANSLATION_MODEL,
      provider: "openai",
      promptVersion: "editorial-public-v1",
      usage: { inputTokens: 1, outputTokens: 2 },
    }),
    writeTranslation: async () => {
      writes += 1;
      return true;
    },
  }));
  assert.equal(invalid.isAiTranslation, false);
  assert.equal(writes, 0);
});

test("Arabic translation direction is RTL and Italian original stays LTR on /ar", () => {
  assert.equal(writingDirectionForLanguageCode("ar"), "rtl");
  assert.equal(writingDirectionForLanguageCode("it"), "ltr");
  assert.equal(writingDirectionForLanguageCode("en"), "ltr");
  assert.equal(localizedCtaArrow("ar"), "←");
  assert.equal(localizedCtaArrow("en"), "→");
});

test("AI disclaimer strings are used only for actual translations and original=1 stays original", async () => {
  resetTranslationFlightsForTests();
  const translated = await presentEditorialContent(publicContent, "en", { allowGenerate: false }, deps({
    readTranslation: async () => cachedRow(),
  }));
  const originalView = await presentEditorialContent(publicContent, "en", { preferOriginal: true }, deps({
    readTranslation: async () => cachedRow(),
  }));
  const fallback = await presentEditorialContent(publicContent, "en", { allowGenerate: false }, deps());
  assert.equal(translated.isAiTranslation, true);
  assert.equal(originalView.isAiTranslation, false);
  assert.equal(originalView.isViewingOriginal, true);
  assert.equal(originalView.title, publicContent.title);
  assert.equal(fallback.isAiTranslation, false);
  assert.match(aiTranslationMessages("it", "it").aiTitle, /Traduzione automatica mediante intelligenza artificiale/);
  assert.match(aiTranslationMessages("it", "it").aiBody, /dall’originale in italiano/);
  assert.doesNotMatch(aiTranslationMessages("it", "it").aiBody, /revisionat|verificat|ufficiale/i);
  assert.doesNotMatch(aiTranslationMessages("en", "it").aiBody, /reviewed|verified|official/i);
});

test("content_ai_translations RLS is public-select only and denies anon writes", () => {
  assert.match(MIGRATION, /enable row level security/);
  assert.match(MIGRATION, /policy content_ai_translations_public_read/);
  assert.match(MIGRATION, /editorial_status = 'ready'/);
  assert.match(MIGRATION, /publication_status = 'published'/);
  assert.match(MIGRATION, /visibility_status = 'public'/);
  assert.match(MIGRATION, /archived_at is null/);
  assert.match(MIGRATION, /revoke all on table public\.content_ai_translations from public, anon, authenticated/i);
  assert.match(MIGRATION, /grant select on table public\.content_ai_translations to anon, authenticated/i);
  assert.match(MIGRATION, /grant select, insert, update on table public\.content_ai_translations to service_role/i);
  assert.doesNotMatch(MIGRATION, /create policy[\s\S]*for insert[\s\S]*anon/i);
  assert.doesNotMatch(MIGRATION, /create policy[\s\S]*for update[\s\S]*anon/i);
  assert.doesNotMatch(MIGRATION, /create policy[\s\S]*for delete[\s\S]*anon/i);
});

test("OpenAI request helper never serializes the API key in thrown output and uses gpt-5.6-terra by default", async () => {
  assert.equal(DEFAULT_AI_TRANSLATION_MODEL, "gpt-5.6-terra");
  const result = await requestEditorialTranslation(
    {
      sourceLanguageCode: "it",
      targetLocale: "en",
      bodyFormat: "markdown",
      title: publicContent.title,
      subtitle: null,
      abstract: publicContent.abstract ?? null,
      body: publicContent.body,
    },
    {
      env: { OPENAI_API_KEY: "sk-secret-value-do-not-leak" },
      transport: async (_url, init) => {
        const headers = init.headers as Record<string, string>;
        assert.match(headers.Authorization, /Bearer sk-secret-value-do-not-leak/);
        const body = JSON.parse(String(init.body)) as { model: string };
        assert.equal(body.model, "gpt-5.6-terra");
        return new Response(JSON.stringify({
          output_text: JSON.stringify({
            title: "Businesses and credit in Italy",
            subtitle: null,
            abstract: publicContent.abstract,
            body: publicContent.body,
          }),
        }), { status: 200 });
      },
    },
  );
  assert.equal(result.ok, true);
});

test("missing OpenAI key falls back without throwing", async () => {
  const result = await requestEditorialTranslation({
    sourceLanguageCode: "it",
    targetLocale: "en",
    bodyFormat: "markdown",
    title: "T",
    subtitle: null,
    abstract: null,
    body: "B",
  }, { env: {} });
  assert.deepEqual(result, { ok: false, reason: "missing_api_key" });
});
