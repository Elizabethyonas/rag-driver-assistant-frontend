export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 text-sm text-muted" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      <span>{label}</span>
    </div>
  );
}

export function FullPageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background">
      <Spinner label={label} />
    </div>
  );
}
