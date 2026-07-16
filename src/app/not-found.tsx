import Link from "next/link";
import { Home } from "lucide-react";
import { GoBackButton } from "@/components/common/go-back-button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-muted/50 border border-border">
        <span className="text-3xl font-bold text-muted-foreground/40">404</span>
      </div>
      <div>
                  <h1 className="font-heading text-xl font-bold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover active:scale-[0.97] transition-all"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <GoBackButton />
      </div>
    </div>
  );
}
