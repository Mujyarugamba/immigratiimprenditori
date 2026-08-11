type EmptyStateProps = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = "Nessun risultato.",
  description,
}: EmptyStateProps) {
  return (
    <div className="border-line bg-surface mt-8 rounded-md border border-dashed px-5 py-8">
      <h2 className="text-ink text-lg font-medium">{title}</h2>
      {description ? (
        <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-6">
          {description}
        </p>
      ) : null}
    </div>
  );
}
