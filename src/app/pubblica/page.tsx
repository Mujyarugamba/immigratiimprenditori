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
    description: "Registrati e completa la Persona nell’area riservata.",
    href: "/registrati",
  },
  {
    title: "Collega la tua impresa",
    description: "Crea o gestisci un’impresa nel workspace (CTX ≠ ACT).",
    href: "/app/imprese",
  },
  {
    title: "Esplora opportunità",
    description: "Scopri opportunità pubbliche; la pubblicazione avviene dal workspace.",
    href: "/opportunita",
  },
  {
    title: "Cerca una collaborazione",
    description: "Collaborazioni pubblicate nello stesso ecosistema delle opportunità.",
    href: "/collaborazioni",
  },
  {
    title: "Offri o cerca un servizio",
    description: "Offerte e richieste restano distinte nel modello dati.",
    href: "/servizi",
  },
  {
    title: "Esplora i mercati",
    description: "Indicazione mercati e presenze: area riservata + schede pubbliche.",
    href: "/mercati",
  },
] as const;

export default function PubblicaPage() {
  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            Pubblica e attiva i tuoi nodi
          </h1>
          <p className="text-ink-muted text-lg leading-7">
            Le azioni di scrittura avvengono nell&apos;area riservata. Da qui
            raggiungi i percorsi reali già disponibili — senza funzionalità
            inventate.
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
                <ButtonLink href={action.href}>Continua</ButtonLink>
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
