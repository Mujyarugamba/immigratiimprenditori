import type { Metadata } from "next";
import Link from "next/link";
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

export default function HomeMotionPreviewPage() {
  return (
    <>
      <link rel="stylesheet" href="/home-light-v1.css" />
      <link rel="stylesheet" href="/home-motion-v3.css" />
      <link rel="stylesheet" href="/home-motion-v4.css" />

      <section className="preview-hero-v4" aria-labelledby="preview-hero-title">
        <div className="preview-v4-media" aria-hidden="true">
          <img
            className="preview-v4-mobile-poster"
            src="https://images.pexels.com/photos/34164499/pexels-photo-34164499.jpeg?auto=compress&cs=tinysrgb&w=500"
            alt=""
            width={500}
            height={819}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
          <video
            className="preview-v4-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
          >
            <source
              src="https://www.pexels.com/download/video/8869632/"
              type="video/mp4"
              media="(min-width: 641px)"
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

      <HomePage />

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
    </>
  );
}
