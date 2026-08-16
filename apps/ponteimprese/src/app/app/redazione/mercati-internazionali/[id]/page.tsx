import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialMarketResourceActions } from "@/components/app/editorial/EditorialMarketResourceActions";
import { getEditorialMarketResourceById } from "@/lib/data/editorial/markets";
import { formatItalianDateTime } from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Mercati internazionali — Redazione",
};

type Props = { params: Promise<{ id: string }> };

const CLASS_LABELS: Record<string, string> = {
  review: "Da revisionare",
  published: "Pubblicata (READY)",
  questionable: "QUESTIONABLE",
  rejected: "REJECT",
};

export default async function MercatiInternazionaliRedazioneDetailPage({
  params,
}: Props) {
  const { id } = await params;
  const resource = await getEditorialMarketResourceById(id);
  if (!resource) notFound();

  return (
    <div>
      <Link
        href="/app/redazione/mercati-internazionali"
        className="text-ink-muted hover:text-ink text-sm"
      >
        ← Mercati internazionali
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        {resource.indicatorLabel}
      </h1>
      <p className="text-ink-muted mt-1 text-sm">
        {resource.countryLabel} · {resource.periodYear ?? "—"} ·{" "}
        {CLASS_LABELS[resource.editorialClass] ?? resource.editorialClass}
      </p>

      <dl className="border-line mt-6 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-muted">Paese</dt>
          <dd className="text-ink">{resource.countryLabel}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Mercato catalogo</dt>
          <dd className="text-ink">
            {resource.marketName} ({resource.marketCode}) ·{" "}
            {resource.marketEditorialStatus}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Indicatore</dt>
          <dd className="text-ink">{resource.indicatorLabel}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Codice World Bank</dt>
          <dd className="text-ink font-mono text-xs">
            {resource.indicatorCode ?? "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-muted">Definizione</dt>
          <dd className="text-ink">{resource.definition ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Periodo</dt>
          <dd className="text-ink">{resource.periodYear ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Valore</dt>
          <dd className="text-ink tabular-nums">{resource.valueDisplay}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Unità</dt>
          <dd className="text-ink">{resource.unit ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Fonte</dt>
          <dd className="text-ink">{resource.sourceLabel} (CC BY 4.0)</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-muted">Sintesi</dt>
          <dd className="text-ink">{resource.summary ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-muted">Pagina dati World Bank</dt>
          <dd className="text-ink">
            {resource.website_url ? (
              <a
                href={resource.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline"
              >
                {resource.website_url}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Verifica</dt>
          <dd className="text-ink">{resource.verification_status}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Visibilità</dt>
          <dd className="text-ink">{resource.visibility_status}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Sostanziale</dt>
          <dd className="text-ink">{resource.substantial_status}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Aggiornato</dt>
          <dd className="text-ink">
            {formatItalianDateTime(resource.updated_at)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-muted">Chiave naturale</dt>
          <dd className="text-ink-muted font-mono text-xs break-all">
            {resource.naturalKey ?? "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-muted">Provenienza (essenziale)</dt>
          <dd className="text-ink-muted break-words text-xs">
            {resource.contact_note ?? "—"}
          </dd>
        </div>
      </dl>

      <EditorialMarketResourceActions resource={resource} />
    </div>
  );
}
