import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { listEditorialOrganizations } from "@/lib/data/editorial/organizations";

export const metadata: Metadata = {
  title: "Organizzazioni — Redazione",
};

export default async function OrganizzazioniRedazionePage() {
  const items = await listEditorialOrganizations();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink text-2xl font-semibold tracking-tight">
            Organizzazioni editoriali
          </h1>
          <p className="text-ink-muted mt-1 text-sm">
            Schede con <code>owned_by_editorial=true</code>.
          </p>
        </div>
        <Button href="/app/redazione/organizzazioni/nuovo" size="sm">
          Nuova organizzazione
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="border-line w-full min-w-[640px] border text-left text-sm">
          <thead className="bg-surface-muted text-ink">
            <tr>
              <th className="border-line border px-3 py-2 font-medium">Nome</th>
              <th className="border-line border px-3 py-2 font-medium">Tipo</th>
              <th className="border-line border px-3 py-2 font-medium">Editoriale</th>
              <th className="border-line border px-3 py-2 font-medium">Pubblicazione</th>
              <th className="border-line border px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-ink-muted border-line border px-3 py-6 text-center">
                  Nessuna organizzazione.
                </td>
              </tr>
            ) : (
              items.map((o) => (
                <tr key={o.id}>
                  <td className="border-line border px-3 py-2">
                    {o.name}
                    <br />
                    <span className="text-ink-subtle text-xs">{o.slug}</span>
                  </td>
                  <td className="border-line border px-3 py-2">{o.type_code}</td>
                  <td className="border-line border px-3 py-2">{o.editorial_status}</td>
                  <td className="border-line border px-3 py-2">{o.publication_status}</td>
                  <td className="border-line border px-3 py-2">
                    <Link href={`/app/redazione/organizzazioni/${o.id}`} className="text-brand hover:underline">
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
