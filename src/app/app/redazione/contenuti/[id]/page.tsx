import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialContentEditForm } from "@/components/app/editorial/EditorialContentEditForm";
import { EditorialLifecycleButtons } from "@/components/app/editorial/EditorialLifecycleButtons";
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

export default async function ContenutoRedazionePage({ params }: Props) {
  const { id } = await params;
  const [content, contentTypes, categories, languages, versions, reviewState, session] =
    await Promise.all([
      getEditorialContentById(id),
      listActiveContentTypes(),
      listActiveContentCategories(),
      listActiveLanguages(),
      listEditorialContentVersions(id),
      getEditorialReviewState("content", id, "publication"),
      getApplicationSession(),
    ]);

  if (!content) notFound();

  const automaticReviewRequired = isContentAutomaticallySensitive(content);
  const reviewRequired =
    automaticReviewRequired || reviewState.forceSecondaryReview;

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
