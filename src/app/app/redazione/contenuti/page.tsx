import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { listActiveContentTypes } from "@/lib/data/editorial/catalogs";
import { listEditorialContents } from "@/lib/data/editorial/contents";
import {
  EDITORIAL_STATUS_LABELS,
  label,
  PUBLICATION_STATUS_LABELS,
} from "@/lib/public/labels";

const EDITORIAL_PUBLICATION_LABELS: Record<string, string> = {
  ...PUBLICATION_STATUS_LABELS,
  published: "Pubblicato",
};

export const metadata: Metadata = {
  title: "Contenuti — Redazione",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    stato?: string;
    tipo?: string;
    page?: string;
  }>;
};

export default async function ContenutiRedazionePage({ searchParams }: Props) {
  const params = await searchParams;
  const [result, types] = await Promise.all([
    listEditorialContents(params),
    listActiveContentTypes(),
  ]);
  const items = result.items;
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.stato) qs.set("stato", params.stato);
  if (params.tipo) qs.set("tipo", params.tipo);
  const baseQs = qs.toString();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink text-2xl font-semibold tracking-tight">
            Contenuti editoriali
          </h1>
          <p className="text-ink-muted mt-1 text-sm">
            Contenuti editoriali di piattaforma.
          </p>
        </div>
        <Button href="/app/redazione/contenuti/nuovo" size="sm">
          Nuovo contenuto
        </Button>
      </div>

      <form
        method="get"
        className="border-line bg-surface-elevated mt-6 flex flex-wrap gap-3 rounded-md border p-4 shadow-soft"
      >
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Cerca titolo</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            className="border-line rounded-md border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Stato pubblicazione</span>
          <select
            name="stato"
            defaultValue={params.stato ?? ""}
            className="border-line rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Tutti</option>
            <option value="unpublished">
              {label(PUBLICATION_STATUS_LABELS, "unpublished")}
            </option>
            <option value="published">
              {label(EDITORIAL_PUBLICATION_LABELS, "published")}
            </option>
            <option value="withdrawn">
              {label(PUBLICATION_STATUS_LABELS, "withdrawn")}
            </option>
          </select>
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Tipo</span>
          <select
            name="tipo"
            defaultValue={params.tipo ?? ""}
            className="border-line rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Tutti</option>
            {types.map((t) => (
              <option key={t.code} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="bg-brand text-white self-end rounded-sm px-4 py-2 text-sm font-medium"
        >
          Filtra
        </button>
      </form>

      <div className="table-scroll mt-6">
        <table className="border-line w-full min-w-[700px] border text-left text-sm">
          <thead className="bg-surface-muted text-ink">
            <tr>
              <th className="border-line border px-3 py-2 font-medium">Titolo</th>
              <th className="border-line border px-3 py-2 font-medium">Tipo</th>
              <th className="border-line border px-3 py-2 font-medium">Editoriale</th>
              <th className="border-line border px-3 py-2 font-medium">Pubblicazione</th>
              <th className="border-line border px-3 py-2 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-ink-muted border-line border px-3 py-6 text-center">
                  Nessun contenuto editoriale.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted/50">
                  <td className="border-line border px-3 py-2">
                    <span className="text-ink font-medium">{c.title}</span>
                    <br />
                    <span className="text-ink-subtle text-xs">{c.slug}</span>
                  </td>
                  <td className="border-line border px-3 py-2">{c.type_code}</td>
                  <td className="border-line border px-3 py-2">
                    {label(EDITORIAL_STATUS_LABELS, c.editorial_status)}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {label(EDITORIAL_PUBLICATION_LABELS, c.publication_status)}
                  </td>
                  <td className="border-line border px-3 py-2">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <Link
                        href={`/app/redazione/contenuti/${c.id}`}
                        className="text-brand hover:underline"
                      >
                        Modifica
                      </Link>
                      <Link
                        href={`/contenuti/${encodeURIComponent(c.slug)}`}
                        className="text-brand hover:underline"
                      >
                        Anteprima
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result.pageCount > 1 ? (
        <nav
          className="text-ink-muted mt-4 flex items-center justify-between text-sm"
          aria-label="Paginazione contenuti"
        >
          <span>
            Pagina {result.page} di {result.pageCount} ({result.total} totali)
          </span>
          <div className="flex gap-3">
            {result.page > 1 ? (
              <Link
                href={`/app/redazione/contenuti?${baseQs}${baseQs ? "&" : ""}page=${result.page - 1}`}
                className="text-brand hover:underline"
              >
                Precedente
              </Link>
            ) : null}
            {result.page < result.pageCount ? (
              <Link
                href={`/app/redazione/contenuti?${baseQs}${baseQs ? "&" : ""}page=${result.page + 1}`}
                className="text-brand hover:underline"
              >
                Successiva
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
