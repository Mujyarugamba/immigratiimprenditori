import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorAssignmentPanel } from "@/components/app/editorial/AuthorAssignmentPanel";
import { AuthorProfileForm } from "@/components/app/editorial/AuthorProfileForm";
import {
  getEditorialAuthorProfile,
  listEditorialAuthorAssignableContents,
  listEditorialAuthorAssignments,
} from "@/lib/data/editorial/authors";

export const metadata: Metadata = {
  title: "Gestisci autore — Redazione",
};

type Props = { params: Promise<{ id: string }> };

export default async function EditorialAuthorDetailPage({ params }: Props) {
  const { id } = await params;
  const [profile, assignments, contents] = await Promise.all([
    getEditorialAuthorProfile(id),
    listEditorialAuthorAssignments(id),
    listEditorialAuthorAssignableContents(),
  ]);

  if (!profile) notFound();

  return (
    <div>
      <Link href="/app/redazione/autori" className="text-ink-muted hover:text-ink text-sm">
        ← Profili autore
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-semibold tracking-tight">{profile.display_name}</h1>
          <p className="text-ink-muted mt-1 text-sm">
            {profile.profile_kind} · {profile.is_public ? "pubblico" : "privato / in revisione"}
          </p>
        </div>
        {profile.is_public ? (
          <Link href={`/autori/${profile.slug}`} className="text-brand text-sm font-semibold hover:underline">
            Apri profilo pubblico ↗
          </Link>
        ) : null}
      </div>

      <AuthorProfileForm profile={profile} />
      <AuthorAssignmentPanel authorProfileId={profile.id} assignments={assignments} contents={contents} />
    </div>
  );
}
