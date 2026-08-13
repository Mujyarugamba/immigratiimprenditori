import type { Metadata } from "next";
import Link from "next/link";
import { listEditorialOpportunities } from "@/lib/data/editorial/opportunities";
import { formatItalianDate, formatItalianDateTime, label } from "@/lib/public/labels";
import { TEMPORAL_LABELS_IT } from "@/lib/opportunities/temporal-label";

export const metadata: Metadata = {
  title: "Opportunità — Redazione",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(
  v: string | string[] | undefined,
): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const EDITORIAL_LABELS: Record<string, string> = {
  draft: "Bozza",
  in_review: "Da revisionare",
  approved: "Approvata",
  rejected: "Respinta",
};

const PUBLICATION_LABELS: Record<string, string> = {
  unpublished: "Non pubblicata",
  scheduled: "Programmata",
  published: "Pubblicata",
  withdrawn: "Ritirata",
};

export default async function OpportunitaRedazionePage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = {
    q: first(sp.q),
    stato: first(sp.stato) ?? "review",
    origine: first(sp.origine),
    temporale: first(sp.temporale),
    page: first(sp.page),
  };
  const result = await listEditorialOpportunities(params);

  return (
    <div>
      <h1 className="text-ink text-2xl font-semibold tracking-tight">
        Opportunità
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Coda di revisione per opportunità esterne (es. Incentivi.gov) e schede
        della rete. Nessuna pubblicazione automatica.
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
            <option value="withdrawn">Ritirate</option>
            <option value="">Tutte</option>
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Origine</span>
          <select
            name="origine"
            defaultValue={params.origine ?? ""}
            className="border-line mt-1 block rounded-md border px-2 py-1.5"
          >
            <option value="">Tutte</option>
            <option value="external">Da fonte esterna</option>
            <option value="internal">Creata nella rete</option>
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Stato temporale</span>
          <select
            name="temporale"
            defaultValue={params.temporale ?? ""}
            className="border-line mt-1 block rounded-md border px-2 py-1.5"
          >
            <option value="">Tutti</option>
            {Object.entries(TEMPORAL_LABELS_IT).map(([code, lab]) => (
              <option key={code} value={code}>
                {lab}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="bg-brand text-brand-fg rounded-md px-3 py-1.5 text-sm font-medium"
        >
          Filtra
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="border-line w-full min-w-[960px] border text-left text-sm">
          <thead className="bg-surface-muted text-ink">
            <tr>
              <th className="border-line border px-3 py-2 font-medium">Titolo</th>
              <th className="border-line border px-3 py-2 font-medium">Fonte</th>
              <th className="border-line border px-3 py-2 font-medium">Ente</th>
              <th className="border-line border px-3 py-2 font-medium">Territorio</th>
              <th className="border-line border px-3 py-2 font-medium">Apertura</th>
              <th className="border-line border px-3 py-2 font-medium">Scadenza</th>
              <th className="border-line border px-3 py-2 font-medium">Temporale</th>
              <th className="border-line border px-3 py-2 font-medium">Acquisizione</th>
              <th className="border-line border px-3 py-2 font-medium">Editoriale</th>
              <th className="border-line border px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="text-ink-muted border-line border px-3 py-6 text-center"
                >
                  Nessuna opportunità in questa vista.
                </td>
              </tr>
            ) : (
              result.items.map((item) => (
                <tr key={item.id}>
                  <td className="border-line border px-3 py-2">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-ink-muted text-xs">
                      {item.origin === "external"
                        ? "Da fonte esterna"
                        : "Creata nella rete"}{" "}
                      · {label(PUBLICATION_LABELS, item.publication_status)}
                    </div>
                  </td>
                  <td className="border-line border px-3 py-2">{item.sourceLabel}</td>
                  <td className="border-line border px-3 py-2">
                    {item.authority ?? "—"}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {item.territory ?? "—"}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {item.opensAt ? formatItalianDate(item.opensAt) : "—"}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {item.openEnded
                      ? "Senza scadenza"
                      : item.closesAt
                        ? formatItalianDate(item.closesAt)
                        : "—"}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {item.temporalLabel}
                  </td>
                  <td className="border-line border px-3 py-2 text-xs">
                    {item.consultedAt
                      ? formatItalianDateTime(item.consultedAt)
                      : "—"}
                    {item.sourceUpdatedAt ? (
                      <>
                        <br />
                        Fonte: {formatItalianDateTime(item.sourceUpdatedAt)}
                      </>
                    ) : null}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {label(EDITORIAL_LABELS, item.editorial_status)}
                  </td>
                  <td className="border-line border px-3 py-2 space-y-1">
                    <Link
                      href={`/app/redazione/opportunita/${item.id}`}
                      className="text-brand block hover:underline"
                    >
                      Apri
                    </Link>
                    {item.officialUrl ? (
                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-muted block text-xs hover:underline"
                      >
                        Fonte ufficiale
                      </a>
                    ) : null}
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
