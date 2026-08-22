import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPublicStatisticalSources } from "@/lib/data/public/sources";
import { isPlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";

const text = {
  en: { kicker: "Observatory · Provenance", title: "Source catalogue", intro: "Statistical sources used by the Observatory are registered separately from the values they support, so producer, publication, edition, licence and methodology can be documented when available.", edition: "Edition", published: "Published", licence: "Licence/use", open: "Open original source", method: "Method & comparability", glossary: "Glossary", notice: "Source metadata and methodological notes may remain in the language in which they were originally documented." },
  fr: { kicker: "Observatoire · Provenance", title: "Catalogue des sources", intro: "Les sources statistiques de l'Observatoire sont enregistrées séparément des valeurs qu'elles alimentent afin de documenter, lorsqu'ils sont disponibles, le producteur, la publication, l'édition, la licence et la méthodologie.", edition: "Édition", published: "Publiée", licence: "Licence/usage", open: "Ouvrir la source originale", method: "Méthode et comparabilité", glossary: "Glossaire", notice: "Les métadonnées de source et les notes méthodologiques peuvent rester dans la langue dans laquelle elles ont été initialement documentées." },
  es: { kicker: "Observatorio · Procedencia", title: "Catálogo de fuentes", intro: "Las fuentes estadísticas del Observatorio se registran por separado de los valores que alimentan para documentar, cuando estén disponibles, productor, publicación, edición, licencia y metodología.", edition: "Edición", published: "Publicada", licence: "Licencia/uso", open: "Abrir fuente original", method: "Método y comparabilidad", glossary: "Glosario", notice: "Los metadatos de las fuentes y las notas metodológicas pueden mantenerse en el idioma en el que se documentaron originalmente." },
  de: { kicker: "Observatorium · Herkunft", title: "Quellenkatalog", intro: "Die statistischen Quellen des Observatoriums werden getrennt von den von ihnen gespeisten Werten erfasst, damit Produzent, Publikation, Ausgabe, Lizenz und Methodik dokumentiert werden können, soweit verfügbar.", edition: "Ausgabe", published: "Veröffentlicht", licence: "Lizenz/Nutzung", open: "Originalquelle öffnen", method: "Methodik & Vergleichbarkeit", glossary: "Glossar", notice: "Quellenmetadaten und methodische Hinweise können in der Sprache bleiben, in der sie ursprünglich dokumentiert wurden." },
  ar: { kicker: "المرصد · مصدر البيانات", title: "دليل المصادر", intro: "تُسجل المصادر الإحصائية المستخدمة في المرصد بصورة منفصلة عن القيم التي تدعمها، بما يتيح توثيق الجهة المنتجة والمنشور والإصدار والترخيص والمنهجية عند توفرها.", edition: "الإصدار", published: "تاريخ النشر", licence: "الترخيص/الاستخدام", open: "فتح المصدر الأصلي", method: "المنهجية وقابلية المقارنة", glossary: "المعجم", notice: "قد تبقى بيانات المصدر والملاحظات المنهجية باللغة التي وُثقت بها أصلاً." },
  zh: { kicker: "观察站 · 数据出处", title: "来源目录", intro: "观察站将统计来源与其所支持的数据值分开登记，以便在可获得时记录生产机构、出版物、版本、许可和方法信息。", edition: "版本", published: "发布日期", licence: "许可/使用", open: "打开原始来源", method: "方法与可比性", glossary: "术语表", notice: "来源元数据和方法说明可能保留其最初记录时使用的语言。" },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return { title: m.title, description: m.intro, alternates: { canonical: `/${locale}/fonti`, languages: languageAlternates("/fonti") } };
}

export default async function LocalizedSourcesPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
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
        {sources.map((source) => (
          <article key={source.id} className="bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{source.producer_name}</p>
            <h2 className="mt-2 text-xl font-semibold text-black">{source.publication_title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{source.name}</p>
            {source.edition_label ? <p className="mt-3 text-sm text-neutral-700">{m.edition}: {source.edition_label}</p> : null}
            {source.source_published_on ? <p className="mt-1 text-sm text-neutral-700">{m.published}: {source.source_published_on}</p> : null}
            {source.methodology_note ? <p className="mt-4 text-sm leading-6 text-neutral-700">{source.methodology_note}</p> : null}
            {source.license_note ? <p className="mt-3 text-xs leading-5 text-neutral-500">{m.licence}: {source.license_note}</p> : null}
            {source.url ? <a href={source.url} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">{m.open} ↗</a> : null}
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold">
        <Link href="/dati-e-fonti" className="underline underline-offset-4">{m.method} →</Link>
        <Link href={`/${locale}/glossario`} className="underline underline-offset-4">{m.glossary} →</Link>
      </div>
    </main>
  );
}
