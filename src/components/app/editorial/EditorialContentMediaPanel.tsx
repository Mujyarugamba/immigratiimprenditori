import {
  addContentMediaAction,
  deleteContentMediaAction,
} from "@/lib/editorial/media-actions";
import type { EditorialContentMedia } from "@/lib/data/editorial/content-media";

const inputClass =
  "border-line bg-surface-elevated text-ink w-full border px-3 py-2 text-sm outline-none focus:border-black";

export function EditorialContentMediaPanel({
  contentId,
  media,
}: {
  contentId: string;
  media: EditorialContentMedia[];
}) {
  return (
    <section className="mt-10 border-t border-black pt-7">
      <div className="max-w-2xl">
        <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
          Video e materiali
        </p>
        <h2 className="text-ink mt-2 text-xl font-semibold">
          Media del contenuto
        </h2>
        <p className="text-ink-muted mt-2 text-sm leading-6">
          Per YouTube inserisci l&apos;ID del video; il sito pubblico usa il dominio
          privacy-enhanced `youtube-nocookie.com`. Per documenti, audio o altri
          materiali usa solo URL HTTPS.
        </p>
      </div>

      {media.length > 0 ? (
        <div className="mt-6 divide-y divide-black border-y border-black">
          {media.map((item) => (
            <div key={item.id} className="grid gap-4 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <p className="text-ink text-sm font-semibold">
                  {item.title ?? `${item.media_kind} · ${item.provider ?? "esterno"}`}
                  {item.is_primary ? " · Principale" : ""}
                </p>
                <p className="text-ink-muted mt-1 break-all text-xs">
                  {item.provider === "youtube" && item.external_id
                    ? `YouTube ID: ${item.external_id}`
                    : item.url ?? item.external_id ?? "—"}
                </p>
                {item.caption ? (
                  <p className="text-ink-muted mt-2 text-sm leading-6">{item.caption}</p>
                ) : null}
              </div>
              <form action={deleteContentMediaAction}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="content_id" value={contentId} />
                <button
                  type="submit"
                  className="border border-black px-3 py-1.5 text-xs font-semibold text-black hover:bg-black hover:text-white"
                >
                  Elimina
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ink-muted mt-5 text-sm">Nessun media collegato.</p>
      )}

      <form action={addContentMediaAction} className="mt-7 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="content_id" value={contentId} />

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Tipo media</span>
          <select name="media_kind" required className={inputClass} defaultValue="video">
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="image">Immagine</option>
            <option value="document">Documento</option>
          </select>
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Provider</span>
          <select name="provider" className={inputClass} defaultValue="youtube">
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="external">Esterno</option>
            <option value="">Nessuno</option>
          </select>
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">ID esterno</span>
          <input
            name="external_id"
            className={inputClass}
            placeholder="Per YouTube: es. dQw4w9WgXcQ"
          />
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">URL HTTPS</span>
          <input name="url" type="url" className={inputClass} placeholder="https://…" />
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium">Titolo</span>
          <input name="title" className={inputClass} />
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium">Didascalia</span>
          <textarea name="caption" rows={3} className={inputClass} />
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium">Nota diritti / autorizzazione</span>
          <textarea
            name="rights_note"
            rows={2}
            className={inputClass}
            placeholder="Annotazione interna su diritti, autorizzazioni o provenienza."
          />
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Ordine</span>
          <input name="sort_order" type="number" min="0" defaultValue="0" className={inputClass} />
        </label>

        <label className="text-ink flex items-center gap-2 self-end pb-2 text-sm">
          <input name="is_primary" type="checkbox" />
          Media principale
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-black"
          >
            Aggiungi media
          </button>
        </div>
      </form>
    </section>
  );
}
