import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center" role="status" aria-label="Loading dashboard">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
