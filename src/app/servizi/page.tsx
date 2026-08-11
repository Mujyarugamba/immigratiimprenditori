import type { Metadata } from "next";
import Link from "next/link";
import { EcosystemBanner } from "@/components/public/EcosystemBanner";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { PublicFilters } from "@/components/public/PublicFilters";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ErrorState } from "@/components/ui/states";
import { param } from "@/lib/data/public/paging";
import {
  listPublicServiceOffers,
  listPublicServiceRequests,
} from "@/lib/data/public/services";
import {
  label,
  selectFilter,
  SERVICE_CATEGORIES,
  SERVICE_DELIVERY_MODES,
  textFilter,
} from "@/lib/public/labels";

const title = "Servizi";
const description =
  "Offerte e richieste di servizi pubblicate dalla community: consulenza, formazione, supporto linguistico e altro.";

export const metadata: Metadata = {
  title,
  description,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function ServiceTabs({ active }: { active: "offerta" | "richiesta" }) {
  const tabs = [
    { key: "offerta" as const, label: "Offerte", href: "/servizi?tipo=offerta" },
    {
      key: "richiesta" as const,
      label: "Richieste",
      href: "/servizi?tipo=richiesta",
    },
  ];

  return (
    <nav
      className="border-line mt-6 flex gap-1 border-b"
      aria-label="Tipo di servizio"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            active === tab.key
              ? "border-brand text-brand"
              : "text-ink-muted hover:text-ink border-transparent"
          }`}
          aria-current={active === tab.key ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function ServiziPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tipoParam = param(params, "tipo");
  const tipo: "offerta" | "richiesta" =
    tipoParam === "richiesta" ? "richiesta" : "offerta";

  const filterValues = {
    q: param(params, "q"),
    categoria: param(params, "categoria"),
    erogazione: param(params, "erogazione"),
    tipo,
  };

  const filters = [
    textFilter("q", "Cerca", "Titolo o sintesi…"),
    selectFilter("categoria", "Categoria", SERVICE_CATEGORIES),
    selectFilter("erogazione", "Erogazione", SERVICE_DELIVERY_MODES),
  ];

  let result;
  try {
    result =
      tipo === "richiesta"
        ? await listPublicServiceRequests(params)
        : await listPublicServiceOffers(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare i servizi"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/servizi"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <Section>
      <Container>
        <PublicPageHeader title={title} description={description} />
        <EcosystemBanner
          title="Offro o cerco un servizio"
          description="Scegli se offri o cerchi un servizio. Per competenze vedi anche i professionisti; per le imprese, esplora le imprese della rete."
          links={[
            { href: "/professionisti", label: "Trova un professionista" },
            { href: "/imprese", label: "Scopri le imprese" },
          ]}
        />
        <ServiceTabs active={tipo} />
        <PublicFilters
          action="/servizi"
          fields={filters}
          values={filterValues}
          hiddenValues={{ tipo }}
        />

        {result.total === 0 ? (
          <PublicEmpty
            title={
              tipo === "offerta"
                ? "Nessuna offerta trovata"
                : "Nessuna richiesta trovata"
            }
            description="Non ci sono servizi pubblicati che corrispondono ai filtri selezionati."
          />
        ) : (
          <>
            <p className="text-ink-muted mt-6 text-sm">
              {result.total} risultat{result.total === 1 ? "o" : "i"}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((item) => (
                <PublicResultCard
                  key={item.id}
                  href={
                    tipo === "offerta"
                      ? `/servizi/offerte/${item.id}`
                      : `/servizi/richieste/${item.id}`
                  }
                  title={item.title}
                  description={item.summary}
                  badges={[
                    label(SERVICE_CATEGORIES, item.category_code),
                    label(SERVICE_DELIVERY_MODES, item.delivery_mode),
                  ]}
                />
              ))}
            </div>
            <PublicPagination
              basePath="/servizi"
              page={result.page}
              pageCount={result.pageCount}
              total={result.total}
              filters={filterValues}
            />
          </>
        )}
      </Container>
    </Section>
  );
}
