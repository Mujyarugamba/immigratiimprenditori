import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-shell">
            <Image
              src="/brand/immigrati-imprenditori-logo.png"
              alt="Immigrati Imprenditori"
              width={300}
              height={100}
              className="footer-logo"
            />
          </div>
          <p>
            Osservatorio e Centro Studi AIPEL dedicato all&apos;imprenditoria
            migrante, alle sue traiettorie economiche e alle persone che la
            costruiscono.
          </p>
          <p className="footer-small">
            Associazione degli Imprenditori e Liberi Professionisti
            Extracomunitari in Lombardia (AIPEL).
          </p>
        </div>

        <div>
          <h2>Naviga</h2>
          <Link href="/osservatorio">Osservatorio</Link>
          <Link href="/contenuti">Analisi e ricerche</Link>
          <Link href="/eventi">Eventi</Link>
          <Link href="/dati-e-fonti">Fonti e metodologia</Link>
          <Link href="/contribuisci">Contribuisci</Link>
        </div>

        <div>
          <h2>Il Centro</h2>
          <Link href="/chi-siamo">Chi siamo</Link>
          <Link href="/politica-editoriale">Politica editoriale</Link>
          <Link href="/sostieni">Sostieni l&apos;Osservatorio</Link>
          <a href="mailto:info@aipel.it">Contatti</a>
        </div>

        <div>
          <h2>Trasparenza</h2>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookie">Cookie</Link>
          <Link href="/termini">Termini</Link>
          <p className="footer-small">
            Viale Molise 54, Milano
            <br />
            CF 97342380157 · P.IVA 04222160964
          </p>
        </div>
      </div>

      <div className="site-container footer-bottom">
        <span>© 2026 Immigrati Imprenditori · Centro Studi AIPEL</span>
        <span>Ricerca · dati · persone</span>
      </div>
    </footer>
  );
}
