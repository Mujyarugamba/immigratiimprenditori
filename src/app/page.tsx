import { PageFrame } from "@immigrati/ui-foundation";
import { centroStudiConfig } from "@immigrati/product-config";
import { csPrimaryNav } from "@/data/cs-navigation";
import Link from "next/link";

const pillars = [
  {
    title: "Dati",
    text: "Indicatori, statistiche, territori e settori per misurare l'imprenditoria migrante.",
    href: "/osservatorio",
  },
  {
    title: "Analisi",
    text: "Ricerche, approfondimenti, politiche e fonti per interpretare i fenomeni economici.",
    href: "/contenuti",
  },
  {
    title: "Voci",
    text: "Storie, interviste e testimonianze di chi fa impresa fuori dal proprio Paese d'origine.",
    href: "/storie",
  },
] as const;

export default function HomePage() {
  return (
    <PageFrame>
      <main id="contenuto" className="mx-auto max-w-5xl py-12 sm:py-16">
        <header className="max-w-4xl border-b border-black pb-10">
          <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.16em]">
            Osservatorio e Centro Studi
          </p>
          <h1 className="text-ink mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {centroStudiConfig.name}
          </h1>
          <p className="text-ink mt-5 max-w-3xl text-xl leading-8">
            Osservatorio sull&apos;imprenditoria migrante.
          </p>
          <p className="text-ink-muted mt-4 max-w-3xl text-base leading-7">
            Studiamo, misuriamo e raccontiamo le persone che fanno impresa fuori
            dal proprio Paese d&apos;origine e il contributo economico, sociale e
            culturale che producono nei territori in cui vivono e lavorano.
          </p>

          <nav className="mt-8" aria-label="Sezioni principali">
            <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
              {csPrimaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <section className="grid border-b border-black md:grid-cols-3" aria-labelledby="pilastri-heading">
          <h2 id="pilastri-heading" className="sr-only">
            I tre pilastri dell&apos;Osservatorio
          </h2>
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className={`py-8 md:px-6 ${index > 0 ? "border-t border-black md:border-l md:border-t-0" : ""} ${index === 0 ? "md:pl-0" : ""}`}
            >
              <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
                0{index + 1}
              </p>
              <h3 className="text-ink mt-2 text-2xl font-semibold">{pillar.title}</h3>
              <p className="text-ink-muted mt-3 text-sm leading-6">{pillar.text}</p>
              <Link
                href={pillar.href}
                className="text-ink mt-5 inline-block text-sm font-medium underline underline-offset-4"
              >
                Approfondisci
              </Link>
            </article>
          ))}
        </section>

        <section className="grid gap-8 border-b border-black py-10 md:grid-cols-[1.2fr_0.8fr]" aria-labelledby="voci-heading">
          <div>
            <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
              Le voci dell&apos;imprenditoria migrante
            </p>
            <h2 id="voci-heading" className="text-ink mt-3 text-3xl font-semibold tracking-tight">
              Una storia può diventare una fonte.
            </h2>
            <p className="text-ink-muted mt-4 max-w-2xl leading-7">
              Interviste e testimonianze sono parte centrale dell&apos;Osservatorio:
              non soltanto storie di successo, ma anche ostacoli, fallimenti,
              accesso al credito, passaggi generazionali, relazioni tra Paesi e
              impatto sulle comunità.
            </p>
            <Link
              href="/storie"
              className="text-ink mt-5 inline-block text-sm font-semibold underline underline-offset-4"
            >
              Esplora storie e interviste
            </Link>
          </div>
          <div className="md:border-l md:border-black md:pl-8">
            <h3 className="text-ink text-lg font-semibold">Conosci una storia?</h3>
            <p className="text-ink-muted mt-2 text-sm leading-6">
              Imprenditori, ricercatori, associazioni e cittadini possono proporre
              una testimonianza, un&apos;intervista, un evento o una ricerca. Non serve
              registrarsi e nulla viene pubblicato automaticamente.
            </p>
            <Link
              href="/contribuisci"
              className="mt-5 inline-block border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-black"
            >
              Contribuisci all&apos;Osservatorio
            </Link>
          </div>
        </section>

        <section className="py-8">
          <p className="text-ink-muted max-w-3xl text-sm leading-6">
            {centroStudiConfig.description}
          </p>
        </section>
      </main>
    </PageFrame>
  );
}
