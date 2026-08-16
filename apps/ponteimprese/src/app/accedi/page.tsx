import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container } from "@/components/ui/Container";
import { signInAction } from "@/lib/auth/actions";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { destinationForAccountState } from "@/lib/session/guards";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Accedi",
  description: "Accedi alla piattaforma Immigrati Imprenditori.",
};

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function AccediPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next, "/app");
  const session = await getApplicationSession();
  if (session) {
    redirect(destinationForAccountState(session));
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="border-line bg-surface-elevated mx-auto max-w-md rounded-md border p-6 shadow-soft sm:p-8">
        <h1 className="text-ink text-2xl font-semibold tracking-tight">
          Accedi
        </h1>
        <p className="text-ink-muted mt-2 text-sm">
          Usa le tue credenziali per entrare nell&apos;area riservata.
        </p>
        {params.error === "callback" ? (
          <p className="text-accent-dark mt-4 text-sm" role="alert">
            Conferma accesso non riuscita. Riprova ad accedere o registrati di nuovo.
          </p>
        ) : null}
        <div className="mt-6">
          <AuthForm mode="login" action={signInAction} next={next} />
        </div>
        <p className="text-ink-muted mt-6 text-center text-sm">
          Non hai un account?{" "}
          <Link
            href="/registrati"
            className="text-brand font-medium hover:underline"
          >
            Registrati
          </Link>
        </p>
      </div>
    </Container>
  );
}
