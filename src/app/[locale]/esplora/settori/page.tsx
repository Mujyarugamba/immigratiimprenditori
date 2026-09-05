import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExplorerSnapshot } from "@/lib/data/public/explore";
import { isPlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";
import { sectorTranslation } from "@/lib/i18n/sector-translations";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const text = {
  en: { kicker: "Explore · Taxonomy", title: "Economic sectors", intro: "This taxonomy allows indicators, research, stories and events to be connected over time to the same economic fields. A sector appears here because it is active in the Research Centre model; data availability depends on the sources.", sector: "Sector", linked: "Linked Observatory values" },
  fr: { kicker: "Explorer · Taxonomie", title: "Secteurs économiques", intro: "Cette taxonomie permet de relier dans le temps indicateurs, recherches, histoires et événements aux mêmes domaines économiques. Un secteur apparaît ici parce qu'il est actif dans le modèle du Centre d'études ; la disponibilité des données dépend des sources.", sector: "Secteur", linked: "Valeurs de l'Observatoire liées" },
  es: { kicker: "Explorar · Taxonomía", title: "Sectores económicos", intro: "Esta taxonomía permite vincular a lo largo del tiempo indicadores, investigaciones, historias y eventos con los mismos ámbitos económicos. Un sector aparece aquí porque está activo en el modelo del Centro de Estudios; la disponibilidad de datos depende de las fuentes.", sector: "Sector", linked: "Valores del Observatorio vinculados" },
  de: { kicker: "Entdecken · Taxonomie", title: "Wirtschaftsbranchen", intro: "Diese Taxonomie ermöglicht es, Indikatoren, Forschung, Geschichten und Veranstaltungen langfristig denselben Wirtschaftsbereichen zuzuordnen. Eine Branche erscheint hier, weil sie im Modell des Studienzentrums aktiv ist; die Datenverfügbarkeit hängt von den Quellen ab.", sector: "Branche", linked: "Verknüpfte Observatoriumswerte" },
  ar: { kicker: "استكشف · التصنيف", title: "القطاعات الاقتصادية", intro: "يتيح هذا التصنيف ربط المؤشرات والأبحاث والقصص والفعاليات عبر الزمن بالمجالات الاقتصادية نفسها. يظهر القطاع هنا لأنه نشط في نموذج مركز الدراسات، بينما يعتمد توفر البيانات على المصادر المتاحة.", sector: "القطاع", linked: "قيم المرصد المرتبطة" },
  zh: { kicker: "探索 · 分类体系", title: "经济行业", intro: "该分类体系使指标、研究、故事和活动能够长期关联到相同的经济领域。某行业出现在这里，是因为它在研究中心模型中处于启用状态；是否有数据取决于可用来源。", sector: "行业", linked: "关联的观察站数据值" },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return {
    title: m.title,
    description: m.intro,
    alternates: { canonical: `/${locale}/esplora/settori`, languages: languageAlternates("/esplora/settori") },
    ...pageSocialMetadata({ title: m.title, description: m.intro, pathname: `/${locale}/esplora/settori` }),
  };
}

export default async function LocalizedSectorsPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const snapshot = await getExplorerSnapshot();
  const counts = new Map<number, number>();
  for (const value of snapshot.values) {
    if (value.business_sector_id == null) continue;
    counts.set(value.business_sector_id, (counts.get(value.business_sector_id) ?? 0) + 1);
  }

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p>
      </header>
      <div className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
        {snapshot.sectors.map((sector) => {
          const translated = sectorTranslation(locale, sector.slug);
          return (
            <article key={sector.id} className="bg-white p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{m.sector}</p>
              <h2 className="mt-2 text-xl font-semibold text-black">{translated?.name ?? sector.name}</h2>
              {(translated?.description ?? sector.description) ? <p className="mt-3 text-sm leading-6 text-neutral-700">{translated?.description ?? sector.description}</p> : null}
              <p className="mt-4 text-xs text-neutral-500">{m.linked}: {counts.get(sector.id) ?? 0}</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
