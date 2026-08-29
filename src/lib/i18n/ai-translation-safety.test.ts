import assert from "node:assert/strict";
import test from "node:test";
import { editorialContentFingerprint } from "./ai-translation/fingerprint";
import { requestEditorialTranslation } from "./ai-translation/openai";
import {
  presentEditorialContent,
  type TranslationSourceContent,
} from "./ai-translation/resolve";
import { resetTranslationFlightsForTests } from "./ai-translation/single-flight";

const cleanContent: TranslationSourceContent = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  language_id: 1,
  title: "Titolo pubblico",
  subtitle: null,
  abstract: null,
  body: "Corpo pubblico.",
  body_format: "markdown",
  editorial_status: "ready",
  publication_status: "published",
  visibility_status: "public",
  archived_at: null,
};

const rawContent: TranslationSourceContent = {
  ...cleanContent,
  body: [
    cleanContent.body,
    "---",
    "d1d_source_url: https://internal.invalid/acquisition",
    "d1d_natural_key: source:fixture-1",
    "d1d_import_batch: private-batch",
  ].join("\n"),
};

test("AI translation fingerprint ignores the internal acquisition trailer", () => {
  assert.equal(
    editorialContentFingerprint(rawContent),
    editorialContentFingerprint(cleanContent),
  );
});

test("AI translation sends only the public body and persists its fingerprint", async () => {
  resetTranslationFlightsForTests();
  let requestBody: string | null = null;
  let persistedFingerprint: string | null = null;

  const presented = await presentEditorialContent(
    rawContent,
    "en",
    { allowGenerate: true },
    {
      env: { AI_TRANSLATION_ENABLED: "true", OPENAI_API_KEY: "sk-test" },
      readTranslation: async () => null,
      reloadPublicContent: async () => rawContent,
      translate: async (request) => {
        requestBody = request.body;
        return {
          ok: true,
          translation: {
            title: "Public title",
            subtitle: null,
            abstract: null,
            body: "Public body.",
          },
          model: "gpt-5.6-terra",
          provider: "openai",
          promptVersion: "editorial-public-v1",
          usage: { inputTokens: 12, outputTokens: 8 },
        };
      },
      writeTranslation: async (row) => {
        persistedFingerprint = row.source_fingerprint;
        return true;
      },
    },
  );

  assert.equal(requestBody, cleanContent.body);
  assert.equal(persistedFingerprint, editorialContentFingerprint(cleanContent));
  assert.equal(presented.isAiTranslation, true);
  assert.equal(presented.body, "Public body.");
});

test("AI translation failure falls back to the sanitized public body", async () => {
  resetTranslationFlightsForTests();
  const presented = await presentEditorialContent(
    rawContent,
    "en",
    { allowGenerate: true },
    {
      env: { AI_TRANSLATION_ENABLED: "true", OPENAI_API_KEY: "sk-test" },
      readTranslation: async () => null,
      reloadPublicContent: async () => rawContent,
      translate: async () => ({ ok: false }),
      writeTranslation: async () => true,
    },
  );

  assert.equal(presented.isAiTranslation, false);
  assert.equal(presented.body, cleanContent.body);
  assert.doesNotMatch(presented.body, /d1d_/i);
});

test("OpenAI translation request is non-stored, bounded and non-reasoning", async () => {
  let capturedInit: RequestInit | null = null;
  const result = await requestEditorialTranslation(
    {
      sourceLanguageCode: "it",
      targetLocale: "en",
      bodyFormat: "markdown",
      title: "Titolo pubblico",
      subtitle: null,
      abstract: null,
      body: "Corpo pubblico.",
    },
    {
      env: { OPENAI_API_KEY: "sk-test" },
      transport: async (_url, init) => {
        capturedInit = init;
        return new Response(
          JSON.stringify({
            status: "completed",
            output_text: JSON.stringify({
              title: "Public title",
              subtitle: null,
              abstract: null,
              body: "Public body.",
            }),
            usage: { input_tokens: 10, output_tokens: 6 },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  );

  assert.equal(result.ok, true);
  assert.ok(capturedInit);
  const payload = JSON.parse(String(capturedInit.body)) as {
    store?: boolean;
    reasoning?: { effort?: string };
    max_output_tokens?: number;
  };
  assert.equal(payload.store, false);
  assert.equal(payload.reasoning?.effort, "none");
  assert.equal(payload.max_output_tokens, 4096);
  assert.ok(capturedInit.signal instanceof AbortSignal);
});
