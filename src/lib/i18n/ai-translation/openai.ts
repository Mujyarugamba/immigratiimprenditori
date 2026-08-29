import type { DeploymentEnv } from "@/lib/deployment/environment";
import {
  AI_TRANSLATION_PROMPT_VERSION,
  AI_TRANSLATION_PROVIDER,
  OPENAI_RESPONSES_URL,
  aiTranslationModel,
  openaiApiKey,
  type AiTranslationTargetLocale,
} from "./config";
import {
  parseStructuredTranslation,
  type StructuredTranslation,
  type TranslationValidationFailure,
} from "./validate";

export type OpenAiTranslationRequest = {
  sourceLanguageCode: string;
  targetLocale: AiTranslationTargetLocale;
  bodyFormat: string;
  title: string;
  subtitle: string | null;
  abstract: string | null;
  body: string;
};

export type OpenAiTranslationSuccess = {
  ok: true;
  translation: StructuredTranslation;
  model: string;
  provider: typeof AI_TRANSLATION_PROVIDER;
  promptVersion: typeof AI_TRANSLATION_PROMPT_VERSION;
  usage: { inputTokens: number | null; outputTokens: number | null };
};

export type OpenAiTranslationFailure = {
  ok: false;
  reason: TranslationValidationFailure | "openai_error" | "missing_api_key";
};

export type OpenAiTransport = (
  url: string,
  init: RequestInit,
) => Promise<Response>;

const OPENAI_TRANSLATION_TIMEOUT_MS = 20_000;
const OPENAI_TRANSLATION_MAX_OUTPUT_TOKENS = 4_096;

const TRANSLATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "subtitle", "abstract", "body"],
  properties: {
    title: { type: "string" },
    subtitle: { type: ["string", "null"] },
    abstract: { type: ["string", "null"] },
    body: { type: "string" },
  },
} as const;

function developerPrompt(targetLocale: string, sourceLanguageCode: string, bodyFormat: string): string {
  return [
    "You are a professional translator for a public research-centre website.",
    `Translate the supplied editorial content from ${sourceLanguageCode} into ${targetLocale}.`,
    "Translate faithfully. Do not summarize, expand, comment, correct facts, invent information, add explanations, or omit parts.",
    "Preserve structure: paragraphs, headings, lists, markdown, links, URLs, public email addresses, numbers, percentages, dates, currencies, quotations and attributions.",
    "Preserve proper names unless a conventional form exists in the target language.",
    "Preserve technical and scientific meaning.",
    `The body_format is ${bodyFormat}. Preserve that format.`,
    "If subtitle is null, return JSON null for subtitle. If abstract is null, return JSON null for abstract. Do not invent those fields.",
    "Return only the structured object with keys title, subtitle, abstract, body.",
  ].join(" ");
}

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return record.output_text;
  }
  const output = record.output;
  if (!Array.isArray(output)) return null;
  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") chunks.push(text);
    }
  }
  const joined = chunks.join("\n").trim();
  return joined || null;
}

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced?.[1] ?? trimmed;
  return JSON.parse(candidate) as unknown;
}

export async function requestEditorialTranslation(
  request: OpenAiTranslationRequest,
  options: { env?: DeploymentEnv; transport?: OpenAiTransport } = {},
): Promise<OpenAiTranslationSuccess | OpenAiTranslationFailure> {
  const env = options.env ?? process.env;
  const apiKey = openaiApiKey(env);
  if (!apiKey) return { ok: false, reason: "missing_api_key" };

  const model = aiTranslationModel(env);
  const transport = options.transport ?? fetch;
  let response: Response;
  try {
    response = await transport(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(OPENAI_TRANSLATION_TIMEOUT_MS),
      body: JSON.stringify({
        model,
        store: false,
        reasoning: { effort: "none" },
        max_output_tokens: OPENAI_TRANSLATION_MAX_OUTPUT_TOKENS,
        input: [
          {
            role: "developer",
            content: developerPrompt(request.targetLocale, request.sourceLanguageCode, request.bodyFormat),
          },
          {
            role: "user",
            content: JSON.stringify({
              source_language: request.sourceLanguageCode,
              target_locale: request.targetLocale,
              body_format: request.bodyFormat,
              title: request.title,
              subtitle: request.subtitle,
              abstract: request.abstract,
              body: request.body,
            }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "editorial_translation",
            strict: true,
            schema: TRANSLATION_SCHEMA,
          },
        },
      }),
    });
  } catch {
    return { ok: false, reason: "openai_error" };
  }

  if (!response.ok) {
    return { ok: false, reason: "openai_error" };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  if (
    payload &&
    typeof payload === "object" &&
    typeof (payload as { status?: unknown }).status === "string" &&
    (payload as { status: string }).status !== "completed"
  ) {
    return { ok: false, reason: "openai_error" };
  }

  const outputText = extractOutputText(payload);
  if (!outputText) return { ok: false, reason: "invalid_json" };

  let parsed: unknown;
  try {
    parsed = parseJsonObject(outputText);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  const translation = parseStructuredTranslation(parsed);
  if ("error" in translation) return { ok: false, reason: translation.error };

  const usage = (payload as { usage?: { input_tokens?: number; output_tokens?: number } }).usage;
  return {
    ok: true,
    translation,
    model,
    provider: AI_TRANSLATION_PROVIDER,
    promptVersion: AI_TRANSLATION_PROMPT_VERSION,
    usage: {
      inputTokens: typeof usage?.input_tokens === "number" ? usage.input_tokens : null,
      outputTokens: typeof usage?.output_tokens === "number" ? usage.output_tokens : null,
    },
  };
}
