import type { Metadata } from "next";
import Link from "next/link";
import {
  getPublicKnowledgeSnapshot,
  knowledgeNodeRelationalHref,
} from "@/lib/data/public/knowledge";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const TITLE = "Relazioni tra dati e conoscenza | Centro Studi";
const DESCRIPTION =
  "Naviga le relazioni verificabili tra Paesi, indicatori, settori e rotte nell'ecosistema dati di Immigrati Imprenditori.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/relazioni" },
  ...pageSocialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    pathname: "/relazioni",
  }),
};

const PREDICATE_LABEL = {
  observed_in: "osservato in",
  classified_in: "classificato nel settore",
  origin_of: "origine della rotta",
  destination_of: "destinazione della rotta",
} as const;

export default async function RelazioniPage() {
  const graph = await getPublicKnowledgeSnapshot();
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const visibleEdges = graph.edges.filter(
    (edge) => nodeMap.has(edge.from) && nodeMap.has(edge.to),
  );

  return (
    <main id="contenuto" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Centro Studi · Knowledge Graph
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          Relazioni tra dati e conoscenza
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
          Questa vista collega soltanto entità già sostenute da dati pubblicati: Paesi, indicatori, settori e rotte. Ogni entità dispone ora di una pagina relazionale dedicata per attraversare il grafo senza perdere il collegamento alla scheda originale.
        </p>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black sm:grid-cols-2">
        <div className="bg-white p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Entità collegate</p>
          <strong className="mt-2 block text-3xl text-black">{graph.nodes.length}</strong>
        </div>
        <div className="bg-white p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Relazioni verificabili</p>
          <strong className="mt-2 block text-3xl text-black">{visibleEdges.length}</strong>
        </div>
      </section>

      <section className="mt-12">
        <div className="border-b border-black pb-4">
          <h2 className="text-2xl font-semibold text-black">Relazioni disponibili</h2>
        </div>
        <div className="divide-y divide-neutral-300">
          {visibleEdges.slice(0, 120).map((edge, index) => {
            const from = nodeMap.get(edge.from)!;
            const to = nodeMap.get(edge.to)!;
            return (
              <article key={`${edge.from}-${edge.predicate}-${edge.to}-${index}`} className="grid gap-2 py-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <Link href={knowledgeNodeRelationalHref(from)} className="font-semibold underline underline-offset-4">
                  {from.label}
                </Link>
                <span className="text-sm text-neutral-500">{PREDICATE_LABEL[edge.predicate]}</span>
                <Link href={knowledgeNodeRelationalHref(to)} className="font-semibold underline underline-offset-4 md:text-right">
                  {to.label}
                </Link>
              </article>
            );
          })}
          {visibleEdges.length === 0 ? (
            <p className="py-8 text-neutral-600">Non risultano ancora relazioni pubbliche sufficientemente documentate.</p>
          ) : null}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-5 text-sm font-semibold">
        <Link href="/atlante" className="underline underline-offset-4">Atlante →</Link>
        <Link href="/esplora/dati" className="underline underline-offset-4">Data Explorer →</Link>
        <Link href="/timeline" className="underline underline-offset-4">Timeline →</Link>
        <Link href="/api/v1/graph" className="underline underline-offset-4">API Knowledge Graph →</Link>
      </div>
    </main>
  );
}
