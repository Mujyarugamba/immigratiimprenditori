import type { Metadata } from "next";
import Link from "next/link";
import { listPublicIndicators } from "@/lib/data/public/observatory";
import {
  OBSERVATORY_PERIODICITY_LABELS,
  OBSERVATORY_UNIT_LABELS,
  formatItalianDate,
  label,
} from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Osservatorio",
  description:
    "Indicatori, statistiche e fonti sull'imprenditoria migrante, con metodologia e provenienza dichiarate.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OsservatorioPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";
  const result = await listPublicIndicators(params);

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="grid gap-8 border-b border-black pb-10 md:grid-cols-[1.25fr_0.75fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Dati
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
            Osservatorio
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
            Indicatori e serie statistiche per misurare l&apos;imprenditoria migrante.
            Ogni dato pubblicato indica fonte, periodo, qualità, territorio e
            metodologia.
          </p>
        </div>
        <aside className="md:border-l md:border-black md:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Indicatori pubblicati
          </p>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-black">
            {result.total}
          </p>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            L&apos;Osservatorio cresce soltanto quando disponiamo di dati verificabili
            e di una metodologia sufficientemente chiara.
          </p>
        </aside>
      </header>

      <section className="border-b border-black py-7" aria-label="Ricerca indicatori">
        <form method="get" className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="flex flex-col gap-2 text-sm font-medium text-black">
            Cerca negli indicatori
            <input
              name="q"
              defaultValue={q}
              placeholder="Titolo, descrizione o codice"
              className="border border-neutral-400 px-3 py-2.5 font-normal"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-black sm:w-auto"
            >
              Cerca
            </button>
          </div>
        </form>
      </section>

      {result.items.length === 0 ? (
        <section className="py-14">
          <h2 className="text-2xl font-semibold text-black">Nessun indicatore trovato</h2>
          <p className="mt-3 text-neutral-600">
            Prova una ricerca diversa oppure consulta nuovamente l&apos;Osservatorio più avanti.
          </p>
        </section>
      ) : (
        <section className="divide-y divide-black border-b border-black" aria-label="Indicatori pubblicati">
          {result.items.map((indicator) => (
            <article key={indicator.id} className="grid gap-5 py-8 md:grid-cols-[1fr_220px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {indicator.code}
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight text-black">
                  <Link
                    href={`/osservatorio/${indicator.slug}`}
                    className="hover:underline hover:underline-offset-4"
                  >
                    {indicator.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                  {indicator.description}
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs md:grid-cols-1">
                <div>
                  <dt className="uppercase tracking-wide text-neutral-500">Periodicità</dt>
                  <dd className="mt-1 font-medium text-black">
                    {label(OBSERVATORY_PERIODICITY_LABELS, indicator.periodicity)}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-neutral-500">Unità</dt>
                  <dd className="mt-1 font-medium text-black">
                    {label(OBSERVATORY_UNIT_LABELS, indicator.unit_code)}
                  </dd>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <dt className="uppercase tracking-wide text-neutral-500">Aggiornato</dt>
                  <dd className="mt-1 font-medium text-black">
                    {formatItalianDate(indicator.updated_at)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      )}

      {result.pageCount > 1 ? (
        <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Paginazione indicatori">
          <span className="text-neutral-500">Pagina {result.page} di {result.pageCount}</span>
          <div className="flex gap-5">
            {result.page > 1 ? (
              <Link href={`/osservatorio?page=${result.page - 1}`} className="underline underline-offset-4">
                Precedente
              </Link>
            ) : null}
            {result.page < result.pageCount ? (
              <Link href={`/osservatorio?page=${result.page + 1}`} className="underline underline-offset-4">
                Successiva
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}

      <aside className="mt-12 border-t border-black pt-8">
        <p className="max-w-3xl text-sm leading-6 text-neutral-600">
          I numeri non vengono pubblicati senza provenienza. Nelle schede degli
          indicatori trovi la fonte statistica, il periodo di riferimento, lo stato
          del valore, la qualità dichiarata e le note metodologiche disponibili.
        </p>
      </aside>
    </main>
  );
}
