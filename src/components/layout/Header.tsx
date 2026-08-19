import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { csPrimaryNav, csSiteName } from "@/data/cs-navigation";

export function Header() {
  return (
    <header className="border-b-2 border-black bg-white">
      <Container className="py-5">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <Link href="/" className="block text-xl font-semibold tracking-tight text-black no-underline">
              {csSiteName}
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-500">
              Osservatorio sull&apos;imprenditoria migrante · AIPEL
            </p>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/contribuisci" className="font-semibold text-black underline underline-offset-4">
              Contribuisci
            </Link>
            <Link href="/sostieni" className="text-neutral-600 hover:text-black">
              Sostieni
            </Link>
          </div>
        </div>
        <nav aria-label="Navigazione principale" className="mt-5 border-t border-neutral-300 pt-4">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {csPrimaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-neutral-700 underline-offset-4 hover:text-black hover:underline">
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
