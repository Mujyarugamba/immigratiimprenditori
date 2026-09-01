import type { PlatformLocale } from "@/lib/i18n/config";

export type HomeV4Locale = Exclude<PlatformLocale, "it">;

export const HOME_V4_MESSAGES: Record<HomeV4Locale, {
  metaLeft: string;
  metaRight: string;
  lineA: string;
  lineB: string;
  summary: string;
  observatory: string;
  research: string;
  scroll: string;
  railLabel: string;
  topics: readonly string[];
  snapshotKicker: string;
  snapshotTitle: string;
  snapshotIntro: string;
}> = {
  en: {
    metaLeft: "Observatory · Research Centre",
    metaRight: "Data · Research · Stories · Territories",
    lineA: "And from the journey",
    lineB: "enterprise is born.",
    summary: "We study migrant entrepreneurship through verified data, research, territories and first-hand accounts.",
    observatory: "Explore the Observatory",
    research: "Analysis and research",
    scroll: "Scroll ↓",
    railLabel: "Observatory topics",
    topics: ["Verified data", "Enterprises", "Territories", "Entrepreneurial routes", "Stories", "Research", "Policy", "Events"],
    snapshotKicker: "Evidence at a glance",
    snapshotTitle: "Data and research, without losing sight of people.",
    snapshotIntro: "The same Research Centre, the same evidence and the same editorial hierarchy — now in your language.",
  },
  fr: {
    metaLeft: "Observatoire · Centre d’études",
    metaRight: "Données · Recherche · Récits · Territoires",
    lineA: "Et du chemin",
    lineB: "naît l’entreprise.",
    summary: "Nous étudions l’entrepreneuriat migrant à travers des données vérifiées, la recherche, les territoires et les témoignages.",
    observatory: "Explorer l’Observatoire",
    research: "Analyses et recherches",
    scroll: "Défiler ↓",
    railLabel: "Thèmes de l’Observatoire",
    topics: ["Données vérifiées", "Entreprises", "Territoires", "Routes entrepreneuriales", "Récits", "Recherche", "Politiques", "Événements"],
    snapshotKicker: "Les preuves en un regard",
    snapshotTitle: "Données et recherche, sans perdre de vue les personnes.",
    snapshotIntro: "Le même Centre d’études, les mêmes preuves et la même hiérarchie éditoriale — dans votre langue.",
  },
  es: {
    metaLeft: "Observatorio · Centro de Estudios",
    metaRight: "Datos · Investigación · Historias · Territorios",
    lineA: "Y del camino",
    lineB: "nace la empresa.",
    summary: "Estudiamos el emprendimiento migrante mediante datos verificados, investigación, territorios y testimonios.",
    observatory: "Explorar el Observatorio",
    research: "Análisis e investigación",
    scroll: "Desplázate ↓",
    railLabel: "Temas del Observatorio",
    topics: ["Datos verificados", "Empresas", "Territorios", "Rutas empresariales", "Historias", "Investigación", "Políticas", "Eventos"],
    snapshotKicker: "Evidencias de un vistazo",
    snapshotTitle: "Datos e investigación, sin perder de vista a las personas.",
    snapshotIntro: "El mismo Centro de Estudios, las mismas evidencias y la misma jerarquía editorial — ahora en tu idioma.",
  },
  de: {
    metaLeft: "Observatorium · Studienzentrum",
    metaRight: "Daten · Forschung · Geschichten · Regionen",
    lineA: "Und aus dem Weg",
    lineB: "entsteht Unternehmertum.",
    summary: "Wir untersuchen migrantisches Unternehmertum anhand geprüfter Daten, Forschung, Regionen und Erfahrungsberichten.",
    observatory: "Observatorium erkunden",
    research: "Analysen und Forschung",
    scroll: "Scrollen ↓",
    railLabel: "Themen des Observatoriums",
    topics: ["Geprüfte Daten", "Unternehmen", "Regionen", "Unternehmerische Routen", "Geschichten", "Forschung", "Politik", "Veranstaltungen"],
    snapshotKicker: "Evidenz auf einen Blick",
    snapshotTitle: "Daten und Forschung, ohne die Menschen aus dem Blick zu verlieren.",
    snapshotIntro: "Dasselbe Studienzentrum, dieselben Belege und dieselbe redaktionelle Hierarchie — jetzt in Ihrer Sprache.",
  },
  ar: {
    metaLeft: "المرصد · مركز الدراسات",
    metaRight: "بيانات · أبحاث · قصص · أقاليم",
    lineA: "ومن الرحلة",
    lineB: "تولد الريادة.",
    summary: "ندرس ريادة الأعمال المهاجرة من خلال بيانات موثقة وأبحاث وأقاليم وشهادات مباشرة.",
    observatory: "استكشف المرصد",
    research: "التحليلات والأبحاث",
    scroll: "مرّر ↓",
    railLabel: "موضوعات المرصد",
    topics: ["بيانات موثقة", "المؤسسات", "الأقاليم", "مسارات ريادة الأعمال", "القصص", "البحث", "السياسات", "الفعاليات"],
    snapshotKicker: "الأدلة في لمحة",
    snapshotTitle: "بيانات وبحث، من دون أن نغفل الأشخاص.",
    snapshotIntro: "مركز الدراسات نفسه، والأدلة نفسها، والتسلسل التحريري نفسه — الآن بلغتك.",
  },
  zh: {
    metaLeft: "观察站 · 研究中心",
    metaRight: "数据 · 研究 · 故事 · 地区",
    lineA: "行路之间",
    lineB: "创业由此而生。",
    summary: "我们通过经核实的数据、研究、地域观察与亲历者叙述研究移民创业。",
    observatory: "探索观察站",
    research: "分析与研究",
    scroll: "向下浏览 ↓",
    railLabel: "观察站主题",
    topics: ["经核实的数据", "企业", "地区", "创业路径", "故事", "研究", "政策", "活动"],
    snapshotKicker: "证据一览",
    snapshotTitle: "以数据和研究为基础，也始终看见人。",
    snapshotIntro: "同一个研究中心、同一套证据、同一套编辑层级——现在以你的语言呈现。",
  },
};
