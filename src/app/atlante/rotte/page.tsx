import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedRouteSummaries } from "@/lib/data/public/routes";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";
import { breadcrumbStructuredData } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const routes = await listPublishedRouteSummaries().catch(() => []);
  const hasRoutes = routes.length > 0;
  const title = "Rotte imprenditoriali | Atlante";
  const description =
    "Rotte origine-destinazione documentate con dati, analisi, storie o eventi verificati dal Centro Studi Immigrati Imprenditori.";
  return {
    title,
    description,
    alternates: { canonical: "/atlante/rotte" },
    robots: hasRoutes ? { index: true, follow: true } : { index: false, follow: true },
    ...pageSocialMetadata({
      title,
      description,
      pathname: "/atlante/rotte",
    }),
  };
}

export default async function AtlasRoutesPage() {
  const routes = await listPublishedRouteSummaries();
  const breadcrumbSchema = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Atlante", path: "/atlante" },
    { name: "Rotte imprenditoriali", path: "/atlante/rotte" },
  ]);

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mb-6">
        <Link href="/atlante" className="text-sm font-semibold underline underline-offset-4">
          ← Torna all&apos;Atlante
        </Link>
      </div>

      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Atlante · Origine → destinazione
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Rotte imprenditoriali
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Le rotte collegano un Paese di origine a un Paese di destinazione. Una rotta entra nell&apos;Atlante
          soltanto quando esiste almeno un&apos;evidenza pubblicata: dato, analisi, storia o evento.
          Le definizioni statistiche restano quelle della fonte e non vengono uniformate artificialmente.
        </p>
      </header>

      {routes.length > 0 ? (
        <section className="mt-10">
          <div className="grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((item) => (
              <article key={item.route.id} className="bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {item.route.origin.code} → {item.route.destination.code}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-black">
                  <Link href={`/atlante/rotte/${item.route.slug}`}>
                    {item.route.origin.name} → {item.route.destination.name}
                  </Link>
                </h2>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-neutral-500">Indicatori</dt>
                    <dd className="mt-1 text-lg font-semibold text-black">{item.indicatorCount}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Valori dati</dt>
                    <dd className="mt-1 text-lg font-semibold text-black">{item.dataValueCount}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Analisi / storie</dt>
                    <dd className="mt-1 text-lg font-semibold text-black">{item.contentCount}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Eventi</dt>
                    <dd className="mt-1 text-lg font-semibold text-black">{item.eventCount}</dd>
                  </div>
                </dl>
                <Link
                  href={`/atlante/rotte/${item.route.slug}`}
                  className="mt-6 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  Apri la rotta →
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-10 border border-black p-6" aria-live="polite">
          <p className="max-w-3xl text-base leading-7 text-neutral-700">
            Le rotte non vengono esposte pubblicamente finché non dispongono di evidenze verificabili.
          </p>
        </section>
      )}
    </main>
  );
}
