import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialContentEditForm } from "@/components/app/editorial/EditorialContentEditForm";
import { EditorialContentMediaPanel } from "@/components/app/editorial/EditorialContentMediaPanel";
import { EditorialContentContextPanel } from "@/components/app/editorial/EditorialContentContextPanel";
import {
  listActiveBusinessSectors,
  listActiveContentCategories,
  listActiveContentTypes,
  listActiveLanguages,
} from "@/lib/data/editorial/catalogs";
import { getEditorialContentById } from "@/lib/data/editorial/contents";
import { listEditorialContentMedia } from "@/lib/data/editorial/content-media";
import {
  listEditorialContentGeographies,
  listEditorialContentSectors,
} from "@/lib/data/editorial/content-context";

export const metadata: Metadata = {
  title: "Modifica contenuto — Redazione",
};

type Props = { params: Promise<{ id: string }> };

export default async function ContenutoRedazionePage({ params }: Props) {
  const { id } = await params;
  const [
    content,
    contentTypes,
    categories,
    languages,
    media,
    geographies,
    sectors,
    sectorOptions,
  ] = await Promise.all([
    getEditorialContentById(id),
    listActiveContentTypes(),
    listActiveContentCategories(),
    listActiveLanguages(),
    listEditorialContentMedia(id),
    listEditorialContentGeographies(id),
    listEditorialContentSectors(id),
    listActiveBusinessSectors(),
  ]);

  if (!content) notFound();

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
      <EditorialContentContextPanel
        contentId={content.id}
        geographies={geographies}
        sectors={sectors}
        sectorOptions={sectorOptions}
      />
      <EditorialContentMediaPanel contentId={content.id} media={media} />
    </div>
  );
}
