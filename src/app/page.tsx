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

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const deleted = params.account_deleted;
  const deletedFlag = Array.isArray(deleted) ? deleted[0] : deleted;

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
      {deletedFlag === "1" ? (
        <p
          className="border-brand/30 bg-brand-soft text-ink mx-auto mt-4 max-w-3xl rounded-md border px-4 py-3 text-sm"
          role="status"
        >
          Il tuo account è stato cancellato. Grazie per aver fatto parte della
          rete.
        </p>
      ) : null}
      {deletedFlag === "partial" ? (
        <p
          className="border-accent/30 bg-accent-soft text-ink mx-auto mt-4 max-w-3xl rounded-md border px-4 py-3 text-sm"
          role="status"
        >
          L’account è chiuso. Se non riesci ad accedere, contatta il supporto.
        </p>
      ) : null}
      <Hero />
      <EcosystemGrid />

      <HomeDomainSection
        eyebrow="Persone"
        title="Competenze e professionisti"
        description="Trova professionisti, competenze ed esperienze."
        actionHref="/persone"
        actionLabel="Esplora le persone"
        emptyTitle="Nessun professionista disponibile."
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
        className="bg-surface-elevated"
        eyebrow="Imprese"
        title="Attività, settori, territori"
        description="Scopri imprese, attività, settori, territori e relazioni."
        actionHref="/imprese"
        actionLabel="Scopri le imprese"
        emptyTitle="Nessuna impresa disponibile."
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
        description="Trova opportunità professionali e imprenditoriali."
        actionHref="/opportunita"
        actionLabel="Esplora le opportunità"
        emptyTitle="Nessuna opportunità disponibile."
        items={[
          ...opportunities.map((o) => ({
            href: `/opportunita/${o.id}`,
            title: o.title,
            description: o.summary,
            badges: ["Opportunità", o.sourceLabel ?? undefined].filter(
              Boolean,
            ) as string[],
            meta: [
              o.territory,
              o.temporalLabel,
              label(OPPORTUNITY_ORIGINS, o.origin),
            ].filter(Boolean) as string[],
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
        className="bg-surface-elevated"
        eyebrow="Mercati internazionali"
        title="Relazioni oltre confine"
        description="Esplora paesi e mercati in cui imprese e professionisti della rete operano, sviluppano relazioni e crescono."
        actionHref="/mercati"
        actionLabel="Esplora i mercati"
        emptyTitle="Nessun mercato disponibile."
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
        description="Trova servizi professionali e imprenditoriali oppure pubblica ciò di cui hai bisogno."
        actionHref="/servizi"
        actionLabel="Vedi i servizi"
        emptyTitle="Nessun servizio disponibile."
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
        className="bg-surface-elevated"
        eyebrow="Eventi e storie"
        title="Incontrarsi e orientarsi"
        description="Eventi e storie per conoscersi, scoprire esperienze e creare nuove connessioni."
        actionHref="/eventi"
        actionLabel="Scopri gli eventi"
        emptyTitle="Nessun evento in programma."
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
