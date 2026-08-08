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
        title="Competenze e professionisti pubblici"
        description="L’ecosistema Persone inizia dai profili professionali pubblicati. Il profilo personale si attiva nell’area riservata."
        actionHref="/persone"
        actionLabel="Apri l’ecosistema Persone"
        items={professionals.map((p) => ({
          href: `/professionisti/${p.id}`,
          title: p.headline || "Professionista",
          description: p.summary,
          meta: [p.practice_mode_code, p.availability_status].filter(
            Boolean,
          ) as string[],
        }))}
      />

      <HomeDomainSection
        className="bg-surface-elevated py-14 sm:py-16 lg:py-20"
        eyebrow="Imprese"
        title="Imprese nella rete"
        description="Schede pubbliche: un nodo da cui emergono settori, territori, servizi e mercati collegati."
        actionHref="/imprese"
        actionLabel="Vedi le imprese"
        items={businesses.map((b) => ({
          href: `/imprese/${b.id}`,
          title: b.public_name,
          description: b.summary,
          meta: [b.organization_form, b.substantial_status].filter(
            Boolean,
          ) as string[],
        }))}
      />

      <HomeDomainSection
        eyebrow="Opportunità e collaborazioni"
        title="Necessità, proposte, collaborazioni"
        description="Due modelli distinti, un solo percorso di scoperta: trovare o proporre."
        actionHref="/opportunita"
        actionLabel="Esplora l’ecosistema"
        items={[
          ...opportunities.map((o) => ({
            href: `/opportunita/${o.id}`,
            title: o.title,
            description: o.summary,
            badges: ["Opportunità"],
            meta: [o.origin, o.substantial_status].filter(Boolean) as string[],
          })),
          ...collaborations.slice(0, Math.max(0, 3 - opportunities.length)).map(
            (c) => ({
              href: `/collaborazioni/${c.slug}`,
              title: c.title,
              description: c.object_text ?? c.purpose_text,
              badges: ["Collaborazione"],
              meta: [c.form_code, c.operational_status].filter(
                Boolean,
              ) as string[],
            }),
          ),
        ]}
      />

      <HomeDomainSection
        className="bg-surface-elevated py-14 sm:py-16 lg:py-20"
        eyebrow="Mercati internazionali"
        title="Relazioni oltre confine"
        description="I mercati sono ingressi: imprese presenti, eventi e contenuti emergono dalle relazioni reali."
        actionHref="/mercati"
        actionLabel="Esplora i mercati"
        items={markets.map((m) => ({
          href: `/mercati/${m.code}`,
          title: m.name,
          description: m.summary,
          meta: [m.market_kind, m.substantial_status].filter(
            Boolean,
          ) as string[],
        }))}
      />

      <HomeDomainSection
        eyebrow="Servizi"
        title="Offerte per lavorare e crescere"
        description="Offerta ≠ richiesta. Qui trovi le offerte pubbliche; le richieste restano nella sezione dedicata."
        actionHref="/servizi"
        actionLabel="Vedi i servizi"
        items={services.map((s) => ({
          href: `/servizi/offerte/${s.id}`,
          title: s.title,
          description: s.summary,
          meta: [s.category_code, s.delivery_mode].filter(Boolean) as string[],
        }))}
      />

      <TransversalStrip />

      <HomeDomainSection
        className="bg-surface-elevated py-14 sm:py-16 lg:py-20"
        eyebrow="Eventi e contenuti"
        title="Ciò che arricchisce la rete"
        description="Eventi e narrazioni pubbliche collegati ai fatti — non l’identità della piattaforma."
        actionHref="/eventi"
        actionLabel="Vedi gli eventi"
        items={[
          ...events.map((e) => ({
            href: `/eventi/${e.id}`,
            title: e.title,
            description: e.summary,
            badges: ["Evento"],
            meta: [e.type_code].filter(Boolean) as string[],
          })),
          ...contents.slice(0, Math.max(0, 3 - events.length)).map((c) => ({
            href: `/contenuti/${c.slug}`,
            title: c.title,
            description: c.abstract,
            badges: ["Contenuto"],
            meta: [c.type_code].filter(Boolean) as string[],
          })),
        ]}
      />

      <FinalCta />
    </>
  );
}
