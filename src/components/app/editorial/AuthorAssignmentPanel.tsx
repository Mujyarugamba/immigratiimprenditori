"use client";

import { useActionState } from "react";
import {
  assignAuthorProfileToContentAction,
  removeAuthorProfileAssignmentAction,
  type AuthorActionState,
} from "@/lib/editorial/author-actions";
import type { EditorialAuthorAssignment } from "@/lib/data/editorial/authors";

const initial: AuthorActionState = { ok: false };
const selectClass =
  "border-line bg-surface-elevated text-ink focus:border-brand focus:ring-brand/30 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2";

type ContentOption = {
  id: string;
  title: string;
  slug: string;
  publication_status: string;
  visibility_status: string;
};

type Props = {
  authorProfileId: string;
  assignments: EditorialAuthorAssignment[];
  contents: ContentOption[];
};

function RemoveAssignmentForm({
  authorProfileId,
  assignmentId,
}: {
  authorProfileId: string;
  assignmentId: string;
}) {
  const [state, action, pending] = useActionState(
    removeAuthorProfileAssignmentAction,
    initial,
  );

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="author_profile_id" value={authorProfileId} />
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <button
        type="submit"
        disabled={pending}
        className="text-accent-dark hover:underline disabled:opacity-50 text-xs font-semibold"
      >
        {pending ? "Rimozione…" : "Rimuovi"}
      </button>
      {state.message && !state.ok ? (
        <span role="alert" className="text-accent-dark text-xs">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}

export function AuthorAssignmentPanel({
  authorProfileId,
  assignments,
  contents,
}: Props) {
  const [state, action, pending] = useActionState(
    assignAuthorProfileToContentAction,
    initial,
  );
  const contentById = new Map(contents.map((content) => [content.id, content]));

  return (
    <section className="border-line mt-8 border-t pt-8" aria-labelledby="author-attributions-title">
      <h2 id="author-attributions-title" className="text-ink text-xl font-semibold">
        Attribuzioni editoriali
      </h2>
      <p className="text-ink-muted mt-1 text-sm">
        Collega il profilo solo a contenuti di cui l&apos;attribuzione è stata verificata.
      </p>

      {assignments.length > 0 ? (
        <div className="table-scroll mt-5">
          <table className="border-line w-full min-w-[620px] border text-left text-sm">
            <thead className="bg-surface-muted text-ink">
              <tr>
                <th className="border-line border px-3 py-2 font-medium">Contenuto</th>
                <th className="border-line border px-3 py-2 font-medium">Ruolo</th>
                <th className="border-line border px-3 py-2 font-medium">Stato</th>
                <th className="border-line border px-3 py-2 font-medium">Azione</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => {
                const content = contentById.get(assignment.content_id);
                return (
                  <tr key={assignment.id}>
                    <td className="border-line border px-3 py-2">
                      <span className="text-ink font-medium">
                        {content?.title ?? assignment.display_label ?? assignment.content_id}
                      </span>
                      {content ? (
                        <span className="text-ink-muted mt-0.5 block text-xs">{content.slug}</span>
                      ) : null}
                    </td>
                    <td className="border-line border px-3 py-2">{assignment.role_kind}</td>
                    <td className="border-line border px-3 py-2">
                      {content
                        ? `${content.publication_status} · ${content.visibility_status}`
                        : "non disponibile"}
                    </td>
                    <td className="border-line border px-3 py-2">
                      <RemoveAssignmentForm
                        authorProfileId={authorProfileId}
                        assignmentId={assignment.id}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="border-line bg-surface-muted text-ink-muted mt-5 rounded-md border p-4 text-sm">
          Nessun contenuto collegato.
        </p>
      )}

      <form action={action} className="border-line bg-surface-elevated mt-6 grid gap-4 rounded-md border p-4 sm:grid-cols-2">
        <input type="hidden" name="author_profile_id" value={authorProfileId} />

        <label className="text-ink flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="font-medium">Contenuto</span>
          <select name="content_id" required disabled={pending} className={selectClass} defaultValue="">
            <option value="" disabled>
              Seleziona un contenuto…
            </option>
            {contents.map((content) => (
              <option key={content.id} value={content.id}>
                {content.title} — {content.publication_status}/{content.visibility_status}
              </option>
            ))}
          </select>
        </label>

        <label className="text-ink flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Ruolo</span>
          <select name="role_kind" required disabled={pending} className={selectClass} defaultValue="author">
            <option value="author">Autore</option>
            <option value="co_author">Co-autore</option>
            <option value="curator">Curatore</option>
            <option value="editor">Editor</option>
            <option value="contributor">Contributore</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="bg-brand text-white disabled:opacity-50 rounded-sm px-4 py-2 text-sm font-semibold"
          >
            {pending ? "Collegamento…" : "Collega contenuto"}
          </button>
        </div>

        {state.message ? (
          <p
            role={state.ok ? "status" : "alert"}
            className={state.ok ? "text-brand text-sm sm:col-span-2" : "text-accent-dark text-sm sm:col-span-2"}
          >
            {state.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
