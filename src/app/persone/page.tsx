import type { Metadata } from "next";
import Link from "next/link";
import { HomeDomainSection } from "@/components/home/HomeDomainSection";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ecosystems } from "@/data/ecosystems";
import { listHomeProfessionals } from "@/lib/data/public";
import { listHomePublicPeople } from "@/lib/data/public/people";
import { PRACTICE_MODES, label } from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Persone",
  description:
    "Persone e professionisti nella rete Immigrati Imprenditori.",
};

const eco = ecosystems.find((e) => e.id === "persone")!;

export default async function PersoneHubPage() {
  const [professionals, people] = await Promise.all([
    listHomeProfessionals(6).catch(() => []),
    listHomePublicPeople(6).catch(() => []),
  ]);

  return (
    <>
      <Section>
        <Container className="max-w-3xl space-y-6">
          <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
            Nella rete
          </p>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {eco.label}
          </h1>
          <p className="text-ink-muted text-lg leading-7">{eco.description}</p>

          <div className="border-line bg-surface-elevated space-y-3 rounded-md border p-5">
            <h2 className="text-ink text-base font-semibold">
              Profili e professioni
            </h2>
            <p className="text-ink-muted text-sm leading-6">
              Qui trovi le persone che hanno scelto di presentarsi e i
              professionisti disponibili. I dati di accesso restano privati.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/professionisti">
              Trova un professionista
            </ButtonLink>
            <ButtonLink href="/registrati" variant="accent">
              Crea il tuo profilo
            </ButtonLink>
            <ButtonLink href="/app/profilo" variant="secondary">
              Vai al tuo profilo
            </ButtonLink>
          </div>

          <ul className="text-ink-muted list-disc space-y-1 pl-5 text-sm leading-6">
            <li>
              <Link href="/imprese" className="text-brand font-medium">
                Imprese collegate
              </Link>{" "}
              — emergono dalle schede e dalle relazioni.
            </li>
            <li>
              <Link href="/servizi" className="text-brand font-medium">
                Servizi
              </Link>{" "}
              — offerte e richieste collegate a persone e professionisti.
            </li>
          </ul>
        </Container>
      </Section>

      {people.length === 0 ? (
        <Section className="bg-surface-elevated">
          <Container>
            <PublicEmpty title="Nessun profilo disponibile." />
          </Container>
        </Section>
      ) : (
        <HomeDomainSection
          className="bg-surface-elevated py-14 sm:py-16 lg:py-20"
          eyebrow="Profili"
          title="Persone nella rete"
          description="Persone che hanno scelto di presentarsi."
          actionHref="/registrati"
          actionLabel="Entra nella rete"
          emptyTitle="Nessun profilo disponibile."
          items={people.map((p) => ({
            href: `/persone/${p.slug}`,
            title: p.display_name,
            description: p.bio,
            meta: [p.city, p.country].filter(Boolean) as string[],
          }))}
        />
      )}

      {professionals.length === 0 ? null : (
        <HomeDomainSection
          className="py-14 sm:py-16 lg:py-20"
          eyebrow="Professionisti"
          title="Professionisti nella rete"
          description="Competenze e servizi professionali."
          actionHref="/professionisti"
          actionLabel="Vedi tutti i professionisti"
          emptyTitle="Nessun professionista disponibile."
          items={professionals.map((p) => ({
            href: `/professionisti/${p.id}`,
            title: p.headline || "Professionista",
            description: p.summary,
            meta: [label(PRACTICE_MODES, p.practice_mode_code)].filter(
              Boolean,
            ) as string[],
          }))}
        />
      )}
    </>
  );
}
