import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressiLoading() {
  return (
    <>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="gap-1 py-4">
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full sm:h-80" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
