import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";
import { listPublicStatisticalSources } from "@/lib/data/public/sources";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { isPlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";
import { sourceTranslation } from "@/lib/i18n/source-translations";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const text = {
  en: { kicker: "Observatory · Provenance", title: "Source catalogue", intro: "Statistical sources used by the Observatory are registered separately from the values they support, so producer, publication, edition, licence and methodology can be documented when available.", edition: "Edition", published: "Published", licence: "Licence/use", open: "Open original source", method: "Method & comparability", glossary: "Glossary", notice: "Official source names and publication titles are kept in their original form; descriptive and methodological notes are presented in the selected interface language." },
  fr: { kicker: "Observatoire · Provenance", title: "Catalogue des sources", intro: "Les sources statistiques de l'Observatoire sont enregistrées séparément des valeurs qu'elles alimentent afin de documenter, lorsqu'ils sont disponibles, le producteur, la publication, l'édition, la licence et la méthodologie.", edition: "Édition", published: "Publiée", licence: "Licence/usage", open: "Ouvrir la source originale", method: "Méthode et comparabilité", glossary: "Glossaire", notice: "Les noms officiels des sources et les titres de publication restent dans leur forme originale ; les notes descriptives et méthodologiques sont présentées dans la langue d’interface choisie." },
  es: { kicker: "Observatorio · Procedencia", title: "Catálogo de fuentes", intro: "Las fuentes estadísticas del Observatorio se registran por separado de los valores que alimentan para documentar, cuando estén disponibles, productor, publicación, edición, licencia y metodología.", edition: "Edición", published: "Publicada", licence: "Licencia/uso", open: "Abrir fuente original", method: "Método y comparabilidad", glossary: "Glosario", notice: "Los nombres oficiales de las fuentes y los títulos de las publicaciones se mantienen en su forma original; las notas descriptivas y metodológicas se presentan en el idioma de interfaz seleccionado." },
  de: { kicker: "Observatorium · Herkunft", title: "Quellenkatalog", intro: "Die statistischen Quellen des Observatoriums werden getrennt von den von ihnen gespeisten Werten erfasst, damit Produzent, Publikation, Ausgabe, Lizenz und Methodik dokumentiert werden können, soweit verfügbar.", edition: "Ausgabe", published: "Veröffentlicht", licence: "Lizenz/Nutzung", open: "Originalquelle öffnen", method: "Methodik & Vergleichbarkeit", glossary: "Glossar", notice: "Offizielle Quellennamen und Publikationstitel bleiben in ihrer Originalform; beschreibende und methodische Hinweise werden in der gewählten Oberflächensprache angezeigt." },
  ar: { kicker: "المرصد · مصدر البيانات", title: "دليل المصادر", intro: "تُسجل المصادر الإحصائية المستخدمة في المرصد بصورة منفصلة عن القيم التي تدعمها، بما يتيح توثيق الجهة المنتجة والمنشور والإصدار والترخيص والمنهجية عند توفرها.", edition: "الإصدار", published: "تاريخ النشر", licence: "الترخيص/الاستخدام", open: "فتح المصدر الأصلي", method: "المنهجية وقابلية المقارنة", glossary: "المعجم", notice: "تُحفظ الأسماء الرسمية للمصادر وعناوين المنشورات بصيغتها الأصلية، بينما تُعرض الملاحظات الوصفية والمنهجية بلغة الواجهة المختارة." },
  zh: { kicker: "观察站 · 数据出处", title: "来源目录", intro: "观察站将统计来源与其所支持的数据值分开登记，以便在可获得时记录生产机构、出版物、版本、许可和方法信息。", edition: "版本", published: "发布日期", licence: "许可/使用", open: "打开原始来源", method: "方法与可比性", glossary: "术语表", notice: "来源的官方名称和出版物标题保留原文；说明性和方法性内容以所选界面语言呈现。" },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return {
    title: m.title,
    description: m.intro,
    alternates: { canonical: `/${locale}/fonti`, languages: languageAlternates("/fonti") },
    ...pageSocialMetadata({ title: m.title, description: m.intro, pathname: `/${locale}/fonti` }),
  };
}

export default async function LocalizedSourcesPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const arrow = localizedCtaArrow(locale);
  const sources = await listPublicStatisticalSources();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{m.notice}</p>
      </header>

      <div className="mt-8 grid gap-px border border-black bg-black md:grid-cols-2">
        {sources.map((source) => {
          const translated = sourceTranslation(locale, source.id);
          return (
            <article key={source.id} className="bg-white p-6">
              <OriginalLanguageText as="p" className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{source.producer_name}</OriginalLanguageText>
              <OriginalLanguageText as="h2" className="mt-2 text-xl font-semibold text-black">{source.publication_title}</OriginalLanguageText>
              <OriginalLanguageText className="mt-2 text-sm text-neutral-600">{source.name}</OriginalLanguageText>
              {source.edition_label ? <p className="mt-3 text-sm text-neutral-700">{m.edition}: {source.edition_label}</p> : null}
              {source.source_published_on ? <p className="mt-1 text-sm text-neutral-700">{m.published}: {source.source_published_on}</p> : null}
              {(translated?.methodology ?? source.methodology_note) ? <p className="mt-4 text-sm leading-6 text-neutral-700">{translated?.methodology ?? source.methodology_note}</p> : null}
              {(translated?.license ?? source.license_note) ? <p className="mt-3 text-xs leading-5 text-neutral-500">{m.licence}: {translated?.license ?? source.license_note}</p> : null}
              {source.url ? <a href={source.url} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">{m.open} ↗</a> : null}
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold">
        <Link href={`/${locale}/dati-e-fonti`} className="underline underline-offset-4">{m.method} {arrow}</Link>
        <Link href={`/${locale}/glossario`} className="underline underline-offset-4">{m.glossary} {arrow}</Link>
      </div>
    </main>
  );
}
