import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Pubblica",
  description:
    "Azioni per entrare nella rete: profilo, impresa, opportunità, collaborazioni, servizi e mercati.",
};

const actions = [
  {
    title: "Crea il tuo profilo",
    description:
      "Registrati e completa il tuo profilo nell’area riservata.",
    href: "/registrati",
    cta: "Crea il tuo profilo",
  },
  {
    title: "Collega la tua impresa",
    description:
      "Crea o collega un’impresa dall’area riservata.",
    href: "/app/imprese",
    cta: "Vai alle mie imprese",
  },
  {
    title: "Esplora opportunità",
    description:
      "Scopri le occasioni disponibili. Per pubblicarne una, usa l’area riservata dopo l’accesso.",
    href: "/opportunita",
    cta: "Trova un’opportunità",
  },
  {
    title: "Cerca una collaborazione",
    description:
      "Persone e organizzazioni che cercano o offrono una collaborazione.",
    href: "/collaborazioni",
    cta: "Cerca una collaborazione",
  },
  {
    title: "Offri o cerca un servizio",
    description:
      "Consulta chi offre un servizio e chi ne cerca uno.",
    href: "/servizi",
    cta: "Vedi i servizi",
  },
  {
    title: "Esplora i mercati",
    description:
      "Scopri paesi e aree internazionali; indica i tuoi mercati dall’area riservata.",
    href: "/mercati",
    cta: "Esplora i mercati",
  },
] as const;

export default function PubblicaPage() {
  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            Pubblica e fatti conoscere
          </h1>
          <p className="text-ink-muted text-lg leading-7">
            Scegli cosa pubblicare: profilo, impresa, opportunità, collaborazioni,
            servizi o mercati. Le azioni di pubblicazione avvengono nell&apos;area
            riservata.
          </p>
        </header>

        <ul className="space-y-3">
          {actions.map((action) => (
            <li
              key={action.href + action.title}
              className="border-line bg-surface-elevated rounded-md border p-4"
            >
              <h2 className="text-ink text-base font-semibold">{action.title}</h2>
              <p className="text-ink-muted mt-1 text-sm leading-6">
                {action.description}
              </p>
              <div className="mt-3">
                <ButtonLink href={action.href}>{action.cta}</ButtonLink>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-ink-muted text-sm leading-6">
          Hai già un account?{" "}
          <a href="/accedi" className="text-brand font-semibold">
            Accedi all&apos;area riservata
          </a>
          .
        </p>
      </Container>
    </Section>
  );
}
