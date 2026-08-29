import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicIndicatorBySlug } from "@/lib/data/public/observatory";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { formatExplorerValue } from "@/lib/data/public/explore";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";

const labels = {
  en: { back: "Back to Observatory", purpose: "Purpose", method: "Methodology", values: "Published values", source: "Source", territory: "Territory", category: "Category", period: "Period", value: "Value" },
  fr: { back: "Retour à l'Observatoire", purpose: "Objectif", method: "Méthodologie", values: "Valeurs publiées", source: "Source", territory: "Territoire", category: "Catégorie", period: "Période", value: "Valeur" },
  es: { back: "Volver al Observatorio", purpose: "Objetivo", method: "Metodología", values: "Valores publicados", source: "Fuente", territory: "Territorio", category: "Categoría", period: "Periodo", value: "Valor" },
  de: { back: "Zurück zum Observatorium", purpose: "Zweck", method: "Methodik", values: "Veröffentlichte Werte", source: "Quelle", territory: "Region", category: "Kategorie", period: "Zeitraum", value: "Wert" },
  ar: { back: "العودة إلى المرصد", purpose: "الهدف", method: "المنهجية", values: "القيم المنشورة", source: "المصدر", territory: "الإقليم", category: "الفئة", period: "الفترة", value: "القيمة" },
  zh: { back: "返回观察站", purpose: "目的", method: "方法", values: "已发布数据", source: "来源", territory: "地区", category: "类别", period: "时期", value: "数值" },
} as const;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const indicator = await getPublicIndicatorBySlug(slug);
  if (!indicator) return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: indicator.title,
    description: indicator.description,
    alternates: { canonical: `/osservatorio/${indicator.slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function LocalizedIndicatorPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const indicator = await getPublicIndicatorBySlug(slug);
  if (!indicator) notFound();
  const l = labels[locale];
  const core = CORE_MESSAGES[locale];

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <Link href={`/${locale}/osservatorio`} className="text-sm font-semibold underline underline-offset-4">← {l.back}</Link>
      <header className="mt-6 max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{indicator.code}</p>
        <OriginalLanguageText as="h1" className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{indicator.title}</OriginalLanguageText>
        <OriginalLanguageText className="mt-5 text-lg leading-8 text-neutral-700">{indicator.description}</OriginalLanguageText>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{core.originalLanguageNotice}</p>
      </header>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div><h2 className="text-xl font-semibold text-black">{l.purpose}</h2><OriginalLanguageText className="mt-3 text-sm leading-7 text-neutral-700">{indicator.purpose_text}</OriginalLanguageText></div>
        <div><h2 className="text-xl font-semibold text-black">{l.method}</h2><OriginalLanguageText className="mt-3 text-sm leading-7 text-neutral-700">{indicator.methodology_summary}</OriginalLanguageText></div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">{l.values}</h2>
        <div className="mt-5 overflow-x-auto border border-black">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-100"><tr><th className="border-b border-black px-4 py-3">{l.territory}</th><th className="border-b border-black px-4 py-3">{l.category}</th><th className="border-b border-black px-4 py-3">{l.period}</th><th className="border-b border-black px-4 py-3 text-right">{l.value}</th><th className="border-b border-black px-4 py-3">{l.source}</th></tr></thead>
            <tbody>
              {indicator.values.map((value) => (
                <tr key={value.id} className="border-b border-neutral-300 last:border-b-0">
                  <td className="px-4 py-3"><OriginalLanguageText as="span">{value.territory_label ?? "—"}</OriginalLanguageText></td>
                  <td className="px-4 py-3"><OriginalLanguageText as="span">{value.country_label ?? "—"}</OriginalLanguageText></td>
                  <td className="px-4 py-3">{value.period_start}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatExplorerValue(Number(value.numeric_value), indicator.unit_code, locale)}</td>
                  <td className="px-4 py-3"><OriginalLanguageText as="span">{value.source_name ?? "—"}</OriginalLanguageText></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
