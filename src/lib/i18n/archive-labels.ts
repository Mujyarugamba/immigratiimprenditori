import type { PlatformLocale } from "@/lib/i18n/config";

type Locale = Exclude<PlatformLocale, "it">;

const CONTENT_TYPE_LABELS: Record<Locale, Record<string, string>> = {
  en: { guide:"Guide", insight:"Insight", institutional_page:"Institutional page", research_report:"Research report", working_paper:"Working paper", policy_brief:"Policy brief", dossier:"Dossier", data_note:"Data note", interview:"Interview", story:"Story", testimony:"Testimony" },
  fr: { guide:"Guide", insight:"Analyse", institutional_page:"Page institutionnelle", research_report:"Rapport de recherche", working_paper:"Document de travail", policy_brief:"Note de politique", dossier:"Dossier", data_note:"Note de données", interview:"Entretien", story:"Récit", testimony:"Témoignage" },
  es: { guide:"Guía", insight:"Análisis", institutional_page:"Página institucional", research_report:"Informe de investigación", working_paper:"Documento de trabajo", policy_brief:"Nota de política", dossier:"Dossier", data_note:"Nota de datos", interview:"Entrevista", story:"Historia", testimony:"Testimonio" },
  de: { guide:"Leitfaden", insight:"Analyse", institutional_page:"Institutionelle Seite", research_report:"Forschungsbericht", working_paper:"Arbeitspapier", policy_brief:"Policy Brief", dossier:"Dossier", data_note:"Datennotiz", interview:"Interview", story:"Geschichte", testimony:"Erfahrungsbericht" },
  ar: { guide:"دليل", insight:"تحليل", institutional_page:"صفحة مؤسسية", research_report:"تقرير بحثي", working_paper:"ورقة عمل", policy_brief:"موجز سياسات", dossier:"ملف", data_note:"مذكرة بيانات", interview:"مقابلة", story:"قصة", testimony:"شهادة" },
  zh: { guide:"指南", insight:"分析", institutional_page:"机构页面", research_report:"研究报告", working_paper:"工作论文", policy_brief:"政策简报", dossier:"专题资料", data_note:"数据说明", interview:"访谈", story:"故事", testimony:"证言" },
};

const DELIVERY_MODE_LABELS: Record<Locale, Record<string, string>> = {
  en: { in_presence:"In person", online:"Online", hybrid:"Hybrid" },
  fr: { in_presence:"En présentiel", online:"En ligne", hybrid:"Hybride" },
  es: { in_presence:"Presencial", online:"En línea", hybrid:"Híbrido" },
  de: { in_presence:"Vor Ort", online:"Online", hybrid:"Hybrid" },
  ar: { in_presence:"حضوري", online:"عبر الإنترنت", hybrid:"هجين" },
  zh: { in_presence:"线下", online:"线上", hybrid:"混合" },
};

const RESULT_WORDS: Record<Locale, { one:string; many:string }> = {
  en:{one:"result",many:"results"}, fr:{one:"résultat",many:"résultats"}, es:{one:"resultado",many:"resultados"}, de:{one:"Ergebnis",many:"Ergebnisse"}, ar:{one:"نتيجة",many:"نتائج"}, zh:{one:"项结果",many:"项结果"},
};

export function contentTypeLabel(locale: Locale, code: string): string {
  return CONTENT_TYPE_LABELS[locale][code] ?? code.replaceAll("_", " ");
}

export function deliveryModeLabel(locale: Locale, code: string): string {
  return DELIVERY_MODE_LABELS[locale][code] ?? code.replaceAll("_", " ");
}

export function resultCountLabel(locale: Locale, count: number): string {
  if (locale === "zh") return `${count} ${RESULT_WORDS.zh.many}`;
  return `${count} ${count === 1 ? RESULT_WORDS[locale].one : RESULT_WORDS[locale].many}`;
}
