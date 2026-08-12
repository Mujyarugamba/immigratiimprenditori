type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = "Nessun risultato.",
  description,
}: EmptyStateProps) {
  return (
    <div className="border-line bg-surface rounded-md border border-dashed px-4 py-3">
      <p className="text-ink text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-ink-muted mt-1 max-w-2xl text-sm leading-5">
          {description}
        </p>
      ) : null}
    </div>
  );
}
