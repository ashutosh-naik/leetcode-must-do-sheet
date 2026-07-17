import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("rounded-md shimmer-bg animate-shimmer", className)}
    />
  );
}

export function TableSkeletonDesktop() {
  return (
    <div className="rounded-2xl border border-border overflow-x-auto bg-card shadow-sm animate-in fade-in duration-300" role="status" aria-label="Loading problems">
      <Table>
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="bg-muted/30">
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-24">Difficulty</TableHead>
            <TableHead className="hidden sm:table-cell">Solved</TableHead>
            <TableHead className="w-20 text-right hidden sm:table-cell">Freq</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="text-center py-3">
                <Pulse className="h-4 w-4 mx-auto" />
              </TableCell>
              <TableCell className="py-3 space-y-2">
                <Pulse className="h-4 w-3/4" />
                <Pulse className="h-3 w-1/3" />
              </TableCell>
              <TableCell className="py-3">
                <Pulse className="h-5 w-16" />
              </TableCell>
              <TableCell className="hidden sm:table-cell py-3">
                <Pulse className="h-3 w-20" />
              </TableCell>
              <TableCell className="text-right hidden sm:table-cell py-3">
                <Pulse className="h-4 w-10 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TableSkeletonMobile() {
  return (
    <div className="md:hidden space-y-2" role="status" aria-label="Loading problems">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Pulse className="h-5 w-5 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Pulse className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Pulse className="h-4 w-14" />
                <Pulse className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Pulse className="size-[130px] sm:size-[160px] rounded-full" />
      </div>
      <div className="space-y-3">
        {["Easy", "Medium", "Hard"].map((d) => (
          <div key={d} className="flex items-center gap-3 rounded-xl p-4 bg-muted/30">
            <div className="size-11 rounded-full shimmer-bg animate-shimmer-fast" />
            <div className="flex-1 space-y-1.5">
              <Pulse className="h-4 w-16" />
              <Pulse className="h-1.5 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
