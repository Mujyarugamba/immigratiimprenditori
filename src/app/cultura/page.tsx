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
    "Cultura come rete di incontri, persone, organizzazioni, imprese, opportunità, collaborazioni, servizi e storie — classificazioni strutturali dei domini, senza duplicare i fatti.",
};

export default async function CulturaHubPage() {
  const {
    events,
    opportunities,
    collaborations,
    professionals,
    organizations,
    businesses,
    serviceOffers,
    serviceRequests,
    contents,
    markets,
  } = await loadCultureHub();

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
            pubblicati nei domini della rete, con classificazione strutturata.
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
              description="Quando verranno pubblicati eventi di tipo culturale con edizioni future, compariranno qui."
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

      <Section id="opportunita-collaborazioni" className="py-14 sm:py-16 lg:py-20">
        <Container className="space-y-14">
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Opportunità e collaborazioni
                </p>
                <h2 className="text-ink text-2xl font-semibold tracking-tight">
                  Occasioni culturali nella rete
                </h2>
                <p className="text-ink-muted text-sm leading-6">
                  Opportunità con ambito culturale strutturato, oppure collegate
                  a un evento culturale. Collaborazioni con ambito culturale —
                  indipendentemente dalla forma.
                </p>
              </div>
              <Link
                href="/opportunita?ambito=culture"
                className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
              >
                Esplora le opportunità
              </Link>
            </div>
            {opportunities.length === 0 ? (
              <PublicEmpty
                title="Nessuna opportunità culturale pubblicata."
                description="Compariranno qui opportunità con ambito culturale, patrimonio o industrie creative, oppure collegate a eventi culturali pubblici."
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
          </div>

          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-ink text-2xl font-semibold tracking-tight">
                  Collaborazioni culturali
                </h2>
                <p className="text-ink-muted text-sm leading-6">
                  Schede pubbliche con ambito culturale strutturato. La forma
                  (ricerca, partnership, progetto…) non determina da sola
                  l&apos;inclusione.
                </p>
              </div>
              <Link
                href="/collaborazioni?ambito=culture"
                className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
              >
                Esplora le collaborazioni
              </Link>
            </div>
            {collaborations.length === 0 ? (
              <PublicEmpty
                title="Nessuna collaborazione culturale pubblicata."
                description="Compariranno qui collaborazioni con ambito cultura, patrimonio o industrie creative."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {collaborations.map((c) => (
                  <PublicResultCard
                    key={c.id}
                    href={`/collaborazioni/${c.slug}`}
                    title={c.title}
                    description={c.object_text}
                    meta={[c.form_code, c.operational_status].filter(
                      Boolean,
                    ) as string[]}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>

      <Section
        id="persone"
        className="bg-surface-elevated py-14 sm:py-16 lg:py-20"
      >
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
                Persone e competenze
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-tight">
                Professionisti culturali e creativi
              </h2>
              <p className="text-ink-muted text-sm leading-6">
                Profili pubblici con categorie professionali culturali/creative
                strutturate, inclusa la mediazione culturale. Non è una
                directory di artisti.
              </p>
            </div>
            <Link
              href="/professionisti?categoria=cultural_mediation"
              className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
            >
              Vai ai professionisti
            </Link>
          </div>
          {professionals.length === 0 ? (
            <PublicEmpty
              title="Nessun professionista culturale o creativo pubblicato."
              description="Compariranno qui profili con categorie culturali/creative o mediazione culturale."
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
        </Container>
      </Section>

      <Section id="attori" className="py-14 sm:py-16 lg:py-20">
        <Container className="space-y-14">
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl space-y-2">
                <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
                  Organizzazioni e imprese
                </p>
                <h2 className="text-ink text-2xl font-semibold tracking-tight">
                  Organizzazioni culturali
                </h2>
                <p className="text-ink-muted text-sm leading-6">
                  Organizzazioni pubbliche con ambito di attività culturale,
                  patrimonio o industrie creative. Il tipo giuridico da solo non
                  basta.
                </p>
              </div>
              <Link
                href="/organizzazioni?ambito=culture"
                className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
              >
                Organizzazioni
              </Link>
            </div>
            {organizations.length === 0 ? (
              <PublicEmpty
                title="Nessuna organizzazione culturale pubblicata."
                description="Compariranno qui organizzazioni con ambito cultura, patrimonio o industrie creative."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizations.map((o) => (
                  <PublicResultCard
                    key={o.id}
                    href={`/organizzazioni/${o.slug}`}
                    title={o.name}
                    description={o.summary}
                    meta={[o.primary_scope_code, o.seat_city_label].filter(
                      Boolean,
                    ) as string[]}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-ink text-2xl font-semibold tracking-tight">
                  Imprese culturali e creative
                </h2>
                <p className="text-ink-muted text-sm leading-6">
                  Imprese pubbliche con dichiarazione di settore nelle industrie
                  culturali e creative.
                </p>
              </div>
              <Link
                href="/imprese"
                className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
              >
                Imprese
              </Link>
            </div>
            {businesses.length === 0 ? (
              <PublicEmpty
                title="Nessuna impresa culturale o creativa pubblicata."
                description="Compariranno qui imprese con settori CCI dichiarati (audiovisivo, editoria, musica, spettacolo, design, moda, artigianato, patrimonio)."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {businesses.map((b) => (
                  <PublicResultCard
                    key={b.id}
                    href={`/imprese/${b.id}`}
                    title={b.public_name}
                    description={b.summary}
                    meta={[b.organization_form, b.substantial_status].filter(
                      Boolean,
                    ) as string[]}
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>

      <Section id="servizi" className="bg-surface-elevated py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
                Servizi
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-tight">
                Servizi culturali e creativi
              </h2>
              <p className="text-ink-muted text-sm leading-6">
                Offerte e richieste pubbliche nella categoria strutturata
                culturale/creativa. I servizi linguistici restano distinti.
              </p>
            </div>
            <Link
              href="/servizi?categoria=cultural_creative"
              className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
            >
              Esplora i servizi
            </Link>
          </div>
          {serviceOffers.length === 0 && serviceRequests.length === 0 ? (
            <PublicEmpty
              title="Nessun servizio culturale o creativo pubblicato."
              description="Compariranno qui offerte e richieste con categoria cultural_creative."
            />
          ) : (
            <div className="space-y-10">
              {serviceOffers.length > 0 ? (
                <div>
                  <h3 className="text-ink mb-4 text-lg font-semibold">
                    Offerte
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {serviceOffers.map((s) => (
                      <PublicResultCard
                        key={s.id}
                        href={`/servizi/offerte/${s.id}`}
                        title={s.title}
                        description={s.summary}
                        meta={[s.delivery_mode, s.availability_status].filter(
                          Boolean,
                        ) as string[]}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {serviceRequests.length > 0 ? (
                <div>
                  <h3 className="text-ink mb-4 text-lg font-semibold">
                    Richieste
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {serviceRequests.map((s) => (
                      <PublicResultCard
                        key={s.id}
                        href={`/servizi/richieste/${s.id}`}
                        title={s.title}
                        description={s.summary}
                        meta={[s.delivery_mode, s.process_status].filter(
                          Boolean,
                        ) as string[]}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </Container>
      </Section>

      <Section id="storie" className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-brand text-[11px] font-semibold tracking-[0.16em] uppercase">
                Storie e contenuti
              </p>
              <h2 className="text-ink text-2xl font-semibold tracking-tight">
                Contenuti culturali
              </h2>
              <p className="text-ink-muted text-sm leading-6">
                Contenuti con categoria cultura, oppure collegati a un evento
                culturale. La sola categoria &quot;Eventi e comunità&quot; non
                basta.
              </p>
            </div>
            <Link
              href="/contenuti?categoria=culture"
              className="text-brand hover:text-brand-dark text-sm font-semibold whitespace-nowrap"
            >
              Notizie e guide
            </Link>
          </div>
          {contents.length === 0 ? (
            <PublicEmpty
              title="Nessun contenuto culturale pubblicato."
              description="Compariranno qui contenuti con categoria cultura, oppure collegati a eventi culturali pubblici."
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
        <Section id="mercati" className="bg-surface-elevated py-14 sm:py-16 lg:py-20">
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
            Cultura resta un livello trasversale: i fatti vivono nei loro
            ecosistemi. Entra nella rete per pubblicare e collegare.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/registrati" variant="accent">
              Registrati
            </ButtonLink>
            <ButtonLink href="/pubblica">Pubblica</ButtonLink>
            <ButtonLink href="/eventi?tipo=cultural" variant="secondary">
              Scopri gli eventi
            </ButtonLink>
            <ButtonLink href="/opportunita" variant="secondary">
              Esplora opportunità
            </ButtonLink>
            <ButtonLink href="/collaborazioni?ambito=culture" variant="secondary">
              Collaborazioni
            </ButtonLink>
            <ButtonLink href="/servizi?categoria=cultural_creative" variant="ghost">
              Servizi culturali
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
