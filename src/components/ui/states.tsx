import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type StateProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

function StatePanel({
  title,
  description,
  actionHref,
  actionLabel,
  onRetry,
}: StateProps) {
  return (
    <Container className="py-16">
      <div className="border-line bg-surface-elevated mx-auto max-w-lg rounded-md border p-8 text-center shadow-soft">
        <h1 className="text-ink text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-ink-muted mt-3 text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionHref && actionLabel ? (
            <Button href={actionHref}>{actionLabel}</Button>
          ) : null}
          {onRetry ? (
            <Button type="button" variant="secondary" onClick={onRetry}>
              Riprova
            </Button>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

export function LoadingState({ label = "Caricamento…" }: { label?: string }) {
  return (
    <Container className="py-16">
      <p className="text-ink-muted text-center text-sm" role="status">
        {label}
      </p>
    </Container>
  );
}

export function EmptyStatePanel(props: StateProps) {
  return <StatePanel {...props} />;
}

export function ErrorState(props: StateProps) {
  return <StatePanel {...props} />;
}

export function ForbiddenState() {
  return (
    <StatePanel
      title="Accesso negato"
      description="Non hai i permessi necessari per questa area. Se pensi sia un errore, contatta l'amministratore."
      actionHref="/app"
      actionLabel="Torna alla dashboard"
    />
  );
}

export function UnauthenticatedState() {
  return (
    <StatePanel
      title="Accesso richiesto"
      description="Accedi per continuare."
      actionHref="/accedi"
      actionLabel="Accedi"
    />
  );
}

export function NotFoundState() {
  return (
    <StatePanel
      title="Pagina non trovata"
      description="La pagina richiesta non esiste o non è più disponibile."
      actionHref="/"
      actionLabel="Torna alla home"
    />
  );
}

export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-brand font-medium underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}
