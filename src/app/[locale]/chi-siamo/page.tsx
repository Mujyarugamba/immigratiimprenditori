import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { languageAlternates } from "@/lib/i18n/seo";

const sectionText = {
  en: {
    data: "Data, analysis and voices",
    dataText: "Indicators and statistics are combined with reports, research, stories, interviews and testimony.",
    governance: "Research Centre and Observatory",
    governanceText: "AIPEL promotes and owns the project. Immigrati Imprenditori operates as the Research Centre; the Observatory is the function dedicated to data, indicators, time series, territorial comparisons and methodology.",
    principles: "Editorial principles",
    principlesText: "The editorial team distinguishes facts, data, interpretations and opinions. External proposals are not published automatically and funding never gives editorial control.",
  },
  fr: {
    data: "Données, analyses et voix",
    dataText: "Les indicateurs et statistiques sont associés à des rapports, recherches, récits, entretiens et témoignages.",
    governance: "Centre d'études et Observatoire",
    governanceText: "AIPEL promeut et porte le projet. Immigrati Imprenditori fonctionne comme Centre d'études ; l'Observatoire est la fonction dédiée aux données, indicateurs, séries temporelles, comparaisons territoriales et à la méthodologie.",
    principles: "Principes éditoriaux",
    principlesText: "La rédaction distingue faits, données, interprétations et opinions. Les propositions externes ne sont jamais publiées automatiquement et le financement n'accorde aucun contrôle éditorial.",
  },
  es: {
    data: "Datos, análisis y voces",
    dataText: "Los indicadores y estadísticas se combinan con informes, investigaciones, historias, entrevistas y testimonios.",
    governance: "Centro de Estudios y Observatorio",
    governanceText: "AIPEL promueve y es titular del proyecto. Immigrati Imprenditori opera como Centro de Estudios; el Observatorio es la función dedicada a datos, indicadores, series temporales, comparaciones territoriales y metodología.",
    principles: "Principios editoriales",
    principlesText: "La redacción distingue hechos, datos, interpretaciones y opiniones. Las propuestas externas no se publican automáticamente y la financiación no otorga control editorial.",
  },
  de: {
    data: "Daten, Analysen und Stimmen",
    dataText: "Indikatoren und Statistiken werden mit Berichten, Forschung, Geschichten, Interviews und Erfahrungsberichten verbunden.",
    governance: "Studienzentrum und Observatorium",
    governanceText: "AIPEL fördert und trägt das Projekt. Immigrati Imprenditori arbeitet als Studienzentrum; das Observatorium ist für Daten, Indikatoren, Zeitreihen, regionale Vergleiche und Methodik zuständig.",
    principles: "Redaktionelle Grundsätze",
    principlesText: "Die Redaktion trennt Fakten, Daten, Interpretationen und Meinungen. Externe Vorschläge werden nicht automatisch veröffentlicht und Finanzierung verleiht keine redaktionelle Kontrolle.",
  },
  ar: {
    data: "البيانات والتحليل والأصوات",
    dataText: "تُدمج المؤشرات والإحصاءات مع التقارير والأبحاث والقصص والمقابلات والشهادات.",
    governance: "مركز الدراسات والمرصد",
    governanceText: "تروج AIPEL للمشروع وتمتلكه. يعمل Immigrati Imprenditori كمركز دراسات، بينما يختص المرصد بالبيانات والمؤشرات والسلاسل الزمنية والمقارنات الإقليمية والمنهجية.",
    principles: "المبادئ التحريرية",
    principlesText: "تفرق هيئة التحرير بين الوقائع والبيانات والتفسيرات والآراء. لا تُنشر المقترحات الخارجية تلقائياً ولا يمنح التمويل أي سيطرة تحريرية.",
  },
  zh: {
    data: "数据、分析与人物声音",
    dataText: "研究中心将指标和统计数据与报告、研究、创业故事、访谈和证言结合起来。",
    governance: "研究中心与观察站",
    governanceText: "AIPEL 推动并负责该项目。Immigrati Imprenditori 作为研究中心运行；观察站负责数据、指标、时间序列、地区比较和方法学。",
    principles: "编辑原则",
    principlesText: "编辑团队区分事实、数据、解释和观点。外部投稿不会自动发布，资金支持也不产生编辑控制权。",
  },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = CORE_MESSAGES[locale];
  return { title: m.aboutTitle, description: m.aboutIntro, alternates: { canonical: `/${locale}/chi-siamo`, languages: languageAlternates("/chi-siamo") } };
}

export default async function LocalizedAboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = CORE_MESSAGES[locale];
  const s = sectionText[locale];

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori · AIPEL</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.aboutTitle}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.aboutIntro}</p>
      </header>

      <section className="mt-10"><h2 className="text-2xl font-semibold text-black">{m.aboutProject}</h2><p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">{m.aboutProjectText}</p></section>
      <section className="mt-10 border-t border-black pt-8"><h2 className="text-2xl font-semibold text-black">{s.data}</h2><p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">{s.dataText}</p></section>
      <section className="mt-10 border-t border-black pt-8"><h2 className="text-2xl font-semibold text-black">{s.governance}</h2><p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">{s.governanceText}</p></section>
      <section className="mt-10 border-t border-black pt-8"><h2 className="text-2xl font-semibold text-black">{s.principles}</h2><p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">{s.principlesText}</p></section>

      <div className="mt-10 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href={`/${locale}/esplora`} className="underline underline-offset-4">{m.exploreTitle} →</Link>
        <Link href={`/${locale}/contribuisci`} className="underline underline-offset-4">{m.participateTitle} →</Link>
      </div>
    </main>
  );
}
