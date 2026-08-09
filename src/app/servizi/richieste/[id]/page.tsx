import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { isCultureClassifiedService } from "@/lib/data/public/culture";
import { getPublicServiceRequestById } from "@/lib/data/public/services";
import {
  label,
  SERVICE_CATEGORIES,
  SERVICE_DELIVERY_MODES,
  SERVICE_REQUEST_STATUS,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const request = await getPublicServiceRequestById(id);
  if (!request) {
    return { title: "Non trovato" };
  }
  return {
    title: request.title,
    description: request.summary ?? undefined,
  };
}

export default async function ServizioRichiestaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const request = await getPublicServiceRequestById(id);

  if (!request) {
    notFound();
  }

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/servizi?tipo=richiesta"
            className="text-brand hover:text-brand-dark text-sm font-medium"
          >
            ← Torna all&apos;elenco servizi
          </Link>
          {isCultureClassifiedService({
            categoryCode: request.category_code,
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
            <Badge tone="brand">Richiesta</Badge>
            <Badge tone="soft">
              {label(SERVICE_CATEGORIES, request.category_code)}
            </Badge>
          </div>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {request.title}
          </h1>
          {request.summary ? (
            <p className="text-ink-muted text-lg leading-7">{request.summary}</p>
          ) : null}
        </header>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Descrizione</h2>
          <p className="text-ink-muted whitespace-pre-wrap text-sm leading-7">
            {request.description}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Modalità di erogazione</h2>
          <p className="text-ink-muted text-sm">
            {label(SERVICE_DELIVERY_MODES, request.delivery_mode)}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Stato</h2>
          <p className="text-ink-muted text-sm">
            {label(SERVICE_REQUEST_STATUS, request.process_status)}
          </p>
        </section>
      </Container>
    </Section>
  );
}
