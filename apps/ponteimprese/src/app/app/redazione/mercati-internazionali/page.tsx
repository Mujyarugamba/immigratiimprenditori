import type { Metadata } from "next";
import Link from "next/link";
import { listEditorialMarketResources } from "@/lib/data/editorial/markets";
import { formatItalianDateTime } from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Mercati internazionali — Redazione",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(
  v: string | string[] | undefined,
): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const CLASS_LABELS: Record<string, string> = {
  review: "Da revisionare",
  published: "Pubblicata",
  questionable: "Dubbia",
  rejected: "Esclusa",
};

export default async function MercatiInternazionaliRedazionePage({
  searchParams,
}: Props) {
  const sp = await searchParams;
  const params = {
    q: first(sp.q),
    stato: first(sp.stato) ?? "review",
    page: first(sp.page),
  };
  const result = await listEditorialMarketResources(params);

  return (
    <div>
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Mercati internazionali
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Coda di revisione per indicatori World Bank (M1). Nessuna
        pubblicazione automatica. ICE resta link-only.
      </p>

      <form className="mt-6 flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="block">
          <span className="text-ink-muted">Cerca</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            className="border-line mt-1 block rounded-md border px-2 py-1.5"
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Stato</span>
          <select
            name="stato"
            defaultValue={params.stato ?? "review"}
            className="border-line mt-1 block rounded-md border px-2 py-1.5"
          >
            <option value="review">Da revisionare</option>
            <option value="published">Pubblicate</option>
            <option value="rejected">Escluse</option>
            <option value="">Tutte</option>
          </select>
        </label>
        <button
          type="submit"
          className="bg-brand text-brand-fg rounded-md px-3 py-1.5 text-sm font-medium"
        >
          Filtra
        </button>
      </form>

      <p className="text-ink-muted mt-4 text-xs">
        {result.total} risorse · pagina {result.page}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="border-line w-full min-w-[960px] border text-left text-sm">
          <thead className="bg-surface-muted text-ink">
            <tr>
              <th className="border-line border px-3 py-2 font-medium">Paese</th>
              <th className="border-line border px-3 py-2 font-medium">
                Indicatore
              </th>
              <th className="border-line border px-3 py-2 font-medium">
                Periodo
              </th>
              <th className="border-line border px-3 py-2 font-medium">Valore</th>
              <th className="border-line border px-3 py-2 font-medium">Unità</th>
              <th className="border-line border px-3 py-2 font-medium">Fonte</th>
              <th className="border-line border px-3 py-2 font-medium">Stato</th>
              <th className="border-line border px-3 py-2 font-medium">
                Aggiornato
              </th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="border-line text-ink-muted border px-3 py-6 text-center"
                >
                  Nessuna risorsa in questa coda.
                </td>
              </tr>
            ) : (
              result.items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-muted/50">
                  <td className="border-line border px-3 py-2">
                    <Link
                      href={`/app/redazione/mercati-internazionali/${item.id}`}
                      className="text-brand hover:underline"
                    >
                      {item.countryLabel}
                    </Link>
                  </td>
                  <td className="border-line border px-3 py-2">
                    <Link
                      href={`/app/redazione/mercati-internazionali/${item.id}`}
                      className="text-ink hover:underline"
                    >
                      {item.indicatorLabel}
                    </Link>
                    {item.indicatorCode ? (
                      <span className="text-ink-muted mt-0.5 block font-mono text-xs">
                        {item.indicatorCode}
                      </span>
                    ) : null}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {item.periodYear ?? "—"}
                  </td>
                  <td className="border-line border px-3 py-2 tabular-nums">
                    {item.valueDisplay}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {item.unit ?? "—"}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {item.sourceLabel}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {CLASS_LABELS[item.editorialClass] ?? item.editorialClass}
                  </td>
                  <td className="border-line border px-3 py-2 text-xs">
                    {formatItalianDateTime(item.updated_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
