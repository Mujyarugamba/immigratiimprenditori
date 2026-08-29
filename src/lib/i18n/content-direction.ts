import { getPlatformLanguage, isPlatformLocale } from "@/lib/i18n/config";

/** ISO 639-1 codes that require RTL isolation for original editorial text. */
const RTL_LANGUAGE_CODES = new Set([
  "ar",
  "ckb",
  "dv",
  "fa",
  "he",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

/**
 * Catalog language_id → ISO code, aligned with public.languages seed.
 * Direction is derived from the code, not from the UI locale of the page.
 */
export const CATALOG_LANGUAGE_CODES: Record<number, string> = {
  1: "it",
  2: "en",
  3: "fr",
  4: "es",
  5: "pt",
  6: "de",
  7: "ar",
  8: "zh",
  9: "sw",
  10: "ro",
  11: "sq",
  12: "uk",
  13: "ru",
  14: "tr",
  15: "bn",
  16: "ur",
  17: "hi",
  18: "pa",
  19: "fa",
  20: "ti",
  21: "am",
  22: "wo",
  23: "zu",
  24: "so",
  25: "ha",
  26: "yo",
  27: "ig",
  28: "nl",
  29: "pl",
  30: "el",
};

export type WritingDirection = "ltr" | "rtl";

export function catalogLanguageCodeFromId(languageId?: number | null): string | undefined {
  if (languageId == null || !Number.isFinite(languageId)) return undefined;
  return CATALOG_LANGUAGE_CODES[languageId];
}

export function writingDirectionForLanguageCode(code?: string | null): WritingDirection {
  if (!code) return "ltr";
  const base = code.trim().toLowerCase().split(/[-_]/)[0];
  return RTL_LANGUAGE_CODES.has(base) ? "rtl" : "ltr";
}

export function writingDirectionForLanguageId(languageId?: number | null): WritingDirection {
  return writingDirectionForLanguageCode(catalogLanguageCodeFromId(languageId));
}

export function originalContentLanguageAttrs(languageId?: number | null): {
  dir: WritingDirection;
  lang?: string;
} {
  const lang = catalogLanguageCodeFromId(languageId);
  return {
    dir: writingDirectionForLanguageCode(lang),
    lang,
  };
}

/** Forward CTA glyph: mirrors on RTL UI locales, stays → on LTR locales. */
export function localizedCtaArrow(locale: string): "→" | "←" {
  if (isPlatformLocale(locale) && getPlatformLanguage(locale).direction === "rtl") {
    return "←";
  }
  return "→";
}
