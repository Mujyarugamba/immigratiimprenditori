import Link from "next/link";

const HERO_IMAGE =
  "https://images.pexels.com/photos/36835318/pexels-photo-36835318.jpeg?auto=compress&cs=tinysrgb&w=2200";

export default function HomeHeroShell() {
  return (
    <section className="home-hero home-hero-v2">
      <div
        className="home-hero-media"
        style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
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
          <p className="eyebrow eyebrow-gold">Ricerca in evidenza</p>
          <h2>Un Centro Studi per leggere l&apos;economia che cambia</h2>
          <p>
            Dati verificati, fonti documentate e prospettive diverse per costruire
            conoscenza pubblica sull&apos;imprenditoria immigrata.
          </p>
          <Link href="/ricerca">Scopri la ricerca →</Link>
        </article>
      </div>
      <div className="home-hero-credit" aria-hidden="true">
        Milano · immagine editoriale
      </div>
    </section>
  );
}
