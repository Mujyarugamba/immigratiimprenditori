import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-shell">
            <img
              src="/logo-immigrati-imprenditori.png"
              alt="Immigrati Imprenditori"
              width="300"
              height="100"
              className="footer-logo"
            />
          </div>
          <p>
            Centro Studi AIPEL dedicato all&apos;imprenditoria migrante, alle sue
            traiettorie economiche e alle persone che la costruiscono.
          </p>
        </div>

        <div>
          <h2>Esplora</h2>
          <Link href="/osservatorio">Osservatorio</Link>
          <Link href="/esplora/dati">Data Explorer</Link>
          <Link href="/esplora/territori">Territori</Link>
          <Link href="/esplora/settori">Settori</Link>
          <Link href="/open-data">Open data</Link>
        </div>

        <div>
          <h2>Il Centro</h2>
          <Link href="/contenuti">Analisi e ricerche</Link>
          <Link href="/eventi">Eventi</Link>
          <Link href="/contribuisci">Partecipa</Link>
          <Link href="/chi-siamo">Chi siamo</Link>
          <Link href="/sostieni">Sostieni il Centro Studi</Link>
          <a href="mailto:info@immigratiimprenditori.it">Contatti</a>
        </div>

        <div>
          <h2>Metodo e trasparenza</h2>
          <Link href="/dati-e-fonti">Fonti e metodologia</Link>
          <Link href="/glossario">Glossario</Link>
          <Link href="/politica-editoriale">Politica editoriale</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookie">Cookie</Link>
          <Link href="/termini">Termini</Link>
          <a href="/feed.xml">RSS</a>
        </div>
      </div>

      <div className="site-container footer-bottom">
        <span>© 2026 Immigrati Imprenditori · Centro Studi AIPEL</span>
        <span>Ricerca · dati · persone</span>
      </div>
    </footer>
  );
}
