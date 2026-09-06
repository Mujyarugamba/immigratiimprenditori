import type { PlatformLocale } from "@/lib/i18n/config";

export const TRANSLATION_FALLBACK_NOTICE: Record<Exclude<PlatformLocale, "it">, string> = {
  en: "This newly published item is temporarily shown in its source language while its reviewed translation is being prepared.",
  fr: "Cet élément récemment publié est temporairement affiché dans sa langue source pendant la préparation de sa traduction vérifiée.",
  es: "Este elemento recién publicado se muestra temporalmente en su idioma de origen mientras se prepara su traducción revisada.",
  de: "Dieser neu veröffentlichte Eintrag wird vorübergehend in seiner Ausgangssprache angezeigt, während die geprüfte Übersetzung vorbereitet wird.",
  ar: "يُعرض هذا العنصر المنشور حديثاً مؤقتاً بلغته الأصلية إلى حين إعداد ترجمته المراجعة.",
  zh: "这项新发布内容暂时以原始语言显示，经过审核的译文正在准备中。",
};
