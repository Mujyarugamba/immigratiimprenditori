import type { PlatformLocale } from "@/lib/i18n/config";
import { catalogLanguageCodeFromId } from "@/lib/i18n/content-direction";

const LANGUAGE_NAMES: Record<PlatformLocale, Record<string, string>> = {
  it: {
    it: "italiano",
    en: "inglese",
    fr: "francese",
    es: "spagnolo",
    de: "tedesco",
    ar: "arabo",
    zh: "cinese",
    pt: "portoghese",
    ur: "urdu",
    fa: "persiano",
  },
  en: {
    it: "Italian",
    en: "English",
    fr: "French",
    es: "Spanish",
    de: "German",
    ar: "Arabic",
    zh: "Chinese",
    pt: "Portuguese",
    ur: "Urdu",
    fa: "Persian",
  },
  fr: {
    it: "italien",
    en: "anglais",
    fr: "français",
    es: "espagnol",
    de: "allemand",
    ar: "arabe",
    zh: "chinois",
    pt: "portugais",
    ur: "ourdou",
    fa: "persan",
  },
  es: {
    it: "italiano",
    en: "inglés",
    fr: "francés",
    es: "español",
    de: "alemán",
    ar: "árabe",
    zh: "chino",
    pt: "portugués",
    ur: "urdu",
    fa: "persa",
  },
  de: {
    it: "Italienisch",
    en: "Englisch",
    fr: "Französisch",
    es: "Spanisch",
    de: "Deutsch",
    ar: "Arabisch",
    zh: "Chinesisch",
    pt: "Portugiesisch",
    ur: "Urdu",
    fa: "Persisch",
  },
  ar: {
    it: "الإيطالية",
    en: "الإنجليزية",
    fr: "الفرنسية",
    es: "الإسبانية",
    de: "الألمانية",
    ar: "العربية",
    zh: "الصينية",
    pt: "البرتغالية",
    ur: "الأردية",
    fa: "الفارسية",
  },
  zh: {
    it: "意大利语",
    en: "英语",
    fr: "法语",
    es: "西班牙语",
    de: "德语",
    ar: "阿拉伯语",
    zh: "中文",
    pt: "葡萄牙语",
    ur: "乌尔都语",
    fa: "波斯语",
  },
};

export type AiTranslationMessages = {
  aiTitle: string;
  aiBody: string;
  viewOriginal: string;
  originalVersion: string;
  backToTranslation: string;
  originalFallback: string;
};

function languageName(uiLocale: PlatformLocale, sourceCode: string): string {
  return LANGUAGE_NAMES[uiLocale][sourceCode] ?? sourceCode;
}

export function sourceLanguageCodeFromId(languageId?: number | null): string {
  return catalogLanguageCodeFromId(languageId) ?? "und";
}

export function formatSourceLanguageName(uiLocale: PlatformLocale, sourceCode: string): string {
  return languageName(uiLocale, sourceCode);
}

export function aiTranslationMessages(
  uiLocale: PlatformLocale,
  sourceCode: string,
): AiTranslationMessages {
  const language = languageName(uiLocale, sourceCode);
  switch (uiLocale) {
    case "it":
      return {
        aiTitle: "Traduzione automatica mediante intelligenza artificiale.",
        aiBody: `Questo contenuto è stato tradotto automaticamente dall’originale in ${language}. Il testo può contenere imprecisioni o errori. In caso di divergenze, fa fede il contenuto nella lingua originale.`,
        viewOriginal: `Visualizza il contenuto originale in ${language}`,
        originalVersion: "Versione originale",
        backToTranslation: "Torna alla traduzione",
        originalFallback: "Questo contenuto è attualmente disponibile nella lingua originale.",
      };
    case "en":
      return {
        aiTitle: "Automatic translation produced by artificial intelligence.",
        aiBody: `This content has been translated automatically from the original in ${language}. The text may contain inaccuracies or errors. If there is any divergence, the original-language content prevails.`,
        viewOriginal: `View the original content in ${language}`,
        originalVersion: "Original version",
        backToTranslation: "Back to the translation",
        originalFallback: "This content is currently available in its original language.",
      };
    case "fr":
      return {
        aiTitle: "Traduction automatique produite par intelligence artificielle.",
        aiBody: `Ce contenu a été traduit automatiquement à partir de l’original en ${language}. Le texte peut contenir des imprécisions ou des erreurs. En cas de divergence, le contenu dans la langue originale fait foi.`,
        viewOriginal: `Afficher le contenu original en ${language}`,
        originalVersion: "Version originale",
        backToTranslation: "Retour à la traduction",
        originalFallback: "Ce contenu est actuellement disponible dans sa langue originale.",
      };
    case "es":
      return {
        aiTitle: "Traducción automática mediante inteligencia artificial.",
        aiBody: `Este contenido se ha traducido automáticamente a partir del original en ${language}. El texto puede contener imprecisiones o errores. En caso de divergencia, prevalece el contenido en la lengua original.`,
        viewOriginal: `Ver el contenido original en ${language}`,
        originalVersion: "Versión original",
        backToTranslation: "Volver a la traducción",
        originalFallback: "Este contenido está actualmente disponible en su idioma original.",
      };
    case "de":
      return {
        aiTitle: "Automatische Übersetzung durch künstliche Intelligenz.",
        aiBody: `Dieser Inhalt wurde automatisch aus dem Original auf ${language} übersetzt. Der Text kann Ungenauigkeiten oder Fehler enthalten. Bei Abweichungen gilt der Inhalt in der Originalsprache.`,
        viewOriginal: `Originalinhalt auf ${language} anzeigen`,
        originalVersion: "Originalfassung",
        backToTranslation: "Zurück zur Übersetzung",
        originalFallback: "Dieser Inhalt ist derzeit in der Originalsprache verfügbar.",
      };
    case "ar":
      return {
        aiTitle: "ترجمة آلية بواسطة الذكاء الاصطناعي.",
        aiBody: `تُرجم هذا المحتوى تلقائياً عن الأصل باللغة ${language}. قد يتضمن النص عدم دقة أو أخطاء. وفي حال الاختلاف يُعتد بالمحتوى في اللغة الأصلية.`,
        viewOriginal: `عرض المحتوى الأصلي باللغة ${language}`,
        originalVersion: "النسخة الأصلية",
        backToTranslation: "العودة إلى الترجمة",
        originalFallback: "هذا المحتوى متاح حالياً بلغته الأصلية.",
      };
    case "zh":
      return {
        aiTitle: "由人工智能生成的自动翻译。",
        aiBody: `本内容已根据${language}原文自动翻译。译文可能存在不准确或错误。如有出入，以原文内容为准。`,
        viewOriginal: `查看${language}原文`,
        originalVersion: "原文版本",
        backToTranslation: "返回译文",
        originalFallback: "此内容目前以其原始语言提供。",
      };
  }
}
