import type { Metadata } from "next";
import Link from "next/link";
import { EditorialContentCreateForm } from "@/components/app/editorial/EditorialContentCreateForm";
import {
  getDefaultLanguageId,
  listActiveContentCategories,
  listActiveContentTypes,
  listActiveLanguages,
} from "@/lib/data/editorial/catalogs";

export const metadata: Metadata = {
  title: "Nuovo contenuto — Redazione",
};

export default async function NuovoContenutoPage() {
  const [contentTypes, categories, languages, defaultLanguageId] =
    await Promise.all([
      listActiveContentTypes(),
      listActiveContentCategories(),
      listActiveLanguages(),
      getDefaultLanguageId(),
    ]);

  return (
    <div>
      <Link
        href="/app/redazione/contenuti"
        className="text-ink-muted hover:text-ink text-sm"
      >
        ← Contenuti
      </Link>
      <h1 className="text-ink mt-2 text-2xl font-semibold tracking-tight">
        Nuovo contenuto editoriale
      </h1>
      <EditorialContentCreateForm
        contentTypes={contentTypes}
        categories={categories}
        languages={languages}
        defaultLanguageId={defaultLanguageId}
      />
    </div>
  );
}
