import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicAuthorProfile,
  listPublicAuthorContents,
} from "@/lib/data/public/authors";
import { breadcrumbStructuredData } from "@/lib/seo/structured-data";

const SITE_URL = "https://www.immigratiimprenditori.it";

type Props = { params: Promise<{ slug: string }> };

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicAuthorProfile(slug).catch(() => null);
  if (!profile) {
    return { title: "Autore non trovato", robots: { index: false, follow: false } };
  }

  const canonical = `/autori/${profile.slug}`;
  return {
    title: `${profile.display_name} | Autori`,
    description:
      profile.bio ??
      `Profilo autore di ${profile.display_name} nel Centro Studi Immigrati Imprenditori.`,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: `${SITE_URL}${canonical}`,
      title: profile.display_name,
      description: profile.bio ?? undefined,
    },
  };
}

export default async function PublicAuthorPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getPublicAuthorProfile(slug).catch(() => null);
  if (!profile) notFound();
  const contents = await listPublicAuthorContents(profile.id).catch(() => []);

  const schema = {
    "@context": "https://schema.org",
    "@type": profile.profile_kind === "person" ? "Person" : "Organization",
    name: profile.display_name,
    description: profile.bio ?? undefined,
    url: `${SITE_URL}/autori/${profile.slug}`,
    affiliation:
      profile.profile_kind === "person" && profile.affiliation
        ? { "@type": "Organization", name: profile.affiliation }
        : undefined,
    sameAs: [
      profile.website_url,
      profile.orcid ? `https://orcid.org/${profile.orcid}` : null,
    ].filter(Boolean),
  };
  const breadcrumbSchema = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Esplora", path: "/esplora" },
    { name: "Autori e contributori", path: "/esplora/autori" },
    { name: profile.display_name, path: `/autori/${profile.slug}` },
  ]);

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mb-6">
        <Link href="/esplora/autori" className="text-sm font-semibold underline underline-offset-4">
          ← Autori e contributori
        </Link>
      </div>

      <header className="border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Centro Studi · Autore
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">
          {profile.display_name}
        </h1>
        {profile.affiliation ? (
          <p className="mt-3 text-lg text-neutral-700">{profile.affiliation}</p>
        ) : null}
        {profile.bio ? (
          <p className="mt-6 max-w-3xl whitespace-pre-wrap text-base leading-7 text-neutral-700">
            {profile.bio}
          </p>
        ) : null}
      </header>

      <dl className="mt-7 grid gap-5 text-sm sm:grid-cols-2">
        {profile.orcid ? (
          <div>
            <dt className="text-neutral-500">ORCID</dt>
            <dd className="mt-1 font-medium text-black">
              <a
                href={`https://orcid.org/${profile.orcid}`}
                rel="noreferrer"
                target="_blank"
                className="underline underline-offset-4"
              >
                {profile.orcid} ↗
              </a>
            </dd>
          </div>
        ) : null}
        {profile.website_url ? (
          <div>
            <dt className="text-neutral-500">Sito</dt>
            <dd className="mt-1 font-medium text-black">
              <a
                href={profile.website_url}
                rel="noreferrer"
                target="_blank"
                className="underline underline-offset-4"
              >
                Apri sito ↗
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

      <section className="mt-12 border-t border-black pt-8" aria-labelledby="author-publications">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="author-publications" className="text-2xl font-semibold text-black">
            Pubblicazioni e contributi
          </h2>
          <span className="text-sm text-neutral-600">{contents.length}</span>
        </div>

        {contents.length > 0 ? (
          <div className="mt-5 divide-y divide-neutral-300 border-y border-black">
            {contents.map((item) => (
              <article key={item.id} className="py-5">
                <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                  {item.type_code.replaceAll("_", " ")}
                  {item.published_at ? ` · ${formatDate(item.published_at)}` : ""}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-black">
                  <Link href={`/contenuti/${item.slug}`} className="underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                </h3>
                {item.abstract ? (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-700">{item.abstract}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-neutral-600">
            Nessuna pubblicazione pubblica collegata a questo profilo.
          </p>
        )}
      </section>
    </main>
  );
}
