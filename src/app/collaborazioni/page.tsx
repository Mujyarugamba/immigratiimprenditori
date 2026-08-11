import type { Metadata } from "next";
import { EcosystemBanner } from "@/components/public/EcosystemBanner";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { sections } from "@/data/sections";
import { listPublicCollaborations } from "@/lib/data/public/collaborations";
import { param } from "@/lib/data/public/paging";
import {
  COLLABORATION_FORMS,
  COLLABORATION_STATUSES,
  label,
  selectFilter,
  textFilter,
} from "@/lib/public/labels";

const section = sections.collaborazioni;

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CollaborazioniPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterValues = {
    q: param(params, "q"),
    forma: param(params, "forma"),
    stato: param(params, "stato"),
  };

  let result;
  try {
    result = await listPublicCollaborations(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare le collaborazioni"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/collaborazioni"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <PublicListLayout
      title={section.title}
      description={section.description}
      basePath="/collaborazioni"
      banner={
        <EcosystemBanner
          title="Collaborazioni e opportunità"
          description="Qui trovi chi cerca o offre una collaborazione. Per occasioni e proposte pubbliche usa Opportunità."
          links={[{ href: "/opportunita", label: "Trova un’opportunità" }]}
        />
      }
      filters={[
        textFilter("q", "Cerca", "Titolo, oggetto o finalità…"),
        selectFilter("forma", "Forma", COLLABORATION_FORMS),
        selectFilter("stato", "Stato", COLLABORATION_STATUSES),
      ]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/collaborazioni/${item.slug}`,
        title: item.title,
        description: item.object_text,
        badges: [
          label(COLLABORATION_FORMS, item.form_code),
          label(COLLABORATION_STATUSES, item.operational_status),
        ],
      })}
      emptyTitle="Nessuna collaborazione trovata."
      emptyDescription="Nessuna collaborazione corrisponde ai filtri selezionati."
    />
  );
}
