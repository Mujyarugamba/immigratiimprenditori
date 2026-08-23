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
        <span>{new Date(first.period_start).getFullYear()}</span>
        <span>
          {last.source_name ? `Fonte: ${last.source_name}` : "Fonte nella scheda indicatore"}
        </span>
        <span>{new Date(last.period_start).getFullYear()}</span>
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

  return (
    <main id="contenuto" className="home-page">
      <section
        className={`home-hero ${heroFeature?.cover_url ? "has-cover" : ""}`}
        style={imageStyle(heroFeature?.cover_url)}
      >
        <div className="home-hero-overlay" />
        <div className="site-container home-hero-inner">
          <div className="home-hero-copy">
            <p className="hero-kicker">Dati. Analisi. Voci.</p>
            <h1>
              Studiare l&apos;imprenditoria migrante,
              <br />
              <span>in ogni direzione.</span>
            </h1>
            <p className="hero-intro">
              Dati verificati, ricerca e testimonianze per capire come persone e
              imprese si muovono, si radicano e creano valore tra Paesi,
              territori e settori economici.
            </p>
            <div className="hero-actions">
              <Link href="/osservatorio" className="button button-gold">
                Esplora l&apos;Osservatorio <span aria-hidden="true">→</span>
              </Link>
              <Link href="/chi-siamo" className="button button-ghost">
                Chi siamo
              </Link>
            </div>
          </div>

          <article className="hero-feature">
            <p className="eyebrow eyebrow-gold">
              {heroFeature ? contentLabel(heroFeature) : "Rapporti e ricerche"}
            </p>
            <h2>
              {heroFeature?.title ?? "La biblioteca di studi e rapporti del Centro Studi"}
            </h2>
            <p>
              {heroFeature?.abstract ??
                "Rapporti, ricerche e analisi selezionate per documentare l'imprenditoria migrante con fonti verificabili."}
            </p>
            <Link href={heroFeature ? `/contenuti/${heroFeature.slug}` : "/ricerca"}>
              {heroFeature ? "Apri lo studio" : "Esplora rapporti e ricerche"} →
            </Link>
          </article>
        </div>
      </section>

      <section className="home-featured">
        <div className="site-container">
          <div className="section-heading-line">
            <h2>In evidenza</h2>
            <Link href="/contenuti">Vedi tutti →</Link>
          </div>
          <div className="featured-grid">
            {featuredContents.map((item) => (
              <article key={item.id} className="editorial-card">
                <div
                  className={`editorial-card-media ${item.cover_url ? "has-image" : ""}`}
                  style={imageStyle(item.cover_url)}
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
              <article className="editorial-card editorial-card-event">
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
              <article className="editorial-card editorial-card-event">
                <div className="editorial-card-body">
                  <p className="eyebrow">Eventi</p>
                  <h3>Nessun evento pubblico in evidenza</h3>
                  <p>Il calendario mostra soltanto iniziative qualificate e già pubblicate.</p>
                  <Link href="/eventi" className="card-link">Apri il calendario →</Link>
                </div>
              </article>
            )}

            {featuredContents.length === 0 ? (
              <div className="featured-empty">
                <p className="eyebrow">Contenuti recenti</p>
                <h3>Nessun contenuto disponibile in questa selezione.</h3>
                <p>Consulta Analisi e ricerche per esplorare il materiale pubblicato dal Centro Studi.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="metrics-section">
        <div className="site-container metrics-layout">
          <div className="metrics-intro">
            <p className="eyebrow">Osservatorio</p>
            <h2>I numeri chiave</h2>
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

      <section className="data-stories-section">
        <div className="site-container data-stories-grid">
          <MiniTrend indicator={trendIndicator} />

          <div className="voices-panel">
            <div className="voices-copy">
              <p className="eyebrow eyebrow-gold">Storie e interviste</p>
              <h2>Le voci dell&apos;imprenditoria migrante.</h2>
              <p>
                Esperienze individuali collegate a origine, destinazione,
                territorio, settore, ostacoli, innovazione e impatto.
              </p>
              <Link href="/storie">Leggi le storie →</Link>
            </div>
            <div className="voices-grid">
              {storyContents.map((item) => (
                <Link
                  key={item.id}
                  href={`/contenuti/${item.slug}`}
                  className={`voice-tile ${item.cover_url ? "has-image" : ""}`}
                  style={imageStyle(item.cover_url)}
                  aria-label={item.title}
                >
                  <span>{item.title}</span>
                </Link>
              ))}
              {storyContents.length === 0 ? (
                <div className="voices-placeholder">
                  Nessuna storia o intervista è ancora pubblicata in questa selezione. La redazione non sostituisce contenuti mancanti con materiale generico.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="contribute-section">
        <div className="site-container contribute-grid">
          <div>
            <p className="eyebrow">Contribuisci al Centro Studi</p>
            <h2>Una ricerca può partire anche da una storia, un evento o una segnalazione.</h2>
          </div>
          <div>
            <p>
              Puoi raccontare una storia, proporre un&apos;intervista, segnalare un evento,
              una ricerca o un rapporto. Il materiale entra nella Inbox redazionale:
              viene verificato e valutato prima di qualsiasi pubblicazione.
            </p>
            <div className="contribute-actions">
              <Link href="/contribuisci" className="button contribute-primary">
                Invia una proposta →
              </Link>
              <Link href="/fonti" className="contribute-method-link">
                Consulta fonti e metodologia →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
