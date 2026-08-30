import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialTranslationNotice } from "@/components/i18n/EditorialTranslationNotice";
import { OriginalLanguageText } from "@/components/i18n/OriginalLanguageText";
import { VOICE_CONTENT_TYPES } from "@/lib/data/public/collections";
import { listCultureContents, listUpcomingCulturalEvents } from "@/lib/data/public/culture";
import { isPlatformLocale } from "@/lib/i18n/config";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { presentLocalizedContentCards } from "@/lib/i18n/ai-translation/runtime";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { languageAlternates } from "@/lib/i18n/seo";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const messages = {
  en: {
    description: "Stories, events, research and cultural and creative industries observed through migration, diaspora, entrepreneurship and territories.",
    eyebrow: "Research Centre · Culture",
    intro: "A space to examine how migration, diaspora and international mobility shape cultural production, creativity, entrepreneurship, work and territories.",
    stories: "Stories and voices",
    storiesText: "Interviews, testimonies and documented stories about people working across culture, creativity and transnational networks.",
    events: "Cultural events",
    eventsText: "Upcoming initiatives relevant to culture, creative industries, diaspora and their economic and social transformations.",
    analysis: "Analysis and research",
    analysisText: "Research, reports, guides and documented analysis on the cultural dimension of migrant entrepreneurship.",
    industries: "Cultural and creative industries",
    industriesText: "The Research Centre follows culture also as an economic field: value chains, professions, entrepreneurship, markets and international mobility.",
    allAnalysis: "Culture archive",
    allEvents: "All cultural events",
    contribute: "Suggest a story, event or research source",
    contributeText: "Submissions enter the editorial Inbox and are reviewed before any publication.",
    contributeCta: "Contribute",
    emptyStories: "No cultural stories have been published yet.",
    emptyEvents: "No upcoming cultural events are available at the moment.",
    emptyAnalysis: "No cultural analysis has been published yet.",
  },
  fr: {
    description: "Récits, événements, recherches et industries culturelles et créatives observés à travers les migrations, les diasporas, l'entrepreneuriat et les territoires.",
    eyebrow: "Centre d'études · Culture",
    intro: "Un espace pour observer comment les migrations, les diasporas et la mobilité internationale traversent la production culturelle, la créativité, l'entrepreneuriat, le travail et les territoires.",
    stories: "Récits et voix",
    storiesText: "Entretiens, témoignages et récits documentés de personnes actives dans la culture, la créativité et les réseaux transnationaux.",
    events: "Événements culturels",
    eventsText: "Initiatives à venir liées à la culture, aux industries créatives, aux diasporas et à leurs transformations économiques et sociales.",
    analysis: "Analyses et recherches",
    analysisText: "Études, rapports, guides et analyses documentées sur la dimension culturelle de l'entrepreneuriat migrant.",
    industries: "Industries culturelles et créatives",
    industriesText: "Le Centre d'études observe aussi la culture comme champ économique : filières, métiers, entreprises, marchés et mobilité internationale.",
    allAnalysis: "Archives Culture",
    allEvents: "Tous les événements culturels",
    contribute: "Proposer un récit, un événement ou une recherche",
    contributeText: "Les propositions arrivent dans l'Inbox éditoriale et sont vérifiées avant toute publication.",
    contributeCta: "Participer",
    emptyStories: "Aucun récit culturel n'a encore été publié.",
    emptyEvents: "Aucun événement culturel à venir n'est disponible pour le moment.",
    emptyAnalysis: "Aucune analyse culturelle n'a encore été publiée.",
  },
  es: {
    description: "Historias, eventos, investigación e industrias culturales y creativas observadas a través de la migración, la diáspora, el emprendimiento y los territorios.",
    eyebrow: "Centro de Estudios · Cultura",
    intro: "Un espacio para observar cómo las migraciones, las diásporas y la movilidad internacional atraviesan la producción cultural, la creatividad, el emprendimiento, el trabajo y los territorios.",
    stories: "Historias y voces",
    storiesText: "Entrevistas, testimonios e historias documentadas de personas que trabajan entre cultura, creatividad y redes transnacionales.",
    events: "Eventos culturales",
    eventsText: "Próximas iniciativas relacionadas con cultura, industrias creativas, diásporas y sus transformaciones económicas y sociales.",
    analysis: "Análisis e investigación",
    analysisText: "Estudios, informes, guías y análisis documentados sobre la dimensión cultural del emprendimiento migrante.",
    industries: "Industrias culturales y creativas",
    industriesText: "El Centro de Estudios sigue la cultura también como campo económico: cadenas de valor, profesiones, empresa, mercados y movilidad internacional.",
    allAnalysis: "Archivo Cultura",
    allEvents: "Todos los eventos culturales",
    contribute: "Propón una historia, un evento o una investigación",
    contributeText: "Las propuestas entran en la Inbox editorial y se verifican antes de cualquier publicación.",
    contributeCta: "Participa",
    emptyStories: "Todavía no hay historias culturales publicadas.",
    emptyEvents: "No hay eventos culturales próximos disponibles en este momento.",
    emptyAnalysis: "Todavía no hay análisis culturales publicados.",
  },
  de: {
    description: "Geschichten, Veranstaltungen, Forschung sowie Kultur- und Kreativwirtschaft im Kontext von Migration, Diaspora, Unternehmertum und Territorien.",
    eyebrow: "Studienzentrum · Kultur",
    intro: "Ein Raum zur Untersuchung, wie Migration, Diaspora und internationale Mobilität kulturelle Produktion, Kreativität, Unternehmertum, Arbeit und Territorien prägen.",
    stories: "Geschichten und Stimmen",
    storiesText: "Interviews, Zeugnisse und dokumentierte Geschichten von Menschen zwischen Kultur, Kreativität und transnationalen Netzwerken.",
    events: "Kulturveranstaltungen",
    eventsText: "Kommende Initiativen zu Kultur, Kreativwirtschaft, Diaspora sowie wirtschaftlichem und gesellschaftlichem Wandel.",
    analysis: "Analysen und Forschung",
    analysisText: "Studien, Berichte, Leitfäden und dokumentierte Analysen zur kulturellen Dimension migrantischen Unternehmertums.",
    industries: "Kultur- und Kreativwirtschaft",
    industriesText: "Das Studienzentrum betrachtet Kultur auch als Wirtschaftsfeld: Wertschöpfungsketten, Berufe, Unternehmen, Märkte und internationale Mobilität.",
    allAnalysis: "Kulturarchiv",
    allEvents: "Alle Kulturveranstaltungen",
    contribute: "Geschichte, Veranstaltung oder Forschung vorschlagen",
    contributeText: "Vorschläge gelangen in die redaktionelle Inbox und werden vor einer Veröffentlichung geprüft.",
    contributeCta: "Mitwirken",
    emptyStories: "Noch keine Kulturgeschichten veröffentlicht.",
    emptyEvents: "Derzeit sind keine kommenden Kulturveranstaltungen verfügbar.",
    emptyAnalysis: "Noch keine Kulturanalysen veröffentlicht.",
  },
  ar: {
    description: "قصص وفعاليات وأبحاث وصناعات ثقافية وإبداعية تُقرأ من خلال الهجرة والشتات وريادة الأعمال والأقاليم.",
    eyebrow: "مركز الدراسات · الثقافة",
    intro: "مساحة لفهم كيفية تأثير الهجرة والشتات والتنقل الدولي في الإنتاج الثقافي والإبداع وريادة الأعمال والعمل والأقاليم.",
    stories: "قصص وأصوات",
    storiesText: "مقابلات وشهادات وقصص موثقة لأشخاص يعملون بين الثقافة والإبداع والشبكات العابرة للحدود.",
    events: "فعاليات ثقافية",
    eventsText: "مبادرات مقبلة مرتبطة بالثقافة والصناعات الإبداعية والشتات وتحولاتها الاقتصادية والاجتماعية.",
    analysis: "تحليلات وأبحاث",
    analysisText: "دراسات وتقارير وأدلة وتحليلات موثقة حول البعد الثقافي لريادة الأعمال المهاجرة.",
    industries: "الصناعات الثقافية والإبداعية",
    industriesText: "يتابع مركز الدراسات الثقافة أيضاً كمجال اقتصادي: سلاسل القيمة والمهن وريادة الأعمال والأسواق والتنقل الدولي.",
    allAnalysis: "أرشيف الثقافة",
    allEvents: "كل الفعاليات الثقافية",
    contribute: "اقترح قصة أو فعالية أو بحثاً",
    contributeText: "تدخل المقترحات إلى صندوق التحرير وتخضع للتحقق قبل أي نشر.",
    contributeCta: "شارك",
    emptyStories: "لم تُنشر قصص ثقافية بعد.",
    emptyEvents: "لا توجد حالياً فعاليات ثقافية مقبلة متاحة.",
    emptyAnalysis: "لم تُنشر تحليلات ثقافية بعد.",
  },
  zh: {
    description: "从移民、侨民、创业与地域视角观察故事、活动、研究以及文化和创意产业。",
    eyebrow: "研究中心 · 文化",
    intro: "观察移民、侨民和国际流动如何影响文化生产、创意、创业、就业与地域发展的空间。",
    stories: "故事与声音",
    storiesText: "记录活跃于文化、创意和跨国网络中的人物访谈、证言与创业故事。",
    events: "文化活动",
    eventsText: "与文化、创意产业、侨民及其经济和社会转型相关的未来活动。",
    analysis: "分析与研究",
    analysisText: "围绕移民创业的文化维度发布研究、报告、指南与有来源的分析。",
    industries: "文化和创意产业",
    industriesText: "研究中心也将文化视为经济领域：价值链、职业、企业、市场与国际流动。",
    allAnalysis: "文化档案",
    allEvents: "全部文化活动",
    contribute: "推荐故事、活动或研究",
    contributeText: "所有推荐都会进入编辑收件箱，并在发布前接受审核。",
    contributeCta: "参与",
    emptyStories: "尚未发布文化故事。",
    emptyEvents: "目前没有即将举行的文化活动。",
    emptyAnalysis: "尚未发布文化分析。",
  },
} as const;

const creativeFields = [
  "Audiovisual",
  "Publishing",
  "Music",
  "Live performance",
  "Design",
  "Fashion",
  "Artistic crafts",
  "Cultural heritage and services",
] as const;

function isVoice(typeCode: string) {
  return (VOICE_CONTENT_TYPES as readonly string[]).includes(typeCode);
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") {
    return { robots: { index: false, follow: false } };
  }
  const m = messages[locale];
  return {
    title: NAV_MESSAGES[locale].culture,
    description: m.description,
    alternates: {
      canonical: `/${locale}/cultura`,
      languages: languageAlternates("/cultura"),
    },
    ...pageSocialMetadata({
      title: NAV_MESSAGES[locale].culture,
      description: m.description,
      pathname: `/${locale}/cultura`,
    }),
  };
}

export default async function LocalizedCulturePage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();

  const m = messages[locale];
  const core = CORE_MESSAGES[locale];
  const arrow = localizedCtaArrow(locale);
  const [events, contents] = await Promise.all([
    listUpcomingCulturalEvents(6).catch(() => []),
    listCultureContents(18).catch(() => []),
  ]);
  const presented = await presentLocalizedContentCards(contents, locale);
  const stories = presented.filter((item) => isVoice(item.type_code)).slice(0, 6);
  const analysis = presented.filter((item) => !isVoice(item.type_code)).slice(0, 6);
  const hasOriginalLanguageContent = presented.some((item) => !item.isAiTranslation);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{m.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{NAV_MESSAGES[locale].culture}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.intro}</p>
        {hasOriginalLanguageContent ? (
          <p className="mt-3 text-sm leading-6 text-neutral-600">{core.originalLanguageNotice}</p>
        ) : null}
      </header>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold tracking-tight text-black">{m.stories}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{m.storiesText}</p>
        {stories.length === 0 ? (
          <p className="mt-6 border border-black p-6 text-sm text-neutral-600">{m.emptyStories}</p>
        ) : (
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2 lg:grid-cols-3">
            {stories.map((item) => (
              <article key={item.id} className="flex min-h-64 flex-col bg-white p-6">
                <OriginalLanguageText as="h3" languageCode={item.displayLanguageCode} className="text-xl font-semibold leading-7 text-black">{item.title}</OriginalLanguageText>
                {item.abstract ? <OriginalLanguageText languageCode={item.displayLanguageCode} className="mt-4 flex-1 text-sm leading-6 text-neutral-700">{item.abstract}</OriginalLanguageText> : <div className="flex-1" />}
                {item.isAiTranslation ? (
                  <EditorialTranslationNotice
                    locale={locale}
                    sourceLanguageId={item.language_id}
                    displayLanguageCode={item.displayLanguageCode}
                    isAiTranslation
                    isViewingOriginal={false}
                    originalHref={`/${locale}/contenuti/${item.slug}?original=1`}
                    translationHref={`/${locale}/contenuti/${item.slug}`}
                    compact
                  />
                ) : null}
                <Link href={`/${locale}/contenuti/${item.slug}`} className="mt-5 text-sm font-semibold underline underline-offset-4">{m.stories} {arrow}</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 border-t border-black pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-black">{m.events}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{m.eventsText}</p>
          </div>
          <Link href={`/${locale}/eventi`} className="text-sm font-semibold underline underline-offset-4">{m.allEvents} {arrow}</Link>
        </div>
        {events.length === 0 ? (
          <p className="mt-6 border border-black p-6 text-sm text-neutral-600">{m.emptyEvents}</p>
        ) : (
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.id} className="flex min-h-56 flex-col bg-white p-6">
                <OriginalLanguageText as="h3" className="text-xl font-semibold leading-7 text-black">{event.title}</OriginalLanguageText>
                {event.summary ? <OriginalLanguageText className="mt-4 flex-1 text-sm leading-6 text-neutral-700">{event.summary}</OriginalLanguageText> : <div className="flex-1" />}
                {event.next_edition ? <p className="mt-4 text-xs text-neutral-500">{new Date(event.next_edition.starts_at).toLocaleString(locale)}</p> : null}
                <Link href={`/${locale}/eventi/${event.id}`} className="mt-5 text-sm font-semibold underline underline-offset-4">{NAV_MESSAGES[locale].events} {arrow}</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 border-t border-black pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-black">{m.analysis}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{m.analysisText}</p>
          </div>
          <Link href={`/${locale}/contenuti`} className="text-sm font-semibold underline underline-offset-4">{m.allAnalysis} {arrow}</Link>
        </div>
        {analysis.length === 0 ? (
          <p className="mt-6 border border-black p-6 text-sm text-neutral-600">{m.emptyAnalysis}</p>
        ) : (
          <div className="mt-6 grid gap-px border border-black bg-black md:grid-cols-2 lg:grid-cols-3">
            {analysis.map((item) => (
              <article key={item.id} className="flex min-h-64 flex-col bg-white p-6">
                <OriginalLanguageText as="h3" languageCode={item.displayLanguageCode} className="text-xl font-semibold leading-7 text-black">{item.title}</OriginalLanguageText>
                {item.abstract ? <OriginalLanguageText languageCode={item.displayLanguageCode} className="mt-4 flex-1 text-sm leading-6 text-neutral-700">{item.abstract}</OriginalLanguageText> : <div className="flex-1" />}
                {item.isAiTranslation ? (
                  <EditorialTranslationNotice
                    locale={locale}
                    sourceLanguageId={item.language_id}
                    displayLanguageCode={item.displayLanguageCode}
                    isAiTranslation
                    isViewingOriginal={false}
                    originalHref={`/${locale}/contenuti/${item.slug}?original=1`}
                    translationHref={`/${locale}/contenuti/${item.slug}`}
                    compact
                  />
                ) : null}
                <Link href={`/${locale}/contenuti/${item.slug}`} className="mt-5 text-sm font-semibold underline underline-offset-4">{NAV_MESSAGES[locale].analysis} {arrow}</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 border-t border-black pt-10">
        <h2 className="text-3xl font-semibold tracking-tight text-black">{m.industries}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{m.industriesText}</p>
        <div className="mt-6 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-4">
          {creativeFields.map((field) => (
            <div key={field} className="bg-white px-5 py-5 text-sm font-semibold text-black">{field}</div>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-black pt-10">
        <h2 className="text-2xl font-semibold text-black">{m.contribute}</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">{m.contributeText}</p>
        <Link href={`/${locale}/contribuisci`} className="mt-5 inline-block border border-black px-5 py-3 text-sm font-semibold">{m.contributeCta} {arrow}</Link>
      </section>
    </main>
  );
}
