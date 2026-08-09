import type { Metadata } from "next";
import Link from "next/link";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PLATFORM_IDENTITY } from "@/data/ecosystems";
import { loadCultureHub } from "@/lib/data/public/culture";
import {
  EVENT_DELIVERY_MODES,
  formatItalianDateTime,
  label,
} from "@/lib/public/labels";

export const metadata: Metadata = {
  title: "Cultura",
  description:
    "Cultura come spazio di incontri e relazioni nella rete Immigrati Imprenditori: eventi culturali pubblici e connessioni strutturali a opportunità, storie e mercati — senza duplicare i fatti.",
};

export default async function CulturaHubPage() {
  const { events, opportunities, professionals, contents, markets } =
    await loadCultureHub();

  return (
    <>
      <Section>
        <Container className="max-w-3xl space-y-6">
          <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
            Livello trasversale
          </p>
          <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
            Cultura, incontri, relazioni.
          </h1>
          <p className="text-ink-muted text-lg leading-7">
            Concerti, teatro, mostre, festival e altri momenti culturali sono
            anche luoghi in cui le persone si incontrano. Da questi incontri
            possono nascere relazioni, collaborazioni e nuove opportunità.
          </p>
          <p className="text-ink-muted text-sm leading-6">
            Immigrati Imprenditori resta{" "}
            <span className="text-ink font-medium">{PLATFORM_IDENTITY}</span>{" "}
            Cultura non è un catalogo separato: aggrega fatti pubblici già
            pubblicati altrove, a partire dagli eventi culturali.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <ButtonLink href="#incontri">Scopri gli incontri</ButtonLink>
            <ButtonLink href="/registrati" variant="accent">
              Entra nella rete
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section id="incontri" className="bg-surface-elevated py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
                Prossimi incontri
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-tight">
                Eventi culturali pubblici
              </h2>
              <p className="text-ink-muted text-sm leading-6">
                Solo eventi classificati strutturalmente come culturali, con
                edizione imminente o in corso.
              </p>
            </div>
            <Link
              href="/eventi?tipo=cultural"
              className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
            >
              Vedi tutti gli eventi culturali
            </Link>
          </div>
          {events.length === 0 ? (
            <PublicEmpty
              title="Nessun incontro culturale in programma."
              description="Quando verranno pubblicati eventi di tipo culturale con edizioni future, compariranno qui. Nessun dato dimostrativo."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((item) => (
                <PublicResultCard
                  key={item.id}
                  href={`/eventi/${item.id}`}
                  title={item.title}
                  description={item.summary}
                  badges={[label(EVENT_DELIVERY_MODES, item.delivery_mode)]}
                  meta={
                    item.next_edition
                      ? ([
                          formatItalianDateTime(item.next_edition.starts_at),
                          item.next_edition.city_text ?? undefined,
                        ].filter(Boolean) as string[])
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
                Opportunità collegate
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-tight">
                Occasioni legate agli incontri culturali
              </h2>
              <p className="text-ink-muted text-sm leading-6">
                Solo opportunità pubbliche collegate strutturalmente a un evento
                culturale. Nessuna classificazione da titolo o descrizione.
              </p>
            </div>
            <Link
              href="/opportunita"
              className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
            >
              Esplora le opportunità
            </Link>
          </div>
          {opportunities.length === 0 ? (
            <PublicEmpty
              title="Nessuna opportunità collegata agli incontri culturali pubblicati."
              description="Compariranno qui solo opportunità referenziate da eventi culturali pubblici."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((o) => (
                <PublicResultCard
                  key={o.id}
                  href={`/opportunita/${o.id}`}
                  title={o.title}
                  description={o.summary}
                  meta={[o.origin, o.substantial_status].filter(
                    Boolean,
                  ) as string[]}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section className="bg-surface-elevated py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 max-w-2xl space-y-2">
            <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
              Persone e competenze
            </p>
            <h2 className="text-ink text-2xl font-semibold tracking-tight">
              Professionisti nella rete
            </h2>
            <p className="text-ink-muted text-sm leading-6">
              Profili pubblici con la categoria professionale strutturata
              &quot;Mediazione culturale&quot;. Non è una directory di artisti.
            </p>
          </div>
          {professionals.length === 0 ? (
            <PublicEmpty
              title="Nessun profilo con mediazione culturale pubblicato."
              description="La classificazione disponibile oggi riguarda solo la categoria professionale cultural_mediation."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {professionals.map((p) => (
                <PublicResultCard
                  key={p.id}
                  href={`/professionisti/${p.id}`}
                  title={p.headline || "Professionista"}
                  description={p.summary}
                  meta={[p.practice_mode_code, p.availability_status].filter(
                    Boolean,
                  ) as string[]}
                />
              ))}
            </div>
          )}
          <div className="mt-6">
            <Link
              href="/professionisti"
              className="text-brand hover:text-brand-dark text-sm font-semibold"
            >
              Vai ai professionisti
            </Link>
          </div>
        </Container>
      </Section>

      <Section className="py-14 sm:py-16 lg:py-20">
        <Container className="max-w-3xl space-y-4">
          <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
            Organizzazioni e imprese
          </p>
          <h2 className="text-ink text-2xl font-semibold tracking-tight">
            Attori della rete
          </h2>
          <p className="text-ink-muted text-sm leading-6">
            Non classifichiamo ancora organizzazioni o imprese come
            &quot;culturali&quot; senza un ambito strutturato dedicato. Finché
            quel dato non esiste, questa sezione non inventa elenchi.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/organizzazioni" variant="secondary">
              Organizzazioni
            </ButtonLink>
            <ButtonLink href="/imprese" variant="secondary">
              Imprese
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section className="bg-surface-elevated py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
                Storie dalla rete
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-tight">
                Contenuti collegati agli incontri culturali
              </h2>
              <p className="text-ink-muted text-sm leading-6">
                Solo contenuti pubblici con link strutturato a un evento
                culturale. La categoria &quot;Eventi e comunità&quot; da sola non
                basta.
              </p>
            </div>
            <Link
              href="/contenuti"
              className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
            >
              Notizie e guide
            </Link>
          </div>
          {contents.length === 0 ? (
            <PublicEmpty
              title="Nessuna storia collegata agli incontri culturali pubblicati."
              description="I contenuti compariranno qui quando saranno collegati a eventi culturali pubblici."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contents.map((c) => (
                <PublicResultCard
                  key={c.id}
                  href={`/contenuti/${c.slug}`}
                  title={c.title}
                  description={c.abstract}
                  meta={
                    c.published_at
                      ? [formatItalianDateTime(c.published_at)]
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {markets.length > 0 ? (
        <Section className="py-14 sm:py-16 lg:py-20">
          <Container>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Connessioni internazionali
                </p>
                <h2 className="text-ink text-2xl font-semibold tracking-tight">
                  Mercati collegati agli incontri culturali
                </h2>
                <p className="text-ink-muted text-sm leading-6">
                  Solo mercati collegati strutturalmente a eventi culturali.
                </p>
              </div>
              <Link
                href="/mercati"
                className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
              >
                Esplora i mercati
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {markets.map((m) => (
                <PublicResultCard
                  key={m.id}
                  href={`/mercati/${m.code}`}
                  title={m.name}
                  description={m.summary}
                  meta={[m.market_kind, m.substantial_status].filter(
                    Boolean,
                  ) as string[]}
                />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section className="border-line border-t py-14 sm:py-16 lg:py-20">
        <Container className="max-w-3xl space-y-6">
          <h2 className="text-ink text-2xl font-semibold tracking-tight">
            Continua nella rete
          </h2>
          <p className="text-ink-muted text-sm leading-6">
            Collaborazioni e servizi restano nei loro ecosistemi: qui non li
            etichettiamo come culturali senza una classificazione strutturata.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/registrati" variant="accent">
              Registrati
            </ButtonLink>
            <ButtonLink href="/pubblica">Pubblica</ButtonLink>
            <ButtonLink href="/collaborazioni" variant="secondary">
              Cerca una collaborazione
            </ButtonLink>
            <ButtonLink href="/eventi?tipo=cultural" variant="secondary">
              Scopri gli eventi
            </ButtonLink>
            <ButtonLink href="/opportunita" variant="secondary">
              Esplora opportunità
            </ButtonLink>
            <ButtonLink href="/servizi" variant="ghost">
              Esplora i servizi
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
