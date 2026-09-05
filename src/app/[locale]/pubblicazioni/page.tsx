import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";
import { listPublications } from "@/lib/data/public/publications";
import { presentLocalizedContentByHrefs } from "@/lib/i18n/ai-translation/runtime";
import { isPlatformLocale, type PlatformLocale } from "@/lib/i18n/config";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { languageAlternates } from "@/lib/i18n/seo";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Locale = Exclude<PlatformLocale, "it">;

const TEXT = {
  en: { title: "Publications", description: "Reports, studies and publications verified and published by the Immigrati Imprenditori Research Centre.", motion: "reports · studies · dossiers ·", kicker: "Research Centre · Library", intro: "Reports and studies already published and verified by the editorial team. Each record preserves authors, source, date, bibliographic metadata and available citation tools.", library: "Library", section: "Reports and studies", analysis: "Analysis", sources: "Sources", method: "Methodology", open: "Open record", original: "Original document", empty: "No publication currently meets the public editorial criteria.", kinds: { data_note: "Data note", academic_study: "Academic study", external_report: "External report", institutional_report: "Institutional report", aipel_report: "AIPEL report", publication: "Publication" } },
  fr: { title: "Publications", description: "Rapports, études et publications vérifiés et publiés par le Centre d’études Immigrati Imprenditori.", motion: "rapports · études · dossiers ·", kicker: "Centre d’études · Bibliothèque", intro: "Rapports et études déjà publiés et vérifiés par la rédaction. Chaque fiche conserve les auteurs, la source, la date, les métadonnées bibliographiques et les outils de citation disponibles.", library: "Bibliothèque", section: "Rapports et études", analysis: "Analyses", sources: "Sources", method: "Méthodologie", open: "Ouvrir la fiche", original: "Document original", empty: "Aucune publication ne satisfait actuellement les critères éditoriaux publics.", kinds: { data_note: "Note de données", academic_study: "Étude académique", external_report: "Rapport externe", institutional_report: "Rapport institutionnel", aipel_report: "Rapport AIPEL", publication: "Publication" } },
  es: { title: "Publicaciones", description: "Informes, estudios y publicaciones verificados y publicados por el Centro de Estudios Immigrati Imprenditori.", motion: "informes · estudios · dossiers ·", kicker: "Centro de Estudios · Biblioteca", intro: "Informes y estudios ya publicados y verificados por la redacción. Cada ficha conserva autores, fuente, fecha, metadatos bibliográficos y herramientas de citación disponibles.", library: "Biblioteca", section: "Informes y estudios", analysis: "Análisis", sources: "Fuentes", method: "Metodología", open: "Abrir ficha", original: "Documento original", empty: "Actualmente no hay publicaciones que cumplan los criterios editoriales públicos.", kinds: { data_note: "Nota de datos", academic_study: "Estudio académico", external_report: "Informe externo", institutional_report: "Informe institucional", aipel_report: "Informe AIPEL", publication: "Publicación" } },
  de: { title: "Publikationen", description: "Vom Studienzentrum Immigrati Imprenditori geprüfte und veröffentlichte Berichte, Studien und Publikationen.", motion: "berichte · studien · dossiers ·", kicker: "Studienzentrum · Bibliothek", intro: "Bereits veröffentlichte und redaktionell geprüfte Berichte und Studien. Jeder Eintrag bewahrt Autoren, Quelle, Datum, bibliografische Metadaten und verfügbare Zitierwerkzeuge.", library: "Bibliothek", section: "Berichte und Studien", analysis: "Analysen", sources: "Quellen", method: "Methodik", open: "Eintrag öffnen", original: "Originaldokument", empty: "Derzeit erfüllt keine Publikation die öffentlichen redaktionellen Kriterien.", kinds: { data_note: "Datennotiz", academic_study: "Akademische Studie", external_report: "Externer Bericht", institutional_report: "Institutioneller Bericht", aipel_report: "AIPEL-Bericht", publication: "Publikation" } },
  ar: { title: "المنشورات", description: "تقارير ودراسات ومنشورات تحقق منها ونشرها مركز الدراسات Immigrati Imprenditori.", motion: "تقارير · دراسات · ملفات ·", kicker: "مركز الدراسات · المكتبة", intro: "تقارير ودراسات منشورة بالفعل وتحققت منها هيئة التحرير. تحتفظ كل بطاقة بالمؤلفين والمصدر والتاريخ والبيانات الببليوغرافية وأدوات الاستشهاد المتاحة.", library: "المكتبة", section: "التقارير والدراسات", analysis: "التحليلات", sources: "المصادر", method: "المنهجية", open: "فتح البطاقة", original: "الوثيقة الأصلية", empty: "لا توجد حالياً منشورات تستوفي معايير النشر التحريرية العامة.", kinds: { data_note: "مذكرة بيانات", academic_study: "دراسة أكاديمية", external_report: "تقرير خارجي", institutional_report: "تقرير مؤسسي", aipel_report: "تقرير AIPEL", publication: "منشور" } },
  zh: { title: "出版物", description: "由 Immigrati Imprenditori 研究中心核实并发布的报告、研究和出版物。", motion: "报告 · 研究 · 专题资料 ·", kicker: "研究中心 · 资料库", intro: "已发布并经编辑团队核实的报告和研究。每条记录保留作者、来源、日期、书目元数据以及可用的引用工具。", library: "资料库", section: "报告与研究", analysis: "分析", sources: "来源", method: "方法", open: "打开记录", original: "原始文件", empty: "目前没有出版物符合公开编辑标准。", kinds: { data_note: "数据说明", academic_study: "学术研究", external_report: "外部报告", institutional_report: "机构报告", aipel_report: "AIPEL 报告", publication: "出版物" } },
} as const satisfies Record<Locale, unknown>;

type Props = { params: Promise<{ locale: string }> };

function kindLabel(locale: Locale, kind: string | null, typeCode: string) {
  const m = TEXT[locale];
  if (typeCode === "working_paper") return "Working Paper";
  if (typeCode === "policy_brief") return "Policy Brief";
  if (typeCode === "dossier") return "Dossier";
  if (typeCode === "data_note") return m.kinds.data_note;
  if (kind === "academic_study") return m.kinds.academic_study;
  if (kind === "external_report") return m.kinds.external_report;
  if (kind === "institutional_report") return m.kinds.institutional_report;
  if (kind === "aipel_report") return m.kinds.aipel_report;
  return m.kinds.publication;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = TEXT[locale];
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `/${locale}/pubblicazioni`, languages: languageAlternates("/pubblicazioni") },
    ...pageSocialMetadata({ title: m.title, description: m.description, pathname: `/${locale}/pubblicazioni` }),
  };
}

export default async function LocalizedPublicationsPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = TEXT[locale];
  const arrow = localizedCtaArrow(locale);
  const publications = await listPublications();
  const translated = await presentLocalizedContentByHrefs(
    publications.map((item) => `/contenuti/${item.slug}`),
    locale,
  );

  return (
    <main id="contenuto" className="preview-hub-page">
      <section className="preview-hub-hero publications">
        <div className="preview-hub-motion" aria-hidden="true"><span>{m.motion}</span><span>{m.motion}</span></div>
        <div className="preview-hub-inner">
          <p className="preview-hub-kicker">{m.kicker}</p>
          <h1>{m.title}</h1>
          <p className="hub-intro">{m.intro}</p>
        </div>
      </section>

      <div className="preview-hub-body">
        <div className="preview-section-head">
          <div><p className="eyebrow">{m.library}</p><h2>{m.section}</h2></div>
          <div className="flex flex-wrap gap-4">
            <Link href={`/${locale}/contenuti`}>{m.analysis} {arrow}</Link>
            <Link href={`/${locale}/fonti`}>{m.sources} {arrow}</Link>
            <Link href={`/${locale}/dati-e-fonti`}>{m.method} {arrow}</Link>
          </div>
        </div>

        {publications.length > 0 ? (
          <div className="preview-index-grid">
            {publications.map((item) => {
              const presented = translated.get(item.slug);
              const title = presented?.title ?? item.title;
              const abstract = presented?.abstract ?? item.abstract;
              return (
                <article key={item.id} className="preview-index-card">
                  <p className="index-meta">{kindLabel(locale, item.report_kind, item.type_code)}{item.source_publication_year ? ` · ${item.source_publication_year}` : ""}</p>
                  <h2><Link href={`/${locale}/contenuti/${item.slug}`}><OriginalLanguageText as="span" languageCode={presented?.displayLanguageCode}>{title}</OriginalLanguageText></Link></h2>
                  {item.authors.length > 0 ? <p className="font-semibold">{item.authors.join(", ")}</p> : null}
                  {item.publisher_name ? <p>{item.publisher_name}</p> : null}
                  {abstract ? <OriginalLanguageText languageCode={presented?.displayLanguageCode}>{abstract}</OriginalLanguageText> : null}
                  <div className="index-footer flex flex-wrap gap-4">
                    <Link href={`/${locale}/contenuti/${item.slug}`}>{m.open} {arrow}</Link>
                    {item.document_url ? <a href={item.document_url} target="_blank" rel="noopener noreferrer">{m.original} ↗</a> : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : <p>{m.empty}</p>}
      </div>
    </main>
  );
}
