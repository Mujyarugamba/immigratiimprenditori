import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  hasCompleteInstitutionalDisclosure,
  INSTITUTIONAL_PROFILE,
} from "@/lib/institutional/profile";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { EDITORIAL_VISUAL_COPY } from "@/lib/i18n/editorial-visual";
import { languageAlternates } from "@/lib/i18n/seo";

const copy = {
  en: {
    dataTitle: "Data, analysis and voices",
    dataText: "The editorial identity rests on three complementary elements: data, analysis and voices. Indicators and statistics are accompanied by reports, research, stories, interviews and testimony.",
    governanceTitle: "Research Centre and Observatory",
    governanceText1: "AIPEL is the promoter and owner of the Immigrati Imprenditori project. Immigrati Imprenditori operates as a Research Centre.",
    governanceText2: "The Observatory is the Research Centre function dedicated to data, indicators, time series, territorial comparisons and methodology. The project is not presented as a registered newspaper or news publication.",
    responsibility: "Responsibility and direction",
    promoter: "Promoting body",
    president: "AIPEL President",
    editorialDirector: "Editorial direction",
    transparency: "Institutional transparency",
    legalName: "Legal name",
    office: "Registered office",
    admin: "Administrative details",
    incompleteTitle: "Administrative record being completed",
    incompleteText: "The extended legal name, registered office and administrative details will be published only after documentary verification. The site does not reconstruct or infer missing institutional information from informal sources.",
    principles: "Editorial principles",
    principle1: "The editorial team distinguishes facts, data, interpretations and opinions. Sources must be identifiable and each data point, where relevant, must state its origin, period, unit of measure, territory and methodology.",
    principle2: "External proposals are never published automatically. The editorial team retains responsibility for verification, selection and publication.",
    principle3: "Support, partnerships and sponsorships do not grant any right to intervene in editorial decisions.",
    policy: "Editorial policy",
    sources: "Sources and methodology",
    contacts: "Contacts",
  },
  fr: {
    dataTitle: "Données, analyses et voix",
    dataText: "L’identité éditoriale repose sur trois éléments complémentaires : données, analyses et voix. Les indicateurs et statistiques sont accompagnés de rapports, recherches, récits, entretiens et témoignages.",
    governanceTitle: "Centre d’études et Observatoire",
    governanceText1: "AIPEL est l’organisme promoteur et titulaire du projet Immigrati Imprenditori. Immigrati Imprenditori fonctionne comme Centre d’études.",
    governanceText2: "L’Observatoire est la fonction du Centre d’études consacrée aux données, indicateurs, séries temporelles, comparaisons territoriales et à la méthodologie. Le projet n’est pas présenté comme une publication journalistique enregistrée.",
    responsibility: "Responsabilité et direction",
    promoter: "Organisme promoteur",
    president: "Président AIPEL",
    editorialDirector: "Direction éditoriale",
    transparency: "Transparence institutionnelle",
    legalName: "Dénomination",
    office: "Siège",
    admin: "Données administratives",
    incompleteTitle: "Fiche administrative en cours de finalisation",
    incompleteText: "La dénomination légale complète, le siège et les données administratives ne seront publiés qu’après vérification documentaire. Le site ne reconstitue ni ne déduit les informations institutionnelles manquantes à partir de sources informelles.",
    principles: "Principes éditoriaux",
    principle1: "La rédaction distingue les faits, les données, les interprétations et les opinions. Les sources doivent être identifiables et chaque donnée, lorsque cela est pertinent, doit indiquer son origine, sa période, son unité de mesure, son territoire et sa méthodologie.",
    principle2: "Les propositions externes ne sont jamais publiées automatiquement. La rédaction conserve la responsabilité de la vérification, de la sélection et de la publication.",
    principle3: "Les soutiens, partenariats et parrainages ne donnent aucun droit d’intervention dans les choix éditoriaux.",
    policy: "Politique éditoriale",
    sources: "Sources et méthodologie",
    contacts: "Contacts",
  },
  es: {
    dataTitle: "Datos, análisis y voces",
    dataText: "La identidad editorial se apoya en tres elementos complementarios: datos, análisis y voces. Los indicadores y estadísticas se acompañan de informes, investigaciones, historias, entrevistas y testimonios.",
    governanceTitle: "Centro de Estudios y Observatorio",
    governanceText1: "AIPEL es la entidad promotora y titular del proyecto Immigrati Imprenditori. Immigrati Imprenditori opera como Centro de Estudios.",
    governanceText2: "El Observatorio es la función del Centro de Estudios dedicada a datos, indicadores, series temporales, comparaciones territoriales y metodología. El proyecto no se presenta como una publicación periodística registrada.",
    responsibility: "Responsabilidad y dirección",
    promoter: "Entidad promotora",
    president: "Presidente de AIPEL",
    editorialDirector: "Dirección editorial",
    transparency: "Transparencia institucional",
    legalName: "Denominación",
    office: "Sede",
    admin: "Datos administrativos",
    incompleteTitle: "Ficha administrativa en proceso de finalización",
    incompleteText: "La denominación legal completa, la sede y los datos administrativos se publicarán únicamente después de una verificación documental. El sitio no reconstruye ni deduce información institucional que falte a partir de fuentes informales.",
    principles: "Principios editoriales",
    principle1: "La redacción distingue hechos, datos, interpretaciones y opiniones. Las fuentes deben ser identificables y cada dato, cuando corresponda, debe indicar origen, periodo, unidad de medida, territorio y metodología.",
    principle2: "Las propuestas externas nunca se publican automáticamente. La redacción mantiene la responsabilidad de verificar, seleccionar y publicar los contenidos.",
    principle3: "El apoyo, las alianzas y los patrocinios no otorgan ningún derecho de intervención en las decisiones editoriales.",
    policy: "Política editorial",
    sources: "Fuentes y metodología",
    contacts: "Contactos",
  },
  de: {
    dataTitle: "Daten, Analysen und Stimmen",
    dataText: "Die redaktionelle Identität beruht auf drei sich ergänzenden Elementen: Daten, Analysen und Stimmen. Indikatoren und Statistiken werden durch Berichte, Forschung, Geschichten, Interviews und Erfahrungsberichte ergänzt.",
    governanceTitle: "Studienzentrum und Observatorium",
    governanceText1: "AIPEL ist Träger und Eigentümer des Projekts Immigrati Imprenditori. Immigrati Imprenditori arbeitet als Studienzentrum.",
    governanceText2: "Das Observatorium ist der Bereich des Studienzentrums für Daten, Indikatoren, Zeitreihen, regionale Vergleiche und Methodik. Das Projekt wird nicht als registrierte journalistische Publikation dargestellt.",
    responsibility: "Verantwortung und Leitung",
    promoter: "Trägerorganisation",
    president: "Präsident von AIPEL",
    editorialDirector: "Redaktionelle Leitung",
    transparency: "Institutionelle Transparenz",
    legalName: "Rechtliche Bezeichnung",
    office: "Sitz",
    admin: "Verwaltungsangaben",
    incompleteTitle: "Verwaltungsangaben werden vervollständigt",
    incompleteText: "Die vollständige rechtliche Bezeichnung, der Sitz und die Verwaltungsangaben werden erst nach dokumentarischer Prüfung veröffentlicht. Die Website rekonstruiert oder erschließt fehlende institutionelle Angaben nicht aus informellen Quellen.",
    principles: "Redaktionelle Grundsätze",
    principle1: "Die Redaktion unterscheidet Fakten, Daten, Interpretationen und Meinungen. Quellen müssen identifizierbar sein; jeder Datenwert muss, soweit relevant, Herkunft, Zeitraum, Maßeinheit, Gebiet und Methodik ausweisen.",
    principle2: "Externe Vorschläge werden niemals automatisch veröffentlicht. Die Redaktion bleibt für Prüfung, Auswahl und Veröffentlichung verantwortlich.",
    principle3: "Unterstützung, Partnerschaften und Sponsoring verleihen kein Recht auf Einflussnahme auf redaktionelle Entscheidungen.",
    policy: "Redaktionelle Grundsätze",
    sources: "Quellen und Methodik",
    contacts: "Kontakt",
  },
  ar: {
    dataTitle: "البيانات والتحليل والأصوات",
    dataText: "تقوم الهوية التحريرية على ثلاثة عناصر متكاملة: البيانات والتحليل والأصوات. وتُستكمل المؤشرات والإحصاءات بالتقارير والأبحاث والقصص والمقابلات والشهادات.",
    governanceTitle: "مركز الدراسات والمرصد",
    governanceText1: "AIPEL هي الجهة المروجة والمالكة لمشروع Immigrati Imprenditori. ويعمل Immigrati Imprenditori كمركز دراسات.",
    governanceText2: "المرصد هو وظيفة مركز الدراسات المخصصة للبيانات والمؤشرات والسلاسل الزمنية والمقارنات الإقليمية والمنهجية. ولا يُقدَّم المشروع باعتباره صحيفة أو مطبوعة صحفية مسجلة.",
    responsibility: "المسؤولية والإدارة",
    promoter: "الجهة المروجة",
    president: "رئيس AIPEL",
    editorialDirector: "الإدارة التحريرية",
    transparency: "الشفافية المؤسسية",
    legalName: "الاسم القانوني",
    office: "المقر",
    admin: "البيانات الإدارية",
    incompleteTitle: "استكمال البطاقة الإدارية جارٍ",
    incompleteText: "لن يُنشر الاسم القانوني الكامل والمقر والبيانات الإدارية إلا بعد التحقق الوثائقي. ولا يعيد الموقع بناء المعلومات المؤسسية الناقصة أو يستنتجها من مصادر غير رسمية.",
    principles: "المبادئ التحريرية",
    principle1: "تميز هيئة التحرير بين الوقائع والبيانات والتفسيرات والآراء. ويجب أن تكون المصادر قابلة للتحديد، وأن يبين كل رقم، عند الاقتضاء، مصدره وفترته ووحدة قياسه وإقليمه ومنهجيته.",
    principle2: "لا تُنشر المقترحات الخارجية تلقائياً أبداً. وتظل مسؤولية التحقق والاختيار والنشر بيد هيئة التحرير.",
    principle3: "لا يمنح الدعم أو الشراكات أو الرعاية أي حق في التدخل في القرارات التحريرية.",
    policy: "السياسة التحريرية",
    sources: "المصادر والمنهجية",
    contacts: "التواصل",
  },
  zh: {
    dataTitle: "数据、分析与人物声音",
    dataText: "编辑定位建立在三个相互补充的要素之上：数据、分析与人物声音。指标和统计数据与报告、研究、故事、访谈和证言共同呈现。",
    governanceTitle: "研究中心与观察站",
    governanceText1: "AIPEL 是 Immigrati Imprenditori 项目的推动和持有机构。Immigrati Imprenditori 作为研究中心运行。",
    governanceText2: "观察站是研究中心中专门负责数据、指标、时间序列、地区比较和方法学的部分。该项目不以注册新闻媒体或报刊的身份呈现。",
    responsibility: "责任与管理",
    promoter: "推动机构",
    president: "AIPEL 主席",
    editorialDirector: "编辑负责人",
    transparency: "机构透明度",
    legalName: "法定名称",
    office: "注册地址",
    admin: "行政信息",
    incompleteTitle: "行政资料正在完善",
    incompleteText: "完整法定名称、注册地址和行政信息仅在文件核验后发布。网站不会依据非正式来源推断或补全缺失的机构信息。",
    principles: "编辑原则",
    principle1: "编辑团队区分事实、数据、解释和观点。来源必须可识别；在适用情况下，每项数据都应说明来源、时期、计量单位、地区和方法。",
    principle2: "外部投稿绝不会自动发布。编辑团队始终负责核验、筛选和发布。",
    principle3: "资助、合作和赞助不赋予任何干预编辑决策的权利。",
    policy: "编辑政策",
    sources: "来源与方法",
    contacts: "联系方式",
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
  const v = EDITORIAL_VISUAL_COPY[locale];
  const c = copy[locale];
  const profile = INSTITUTIONAL_PROFILE;
  const disclosureComplete = hasCompleteInstitutionalDisclosure();

  return (
    <main id="contenuto" className="preview-manifest-page">
      <header className="preview-manifest-hero">
        <div className="preview-manifest-motion" aria-hidden="true">
          {[...v.manifestWords, ...v.manifestWords].map((word, index) => <span key={`${word}-${index}`}>{word}</span>)}
        </div>
        <div className="preview-manifest-hero-inner">
          <p className="manifest-kicker">{v.kicker} · {profile.promoterShortName}</p>
          <h1>{m.aboutTitle}</h1>
          <p className="manifest-intro">{m.aboutIntro}</p>
        </div>
      </header>

      <div className="preview-manifest-body">
        <section>
          <h2>{m.aboutProject}</h2>
          <div className="manifest-copy"><p>{m.aboutProjectText}</p></div>
        </section>
        <section>
          <h2>{c.dataTitle}</h2>
          <div className="manifest-copy"><p>{c.dataText}</p></div>
        </section>
        <section>
          <h2>{c.governanceTitle}</h2>
          <div className="manifest-copy space-y-4"><p>{c.governanceText1}</p><p>{c.governanceText2}</p></div>
        </section>
        <section>
          <h2>{c.responsibility}</h2>
          <div className="manifest-copy">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-[12rem_1fr]">
              <dt className="text-sm font-semibold text-black">{c.promoter}</dt><dd className="text-sm leading-6 text-neutral-700">{profile.promoterShortName}</dd>
              <dt className="text-sm font-semibold text-black">{c.president}</dt><dd className="text-sm leading-6 text-neutral-700">{profile.president}</dd>
              <dt className="text-sm font-semibold text-black">{c.editorialDirector}</dt><dd className="text-sm leading-6 text-neutral-700">{profile.editorialDirector}</dd>
            </dl>
          </div>
        </section>
        <section>
          <h2>{c.transparency}</h2>
          <div className="manifest-copy">
            {disclosureComplete ? (
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-[12rem_1fr]">
                <dt className="text-sm font-semibold text-black">{c.legalName}</dt><dd className="text-sm leading-6 text-neutral-700">{profile.promoterLegalName}</dd>
                <dt className="text-sm font-semibold text-black">{c.office}</dt><dd className="text-sm leading-6 text-neutral-700">{profile.registeredOffice}</dd>
                <dt className="text-sm font-semibold text-black">{c.admin}</dt><dd className="text-sm leading-6 text-neutral-700">{profile.administrativeDisclosure}</dd>
              </dl>
            ) : (
              <div className="preview-manifest-disclosure"><p className="text-sm font-semibold text-black">{c.incompleteTitle}</p><p className="mt-2 text-sm leading-6 text-neutral-700">{c.incompleteText}</p></div>
            )}
          </div>
        </section>
        <section>
          <h2>{c.principles}</h2>
          <div className="manifest-copy space-y-4">
            <p>{c.principle1}</p><p>{c.principle2}</p><p>{c.principle3}</p>
            <div className="manifest-links flex flex-wrap gap-5 text-sm font-semibold">
              <Link href={`/${locale}/politica-editoriale`}>{c.policy} →</Link>
              <Link href={`/${locale}/dati-e-fonti`}>{c.sources} →</Link>
            </div>
          </div>
        </section>
        <section>
          <h2>{c.contacts}</h2>
          <div className="manifest-copy"><a href={`mailto:${profile.contactEmail}`} className="break-all border-b border-current pb-1">{profile.contactEmail}</a></div>
        </section>
      </div>
    </main>
  );
}
