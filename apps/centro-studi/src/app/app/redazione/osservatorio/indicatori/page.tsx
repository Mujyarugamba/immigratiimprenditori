import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { listObservatoryIndicators } from "@/lib/data/editorial/observatory";
import { label, PUBLICATION_STATUS_LABELS } from "@/lib/public/labels";

const INDICATOR_OPERATIONAL_LABELS: Record<string, string> = {
  draft: "Bozza",
  active: "Attivo",
  deprecated: "Obsoleto",
  retired: "Ritirato",
};

const EDITORIAL_PUBLICATION_LABELS: Record<string, string> = {
  ...PUBLICATION_STATUS_LABELS,
  published: "Pubblicato",
};

export const metadata: Metadata = {
  title: "Indicatori — Redazione",
};

export default async function IndicatoriRedazionePage() {
  const items = await listObservatoryIndicators();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/app/redazione/osservatorio" className="text-ink-muted hover:text-ink text-sm">
            ← Osservatorio
          </Link>
          <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">Indicatori</h1>
        </div>
        <Button href="/app/redazione/osservatorio/indicatori/nuovo" size="sm">
          Nuovo indicatore
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="border-line w-full min-w-[640px] border text-left text-sm">
          <thead className="bg-surface-muted text-ink">
            <tr>
              <th className="border-line border px-3 py-2 font-medium">Codice / Titolo</th>
              <th className="border-line border px-3 py-2 font-medium">Natura</th>
              <th className="border-line border px-3 py-2 font-medium">Operativo</th>
              <th className="border-line border px-3 py-2 font-medium">Pubblicazione</th>
              <th className="border-line border px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-ink-muted border-line border px-3 py-6 text-center">
                  Nessun indicatore.
                </td>
              </tr>
            ) : (
              items.map((i) => (
                <tr key={i.id}>
                  <td className="border-line border px-3 py-2">
                    <code>{i.code}</code>
                    <br />
                    {i.title}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {i.value_nature} / {i.unit_code}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {label(INDICATOR_OPERATIONAL_LABELS, i.operational_status)}
                  </td>
                  <td className="border-line border px-3 py-2">
                    {label(EDITORIAL_PUBLICATION_LABELS, i.publication_status)}
                  </td>
                  <td className="border-line border px-3 py-2">
                    <Link href={`/app/redazione/osservatorio/indicatori/${i.id}`} className="text-brand hover:underline">
                      Modifica
                    </Link>
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
