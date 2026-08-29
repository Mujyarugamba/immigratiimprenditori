import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { signInEditorialAction } from "@/lib/auth/actions";
import { getApplicationSession } from "@/lib/session/get-application-session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Accesso area riservata",
  description: "Accesso riservato agli utenti autorizzati del Centro Studi.",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  missing: "Inserisci email e password.",
  credentials: "Credenziali non valide.",
  rate: "Troppi tentativi di accesso. Riprova più tardi.",
  account: "L’account non è abilitato.",
  role: "Questo account non dispone del ruolo richiesto per questa area.",
};

function safeNextPath(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value === "/app/contributore" || value.startsWith("/app/contributore/")) return value;
  if (value === "/app/redazione" || value.startsWith("/app/redazione/")) return value;
  return "/app/redazione";
}

export default async function AccediPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const contributorTarget = next.startsWith("/app/contributore");
  const session = await getApplicationSession();

  if (session?.isActiveAccount) {
    if (!contributorTarget && (session.isEditor || session.isApplicationAdmin)) {
      redirect(next);
    }
    if (contributorTarget) {
      const supabase = await createClient();
      const { data: isContributor } = await supabase.rpc("access_is_contributor");
      if (isContributor) redirect(next);
    }
  }

  const errorMessage = params.error ? errorMessages[params.error] : null;
  const title = contributorTarget ? "Accesso contributore" : "Accesso redazione";
  const description = contributorTarget
    ? "Area riservata ai contributori autorizzati del Centro Studi."
    : "Area riservata ai redattori autorizzati del Centro Studi.";

  return (
    <Container className="py-12 sm:py-16">
      <div className="border-line bg-surface-elevated mx-auto max-w-md rounded-md border p-6 shadow-soft sm:p-8">
        <h1 className="text-ink text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-ink-muted mt-2 text-sm">{description}</p>

        {errorMessage ? (
          <p id="login-form-error" className="mt-4 rounded-md border px-3 py-2 text-sm" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <form
          id="login-form"
          action={signInEditorialAction}
          aria-describedby={errorMessage ? "login-form-error" : undefined}
          className="mt-6 space-y-4"
        >
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="email" className="text-ink block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="border-line bg-surface mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-ink block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="border-line bg-surface mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-brand text-brand-fg w-full rounded-md px-4 py-2 text-sm font-medium hover:opacity-95"
          >
            Accedi
          </button>
        </form>
      </div>
    </Container>
  );
}
