import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEditorialContentVersion } from "@/lib/data/editorial/contents";

export const metadata: Metadata = {
  title: "Versione contenuto — Redazione",
};

type Props = {
  params: Promise<{ id: string; version: string }>;
};

function text(snapshot: Record<string, unknown>, key: string) {
  const value = snapshot[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function booleanLabel(value: unknown) {
  if (value === true) return "Sì";
  if (value === false) return "No";
  return "—";
}

export default async function ContentVersionPage({ params }: Props) {
  const { id, version } = await params;
  const versionNumber = Number(version);
  const item = await getEditorialContentVersion(id, versionNumber);
  if (!item) notFound();

  const snapshot = item.snapshot;
  const title = text(snapshot, "title") ?? "Contenuto senza titolo";
  const body = text(snapshot, "body") ?? "";

  return (
    <div>
      <Link
        href={`/app/redazione/contenuti/${id}`}
        className="text-ink-muted hover:text-ink text-sm"
      >
        ← Torna al contenuto
      </Link>

      <header className="border-line mt-4 border-b pb-5">
        <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.14em]">
          Snapshot editoriale · sola lettura
        </p>
        <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight">
          {item.version_label} — {title}
        </h1>
        <p className="text-ink-muted mt-2 text-sm">{item.change_summary}</p>
        <p className="text-ink-muted mt-1 text-xs">
          Registrata {new Intl.DateTimeFormat("it-IT", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(item.created_at))}
        </p>
      </header>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_280px]">
        <article>
          {text(snapshot, "subtitle") ? (
            <p className="text-ink-muted mb-4 text-lg">{text(snapshot, "subtitle")}</p>
          ) : null}
          {text(snapshot, "abstract") ? (
            <div className="border-line mb-6 border-y py-4">
              <h2 className="text-ink text-sm font-semibold uppercase tracking-wide">Abstract</h2>
              <p className="text-ink mt-2 whitespace-pre-wrap leading-7">
                {text(snapshot, "abstract")}
              </p>
            </div>
          ) : null}
          <h2 className="text-ink text-sm font-semibold uppercase tracking-wide">Corpo</h2>
          <pre className="text-ink mt-3 whitespace-pre-wrap break-words font-sans text-base leading-7">
            {body}
          </pre>
        </article>

        <aside className="border-line border-t pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <h2 className="text-ink text-sm font-semibold uppercase tracking-wide">Stato snapshot</h2>
          <dl className="text-ink-muted mt-4 space-y-3 text-xs">
            <div>
              <dt>Tipo</dt>
              <dd className="text-ink mt-1">{text(snapshot, "type_code") ?? "—"}</dd>
            </div>
            <div>
              <dt>Slug</dt>
              <dd className="text-ink mt-1 break-all">{text(snapshot, "slug") ?? "—"}</dd>
            </div>
            <div>
              <dt>Stato editoriale</dt>
              <dd className="text-ink mt-1">{text(snapshot, "editorial_status") ?? "—"}</dd>
            </div>
            <div>
              <dt>Pubblicazione</dt>
              <dd className="text-ink mt-1">{text(snapshot, "publication_status") ?? "—"}</dd>
            </div>
            <div>
              <dt>Visibilità</dt>
              <dd className="text-ink mt-1">{text(snapshot, "visibility_status") ?? "—"}</dd>
            </div>
            <div>
              <dt>In evidenza</dt>
              <dd className="text-ink mt-1">{booleanLabel(snapshot.is_featured)}</dd>
            </div>
            <div>
              <dt>Fonte</dt>
              <dd className="text-ink mt-1">{text(snapshot, "source_label") ?? "—"}</dd>
            </div>
            <div>
              <dt>URL fonte</dt>
              <dd className="text-ink mt-1 break-all">{text(snapshot, "source_url") ?? "—"}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
