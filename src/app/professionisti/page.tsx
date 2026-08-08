import type { Metadata } from "next";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { sections } from "@/data/sections";
import { listPublicProfessionals } from "@/lib/data/public/professionals";
import { param } from "@/lib/data/public/paging";
import {
  label,
  PRACTICE_MODES,
  selectFilter,
  textFilter,
} from "@/lib/public/labels";

const section = sections.professionisti;

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfessionistiPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterValues = {
    q: param(params, "q"),
    pratica: param(params, "pratica"),
  };

  let result;
  try {
    result = await listPublicProfessionals(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare i professionisti"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/professionisti"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <PublicListLayout
      title={section.title}
      description={section.description}
      basePath="/professionisti"
      filters={[
        textFilter("q", "Cerca", "Titolo o sintesi…"),
        selectFilter("pratica", "Modalità di esercizio", PRACTICE_MODES),
      ]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/professionisti/${item.id}`,
        title: item.headline ?? "Profilo professionale",
        description: item.summary,
        meta: item.practice_mode_code
          ? [label(PRACTICE_MODES, item.practice_mode_code)]
          : undefined,
      })}
      emptyTitle="Nessun professionista trovato"
      emptyDescription="Non ci sono profili pubblicati che corrispondono ai filtri selezionati."
    />
  );
}
