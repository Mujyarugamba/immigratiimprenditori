import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";
import { canAcceptOnlineDonations, SUPPORT_CONFIGURATION } from "@/lib/support/config";

const text = {
  en: {
    title: "Support the Research Centre",
    intro: "Supporting ImmigratiImprenditori.it contributes to the Research Centre's work: research, data collection and verification, interviews, reports and audiovisual production.",
    what: "What your support enables",
    economic: "Financial support",
    onlineTitle: "Online with Stripe",
    onlineText: "You can freely choose the amount and complete the payment on Stripe's secure page.",
    onlineCta: "Support online →",
    onlineUnavailable: "Online payment is not currently available.",
    bankTitle: "Bank transfer",
    bankText: "To support the Research Centre by bank transfer, contact the Research Centre.",
    bankCta: "Contact the Research Centre →",
    fiscalNote: "Tax information on any possible deductibility or tax relief is not stated until it has been separately verified.",
    independence: "Editorial independence",
    independenceText: "Support, partnerships and sponsorships do not confer any right to influence source selection, data, conclusions, interviews or editorial decisions. Economic support remains separate from editorial and research activity.",
    partnership: "Partnerships and institutional support",
    partnershipText: "Public bodies, foundations, universities, associations and companies may support specific research, data collection, editorial production or public initiatives. Every collaboration must respect the mission and independence of the Research Centre.",
    contact: "For partnerships and institutional relations",
    areas: [
      ["Research & data", "Collection, verification and updating of indicators, time series, sources and territorial comparisons."],
      ["Stories & interviews", "Research, preparation and production of testimonies, interviews and documented entrepreneurial stories."],
      ["Reports & publications", "Production of dossiers, analyses, reports and accessible, citable research materials."],
      ["Audiovisual production", "Recording, editing, transcription and publication of interviews, testimonies, meetings and presentations."],
    ],
  },
  fr: {
    title: "Soutenir le Centre d'études",
    intro: "Soutenir ImmigratiImprenditori.it contribue aux activités du Centre d'études : recherche, collecte et vérification des données, entretiens, rapports et production audiovisuelle.",
    what: "Ce que votre soutien permet",
    economic: "Soutien financier",
    onlineTitle: "En ligne avec Stripe",
    onlineText: "Vous pouvez choisir librement le montant et effectuer le paiement sur la page sécurisée de Stripe.",
    onlineCta: "Soutenir en ligne →",
    onlineUnavailable: "Le paiement en ligne n'est pas disponible actuellement.",
    bankTitle: "Virement bancaire",
    bankText: "Pour soutenir le Centre d'études par virement bancaire, contactez le Centre d'études.",
    bankCta: "Contacter le Centre d'études →",
    fiscalNote: "Les informations fiscales concernant une éventuelle déductibilité ou réduction fiscale ne sont pas indiquées tant qu'elles n'ont pas été vérifiées séparément.",
    independence: "Indépendance éditoriale",
    independenceText: "Les soutiens, partenariats et parrainages ne confèrent aucun droit d'intervention sur le choix des sources, les données, les conclusions, les entretiens ou les décisions de la rédaction. Le soutien économique reste séparé de l'activité éditoriale et de recherche.",
    partnership: "Partenariats et soutien institutionnel",
    partnershipText: "Organismes, fondations, universités, associations et entreprises peuvent soutenir des activités spécifiques de recherche, collecte de données, production éditoriale ou initiatives publiques. Toute collaboration respecte la mission et l'indépendance du Centre d'études.",
    contact: "Pour les partenariats et relations institutionnelles",
    areas: [
      ["Recherche et données", "Collecte, vérification et mise à jour d'indicateurs, séries chronologiques, sources et comparaisons territoriales."],
      ["Histoires et entretiens", "Recherche, préparation et réalisation de témoignages, entretiens et histoires d'entreprise documentées."],
      ["Rapports et publications", "Production de dossiers, analyses, rapports et ressources d'approfondissement accessibles et citables."],
      ["Production audiovisuelle", "Enregistrement, montage, transcription et publication d'entretiens, témoignages, rencontres et présentations."],
    ],
  },
  es: {
    title: "Apoya el Centro de Estudios",
    intro: "Apoyar ImmigratiImprenditori.it contribuye a las actividades del Centro de Estudios: investigación, recopilación y verificación de datos, entrevistas, informes y producción audiovisual.",
    what: "Qué hace posible tu apoyo",
    economic: "Apoyo económico",
    onlineTitle: "En línea con Stripe",
    onlineText: "Puedes elegir libremente el importe y completar el pago en la página segura de Stripe.",
    onlineCta: "Apoyar en línea →",
    onlineUnavailable: "El pago en línea no está disponible actualmente.",
    bankTitle: "Transferencia bancaria",
    bankText: "Para apoyar al Centro de Estudios mediante transferencia bancaria, contacta con el Centro de Estudios.",
    bankCta: "Contactar con el Centro de Estudios →",
    fiscalNote: "La información fiscal sobre una posible deducción o desgravación no se indica hasta que se verifique por separado.",
    independence: "Independencia editorial",
    independenceText: "El apoyo, las alianzas y los patrocinios no otorgan ningún derecho de intervención en la selección de fuentes, los datos, las conclusiones, las entrevistas ni las decisiones editoriales. El apoyo económico permanece separado de la actividad editorial y de investigación.",
    partnership: "Alianzas y apoyo institucional",
    partnershipText: "Entidades, fundaciones, universidades, asociaciones y empresas pueden apoyar actividades específicas de investigación, recopilación de datos, producción editorial o iniciativas públicas. Toda colaboración respeta la misión y la independencia del Centro de Estudios.",
    contact: "Para alianzas y relaciones institucionales",
    areas: [
      ["Investigación y datos", "Recopilación, verificación y actualización de indicadores, series temporales, fuentes y comparaciones territoriales."],
      ["Historias y entrevistas", "Investigación, preparación y realización de testimonios, entrevistas e historias empresariales documentadas."],
      ["Informes y publicaciones", "Producción de dossiers, análisis, informes y materiales de profundización accesibles y citables."],
      ["Producción audiovisual", "Grabación, edición, transcripción y publicación de entrevistas, testimonios, encuentros y presentaciones."],
    ],
  },
  de: {
    title: "Das Studienzentrum unterstützen",
    intro: "Unterstützung für ImmigratiImprenditori.it trägt zur Arbeit des Studienzentrums bei: Forschung, Datenerhebung und -prüfung, Interviews, Berichte und audiovisuelle Produktion.",
    what: "Was Ihre Unterstützung ermöglicht",
    economic: "Finanzielle Unterstützung",
    onlineTitle: "Online mit Stripe",
    onlineText: "Sie können den Betrag frei wählen und die Zahlung auf der sicheren Stripe-Seite abschließen.",
    onlineCta: "Online unterstützen →",
    onlineUnavailable: "Online-Zahlung ist derzeit nicht verfügbar.",
    bankTitle: "Banküberweisung",
    bankText: "Um das Studienzentrum per Banküberweisung zu unterstützen, kontaktieren Sie das Studienzentrum.",
    bankCta: "Studienzentrum kontaktieren →",
    fiscalNote: "Steuerliche Informationen zu einer möglichen Abzugsfähigkeit oder steuerlichen Begünstigung werden erst nach gesonderter Prüfung angegeben.",
    independence: "Redaktionelle Unabhängigkeit",
    independenceText: "Unterstützung, Partnerschaften und Sponsoring verleihen kein Recht, auf Quellenauswahl, Daten, Schlussfolgerungen, Interviews oder redaktionelle Entscheidungen Einfluss zu nehmen. Finanzielle Unterstützung bleibt von redaktioneller und wissenschaftlicher Arbeit getrennt.",
    partnership: "Partnerschaften und institutionelle Unterstützung",
    partnershipText: "Institutionen, Stiftungen, Universitäten, Verbände und Unternehmen können bestimmte Forschungs-, Datenerhebungs-, redaktionelle oder öffentliche Aktivitäten unterstützen. Jede Zusammenarbeit respektiert Mission und Unabhängigkeit des Studienzentrums.",
    contact: "Für Partnerschaften und institutionelle Beziehungen",
    areas: [
      ["Forschung und Daten", "Erhebung, Prüfung und Aktualisierung von Indikatoren, Zeitreihen, Quellen und territorialen Vergleichen."],
      ["Geschichten und Interviews", "Recherche, Vorbereitung und Produktion dokumentierter Erfahrungsberichte, Interviews und Unternehmensgeschichten."],
      ["Berichte und Publikationen", "Erstellung von Dossiers, Analysen, Berichten und zugänglichen, zitierfähigen Vertiefungsmaterialien."],
      ["Audiovisuelle Produktion", "Aufzeichnung, Schnitt, Transkription und Veröffentlichung von Interviews, Erfahrungsberichten, Treffen und Präsentationen."],
    ],
  },
  ar: {
    title: "ادعم مركز الدراسات",
    intro: "يسهم دعم ImmigratiImprenditori.it في أنشطة مركز الدراسات: البحث وجمع البيانات والتحقق منها والمقابلات والتقارير والإنتاج السمعي البصري.",
    what: "ما الذي يتيحه دعمك",
    economic: "الدعم المالي",
    onlineTitle: "الدعم عبر Stripe",
    onlineText: "يمكنك اختيار المبلغ بحرية وإتمام الدفع عبر صفحة Stripe الآمنة.",
    onlineCta: "ادعم عبر الإنترنت ←",
    onlineUnavailable: "الدفع عبر الإنترنت غير متاح حاليًا.",
    bankTitle: "تحويل مصرفي",
    bankText: "لدعم مركز الدراسات عن طريق التحويل المصرفي، تواصل مع مركز الدراسات.",
    bankCta: "تواصل مع مركز الدراسات ←",
    fiscalNote: "لا تُذكر المعلومات الضريبية المتعلقة بأي إمكانية للخصم أو الاستفادة الضريبية قبل التحقق منها بشكل منفصل.",
    independence: "الاستقلال التحريري",
    independenceText: "لا يمنح الدعم أو الشراكات أو الرعاية أي حق في التدخل في اختيار المصادر أو البيانات أو الاستنتاجات أو المقابلات أو قرارات هيئة التحرير. ويظل الدعم المالي منفصلاً عن النشاط التحريري والبحثي.",
    partnership: "الشراكات والدعم المؤسسي",
    partnershipText: "يمكن للهيئات والمؤسسات والجامعات والجمعيات والشركات دعم أنشطة محددة في البحث أو جمع البيانات أو الإنتاج التحريري أو المبادرات العامة. وتحترم كل شراكة رسالة مركز الدراسات واستقلاله.",
    contact: "للشراكات والعلاقات المؤسسية",
    areas: [
      ["البحث والبيانات", "جمع المؤشرات والسلاسل الزمنية والمصادر والمقارنات الإقليمية والتحقق منها وتحديثها."],
      ["القصص والمقابلات", "البحث والتحضير وإنتاج الشهادات والمقابلات وقصص الأعمال الموثقة."],
      ["التقارير والمنشورات", "إنتاج الملفات والتحليلات والتقارير ومواد البحث المتاحة والقابلة للاستشهاد."],
      ["الإنتاج السمعي البصري", "تسجيل المقابلات والشهادات واللقاءات والعروض وتحريرها ونسخها ونشرها."],
    ],
  },
  zh: {
    title: "支持研究中心",
    intro: "支持 ImmigratiImprenditori.it 将有助于研究中心开展研究、数据收集与核查、访谈、报告和视听内容制作。",
    what: "您的支持用于什么",
    economic: "经济支持",
    onlineTitle: "通过 Stripe 在线支持",
    onlineText: "您可以自由选择金额，并在 Stripe 的安全页面完成支付。",
    onlineCta: "在线支持 →",
    onlineUnavailable: "目前暂不提供在线支付。",
    bankTitle: "银行转账",
    bankText: "如需通过银行转账支持研究中心，请联系研究中心。",
    bankCta: "联系研究中心 →",
    fiscalNote: "在单独核实之前，不提供任何关于税务抵扣或扣除资格的信息。",
    independence: "编辑独立性",
    independenceText: "支持、合作伙伴关系和赞助均不产生干预来源选择、数据、结论、访谈或编辑决策的权利。经济支持与编辑和研究活动保持分离。",
    partnership: "合作伙伴与机构支持",
    partnershipText: "公共机构、基金会、大学、协会和企业可以支持特定的研究、数据收集、编辑制作或公共活动。所有合作都必须尊重研究中心的使命与独立性。",
    contact: "合作伙伴与机构关系联系",
    areas: [
      ["研究与数据", "收集、核查并更新指标、时间序列、来源和地区比较。"],
      ["故事与访谈", "研究、准备并制作证言、访谈和有文献依据的创业故事。"],
      ["报告与出版物", "制作专题、分析、报告以及可访问、可引用的深入研究材料。"],
      ["视听制作", "录制、剪辑、转写并发布访谈、证言、会议和演示。"],
    ],
  },
} as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = text[locale];
  return { title: m.title, description: m.intro, alternates: { canonical: `/${locale}/sostieni`, languages: languageAlternates("/sostieni") } };
}

export default async function LocalizedSupportPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const m = text[locale];
  const donationsEnabled = canAcceptOnlineDonations();

  return (
    <main id="contenuto" className="localized-support-page">
      <header className="localized-support-header">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori · Centro Studi</p>
        <h1>{m.title}</h1>
        <p>{m.intro}</p>
      </header>

      <section className="localized-support-section">
        <h2>{m.what}</h2>
        <div className="localized-support-grid">
          {m.areas.map(([title, areaText]) => (
            <article key={title} className="localized-support-card">
              <h3>{title}</h3>
              <p>{areaText}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="localized-support-rule">
        <h2>{m.economic}</h2>
        <div className="localized-support-grid">
          <article className="localized-support-card">
            <h3>{m.onlineTitle}</h3>
            {donationsEnabled && SUPPORT_CONFIGURATION.paymentUrl ? (
              <>
                <p>{m.onlineText}</p>
                <a className="underline underline-offset-4" href={SUPPORT_CONFIGURATION.paymentUrl} rel="noreferrer">{m.onlineCta}</a>
              </>
            ) : (
              <p>{m.onlineUnavailable}</p>
            )}
          </article>

          <article className="localized-support-card">
            <h3>{m.bankTitle}</h3>
            <p>{m.bankText}</p>
            <a className="underline underline-offset-4" href={`mailto:${SUPPORT_CONFIGURATION.partnershipEmail}`}>{m.bankCta}</a>
          </article>
        </div>
        <p className="mt-4 text-sm leading-6 text-neutral-600">{m.fiscalNote}</p>
      </section>

      <section className="localized-support-rule">
        <h2>{m.independence}</h2>
        <p>{m.independenceText}</p>
      </section>

      <section className="localized-support-rule">
        <h2>{m.partnership}</h2>
        <p>{m.partnershipText}</p>
        <p>{m.contact}: <a className="underline underline-offset-4" href={`mailto:${SUPPORT_CONFIGURATION.partnershipEmail}`}>{SUPPORT_CONFIGURATION.partnershipEmail}</a>.</p>
      </section>
    </main>
  );
}
