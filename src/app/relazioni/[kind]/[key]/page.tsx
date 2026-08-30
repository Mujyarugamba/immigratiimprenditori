import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicKnowledgeNeighborhood,
  knowledgeNodeRelationalHref,
  type KnowledgeConnection,
  type KnowledgePredicate,
} from "@/lib/data/public/knowledge";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";
import { breadcrumbStructuredData } from "@/lib/seo/structured-data";

type Props = {
  params: Promise<{ kind: string; key: string }>;
};

const KIND_LABELS: Record<string, string> = {
  country: "Paese",
  indicator: "Indicatore",
  sector: "Settore",
  route: "Rotta",
};

const PREDICATE_LABELS: Record<KnowledgePredicate, { outgoing: string; incoming: string }> = {
  observed_in: {
    outgoing: "è osservato in",
    incoming: "ospita osservazioni di",
  },
  classified_in: {
    outgoing: "è classificato nel settore",
    incoming: "classifica",
  },
  origin_of: {
    outgoing: "è origine della rotta",
    incoming: "ha come origine",
  },
  destination_of: {
    outgoing: "è destinazione della rotta",
    incoming: "ha come destinazione",
  },
};

function relationLabel(connection: KnowledgeConnection) {
  return PREDICATE_LABELS[connection.predicate][connection.direction];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, key } = await params;
  const neighborhood = await getPublicKnowledgeNeighborhood(kind, key);
  if (!neighborhood) return { title: "Relazione non trovata | Centro Studi" };
  const title = `${neighborhood.node.label} — Relazioni | Centro Studi`;
  const description = `Relazioni pubbliche e verificabili collegate a ${neighborhood.node.label} nel Knowledge Graph di Immigrati Imprenditori.`;
  const canonical = `/relazioni/${kind}/${encodeURIComponent(key)}`;
  return {
    title,
    description,
    alternates: { canonical },
    ...pageSocialMetadata({ title, description, pathname: canonical }),
  };
}

export default async function RelationalEntityPage({ params }: Props) {
  const { kind, key } = await params;
  const neighborhood = await getPublicKnowledgeNeighborhood(kind, key);
  if (!neighborhood) notFound();

  const counts = new Map<string, number>();
  for (const connection of neighborhood.connections) {
    counts.set(connection.node.kind, (counts.get(connection.node.kind) ?? 0) + 1);
  }
  const breadcrumbSchema = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Relazioni", path: "/relazioni" },
    {
      name: neighborhood.node.label,
      path: `/relazioni/${kind}/${encodeURIComponent(key)}`,
    },
  ]);

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav className="text-sm text-neutral-600" aria-label="Percorso">
        <Link href="/relazioni" className="underline underline-offset-4">Relazioni</Link>
        <span aria-hidden="true"> / </span>
        <span>{neighborhood.node.label}</span>
      </nav>

      <header className="mt-6 max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Knowledge Graph · {KIND_LABELS[neighborhood.node.kind] ?? neighborhood.node.kind}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          {neighborhood.node.label}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Questa pagina mostra soltanto connessioni ricavabili da dati pubblici già qualificati dal Centro Studi. Non introduce relazioni inferite dall&apos;AI.
        </p>
        <Link href={neighborhood.node.href} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">
          Apri la scheda principale →
        </Link>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Relazioni</p>
          <strong className="mt-2 block text-3xl text-black">{neighborhood.connections.length}</strong>
        </div>
        {Array.from(counts.entries()).slice(0, 3).map(([relatedKind, count]) => (
          <div key={relatedKind} className="bg-white p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">
              {KIND_LABELS[relatedKind] ?? relatedKind}
            </p>
            <strong className="mt-2 block text-3xl text-black">{count}</strong>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="border-b border-black pb-4">
          <h2 className="text-2xl font-semibold text-black">Connessioni documentate</h2>
        </div>
        <div className="divide-y divide-neutral-300">
          {neighborhood.connections.map((connection, index) => (
            <article key={`${connection.direction}-${connection.predicate}-${connection.node.id}-${index}`} className="grid gap-2 py-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {KIND_LABELS[neighborhood.node.kind] ?? neighborhood.node.kind}
                </p>
                <Link href={neighborhood.node.href} className="font-semibold underline underline-offset-4">
                  {neighborhood.node.label}
                </Link>
              </div>
              <span className="text-sm text-neutral-500">{relationLabel(connection)}</span>
              <div className="md:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                  {KIND_LABELS[connection.node.kind] ?? connection.node.kind}
                </p>
                <Link href={knowledgeNodeRelationalHref(connection.node)} className="font-semibold underline underline-offset-4">
                  {connection.node.label}
                </Link>
              </div>
            </article>
          ))}
          {neighborhood.connections.length === 0 ? (
            <p className="py-8 text-neutral-600">Non risultano ancora relazioni pubbliche sufficientemente documentate per questa entità.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
