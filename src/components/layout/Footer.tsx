import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { csPrimaryNav } from "@/data/cs-navigation";

export function Footer() {
  return (
    <footer className="border-line mt-16 border-t">
      <Container className="py-8 text-sm">
        <div className="flex flex-wrap justify-between gap-6">
          <div className="max-w-md text-ink-muted">
            <p>Immigrati Imprenditori · Osservatorio e Centro Studi AIPEL.</p>
            <p className="mt-1">AIPEL · Codice fiscale 97342380157.</p>
          </div>
          <nav aria-label="Piè di pagina">
            <ul className="flex flex-wrap gap-4">
              {csPrimaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-muted hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/chi-siamo" className="text-ink-muted hover:text-ink">
                  Chi siamo
                </Link>
              </li>
              <li>
                <Link href="/sostieni" className="text-ink-muted hover:text-ink">
                  Sostieni l&apos;Osservatorio
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
