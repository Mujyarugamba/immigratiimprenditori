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
    "Ecosistema di opportunità e collaborazioni pubbliche: trovare, proporre, collaborare.",
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
      description="Trova occasioni pubbliche. Le collaborazioni restano un modello distinto nello stesso ecosistema."
      basePath="/opportunita"
      banner={
        <EcosystemBanner
          title="Opportunità e collaborazioni"
          description="Qui trovi le opportunità. Per ricerche, offerte e partnership usa Collaborazioni — stesso ecosistema, aggregate root distinti."
          links={[
            { href: "/collaborazioni", label: "Vai alle collaborazioni" },
            { href: "/pubblica", label: "Pubblica / attiva" },
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
          label(OPPORTUNITY_STATUSES, item.substantial_status),
        ],
        meta: item.platform_published_at
          ? [`Pubblicata il ${formatItalianDate(item.platform_published_at)}`]
          : undefined,
      })}
      emptyTitle="Nessuna opportunità trovata"
      emptyDescription="Non ci sono opportunità pubblicate che corrispondono ai filtri selezionati."
    />
  );
}
