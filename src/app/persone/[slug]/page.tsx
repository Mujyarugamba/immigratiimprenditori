import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  formatPersonTerritory,
  getPublicPersonBySlug,
  getPublicProfessionalForPerson,
  listPublicBusinessesForPerson,
  personMetadataDescription,
} from "@/lib/data/public/people";
import {
  label,
  MEMBERSHIP_ROLE_LABELS,
  PRACTICE_MODES,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = await getPublicPersonBySlug(slug).catch(() => null);
  if (!person) {
    return { title: "Non trovato" };
  }
  return {
    title: person.display_name,
    description: personMetadataDescription(person),
  };
}

export default async function PersonaPubblicaPage({ params }: PageProps) {
  const { slug } = await params;
  const person = await getPublicPersonBySlug(slug).catch(() => null);
  if (!person) {
    notFound();
  }

  const [professional, businesses] = await Promise.all([
    getPublicProfessionalForPerson(person.id).catch(() => null),
    listPublicBusinessesForPerson(person.id).catch(() => []),
  ]);

  const territory = formatPersonTerritory(person);
  const websiteHref = normalizeWebsite(person.website);

  return (
    <Section>
      <Container className="max-w-3xl space-y-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/persone"
            className="text-brand hover:text-brand-dark text-sm font-medium"
          >
            ← Persone
          </Link>
          {professional?.isCultureRelated ? (
            <Link
              href="/cultura"
              className="text-brand hover:text-brand-dark text-sm font-medium"
            >
              Esplora Cultura
            </Link>
          ) : null}
        </div>

        <header className="space-y-5">
          {person.avatar_url ? (
            // User-supplied URL: plain img avoids Next image remote host allowlists.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.avatar_url}
              alt={`Foto di ${person.display_name}`}
              width={96}
              height={96}
              className="border-line h-24 w-24 rounded-full border object-cover"
            />
          ) : null}
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {person.display_name}
          </h1>
          {person.bio ? (
            <p className="text-ink-muted text-lg leading-7 whitespace-pre-wrap">
              {person.bio}
            </p>
          ) : null}
          {territory ? (
            <p className="text-ink-subtle text-sm">{territory}</p>
          ) : null}
          {person.role_description || person.organization_name ? (
            <p className="text-ink-muted text-sm">
              {[person.role_description, person.organization_name]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
          {websiteHref ? (
            <p className="text-sm">
              <a
                href={websiteHref}
                className="text-brand hover:text-brand-dark font-medium break-all"
                rel="noopener noreferrer"
                target="_blank"
              >
                {displayWebsite(person.website!)}
              </a>
            </p>
          ) : null}
        </header>

        {professional ? (
          <section className="space-y-4" aria-labelledby="competenze-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2
                id="competenze-heading"
                className="text-ink text-xl font-semibold"
              >
                Competenze e attività professionali
              </h2>
              <Link
                href={`/professionisti/${professional.id}`}
                className="text-brand hover:text-brand-dark text-sm font-medium"
              >
                Scheda professionale
              </Link>
            </div>
            {professional.headline ? (
              <p className="text-ink font-medium">{professional.headline}</p>
            ) : null}
            {professional.summary ? (
              <p className="text-ink-muted text-sm leading-6">
                {professional.summary}
              </p>
            ) : null}
            {professional.practice_mode_code ? (
              <p className="text-ink-muted text-sm">
                {label(PRACTICE_MODES, professional.practice_mode_code)}
              </p>
            ) : null}
            {professional.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {professional.categories.map((category) => (
                  <Badge
                    key={category.category_code}
                    tone={category.is_primary ? "accent" : "soft"}
                  >
                    {category.label_it}
                  </Badge>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {businesses.length > 0 ? (
          <section className="space-y-4" aria-labelledby="imprese-heading">
            <h2 id="imprese-heading" className="text-ink text-xl font-semibold">
              Imprese collegate
            </h2>
            <ul className="space-y-3">
              {businesses.map((item) => (
                <li
                  key={item.membershipId}
                  className="border-line bg-surface-elevated rounded-md border p-4"
                >
                  <Link
                    href={`/imprese/${item.business.id}`}
                    className="text-ink text-base font-semibold hover:underline"
                  >
                    {item.business.public_name}
                  </Link>
                  {item.roleId ? (
                    <p className="text-ink-subtle mt-1 text-xs">
                      {label(MEMBERSHIP_ROLE_LABELS, item.roleId)}
                    </p>
                  ) : null}
                  {item.business.summary ? (
                    <p className="text-ink-muted mt-2 text-sm leading-6">
                      {item.business.summary}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </Section>
  );
}

function normalizeWebsite(raw: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function displayWebsite(raw: string): string {
  return raw.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
