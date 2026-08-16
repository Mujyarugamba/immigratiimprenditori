import type { Metadata } from "next";
import { EcosystemBanner } from "@/components/public/EcosystemBanner";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { listPublicOpportunities } from "@/lib/data/public/opportunities";
import { param } from "@/lib/data/public/paging";
import {
  formatItalianDate,
  label,
  OPPORTUNITY_ORIGINS,
  OPPORTUNITY_STATUSES,
  selectFilter,
  textFilter,
} from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Opportunità e collaborazioni",
  description:
    "Bandi, progetti e occasioni utili. Collaborazioni: proposte di lavoro insieme.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OpportunitaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterValues = {
    q: param(params, "q"),
    origine: param(params, "origine"),
    stato: param(params, "stato"),
  };

  let result;
  try {
    result = await listPublicOpportunities(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare le opportunità"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/opportunita"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <PublicListLayout
      title="Opportunità"
      description="Bandi, progetti e occasioni utili."
      basePath="/opportunita"
      banner={
        <EcosystemBanner
          title="Cerchi una collaborazione?"
          description="Oltre alle opportunità, puoi trovare chi cerca o offre una collaborazione."
          links={[
            { href: "/collaborazioni", label: "Cerca una collaborazione" },
            { href: "/pubblica", label: "Pubblica" },
          ]}
        />
      }
      filters={[
        textFilter("q", "Cerca", "Titolo o sintesi…"),
        selectFilter("origine", "Origine", OPPORTUNITY_ORIGINS),
        selectFilter("stato", "Stato", OPPORTUNITY_STATUSES),
      ]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/opportunita/${item.id}`,
        title: item.title,
        description: item.summary,
        badges: [
          label(OPPORTUNITY_ORIGINS, item.origin),
          item.temporalLabel,
          item.sourceLabel ?? undefined,
        ].filter(Boolean) as string[],
        meta: [
          item.authority ? `Ente: ${item.authority}` : null,
          item.territory ? `Territorio: ${item.territory}` : null,
          item.openEnded
            ? "Senza scadenza indicata"
            : item.closesAt
              ? `Scadenza: ${formatItalianDate(item.closesAt)}`
              : null,
        ].filter(Boolean) as string[],
      })}
      emptyTitle="Nessuna opportunità trovata."
      emptyDescription="Nessuna opportunità corrisponde ai filtri selezionati."
    />
  );
}
