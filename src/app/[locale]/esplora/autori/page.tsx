import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExplorerSnapshot } from "@/lib/data/public/explore";
import { isPlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";

const text = {
  en: { kicker: "Explore · People", title: "Authors & contributors", intro: "The names shown here come exclusively from content that is already published and publicly visible. The count shows how many published contributions are attributed to each name.", contributions: "contributions", none: "No public bylines are available." },
  fr: { kicker: "Explorer · Personnes", title: "Auteurs et contributeurs", intro: "Les noms affichés ici proviennent exclusivement de contenus déjà publiés et visibles publiquement. Le nombre indique combien de contributions publiées sont attribuées à chaque nom.", contributions: "contributions", none: "Aucune signature publique n'est disponible." },
  es: { kicker: "Explorar · Personas", title: "Autores y colaboradores", intro: "Los nombres que aparecen aquí proceden exclusivamente de contenidos ya publicados y visibles públicamente. El número indica cuántas contribuciones publicadas se atribuyen a cada nombre.", contributions: "contribuciones", none: "No hay firmas públicas disponibles." },
  de: { kicker: "Entdecken · Menschen", title: "Autoren & Mitwirkende", intro: "Die hier angezeigten Namen stammen ausschließlich aus bereits veröffentlichten und öffentlich sichtbaren Inhalten. Die Zahl zeigt, wie viele veröffentlichte Beiträge dem jeweiligen Namen zugeordnet sind.", contributions: "Beiträge", none: "Keine öffentlichen Autorenangaben verfügbar." },
  ar: { kicker: "استكشف · الأشخاص", title: "المؤلفون والمساهمون", intro: "الأسماء المعروضة هنا مأخوذة حصراً من محتوى منشور ومتاح للجمهور. ويبين العدد عدد المساهمات المنشورة المنسوبة إلى كل اسم.", contributions: "مساهمات", none: "لا توجد أسماء مؤلفين منشورة متاحة." },
  zh: { kicker: "探索 · 人物", title: "作者与贡献者", intro: "此处显示的姓名仅来自已经发布且公开可见的内容。数量表示归属于该姓名的已发布贡献数量。", contributions: "项贡献", none: "暂无公开署名。" },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return { title: m.title, description: m.intro, alternates: { canonical: `/${locale}/esplora/autori`, languages: languageAlternates("/esplora/autori") } };
}

export default async function LocalizedAuthorsPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const snapshot = await getExplorerSnapshot();
  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.kicker}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p></header>
      <div className="mt-8 divide-y divide-black border-y border-black">
        {snapshot.authors.map((author) => <article key={author.label} className="flex items-baseline justify-between gap-6 py-5"><h2 className="text-lg font-semibold text-black">{author.label}</h2><span className="text-sm text-neutral-600">{author.contributionCount} {m.contributions}</span></article>)}
        {snapshot.authors.length === 0 ? <p className="py-8 text-neutral-600">{m.none}</p> : null}
      </div>
    </main>
  );
}
