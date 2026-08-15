import { PageFrame } from "@immigrati/ui-foundation";
import { centroStudiConfig } from "@immigrati/product-config";

export default function HomePage() {
  return (
    <PageFrame>
      <header className="site-header">
        <a className="wordmark" href="#contenuto">
          {centroStudiConfig.name}
        </a>
        <nav aria-label="Navigazione principale">
          <ul>
            {centroStudiConfig.navigation.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="contenuto" className="hero">
        <p className="eyebrow">Ricerca e divulgazione</p>
        <h1>{centroStudiConfig.name}</h1>
        <p>{centroStudiConfig.description}</p>
        <p className="observatory">L&apos;Osservatorio sarà una futura sezione interna del Centro Studi.</p>
      </main>
    </PageFrame>
  );
}
