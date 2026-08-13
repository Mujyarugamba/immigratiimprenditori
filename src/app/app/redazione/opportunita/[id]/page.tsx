import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialOpportunityEditForm } from "@/components/app/editorial/EditorialOpportunityEditForm";
import { getEditorialOpportunityById } from "@/lib/data/editorial/opportunities";
import {
  formatItalianDate,
  formatItalianDateTime,
  label,
  OPPORTUNITY_ORIGINS,
  OPPORTUNITY_STATUSES,
} from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Opportunità — Redazione",
};

type Props = { params: Promise<{ id: string }> };

export default async function OpportunitaRedazioneDetailPage({ params }: Props) {
  const { id } = await params;
  const opportunity = await getEditorialOpportunityById(id);
  if (!opportunity) notFound();

  return (
    <div>
      <Link
        href="/app/redazione/opportunita"
        className="text-ink-muted hover:text-ink text-sm"
      >
        ← Opportunità
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        {opportunity.title}
      </h1>
      <p className="text-ink-muted mt-1 text-sm">
        {opportunity.origin === "external"
          ? "Da fonte esterna"
          : "Creata nella rete"}{" "}
        · {opportunity.sourceLabel} · {opportunity.temporalLabel} ·{" "}
        {opportunity.editorial_status} / {opportunity.publication_status}
      </p>

      <dl className="border-line mt-6 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-muted">Ente</dt>
          <dd className="text-ink">{opportunity.authority ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Territorio</dt>
          <dd className="text-ink">
            {opportunity.territories.length
              ? opportunity.territories.join(", ")
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Apertura</dt>
          <dd className="text-ink">
            {opportunity.opensAt
              ? formatItalianDate(opportunity.opensAt)
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Scadenza</dt>
          <dd className="text-ink">
            {opportunity.openEnded
              ? "Senza scadenza"
              : opportunity.closesAt
                ? formatItalianDate(opportunity.closesAt)
                : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Stato sostanziale</dt>
          <dd className="text-ink">
            {label(OPPORTUNITY_STATUSES, opportunity.substantial_status)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Origine</dt>
          <dd className="text-ink">
            {label(OPPORTUNITY_ORIGINS, opportunity.origin)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Fonte</dt>
          <dd className="text-ink">{opportunity.sourceLabel}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Identificativo esterno</dt>
          <dd className="text-ink font-mono text-xs">
            {opportunity.externalIdentifier ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Acquisizione</dt>
          <dd className="text-ink">
            {opportunity.consultedAt
              ? formatItalianDateTime(opportunity.consultedAt)
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Aggiornamento fonte</dt>
          <dd className="text-ink">
            {opportunity.sourceUpdatedAt
              ? formatItalianDateTime(opportunity.sourceUpdatedAt)
              : "Non disponibile"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-muted">Link ufficiale</dt>
          <dd className="text-ink">
            {opportunity.officialUrl ? (
              <a
                href={opportunity.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline"
              >
                {opportunity.officialUrl}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-ink-muted">Provenienza (interna)</dt>
          <dd className="text-ink-muted break-words text-xs">
            {opportunity.referenceText ?? "—"}
          </dd>
        </div>
      </dl>

      <EditorialOpportunityEditForm opportunity={opportunity} />
    </div>
  );
}
