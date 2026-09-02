import type { PlatformLocale } from "@/lib/i18n/config";

type Locale = Exclude<PlatformLocale, "it">;

type VisualCopy = {
  kicker: string;
  motionWords: readonly string[];
  manifestWords: readonly string[];
  toolsArchive: string;
  open: string;
  contributeTitle: string;
  contributeText: string;
  contributeCta: string;
};

export const EDITORIAL_VISUAL_COPY: Record<Locale, VisualCopy> = {
  en: {
    kicker: "Immigrati Imprenditori · Research Centre",
    motionWords: ["Data", "Research", "Stories", "Territories", "Enterprise"],
    manifestWords: ["Study", "Measure", "Tell", "Document"],
    toolsArchive: "Tools and archives",
    open: "Open",
    contributeTitle: "Contribute to knowledge",
    contributeText: "Entrepreneurs, professionals, researchers, lecturers, universities, associations and institutions can propose stories, research contributions, publications, events, data and sources to the editorial team.",
    contributeCta: "Take part in the Research Centre",
  },
  fr: {
    kicker: "Immigrati Imprenditori · Centre d’études",
    motionWords: ["Données", "Recherche", "Récits", "Territoires", "Entreprise"],
    manifestWords: ["Étudier", "Mesurer", "Raconter", "Documenter"],
    toolsArchive: "Outils et archives",
    open: "Ouvrir",
    contributeTitle: "Contribuer à la connaissance",
    contributeText: "Entrepreneurs, professionnels, chercheurs, enseignants, universités, associations et institutions peuvent proposer à la rédaction des récits, contributions de recherche, publications, événements, données et sources.",
    contributeCta: "Participer au Centre d’études",
  },
  es: {
    kicker: "Immigrati Imprenditori · Centro de Estudios",
    motionWords: ["Datos", "Investigación", "Historias", "Territorios", "Empresa"],
    manifestWords: ["Estudiar", "Medir", "Contar", "Documentar"],
    toolsArchive: "Herramientas y archivos",
    open: "Abrir",
    contributeTitle: "Contribuye al conocimiento",
    contributeText: "Emprendedores, profesionales, investigadores, docentes, universidades, asociaciones e instituciones pueden proponer a la redacción historias, aportaciones de investigación, publicaciones, eventos, datos y fuentes.",
    contributeCta: "Participa en el Centro de Estudios",
  },
  de: {
    kicker: "Immigrati Imprenditori · Studienzentrum",
    motionWords: ["Daten", "Forschung", "Geschichten", "Regionen", "Unternehmen"],
    manifestWords: ["Untersuchen", "Messen", "Erzählen", "Dokumentieren"],
    toolsArchive: "Werkzeuge und Archive",
    open: "Öffnen",
    contributeTitle: "Zum Wissen beitragen",
    contributeText: "Unternehmer, Fachleute, Forschende, Lehrende, Universitäten, Verbände und Institutionen können der Redaktion Geschichten, Forschungsbeiträge, Publikationen, Veranstaltungen, Daten und Quellen vorschlagen.",
    contributeCta: "Am Studienzentrum mitwirken",
  },
  ar: {
    kicker: "Immigrati Imprenditori · مركز الدراسات",
    motionWords: ["بيانات", "بحث", "قصص", "أقاليم", "ريادة"],
    manifestWords: ["ندرس", "نقيس", "نروي", "نوثق"],
    toolsArchive: "الأدوات والأرشيفات",
    open: "فتح",
    contributeTitle: "ساهم في المعرفة",
    contributeText: "يمكن لرواد الأعمال والمهنيين والباحثين والمدرسين والجامعات والجمعيات والمؤسسات اقتراح قصص ومساهمات بحثية ومنشورات وفعاليات وبيانات ومصادر على هيئة التحرير.",
    contributeCta: "شارك في مركز الدراسات",
  },
  zh: {
    kicker: "Immigrati Imprenditori · 研究中心",
    motionWords: ["数据", "研究", "故事", "地区", "创业"],
    manifestWords: ["研究", "衡量", "讲述", "记录"],
    toolsArchive: "工具与档案",
    open: "打开",
    contributeTitle: "共同积累知识",
    contributeText: "企业家、专业人士、研究人员、教师、大学、协会和机构都可以向编辑团队推荐故事、研究成果、出版物、活动、数据和来源。",
    contributeCta: "参与研究中心",
  },
};
