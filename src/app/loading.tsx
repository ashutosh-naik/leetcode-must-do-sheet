export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center animate-in fade-in duration-300" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-primary transition-all" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
