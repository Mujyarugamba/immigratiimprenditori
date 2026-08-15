import { PageFrame } from "@immigrati/ui-foundation";
import { ponteImpreseConfig } from "@immigrati/product-config";

export default function HomePage() {
  return (
    <PageFrame>
      <header className="site-header">
        <a className="wordmark" href="#contenuto">
          {ponteImpreseConfig.name}
        </a>
        <nav aria-label="Navigazione principale">
          <ul>
            {ponteImpreseConfig.navigation.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="contenuto" className="hero">
        <p className="eyebrow">Piattaforma B2B</p>
        <h1>{ponteImpreseConfig.name}</h1>
        <p>{ponteImpreseConfig.description}</p>
        <p className="status">Shell iniziale W1: funzioni e contenuti saranno trasferiti nelle wave successive.</p>
      </main>
    </PageFrame>
  );
}
