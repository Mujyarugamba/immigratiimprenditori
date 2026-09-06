import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { updatePasswordAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Imposta nuova password",
  description: "Aggiornamento password per l’area riservata del Centro Studi.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  length: "La password deve contenere almeno 12 caratteri.",
  mismatch: "Le due password non coincidono.",
  update: "Non è stato possibile aggiornare la password. Richiedi un nuovo link di recupero.",
};

function safeNextPath(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value === "/app/contributore" || value.startsWith("/app/contributore/")) return value;
  if (value === "/app/redazione" || value.startsWith("/app/redazione/")) return value;
  return "/app/redazione";
}

export default async function AggiornaPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/accedi?error=recovery&next=${encodeURIComponent(next)}`);
  }

  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <main>
      <Container className="py-12 sm:py-16">
        <div className="border-line bg-surface-elevated mx-auto max-w-md rounded-md border p-6 shadow-soft sm:p-8">
          <h1 className="text-ink text-2xl font-semibold tracking-tight">Imposta nuova password</h1>
          <p className="text-ink-muted mt-2 text-sm leading-6">
            Scegli una nuova password di almeno 12 caratteri. Al termine dovrai accedere nuovamente.
          </p>

          {errorMessage ? (
            <p className="mt-4 rounded-md border px-3 py-2 text-sm" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <form action={updatePasswordAction} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label htmlFor="new-password" className="text-ink block text-sm font-medium">
                Nuova password
              </label>
              <input
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                className="border-line bg-surface mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="text-ink block text-sm font-medium">
                Conferma nuova password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                className="border-line bg-surface mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-brand w-full rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-95"
            >
              Aggiorna password
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}
