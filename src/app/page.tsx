import type { Metadata } from "next";
import { EcosystemGrid } from "@/components/home/EcosystemGrid";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { HomeDomainSection } from "@/components/home/HomeDomainSection";
import { TransversalStrip } from "@/components/home/TransversalStrip";
import {
  listHomeBusinesses,
  listHomeCollaborations,
  listHomeContents,
  listHomeEvents,
  listHomeMarkets,
  listHomeOpportunities,
  listHomeProfessionals,
  listHomeServiceOffers,
} from "@/lib/data/public";
import { PLATFORM_VALUE_PROPOSITION } from "@/data/ecosystems";
import {
  AVAILABILITY_STATUSES,
  BUSINESS_STATUSES,
  COLLABORATION_FORMS,
  COLLABORATION_STATUSES,
  CONTENT_TYPES,
  EVENT_TYPES,
  MARKET_KINDS,
  MARKET_STATUSES,
  OPPORTUNITY_ORIGINS,
  OPPORTUNITY_STATUSES,
  ORGANIZATION_FORMS,
  PRACTICE_MODES,
  SERVICE_CATEGORIES,
  SERVICE_DELIVERY_MODES,
  label,
} from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Home",
  description: PLATFORM_VALUE_PROPOSITION,
};

export default async function HomePage() {
  const [
    businesses,
    professionals,
    opportunities,
    collaborations,
    markets,
    services,
    events,
    contents,
  ] = await Promise.all([
    listHomeBusinesses(3).catch(() => []),
    listHomeProfessionals(3).catch(() => []),
    listHomeOpportunities(3).catch(() => []),
    listHomeCollaborations(3).catch(() => []),
    listHomeMarkets(3).catch(() => []),
    listHomeServiceOffers(3).catch(() => []),
    listHomeEvents(3).catch(() => []),
    listHomeContents(3).catch(() => []),
  ]);

  return (
    <>
      <Hero />
      <EcosystemGrid />

      <HomeDomainSection
        eyebrow="Persone"
        title="Competenze e professionisti"
        description="Trova chi può aiutarti con competenze e servizi professionali. Il tuo profilo lo completi dopo l’accesso."
        actionHref="/persone"
        actionLabel="Esplora le persone"
        emptyTitle="Non ci sono ancora professionisti da mostrare"
        emptyDescription="Quando i professionisti si presenteranno nella rete, li troverai qui."
        items={professionals.map((p) => ({
          href: `/professionisti/${p.id}`,
          title: p.headline || "Professionista",
          description: p.summary,
          meta: [
            label(PRACTICE_MODES, p.practice_mode_code),
            label(AVAILABILITY_STATUSES, p.availability_status),
          ].filter(Boolean),
        }))}
      />

      <HomeDomainSection
        className="bg-surface-elevated py-14 sm:py-16 lg:py-20"
        eyebrow="Imprese"
        title="Imprese nella rete"
        description="Imprese che operano in Italia: settori, territori, servizi e mercati collegati."
        actionHref="/imprese"
        actionLabel="Scopri le imprese"
        emptyTitle="Non ci sono ancora imprese da mostrare"
        emptyDescription="Quando le imprese si presenteranno nella rete, le troverai qui."
        items={businesses.map((b) => ({
          href: `/imprese/${b.id}`,
          title: b.public_name,
          description: b.summary,
          meta: [
            label(ORGANIZATION_FORMS, b.organization_form),
            label(BUSINESS_STATUSES, b.substantial_status),
          ].filter(Boolean),
        }))}
      />

      <HomeDomainSection
        eyebrow="Opportunità e collaborazioni"
        title="Trovare, proporre, collaborare"
        description="Occasioni da cogliere e proposte di lavoro insieme, in un unico percorso di scoperta."
        actionHref="/opportunita"
        actionLabel="Esplora le opportunità"
        emptyTitle="Non ci sono opportunità disponibili in questo momento"
        emptyDescription="Quando ci saranno occasioni o collaborazioni da condividere, le troverai qui."
        items={[
          ...opportunities.map((o) => ({
            href: `/opportunita/${o.id}`,
            title: o.title,
            description: o.summary,
            badges: ["Opportunità"],
            meta: [
              label(OPPORTUNITY_ORIGINS, o.origin),
              label(OPPORTUNITY_STATUSES, o.substantial_status),
            ].filter(Boolean),
          })),
          ...collaborations.slice(0, Math.max(0, 3 - opportunities.length)).map(
            (c) => ({
              href: `/collaborazioni/${c.slug}`,
              title: c.title,
              description: c.object_text ?? c.purpose_text,
              badges: ["Collaborazione"],
              meta: [
                label(COLLABORATION_FORMS, c.form_code),
                label(COLLABORATION_STATUSES, c.operational_status),
              ].filter(Boolean),
            }),
          ),
        ]}
      />

      <HomeDomainSection
        className="bg-surface-elevated py-14 sm:py-16 lg:py-20"
        eyebrow="Mercati internazionali"
        title="Relazioni oltre confine"
        description="Paesi e aree dove imprese e professionisti della rete operano, incontrano e crescono."
        actionHref="/mercati"
        actionLabel="Esplora i mercati"
        emptyTitle="Non ci sono ancora mercati da mostrare"
        emptyDescription="Quando saranno disponibili paesi e aree internazionali, li troverai qui."
        items={markets.map((m) => ({
          href: `/mercati/${m.code}`,
          title: m.name,
          description: m.summary,
          meta: [
            label(MARKET_KINDS, m.market_kind),
            label(MARKET_STATUSES, m.substantial_status),
          ].filter(Boolean),
        }))}
      />

      <HomeDomainSection
        eyebrow="Servizi"
        title="Offerte per lavorare e crescere"
        description="Servizi offerti nella rete. Se cerchi aiuto, apri anche le richieste."
        actionHref="/servizi"
        actionLabel="Vedi i servizi"
        emptyTitle="Non ci sono ancora servizi da mostrare"
        emptyDescription="Quando qualcuno offrirà o cercherà un servizio, lo troverai qui."
        items={services.map((s) => ({
          href: `/servizi/offerte/${s.id}`,
          title: s.title,
          description: s.summary,
          meta: [
            label(SERVICE_CATEGORIES, s.category_code),
            label(SERVICE_DELIVERY_MODES, s.delivery_mode),
          ].filter(Boolean),
        }))}
      />

      <TransversalStrip />

      <HomeDomainSection
        className="bg-surface-elevated py-14 sm:py-16 lg:py-20"
        eyebrow="Eventi e storie"
        title="Incontrarsi e orientarsi"
        description="Eventi e storie che aiutano a conoscersi e a trovare la propria strada nella rete."
        actionHref="/eventi"
        actionLabel="Scopri gli eventi"
        emptyTitle="Non ci sono eventi in programma"
        emptyDescription="Quando ci saranno appuntamenti o storie da condividere, li troverai qui."
        items={[
          ...events.map((e) => ({
            href: `/eventi/${e.id}`,
            title: e.title,
            description: e.summary,
            badges: ["Evento"],
            meta: [label(EVENT_TYPES, e.type_code)].filter(Boolean),
          })),
          ...contents.slice(0, Math.max(0, 3 - events.length)).map((c) => ({
            href: `/contenuti/${c.slug}`,
            title: c.title,
            description: c.abstract,
            badges: ["Storia"],
            meta: [label(CONTENT_TYPES, c.type_code)].filter(Boolean),
          })),
        ]}
      />

      <FinalCta />
    </>
  );
}
