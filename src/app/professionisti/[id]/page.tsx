import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedLinks } from "@/components/public/RelatedLinks";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getPublicProfessionalById } from "@/lib/data/public/professionals";
import { relatedForProfessional } from "@/lib/data/public/related";
import {
  AVAILABILITY_STATUSES,
  label,
  PRACTICE_MODES,
} from "@/lib/public/labels";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getPublicProfessionalById(id);
  if (!profile) {
    return { title: "Non trovato" };
  }
  return {
    title: profile.headline ?? profile.person?.display_name ?? "Professionista",
    description: profile.summary ?? undefined,
  };
}

export default async function ProfessionistaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getPublicProfessionalById(id);

  if (!profile) {
    notFound();
  }

  const primaryCategories = profile.categories.filter((c) => c.is_primary);
  const otherCategories = profile.categories.filter((c) => !c.is_primary);
  const related = await relatedForProfessional({
    id: profile.id,
    person_id: profile.person_id,
    context_business_id: profile.context_business_id,
  }).catch(() => []);

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <Link
          href="/professionisti"
          className="text-brand hover:text-brand-dark text-sm font-medium"
        >
          ← Torna all&apos;elenco professionisti
        </Link>

        <header className="space-y-4">
          {profile.practice_mode_code ? (
            <Badge tone="brand">
              {label(PRACTICE_MODES, profile.practice_mode_code)}
            </Badge>
          ) : null}
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            {profile.headline ?? profile.person?.display_name ?? "Profilo professionale"}
          </h1>
          {profile.person?.display_name && profile.headline ? (
            <p className="text-ink-muted text-sm">{profile.person.display_name}</p>
          ) : null}
          {profile.summary ? (
            <p className="text-ink-muted text-lg leading-7">{profile.summary}</p>
          ) : null}
        </header>

        {profile.categories.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Ambiti professionali</h2>
            <div className="flex flex-wrap gap-2">
              {primaryCategories.map((category) => (
                <Badge key={category.category_code} tone="accent">
                  {category.label_it}
                </Badge>
              ))}
              {otherCategories.map((category) => (
                <Badge key={category.category_code} tone="soft">
                  {category.label_it}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        {profile.practice_mode_code ? (
          <section className="space-y-3">
            <h2 className="text-ink text-xl font-semibold">Modalità di esercizio</h2>
            <p className="text-ink-muted text-sm">
              {label(PRACTICE_MODES, profile.practice_mode_code)}
            </p>
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-ink text-xl font-semibold">Disponibilità</h2>
          <p className="text-ink-muted text-sm">
            {label(AVAILABILITY_STATUSES, profile.availability_status)}
          </p>
        </section>

        <RelatedLinks groups={related} />
      </Container>
    </Section>
  );
}
