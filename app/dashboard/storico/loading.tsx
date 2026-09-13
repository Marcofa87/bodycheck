import { Skeleton } from "@/components/ui/skeleton";

export default function StoricoLoading() {
  return (
    <>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-3">
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b p-3 last:border-b-0">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="ml-auto h-5 w-16" />
            <Skeleton className="hidden h-5 w-12 md:block" />
            <Skeleton className="hidden h-5 w-12 md:block" />
            <Skeleton className="size-7" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-40" />
      </div>
    </>
  );
}
