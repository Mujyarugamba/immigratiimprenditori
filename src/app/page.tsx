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

      <section className="preview-hero-v3" aria-labelledby="preview-hero-title">
        <div className="preview-hero-media" aria-hidden="true">
          <video
            className="preview-hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.pexels.com/photos/34164499/pexels-photo-34164499.jpeg?auto=compress&cs=tinysrgb&w=2000"
            tabIndex={-1}
          >
            <source
              src="https://www.pexels.com/download/video/8869632/"
              type="video/mp4"
            />
          </video>
          <div className="preview-media-labels">
            <span>Persone</span>
            <span>Imprese</span>
            <span>Territori</span>
          </div>
        </div>

        <div className="preview-coral-square" aria-hidden="true" />

        <div className="site-container preview-hero-layout">
          <div className="preview-hero-copy">
            <p className="preview-kicker">Osservatorio • Centro Studi</p>
            <h1 id="preview-hero-title">
              L&apos;impresa
              <em>si muove.</em>
              Noi la studiamo.
            </h1>
            <p>
              Dati verificati, ricerca e testimonianze per capire come persone e
              imprese attraversano Paesi, territori e settori economici.
            </p>
            <div className="preview-hero-actions">
              <Link href="/osservatorio" className="preview-primary">
                Esplora i dati →
              </Link>
              <Link href="/contenuti" className="preview-secondary">
                Analisi e ricerche
              </Link>
            </div>
          </div>

          <aside className="preview-hero-card">
            <span>IN EVIDENZA</span>
            <strong>Dati + persone.</strong>
            <p>
              Numeri leggibili, fonti verificabili e le voci di chi costruisce
              impresa attraverso confini, settori e territori.
            </p>
            <Link href="/storie">Esplora le storie →</Link>
          </aside>
        </div>
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
          <Link href="/territori">Esplora territori e rotte →</Link>
        </div>
      </section>
    </>
  );
}
