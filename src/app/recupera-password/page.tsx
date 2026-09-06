import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { requestPasswordResetAction } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Recupera password",
  description: "Recupero password per l’area riservata del Centro Studi.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string; sent?: string }>;
};

function safeNextPath(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value === "/app/contributore" || value.startsWith("/app/contributore/")) return value;
  if (value === "/app/redazione" || value.startsWith("/app/redazione/")) return value;
  return "/app/redazione";
}

export default async function RecuperaPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const sent = params.sent === "1";

  return (
    <main>
      <Container className="py-12 sm:py-16">
        <div className="border-line bg-surface-elevated mx-auto max-w-md rounded-md border p-6 shadow-soft sm:p-8">
          <h1 className="text-ink text-2xl font-semibold tracking-tight">Recupera password</h1>
          <p className="text-ink-muted mt-2 text-sm leading-6">
            Inserisci l’indirizzo email associato al tuo account. Se l’account esiste,
            riceverai un link per scegliere una nuova password.
          </p>

          {sent ? (
            <p className="mt-5 rounded-md border px-3 py-3 text-sm" role="status">
              Richiesta ricevuta. Controlla la posta e, se necessario, anche la cartella spam.
            </p>
          ) : (
            <form action={requestPasswordResetAction} className="mt-6 space-y-4">
              <input type="hidden" name="next" value={next} />
              <div>
                <label htmlFor="recovery-email" className="text-ink block text-sm font-medium">
                  Email
                </label>
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="border-line bg-surface mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
                {params.error === "missing" ? (
                  <p className="mt-2 text-sm" role="alert">Inserisci un indirizzo email.</p>
                ) : null}
              </div>
              <button
                type="submit"
                className="bg-brand w-full rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-95"
              >
                Invia link di recupero
              </button>
            </form>
          )}

          <p className="mt-5 text-sm">
            <Link
              href={`/accedi?next=${encodeURIComponent(next)}`}
              className="text-ink font-medium underline underline-offset-2"
            >
              ← Torna all’accesso
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
