import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import {
  listPublicMigrationRoutes,
  listPublicTerritories,
  type PublicMigrationRoute,
  type PublicTerritory,
} from "@/lib/data/public/geography";

export const metadata: Metadata = {
  title: "Territori e rotte",
  description:
    "Territori e relazioni Paese d'origine → Paese di destinazione nell'Osservatorio sull'imprenditoria migrante.",
};

const regionNames = new Intl.DisplayNames(["it"], { type: "region" });

function countryName(code: string | null) {
  if (!code) return "Area sovranazionale";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function routeLabel(route: PublicMigrationRoute) {
  return `${countryName(route.origin_country_code)} → ${countryName(route.destination_country_code)}`;
}

export default async function TerritoriPage() {
  let territories: PublicTerritory[] = [];
  let routes: PublicMigrationRoute[] = [];
  try {
    [territories, routes] = await Promise.all([
      listPublicTerritories(),
      listPublicMigrationRoutes(),
    ]);
  } catch {
    territories = [];
    routes = [];
  }

  return (
    <main id="contenuto" className="pb-16">
      <Container>
        <header className="border-b border-black py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Geografia dell&apos;Osservatorio</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">Territori e rotte</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
            L&apos;imprenditoria migrante non è una geografia a senso unico. Osserviamo sia i territori in cui il fenomeno produce effetti sia le relazioni tra Paese d&apos;origine e Paese di destinazione.
          </p>
        </header>

        <section className="grid gap-8 border-b border-black py-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Rotte imprenditoriali</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Origine → destinazione</h2>
          </div>
          <div>
            {routes.length > 0 ? (
              <div className="divide-y divide-neutral-300 border-t border-black">
                {routes.map((route) => (
                  <div key={route.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline">
                    <p className="font-semibold text-black">{routeLabel(route)}</p>
                    <p className="text-xs uppercase tracking-[0.1em] text-neutral-500">{route.origin_country_code} → {route.destination_country_code}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="max-w-2xl text-sm leading-6 text-neutral-600">
                Le prime rotte saranno attivate quando contenuti, storie o indicatori avranno un collegamento origine-destinazione verificato. Il modello è già globale e non privilegia tecnicamente l&apos;Italia.
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-8 py-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">Territori</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Aree osservate</h2>
          </div>
          <div>
            {territories.length > 0 ? (
              <div className="divide-y divide-neutral-300 border-t border-black">
                {territories.map((territory) => (
                  <div key={territory.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline">
                    <div>
                      <p className="font-semibold text-black">{territory.name}</p>
                      <p className="mt-1 text-xs text-neutral-500">{countryName(territory.country_code)}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.1em] text-neutral-500">{territory.level_kind.replaceAll("_", " ")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="max-w-2xl text-sm leading-6 text-neutral-600">
                Non precarichiamo tutti i comuni e le regioni del mondo. Un territorio entra nel catalogo quando serve a un dato, a una storia, a un rapporto o a un evento dell&apos;Osservatorio.
              </p>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
