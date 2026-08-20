import Link from "next/link";
import { Container } from "@/components/ui/Container";

const footerLinks = [
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Fonti e metodologia", href: "/fonti" },
  { label: "Contribuisci", href: "/contribuisci" },
  { label: "Sostieni l'Osservatorio", href: "/sostieni" },
  { label: "Privacy", href: "/privacy" },
  { label: "Accedi", href: "/accedi" },
] as const;

export function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-black">
      <Container className="py-9">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-base font-semibold text-black">Immigrati Imprenditori</p>
            <p className="mt-1 text-sm text-neutral-700">Osservatorio sull&apos;imprenditoria migrante · un progetto AIPEL.</p>
            <p className="mt-4 text-xs leading-5 text-neutral-500">
              Direzione editoriale: Ing. Augustin Mujyarugamba, Presidente AIPEL.
            </p>
          </div>
          <nav aria-label="Piè di pagina" className="md:text-right">
            <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm md:justify-end">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-neutral-700 underline-offset-4 hover:text-black hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-8 border-t border-neutral-300 pt-5 text-xs leading-5 text-neutral-500">
          <p>AIPEL — Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia.</p>
          <p className="mt-1">Sede legale: Viale Molise 54, 20137 Milano (MI) · CF 97342380157 · P.IVA 04222160964 · <a href="mailto:info@immigratiimprenditori.it" className="underline underline-offset-4 hover:text-black">info@immigratiimprenditori.it</a></p>
        </div>
      </Container>
    </footer>
  );
}
