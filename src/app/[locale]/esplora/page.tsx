import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExplorerIndex } from "@/lib/data/public/explore";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { EDITORIAL_VISUAL_COPY } from "@/lib/i18n/editorial-visual";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const text = {
  en: {
    hero: "One point of access to data, maps, analysis, culture, publications, territories, sectors, people, events and sources. Every Observatory value links back to its methodology and source.",
    stats:["Published indicators","Queryable values","Territories represented","Classified sectors"],
    authors:"Authors and contributors", authorsText:"Discover the people credited in published content.",
    map:"Quantitative map", mapText:"View a single indicator geographically with proportional symbols, without mixing different statistical definitions.",
    analysisText:"Research, analysis, interviews and in-depth work verified by the editorial team.",
    cultureText:"Events, stories and analysis on culture and creative industries across the Research Centre.",
    publications:"Publications", publicationsText:"Reports and studies with bibliographic metadata, source and citation tools.",
    eventsText:"Meetings, conferences and initiatives relevant to migrant entrepreneurship.",
    method:"Sources and methodology", methodText:"Definitions, comparability criteria, sources and working method.",
    dataText:"Query Observatory values by indicator, territory, period, sector and category.", territoriesText:"Browse territories already represented in Observatory series.", sectorsText:"Browse the economic-sector taxonomy used by the Research Centre.", sourcesText:"Browse the statistical sources used by the Observatory.", openText:"Access published data in formats readable by people and systems.",
  },
  fr: {
    hero: "Un point d’accès unique aux données, cartes, analyses, culture, publications, territoires, secteurs, personnes, événements et sources. Chaque valeur de l’Observatoire renvoie à sa méthodologie et à sa source.",
    stats:["Indicateurs publiés","Valeurs consultables","Territoires présents","Secteurs classés"],
    authors:"Auteurs et contributeurs", authorsText:"Découvrez les personnes créditées dans les contenus publiés.",
    map:"Carte quantitative", mapText:"Visualisez géographiquement un seul indicateur avec des symboles proportionnels, sans mélanger des définitions statistiques différentes.",
    analysisText:"Recherches, analyses, entretiens et approfondissements vérifiés par la rédaction.",
    cultureText:"Événements, récits et analyses sur la culture et les industries créatives à travers le Centre d’études.",
    publications:"Publications", publicationsText:"Rapports et études avec métadonnées bibliographiques, source et outils de citation.",
    eventsText:"Rencontres, conférences et initiatives pertinentes pour l’entrepreneuriat migrant.",
    method:"Sources et méthodologie", methodText:"Définitions, critères de comparabilité, sources et méthode de travail.",
    dataText:"Interrogez les valeurs de l’Observatoire par indicateur, territoire, période, secteur et catégorie.", territoriesText:"Parcourez les territoires déjà présents dans les séries de l’Observatoire.", sectorsText:"Consultez la taxonomie des secteurs économiques utilisée par le Centre d’études.", sourcesText:"Consultez les sources statistiques utilisées par l’Observatoire.", openText:"Accédez aux données publiées dans des formats lisibles par les personnes et les systèmes.",
  },
  es: {
    hero: "Un único punto de acceso a datos, mapas, análisis, cultura, publicaciones, territorios, sectores, personas, eventos y fuentes. Cada valor del Observatorio enlaza con su metodología y su fuente.",
    stats:["Indicadores publicados","Valores consultables","Territorios presentes","Sectores clasificados"],
    authors:"Autores y colaboradores", authorsText:"Descubre las personas acreditadas en los contenidos publicados.",
    map:"Mapa cuantitativo", mapText:"Visualiza geográficamente un solo indicador con símbolos proporcionales, sin mezclar definiciones estadísticas diferentes.",
    analysisText:"Investigaciones, análisis, entrevistas y contenidos en profundidad verificados por la redacción.",
    cultureText:"Eventos, historias y análisis sobre cultura e industrias creativas en todo el Centro de Estudios.",
    publications:"Publicaciones", publicationsText:"Informes y estudios con metadatos bibliográficos, fuente y herramientas de citación.",
    eventsText:"Encuentros, conferencias e iniciativas relevantes para el emprendimiento migrante.",
    method:"Fuentes y metodología", methodText:"Definiciones, criterios de comparabilidad, fuentes y método de trabajo.",
    dataText:"Consulta valores del Observatorio por indicador, territorio, periodo, sector y categoría.", territoriesText:"Navega por los territorios ya presentes en las series del Observatorio.", sectorsText:"Consulta la taxonomía de sectores económicos utilizada por el Centro de Estudios.", sourcesText:"Consulta las fuentes estadísticas utilizadas por el Observatorio.", openText:"Accede a los datos publicados en formatos legibles por personas y sistemas.",
  },
  de: {
    hero: "Ein zentraler Zugang zu Daten, Karten, Analysen, Kultur, Publikationen, Regionen, Branchen, Menschen, Veranstaltungen und Quellen. Jeder Wert des Observatoriums verweist auf Methodik und Quelle.",
    stats:["Veröffentlichte Indikatoren","Abfragbare Werte","Erfasste Regionen","Klassifizierte Branchen"],
    authors:"Autoren und Mitwirkende", authorsText:"Entdecken Sie die Personen, die in veröffentlichten Inhalten genannt werden.",
    map:"Quantitative Karte", mapText:"Stellen Sie einen einzelnen Indikator geografisch mit proportionalen Symbolen dar, ohne unterschiedliche statistische Definitionen zu vermischen.",
    analysisText:"Forschung, Analysen, Interviews und vertiefende Beiträge, die von der Redaktion geprüft wurden.",
    cultureText:"Veranstaltungen, Geschichten und Analysen zu Kultur und Kreativwirtschaft im gesamten Studienzentrum.",
    publications:"Publikationen", publicationsText:"Berichte und Studien mit bibliografischen Metadaten, Quelle und Zitierwerkzeugen.",
    eventsText:"Treffen, Konferenzen und Initiativen mit Bezug zu migrantischem Unternehmertum.",
    method:"Quellen und Methodik", methodText:"Definitionen, Vergleichbarkeitskriterien, Quellen und Arbeitsweise.",
    dataText:"Fragen Sie Observatoriumswerte nach Indikator, Region, Zeitraum, Branche und Kategorie ab.", territoriesText:"Navigieren Sie durch Regionen, die bereits in Observatoriumsreihen vorkommen.", sectorsText:"Durchsuchen Sie die vom Studienzentrum verwendete Wirtschaftstaxonomie.", sourcesText:"Durchsuchen Sie die statistischen Quellen des Observatoriums.", openText:"Greifen Sie auf veröffentlichte Daten in menschen- und maschinenlesbaren Formaten zu.",
  },
  ar: {
    hero: "نقطة وصول واحدة إلى البيانات والخرائط والتحليلات والثقافة والمنشورات والأقاليم والقطاعات والأشخاص والفعاليات والمصادر. ترتبط كل قيمة في المرصد بمنهجيتها ومصدرها.",
    stats:["المؤشرات المنشورة","القيم القابلة للاستعلام","الأقاليم الممثلة","القطاعات المصنفة"],
    authors:"المؤلفون والمساهمون", authorsText:"تعرّف على الأشخاص المنسوب إليهم المحتوى المنشور.",
    map:"الخريطة الكمية", mapText:"اعرض مؤشراً واحداً جغرافياً باستخدام رموز متناسبة من دون خلط تعريفات إحصائية مختلفة.",
    analysisText:"أبحاث وتحليلات ومقابلات ومواد معمقة تحققت منها هيئة التحرير.",
    cultureText:"فعاليات وقصص وتحليلات حول الثقافة والصناعات الإبداعية في مركز الدراسات.",
    publications:"المنشورات", publicationsText:"تقارير ودراسات مع بيانات ببليوغرافية ومصادر وأدوات استشهاد.",
    eventsText:"لقاءات ومؤتمرات ومبادرات مرتبطة بريادة الأعمال المهاجرة.",
    method:"المصادر والمنهجية", methodText:"التعريفات ومعايير المقارنة والمصادر ومنهج العمل.",
    dataText:"استعلم عن قيم المرصد حسب المؤشر والإقليم والفترة والقطاع والفئة.", territoriesText:"تصفح الأقاليم الموجودة بالفعل في سلاسل المرصد.", sectorsText:"استعرض تصنيف القطاعات الاقتصادية الذي يستخدمه مركز الدراسات.", sourcesText:"استعرض المصادر الإحصائية المستخدمة في المرصد.", openText:"الوصول إلى البيانات المنشورة بصيغ قابلة للقراءة من الأشخاص والأنظمة.",
  },
  zh: {
    hero: "在一个入口中访问数据、地图、分析、文化、出版物、地区、行业、人物、活动和来源。观察站中的每项数据都可追溯到其方法说明和来源。",
    stats:["已发布指标","可查询数据值","覆盖地区","已分类行业"],
    authors:"作者与贡献者", authorsText:"查看已发布内容中署名和参与的人物。",
    map:"定量地图", mapText:"用比例符号在地图上呈现单一指标，避免混合不同的统计定义。",
    analysisText:"由编辑团队核实的研究、分析、访谈和深度内容。",
    cultureText:"研究中心中有关文化与创意产业的活动、故事和分析。",
    publications:"出版物", publicationsText:"带有书目元数据、来源和引用工具的报告与研究。",
    eventsText:"与移民创业相关的会议、论坛和活动。",
    method:"来源与方法", methodText:"定义、可比性标准、来源和工作方法。",
    dataText:"按指标、地区、时期、行业和类别查询观察站数据。", territoriesText:"浏览已经出现在观察站系列中的地区。", sectorsText:"浏览研究中心使用的经济行业分类体系。", sourcesText:"浏览观察站使用的统计来源。", openText:"以人和系统都可读取的格式访问已发布数据。",
  },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = CORE_MESSAGES[locale];
  return {
    title: m.exploreTitle,
    description: m.exploreIntro,
    alternates: { canonical: `/${locale}/esplora`, languages: languageAlternates("/esplora") },
    ...pageSocialMetadata({ title: m.exploreTitle, description: m.exploreIntro, pathname: `/${locale}/esplora` }),
  };
}

export default async function LocalizedExplorePage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = CORE_MESSAGES[locale];
  const nav = NAV_MESSAGES[locale];
  const visual = EDITORIAL_VISUAL_COPY[locale];
  const t = text[locale];
  const arrow = localizedCtaArrow(locale);
  const index = await getExplorerIndex();

  const stats = [
    [t.stats[0], index.indicators.length],
    [t.stats[1], index.valueCount],
    [t.stats[2], index.territories.length],
    [t.stats[3], index.sectors.length],
  ] as const;
  const modules = [
    { title:m.dataExplorer, text:t.dataText, href:`/${locale}/esplora/dati` },
    { title:t.map, text:t.mapText, href:`/${locale}/esplora/mappa` },
    { title:m.territories, text:t.territoriesText, href:`/${locale}/esplora/territori` },
    { title:m.sectors, text:t.sectorsText, href:`/${locale}/esplora/settori` },
    { title:t.authors, text:t.authorsText, href:`/${locale}/esplora/autori` },
    { title:nav.analysis, text:t.analysisText, href:`/${locale}/contenuti` },
    { title:nav.culture, text:t.cultureText, href:`/${locale}/cultura` },
    { title:t.publications, text:t.publicationsText, href:`/${locale}/pubblicazioni` },
    { title:nav.events, text:t.eventsText, href:`/${locale}/eventi` },
    { title:t.method, text:t.methodText, href:`/${locale}/dati-e-fonti` },
    { title:m.openData, text:t.openText, href:`/${locale}/open-data` },
  ];

  return (
    <main id="contenuto" className="preview-explore-page">
      <header className="preview-explore-hero">
        <div className="preview-explore-hero-inner">
          <p className="explore-kicker">{visual.kicker}</p>
          <h1>{m.exploreTitle}</h1>
          <p>{t.hero}</p>
        </div>
      </header>
      <section className="preview-explore-stats" aria-label={m.exploreTitle}>
        {stats.map(([label, value]) => <div key={label} className="preview-explore-stat"><p>{label}</p><strong>{value}</strong></div>)}
      </section>
      <div className="preview-explore-body">
        <h2>{visual.toolsArchive}</h2>
        <div className="preview-module-grid">
          {modules.map((module) => <article key={module.href} className="preview-module-card"><h3>{module.title}</h3><p>{module.text}</p><Link href={module.href}>{visual.open} {arrow}</Link></article>)}
        </div>
        <section className="preview-explore-contribute">
          <h2>{visual.contributeTitle}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">{visual.contributeText}</p>
          <Link href={`/${locale}/contribuisci`}>{visual.contributeCta} {arrow}</Link>
        </section>
      </div>
    </main>
  );
}
