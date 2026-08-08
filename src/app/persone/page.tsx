import type { Metadata } from "next";
import Link from "next/link";
import { HomeDomainSection } from "@/components/home/HomeDomainSection";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ecosystems } from "@/data/ecosystems";
import { listHomeProfessionals } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Persone",
  description:
    "Ecosistema Persone della rete: professionisti pubblici, competenze e ingresso all’area riservata.",
};

const eco = ecosystems.find((e) => e.id === "persone")!;

export default async function PersoneHubPage() {
  const professionals = await listHomeProfessionals(6).catch(() => []);

  return (
    <>
      <Section>
        <Container className="max-w-3xl space-y-6">
          <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
            Ecosistema
          </p>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {eco.label}
          </h1>
          <p className="text-ink-muted text-lg leading-7">{eco.description}</p>

          <div className="border-line bg-surface-elevated space-y-3 rounded-md border p-5">
            <h2 className="text-ink text-base font-semibold">
              Limite v1 (onesto)
            </h2>
            <p className="text-ink-muted text-sm leading-6">
              Non esiste ancora una directory pubblica completa di tutte le
              Persone. In v1 puoi esplorare i{" "}
              <strong className="text-ink font-medium">
                profili professionali pubblici
              </strong>
              . Account, ruoli e autorizzazioni restano privati nell&apos;area
              riservata.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/professionisti">
              Esplora i professionisti
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
              — quando pubbliche, emergono dalle schede professionali e dalle
              relazioni.
            </li>
            <li>
              <Link href="/servizi" className="text-brand font-medium">
                Servizi
              </Link>{" "}
              — offerte e richieste collegate a persone/professionisti.
            </li>
            <li>
              Competenze, lingue, territori e settori: filtri e schede dove già
              disponibili nei profili pubblici.
            </li>
          </ul>
        </Container>
      </Section>

      {professionals.length === 0 ? (
        <Section className="bg-surface-elevated">
          <Container>
            <PublicEmpty
              title="Nessun professionista pubblico al momento"
              description="Quando i profili professionali saranno pubblicati, compariranno qui."
            />
          </Container>
        </Section>
      ) : (
        <HomeDomainSection
          className="bg-surface-elevated py-14 sm:py-16 lg:py-20"
          eyebrow="Professionisti"
          title="Profili professionali pubblici"
          description="Ruolo specializzato nella rete — non sostituto dell’ecosistema Persone."
          actionHref="/professionisti"
          actionLabel="Vedi tutti"
          items={professionals.map((p) => ({
            href: `/professionisti/${p.id}`,
            title: p.headline || "Professionista",
            description: p.summary,
            meta: [p.practice_mode_code].filter(Boolean) as string[],
          }))}
        />
      )}
    </>
  );
}
