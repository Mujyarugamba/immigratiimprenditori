import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { languageAccessItems } from "@/data/home/languages";

export function LanguagesSection() {
  const items = languageAccessItems.slice(0, 4);

  return (
    <Section className="bg-brand py-14 sm:py-16 lg:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <div className="max-w-xl space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/65 uppercase">
              Lingue e mercati
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Competenze che aprono mercati
            </h2>
            <p className="text-base leading-7 text-white/75">
              Interpreti, traduttori e professionisti con conoscenza dei mercati
              e linguaggio d’impresa.
            </p>
          </div>
          <Link
            href="/lingue-e-mercati"
            className="text-brand hover:bg-surface inline-flex w-fit items-center justify-center rounded-sm bg-white px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Trova competenze linguistiche
          </Link>
        </div>

        <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block border border-white/20 bg-white/5 px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
