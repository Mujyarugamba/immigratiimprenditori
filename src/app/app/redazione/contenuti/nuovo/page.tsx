import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EditorialContentCreateForm } from "@/components/app/editorial/EditorialContentCreateForm";
import {
  getDefaultLanguageId,
  listActiveContentCategories,
  listActiveContentTypes,
  listActiveLanguages,
} from "@/lib/data/editorial/catalogs";
import { getEditorialInboxItemById } from "@/lib/data/editorial/inbox";
import {
  canCreateContentDraftFromInbox,
  suggestedCategoryForInboxMetadata,
  suggestedContentTypeForInboxKind,
} from "@/lib/editorial/inbox-draft";

export const metadata: Metadata = {
  title: "Nuovo contenuto — Redazione",
};

type Props = {
  searchParams: Promise<{ inbox?: string }>;
};

export default async function NuovoContenutoPage({ searchParams }: Props) {
  const { inbox: inboxId } = await searchParams;
  const [contentTypes, categories, languages, defaultLanguageId, inboxItem] =
    await Promise.all([
      listActiveContentTypes(),
      listActiveContentCategories(),
      listActiveLanguages(),
      getDefaultLanguageId(),
      inboxId ? getEditorialInboxItemById(inboxId) : Promise.resolve(null),
    ]);

  if (inboxItem?.linked_content_id) {
    redirect(`/app/redazione/contenuti/${inboxItem.linked_content_id}`);
  }

  const canCreateFromInbox =
    inboxItem &&
    !inboxItem.linked_event_id &&
    inboxItem.status !== "rejected" &&
    inboxItem.status !== "archived" &&
    canCreateContentDraftFromInbox(inboxItem.item_kind);
  const suggestedType = canCreateFromInbox
    ? suggestedContentTypeForInboxKind(inboxItem.item_kind)
    : null;
  const suggestedCategory = canCreateFromInbox
    ? suggestedCategoryForInboxMetadata(inboxItem.raw_metadata)
    : null;

  const initialValues = canCreateFromInbox
    ? {
        inboxId: inboxItem.id,
        title: inboxItem.title,
        abstract: inboxItem.summary,
        typeCode: suggestedType,
        categoryCode: suggestedCategory,
        sourceLabel: inboxItem.source_label,
        sourceUrl: inboxItem.original_url,
      }
    : null;

  return (
    <div>
      <Link
        href={inboxItem ? `/app/redazione/inbox/${inboxItem.id}` : "/app/redazione/contenuti"}
        className="text-ink-muted hover:text-ink text-sm"
      >
        ← {inboxItem ? "Arrivo Inbox" : "Contenuti"}
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        {initialValues ? "Crea bozza dall’Inbox" : "Nuovo contenuto editoriale"}
      </h1>
      {inboxItem && !canCreateFromInbox ? (
        <p className="mt-4 border border-black p-4 text-sm text-neutral-700">
          Questo arrivo non può essere convertito in contenuto: può appartenere a un workflow dedicato oppure essere già scartato o archiviato.
        </p>
      ) : null}
      <EditorialContentCreateForm
        contentTypes={contentTypes}
        categories={categories}
        languages={languages}
        defaultLanguageId={defaultLanguageId}
        initialValues={initialValues}
      />
    </div>
  );
}
