import Link from "next/link";
import type { NetworkPersonContact } from "@/lib/data/authenticated/person-contact";

type Props = {
  personId: string;
  slug: string;
  isActiveRegistered: boolean;
  contact: NetworkPersonContact | null;
  hasAnySharedChannel: boolean;
};

/**
 * Level A: discovery only (website stays on parent page).
 * Level B: show shared professional contacts or CTA to sign in.
 */
export function PersonNetworkContact({
  slug,
  isActiveRegistered,
  contact,
  hasAnySharedChannel,
}: Props) {
  if (!isActiveRegistered) {
    if (!hasAnySharedChannel) {
      return null;
    }
    return (
      <section className="space-y-3" aria-labelledby="contatti-heading">
        <h2 id="contatti-heading" className="text-ink text-xl font-semibold">
          Contatti
        </h2>
        <p className="text-ink-muted text-sm leading-6">
          Questa persona ha condiviso recapiti professionali con la rete.
        </p>
        <Link
          href={`/accedi?next=${encodeURIComponent(`/persone/${slug}`)}`}
          className="bg-brand text-brand-foreground hover:bg-brand-dark inline-flex rounded-md px-4 py-2 text-sm font-medium"
        >
          Accedi per vedere i contatti
        </Link>
      </section>
    );
  }

  if (!contact?.phone && !contact?.contact_email) {
    return null;
  }

  return (
    <section className="space-y-3" aria-labelledby="contatti-heading">
      <h2 id="contatti-heading" className="text-ink text-xl font-semibold">
        Contatti
      </h2>
      <ul className="space-y-2 text-sm">
        {contact.phone ? (
          <li>
            <a
              href={`tel:${contact.phone.replace(/\s+/g, "")}`}
              className="text-brand hover:text-brand-dark font-medium"
            >
              Chiama {contact.phone}
            </a>
          </li>
        ) : null}
        {contact.contact_email ? (
          <li>
            <a
              href={`mailto:${contact.contact_email}`}
              className="text-brand hover:text-brand-dark font-medium break-all"
            >
              Scrivi a {contact.contact_email}
            </a>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
