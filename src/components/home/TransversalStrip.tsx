import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { transversalLayers } from "@/data/ecosystems";

export function TransversalStrip() {
  return (
    <Section className="border-line border-t py-10 sm:py-12">
      <Container>
        <div className="mb-5 max-w-2xl space-y-2">
          <h2 className="text-ink text-xl font-semibold tracking-tight">
            Altri percorsi nella rete
          </h2>
          <p className="text-ink-muted text-sm leading-6">
            Eventi, cultura, notizie e osservatorio arricchiscono la rete:
            aiutano a incontrarsi, informarsi e orientarsi.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {transversalLayers.map((layer) => (
            <li key={layer.id}>
              <Link
                href={layer.href}
                className="border-line hover:bg-surface-elevated flex h-full flex-col rounded-md border border-dashed p-4 transition-colors"
              >
                <span className="text-ink text-sm font-semibold">
                  {layer.label}
                </span>
                <span className="text-ink-muted mt-1 text-xs leading-5">
                  {layer.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
