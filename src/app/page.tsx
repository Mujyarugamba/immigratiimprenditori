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
  report: "Rapporto",
  research: "Ricerca",
  interview: "Intervista",
  business_story: "Storia d'impresa",
  testimony: "Testimonianza",
  personal_story: "Storia",
  guide: "Guida",
  video: "Video",
  podcast: "Podcast",
};

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
        <span>Serie storica in aggiornamento</span>
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
    safeLoad(() => listHomeContents(8), [] as PublicContentListItem[]),
    safeLoad(() => listHomeIndicators(4), []),
    safeLoad(() => listHomeEvents(2), [] as PublicEventListItem[]),
  ]);

  const indicatorDetails = await Promise.all(
    indicators.map((indicator) =>
      safeLoad(
        () => getPublicIndicatorBySlug(indicator.slug),
        null,
      ),
    ),
  );

  const metrics = indicatorDetails.filter(
    (item): item is PublicIndicatorDetail => Boolean(item?.values.length),
  );
  const hero = contents[0];
  const featuredContents = contents.slice(1, 4);
  const storyContents = contents.slice(4, 8);
  const firstEvent = events[0];
  const trendIndicator =
    metrics.find((indicator) => comparableSeries(indicator).length >= 2) ??
    metrics[0];

  return (
    <main id="contenuto" className="home-page">
      <section
        className={`home-hero ${hero?.cover_url ? "has-cover" : ""}`}
        style={imageStyle(hero?.cover_url)}
      >
        <div className="home-hero-overlay" />
        <div className="site-container home-hero-inner">
          <div className="home-hero-copy">
            <p className="hero-kicker">Conoscenza. Dati. Persone.</p>
            <h1>
              Migrazioni legali e imprenditoria
              <br />
              per una società <span>inclusiva</span>
              <br />
              e competitiva.
            </h1>
            <p className="hero-intro">
              Ricerca indipendente, dati verificati e testimonianze per capire
              come l&apos;imprenditoria migrante trasforma economie, territori e
              relazioni tra Paesi.
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
              {hero ? contentLabel(hero) : "Centro Studi AIPEL"}
            </p>
            <h2>
              {hero?.title ??
                "Dati, analisi e voci sull'imprenditoria migrante"}
            </h2>
            <p>
              {hero?.abstract ??
                "Un osservatorio internazionale per leggere i fenomeni economici senza perdere le storie delle persone."}
            </p>
            <Link href={hero ? `/contenuti/${hero.slug}` : "/contenuti"}>
              {hero ? "Leggi l'approfondimento" : "Scopri le ricerche"} →
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
                    <Link href={`/eventi/${firstEvent.id}`}>
                      {firstEvent.title}
                    </Link>
                  </h3>
                  {firstEvent.summary ? <p>{firstEvent.summary}</p> : null}
                  <div className="event-date-block">
                    <span>
                      {formatDate(firstEvent.next_edition?.starts_at)}
                    </span>
                    <span>
                      {firstEvent.next_edition?.city_text ??
                        firstEvent.external_organization_label ??
                        "Evento online / sede da consultare"}
                    </span>
                  </div>
                  <Link href={`/eventi/${firstEvent.id}`} className="card-link">
                    Scopri l&apos;evento →
                  </Link>
                </div>
              </article>
            ) : null}

            {featuredContents.length === 0 && !firstEvent ? (
              <div className="featured-empty">
                <p className="eyebrow">Numero zero in preparazione</p>
                <h3>Le prossime ricerche appariranno qui.</h3>
                <p>
                  La home è già collegata alla redazione: appena un contenuto
                  viene pubblicato, entra automaticamente nell&apos;impaginazione.
                </p>
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
            <p>
              Ogni indicatore rimanda a fonte, periodo, territorio e metodologia.
            </p>
            <Link href="/osservatorio" className="button button-outline-light">
              Esplora tutti i dati →
            </Link>
          </div>

          <div className="metrics-grid">
            {metrics.slice(0, 4).map((indicator) => {
              const latest = indicator.values[0];
              return (
                <article key={indicator.id} className="metric-card">
                  <p>{indicator.title}</p>
                  <strong>{formatMetric(latest.numeric_value)}</strong>
                  <span className="metric-unit">
                    {indicator.unit_code || "valore indicatore"}
                  </span>
                  <span className="metric-source">
                    {new Date(latest.period_start).getFullYear()}
                    {latest.source_name ? ` · ${latest.source_name}` : ""}
                  </span>
                </article>
              );
            })}

            {metrics.length === 0 ? (
              <div className="metrics-empty">
                Gli indicatori pubblicati dall&apos;Osservatorio compariranno qui
                automaticamente.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="data-stories-section">
        <div className="site-container data-stories-grid">
          <MiniTrend indicator={trendIndicator} />

          <div className="voices-panel">
            <div className="voices-copy">
              <p className="eyebrow eyebrow-gold">Storie e voci</p>
              <h2>Persone, idee, imprese.</h2>
              <p>
                Le esperienze individuali completano i numeri: origini,
                destinazioni, settori, ostacoli, innovazione e impatto.
              </p>
              <Link href="/contenuti">Leggi le storie →</Link>
            </div>
            <div className="voices-grid">
              {storyContents.slice(0, 4).map((item) => (
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
                  Foto, video e interviste entreranno qui man mano che la redazione
                  li pubblica.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="support-band">
        <div className="site-container support-grid">
          <div className="support-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="support-copy">
            <p className="eyebrow">Sostieni l&apos;Osservatorio</p>
            <h2>La ricerca indipendente ha bisogno di continuità.</h2>
            <p>
              Il sostegno contribuisce a ricerca, raccolta e verifica dei dati,
              interviste, rapporti e produzione audiovisiva.
            </p>
            <Link href="/sostieni" className="button button-gold">
              Sostieni il Centro Studi →
            </Link>
          </div>
          <div className="principles-grid">
            <div>
              <strong>Indipendenza</strong>
              <span>Contenuti separati da sostegni e partnership.</span>
            </div>
            <div>
              <strong>Metodo</strong>
              <span>Fonti, limiti e aggiornamenti visibili.</span>
            </div>
            <div>
              <strong>Persone</strong>
              <span>Dati e testimonianze nello stesso progetto.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
