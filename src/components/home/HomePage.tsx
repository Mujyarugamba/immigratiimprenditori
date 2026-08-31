import Link from "next/link";
import {
  getPublicIndicatorBySlug,
  listHomeIndicators,
  type PublicIndicatorDetail,
} from "@/lib/data/public/observatory";
import {
  listHomeContents,
  type PublicContentListItem,
} from "@/lib/data/public/contents";
import {
  listHomeEvents,
  type PublicEventListItem,
} from "@/lib/data/public/events";
import { formatTrendPeriodBounds } from "@/lib/home/mini-trend-period";

const typeLabels: Record<string, string> = {
  analysis: "Analisi",
  article: "Analisi",
  insight: "Approfondimento",
  data_note: "Nota dati",
  policy_brief: "Policy brief",
  institutional_page: "Documento istituzionale",
  report: "Rapporto",
  research: "Ricerca",
  research_report: "Rapporto di ricerca",
  interview: "Intervista",
  business_story: "Storia d'impresa",
  testimony: "Testimonianza",
  personal_story: "Storia",
  guide: "Guida",
  video: "Video",
  podcast: "Podcast",
};

const RESEARCH_TYPES = new Set([
  "report",
  "research",
  "research_report",
  "policy_brief",
  "data_note",
]);

const STORY_TYPES = new Set([
  "interview",
  "business_story",
  "testimony",
  "personal_story",
]);

const HOME_MEDIA = {
  milan:
    "https://images.pexels.com/photos/36835318/pexels-photo-36835318.jpeg?auto=compress&cs=tinysrgb&w=2200",
  meeting:
    "https://images.pexels.com/photos/7647955/pexels-photo-7647955.jpeg?auto=compress&cs=tinysrgb&w=1600",
  data:
    "https://images.pexels.com/photos/6248987/pexels-photo-6248987.jpeg?auto=compress&cs=tinysrgb&w=1600",
  business:
    "https://images.pexels.com/photos/7857526/pexels-photo-7857526.jpeg?auto=compress&cs=tinysrgb&w=1400",
  event:
    "https://images.pexels.com/photos/38111334/pexels-photo-38111334.jpeg?auto=compress&cs=tinysrgb&w=1400",
} as const;

const topicAreas = [
  {
    title: "Economia & imprese",
    text: "Struttura, crescita, settori e traiettorie dell'imprenditoria immigrata.",
    href: "/contenuti",
    tone: "blue",
  },
  {
    title: "Dati & Osservatorio",
    text: "Indicatori verificabili, serie storiche, territori, fonti e metodologia.",
    href: "/osservatorio",
    tone: "teal",
  },
  {
    title: "Storie & interviste",
    text: "Esperienze imprenditoriali e professionali documentate dalla redazione.",
    href: "/storie",
    tone: "orange",
  },
  {
    title: "Territori & reti",
    text: "Geografie economiche, comunità, connessioni e opportunità locali.",
    href: "/esplora",
    tone: "burgundy",
  },
  {
    title: "Cultura",
    text: "Idee, identità, linguaggi e trasformazioni che accompagnano l'impresa.",
    href: "/cultura",
    tone: "violet",
  },
  {
    title: "Eventi & confronto",
    text: "Convegni, incontri e occasioni pubbliche per mettere in circolo conoscenza.",
    href: "/eventi",
    tone: "gold",
  },
] as const;

async function safeLoad<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

function contentLabel(item: PublicContentListItem) {
  return typeLabels[item.type_code] ?? "Approfondimento";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMetric(value: number) {
  return new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function formatMetricUnit(indicator: PublicIndicatorDetail) {
  switch (indicator.unit_code) {
    case "percent":
      return "%";
    case "eur":
      return "euro";
    case "eur_thousands":
      return "migliaia di euro";
    case "ratio":
      return "rapporto";
    case "index_points":
      return "punti indice";
    case "units":
      return "unità";
    default:
      return indicator.unit_code || "valore indicatore";
  }
}

function metricContext(value: PublicIndicatorDetail["values"][number]) {
  return [value.territory_label, value.country_label].filter(Boolean).join(" · ");
}

function imageStyle(url: string | null | undefined) {
  if (!url) return undefined;
  return {
    backgroundImage: `url("${url.replaceAll('"', "%22")}")`,
  };
}

function scopeKey(value: PublicIndicatorDetail["values"][number]) {
  return [
    value.territory_level ?? "",
    value.territory_code ?? "",
    value.country_code ?? "",
    value.territory_label ?? "",
    value.country_label ?? "",
  ].join("|");
}

function comparableSeries(indicator: PublicIndicatorDetail | undefined) {
  if (!indicator?.values.length) return [];
  const latest = indicator.values[0];
  const key = scopeKey(latest);
  return indicator.values
    .filter((value) => scopeKey(value) === key)
    .sort(
      (a, b) =>
        new Date(a.period_start).getTime() - new Date(b.period_start).getTime(),
    );
}

function MiniTrend({
  indicator,
}: {
  indicator: PublicIndicatorDetail | undefined;
}) {
  const series = comparableSeries(indicator);
  if (series.length < 2) {
    return (
      <div className="home-chart-empty">
        <span>Serie storica non disponibile per questa selezione</span>
      </div>
    );
  }

  const values = series.map((item) => item.numeric_value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = series
    .map((item, index) => {
      const x = (index / Math.max(series.length - 1, 1)) * 100;
      const y = 88 - ((item.numeric_value - min) / range) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  const first = series[0];
  const last = series[series.length - 1];
  const [firstPeriodLabel, lastPeriodLabel] = formatTrendPeriodBounds(
    first.period_start,
    last.period_start,
  );

  return (
    <div className="home-chart">
      <div className="home-chart-head">
        <div>
          <p className="eyebrow">Trend in evidenza</p>
          <h3>{indicator?.title}</h3>
        </div>
        <Link href={`/osservatorio/${indicator?.slug}`}>Vedi il dato →</Link>
      </div>
      <svg
        className="home-chart-svg"
        viewBox="0 0 100 100"
        role="img"
        aria-label={`Andamento di ${indicator?.title ?? "indicatore"}`}
        preserveAspectRatio="none"
      >
        <line x1="0" y1="88" x2="100" y2="88" className="chart-axis" />
        <polyline points={points} className="chart-line" />
        {points.split(" ").map((point, index) => {
          const [cx, cy] = point.split(",");
          return (
            <circle
              key={`${cx}-${cy}-${index}`}
              cx={cx}
              cy={cy}
              r="1.8"
              className="chart-dot"
            />
          );
        })}
      </svg>
      <div className="home-chart-foot">
        <span>{firstPeriodLabel}</span>
        <span>
          {last.source_name ? `Fonte: ${last.source_name}` : "Fonte nella scheda indicatore"}
        </span>
        <span>{lastPeriodLabel}</span>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [contents, indicators, events] = await Promise.all([
    safeLoad(() => listHomeContents(16), [] as PublicContentListItem[]),
    safeLoad(() => listHomeIndicators(4), []),
    safeLoad(() => listHomeEvents(2), [] as PublicEventListItem[]),
  ]);

  const indicatorDetails = await Promise.all(
    indicators.map((indicator) =>
      safeLoad(() => getPublicIndicatorBySlug(indicator.slug), null),
    ),
  );

  const metrics = indicatorDetails.filter(
    (item): item is PublicIndicatorDetail => Boolean(item?.values.length),
  );

  const researchFeature = contents.find((item) => RESEARCH_TYPES.has(item.type_code));
  const heroFeature = researchFeature ?? contents[0];
  const storyContents = contents.filter((item) => STORY_TYPES.has(item.type_code)).slice(0, 4);
  const storyFeature = storyContents[0];
  const excludedIds = new Set(
    [heroFeature?.id, storyFeature?.id].filter((id): id is string => Boolean(id)),
  );
  const analysisFeature = contents.find(
    (item) =>
      !excludedIds.has(item.id) &&
      !RESEARCH_TYPES.has(item.type_code) &&
      !STORY_TYPES.has(item.type_code),
  );
  if (analysisFeature) excludedIds.add(analysisFeature.id);
  const recentFeature = contents.find((item) => !excludedIds.has(item.id));
  const featuredContents = [analysisFeature, storyFeature, recentFeature].filter(
    (item): item is PublicContentListItem => Boolean(item),
  );

  const firstEvent = events[0];
  const firstEventContext =
    firstEvent?.next_edition?.city_text ??
    firstEvent?.external_organization_label ??
    null;
  const trendIndicator =
    metrics.find((indicator) => comparableSeries(indicator).length >= 2) ??
    metrics[0];
  const featuredFallbacks = [HOME_MEDIA.meeting, HOME_MEDIA.business, HOME_MEDIA.event];

  return (
    <main id="contenuto" className="home-page home-v2">
      <section className="home-hero home-hero-v2">
        <div
          className="home-hero-media"
          style={imageStyle(HOME_MEDIA.milan)}
          aria-hidden="true"
        />
        <div className="home-hero-overlay" />
        <div className="site-container home-hero-inner">
          <div className="home-hero-copy">
            <p className="hero-kicker">Centro Studi AIPEL · Immigrati Imprenditori</p>
            <h1>
              Idee, dati e opportunità per chi <span>fa impresa tra mondi diversi.</span>
            </h1>
            <p className="hero-intro">
              Analisi, ricerca, storie e strumenti per capire e valorizzare il contributo
              economico, sociale e culturale dell&apos;imprenditoria immigrata in Italia.
            </p>
            <div className="hero-actions">
              <Link href="/contenuti" className="button button-gold">
                Esplora le analisi <span aria-hidden="true">→</span>
              </Link>
              <Link href="/sostieni" className="button button-ghost">
                Sostieni il Centro Studi
              </Link>
            </div>
          </div>

          <article className="hero-feature hero-feature-v2">
            <p className="eyebrow eyebrow-gold">
              {heroFeature ? contentLabel(heroFeature) : "Ricerca in evidenza"}
            </p>
            <h2>
              {heroFeature?.title ?? "Un Centro Studi per leggere l'economia che cambia"}
            </h2>
            <p>
              {heroFeature?.abstract ??
                "Dati verificati, fonti documentate e prospettive diverse per costruire conoscenza pubblica sull'imprenditoria immigrata."}
            </p>
            <Link href={heroFeature ? `/contenuti/${heroFeature.slug}` : "/ricerca"}>
              {heroFeature ? "Apri l'approfondimento" : "Scopri la ricerca"} →
            </Link>
          </article>
        </div>
        <div className="home-hero-credit" aria-hidden="true">Milano · immagine editoriale</div>
      </section>

      <section className="home-trust-strip" aria-label="Ambiti del Centro Studi">
        <div className="site-container home-trust-inner">
          <span>Ricerca</span>
          <span>Dati</span>
          <span>Analisi</span>
          <span>Storie</span>
          <span>Cultura</span>
          <span>Eventi</span>
        </div>
      </section>

      <section className="home-featured home-featured-v2">
        <div className="site-container">
          <div className="section-heading-editorial">
            <div>
              <p className="eyebrow">Conoscenza che circola</p>
              <h2>In evidenza</h2>
            </div>
            <Link href="/contenuti">Tutti i contenuti →</Link>
          </div>

          <div className="featured-grid featured-grid-v2">
            {featuredContents.map((item, index) => (
              <article key={item.id} className={`editorial-card editorial-card-v2 ${index === 0 ? "editorial-card-lead" : ""}`}>
                <div
                  className="editorial-card-media has-image"
                  style={imageStyle(item.cover_url ?? featuredFallbacks[index % featuredFallbacks.length])}
                  aria-hidden="true"
                />
                <div className="editorial-card-body">
                  <p className="eyebrow">{contentLabel(item)}</p>
                  <h3>
                    <Link href={`/contenuti/${item.slug}`}>{item.title}</Link>
                  </h3>
                  {item.abstract ? <p>{item.abstract}</p> : null}
                  <div className="editorial-card-meta">
                    <span>{formatDate(item.published_at)}</span>
                    <Link href={`/contenuti/${item.slug}`}>Leggi →</Link>
                  </div>
                </div>
              </article>
            ))}

            {firstEvent ? (
              <article className="editorial-card editorial-card-event editorial-card-v2">
                <div className="editorial-event-media" style={imageStyle(HOME_MEDIA.event)} aria-hidden="true" />
                <div className="editorial-card-body">
                  <p className="eyebrow">Evento</p>
                  <h3>
                    <Link href={`/eventi/${firstEvent.id}`}>{firstEvent.title}</Link>
                  </h3>
                  {firstEvent.summary ? <p>{firstEvent.summary}</p> : null}
                  <div className="event-date-block">
                    <span>{formatDate(firstEvent.next_edition?.starts_at)}</span>
                    {firstEventContext ? <span>{firstEventContext}</span> : null}
                  </div>
                  <Link href={`/eventi/${firstEvent.id}`} className="card-link">
                    Scopri l&apos;evento →
                  </Link>
                </div>
              </article>
            ) : (
              <article className="editorial-card editorial-card-event editorial-card-v2">
                <div className="editorial-event-media" style={imageStyle(HOME_MEDIA.event)} aria-hidden="true" />
                <div className="editorial-card-body">
                  <p className="eyebrow">Eventi</p>
                  <h3>Conversazioni pubbliche, incontri e nuove connessioni.</h3>
                  <p>Il calendario raccoglie soltanto iniziative qualificate e già pubblicate.</p>
                  <Link href="/eventi" className="card-link">Apri il calendario →</Link>
                </div>
              </article>
            )}
          </div>

          {featuredContents.length === 0 ? (
            <div className="featured-empty">
              <p className="eyebrow">Contenuti recenti</p>
              <h3>Nessun contenuto disponibile in questa selezione.</h3>
              <p>Consulta Analisi e ricerche per esplorare il materiale pubblicato dal Centro Studi.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="home-topics-section">
        <div className="site-container">
          <div className="section-heading-editorial section-heading-dark">
            <div>
              <p className="eyebrow">Aree di lavoro</p>
              <h2>Sei porte per leggere il cambiamento.</h2>
            </div>
            <p>
              Un sistema editoriale chiaro: ogni area ha una propria identità, tutte convergono nella stessa missione di ricerca.
            </p>
          </div>
          <div className="home-topic-grid">
            {topicAreas.map((area, index) => (
              <Link key={area.title} href={area.href} className={`home-topic-card tone-${area.tone}`}>
                <span className="topic-index">0{index + 1}</span>
                <div>
                  <h3>{area.title}</h3>
                  <p>{area.text}</p>
                </div>
                <span className="topic-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="metrics-section metrics-section-v2">
        <div className="site-container metrics-layout">
          <div className="metrics-intro">
            <p className="eyebrow">Osservatorio</p>
            <h2>Numeri per capire, non per decorare.</h2>
            <p>Ogni indicatore rimanda a fonte, periodo, territorio e metodologia.</p>
            <Link href="/osservatorio" className="button button-outline-light">
              Esplora tutti i dati →
            </Link>
          </div>

          <div className="metrics-grid">
            {metrics.slice(0, 4).map((indicator) => {
              const latest = indicator.values[0];
              const context = metricContext(latest);
              return (
                <article key={indicator.id} className="metric-card">
                  <p>{indicator.title}</p>
                  <strong>{formatMetric(latest.numeric_value)}</strong>
                  <span className="metric-unit">{formatMetricUnit(indicator)}</span>
                  <span className="metric-source">
                    {new Date(latest.period_start).getFullYear()}
                    {context ? ` · ${context}` : ""}
                    {latest.source_name ? ` · ${latest.source_name}` : ""}
                  </span>
                </article>
              );
            })}

            {metrics.length === 0 ? (
              <div className="metrics-empty">Nessun indicatore disponibile in questa selezione.</div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="data-stories-section data-stories-v2">
        <div className="site-container data-stories-grid">
          <div className="data-visual-panel">
            <div className="data-visual-image" style={imageStyle(HOME_MEDIA.data)} aria-hidden="true" />
            <MiniTrend indicator={trendIndicator} />
          </div>

          <div className="voices-panel voices-panel-v2">
            <div className="voices-copy">
              <p className="eyebrow eyebrow-gold">Persone, non categorie</p>
              <h2>Le voci dell&apos;imprenditoria immigrata.</h2>
              <p>
                Esperienze individuali collegate a origine, destinazione, territorio,
                settore, ostacoli, innovazione e impatto.
              </p>
              <Link href="/storie">Leggi le storie →</Link>
            </div>
            <div className="voices-grid">
              {storyContents.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/contenuti/${item.slug}`}
                  className="voice-tile has-image"
                  style={imageStyle(item.cover_url ?? (index % 2 === 0 ? HOME_MEDIA.meeting : HOME_MEDIA.business))}
                  aria-label={item.title}
                >
                  <span>{item.title}</span>
                </Link>
              ))}
              {storyContents.length === 0 ? (
                <div className="voices-placeholder voices-placeholder-photo" style={imageStyle(HOME_MEDIA.meeting)}>
                  <span>Storie e interviste saranno mostrate qui appena pubblicate dalla redazione.</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="support-band support-band-v2">
        <div className="site-container support-grid">
          <div className="support-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="support-copy">
            <p className="eyebrow">AIPEL · Centro Studi</p>
            <h2>Sostieni una ricerca indipendente, accessibile e utile.</h2>
            <p>
              Il tuo contributo sostiene dati, analisi, interviste, rapporti, eventi e produzione editoriale.
            </p>
            <Link href="/sostieni" className="button support-primary">
              Sostieni il Centro Studi →
            </Link>
          </div>
          <div className="support-details">
            <div>
              <span className="support-label">Bonifico bancario</span>
              <strong>AIPEL</strong>
              <p>Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia</p>
            </div>
            <dl>
              <div>
                <dt>IBAN</dt>
                <dd>IT77 Y368 8801 6001 0000 0119 423</dd>
              </div>
              <div>
                <dt>BIC / SWIFT</dt>
                <dd>SUMUITM2XXX</dd>
              </div>
              <div>
                <dt>Istituto</dt>
                <dd>SumUp Limited – Filiale Italiana</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="contribute-section contribute-section-v2">
        <div className="site-container contribute-grid">
          <div>
            <p className="eyebrow">Partecipa</p>
            <h2>La ricerca può partire da una storia, un evento o una segnalazione.</h2>
          </div>
          <div>
            <p>
              Puoi proporre un&apos;intervista, segnalare un evento, una ricerca o un rapporto.
              Ogni materiale viene verificato e valutato prima della pubblicazione.
            </p>
            <div className="contribute-actions">
              <Link href="/contribuisci" className="button contribute-primary">
                Invia una proposta →
              </Link>
              <Link href="/fonti" className="contribute-method-link">
                Fonti e metodologia →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
