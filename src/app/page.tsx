import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function HomePageShell() {
  return (
    <main id="contenuto" className="home-page">
      <section className="home-hero">
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
            <p className="eyebrow eyebrow-gold">Rapporti e ricerche</p>
            <h2>La biblioteca di studi e rapporti del Centro Studi</h2>
            <p>
              Rapporti, ricerche e analisi selezionate per documentare
              l&apos;imprenditoria migrante con fonti verificabili.
            </p>
            <Link href="/ricerca">Esplora rapporti e ricerche →</Link>
          </article>
        </div>
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<HomePageShell />}>
      <HomePage />
    </Suspense>
  );
}
