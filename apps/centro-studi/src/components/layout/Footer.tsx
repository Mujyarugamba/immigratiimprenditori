import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { csPrimaryNav } from "@/data/cs-navigation";

export function Footer() {
  return (
    <footer className="border-line mt-16 border-t">
      <Container className="flex flex-wrap justify-between gap-4 py-8 text-sm">
        <p className="text-ink-muted">Centro Studi sull&apos;imprenditoria migrante.</p>
        <nav aria-label="Piè di pagina">
          <ul className="flex flex-wrap gap-4">
            {csPrimaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-muted hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
