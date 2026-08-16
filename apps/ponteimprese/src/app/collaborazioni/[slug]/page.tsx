import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPublicCollaborationBySlug } from "@/lib/data/public/collaborations";
import { isCultureClassifiedCollaboration } from "@/lib/data/public/culture";
import {
  COLLABORATION_FORMS,
  COLLABORATION_STATUSES,
  label,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collaboration = await getPublicCollaborationBySlug(slug);
  if (!collaboration) {
    return { title: "Non trovato" };
  }
  return {
    title: collaboration.title,
    description: collaboration.object_text,
  };
}

export default async function CollaborazioneDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const collaboration = await getPublicCollaborationBySlug(slug);

  if (!collaboration) {
    notFound();
  }

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/collaborazioni"
            className="text-brand hover:text-brand-dark text-sm font-medium"
          >
            ← Torna all&apos;elenco collaborazioni
          </Link>
          {isCultureClassifiedCollaboration({
            activityScopeCode: collaboration.activity_scope_code,
            formCode: collaboration.form_code,
          }) ? (
            <Link
              href="/cultura"
              className="text-brand hover:text-brand-dark text-sm font-medium"
            >
              Esplora Cultura
            </Link>
          ) : null}
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">
              {label(COLLABORATION_FORMS, collaboration.form_code)}
            </Badge>
            <Badge tone="soft">
              {label(COLLABORATION_STATUSES, collaboration.operational_status)}
            </Badge>
          </div>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {collaboration.title}
          </h1>
        </header>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Oggetto</h2>
          <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
            {collaboration.object_text}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Finalità</h2>
          <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
            {collaboration.purpose_text}
          </p>
        </section>

        {collaboration.description ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Descrizione</h2>
            <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
              {collaboration.description}
            </p>
          </section>
        ) : null}

        {collaboration.participants.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Partecipanti</h2>
            <ul className="text-ink-muted space-y-2 text-sm">
              {collaboration.participants.map((participant) => (
                <li key={participant.id}>
                  {participant.person_name ?? participant.business_name ?? "Partecipante"}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </Section>
  );
}
