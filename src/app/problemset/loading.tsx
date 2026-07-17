import { Loader2 } from "lucide-react";

export default function ProblemsetLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
