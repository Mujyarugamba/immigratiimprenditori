"use client";

import { ErrorState } from "@/components/ui/states";

export default function AppError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void _error;
  return (
    <ErrorState
      title="Errore inatteso"
      description="Si è verificato un errore. Riprova più tardi."
      actionHref="/app"
      actionLabel="Torna alla dashboard"
      onRetry={reset}
    />
  );
}
