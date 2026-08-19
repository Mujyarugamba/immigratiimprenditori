import {
  addContentGeographyAction,
  addContentSectorAction,
  deleteContentGeographyAction,
  deleteContentSectorAction,
} from "@/lib/editorial/context-actions";
import type {
  EditorialContentGeography,
  EditorialContentSector,
} from "@/lib/data/editorial/content-context";

const inputClass =
  "border-line bg-surface-elevated text-ink w-full border px-3 py-2 text-sm outline-none focus:border-black";

const GEO_LABELS: Record<string, string> = {
  focus: "Paese principale",
  origin: "Paese di origine",
  destination: "Paese di attività / destinazione",
  context: "Contesto",
};

export function EditorialContentContextPanel({
  contentId,
  geographies,
  sectors,
  sectorOptions,
}: {
  contentId: string;
  geographies: EditorialContentGeography[];
  sectors: EditorialContentSector[];
  sectorOptions: { id: number; slug: string; label: string }[];
}) {
  return (
    <section className="mt-10 border-t border-black pt-7">
      <div className="max-w-2xl">
        <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
          Contesto editoriale
        </p>
        <h2 className="text-ink mt-2 text-xl font-semibold">
          Geografia e settore
        </h2>
        <p className="text-ink-muted mt-2 text-sm leading-6">
          Per le storie usa, quando pertinenti, Paese di origine e Paese di attività.
          I codici Paese sono ISO a due lettere: IT, US, FR, DE, MA, IN, ecc.
        </p>
      </div>

      <div className="mt-7 grid gap-10 lg:grid-cols-2">
        <div>
          <h3 className="text-ink text-sm font-semibold uppercase tracking-wide">
            Geografie
          </h3>
          {geographies.length > 0 ? (
            <div className="mt-3 divide-y divide-black border-y border-black">
              {geographies.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>
                    <strong>{item.country_code}</strong>
                    <span className="text-ink-muted"> · {GEO_LABELS[item.relation_kind] ?? item.relation_kind}</span>
                  </span>
                  <form action={deleteContentGeographyAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="content_id" value={contentId} />
                    <button type="submit" className="text-xs font-semibold underline underline-offset-4">
                      Elimina
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-muted mt-3 text-sm">Nessuna geografia collegata.</p>
          )}

          <form action={addContentGeographyAction} className="mt-5 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
            <label className="text-ink flex flex-col gap-1 text-sm">
              <span className="font-medium">Paese</span>
              <input
                name="country_code"
                required
                maxLength={2}
                className={inputClass}
                placeholder="IT"
              />
            </label>
            <label className="text-ink flex flex-col gap-1 text-sm">
              <span className="font-medium">Relazione</span>
              <select name="relation_kind" className={inputClass} defaultValue="focus">
                <option value="focus">Paese principale</option>
                <option value="origin">Paese di origine</option>
                <option value="destination">Paese di attività / destinazione</option>
                <option value="context">Contesto</option>
              </select>
            </label>
            <div className="flex items-end">
              <input type="hidden" name="content_id" value={contentId} />
              <button type="submit" className="border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-white hover:text-black">
                Aggiungi
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-ink text-sm font-semibold uppercase tracking-wide">
            Settori economici
          </h3>
          {sectors.length > 0 ? (
            <div className="mt-3 divide-y divide-black border-y border-black">
              {sectors.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>
                    <strong>{item.sector_name}</strong>
                    {item.relation_kind === "related" ? <span className="text-ink-muted"> · correlato</span> : null}
                  </span>
                  <form action={deleteContentSectorAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="content_id" value={contentId} />
                    <button type="submit" className="text-xs font-semibold underline underline-offset-4">
                      Elimina
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-muted mt-3 text-sm">Nessun settore collegato.</p>
          )}

          <form action={addContentSectorAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_130px_auto]">
            <label className="text-ink flex flex-col gap-1 text-sm">
              <span className="font-medium">Settore</span>
              <select name="business_sector_id" required className={inputClass} defaultValue="">
                <option value="" disabled>Seleziona</option>
                {sectorOptions.map((sector) => (
                  <option key={sector.id} value={sector.id}>{sector.label}</option>
                ))}
              </select>
            </label>
            <label className="text-ink flex flex-col gap-1 text-sm">
              <span className="font-medium">Relazione</span>
              <select name="relation_kind" className={inputClass} defaultValue="focus">
                <option value="focus">Principale</option>
                <option value="related">Correlato</option>
              </select>
            </label>
            <div className="flex items-end">
              <input type="hidden" name="content_id" value={contentId} />
              <button type="submit" className="border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-white hover:text-black">
                Aggiungi
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
