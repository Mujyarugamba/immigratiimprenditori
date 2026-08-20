import type { Metadata } from "next";
import Link from "next/link";
import { listActiveEventTypes } from "@/lib/data/editorial/catalogs";
import { listEditorialEvents } from "@/lib/data/editorial/events";
import {
  EDITORIAL_STATUS_LABELS,
  EVENT_TYPES,
  formatItalianDateTime,
  label,
  PUBLICATION_STATUS_LABELS,
} from "@/lib/public/labels";

const EDITORIAL_PUBLICATION_LABELS: Record<string, string> = {
  ...PUBLICATION_STATUS_LABELS,
  published: "Pubblicato",
};

export const metadata: Metadata = {
  title: "Eventi — Redazione",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    stato?: string;
    fonte?: string;
    tipo?: string;
    page?: string;
  }>;
};

export default async function EventiRedazionePage({ searchParams }: Props) {
  const params = await searchParams;
  const [result, types] = await Promise.all([
    listEditorialEvents(params),
    listActiveEventTypes(),
  ]);
  const items = result.items;
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.stato) qs.set("stato", params.stato);
  if (params.fonte) qs.set("fonte", params.fonte);
  if (params.tipo) qs.set("tipo", params.tipo);
  const baseQs = qs.toString();

  return (
    <div>
      <div>
        <h1 className="text-ink text-2xl font-semibold tracking-tight">
          Eventi in redazione
        </h1>
        <p className="text-ink-muted mt-1 text-sm">
          Revisione e pubblicazione esplicita di eventi curati dalla redazione.
          Nessuna auto-pubblicazione.
        </p>
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
          <span className="font-medium">Fonte</span>
          <input
            name="fonte"
            defaultValue={params.fonte ?? ""}
            placeholder="codice fonte"
            className="border-line rounded-md border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-ink flex flex-col gap-1 text-sm">
          <span className="font-medium">Tipologia</span>
          <select
            name="tipo"
            defaultValue={params.tipo ?? ""}
            className="border-line rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Tutte</option>
            {types.map((t) => (
              <option key={t.code} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="bg-brand text-brand-fg rounded-md px-4 py-2 text-sm font-medium"
          >
            Filtra
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-ink-muted mt-8 text-sm">
          Nessun evento in coda di redazione. L&apos;import da fonti esterne
          richiede un GO dedicato; questa area è pronta per la revisione.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-line overflow-hidden rounded-md border">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-surface-elevated flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <Link
                  href={`/app/redazione/eventi/${item.id}`}
                  className="text-brand hover:underline font-medium"
                >
                  {item.title}
                </Link>
                <p className="text-ink-muted mt-1 text-xs">
                  {label(EVENT_TYPES, item.type_code)} ·{" "}
                  {label(EDITORIAL_STATUS_LABELS, item.editorial_status)} /{" "}
                  {label(
                    EDITORIAL_PUBLICATION_LABELS,
                    item.publication_status,
                  )}
                  {item.external_source_code
                    ? ` · ${item.external_source_code}`
                    : ""}
                  {item.next_starts_at
                    ? ` · ${formatItalianDateTime(item.next_starts_at)}`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/app/redazione/eventi/${item.id}`}
                  className="text-brand hover:underline"
                >
                  Modifica
                </Link>
                <Link
                  href={`/eventi/${encodeURIComponent(item.id)}`}
                  className="text-brand hover:underline"
                >
                  Anteprima
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {result.pageCount > 1 ? (
        <div className="mt-6 flex gap-3 text-sm">
          {result.page > 1 ? (
            <Link
              href={`/app/redazione/eventi?${baseQs}${baseQs ? "&" : ""}page=${result.page - 1}`}
              className="text-brand hover:underline"
            >
              ← Precedente
            </Link>
          ) : null}
          {result.page < result.pageCount ? (
            <Link
              href={`/app/redazione/eventi?${baseQs}${baseQs ? "&" : ""}page=${result.page + 1}`}
              className="text-brand hover:underline"
            >
              Successiva →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
