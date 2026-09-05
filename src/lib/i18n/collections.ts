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
    storiesIntro: "Interviste e storie d'impresa di founder, imprenditori, manager e professionisti: dalle microimprese alle PMI, startup, industria e imprese ad alta innovazione, per documentare decisioni, crescita, mercati e traiettorie tra Paesi.",
    open: "Apri",
    empty: "Nessun contenuto disponibile in questa raccolta.",
    originalNotice: "Questo contenuto è attualmente disponibile nella lingua originale.",
  },
  en: {
    centre: "Research Centre",
    researchTitle: "Research",
    researchIntro: "Reports, research, analysis, data notes and policy briefs organised in one verifiable archive.",
    storiesTitle: "Stories & voices",
    storiesIntro: "Interviews and business stories of founders, entrepreneurs, executives and professionals — from micro-enterprises and SMEs to startups, industry and high-innovation companies — documenting decisions, growth, markets and cross-border trajectories.",
    open: "Open",
    empty: "No content is available in this collection.",
    originalNotice: "This content is currently available in its original language.",
  },
  fr: {
    centre: "Centre d'études",
    researchTitle: "Recherche",
    researchIntro: "Rapports, recherches, analyses, notes de données et notes de politique réunis dans une archive unique et vérifiable.",
    storiesTitle: "Histoires et voix",
    storiesIntro: "Entretiens et histoires d'entreprise de fondateurs, entrepreneurs, dirigeants et professionnels — des microentreprises et PME aux startups, à l'industrie et aux entreprises de haute innovation — pour documenter décisions, croissance, marchés et trajectoires entre pays.",
    open: "Ouvrir",
    empty: "Aucun contenu n'est disponible dans cette collection.",
    originalNotice: "Ce contenu est actuellement disponible dans sa langue originale.",
  },
  es: {
    centre: "Centro de Estudios",
    researchTitle: "Investigación",
    researchIntro: "Informes, investigaciones, análisis, notas de datos y policy briefs reunidos en un archivo único y verificable.",
    storiesTitle: "Historias y voces",
    storiesIntro: "Entrevistas e historias empresariales de fundadores, emprendedores, directivos y profesionales — desde microempresas y pymes hasta startups, industria y empresas de alta innovación — para documentar decisiones, crecimiento, mercados y trayectorias entre países.",
    open: "Abrir",
    empty: "No hay contenido disponible en esta colección.",
    originalNotice: "Este contenido está actualmente disponible en su idioma original.",
  },
  de: {
    centre: "Studienzentrum",
    researchTitle: "Forschung",
    researchIntro: "Berichte, Forschung, Analysen, Datennotizen und Policy Briefs in einem einheitlichen, überprüfbaren Archiv.",
    storiesTitle: "Geschichten und Stimmen",
    storiesIntro: "Interviews und Unternehmensgeschichten von Gründern, Unternehmern, Führungskräften und Fachleuten — von Kleinstunternehmen und KMU bis zu Start-ups, Industrie und hochinnovativen Unternehmen — über Entscheidungen, Wachstum, Märkte und grenzüberschreitende Wege.",
    open: "Öffnen",
    empty: "In dieser Sammlung sind keine Inhalte verfügbar.",
    originalNotice: "Dieser Inhalt ist derzeit in der Originalsprache verfügbar.",
  },
  ar: {
    centre: "مركز الدراسات",
    researchTitle: "البحث",
    researchIntro: "تقارير وأبحاث وتحليلات ومذكرات بيانات وموجزات سياسات ضمن أرشيف واحد قابل للتحقق.",
    storiesTitle: "قصص وأصوات",
    storiesIntro: "مقابلات وقصص أعمال لمؤسسين ورواد أعمال ومديرين ومهنيين، من المشروعات الصغيرة جداً والشركات الصغيرة والمتوسطة إلى الشركات الناشئة والصناعة والشركات عالية الابتكار، لتوثيق القرارات والنمو والأسواق والمسارات العابرة للحدود.",
    open: "فتح",
    empty: "لا يتوفر محتوى في هذه المجموعة.",
    originalNotice: "هذا المحتوى متاح حالياً بلغته الأصلية.",
  },
  zh: {
    centre: "研究中心",
    researchTitle: "研究",
    researchIntro: "将报告、研究、分析、数据说明和政策简报汇集到一个可核查的档案中。",
    storiesTitle: "故事与声音",
    storiesIntro: "通过创始人、企业家、管理者和专业人士的访谈与企业故事，覆盖微型企业、中小企业、初创公司、工业企业和高创新公司，记录决策、增长、市场与跨国发展轨迹。",
    open: "打开",
    empty: "此集合暂无内容。",
    originalNotice: "此内容目前以其原始语言提供。",
  },
};