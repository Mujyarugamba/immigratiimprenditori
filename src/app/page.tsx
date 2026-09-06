import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const topics = [
  "Dati verificati",
  "Imprese",
  "Territori",
  "Rotte imprenditoriali",
  "Storie",
  "Ricerca",
  "Politiche",
  "Eventi",
];

const HERO_POSTER_DESKTOP =
  "https://images.pexels.com/photos/34164499/pexels-photo-34164499.jpeg?auto=compress&cs=tinysrgb&w=2000";
const HERO_POSTER_MOBILE =
  "https://images.pexels.com/photos/34164499/pexels-photo-34164499.jpeg?auto=compress&cs=tinysrgb&w=900";

export default function HomeMotionPreviewPage() {
  return (
    <>
      <link rel="preconnect" href="https://images.pexels.com" />
      <link rel="dns-prefetch" href="https://images.pexels.com" />
      <link
        rel="preload"
        as="image"
        href={HERO_POSTER_MOBILE}
        media="(max-width: 640px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={HERO_POSTER_DESKTOP}
        media="(min-width: 641px)"
        fetchPriority="high"
      />
      <link rel="stylesheet" href="/home-light-v1.css" />
      <link rel="stylesheet" href="/home-motion-v3.css" />
      <link rel="stylesheet" href="/home-motion-v4.css" />

      <section className="preview-hero-v4" aria-labelledby="preview-hero-title">
        <div className="preview-v4-media" aria-hidden="true">
          <picture className="preview-v4-poster">
            <source media="(max-width: 640px)" srcSet={HERO_POSTER_MOBILE} />
            <img
              src={HERO_POSTER_DESKTOP}
              alt=""
              width="2000"
              height="1125"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <video
            className="preview-v4-video"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
          >
            <source
              media="(min-width: 641px)"
              src="https://www.pexels.com/download/video/8869632/"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="preview-v4-veil" aria-hidden="true" />

        <div className="preview-v4-meta" aria-hidden="true">
          <span>Osservatorio · Centro Studi</span>
          <span>Dati · Ricerca · Storie · Territori</span>
        </div>

        <div className="preview-v4-payoff">
          <h1 id="preview-hero-title">
            <span className="preview-v4-line preview-v4-line-a">E dal cammino</span>
            <span className="preview-v4-line preview-v4-line-b">
              nasce <em>l&apos;impresa.</em>
            </span>
          </h1>
        </div>

        <div className="site-container preview-v4-bottom">
          <p>
            Studiamo l&apos;imprenditoria migrante attraverso dati verificati,
            ricerca, territori e testimonianze.
          </p>
          <nav className="preview-v4-actions" aria-label="Esplora il Centro Studi">
            <Link href="/osservatorio">Esplora l&apos;Osservatorio →</Link>
            <Link href="/contenuti">Analisi e ricerche →</Link>
          </nav>
        </div>

        <span className="preview-v4-scroll" aria-hidden="true">Scorri ↓</span>
      </section>

      <div className="preview-motion-rail" aria-label="Temi dell'Osservatorio">
        <div className="preview-motion-track">
          {[...topics, ...topics].map((topic, index) => (
            <span
              key={`${topic}-${index}`}
              aria-hidden={index >= topics.length ? "true" : undefined}
            >
              {topic}<b aria-hidden="true">✦</b>
            </span>
          ))}
        </div>
      </div>

      <div className="preview-home-deferred">
        <Suspense fallback={null}>
          <HomePage />
        </Suspense>

        <section className="preview-visual-statement">
          <div className="preview-statement-photo" aria-hidden="true" />
          <div className="preview-statement-copy">
            <p>UN FENOMENO GLOBALE</p>
            <h2>
              Non una sola direzione.
              <em>Un mondo di traiettorie.</em>
            </h2>
            <Link href="/esplora/territori">Esplora territori e rotte →</Link>
          </div>
        </section>
      </div>
    </>
  );
}
