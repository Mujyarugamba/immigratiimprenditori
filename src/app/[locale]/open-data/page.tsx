import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExplorerSnapshot } from "@/lib/data/public/explore";
import { isPlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";

const text = {
  en: { kicker: "Observatory · Open data", title: "Open data", intro: "Values already published by the Observatory are also available in structured formats. Definitions, sources and methodological notes remain an integral part of interpretation.", indicators: "Indicators", records: "Records", formats: "Formats", endpoint: "Public endpoint", endpointText: "The endpoint exposes only published indicators and final public values. It does not expose restricted areas, personal data or unpublished editorial material.", open: "Open JSON dataset", csv: "Download CSV", correct: "Correct use", correctText: "A value must not be separated from the indicator definition. Citizenship, place of birth, foreign enterprise and self-employment are not equivalent categories.", method: "Sources & methodology", explorer: "Data Explorer" },
  fr: { kicker: "Observatoire · Données ouvertes", title: "Données ouvertes", intro: "Les valeurs déjà publiées par l'Observatoire sont également disponibles sous des formats structurés. Les définitions, sources et notes méthodologiques font partie intégrante de l'interprétation.", indicators: "Indicateurs", records: "Enregistrements", formats: "Formats", endpoint: "Point d'accès public", endpointText: "Le point d'accès expose uniquement les indicateurs publiés et les valeurs finales publiques. Il n'expose ni zones réservées, ni données personnelles, ni contenus éditoriaux non publiés.", open: "Ouvrir le jeu JSON", csv: "Télécharger CSV", correct: "Bon usage", correctText: "Une valeur ne doit pas être séparée de la définition de l'indicateur. Citoyenneté, lieu de naissance, entreprise étrangère et travail indépendant ne sont pas des catégories équivalentes.", method: "Sources et méthodologie", explorer: "Explorateur de données" },
  es: { kicker: "Observatorio · Datos abiertos", title: "Datos abiertos", intro: "Los valores ya publicados por el Observatorio también están disponibles en formatos estructurados. Las definiciones, fuentes y notas metodológicas forman parte integral de su interpretación.", indicators: "Indicadores", records: "Registros", formats: "Formatos", endpoint: "Punto de acceso público", endpointText: "El punto de acceso expone solo indicadores publicados y valores finales públicos. No expone áreas reservadas, datos personales ni material editorial no publicado.", open: "Abrir conjunto JSON", csv: "Descargar CSV", correct: "Uso correcto", correctText: "Un valor no debe separarse de la definición del indicador. Ciudadanía, lugar de nacimiento, empresa extranjera y trabajo autónomo no son categorías equivalentes.", method: "Fuentes y metodología", explorer: "Explorador de datos" },
  de: { kicker: "Observatorium · Offene Daten", title: "Offene Daten", intro: "Bereits vom Observatorium veröffentlichte Werte stehen auch in strukturierten Formaten zur Verfügung. Definitionen, Quellen und methodische Hinweise sind Bestandteil der Interpretation.", indicators: "Indikatoren", records: "Datensätze", formats: "Formate", endpoint: "Öffentlicher Endpunkt", endpointText: "Der Endpunkt liefert nur veröffentlichte Indikatoren und finale öffentliche Werte. Geschützte Bereiche, personenbezogene Daten und unveröffentlichte redaktionelle Inhalte werden nicht ausgegeben.", open: "JSON-Datensatz öffnen", csv: "CSV herunterladen", correct: "Korrekte Nutzung", correctText: "Ein Wert darf nicht von seiner Indikatordefinition getrennt werden. Staatsangehörigkeit, Geburtsort, ausländisches Unternehmen und Selbstständigkeit sind keine gleichwertigen Kategorien.", method: "Quellen & Methodik", explorer: "Daten-Explorer" },
  ar: { kicker: "المرصد · البيانات المفتوحة", title: "البيانات المفتوحة", intro: "القيم المنشورة بالفعل من المرصد متاحة أيضاً بصيغ منظمة. وتظل التعريفات والمصادر والملاحظات المنهجية جزءاً أساسياً من تفسير البيانات.", indicators: "المؤشرات", records: "السجلات", formats: "الصيغ", endpoint: "واجهة عامة", endpointText: "تعرض الواجهة المؤشرات المنشورة والقيم النهائية العامة فقط، ولا تعرض المناطق المحمية أو البيانات الشخصية أو المواد التحريرية غير المنشورة.", open: "فتح بيانات JSON", csv: "تنزيل CSV", correct: "الاستخدام الصحيح", correctText: "لا ينبغي فصل القيمة عن تعريف المؤشر. الجنسية ومكان الميلاد والمنشأة الأجنبية والعمل الحر ليست فئات متكافئة.", method: "المصادر والمنهجية", explorer: "مستكشف البيانات" },
  zh: { kicker: "观察站 · 开放数据", title: "开放数据", intro: "观察站已经发布的数据值也以结构化格式提供。定义、来源和方法说明仍是正确解读数据不可分割的一部分。", indicators: "指标", records: "记录", formats: "格式", endpoint: "公共接口", endpointText: "该接口仅返回已发布指标和最终公开数据值，不暴露受限区域、个人数据或未发布的编辑材料。", open: "打开 JSON 数据集", csv: "下载 CSV", correct: "正确使用", correctText: "数据值不能脱离指标定义。国籍、出生地、外国企业和自雇并非等价类别。", method: "来源与方法", explorer: "数据探索器" },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return { title: m.title, description: m.intro, alternates: { canonical: `/${locale}/open-data`, languages: languageAlternates("/open-data") } };
}

export default async function LocalizedOpenDataPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const arrow = localizedCtaArrow(locale);
  const snapshot = await getExplorerSnapshot();

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-3">
        <div className="bg-white p-6"><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{m.indicators}</p><strong className="mt-2 block text-3xl">{snapshot.indicators.length}</strong></div>
        <div className="bg-white p-6"><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{m.records}</p><strong className="mt-2 block text-3xl">{snapshot.values.length}</strong></div>
        <div className="bg-white p-6"><p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{m.formats}</p><strong className="mt-2 block text-2xl">JSON · CSV</strong></div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">{m.endpoint}</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">{m.endpointText}</p>
        <code className="mt-5 block overflow-x-auto border border-black bg-neutral-50 p-4 text-sm">/api/open-data/indicators</code>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/api/open-data/indicators" className="border border-black px-5 py-3 text-sm font-semibold">{m.open} {arrow}</a>
          <a href="/api/open-data/indicators.csv" className="border border-black px-5 py-3 text-sm font-semibold">{m.csv} ↓</a>
        </div>
      </section>

      <section className="mt-10 border-t border-black pt-8">
        <h2 className="text-2xl font-semibold text-black">{m.correct}</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">{m.correctText}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/dati-e-fonti" className="underline underline-offset-4">{m.method} {arrow}</Link>
          <Link href={`/${locale}/esplora`} className="underline underline-offset-4">{m.explorer} {arrow}</Link>
        </div>
      </section>
    </main>
  );
}
