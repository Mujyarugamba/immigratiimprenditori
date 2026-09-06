import type { PlatformLocale } from "@/lib/i18n/config";

type Locale = Exclude<PlatformLocale, "it">;

type CultureCopy = {
  description: string;
  motion: string;
  eyebrow: string;
  intro: string;
  stories: string;
  storiesText: string;
  events: string;
  eventsText: string;
  industries: string;
  industriesText: string;
  analysis: string;
  analysisText: string;
  people: string;
  agenda: string;
  economy: string;
  research: string;
  allEvents: string;
  allAnalysis: string;
  emptyStories: string;
  emptyEvents: string;
  emptyAnalysis: string;
  contribute: string;
  contributeText: string;
  contributeCta: string;
};

export const CULTURE_COPY: Record<Locale, CultureCopy> = {
  en: {
    description: "Stories, events, analysis and cultural and creative industries observed through migration, diaspora, enterprise and territories.",
    motion: "ideas · voices · enterprise · territories ·",
    eyebrow: "Research Centre · Culture",
    intro: "A space to observe how migration, diaspora and international mobility shape cultural production, creativity, enterprise, work and territories. Data and research are read alongside people, events and transnational networks.",
    stories: "Stories & voices",
    storiesText: "Interviews, testimonies and entrepreneurial stories showing the human dimension of cultural and creative production.",
    events: "Cultural events",
    eventsText: "Events relevant to culture, creative industries, diasporas and economic and social transformation.",
    industries: "Cultural and creative industries",
    industriesText: "The Research Centre also studies culture as economic activity: supply chains, professions, enterprise, markets and international mobility.",
    analysis: "Analysis & insights",
    analysisText: "Research, notes, guides and other material for reading the cultural dimension of migrant entrepreneurship with sources and context.",
    people: "People",
    agenda: "Agenda",
    economy: "Economy",
    research: "Research",
    allEvents: "All cultural events",
    allAnalysis: "Culture archive",
    emptyStories: "No cultural story is currently published in this collection.",
    emptyEvents: "No upcoming cultural event is currently available.",
    emptyAnalysis: "No cultural analysis is currently available in this collection.",
    contribute: "Suggest a story, event or research",
    contributeText: "Submissions enter the editorial inbox and are never published automatically. The editorial team checks relevance, sources and quality.",
    contributeCta: "Contribute to knowledge",
  },
  fr: {
    description: "Récits, événements, analyses et industries culturelles et créatives observés à travers les migrations, les diasporas, l’entreprise et les territoires.",
    motion: "idées · voix · entreprise · territoires ·",
    eyebrow: "Centre d’études · Culture",
    intro: "Un espace pour observer comment migrations, diasporas et mobilités internationales traversent la production culturelle, la créativité, l’entreprise, le travail et les territoires. Données et recherche sont mises en regard des personnes, événements et réseaux transnationaux.",
    stories: "Histoires et voix",
    storiesText: "Entretiens, témoignages et histoires d’entreprise qui montrent la dimension humaine de la production culturelle et créative.",
    events: "Événements culturels",
    eventsText: "Rendez-vous liés à la culture, aux industries créatives, aux diasporas et aux transformations économiques et sociales.",
    industries: "Industries culturelles et créatives",
    industriesText: "Le Centre d’études observe aussi la culture comme activité économique : filières, métiers, entreprises, marchés et mobilité internationale.",
    analysis: "Analyses et approfondissements",
    analysisText: "Études, notes, guides et autres contenus pour lire la dimension culturelle de l’entrepreneuriat migrant avec sources et contexte.",
    people: "Personnes",
    agenda: "Agenda",
    economy: "Économie",
    research: "Recherche",
    allEvents: "Tous les événements culturels",
    allAnalysis: "Archives Culture",
    emptyStories: "Aucun récit culturel n’est actuellement publié dans cette collection.",
    emptyEvents: "Aucun événement culturel à venir n’est disponible pour le moment.",
    emptyAnalysis: "Aucune analyse culturelle n’est actuellement disponible dans cette collection.",
    contribute: "Signaler une histoire, un événement ou une recherche",
    contributeText: "Les signalements entrent dans l’Inbox éditoriale et ne sont jamais publiés automatiquement. La rédaction vérifie la pertinence, les sources et la qualité.",
    contributeCta: "Contribuer à la connaissance",
  },
  es: {
    description: "Historias, eventos, análisis e industrias culturales y creativas observados a través de migraciones, diáspora, empresa y territorios.",
    motion: "ideas · voces · empresa · territorios ·",
    eyebrow: "Centro de Estudios · Cultura",
    intro: "Un espacio para observar cómo las migraciones, la diáspora y la movilidad internacional atraviesan la producción cultural, la creatividad, la empresa, el trabajo y los territorios. Los datos y la investigación se leen junto a personas, eventos y redes transnacionales.",
    stories: "Historias y voces",
    storiesText: "Entrevistas, testimonios e historias empresariales que muestran la dimensión humana de la producción cultural y creativa.",
    events: "Eventos culturales",
    eventsText: "Citas relacionadas con la cultura, las industrias creativas, las diásporas y las transformaciones económicas y sociales.",
    industries: "Industrias culturales y creativas",
    industriesText: "El Centro de Estudios sigue también la cultura como actividad económica: cadenas de valor, profesiones, empresa, mercados y movilidad internacional.",
    analysis: "Análisis y perspectivas",
    analysisText: "Estudios, notas, guías y otros contenidos para leer la dimensión cultural del emprendimiento migrante con fuentes y contexto.",
    people: "Personas",
    agenda: "Agenda",
    economy: "Economía",
    research: "Investigación",
    allEvents: "Todos los eventos culturales",
    allAnalysis: "Archivo Cultura",
    emptyStories: "No hay historias culturales publicadas actualmente en esta colección.",
    emptyEvents: "No hay próximos eventos culturales disponibles en este momento.",
    emptyAnalysis: "No hay análisis culturales disponibles actualmente en esta colección.",
    contribute: "Señala una historia, un evento o una investigación",
    contributeText: "Las propuestas entran en la bandeja editorial y nunca se publican automáticamente. La redacción verifica pertinencia, fuentes y calidad.",
    contributeCta: "Contribuye al conocimiento",
  },
  de: {
    description: "Geschichten, Veranstaltungen, Analysen sowie Kultur- und Kreativwirtschaft im Kontext von Migration, Diaspora, Unternehmertum und Regionen.",
    motion: "ideen · stimmen · unternehmen · regionen ·",
    eyebrow: "Studienzentrum · Kultur",
    intro: "Ein Raum, um zu untersuchen, wie Migration, Diaspora und internationale Mobilität kulturelle Produktion, Kreativität, Unternehmertum, Arbeit und Regionen prägen. Daten und Forschung werden mit Menschen, Veranstaltungen und transnationalen Netzwerken verbunden.",
    stories: "Geschichten und Stimmen",
    storiesText: "Interviews, Erfahrungsberichte und Unternehmensgeschichten zeigen die menschliche Dimension kultureller und kreativer Produktion.",
    events: "Kulturveranstaltungen",
    eventsText: "Veranstaltungen zu Kultur, Kreativwirtschaft, Diaspora sowie wirtschaftlichem und gesellschaftlichem Wandel.",
    industries: "Kultur- und Kreativwirtschaft",
    industriesText: "Das Studienzentrum betrachtet Kultur auch als wirtschaftliche Tätigkeit: Wertschöpfungsketten, Berufe, Unternehmen, Märkte und internationale Mobilität.",
    analysis: "Analysen und Einblicke",
    analysisText: "Studien, Notizen, Leitfäden und weitere Inhalte zur kulturellen Dimension migrantischen Unternehmertums mit Quellen und Kontext.",
    people: "Menschen",
    agenda: "Agenda",
    economy: "Wirtschaft",
    research: "Forschung",
    allEvents: "Alle Kulturveranstaltungen",
    allAnalysis: "Kulturarchiv",
    emptyStories: "In dieser Sammlung ist derzeit keine Kulturgeschichte veröffentlicht.",
    emptyEvents: "Derzeit sind keine kommenden Kulturveranstaltungen verfügbar.",
    emptyAnalysis: "In dieser Sammlung sind derzeit keine Kulturanalysen verfügbar.",
    contribute: "Geschichte, Veranstaltung oder Forschung vorschlagen",
    contributeText: "Hinweise gelangen in die redaktionelle Inbox und werden nie automatisch veröffentlicht. Die Redaktion prüft Relevanz, Quellen und Qualität.",
    contributeCta: "Zum Wissen beitragen",
  },
  ar: {
    description: "قصص وفعاليات وتحليلات وصناعات ثقافية وإبداعية تُدرس من خلال الهجرة والشتات وريادة الأعمال والأقاليم.",
    motion: "أفكار · أصوات · ريادة · أقاليم ·",
    eyebrow: "مركز الدراسات · الثقافة",
    intro: "مساحة لدراسة كيفية تأثير الهجرة والشتات والتنقل الدولي في الإنتاج الثقافي والإبداع وريادة الأعمال والعمل والأقاليم. تُقرأ البيانات والأبحاث إلى جانب الأشخاص والفعاليات والشبكات العابرة للحدود.",
    stories: "قصص وأصوات",
    storiesText: "مقابلات وشهادات وقصص أعمال تُظهر البعد الإنساني للإنتاج الثقافي والإبداعي.",
    events: "فعاليات ثقافية",
    eventsText: "مواعيد مرتبطة بالثقافة والصناعات الإبداعية والشتات والتحولات الاقتصادية والاجتماعية.",
    industries: "الصناعات الثقافية والإبداعية",
    industriesText: "يدرس مركز الدراسات الثقافة أيضاً كنشاط اقتصادي: سلاسل القيمة والمهن وريادة الأعمال والأسواق والتنقل الدولي.",
    analysis: "تحليلات وتعمق",
    analysisText: "دراسات ومذكرات وأدلة ومحتويات أخرى لفهم البعد الثقافي لريادة الأعمال المهاجرة مع المصادر والسياق.",
    people: "الأشخاص",
    agenda: "الأجندة",
    economy: "الاقتصاد",
    research: "البحث",
    allEvents: "كل الفعاليات الثقافية",
    allAnalysis: "أرشيف الثقافة",
    emptyStories: "لا توجد حالياً قصة ثقافية منشورة في هذه المجموعة.",
    emptyEvents: "لا توجد حالياً فعالية ثقافية قادمة متاحة.",
    emptyAnalysis: "لا توجد حالياً تحليلات ثقافية متاحة في هذه المجموعة.",
    contribute: "اقترح قصة أو فعالية أو بحثاً",
    contributeText: "تدخل المقترحات إلى صندوق التحرير ولا تُنشر تلقائياً أبداً. تتحقق هيئة التحرير من الصلة والمصادر والجودة.",
    contributeCta: "ساهم في المعرفة",
  },
  zh: {
    description: "从移民、侨民、创业与地区视角观察故事、活动、分析以及文化和创意产业。",
    motion: "思想 · 声音 · 创业 · 地区 ·",
    eyebrow: "研究中心 · 文化",
    intro: "观察移民、侨民和国际流动如何影响文化生产、创意、创业、就业与地区发展。数据和研究与人物、活动以及跨国网络共同呈现。",
    stories: "故事与声音",
    storiesText: "通过访谈、证言和创业故事呈现文化与创意生产中的人的维度。",
    events: "文化活动",
    eventsText: "与文化、创意产业、侨民以及经济和社会转型相关的活动。",
    industries: "文化与创意产业",
    industriesText: "研究中心也把文化作为经济活动来研究：产业链、职业、创业、市场和国际流动。",
    analysis: "分析与深度内容",
    analysisText: "通过研究、说明、指南和其他内容，在来源和背景中理解移民创业的文化维度。",
    people: "人物",
    agenda: "议程",
    economy: "经济",
    research: "研究",
    allEvents: "全部文化活动",
    allAnalysis: "文化档案",
    emptyStories: "此集合目前没有已发布的文化故事。",
    emptyEvents: "目前没有可用的近期文化活动。",
    emptyAnalysis: "此集合目前没有可用的文化分析。",
    contribute: "推荐故事、活动或研究",
    contributeText: "投稿进入编辑收件箱，绝不会自动发布。编辑团队会核查相关性、来源和质量。",
    contributeCta: "共同积累知识",
  },
};
