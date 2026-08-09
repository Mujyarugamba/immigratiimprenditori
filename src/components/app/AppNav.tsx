import Link from "next/link";
import { BusinessSwitcher } from "@/components/app/BusinessSwitcher";
import { Button } from "@/components/ui/Button";
import { listMyBusinesses } from "@/lib/data/authenticated/businesses";
import {
  getSelectedBusinessId,
  resolveSelectedBusinessId,
} from "@/lib/business/selected-business";
import { signOutAction } from "@/lib/auth/actions";
import { labelAccountStatus } from "@/lib/app/user-labels";
import { navFlags } from "@/lib/session/guards";
import type { ApplicationSession } from "@/types/access";

const linkClass =
  "text-ink-muted hover:text-ink block rounded-sm px-2 py-1.5 text-sm font-medium transition-colors";

type AppNavProps = {
  session: ApplicationSession;
};

export async function AppNav({ session }: AppNavProps) {
  const flags = navFlags(session);
  const businesses =
    flags.showBusinesses && session.personId
      ? await listMyBusinesses(session.personId)
      : [];
  const ctxItems = businesses.filter((b) => b.isMember);
  const preferred = await getSelectedBusinessId();
  const selected = resolveSelectedBusinessId(
    preferred,
    ctxItems.map((b) => b.business.id),
  );

  return (
    <aside className="border-line bg-surface-elevated w-full shrink-0 border-b md:w-60 md:border-r md:border-b-0">
      <div className="flex flex-col gap-6 p-4 md:sticky md:top-0 md:min-h-[calc(100vh-4rem)]">
        <div>
          <p className="text-ink text-sm font-semibold">Area riservata</p>
          <p className="text-ink-subtle mt-1 truncate text-xs">
            {session.email ?? session.authUserId}
          </p>
          <p className="text-ink-muted mt-2 text-xs">
            Account:{" "}
            <span className="font-medium">
              {labelAccountStatus(session.accountStatus)}
            </span>
          </p>
        </div>

        {ctxItems.length > 0 ? (
          <BusinessSwitcher
            items={ctxItems}
            selectedBusinessId={selected}
          />
        ) : null}

        <nav className="flex flex-col gap-1" aria-label="Area riservata">
          <Link href="/app" className={linkClass}>
            Dashboard
          </Link>
          {flags.showOnboarding ? (
            <Link href="/app/onboarding" className={linkClass}>
              Completa il profilo
            </Link>
          ) : null}
          <Link href="/app/profilo" className={linkClass}>
            Il mio profilo
          </Link>
          {flags.showBusinesses ? (
            <Link href="/app/imprese" className={linkClass}>
              Le mie imprese
            </Link>
          ) : null}

          {flags.showEditor ? (
            <div className="mt-1 flex flex-col gap-0.5">
              <Link href="/app/redazione" className={linkClass}>
                Redazione
              </Link>
              <Link
                href="/app/redazione/contenuti"
                className={`${linkClass} pl-4 text-xs`}
              >
                Contenuti
              </Link>
              <Link
                href="/app/redazione/osservatorio"
                className={`${linkClass} pl-4 text-xs`}
              >
                Osservatorio
              </Link>
              <Link
                href="/app/redazione/organizzazioni"
                className={`${linkClass} pl-4 text-xs`}
              >
                Organizzazioni
              </Link>
            </div>
          ) : null}

          {flags.showAdmin ? (
            <div className="mt-1 flex flex-col gap-0.5">
              <Link href="/app/amministrazione" className={linkClass}>
                Amministrazione
              </Link>
              <Link
                href="/app/amministrazione/account"
                className={`${linkClass} pl-4 text-xs`}
              >
                Account
              </Link>
              <Link
                href="/app/amministrazione/ruoli"
                className={`${linkClass} pl-4 text-xs`}
              >
                Ruoli
              </Link>
              <Link
                href="/app/amministrazione/imprese"
                className={`${linkClass} pl-4 text-xs`}
              >
                Autorizzazioni imprese
              </Link>
            </div>
          ) : null}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <Button href="/" variant="ghost" size="sm" className="justify-start">
            Torna al sito
          </Button>
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Esci
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
