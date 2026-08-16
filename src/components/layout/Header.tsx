import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { csPrimaryNav, csSiteName } from "@/data/cs-navigation";

export function Header() {
  return (
    <header className="border-line border-b">
      <Container className="flex flex-wrap items-baseline justify-between gap-4 py-5">
        <Link href="/" className="text-brand max-w-md text-base font-semibold no-underline">
          {csSiteName}
        </Link>
        <nav aria-label="Navigazione principale">
          <ul className="flex flex-wrap gap-4">
            {csPrimaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-muted hover:text-ink text-sm">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
