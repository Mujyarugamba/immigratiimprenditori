import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { MfaSecurityPanel } from "@/components/app/MfaSecurityPanel";
import { signOutEditorialAction } from "@/lib/auth/actions";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Verifica MFA",
  description: "Secondo fattore obbligatorio per l’area redazionale del Centro Studi.",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

function safeNextPath(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value === "/app/redazione" || value.startsWith("/app/redazione/")) return value;
  return "/app/redazione";
}

export default async function MandatoryMfaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const session = await getApplicationSession();

  if (!session) {
    redirect(`/accedi?next=${encodeURIComponent(next)}`);
  }
  if (!session.isActiveAccount) {
    redirect(`/accedi?error=account&next=${encodeURIComponent(next)}`);
  }
  if (!session.isEditor && !session.isApplicationAdmin) {
    redirect(`/accedi?error=role&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!assurance.error && assurance.data.currentLevel === "aal2") {
    redirect(next);
  }

  return (
    <Container className="py-10 sm:py-14">
      <section className="mx-auto max-w-2xl pb-12">
        <div className="mb-4 flex justify-end">
          <form action={signOutEditorialAction}>
            <button
              type="submit"
              className="text-ink-muted hover:text-ink text-sm font-medium"
            >
              Esci
            </button>
          </form>
        </div>
        <header className="mb-6">
          <p className="text-ink-muted text-sm font-medium uppercase tracking-[0.12em]">
            Area riservata
          </p>
          <h1 className="text-ink mt-2 text-3xl font-semibold tracking-tight">
            Verifica in due passaggi
          </h1>
          <p className="text-ink-muted mt-3 text-sm leading-6">
            Per i ruoli di redazione e amministrazione il secondo fattore TOTP è obbligatorio.
            Se non hai ancora un autenticatore verificato puoi registrarlo qui senza perdere
            l’accesso all’account.
          </p>
        </header>
        <MfaSecurityPanel required nextPath={next} />
      </section>
    </Container>
  );
}
