import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { signInEditorialAction } from "@/lib/auth/actions";
import { getApplicationSession } from "@/lib/session/get-application-session";

export const metadata: Metadata = {
  title: "Accedi",
  description: "Accesso riservato alla redazione e ai contributori autorizzati del Centro Studi.",
};

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  missing: "Inserisci email e password.",
  credentials: "Credenziali non valide.",
  account: "L’account non è ancora operativo.",
  role: "Questo account non dispone di un ruolo abilitato.",
};

function safeNextPath(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/app/redazione";
  }
  return value;
}

export default async function AccediPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const session = await getApplicationSession();

  if (session?.isActiveAccount) {
    if (session.isEditor || session.isApplicationAdmin) {
      redirect("/app/redazione");
    }
    if (session.isContributor) {
      redirect("/app/contributore");
    }
  }

  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <Container className="py-12 sm:py-16">
      <div className="border-line bg-surface-elevated mx-auto max-w-md rounded-md border p-6 shadow-soft sm:p-8">
        <h1 className="text-ink text-2xl font-semibold tracking-tight">Accedi</h1>
        <p className="text-ink-muted mt-2 text-sm">
          Area riservata ai redattori e ai contributori autorizzati del Centro Studi.
        </p>

        {errorMessage ? (
          <p className="mt-4 rounded-md border px-3 py-2 text-sm" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <form action={signInEditorialAction} className="mt-6 space-y-4">
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
