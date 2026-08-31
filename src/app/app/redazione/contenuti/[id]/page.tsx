import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialContentEditForm } from "@/components/app/editorial/EditorialContentEditForm";
import { EditorialLifecycleButtons } from "@/components/app/editorial/EditorialLifecycleButtons";
import { InterviewWorkflowControls } from "@/components/app/editorial/InterviewWorkflowControls";
import { SecondaryReviewPanel } from "@/components/app/editorial/SecondaryReviewPanel";
import {
  listActiveContentCategories,
  listActiveContentTypes,
  listActiveLanguages,
} from "@/lib/data/editorial/catalogs";
import {
  getEditorialContentById,
  listEditorialContentVersions,
} from "@/lib/data/editorial/contents";
import { getEditorialInterviewWorkflow } from "@/lib/data/editorial/interviews";
import {
  getEditorialReviewState,
  isContentAutomaticallySensitive,
} from "@/lib/data/editorial/reviews";
import {
  publishEditorialContentAction,
  withdrawEditorialContentAction,
} from "@/lib/editorial/actions";
import { getApplicationSession } from "@/lib/session/get-application-session";

export const metadata: Metadata = {
  title: "Modifica contenuto — Redazione",
};

type Props = { params: Promise<{ id: string }> };

const WORKFLOW_LABELS: Record<string, string> = {
  candidate: "Candidato",
  contacted: "Contattato",
  scheduled: "Programmato",
  interviewed: "Intervistato",
  fact_check: "Fact-check",
  approved: "Approvato",
  declined: "Declinato",
  closed: "Chiuso",
};

const CONSENT_LABELS: Record<string, string> = {
  pending: "Da acquisire",
  granted: "Concesso",
  declined: "Negato",
  not_required: "Non richiesto",
};

const ORIGIN_LABELS: Record<string, string> = {
  editorial: "Redazione",
  contribution: "Contributo",
  referral: "Segnalazione",
  public_source: "Fonte pubblica",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ContenutoRedazionePage({ params }: Props) {
  const { id } = await params;
  const [
    content,
    contentTypes,
    categories,
    languages,
    versions,
    reviewState,
    session,
    interviewWorkflow,
  ] = await Promise.all([
    getEditorialContentById(id),
    listActiveContentTypes(),
    listActiveContentCategories(),
    listActiveLanguages(),
    listEditorialContentVersions(id),
    getEditorialReviewState("content", id, "publication"),
    getApplicationSession(),
    getEditorialInterviewWorkflow(id),
  ]);

  if (!content) notFound();

  const automaticReviewRequired = isContentAutomaticallySensitive(content);
  const reviewRequired =
    automaticReviewRequired || reviewState.forceSecondaryReview;

  const consents = interviewWorkflow
    ? [
        {
          label: "Pubblicazione",
          status: interviewWorkflow.publication_consent_status,
          at: interviewWorkflow.publication_consent_at,
        },
        {
          label: "Citazioni",
          status: interviewWorkflow.quote_approval_status,
          at: interviewWorkflow.quote_approval_at,
        },
        {
          label: "Immagini",
          status: interviewWorkflow.image_consent_status,
          at: interviewWorkflow.image_consent_at,
        },
        {
          label: "Video",
          status: interviewWorkflow.video_consent_status,
          at: interviewWorkflow.video_consent_at,
        },
      ]
    : [];

  return (
    <div>
      <Link
        href="/app/redazione/contenuti"
        className="text-ink-muted hover:text-ink text-sm"
      >
        ← Contenuti
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        {content.title}
      </h1>
      <p className="text-ink-muted mt-1 text-sm">
        {content.publication_status} · {content.visibility_status}
      </p>

      {content.type_code === "interview" ? (
        <section
          className="border-line mt-6 border p-5"
          aria-labelledby="interview-workflow-title"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-ink-muted text-xs font-semibold uppercase tracking-[0.12em]">
                Intervista originale
              </p>
              <h2
                id="interview-workflow-title"
                className="text-ink mt-1 text-lg font-semibold"
              >
                Workflow e consensi
              </h2>
            </div>
            {interviewWorkflow ? (
              <span className="border-line text-ink border px-3 py-1 text-xs font-semibold">
                {WORKFLOW_LABELS[interviewWorkflow.workflow_status] ??
                  interviewWorkflow.workflow_status}
              </span>
            ) : null}
          </div>

          {!interviewWorkflow ? (
            <p className="text-ink-muted mt-4 text-sm">
              Workflow non inizializzato per questo contenuto. La bozza resta
              privata e nessun contatto viene implicato automaticamente.
            </p>
          ) : (
            <>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-ink-muted text-xs uppercase tracking-[0.1em]">
                    Origine
                  </dt>
                  <dd className="text-ink mt-1 font-medium">
                    {ORIGIN_LABELS[interviewWorkflow.source_origin] ??
                      interviewWorkflow.source_origin}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted text-xs uppercase tracking-[0.1em]">
                    Contattato
                  </dt>
                  <dd className="text-ink mt-1 font-medium">
                    {formatDate(interviewWorkflow.contacted_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted text-xs uppercase tracking-[0.1em]">
                    Programmato
                  </dt>
                  <dd className="text-ink mt-1 font-medium">
                    {formatDate(interviewWorkflow.scheduled_for)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted text-xs uppercase tracking-[0.1em]">
                    Intervistato
                  </dt>
                  <dd className="text-ink mt-1 font-medium">
                    {formatDate(interviewWorkflow.interviewed_at)}
                  </dd>
                </div>
              </dl>

              <div className="border-line mt-5 border-t pt-4">
                <h3 className="text-ink text-sm font-semibold">Consensi</h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {consents.map((consent) => (
                    <div key={consent.label} className="border-line border p-3">
                      <dt className="text-ink-muted text-xs uppercase tracking-[0.1em]">
                        {consent.label}
                      </dt>
                      <dd className="text-ink mt-1 text-sm font-semibold">
                        {CONSENT_LABELS[consent.status] ?? consent.status}
                      </dd>
                      {consent.at ? (
                        <dd className="text-ink-muted mt-1 text-xs">
                          {formatDate(consent.at)}
                        </dd>
                      ) : null}
                    </div>
                  ))}
                </dl>
              </div>

              <p className="text-ink-muted mt-4 text-xs">
                Ultimo aggiornamento: {formatDate(interviewWorkflow.updated_at)}.
                Gli avanzamenti qui sotto registrano soltanto decisioni o attività redazionali già avvenute.
              </p>

              <InterviewWorkflowControls workflow={interviewWorkflow} />
            </>
          )}
        </section>
      ) : null}

      <EditorialContentEditForm
        content={content}
        contentTypes={contentTypes}
        categories={categories}
        languages={languages}
      />

      <SecondaryReviewPanel
        entityKind="content"
        entityId={content.id}
        reviewScope="publication"
        state={reviewState}
        currentAccountId={session?.accountId ?? null}
        required={reviewRequired}
        automaticRequired={automaticReviewRequired}
      />

      <EditorialLifecycleButtons
        id={content.id}
        publishAction={publishEditorialContentAction}
        withdrawAction={withdrawEditorialContentAction}
        publicationStatus={content.publication_status}
        publicHref={
          content.publication_status === "published"
            ? `/contenuti/${content.slug}`
            : undefined
        }
      />

      <section
        className="border-line mt-10 border-t pt-6"
        aria-labelledby="version-history-title"
      >
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2
              id="version-history-title"
              className="text-ink text-lg font-semibold"
            >
              Cronologia versioni
            </h2>
            <p className="text-ink-muted mt-1 text-sm">
              Snapshot editoriali in sola lettura. Le versioni registrate non
              vengono riscritte.
            </p>
          </div>
          {versions.length > 0 ? (
            <span className="text-ink-muted text-xs">
              {versions.length} versioni
            </span>
          ) : null}
        </div>

        {versions.length === 0 ? (
          <p className="text-ink-muted mt-4 text-sm">
            Il registro versioni non è ancora attivo su questo ambiente oppure
            non contiene snapshot.
          </p>
        ) : (
          <ol className="border-line mt-4 divide-y border-y">
            {versions.map((version) => (
              <li
                key={version.id}
                className="grid gap-2 py-3 sm:grid-cols-[90px_1fr_auto] sm:items-start"
              >
                <span className="text-ink font-semibold">
                  {version.version_label}
                </span>
                <div>
                  <p className="text-ink text-sm">{version.change_summary}</p>
                  <p className="text-ink-muted mt-1 text-xs">
                    {new Intl.DateTimeFormat("it-IT", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(version.created_at))}
                  </p>
                </div>
                <Link
                  href={`/app/redazione/contenuti/${content.id}/versioni/${version.version_number}`}
                  className="text-ink text-sm underline underline-offset-2"
                >
                  Apri snapshot
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
