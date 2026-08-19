import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicContentBySlug } from "@/lib/data/public/contents";
import { isStoryContentType } from "@/lib/data/public/stories";
import { countryDisplayNameIt } from "@/lib/public/geography";
import { CONTENT_TYPES, formatItalianDate, label } from "@/lib/public/labels";
import { safeHttpsUrl, youtubePrivacyEmbedUrl } from "@/lib/public/story-media";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublicContentBySlug(slug);
  if (!content || !isStoryContentType(content.type_code)) {
    return { title: "Storia non trovata" };
  }
  return {
    title: content.title,
    description: content.abstract ?? undefined,
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const content = await getPublicContentBySlug(slug);

  if (!content || !isStoryContentType(content.type_code)) notFound();

  const isPlainText = content.body_format === "plain_text";
  const origins = content.geographies
    .filter((item) => item.relation_kind === "origin" && item.country_code)
    .map((item) => countryDisplayNameIt(item.country_code));
  const destinations = content.geographies
    .filter((item) => item.relation_kind === "destination" && item.country_code)
    .map((item) => countryDisplayNameIt(item.country_code));
  const focusCountries = content.geographies
    .filter((item) => item.relation_kind === "focus" && item.country_code)
    .map((item) => countryDisplayNameIt(item.country_code));

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <Link
        href="/storie"
        className="text-sm font-medium text-black underline underline-offset-4"
      >
        ← Storie e interviste
      </Link>

      <article className="mt-8">
        <header className="border-b border-black pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
            {label(CONTENT_TYPES, content.type_code)}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl">
            {content.title}
          </h1>
          {content.abstract ? (
            <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">
              {content.abstract}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
            {content.published_at ? (
              <span>Pubblicato il {formatItalianDate(content.published_at)}</span>
            ) : null}
            <span>Immigrati Imprenditori · Voci</span>
          </div>
        </header>

        {origins.length > 0 || destinations.length > 0 || focusCountries.length > 0 || content.sectors.length > 0 ? (
          <section className="grid gap-5 border-b border-black py-6 text-sm sm:grid-cols-2" aria-label="Contesto della storia">
            {origins.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Origine</p>
                <p className="mt-1 font-medium text-black">{origins.join(", ")}</p>
              </div>
            ) : null}
            {destinations.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Paese di attività / destinazione</p>
                <p className="mt-1 font-medium text-black">{destinations.join(", ")}</p>
              </div>
            ) : null}
            {focusCountries.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Paese principale</p>
                <p className="mt-1 font-medium text-black">{focusCountries.join(", ")}</p>
              </div>
            ) : null}
            {content.sectors.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Settore</p>
                <p className="mt-1 font-medium text-black">
                  {content.sectors.map((sector) => sector.sector_name).join(", ")}
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {content.cover_url ? (
          <figure className="border-b border-black py-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.cover_url}
              alt=""
              className="max-h-[560px] w-full object-cover"
            />
          </figure>
        ) : null}

        {content.media.length > 0 ? (
          <section className="space-y-8 border-b border-black py-8" aria-labelledby="media-heading">
            <h2 id="media-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Video e materiali
            </h2>
            {content.media.map((media) => {
              const youtubeUrl =
                media.provider === "youtube"
                  ? youtubePrivacyEmbedUrl(media.external_id)
                  : null;
              const externalUrl = safeHttpsUrl(media.url);

              if (media.media_kind === "video" && youtubeUrl) {
                return (
                  <figure key={media.id}>
                    <div className="aspect-video w-full overflow-hidden bg-black">
                      <iframe
                        src={youtubeUrl}
                        title={media.title ?? content.title}
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    {media.title || media.caption ? (
                      <figcaption className="mt-3 text-sm leading-6 text-neutral-600">
                        {media.title ? <strong className="font-semibold text-black">{media.title}</strong> : null}
                        {media.title && media.caption ? " — " : null}
                        {media.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                );
              }

              if (!externalUrl) return null;
              return (
                <div key={media.id} className="border-t border-neutral-300 pt-4 first:border-t-0 first:pt-0">
                  <p className="text-sm font-semibold text-black">
                    {media.title ?? (media.media_kind === "audio" ? "Audio" : media.media_kind === "document" ? "Documento" : "Materiale")}
                  </p>
                  {media.caption ? <p className="mt-1 text-sm leading-6 text-neutral-600">{media.caption}</p> : null}
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-black underline underline-offset-4"
                  >
                    Apri il materiale
                  </a>
                </div>
              );
            })}
          </section>
        ) : null}

        <section className="py-10">
          {isPlainText ? (
            <div className="mx-auto max-w-3xl space-y-5 text-base leading-8 text-neutral-800">
              {content.body.split("\n\n").map((paragraph, index) => (
                <p key={index} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <pre className="mx-auto max-w-3xl overflow-x-auto whitespace-pre-wrap border border-neutral-300 p-5 text-sm leading-7 text-neutral-700">
              {content.body}
            </pre>
          )}
        </section>

        {content.source_url ? (
          <footer className="border-t border-black pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Fonte / approfondimento
            </p>
            <a
              href={content.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block break-all text-sm font-medium text-black underline underline-offset-4"
            >
              Apri la fonte originale
            </a>
          </footer>
        ) : null}
      </article>

      <aside className="mt-12 grid gap-5 border-t border-black pt-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-black">Conosci un&apos;altra storia?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Segnala alla redazione un imprenditore, un&apos;esperienza o una voce che
            merita di essere documentata.
          </p>
        </div>
        <Link
          href="/contribuisci"
          className="inline-block border border-black bg-black px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-white hover:text-black"
        >
          Proponi una storia
        </Link>
      </aside>
    </main>
  );
}
