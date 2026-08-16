"use client";

import { ErrorState } from "@/components/ui/states";

export default function RootError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void _error;
  return (
    <ErrorState
      title="Si è verificato un problema"
      description="Riprova tra poco. Se il problema continua, torna alla home."
      actionHref="/"
      actionLabel="Torna alla home"
      onRetry={reset}
    />
  );
}
