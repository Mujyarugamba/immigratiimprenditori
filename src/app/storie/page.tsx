import type { Metadata } from "next";
import Link from "next/link";
import { listPublicStories } from "@/lib/data/public/stories";
import { formatItalianDate, label, CONTENT_TYPES } from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Storie e interviste",
  description:
    "Storie, interviste e testimonianze sull'imprenditoria migrante nel mondo.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const storyTypeOptions = [
  ["", "Tutte"],
  ["interview", "Interviste"],
  ["business_story", "Storie d'impresa"],
  ["testimony", "Testimonianze"],
  ["personal_story", "Storie personali"],
] as const;

export default async function StoriePage({ searchParams }: Props) {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "";
  const tipo = Array.isArray(params.tipo)
    ? params.tipo[0] ?? ""
    : params.tipo ?? "";
  const result = await listPublicStories(params);

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="grid gap-8 border-b border-black pb-10 md:grid-cols-[1.25fr_0.75fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Voci
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
            Storie e interviste
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
            Le persone dietro i numeri: imprenditori, ricercatori, istituzioni e
            comunità raccontano come le migrazioni generano impresa, relazioni e
            trasformazioni economiche.
          </p>
        </div>
        <aside className="md:border-l md:border-black md:pl-8">
          <h2 className="text-lg font-semibold text-black">Una voce da ascoltare?</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Puoi proporre una storia o un&apos;intervista alla redazione. Non serve un
            account e nessun materiale viene pubblicato automaticamente.
          </p>
          <Link
            href="/contribuisci"
            className="mt-5 inline-block border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-black"
          >
            Racconta una storia
          </Link>
        </aside>
      </header>

      <section className="border-b border-black py-7" aria-label="Filtri storie e interviste">
        <form className="grid gap-4 sm:grid-cols-[1fr_220px_auto]" method="get">
          <label className="flex flex-col gap-2 text-sm font-medium text-black">
            Cerca
            <input
              name="q"
              defaultValue={q}
              placeholder="Titolo o sintesi"
              className="border border-neutral-400 px-3 py-2.5 font-normal"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-black">
            Formato
            <select
              name="tipo"
              defaultValue={tipo}
              className="border border-neutral-400 bg-white px-3 py-2.5 font-normal"
            >
              {storyTypeOptions.map(([value, text]) => (
                <option key={value || "all"} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-black sm:w-auto"
            >
              Filtra
            </button>
          </div>
        </form>
      </section>

      {result.items.length === 0 ? (
        <section className="py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Archivio in costruzione
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-black">
            Stiamo preparando le prime storie dell&apos;Osservatorio.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-neutral-600">
            Questa sezione pubblicherà soltanto interviste e testimonianze curate
            dalla redazione. Se conosci un imprenditore o un&apos;esperienza che merita
            di essere documentata, puoi segnalarcela.
          </p>
          <Link
            href="/contribuisci"
            className="mt-6 inline-block text-sm font-semibold text-black underline underline-offset-4"
          >
            Proponi una storia o un&apos;intervista
          </Link>
        </section>
      ) : (
        <>
          <section className="grid border-b border-black md:grid-cols-2" aria-label="Archivio storie e interviste">
            {result.items.map((item, index) => (
              <article
                key={item.id}
                className={`py-8 ${index % 2 === 1 ? "md:border-l md:border-black md:pl-8" : "md:pr-8"} ${index >= 2 ? "border-t border-black" : ""}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {label(CONTENT_TYPES, item.type_code)}
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight text-black">
                  <Link href={`/storie/${item.slug}`} className="hover:underline hover:underline-offset-4">
                    {item.title}
                  </Link>
                </h2>
                {item.abstract ? (
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{item.abstract}</p>
                ) : null}
                {item.published_at ? (
                  <p className="mt-4 text-xs text-neutral-500">
                    {formatItalianDate(item.published_at)}
                  </p>
                ) : null}
              </article>
            ))}
          </section>

          {result.pageCount > 1 ? (
            <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Paginazione storie">
              <span className="text-neutral-500">
                Pagina {result.page} di {result.pageCount}
              </span>
              <div className="flex gap-5">
                {result.page > 1 ? (
                  <Link href={`/storie?page=${result.page - 1}`} className="underline underline-offset-4">Precedente</Link>
                ) : null}
                {result.page < result.pageCount ? (
                  <Link href={`/storie?page=${result.page + 1}`} className="underline underline-offset-4">Successiva</Link>
                ) : null}
              </div>
            </nav>
          ) : null}
        </>
      )}
    </main>
  );
}
