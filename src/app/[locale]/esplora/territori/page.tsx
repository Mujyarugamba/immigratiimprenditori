import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExplorerSnapshot } from "@/lib/data/public/explore";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { isPlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedTerritoryLabel, TERRITORY_LEVEL_LABELS } from "@/lib/i18n/territory-translations";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const text = {
  en: { kicker: "Explore · Territories", title: "Territories", intro: "These are the territories actually represented in published Observatory values. The count shows how many published statistical values refer to each territory.", generic: "Territory", values: "published values", explore: "Explore data" },
  fr: { kicker: "Explorer · Territoires", title: "Territoires", intro: "Les territoires listés ici sont ceux effectivement présents dans les valeurs publiées de l'Observatoire. Le nombre indique combien de valeurs statistiques publiées se rapportent à chaque territoire.", generic: "Territoire", values: "valeurs publiées", explore: "Explorer les données" },
  es: { kicker: "Explorar · Territorios", title: "Territorios", intro: "Los territorios enumerados son los que aparecen efectivamente en los valores publicados del Observatorio. El número indica cuántos valores estadísticos publicados se refieren a cada territorio.", generic: "Territorio", values: "valores publicados", explore: "Explorar datos" },
  de: { kicker: "Entdecken · Regionen", title: "Regionen", intro: "Aufgeführt sind die Regionen, die tatsächlich in den veröffentlichten Werten des Observatoriums vorkommen. Die Zahl zeigt, wie viele veröffentlichte statistische Werte sich auf die jeweilige Region beziehen.", generic: "Region", values: "veröffentlichte Werte", explore: "Daten erkunden" },
  ar: { kicker: "استكشف · الأقاليم", title: "الأقاليم", intro: "تظهر هنا الأقاليم الموجودة فعلياً في القيم المنشورة للمرصد. ويبين العدد عدد القيم الإحصائية المنشورة المرتبطة بكل إقليم.", generic: "إقليم", values: "قيم منشورة", explore: "استكشف البيانات" },
  zh: { kicker: "探索 · 地区", title: "地区", intro: "此处列出的地区均实际出现在观察站已发布的数据值中。数量表示与各地区相关的已发布统计值数量。", generic: "地区", values: "个已发布数据值", explore: "探索数据" },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return { title: m.title, description: m.intro, alternates: { canonical: `/${locale}/esplora/territori`, languages: languageAlternates("/esplora/territori") }, ...pageSocialMetadata({ title: m.title, description: m.intro, pathname: `/${locale}/esplora/territori` }) };
}

export default async function LocalizedTerritoriesPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const arrow = localizedCtaArrow(locale);
  const snapshot = await getExplorerSnapshot();

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.kicker}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p></header>
      <div className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
        {snapshot.territories.map((territory) => (
          <article key={`${territory.level}-${territory.code}-${territory.label}`} className="bg-white p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{(territory.level && TERRITORY_LEVEL_LABELS[locale][territory.level]) ?? m.generic}</p>
            <h2 className="mt-2 text-xl font-semibold text-black">{localizedTerritoryLabel(locale, territory.code, territory.label)}</h2>
            <p className="mt-3 text-sm text-neutral-700">{territory.valueCount} {m.values}</p>
            {territory.code ? <Link href={`/${locale}/esplora/dati?territorio=${encodeURIComponent(territory.code)}`} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">{m.explore} {arrow}</Link> : null}
          </article>
        ))}
      </div>
    </main>
  );
}
