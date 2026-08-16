import { PageFrame } from "@immigrati/ui-foundation";
import { centroStudiConfig } from "@immigrati/product-config";
import { csPrimaryNav } from "@/data/cs-navigation";
import Link from "next/link";

export default function HomePage() {
  return (
    <PageFrame>
      <main id="contenuto" className="mx-auto max-w-3xl py-16">
        <p className="text-accent text-xs font-semibold tracking-[0.14em] uppercase">
          Ricerca e divulgazione
        </p>
        <h1 className="text-brand mt-3 text-4xl font-medium tracking-tight">
          {centroStudiConfig.name}
        </h1>
        <p className="text-ink-muted mt-4 text-lg leading-7">
          {centroStudiConfig.description}
        </p>
        <ul className="mt-8 flex flex-wrap gap-4 text-sm">
          {csPrimaryNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-brand underline-offset-2 hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </PageFrame>
  );
}
