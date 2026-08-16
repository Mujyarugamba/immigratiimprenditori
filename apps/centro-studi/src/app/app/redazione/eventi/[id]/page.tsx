import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialEventEditForm } from "@/components/app/editorial/EditorialEventEditForm";
import { listActiveEventTypes } from "@/lib/data/editorial/catalogs";
import { getEditorialEventById } from "@/lib/data/editorial/events";

export const metadata: Metadata = {
  title: "Modifica evento — Redazione",
};

type Props = { params: Promise<{ id: string }> };

export default async function EventoRedazionePage({ params }: Props) {
  const { id } = await params;
  const [event, eventTypes] = await Promise.all([
    getEditorialEventById(id),
    listActiveEventTypes(),
  ]);

  if (!event) notFound();

  return (
    <div>
      <Link
        href="/app/redazione/eventi"
        className="text-ink-muted hover:text-ink text-sm"
      >
        ← Eventi
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        {event.title}
      </h1>
      <p className="text-ink-muted mt-1 text-sm">
        {event.editorial_status} · {event.publication_status} ·{" "}
        {event.visibility_status}
        {event.external_source_code
          ? ` · fonte ${event.external_source_code}`
          : ""}
      </p>
      <EditorialEventEditForm event={event} eventTypes={eventTypes} />
    </div>
  );
}
