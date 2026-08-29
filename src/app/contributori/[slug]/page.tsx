import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://immigratiimprenditori.it";

type Props = { params: Promise<{ slug: string }> };

async function getProfile(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, slug, bio, organization_name, organization_type, role_description, city, province, region, country, website, avatar_url, published_at, updated_at")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) return { title: "Non trovato", robots: { index: false, follow: false } };
  const canonical = `/contributori/${profile.slug}`;
  return {
    title: `${profile.display_name} | Contributori`,
    description: profile.bio ?? `Profilo di ${profile.display_name} nel Centro Studi Immigrati Imprenditori.`,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: `${SITE_URL}${canonical}`,
      title: profile.display_name,
      description: profile.bio ?? undefined,
      images: profile.avatar_url ? [{ url: profile.avatar_url, alt: profile.display_name }] : undefined,
    },
  };
}

export default async function PublicContributorProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();

  const place = [profile.city, profile.province, profile.region, profile.country].filter(Boolean).join(" · ");
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.display_name,
    description: profile.bio ?? undefined,
    url: `${SITE_URL}/contributori/${profile.slug}`,
    image: profile.avatar_url ?? undefined,
    affiliation: profile.organization_name
      ? { "@type": "Organization", name: profile.organization_name }
      : undefined,
    jobTitle: profile.role_description ?? undefined,
    homeLocation: place ? { "@type": "Place", name: place } : undefined,
    sameAs: profile.website ? [profile.website] : undefined,
  };

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className="border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Centro Studi · Contributore</p>
        <div className="mt-4 flex items-start gap-6">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-24 w-24 border border-black object-cover" />
          ) : null}
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl">{profile.display_name}</h1>
            {profile.role_description ? <p className="mt-3 text-lg text-neutral-700">{profile.role_description}</p> : null}
            {profile.organization_name ? <p className="mt-1 text-sm font-semibold text-neutral-600">{profile.organization_name}</p> : null}
          </div>
        </div>
      </header>

      {profile.bio ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-black">Profilo</h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-neutral-700">{profile.bio}</p>
        </section>
      ) : null}

      <dl className="mt-8 grid gap-5 border-t border-black pt-6 text-sm sm:grid-cols-2">
        {place ? <div><dt className="text-neutral-500">Territorio</dt><dd className="mt-1 font-medium text-black">{place}</dd></div> : null}
        {profile.organization_type ? <div><dt className="text-neutral-500">Tipo organizzazione</dt><dd className="mt-1 font-medium text-black">{profile.organization_type}</dd></div> : null}
        {profile.website ? <div><dt className="text-neutral-500">Sito</dt><dd className="mt-1"><a href={profile.website} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">Apri sito ↗</a></dd></div> : null}
      </dl>
    </main>
  );
}
