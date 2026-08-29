import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialLifecycleButtons } from "@/components/app/editorial/EditorialLifecycleButtons";
import { IndicatorEditForm } from "@/components/app/editorial/IndicatorForms";
import { SecondaryReviewPanel } from "@/components/app/editorial/SecondaryReviewPanel";
import { getObservatoryIndicatorById } from "@/lib/data/editorial/observatory";
import { getEditorialReviewState } from "@/lib/data/editorial/reviews";
import {
  publishIndicatorAction,
  withdrawIndicatorAction,
} from "@/lib/editorial/actions";
import { getApplicationSession } from "@/lib/session/get-application-session";

export const metadata: Metadata = {
  title: "Modifica indicatore — Redazione",
};

type Props = { params: Promise<{ id: string }> };

export default async function IndicatoreRedazionePage({ params }: Props) {
  const { id } = await params;
  const [indicator, reviewState, session] = await Promise.all([
    getObservatoryIndicatorById(id),
    getEditorialReviewState("observatory_indicator", id, "publication"),
    getApplicationSession(),
  ]);
  if (!indicator) notFound();

  return (
    <div>
      <Link
        href="/app/redazione/osservatorio/indicatori"
        className="text-ink-muted hover:text-ink text-sm"
      >
        ← Indicatori
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        {indicator.title}
      </h1>
      <p className="text-ink-muted mt-1 text-sm">
        <code>{indicator.code}</code> · {indicator.publication_status}
      </p>

      <IndicatorEditForm indicator={indicator} />

      <SecondaryReviewPanel
        entityKind="observatory_indicator"
        entityId={indicator.id}
        reviewScope="publication"
        state={reviewState}
        currentAccountId={session?.accountId ?? null}
        required
        automaticRequired
      />

      <EditorialLifecycleButtons
        id={indicator.id}
        publishAction={publishIndicatorAction}
        withdrawAction={withdrawIndicatorAction}
        publicationStatus={indicator.publication_status}
        publicHref={
          indicator.publication_status === "published"
            ? `/osservatorio/${indicator.slug}`
            : undefined
        }
      />
    </div>
  );
}
