import type { PlatformLocale } from "@/lib/i18n/config";

type CollectionMessages = {
  centre: string;
  researchTitle: string;
  researchIntro: string;
  storiesTitle: string;
  storiesIntro: string;
  open: string;
  empty: string;
  originalNotice: string;
};

export const COLLECTION_MESSAGES: Record<PlatformLocale, CollectionMessages> = {
  it: {
    centre: "Centro Studi",
    researchTitle: "Ricerca",
    researchIntro: "Rapporti, ricerche, analisi, note dati e policy brief organizzati in un archivio unico e verificabile.",
    storiesTitle: "Storie e voci",
    storiesIntro: "Interviste, testimonianze e storie d'impresa che affiancano ai dati le esperienze delle persone.",
    open: "Apri",
    empty: "Nessun contenuto disponibile in questa raccolta.",
    originalNotice: "Questo contenuto è attualmente disponibile nella lingua originale.",
  },
  en: {
    centre: "Research Centre",
    researchTitle: "Research",
    researchIntro: "Reports, research, analysis, data notes and policy briefs organised in one verifiable archive.",
    storiesTitle: "Stories & voices",
    storiesIntro: "Interviews, testimonies and entrepreneurial stories that place people's experiences alongside the data.",
    open: "Open",
    empty: "No content is available in this collection.",
    originalNotice: "This content is currently available in its original language.",
  },
  fr: {
    centre: "Centre d'études",
    researchTitle: "Recherche",
    researchIntro: "Rapports, recherches, analyses, notes de données et notes de politique réunis dans une archive unique et vérifiable.",
    storiesTitle: "Histoires et voix",
    storiesIntro: "Entretiens, témoignages et histoires d'entreprise qui mettent les expériences humaines en regard des données.",
    open: "Ouvrir",
    empty: "Aucun contenu n'est disponible dans cette collection.",
    originalNotice: "Ce contenu est actuellement disponible dans sa langue originale.",
  },
  es: {
    centre: "Centro de Estudios",
    researchTitle: "Investigación",
    researchIntro: "Informes, investigaciones, análisis, notas de datos y policy briefs reunidos en un archivo único y verificable.",
    storiesTitle: "Historias y voces",
    storiesIntro: "Entrevistas, testimonios e historias empresariales que sitúan las experiencias de las personas junto a los datos.",
    open: "Abrir",
    empty: "No hay contenido disponible en esta colección.",
    originalNotice: "Este contenido está actualmente disponible en su idioma original.",
  },
  de: {
    centre: "Studienzentrum",
    researchTitle: "Forschung",
    researchIntro: "Berichte, Forschung, Analysen, Datennotizen und Policy Briefs in einem einheitlichen, überprüfbaren Archiv.",
    storiesTitle: "Geschichten und Stimmen",
    storiesIntro: "Interviews, Erfahrungsberichte und Unternehmensgeschichten, die den Daten die Erfahrungen von Menschen zur Seite stellen.",
    open: "Öffnen",
    empty: "In dieser Sammlung sind keine Inhalte verfügbar.",
    originalNotice: "Dieser Inhalt ist derzeit in der Originalsprache verfügbar.",
  },
  ar: {
    centre: "مركز الدراسات",
    researchTitle: "البحث",
    researchIntro: "تقارير وأبحاث وتحليلات ومذكرات بيانات وموجزات سياسات ضمن أرشيف واحد قابل للتحقق.",
    storiesTitle: "قصص وأصوات",
    storiesIntro: "مقابلات وشهادات وقصص أعمال تضع تجارب الأشخاص إلى جانب البيانات.",
    open: "فتح",
    empty: "لا يتوفر محتوى في هذه المجموعة.",
    originalNotice: "هذا المحتوى متاح حالياً بلغته الأصلية.",
  },
  zh: {
    centre: "研究中心",
    researchTitle: "研究",
    researchIntro: "将报告、研究、分析、数据说明和政策简报汇集到一个可核查的档案中。",
    storiesTitle: "故事与声音",
    storiesIntro: "通过访谈、证言和创业故事，让人的经验与数据相互补充。",
    open: "打开",
    empty: "此集合暂无内容。",
    originalNotice: "此内容目前以其原始语言提供。",
  },
};
