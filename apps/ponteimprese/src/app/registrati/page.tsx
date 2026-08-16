import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container } from "@/components/ui/Container";
import { signUpAction } from "@/lib/auth/actions";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { destinationForAccountState } from "@/lib/session/guards";

export const metadata: Metadata = {
  title: "Registrati",
  description: "Crea un account sulla piattaforma Immigrati Imprenditori.",
};

export default async function RegistratiPage() {
  const session = await getApplicationSession();
  if (session) {
    redirect(destinationForAccountState(session));
  }

  return (
    <Container className="py-12 sm:py-16">
      <div className="border-line bg-surface-elevated mx-auto max-w-md rounded-md border p-6 shadow-soft sm:p-8">
        <h1 className="text-ink text-2xl font-semibold tracking-tight">
          Registrati
        </h1>
        <p className="text-ink-muted mt-2 text-sm">
          Crea il tuo account. Nel passaggio successivo potrai completare il
          profilo.
        </p>
        <div className="mt-6">
          <AuthForm mode="signup" action={signUpAction} />
        </div>
        <p className="text-ink-muted mt-6 text-center text-sm">
          Hai già un account?{" "}
          <Link
            href="/accedi"
            className="text-brand font-medium hover:underline"
          >
            Accedi
          </Link>
        </p>
      </div>
    </Container>
  );
}
