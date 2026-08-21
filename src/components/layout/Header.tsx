import Link from "next/link";

const mainNav = [
  { label: "Ricerche e dati", href: "/osservatorio" },
  { label: "Analisi", href: "/contenuti" },
  { label: "Eventi", href: "/eventi" },
  { label: "Fonti e metodologia", href: "/dati-e-fonti" },
  { label: "Contribuisci", href: "/contribuisci" },
] as const;

export function Header() {
  return (
    <header className="site-header">
      <div className="institutional-bar">
        <div className="site-container institutional-bar-inner">
          <p>Centro Studi e Osservatorio sull&apos;imprenditoria migrante</p>
          <nav aria-label="Link istituzionali">
            <Link href="/chi-siamo">Chi siamo</Link>
            <Link href="/politica-editoriale">Politica editoriale</Link>
            <Link href="/accedi">Accedi</Link>
          </nav>
        </div>
      </div>

      <div className="primary-header">
        <div className="site-container primary-header-inner">
          <Link href="/" className="brand-link" aria-label="Immigrati Imprenditori - Home">
            <img
              src="/brand/immigrati-imprenditori-logo.png"
              alt="Immigrati Imprenditori"
              width="360"
              height="120"
              className="brand-logo"
            />
          </Link>

          <nav aria-label="Navigazione principale" className="primary-nav">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/sostieni" className="header-support">
            Sostieni
          </Link>
        </div>
      </div>
    </header>
  );
}
